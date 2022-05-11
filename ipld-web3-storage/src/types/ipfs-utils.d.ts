declare module 'ipfs-utils' {
  module global {
    namespace fs {
      type FsReadStream = import('fs').ReadStream;
      const ReadStream: FsReadStream;
    }
  }
}
