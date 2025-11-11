import { File } from "@babel/types";
import { Smell } from "./smell";

export type FileInfo = {
  path: string;
  code: string;
  ast: File
}

export type Report = {
  project: string;
  version: string;
  testSuites: number; // totalOfTestFiles: number;
  testCases: number; //totalOfTestMethods: number;
  smelledTestSuites: number; //totalOfInfectedTestFiles: number;
  smelledTestCases: number; //totalOfInfectedTestMethods: number;
  smells: number; //totalOfDetectedSmells: number;
  smelledFiles: SmelledFile[];
}

export type SmelledFile = {
  path: string;
  testCases: number;
  smells: number;
  // total: number;
  smellInfo: SmellInfo[];
  metrics: Object; //quality: Object;
  // methodsTotal: number;
}

export type SmellInfo = {
  name: string;
  packageName: string;
  items: Smell[];
}

export type Detection = {
  suite: FileInfo,
  smells: number,
  result: SmellInfo[]
}

export type Location = {
  line: number;
  column: number;
}

export type Accumulator = {
  name: string,
  total: number
}
