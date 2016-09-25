import * as Core from './core';
import * as Components from './components';
import * as Entities from './entities';
import * as Events from './events';

import Glyph = require('./Glyph');
import Engine = require('./Engine');
import Console = require('./Console');
import Map = require('./Map');
import Tile = require('./Tile');

class MapView {
  private renderableEntities: ({guid: string, renderable: Components.RenderableComponent, physics: Components.PhysicsComponent})[];
  private renderableItems: ({guid: string, renderable: Components.RenderableComponent, physics: Components.PhysicsComponent})[];
  private console: Console;

  constructor(private engine: Engine, private map: Map, private width: number, private height: number) {
    this.registerListeners();
    this.console = new Console(this.width, this.height);
    this.renderableEntities = [];
    this.renderableItems = [];
  }

  private registerListeners() {
    this.engine.listen(new Events.Listener(
      'renderableComponentCreated',
      this.onRenderableComponentCreated.bind(this)
    ));
    this.engine.listen(new Events.Listener(
      'renderableComponentDestroyed',
      this.onRenderableComponentDestroyed.bind(this)
    ));
  }

  private onRenderableComponentDestroyed(event: Events.Event) {
    const physics = <Components.PhysicsComponent>event.data.entity.getComponent(Components.PhysicsComponent);
    let idx = null;

    if (physics.blocking) {
      idx = this.renderableEntities.findIndex((entity) => {
        return entity.guid === event.data.entity.guid;
      });
      if (idx !== null) {
        this.renderableEntities.splice(idx, 1);
      }
    } else {
      idx = this.renderableItems.findIndex((entity) => {
        return entity.guid === event.data.entity.guid;
      });
      if (idx !== null) {
        this.renderableItems.splice(idx, 1);
      }
    }
  }

  private onRenderableComponentCreated(event: Events.Event) {
    const physics = <Components.PhysicsComponent>event.data.entity.getComponent(Components.PhysicsComponent);

    if (physics.blocking) {
      this.renderableEntities.push({
        guid: event.data.entity.guid,
        renderable: event.data.renderableComponent,
        physics: physics
      });
    } else {
      this.renderableItems.push({
        guid: event.data.entity.guid,
        renderable: event.data.renderableComponent,
        physics: physics
      });
    }
  }

  render(blitFunction: any) {
    this.renderMap(this.console);
    blitFunction(this.console);
  }

  private renderMap(console: Console) {
    this.renderBackground(console);
    this.renderItems(console);
    this.renderEntities(console);
  }

  private renderEntities(console: Console) {
    this.renderableEntities.forEach((data) => {
      if (data.renderable && data.physics) {
        this.renderGlyph(console, data.renderable.glyph, data.physics.position);
      }
    });
  }

  private renderItems(console: Console) {
    this.renderableItems.forEach((data) => {
      if (data.renderable && data.physics) {
        this.renderGlyph(console, data.renderable.glyph, data.physics.position);
      }
    });
  }

  private renderGlyph(console: Console, glyph: Glyph, position: Core.Position) {
    console.setText(glyph.glyph, position.x, position.y);
    console.setForeground(glyph.foregroundColor, position.x, position.y);
  }

  private renderBackground(console: Console) {
    this.map.forEach((position: Core.Position, tile: Tile) => {
      let glyph = tile.glyph;
      console.setText(glyph.glyph, position.x, position.y);
      console.setForeground(glyph.foregroundColor, position.x, position.y);
      console.setBackground(glyph.backgroundColor, position.x, position.y);
    });
  }
}

export = MapView;
