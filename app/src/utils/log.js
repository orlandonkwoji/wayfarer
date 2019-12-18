import debug from 'debug';

export default function logger(message) {
  return debug('dev')(message);
}
