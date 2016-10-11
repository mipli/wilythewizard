import * as Core from '../core';
import * as _Map from './index';

export class Map {
  private _width;
  get width() {
    return this._width;
  }
  private _height;
  get height() {
    return this._height;
  }
  public tiles: _Map.Tile[][];

  private astar: _Map.Astar;

  constructor(w: number, h: number) {
    this._width = w;
    this._height = h;
    this.tiles = [];
    for (var x = 0; x < this._width; x++) {
      this.tiles[x] = [];
      for (var y = 0; y < this._height; y++) {
        this.tiles[x][y] = _Map.Tile.createTile(_Map.Tile.EMPTY);
      }
    }

    this.astar = new _Map.Astar(
      (pos: Core.Position) => {
        return this.isWalkable(pos);
      },
      (a: Core.Position, b: Core.Position) => {
        return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
      }
    );
  }

  getPath(start: Core.Position, target: Core.Position) {
    let path =  this.astar.findPath(start, target);
    console.log('Path', start, target);
    console.log(path);
    return path;
  }

  getTile(position: Core.Position): _Map.Tile {
    return this.tiles[position.x][position.y];
  }

  setTile(position: Core.Position, tile: _Map.Tile) {
    this.tiles[position.x][position.y] = tile;
  }

  forEach(callback: (position: Core.Position, tile: _Map.Tile) => void): void {
    for (var y = 0; y < this._height; y++) {
      for (var x = 0; x < this._width; x++) {
        callback(new Core.Position(x, y), this.tiles[x][y]);
      }
    }
  }

  isWalkable(position: Core.Position): boolean {
    return this.tiles[position.x][position.y].walkable;
  }
}
