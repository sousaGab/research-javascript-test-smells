import traverse from "@babel/traverse";
import astService from "../../services/ast.service.js";
const traverseDefault =
  typeof traverse === "function" ? traverse : traverse.default;

// const { isSetupMethod, isAssert } = require("../astAnalyzer");

const detectVerifyInSetup = (ast) => {
  const results = [];
  traverseDefault(ast, {
    CallExpression: ({ node }) => {
      const { loc } = node;
      if (astService.isSetupMethod(node)) {
        if (node.arguments[0]?.body?.body?.some(astService.isAssert)) {
          results.push({
            startLine: loc.start.line,
            endLine: loc.end.line,
          });
        }
      }
    },
  });
  return results;
};

export default detectVerifyInSetup;
