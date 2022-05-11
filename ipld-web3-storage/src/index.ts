#!/usr/bin/env tsm

import * as url from 'url';

if (isMain()) {
  console.log('main');
}

function isMain() {
  return require.main === module;
}