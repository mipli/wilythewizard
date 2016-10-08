import * as Core from '../core';

enum Direction {
  None = 1,
  North,
  East,
  South,
  West,
}

export namespace Utils {
  function carveable(map: number[][], position: Core.Position) {
    if (position.x < 0 || position.x > map.length - 1) {
      return false;
    }
    if (position.y < 0 || position.y > map[0].length - 1) {
      return false;
    }
    return map[position.x][position.y] === 1;
  }

  export function findCarveableSpot(map: number[][]) {
    const width = map.length;
    const height = map[0].length;

    let position = null;

    let carvablesPositions = [];

    for (var x = 0; x < width; x++) {
      for (var y = 0; y < height; y++) {
        let position = new Core.Position(Core.Utils.getRandom(0, width), Core.Utils.getRandom(0, height));
        if (Utils.canCarve(map, position, 0, true)) {
          carvablesPositions.push(position);
        }
      }
    }

    if (carvablesPositions.length > 0) {
      return Core.Utils.getRandomIndex(carvablesPositions);
    }
    return null;
  }

  export function countSurroundingTiles(map: number[][], position: Core.Position, checkDiagonals: boolean = false): number {
    let connections = 0;
    return Core.Position.getNeighbours(position, map.length, map[0].length, !checkDiagonals).filter((pos) => {
      return map[pos.x][pos.y] === 0;
    }).length;
  }

  export function canCarve(map: number[][], position: Core.Position, allowedConnections: number = 0, checkDiagonals: boolean = false): boolean {
    if (!carveable(map, position)) {
      return false;
    }
    return this.countSurroundingTiles(map, position, checkDiagonals) <= allowedConnections;
  }

  export function canExtendTunnel(map: number[][], position: Core.Position) {
    if (!carveable(map, position)) {
      return false;
    }
    let connectedFrom = Direction.None;
    let connections = 0;

    if (position.y > 0 && map[position.x][position.y - 1] === 0) {
      connectedFrom = Direction.North;
      connections++;
    }
    if (position.y < map[0].length - 1 && map[position.x][position.y + 1] === 0) {
      connectedFrom = Direction.South;
      connections++;
    }
    if (position.x > 0 && map[position.x - 1][position.y] === 0) {
      connectedFrom = Direction.West;
      connections++;
    }
    if (position.x < map.length - 1 && map[position.x + 1][position.y] === 0) {
      connectedFrom = Direction.East;
      connections++;
    }

    if (connections > 1) {
      return false;
    }

    return canExtendTunnelFrom(map, position, connectedFrom);
  }

  export function canExtendTunnelFrom(map: number[][], position: Core.Position, direction: Direction) {
    if (map[position.x][position.y] === 0) {
      return false;
    }

    switch (direction) {
      case Direction.South:
        return carveable(map, new Core.Position(position.x - 1, position.y))
                && carveable(map, new Core.Position(position.x - 1, position.y - 1))
                && carveable(map, new Core.Position(position.x, position.y - 1))
                && carveable(map, new Core.Position(position.x + 1, position.y - 1))
                && carveable(map, new Core.Position(position.x + 1, position.y));
      case Direction.North:
        return carveable(map, new Core.Position(position.x + 1, position.y))
                && carveable(map, new Core.Position(position.x + 1, position.y + 1))
                && carveable(map, new Core.Position(position.x, position.y + 1))
                && carveable(map, new Core.Position(position.x - 1, position.y + 1))
                && carveable(map, new Core.Position(position.x - 1, position.y));
      case Direction.West:
        return carveable(map, new Core.Position(position.x, position.y - 1))
                && carveable(map, new Core.Position(position.x + 1, position.y - 1))
                && carveable(map, new Core.Position(position.x + 1, position.y))
                && carveable(map, new Core.Position(position.x + 1, position.y + 1))
                && carveable(map, new Core.Position(position.x, position.y + 1));
      case Direction.East:
        return carveable(map, new Core.Position(position.x, position.y - 1))
                && carveable(map, new Core.Position(position.x - 1, position.y - 1))
                && carveable(map, new Core.Position(position.x - 1, position.y))
                && carveable(map, new Core.Position(position.x - 1, position.y + 1))
                && carveable(map, new Core.Position(position.x, position.y + 1));
      case Direction.None:
        return carveable(map, new Core.Position(position.x, position.y - 1))
                && carveable(map, new Core.Position(position.x - 1, position.y))
                && carveable(map, new Core.Position(position.x, position.y + 1))
                && carveable(map, new Core.Position(position.x + 1, position.y));
    }
    return false;
  }
}
