import { File } from "@babel/types";
import traverse from "@babel/traverse";
import { Smell } from "../smell";
import { isConsole, isTestCase } from "../util";
import Rule from "../rule";

export default class RedundantPrintRule extends Rule {

  get name(): string {
    return "Redundant Print";
  }

  detect(ast: File): Smell[] {
    const results: Smell[] = [];
    traverse(ast, {
      CallExpression: (path: any) => {
        if (isTestCase(path.node)) {
          path.traverse({
            MemberExpression: (path: any) => {
              const node = path.node;
              if (isConsole(node)) {
                results.push(new Smell(node.object.loc.start));
              }
            }
          });
        }
      }
    });
    return results;
  }
}
