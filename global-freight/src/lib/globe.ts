/**
 * The Air section's globe: a three.js Earth that renders only on demand.
 * Loaded with a dynamic import so three.js stays out of the first page load.
 *
 * setProgress(0) frames the whole planet; setProgress(1) stops at HANDOFF on
 * the way down to the cargo flight. That frame is identical on every screen
 * size and is the first frame of the descent clip (media/air-descent.mp4),
 * so the page can swap the canvas for the video without a visible cut.
 * Changing HANDOFF or the camera path means re-rendering that first frame.
 */
import {
  AdditiveBlending,
  BackSide,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import { paintLandMap } from './landMap';

const COLORS = {
  signal: '#FF5F1F',
  chart: '#7E93A8',
  glow: '#3E6A99',
};

type LonLat = [number, number];
const HUBS: Record<string, LonLat> = {
  hongKong: [114.2, 22.3],
  frankfurt: [8.7, 50.1],
  shanghai: [121.5, 31.2],
  singapore: [103.8, 1.3],
  dubai: [55.3, 25.2],
  rotterdam: [4.5, 51.9],
  newYork: [-74, 40.7],
  losAngeles: [-118.2, 34],
};
/** Where on the featured arc the plane is (0 = Hong Kong, 1 = Frankfurt). */
const PLANE_AT = 0.42;
/** How far down the camera path the globe goes before the descent clip takes over. */
export const HANDOFF = 0.6;
/** Desktop field of view; the hand-off frame is rendered with it. */
const FOV = 35;

/** Lon/lat → point on a sphere, matching three's equirectangular UV layout. */
function toVec([lon, lat]: LonLat, r = 1) {
  const theta = ((lon + 180) / 360) * Math.PI * 2;
  const phi = (lat * Math.PI) / 180;
  return new Vector3(-Math.cos(theta) * Math.cos(phi) * r, Math.sin(phi) * r, Math.sin(theta) * Math.cos(phi) * r);
}

/** Great-circle arc between two hubs, lifted off the surface in the middle. */
function arc(a: LonLat, b: LonLat, lift: number) {
  const va = toVec(a).normalize();
  const vb = toVec(b).normalize();
  const angle = va.angleTo(vb);
  const points: Vector3[] = [];
  for (let i = 0; i <= 64; i++) {
    const t = i / 64;
    // Spherical interpolation, then raise by a sine bump.
    const p = va
      .clone()
      .multiplyScalar(Math.sin((1 - t) * angle))
      .add(vb.clone().multiplyScalar(Math.sin(t * angle)))
      .divideScalar(Math.sin(angle));
    points.push(p.multiplyScalar(1 + lift * Math.sin(Math.PI * t)));
  }
  return new CatmullRomCurve3(points);
}

function landTexture(url: string | undefined, onReady: () => void) {
  if (url) {
    const tex = new TextureLoader().load(url, onReady);
    tex.colorSpace = SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }
  const c = document.createElement('canvas');
  paintLandMap(c);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function atmosphere() {
  return new Mesh(
    new SphereGeometry(1.12, 64, 48),
    new ShaderMaterial({
      uniforms: { glow: { value: new Color(COLORS.glow) } },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 glow;
        varying vec3 vNormal;
        void main() {
          float rim = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
          gl_FragColor = vec4(glow, 1.0) * rim;
        }`,
      side: BackSide,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
    }),
  );
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export type Globe = {
  setProgress: (p: number) => void;
  resize: () => void;
  dispose: () => void;
};

/** `textureUrl`: pre-rendered land map; without it the map is painted at runtime. */
export function createGlobe(canvas: HTMLCanvasElement, textureUrl?: string): Globe {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  // Capped: a full-screen canvas at 3x on phones costs far more than it shows.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.005, 50);
  const earth = new Group();
  scene.add(earth);

  // Once the image arrives, upload it to the GPU straight away, so the first
  // visible frame doesn't stall on it. (`schedule` is hoisted below.)
  const texture = landTexture(textureUrl, () => {
    renderer.initTexture(texture);
    schedule();
  });
  earth.add(new Mesh(new SphereGeometry(1, 128, 96), new MeshBasicMaterial({ map: texture })));
  scene.add(atmosphere());

  // Context lanes, then the featured flight.
  const faint = new MeshBasicMaterial({ color: COLORS.chart, transparent: true, opacity: 0.35 });
  for (const [a, b, lift] of [
    [HUBS.shanghai, HUBS.losAngeles, 0.22],
    [HUBS.newYork, HUBS.rotterdam, 0.14],
    [HUBS.dubai, HUBS.singapore, 0.1],
    [HUBS.dubai, HUBS.frankfurt, 0.1],
  ] as [LonLat, LonLat, number][]) {
    earth.add(new Mesh(new TubeGeometry(arc(a, b, lift), 96, 0.0025, 6), faint));
  }
  const flight = arc(HUBS.hongKong, HUBS.frankfurt, 0.12);
  const signal = new MeshBasicMaterial({ color: COLORS.signal });
  earth.add(new Mesh(new TubeGeometry(flight, 160, 0.0045, 8), signal));

  const hubGeo = new SphereGeometry(0.012, 16, 12);
  for (const hub of Object.values(HUBS)) {
    const dot = new Mesh(hubGeo, signal);
    dot.position.copy(toVec(hub, 1.002));
    earth.add(dot);
  }

  // The plane: a bright point with a soft halo, sitting on the arc.
  const planePos = flight.getPointAt(PLANE_AT);
  const planeDir = flight.getTangentAt(PLANE_AT).normalize();
  const plane = new Mesh(new SphereGeometry(0.006, 16, 12), new MeshBasicMaterial({ color: '#FFFFFF' }));
  plane.position.copy(planePos);
  const halo = new Mesh(
    new SphereGeometry(0.02, 16, 12),
    new MeshBasicMaterial({ color: COLORS.signal, transparent: true, opacity: 0.35, blending: AdditiveBlending, depthWrite: false }),
  );
  halo.position.copy(planePos);
  earth.add(plane, halo);

  // Camera path: from orbit, facing the flight, down to just behind and above the plane.
  const up = planePos.clone().normalize();
  const start = up.clone().multiplyScalar(3.6).add(new Vector3(0, 0.6, 0));
  const end = planePos
    .clone()
    .add(up.clone().multiplyScalar(0.05))
    .sub(planeDir.clone().multiplyScalar(0.09));
  const lookStart = new Vector3(0, 0, 0);
  const pos = new Vector3();
  const look = new Vector3();

  let progress = 0;
  let frame = 0;
  /** Tall phone screens need the camera further out to fit the whole route. */
  let orbitScale = 1;
  let narrowFov = FOV;
  const startPos = new Vector3();

  function render() {
    frame = 0;
    const p = ease(progress * HANDOFF);
    // Phone framing (wider fov, camera further out) converges on the desktop
    // framing by the hand-off point, so the hand-off frame matches everywhere.
    const settle = Math.min(1, p / ease(HANDOFF));
    camera.fov = narrowFov + (FOV - narrowFov) * settle;
    camera.updateProjectionMatrix();
    startPos.copy(start).multiplyScalar(1 + (orbitScale - 1) * (1 - settle));
    pos.lerpVectors(startPos, end, p);
    look.lerpVectors(lookStart, planePos, Math.min(1, p * 1.3));
    camera.position.copy(pos);
    camera.up.copy(new Vector3(0, 1, 0).lerp(up, p));
    camera.lookAt(look);
    // The globe turns towards the flight as the camera descends.
    earth.rotation.y = (1 - p) * 0.9;
    halo.scale.setScalar(1 + p * 0.5);
    renderer.render(scene, camera);
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Keep the whole globe in frame on tall phone screens.
    narrowFov = w / h < 0.8 ? 42 : FOV;
    orbitScale = w / h < 0.8 ? 1.45 : 1;
    camera.updateProjectionMatrix();
    schedule();
  }

  resize();
  window.addEventListener('resize', resize);
  // Compile shaders now (while idle) rather than on the first scroll frame.
  renderer.compile(scene, camera);

  return {
    setProgress(p) {
      progress = Math.min(1, Math.max(0, p));
      schedule();
    },
    resize,
    dispose() {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      scene.traverse((o) => {
        if (o instanceof Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        }
      });
      texture.dispose();
      renderer.dispose();
    },
  };
}
