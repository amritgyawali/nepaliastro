/**
 * Lets the admin dashboard restyle the whole app while it is running.
 *
 * Every screen builds its styles once, at import, with
 * `StyleSheet.create({ ... colors.saffron ... })`. That freezes whatever the
 * theme said at that moment, so a colour picked in the dashboard would never
 * reach a screen that was already loaded. This plugin rewrites each of those
 * calls into
 *
 *     require('<src>/theme/runtime').themedStyles(() => ({ ... }))
 *
 * which builds the same stylesheet, but builds it again whenever the theme
 * version moves on. The screen's source is untouched — it still reads as a
 * plain `StyleSheet.create` — and a file added tomorrow gets the same
 * treatment without anyone remembering to opt in.
 *
 * It also turns reads of the four layout constants (`GUTTER`,
 * `SCREEN_MAX_WIDTH`, `TAB_BAR_HEIGHT`, `TOUCH_SIZE`) into reads of the live
 * `liveLayout` object. Metro copies an imported number into the importing
 * module, so without this a changed gutter would never arrive either.
 *
 * Only the app's own screens and components are rewritten. `node_modules`,
 * the theme itself, and the admin dashboard (which keeps its own fixed look
 * so it stays usable whatever the app is set to) are left alone.
 *
 * Metro caches transformed files: after changing this plugin, restart with
 * `npx expo start -c`.
 */
const path = require('path');

const LIVE_LAYOUT = new Set(['GUTTER', 'SCREEN_MAX_WIDTH', 'TAB_BAR_HEIGHT', 'TOUCH_SIZE']);

/** Import sources that resolve to the theme or its layout module. */
function isThemeImport(source) {
  if (source === '@/theme' || source === '@/theme/layout') return true;
  return source.startsWith('.') && /(^|\/)theme(\/index|\/layout)?$/.test(source);
}

/** Should this file be rewritten at all? */
function inScope(filename, root) {
  if (!filename) return false;
  const rel = path.relative(root, filename).replace(/\\/g, '/');
  if (rel.startsWith('..') || rel.includes('node_modules/')) return false;
  if (!rel.startsWith('app/') && !rel.startsWith('src/')) return false;
  if (rel.startsWith('src/theme/')) return false;
  if (rel.startsWith('src/admin/') || rel.startsWith('app/admin/')) return false;
  return true;
}

module.exports = function themedStylesPlugin({ types: t }) {
  return {
    name: 'astronepali-themed-styles',
    visitor: {
      Program(programPath, state) {
        const root = state.cwd || process.cwd();
        const filename = state.filename;
        if (!inScope(filename, root)) return;

        let runtime = path
          .relative(path.dirname(filename), path.join(root, 'src', 'theme', 'runtime'))
          .replace(/\\/g, '/');
        if (!runtime.startsWith('.')) runtime = `./${runtime}`;

        const runtimeRequire = () =>
          t.callExpression(t.identifier('require'), [t.stringLiteral(runtime)]);

        programPath.traverse({
          CallExpression(callPath) {
            const callee = callPath.node.callee;
            if (
              !t.isMemberExpression(callee) ||
              callee.computed ||
              !t.isIdentifier(callee.object, { name: 'StyleSheet' }) ||
              !t.isIdentifier(callee.property, { name: 'create' }) ||
              callPath.node.arguments.length !== 1
            ) {
              return;
            }

            const binding = callPath.scope.getBinding('StyleSheet');
            const declaration = binding && binding.path.parentPath;
            if (
              !binding ||
              binding.kind !== 'module' ||
              !declaration ||
              !t.isImportDeclaration(declaration.node) ||
              declaration.node.source.value !== 'react-native'
            ) {
              return;
            }

            const [styles] = callPath.node.arguments;
            callPath.replaceWith(
              t.callExpression(
                t.memberExpression(runtimeRequire(), t.identifier('themedStyles')),
                [t.arrowFunctionExpression([], styles)],
              ),
            );
          },

          ImportDeclaration(importPath) {
            if (!isThemeImport(importPath.node.source.value)) return;
            if (importPath.node.importKind === 'type') return;

            const live = importPath.node.specifiers.filter(
              (specifier) =>
                t.isImportSpecifier(specifier) &&
                specifier.importKind !== 'type' &&
                t.isIdentifier(specifier.imported) &&
                LIVE_LAYOUT.has(specifier.imported.name),
            );
            if (!live.length) return;

            for (const specifier of live) {
              const binding = importPath.scope.getBinding(specifier.local.name);
              const name = specifier.imported.name;
              if (binding) {
                for (const reference of binding.referencePaths) {
                  reference.replaceWith(
                    t.memberExpression(
                      t.memberExpression(runtimeRequire(), t.identifier('liveLayout')),
                      t.identifier(name),
                    ),
                  );
                }
              }
            }

            importPath.node.specifiers = importPath.node.specifiers.filter(
              (specifier) => !live.includes(specifier),
            );
            if (!importPath.node.specifiers.length) importPath.remove();
          },
        });
      },
    },
  };
};
