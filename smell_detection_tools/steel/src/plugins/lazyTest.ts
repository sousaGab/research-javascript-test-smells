import traverse, { NodePath } from "@babel/traverse";
import { CallExpression, File, isIdentifier } from "@babel/types";
import { parse } from '@babel/parser';
import { LoadAsIndexHandler, LoadAsJSFileHandler, LoadAsPackageHandler, NotFoundHandler } from "../handler";
import { isTestCase, getImports, getProductionMethods } from "../util";
import { readFileSync } from 'fs';
import { Smell } from "../smell";
import * as nodepath from "path";
import Rule from "../rule";

export default class LazyTestRule extends Rule {
  get name(): string {
    return "Lazy Test";
  }

  detect(ast: File): Smell[] {
    const findings: any[] = [];
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
          const calleeSet = new Set();
          const calleeArray: any[] = [];
          path.traverse({
            CallExpression: (path: NodePath<CallExpression>) => {
              const node = path.node;
              if (isIdentifier(node.callee) && productionMethods.includes(node.callee.name)) {
                if (!calleeSet.has(node.callee.name)) {
                  calleeSet.add(node.callee.name);
                  calleeArray.push({ expr: node.callee.name, start: node.loc?.start });
                }
              }
            }
          });
          findings.push(...calleeArray);
        }
      }
    });
    const calleeList = findings.map(item => item.expr);
    const duplicates = findings.filter(item => {
      return calleeList.indexOf(item.expr) !== calleeList.lastIndexOf(item.expr)
    });
    return duplicates.map(item => new Smell(item.start));
  }
}
