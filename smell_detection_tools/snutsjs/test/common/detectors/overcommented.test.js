import { describe, expect, it } from "vitest";
import astService from "../../../src/services/ast.service";
import detectOvercommentedTest from "../../../src/common/detectors/overcommented";

describe("OvercommentedTest", () => {
  it("should not detect overcomment test when has less than 5 comments", () => {
    const code = `
    it('getUserInfo returns user information', () => {
        // Teste para verificar se a função getUserInfo() retorna informações de usuário corretamente
        // Chama a função getUserInfo() para obter as informações do usuário
        const userInfo = getUserInfo();
        // Este teste verifica se todas as propriedades do objeto retornado são idênticas às do objeto esperado
        expect(userInfo).toEqual({
          id: 1, // Verifica se o id é 1
          username: 'john_doe',
          email: 'john@example.com' // Verifica se o email é 'john@example.com'
        });
      });
    `;

    const ast = astService.parseCodeToAst(code);
    const result = detectOvercommentedTest(ast);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(0);
  });

  it("should  detect overcomment test when has more than 5 comments", () => {
    const code = `
    it('getUserInfo returns user information', () => {
        // Teste para verificar se a função getUserInfo() retorna informações de usuário corretamente
        // Chama a função getUserInfo() para obter as informações do usuário
        const userInfo = getUserInfo();
        // Teste sensível à igualdade:
        // Teste a função getUserInfo
        // Este teste verifica se todas as propriedades do objeto retornado são idênticas às do objeto esperado
        expect(userInfo).toEqual({
          id: 1, // Verifica se o id é 1
          username: 'john_doe',
          email: 'john@example.com' // Verifica se o email é 'john@example.com'
        });
      });
    `;
    const expectedNumberOfSmells = 1;

    const ast = astService.parseCodeToAst(code);
    const result = detectOvercommentedTest(ast);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(expectedNumberOfSmells);
  });

  it("should not detect overcomment test when test block has only comments", () => {
    const code = `
    it('getUserInfo returns user information', () => {
     /*
        expect(userInfo).toEqual({
          id: 1,
          username: 'john_doe',
          email: 'john@example.com'
        });
     */
      });
    `;
    const expectedNumberOfSmells = 0;
    const ast = astService.parseCodeToAst(code);
    const result = detectOvercommentedTest(ast);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(expectedNumberOfSmells);
  });
});
