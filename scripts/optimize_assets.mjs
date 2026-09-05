import sharp from 'sharp';
import { stat } from 'node:fs/promises';
for (const name of ['living','bedroom','dining','materials']) {
  const source = `assets/source/images/${name}.png`;
  await sharp(source).resize({width:1536,withoutEnlargement:true}).webp({quality:86}).toFile(`public/images/${name}.webp`);
  await sharp(source).resize({width:800}).webp({quality:82}).toFile(`public/images/${name}-800.webp`);
  console.log(name, Math.round((await stat(`public/images/${name}.webp`)).size/1024), 'KB');
}
for (const name of ['sofa','chair','table']) await sharp(`public/images/${name}-poster.png`).webp({quality:88}).toFile(`public/images/${name}-poster.webp`);
