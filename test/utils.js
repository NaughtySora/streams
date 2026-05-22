'use strict';

const assert = require("node:assert/strict");
const { Readable, } = require("node:stream");
const { describe, it } = require("node:test");
const { tee, t } = require("../lib/utils.js");
const { once } = require("node:events");

const CONTENT_LENGTH = 50;

const { push } = Array.prototype;

const buffer = Buffer.from('a'.repeat(CONTENT_LENGTH));
const byteLength = buffer.byteLength;

describe('utils', async () => {
  await it('tee', async () => {
    const readable = Readable.from(buffer);
    const pair = tee(readable);
    let parts = [];
    const put = push.bind(parts);
    for (const stream of pair) stream.on('data', put);
    await Promise.all([
      once(pair[0], 'end'),
      once(pair[1], 'end'),
    ]);
    parts = Buffer.concat(parts);
    assert.equal(parts.length, byteLength * pair.length);
  });

  await it('t', async () => {
    const readable = Readable.from(buffer);
    const pair = t(readable);
    let parts = [];
    const put = push.bind(parts);
    for (const stream of pair) stream.on('data', put);
    await Promise.all([
      once(pair[0], 'end'),
      once(pair[1], 'end'),
    ]);
    parts = Buffer.concat(parts);
    assert.equal(parts.length, byteLength * pair.length);
  });

});