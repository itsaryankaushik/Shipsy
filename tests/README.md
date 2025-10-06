# 🧪 Test Suite Documentation

## 📁 Test Structure

```
tests/
├── setup.ts                    # Jest configuration and global mocks
├── helpers/                    # Test utilities and helpers
│   ├── factories.ts            # Mock data factories
│   ├── mocks.ts                # Mock functions and objects
│   └── testUtils.tsx           # React Testing Library helpers
├── unit/                       # Unit tests (isolated components/functions)
│   ├── validators/             # Validation logic tests
│   ├── utils/                  # Utility function tests
│   ├── components/             # React component tests
│   └── hooks/                  # Custom hooks tests
├── integration/                # Integration tests (multiple units)
│   ├── api/                    # API endpoint tests
│   ├── customers/              # Customer CRUD operations
│   └── shipments/              # Shipment CRUD operations
└── e2e/                        # End-to-end tests (full flows)
    ├── auth.test.ts            # Authentication flows
    ├── customer-flow.test.ts   # Complete customer workflows
    └── shipment-flow.test.ts   # Complete shipment workflows
```

---

## 🚀 Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm test -- unit                  # Unit tests only
npm test -- integration           # Integration tests only
npm test -- e2e                   # E2E tests only
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Specific Test File
```bash
npm test -- validators.test.ts
```

---

## 📊 Test Coverage Goals

| Category | Target |
|----------|--------|
| Branches | 70% |
| Functions | 70% |
| Lines | 70% |
| Statements | 70% |

---

## 🎯 Test Categories

### 1. **Unit Tests** (`tests/unit/`)
Tests individual functions, components, and hooks in isolation.

**Examples:**
- ✅ Validation schema tests (invalid fields, missing data)
- ✅ Utility function tests (formatters, auth helpers)
- ✅ Component rendering tests
- ✅ Hook behavior tests

### 2. **Integration Tests** (`tests/integration/`)
Tests multiple units working together, including API endpoints.

**Examples:**
- ✅ API route handlers with database operations
- ✅ Form submission with validation
- ✅ Component interaction tests
- ✅ Service layer tests

### 3. **End-to-End Tests** (`tests/e2e/`)
Tests complete user workflows from start to finish.

**Examples:**
- ✅ Complete authentication flow
- ✅ Full CRUD operations (create → read → update → delete)
- ✅ Multi-step user journeys
- ✅ Security scenarios

---

## 🔒 Security Testing

Tests in `tests/integration/api/security.test.ts`:

- ✅ Unauthorized access attempts
- ✅ Missing authentication tokens
- ✅ Invalid JWT tokens
- ✅ Expired tokens
- ✅ Cross-user data access prevention
- ✅ SQL injection prevention
- ✅ XSS attack prevention

---

## ✅ Validation Testing

Tests in `tests/unit/validators/`:

- ✅ Invalid field types
- ✅ Missing required fields
- ✅ Incorrect enum values
- ✅ Email format validation
- ✅ Phone number validation
- ✅ Password strength validation
- ✅ Cost/decimal validation

---

## 📏 Boundary Testing

Tests in `tests/unit/validators/` and `tests/integration/`:

- ✅ Pagination limits (min/max)
- ✅ String length limits
- ✅ Decimal precision limits
- ✅ Date range validation
- ✅ Calculated field edge cases
- ✅ Large dataset handling

---

## 🛠️ Test Helpers

### Mock Data Factories (`tests/helpers/factories.ts`)
```typescript
import { createMockUser, createMockCustomer, createMockShipment } from './helpers/factories';

const user = createMockUser({ email: 'test@example.com' });
const customer = createMockCustomer({ name: 'John Doe' });
const shipment = createMockShipment({ type: 'LOCAL' });
```

### Custom Render (`tests/helpers/testUtils.tsx`)
```typescript
import { renderWithProviders } from './helpers/testUtils';

const { getByText } = renderWithProviders(<MyComponent />);
```

---

## 📝 Writing Tests

### Unit Test Example
```typescript
describe('validateEmail', () => {
  it('should validate correct email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('should reject invalid email', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });
});
```

### Integration Test Example
```typescript
describe('POST /api/customers', () => {
  it('should create customer with valid data', async () => {
    const response = await request(app)
      .post('/api/customers')
      .send(validCustomerData);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

### E2E Test Example
```typescript
describe('Customer CRUD Flow', () => {
  it('should complete full customer lifecycle', async () => {
    // Create
    const customer = await createCustomer(customerData);
    expect(customer.id).toBeDefined();
    
    // Read
    const fetched = await getCustomer(customer.id);
    expect(fetched.name).toBe(customerData.name);
    
    // Update
    const updated = await updateCustomer(customer.id, { name: 'New Name' });
    expect(updated.name).toBe('New Name');
    
    // Delete
    await deleteCustomer(customer.id);
    const deleted = await getCustomer(customer.id);
    expect(deleted).toBeNull();
  });
});
```

---

## 🐛 Debugging Tests

### Run Single Test with Debugging
```bash
npm test -- --testNamePattern="should validate email" --verbose
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

---

## 📚 Best Practices

1. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should do something', () => {
     // Arrange: Setup test data
     const data = { name: 'Test' };
     
     // Act: Perform action
     const result = someFunction(data);
     
     // Assert: Verify result
     expect(result).toBe(expected);
   });
   ```

2. **Use Descriptive Test Names**
   ```typescript
   ✅ it('should return 400 when email is invalid')
   ❌ it('email test')
   ```

3. **Test One Thing Per Test**
   ```typescript
   ✅ Separate tests for success and error cases
   ❌ One big test that checks everything
   ```

4. **Mock External Dependencies**
   ```typescript
   jest.mock('@/lib/db');
   jest.mock('next/navigation');
   ```

5. **Clean Up After Tests**
   ```typescript
   afterEach(() => {
     jest.clearAllMocks();
   });
   ```

---

## 🔄 CI/CD Integration

Add to `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

For GitHub Actions (`.github/workflows/test.yml`):
```yaml
- name: Run Tests
  run: npm run test:ci
```

---

## 📊 Coverage Reports

After running `npm test -- --coverage`:

- **HTML Report:** `coverage/lcov-report/index.html`
- **Terminal Summary:** Shows immediately after tests
- **Coverage Files:** `coverage/` directory

---

## ❓ Troubleshooting

### Issue: "Cannot find module '@/...'"
**Solution:** Check `jest.config.js` moduleNameMapper paths

### Issue: "ReferenceError: fetch is not defined"
**Solution:** fetch is mocked in `setup.ts`, ensure it's imported

### Issue: "Cannot use import statement outside a module"
**Solution:** Ensure `ts-jest` is configured in `jest.config.js`

### Issue: "Timer mocks not working"
**Solution:** Use `jest.useFakeTimers()` before test

---

**Last Updated:** October 6, 2025
