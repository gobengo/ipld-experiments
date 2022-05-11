#!/usr/bin/env tsm
import * as url from 'url';
import * as Block from 'multiformats/block';
import * as dagCbor from '@ipld/dag-cbor';
import { sha256 } from 'multiformats/hashes/sha2';
import { CarWriter } from '@ipld/car/writer';
import { CarReader } from '@ipld/car/reader';
import { PassThrough, Readable, Transform } from 'stream';
import * as fs from 'fs';
import * as dagJson from '@ipld/dag-json';
import { CID } from 'multiformats';
import { pack } from 'ipfs-car/pack';
import * as jsonCodec from 'multiformats/codecs/json';
import * as IPFS from 'ipfs-core';

if (shouldRunMain()) {
  (async () => {
    try {
      await main();
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })();
}

async function main() {
  const alice = { name: 'alice' };

  // create block
  const aliceBlock = await Block.encode({
    value: alice,
    codec: dagJson,
    hasher: sha256,
  });

  const ben = {
    name: 'ben',
    follows: [aliceBlock.cid],
  };
  const benBlock = await Block.encode({
    value: ben,
    codec: dagJson,
    hasher: sha256,
  });

  // create car w/ block
  const carWritable = new PassThrough();
  const car = Readable.from(carWritable);
  const writerChannel = CarWriter.create([benBlock.cid]);
  Readable.from(writerChannel.out).pipe(carWritable);
  await writerChannel.writer.put(aliceBlock);
  await writerChannel.writer.put(benBlock);
  await writerChannel.writer.close();

  // read car roots
  const reader = await CarReader.fromIterable(Readable.from(car));
  const roots = await reader.getRoots();
  const block1 = await reader.get(roots[0]);
  console.log('block1', decode(block1));

  // add to IPFS
  const ipfs = await IPFS.create({ start: true });

  await ipfs.stop();
}

function shouldRunMain() {
  return require.main === module;
}

const codecs = {
  [dagCbor.code]: dagCbor,
  // [dagPb.code]: dagPb,
  [dagJson.code]: dagJson,
  // [raw.code]: raw,
  // [json.code]: json,
};

function decode(block: { cid: CID; bytes: ArrayBuffer }) {
  const { cid, bytes } = block;
  if (!codecs[cid.code]) {
    throw new Error(`Unknown codec code: 0x${cid.code.toString(16)}`);
  }
  return codecs[cid.code].decode(bytes);
}
