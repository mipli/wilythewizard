import * as Core from './core';

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

  generate(): Map {
    let cells: number[][] = Core.Utils.buildMatrix(this.width, this.height, 0);
    let map = new Map(this.width, this.height);

    for (var x = 0; x < this.width; x++) {
      for (var y = 0; y < this.height; y++) {
        if (x === 0 || x === (this.width - 1) || y === 0 || y === (this.height - 1)) {
          cells[x][y] = 1;
        } else {
          if (Math.random() > 0.9) {
            cells[x][y] = 1;
          } else {
            cells[x][y] = 0;
          }
        }
      }
    }
    let tile: Tile;
    for (var x = 0; x < this.width; x++) {
      for (var y = 0; y < this.height; y++) {
        if (cells[x][y] === 0) {
          tile = Tile.createTile(Tile.FLOOR);
        } else {
          tile = Tile.createTile(Tile.WALL);
          tile.glyph = this.getWallGlyph(x, y, cells);
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
