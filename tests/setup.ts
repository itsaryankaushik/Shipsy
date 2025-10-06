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
  // @ts-ignore - Proper Request mock for Next.js
  global.Request = class Request {
    public method: string;
    public headers: Headers;
    public body: any;
    private _url: string;
    
    constructor(input: string | Request, init?: RequestInit) {
      this._url = typeof input === 'string' ? input : input.url;
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
      this.body = init?.body || null;
    }
    
    get url() {
      return this._url;
    }
    
    async json() {
      return JSON.parse(this.body || '{}');
    }
    
    async text() {
      return this.body || '';
    }
    
    clone() {
      return new Request(this._url, {
        method: this.method,
        headers: this.headers,
        body: this.body,
      });
    }
  };
}

if (typeof global.Response === 'undefined') {
  // @ts-ignore
  global.Response = class Response {
    public status: number;
    public statusText: string;
    public headers: Headers;
    private _body: any;
    
    constructor(body?: any, init?: ResponseInit) {
      this._body = body;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || 'OK';
      this.headers = new Headers(init?.headers);
    }
    
    // Static method for NextResponse.json compatibility
    static json(body: any, init?: ResponseInit) {
      const headers = new Headers(init?.headers);
      headers.set('content-type', 'application/json');
      
      return new Response(JSON.stringify(body), {
        ...init,
        headers,
      });
    }
    
    async json() {
      return typeof this._body === 'string' ? JSON.parse(this._body) : this._body;
    }
    
    async text() {
      return typeof this._body === 'string' ? this._body : JSON.stringify(this._body);
    }
    
    clone() {
      return new Response(this._body, {
        status: this.status,
        statusText: this.statusText,
        headers: this.headers,
      });
    }
  };
}

if (typeof global.Headers === 'undefined') {
  // @ts-ignore
  global.Headers = class Headers {
    private _headers: Map<string, string>;
    
    constructor(init?: HeadersInit) {
      this._headers = new Map();
      if (init) {
        if (init instanceof Headers) {
          init.forEach((value, key) => this.set(key, value));
        } else if (Array.isArray(init)) {
          init.forEach(([key, value]) => this.set(key, value));
        } else {
          Object.entries(init).forEach(([key, value]) => this.set(key, value));
        }
      }
    }
    
    append(name: string, value: string) {
      const existing = this.get(name);
      this.set(name, existing ? `${existing}, ${value}` : value);
    }
    
    delete(name: string) {
      this._headers.delete(name.toLowerCase());
    }
    
    get(name: string) {
      return this._headers.get(name.toLowerCase()) || null;
    }
    
    has(name: string) {
      return this._headers.has(name.toLowerCase());
    }
    
    set(name: string, value: string) {
      this._headers.set(name.toLowerCase(), value);
    }
    
    forEach(callback: (value: string, key: string) => void) {
      this._headers.forEach((value, key) => callback(value, key));
    }
    
    entries() {
      return this._headers.entries();
    }
    
    keys() {
      return this._headers.keys();
    }
    
    values() {
      return this._headers.values();
    }
    
    [Symbol.iterator]() {
      return this._headers[Symbol.iterator]();
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
