import traverse from "@babel/traverse";
import * as t from "@babel/types";
import astService from "../../services/ast.service.js";

const traverseDefault =
  typeof traverse === "function" ? traverse : traverse.default;

const hasManyOfTwoWords = (text = "") => {
  const result = text.split(" ");
  return result.length > 2;
};

const detectAnonymousTest = (ast) => {
  const anonymousTestSmells = [];
  traverseDefault(ast, {
    CallExpression(path) {
      const { arguments: args, loc } = path.node;
      if (args.length >= 2) {
        if (
          astService.isTestCase(path.node) &&
          astService.isFunction(args[1]) &&
          t.isStringLiteral(args[0]) &&
          !hasManyOfTwoWords(args[0].value)
        ) {
          anonymousTestSmells.push({
            startLine: loc.start.line,
            endLine: loc.end.line,
          });
        }
      }
    },
  });
  return anonymousTestSmells;
};

export default detectAnonymousTest;
