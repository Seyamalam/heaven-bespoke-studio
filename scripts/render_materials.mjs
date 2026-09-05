import { Buffer } from "node:buffer";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import sharp from "sharp";
import { init, effect, target } from "vgpu/node";

const gpu = await init();
try {
  const shader = await readFile("src/shaders/material.wgsl", "utf8");
  const output = target(gpu, { size: [640, 640] });
  const study = effect(gpu, shader);
  const colors = {
    olive: "#878b6c",
    oatmeal: "#c7bca5",
    terracotta: "#ac7460",
    teal: "#345b54",
    walnut: "#64432b",
    oak: "#b29160",
    smoked: "#39312b",
  };
  const report = [];
  await mkdir("artifacts", { recursive: true });
  for (const [name, hex] of Object.entries(colors)) {
    const color = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const params = {
      color,
      kind: ["walnut", "oak", "smoked"].includes(name) ? 1 : 0,
      light: [0.25, 0.2],
      warmth: 0.15,
      zoom: 1.4,
      aspect: 1,
    };
    study.set({ params });
    study.draw(output);
    const pixels = await output.read();
    let min = 255,
      max = 0,
      sum = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      min = Math.min(min, pixels[i]);
      max = Math.max(max, pixels[i]);
      sum += pixels[i];
      assert.equal(pixels[i + 3], 255);
    }
    assert(max - min > 20, `${name} should have visible surface shading`);
    await sharp(Buffer.from(pixels), {
      raw: { width: 640, height: 640, channels: 4 },
    })
      .webp({ quality: 88 })
      .toFile(`public/images/material-${name}.webp`);
    study.set({ params: { light: [0.85, 0.8], warmth: 0.9 } });
    study.draw(output);
    const changed = await output.read();
    let difference = 0;
    for (let i = 0; i < pixels.length; i += 4)
      difference += Math.abs(changed[i] - pixels[i]);
    difference /= pixels.length / 4;
    assert(difference > 2, `${name} responds to light`);
    report.push({
      name,
      min,
      max,
      mean: sum / (pixels.length / 4),
      meanLightDifference: difference,
    });
  }
  await writeFile(
    "artifacts/material-gpu-check.json",
    JSON.stringify({ status: "passed", materials: report }, null, 2),
  );
  console.log(JSON.stringify({ status: "passed", materials: report }));
} finally {
  gpu.dispose();
}
