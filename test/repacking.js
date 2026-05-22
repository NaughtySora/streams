'use strict';

const assert = require("node:assert/strict");
const { Readable, Writable, } = require("node:stream");
const { pipeline } = require("node:stream/promises");
const { describe, it } = require("node:test");
const { repacking, Repacking } = require("../lib/repacking.js");
const { setTimeout } = require("node:timers/promises");

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

  await it('repacking signal - passed', async () => {
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    const SIZE = 8;
    const parts = [];
    const signal = AbortSignal.timeout(1000);
    for await (const buffer of repacking(readable, { size: SIZE, signal })) {
      assert.ok(buffer.byteLength <= SIZE);
      parts.push(buffer);
    }
    assert.equal(parts.length, Math.ceil(byteLength / SIZE));
  });

  await it('repacking signal - aborted', async () => {
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    const SIZE = 8;
    const signal = AbortSignal.timeout(500);
    await setTimeout(500);
    await assert.rejects(async () => {
      const gen = repacking(readable, { size: SIZE, signal });
      for await (const buffer of gen) { }
    }, { message: 'Repacking aborted' });
  });

  await it('Repacking signal - aborted', async () => {
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    const SIZE = 1000;
    const parts = [];
    const signal = AbortSignal.timeout(500);
    const writable = new Writable({
      async write(chunk, encoding, next) {
        parts.push(chunk);
        next();
      }
    });
    await assert.rejects(async () => {
      await setTimeout(500);
      await pipeline(
        readable,
        Repacking.from({ size: SIZE, signal }),
        writable,
      );
    }, { message: 'Repacking aborted' });
  });
});
