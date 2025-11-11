import { describe, expect, it } from "vitest";
import astService from "../../src/services/ast.service";

describe("Ast Service", () => {
  const expectedNumberOfDescribeBlock = 1;
  const expectedNumberOfItBlocks = 2;

  it("should correctly count describe blocks", () => {
    const code = `
      describe('My Test Suite', () => {
        it('should do something', () => {
          expect(true).toBe(true);
        });

        it('should do another thing', () => {
          expect(false).toBe(false);
        });
      });
    `;
    const result = astService.parseCodeToAst(code);
    const describeCount = astService.getDescribeCount(result);
    expect(describeCount).toBe(expectedNumberOfDescribeBlock);
  });

  it("should correctly count it/test blocks", () => {
    const code = `
      describe('My Test Suite', () => {
        it('should do something', () => {
          expect(true).toBe(true);
        });

        test('should do another thing', () => {
          expect(false).toBe(false);
        });
      });
    `;
    const result = astService.parseCodeToAst(code);
    const itCount = astService.getItCount(result);
    expect(itCount).toBe(expectedNumberOfItBlocks);
  });

  it("should parse code to AST", () => {
    const code = `
      test("some test", () => {
        expect(12).toBe(12);
      });

      it("should be a test", () => {
        expect(true).toBeDefined();
      });
    `;
    const result = astService.parseCodeToAst(code);
    expect(result).toBeDefined();
  });

  it("should parse TypeScript code to AST", () => {
    const tsCode = `
      test("some test", () => {
        const userName: string = "John Doe";
        expect(userName).toEqual("John Doe");
      });
    `;
    const result = astService.parseCodeToAst(tsCode);
    expect(result).toBeDefined();
  });

  it("should parse code with imports anywhere", () => {
    const code = `
      const myFunc = require('my-module');
      it('example', () => {
        expect(myFunc()).toBe(true);
      });
    `;
    const ast = astService.parseCodeToAst(code);
    expect(ast).toBeDefined();
  });

  it("should parse code to AST and return the correct test node", () => {
    const code = `
      describe('some test', () => {
        it('should do something', () => {
          expect(true).toBe(true);
        });
      });
    `;
    const testNode = astService.getTestNodeAst(code);
    expect(testNode).toBeDefined();
    expect(testNode.node.callee.name).toBe("it");
  });

  it("should detect an assertion with expect/assert", () => {
    const setupCode = `
      describe("some test", () => {
        it("should check numbers", () => {
          expect(13).toBe(13);
        });
      });
    `;
    const ast = astService.parseCodeToAst(setupCode);
    const result = astService.hasAssertion(ast);
    expect(result).toBeTruthy();
  });
});
