import { CallExpression, File, isIdentifier } from "@babel/types";
import traverse, { NodePath } from "@babel/traverse";
import { Smell } from "../smell";
import Rule from "../rule";

export default class GlobalVariableRule extends Rule {
  get name(): string {
    return 'Global Variable'
  };

  get module(): string {
    return 'GlobalVariableRule'
  };

  detect(ast: File): Smell[] {
    const results: Smell[] = [];
    traverse(ast, {
      VariableDeclaration: (path: any) => {
        if (path.node.kind === "var" && path.node.name !== 'this') {
          let foundRequire = false;
          path.traverse({
            CallExpression: (path: NodePath<CallExpression>) => {
              foundRequire = (isIdentifier(path.node.callee) && path.node.callee.name == 'require');
            }
          });
          if (!foundRequire) {
            results.push(new Smell(path.node.loc.start));
          }
        }
      }
    });
    return results;
  }
}

