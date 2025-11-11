import { describe, expect, test } from '@jest/globals';
import { parse, ParserOptions } from "@babel/parser";
import { Smell } from "../src/smell";
import RedundantAssertionRule from '../src/plugins/redundantAssertion';

const parserOptions: ParserOptions = {
  allowReturnOutsideFunction: true,
  errorRecovery: true,
  sourceType: 'module',
  plugins: ["flow", "jsx"]
};

describe('Redundant Assertion analyzer', () => {
  const code = `'use strict';

const assert = require('assert');
const agent = require('../../lib/agent');

describe('HTTP agent', function() {
  it('Without proxy', function() {
    assert.strictEqual(null, agent());
  });

  it('HTTPS proxy with auth from HTTPS_PROXY', function() {
    process.env.HTTPS_PROXY = 'https://user:pass@secure:123';
    const proxy = agent();
    delete process.env.HTTPS_PROXY;
    assert.strictEqual('object', typeof proxy);
    assert.strictEqual(123, proxy.options.proxy.port);
    assert.strictEqual('user:pass', proxy.options.proxy.proxyAuth);
    assert.strictEqual(443, proxy.defaultPort);
    assert.strictEqual(true, true);
    assert.strictEqual(true, false);
    expect(true).toBeTruthy();
    expect(true).toBeFalsy();
    expect(0).toBeFalsy();
    assert(true);
    assert.doesNotMatch('I will fail', /fail/);
    assert.ifError(null);
    assert.ifError(new Error());
    assert.ok(1);
    expect(babylonAST.tokens[1].type).toEqual("Punctuator");
    expect(node.program.body[0].declarations[0].id.name).toBe("replaced", "original ast should have been mutated",);
    expect({x: {a: 1}}).to.have.deep.property('x', {a: 1});
    expect({a: 1}).to.include({b: 2}).but.not.own.include({b: 2});
    expect(new Float32Array).to.be.a('float32array');
    expect([]).to.be.an('array').that.is.empty;
    expect(true).to.be.true;
  });
});`;

  test("if expect is detected", () => {
    const expected: Smell[] = [
      new Smell({ line: 19, column: 4 }),
      new Smell({ line: 20, column: 4 }),
      new Smell({ line: 21, column: 4 }),
      new Smell({ line: 22, column: 4 }),
      new Smell({ line: 23, column: 4 }),
      new Smell({ line: 24, column: 4 }),
      new Smell({ line: 28, column: 4 }),
      new Smell({ line: 35, column: 4 }),
    ];
    const ast = parse(code, parserOptions);
    const actual = new RedundantAssertionRule().detect(ast);
    expect(actual).toEqual(expected);
  });
});

