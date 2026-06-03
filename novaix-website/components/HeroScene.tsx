"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function NodeNetwork() {
  const group = useRef<THREE.Group>(null);
  const { mouse } = useThree();

  // Generate node positions inside a flattened sphere
  const { points, lines } = useMemo(() => {
    const N = 70;
    const nodes: THREE.Vector3[] = [];
    const pos: number[] = [];
    for (let i = 0; i < N; i++) {
      const r = 6.2 * Math.cbrt(Math.random());
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(p) * Math.cos(t);
      const y = r * Math.sin(p) * Math.sin(t) * 0.7;
      const z = r * Math.cos(p);
      nodes.push(new THREE.Vector3(x, y, z));
      pos.push(x, y, z);
    }
    const linePos: number[] = [];
    const maxDist = 2.7;
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        if (nodes[i].distanceTo(nodes[j]) < maxDist) {
          linePos.push(nodes[i].x, nodes[i].y, nodes[i].z, nodes[j].x, nodes[j].y, nodes[j].z);
        }
      }
    }
    return {
      points: new Float32Array(pos),
      lines: new Float32Array(linePos),
    };
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.1;
    group.current.rotation.x += delta * 0.04;
    // gentle parallax toward the pointer
    group.current.rotation.y += mouse.x * 0.0015;
    group.current.rotation.x += -mouse.y * 0.0015;
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[points, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#2dd4bf" size={0.16} transparent opacity={0.95} sizeAttenuation />
      </points>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[points, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#38bdf8" size={0.09} transparent opacity={0.7} sizeAttenuation />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lines, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#2dd4bf" transparent opacity={0.16} />
      </lineSegments>
    </group>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 13], fov: 60 }} dpr={[1, 2]}>
        <NodeNetwork />
      </Canvas>
    </div>
  );
}
