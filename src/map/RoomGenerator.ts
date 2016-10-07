import * as Core from '../core';
import * as Map from './index';

export class RoomGenerator {
  private map: number[][];

  private width: number;
  private height: number;

  private maxAttempts: number;

  constructor(map: number[][], maxAttempts: number = 500) {
    this.map = map;

    this.width = this.map.length;
    this.height = this.map[0].length;

    this.maxAttempts = maxAttempts;
  }

  private isSpaceAvailable(x: number, y: number, width: number, height: number) {
    for (let i = x; i < x + width; i++) {
      for (let j = y; j < y + height; j++) {
        if (!Map.Utils.canCarve(this.map, new Core.Position(i, j), 0)) {
          return false;
        }
      }
    }
    return true;
  }

  iterate() {
    let roomGenerated = false;
    let attempts = 0;
    while (!roomGenerated && attempts < this.maxAttempts) {
      roomGenerated = this.generateRoom();
      attempts++
    }

    return roomGenerated;
  }

  private generateRoom() {
    const size = Core.Utils.getRandom(3, 5);
    const rectangularity = Core.Utils.getRandom(1, 3);
    let width: number;
    let height: number;
    if (Math.random() > 0.5) {
      height = size;
      width = size + rectangularity;
    } else {
      width = size;
      height = size + rectangularity;
    }

    let x = Core.Utils.getRandom(0, (this.width - width - 2));
    x = Math.floor(x/2) * 2 + 1;
    let y = Core.Utils.getRandom(0, (this.height - height - 2));
    y = Math.floor(y/2) * 2 + 1;

    if (this.isSpaceAvailable(x, y, width, height)) {
        for (var i = x; i < x + width; i++) {
            for (var j = y; j < y + height; j++) {
              this.map[i][j] = 0;    
            }
        }
        return true;
    }

    return false;
  }

  getMap() {
    return this.map;
  }
}
