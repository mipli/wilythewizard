import * as Collections from 'typescript-collections';

import * as Core from '../core';
import * as Events from '../events';
import * as Components from '../components';
import * as Mixins from '../mixins';
import * as Entities from './index';

import Engine = require('../Engine');

export class Entity implements Mixins.IEventHandler {
  // EventHandler mixin
  listen: (listener: Events.Listener) => Events.Listener;
  removeListener: (listener: Events.Listener) => void;
  emit: (event: Events.Event) => void;
  fire: (event: Events.Event) => any;
  is: (event: Events.Event) => boolean;
  gather: (event: Events.Event) => any[];

  private _type: Entities.Type;
  get type() {
    return this._type;
  }

  private _name: string;
  get name() {
    return this._name;
  }
  private _guid: string;
  get guid() {
    return this._guid;
  }
  private engine: Engine;
  private components: Components.Component[];

  constructor(engine: Engine, name: string = '', type: Entities.Type = Entities.Type.Other) {
    this.engine = engine;
    this._guid = Core.Utils.generateGuid();
    this._name = name;
    this._type = type;


    this.components = [];

    this.engine.registerEntity(this);
  }

  destroy() {
    this.engine.emit(new Events.Event('entityDestroyed', {
      entity: this
    }));
    this.components.forEach((component) => {
      component.destroy();
      component = null;
    });
    this.engine.removeEntity(this);
  }

  addComponent(component: Components.Component, options: {duration: number} = null) {
    this.components.push(component);
    component.registerEntity(this);

    if (options && options.duration) {
      const delayedComponentRemover = new DelayedComponentRemover();
      delayedComponentRemover.triggerTurn = this.engine.currentTurn + options.duration;
      delayedComponentRemover.entity = this;
      delayedComponentRemover.engine = this.engine;
      delayedComponentRemover.guid = component.guid;
      delayedComponentRemover.listener = this.engine.listen(new Events.Listener(
        'turn',
        delayedComponentRemover.check.bind(delayedComponentRemover)
      ));
    }
  }

  hasComponent(componentType): boolean {
    return this.components.filter((component) => {
      return component instanceof componentType;
    }).length > 0;
  }

  getComponent(componentType): Components.Component {
    let component = this.components.filter((component) => {
      return component instanceof componentType;
    });
    if (component.length === 0) {
      return null;
    }
    return component[0];
  }

  removeComponent(guid: string) {
    const idx = this.components.findIndex((component) => {
      return component.guid === guid;
    });
    if (idx >= 0) {
      this.components[idx].destroy();
      this.components.splice(idx, 1);
    }
  }

}

class DelayedComponentRemover {
  triggerTurn: number;
  listener: Events.Listener;
  entity: Entity;
  engine: Engine;
  guid: string;
  check(event: Events.Event) {
    if (event.data.currentTurn >= this.triggerTurn) {
      this.entity.removeComponent(this.guid);
      this.engine.removeListener(this.listener);
    }
  }
}

Core.Utils.applyMixins(Entity, [Mixins.EventHandler]);
