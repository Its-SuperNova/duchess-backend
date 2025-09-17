// Test setup file
import "jest";

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.RAZORPAY_KEY_ID = "test_key_id";
process.env.RAZORPAY_KEY_SECRET = "test_key_secret";
process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = "test_public_key_id";

// Mock fetch globally
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};
