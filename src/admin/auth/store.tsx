import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { RemoteTarget } from '@/config/remote';

import { hashPassword, randomHex, temporaryPassword, verifyPassword, type PasswordHash } from './crypto';
import { BUILT_IN_ROLES, OWNER_ROLE_ID, expand, type Permission, type Role } from './rbac';

/**
 * The dashboard's team: accounts, roles, the signed-in session, the security
 * rules, and the log of who did what.
 *
 * All of it is stored on this device. The first person to open the
 * dashboard creates the owner account; after that, only someone signed in
 * with the right permission can add anyone else.
 */

const KEYS = {
  team: 'astronepali.admin.team.v1',
  session: 'astronepali.admin.session.v1',
  audit: 'astronepali.admin.audit.v1',
} as const;

const AUDIT_LIMIT = 1000;

/** Edits to the same field by the same person this close together are one entry. */
const COALESCE_MS = 12_000;

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: 'active' | 'suspended';
  password: PasswordHash;
  mustChangePassword: boolean;
  createdAt: number;
  createdBy: string;
  lastLoginAt: number;
  failedAttempts: number;
  lockedUntil: number;
  color: string;
  note: string;
};

export type SecurityPolicy = {
  /** Signs out after this long without a touch. 0 never does. */
  autoLockMinutes: number;
  /** Wrong passwords in a row before the account locks. */
  maxAttempts: number;
  lockMinutes: number;
  minPasswordLength: number;
  requireNumber: boolean;
  requireSymbol: boolean;
};

export type AuditEntry = {
  id: string;
  at: number;
  userId: string;
  userName: string;
  action: string;
  area: string;
  detail: string;
  /** Groups repeated edits of one field; not shown. */
  key?: string;
};

export type RemoteSettings = RemoteTarget & { lastPushAt: number; lastPullAt: number };

type TeamState = {
  users: AdminUser[];
  roles: Role[];
  policy: SecurityPolicy;
  remote: RemoteSettings;
};

type Session = { userId: string; startedAt: number; lastActiveAt: number };

const DEFAULT_POLICY: SecurityPolicy = {
  autoLockMinutes: 30,
  maxAttempts: 5,
  lockMinutes: 15,
  minPasswordLength: 8,
  requireNumber: true,
  requireSymbol: false,
};

const DEFAULT_REMOTE: RemoteSettings = {
  url: '',
  headerName: 'Authorization',
  token: '',
  method: 'PUT',
  lastPushAt: 0,
  lastPullAt: 0,
};

const USER_COLORS = ['#E0692A', '#5C6B73', '#2E8B57', '#D6336C', '#1C7ED6', '#C9A227', '#0F8A8A', '#8A5A44'];

export type Result = { ok: true } | { ok: false; error: string };

type AdminContextValue = {
  hydrated: boolean;
  /** False until the first owner account exists. */
  hasOwner: boolean;
  users: AdminUser[];
  roles: Role[];
  policy: SecurityPolicy;
  remote: RemoteSettings;
  audit: AuditEntry[];
  me: AdminUser | null;
  myRole: Role | null;
  session: Session | null;
  can: (permission: Permission) => boolean;
  passwordProblem: (password: string) => string | null;

  createOwner: (input: { name: string; email: string; password: string }) => Result;
  signIn: (email: string, password: string) => Result;
  signOut: (reason?: string) => void;
  /** Marks the session active, pushing auto-lock back. */
  touch: () => void;
  changeMyPassword: (current: string, next: string) => Result;
  updateMe: (patch: Partial<Pick<AdminUser, 'name' | 'email' | 'color'>>) => Result;

  addUser: (input: { name: string; email: string; roleId: string; note?: string }) =>
    | { ok: true; temporaryPassword: string }
    | { ok: false; error: string };
  updateUser: (id: string, patch: Partial<Pick<AdminUser, 'name' | 'email' | 'roleId' | 'note' | 'color'>>) => Result;
  setUserStatus: (id: string, status: AdminUser['status']) => Result;
  removeUser: (id: string) => Result;
  resetPassword: (id: string) => { ok: true; temporaryPassword: string } | { ok: false; error: string };
  unlockUser: (id: string) => void;

  saveRole: (role: Role) => Result;
  removeRole: (id: string) => Result;
  setPolicy: (patch: Partial<SecurityPolicy>) => void;
  setRemote: (patch: Partial<RemoteSettings>) => void;

  log: (action: string, area: string, detail: string, key?: string) => void;
  clearAudit: () => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function save(key: string, value: unknown): void {
  AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [team, setTeam] = useState<TeamState>({
    users: [],
    roles: BUILT_IN_ROLES,
    policy: DEFAULT_POLICY,
    remote: DEFAULT_REMOTE,
  });
  const [session, setSession] = useState<Session | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>([]);

  const teamRef = useRef(team);
  teamRef.current = team;
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const auditTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTouch = useRef(0);

  /* ---------------------------------------------------------------- *
   * Storage
   * ---------------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.multiGet([KEYS.team, KEYS.session, KEYS.audit])
      .then(([[, teamRaw], [, sessionRaw], [, auditRaw]]) => {
        if (cancelled) return;
        if (teamRaw) {
          const stored = JSON.parse(teamRaw) as Partial<TeamState>;
          // Built-in roles always come from the code, so a new permission
          // reaches them; custom roles come from storage.
          const custom = (stored.roles ?? []).filter((role) => !role.builtIn);
          setTeam({
            users: stored.users ?? [],
            roles: [...BUILT_IN_ROLES, ...custom],
            policy: { ...DEFAULT_POLICY, ...stored.policy },
            remote: { ...DEFAULT_REMOTE, ...stored.remote },
          });
          const storedSession = sessionRaw ? (JSON.parse(sessionRaw) as Session) : null;
          const policy = { ...DEFAULT_POLICY, ...stored.policy };
          const fresh =
            storedSession &&
            (policy.autoLockMinutes === 0 ||
              Date.now() - storedSession.lastActiveAt < policy.autoLockMinutes * 60_000);
          if (storedSession && fresh) setSession(storedSession);
        }
        if (auditRaw) setAudit(JSON.parse(auditRaw) as AuditEntry[]);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const commitTeam = useCallback((next: TeamState) => {
    teamRef.current = next;
    setTeam(next);
    save(KEYS.team, { ...next, roles: next.roles.filter((role) => !role.builtIn) });
  }, []);

  const commitSession = useCallback((next: Session | null) => {
    sessionRef.current = next;
    setSession(next);
    if (next) save(KEYS.session, next);
    else AsyncStorage.removeItem(KEYS.session).catch(() => {});
  }, []);

  /* ---------------------------------------------------------------- *
   * Audit
   * ---------------------------------------------------------------- */

  const writeAudit = useCallback((entry: Omit<AuditEntry, 'id' | 'at'>) => {
    setAudit((current) => {
      const now = Date.now();
      const [last] = current;
      let next: AuditEntry[];
      if (
        entry.key &&
        last &&
        last.key === entry.key &&
        last.userId === entry.userId &&
        now - last.at < COALESCE_MS
      ) {
        next = [{ ...last, at: now, detail: entry.detail }, ...current.slice(1)];
      } else {
        next = [{ ...entry, id: randomHex(6), at: now }, ...current].slice(0, AUDIT_LIMIT);
      }
      if (auditTimer.current) clearTimeout(auditTimer.current);
      auditTimer.current = setTimeout(() => save(KEYS.audit, next), 600);
      return next;
    });
  }, []);

  const actor = useCallback(() => {
    const current = sessionRef.current;
    const user = current ? teamRef.current.users.find((u) => u.id === current.userId) : undefined;
    return { userId: user?.id ?? 'system', userName: user?.name ?? 'System' };
  }, []);

  const log = useCallback(
    (action: string, area: string, detail: string, key?: string) => {
      writeAudit({ ...actor(), action, area, detail, key });
    },
    [actor, writeAudit],
  );

  const clearAudit = useCallback(() => {
    const entry: AuditEntry = {
      id: randomHex(6),
      at: Date.now(),
      ...actor(),
      action: 'Cleared the activity log',
      area: 'audit',
      detail: '',
    };
    setAudit([entry]);
    save(KEYS.audit, [entry]);
  }, [actor]);

  /* ---------------------------------------------------------------- *
   * Who is signed in, and what they may do
   * ---------------------------------------------------------------- */

  const me = useMemo(
    () => (session ? team.users.find((user) => user.id === session.userId) ?? null : null),
    [session, team.users],
  );
  const myRole = useMemo(
    () => (me ? team.roles.find((role) => role.id === me.roleId) ?? null : null),
    [me, team.roles],
  );
  const granted = useMemo(
    () => (me && me.status === 'active' && myRole ? expand(myRole.permissions) : new Set<Permission>()),
    [me, myRole],
  );
  const can = useCallback((permission: Permission) => granted.has(permission), [granted]);

  // A session whose account was removed or suspended ends at once.
  useEffect(() => {
    if (hydrated && session && (!me || me.status !== 'active')) commitSession(null);
  }, [hydrated, session, me, commitSession]);

  const passwordProblem = useCallback((password: string) => {
    const { policy } = teamRef.current;
    if (password.length < policy.minPasswordLength) {
      return `Use at least ${policy.minPasswordLength} characters.`;
    }
    if (policy.requireNumber && !/\d/.test(password)) return 'Include at least one number.';
    if (policy.requireSymbol && !/[^A-Za-z0-9]/.test(password)) {
      return 'Include at least one symbol, such as ! or #.';
    }
    return null;
  }, []);

  /* ---------------------------------------------------------------- *
   * Signing in and out
   * ---------------------------------------------------------------- */

  const createOwner = useCallback(
    ({ name, email, password }: { name: string; email: string; password: string }): Result => {
      if (teamRef.current.users.length) return { ok: false, error: 'An owner already exists.' };
      if (!name.trim()) return { ok: false, error: 'Enter your name.' };
      if (!validEmail(email)) return { ok: false, error: 'Enter a valid email address.' };
      const problem = passwordProblem(password);
      if (problem) return { ok: false, error: problem };

      const now = Date.now();
      const owner: AdminUser = {
        id: randomHex(8),
        name: name.trim(),
        email: normalizeEmail(email),
        roleId: OWNER_ROLE_ID,
        status: 'active',
        password: hashPassword(password),
        mustChangePassword: false,
        createdAt: now,
        createdBy: 'setup',
        lastLoginAt: now,
        failedAttempts: 0,
        lockedUntil: 0,
        color: USER_COLORS[0],
        note: '',
      };
      commitTeam({ ...teamRef.current, users: [owner] });
      commitSession({ userId: owner.id, startedAt: now, lastActiveAt: now });
      writeAudit({ userId: owner.id, userName: owner.name, action: 'Created the owner account', area: 'team', detail: owner.email });
      return { ok: true };
    },
    [commitSession, commitTeam, passwordProblem, writeAudit],
  );

  const signIn = useCallback(
    (email: string, password: string): Result => {
      const state = teamRef.current;
      const user = state.users.find((u) => u.email === normalizeEmail(email));
      const now = Date.now();
      // The same message for an unknown email and a wrong password, so the
      // form does not confirm which addresses have accounts.
      const wrong: Result = { ok: false, error: 'That email and password do not match an account.' };

      if (!user) {
        writeAudit({ userId: 'unknown', userName: normalizeEmail(email) || 'Unknown', action: 'Failed sign-in', area: 'security', detail: 'No such account' });
        return wrong;
      }
      if (user.status === 'suspended') {
        writeAudit({ userId: user.id, userName: user.name, action: 'Blocked sign-in', area: 'security', detail: 'Account suspended' });
        return { ok: false, error: 'This account is suspended. Ask an owner or administrator to restore it.' };
      }
      if (user.lockedUntil > now) {
        const minutes = Math.ceil((user.lockedUntil - now) / 60_000);
        return { ok: false, error: `Too many wrong passwords. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` };
      }

      if (!verifyPassword(password, user.password)) {
        const attempts = user.failedAttempts + 1;
        const locks = attempts >= state.policy.maxAttempts;
        const updated: AdminUser = {
          ...user,
          failedAttempts: locks ? 0 : attempts,
          lockedUntil: locks ? now + state.policy.lockMinutes * 60_000 : 0,
        };
        commitTeam({ ...state, users: state.users.map((u) => (u.id === user.id ? updated : u)) });
        writeAudit({
          userId: user.id,
          userName: user.name,
          action: locks ? 'Account locked' : 'Failed sign-in',
          area: 'security',
          detail: locks ? `${state.policy.maxAttempts} wrong passwords in a row` : `Attempt ${attempts} of ${state.policy.maxAttempts}`,
        });
        if (locks) {
          return { ok: false, error: `Too many wrong passwords. The account is locked for ${state.policy.lockMinutes} minutes.` };
        }
        return wrong;
      }

      const updated: AdminUser = { ...user, failedAttempts: 0, lockedUntil: 0, lastLoginAt: now };
      commitTeam({ ...state, users: state.users.map((u) => (u.id === user.id ? updated : u)) });
      commitSession({ userId: user.id, startedAt: now, lastActiveAt: now });
      writeAudit({ userId: user.id, userName: user.name, action: 'Signed in', area: 'security', detail: '' });
      return { ok: true };
    },
    [commitSession, commitTeam, writeAudit],
  );

  const signOut = useCallback(
    (reason?: string) => {
      if (!sessionRef.current) return;
      writeAudit({ ...actor(), action: reason ?? 'Signed out', area: 'security', detail: '' });
      commitSession(null);
    },
    [actor, commitSession, writeAudit],
  );

  const touch = useCallback(() => {
    const current = sessionRef.current;
    const now = Date.now();
    if (!current || now - lastTouch.current < 20_000) return;
    lastTouch.current = now;
    commitSession({ ...current, lastActiveAt: now });
  }, [commitSession]);

  // Auto-lock: checked every half minute while the dashboard is open.
  useEffect(() => {
    if (!session || team.policy.autoLockMinutes === 0) return;
    const timer = setInterval(() => {
      const current = sessionRef.current;
      if (!current) return;
      if (Date.now() - current.lastActiveAt > teamRef.current.policy.autoLockMinutes * 60_000) {
        signOut('Locked after inactivity');
      }
    }, 30_000);
    return () => clearInterval(timer);
  }, [session, team.policy.autoLockMinutes, signOut]);

  /* ---------------------------------------------------------------- *
   * My account
   * ---------------------------------------------------------------- */

  const replaceUser = useCallback(
    (updated: AdminUser) => {
      const state = teamRef.current;
      commitTeam({ ...state, users: state.users.map((u) => (u.id === updated.id ? updated : u)) });
    },
    [commitTeam],
  );

  const changeMyPassword = useCallback(
    (current: string, next: string): Result => {
      const user = teamRef.current.users.find((u) => u.id === sessionRef.current?.userId);
      if (!user) return { ok: false, error: 'You are not signed in.' };
      if (!verifyPassword(current, user.password)) return { ok: false, error: 'Your current password is not right.' };
      const problem = passwordProblem(next);
      if (problem) return { ok: false, error: problem };
      if (current === next) return { ok: false, error: 'Choose a password you have not used here.' };
      replaceUser({ ...user, password: hashPassword(next), mustChangePassword: false });
      log('Changed their password', 'security', '');
      return { ok: true };
    },
    [log, passwordProblem, replaceUser],
  );

  const updateMe = useCallback(
    (patch: Partial<Pick<AdminUser, 'name' | 'email' | 'color'>>): Result => {
      const state = teamRef.current;
      const user = state.users.find((u) => u.id === sessionRef.current?.userId);
      if (!user) return { ok: false, error: 'You are not signed in.' };
      if (patch.email !== undefined) {
        if (!validEmail(patch.email)) return { ok: false, error: 'Enter a valid email address.' };
        const email = normalizeEmail(patch.email);
        if (state.users.some((u) => u.email === email && u.id !== user.id)) {
          return { ok: false, error: 'Another account already uses that email.' };
        }
        patch = { ...patch, email };
      }
      if (patch.name !== undefined && !patch.name.trim()) return { ok: false, error: 'Enter your name.' };
      replaceUser({ ...user, ...patch });
      log('Updated their profile', 'team', Object.keys(patch).join(', '), `me-${user.id}`);
      return { ok: true };
    },
    [log, replaceUser],
  );

  /* ---------------------------------------------------------------- *
   * The team
   * ---------------------------------------------------------------- */

  const activeOwners = (users: AdminUser[]) =>
    users.filter((u) => u.roleId === OWNER_ROLE_ID && u.status === 'active');

  const guard = useCallback(
    (targetId: string, action: string): string | null => {
      const state = teamRef.current;
      const actorUser = state.users.find((u) => u.id === sessionRef.current?.userId);
      const actorRole = state.roles.find((r) => r.id === actorUser?.roleId);
      if (!actorUser || !actorRole || !expand(actorRole.permissions).has('team.manage')) {
        return 'You do not have permission to manage the team.';
      }
      const target = state.users.find((u) => u.id === targetId);
      if (!target) return 'That account no longer exists.';
      if (target.roleId === OWNER_ROLE_ID && actorUser.roleId !== OWNER_ROLE_ID) {
        return `Only an owner can ${action} an owner.`;
      }
      return null;
    },
    [],
  );

  const addUser = useCallback(
    (input: { name: string; email: string; roleId: string; note?: string }) => {
      const state = teamRef.current;
      const actorUser = state.users.find((u) => u.id === sessionRef.current?.userId);
      const actorRole = state.roles.find((r) => r.id === actorUser?.roleId);
      if (!actorUser || !actorRole || !expand(actorRole.permissions).has('team.manage')) {
        return { ok: false as const, error: 'You do not have permission to add people.' };
      }
      if (!input.name.trim()) return { ok: false as const, error: 'Enter their name.' };
      if (!validEmail(input.email)) return { ok: false as const, error: 'Enter a valid email address.' };
      const email = normalizeEmail(input.email);
      if (state.users.some((u) => u.email === email)) {
        return { ok: false as const, error: 'Someone on the team already uses that email.' };
      }
      if (!state.roles.some((r) => r.id === input.roleId)) return { ok: false as const, error: 'Choose a role.' };
      if (input.roleId === OWNER_ROLE_ID && actorUser.roleId !== OWNER_ROLE_ID) {
        return { ok: false as const, error: 'Only an owner can add another owner.' };
      }

      const temp = temporaryPassword();
      const user: AdminUser = {
        id: randomHex(8),
        name: input.name.trim(),
        email,
        roleId: input.roleId,
        status: 'active',
        password: hashPassword(temp),
        mustChangePassword: true,
        createdAt: Date.now(),
        createdBy: actorUser.name,
        lastLoginAt: 0,
        failedAttempts: 0,
        lockedUntil: 0,
        color: USER_COLORS[state.users.length % USER_COLORS.length],
        note: input.note ?? '',
      };
      commitTeam({ ...state, users: [...state.users, user] });
      const role = state.roles.find((r) => r.id === input.roleId);
      log('Added a team member', 'team', `${user.name} as ${role?.name ?? input.roleId}`);
      return { ok: true as const, temporaryPassword: temp };
    },
    [commitTeam, log],
  );

  const updateUser = useCallback(
    (id: string, patch: Partial<Pick<AdminUser, 'name' | 'email' | 'roleId' | 'note' | 'color'>>): Result => {
      const problem = guard(id, 'change');
      if (problem) return { ok: false, error: problem };
      const state = teamRef.current;
      const target = state.users.find((u) => u.id === id)!;
      const actorId = sessionRef.current?.userId;

      if (patch.roleId !== undefined && patch.roleId !== target.roleId) {
        if (id === actorId) return { ok: false, error: 'You cannot change your own role.' };
        const actorUser = state.users.find((u) => u.id === actorId);
        if (patch.roleId === OWNER_ROLE_ID && actorUser?.roleId !== OWNER_ROLE_ID) {
          return { ok: false, error: 'Only an owner can make someone an owner.' };
        }
        if (target.roleId === OWNER_ROLE_ID && activeOwners(state.users).length <= 1) {
          return { ok: false, error: 'This is the only owner. Make someone else an owner first.' };
        }
      }
      if (patch.email !== undefined) {
        if (!validEmail(patch.email)) return { ok: false, error: 'Enter a valid email address.' };
        const email = normalizeEmail(patch.email);
        if (state.users.some((u) => u.email === email && u.id !== id)) {
          return { ok: false, error: 'Someone on the team already uses that email.' };
        }
        patch = { ...patch, email };
      }
      if (patch.name !== undefined && !patch.name.trim()) return { ok: false, error: 'Enter their name.' };

      replaceUser({ ...target, ...patch });
      const roleName = patch.roleId ? state.roles.find((r) => r.id === patch.roleId)?.name : null;
      log(
        roleName ? 'Changed a role' : 'Updated a team member',
        'team',
        roleName ? `${target.name} is now ${roleName}` : `${target.name}: ${Object.keys(patch).join(', ')}`,
        `user-${id}`,
      );
      return { ok: true };
    },
    [guard, log, replaceUser],
  );

  const setUserStatus = useCallback(
    (id: string, status: AdminUser['status']): Result => {
      const problem = guard(id, status === 'suspended' ? 'suspend' : 'restore');
      if (problem) return { ok: false, error: problem };
      const state = teamRef.current;
      const target = state.users.find((u) => u.id === id)!;
      if (id === sessionRef.current?.userId) return { ok: false, error: 'You cannot suspend yourself.' };
      if (status === 'suspended' && target.roleId === OWNER_ROLE_ID && activeOwners(state.users).length <= 1) {
        return { ok: false, error: 'This is the only owner, so it cannot be suspended.' };
      }
      replaceUser({ ...target, status });
      log(status === 'suspended' ? 'Suspended an account' : 'Restored an account', 'team', target.name);
      return { ok: true };
    },
    [guard, log, replaceUser],
  );

  const removeUser = useCallback(
    (id: string): Result => {
      const problem = guard(id, 'remove');
      if (problem) return { ok: false, error: problem };
      const state = teamRef.current;
      const target = state.users.find((u) => u.id === id)!;
      if (id === sessionRef.current?.userId) return { ok: false, error: 'You cannot remove your own account.' };
      if (target.roleId === OWNER_ROLE_ID && activeOwners(state.users).length <= 1) {
        return { ok: false, error: 'This is the only owner, so it cannot be removed.' };
      }
      commitTeam({ ...state, users: state.users.filter((u) => u.id !== id) });
      log('Removed a team member', 'team', target.name);
      return { ok: true };
    },
    [commitTeam, guard, log],
  );

  const resetPassword = useCallback(
    (id: string) => {
      const problem = guard(id, 'reset the password of');
      if (problem) return { ok: false as const, error: problem };
      const target = teamRef.current.users.find((u) => u.id === id)!;
      const temp = temporaryPassword();
      replaceUser({
        ...target,
        password: hashPassword(temp),
        mustChangePassword: true,
        failedAttempts: 0,
        lockedUntil: 0,
      });
      log('Reset a password', 'security', target.name);
      return { ok: true as const, temporaryPassword: temp };
    },
    [guard, log, replaceUser],
  );

  const unlockUser = useCallback(
    (id: string) => {
      if (guard(id, 'unlock')) return;
      const target = teamRef.current.users.find((u) => u.id === id);
      if (!target) return;
      replaceUser({ ...target, failedAttempts: 0, lockedUntil: 0 });
      log('Unlocked an account', 'security', target.name);
    },
    [guard, log, replaceUser],
  );

  /* ---------------------------------------------------------------- *
   * Roles and rules
   * ---------------------------------------------------------------- */

  const saveRole = useCallback(
    (role: Role): Result => {
      const state = teamRef.current;
      if (role.builtIn) return { ok: false, error: 'Built-in roles cannot be changed. Duplicate one instead.' };
      if (!role.name.trim()) return { ok: false, error: 'Give the role a name.' };
      if (
        state.roles.some(
          (r) => r.id !== role.id && r.name.trim().toLowerCase() === role.name.trim().toLowerCase(),
        )
      ) {
        return { ok: false, error: 'Another role already has that name.' };
      }
      const exists = state.roles.some((r) => r.id === role.id);
      const roles = exists ? state.roles.map((r) => (r.id === role.id ? role : r)) : [...state.roles, role];
      commitTeam({ ...state, roles });
      log(exists ? 'Changed a role' : 'Created a role', 'roles', `${role.name}: ${role.permissions.length} permissions`, `role-${role.id}`);
      return { ok: true };
    },
    [commitTeam, log],
  );

  const removeRole = useCallback(
    (id: string): Result => {
      const state = teamRef.current;
      const role = state.roles.find((r) => r.id === id);
      if (!role) return { ok: false, error: 'That role no longer exists.' };
      if (role.builtIn) return { ok: false, error: 'Built-in roles cannot be deleted.' };
      const holders = state.users.filter((u) => u.roleId === id);
      // Anyone holding the role keeps an account, with nothing but read access.
      commitTeam({
        ...state,
        roles: state.roles.filter((r) => r.id !== id),
        users: state.users.map((u) => (u.roleId === id ? { ...u, roleId: 'viewer' } : u)),
      });
      log('Deleted a role', 'roles', holders.length ? `${role.name} — ${holders.length} moved to Viewer` : role.name);
      return { ok: true };
    },
    [commitTeam, log],
  );

  const setPolicy = useCallback(
    (patch: Partial<SecurityPolicy>) => {
      const state = teamRef.current;
      commitTeam({ ...state, policy: { ...state.policy, ...patch } });
      log('Changed security rules', 'security', Object.entries(patch).map(([k, v]) => `${k}: ${v}`).join(', '), 'policy');
    },
    [commitTeam, log],
  );

  const setRemote = useCallback(
    (patch: Partial<RemoteSettings>) => {
      const state = teamRef.current;
      commitTeam({ ...state, remote: { ...state.remote, ...patch } });
    },
    [commitTeam],
  );

  const value = useMemo<AdminContextValue>(
    () => ({
      hydrated,
      hasOwner: team.users.length > 0,
      users: team.users,
      roles: team.roles,
      policy: team.policy,
      remote: team.remote,
      audit,
      me,
      myRole,
      session,
      can,
      passwordProblem,
      createOwner,
      signIn,
      signOut,
      touch,
      changeMyPassword,
      updateMe,
      addUser,
      updateUser,
      setUserStatus,
      removeUser,
      resetPassword,
      unlockUser,
      saveRole,
      removeRole,
      setPolicy,
      setRemote,
      log,
      clearAudit,
    }),
    [
      hydrated, team, audit, me, myRole, session, can, passwordProblem, createOwner, signIn,
      signOut, touch, changeMyPassword, updateMe, addUser, updateUser, setUserStatus, removeUser,
      resetPassword, unlockUser, saveRole, removeRole, setPolicy, setRemote, log, clearAudit,
    ],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside <AdminProvider>');
  return ctx;
}
