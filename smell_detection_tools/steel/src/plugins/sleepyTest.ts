import { File } from "@babel/types";
import traverse from "@babel/traverse";
import { Smell } from "../smell";
import { isSleepy, isTestCase } from "../util";
import Rule from "../rule";

export default class SleepyTestRule extends Rule {
  
  get name(): string {
    return "Sleepy Test";
  }

  detect(ast: File): Smell[] {
    const results: Smell[] = [];
    traverse(ast, {
      CallExpression: (path: any) => {
        const node = path.node;
        if (isTestCase(node)) {
          path.traverse({
            CallExpression: (path: any) => {
              if (isSleepy(path.node)) {
                results.push(new Smell(path.node.loc.start))
              }
            }
          });
        }
      }
    });

    return results;
  }
}
