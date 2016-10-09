import * as Core from '../core';
import * as Events from '../events';
import * as Components from './index';

import Glyph = require('../Glyph');
import Engine = require('../Engine');

export class PhysicsComponent extends Components.Component {
  private _blocking: boolean;
  get blocking() {
    return this._blocking;
  }
  private _position: Core.Position;
  get position() {
    return this._position;
  }

  constructor(engine: Engine, data: {position: Core.Position, blocking: boolean} = {position: null, blocking: true}) {
    super(engine);
    this._position = data.position;
    this._blocking = data.blocking;
  }

  initialize() {
    if (this.position) {
      this.engine.emit(new Events.Event('movedTo', {physicsComponent: this, entity: this.entity}));
      this.engine.emit(new Events.Event('move', {physicsComponent: this, entity: this.entity}));
    }
  }

  destroy() {
    super.destroy();
    this.engine.emit(new Events.Event('movedFrom', {physicsComponent: this, entity: this.entity}));
  }

  moveTo(position: Core.Position) {
    if (this._position) {
      this.engine.emit(new Events.Event('movedFrom', {physicsComponent: this, entity: this.entity}));
    }
    this._position = position;
    this.engine.emit(new Events.Event('movedTo', {physicsComponent: this, entity: this.entity}));
    this.engine.emit(new Events.Event('move', {physicsComponent: this, entity: this.entity}));
    this.entity.emit(new Events.Event('move', {physicsComponent: this, entity: this.entity}));
  }
}
