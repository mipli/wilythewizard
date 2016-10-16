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

  private targetType: Entities.Type;
  private target: Entities.Entity;

  constructor(engine: Engine, data: {targetType: Entities.Type}) {
    super(engine);
    this.targetType = data.targetType;
  }

  protected initialize() {
    this.energyComponent = <Components.EnergyComponent>this.entity.getComponent(Components.EnergyComponent);
    this.physicsComponent = <Components.PhysicsComponent>this.entity.getComponent(Components.PhysicsComponent);
    this.findTargetBehavoiur = new Behaviours.FindTargetBehaviour(this.engine, this.entity, 5);
    this.followTargetBehavoiur = new Behaviours.FollowTargetBehaviour(this.engine, this.entity);
  }

  protected registerListeners() {
    this.listeners.push(this.engine.listen(new Events.Listener(
      'tick',
      this.onTick.bind(this)
    )));
  }

  onTick(event: Events.Event) {
    if (this.energyComponent.currentEnergy >= 100) {
      const targetResult = this.findTargetBehavoiur.invoke();
      if (targetResult) {
        const targetPhysicsComponent = <Components.PhysicsComponent>targetResult.entity.getComponent(Components.PhysicsComponent); 
        const distance = Core.Position.distance(this.physicsComponent.position, targetPhysicsComponent.position);

        if (distance === 1) {
          const attackAction = new Behaviours.MeleeAttackAction(this.entity, targetResult.entity);
          return this.energyComponent.useEnergy(attackAction.act());
        } else {
          this.followTargetBehavoiur.setTarget(targetPhysicsComponent.position);
          const walkAction = this.followTargetBehavoiur.invoke();
          return this.energyComponent.useEnergy(walkAction.act());
        }
      }
      this.energyComponent.useEnergy(100);
    }
  }
}
