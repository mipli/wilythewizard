import * as Core from '../core';
import * as Events from '../events';
import * as Behaviours from './index';
import * as Components from '../components';
import * as Entities from '../entities';

import Engine = require('../Engine');

export class RandomWalkBehaviour extends Behaviours.Behaviour {
  private physicsComponent: Components.PhysicsComponent;

  constructor(protected engine: Engine, protected entity: Entities.Entity) {
    super(entity);
    this.physicsComponent = <Components.PhysicsComponent>entity.getComponent(Components.PhysicsComponent);
  }

  getNextAction(): Behaviours.Action {
    let positions = Core.Utils.randomizeArray(Core.Position.getNeighbours(this.physicsComponent.position));
    let canMove = false;
    let position: Core.Position = null;
    while(!canMove && positions.length > 0) {
      position = positions.pop();
      canMove = this.engine.can(new Events.Event('canMove', {position: position}));
    }
    
    if (canMove) {
      return new Behaviours.WalkAction(this.physicsComponent, position);
    } else {
      return new Behaviours.NullAction();
    }
  }
}
