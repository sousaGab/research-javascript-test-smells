import { resolve } from 'path';
import { readFileSync } from "fs";
import { parse, ParserOptions } from '@babel/parser';
import { FileInfo } from "./types";
import { isTestSuite } from "./util";
import { Either, left, right } from './either';
import { NoFileError } from './errors';
import { glob } from 'glob';

const parserOptions: ParserOptions = {
  allowReturnOutsideFunction: true,
  errorRecovery: true,
  sourceType: 'module',
  plugins: ["flow", "jsx"]
};

export function parseSuites(pattern: string): Either<NoFileError, FileInfo[]> {
  // Retrieve all files matching the pattern
  const files = glob.sync(pattern, { 
    absolute: true // Ensure absolute paths are returned
  });

  // Explicitly filter out files in node_modules and dist
  const filteredFiles = files.filter(file => 
    !file.includes('node_modules') && !file.includes('dist')
  );

  if (filteredFiles.length === 0) {
    return left(new NoFileError());
  }

  const parsedFiles = filteredFiles.map(path => {
    const code = readFileSync(path, 'utf8');
    const ast = parse(code, parserOptions);
    return <FileInfo>{ path: resolve(path), code: code, ast: ast };
  });

  const testSuites = parsedFiles.filter(file => isTestSuite(file.ast));

  return right(testSuites);
}