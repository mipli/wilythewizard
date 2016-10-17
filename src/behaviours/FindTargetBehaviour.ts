import * as Core from '../core';
import * as Events from '../events';
import * as Behaviours from './index';
import * as Components from '../components';
import * as Entities from '../entities';

import Engine = require('../Engine');

export class FindTargetBehaviour extends Behaviours.Behaviour {
  private physicsComponent: Components.PhysicsComponent;

  constructor(protected engine: Engine, protected entity: Entities.Entity, private isTarget: (entity: Entities.Entity) => boolean, private sightLength: number = 5) {
    super(entity);
    this.physicsComponent = <Components.PhysicsComponent>entity.getComponent(Components.PhysicsComponent);
  }

  private findTarget() {
    /*
    let targets = this.engine.getEntities((entity) => {
      return entity.type === Entities.Type.Player;
    });
    */
    let targets = this.engine.getEntities(this.isTarget);

    let target = null;

    targets.forEach((entity) => {
      let phys = <Components.PhysicsComponent>entity.getComponent(Components.PhysicsComponent);
      if (Core.Position.distance(phys.position, this.physicsComponent.position) <= this.sightLength) {
        target = entity;
      }
    });
    return target;
  }

  invoke() {
    const target = this.findTarget();
    if (!target) {
      return null;
    }
    return {
      entity: this.findTarget()
    }
  }
}
