'use strict';

const { Readable, PassThrough } = require('node:stream');

const web = ReadableStream.prototype;

const tee = readable => web.tee.call(Readable.toWeb(readable))
  .map((readable) => Readable.fromWeb(readable));

const t = source => {
  const a = new PassThrough();
  const b = new PassThrough();
  source.pipe(a);
  source.pipe(b);
  return [a, b];
};

module.exports = { tee, t };