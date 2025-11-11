import { File } from "@babel/types";
import traverse from "@babel/traverse";
import { Smell } from "../smell";
import { isTestCase } from '../util';
import Rule from "../rule";

class External {
  constructor(public name: string, public alias: string) { }
}

const mysteryModules = ["fs"];
const mysteryMethods = ["open", "readFile", "writeFile"];
let modules: External[] = [];

export default class ResourceOptimismRule extends Rule {

  get name() {
    return "Resource Optimism";
  }

  private hasFsMethodCalled(node: any, moduleName: string, methodName: string): boolean {
    return node.type === "CallExpression"
      && node.callee.type === "MemberExpression"
      && node.callee.object.name === moduleName
      && node.callee.property.name === methodName;
  }

  private hasMysteryModuleRequired(node: any, module: string): boolean {
    return node.type === "VariableDeclaration"
      && node.declarations[0].init !== null
      && node.declarations[0].init.type === "CallExpression"
      && node.declarations[0].init.callee.name === "require"
      && node.declarations[0].init.arguments[0].value === module;
  }

  private hasMysteryModuleImported(node: any, module: string): boolean {
    return node.type === "ImportDeclaration"
      && node.source.value === module;
  }

  private findRequires(ast: File): Smell[] {
    const results: Smell[] = [];
    traverse(ast, {
      enter: (path: any) => {
        const node = path.node;
        mysteryModules.forEach(item => {
          if (this.hasMysteryModuleRequired(node, item)) {
            modules.push(new External(item, node.declarations[0].id.name));
          }
          if (this.hasMysteryModuleImported(node, item)) {
            modules.push(new External(item, node.specifiers[0].local.name));
          }
        });
      },
    });
    return results;
  }

  detect(ast: File): Smell[] {
    const results: Smell[] = [];
    const accessCalls: any[] = [];
    const fsMethodsCalls: any[] = [];
    this.findRequires(ast);
    traverse(ast, {
      CallExpression: (path: any) => {
        const node = path.node;
        if (isTestCase(node)) {
          path.traverse({
            enter: (path: any) => {
              const node = path.node;
              modules.forEach(mdl => {
                if (this.hasFsMethodCalled(node, mdl.alias, "access")) {
                  accessCalls.push(node);
                }
                else {
                  mysteryMethods.forEach(item => {
                    if (this.hasFsMethodCalled(node, mdl.alias, item)) {
                      fsMethodsCalls.push(node);
                    }
                  });
                }
              });
            }
          });
        }
      }
    });
    if (accessCalls.length === 0) {
      fsMethodsCalls.forEach(node => results.push(new Smell(node.loc.start)));
    }
    return results;
  }
}
