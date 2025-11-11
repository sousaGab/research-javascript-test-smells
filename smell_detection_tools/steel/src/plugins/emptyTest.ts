import { File } from "@babel/types";
import traverse from "@babel/traverse";
import { Smell } from "../smell";
import { isFunctionOrArrow, isTestCase } from "../util";
import Rule from "../rule";

export default class EmptyTestRule extends Rule {

  get name(): string {
    return "Empty Test";
  }

  detect(ast: File): Smell[] {
    const results: Smell[] = [];
    traverse(ast, {
      CallExpression: (path: any) => {
        const node = path.node;
        if (isTestCase(node)) {
          const emptyBody = (el: any) => isFunctionOrArrow(el)
            && Array.isArray(el.body.body)
            && el.body.body.length === 0;
          if (node.arguments.some(emptyBody)) {
            results.push(new Smell(node.loc.start));
          }
        }
      }
    });
    return results;
  }
}
