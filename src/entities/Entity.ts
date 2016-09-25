import * as Collections from 'typescript-collections';

import * as Core from '../core';
import * as Events from '../events';
import * as Components from '../components';
import * as Mixins from '../mixins';

import Engine = require('../Engine');

export class Entity implements Mixins.IEventHandler {
  // EventHandler mixin
  listen: (listener: Events.Listener) => Events.Listener;
  removeListener: (listener: Events.Listener) => void;
  emit: (event: Events.Event) => void;
  fire: (event: Events.Event) => any;
  can: (event: Events.Event) => boolean;

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

  constructor(engine: Engine, _name: string = '') {
    this.engine = engine;
    this._guid = Core.Utils.generateGuid();
    this._name = _name;


    this.components = [];

    this.engine.registerEntity(this);
  }

  destroy() {
    this.components.forEach((component) => {
      component.destroy();
      component = null;
    });
    this.engine.removeEntity(this);
  }

  addComponent(component: Components.Component) {
    this.components.push(component);
    component.registerEntity(this);
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
}

Core.Utils.applyMixins(Entity, [Mixins.EventHandler]);
