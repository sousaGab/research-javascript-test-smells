import {test, expect, jest} from '@jest/globals';
import { resolve } from 'path';
import {parseSuites}  from '../src/files';

jest.mock('glob');
jest.mock('fs');

test("test_parse_suites_happy_path", () => {
  // arranje
  const glob = require('glob');
  const fs = require('fs');
  glob.sync.mockReturnValue(['./test/file1.js', './test/file2.js']);
  fs.readFileSync.mockReturnValue('describe("test suite", () => { it("test case", () => {}) });');

  // act
  const result = parseSuites('./test/**/*.js');

  // assert
  expect(result.isRight()).toBe(true);
  expect(result.value).toHaveLength(2);
  if (Array.isArray(result.value)) {
    const item = Array.from(result.value);
    expect(item[0].path).toBe(resolve('./test/file1.js'));
    expect(item[0].code).toBe('describe("test suite", () => { it("test case", () => {}) });');
    expect(item[1].path).toBe(resolve('./test/file2.js'));
    expect(item[1].code).toBe('describe("test suite", () => { it("test case", () => {}) });');
  }
  expect(glob.sync).toHaveBeenCalledWith('./test/**/*.js', { ignore: '**/node_modules/**' });
  expect(glob.sync).toHaveBeenCalledTimes(1);
  expect(fs.readFileSync).toHaveBeenCalledTimes(2);
});