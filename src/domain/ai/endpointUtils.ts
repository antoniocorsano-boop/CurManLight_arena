export const LOCAL_ENDPOINT_PATTERN = /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?\/?$/;

export function validateLocalEndpoint(endpoint: string): void {
  if (!LOCAL_ENDPOINT_PATTERN.test(endpoint)) {
    throw new Error('Invalid endpoint');
  }
}
