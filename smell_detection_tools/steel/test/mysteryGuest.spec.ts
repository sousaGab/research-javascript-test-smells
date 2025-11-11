import { describe, expect, test } from '@jest/globals';
import { parse, ParserOptions } from "@babel/parser";
import MysteryGuestRule from "../src/plugins/mysteryGuest";
import { Smell } from "../src/smell";

const parserOptions: ParserOptions = {
  allowReturnOutsideFunction: true,
  errorRecovery: true,
  sourceType: 'module',
  plugins: ["flow", "jsx"]
};

describe('Mystery Guest analyzer', () => {
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
const http = require('http')
const path = require('path')
const assertRejects = require('assert-rejects')
const { expect } = require('chai')
const nock = require('..')
const got = require('./got_client')

const textFilePath = path.resolve(__dirname, './assets/reply_file_1.txt')

describe('\`optionally()\`', () => {
  it('optional mocks do not appear in \`pendingMocks()\`', () => {
    nock('http://example.test').get('/nonexistent').optionally().reply(200)

    expect(nock.pendingMocks()).to.be.empty()
  })

  it('when called with \`true\`, makes the mock optional', () => {
    nock('http://example.test').get('/nonexistent').optionally(true).reply(200)

    expect(nock.pendingMocks()).to.be.empty()
  })

  it('when called with \`false\`, the mock is still required', () => {
    nock('http://example.test').get('/nonexistent').optionally(false).reply(200)

    expect(nock.pendingMocks()).to.have.lengthOf(1)
  })

  it('when called with non-boolean, throws the expected error', () => {
    const interceptor = nock('http://example.test').get('/')

    expect(() => interceptor.optionally('foo')).to.throw(
      Error,
      'Invalid arguments: argument should be a boolean'
    )
  })

  it('optional mocks can be matched', done => {
    nock('http://example.test').get('/abc').optionally().reply(200)

    http.get({ host: 'example.test', path: '/abc' }, res => {
      expect(res.statusCode).to.equal(200)
      expect(nock.pendingMocks()).to.be.empty()
      done()
    })
  })

  it('before matching, \`isDone()\` is true', () => {
    const scope = nock('http://example.test')
      .get('/abc')
      .optionally()
      .reply(200)

    expect(scope.isDone()).to.be.true()
  })

  describe('in conjunction with \`persist()\`', () => {
    it('when optional mocks are also persisted, they do not appear as pending', async () => {
      const scope = nock('http://example.test')
        .get('/')
        .optionally()
        .reply(200)
        .persist()

      expect(nock.pendingMocks()).to.be.empty()

      const response1 = await got('http://example.test/')
      expect(response1.statusCode).to.equal(200)

      expect(nock.pendingMocks()).to.be.empty()

      const response2 = await got('http://example.test/')
      expect(response2.statusCode).to.equal(200)
      expect(nock.pendingMocks()).to.be.empty()

      scope.done()
    })
  })

  it('optional repeated mocks execute repeatedly', done => {
    nock('http://example.test').get('/456').optionally().times(2).reply(200)

    http.get({ host: 'example.test', path: '/456' }, res => {
      expect(res.statusCode).to.equal(200)
      http.get({ host: 'example.test', path: '/456' }, res => {
        expect(res.statusCode).to.equal(200)
        done()
      })
    })
  })

  it("optional mocks appear in \`activeMocks()\` only until they're matched", done => {
    nock('http://example.test').get('/optional').optionally().reply(200)

    expect(nock.activeMocks()).to.deep.equal([
      'GET http://example.test:80/optional',
    ])
    http.get({ host: 'example.test', path: '/optional' }, res => {
      expect(nock.activeMocks()).to.be.empty()
      done()
    })
  })
})

describe('\`persist()\`', () => {
  it('\`activeMocks()\` always returns persisted mocks, even after matching', async () => {
    const scope = nock('http://example.test')
      .get('/persisted')
      .reply(200)
      .persist()

    expect(nock.activeMocks()).to.deep.equal([
      'GET http://example.test:80/persisted',
    ])

    await got('http://example.test/persisted')

    expect(nock.activeMocks()).to.deep.equal([
      'GET http://example.test:80/persisted',
    ])

    scope.done()
  })

  it('persisted mocks match repeatedly', async () => {
    const scope = nock('http://example.test')
      .persist()
      .get('/')
      .reply(200, 'Persisting all the way')

    expect(scope.isDone()).to.be.false()

    await got('http://example.test/')

    expect(scope.isDone()).to.be.true()

    await got('http://example.test/')

    expect(scope.isDone()).to.be.true()
  })

  it('persisted mocks appear in \`pendingMocks()\`', async () => {
    const scope = nock('http://example.test')
      .get('/abc')
      .reply(200, 'Persisted reply')
      .persist()

    expect(scope.pendingMocks()).to.deep.equal([
      'GET http://example.test:80/abc',
    ])
  })

  it('persisted mocks are removed from \`pendingMocks()\` once they are matched once', async () => {
    const scope = nock('http://example.test')
      .get('/def')
      .reply(200, 'Persisted reply')
      .persist()

    await got('http://example.test/def')

    expect(scope.pendingMocks()).to.deep.equal([])
  })

  it('persisted mocks can use \`replyWithFile()\`', async () => {
    nock('http://example.test')
      .persist()
      .get('/')
      .replyWithFile(200, textFilePath)
      .get('/test')
      .reply(200, 'Yay!')

    for (let i = 0; i < 2; ++i) {
      const { statusCode, body } = await got('http://example.test/')
      expect(statusCode).to.equal(200)
      expect(body).to.equal('Hello from the file!')
    }
  })

  it('can call \`persist(false)\` to stop persisting', async () => {
    const scope = nock('http://example.test')
      .persist(true)
      .get('/')
      .reply(200, 'Persisting all the way')

    expect(scope.isDone()).to.be.false()

    await got('http://example.test/')

    expect(scope.isDone()).to.be.true()
    expect(nock.activeMocks()).to.deep.equal(['GET http://example.test:80/'])

    scope.persist(false)

    await got('http://example.test/')

    expect(nock.activeMocks()).to.be.empty()
    expect(scope.isDone()).to.be.true()

    await assertRejects(
      got('http://example.test/'),
      /Nock: No match for request/
    )
  })

  it('when called with an invalid argument, throws the expected error', () => {
    expect(() => nock('http://example.test').persist('string')).to.throw(
      Error,
      'Invalid arguments: argument should be a boolean'
    )
  })
});`;

  const code3 = `'use strict'

const http = require('http')
const { expect } = require('chai')
const assertRejects = require('assert-rejects')
const nock = require('..')
const got = require('./got_client')

describe('\`define()\`', () => {
  it('is backward compatible', async () => {
    expect(
      nock.define([
        {
          scope: 'http://example.test',
          //  "port" has been deprecated
          port: 12345,
          method: 'GET',
          path: '/',
          //  "reply" has been deprecated
          reply: '500',
        },
      ])
    ).to.be.ok()

    await assertRejects(
      got('http://example.test:12345/'),
      ({ response: { statusCode } }) => {
        expect(statusCode).to.equal(500)
        return true
      }
    )
  })

  it('throws when reply is not a numeric string', () => {
    expect(() =>
      nock.define([
        {
          scope: 'http://example.test:1451',
          method: 'GET',
          path: '/',
          reply: 'frodo',
        },
      ])
    ).to.throw('\`reply\`, when present, must be a numeric string')
  })

  it('applies default status code when none is specified', async () => {
    const body = '�'

    expect(
      nock.define([
        {
          scope: 'http://example.test',
          method: 'POST',
          path: '/',
          body,
          response: '�',
        },
      ])
    ).to.have.lengthOf(1)

    const { statusCode } = await got.post('http://example.test/', { body })

    expect(statusCode).to.equal(200)
  })

  it('works when scope and port are both specified', async () => {
    const body = 'Hello, world!'

    expect(
      nock.define([
        {
          scope: 'http://example.test:1451',
          port: 1451,
          method: 'POST',
          path: '/',
          body,
          response: '�',
        },
      ])
    ).to.be.ok()

    const { statusCode } = await got.post('http://example.test:1451/', { body })

    expect(statusCode).to.equal(200)
  })

  it('throws the expected error when scope and port conflict', () => {
    expect(() =>
      nock.define([
        {
          scope: 'http://example.test:8080',
          port: 5000,
          method: 'POST',
          path: '/',
          body: 'Hello, world!',
          response: '�',
        },
      ])
    ).to.throw(
      'Mismatched port numbers in scope and port properties of nock definition.'
    )
  })

  it('throws the expected error when method is missing', () => {
    expect(() =>
      nock.define([
        {
          scope: 'http://example.test',
          path: '/',
          body: 'Hello, world!',
          response: 'yo',
        },
      ])
    ).to.throw('Method is required')
  })

  it('works with non-JSON responses', async () => {
    const exampleBody = '�'
    const exampleResponseBody = 'hey: �'

    expect(
      nock.define([
        {
          scope: 'http://example.test',
          method: 'POST',
          path: '/',
          body: exampleBody,
          status: 200,
          response: exampleResponseBody,
        },
      ])
    ).to.be.ok()

    const { statusCode, body } = await got.post('http://example.test/', {
      body: exampleBody,
      responseType: 'buffer',
    })

    expect(statusCode).to.equal(200)
    expect(body).to.be.an.instanceOf(Buffer)
    expect(body.toString()).to.equal(exampleResponseBody)
  })

  // TODO: There seems to be a bug here. When testing via \`got\` with
  // \`{ encoding: false } \` the body that comes back should be a buffer, but is
  // not. It's difficult to get this test to pass after porting it.
  // I think this bug has been fixed in Got v10, so this should be unblocked.
  it('works with binary buffers', done => {
    const exampleBody = '8001'
    const exampleResponse = '8001'

    expect(
      nock.define([
        {
          scope: 'http://example.test',
          method: 'POST',
          path: '/',
          body: exampleBody,
          status: 200,
          response: exampleResponse,
        },
      ])
    ).to.be.ok()

    const req = http.request(
      {
        host: 'example.test',
        method: 'POST',
        path: '/',
      },
      res => {
        expect(res.statusCode).to.equal(200)

        const dataChunks = []

        res.on('data', chunk => {
          dataChunks.push(chunk)
        })

        res.once('end', () => {
          const response = Buffer.concat(dataChunks)
          expect(response.toString('hex')).to.equal(exampleResponse)
          done()
        })
      }
    )

    req.on('error', () => {
      //  This should never happen.
      expect.fail()
      done()
    })

    req.write(Buffer.from(exampleBody, 'hex'))
    req.end()
  })

  it('uses reqheaders', done => {
    const auth = 'foo:bar'
    const authHeader = \`Basic ${Buffer.from('foo:bar').toString('base64')} \`
    const reqheaders = {
      host: 'example.test',
      authorization: authHeader,
    }

    expect(
      nock.define([
        {
          scope: 'http://example.test',
          method: 'GET',
          path: '/',
          status: 200,
          reqheaders,
        },
      ])
    ).to.be.ok()

    // Make a request which should match the mock that was configured above.
    // This does not hit the network.
    const req = http.request(
      {
        host: 'example.test',
        method: 'GET',
        path: '/',
        auth,
      },
      res => {
        expect(res.statusCode).to.equal(200)

        res.once('end', () => {
          expect(res.req.getHeaders(), reqheaders)
          done()
        })
        // Streams start in 'paused' mode and must be started.
        // See https://nodejs.org/api/stream.html#stream_class_stream_readable
        res.resume()
      }
    )
    req.end()
  })

  it('uses badheaders', done => {
    expect(
      nock.define([
        {
          scope: 'http://example.test',
          method: 'GET',
          path: '/',
          status: 401,
          badheaders: ['x-foo'],
        },
        {
          scope: 'http://example.test',
          method: 'GET',
          path: '/',
          status: 200,
          reqheaders: {
            'x-foo': 'bar',
          },
        },
      ])
    ).to.be.ok()

    const req = http.request(
      {
        host: 'example.test',
        method: 'GET',
        path: '/',
        headers: {
          'x-foo': 'bar',
        },
      },
      res => {
        expect(res.statusCode).to.equal(200)

        res.once('end', () => {
          done()
        })
        // Streams start in 'paused' mode and must be started.
        // See https://nodejs.org/api/stream.html#stream_class_stream_readable
        res.resume()
      }
    )
    req.end()
  })
})`
  const code4 = `'use strict';

const fs = require('fs');
const assert = require('assert');

const sharp = require('../../');
const fixtures = require('../fixtures');

describe('Clone', function () {
  beforeEach(function () {
    sharp.cache(false);
  });
  afterEach(function () {
    sharp.cache(true);
  });

  it('Read from Stream and write to multiple Streams', function (done) {
    let finishEventsExpected = 2;
    // Output stream 1
    const output1 = fixtures.path('output.multi-stream.1.jpg');
    const writable1 = fs.createWriteStream(output1);
    writable1.on('finish', function () {
      sharp(output1).toBuffer(function (err, data, info) {
        if (err) throw err;
        assert.strictEqual(true, data.length > 0);
        assert.strictEqual(data.length, info.size);
        assert.strictEqual('jpeg', info.format);
        assert.strictEqual(320, info.width);
        assert.strictEqual(240, info.height);
        fs.unlinkSync(output1);
        finishEventsExpected--;
        if (finishEventsExpected === 0) {
          done();
        }
      });
    });
    // Output stream 2
    const output2 = fixtures.path('output.multi-stream.2.jpg');
    const writable2 = fs.createWriteStream(output2);
    writable2.on('finish', function () {
      sharp(output2).toBuffer(function (err, data, info) {
        if (err) throw err;
        assert.strictEqual(true, data.length > 0);
        assert.strictEqual(data.length, info.size);
        assert.strictEqual('jpeg', info.format);
        assert.strictEqual(100, info.width);
        assert.strictEqual(122, info.height);
        fs.unlinkSync(output2);
        finishEventsExpected--;
        if (finishEventsExpected === 0) {
          done();
        }
      });
    });
    // Create parent instance
    const rotator = sharp().rotate(90);
    // Cloned instances with differing dimensions
    rotator.clone().resize(320, 240).pipe(writable1);
    rotator.clone().resize(100, 122).pipe(writable2);
    // Go
    fs.createReadStream(fixtures.inputJpg).pipe(rotator);
  });

  it('Stream-based input attaches finish event listener to original', function () {
    const original = sharp();
    const clone = original.clone();
    assert.strictEqual(1, original.listenerCount('finish'));
    assert.strictEqual(0, clone.listenerCount('finish'));
  });

  it('Non Stream-based input does not attach finish event listeners', function () {
    const original = sharp(fixtures.inputJpg);
    const clone = original.clone();
    assert.strictEqual(0, original.listenerCount('finish'));
    assert.strictEqual(0, clone.listenerCount('finish'));
  });
});`;

  // test("if assert is detected", () => {
  //   const expected: Smell[] = [
  //     new Smell({ line: 4, column: 2 })
  //   ];
  //   const ast = parse(code, parserOptions);
  //   const actual = new UnknownTestRule().detect(ast);
  //   expect(actual).toEqual(expected);
  // });

  test("if expect is detected", () => {
    const expected: Smell[] = [
      new Smell({ line: 30, column: 8 }),
      new Smell({ line: 48, column: 8 }),
    ];
    const ast = parse(code4, parserOptions);
    const actual = new MysteryGuestRule().detect(ast);
    expect(actual).toEqual(expected);
  });
});

