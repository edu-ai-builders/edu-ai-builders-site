"use client";

import Localize from "@/app/i18n/localize";
import { useEffect, useRef, useState } from "react";

/** The DOM/SVG remains the accessible illustration if WebGL is unavailable. */
export default function FractionSculpture({
  phase,
  playing,
}: {
  phase: number;
  playing: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef({ phase, playing });
  const repaint = useRef<(() => void) | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    state.current = { phase, playing };
    repaint.current?.();
  }, [phase, playing]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let cleanup = () => {};
    void import("three")
      .then((T) => {
        if (disposed) return;
        let renderer: InstanceType<typeof T.WebGLRenderer>;
        try {
          renderer = new T.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: "low-power",
          });
        } catch {
          return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = T.SRGBColorSpace;
        element.appendChild(renderer.domElement);
        const scene = new T.Scene();
        const camera = new T.OrthographicCamera(-3.5, 3.5, 2.4, -2.4, 0.1, 30);
        camera.position.set(0, 6.8, 7.8);
        camera.lookAt(0, 0, 0);
        scene.add(new T.HemisphereLight(0xffffff, 0xb2bcae, 1.8));
        const light = new T.DirectionalLight(0xffffff, 2);
        light.position.set(-3, 7, 4);
        scene.add(light);
        const geometries: InstanceType<typeof T.BufferGeometry>[] = [];
        const materials: InstanceType<typeof T.Material>[] = [];
        function material(color: string) {
          const mat = new T.MeshStandardMaterial({
            color,
            roughness: 0.57,
            metalness: 0.02,
          });
          materials.push(mat);
          return mat;
        }
        const lavender = material("#a69aca");
        const sage = material("#74aa98");
        const empty = material("#f0e9df");
        const rim = material("#e0dcd3");
        const sides = material("#fbf7f0");
        const pieces: {
          mesh: InstanceType<typeof T.Mesh>;
          angle: number;
          base: number;
          right: boolean;
        }[] = [];
        const models = new T.Group();
        scene.add(models);
        [-1.57, 1.57].forEach((x, disk) => {
          const plateGeometry = new T.CylinderGeometry(1.29, 1.29, 0.065, 80);
          geometries.push(plateGeometry);
          const plate = new T.Mesh(plateGeometry, rim);
          plate.position.set(x, -0.18, 0);
          models.add(plate);
          const count = disk === 0 ? 2 : 4;
          for (let i = 0; i < count; i++) {
            const arc = (Math.PI * 2) / count;
            const angle = i * arc;
            const geo = new T.CylinderGeometry(
              1.16,
              1.16,
              0.23,
              64,
              1,
              false,
              angle + 0.008,
              arc - 0.016,
            );
            geometries.push(geo);
            const fill = i < count / 2 ? (disk ? sage : lavender) : empty;
            const mesh = new T.Mesh(geo, [sides, fill, sides]);
            mesh.position.set(x, 0, 0);
            pieces.push({
              mesh,
              angle: angle + arc / 2,
              base: x,
              right: disk === 1,
            });
            models.add(mesh);
          }
        });
        let visible = true;
        let contextLost = false;
        let last = 0;
        let separation = 0;
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        function paint(time = 0) {
          if (disposed || contextLost) return;
          if (time && time - last < 32) return;
          last = time;
          const { phase: currentPhase, playing: running } = state.current;
          const target = currentPhase === 1 ? 0.15 : 0;
          separation =
            media.matches || !running
              ? target
              : separation + (target - separation) * 0.07;
          pieces.forEach(({ mesh, angle, base, right }) => {
            const distance = right ? separation : 0;
            mesh.position.x = base + Math.sin(angle) * distance;
            mesh.position.z = Math.cos(angle) * distance;
            mesh.position.y = right ? distance * 0.45 : 0;
          });
          renderer.render(scene, camera);
        }
        const isSettled = () =>
          Math.abs((state.current.phase === 1 ? 0.15 : 0) - separation) <
          0.0003;
        function syncLoop() {
          paint();
          const shouldRun =
            visible &&
            !document.hidden &&
            !media.matches &&
            !contextLost &&
            state.current.playing &&
            !isSettled();
          renderer.setAnimationLoop(
            shouldRun
              ? (time) => {
                  paint(time);
                  if (isSettled()) renderer.setAnimationLoop(null);
                }
              : null,
          );
        }
        repaint.current = syncLoop;
        function resize() {
          const width = element!.clientWidth;
          const height = element!.clientHeight;
          if (!width || !height) return;
          const aspect = width / height;
          const viewWidth = Math.max(6.7, aspect * 3.45);
          camera.left = -viewWidth / 2;
          camera.right = viewWidth / 2;
          camera.top = viewWidth / aspect / 2;
          camera.bottom = -viewWidth / aspect / 2;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
          paint();
        }
        const observer = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          syncLoop();
        });
        observer.observe(element);
        const size = new ResizeObserver(resize);
        size.observe(element);
        const lost = (event: Event) => {
          event.preventDefault();
          contextLost = true;
          renderer.setAnimationLoop(null);
          setReady(false);
        };
        renderer.domElement.addEventListener("webglcontextlost", lost);
        document.addEventListener("visibilitychange", syncLoop);
        media.addEventListener("change", syncLoop);
        resize();
        syncLoop();
        setReady(true);
        cleanup = () => {
          repaint.current = null;
          observer.disconnect();
          size.disconnect();
          document.removeEventListener("visibilitychange", syncLoop);
          media.removeEventListener("change", syncLoop);
          renderer.domElement.removeEventListener("webglcontextlost", lost);
          renderer.setAnimationLoop(null);
          geometries.forEach((geo) => geo.dispose());
          materials.forEach((mat) => mat.dispose());
          renderer.dispose();
          renderer.domElement.remove();
        };
      })
      .catch(() => {
        /* Keep the SVG illustration when the optional chunk cannot load. */
      });
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <Localize>{(
    <div
      className="fraction-sculpture"
      role="img"
      aria-label="两个同样大的圆：左边二等分、涂一份，右边四等分、涂两份。涂色面积相同。"
    >
      <svg
        className={`fraction-fallback ${ready ? "is-hidden" : ""}`}
        viewBox="0 0 600 280"
        aria-hidden="true"
      >
        <g stroke="#d0c7d8" strokeWidth="2">
          <circle cx="150" cy="140" r="99" fill="#f0e9df" />
          <path d="M150 41 A99 99 0 0 1 150 239Z" fill="#a69aca" />
          <circle cx="450" cy="140" r="99" fill="#f0e9df" />
          <path d="M450 41 A99 99 0 0 1 450 239Z" fill="#74aa98" />
          <path d="M351 140H549 M450 41V239" />
        </g>
      </svg>
      <div
        ref={host}
        className={`fraction-canvas ${ready ? "is-ready" : ""}`}
        aria-hidden="true"
      />
      <span className="sculpture-equals" aria-hidden="true">
        =
      </span>
    </div>
  )}</Localize>;
}
