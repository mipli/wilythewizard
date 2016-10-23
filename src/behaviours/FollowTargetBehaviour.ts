import * as Core from '../core';
import * as Events from '../events';
import * as Behaviours from './index';
import * as Components from '../components';
import * as Entities from '../entities';

import Engine = require('../Engine');

export class FollowTargetBehaviour extends Behaviours.Behaviour {
  private physicsComponent: Components.PhysicsComponent;

  constructor(protected engine: Engine, protected entity: Entities.Entity) {
    super(entity);
    this.physicsComponent = <Components.PhysicsComponent>entity.getComponent(Components.PhysicsComponent);
  }


  invoke(data: {target: Entities.Entity}) {
    const position = (<Components.PhysicsComponent>data.target.getComponent(Components.PhysicsComponent)).position;
    const path = this.engine.fire(new Events.Event('getPath', {
      start: this.physicsComponent.position,
      target: position
    }));

    if (path.length >= 2) {
      const position = path[1];
      if (this.engine.is(new Events.Event('isWithoutEntity', {position: position}))) {
        return new Behaviours.WalkAction(this.physicsComponent, position);
      }
    }
    return new Behaviours.NullAction();
  }
}
