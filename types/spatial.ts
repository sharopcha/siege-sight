/**
 * GAME SPACE (as authored in telemetry):  X = east, Y = north, Z = UP.
 * WORLD SPACE (three.js):                 X = east, Y = UP,    Z = south (-Y).
 *
 * Conversion is performed exactly ONCE, in the server/ingestion layer
 * (src/lib/telemetry/transform.ts). No component below the canvas root
 * is permitted to touch raw game coordinates.
 */
export interface GameVec3 {
    x: number;
    y: number;
    z: number;
}

export type WorldTriplet = readonly [x: number, y: number, z: number];
