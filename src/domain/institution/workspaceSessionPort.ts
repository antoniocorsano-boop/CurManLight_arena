export interface AuthenticatedWorkspaceIdentity {
  userId: string;
  email?: string;
}

/**
 * Provider-neutral authenticated identity read port.
 * Authentication alone never grants a workspace role or capability.
 */
export interface WorkspaceSessionPort {
  getIdentity(): Promise<AuthenticatedWorkspaceIdentity | null>;
}
