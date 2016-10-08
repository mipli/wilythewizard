import * as Core from './core';
import * as Generator from './map';

import Map = require('./Map');
import Tile = require('./Tile');
import Glyph = require('./Glyph');

class MapGenerator {
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
    let roomGenerator = new Generator.RoomGenerator(cells);

    while (roomGenerator.iterate()) {
    }

    cells = roomGenerator.getMap();

    let startPosition = Generator.Utils.findCarveableSpot(cells);
    let mazeGenerator = null;

    while (startPosition !== null) {
      mazeGenerator = new Generator.MazeRecursiveBacktrackGenerator(cells, startPosition);
      while (mazeGenerator.iterate()) { }
      cells = mazeGenerator.getMap();
      startPosition = Generator.Utils.findCarveableSpot(cells);
    }

    cells = mazeGenerator.getMap();

    let topologyCombinator = new Generator.TopologyCombinator(cells);
    topologyCombinator.initialize();
    let remainingTopologies = topologyCombinator.combine();
    if (remainingTopologies > 5) {
      console.log('remaining topologies', remainingTopologies);
      return this.generateMap();
    }
    topologyCombinator.pruneDeadEnds();

    return topologyCombinator.getMap();
  }

  generate(): Map {
    let map = new Map(this.width, this.height);
    let cells = this.generateMap();

    let tile: Tile;
    for (var x = 0; x < this.width; x++) {
      for (var y = 0; y < this.height; y++) {
        if (cells[x][y] === 0) {
          tile = Tile.createTile(Tile.FLOOR);
        } else {
          tile = Tile.createTile(Tile.WALL);
          tile.glyph = new Glyph(Glyph.CHAR_BLOCK3, this.foregroundColor, this.backgroundColor);
        }
        map.setTile(new Core.Position(x, y), tile);
      }
    }

    return map;
  }

  private getWallGlyph(x: number, y: number, cells: number[][]): Glyph {
    let W = (x > 0 && cells[x - 1][y] === 1);
    let E = (x < this.width - 1 && cells[x + 1][y] === 1);
    let N = (y > 0 && cells[x][y - 1] === 1);
    let S = (y < this.height - 1 && cells[x][y + 1] === 1);

    let glyph = new Glyph(Glyph.CHAR_CROSS, this.foregroundColor, this.backgroundColor);
    if (W && E && S && N) {
      glyph = new Glyph(Glyph.CHAR_CROSS, this.foregroundColor, this.backgroundColor);
    } else if ((W || E) && !S && !N) {
      glyph = new Glyph(Glyph.CHAR_HLINE, this.foregroundColor, this.backgroundColor);
    } else if ((S || N) && !W && !E) {
      glyph = new Glyph(Glyph.CHAR_VLINE, this.foregroundColor, this.backgroundColor);
    } else if (S && E && !W && !N) {
      glyph = new Glyph(Glyph.CHAR_SE, this.foregroundColor, this.backgroundColor);
    } else if (S && W && !E && !N) {
      glyph = new Glyph(Glyph.CHAR_SW, this.foregroundColor, this.backgroundColor);
    } else if (N && E && !W && !S) {
      glyph = new Glyph(Glyph.CHAR_NE, this.foregroundColor, this.backgroundColor);
    } else if (N && W && !E && !S) {
      glyph = new Glyph(Glyph.CHAR_NW, this.foregroundColor, this.backgroundColor);
    } else if (N && W && E && !S) {
      glyph = new Glyph(Glyph.CHAR_TEEN, this.foregroundColor, this.backgroundColor);
    } else if (S && W && E && !N) {
      glyph = new Glyph(Glyph.CHAR_TEES, this.foregroundColor, this.backgroundColor);
    } else if (N && S && E && !W) {
      glyph = new Glyph(Glyph.CHAR_TEEE, this.foregroundColor, this.backgroundColor);
    } else if (N && S && W && !E) {
      glyph = new Glyph(Glyph.CHAR_TEEW, this.foregroundColor, this.backgroundColor);
    }

    return glyph;
  }
}

export = MapGenerator;
