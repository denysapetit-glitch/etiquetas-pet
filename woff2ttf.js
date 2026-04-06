// Converts a WOFF file buffer to a TTF buffer (WOFF → sfnt/TTF)
const fs = require('fs');
const zlib = require('zlib');

function woff2ttf(woffBuf) {
  const sig = woffBuf.readUInt32BE(0);
  if (sig !== 0x774F4646) throw new Error('Not a WOFF file, magic: 0x' + sig.toString(16));

  const flavor = woffBuf.readUInt32BE(4);
  const numTables = woffBuf.readUInt16BE(12);

  // Parse WOFF table directory (starts at byte 44, each entry = 20 bytes)
  const tables = [];
  for (let i = 0; i < numTables; i++) {
    const base = 44 + i * 20;
    tables.push({
      tag:        woffBuf.slice(base, base + 4).toString('ascii'),
      offset:     woffBuf.readUInt32BE(base + 4),
      compLength: woffBuf.readUInt32BE(base + 8),
      origLength: woffBuf.readUInt32BE(base + 12),
      checksum:   woffBuf.readUInt32BE(base + 16),
    });
  }

  // Sort tables by tag (required in sfnt)
  tables.sort((a, b) => a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0);

  // sfnt search values
  let sr = 1, es = 0;
  while (sr * 2 <= numTables) { sr *= 2; es++; }
  const searchRange = sr * 16;
  const entrySelector = es;
  const rangeShift = numTables * 16 - searchRange;

  // Calculate output offsets (tables start after header + directory)
  const headerSize = 12 + numTables * 16;
  let currentOffset = headerSize;
  for (const t of tables) {
    t.sfntOffset = currentOffset;
    currentOffset += (t.origLength + 3) & ~3; // 4-byte align
  }

  const out = Buffer.alloc(currentOffset, 0);

  // Write sfnt header
  out.writeUInt32BE(flavor, 0);
  out.writeUInt16BE(numTables, 4);
  out.writeUInt16BE(searchRange, 6);
  out.writeUInt16BE(entrySelector, 8);
  out.writeUInt16BE(rangeShift, 10);

  // Write table directory entries and decompress table data
  for (let i = 0; i < numTables; i++) {
    const t = tables[i];
    // Directory entry
    const de = 12 + i * 16;
    out.write(t.tag, de, 'ascii');
    out.writeUInt32BE(t.checksum, de + 4);
    out.writeUInt32BE(t.sfntOffset, de + 8);
    out.writeUInt32BE(t.origLength, de + 12);

    // Table data: decompress if needed
    const woffData = woffBuf.slice(t.offset, t.offset + t.compLength);
    const tableData = (t.compLength < t.origLength) ? zlib.inflateSync(woffData) : woffData;
    tableData.copy(out, t.sfntOffset);
  }

  return out;
}

const folder = 'C:/Users/ApetitPet/Videos/Geraretiqueta';
const nm = folder + '/node_modules/@fontsource/fredoka/files/';

const regular = woff2ttf(fs.readFileSync(nm + 'fredoka-latin-400-normal.woff'));
const bold    = woff2ttf(fs.readFileSync(nm + 'fredoka-latin-600-normal.woff'));

// Verify TTF magic
console.log('Regular magic:', regular.slice(0, 4).toString('hex'), '(should be 00010000 or 74727565)');
console.log('Bold magic:', bold.slice(0, 4).toString('hex'));

const regB64  = regular.toString('base64');
const boldB64 = bold.toString('base64');

fs.writeFileSync(folder + '/fredoka-regular_b64.txt', regB64);
fs.writeFileSync(folder + '/fredoka-bold_b64.txt', boldB64);
console.log('Regular b64:', regB64.length, '| Bold b64:', boldB64.length);
