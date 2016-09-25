import * as Core from '../core';
import * as Components from '../components';
import * as Behaviours from './index';

export class WalkAction extends Behaviours.Action {
  constructor(private physicsComponent: Components.PhysicsComponent, private position: Core.Position) {
    super();
  }

  act(): number {
    this.physicsComponent.moveTo(this.position);
    return this.cost;
  }
}
