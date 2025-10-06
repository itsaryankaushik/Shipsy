/**
 * Mock Functions and Objects
 * Reusable mocks for testing
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// NEXT.JS MOCKS
// ============================================

export const createMockRequest = (options: {
  method?: string;
  url?: string;
  body?: any;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
} = {}): NextRequest => {
  const url = options.url || 'http://localhost:3000/api/test';
  const headers = new Headers(options.headers || {});
  
  if (options.cookies) {
    Object.entries(options.cookies).forEach(([key, value]) => {
      headers.append('cookie', `${key}=${value}`);
    });
  }

  const request = new NextRequest(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Mock json() method
  if (options.body) {
    (request as any).json = jest.fn().mockResolvedValue(options.body);
  }

  return request;
};

export const mockNextResponse = () => {
  const json = jest.fn((body: any, init?: any) => ({
    status: init?.status || 200,
    json: () => Promise.resolve(body),
    headers: new Headers(),
  }));

  return { json };
};

// ============================================
// DATABASE MOCKS
// ============================================

export const createMockDB = () => ({
  query: jest.fn(),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn(),
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
});

// ============================================
// ROUTER MOCKS
// ============================================

export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  route: '/',
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
};

// ============================================
// FETCH MOCKS
// ============================================

export const mockFetch = (response: any, options: { status?: number; ok?: boolean } = {}) => {
  const status = options.status || 200;
  const ok = options.ok !== undefined ? options.ok : status >= 200 && status < 300;

  return jest.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(JSON.stringify(response)),
    headers: new Headers(),
  });
};

export const mockFetchError = (message: string = 'Network error') => {
  return jest.fn().mockRejectedValue(new Error(message));
};

// ============================================
// AUTH MOCKS
// ============================================

export const mockAuthenticatedUser = (userId: string = 'test-user-id') => ({
  authenticated: true,
  user: {
    userId,
    email: 'test@shipsy.com',
    name: 'Test User',
  },
  response: null,
});

export const mockUnauthenticatedUser = () => ({
  authenticated: false,
  user: null,
  response: NextResponse.json(
    { success: false, message: 'Unauthorized' },
    { status: 401 }
  ),
});

// ============================================
// COOKIE MOCKS
// ============================================

export const mockCookies = (cookies: Record<string, string> = {}) => ({
  get: jest.fn((name: string) => cookies[name] ? { value: cookies[name] } : undefined),
  set: jest.fn(),
  delete: jest.fn(),
  has: jest.fn((name: string) => name in cookies),
  getAll: jest.fn(() => Object.entries(cookies).map(([name, value]) => ({ name, value }))),
});

// ============================================
// JWT MOCKS
// ============================================

export const mockJwtVerify = (payload: any) => {
  return jest.fn().mockResolvedValue(payload);
};

export const mockJwtSign = (token: string = 'mock-jwt-token') => {
  return jest.fn().mockResolvedValue(token);
};

// ============================================
// BCRYPT MOCKS
// ============================================

export const mockBcryptHash = (hash: string = '$2a$10$mockedHashValue') => {
  return jest.fn().mockResolvedValue(hash);
};

export const mockBcryptCompare = (isMatch: boolean = true) => {
  return jest.fn().mockResolvedValue(isMatch);
};

// ============================================
// EVENT MOCKS
// ============================================

export const mockClickEvent = (overrides?: any) => ({
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  target: {},
  currentTarget: {},
  ...overrides,
});

export const mockFormEvent = (data?: any) => ({
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  target: {
    elements: data || {},
  },
  currentTarget: {
    elements: data || {},
  },
});

export const mockChangeEvent = (value: string) => ({
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  target: {
    value,
    name: 'test-input',
  },
  currentTarget: {
    value,
  },
});

// ============================================
// WINDOW MOCKS
// ============================================

export const mockWindow = () => {
  const originalWindow = global.window;
  
  return {
    location: {
      href: 'http://localhost:3000',
      pathname: '/',
      search: '',
      hash: '',
      reload: jest.fn(),
      replace: jest.fn(),
    },
    alert: jest.fn(),
    confirm: jest.fn(() => true),
    prompt: jest.fn(),
    localStorage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    sessionStorage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    restore: () => {
      global.window = originalWindow;
    },
  };
};

// ============================================
// CONSOLE MOCKS
// ============================================

export const mockConsole = () => {
  const originalConsole = global.console;
  
  return {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    restore: () => {
      global.console = originalConsole;
    },
  };
};

// ============================================
// TIMER MOCKS
// ============================================

export const setupTimerMocks = () => {
  jest.useFakeTimers();
  return {
    advanceTime: (ms: number) => jest.advanceTimersByTime(ms),
    runAllTimers: () => jest.runAllTimers(),
    runOnlyPending: () => jest.runOnlyPendingTimers(),
    clearAllTimers: () => jest.clearAllTimers(),
    restore: () => jest.useRealTimers(),
  };
};
