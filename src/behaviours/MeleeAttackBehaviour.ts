import * as Core from '../core';
import * as Events from '../events';
import * as Behaviours from './index';
import * as Components from '../components';
import * as Entities from '../entities';

import Engine = require('../Engine');

export class MeleeAttackBehaviour extends Behaviours.Behaviour {
  private physicsComponent: Components.PhysicsComponent;

  constructor(protected engine: Engine, protected entity: Entities.Entity) {
    super(entity);
    this.physicsComponent = <Components.PhysicsComponent>entity.getComponent(Components.PhysicsComponent);
  }


  invoke(data: {target: Entities.Entity}) {
    const position = (<Components.PhysicsComponent>data.target.getComponent(Components.PhysicsComponent)).position;
    const distance = Core.Position.distance(this.physicsComponent.position, position);

    if (distance === 1) {
      return new Behaviours.MeleeAttackAction(this.entity, data.target);
    }
    return null;
  }
}
