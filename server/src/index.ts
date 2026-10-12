import cors from 'cors';
import express from 'express';

import { config } from './config.js';
import { getStudyFeedback } from './feedback.js';
import { createDatabaseClient } from './supabase.js';

type SessionRecord = {
  id: string;
  subject: string;
  minutes: number;
  feedback: string;
  created_at: string;
};

const app = express();

app.use(cors());
app.use(express.json({ limit: '10kb' }));

app.get('/health', async (_request, response) => {
  const supabase = createDatabaseClient();
  const { error } = await supabase
    .from('study_sessions')
    .select('id', { count: 'exact', head: true });

  if (error) {
    throw new Error(error.message);
  }

  response.json({ status: 'ok' });
});

app.get('/api/sessions', async (_request, response) => {
  const supabase = createDatabaseClient();
  const { data, error } = await supabase
    .from('study_sessions')
    .select('id, subject, minutes, feedback, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  response.json((data ?? []).map((row: unknown) => toSession(row as SessionRecord)));
});

app.post('/api/sessions', async (request, response) => {
  const subject = typeof request.body?.subject === 'string'
    ? request.body.subject.trim()
    : '';
  const minutes = Number(request.body?.minutes);

  if (!subject || subject.length > 50) {
    response.status(400).json({ error: 'Subject must contain 1 to 50 characters.' });
    return;
  }

  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 480) {
    response.status(400).json({ error: 'Minutes must be a whole number between 1 and 480.' });
    return;
  }

  const feedback = getStudyFeedback(minutes);
  const supabase = createDatabaseClient();
  const { data, error } = await supabase
    .from('study_sessions')
    .insert({ subject, minutes, feedback })
    .select('id, subject, minutes, feedback, created_at')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  response.status(201).json(toSession(data as SessionRecord));
});

app.delete('/api/sessions', async (_request, response) => {
  const supabase = createDatabaseClient();
  const { error } = await supabase
    .from('study_sessions')
    .delete()
    .not('id', 'is', null);

  if (error) {
    throw new Error(error.message);
  }

  response.status(204).send();
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error);
  response.status(500).json({ error: 'The server could not complete that request.' });
});

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`Study Compass API listening on http://localhost:${config.port}`);
});

function toSession(record: SessionRecord) {
  return {
    id: record.id,
    subject: record.subject,
    minutes: record.minutes,
    feedback: record.feedback,
    createdAt: record.created_at,
  };
}

function shutDown() {
  server.close();
}

process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);
