import type { SceneTone } from "@/data/virtual-tour";

/**
 * Palette per room type. Kept intentionally architectural (soft neutrals with a
 * single accent) so every generated scene reads as one calm, modern space.
 */
const palettes: Record<
  SceneTone,
  { ceiling: string; wallTop: string; wallBottom: string; floor: string; accent: string }
> = {
  entrance: {
    ceiling: "#eef1f6",
    wallTop: "#dfe4ee",
    wallBottom: "#c7cfdd",
    floor: "#8b93a4",
    accent: "#3b5bdb",
  },
  living: {
    ceiling: "#f3efe9",
    wallTop: "#e7ddcf",
    wallBottom: "#d3c4ae",
    floor: "#8a7358",
    accent: "#b8860b",
  },
  kitchen: {
    ceiling: "#eef4f4",
    wallTop: "#dcebea",
    wallBottom: "#c2d7d6",
    floor: "#7f9997",
    accent: "#0d9488",
  },
  bedroom: {
    ceiling: "#f2eef4",
    wallTop: "#e5dde9",
    wallBottom: "#cfc2d7",
    floor: "#7d6f88",
    accent: "#7c3aed",
  },
  bath: {
    ceiling: "#eef2f6",
    wallTop: "#dde7f0",
    wallBottom: "#c3d3e2",
    floor: "#8595a6",
    accent: "#2563eb",
  },
  balcony: {
    ceiling: "#dbeafe",
    wallTop: "#bfdbfe",
    wallBottom: "#e7ddcf",
    floor: "#9c8466",
    accent: "#0284c7",
  },
  plot: {
    ceiling: "#cfe3f7",
    wallTop: "#bcd6ee",
    wallBottom: "#c9d6b8",
    floor: "#8a9a6b",
    accent: "#16a34a",
  },
};

const cardinals = [
  { deg: 0, label: "شمال" },
  { deg: 90, label: "شرق" },
  { deg: 180, label: "جنوب" },
  { deg: 270, label: "غرب" },
];

/**
 * Renders a stylized equirectangular (2:1) panorama for a scene onto a canvas.
 * Longitude maps to x (0–360°) and latitude to y (top = ceiling, bottom =
 * floor), so the result wraps seamlessly on a sphere. It is a clean placeholder
 * environment — swap in real 360 photos when the API provides them.
 */
export function drawPanorama(
  tone: SceneTone,
  label: string,
  width = 4096
): HTMLCanvasElement {
  const height = width / 2;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const p = palettes[tone];
  const horizon = height * 0.52;

  // Vertical gradient: ceiling → wall → floor.
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, p.ceiling);
  sky.addColorStop(0.32, p.wallTop);
  sky.addColorStop(horizon / height - 0.02, p.wallBottom);
  sky.addColorStop(horizon / height + 0.02, shade(p.floor, 1.12));
  sky.addColorStop(1, shade(p.floor, 0.82));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  const colWidth = width / 4;

  // Wall panels every 90°, with a soft window/opening on alternating walls.
  for (let i = 0; i < 4; i += 1) {
    const x = i * colWidth;

    // Panel seam shading for depth.
    const seam = ctx.createLinearGradient(x, 0, x + colWidth, 0);
    seam.addColorStop(0, "rgba(0,0,0,0.06)");
    seam.addColorStop(0.5, "rgba(255,255,255,0.04)");
    seam.addColorStop(1, "rgba(0,0,0,0.06)");
    ctx.fillStyle = seam;
    ctx.fillRect(x, height * 0.2, colWidth, horizon - height * 0.2);

    // A framed opening — a window on even walls, a doorway on odd walls.
    const openW = colWidth * 0.42;
    const openX = x + (colWidth - openW) / 2;
    if (i % 2 === 0) {
      const winY = height * 0.28;
      const winH = (horizon - winY) * 0.62;
      const glass = ctx.createLinearGradient(0, winY, 0, winY + winH);
      glass.addColorStop(0, tone === "balcony" ? "#eaf4ff" : "#d6e4f5");
      glass.addColorStop(1, tone === "balcony" ? "#c3ddf7" : "#aec4de");
      roundRect(ctx, openX, winY, openW, winH, 8);
      ctx.fillStyle = glass;
      ctx.fill();
      ctx.lineWidth = width * 0.003;
      ctx.strokeStyle = "rgba(0,0,0,0.18)";
      ctx.stroke();
      // Mullions.
      ctx.beginPath();
      ctx.moveTo(openX + openW / 2, winY);
      ctx.lineTo(openX + openW / 2, winY + winH);
      ctx.moveTo(openX, winY + winH / 2);
      ctx.lineTo(openX + openW, winY + winH / 2);
      ctx.stroke();
    } else {
      const doorH = horizon - height * 0.3;
      roundRect(ctx, openX, height * 0.3, openW, doorH, 10);
      ctx.fillStyle = shade(p.wallBottom, 0.86);
      ctx.fill();
      ctx.lineWidth = width * 0.003;
      ctx.strokeStyle = "rgba(0,0,0,0.16)";
      ctx.stroke();
    }
  }

  // Floor grid lines fanning toward the nadir for a sense of depth.
  ctx.strokeStyle = "rgba(0,0,0,0.10)";
  ctx.lineWidth = width * 0.0016;
  for (let i = 0; i <= 24; i += 1) {
    const x = (i / 24) * width;
    ctx.beginPath();
    ctx.moveTo(x, horizon);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
  }
  for (let r = 1; r <= 5; r += 1) {
    const y = horizon + ((height - horizon) * r) / 6;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Horizon accent line.
  ctx.strokeStyle = hexToRgba(p.accent, 0.5);
  ctx.lineWidth = width * 0.0018;
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  ctx.lineTo(width, horizon);
  ctx.stroke();

  // Cardinal direction chips on the horizon.
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const { deg, label: dir } of cardinals) {
    const x = (deg / 360) * width;
    const chipW = width * 0.052;
    const chipH = height * 0.03;
    roundRect(ctx, x - chipW / 2, horizon - chipH / 2, chipW, chipH, chipH / 2);
    ctx.fillStyle = hexToRgba(p.accent, 0.9);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = `600 ${height * 0.018}px Vazirmatn, sans-serif`;
    ctx.fillText(dir, x, horizon);
  }

  // Scene label — floating on the front wall (facing the initial view, 180°).
  const frontX = width * 0.5;
  const labelY = height * 0.16;
  ctx.font = `700 ${height * 0.038}px Vazirmatn, sans-serif`;
  const textW = ctx.measureText(label).width;
  const padX = height * 0.02;
  roundRect(
    ctx,
    frontX - textW / 2 - padX,
    labelY - height * 0.032,
    textW + padX * 2,
    height * 0.064,
    height * 0.032
  );
  ctx.fillStyle = "rgba(15,23,42,0.55)";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.fillText(label, frontX, labelY);

  return canvas;
}

/** Multiply a hex color's channels toward black (<1) or white-ish (>1). */
function shade(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `rgb(${clamp(r * factor)}, ${clamp(g * factor)}, ${clamp(b * factor)})`;
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function hexToRgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
