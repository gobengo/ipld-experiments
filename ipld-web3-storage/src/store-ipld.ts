#!/usr/bin/env tsm

import * as url from 'url';

if (import.meta.url === url.pathToFileURL(process.argv[1]).href) {
  await main();
}

async function main() {
  console.log('foo');
}
