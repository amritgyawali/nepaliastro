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

import { Avatar, Screen, VerifiedBadge } from '@/components';
import { findAstrologer, ongoingSession } from '@/data/astrologers';
import { astroReplies, quickPrompts } from '@/data/content';
import { ChevronLeft, DoubleCheck, Plus, Send } from '@/icons';
import { colors, fontFamily, radius, shadow, weight } from '@/theme';
import { useOnboarding } from '@/store/onboarding';

type Message = {
  id: string;
  from: 'them' | 'me';
  text: string;
  /** Extra highlighted callout beneath the body, as in the design. */
  insight?: string;
  /** Small label above the first astrologer message. */
  eyebrow?: string;
  time: string;
};

function clockLabel(date = new Date()): string {
  const hours = date.getHours();
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
}

function formatElapsed(totalSeconds: number): string {
  const minutes = `${Math.floor(totalSeconds / 60)}`.padStart(2, '0');
  const seconds = `${totalSeconds % 60}`.padStart(2, '0');
  return `${minutes}:${seconds}`;
}

/** Live consultation screen — design/astrologer_chat_kiran_ji. */
export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useOnboarding();

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
  const place = profile.birthPlace.trim() || 'your birth place';

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 'intro',
      from: 'them',
      eyebrow: '✨ Vedic Astrologer',
      text: `Namaste ${firstName}! 🙏 I have opened your Kundli and I am analyzing your birth chart from ${place}.\n\nHow can I guide you today regarding your career, higher studies, or relationships?`,
      time: '8:56 PM',
    },
  ]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [elapsed, setElapsed] = useState(116);

  const scrollRef = useRef<ScrollView>(null);
  const replyTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Cancel any in-flight reply timers when the screen goes away.
  useEffect(
    () => () => {
      replyTimers.current.forEach(clearTimeout);
      replyTimers.current = [];
    },
    [],
  );

  const send = useCallback((raw: string) => {
    const text = raw.trim();
    if (!text) return;

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
  }, []);

  const endSession = () => {
    setConfirmEnd(false);
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/chat');
  };

  return (
    <Screen background={colors.white} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/chat'))}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <ChevronLeft size={24} color="#000" strokeWidth={2.2} />
          </Pressable>

          <Avatar uri={astrologer.photo} name={astrologer.name} size={44} />

          <View>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{astrologer.name}</Text>
              {astrologer.verified ? <VerifiedBadge size={16} /> : null}
            </View>
            <Text style={styles.timer}>{formatElapsed(elapsed)}</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="End consultation"
          onPress={() => setConfirmEnd(true)}
          hitSlop={8}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.endLabel}>End</Text>
        </Pressable>
      </View>

      {/* Session info strip */}
      <View style={styles.infoStrip}>
        <View style={styles.infoLeft}>
          <View style={styles.liveDot} />
          <Text style={styles.infoText} numberOfLines={1}>
            Birth Chart Shared: {profile.name.trim() || 'Your profile'}
            {profile.birthPlace.trim() ? ` (${profile.birthPlace.trim()})` : ''}
          </Text>
        </View>
        <Text style={styles.infoRate}>USD 0.49/min</Text>
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
            <Text style={styles.datePill}>TODAY • 8:56 PM</Text>
          </View>

          {messages.map((message) =>
            message.from === 'them' ? (
              <View key={message.id} style={styles.inRow}>
                <Avatar uri={astrologer.photo} name={astrologer.name} size={28} />
                <View style={styles.inBubble}>
                  {message.eyebrow ? (
                    <Text style={styles.eyebrow}>{message.eyebrow}</Text>
                  ) : null}
                  <Text style={styles.inText}>{message.text}</Text>
                  {message.insight ? (
                    <View style={styles.insight}>
                      <Text style={styles.insightText}>{message.insight}</Text>
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
            {quickPrompts.map((prompt) => (
              <Pressable
                key={prompt}
                accessibilityRole="button"
                onPress={() => send(prompt.replace(/^[^\w]+/, '').trim())}
                style={({ pressed }) => [styles.prompt, pressed && styles.promptPressed]}
              >
                <Text style={styles.promptLabel}>{prompt}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Composer */}
        <View style={styles.composer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Share Kundli chart"
            style={({ pressed }) => [styles.attachButton, pressed && styles.pressed]}
          >
            <Plus size={19} color="#57534E" strokeWidth={2} />
          </Pressable>

          <View style={styles.inputWrap}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Type your message..."
              placeholderTextColor="#A8A29E"
              style={styles.input}
              returnKeyType="send"
              onSubmitEditing={() => send(draft)}
              accessibilityLabel="Message"
            />
            <Text style={styles.inputSpark}>✦</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            onPress={() => send(draft)}
            style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]}
          >
            <Send size={16} color="#292524" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* End-consultation confirmation */}
      <Modal
        visible={confirmEnd}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmEnd(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setConfirmEnd(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalIcon}>
              <Text style={styles.modalEmoji}>🙏</Text>
            </View>
            <Text style={styles.modalTitle}>End Consultation?</Text>
            <Text style={styles.modalBody}>
              Your live chat with {astrologer.name} will be closed and your summary report
              will be generated.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setConfirmEnd(false)}
                style={({ pressed }) => [styles.modalCancel, pressed && styles.pressed]}
              >
                <Text style={styles.modalCancelLabel}>Continue Chat</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={endSession}
                style={({ pressed }) => [styles.modalConfirm, pressed && styles.pressed]}
              >
                <Text style={styles.modalConfirmLabel}>End Now</Text>
              </Pressable>
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F1EF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    flexShrink: 1,
  },
  backButton: {
    paddingRight: 2,
  },
  pressed: {
    opacity: 0.6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontFamily,
    fontSize: 17,
    fontWeight: weight.semibold,
    letterSpacing: -0.3,
    color: '#1C1917',
  },
  timer: {
    fontFamily,
    fontSize: 13,
    color: '#78716C',
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
  endLabel: {
    fontFamily,
    fontSize: 15,
    fontWeight: weight.medium,
    color: '#1C1917',
  },

  infoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(254,252,232,0.8)',
    borderBottomWidth: 1,
    borderBottomColor: '#FAF0C8',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexShrink: 1,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  infoText: {
    fontFamily,
    fontSize: 12,
    fontWeight: weight.medium,
    color: '#78350F',
    flexShrink: 1,
  },
  infoRate: {
    fontFamily,
    fontSize: 12,
    fontWeight: weight.semibold,
    color: '#B45309',
    marginLeft: 8,
  },

  messages: {
    flex: 1,
    backgroundColor: colors.creamWarm,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  datePillRow: {
    alignItems: 'center',
  },
  datePill: {
    fontFamily,
    fontSize: 11,
    fontWeight: weight.medium,
    letterSpacing: 0.4,
    color: '#78716C',
    backgroundColor: 'rgba(214,211,209,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },

  inRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: '90%',
  },
  inBubble: {
    flexShrink: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#F0EFEC',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    padding: 14,
    ...shadow(1, 0.04),
  },
  eyebrow: {
    fontFamily,
    fontSize: 12,
    fontWeight: weight.medium,
    color: '#92400E',
    marginBottom: 5,
  },
  inText: {
    fontFamily,
    fontSize: 14.5,
    lineHeight: 21,
    color: '#292524',
  },
  insight: {
    marginTop: 9,
    padding: 9,
    borderRadius: 10,
    backgroundColor: 'rgba(254,252,232,0.7)',
    borderWidth: 1,
    borderColor: '#FBEFC4',
  },
  insightText: {
    fontFamily,
    fontSize: 12.5,
    lineHeight: 18,
    color: '#78350F',
  },
  inTime: {
    fontFamily,
    fontSize: 10,
    color: '#A8A29E',
    textAlign: 'right',
    marginTop: 5,
  },

  outRow: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    maxWidth: '84%',
    gap: 4,
  },
  outBubble: {
    backgroundColor: colors.chatBubbleOut,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    padding: 14,
    ...shadow(1, 0.04),
  },
  outText: {
    fontFamily,
    fontSize: 14.5,
    lineHeight: 21,
    color: '#1C1917',
  },
  outMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 4,
  },
  outTime: {
    fontFamily,
    fontSize: 10,
    color: '#A8A29E',
  },

  typingRow: {
    paddingLeft: 36,
  },
  typingBubble: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#F0EFEC',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  typingLabel: {
    fontFamily,
    fontSize: 11,
    color: '#A8A29E',
    marginLeft: 4,
  },

  promptsWrap: {
    backgroundColor: colors.creamWarm,
    borderTopWidth: 1,
    borderTopColor: '#F2F1EF',
  },
  prompts: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    gap: 8,
  },
  prompt: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  promptPressed: {
    backgroundColor: '#FEF9E7',
    borderColor: '#F0D63F',
    transform: [{ scale: 0.97 }],
  },
  promptLabel: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: weight.medium,
    color: '#44403C',
  },

  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#EDECEA',
  },
  attachButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5F5F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(245,245,244,0.9)',
    paddingLeft: 16,
    paddingRight: 34,
    fontFamily,
    fontSize: 14.5,
    color: '#1C1917',
  },
  inputSpark: {
    position: 'absolute',
    right: 13,
    fontSize: 12,
    color: '#F59E0B',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2C94C',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow(1, 0.08),
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.white,
    borderRadius: 26,
    padding: 22,
    alignItems: 'center',
    ...shadow(10, 0.25, 30),
  },
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalEmoji: {
    fontSize: 22,
  },
  modalTitle: {
    fontFamily,
    fontSize: 16,
    fontWeight: weight.bold,
    color: '#1C1917',
  },
  modalBody: {
    fontFamily,
    fontSize: 12.5,
    lineHeight: 19,
    textAlign: 'center',
    color: '#78716C',
    marginTop: 6,
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'stretch',
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    alignItems: 'center',
  },
  modalCancelLabel: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: weight.semibold,
    color: '#44403C',
  },
  modalConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.red,
    alignItems: 'center',
  },
  modalConfirmLabel: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: weight.semibold,
    color: colors.white,
  },
});
