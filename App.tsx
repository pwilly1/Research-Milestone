import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { deleteSessions, fetchSessions, saveSession } from './src/api/sessions';
import type { StudySession } from './src/domain/studySession';

export default function App() {
  const [subject, setSubject] = useState('');
  const [minutes, setMinutes] = useState('');
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSessions() {
      try {
        setSessions(await fetchSessions());
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      } finally {
        setIsLoading(false);
      }
    }

    loadSessions();
  }, []);

  const totalMinutes = useMemo(
    () => sessions.reduce((total, session) => total + session.minutes, 0),
    [sessions],
  );

  async function addSession() {
    const cleanSubject = subject.trim();
    const parsedMinutes = Number(minutes);

    if (!cleanSubject) {
      setError('Enter a subject before adding a session.');
      return;
    }

    if (!Number.isInteger(parsedMinutes) || parsedMinutes < 1 || parsedMinutes > 480) {
      setError('Minutes must be a whole number between 1 and 480.');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      const newSession = await saveSession(cleanSubject, parsedMinutes);
      setSessions((currentSessions) => [newSession, ...currentSessions]);
      setSubject('');
      setMinutes('');
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  async function clearSessions() {
    try {
      setError('');
      await deleteSessions();
      setSessions([]);
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>STUDY COMPASS</Text>
          <Text style={styles.title}>Make every study session count.</Text>
          <Text style={styles.subtitle}>
            Log your work and get instant feedback based on the time you invested.
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <SummaryCard label="Sessions" value={String(sessions.length)} />
          <SummaryCard label="Total minutes" value={String(totalMinutes)} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Log a session</Text>

          <Text style={styles.label}>What did you study?</Text>
          <TextInput
            accessibilityLabel="Study subject"
            autoCapitalize="sentences"
            maxLength={50}
            onChangeText={setSubject}
            placeholder="Example: PostgreSQL"
            placeholderTextColor="#89919E"
            returnKeyType="next"
            style={styles.input}
            value={subject}
          />

          <Text style={styles.label}>How many minutes?</Text>
          <TextInput
            accessibilityLabel="Minutes studied"
            keyboardType="number-pad"
            maxLength={3}
            onChangeText={(value) => setMinutes(value.replace(/[^0-9]/g, ''))}
            onSubmitEditing={addSession}
            placeholder="Example: 45"
            placeholderTextColor="#89919E"
            returnKeyType="done"
            style={styles.input}
            value={minutes}
          />

          {error ? (
            <Text accessibilityLiveRegion="polite" style={styles.error}>
              {error}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            onPress={addSession}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              isSaving && styles.buttonDisabled,
            ]}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Save study session</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Recent sessions</Text>
          {sessions.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              onPress={clearSessions}
              hitSlop={10}
            >
              <Text style={styles.clearText}>Clear all</Text>
            </Pressable>
          ) : null}
        </View>

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color="#C65D3B" />
            <Text style={styles.loadingText}>Loading saved sessions…</Text>
          </View>
        ) : sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>◎</Text>
            <Text style={styles.emptyTitle}>No sessions yet</Text>
            <Text style={styles.emptyText}>
              Your first completed study session will appear here.
            </Text>
          </View>
        ) : (
          sessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionTopRow}>
                <Text numberOfLines={1} style={styles.sessionSubject}>
                  {session.subject}
                </Text>
                <View style={styles.minutesBadge}>
                  <Text style={styles.minutesText}>{session.minutes} min</Text>
                </View>
              </View>
              <Text style={styles.feedback}>{session.feedback}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
};

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Something went wrong while contacting the server.';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F1EA' },
  content: {
    paddingTop: Platform.OS === 'android' ? 52 : 68,
    paddingHorizontal: 20,
    paddingBottom: 48,
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  hero: { marginBottom: 22 },
  eyebrow: {
    color: '#C65D3B', fontSize: 12, fontWeight: '800', letterSpacing: 2.2, marginBottom: 10,
  },
  title: {
    color: '#18312B', fontSize: 34, fontWeight: '800', lineHeight: 40, letterSpacing: -0.8,
  },
  subtitle: { color: '#586761', fontSize: 16, lineHeight: 24, marginTop: 10 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: '#18312B', borderRadius: 18, padding: 18 },
  summaryValue: { color: '#FFF9EE', fontSize: 28, fontWeight: '800' },
  summaryLabel: { color: '#B9C6C1', fontSize: 13, marginTop: 2 },
  card: {
    backgroundColor: '#FFFCF6',
    borderColor: '#E3DED3',
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#18312B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  sectionTitle: { color: '#18312B', fontSize: 20, fontWeight: '800' },
  label: {
    color: '#364C45', fontSize: 14, fontWeight: '700', marginTop: 18, marginBottom: 8,
  },
  input: {
    backgroundColor: '#F7F4ED',
    borderColor: '#D6D1C6',
    borderRadius: 14,
    borderWidth: 1,
    color: '#18312B',
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  error: { color: '#A63D2B', fontSize: 13, lineHeight: 19, marginTop: 12 },
  button: {
    alignItems: 'center', backgroundColor: '#C65D3B', borderRadius: 14, marginTop: 18, paddingVertical: 15,
  },
  buttonPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  historyHeader: {
    alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, marginBottom: 12,
  },
  clearText: { color: '#A34F34', fontSize: 14, fontWeight: '700' },
  emptyState: {
    alignItems: 'center',
    borderColor: '#D9D3C8',
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  emptyIcon: { color: '#C65D3B', fontSize: 30 },
  emptyTitle: { color: '#18312B', fontSize: 17, fontWeight: '800', marginTop: 8 },
  emptyText: {
    color: '#6C7772', fontSize: 14, lineHeight: 21, marginTop: 5, textAlign: 'center',
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: 34,
  },
  loadingText: {
    color: '#6C7772',
    fontSize: 14,
    marginTop: 10,
  },
  sessionCard: {
    backgroundColor: '#FFFCF6', borderColor: '#E3DED3', borderRadius: 18, borderWidth: 1, marginBottom: 10, padding: 17,
  },
  sessionTopRow: {
    alignItems: 'center', flexDirection: 'row', gap: 12, justifyContent: 'space-between',
  },
  sessionSubject: { color: '#18312B', flex: 1, fontSize: 17, fontWeight: '800' },
  minutesBadge: {
    backgroundColor: '#E4EEE9', borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6,
  },
  minutesText: { color: '#315C50', fontSize: 12, fontWeight: '800' },
  feedback: { color: '#62716B', fontSize: 14, lineHeight: 20, marginTop: 9 },
});
