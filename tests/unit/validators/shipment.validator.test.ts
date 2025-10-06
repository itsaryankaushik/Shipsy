/**
 * Shipment Validator Unit Tests
 * Tests for shipment validation logic including enums and decimals
 */

import { createShipmentSchema, updateShipmentSchema } from '@/lib/validators/shipment.validator';
import { createValidShipmentData, createInvalidShipmentData, createBoundaryTestData } from '../../helpers/factories';

describe('Shipment Validator', () => {
  describe('createShipmentSchema', () => {
    describe('Valid Data', () => {
      it('should accept valid shipment data', () => {
        const validData = createValidShipmentData();
        const result = createShipmentSchema.safeParse(validData);
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.type).toBe(validData.type);
          expect(result.data.mode).toBe(validData.mode);
          expect(result.data.customerId).toBe(validData.customerId);
        }
      });

      it('should accept all valid shipment types', () => {
        const types = ['LOCAL', 'NATIONAL', 'INTERNATIONAL'] as const;
        
        types.forEach(type => {
          const data = createValidShipmentData({ type });
          const result = createShipmentSchema.safeParse(data);
          
          expect(result.success).toBe(true);
        });
      });

      it('should accept all valid shipment modes', () => {
        const modes = ['AIR', 'WATER', 'LAND'] as const;
        
        modes.forEach(mode => {
          const data = createValidShipmentData({ mode });
          const result = createShipmentSchema.safeParse(data);
          
          expect(result.success).toBe(true);
        });
      });

      it('should convert lowercase enum values to uppercase', () => {
        const data = createValidShipmentData({ 
          type: 'local' as any,
          mode: 'air' as any
        });
        const result = createShipmentSchema.safeParse(data);
        
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.type).toBe('LOCAL');
          expect(result.data.mode).toBe('AIR');
        }
      });

      it('should accept numeric cost values', () => {
        const data = createValidShipmentData({ 
          cost: 1500 as any,
          calculatedTotal: 1650 as any
        });
        const result = createShipmentSchema.safeParse(data);
        
        expect(result.success).toBe(true);
      });

      it('should accept string cost values', () => {
        const data = createValidShipmentData({ 
          cost: '1500.00',
          calculatedTotal: '1650.00'
        });
        const result = createShipmentSchema.safeParse(data);
        
        expect(result.success).toBe(true);
      });

      it('should accept date-only delivery date (YYYY-MM-DD)', () => {
        const data = createValidShipmentData({ deliveryDate: '2025-12-31' });
        const result = createShipmentSchema.safeParse(data);
        
        expect(result.success).toBe(true);
      });

      it('should accept null delivery date', () => {
        const data = createValidShipmentData({ deliveryDate: null as any });
        const result = createShipmentSchema.safeParse(data);
        
        expect(result.success).toBe(true);
      });
    });

    describe('Invalid Data - Missing Fields', () => {
      it('should reject missing customerId', () => {
        const invalidData = { ...createValidShipmentData(), customerId: undefined };
        const result = createShipmentSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('customerId');
        }
      });

      it('should reject missing type', () => {
        const invalidData = { ...createValidShipmentData(), type: undefined };
        const result = createShipmentSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });

      it('should reject missing mode', () => {
        const invalidData = { ...createValidShipmentData(), mode: undefined };
        const result = createShipmentSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });

      it('should reject missing startLocation', () => {
        const invalidData = { ...createValidShipmentData(), startLocation: undefined };
        const result = createShipmentSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });

      it('should reject missing endLocation', () => {
        const invalidData = { ...createValidShipmentData(), endLocation: undefined };
        const result = createShipmentSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });

      it('should reject missing cost', () => {
        const invalidData = { ...createValidShipmentData(), cost: undefined };
        const result = createShipmentSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });
    });

    describe('Invalid Data - Incorrect Enum Values', () => {
      it('should reject invalid shipment type', () => {
        const invalidData = createInvalidShipmentData('type');
        const result = createShipmentSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toMatch(/type/i);
        }
      });

      it('should reject invalid shipment mode', () => {
        const invalidData = createInvalidShipmentData('mode');
        const result = createShipmentSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toMatch(/mode/i);
        }
      });

      it('should reject numeric type value', () => {
        const invalidData = createValidShipmentData({ type: 123 as any });
        const result = createShipmentSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });

      it('should reject empty string for type', () => {
        const invalidData = createValidShipmentData({ type: '' as any });
        const result = createShipmentSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });
    });

    describe('Invalid Data - Cost Validation', () => {
      it('should reject non-numeric cost', () => {
        const invalidData = createInvalidShipmentData('cost');
        const result = createShipmentSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });

      it('should reject negative cost', () => {
        const invalidData = createValidShipmentData({ cost: '-100.00' });
        const result = createShipmentSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });

      it('should reject cost with more than 2 decimal places', () => {
        const invalidData = createValidShipmentData({ cost: '100.999' });
        const result = createShipmentSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });

      it('should accept cost with 0 value', () => {
        const data = createValidShipmentData({ cost: '0.00' });
        const result = createShipmentSchema.safeParse(data);
        
        expect(result.success).toBe(true);
      });

      it('should accept cost with 1 decimal place', () => {
        const data = createValidShipmentData({ cost: '100.5' });
        const result = createShipmentSchema.safeParse(data);
        
        expect(result.success).toBe(true);
      });
    });

    describe('Boundary Testing - String Lengths', () => {
      it('should accept minimum length startLocation (2 characters)', () => {
        const data = createValidShipmentData({ startLocation: 'NY' });
        const result = createShipmentSchema.safeParse(data);
        
        expect(result.success).toBe(true);
      });

      it('should reject too short startLocation (1 character)', () => {
        const data = createValidShipmentData({ startLocation: 'N' });
        const result = createShipmentSchema.safeParse(data);
        
        expect(result.success).toBe(false);
      });

      it('should accept maximum length location (500 characters)', () => {
        const longLocation = 'A'.repeat(500);
        const data = createValidShipmentData({ 
          startLocation: longLocation,
          endLocation: longLocation
        });
        const result = createShipmentSchema.safeParse(data);
        
        expect(result.success).toBe(true);
      });

      it('should reject too long location (501 characters)', () => {
        const tooLongLocation = 'A'.repeat(501);
        const data = createValidShipmentData({ startLocation: tooLongLocation });
        const result = createShipmentSchema.safeParse(data);
        
        expect(result.success).toBe(false);
      });
    });

    describe('Boundary Testing - Decimal Values', () => {
      const boundaries = createBoundaryTestData().decimals;

      it('should accept zero cost', () => {
        const data = createValidShipmentData({ cost: boundaries.zero });
        const result = createShipmentSchema.safeParse(data);
        
        expect(result.success).toBe(true);
      });

      it('should accept minimum cost', () => {
        const data = createValidShipmentData({ cost: boundaries.min });
        const result = createShipmentSchema.safeParse(data);
        
        expect(result.success).toBe(true);
      });

      it('should accept maximum cost', () => {
        const data = createValidShipmentData({ cost: boundaries.max });
        const result = createShipmentSchema.safeParse(data);
        
        expect(result.success).toBe(true);
      });

      it('should accept proper decimal precision', () => {
        const data = createValidShipmentData({ cost: boundaries.precision });
        const result = createShipmentSchema.safeParse(data);
        
        expect(result.success).toBe(true);
      });
    });

    describe('Date Validation', () => {
      it('should accept ISO datetime string', () => {
        const data = createValidShipmentData({ 
          deliveryDate: '2025-12-31T23:59:59.000Z' 
        });
        const result = createShipmentSchema.safeParse(data);
        
        expect(result.success).toBe(true);
      });

      it('should reject invalid date format', () => {
        const invalidData = createInvalidShipmentData('deliveryDate');
        const result = createShipmentSchema.safeParse(invalidData);
        
        expect(result.success).toBe(false);
      });

      it('should accept empty string for deliveryDate', () => {
        const data = createValidShipmentData({ deliveryDate: '' as any });
        const result = createShipmentSchema.safeParse(data);
        
        expect(result.success).toBe(true);
      });
    });

    describe('Calculated Fields', () => {
      it('should accept calculatedTotal >= cost', () => {
        const data = createValidShipmentData({ 
          cost: '100.00',
          calculatedTotal: '110.00'
        });
        const result = createShipmentSchema.safeParse(data);
        
        expect(result.success).toBe(true);
      });

      it('should accept calculatedTotal === cost (0% tax)', () => {
        const data = createValidShipmentData({ 
          cost: '100.00',
          calculatedTotal: '100.00'
        });
        const result = createShipmentSchema.safeParse(data);
        
        expect(result.success).toBe(true);
      });
    });
  });

  describe('updateShipmentSchema', () => {
    it('should accept partial updates', () => {
      const partialData = { type: 'NATIONAL' };
      const result = updateShipmentSchema.safeParse(partialData);
      
      expect(result.success).toBe(true);
    });

    it('should accept empty object (no updates)', () => {
      const result = updateShipmentSchema.safeParse({});
      
      expect(result.success).toBe(true);
    });

    it('should validate enum values in updates', () => {
      const invalidData = { type: 'INVALID_TYPE' };
      const result = updateShipmentSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
    });

    it('should accept isDelivered boolean in updates', () => {
      const data = { isDelivered: true };
      const result = updateShipmentSchema.safeParse(data);
      
      expect(result.success).toBe(true);
    });

    it('should reject non-boolean isDelivered', () => {
      const invalidData = { isDelivered: 'true' as any };
      const result = updateShipmentSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
    });
  });
});
