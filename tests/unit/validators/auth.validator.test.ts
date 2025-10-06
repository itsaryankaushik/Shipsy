/**
 * Authentication Validator Unit Tests
 * Tests for auth validation including password strength
 */

import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '@/lib/validators/auth.validator';
import { createValidAuthData } from '../../helpers/factories';

describe('Authentication Validator', () => {
  describe('registerSchema', () => {
    describe('Valid Data', () => {
      it('should accept valid registration data', () => {
        const validData = createValidAuthData();
        const result = registerSchema.safeParse(validData);
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.email).toBe(validData.email);
          expect(result.data.name).toBe(validData.name);
        }
      });

      it('should trim whitespace from email', () => {
        const data = createValidAuthData({ email: '  test@shipsy.com  ' });
        const result = registerSchema.safeParse(data);
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.email).toBe('test@shipsy.com');
        }
      });

      it('should convert email to lowercase', () => {
        const data = createValidAuthData({ email: 'TEST@SHIPSY.COM' });
        const result = registerSchema.safeParse(data);
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.email).toBe('test@shipsy.com');
        }
      });
    });

    describe('Invalid Data - Missing Fields', () => {
      it('should reject missing email', () => {
        const { email, ...dataWithoutEmail } = createValidAuthData();
        const result = registerSchema.safeParse(dataWithoutEmail);
        
        expect(result.success).toBe(false);
      });

      it('should reject missing password', () => {
        const { password, ...dataWithoutPassword } = createValidAuthData();
        const result = registerSchema.safeParse(dataWithoutPassword);
        
        expect(result.success).toBe(false);
      });

      it('should reject missing name', () => {
        const { name, ...dataWithoutName } = createValidAuthData();
        const result = registerSchema.safeParse(dataWithoutName);
        
        expect(result.success).toBe(false);
      });

      it('should reject missing phone', () => {
        const { phone, ...dataWithoutPhone } = createValidAuthData();
        const result = registerSchema.safeParse(dataWithoutPhone);
        
        expect(result.success).toBe(false);
      });
    });

    describe('Invalid Data - Email Validation', () => {
      it('should reject invalid email format', () => {
        const invalidData = createValidAuthData({ email: 'not-an-email' });
        const result = registerSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });

      it('should reject email without domain', () => {
        const invalidData = createValidAuthData({ email: 'test@' });
        const result = registerSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });

      it('should reject email without @', () => {
        const invalidData = createValidAuthData({ email: 'testshipsy.com' });
        const result = registerSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });

      it('should reject empty email', () => {
        const invalidData = createValidAuthData({ email: '' });
        const result = registerSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });
    });

    describe('Invalid Data - Password Validation', () => {
      it('should reject password less than 8 characters', () => {
        const invalidData = createValidAuthData({ password: 'Short1!' });
        const result = registerSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });

      it('should reject password without uppercase', () => {
        const invalidData = createValidAuthData({ password: 'password123!' });
        const result = registerSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });

      it('should reject password without lowercase', () => {
        const invalidData = createValidAuthData({ password: 'PASSWORD123!' });
        const result = registerSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });

      it('should reject password without number', () => {
        const invalidData = createValidAuthData({ password: 'PasswordABC!' });
        const result = registerSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });

      it('should accept password without special character (not required)', () => {
        const validData = createValidAuthData({ password: 'Password123' });
        const result = registerSchema.safeParse(validData);
        
        expect(result.success).toBe(true); // Special characters not required
      });

      it('should reject empty password', () => {
        const invalidData = createValidAuthData({ password: '' });
        const result = registerSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });
    });

    describe('Invalid Data - Phone Validation', () => {
      it('should reject invalid phone format', () => {
        const invalidData = createValidAuthData({ phone: 'abc123' });
        const result = registerSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });

      it('should reject too short phone', () => {
        const invalidData = createValidAuthData({ phone: '+123' });
        const result = registerSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });

      it('should reject too long phone', () => {
        const invalidData = createValidAuthData({ phone: '+' + '1'.repeat(21) });
        const result = registerSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });
    });

    describe('Boundary Testing', () => {
      it('should accept minimum length password (8 chars)', () => {
        const data = createValidAuthData({ password: 'Test@123' });
        const result = registerSchema.safeParse(data);
        
        expect(result.success).toBe(true);
      });

      it('should accept long password', () => {
        const longPassword = 'Test@' + '1'.repeat(50);
        const data = createValidAuthData({ password: longPassword });
        const result = registerSchema.safeParse(data);
        
        expect(result.success).toBe(true);
      });

      it('should accept minimum length name (2 chars)', () => {
        const data = createValidAuthData({ name: 'AB' });
        const result = registerSchema.safeParse(data);
        
        expect(result.success).toBe(true);
      });

      it('should reject too short name (1 char)', () => {
        const data = createValidAuthData({ name: 'A' });
        const result = registerSchema.safeParse(data);
        
        expect(result.success).toBe(false);
      });
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login credentials', () => {
      const validData = {
        email: 'test@shipsy.com',
        password: 'Test@123456',
      };
      const result = loginSchema.safeParse(validData);
      
      expect(result.success).toBe(true);
    });

    it('should normalize email to lowercase', () => {
      const data = {
        email: 'TEST@SHIPSY.COM',
        password: 'Test@123456',
      };
      const result = loginSchema.safeParse(data);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@shipsy.com');
      }
    });

    it('should reject missing email', () => {
      const invalidData = { password: 'Test@123456' };
      const result = loginSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
    });

    it('should reject missing password', () => {
      const invalidData = { email: 'test@shipsy.com' };
      const result = loginSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'Test@123456',
      };
      const result = loginSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
    });
  });

  describe('updateProfileSchema', () => {
    it('should accept name update only', () => {
      const data = { name: 'Updated Name' };
      const result = updateProfileSchema.safeParse(data);
      
      expect(result.success).toBe(true);
    });

    it('should accept phone update only', () => {
      const data = { phone: '+1987654321' };
      const result = updateProfileSchema.safeParse(data);
      
      expect(result.success).toBe(true);
    });

    it('should accept both name and phone updates', () => {
      const data = { 
        name: 'Updated Name',
        phone: '+1987654321'
      };
      const result = updateProfileSchema.safeParse(data);
      
      expect(result.success).toBe(true);
    });

    it('should accept empty object (no updates)', () => {
      const result = updateProfileSchema.safeParse({});
      
      expect(result.success).toBe(true);
    });

    it('should reject invalid phone format', () => {
      const invalidData = { phone: 'invalid' };
      const result = updateProfileSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
    });

    it('should reject too short name', () => {
      const invalidData = { name: 'A' };
      const result = updateProfileSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('should accept valid password change', () => {
      const validData = {
        currentPassword: 'OldPass@123',
        newPassword: 'NewPass@456',
        confirmPassword: 'NewPass@456',
      };
      const result = changePasswordSchema.safeParse(validData);
      
      expect(result.success).toBe(true);
    });

    it('should reject missing currentPassword', () => {
      const invalidData = {
        newPassword: 'NewPass@456',
        confirmPassword: 'NewPass@456',
      };
      const result = changePasswordSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
    });

    it('should reject missing newPassword', () => {
      const invalidData = {
        currentPassword: 'OldPass@123',
        confirmPassword: 'NewPass@456',
      };
      const result = changePasswordSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
    });

    it('should reject missing confirmPassword', () => {
      const invalidData = {
        currentPassword: 'OldPass@123',
        newPassword: 'NewPass@456',
      };
      const result = changePasswordSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
    });

    it('should reject weak newPassword', () => {
      const invalidData = {
        currentPassword: 'OldPass@123',
        newPassword: 'weak',
        confirmPassword: 'weak',
      };
      const result = changePasswordSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        currentPassword: 'OldPass@123',
        newPassword: 'NewPass@456',
        confirmPassword: 'Different@789',
      };
      const result = changePasswordSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        const confirmError = result.error.issues.find(i => 
          i.message.toLowerCase().includes('match')
        );
        expect(confirmError).toBeDefined();
      }
    });
  });
});
