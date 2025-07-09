import { beforeEach, describe, expect, it, mock } from 'bun:test';
import PasswordService from './password-service';

type RequestInit = Parameters<typeof fetch>[1];

describe('PasswordService', () => {
  let passwordService: PasswordService;

  beforeEach(() => {
    passwordService = new PasswordService();
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'test-password';
      const hash = await passwordService.hashPassword(password);

      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('verifyPasswordHash', () => {
    it('should verify a correct password hash', async () => {
      const password = 'test-password';
      const hash = await passwordService.hashPassword(password);

      const result = await passwordService.verifyPasswordHash(password, hash);
      expect(result).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const password = 'test-password';
      const wrongPassword = 'wrong-password';
      const hash = await passwordService.hashPassword(password);

      const result = await passwordService.verifyPasswordHash(wrongPassword, hash);
      expect(result).toBe(false);
    });
  });

  describe('verifyPasswordStrength', () => {
    it('should reject passwords that are too short', async () => {
      const shortPassword = '1234567';
      const result = await passwordService.verifyPasswordStrength(shortPassword);
      expect(result).toBe(false);
    });

    it('should reject passwords that are too long', async () => {
      const longPassword = 'a'.repeat(256);
      const result = await passwordService.verifyPasswordStrength(longPassword);
      expect(result).toBe(false);
    });

    it('should make API call to check for compromised passwords', async () => {
      const originalFetch = global.fetch;
      const mockFetch = mock();
      mockFetch.mockImplementation(async () => {
        return {
          text: async () => '',
          ok: true,
          headers: new Headers(),
          status: 200,
          statusText: 'OK',
          type: 'basic',
          url: '',
          redirected: false,
          body: null,
          bodyUsed: false,
          clone: function() { return new Response(''); },
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
          blob: () => Promise.resolve(new Blob([])),
          formData: () => Promise.resolve(new FormData()),
          json: () => Promise.resolve({}),
        } as Response;
      });
      global.fetch = mockFetch as typeof fetch;

      try {
        const password = 'StrongPassword123';
        await passwordService.verifyPasswordStrength(password);

        expect(mockFetch).toHaveBeenCalled();
        type FetchCall = [string | URL | Request, RequestInit | undefined];
        const calls = mockFetch.mock.calls as unknown as FetchCall[];
        expect(calls.length).toBeGreaterThan(0);
        const url = calls[0][0];
        expect(String(url)).toContain('https://api.pwnedpasswords.com/range/');
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('should accept a strong password', async () => {
      const originalFetch = global.fetch;
      const mockFetch = mock();
      mockFetch.mockImplementation(async () => {
        return {
          text: async () => '',
          ok: true,
          headers: new Headers(),
          status: 200,
          statusText: 'OK',
          type: 'basic',
          url: '',
          redirected: false,
          body: null,
          bodyUsed: false,
          clone: function() { return new Response(''); },
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
          blob: () => Promise.resolve(new Blob([])),
          formData: () => Promise.resolve(new FormData()),
          json: () => Promise.resolve({}),
        } as Response;
      });
      global.fetch = mockFetch as typeof fetch;

      try {
        const password = 'StrongPassword123';
        const result = await passwordService.verifyPasswordStrength(password);
        expect(result).toBe(true);
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('should reject a compromised password', async () => {
      const originalVerifyPasswordStrength = passwordService.verifyPasswordStrength;
      passwordService.verifyPasswordStrength = async () => false;

      try {
        const password = 'compromised123';
        const result = await passwordService.verifyPasswordStrength(password);
        expect(result).toBe(false);
      } finally {
        passwordService.verifyPasswordStrength = originalVerifyPasswordStrength;
      }
    });
  });
});
