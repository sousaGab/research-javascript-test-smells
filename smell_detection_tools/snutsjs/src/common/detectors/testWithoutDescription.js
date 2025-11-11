import traverse from "@babel/traverse";
import * as t from "@babel/types";
import astService from "../../services/ast.service.js";

const traverseDefault =
  typeof traverse === "function" ? traverse : traverse.default;

const detectTestWithoutDescription = (ast) => {
  const testsWithoutDescription = [];
  traverseDefault(ast, {
    CallExpression(path) {
      const { arguments: args, loc } = path.node;
      if (astService.isTestCase(path.node) && args.length >= 2) {
        const isAnyTypeOfFunction = astService.isFunction(args[1]);
        if (
          isAnyTypeOfFunction &&
          t.isStringLiteral(args[0]) &&
          args[0].value.trim() === ""
        ) {
          testsWithoutDescription.push({
            startLine: loc.start.line,
            endLine: loc.end.line,
          });
        }
      }
    },
  });
  return testsWithoutDescription;
};

export default detectTestWithoutDescription;
