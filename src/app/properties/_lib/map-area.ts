/** A vertex of an area drawn on the map: `[lat, lng]`. */
export type AreaVertex = [number, number];

/** The API's `polygon` shape: «lat,lng;lat,lng;…». */
export function serializeArea(ring: AreaVertex[]): string {
  return ring
    .map(([lat, lng]) => `${lat.toFixed(6)},${lng.toFixed(6)}`)
    .join(";");
}

export function parseArea(value: string): AreaVertex[] | null {
  if (!value) return null;
  const ring: AreaVertex[] = [];
  for (const pair of value.split(";")) {
    const [lat, lng] = pair.split(",").map(Number);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    ring.push([lat, lng]);
  }
  return ring.length >= 3 ? ring : null;
}

/**
 * Ray casting: a point is inside when a ray from it crosses the ring an odd
 * number of times. Good enough for a hand-drawn shape over a city — the
 * curvature across a few kilometres is well below a pin's width.
 */
export function pointInArea(
  lat: number,
  lng: number,
  ring: AreaVertex[],
): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [latI, lngI] = ring[i];
    const [latJ, lngJ] = ring[j];
    const crosses =
      lngI > lng !== lngJ > lng &&
      lat < ((latJ - latI) * (lng - lngI)) / (lngJ - lngI) + latI;
    if (crosses) inside = !inside;
  }
  return inside;
}
