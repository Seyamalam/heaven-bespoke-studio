// Original, input-driven architectural surface shaders. No time uniform or idle loop.
export const surfaceVertex = `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
export const floorFragment = `
  varying vec2 vUv;
  uniform vec3 tone;
  uniform float daylight;
  uniform float curtains;
  uniform sampler2D occlusion;
  uniform sampler2D bounce;
  float noise(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  void main() {
    vec2 p = vUv * vec2(7.0, 19.0);
    float row = floor(p.y);
    p.x += mod(row, 2.0) * 0.5;
    vec2 cell = fract(p);
    float seam = smoothstep(0.005, 0.025, min(cell.x, cell.y));
    float grain = sin(p.x * 65.0 + sin(p.y * 4.0) * 2.0) * 0.018;
    float variation = noise(vec2(floor(p.x), row)) * 0.12;
    vec3 wood = tone * (0.76 + variation + grain) * mix(0.7, 1.0, seam);
    vec2 lightUv = vUv + vec2((vUv.y - 0.5) * 0.38, 0.0);
    lightUv.x -= (daylight - 0.5) * 0.24;
    float sunWindow = smoothstep(0.12, 0.17, lightUv.x) * (1.0 - smoothstep(0.78, 0.84, lightUv.x));
    sunWindow *= smoothstep(0.17, 0.22, lightUv.y) * (1.0 - smoothstep(0.81, 0.86, lightUv.y));
    float bars = smoothstep(0.02, 0.05, abs(fract(lightUv.x * 5.0) - 0.5));
    float crossbar = smoothstep(0.015, 0.035, abs(lightUv.y - 0.52));
    vec3 lightColor = mix(vec3(1.0,0.73,0.46), vec3(1.0,0.95,0.79), daylight);
    vec3 lit = wood * mix(0.44, 1.15, daylight) + lightColor * sunWindow * bars * crossbar * daylight * mix(0.34, 0.18, curtains);
    float bakedAO = texture2D(occlusion, vUv).r;
    lit = lit * mix(0.55, 1.0, bakedAO) + tone * texture2D(bounce,vUv).rgb * daylight * 0.85;
    float edge = smoothstep(0.0, 0.22, vUv.y) * smoothstep(0.0,0.12,vUv.x);
    gl_FragColor = vec4(lit * mix(0.76,1.0,edge), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
export const rugFragment = `
  varying vec2 vUv;
  uniform vec3 tone;
  uniform float daylight;
  uniform sampler2D occlusion;
  void main() {
    float edge = min(min(vUv.x,1.0-vUv.x),min(vUv.y,1.0-vUv.y));
    float border = smoothstep(0.035,0.039,edge) - smoothstep(0.047,0.051,edge);
    vec2 p = vUv * 260.0;
    vec2 aa = fwidth(p);
    float weave = sin(p.x*3.14159)*sin(p.y*3.14159) * max(0.0,1.0-max(aa.x,aa.y)) * 0.025;
    float bakedAO = texture2D(occlusion, vec2(0.5,0.43)+(vUv-0.5)*vec2(4.45/6.4,2.9/5.0)).r;
    gl_FragColor = vec4(mix(0.65,1.0,bakedAO) * tone * (0.9 + weave - border*0.18) * mix(0.48,1.0,daylight),1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
export const artworkFragment = `
  varying vec2 vUv;
  uniform vec3 tone;
  void main() {
    vec2 p = vUv - vec2(0.5,0.48);
    float arch = smoothstep(0.22,0.225,length(vec2(p.x*0.85,max(p.y,0.0))));
    float circle = 1.0-smoothstep(0.165,0.17,length(p-vec2(0.12,0.15)));
    float lines = smoothstep(0.4,0.6,sin((p.x+p.y*0.25)*110.0));
    vec3 paper = vec3(0.83,0.80,0.71);
    vec3 col = mix(tone,paper,arch);
    col = mix(col,vec3(0.47,0.35,0.23),circle*0.6);
    col += lines * (1.0-arch)*0.035;
    gl_FragColor = vec4(col,1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
