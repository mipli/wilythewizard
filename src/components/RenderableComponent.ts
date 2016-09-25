import * as Entities from '../entities';
import * as Events from '../events';
import * as Exceptions from '../Exceptions';
import * as Components from './index.ts';

import Glyph = require('../Glyph');
import Engine = require('../Engine');

export class RenderableComponent extends Components.Component {
  private _glyph: Glyph;
  get glyph() {
    return this._glyph;
  }

  constructor(engine: Engine, data: {glyph: Glyph}) {
    super(engine);
    this._glyph = data.glyph;
  }

  protected checkRequirements(): void {
    if (!this.entity.hasComponent(Components.PhysicsComponent)) {
      throw new Exceptions.MissingComponentError('RenderableComponent requires PhysicsComponent');
    }
  }

  protected initialize() {
    this.engine.emit(new Events.Event('renderableComponentCreated', {entity: this.entity, renderableComponent: this}));
  }

  destroy() {
    this.engine.emit(new Events.Event('renderableComponentDestroyed', {entity: this.entity, renderableComponent: this}));
  }
}
