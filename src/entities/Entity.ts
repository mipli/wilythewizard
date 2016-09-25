import * as Collections from 'typescript-collections';

import * as Core from '../core';
import * as Events from '../events';
import * as Components from '../components';

import Engine = require('../Engine');

export class Entity {
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

  private listeners: {[event: string]: Collections.PriorityQueue<Events.IListener>};

  constructor(engine: Engine, _name: string = '') {
    this.engine = engine;
    this._guid = Core.Utils.generateGuid();
    this._name = _name;


    this.components = [];
    this.listeners = {};

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

  listen(listener: Events.IListener) {
    if (!this.listeners[listener.type]) {
      this.listeners[listener.type] = new Collections.PriorityQueue<Events.IListener>((a: Events.IListener, b: Events.IListener) => {
        if (a.priority < b.priority) {
          return 1;
        }
        if (a.priority > b.priority) {
          return -1;
        }
        return 0;
      });
    }

    this.listeners[listener.type].enqueue(listener);
  }

  emit(event: Events.Event) {
    if (!this.listeners[event.type]) {
      return null;
    }

    let usedListeners = [];
    while (!this.listeners[event.type].isEmpty()) {
      let listener = this.listeners[event.type].dequeue();
      listener.callback(event);
      usedListeners.push(listener)
    }

    while (usedListeners.length > 0) {
      this.listeners[event.type].enqueue(usedListeners.pop());
    }
  }

  fire(event: Events.Event) {
    if (!this.listeners[event.type]) {
      return null;
    }

    let usedListeners = [];
    let ret = null;
    while (ret === null && !this.listeners[event.type].isEmpty()) {
      let listener = this.listeners[event.type].dequeue();
      ret = listener.callback(event);
      usedListeners.push(listener)
    }

    while (usedListeners.length > 0) {
      this.listeners[event.type].enqueue(usedListeners.pop());
    }

    return ret;
  }
}
