import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AI_MODEL, BUILD_TIME_KEY, PROXY_URL, canUseAi, groqChat, looksLikeKey } from '@/lib/groq';
import { usePredictions } from '@/store/predictions';

import { useArea } from '../editor';
import { NumberField, Segmented, Select, TextField, Toggle } from '../ui/fields';
import { Badge, Button, Grid, KeyValue, Notice, Panel } from '../ui/kit';
import { useOverlay } from '../ui/overlay';
import { AdminPage } from '../ui/Page';
import { A, R, S, T } from '../ui/theme';

const MODELS = [
  { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', hint: 'As shipped. The best writing on the free tier.' },
  { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B instant', hint: 'Much faster, plainer answers, a higher free limit.' },
  { value: 'openai/gpt-oss-120b', label: 'GPT-OSS 120B', hint: 'Large open model served by Groq.' },
  { value: 'openai/gpt-oss-20b', label: 'GPT-OSS 20B', hint: 'Smaller and quicker.' },
  { value: 'qwen/qwen3-32b', label: 'Qwen 3 32B', hint: 'Good with long instructions.' },
];

const TONES = [
  { value: '0.4', label: 'Steady' },
  { value: '0.75', label: 'Warm' },
  { value: '1', label: 'Varied' },
];

export default function Ai() {
  const { value: ai, patch, canEdit } = useArea('ai');
  const cards = useArea('astrologers');
  const { settings, setApiKey } = usePredictions();
  const { toast } = useOverlay();
  const [question, setQuestion] = useState('In two sentences: what is a nakshatra?');
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [keyDraft, setKeyDraft] = useState(settings.apiKey);
  const key = settings.apiKey || BUILD_TIME_KEY;
  const known = MODELS.some((m) => m.value === ai.model);

  const ask = async () => {
    setAsking(true);
    setError(null);
    setAnswer(null);
    const started = Date.now();
    try {
      const reply = await groqChat(
        key,
        [
          { role: 'system', content: `You are AI Astrologer Baba, answering a quick test from the app's team.${ai.personaNotes ? `\n${ai.personaNotes}` : ''}` },
          { role: 'user', content: question },
        ],
        { maxTokens: ai.chatMaxTokens, temperature: ai.chatTemperature, model: ai.model, timeoutMs: 30_000 },
      );
      setAnswer(`${reply}\n\n— ${ai.model}, ${((Date.now() - started) / 1000).toFixed(1)} s`);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'The model could not be reached.');
    } finally {
      setAsking(false);
    }
  };

  return (
    <AdminPage section="ai" canEdit={canEdit}>
      <Grid min={400} max={2}>
        <Panel id="ai-switch" title="AI Baba on or off" description="Whether he is listed at the top of Chat. His card is edited under Astrologers." icon="aiBaba">
          <Toggle
            label="List AI Baba in Chat"
            value={cards.value.ai.enabled}
            disabled={!cards.canEdit}
            onChange={(enabled) => cards.patch({ ai: { ...cards.value.ai, enabled } }, `AI Baba ${enabled ? 'listed' : 'unlisted'}`)}
          />
          <KeyValue
            rows={[
              { label: 'Where answers come from', value: PROXY_URL ? 'Your proxy' : 'Groq, directly' },
              { label: 'Key on this device', value: key ? (settings.apiKey ? 'Typed in' : 'Built into the app') : 'None' },
              { label: 'Ready', value: canUseAi(key) ? 'Yes' : 'No — add a key below' },
            ]}
          />
        </Panel>

        <Panel id="ai-model" title="Model" description="Which Groq model writes Baba’s answers and the five-hourly readings" icon="layers">
          <Select
            label="Model"
            value={known ? ai.model : 'custom'}
            options={[...MODELS, { value: 'custom', label: 'Another model…', hint: 'Type its Groq id below' }]}
            onChange={(model) => patch({ model: model === 'custom' ? '' : model }, 'model')}
          />
          {!known ? (
            <TextField label="Groq model id" value={ai.model} mono onChange={(model) => patch({ model: model.trim() }, 'model')} placeholder={AI_MODEL} hint="Empty uses the shipped model." />
          ) : null}
        </Panel>

        <Panel id="ai-tuning" title="Tone and length" description="Lower is steadier and more alike; higher is more varied" icon="sliders">
          <Segmented
            label="Baba’s answers"
            value={TONES.some((t) => Number(t.value) === ai.chatTemperature) ? String(ai.chatTemperature) : '0.75'}
            onChange={(value) => patch({ chatTemperature: Number(value) }, 'chat tone')}
            options={TONES}
          />
          <NumberField label="Exact value, chat" value={ai.chatTemperature} min={0} max={1.5} step={0.05} decimals={2} onChange={(v) => patch({ chatTemperature: v ?? 0.75 }, 'chat tone')} />
          <NumberField label="Longest answer, in tokens" value={ai.chatMaxTokens} min={200} max={4000} step={50} onChange={(v) => patch({ chatMaxTokens: v ?? 900 }, 'chat length')} hint="About 900 is three short paragraphs of Nepali." />
          <NumberField label="Readings" value={ai.readingTemperature} min={0} max={1.5} step={0.05} decimals={2} onChange={(v) => patch({ readingTemperature: v ?? 0.8 }, 'reading tone')} />
        </Panel>

        <Panel id="ai-persona" title="Extra instructions for Baba" description="Added after his house rules, which you cannot override from here: no invented placements, no predictions of death or illness, no medical or money instructions." icon="text">
          <TextField
            value={ai.personaNotes}
            multiline
            rows={6}
            maxLength={1200}
            placeholder="Mention our Dashain puja offer when someone asks about remedies."
            onChange={(personaNotes) => patch({ personaNotes }, 'Baba instructions')}
          />
        </Panel>

        <Panel id="ai-readings" title="Extra instructions for readings" description="Added to the brief for the five-hourly readings" icon="calendar">
          <TextField
            value={ai.readingNotes}
            multiline
            rows={5}
            maxLength={1200}
            placeholder="Keep every reading under 80 words."
            onChange={(readingNotes) => patch({ readingNotes }, 'reading instructions')}
          />
        </Panel>

        <Panel id="ai-key" title="API key on this device" description="Kept on this phone only; it is not part of the config and is never synced or exported" icon="key">
          <TextField
            label="Groq key"
            value={keyDraft}
            onChange={setKeyDraft}
            secure
            alwaysEditable
            placeholder="gsk_…"
            error={keyDraft && !looksLikeKey(keyDraft) ? 'Groq keys start with gsk_' : null}
          />
          <Button
            label="Save key"
            variant="primary"
            disabled={keyDraft === settings.apiKey}
            onPress={() => {
              setApiKey(keyDraft);
              toast(keyDraft ? 'Key saved on this device' : 'Key removed');
            }}
          />
          {PROXY_URL ? <Notice tone="info">This build sends requests through your proxy, which holds its own key.</Notice> : null}
        </Panel>

        <Panel id="ai-console" title="Try it" description="Asks the model with the draft’s model, tone and instructions — before you publish them" icon="chat">
          <TextField label="Question" value={question} onChange={setQuestion} alwaysEditable multiline rows={2} />
          <Button label="Ask" icon="send" variant="primary" onPress={ask} loading={asking} disabled={!question.trim() || !canUseAi(key)} />
          {!canUseAi(key) ? <Notice tone="warning">Add a Groq key above first.</Notice> : null}
          {error ? <Notice tone="danger">{error}</Notice> : null}
          {answer ? (
            <View style={styles.answer}>
              <Badge label={ai.model} tone="info" />
              <Text style={styles.answerText} selectable>
                {answer}
              </Text>
            </View>
          ) : null}
        </Panel>
      </Grid>
    </AdminPage>
  );
}

const styles = StyleSheet.create({
  answer: { gap: S.sm, padding: S.md, borderRadius: R.md, backgroundColor: A.hover, borderWidth: 1, borderColor: A.line },
  answerText: { ...T.body, color: A.ink },
});
