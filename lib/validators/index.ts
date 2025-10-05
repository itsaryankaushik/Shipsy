// Central validator index
// Re-export all zod schemas and inferred types so the app can import from a single path
export * from './auth.validator';
export * from './customer.validator';
export * from './shipment.validator';

// Default export helpful for browser usage
import * as auth from './auth.validator';
import * as customer from './customer.validator';
import * as shipment from './shipment.validator';

const validators = {
  auth,
  customer,
  shipment,
};

export default validators;
