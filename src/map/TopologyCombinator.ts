import * as Core from '../core';
import * as Map from './index';

export class TopologyCombinator {
  private map: number[][];
  private topologies: number[][];

  private width: number;
  private height: number;

  private topologyId: number;

  constructor(map: number[][]) {
    this.map = map;

    this.width = this.map.length;
    this.height = this.map[0].length;

    this.topologies = [];

    for (var x = 0; x < this.width; x++) {
      this.topologies[x] = [];
      for (var y = 0; y < this.height; y++) {
        this.topologies[x][y] = 0;
      }
    }
  }

  getMap() {
    return this.map;
  }

  initialize(): number[][] {
    this.topologyId = 0;
    for (var x = 0; x < this.width; x++) {
      for (var y = 0; y < this.height; y++) {
        this.addTopology(new Core.Position(x, y));
      }
    }
    return this.topologies;
  }

  combine() {
    let i = 2;
    const max = this.topologyId;
    let remainingTopologies = [];
    for (var j = 2; j <= this.topologyId; j++) {
      remainingTopologies.push(j);
    }
    while (remainingTopologies.length > 0 && i < max * 5) {
      let topologyId = remainingTopologies.shift();
      i++;
      if (!this.combineTopology(1, topologyId)) {
        remainingTopologies.push(topologyId);
      }
    }
    return remainingTopologies.length;
  }

  private combineTopology(a: number, b: number) {
    const edges = this.getEdges(a, b);
    if (edges.length === 0) {
      return false;
    }

    let combined = false;

    while (!combined && edges.length > 0) {
      let idx = Core.Utils.getRandom(0, edges.length - 1); 
      let edge = edges[idx];
      edges.splice(idx, 1);
      let surroundingTiles = Map.Utils.countSurroundingTiles(this.map, edge);
      if (surroundingTiles === 2) {
        this.map[edge.x][edge.y] = 0;
        this.topologies[edge.x][edge.y] = a;
        if (edges.length >= 4) {
          if (Math.random() > 0.2) {
            combined = true;
          }
        } else {
          combined = true;
        }
      }
    }

    if (combined) {
      for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
          if (this.topologies[x][y] === b) {
            this.topologies[x][y] = a;
          }
        }
      }
    }
    return combined;
  }

  private getEdges(a: number, b: number) {
    const hasTopologyNeighbour = (position: Core.Position, topologyId: number) => {
      const neighbours = Core.Position.getNeighbours(position, -1, -1, true);
      return neighbours.filter((position) => {
        return this.topologies[position.x][position.y] === topologyId
      }).length > 0;
    }
    let edges = [];
    for (var x = 0; x < this.width; x++) {
      for (var y = 0; y < this.height; y++) {
        let position = new Core.Position(x, y);
        if (hasTopologyNeighbour(position, a) && hasTopologyNeighbour(position, b)) {
          edges.push(position);
        }
      }
    }
    return edges;
  }

  private addTopology(position: Core.Position, topologyId: number = -1) {
    const x = position.x;
    const y = position.y;
    if (this.map[x][y] !== 0 || this.topologies[x][y] !== 0) {
      return;
    }

    if (topologyId === -1) {
      this.topologyId++;
      topologyId = this.topologyId;
    }

    this.topologies[x][y] = topologyId;

    const neighbours = Core.Position.getNeighbours(new Core.Position(x, y), -1, -1, true);
    neighbours.forEach((position) => {
      if (this.map[position.x][position.y] === 0 && this.topologies[position.x][position.y] === 0) {
        this.addTopology(position, topologyId);
      }
    });
  }

  private pruneDeadEnd(position: Core.Position) {
    if (this.map[position.x][position.y] === 0) {
      let surroundingTiles = Map.Utils.countSurroundingTiles(this.map, new Core.Position(position.x, position.y));
      if (surroundingTiles <= 1) {
        this.map[position.x][position.y] = 1;
        Core.Position.getNeighbours(position, -1, -1, true).forEach((neighbour) => {
          this.pruneDeadEnd(neighbour);
        });
      }
    }
  }

  pruneDeadEnds() {
    for (var x = 0; x < this.width; x++) {
      for (var y = 0; y < this.height; y++) {
        if (this.map[x][y] === 0) {
          this.pruneDeadEnd(new Core.Position(x, y));
        }
      }
    }
  }
}
