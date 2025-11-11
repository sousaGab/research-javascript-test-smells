import {describe, expect, test} from '@jest/globals';
import { parse, ParserOptions } from "@babel/parser";
import UnknownTestRule from "../src/plugins/unknownTest";
import { Smell } from "../src/smell";

const parserOptions: ParserOptions = {
  allowReturnOutsideFunction: true,
  errorRecovery: true,
  sourceType: 'module',
  plugins: ["flow", "jsx"]
};

describe('Unknown Test analyzer', () => {
  const code =
    `import {createFileText} from "../src/production";

    describe('Test creation file', () => {
      it('first line size is 20', () => {
        const path = "data.txt";
        const text = "1) some random text;\\n2) more random text.";
        createFileText(text);
      });
    });`.replace(/^    /gm, "");

  const code2 = `'use strict';

const expect = require('chai').expect;
const utils = require('./utils');
const redis = require('ioredis');

describe('workers', () => {
  let queue;
  let client;

  beforeEach(() => {
    client = new redis();
    return client.flushdb().then(() => {
      queue = utils.buildQueue('test workers', {
        settings: {
          guardInterval: 300000,
          stalledInterval: 300000
        }
      });
      return queue;
    });
  });

  afterEach(() => {
    return queue.close().then(() => {
      return client.quit();
    });
  });

  it('should get all workers for this queue', async () => {
    queue.process(() => {});

    await queue.bclient.ping();

    const workers = await queue.getWorkers();
    expect(workers).to.have.length(1);
  });
});`;

  test("if no assert is detected", () => {
    const expected: Smell[] = [
      new Smell({ line: 4, column: 2 })
    ];
    const ast = parse(code, parserOptions);
    const actual = new UnknownTestRule().detect(ast);
    expect(actual).toEqual(expected);
  });

  test("if expect is detected", () => {
    const expected: Smell[] = [];
    const ast = parse(code2, parserOptions);
    const actual = new UnknownTestRule().detect(ast);
    expect(actual).toEqual(expected);
  });
});
