import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  Color,
  DoubleSide,
  PlaneGeometry,
  Vector3,
  PCFSoftShadowMap,
} from "three";
import type { Design, FurnitureKey } from "../lib/design";
import { furniture, woods } from "../lib/design";
import { arrangements, wallTones } from "../lib/room";
import type { RoomSettings } from "../lib/room";
import {
  surfaceVertex,
  floorFragment,
  rugFragment,
  artworkFragment,
} from "../lib/roomShaders";
import { ContextMonitor, FurnitureModel } from "./FurnitureObjects";

function CameraGuide({
  settings,
  version,
}: {
  settings: RoomSettings;
  version: number;
}) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, invalidate, size } = useThree();
  const moving = useRef(false);
  const position = useRef(new Vector3());
  const target = useRef(new Vector3());
  useEffect(() => {
    const presets = {
      overview: { p: [7.6, 5.6, 9.6], t: [0, 0.85, 0] },
      sofa: { p: [3.3, 2.35, 4.0], t: [0.3, 0.6, -1.2] },
      chair: { p: [1.25, 1.85, 3.5], t: [-1.45, 0.55, 0.25] },
      top: { p: [0, 10.8, 3.7], t: [0, 0, 0] },
    };
    const shot = presets[settings.view];
    position.current.set(shot.p[0], shot.p[1], shot.p[2]);
    if (size.width < 600 && settings.view === "overview")
      position.current.multiplyScalar(
        Math.max(1.15, 0.92 / (size.width / size.height)),
      );
    target.current.set(shot.t[0], shot.t[1], shot.t[2]);
    // Keep the destination inside the orbit limit, including tall phone views.
    if (position.current.distanceTo(target.current) > 30) {
      position.current.sub(target.current).setLength(30).add(target.current);
    }
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      controls.current
    ) {
      camera.position.copy(position.current);
      controls.current.target.copy(target.current);
      controls.current.update();
    } else moving.current = true;
    invalidate();
  }, [settings.view, version, camera, invalidate, size.width, size.height]);
  useFrame((_, delta) => {
    if (!moving.current || !controls.current) return;
    const factor = 1 - Math.exp(-6 * Math.min(delta, 0.1));
    camera.position.lerp(position.current, factor);
    controls.current.target.lerp(target.current, factor);
    controls.current.update();
    if (
      camera.position.distanceTo(position.current) < 0.008 &&
      controls.current.target.distanceTo(target.current) < 0.008
    )
      moving.current = false;
    else invalidate();
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping={false}
      enablePan={false}
      minDistance={2.1}
      maxDistance={32}
      minPolarAngle={0.08}
      maxPolarAngle={Math.PI / 2.08}
      minAzimuthAngle={-0.7}
      maxAzimuthAngle={1.5}
      onStart={() => {
        moving.current = false;
      }}
    />
  );
}
function RenderActivity() {
  const gl = useThree((state) => state.gl);
  const count = useRef(0);
  useFrame(() => {
    gl.domElement.setAttribute("data-render-frames", String(++count.current));
  });
  return null;
}
function TimberFloor({ settings }: { settings: RoomSettings }) {
  const uniforms = useMemo(
    () => ({
      tone: { value: new Color("#b89672") },
      daylight: { value: settings.daylight / 100 },
      curtains: { value: settings.curtains ? 1 : 0 },
    }),
    [settings.daylight, settings.curtains],
  );
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.003, 0]}>
        <planeGeometry args={[6.4, 5]} />
        <shaderMaterial
          vertexShader={surfaceVertex}
          fragmentShader={floorFragment}
          uniforms={uniforms}
        />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.001, 0]}
        receiveShadow
      >
        <planeGeometry args={[6.4, 5]} />
        <shadowMaterial transparent opacity={0.19} />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[6.4, 0.18, 5]} />
        <meshStandardMaterial color="#a18970" roughness={0.85} />
      </mesh>
    </>
  );
}
function Rug({ daylight }: { daylight: number }) {
  const uniforms = useMemo(
    () => ({
      tone: { value: new Color("#cdc6b4") },
      daylight: { value: daylight / 100 },
    }),
    [daylight],
  );
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0.35]}>
        <planeGeometry args={[4.45, 2.9]} />
        <shaderMaterial
          vertexShader={surfaceVertex}
          fragmentShader={rugFragment}
          uniforms={uniforms}
        />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.008, 0.35]}
        receiveShadow
      >
        <planeGeometry args={[4.45, 2.9]} />
        <shadowMaterial transparent opacity={0.22} />
      </mesh>
    </>
  );
}
function Curtain({ position }: { position: [number, number, number] }) {
  const geometry = useMemo(() => {
    const g = new PlaneGeometry(0.7, 2.32, 24, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++)
      p.setZ(i, Math.sin(p.getX(i) * 43) * 0.065);
    g.computeVertexNormals();
    return g;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh
      geometry={geometry}
      position={position}
      rotation={[0, Math.PI / 2, 0]}
    >
      <meshStandardMaterial color="#e8e3d4" side={DoubleSide} roughness={1} />
    </mesh>
  );
}
function Plant({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.15, 0.4, 24]} />
        <meshStandardMaterial color="#aaa08b" roughness={1} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.012, 0.024, 0.95, 6]} />
        <meshStandardMaterial color="#6d6146" />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => {
        const angle = i * 2.4;
        return (
          <group
            key={i}
            position={[
              Math.cos(angle) * 0.11,
              0.65 + i * 0.067,
              Math.sin(angle) * 0.11,
            ]}
            rotation={[0, angle, 0.48]}
          >
            <mesh position={[0.16, 0, 0]} scale={[0.29, 0.025, 0.1]} castShadow>
              <sphereGeometry args={[1, 10, 6]} />
              <meshStandardMaterial
                color={i % 2 ? "#4f6241" : "#78805a"}
                roughness={0.88}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
function Art({ position }: { position: [number, number, number] }) {
  const uniforms = useMemo(
    () => ({ tone: { value: new Color("#78806b") } }),
    [],
  );
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.83, 1.12, 0.04]} />
        <meshStandardMaterial color="#76614b" />
      </mesh>
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[0.76, 1.05]} />
        <shaderMaterial
          vertexShader={surfaceVertex}
          fragmentShader={artworkFragment}
          uniforms={uniforms}
        />
      </mesh>
    </group>
  );
}
function Architecture({ settings }: { settings: RoomSettings }) {
  const wall = wallTones[settings.wall].color;
  return (
    <>
      <mesh position={[0, 1.55, -2.5]} receiveShadow>
        <boxGeometry args={[6.4, 3.1, 0.12]} />
        <meshStandardMaterial color={wall} roughness={0.94} />
      </mesh>
      <mesh position={[-3.2, 1.55, -1.95]}>
        <boxGeometry args={[0.12, 3.1, 1.1]} />
        <meshStandardMaterial color={wall} />
      </mesh>
      <mesh position={[-3.2, 1.55, 1.75]}>
        <boxGeometry args={[0.12, 3.1, 1.5]} />
        <meshStandardMaterial color={wall} />
      </mesh>
      <mesh position={[-3.2, 0.34, -0.2]}>
        <boxGeometry args={[0.12, 0.68, 2.4]} />
        <meshStandardMaterial color={wall} />
      </mesh>
      <mesh position={[-3.2, 2.97, -0.2]}>
        <boxGeometry args={[0.12, 0.27, 2.4]} />
        <meshStandardMaterial color={wall} />
      </mesh>
      <mesh position={[-3.25, 1.74, -0.2]}>
        <boxGeometry args={[0.02, 2.13, 2.4]} />
        <meshBasicMaterial
          color={settings.daylight < 35 ? "#777f81" : "#dce3d4"}
        />
      </mesh>
      {[-1.4, -0.6, 0.2, 1].map((z) => (
        <mesh key={z} position={[-3.1, 1.75, z]}>
          <boxGeometry args={[0.07, 2.12, 0.045]} />
          <meshStandardMaterial color="#736957" />
        </mesh>
      ))}
      {[0.7, 1.75, 2.81].map((y) => (
        <mesh key={y} position={[-3.1, y, -0.2]}>
          <boxGeometry args={[0.07, 0.05, 2.45]} />
          <meshStandardMaterial color="#736957" />
        </mesh>
      ))}
      <mesh position={[-3.04, 0.67, -0.2]}>
        <boxGeometry args={[0.34, 0.07, 2.62]} />
        <meshStandardMaterial color="#c0b6a3" />
      </mesh>
      <mesh position={[0, 0.06, -2.4]}>
        <boxGeometry args={[6.4, 0.12, 0.05]} />
        <meshStandardMaterial color="#b8af9c" />
      </mesh>
      <mesh position={[-3.1, 0.06, 0]}>
        <boxGeometry args={[0.05, 0.12, 5]} />
        <meshStandardMaterial color="#b8af9c" />
      </mesh>
      {settings.curtains && (
        <>
          <Curtain position={[-2.98, 1.69, -1.17]} />
          <Curtain position={[-2.98, 1.69, 0.83]} />
        </>
      )}
      <Art position={[-0.3, 1.94, -2.4]} />
      <Art position={[0.67, 1.94, -2.4]} />
      <Plant position={[2.6, 0, -1.78]} scale={1.35} />
      <group position={[1.98, 0, -1.25]}>
        <mesh position={[0, 0.025, 0]}>
          <cylinderGeometry args={[0.21, 0.23, 0.05, 24]} />
          <meshStandardMaterial
            color="#62573e"
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.017, 0.017, 1.65, 12]} />
          <meshStandardMaterial
            color="#786849"
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
        <mesh position={[0, 1.59, 0]}>
          <cylinderGeometry args={[0.23, 0.36, 0.45, 32, 1, true]} />
          <meshStandardMaterial
            color="#e3d5b7"
            side={DoubleSide}
            emissive="#ffd595"
            emissiveIntensity={settings.lamp ? 0.75 : 0}
            roughness={1}
          />
        </mesh>
        {settings.lamp && (
          <pointLight
            position={[0, 1.53, 0]}
            color="#ffbd74"
            intensity={12}
            distance={4}
            decay={2}
          />
        )}
      </group>
    </>
  );
}
export default function RoomScene({
  design,
  settings,
  viewVersion,
  onSelect,
  onUnavailable,
}: {
  design: Design;
  settings: RoomSettings;
  viewVersion: number;
  onSelect: (key: FurnitureKey) => void;
  onUnavailable: () => void;
}) {
  // Resolve the asset boundary before creating a canvas to avoid a suspend/lost-context cycle.
  const models = useGLTF([
    "/models/sofa.glb",
    "/models/chair.glb",
    "/models/table.glb",
  ]);
  useEffect(
    () => () => {
      document.body.style.cursor = "";
    },
    [],
  );
  const daylight = settings.daylight / 100;
  const positions = arrangements[settings.layout];
  return (
    <Canvas
      className="room-canvas"
      onCreated={({ gl }) => {
        if (import.meta.env.DEV)
          gl.debug.onShaderError = (context, _program, vertex, fragment) => {
            gl.domElement.dataset.shaderError = [
              context.getShaderInfoLog(vertex),
              context.getShaderInfoLog(fragment),
            ].join("\n");
          };
      }}
      frameloop="demand"
      dpr={settings.quality === "detail" ? [1, 1.75] : [1, 1.15]}
      shadows={{ type: PCFSoftShadowMap }}
      camera={{ position: [7.6, 5.6, 9.6], fov: 38, near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: "default" }}
      fallback={<span>Use the controls below to plan your room.</span>}
      aria-label="Interactive living room. Choose a camera view or a furniture button below for keyboard control."
    >
      <ContextMonitor onUnavailable={onUnavailable} />
      {import.meta.env.DEV && <RenderActivity />}
      <ambientLight
        color={daylight < 0.4 ? "#d2dae5" : "#fff4df"}
        intensity={0.35 + daylight * 0.65}
      />
      <hemisphereLight args={["#fff9ea", "#7e6952", 0.75 + daylight * 0.6]} />
      <directionalLight
        position={[-3.6, 6, 3]}
        color={daylight < 0.65 ? "#ffd1a0" : "#fff6dd"}
        intensity={0.5 + daylight * 2.8}
        castShadow
        shadow-mapSize={
          settings.quality === "detail" ? [2048, 2048] : [1024, 1024]
        }
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-normalBias={0.03}
      />
      <directionalLight position={[5, 3, 4]} intensity={0.7} color="#e4ecf4" />
      <TimberFloor settings={settings} />
      <Rug daylight={settings.daylight} />
      <Architecture settings={settings} />
      {(["sofa", "chair", "table"] as FurnitureKey[]).map((key, i) => {
        const pieceDesign = {
          ...design,
          product: key,
          width: key === design.product ? design.width : furniture[key].width,
        };
        return (
          <group
            key={key}
            position={positions[key].position}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(key);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              document.body.style.cursor = "";
            }}
          >
            <FurnitureModel
              scene={models[i].scene}
              design={pieceDesign}
              rotation={positions[key].rotation}
            />
            {design.product === key && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.018, 0]}>
                <ringGeometry
                  args={[
                    key === "sofa" ? 1.32 : 0.61,
                    key === "sofa" ? 1.34 : 0.63,
                    64,
                  ]}
                />
                <meshBasicMaterial
                  color="#b39764"
                  transparent
                  opacity={0.65}
                  depthWrite={false}
                />
              </mesh>
            )}
          </group>
        );
      })}
      <group position={[0.35, 0.45, 0.45]}>
        <mesh rotation={[0, 0.15, 0]}>
          <boxGeometry args={[0.32, 0.035, 0.24]} />
          <meshStandardMaterial color="#ded8c9" />
        </mesh>
        <mesh position={[0.27, 0.065, 0]}>
          <cylinderGeometry args={[0.055, 0.068, 0.13, 20]} />
          <meshStandardMaterial
            color={woods[design.wood].color}
            roughness={0.9}
          />
        </mesh>
      </group>
      <CameraGuide settings={settings} version={viewVersion} />
    </Canvas>
  );
}
