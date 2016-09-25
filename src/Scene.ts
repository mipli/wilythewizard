import * as Core from './core';
import * as Events from './events';
import * as Components from './components';
import * as Entities from './entities';
import * as Exceptions from './Exceptions';

import Engine = require('./Engine');
import Console = require('./Console');
import MapGenerator = require('./MapGenerator');
import Map = require('./Map');
import Tile = require('./Tile');
import Glyph = require('./Glyph');

import MapView = require('./MapView');
import LogView = require('./LogView');

class Scene {
  private _engine: Engine;
  get engine() {
    return this._engine;
  }

  private _map: Map;
  get map() {
    return this._map;
  }

  private width: number;
  private height: number;

  private logView: LogView;
  private mapView: MapView;

  constructor(engine: Engine, width: number, height: number) {
    this._engine = engine;
    this.width = width;
    this.height = height;

  }

  start() {
    let mapGenerator = new MapGenerator(this.width, this.height - 5);
    this._map = mapGenerator.generate();
    Core.Position.setMaxValues(this.map.width, this.map.height);

    this.registerListeners();

    this.mapView = new MapView(this.engine, this.map, this.map.width, this.map.height);
    this.logView = new LogView(this.engine, this.width, 5);

    this.generateWily();
    this.generateRats();
  }

  private generateWily() {
    this.positionEntity(Entities.createWily(this.engine));
  }

  private generateRats(num: number = 10) {
    for (var i = 0; i < num; i++) {
      this.generateRat();
    }
  }

  private generateRat() {
    this.positionEntity(Entities.createRat(this.engine));
  }

  private positionEntity(entity: Entities.Entity) {
    let component = <Components.PhysicsComponent>entity.getComponent(Components.PhysicsComponent);
    let positioned = false;
    let tries = 0;
    let position = null;
    while (tries < 100 && !positioned) {
      position = Core.Position.getRandom();
      positioned = this.canMove(position);
    }

    if (positioned) {
      component.moveTo(position);
    }
  }

  private registerListeners() {
    this.engine.listen(new Events.Listener(
      'canMove', 
      this.onCanMove.bind(this)
    ));
    this.engine.listen(new Events.Listener(
      'movedFrom', 
      this.onMovedFrom.bind(this)
    ));
    this.engine.listen(new Events.Listener(
      'movedTo', 
      this.onMovedTo.bind(this)
    ));
    this.engine.listen(new Events.Listener(
      'getTile', 
      this.onGetTile.bind(this)
    ));
  }

  private onGetTile(event: Events.Event) {
    let position = event.data.position;
    return this.map.getTile(position);
  }

  private onMovedFrom(event: Events.Event) {
    let tile = this.map.getTile(event.data.physicsComponent.position);
    if (!event.data.physicsComponent.blocking) {
      delete tile.props[event.data.entity.guid];
    } else {
      tile.entity = null;
    }
  }

  private onMovedTo(event: Events.Event) {
    let tile = this.map.getTile(event.data.physicsComponent.position);
    if (!event.data.physicsComponent.blocking) {
      tile.props[event.data.entity.guid] = event.data.entity;
    } else {
      if (tile.entity) {
        throw new Exceptions.EntityOverlapError('Two entities cannot be at the same spot');
      }
      tile.entity = event.data.entity;
    }
  }

  private onCanMove(event: Events.Event): boolean {
    let position = event.data.position;
    return this.canMove(position);
  }

  private canMove(position: Core.Position): boolean {
    let tile = this.map.getTile(position);
    return tile.walkable && tile.entity === null;
  }

  render(blitFunction: any): void {
    this.mapView.render((console: Console) => {
      blitFunction(console, 0, 0);
    });
    this.logView.render((console: Console) => {
      blitFunction(console, 0, this.height - 5);
    });
  }
}

export = Scene;
