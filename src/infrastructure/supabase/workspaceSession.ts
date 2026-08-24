import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AuthenticatedWorkspaceIdentity,
  WorkspaceSessionPort,
} from '../../domain/institution/workspaceSessionPort';

/**
 * Browser session adapter. Its identity is only the first trust step:
 * workspace membership and RLS remain mandatory before any shared capability.
 */
export class SupabaseWorkspaceSession implements WorkspaceSessionPort {
  constructor(private readonly client: SupabaseClient) {}

  async getIdentity(): Promise<AuthenticatedWorkspaceIdentity | null> {
    const { data, error } = await this.client.auth.getSession();

    if (error) {
      throw new Error(`Impossibile leggere la sessione Supabase: ${error.message}`);
    }

    const user = data.session?.user;
    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      ...(user.email ? { email: user.email } : {}),
    };
  }
}
