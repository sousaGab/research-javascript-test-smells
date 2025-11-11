import { File, CallExpression, isArrayExpression, isMemberExpression, isIdentifier } from "@babel/types";
import traverse from "@babel/traverse";
import { Smell } from "../smell";
import Rule from "../rule";

export default class ConditionalTestLogicRule extends Rule {
  get name(): string {
    return 'Conditional Test Logic'
  };

  get module(): string {
    return 'ConditionalTestLogicRule'
  };

  private isForEach(node: CallExpression): boolean {
    return isMemberExpression(node.callee)
      && isArrayExpression(node.callee.object)
      && isIdentifier(node.callee.property)
      && node.callee.property.name === "forEach";
  }

  detect(ast: File): Smell[] {
    const results: Smell[] = [];
    traverse(ast, {
      IfStatement: (path: any) => { results.push(new Smell(path.node.loc.start)) },
      ForStatement: (path: any) => { results.push(new Smell(path.node.loc.start)) },
      ForInStatement: (path: any) => { results.push(new Smell(path.node.loc.start)) },
      ForOfStatement: (path: any) => { results.push(new Smell(path.node.loc.start)) },
      WhileStatement: (path: any) => { results.push(new Smell(path.node.loc.start)) },
      SwitchStatement: (path: any) => { results.push(new Smell(path.node.loc.start)) },
      CallExpression: (path: any) => {
        if (isMemberExpression(path.node.callee)
        && isArrayExpression(path.node.callee.object)
        && isIdentifier(path.node.callee.property)
        && path.node.callee.property.name === "forEach") {
          results.push(new Smell(path.node.callee.property.loc.start))
        }
      }
    });
    return results;
  }
}
