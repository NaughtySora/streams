'use strict';

const { once } = require("node:events");
const { PassThrough, Transform } = require("node:stream");

async function* repacking(readable, { size, signal } = {}) {
  const pass = new PassThrough();
  readable.pipe(pass);
  let filled = 0;
  let buffer = Buffer.allocUnsafeSlow(size);
  for await (const source of pass) {
    let offset = 0;
    while (offset < source.byteLength) {
      if (signal && signal.aborted) {
        pass.destroy();
        throw new Error('Repacking aborted');
      }
      const fill = Math.min(size - filled, source.byteLength - offset);
      source.copy(buffer, filled, offset, offset += fill);
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

class Repacking {
  constructor(stream, options) {
    return Transform.from(repacking(
      stream,
      options,
    ));
  }

  static from(options) {
    return stream => new Repacking(stream, options);
  }
}


module.exports = {
  repacking,
  Repacking,
};
