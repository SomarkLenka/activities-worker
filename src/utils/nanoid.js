// In-house nanoid implementation
// Generates cryptographically secure random IDs

const urlAlphabet = 'useandom26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

export function nanoid(size = 21) {
  let id = '';
  const bytes = crypto.getRandomValues(new Uint8Array(size));

  while (size--) {
    id += urlAlphabet[bytes[size] & 63];
  }

  return id;
}

export function customAlphabet(alphabet, defaultSize = 21) {
  return (size = defaultSize) => {
    let id = '';
    const mask = (2 << Math.log2(alphabet.length - 1)) - 1;
    const step = -~((1.6 * mask * size) / alphabet.length);

    while (true) {
      const bytes = crypto.getRandomValues(new Uint8Array(step));
      let i = step;

      while (i--) {
        id += alphabet[bytes[i] & mask] || '';
        if (id.length >= size) return id;
      }
    }
  };
}
