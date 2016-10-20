import Engine = require('../Engine');

import * as Core from '../core';
import * as Behaviours from '../behaviours';
import * as Components from './index';
import * as Events from '../events';
import * as Entities from '../entities';

export class FollowTargetAIComponent extends Components.Component {
  private energyComponent: Components.EnergyComponent;
  private physicsComponent: Components.PhysicsComponent;

  private findTargetBehavoiur: Behaviours.FindTargetBehaviour;
  private followTargetBehavoiur: Behaviours.FollowTargetBehaviour;
  private randomWalkBehaviour: Behaviours.RandomWalkBehaviour;

  private targetType: Entities.Type;

  private target: Entities.Entity;
  private targetPosition: Core.Position;

  constructor(engine: Engine, data: {targetType: Entities.Type}) {
    super(engine);
    this.targetType = data.targetType;
    this.target = null;
    this.targetPosition = null;
  }

  protected initialize() {
    this.energyComponent = <Components.EnergyComponent>this.entity.getComponent(Components.EnergyComponent);
    this.physicsComponent = <Components.PhysicsComponent>this.entity.getComponent(Components.PhysicsComponent);
    this.findTargetBehavoiur = new Behaviours.FindTargetBehaviour(this.engine, this.entity, (entity: Entities.Entity) => {
      return entity.type === Entities.Type.Player;
    }, 5);
    this.followTargetBehavoiur = new Behaviours.FollowTargetBehaviour(this.engine, this.entity);
    this.randomWalkBehaviour = new Behaviours.RandomWalkBehaviour(this.engine, this.entity);
  }

  protected registerListeners() {
    this.listeners.push(this.engine.listen(new Events.Listener(
      'tick',
      this.onTick.bind(this)
    )));
  }

  onTick(event: Events.Event) {
    if (this.energyComponent.currentEnergy >= 100) {
      this.act();
    }
  }

  act() {
    const targetResult = this.findTargetBehavoiur.invoke();
    let isFollowing = this.targetPosition !== null;
    if (targetResult) {
      this.target = targetResult.entity;
      this.targetPosition = (<Components.PhysicsComponent>this.target.getComponent(Components.PhysicsComponent)).position; 
      if (!isFollowing) {
        this.engine.emit(new Events.Event('message', {
          message: this.entity.name + ' is following ' + this.target.name + '.',
          target: this.target
        }));
      }
      return this.followTarget();
    } else if (isFollowing) {
      this.target = null;
      this.engine.emit(new Events.Event('message', {
        message: this.entity.name + ' lost ' + this.target.name + '.',
        target: this.target
      }));
      return this.followTarget();
    } else {
      let action = <Behaviours.Action>this.randomWalkBehaviour.invoke();
      return this.energyComponent.useEnergy(action.act());
    }
  }

  private getDistance(position: Core.Position) {
    return Core.Position.distance(this.physicsComponent.position, position);
  }

  private followTarget() {
    const distance = this.getDistance(this.targetPosition);

    if (distance === 1 && this.target) {
      const attackAction = new Behaviours.MeleeAttackAction(this.entity, this.target);
      return this.energyComponent.useEnergy(attackAction.act());
    } else if (distance === 0) {
      this.targetPosition = null;
      let action = <Behaviours.Action>this.randomWalkBehaviour.invoke();
      return this.energyComponent.useEnergy(action.act());
    } else {
      this.followTargetBehavoiur.setTarget(this.targetPosition);
      const walkAction = this.followTargetBehavoiur.invoke();
      return this.energyComponent.useEnergy(walkAction.act());
    }
  }
}
