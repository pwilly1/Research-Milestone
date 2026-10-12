import type { StudySession } from '../domain/studySession';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

function getApiUrl(): string {
  if (!apiUrl) {
    throw new Error(
      'API address is missing. Copy .env.example to .env.local and set EXPO_PUBLIC_API_URL.',
    );
  }

  return apiUrl.replace(/\/$/, '');
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? 'The server could not complete that request.');
  }

  return response.json() as Promise<T>;
}

export async function fetchSessions(): Promise<StudySession[]> {
  const response = await fetch(`${getApiUrl()}/api/sessions`);
  return parseResponse<StudySession[]>(response);
}

export async function saveSession(subject: string, minutes: number): Promise<StudySession> {
  const response = await fetch(`${getApiUrl()}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject, minutes }),
  });

  return parseResponse<StudySession>(response);
}

export async function deleteSessions(): Promise<void> {
  const response = await fetch(`${getApiUrl()}/api/sessions`, { method: 'DELETE' });

  if (!response.ok) {
    throw new Error('The saved sessions could not be cleared.');
  }
}
