import fs from 'fs';
import { join, dirname, extname, basename, resolve } from 'path';
import { codeFrameColumns } from '@babel/code-frame';
import Rule from './rule';
import { Detection, FileInfo, SmellInfo } from './types';

interface Plugin {
  name: string;
  packageName: string;
  instance?: any;
  options?: any;
}

function registerPlugin(plugin: Plugin): Plugin {
  if (!plugin.name || !plugin.packageName) {
    throw new Error('The plugin name and package are required');
  }

  try {
    const steelDir = dirname(__filename);
    const pluginPath = join(steelDir, 'plugins', plugin.name + '.js');
    return { ...plugin, instance: require(pluginPath) };
  } catch (error) {
    throw new Error(`Cannot load plugin ${plugin.name}`)
  }
}

function loadFiles(): Set<Plugin> {
  return new Set(fs.readdirSync(join(module.path, 'plugins'))
    .filter(file => extname(file) === '.js')
    .map(file => registerPlugin({ name: basename(file, '.js'), packageName: basename(file, '.js') })));
}

export function listSmellPackageNames(): String[] {
  return Array.from(loadFiles().values()).map(item => item.packageName);
}

function loadPlugin<T>(plugin: Plugin, filepath: string): T {
  const properties = { path: { value: filepath } };
  return Object.create(plugin?.instance.default.prototype, properties) as T;
}

export function callPlugins(suite: FileInfo): Detection {
  const result: SmellInfo[] = [];
  const filepath = resolve(dirname(suite.path));
  let accSmells = 0;

  if (!suite.ast) {
    console.warn(`Skipping suite ${suite.path} due to missing AST.`);
    return {
      suite: suite,
      smells: accSmells,
      result: result
    };
  }

  loadFiles().forEach(plugin => {
    try {
      const rule: Rule = loadPlugin<Rule>(plugin, filepath);
      const smells = rule.detect(suite.ast);

      const options = { highlightCode: false, message: rule.name };
      if (smells.length > 0) {
        accSmells += smells.length;
        smells.forEach(item => {
          item.frame = codeFrameColumns(suite.code, { start: item.start }, options);
        });
        result.push({ name: rule.name, packageName: plugin.packageName, items: smells });
      }
    } catch (error) {
      console.error(`Error processing plugin ${plugin.name}:`, error);
    }
  });

  return {
    suite: suite,
    smells: accSmells,
    result: result
  };
}

  // if (result.length > 0) {
  //   const methodsTotal = getNumberOfTestMethods(ast);
  //   const smellsTotal = result.map(smells => smells.items.length).reduce((sum = 0, val) => sum + val);
  //   report.totalOfTestMethods += methodsTotal;
  //   report.totalOfDetectedSmells += smellsTotal;
  //   report.totalOfInfectedTestFiles++;
  //   report.smelledFiles.push(
  //     new SmelledFile(
  //       path,
  //       smellsTotal,
  //       result,
  //       escomplexModule.analyze(ast),
  //       methodsTotal)
  //   );
  // }

  // path: string;
  // total: number;
  // smellInfo: SmellInfo[];
  // quality: Object;
  // methodsTotal: number;





// export default class PluginManager {
//   private pluginList: Map<string, Plugin>;
//   private path: string;

//   constructor() {
//     this.pluginList = new Map();
//     this.path = nodepath.join(module.path + '/plugins');
//     const pluginFiles: string[] = fs.readdirSync(this.path);
//     pluginFiles.forEach(file => {
//       const pluginName = nodepath.basename(file, '.js');
//       this.registerPlugin({
//         name: pluginName,
//         packageName: pluginName
//       });
//     });
//   }

//   private pluginExists(name: string): boolean {
//     return this.pluginList.has(name);
//   }

//   private addPlugin(plugin: Plugin, packageContents: any): void {
//     this.pluginList.set(plugin.name, { ...plugin, instance: packageContents });
//   }

//   registerPlugin(plugin: Plugin): void {
//     if (!plugin.name || !plugin.packageName) {
//       throw new Error('The plugin name and package are required');
//     }

//     if (this.pluginExists(plugin.name)) {
//       throw new Error(`Cannot add existing plugin ${plugin.name}`);
//     }

//     try {
//       const pluginPath = nodepath.join(nodepath.dirname(__filename), '/plugins/', plugin.packageName);
//       const packageContents = require(pluginPath);
//       this.addPlugin(plugin, packageContents);
//     } catch (error) {
//       console.log(`Cannot load plugin ${plugin.name}`, error);
//     }
//   }

//   loadPlugin<T>(name: string, filepath: string): T {
//     const properties = { path: { value: filepath } };
//     const plugin = this.pluginList.get(name);
//     if (!plugin) {
//       throw new Error(`Cannot find plugin ${name}`);
//     }
//     return Object.create(plugin?.instance.default.prototype, properties) as T;
//   }
// }
