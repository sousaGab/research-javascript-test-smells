import { File } from "@babel/types";
import traverse from "@babel/traverse";
import { Smell } from "../smell";
import { isTestCase } from '../util';
import Rule from "../rule";

class External {
  constructor(public name: string, public alias: string) { }
}

const mockModules = ['nock', 'sinon'];

const mysteryMethods = [
  { module: 'fs', method: 'access' },
  { module: 'fs', method: 'readFile' },
  { module: 'fs', method: 'readFileSync' },
  { module: 'fs', method: 'exists' },
  { module: 'fs', method: 'existsSync' },
  { module: 'fs', method: 'unlink' },
  { module: 'fs', method: 'unlinkSync' },
  { module: 'http', method: 'get' },
  { module: 'http', method: 'request' },
];

const mysteryModules = ['fs', 'http'];


export default class MysteryGuestRule extends Rule {

  get name(): string {
    return "Mystery Guest";
  }

  private hasMysteryMethodCalled(node: any, moduleName: string, methodName: string): boolean {
    return node.object.name === moduleName
      && node.property.name === methodName;
  }

  private hasModuleRequired(node: any, module: string): boolean {
    return node.type === "VariableDeclaration"
      && node.declarations[0].init !== null
      && node.declarations[0].init.type === "CallExpression"
      && node.declarations[0].init.callee.name === "require"
      && node.declarations[0].init.arguments[0].value === module;
  }

  private hasModuleImported(node: any, module: string): boolean {
    return node.type === "ImportDeclaration"
      && node.source.value === module;
  }

  private isRequireDeclaration(node: any): boolean {
    return node.declarations[0].init
      && node.declarations[0].init.type === "CallExpression"
      && node.declarations[0].init.callee.name === "require";
  }

  private isFromNockProject(node: any): boolean {
    return node.declarations[0].id.name === 'nock'
      && node.declarations[0].init.arguments[0].value === '..';
  }

  private hasMockModules(ast: File): boolean {
    let result = false;
    traverse(ast, {
      VariableDeclaration: (path: any) => {
        const node = path.node;
        if (this.isRequireDeclaration(node)
          && (this.isFromNockProject(node)
            || mockModules.includes(node.declarations[0].init.arguments[0].value))) {
          result = true;
        }
      },
      ImportDeclaration: (path: any) => {
        if (mockModules.includes(path.node.source.value)) {
          result = true;
        }
      }
    });
    return result;
  }

  private findRequires(ast: File): External[] {
    const results: External[] = [];
    traverse(ast, {
      enter: (path: any) => {
        const node = path.node;
        mysteryModules.forEach(item => {
          if (this.hasModuleRequired(node, item)) {
            results.push(new External(item, node.declarations[0].id.name));
          }
          if (this.hasModuleImported(node, item)) {
            results.push(new External(item, node.specifiers[0].local.name));
          }
        });
      },
    });
    return results;
  }

  private isNockExpression(node: any): boolean {
    return node.property
      && (node.object?.callee?.name === 'nock' || node.object.name === 'nock')
      && ['get', 'post', 'define'].includes(node.property.name);
  }

  private isNockDeclaration(node: any): boolean {
    return node.object?.object?.name === 'nock'
      && ['recorder', 'get'].includes(node.object.property?.name);
  }

  private findNockExpression(ast: File): boolean {
    let hasNockCall = false;
    traverse(ast, {
      MemberExpression: (path: any) => {
        const node = path.node;
        if (this.isNockExpression(node)) {
          hasNockCall = true;
        }
        if (this.isNockDeclaration(node)) {
          hasNockCall = true;
        }
      },
    })
    return hasNockCall;
  }

  detect(ast: File): Smell[] {
    const results: Smell[] = [];

    if (this.hasMockModules(ast) && this.findNockExpression(ast)) {
      return results;
    }

    const modules = this.findRequires(ast);
    traverse(ast, {
      CallExpression: (path: any) => {
        if (isTestCase(path.node)) {
          path.traverse({
            MemberExpression: (path: any) => {
              const node = path.node;
              modules.forEach(mdl => {
                const filterModule = (item: any) => item.module === mdl.name;
                mysteryMethods.filter(filterModule).forEach(item => {
                  if (this.hasMysteryMethodCalled(node, mdl.alias, item.method)) {
                    results.push(new Smell({ column: node.loc.start.column, line: node.loc.start.line }));
                  }
                });
              });
            }
          });
        }
      },
    });
    return results;
  }
}
