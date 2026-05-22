'use strict';

const { once } = require("node:events");
const { Readable } = require("node:stream");
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { repacking } = require("../lib/repacking.js");

const CONTENT_LENGTH = 5000;

const buffer = Buffer.from('a'.repeat(CONTENT_LENGTH));
const byteLength = buffer.byteLength;

const readable = new Readable();
readable.push(buffer);
readable.push(null);

describe('repacking', async () => {
  await it('simple', async () => {
    const LENGTH = 32;
    const parts = [];
    for await (const buffer of repacking(readable, LENGTH)) {
      assert.ok(buffer.byteLength <= LENGTH);
      parts.push(buffer);
    }
    assert.equal(parts.length, Math.ceil(byteLength / LENGTH));
  });
});
