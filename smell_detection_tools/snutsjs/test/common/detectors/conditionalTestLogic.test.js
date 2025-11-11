import { describe, expect, it } from "vitest";
import detectConditionalTestLogic from "../../../src/common/detectors/conditionalTestLogic";
import astService from "../../../src/services/ast.service";

describe("detectConditionalTestLogic", () => {
  it("should detect conditional test logic when test block is using it", () => {
    const testCode = `
          it("should check age", () =>{
            const value = 10
          if(value > 10){
            expect(value).toEqual(10)
          }
    })
    `;

    const astTestCode = astService.parseCodeToAst(testCode);

    const result = detectConditionalTestLogic(astTestCode);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);

    const expectedSmellLength = 1;
    expect(result).toHaveLength(expectedSmellLength);
  });

  it("should detect conditional test logic when test block is using test", () => {
    const testCode = `
          test("should check age", () =>{
            const value = 10
          if(value > 10){
            expect(value).toEqual(10)
          }
    })
    `;

    const astTestCode = astService.parseCodeToAst(testCode);

    const result = detectConditionalTestLogic(astTestCode);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);

    const expectedSmellLength = 1;
    expect(result).toHaveLength(expectedSmellLength);
  });

  it("should not detect conditional test logic when does not have if statement", () => {
    const testCode = `
          it("should check age", () =>{
            const value = 10
    })
    `;

    const astTestCode = astService.parseCodeToAst(testCode);

    const result = detectConditionalTestLogic(astTestCode);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);

    const expectedSmellLength = 0;
    expect(result).toHaveLength(expectedSmellLength);
  });
});
