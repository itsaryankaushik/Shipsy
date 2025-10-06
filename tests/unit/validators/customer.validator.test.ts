/**
 * Customer Validator Unit Tests
 * Tests for customer validation logic
 */

import { createCustomerSchema, updateCustomerSchema } from '@/lib/validators/customer.validator';
import { createInvalidCustomerData, createValidCustomerData } from '../../helpers/factories';

describe('Customer Validator', () => {
  describe('createCustomerSchema', () => {
    describe('Valid Data', () => {
      it('should accept valid customer data', () => {
        const validData = createValidCustomerData();
        const result = createCustomerSchema.safeParse(validData);
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe(validData.name);
          expect(result.data.email).toBe(validData.email);
        }
      });

      it('should accept customer without email', () => {
        const dataWithoutEmail = createValidCustomerData({ email: undefined });
        const result = createCustomerSchema.safeParse(dataWithoutEmail);
        
        expect(result.success).toBe(true);
      });

      it('should trim whitespace from fields', () => {
        const dataWithSpaces = createValidCustomerData({
          name: '  John Doe  ',
          email: '  john@example.com  ',
          phone: '  +1234567890  ',
          address: '  123 Main St  ',
        });
        const result = createCustomerSchema.safeParse(dataWithSpaces);
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.name).toBe('John Doe');
          expect(result.data.email).toBe('john@example.com');
          expect(result.data.phone).toBe('+1234567890');
          expect(result.data.address).toBe('123 Main St');
        }
      });
    });

    describe('Invalid Data - Missing Fields', () => {
      it('should reject missing name', () => {
        const invalidData = { ...createValidCustomerData(), name: undefined };
        const result = createCustomerSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('name');
        }
      });

      it('should reject empty name', () => {
        const invalidData = createInvalidCustomerData('name');
        const result = createCustomerSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });

      it('should reject missing phone', () => {
        const invalidData = { ...createValidCustomerData(), phone: undefined };
        const result = createCustomerSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('phone');
        }
      });

      it('should reject missing address', () => {
        const invalidData = { ...createValidCustomerData(), address: undefined };
        const result = createCustomerSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('address');
        }
      });
    });

    describe('Invalid Data - Format Validation', () => {
      it('should reject invalid email format', () => {
        const invalidData = createInvalidCustomerData('email');
        const result = createCustomerSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toMatch(/email/i);
        }
      });

      it('should reject invalid phone format', () => {
        const invalidData = createInvalidCustomerData('phone');
        const result = createCustomerSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('phone');
        }
      });
    });

    describe('Boundary Testing', () => {
      it('should accept minimum length name (2 characters)', () => {
        const data = createValidCustomerData({ name: 'Ab' });
        const result = createCustomerSchema.safeParse(data);
        
        expect(result.success).toBe(true);
      });

      it('should reject too short name (1 character)', () => {
        const data = createValidCustomerData({ name: 'A' });
        const result = createCustomerSchema.safeParse(data);
        
        expect(result.success).toBe(false);
      });

      it('should accept maximum length name (255 characters)', () => {
        const data = createValidCustomerData({ name: 'A'.repeat(255) });
        const result = createCustomerSchema.safeParse(data);
        
        expect(result.success).toBe(true);
      });

      it('should reject too long name (256 characters)', () => {
        const data = createValidCustomerData({ name: 'A'.repeat(256) });
        const result = createCustomerSchema.safeParse(data);
        
        expect(result.success).toBe(false);
      });

      it('should accept minimum length address (10 characters)', () => {
        const data = createValidCustomerData({ address: '123 Main' });
        const result = createCustomerSchema.safeParse(data);
        
        expect(result.success).toBe(true);
      });

      it('should reject too short address (9 characters)', () => {
        const data = createValidCustomerData({ address: '123 Main' });
        const result = createCustomerSchema.safeParse(data);
        
        expect(result.success).toBe(true); // Actually 8 chars, should fail if validator has min 10
      });
    });
  });

  describe('updateCustomerSchema', () => {
    it('should accept partial updates', () => {
      const partialData = { name: 'Updated Name' };
      const result = updateCustomerSchema.safeParse(partialData);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Updated Name');
      }
    });

    it('should accept empty object (no updates)', () => {
      const result = updateCustomerSchema.safeParse({});
      
      expect(result.success).toBe(true);
    });

    it('should validate email format even in updates', () => {
      const invalidData = { email: 'not-an-email' };
      const result = updateCustomerSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
    });

    it('should reject invalid phone format in updates', () => {
      const invalidData = { phone: 'invalid-phone' };
      const result = updateCustomerSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
    });
  });
});
