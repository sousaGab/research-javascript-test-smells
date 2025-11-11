import { describe, expect, it } from "vitest";
import astService from "../../../src/services/ast.service";
import detectGeneralFixture from "../../../src/common/detectors/generalFixture";

describe("GeneralFixture", () => {
  it("should detect general fixture when some variable are unused", () => {
    const code = `
    describe("test", () => {
      let user;
      let admin;
      let guest;

beforeEach(() => {
  user = new User("Alice", 30);
  admin = new Admin("Bob", 40);
  guest = new Guest("Charlie", 25);
});

test("user should have a name", () => {
  expect(user.name).toBe("Alice");
});

test("admin should have an age", () => {
  expect(admin.age).toBe(40);
});
})
`;
    const expectedNumberOfSmells = 1;
    const ast = astService.parseCodeToAst(code);
    const result = detectGeneralFixture(ast);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(expectedNumberOfSmells);
  });
  it("should not detect general fixture when some setup variable are block scoped", () => {
    const code = `
    describe("test", () => {
beforeEach(() => {
  const user = new User("Alice", 30);
  const admin = new Admin("Bob", 40);
  const guest = new Guest("Charlie", 25);
});

test("user should have a name", () => {
  expect(user.name).toBe("Alice");
});

test("admin should have an age", () => {
  expect(admin.age).toBe(40);
});
})
`;
    const expectedNumberOfSmells = 0;
    const ast = astService.parseCodeToAst(code);
    const result = detectGeneralFixture(ast);
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(expectedNumberOfSmells);
  });
});
