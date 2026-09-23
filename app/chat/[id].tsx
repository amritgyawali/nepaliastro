import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Avatar, Screen, Tappable, VerifiedBadge } from '@/components';
import { ScreenUnavailable } from '@/components/ScreenUnavailable';
import { formatMoney } from '@/config/format';
import { useShownConfig } from '@/config/store';
import { findAstrologer, ongoingSession } from '@/data/astrologers';
import { astroReplies, babaPrompts, quickPrompts } from '@/data/content';
import { ChevronLeft, DoubleCheck, Send } from '@/icons';
import {
  AI_ASTROLOGER_ID,
  askBaba,
  chartReady,
  greetingFor,
  type BabaTurn,
} from '@/lib/baba';
import { AI_MODEL, AiError, BUILD_TIME_KEY, canUseAi } from '@/lib/groq';
import { useOnboarding } from '@/store/onboarding';
import { usePredictions } from '@/store/predictions';
import { GUTTER, colors, radius, space, type } from '@/theme';

type Message = {
  id: string;
  from: 'them' | 'me';
  text: string;
  /** Extra highlighted callout beneath the body. */
  insight?: string;
  time: string;
  /** Set when this bubble is an apology rather than a reading. */
  failed?: boolean;
};

/** The conversation as the AI is given it back on every question. */
function asTurns(messages: Message[]): BabaTurn[] {
  return messages
    .filter((message) => !message.failed)
    .map((message) => ({
      role: message.from === 'me' ? ('user' as const) : ('assistant' as const),
      content: message.text,
    }));
}

function clockLabel(date = new Date()): string {
  const hours = date.getHours();
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
}

/** Length of the claimed free consultation, in seconds. */
const FREE_SECONDS = 60;

function formatElapsed(totalSeconds: number): string {
  const minutes = `${Math.floor(totalSeconds / 60)}`.padStart(2, '0');
  const seconds = `${totalSeconds % 60}`.padStart(2, '0');
  return `${minutes}:${seconds}`;
}

/** The live consultation: the astrologer, the clock, and the messages. */
export default function ChatScreen() {
  const router = useRouter();
  const { id, free } = useLocalSearchParams<{ id: string; free?: string }>();
  /** This consultation is with the AI, not with a person. */
  const isAi = id === AI_ASTROLOGER_ID;
  /** Set by the onboarding "1 minute free chat" offer. Baba is free anyway. */
  const freeSession = free === '1' && !isAi;
  const { profile, update } = useOnboarding();
  const { settings } = usePredictions();

  /** The same key the five-hourly readings are written with. */
  const apiKey = settings.apiKey.trim() || BUILD_TIME_KEY;
  const aiConfigured = canUseAi(apiKey);
  const haveChart = chartReady(profile);
  const aiCard = useShownConfig().astrologers.ai;

  /** What this astrologer charges a minute, as the dashboard set it. */
  const perMinute = useMemo(() => {
    const found = findAstrologer(id ?? '');
    return found ? found.discountedRate ?? found.rate : 0.49;
  }, [id]);

  const astrologer = useMemo(() => {
    if (id === ongoingSession.id) {
      return {
        id: ongoingSession.id,
        name: ongoingSession.name,
        photo: ongoingSession.portrait,
        verified: true,
      };
    }
    const found = findAstrologer(id ?? '');
    return {
      id: found?.id ?? 'astrologer',
      name: found?.name ?? 'Astrologer',
      photo: found?.photo ?? ongoingSession.portrait,
      verified: found?.verified ?? true,
    };
  }, [id]);

  const firstName = profile.name.trim().split(/\s+/)[0] || 'friend';
  const knownPlace = profile.birthPlace.trim().length > 0;
  const place = profile.birthPlace.trim() || 'your birth place';

  /** Frozen at mount so the header pill and first bubble agree. */
  const startedAt = useMemo(() => clockLabel(), []);

  const [messages, setMessages] = useState<Message[]>(() => {
    if (isAi) {
      return [
        {
          id: 'intro',
          from: 'them',
          text: greetingFor(profile),
          insight: aiConfigured
            ? undefined
            : 'Baba is not connected yet. Add a free Groq key in Profile → Prediction alerts and he can read your chart.',
          time: startedAt,
        },
      ];
    }

    return [
      {
        id: 'intro',
        from: 'them',
        text: freeSession
          ? `Namaste ${firstName}! 🙏 Your free minute has started — I have opened your Kundli${knownPlace ? ` from ${place}` : ''} and I am reading it right now.\n\nAsk me anything about your career, studies or relationships.`
          : `Namaste ${firstName}! 🙏 I have opened your Kundli and I am analyzing your birth chart from ${place}.\n\nHow can I guide you today regarding your career, higher studies, or relationships?`,
        insight: freeSession
          ? 'Your free minute is running. You are not charged until it ends.'
          : undefined,
        time: freeSession ? startedAt : '8:56 PM',
      },
    ];
  });
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  /** True while Baba's answer is in flight, so a second question has to wait. */
  const [asking, setAsking] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [elapsed, setElapsed] = useState(freeSession ? 0 : 116);
  /** Seconds left of the free minute; only meaningful while `paid` is false. */
  const [freeLeft, setFreeLeft] = useState(FREE_SECONDS);
  const [freeOver, setFreeOver] = useState(false);
  /** The free minute is over and the user chose to keep talking. */
  const [paid, setPaid] = useState(!freeSession);

  const scrollRef = useRef<ScrollView>(null);
  const replyTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  /**
   * The conversation and the chart, readable from inside the async request
   * without making `send` depend on either — a question sent mid-answer would
   * otherwise be written against the history as it was two renders ago.
   */
  const latest = useRef({ messages, profile, apiKey });
  latest.current = { messages, profile, apiKey };

  // Paid time only ticks up once the free minute is spent (or was never on).
  // Baba is free, so nothing is counted for him at all.
  useEffect(() => {
    if (!paid || isAi) return;
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [paid, isAi]);

  // The claimed free minute counts down, then pauses the session.
  useEffect(() => {
    if (paid || freeOver) return;
    if (freeLeft <= 0) {
      setFreeOver(true);
      update({ freeMinuteUsed: true });
      return;
    }
    const timer = setTimeout(() => setFreeLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [paid, freeOver, freeLeft, update]);

  // Cancel any in-flight reply timers when the screen goes away.
  useEffect(
    () => () => {
      replyTimers.current.forEach(clearTimeout);
      replyTimers.current = [];
    },
    [],
  );

  /**
   * One question to Baba.
   *
   * The whole conversation goes back with it, so he answers in context, and
   * the chart is rebuilt inside `askBaba` from the profile as it stands now.
   * A failure is answered in the bubble rather than swallowed: the person
   * asked something and deserves to be told why nothing came back.
   */
  const askAi = useCallback(async (text: string) => {
    const mine: Message = { id: `me-${Date.now()}`, from: 'me', text, time: clockLabel() };
    const history = asTurns([...latest.current.messages, mine]);

    setMessages((current) => [...current, mine]);
    setDraft('');
    setAsking(true);
    setTyping(true);

    try {
      const reply = await askBaba(latest.current.apiKey, latest.current.profile, history);
      setMessages((current) => [
        ...current,
        { id: `them-${Date.now()}`, from: 'them', text: reply, time: clockLabel() },
      ]);
    } catch (error) {
      const reason =
        error instanceof AiError ? error.message : 'Baba could not be reached just now.';
      setMessages((current) => [
        ...current,
        {
          id: `them-${Date.now()}`,
          from: 'them',
          text: 'I could not read your chart just then. Ask me again in a moment.',
          insight: reason,
          time: clockLabel(),
          failed: true,
        },
      ]);
    } finally {
      setTyping(false);
      setAsking(false);
    }
  }, []);

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text) return;

      if (isAi) {
        if (asking) return;
        void askAi(text);
        return;
      }

      setMessages((current) => [
        ...current,
        { id: `me-${Date.now()}`, from: 'me', text, time: clockLabel() },
      ]);
      setDraft('');

      replyTimers.current.push(setTimeout(() => setTyping(true), 450));
      replyTimers.current.push(
        setTimeout(() => {
          setTyping(false);
          const reply = astroReplies[Math.floor(Math.random() * astroReplies.length)];
          setMessages((current) => [
            ...current,
            { id: `them-${Date.now()}`, from: 'them', text: reply, time: clockLabel() },
          ]);
        }, 1800),
      );
    },
    [isAi, asking, askAi],
  );

  const leaveChat = useCallback(() => {
    if (freeSession) router.replace('/(tabs)');
    else if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/chat');
  }, [freeSession, router]);

  const endSession = () => {
    setConfirmEnd(false);
    setFreeOver(false);
    leaveChat();
  };

  /** Free minute spent, user wants to carry on at the normal rate. */
  const continuePaid = () => {
    setFreeOver(false);
    setPaid(true);
  };

  // AI Baba switched off in the dashboard: an old link to his chat says so.
  if (isAi && !aiCard.enabled) {
    return (
      <Screen background={colors.white}>
        <ScreenUnavailable title={`${aiCard.name} is not available`} message="" />
      </Screen>
    );
  }

  return (
    <Screen background={colors.white} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Tappable
            feel="icon"
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            onPress={leaveChat}
            style={styles.backButton}
            pressedStyle={styles.pressed}
          >
            <ChevronLeft size={24} color={colors.ink} strokeWidth={2} />
          </Tappable>

          <Tappable
            feel="card"
            accessibilityRole="button"
            accessibilityLabel={`About ${astrologer.name}`}
            onPress={() => router.push(`/astrologer/${astrologer.id}`)}
            style={styles.who}
            pressedStyle={styles.pressed}
          >
            <Avatar uri={astrologer.photo} name={astrologer.name} size={44} />

            <View>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{astrologer.name}</Text>
                {astrologer.verified ? <VerifiedBadge size={16} /> : null}
              </View>
              {isAi ? (
                <View style={styles.freeTimerRow}>
                  <Text style={styles.freeTimerChip}>Free</Text>
                  <Text style={styles.freeTimer}>Always online</Text>
                </View>
              ) : paid ? (
                <Text style={styles.timer}>{formatElapsed(elapsed)}</Text>
              ) : (
                <View style={styles.freeTimerRow}>
                  <Text style={styles.freeTimerChip}>Free</Text>
                  <Text style={styles.freeTimer}>{formatElapsed(freeLeft)} left</Text>
                </View>
              )}
            </View>
          </Tappable>
        </View>

        <Tappable
          accessibilityRole="button"
          accessibilityLabel="End consultation"
          onPress={() => setConfirmEnd(true)}
          hitSlop={8}
          pressedStyle={styles.pressed}
        >
          <Text style={styles.endLabel}>End</Text>
        </Tappable>
      </View>

      {/* Session info strip */}
      <View style={styles.infoStrip}>
        <View style={styles.infoLeft}>
          <View style={styles.liveDot} />
          <Text style={styles.infoText} numberOfLines={1}>
            {isAi && !haveChart
              ? 'No birth date yet — add one in your profile'
              : `${isAi ? 'Reading your kundli' : 'Chart shared'}: ${
                  profile.name.trim() || 'your profile'
                }${profile.birthPlace.trim() ? ` (${profile.birthPlace.trim()})` : ''}`}
          </Text>
        </View>
        <Text style={[styles.infoRate, (isAi || !paid) && styles.infoRateFree]}>
          {isAi ? 'Free, unlimited' : paid ? formatMoney(perMinute, undefined, { perMinute: true }) : 'First minute free'}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={styles.flex}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          <View style={styles.datePillRow}>
            <Text style={styles.datePill}>
              Today · {freeSession || isAi ? startedAt : '8:56 PM'}
            </Text>
          </View>

          {messages.map((message) =>
            message.from === 'them' ? (
              <View key={message.id} style={styles.inRow}>
                <Avatar uri={astrologer.photo} name={astrologer.name} size={28} />
                <View style={styles.inBubble}>
                  <Text style={styles.inText}>{message.text}</Text>
                  {message.insight ? (
                    <View style={[styles.insight, message.failed && styles.insightWarn]}>
                      <Text
                        style={[styles.insightText, message.failed && styles.insightWarnText]}
                      >
                        {message.insight}
                      </Text>
                    </View>
                  ) : null}
                  <Text style={styles.inTime}>{message.time}</Text>
                </View>
              </View>
            ) : (
              <View key={message.id} style={styles.outRow}>
                <View style={styles.outBubble}>
                  <Text style={styles.outText}>{message.text}</Text>
                </View>
                <View style={styles.outMeta}>
                  <Text style={styles.outTime}>{message.time}</Text>
                  <DoubleCheck size={14} />
                </View>
              </View>
            ),
          )}

          {isAi ? (
            <Text style={styles.aiFooter}>
              Baba is an AI ({AI_MODEL}, free through Groq) reading the kundli this app
              computed from your birth details. He is guidance, not a professional opinion.
            </Text>
          ) : null}

          {typing ? (
            <View style={styles.typingRow}>
              <View style={styles.typingBubble}>
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
                <View style={styles.typingDot} />
                <Text style={styles.typingLabel}>{astrologer.name} is typing...</Text>
              </View>
            </View>
          ) : null}
        </ScrollView>

        {/* Quick prompts */}
        <View style={styles.promptsWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.prompts}
          >
            {(isAi ? babaPrompts : quickPrompts).map((prompt) => (
              <Tappable
                key={prompt}
                accessibilityRole="button"
                disabled={asking}
                onPress={() => send(prompt)}
                style={[styles.prompt, asking && styles.promptDisabled]}
                hoveredStyle={styles.promptPressed}
                pressedStyle={styles.promptPressed}
              >
                <Text style={styles.promptLabel}>{prompt}</Text>
              </Tappable>
            ))}
          </ScrollView>
        </View>

        {/* Composer */}
        <View style={styles.composer}>
          <View style={styles.inputWrap}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={asking ? 'Baba is reading your chart…' : 'Type your message...'}
              placeholderTextColor={colors.subtle}
              style={styles.input}
              returnKeyType="send"
              onSubmitEditing={() => send(draft)}
              accessibilityLabel="Message"
            />
          </View>

          <Tappable
            feel="icon"
            accessibilityRole="button"
            accessibilityLabel="Send message"
            disabled={asking}
            onPress={() => send(draft)}
            style={[styles.sendButton, asking && styles.sendButtonBusy]}
            pressedStyle={styles.pressed}
          >
            <Send size={18} color={colors.onSaffron} />
          </Tappable>
        </View>
      </KeyboardAvoidingView>

      {/* Free minute finished */}
      <Modal
        visible={freeOver}
        transparent
        animationType="fade"
        onRequestClose={endSession}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Your free minute is over</Text>
            <Text style={styles.modalBody}>
              Keep talking to {astrologer.name} at {formatMoney(perMinute)} a minute, or end here —
              what you have discussed is already saved.
            </Text>
            <View style={styles.modalActions}>
              <Tappable
                accessibilityRole="button"
                onPress={endSession}
                style={styles.modalCancel}
                pressedStyle={styles.pressed}
              >
                <Text style={styles.modalCancelLabel}>End chat</Text>
              </Tappable>
              <Tappable
                accessibilityRole="button"
                onPress={continuePaid}
                style={styles.modalContinue}
                pressedStyle={styles.pressed}
              >
                <Text style={styles.modalContinueLabel}>Keep talking</Text>
              </Tappable>
            </View>
          </View>
        </View>
      </Modal>

      {/* End-consultation confirmation */}
      <Modal
        visible={confirmEnd}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmEnd(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setConfirmEnd(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>End this consultation?</Text>
            <Text style={styles.modalBody}>
              Your chat with {astrologer.name} will be closed and saved to your
              history.
            </Text>
            <View style={styles.modalActions}>
              <Tappable
                accessibilityRole="button"
                onPress={() => setConfirmEnd(false)}
                style={styles.modalCancel}
                pressedStyle={styles.pressed}
              >
                <Text style={styles.modalCancelLabel}>Keep talking</Text>
              </Tappable>
              <Tappable
                accessibilityRole="button"
                onPress={endSession}
                style={styles.modalConfirm}
                pressedStyle={styles.pressed}
              >
                <Text style={styles.modalConfirmLabel}>End now</Text>
              </Tappable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    flexShrink: 1,
  },
  who: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    flexShrink: 1,
  },
  backButton: {
    width: 32,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.5,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs + 2,
  },
  name: {
    ...type.section,
    color: colors.ink,
  },
  timer: {
    ...type.caption,
    color: colors.muted,
    fontVariant: ['tabular-nums'],
  },
  freeTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  freeTimerChip: {
    ...type.caption,
    color: colors.green,
    backgroundColor: colors.greenSoft,
    paddingHorizontal: space.sm,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  freeTimer: {
    ...type.caption,
    color: colors.green,
    fontVariant: ['tabular-nums'],
  },
  endLabel: {
    ...type.label,
    color: colors.red,
  },

  infoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    backgroundColor: colors.saffronSoft,
    borderBottomWidth: 1,
    borderBottomColor: colors.saffronBorder,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    flexShrink: 1,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  infoText: {
    ...type.caption,
    color: colors.saffronDeep,
    flexShrink: 1,
  },
  infoRate: {
    ...type.caption,
    color: colors.saffronDeep,
  },
  infoRateFree: {
    color: colors.green,
  },

  messages: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  messagesContent: {
    paddingHorizontal: GUTTER - 4,
    paddingVertical: space.lg,
    gap: space.md,
  },
  datePillRow: {
    alignItems: 'center',
  },
  datePill: {
    ...type.caption,
    color: colors.muted,
  },

  inRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space.sm,
    maxWidth: '90%',
  },
  inBubble: {
    flexShrink: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderBottomLeftRadius: radius.sm / 2,
    padding: space.md,
  },
  inText: {
    ...type.body,
    color: colors.ink,
  },
  insight: {
    marginTop: space.sm,
    padding: space.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.saffronSoft,
  },
  insightText: {
    ...type.small,
    color: colors.saffronDeep,
  },
  insightWarn: {
    backgroundColor: colors.redSoft,
  },
  insightWarnText: {
    color: colors.red,
  },
  aiFooter: {
    ...type.caption,
    color: colors.subtle,
    textAlign: 'center',
    paddingHorizontal: space.md,
    paddingTop: space.xs,
  },
  inTime: {
    ...type.caption,
    color: colors.subtle,
    textAlign: 'right',
    marginTop: space.xs,
  },

  outRow: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    maxWidth: '85%',
    gap: space.xs,
  },
  outBubble: {
    backgroundColor: colors.saffronSoft,
    borderWidth: 1,
    borderColor: colors.saffronBorder,
    borderRadius: radius.lg,
    borderBottomRightRadius: radius.sm / 2,
    padding: space.md,
  },
  outText: {
    ...type.body,
    color: colors.ink,
  },
  outMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  outTime: {
    ...type.caption,
    color: colors.subtle,
  },

  typingRow: {
    paddingLeft: space.xl + space.sm,
  },
  typingBubble: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs + 1,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.saffron,
  },
  typingLabel: {
    ...type.caption,
    color: colors.muted,
    marginLeft: space.xs,
  },

  promptsWrap: {
    backgroundColor: colors.canvas,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  prompts: {
    paddingHorizontal: GUTTER - 4,
    paddingVertical: space.sm,
    gap: space.sm,
  },
  prompt: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  promptPressed: {
    backgroundColor: colors.saffronSoft,
    borderColor: colors.saffron,
  },
  promptDisabled: {
    opacity: 0.4,
  },
  promptLabel: {
    ...type.caption,
    color: colors.body,
  },

  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.md,
    paddingTop: space.md,
    paddingBottom: Platform.OS === 'ios' ? space.xl : space.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  inputWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.fill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: space.lg,
    ...type.body,
    color: colors.ink,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.saffron,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonBusy: {
    opacity: 0.4,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.xl,
  },
  modalTitle: {
    ...type.title,
    color: colors.ink,
  },
  modalBody: {
    ...type.body,
    color: colors.muted,
    marginTop: space.sm,
    marginBottom: space.xl,
  },
  modalActions: {
    flexDirection: 'row',
    gap: space.sm,
    alignSelf: 'stretch',
  },
  modalCancel: {
    flex: 1,
    paddingVertical: space.md + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalCancelLabel: {
    ...type.label,
    color: colors.body,
  },
  modalContinue: {
    flex: 1,
    paddingVertical: space.md + 2,
    borderRadius: radius.md,
    backgroundColor: colors.saffron,
    alignItems: 'center',
  },
  modalContinueLabel: {
    ...type.label,
    color: colors.onSaffron,
  },
  modalConfirm: {
    flex: 1,
    paddingVertical: space.md + 2,
    borderRadius: radius.md,
    backgroundColor: colors.red,
    alignItems: 'center',
  },
  modalConfirmLabel: {
    ...type.label,
    color: colors.white,
  },
});
