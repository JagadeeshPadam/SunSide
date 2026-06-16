/**
 * Ambient global declarations for Jest test runner.
 * This file makes `describe`, `it`, `test`, `expect`, and lifecycle hooks
 * available as globals in TypeScript without requiring @types/jest.
 * It re-exports the types from the `@jest/globals` package that is already
 * installed as a transitive dependency of `jest`.
 */
import type { describe, it, test, expect, beforeAll, beforeEach, afterEach, afterAll } from '@jest/globals';

declare global {
  const describe: typeof import('@jest/globals')['describe'];
  const it: typeof import('@jest/globals')['it'];
  const test: typeof import('@jest/globals')['test'];
  const expect: typeof import('@jest/globals')['expect'];
  const beforeAll: typeof import('@jest/globals')['beforeAll'];
  const beforeEach: typeof import('@jest/globals')['beforeEach'];
  const afterEach: typeof import('@jest/globals')['afterEach'];
  const afterAll: typeof import('@jest/globals')['afterAll'];
}
