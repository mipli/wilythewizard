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
    let targets = this.engine.getEntities(this.isTarget);

    let target = null;

    targets = targets.filter((entity) => {
      let phys = <Components.PhysicsComponent>entity.getComponent(Components.PhysicsComponent);
      return this.entity.fire(new Events.Event('canSee', {
        position: phys.position
      }));
    });
    if (targets.length > 0) {
      return targets[0];
    }
    return null;
  }

  invoke() {
    const target = this.findTarget();
    if (!target) {
      return null;
    }
    return {
      entity: target
    }
  }
}
