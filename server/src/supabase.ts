import { createAdminClient } from '@supabase/server/core';

export function createDatabaseClient() {
  return createAdminClient();
}
