import traverse, { NodePath } from "@babel/traverse";
import { CallExpression, File, isIdentifier } from "@babel/types";
import { parse } from '@babel/parser';
import { LoadAsIndexHandler, LoadAsJSFileHandler, LoadAsPackageHandler, NotFoundHandler } from "../handler";
import { isTestCase, getImports, getProductionMethods } from "../util";
import { readFileSync } from 'fs';
import { Smell } from "../smell";
import * as nodepath from "path";
import Rule from "../rule";

export default class EagerTestRule extends Rule {
  get name(): string {
    return "Eager Test";
  }

  detect(ast: File): Smell[] {
    const results: Smell[] = [];
    const imports = getImports(ast).map(item => nodepath.resolve(this.path, item));
    let productionMethods: String[] = [];
    imports.forEach(item => {
      const jsFile = new LoadAsJSFileHandler();
      jsFile
        .setNext(new LoadAsPackageHandler)
        .setNext(new LoadAsIndexHandler)
        .setNext(new NotFoundHandler);
      const filepath = jsFile.handle(item);
      if (filepath !== 'Not Found!') {
        const code = readFileSync(filepath, 'utf8');
        const prod = parse(code, { sourceType: 'module', plugins: ["flow"] });
        productionMethods.push(...getProductionMethods(prod));
      }
    });
    traverse(ast, {
      CallExpression: (path: NodePath<CallExpression>) => {
        const node = path.node;
        if (isTestCase(node)) {
          const callings: any[] = [];
          path.traverse({
            CallExpression: (path: NodePath<CallExpression>) => {
              const node = path.node;
              if (isIdentifier(node.callee) && productionMethods.includes(node.callee.name)) {
                callings.push(node);
              }
            }
          });
          if (callings.length > 1) {
            callings.forEach(call => {
              results.push(new Smell(call.loc.start));
            });
          }
        }
      }
    });
    return results;
  }
}
