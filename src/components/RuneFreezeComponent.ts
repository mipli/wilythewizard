import * as Core from '../core';
import * as Events from '../events';
import * as Entities from '../entities';
import * as Components from './index';

import Engine = require('../Engine');

export class RuneFreezeComponent extends Components.Component {
  private radius: number;
  private charges: number;
  private physicsComponent: Components.PhysicsComponent;
  private factionComponent: Components.FactionComponent;

  constructor(engine: Engine, data: {radius: number, charges: number} = {radius: 3, charges: 1}) {
    super(engine);
    this.radius = data.radius;
    this.charges = data.charges;
  }

  initialize() {
    this.physicsComponent = <Components.PhysicsComponent>this.entity.getComponent(Components.PhysicsComponent);
    this.factionComponent = <Components.FactionComponent>this.entity.getComponent(Components.FactionComponent);
  }

  registerListeners() {
    this.listeners.push(this.engine.listen(new Events.Listener(
      'movedTo',
      this.onMovedTo.bind(this),
      50
    )));
  }

  private onMovedTo(event: Events.Event) {
    if (this.charges <= 0) {
      return;
    }
    const eventPosition = event.data.physicsComponent.position; 
    if (eventPosition.x == this.physicsComponent.position.x && 
        eventPosition.y === this.physicsComponent.position.y) {
      this.triggerFreeze(event.data.entity);
    }
  }

  private triggerFreeze(entity: Entities.Entity) {
    if (this.factionComponent) {
      const eventFaction = <Components.FactionComponent>entity.getComponent(Components.FactionComponent);
      if (eventFaction) {
        if (eventFaction.faction === this.factionComponent.faction) {
          return;
        }
      }
    }
    this.addSlowComponent(entity, 10);

    this.engine.getEntities((entity) => {
      const entityComponent = (<Components.PhysicsComponent>entity.getComponent(Components.PhysicsComponent));
      if (!entityComponent) {
        return false;
      }
      const distance = Core.Position.distance(entityComponent.position, this.physicsComponent.position);
      return distance <= this.radius;
    }).map((entity) => this.addSlowComponent(entity, 5));


    this.charges--;
    if (this.charges <= 0) {
      this.engine.removeEntity(this.entity);
    }
  }

  private addSlowComponent(entity: Entities.Entity, duration: number) {
      entity.addComponent(
        new Components.SlowComponent(this.engine, {factor: 0.5}),
        { 
          duration: 5
        }
      ); 
  }
}
