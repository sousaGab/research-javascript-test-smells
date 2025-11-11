import { File } from "@babel/types";
import traverse from "@babel/traverse";
import { Smell } from "../smell";
import { isTestCase } from '../util';
import Rule from "../rule";

export default class ExceptionHandlingRule extends Rule {

  get name(): string {
    return "Exception Handling";
  }

  detect(ast: File): Smell[] {
    const results: Smell[] = [];
    traverse(ast, {
      CallExpression: (path: any) => {
        const node = path.node;
        if (isTestCase(node)) {
          path.traverse({
            TryStatement: (path: any) => {
              results.push(new Smell(path.node.loc.start));
            },
            ThrowStatement: (path: any) => {
              results.push(new Smell(path.node.loc.start));
            }
          });
        }
      }
    });
    return results;
  }
}
