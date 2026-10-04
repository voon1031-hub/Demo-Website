import { WORLD_VIEWBOX } from '../assets/world-land';

/** Equirectangular lon/lat → SVG coordinates matching LAND_PATH. */
export function project(lon: number, lat: number): [number, number] {
  return [((lon + 180) / 360) * WORLD_VIEWBOX.width, ((90 - lat) / 180) * WORLD_VIEWBOX.height];
}

/** Smooth path through points (Catmull–Rom converted to cubic Béziers). */
function smooth(points: [number, number][]) {
  const p = points;
  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

/** Flight arc: a quadratic curve bowed towards the pole. */
function arc(a: [number, number], b: [number, number], lift = 0.28) {
  const [x1, y1] = a;
  const [x2, y2] = b;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2 - len * lift;
  return `M${x1.toFixed(1)},${y1.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
}

export type Hub = { name: string; at: [number, number]; label?: 'left' | 'right' | 'above' | 'below' };

export const hubs: Record<string, Hub> = {
  hongKong: { name: 'Hong Kong', at: project(114.2, 22.3), label: 'left' },
  shanghai: { name: 'Shanghai', at: project(121.5, 31.2), label: 'right' },
  singapore: { name: 'Singapore', at: project(103.8, 1.3), label: 'below' },
  chongqing: { name: 'Chongqing', at: project(106.5, 29.6), label: 'above' },
  frankfurt: { name: 'Frankfurt', at: project(8.7, 50.1), label: 'below' },
  rotterdam: { name: 'Rotterdam', at: project(4.5, 51.9), label: 'left' },
  duisburg: { name: 'Duisburg', at: project(6.8, 51.4), label: 'below' },
  dubai: { name: 'Dubai', at: project(55.3, 25.2), label: 'below' },
  newYork: { name: 'New York', at: project(-74, 40.7), label: 'left' },
  santos: { name: 'Santos', at: project(-46.3, -23.9), label: 'below' },
  losAngeles: { name: 'Los Angeles', at: project(-118.2, 34), label: 'left' },
  sydney: { name: 'Sydney', at: project(151.2, -33.9), label: 'left' },
};

export type Mode = 'air' | 'ocean' | 'land';

/** The three routes that carry a moving vehicle, matching hero.legend in content. */
export const featuredRoutes: { mode: Mode; d: string; duration: number }[] = [
  {
    mode: 'air',
    d: arc(hubs.hongKong.at, hubs.frankfurt.at, 0.22),
    duration: 11,
  },
  {
    mode: 'ocean',
    // Shanghai → Singapore → Indian Ocean → Red Sea → Suez → Med → Gibraltar → Rotterdam
    d: smooth([
      hubs.shanghai.at,
      project(119, 22),
      project(109, 10),
      hubs.singapore.at,
      project(95, 6),
      project(80, 5.5),
      project(60, 13),
      project(43.5, 12.5),
      project(37, 22),
      project(32.5, 30.5),
      project(20, 34),
      project(5, 37.5),
      project(-6, 36),
      project(-10, 43),
      project(-5, 48.5),
      hubs.rotterdam.at,
    ]),
    duration: 26,
  },
  {
    mode: 'land',
    // China–Europe rail via Kazakhstan and Russia
    d: smooth([
      hubs.chongqing.at,
      project(103.8, 36),
      project(87.6, 43.8),
      project(76.9, 43.2),
      project(61, 51),
      project(37.6, 55.7),
      project(23.7, 52.2),
      project(13.4, 52.5),
      hubs.duisburg.at,
    ]),
    duration: 18,
  },
];

/** Faint context lanes, no vehicle. */
export const backgroundRoutes: string[] = [
  arc(hubs.newYork.at, hubs.rotterdam.at, 0.18),
  arc(hubs.dubai.at, hubs.frankfurt.at, 0.2),
  arc(hubs.dubai.at, hubs.singapore.at, 0.18),
  smooth([hubs.santos.at, project(-35, -5), project(-25, 15), project(-15, 35), project(-8, 45), hubs.rotterdam.at]),
  smooth([hubs.singapore.at, project(115, -10), project(130, -15), project(150, -30), hubs.sydney.at]),
  arc(hubs.losAngeles.at, hubs.newYork.at, 0.12),
];

/** Hubs drawn with a label on the map. */
export const labelledHubs: Hub[] = [
  hubs.hongKong,
  hubs.shanghai,
  hubs.singapore,
  hubs.chongqing,
  hubs.frankfurt,
  hubs.rotterdam,
  hubs.dubai,
  hubs.newYork,
];
