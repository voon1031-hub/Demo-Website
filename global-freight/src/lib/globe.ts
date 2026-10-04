/**
 * The Air section's globe: a three.js Earth that renders only on demand.
 * Loaded with a dynamic import so three.js stays out of the first page load.
 *
 * setProgress(0) frames the whole planet; setProgress(1) puts the camera just
 * behind the cargo flight on the Hong Kong → Frankfurt arc, where the page
 * cuts to the plane footage.
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
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';
import { LAND_PATH, WORLD_VIEWBOX } from '../assets/world-land';

const COLORS = {
  ocean: '#0B1D33',
  land: '#1C2836',
  coast: 'rgba(126,147,168,0.45)',
  grid: 'rgba(126,147,168,0.12)',
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

function landTexture() {
  const c = document.createElement('canvas');
  c.width = 2048;
  c.height = 1024;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = COLORS.ocean;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  for (let lon = 0; lon <= 360; lon += 15) {
    const x = (lon / 360) * c.width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, c.height);
    ctx.stroke();
  }
  for (let lat = 0; lat <= 180; lat += 15) {
    const y = (lat / 180) * c.height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(c.width, y);
    ctx.stroke();
  }
  ctx.save();
  ctx.scale(c.width / WORLD_VIEWBOX.width, c.height / WORLD_VIEWBOX.height);
  const land = new Path2D(LAND_PATH);
  ctx.fillStyle = COLORS.land;
  ctx.fill(land);
  ctx.strokeStyle = COLORS.coast;
  ctx.lineWidth = 0.35;
  ctx.stroke(land);
  ctx.restore();
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

/** A soft, lumpy cloud puff drawn from overlapping radial gradients. */
function cloudTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 28; i++) {
    const a = rand() * Math.PI * 2;
    const d = rand() * size * 0.22;
    const x = size / 2 + Math.cos(a) * d;
    const y = size / 2 + Math.sin(a) * d * 0.7;
    const r = size * (0.12 + rand() * 0.16);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(255,255,255,0.22)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export type Globe = {
  setProgress: (p: number) => void;
  resize: () => void;
  dispose: () => void;
};

export function createGlobe(canvas: HTMLCanvasElement): Globe {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.005, 50);
  const earth = new Group();
  scene.add(earth);

  const texture = landTexture();
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
  const routeMat = new MeshBasicMaterial({ color: COLORS.signal, transparent: true });
  earth.add(new Mesh(new TubeGeometry(flight, 160, 0.0045, 8), routeMat));

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

  // Cloud layer along the last stretch of the descent: the camera flies
  // through it, which hides the hand-off to the plane footage.
  const puff = cloudTexture();
  const cloudMat = new SpriteMaterial({ map: puff, color: '#3F5674', transparent: true, opacity: 0, depthWrite: false });
  let cs = 11;
  const crand = () => ((cs = (cs * 48271) % 2147483647) / 2147483647);
  const side = new Vector3().crossVectors(planeDir, up).normalize();
  for (let i = 0; i < 70; i++) {
    const t = 0.72 + crand() * 0.27;
    const p = ease(t);
    const at = new Vector3().lerpVectors(start, end, p);
    const spread = 0.025 + (1 - t) * 0.5;
    const cloud = new Sprite(cloudMat);
    cloud.position
      .copy(at)
      .add(side.clone().multiplyScalar((crand() - 0.5) * spread * 2))
      .add(up.clone().multiplyScalar((crand() - 0.5) * spread));
    cloud.scale.setScalar(spread * (1.2 + crand() * 1.5));
    scene.add(cloud);
  }

  let progress = 0;
  let frame = 0;
  /** Tall phone screens need the camera further out to fit the whole route. */
  let orbitScale = 1;
  const startPos = new Vector3();

  function render() {
    frame = 0;
    const p = ease(progress);
    startPos.copy(start).multiplyScalar(orbitScale);
    pos.lerpVectors(startPos, end, p);
    look.lerpVectors(lookStart, planePos, Math.min(1, p * 1.3));
    camera.position.copy(pos);
    camera.up.copy(new Vector3(0, 1, 0).lerp(up, p));
    camera.lookAt(look);
    // The globe turns towards the flight as the camera descends.
    earth.rotation.y = (1 - p) * 0.9;
    halo.scale.setScalar(1 + p * 0.5);
    // Clouds thicken only on the final approach, then thin as the camera breaks through.
    cloudMat.opacity = smooth(0.55, 0.78, progress) * (1 - smooth(0.9, 1, progress)) * 0.6;
    // The marker and route give way to the real plane footage.
    const handOff = 1 - smooth(0.7, 0.85, progress);
    routeMat.opacity = handOff;
    plane.visible = halo.visible = handOff > 0.01;
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
    camera.fov = w / h < 0.8 ? 42 : 35;
    orbitScale = w / h < 0.8 ? 1.45 : 1;
    camera.updateProjectionMatrix();
    schedule();
  }

  resize();
  window.addEventListener('resize', resize);

  return {
    setProgress(p) {
      progress = Math.min(1, Math.max(0, p));
      schedule();
    },
    resize,
    dispose() {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      cloudMat.dispose();
      scene.traverse((o) => {
        if (o instanceof Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        }
      });
      texture.dispose();
      puff.dispose();
      renderer.dispose();
    },
  };
}
