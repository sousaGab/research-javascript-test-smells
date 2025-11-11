import { File } from "@babel/types";
import traverse from "@babel/traverse";
import { Smell } from "../smell";
import { isAssertion, isChaiBdd, isJest, isChaiAssert, isTestCase } from "../util";
import Rule from "../rule";

export default class DuplicateAssertRule extends Rule {

  get name(): string {
    return "Duplicate Assert";
  }

  detect(ast: File): Smell[] {
    const results: Smell[] = [];
    traverse(ast, {
      CallExpression: (path: any) => {
        const node = path.node;
        if (isTestCase(node)) {
          const callings: any[] = [];
          path.traverse({
            CallExpression: (path: any) => {
              const node = path.node;
              if (isAssertion(node) || isChaiAssert(node) || isChaiBdd(node) || isJest(node)) {
                callings.push({ expr: path.toString(), start: node.loc.start });
              }
            }
          });

          if (callings.length > 1) {
            const asserts = callings.map(item => item.expr);
            const duplicates = callings.filter(item => {
              return asserts.indexOf(item.expr) !== asserts.lastIndexOf(item.expr)
            });
            results.push(...duplicates)
          }
        }
      }
    });

    return results.map(item => new Smell(item.start));
  }
}
