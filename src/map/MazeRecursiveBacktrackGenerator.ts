import * as Core from '../core';
import * as Map from './index';

export class MazeRecursiveBacktrackGenerator {
  private width: number;
  private height: number;

  private maxAttemps: number;
  private attempts: number;

  private stack: Core.Position[];

  private map: number[][];

  constructor(map: number[][], position: Core.Position) {
    this.map = map;
    this.width = this.map.length;
    this.height = this.map[0].length;

    this.maxAttemps = 50000;
    this.attempts = 0;

    this.stack = [];
    this.map[position.x][position.y] = 0;
    this.populateStack(position);
  }

  private populateStack(position: Core.Position) {
    const neighbours = Core.Position.getNeighbours(position, this.width, this.height, true);
    const newCells = [];
    for (let direction in neighbours) {
      const position = neighbours[direction];
      if (position && Map.Utils.canCarve(this.map, position, 1)) {
        newCells.push(position);
      }
    }
    if (newCells.length > 0) {
      this.stack = this.stack.concat(Core.Utils.randomizeArray(newCells));
    }
  }

  iterate() {
    this.attempts++;

    if (this.attempts > this.maxAttemps) {
      console.log('max attempts done');
      return null;
    }
    let pos: Core.Position;
    while (this.stack && this.stack.length > 0) {
      pos = this.stack.pop();

      if (Map.Utils.canCarve(this.map, pos, 1)) {
        this.map[pos.x][pos.y] = 0;
        this.populateStack(pos);

        return pos; 
      }
    }
    return null;
  }

  getMap() {
    return this.map;
  }
}
