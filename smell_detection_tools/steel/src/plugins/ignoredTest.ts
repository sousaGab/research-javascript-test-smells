import { File } from "@babel/types";
import traverse from "@babel/traverse";
import {
  isTestCaseIgnored, isDescribeIgnored, isThisExpressionIgnored
} from "../util";
import Rule from "../rule";
import { Smell } from "../smell";

export default class IgnoredTestRule extends Rule {

  get name(): string {
    return "Ignored Test";
  }

  detect(ast: File): Smell[] {
    const results: Smell[] = [];
    traverse(ast, {
      CallExpression: (path: any) => {
        const node = path.node;
        if (isDescribeIgnored(node) || 
          isTestCaseIgnored(node) || 
          isThisExpressionIgnored(node)) {
          results.push(new Smell(node.callee.property.loc.start))
        }
      }
    });
    return results;
  }
}
