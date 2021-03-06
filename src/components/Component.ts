import * as Core from '../core';
import * as Exceptions from '../Exceptions';
import * as Entities from '../entities';
import * as Events from '../events';
import Engine = require('../Engine');

export class Component {
  protected listeners: Events.Listener[];

  protected _guid: string;
  get guid() {
    return this._guid;
  }

  protected _entity: Entities.Entity;
  get entity() {
    return this._entity;
  }

  protected _engine: Engine;
  get engine() {
    return this._engine;
  }

  constructor(engine: Engine, data: any = {}) {
    this._guid = Core.Utils.generateGuid();
    this._engine = engine;
    this.listeners = [];
  }

  registerEntity(entity: Entities.Entity) {
    this._entity = entity;
    this.checkRequirements();
    this.initialize();
    this.registerListeners();
  }

  protected checkRequirements(): void {
  }

  protected registerListeners() {
  }

  protected initialize() {
  }

  destroy() {
    if (!this.listeners || typeof this.listeners.forEach !== 'function') {
      throw new Exceptions.MissingImplementationError('`this.listeners` has been redefined, default `destroy` function should not be used. For: ' + this.entity.name);
    }
    this.listeners.forEach((listener) => {
      this.engine.removeListener(listener);
      this.entity.removeListener(listener);
    });
    this.listeners = [];
  }
}
