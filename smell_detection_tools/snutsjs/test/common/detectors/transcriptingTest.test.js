import { describe, it, expect } from "vitest";
import astService from "../../../src/services/ast.service";
import detectTranscriptingTest from "../../../src/common/detectors/transcriptingTest";

describe("TranscriptingTest", () => {
  it("should detect transcripting test when the test block has console.log", () => {
    const code = `
    it("Should check age", () =>{
        console.log("transcripting test");
    })
`;

    const expectedNumberOfSmells = 1;

    const ast = astService.parseCodeToAst(code);
    const result = detectTranscriptingTest(ast);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(expectedNumberOfSmells);
  });
  it("should detect transcripting test when the test block has console.warn", () => {
    const code = `
    it("Should check age", () =>{
        console.warn("transcripting test");
    })
`;
    const expectedNumberOfSmells = 1;

    const ast = astService.parseCodeToAst(code);
    const result = detectTranscriptingTest(ast);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(expectedNumberOfSmells);
  });
  it("should detect transcripting test when the test block has console.error", () => {
    const code = `
    it("Should check age", () =>{
        console.error("transcripting test");
    })
`;
    const expectedNumberOfSmells = 1;

    const ast = astService.parseCodeToAst(code);
    const result = detectTranscriptingTest(ast);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(expectedNumberOfSmells);
  });
  it("should detect transcripting test when the test block has console.info", () => {
    const code = `
    it("Should check age", () =>{
        console.info("transcripting test");
    })
`;
    const expectedNumberOfSmells = 1;

    const ast = astService.parseCodeToAst(code);
    const result = detectTranscriptingTest(ast);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(expectedNumberOfSmells);
  });
  it("should not detect transcripting test when the test block does not have some console function", () => {
    const code = `
    it("Should check age", () =>{
      // Check is some
    })
`;
    const expectedNumberOfSmells = 0;
    const ast = astService.parseCodeToAst(code);
    const result = detectTranscriptingTest(ast);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(expectedNumberOfSmells);
  });
  it("should not detect transcripting test when the test block does  have some console function in comment", () => {
    const code = `
    it("Should check age", () =>{
      // console.log("test comment")
    })
`;
    const expectedNumberOfSmells = 0;
    const ast = astService.parseCodeToAst(code);
    const result = detectTranscriptingTest(ast);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(expectedNumberOfSmells);
  });
});
