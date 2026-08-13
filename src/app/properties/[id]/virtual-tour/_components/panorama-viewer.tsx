"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import type { TourScene } from "@/data/virtual-tour";
import { drawPanorama } from "@/lib/panorama";

/**
 * A self-contained equirectangular 360° viewer built on Three.js: the panorama
 * is textured onto the inside of a sphere and the camera sits at its centre.
 * Drag (or device orientation) rotates the view. Building the sphere directly
 * keeps the bundle small and gives full control over the interaction feel.
 */
export function PanoramaViewer({
  scene,
  autoRotate,
  gyro,
  fov,
}: {
  scene: TourScene;
  autoRotate: boolean;
  gyro: boolean;
  fov: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Live control values kept in a ref so the animation loop reads the latest
  // without being torn down and rebuilt on every prop change.
  const stateRef = useRef({ autoRotate, gyro, fov });
  useEffect(() => {
    stateRef.current = { autoRotate, gyro, fov };
  }, [autoRotate, gyro, fov]);

  const meshRef = useRef<THREE.Mesh | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Rebuild only the texture when the scene changes — the renderer persists.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const canvas = drawPanorama(scene.tone, scene.name);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = mesh.material as THREE.MeshBasicMaterial;
    material.map?.dispose();
    material.map = texture;
    material.needsUpdate = true;
  }, [scene]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene3d = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      fov,
      container.clientWidth / container.clientHeight,
      0.1,
      1100
    );
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Sphere flipped inside-out so the texture faces the centred camera.
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);
    const canvas = drawPanorama(scene.tone, scene.name);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh;
    scene3d.add(mesh);

    // Spherical camera aim: lon/lat in degrees.
    let lon = 180;
    let lat = 0;
    let isDown = false;
    let downX = 0;
    let downY = 0;
    let downLon = 0;
    let downLat = 0;

    const onPointerDown = (event: PointerEvent) => {
      isDown = true;
      downX = event.clientX;
      downY = event.clientY;
      downLon = lon;
      downLat = lat;
      container.setPointerCapture(event.pointerId);
      container.style.cursor = "grabbing";
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!isDown) return;
      const speed = stateRef.current.fov / 700;
      lon = downLon - (event.clientX - downX) * speed;
      lat = downLat + (event.clientY - downY) * speed;
      lat = Math.max(-85, Math.min(85, lat));
    };
    const onPointerUp = (event: PointerEvent) => {
      isDown = false;
      container.releasePointerCapture?.(event.pointerId);
      container.style.cursor = "grab";
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerUp);
    container.style.cursor = "grab";
    container.style.touchAction = "none";

    // Device orientation for a gyroscope-driven look on phones.
    let orientation: { alpha: number; beta: number; gamma: number } | null =
      null;
    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha == null) return;
      orientation = {
        alpha: event.alpha,
        beta: event.beta ?? 0,
        gamma: event.gamma ?? 0,
      };
    };
    window.addEventListener("deviceorientation", onOrientation);

    const onResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    const target = new THREE.Vector3();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const s = stateRef.current;

      if (s.gyro && orientation) {
        lon = 180 - orientation.alpha - orientation.gamma;
        lat = Math.max(-85, Math.min(85, orientation.beta - 90));
      } else if (s.autoRotate && !isDown) {
        lon += 0.06;
      }

      if (Math.abs(camera.fov - s.fov) > 0.1) {
        camera.fov += (s.fov - camera.fov) * 0.1;
        camera.updateProjectionMatrix();
      }

      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);
      target.setFromSphericalCoords(1, phi, theta);
      camera.lookAt(target);

      renderer.render(scene3d, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("deviceorientation", onOrientation);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);
      geometry.dispose();
      material.map?.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      meshRef.current = null;
      cameraRef.current = null;
    };
    // Mount once; scene texture and live controls are handled via refs/effects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className="size-full" />;
}
