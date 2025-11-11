import traverse, { NodePath } from "@babel/traverse";
import {
  isMemberExpression, isIdentifier, isStringLiteral,
  isArrowFunctionExpression, isFunctionExpression,
  isAssignmentExpression, isThisExpression,
  isFunctionDeclaration, isClassDeclaration,
  isBooleanLiteral, isNumericLiteral, isCallExpression,
  AssignmentExpression, ClassMethod, ExportNamedDeclaration, ExportSpecifier,
  File, CallExpression, MemberExpression, Expression, Identifier, ExpressionStatement, StringLiteral
} from "@babel/types";

const assertMethods = [
  "deepEqual", "deepStrictEqual", "doesNotThrow",
  "equal", "ifError", "notDeepEqual", "notDeepStrictEqual",
  "notEqual", "notStrictEqual", "ok", "strictEqual"
];

const chaiBddMethods = [
  "a", "include", "ok", "true", "false", "null", "undefined", "NaN",
  "exist", "empty", "arguments", "equal", "eql", "above", "least", "gte",
  "below", "lt", "lessThan", "most", "within", "instanceOf", "property",
  "ownPropertyDescriptor", "lengthOf", "match", "string", "keys", "throw",
  "respondTo", "satisfy", "closeTo", "members", "oneOf", "change", "increase",
  "decrease", "by", "extensible", "sealed", "frozen", "finite",
  "fail"
];

const chaiAssertMethods = [
  "assert", "isOk", "isNotOk", "equal", "notEqual", "strictEqual",
  "notStrictEqual", "deepEqual", "notDeepEqual", "isAbove",
  "isAtLeast", "isBelow", "isBelow", "isTrue", "isNotTrue", "isFalse",
  "isNotFalse", "isNull", "isNotNull", "isNaN", "isNotNaN", "exists",
  "notExists", "isUndefined", "isDefined", "isFunction", "isNotFunction",
  "isObject", "isNotObject", "isArray", "isNotArray", "isString", "isNotString",
  "isNumber", "isNotNumber", "isFinite", "isBoolean", "isNotBoolean",
  "typeOf", "notTypeOf", "instanceOf", "notInstanceOf", "include",
  "notInclude", "deepInclude", "notDeepInclude", "nestedInclude",
  "notNestedInclude", "deepNestedInclude", "notDeepNestedInclude",
  "ownInclude", "notOwnInclude", "deepOwnInclude", "notDeepOwnInclude",
  "match", "notMatch", "property", "notProperty", "propertyVal",
  "notPropertyVal", "deepPropertyVal", "notDeepPropertyVal",
  "nestedProperty", "notNestedProperty", "nestedPropertyVal",
  "notNestedPropertyVal", "deepNestedPropertyVal", "notDeepNestedPropertyVal",
  "lengthOf", "hasAnyKeys", "hasAllKeys", "containsAllKeys",
  "doesNotHaveAnyKeys", "doesNotHaveAllKeys", "hasAnyDeepKeys",
  "hasAllDeepKeys", "containsAllDeepKeys", "doesNotHaveAnyDeepKeys",
  "doesNotHaveAllDeepKeys", "throws", "doesNotThrow", "operator",
  "closeTo", "approximately", "sameMembers", "notSameMembers",
  "sameDeepMembers", "notSameDeepMembers", "sameOrderedMembers",
  "notSameOrderedMembers", "sameDeepOrderedMembers",
  "notSameDeepOrderedMembers", "includeMembers", "notIncludeMembers",
  "includeDeepMembers", "notIncludeDeepMembers", "includeOrderedMembers",
  "notIncludeOrderedMembers", "includeDeepOrderedMembers",
  "notIncludeDeepOrderedMembers", "oneOf", "changes", "changesBy",
  "doesNotChange", "changesButNotBy", "increases", "increasesBy",
  "doesNotIncrease", "increasesButNotBy", "decreases", "decreasesBy",
  "doesNotDecrease", "doesNotDecreaseBy", "decreasesButNotBy",
  "ifError", "isExtensible", "isNotExtensible", "isSealed",
  "isNotSealed", "isFrozen", "isNotFrozen", "isEmpty", "isNotEmpty"
];

const chaiHttpMethods = [
  "status", "header", "headers", "ip", "json", "html", "redirect",
  "redirectTo", "param", "cookie"
];

const jestMethods = [
  "toBe", "toEqual", "toBeFalsy", "toBeNull", "toBeTruthy", "toBeUndefined",
  "toBeDefined", "toBeInstanceOf", "toMatchObject", "toHaveProperty",
  "toContain", "toContainEqual", "toHaveLength", "toBeCloseTo",
  "toBeGreaterThan", "toBeGreaterThanOrEqual", "toBeLessThan",
  "toBeLessThanOrEqual", "toMatch", "toStrictEqual",
  "toHaveBeenCalled", "toHaveBeenCalledWith",
  "toBeCalledTimes", "nthCalledWith", "toThrow", "toThrowErrorMatchingSnapshot",
  "toThrowErrorMatchingInlineSnapshot", "toHaveReturned", "toHaveReturnedTimes",
  "toHaveReturnedWith", "toHaveLastReturnedWith", "toHaveNthReturnedWith",
  "toBeNaN", "toMatchSnapshot", "toMatchInlineSnapshot"
];

export function isFunctionOrArrow(node: any): boolean {
  return isArrowFunctionExpression(node)
    || isFunctionExpression(node);
};

function extract(node: Expression): string | undefined {
  if (isMemberExpression(node)) {
    return extract(node.object) + '.' + (node.property as Identifier).name
  } else if (isCallExpression(node)) {
    return extract(node.callee as Identifier)
  }
  else if (isIdentifier(node)) {
    return node.name
  }
}

export function isModuleExports(node: ExpressionStatement): boolean {
  return isAssignmentExpression(node.expression)
    && isMemberExpression(node.expression.left)
    && isIdentifier(node.expression.left.object)
    && node.expression.left.object.name === "module"
    && isIdentifier(node.expression.left.property)
    && node.expression.left.property.name === "exports";
}

export function isAssertion(node: CallExpression): boolean {
  // if (isMemberExpression(node.callee) ) {//&& isMemberExpression(node.callee.object)) {
  //   console.log(extract(node.callee));
  // }
  return (isIdentifier(node.callee) && node.callee.name === "assert")
    || (isMemberExpression(node.callee)
      && isIdentifier(node.callee.object)
      && isIdentifier(node.callee.property)
      && node.callee.object.name === "assert"
      && assertMethods.includes(node.callee.property.name));
}

export function isChaiAssert(node: CallExpression): boolean {
  return (isMemberExpression(node.callee)
    && isIdentifier(node.callee.object)
    && isIdentifier(node.callee.property)
    && node.callee.object.name === "assert"
    && chaiAssertMethods.includes(node.callee.property.name)) ||
    (isIdentifier(node.callee) && node.callee.name === "assert");
}

export function isChaiBdd(node: CallExpression): boolean {
  return isIdentifier(node.callee) && node.callee.name === "expect";

  // return isMemberExpression(node.callee)
  //   && isIdentifier(node.callee.property)
  //   && chaiBddMethods.includes(node.callee.property.name);
}

export function isChaiShould(node: MemberExpression): boolean {
  return (node.property.type === "Identifier" && node.property.name === "should") ||
    (node.object.type === "Identifier" && node.object.name === "should");
}

export function isChaiHttp(node: CallExpression): boolean {
  return isMemberExpression(node.callee)
    && isIdentifier(node.callee.property)
    && chaiHttpMethods.includes(node.callee.property.name);
}
export function isJest(node: CallExpression): boolean {
  return isMemberExpression(node.callee)
    && isIdentifier(node.callee.property)
    && jestMethods.includes(node.callee.property.name);
}

export function isJestNoNumericArgs(node: CallExpression): boolean {
  const ignoredMethods = ["toBeCalledTimes", "nthCalledWith"]
  const allowedMethods = jestMethods.filter(item => !ignoredMethods.includes(item));
  return isMemberExpression(node.callee)
    && isIdentifier(node.callee.property)
    && allowedMethods.includes(node.callee.property.name);
}
export function isTestCase(node: CallExpression): boolean {
  const testCaseCallee = ["it", "test", "specify"];
  // const testCaseCallee = ["it", "test"];
  return isIdentifier(node.callee)
    && testCaseCallee.includes(node.callee.name)
    && isStringLiteral(node.arguments[0])
    // && isFunction(node.arguments[1]);
    && node.arguments.some(isFunctionOrArrow);
}

export function isTestCaseIgnored(node: CallExpression): boolean {
  return isMemberExpression(node.callee)
    && isIdentifier(node.callee.object)
    && isIdentifier(node.callee.property)
    && ["test", "it"].includes(node.callee.object.name)
    && node.callee.property.name === "skip";
}
export function isThisExpressionIgnored(node: CallExpression): boolean {
  return isMemberExpression(node.callee)
    && isThisExpression(node.callee.object)
    && isIdentifier(node.callee.property)
    && node.callee.property.name === "skip";
}
export function isDescribeIgnored(node: CallExpression): boolean {
  return isMemberExpression(node.callee)
    && isIdentifier(node.callee.object)
    && isIdentifier(node.callee.property)
    && ["describe", "suite"].includes(node.callee.object.name)
    && node.callee.property.name === "skip";
}

export function isSleepy(node: CallExpression): boolean {
  return isIdentifier(node.callee)
    && node.callee.name === "setTimeout";
}

export function isConsole(node: MemberExpression): boolean {
  return isIdentifier(node.property)
    && isIdentifier(node.object)
    && node.object.name === "console";
}

export function isLiteralTypes(node: CallExpression): boolean {
  return isBooleanLiteral(node) || isNumericLiteral(node)
    || isStringLiteral(node);
}

export function isRedundantArguments(first: any, second: any): boolean {
  return first.type === second.type && first.value === second.value;
}

export function getNumberOfTestMethods(ast: File): number {
  let result: number = 0;
  traverse(ast, {
    CallExpression: (path: any) => {
      if (isTestCase(path.node)) {
        result = result + 1;
      }
    }
  });
  return result;
}

export function isTestSuite(ast: File) {
  let result = false;
  traverse(ast, {
    enter(path) {
      if (isIdentifier(path.node, { name: "describe" }) ||
        isIdentifier(path.node, { name: "it" })) {
        result = true;
      }
    }
  });
  return result;
}

export function getImports(ast: File) {
  let importArray: string[] = [];
  const regex = /^[\.]{0,2}\/(.(?!.*\.json|package))+/;
  traverse(ast, {
    VariableDeclarator(path) {
      if (isCallExpression(path.node.init) &&
        isIdentifier(path.node.init.callee, { name: "require" }) &&
        (path.node.init.arguments[0] as StringLiteral).value?.match(regex)) {
        const relativePath = (path.node.init.arguments[0] as StringLiteral).value;
        importArray.push(relativePath);
      }
    },
    ImportDeclaration(path) {
      if (path.node.source.value.match(regex)) {
        const relativePath = path.node.source.value;
        importArray.push(relativePath);
      }
    },
  });

  return importArray;
}

export function getProductionMethods(productionAst: File): any[] {
  const productionMethods: String[] = []
  traverse(productionAst, {
    ExportNamedDeclaration: (path: NodePath<ExportNamedDeclaration>) => {
      if (isFunctionDeclaration(path.node.declaration) &&
        path.node.declaration?.id?.name) {
        productionMethods.push(path.node.declaration?.id?.name);
      } else if (isClassDeclaration(path.node.declaration)) {
        path.traverse({
          ClassMethod: (path: NodePath<ClassMethod>) => {
            productionMethods.push((path.node.key as Identifier).name);
          }
        });
      } else if (path.node.specifiers) {
        path.traverse({
          ExportSpecifier: (path: NodePath<ExportSpecifier>) => {
            productionMethods.push((path.node.exported as Identifier).name);
          }
        })
      }
    },
    AssignmentExpression: (path: NodePath<AssignmentExpression>) => {
      if (isMemberExpression(path.node.left) &&
        isIdentifier(path.node.left.object) &&
        (path.node.left.object.name === 'module') &&
        isIdentifier(path.node.left.property) &&
        (path.node.left.property.name === 'exports')) {
        if (isIdentifier(path.node.right)) {
          productionMethods.push(path.node.right.name);
        }
        else if (isFunctionExpression(path.node.right) &&
          path.node.right.id?.name) {
          productionMethods.push(path.node.right.id.name)
        }
      }
      // if (isModuleExports(path.node)) {
      //   if (path.node.expression. .expression.right.name) {
      //     productionMethods.push(path.node.expression.right.name);
      //   } else if (isFunctionExpression(path.node.expression.right)) {
      //     productionMethods.push(path.node.expression.right.id.name);
      //   } else if (isObjectExpression(path.node.expression.right)) {
      //     path.node.expression.right.properties.forEach((property: any) => {
      //       productionMethods.push(property.value.name);
      //     });
      //   }
      // }
    }
  });
  return productionMethods;
}
