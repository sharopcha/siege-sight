import type { GameVec3, WorldTriplet } from '@/types/spatial';

/**
 * GAME SPACE (as authored in telemetry):  X = east, Y = north, Z = UP.
 * WORLD SPACE (three.js):                 X = east, Y = UP,    Z = south (-Y).
 *
 * Conversion is performed exactly ONCE, in the server/ingestion layer.
 * No component below the canvas root is permitted to touch raw game coordinates.
 */
export function toWorld(game: GameVec3): WorldTriplet {
    return [game.x, game.z, -game.y];
}

export function toWorldTuple(x: number, y: number, z: number): WorldTriplet {
    return [x, z, -y];
}
