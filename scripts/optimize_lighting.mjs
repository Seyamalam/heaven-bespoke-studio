import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
await mkdir("public/lighting", { recursive: true });
await mkdir("artifacts", { recursive: true });
const report = [];
for (const surface of ["floor", "back-wall"])
  for (const kind of ["ao", "bounce"]) {
    const name = `${surface}-${kind}`,
      source = `assets/source/lighting/${name}.png`;
    const stats = await sharp(source).stats();
    assert(
      stats.channels[0].max - stats.channels[0].min > 15,
      `${name} must contain varied lighting`,
    );
    assert(stats.channels[0].mean > 2, `${name} must contain nonblack light`);
    const info = await sharp(source)
      .blur(1.1)
      .webp({ quality: 88 })
      .toFile(`public/lighting/${name}.webp`);
    report.push({
      name,
      bytes: info.size,
      min: stats.channels[0].min,
      max: stats.channels[0].max,
      mean: stats.channels[0].mean,
    });
  }
await writeFile(
  "artifacts/lighting-check.json",
  JSON.stringify(report, null, 2),
);
console.log(report);
