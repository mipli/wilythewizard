import * as Core from '../core';
import * as Events from '../events';
import * as Behaviours from './index';
import * as Components from '../components';
import * as Entities from '../entities';

import Engine = require('../Engine');

export class FollowTargetBehaviour extends Behaviours.Behaviour {
  private physicsComponent: Components.PhysicsComponent;
  private target: Entities.Entity;
  private targetPosition: Core.Position;

  private memory: {target: Core.Position, path: Core.Position[]};

  constructor(protected engine: Engine, protected entity: Entities.Entity) {
    super(entity);
    this.physicsComponent = <Components.PhysicsComponent>entity.getComponent(Components.PhysicsComponent);
    this.target = null;
    this.targetPosition = null;
    this.memory = {
      target: null,
      path: null,
    };
  }


  invoke(data: {target: Entities.Entity} = {target: null}) {
    if (data && data.target) {
      this.target = data.target;
    }
    
    if (this.target) {
      const canSee = this.entity.fire(new Events.Event('canSee', {
        position: (<Components.PhysicsComponent>this.target.getComponent(Components.PhysicsComponent)).position
      }));
      if (!canSee) {
        this.target = null;
      } else {
        this.targetPosition = (<Components.PhysicsComponent>this.target.getComponent(Components.PhysicsComponent)).position;
      }
    }

    if (!this.targetPosition) {
      this.memory.path = null;
      this.memory.target = null;
      return null;
    }

    if (!Core.Position.equals(this.memory.target, this.targetPosition)) {
      console.log('recalculating path');
      this.memory.path = this.engine.fire(new Events.Event('getPath', {
        start: this.physicsComponent.position,
        target: this.targetPosition
      }));
      this.memory.path.shift();
      this.memory.target = this.targetPosition;
    }

    if (this.memory.path.length >= 2) {
      const position = this.memory.path.shift();
      if (this.engine.is(new Events.Event('isWithoutEntity', {position: position}))) {
        return new Behaviours.WalkAction(this.physicsComponent, position);
      }
    }
    this.target = null;
    this.targetPosition = null;
    return null;
  }
}
