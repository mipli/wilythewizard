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

  invoke() {
    let positions = Core.Random.randomizeArray(Core.Position.getNeighbours(this.physicsComponent.position));
    let isWithoutEntity = false;
    let position: Core.Position = null;
    while(!isWithoutEntity && positions.length > 0) {
      position = positions.pop();
      isWithoutEntity = this.engine.is(new Events.Event('isWithoutEntity', {position: position}));
    }
    
    if (isWithoutEntity) {
      return new Behaviours.WalkAction(this.physicsComponent, position);
    } else {
      return new Behaviours.NullAction();
    }
  }
}
