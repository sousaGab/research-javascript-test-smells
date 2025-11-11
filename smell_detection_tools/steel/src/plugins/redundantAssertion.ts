import { File, isBooleanLiteral, isNumericLiteral, isStringLiteral } from "@babel/types";
import traverse from "@babel/traverse";
import { Smell } from "../smell";
import { isAssertion, isChaiBdd, isJest } from "../util";
import Rule from "../rule";

function isLiteral(arg: any): boolean {
  return isStringLiteral(arg) ||
    isNumericLiteral(arg) ||
    isBooleanLiteral(arg);
}

function isAssert(node: any) {
  return isAssertion(node) || isChaiBdd(node) || isJest(node);
}

export default class RedundantAssertionRule extends Rule {

  get name(): string {
    return "Redundant Assertion";
  }

  detect(ast: File): Smell[] {
    const redundants: Smell[] = [];
    traverse(ast, {
      CallExpression: (path: any) => {
        const node = path.node;
        if (isAssert(node)) {
          if (node.callee?.name) {
            if (node.callee.name.startsWith('assert')) {
              if (node.arguments.every(isLiteral)) {
                redundants.push(new Smell({ column: node.loc.start.column, line: node.loc.start.line }));
              }
            }
            if (node.callee.name.startsWith('expect')) {
              // const expressionStatement = path.getStatementParent();
              // console.log("expressionStatement:", expressionStatement.node.loc.start.line);
              const chainedCall = path.findParent((p: any) => p.isCallExpression());

              const args = [...node.arguments];
              if (chainedCall && chainedCall.node.arguments.every(isLiteral)) {
                args.push(...chainedCall.node.arguments);
              }

              if (args.every(isLiteral)) {
                redundants.push(new Smell({ column: node.loc.start.column, line: node.loc.start.line }));
              }
            }
          }
          else if (node.callee?.object?.name === 'assert') {
            if (node.arguments.every(isLiteral)) {
              redundants.push(new Smell({ column: node.loc.start.column, line: node.loc.start.line }));
            }
          }
        }
      }
    });
    return redundants;
  }
}
