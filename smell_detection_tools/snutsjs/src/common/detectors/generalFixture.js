import traverse from "@babel/traverse";
import * as t from "@babel/types";
import astService from "../../services/ast.service.js";
const traverseDefault =
  typeof traverse === "function" ? traverse : traverse.default;

const detectGeneralFixture = (ast) => {
  const setupVariables = new Map();
  const usedVariables = new Set();
  const generalFixtureSmells = [];

  const detectSetupVariables = (setupBody) => {
    if (t.isBlockStatement(setupBody)) {
      setupBody.body.forEach((statement) => {
        if (
          t.isExpressionStatement(statement) &&
          t.isAssignmentExpression(statement.expression)
        ) {
          const { left } = statement.expression;
          if (t.isIdentifier(left)) {
            setupVariables.set(left.name, {
              startLine: statement.loc.start.line,
              endLine: statement.loc.end.line,
            });
          }
        }
      });
    }
  };

  traverseDefault(ast, {
    CallExpression(path) {
      const { callee, arguments: args } = path.node;

      if (
        t.isIdentifier(callee, { name: "beforeAll" }) ||
        t.isIdentifier(callee, { name: "beforeEach" })
      ) {
        if (args.length >= 1 && astService.isFunction(args[0])) {
          detectSetupVariables(args[0].body);
        }
      } else if (astService.isTestCase(path.node) && args.length >= 2) {
        const testBody = args[1].body;
        if (t.isBlockStatement(testBody)) {
          traverseDefault(testBody, {
            noScope: true,
            Identifier(innerPath) {
              if (setupVariables.has(innerPath.node.name)) {
                usedVariables.add(innerPath.node.name);
              }
            },
          });
        }
      }
    },
  });

  setupVariables.forEach((value, variable) => {
    if (!usedVariables.has(variable)) {
      generalFixtureSmells.push(value);
    }
  });

  return generalFixtureSmells;
};

export default detectGeneralFixture;
