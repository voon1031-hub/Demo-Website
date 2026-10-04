/**
 * Paints the globe's equirectangular land map (ocean, graticule, coastlines).
 * The page loads a pre-rendered copy, public/media/globe-land.webp, so this
 * doesn't run on the main thread; scripts/render-globe-texture.cjs bundles
 * this file to regenerate that image. Keep it free of other imports besides
 * the land outline.
 */
import { LAND_PATH, WORLD_VIEWBOX } from '../assets/world-land';

const MAP = {
  ocean: '#0B1D33',
  land: '#1C2836',
  coast: 'rgba(126,147,168,0.45)',
  grid: 'rgba(126,147,168,0.12)',
};

export function paintLandMap(c: HTMLCanvasElement) {
  c.width = 2048;
  c.height = 1024;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = MAP.ocean;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = MAP.grid;
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
  ctx.fillStyle = MAP.land;
  ctx.fill(land);
  ctx.strokeStyle = MAP.coast;
  ctx.lineWidth = 0.35;
  ctx.stroke(land);
  ctx.restore();
}
