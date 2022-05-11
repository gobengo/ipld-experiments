#!/usr/bin/env tsm
if (isMain()) {
    console.log('main');
}
function isMain() {
    return require.main === module;
}
export {};
