import { execFile } from "node:child_process";
import { Buffer } from "node:buffer";
import { setTimeout } from "node:timers";
import { promisify } from "node:util";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Real browser input against production. Only the cursor overlay is injected.
// Requires agent-browser's upstream --fps support (newer than npm 0.36.0).
const exec = promisify(execFile);
const bin = process.env.RECORD_BROWSER_BIN || "agent-browser";
const session = "heaven-film-60fps";
const output = path.resolve("artifacts/recording");
await mkdir(output, { recursive: true });
const log = [];
async function ab(...args) {
  const { stdout } = await exec(
    bin,
    ["--session", session, "--json", ...args],
    {
      maxBuffer: 4 * 1024 * 1024,
      timeout: 30000,
    },
  );
  const result = JSON.parse(stdout);
  if (!result.success) throw new Error(result.error);
  return result.data;
}
const js = async (source) =>
  (await ab("eval", "-b", Buffer.from(source).toString("base64"))).result;
const hold = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let pointer = [1100, 500];
async function move(x, y, duration = 360) {
  const start = [...pointer];
  const frames = 15;
  for (let i = 1; i <= frames; i++) {
    const t = i / frames;
    const k = t * t * (3 - 2 * t);
    await ab(
      "mouse",
      "move",
      String(Math.round(start[0] + (x - start[0]) * k)),
      String(Math.round(start[1] + (y - start[1]) * k)),
    );
    await hold(duration / frames);
  }
  pointer = [x, y];
}
async function box(selector) {
  return js(
    `(() => {const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing element');const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};})()`,
  );
}
async function reveal(selector, top = 140) {
  await js(
    `window.scrollTo({top:Math.max(0,scrollY+document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect().top-${top}),behavior:'smooth'})`,
  );
  await hold(800);
}
async function click(selector) {
  let r = await box(selector);
  if (r.y < 30 || r.y + r.h > 1050) {
    await reveal(selector, 580);
    r = await box(selector);
  }
  await move(r.x + r.w / 2, r.y + r.h / 2);
  await ab("mouse", "down", "left");
  await hold(85);
  await ab("mouse", "up", "left");
  await hold(220);
}
async function button(name, scope = "") {
  const selector = await js(
    `(() => {const root=document.querySelector(${JSON.stringify(scope || "body")});const e=[...root.querySelectorAll('button')].find(e=>(e.getAttribute('aria-label')||e.innerText).replace(/\\s+/g,' ').trim()===${JSON.stringify(name)});if(!e)throw Error('Button missing: '+${JSON.stringify(name)});e.dataset.filmTarget='active';return '[data-film-target="active"]';})()`,
  );
  await click(selector);
  await js(
    `document.querySelector('[data-film-target="active"]')?.removeAttribute('data-film-target')`,
  );
}
async function slider(label, proportion) {
  const selector = `input[aria-label="${label}"]`;
  const r = await box(selector);
  await move(r.x + 8 + (r.w - 16) * proportion, r.y + r.h / 2);
  await ab("mouse", "down", "left");
  await hold(90);
  await ab("mouse", "up", "left");
  await hold(350);
}
const cursor = `(() => {
  const el=document.createElement('div');el.id='film-cursor';el.setAttribute('aria-hidden','true');
  el.style.cssText='position:fixed;left:0;top:0;pointer-events:none;z-index:2147483647;width:25px;height:32px;transform:translate(1100px,500px);filter:drop-shadow(0 1px 2px #0005)';
  el.innerHTML='<svg viewBox="0 0 25 32" width="25" height="32"><path d="M3 2 L3 25 L9 19 L14 29 L19 27 L14 17 L23 17 Z" fill="#182d28" stroke="white" stroke-width="2" stroke-linejoin="round"/></svg>';
  document.body.append(el);
  addEventListener('pointermove',e=>{const parent=document.querySelector('dialog[open]')||document.body;if(el.parentNode!==parent)parent.append(el);el.style.transform='translate('+e.clientX+'px,'+e.clientY+'px)'},true);
  addEventListener('pointerdown',()=>el.animate([{scale:1},{scale:.8},{scale:1}],{duration:260}),true);
})()`;
let started = false;
let beginning = 0;
async function chapter(name) {
  const time = (Date.now() - beginning) / 1000;
  log.push({ time, name });
  console.log(`${time.toFixed(1)}s ${name}`);
}
try {
  await ab("--webgpu", "open", "https://heaven-bespoke-studio.vercel.app/");
  await ab("set", "viewport", "1920", "1080");
  await ab(
    "record",
    "start",
    path.join(output, "heaven-walkthrough-raw.mp4"),
    "https://heaven-bespoke-studio.vercel.app/",
    "--fps",
    "60",
  );
  started = true;
  beginning = Date.now();
  await ab(
    "wait",
    "--fn",
    "document.fonts.status === 'loaded' && [...document.images].filter(i=>i.getBoundingClientRect().top<1080).every(i=>i.complete)",
  );
  await js(cursor);
  await chapter("A home, unmistakably yours");
  await hold(1800);
  await button("02 Bedroom");
  await hold(900);
  await button("03 Dining");
  await hold(900);
  await button("01 Living");
  await reveal("#collections", 100);
  await hold(1100);
  await chapter("An interactive room");
  await reveal("#room", 70);
  await hold(650);
  await button("Step inside the room");
  await ab("wait", "--fn", "document.querySelector('#room canvas') !== null");
  await reveal("#room canvas", 110);
  await hold(1500);
  await button("Settle in");
  await hold(950);
  await button("The whole room");
  await hold(650);
  await button("Time to unwind");
  await hold(650);
  await button("Gather together");
  await slider("Room daylight", 0.19);
  await button("Lamp off");
  await hold(850);
  await button("Curtains drawn");
  await hold(600);
  await slider("Room daylight", 0.76);
  await button("Lamp on");
  await button("Room finish: Deep teal");
  await chapter("Place, rotate, and measure");
  await button("Arrange your furniture");
  await hold(900);
  await reveal("#room canvas", 20);
  const room = await box("#room canvas");
  await move(room.x + room.w * 0.345, room.y + room.h * 0.54);
  await ab("mouse", "down", "left");
  await move(room.x + room.w * 0.4, room.y + room.h * 0.67, 1000);
  await ab("mouse", "up", "left");
  await hold(400);
  await button("Turn furniture right 15 degrees");
  await hold(700);
  await button("Finish arranging");
  await button("The whole room");
  await hold(700);
  await button("Share this room");
  await hold(900);
  await chapter("A bespoke piece and live materials");
  await button("Fine-tune this piece");
  await hold(700);
  await button("Explore in 3D");
  await ab("wait", "--fn", "document.querySelector('#studio canvas') !== null");
  await reveal("#studio .studio-layout", 140);
  await hold(850);
  await button("Rotate piece right");
  await button("Show dimensions");
  await slider("Furniture width", 0.85);
  await button("Meet the materials Move the light. Explore the texture.");
  await ab(
    "wait",
    "--fn",
    "document.querySelector('dialog[open] canvas') !== null",
  );
  await hold(650);
  const mat = await box("dialog[open] canvas");
  await move(mat.x + mat.w * 0.2, mat.y + mat.h * 0.2, 400);
  await move(mat.x + mat.w * 0.82, mat.y + mat.h * 0.6, 1100);
  await button("Wood finish", "dialog[open]");
  await hold(700);
  await move(mat.x + mat.w * 0.25, mat.y + mat.h * 0.7, 800);
  await slider("Material light warmth", 0.7);
  await button("Use this finish");
  await button("Save my direction");
  await chapter("From a design to a conversation");
  await reveal("#room .room-sharing", 730);
  await button("Let’s talk about your room");
  await ab("wait", "input[name=name]");
  await click("input[name=name]");
  await ab("keyboard", "type", "Ayesha");
  await button("Review your inquiry");
  await hold(1500);
  await button("Close consultation");
  await reveal("#process", 100);
  await hold(1000);
  await reveal("#visit", 100);
  await hold(1000);
  await js("window.scrollTo({top:0,behavior:'smooth'})");
  await hold(1800);
  await chapter("End");
} finally {
  if (started) {
    const capture = await ab("record", "stop");
    console.log(capture);
    await writeFile(
      path.join(output, "capture.json"),
      JSON.stringify(capture, null, 2),
    );
  }
  await writeFile(
    path.join(output, "chapters.json"),
    JSON.stringify(log, null, 2),
  );
  await ab("close");
}

await exec("ffmpeg", [
  "-y",
  "-v",
  "error",
  "-i",
  path.join(output, "heaven-walkthrough-raw.mp4"),
  "-c:v",
  "libx264",
  "-preset",
  "slow",
  "-crf",
  "18",
  "-pix_fmt",
  "yuv420p",
  "-an",
  "-movflags",
  "+faststart",
  path.join(output, "heaven-hackathon-1080p60.mp4"),
]);
