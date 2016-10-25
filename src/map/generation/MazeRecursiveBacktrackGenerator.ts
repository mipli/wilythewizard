import * as Core from '../../core';
import * as Map from '../index';

export class MazeRecursiveBacktrackGenerator {
  private width: number;
  private height: number;

  private stack: Core.Position[];

  private cells: number[][];

  constructor(cells: number[][]) {
    this.cells = cells;
    this.width = this.cells.length;
    this.height = this.cells[0].length;

    this.stack = [];
  }

  private populateStack(position: Core.Position) {
    const neighbours = Core.Position.getNeighbours(position, this.width, this.height, true);
    const newCells = [];
    for (let direction in neighbours) {
      const position = neighbours[direction];
      if (position && Map.Utils.canCarve(this.cells, position, 1)) {
        newCells.push(position);
      }
    }
    if (newCells.length > 0) {
      this.stack = this.stack.concat(Core.Random.randomizeArray(newCells));
    }
  }

  generate() {
    let position = Map.Utils.findCarveableSpot(this.cells);

    while (this.carveMaze()) {}
  }

  private carveMaze() {
    let position = Map.Utils.findCarveableSpot(this.cells);
    if (position === null) {
      return false;
    }
    this.cells[position.x][position.y] = 0;
    this.populateStack(position);

    while (this.stack && this.stack.length > 0) {
      let pos = this.stack.pop();

      if (Map.Utils.canExtendTunnel(this.cells, pos)) {
        this.cells[pos.x][pos.y] = 0;
        this.populateStack(pos);
      }
    }
    return true;
  }

  getCells() {
    return this.cells;
  }
}
