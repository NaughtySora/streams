'use strict';

const { once } = require("node:events");
const { PassThrough, Transform } = require("node:stream");

// add signal, options

async function* repacking(readable, size) {
  const pass = new PassThrough();
  readable.pipe(pass);
  let filled = 0;
  let buffer = Buffer.allocUnsafeSlow(size);
  for await (const source of pass) {
    let offset = 0;
    while (offset < source.byteLength) {
      const fill = Math.min(size - filled, source.byteLength - offset);
      source.copy(buffer, filled, offset, offset + next);
      offset += fill;
      filled += fill;
      if (filled === size) {
        yield buffer;
        buffer = Buffer.allocUnsafeSlow(size);
        filled = 0;
      }
    }
  }
  if (filled > 0) yield buffer.subarray(0, filled);
}

function Repacking(readable, size) {
  return Transform.from(repacking(readable, size));
}

module.exports = {
  repacking,
  Repacking,
};