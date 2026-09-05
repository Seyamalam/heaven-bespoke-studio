import { mkdir, copyFile, access, stat, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  dedup,
  flatten,
  join,
  weld,
  meshopt,
  getBounds,
} from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";
await MeshoptEncoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "meshopt.encoder": MeshoptEncoder,
    "meshopt.decoder": MeshoptDecoder,
  });
await mkdir("assets/source/models", { recursive: true });
await mkdir("artifacts", { recursive: true });
const report = [];
for (const name of ["sofa", "chair", "table"]) {
  const source = `assets/source/models/${name}.glb`;
  try {
    await access(source);
  } catch {
    await copyFile(`public/models/${name}.glb`, source);
  }
  const doc = await io.read(source);
  const bounds = getBounds(doc.getRoot().listScenes()[0]);
  const primitivesBefore = doc
    .getRoot()
    .listMeshes()
    .reduce((n, m) => n + m.listPrimitives().length, 0);
  await doc.transform(
    dedup(),
    flatten(),
    join(),
    weld(),
    meshopt({ encoder: MeshoptEncoder, level: "medium" }),
  );
  await io.write(`public/models/${name}.glb`, doc);
  const verified = await io.read(`public/models/${name}.glb`);
  const after = getBounds(verified.getRoot().listScenes()[0]);
  for (let i = 0; i < 3; i++) {
    assert(Math.abs(bounds.min[i] - after.min[i]) < 0.002);
    assert(Math.abs(bounds.max[i] - after.max[i]) < 0.002);
  }
  const materials = verified
    .getRoot()
    .listMaterials()
    .map((m) => m.getName());
  assert(materials.some((m) => m.startsWith("Wood")));
  if (name !== "table") assert(materials.some((m) => m.startsWith("Fabric")));
  report.push({
    name,
    bytesBefore: (await stat(source)).size,
    bytesAfter: (await stat(`public/models/${name}.glb`)).size,
    primitivesBefore,
    primitivesAfter: verified
      .getRoot()
      .listMeshes()
      .reduce((n, m) => n + m.listPrimitives().length, 0),
  });
}
await writeFile(
  "artifacts/model-optimization.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
