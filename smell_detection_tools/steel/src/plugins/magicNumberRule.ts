import { File } from '@babel/types';
import traverse from '@babel/traverse';
import { Smell } from "../smell";
import Rule from '../rule';
import { isAssertion, isChaiAssert, isChaiBdd, isJestNoNumericArgs, isTestCase } from '../util';

export default class MagicNumberRule extends Rule {

  get name(): string {
    return 'Magic Number'
  };

  get module(): string {
    return 'MagicNumberRule'
  };

  public detect(ast: File): Smell[] {
    let results: Smell[] = [];
    traverse(ast, {
      CallExpression: (path: any) => {
        const node = path.node;
        if (isTestCase(node)) {
          path.traverse({
            CallExpression: (path: any) => {
              const node = path.node;
              if (isAssertion(node) || isChaiAssert(node) || isChaiBdd(node) || isJestNoNumericArgs(node)) {
                const onlyNumeric = (arg: any) => arg.type === "NumericLiteral";
                const params = node.arguments.filter(onlyNumeric);
                const smells = params.map((arg: any) => new Smell(arg.loc.start));
                results.push(...smells);
              }
            }
          });
        }
      }
    });
    return results;
  }
}
