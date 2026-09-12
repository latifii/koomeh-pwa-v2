"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { optimizedImageUrl } from "@/lib/optimized-image";

/**
 * How wide a panorama to ask the optimizer for.
 *
 * A phone sees perhaps a fifth of the sphere at a time, so the 3840px default
 * was several megabytes and a slow server-side AVIF encode for detail its
 * screen cannot show.
 */
function panoramaWidth(): 2048 | 3840 {
  const devicePixels = window.innerWidth * Math.min(window.devicePixelRatio, 2);
  return devicePixels <= 1024 ? 2048 : 3840;
}

/**
 * A self-contained equirectangular 360° viewer built on Three.js: the panorama
 * is textured onto the inside of a sphere and the camera sits at its centre.
 * Drag (or device orientation) rotates the view. Building the sphere directly
 * keeps the bundle small and gives full control over the interaction feel.
 */
export function PanoramaViewer({
  imageUrl,
  autoRotate,
  gyro,
  fov,
  onLoadingChange,
}: {
  imageUrl: string;
  autoRotate: boolean;
  gyro: boolean;
  fov: number;
  onLoadingChange?: (loading: boolean) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  // Flipped by the renderer effect once the sphere exists. Effects run in
  // declaration order, so the texture effect used to fire while `meshRef` was
  // still null: the first panorama of every tour was dropped on the floor and
  // the spinner never left the screen.
  const [sceneReady, setSceneReady] = useState(false);

  // Decided once. Re-reading it per scene would only bust the texture cache
  // when the visitor rotates their phone.
  const [textureWidth] = useState(panoramaWidth);

  // Live control values kept in a ref so the animation loop reads the latest
  // without being torn down and rebuilt on every prop change.
  const stateRef = useRef({ autoRotate, gyro, fov });
  const meshRef = useRef<THREE.Mesh | null>(null);
  // The loop only draws when the picture has actually changed; anything that
  // changes it from outside the loop says so through this.
  const invalidateRef = useRef<() => void>(() => {});

  useEffect(() => {
    stateRef.current = { autoRotate, gyro, fov };
    invalidateRef.current();
  }, [autoRotate, gyro, fov]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene3d = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      stateRef.current.fov,
      1,
      0.1,
      1100,
    );

    // No antialiasing: the only geometry is the inside of one sphere, so there
    // is no polygon edge to smooth — it spent fill rate on nothing, which on a
    // phone at devicePixelRatio 2 is the most expensive nothing on the page.
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const canvas = renderer.domElement;
    // The canvas is sized by CSS and `setSize(w, h, false)` only resizes the
    // drawing buffer behind it. With the inline pixel height Three.js writes by
    // default, the canvas became the stage's min-content height: after leaving
    // fullscreen it stayed taller than the viewport, pushed the thumbnail rail
    // off the bottom of the screen, and no later resize could pull it back —
    // the measurement it would have used was the oversized canvas itself.
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    container.appendChild(canvas);

    // Sphere flipped inside-out so the texture faces the centred camera.
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);
    // Dark until the panorama arrives; the texture effect clears it to white,
    // because `color` multiplies `map` and this navy tinted every scene.
    const material = new THREE.MeshBasicMaterial({ color: 0x101a2c });
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
    let dirty = true;

    const invalidate = () => {
      dirty = true;
    };
    invalidateRef.current = invalidate;

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
      dirty = true;
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

    // A ResizeObserver, not `window.resize`: entering and leaving fullscreen,
    // rotating the phone and the rail appearing all resize the stage without
    // necessarily resizing the window.
    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      dirty = true;
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    let raf = 0;
    const target = new THREE.Vector3();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const s = stateRef.current;

      if (s.gyro && orientation) {
        lon = 180 - orientation.alpha - orientation.gamma;
        lat = Math.max(-85, Math.min(85, orientation.beta - 90));
        dirty = true;
      } else if (s.autoRotate && !isDown) {
        lon += 0.06;
        dirty = true;
      }

      if (Math.abs(camera.fov - s.fov) > 0.1) {
        camera.fov += (s.fov - camera.fov) * 0.1;
        camera.updateProjectionMatrix();
        dirty = true;
      }

      // A still panorama is the common case — parked with auto-rotate off, or
      // held while the visitor reads the scene. Redrawing it sixty times a
      // second to produce the same frame is what made the page run hot.
      if (!dirty) return;
      dirty = false;

      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon);
      target.setFromSphericalCoords(1, phi, theta);
      camera.lookAt(target);

      renderer.render(scene3d, camera);
    };
    animate();
    setSceneReady(true);

    return () => {
      setSceneReady(false);
      cancelAnimationFrame(raf);
      invalidateRef.current = () => {};
      resizeObserver.disconnect();
      window.removeEventListener("deviceorientation", onOrientation);
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);
      geometry.dispose();
      material.map?.dispose();
      material.dispose();
      renderer.dispose();
      if (canvas.parentNode === container) {
        container.removeChild(canvas);
      }
      meshRef.current = null;
    };
  }, []);

  // Only the texture is rebuilt when the panorama changes — the renderer above
  // persists for the life of the tour.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!sceneReady || !mesh) return;

    let cancelled = false;
    setFailed(false);
    onLoadingChange?.(true);

    const loader = new THREE.TextureLoader();
    loader.load(
      optimizedImageUrl(imageUrl, textureWidth),
      (texture) => {
        if (cancelled) {
          texture.dispose();
          return;
        }
        texture.colorSpace = THREE.SRGBColorSpace;
        // The sphere is never seen minified, so mipmaps buy no sharpness and
        // cost a third more texture memory plus the time to build them.
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;

        // Deliberately not `THREE.Cache.enabled`: it would hold every visited
        // panorama as a decoded bitmap, and a seventeen-scene tour is more than
        // a phone can carry. Revisits are already cheap — the optimizer serves
        // these immutable, so the second load comes from the browser's cache.
        const material = mesh.material as THREE.MeshBasicMaterial;
        material.map?.dispose();
        material.map = texture;
        // Clear the placeholder tint. `color` multiplies `map`, so leaving it
        // at the loading navy stained every panorama it ever showed.
        material.color.setHex(0xffffff);
        material.needsUpdate = true;
        invalidateRef.current();
        onLoadingChange?.(false);
      },
      undefined,
      () => {
        if (cancelled) return;
        setFailed(true);
        onLoadingChange?.(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [imageUrl, onLoadingChange, sceneReady, textureWidth]);

  return (
    <div className="relative size-full">
      <div ref={containerRef} className="size-full" />
      {failed && (
        <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-white/70">
          بارگذاری این نما ممکن نشد.
        </p>
      )}
    </div>
  );
}
