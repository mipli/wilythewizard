import * as Collections from 'typescript-collections';
import * as Core from '../core';

export class Astar {
  constructor(
    private walkableCheck: (pos: Core.Position) => boolean,
    private distance: (a: Core.Position, b: Core.Position) => number
  ) {
  }

  findPath(start: Core.Position, target: Core.Position): Core.Position[] {
    if (Core.Position.equals(start, target)) {
      return [];
    }

    let path = []
    let frontier = new Collections.PriorityQueue((a: Core.Position, b: Core.Position) => {
      const aDistance = this.distance(a, target);
      const bDistance = this.distance(b, target);
      return bDistance - aDistance;
    });
    let cameFrom = {};

    frontier.enqueue(start);

    cameFrom[start.toString()] = null;

    while (!frontier.isEmpty()) {
      let current = frontier.dequeue();

      if (Core.Position.equals(current, target)) {
        break;
      }

      let neighbours = Core.Position.getNeighbours(current, -1, -1);
      neighbours.forEach((neighbour) => {
        if (!this.walkableCheck(neighbour)) {
          return;
        }
        if (cameFrom[neighbour.toString()]) {
          return;
        }

        frontier.enqueue(neighbour);
        cameFrom[neighbour.toString()] = current;
      });
    }

    let pathNode = target;
    path.push(pathNode);
    while (pathNode && !Core.Position.equals(pathNode, start)) {
        pathNode = cameFrom[pathNode.toString()];
        path.unshift(pathNode);
    }

    return path;
  }
}
