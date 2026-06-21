import { Suspense, useMemo, useRef } from "react";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import type { Room, RoomStatus } from "@/lib/types";

const TILE_COLORS: Record<Room["tileStyle"], string> = {
  marble_white: "#ece8df",
  wood_oak: "#b48455",
  slate_grey: "#5b6168",
  ceramic_blue: "#7ea4b8",
  terracotta: "#b86b4b",
};

const STATUS_COLORS: Record<RoomStatus, string> = {
  not_started: "#c0392b",
  in_progress: "#d8a23a",
  done: "#3a8c5f",
};

const WALL_HEIGHT = 2.6;
const WALL_THICKNESS = 0.16;

function roomCenter(points: [number, number][]): [number, number] {
  const n = points.length;
  let x = 0, z = 0;
  for (const [px, pz] of points) { x += px; z += pz; }
  return [x / n, z / n];
}

function FloorMesh({
  points,
  color,
  yOffset,
  onClick,
}: {
  points: [number, number][];
  color: string;
  yOffset: number;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
}) {
  const geom = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
    shape.closePath();
    const g = new THREE.ShapeGeometry(shape);
    g.rotateX(-Math.PI / 2);
    return g;
  }, [points]);

  return (
    <mesh
      geometry={geom}
      position={[0, yOffset, 0]}
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
      receiveShadow
    >
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}

function WallSegment({
  a,
  b,
  color,
  onClick,
}: {
  a: [number, number];
  b: [number, number];
  color: string;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
}) {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const len = Math.hypot(dx, dz);
  const mx = (a[0] + b[0]) / 2;
  const mz = (a[1] + b[1]) / 2;
  const rotY = -Math.atan2(dz, dx);

  return (
    <mesh
      position={[mx, WALL_HEIGHT / 2, mz]}
      rotation={[0, rotY, 0]}
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
      castShadow
    >
      <boxGeometry args={[len, WALL_HEIGHT, WALL_THICKNESS]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}

function StatusBadge({ position, status, label }: {
  position: [number, number, number];
  status: RoomStatus;
  label: string;
}) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color={STATUS_COLORS[status]} emissive={STATUS_COLORS[status]} emissiveIntensity={0.35} />
      </mesh>
      <Html distanceFactor={12} center>
        <div className="px-2 py-0.5 rounded-md bg-background/90 border border-border text-[10px] font-mono uppercase tracking-wider text-foreground whitespace-nowrap shadow-sm">
          {label}
        </div>
      </Html>
    </group>
  );
}

function HighlightOutline({ points }: { points: [number, number][] }) {
  const ref = useRef<THREE.LineSegments>(null);
  const geom = useMemo(() => {
    const pts: number[] = [];
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      pts.push(a[0], 0.02, a[1], b[0], 0.02, b[1]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [points]);
  return (
    <lineSegments ref={ref} geometry={geom}>
      <lineBasicMaterial color="#e0683a" linewidth={2} />
    </lineSegments>
  );
}

export interface Scene3DProps {
  rooms: Room[];
  highlightedRoomId?: string | null;
  selectedPart?: { roomId: string; part: "wall" | "floor" } | null;
  onSelectPart?: (sel: { roomId: string; part: "wall" | "floor" }) => void;
  height?: number | string;
}

export function Scene3D({
  rooms,
  highlightedRoomId,
  selectedPart,
  onSelectPart,
  height = 480,
}: Scene3DProps) {
  // center camera on layout bbox
  const bbox = useMemo(() => {
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const r of rooms) for (const [x, z] of r.polygon) {
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
    }
    const cx = (minX + maxX) / 2;
    const cz = (minZ + maxZ) / 2;
    const span = Math.max(maxX - minX, maxZ - minZ);
    return { cx, cz, span };
  }, [rooms]);

  const camDist = Math.max(12, bbox.span * 1.4);

  return (
    <div
      style={{ height }}
      className="w-full rounded-xl overflow-hidden border border-border bg-blueprint-grid"
    >
      <Canvas
        shadows
        camera={{ position: [bbox.cx + camDist * 0.6, camDist * 0.8, bbox.cz + camDist], fov: 45 }}
      >
        <color attach="background" args={["#f3eede"]} />
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[15, 20, 10]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-10, 8, -10]} intensity={0.3} />

        {/* Ground plate */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[bbox.cx, -0.01, bbox.cz]} receiveShadow>
          <planeGeometry args={[bbox.span * 3, bbox.span * 3]} />
          <meshStandardMaterial color="#e8e0cc" roughness={1} />
        </mesh>

        <Suspense fallback={null}>
          {rooms.map((room) => {
            const tileColor = TILE_COLORS[room.tileStyle];
            const isHighlighted = highlightedRoomId === room.id;
            const [cx, cz] = roomCenter(room.polygon);
            return (
              <group key={room.id}>
                <FloorMesh
                  points={room.polygon}
                  color={tileColor}
                  yOffset={0}
                  onClick={() => onSelectPart?.({ roomId: room.id, part: "floor" })}
                />
                {room.polygon.map((a, i) => {
                  const b = room.polygon[(i + 1) % room.polygon.length];
                  return (
                    <WallSegment
                      key={i}
                      a={a}
                      b={b}
                      color={room.wallColor}
                      onClick={() => onSelectPart?.({ roomId: room.id, part: "wall" })}
                    />
                  );
                })}
                {isHighlighted && <HighlightOutline points={room.polygon} />}
                <StatusBadge
                  position={[cx, WALL_HEIGHT + 0.6, cz]}
                  status={room.status}
                  label={room.name}
                />
                {selectedPart?.roomId === room.id && (
                  <mesh position={[cx, 0.015, cz]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.4, 0.55, 32]} />
                    <meshBasicMaterial color="#e0683a" />
                  </mesh>
                )}
              </group>
            );
          })}
        </Suspense>

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          target={[bbox.cx, 1, bbox.cz]}
          maxPolarAngle={Math.PI / 2.05}
        />
      </Canvas>
    </div>
  );
}
