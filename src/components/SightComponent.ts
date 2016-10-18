import Engine = require('../Engine');

import * as Core from '../core';
import * as Components from './index';
import * as Events from '../events';
import * as Map from '../map';

export class SightComponent extends Components.Component {
  private sightLength: number;

  private physicsComponent: Components.PhysicsComponent;

  private fovCalculator: Map.FoV;
  private lightMap: number[][];
  private hasSeen: boolean[][];

  private map: Map.Map;

  constructor(engine: Engine, data: {sightLength: number} = {sightLength: 10}) {
    super(engine);
    this.sightLength = data.sightLength;
  }

  protected initialize() {
    this.physicsComponent = <Components.PhysicsComponent>this.entity.getComponent(Components.PhysicsComponent);

    this.map = this.engine.fire(new Events.Event('getMap'));
    this.lightMap = Core.Utils.buildMatrix<number>(this.map.width, this.map.height, 0);
    this.hasSeen = Core.Utils.buildMatrix<boolean>(this.map.width, this.map.height, false);
    this.fovCalculator = new Map.FoV(
      (pos: Core.Position) => {
        const tile = this.map.getTile(pos);
        return !tile.blocksSight;  
      },
      this.map.width,
      this.map.height,
      this.sightLength 
    );
  }

  protected registerListeners() {
    this.entity.listen(new Events.Listener(
      'move',
      this.onMove.bind(this)
    ));

    this.entity.listen(new Events.Listener(
      'canSee',
      this.onCanSee.bind(this)
    ));

    this.entity.listen(new Events.Listener(
      'hasSeen',
      this.onHasSeen.bind(this)
    ));
  }

  private onMove(event: Events.Event) {
    this.lightMap = this.fovCalculator.calculate(this.physicsComponent.position);

    for (var x = 0; x < this.map.width; x++) {
      for (var y = 0; y < this.map.height; y++) {
        if (this.lightMap[x][y] > 0) {
          this.hasSeen[x][y] = true;
        }
      }
    }
  }

  private onCanSee(event: Events.Event) {
    const pos = event.data.position;
    return this.lightMap[pos.x][pos.y] === 1;
  }

  private onHasSeen(event: Events.Event) {
    const pos = event.data.position;
    return this.hasSeen[pos.x][pos.y];
  }
}
