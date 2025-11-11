import detectAnonymousTest from "../../../src/common/detectors/anonymousTest";
import { expect, it, describe } from "vitest";
import astService from "../../../src/services/ast.service";

describe("AnonymousTest", () => {
  it("should detect anonymous test with it block", () => {
    const code = `
            it("some test", () =>{
                expect(10).toBe(10)
            })
        `;
    const ast = astService.parseCodeToAst(code);
    const result = detectAnonymousTest(ast);
    const expectedNumberOfSmells = 1;
    expect(result).toBeDefined();
    expect(result).toHaveLength(expectedNumberOfSmells);
  });

  it("should detect anonymous test with test block", () => {
    const code = `
    test("some test", () =>{
        expect(10).toBe(10)
    })
`;
    const ast = astService.parseCodeToAst(code);
    const result = detectAnonymousTest(ast);
    const expectedNumberOfSmells = 1;
    expect(result).toBeDefined();
    expect(result).toHaveLength(expectedNumberOfSmells);
  });
  it("should detect many anonymous test ", () => {
    const code = `
    test("some test", () =>{
        expect(10).toBe(10)
    })
    it("sum",() =>{
        expect(10).toBe(10)
    })
`;
    const ast = astService.parseCodeToAst(code);
    const result = detectAnonymousTest(ast);
    expect(result).toBeDefined();
    expect(result).toHaveLength(2);
  });
  it("should return an array of detected anonymous test", () => {
    const code = `
    test("some test", () =>{
        expect(10).toBe(10)
    })
    it("sum",() =>{
        expect(10).toBe(10)
    })
`;
    const ast = astService.parseCodeToAst(code);
    const result = detectAnonymousTest(ast);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
  });

  it("should return an empty array when does not have any description with less than 2 words", () => {
    const code = `
    test("some test done", () =>{
        expect(10).toBe(10)
    })
    it("sum test stuff",() =>{
        expect(10).toBe(10)
    })
`;
    const expectedNumberOfSmells = 0;
    const ast = astService.parseCodeToAst(code);
    const result = detectAnonymousTest(ast);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(expectedNumberOfSmells);
  });
});
