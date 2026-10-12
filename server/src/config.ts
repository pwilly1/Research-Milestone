import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error(
    'SUPABASE_URL or SUPABASE_SECRET_KEY is missing. Copy server/.env.example to server/.env and add both values from the Supabase Connect dialog.',
  );
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
};
