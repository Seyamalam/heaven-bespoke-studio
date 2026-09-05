// Original illustrative material study. Geometry is procedural; light is interactive.
struct Params {
  color: vec3f,
  kind: f32,
  light: vec2f,
  warmth: f32,
  zoom: f32,
  aspect: f32,
}
@group(0) @binding(0) var<uniform> params: Params;

fn noise(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);
}

fn heightAt(p: vec2f) -> f32 {
  if params.kind > 0.5 {
    let grain = p.y * 4.2 + sin(p.x * 0.38) * 2.5 + sin(p.y * 0.33 + p.x * 0.1);
    return sin(grain) * 0.14 + sin(grain * 3.1) * 0.035 + sin(grain * 11.0) * 0.014;
  }
  let cell = floor(p);
  let local = fract(p) - 0.5;
  let warp = cos(local.x * 3.1415926);
  let weft = cos(local.y * 3.1415926);
  let alternating = (i32(cell.x) + i32(cell.y)) & 1;
  let fiber = sin(p.x * 48.0 + p.y * 0.5) * 0.018;
  if alternating == 0 { return warp * 0.29 + weft * 0.09 + fiber; }
  return weft * 0.29 + warp * 0.09 + sin(p.y * 48.0) * 0.018;
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let p = (uv - 0.5) * vec2f(params.aspect, 1.0) * (32.0 / params.zoom) + 60.0;
  let e = 0.018;
  let h = heightAt(p);
  let dx = (heightAt(p + vec2f(e, 0.0)) - heightAt(p - vec2f(e, 0.0))) / (2.0 * e);
  let dy = (heightAt(p + vec2f(0.0, e)) - heightAt(p - vec2f(0.0, e))) / (2.0 * e);
  let normal = normalize(vec3f(-dx * 0.72, -dy * 0.72, 1.0));
  let lightDir = normalize(vec3f((params.light - uv) * 3.5, 0.72));
  let diffuse = max(dot(normal, lightDir), 0.0);
  let halfDir = normalize(lightDir + vec3f(0.0, 0.0, 1.0));
  let highlight = pow(max(dot(normal, halfDir), 0.0), select(10.0, 40.0, params.kind > 0.5));
  let grain = noise(floor(p * 35.0)) * 0.032;
  let vignette = 1.0 - smoothstep(0.3, 0.9, distance(uv, vec2f(0.5))) * 0.2;
  let temperature = mix(vec3f(0.99, 1.0, 1.03), vec3f(1.13, 0.94, 0.74), params.warmth);
  let lit = params.color * (0.54 + diffuse * 0.52 + h * 0.19 + grain) + highlight * select(0.075, 0.18, params.kind > 0.5);
  return vec4f(clamp(lit * temperature * vignette, vec3f(0.0), vec3f(1.0)), 1.0);
}
