import * as Core from '../core';
import * as Events from '../events';
import * as Behaviours from './index';
import * as Components from '../components';
import * as Entities from '../entities';

import Engine = require('../Engine');

export class MeleeAttackBehaviour extends Behaviours.Behaviour {
  private physicsComponent: Components.PhysicsComponent;
  private target: Entities.Entity;

  constructor(protected engine: Engine, protected entity: Entities.Entity) {
    super(entity);
    this.physicsComponent = <Components.PhysicsComponent>entity.getComponent(Components.PhysicsComponent);
  }


  invoke(data: {target: Entities.Entity} = {target: null}) {
    if (data && data.target) {
      this.target = data.target;
    }
    const position = (<Components.PhysicsComponent>this.target.getComponent(Components.PhysicsComponent)).position;
    const distance = Core.Position.distance(this.physicsComponent.position, position);

    if (distance === 1) {
      return new Behaviours.MeleeAttackAction(this.entity, this.target);
    }
    return null;
  }
}
