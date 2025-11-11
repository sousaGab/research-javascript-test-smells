import traverse from "@babel/traverse";
import astService from "../../services/ast.service.js";
const traverseDefault =
  typeof traverse === "function" ? traverse : traverse.default;

const detectIdenticalTestDescription = (ast) => {
  const results = [];
  const setDescriptions = new Set();
  traverseDefault(ast, {
    CallExpression: ({ node }) => {
      const loc = node.loc;
      if (astService.isTestCase(node)) {
        if (/it|test/.test(node.callee.name)) {
          if (setDescriptions.has(node.arguments[0].value)) {
            results.push({
              startLine: loc.start.line,
              endLine: loc.end.line,
            });
          } else {
            setDescriptions.add(node.arguments[0].value);
          }
        }
      }
    },
  });
  return results;
};

export default detectIdenticalTestDescription;
