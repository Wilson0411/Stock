type CookieStoreLike = {
  get(name: string): { value: string } | undefined;
};

export const AUTH_COOKIE_NAME = 'stock-auth';
const AUTH_COOKIE_VALUE = 'authenticated';

export const DEMO_USERNAME = 'admin';
export const DEMO_PASSWORD = 'admin';

export function isAuthenticated(cookiesStore: CookieStoreLike): boolean {
  return cookiesStore.get(AUTH_COOKIE_NAME)?.value === AUTH_COOKIE_VALUE;
}

export function validateCredentials(username: string, password: string): boolean {
  return username === DEMO_USERNAME && password === DEMO_PASSWORD;
}

export function getAuthCookieValue(): string {
  return AUTH_COOKIE_VALUE;
}