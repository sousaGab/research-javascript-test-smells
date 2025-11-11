import { Smell } from './smell';
import { File } from '@babel/types';

export default abstract class Rule {
  path: string = "";
  abstract get name(): string;
  abstract detect(ast: File): Smell[];
  // constructor(path: string){};
}