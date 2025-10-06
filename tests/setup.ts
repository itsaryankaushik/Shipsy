/**
 * Jest Test Setup
 * Global test configuration and mocks
 */

import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock environment variables
process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key';

// Set NODE_ENV using Object.defineProperty to avoid read-only error
Object.defineProperty(process.env, 'NODE_ENV', {
  value: 'test',
  writable: true,
  configurable: true,
});

// Mock Web APIs for Next.js (Request, Response, Headers)
if (typeof global.Request === 'undefined') {
  // @ts-ignore
  global.Request = class Request {
    constructor(public url: string, public init?: any) {}
  };
}

if (typeof global.Response === 'undefined') {
  // @ts-ignore
  global.Response = class Response {
    constructor(public body?: any, public init?: any) {}
  };
}

if (typeof global.Headers === 'undefined') {
  // @ts-ignore
  global.Headers = class Headers extends Map {
    append(name: string, value: string) {
      this.set(name.toLowerCase(), value);
    }
    get(name: string) {
      return super.get(name.toLowerCase());
    }
  };
}

// Mock crypto for UUID generation
global.crypto = {
  ...global.crypto,
  randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(7),
} as Crypto;

// Mock fetch globally
global.fetch = jest.fn();

// Suppress console errors during tests (optional)
// global.console.error = jest.fn();
// global.console.warn = jest.fn();

// Setup for cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});
