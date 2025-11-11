import { describe, it, expect } from "vitest";
import astService from "../../../src/services/ast.service";
import detectCommentsOnlyTest from "../../../src/common/detectors/commentsOnlyTest";

describe("CommentsOnlyTest", () => {
  it("should detect comments only when the test block has only comments", () => {
    const code = `
    it("Should check age", () =>{
        // Only comment here
        // expect(12).ToEqual(12)
    })
`;

    const ast = astService.parseCodeToAst(code);
    const result = detectCommentsOnlyTest(ast);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(1);
  });

  it("should detect comments only when the test block has a block of comments", () => {
    const code = `
    it("Should check age", () =>{
      /*
        Some comments here
        we should know about this comment
      */
    })`;
    const expectedNumberOfSmells = 1;
    const ast = astService.parseCodeToAst(code);
    const result = detectCommentsOnlyTest(ast);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(expectedNumberOfSmells);
  });

  it("should not detect comments only when the test block has one comment and uncommented code", () => {
    const code = `
    it("Should check age", () =>{
      /*
        Some comments here
        we should know about this comment
      */
     expect(true).toBeTruthy()
    })`;
    const expectedNumberOfSmells = 0;
    const ast = astService.parseCodeToAst(code);
    const result = detectCommentsOnlyTest(ast);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(expectedNumberOfSmells);
  });
});
