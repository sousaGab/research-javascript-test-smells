import traverse from "@babel/traverse";
import astService from "../../services/ast.service.js";
import { callExpression } from "@babel/types";
const traverseDefault =
  typeof traverse === "function" ? traverse : traverse.default;

  const detectConditionalTestLogic = (ast) => {
    const smells = [];
  
    traverseDefault(ast, {
      CallExpression(path) {
        if (astService.isTestCase(path.node)) {
          path.traverse({
            IfStatement(ifPath) {
              const { loc } = ifPath.node;
              if (loc) {
                smells.push({ startLine: loc.start.line, endLine: loc.end.line });
              }
            }
          });
        }
      }
    });
  
    return smells;
  };  

export default detectConditionalTestLogic;
