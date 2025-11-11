import { File, CallExpression, isMemberExpression, isIdentifier } from "@babel/types";
import traverse from "@babel/traverse";
import { Smell } from "../smell";
import { isTestCase } from "../util";
import Rule from "../rule";

const assertionMetadata = new Map([
  ["assert", { params: 2, hasMessage: true }],
  ["deepEqual", { params: 3, hasMessage: true }],
  ["deepStrictEqual", { params: 3, hasMessage: true }],
  ["doesNotMatch", { params: 3, hasMessage: true }],
  ["equal", { params: 3, hasMessage: true }],
  ["fail", { params: 1, hasMessage: true }],
  ["notEqual", { params: 3, hasMessage: true }],
  ["notDeepEqual", { params: 3, hasMessage: true }],
  ["ok", { params: 2, hasMessage: true }],
  ["strictEqual", { params: 3, hasMessage: true }],
]);

const chaiBddMethodsWithMessage = new Map([
  ["a", 2], ["above", 2], ["below", 2], ["by", 2], ["change", 2], ["closeTo", 2],
  ["decrease", 2], ["equal", 2], ["eql", 2], ["fail", 2], ["include", 2],
  ["increase", 2], ["instanceof", 2], ["least", 2], ["lengthOf", 2], ["match", 2],
  ["members", 2], ["most", 2], ["oneOf", 2], ["ownPropertyDescriptor", 2], ["property", 2],
  ["respondTo", 2], ["satisfy", 2], ["string", 2], ["throw", 2], ["within", 2]
]);

export default class AssertionRouletteRule extends Rule {

  get name(): string {
    return "Assertion Roulette";
  }

  private isAssertionWithMessageParam(node: CallExpression): Boolean {
    return (isIdentifier(node.callee) && node.callee.name === "assert") ||
      (isMemberExpression(node.callee) && isIdentifier(node.callee.object)
        && node.callee.object.name === "assert" && isIdentifier(node.callee.property)
        && assertionMetadata.has(node.callee.property.name))
  }

  private hasNoMessage(node: CallExpression): boolean {
    let result = false;
    if (isIdentifier(node.callee) && node.callee.name === "assert") {
      result = node.arguments.length !== assertionMetadata.get(node.callee.name)?.params;
    }
    else if (isMemberExpression(node.callee) && isIdentifier(node.callee.property)) {
      // console.log(node.callee.property.name, node.arguments.length, this.nodeAssertParamsNum.get(node.callee.property.name));
      result = node.arguments.length !== assertionMetadata.get(node.callee.property.name)?.params;
    }

    return result;
  }


  // private isChaiBddWithMessage(node: CallExpression): boolean {
  //   // console.log(((node.callee as MemberExpression).property as Identifier).name);
  //   // if(isMemberExpression(node.callee)) {
  //   //   console.log(extract(node.callee));
  //   // }

  //   return isMemberExpression(node.callee)
  //     && isIdentifier(node.callee.property)
  //     && chaiBddMethodsWithMessage.includes(node.callee.property.name);
  // }


  detect(ast: File): Smell[] {
    const results: Smell[] = [];
    traverse(ast, {
      CallExpression: (path: any) => {
        if (isTestCase(path.node)) {
          const assertions: any[] = [];
          path.traverse({
            CallExpression: (path: any) => {
              const node = path.node;
              // if (isAssertion(node) || isChaiAssert(node) || isChaiBddWithMessage(node)) {
              if (this.isAssertionWithMessageParam(node)) {
                assertions.push(node);
              }
            }
          });
          if (assertions.length > 1) {
            results.push(...assertions.filter(node => this.hasNoMessage(node)));
          }
        }
      }
    });

    return results.map((node: any) => new Smell({ column: node.loc.start.column, line: node.loc.start.line }));
  }
}
