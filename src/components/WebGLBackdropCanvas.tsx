"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * MODEL B // DEEP SPACE 3D
 * A real-time WebGL scene layered behind the portfolio:
 *  - a twin-arm spiral particle galaxy (violet / icy cyan additive glow)
 *  - two orbiting wireframe "reactor" meshes with slow precession
 *  - mouse-parallax camera with an exponential settle
 *  - devicePixelRatio-capped, reduced-motion aware, fully disposed on unmount
 * Only rendered for the dark theme; light mode keeps the clean alabaster look.
 */
export default function WebGLBackdropCanvas({ theme }: { theme: "dark" | "light" }) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (theme !== "dark") return;
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return; // WebGL unavailable — page remains fully functional
    }

    const width = mount.clientWidth;
    const height = mount.clientHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07080c, 0.026);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 120);
    camera.position.set(0, 0, 23);

    /* ── Soft radial glow sprite for points ─────────────────────────── */
    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = 64;
    spriteCanvas.height = 64;
    const sctx = spriteCanvas.getContext("2d");
    if (sctx) {
      const grad = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.35, "rgba(255,255,255,0.85)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      sctx.fillStyle = grad;
      sctx.fillRect(0, 0, 64, 64);
    }
    const sprite = new THREE.CanvasTexture(spriteCanvas);

    /* ── Twin-arm spiral galaxy ─────────────────────────────────────── */
    const isCompact = mount.clientWidth < 768;
    const starCount = isCompact ? 850 : 1500;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const arm = i % 2;
      const t = Math.pow(Math.random(), 0.72);
      const angle = t * Math.PI * 2.65 + arm * Math.PI + (Math.random() - 0.5) * 0.32;
      const radius = 1.6 + t * 15;
      const spread = (1.25 - t * 0.75) * 1.5;
      positions[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * (2.4 - t * 1.5);
      positions[i * 3 + 2] = Math.sin(angle) * radius + (Math.random() - 0.5) * spread;

      const color = new THREE.Color(
        i % 6 === 0 ? "#ffffff" : arm === 0 ? "#8b5cf6" : "#22d3ee"
      );
      color.multiplyScalar(0.72 + Math.random() * 0.55);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    const galaxyGeo = new THREE.BufferGeometry();
    galaxyGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    galaxyGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const galaxyMat = new THREE.PointsMaterial({
      size: 0.17,
      map: sprite,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.9,
    });
    const galaxy = new THREE.Points(galaxyGeo, galaxyMat);
    galaxy.rotation.x = 0.48;
    galaxy.position.set(7.5, -3.2, -7);
    scene.add(galaxy);

    /* ── Deep-field star dust (static distant shell) ─────────────────── */
    const dustCount = isCompact ? 260 : 480;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 90;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 55;
      dustPositions[i * 3 + 2] = -8 - Math.random() * 45;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.12,
      map: sprite,
      color: 0xbfd4ff,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.65,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);

    /* ── Orbiting wireframe reactors ─────────────────────────────────── */
    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.35, 0.38, 128, 14, 2, 3),
      new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        wireframe: true,
        transparent: true,
        opacity: 0.42,
      })
    );
    knot.position.set(-9.2, 3.6, -8.5);
    scene.add(knot);

    const ico = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.7, 0),
      new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
      })
    );
    ico.position.set(9.4, 4.6, -10.5);
    scene.add(ico);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.6, 0.05, 10, 96),
      new THREE.MeshBasicMaterial({
        color: 0xa78bfa,
        transparent: true,
        opacity: 0.55,
      })
    );
    ring.position.copy(knot.position);
    ring.rotation.x = Math.PI / 2.6;
    scene.add(ring);

    /* ── Pointer parallax ─────────────────────────────────────────────── */
    const pointer = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const clock = new THREE.Clock();
    let raf = 0;
    const render = () => {
      const t = clock.getElapsedTime();

      galaxy.rotation.y = t * 0.055;
      galaxy.rotation.z = Math.sin(t * 0.12) * 0.05;

      knot.rotation.x = t * 0.16;
      knot.rotation.y = t * 0.22;
      knot.position.y = 3.6 + Math.sin(t * 0.6) * 0.35;
      ring.rotation.z = t * 0.25;

      ico.rotation.x = t * 0.14;
      ico.rotation.y = -t * 0.19;
      ico.position.y = 4.6 + Math.cos(t * 0.7) * 0.4;

      camera.position.x += (pointer.x * 1.5 - camera.position.x) * 0.026;
      camera.position.y += (-pointer.y * 1.1 - camera.position.y) * 0.026;
      camera.lookAt(0, 0, -3);

      renderer.render(scene, camera);
      if (!reduced) raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      mount.removeChild(renderer.domElement);
      galaxyGeo.dispose();
      galaxyMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      knot.geometry.dispose();
      (knot.material as THREE.Material).dispose();
      ico.geometry.dispose();
      (ico.material as THREE.Material).dispose();
      ring.geometry.dispose();
      (ring.material as THREE.Material).dispose();
      sprite.dispose();
      renderer.dispose();
    };
  }, [theme]);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: theme === "dark" ? 0.85 : 0 }}
    />
  );
}
