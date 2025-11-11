import traverse from "@babel/traverse";
const traverseDefault =
  typeof traverse === "function" ? traverse : traverse.default;
import * as t from "@babel/types";

const isExpectNotBeAssertion = ({ callee }) =>
  callee?.object?.object?.callee?.name === "expect" &&
  callee?.object?.property?.name === "not";

const isExpectToBeAssertion = ({ callee }) =>
  callee?.object?.callee?.name === "expect" &&
  callee?.property?.name === "toBe";

const isUndefinedLike = (node) => {
  const containArgs = node.arguments.length === 1;
  if (containArgs) {
    const isUsingVoid =
      node.arguments[0].type === "UnaryExpression" &&
      node.arguments?.[0]?.operator === "void";
    const isArgumentUndefined = /(undefined|null)+/.test(
      node.arguments?.[0]?.name || ""
    );
    const isNullLiteral = node?.arguments[0]?.type === "NullLiteral";
    return isUsingVoid || isArgumentUndefined || isNullLiteral;
  }
  return false;
};

const isUsingDotLength = ({ callee }) =>
  callee.object.arguments.length === 1 &&
  callee.object.arguments[0]?.property?.name === "length";

const isArgBinaryExpression = (node) =>
  node.arguments.length === 1 && t.isBinaryExpression(node.arguments[0]);

const detectSubOptimalAssert = (ast) => {
  let results = [];
  traverseDefault(ast, {
    CallExpression: ({ node }) => {
      if (
        t.isMemberExpression(node.callee) &&
        /CallExpression|MemberExpression/.test(node.callee.object.type) &&
        t.isIdentifier(node.callee.property)
      ) {
        if (isExpectToBeAssertion(node)) {
          const isUndefined = isUndefinedLike(node);
          const isDotLength = isUsingDotLength(node);
          if (isUndefined || isDotLength) {
            results.push({
              startLine: node.loc.start.line,
              endLine: node.loc.end.line,
            });
          }
        } else if (isExpectNotBeAssertion(node)) {
          if (isUndefinedLike(node)) {
            results.push({
              startLine: node.loc.start.line,
              endLine: node.loc.end.line,
            });
          }
        }
      } else if (node.callee.name === "expect" && isArgBinaryExpression(node)) {
        results.push({
          startLine: node.loc.start.line,
          endLine: node.loc.end.line,
        });
      }
    },
  });
  return results;
};

export default detectSubOptimalAssert;
