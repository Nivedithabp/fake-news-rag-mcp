// Jest setup file
import 'dotenv/config';

// Mock console methods in tests to reduce noise
const originalConsole = global.console;

beforeAll(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
});

afterAll(() => {
  global.console = originalConsole;
});

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-key';
process.env.VECTOR_DB_PROVIDER = 'chroma';
process.env.CHROMA_HOST = 'localhost';
process.env.CHROMA_PORT = '8000';
