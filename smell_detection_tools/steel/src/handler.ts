import * as nodepath from "path";
import { existsSync, lstatSync } from 'fs';

interface Handler {
  setNext(handler: Handler): Handler;
  handle(request: string): string;
}

abstract class AbstractHandler implements Handler {
  private nextHandler: Handler | null = null;

  public setNext(handler: Handler): Handler {
    this.nextHandler = handler;
    return handler;
  }

  public handle(request: string): string {
    if (this.nextHandler) return this.nextHandler.handle(request);
    return request;
  }
}

function findJSFile(request: string) {
  return ['.js', '.cjs', '.mjs'].find(ext => {
    const file = (nodepath.extname(request) === ext) ? request : request + ext;
    return existsSync(file) && lstatSync(file).isFile();
  });
}

export class LoadAsJSFileHandler extends AbstractHandler {
  public handle(request: string): string {
    const js = findJSFile(request);
    if (js) {
      return (nodepath.extname(request) === js) ? request : request + js;
    }
    return super.handle(request);
  }
}

export class LoadAsPackageHandler extends AbstractHandler {
  public handle(request: string): string {
    const localPackage = nodepath.resolve(request, './package.json');
    if (existsSync(localPackage) && lstatSync(localPackage).isFile()) {
      const main = nodepath.resolve(request, require(localPackage).main);
      if (existsSync(main) && lstatSync(main).isFile()) {
        return main;
      }
    }
    return super.handle(request);
  }
}

export class LoadAsIndexHandler extends AbstractHandler {
  public handle(request: string): string {
    const index = nodepath.resolve(request, './index.js');
    const fileFound = findJSFile(index);
    if (fileFound) {
      return index;
    }
    return super.handle(request);
  }
}

export class NotFoundHandler extends AbstractHandler {
  public handle(request: string): string {
    return 'Not Found!';
  }
}
