import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAdmin } from '@/admin/auth/store';
import { NavHeader, Screen } from '@/components';
import { CustomPageView } from '@/components/CustomPageView';
import { useAppConfig, useShownConfig } from '@/config/store';
import { t } from '@/config/strings';
import { GUTTER, colors, radius, space, type } from '@/theme';

/**
 * A page built in the dashboard, at `/page/<slug>`. Only published pages
 * open for everyone; a signed-in team member can add `?draft=1` to see the
 * draft version of any page, published or not.
 */
export default function CustomPageScreen() {
  const { slug, draft } = useLocalSearchParams<{ slug: string; draft?: string }>();
  const shown = useShownConfig();
  const { draft: draftConfig } = useAppConfig();
  const { me } = useAdmin();

  const fromDraft = draft === '1' && !!me;
  const page = fromDraft
    ? draftConfig.pages.find((p) => p.slug === slug)
    : shown.pages.find((p) => p.slug === slug && p.published);

  return (
    <Screen background={colors.white}>
      <NavHeader title={page?.title ?? ''} bordered />
      {page ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {fromDraft && !page.published ? (
            <View style={styles.draft}>
              <Text style={styles.draftText}>Draft page — only the team can see this.</Text>
            </View>
          ) : null}
          <CustomPageView page={page} />
        </ScrollView>
      ) : (
        <Text style={styles.missing}>{t('page.missing')}</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: { ...type.body, color: colors.muted, padding: GUTTER },
  draft: { marginHorizontal: GUTTER, marginTop: space.md, padding: space.md, borderRadius: radius.sm, backgroundColor: colors.fill },
  draftText: { ...type.caption, color: colors.body },
});
