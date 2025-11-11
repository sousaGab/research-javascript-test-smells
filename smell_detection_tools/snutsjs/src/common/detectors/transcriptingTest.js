import traverse from "@babel/traverse";
import * as t from "@babel/types";
import astService from "../../services/ast.service.js";

const traverseDefault =
  typeof traverse === "function" ? traverse : traverse.default;
  
const detectTranscriptingTest = (ast) => {
  const transcriptingTestSmells = [];

  traverseDefault(ast, {
    CallExpression(path) {
      const { arguments: args, loc } = path.node;
      if (
        astService.isTestCase(path.node) &&
        args.length >= 2 &&
        t.isFunction(args[1]) &&
        t.isBlockStatement(args[1].body) // Ensure body is a BlockStatement
      ) {
        const body = args[1].body.body;
        for (const statement of body) {
          if (
            hasConsoleLog(statement) ||
            hasConsoleError(statement) ||
            hasConsoleWarn(statement) ||
            hasConsoleInfo(statement)
          ) {
            transcriptingTestSmells.push({
              startLine: loc.start.line,
              endLine: loc.end.line,
            });
            break;
          }
        }
      }
    },
  });

  return transcriptingTestSmells;
};

const hasConsoleLog = (node) => {
  return (
    t.isExpressionStatement(node) &&
    t.isCallExpression(node.expression) &&
    t.isMemberExpression(node.expression.callee) &&
    t.isIdentifier(node.expression.callee.object, { name: "console" }) &&
    t.isIdentifier(node.expression.callee.property, { name: "log" })
  );
};

const hasConsoleError = (node) => {
  return (
    t.isExpressionStatement(node) &&
    t.isCallExpression(node.expression) &&
    t.isMemberExpression(node.expression.callee) &&
    t.isIdentifier(node.expression.callee.object, { name: "console" }) &&
    t.isIdentifier(node.expression.callee.property, { name: "error" })
  );
};

const hasConsoleWarn = (node) => {
  return (
    t.isExpressionStatement(node) &&
    t.isCallExpression(node.expression) &&
    t.isMemberExpression(node.expression.callee) &&
    t.isIdentifier(node.expression.callee.object, { name: "console" }) &&
    t.isIdentifier(node.expression.callee.property, { name: "warn" })
  );
};

const hasConsoleInfo = (node) => {
  return (
    t.isExpressionStatement(node) &&
    t.isCallExpression(node.expression) &&
    t.isMemberExpression(node.expression.callee) &&
    t.isIdentifier(node.expression.callee.object, { name: "console" }) &&
    t.isIdentifier(node.expression.callee.property, { name: "info" })
  );
};

export default detectTranscriptingTest;
