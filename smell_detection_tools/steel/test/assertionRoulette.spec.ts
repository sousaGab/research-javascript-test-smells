import { describe, expect, test } from '@jest/globals';
import { parse } from "@babel/parser";
import { Smell } from '../src/smell';
import AssertionRouletteRule from '../src/plugins/assertionRoulette';

// import { AssertionRouletteSmell } from "../src/detectors/assertionRoulette"
// import { Smell } from "../src/classes/smell";
// import { IPosition } from "../src/interfaces/position";

describe('Assertion Roulette analyzer', () => {
  const code1 =
    `import fs from "fs";
    import {createFileText} from "../src/production";

    describe('Test creation file', () => {
      it('create a text', () => {
        const path = "data.txt";
        const text = "1) some random text;\\n2) more random text.";
        createFileText(text);
        const contents = fs.readFileSync(path, "utf8").split("\\n");
        fs.access(path, fs.constants.R_OK, (err) => {
          assert.ok(err, "message");
          assert(err);
        });
        assert.equal(contents[0], text.split("\\n")[1], "line 1 must be '1) some random text;'");
        assert.equal(contents[1], text.split("\\n")[1]);
      });
    });`.replace(/^    /gm, "");


  const code2 =
    `import fs from "fs";
    import {createFileText} from "../src/production";

    describe('Test creation file', () => {
      it('create a text', () => {
        const path = "data.txt";
        const text = "1) some random text;\\n2) more random text.";
        createFileText(text);
        const contents = fs.readFileSync(path, "utf8").split("\\n");
        fs.access(path, fs.constants.R_OK, (err) => {
          assert.ok(err, "message");
        });
        assert.equal(contents[0], text.split("\\n")[0], "line 1 must be '1) some random text;'");
        assert.equal(contents[1], text.split("\\n")[1], "line 2 must be '2) more random text;'");
      });
    });`.replace(/^    /gm, "");


  const code3 =
    `import fs from "fs";
    import {createFileText} from "../src/production";

    describe('Test creation file', () => {
      it('create a text', () => {
        const path = "data.txt";
        const text = "1) some random text;\\n2) more random text.";
        createFileText(text);
        const contents = fs.readFileSync(path, "utf8").split("\\n");
        fs.access(path, fs.constants.R_OK, (err) => {
          assert.ok(err, "message");
        });
      });
    });

    describe('Test read file', () => {
      it('create a text', () => {
        const path = "data.txt";
        const text = "1) some random text;\\n2) more random text.";
        createFileText(text);
        const contents = fs.readFileSync(path, "utf8").split("\\n");
        assert.equal(contents[0], text.split("\\n")[0]);
      });
    });`.replace(/^    /gm, "");

  const code_bdd =
    `/* test/sum.js */

    var sum = require('../sum.js');
    var expect = require('chai').expect;

    describe('#sum()', function() {

      context('without arguments', function() {
        it('should return 0', function() {
          expect(sum()).to.equal(0)
        })
      })

      context('with number arguments', function() {
        it('should return sum of arguments', function() {
          expect(sum(1, 2, 3, 4, 5)).to.equal(15)
        })

        it('should return argument when only one argument is passed', function() {
          expect(sum(5)).to.equal(5)
        })
      })

      context('with non-number arguments', function() {
        it('should throw error', function() {
          expect(function() {
            sum(1, 2, '3', [4], 5)
          }).to.throw(TypeError, 'sum() expects only numbers.')
        })
      })

    })`

  const code4 =
    `/* /home/dalton/workspace/github/steel-experiment-1-js/Repositories/sails/test/unit/req.errors.test.js */

    describe('request that causes an error', function () {
      it('should return the expected error when something throws', function (done) {
        var ERROR = 'oh no I forgot my keys';
        sails.get('/errors/1', function (req, res) {
          throw ERROR;
        });
        sails.request('GET /errors/1', {}, function (err) {
          assert.deepEqual(500, err.status);
          assert.deepEqual(ERROR, err.body);
          done();
        });
      });
    });`.replace(/^    /gm, "");

  describe("detects multiple assertions from a single test case", () => {
    test("if any assertion is omiting message", () => {
      const expected: Smell[] = [
        new Smell({ line: 12, column: 6 }),
        new Smell({ line: 15, column: 4 }),
      ];
      const ast = parse(code1, { sourceType: "module" });
      const actual = new AssertionRouletteRule().detect(ast);
      expect(actual).toEqual(expected);
    });

    test("if all assertions have messages", () => {
      const expected: Smell[] = [];
      const ast = parse(code2, { sourceType: "module" });
      const actual = new AssertionRouletteRule().detect(ast);
      expect(actual).toEqual(expected);
    });

    test("if sails is omiting messages", () => {
      const expected: Smell[] = [
        new Smell({ line: 10, column: 6 }),
        new Smell({ line: 11, column: 6 }),
      ];
      const ast = parse(code4, { sourceType: "module" });
      const actual = new AssertionRouletteRule().detect(ast);
      expect(actual).toEqual(expected);
    });

    // describe("detects one assertion from a single test case", () => {
    //   test("doesn't detect smell when there is just one assert without message on test", () => {
    //     const expected: any = [];
    //     const ast = parse(code3, { sourceType: "module" });
    //     const actual = new AssertionRouletteSmell(code3);
    //     expect(actual.detect(ast)).toEqual(expected);
    //   });
    // });
    //
    // describe("bdd writing style", () => {
    //   test("doesn't detect smell with bdd writing style", () => {
    //     const expected: any = [];
    //     const ast = parse(code_bdd, { sourceType: "module" });
    //     const actual = new AssertionRouletteSmell(code_bdd);
    //     expect(actual.detect(ast)).toEqual(expected);
    //   });
  });
});
