import Engine = require('../Engine');

import * as Core from '../core';
import * as Behaviours from '../behaviours';
import * as Components from './index';
import * as Events from '../events';
import * as Entities from '../entities';

export class FollowTargetAIComponent extends Components.Component {
  private energyComponent: Components.EnergyComponent;
  private physicsComponent: Components.PhysicsComponent;

  private targetType: Entities.Type;

  private behaviourTree: Behaviours.BehaviourTree;

  constructor(engine: Engine, data: {targetType: Entities.Type}) {
    super(engine);
    this.targetType = data.targetType;
  }

  protected initialize() {
    this.energyComponent = <Components.EnergyComponent>this.entity.getComponent(Components.EnergyComponent);
    this.physicsComponent = <Components.PhysicsComponent>this.entity.getComponent(Components.PhysicsComponent);

    this.initializeBehaviourTree();
  }

  private initializeBehaviourTree() {
    let findTargetBehaviour = new Behaviours.FindTargetBehaviour(this.engine, this.entity, (entity: Entities.Entity) => {
      return entity.type === this.targetType
    }, 5);
    let followTargetBehaviour = new Behaviours.FollowTargetBehaviour(this.engine, this.entity);
    let randomWalkBehaviour = new Behaviours.RandomWalkBehaviour(this.engine, this.entity);
    let meleeAttackBehaviour = new Behaviours.MeleeAttackBehaviour(this.engine, this.entity);

    let root = new Behaviours.SelectorNode();

    let findTargetNode = new Behaviours.SelectorNode();
    findTargetNode.addChild(followTargetBehaviour);
    
    let followOrAttackTargetNode = new Behaviours.SelectorNode();
    followOrAttackTargetNode.addChild(meleeAttackBehaviour);
    followOrAttackTargetNode.addChild(followTargetBehaviour);

    let findAndFollowTargetNode = new Behaviours.SequenceNode();
    findAndFollowTargetNode.addChild(findTargetBehaviour);
    findAndFollowTargetNode.addChild(followOrAttackTargetNode);

    root.addChild(findAndFollowTargetNode);
    root.addChild(randomWalkBehaviour);

    this.behaviourTree = new Behaviours.BehaviourTree();
    this.behaviourTree.addRoot(root);
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
    let action = this.behaviourTree.invoke();
    if (typeof (<Behaviours.Action>action).act === 'function') {
      return this.energyComponent.useEnergy((<Behaviours.Action>action).act());
    } else {
      return this.energyComponent.useEnergy((new Behaviours.NullAction()).act());
    }
  }
}
