import { describe, expect, it } from "vitest";
import astService from "../../../src/services/ast.service";
import detectTestWithoutDescription from "../../../src/common/detectors/testWithoutDescription";
describe("TestWithoutDescriptions", () => {
  it("should detect when a test case has no description", () => {
    const code = `it("", function () {
      const str = 11;
      expect(str.toString()).toEqual("example");
    });
    `;
    const expectedNumberOfSmells = 1;

    const ast = astService.parseCodeToAst(code);
    const result = detectTestWithoutDescription(ast);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(expectedNumberOfSmells);
  });

  it("should not detect when a test case has description", () => {
    const code = `it("some test", function () {
      const str = 11;
      expect(str.toString()).toEqual("example");
    });
    `;
    const expectedNumberOfSmells = 0;

    const ast = astService.parseCodeToAst(code);
    const result = detectTestWithoutDescription(ast);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(expectedNumberOfSmells);
  });
});
