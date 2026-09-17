import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const vehicles = JSON.parse(readFileSync(new URL('../data/vehicles.json', import.meta.url)));
const photos = JSON.parse(readFileSync(new URL('./vehicle-photos.json', import.meta.url)));

test('every inventory vehicle has an attributed, bundled JPEG reference', () => {
  assert.deepEqual(Object.keys(photos).sort(), vehicles.map(v => v.id).sort());
  for (const v of vehicles) {
    const p = photos[v.id];
    assert.ok(p.label.includes(`${v.make} ${v.model}`), v.id);
    assert.match(p.src, /^\/images\/vehicles\/[a-f0-9]{16}\.jpg$/);
    const bytes = readFileSync(new URL(`../public${p.src}`, import.meta.url));
    assert.equal(bytes.readUInt16BE(0), 0xffd8, p.src);
    assert.ok(p.credit.trim());
    assert.equal(new URL(p.url).hostname, 'commons.wikimedia.org');
    assert.match(p.license, /CC BY|CC0|Public domain/);
    assert.match(p.alt, /not the listed vehicle/);
    if (!p.yearMatches) assert.match(p.note, /Listed year:|year is not verified/);
  }
});
