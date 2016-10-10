import * as Core from '../../core';
import * as Map from '../index';
import * as Exceptions from '../../Exceptions';

export class DungeonGenerator {
  private width: number;
  private height: number;

  private backgroundColor: Core.Color;
  private foregroundColor: Core.Color;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.backgroundColor = 0x000000;
    this.foregroundColor = 0xaaaaaa;
  }

  private generateMap(): number[][] {
    let cells: number[][] = Core.Utils.buildMatrix(this.width, this.height, 1);
    let roomGenerator = new Map.RoomGenerator(cells);

    roomGenerator.generate();
    cells = roomGenerator.getCells();

    let mazeGenerator = new Map.MazeRecursiveBacktrackGenerator(cells);
    mazeGenerator.generate();
    cells = mazeGenerator.getCells();

    cells = mazeGenerator.getCells();

    let topologyCombinator = new Map.TopologyCombinator(cells);
    topologyCombinator.initialize();
    let remainingTopologies = topologyCombinator.combine();
    if (remainingTopologies > 5) {
      console.log('remaining topologies', remainingTopologies);
      return null;
    }
    topologyCombinator.pruneDeadEnds();

    return topologyCombinator.getCells();
  }

  generate(): Map.Map {
    let map = new Map.Map(this.width, this.height);
    let cells = null;
    let attempts = 0;
    while (cells === null) {
      attempts++;
      cells = this.generateMap();
      if (attempts > 100) {
        throw new Exceptions.CouldNotGenerateMap('Could not generate dungeon');
      }
    }

    let tile: Map.Tile;
    for (var x = 0; x < this.width; x++) {
      for (var y = 0; y < this.height; y++) {
        if (cells[x][y] === 0) {
          tile = Map.Tile.createTile(Map.Tile.FLOOR);
        } else {
          tile = Map.Tile.createTile(Map.Tile.WALL);
        }
        map.setTile(new Core.Position(x, y), tile);
      }
    }

    return map;
  }
}
