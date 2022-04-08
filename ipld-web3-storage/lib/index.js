import * as url from 'url';
if (import.meta.url === url.pathToFileURL(process.argv[1]).href) {
    console.log(sayHelloWorld('ben'));
}
export function sayHelloWorld(world) {
    return "Hello ".concat(world);
}
