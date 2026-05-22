'use strict';

const assert = require("node:assert/strict");
const { Readable, Writable, } = require("node:stream");
const { pipeline } = require("node:stream/promises");
const { describe, it } = require("node:test");
const { repacking, Repacking } = require("../lib/repacking.js");

const CONTENT_LENGTH = 5000;

const buffer = Buffer.from('a'.repeat(CONTENT_LENGTH));
const byteLength = buffer.byteLength;

describe('repacking', async () => {
  await it('simple', async () => {
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    const SIZE = 32;
    const parts = [];
    for await (const buffer of repacking(readable, { size: SIZE })) {
      assert.ok(buffer.byteLength <= SIZE);
      parts.push(buffer);
    }
    assert.equal(parts.length, Math.ceil(byteLength / SIZE));
  });

  await it('Repacking', async () => {
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    const SIZE = 1000;
    const parts = [];
    const writable = new Writable({
      write(chunk, encoding, next) {
        parts.push(chunk);
        assert.equal(chunk.byteLength, SIZE);
        next();
      }
    });
    await pipeline(
      readable,
      Repacking.from({ size: SIZE }),
      writable,
    );
    assert.equal(parts.length, Math.ceil(byteLength / SIZE));
  });
});
