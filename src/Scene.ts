import * as Core from './core';
import * as Events from './events';
import * as Components from './components';
import * as Entities from './entities';
import * as Map from './map';

import * as Exceptions from './Exceptions';

import Engine = require('./Engine');
import Console = require('./Console');

import MapView = require('./MapView');
import LogView = require('./LogView');

class Scene {
  private _engine: Engine;
  get engine() {
    return this._engine;
  }

  private _map: Map.Map;
  get map() {
    return this._map;
  }

  private width: number;
  private height: number;

  private logView: LogView;
  private mapView: MapView;

  private player: Entities.Entity;

  constructor(engine: Engine, width: number, height: number) {
    this._engine = engine;
    this.width = width;
    this.height = height;

  }

  start() {
    Core.Position.setMaxValues(this.width, this.height - 5);
    let dungeonGenerator = new Map.DungeonGenerator(this.width, this.height - 5);
    this._map = dungeonGenerator.generate();

    this.registerListeners();

    this.mapView = new MapView(this.engine, this.map, this.map.width, this.map.height);

    this.generateWily();
    this.generateEntities(Entities.createRat, 10);
    this.generateEntities(Entities.createImp, 10);

    this.logView = new LogView(this.engine, this.width, 5, this.player);

    this.mapView.setViewEntity(this.player);

  }

  private generateWily() {
    this.player = Entities.createWily(this.engine);
    this.positionEntity(this.player);
  }


  private generateEntities(generator: (engine: Engine) => Entities.Entity, num: number) {
    for (var i = 0; i < num; i++) {
      this.positionEntity(generator(this.engine));
    }
  }

  private positionEntity(entity: Entities.Entity) {
    let component = <Components.PhysicsComponent>entity.getComponent(Components.PhysicsComponent);
    let positioned = false;
    let tries = 0;
    let position = null;
    while (tries < 1000 && !positioned) {
      position = Core.Position.getRandom();
      positioned = this.isWithoutEntity(position);
    }

    if (positioned) {
      component.moveTo(position);
    }
  }

  private registerListeners() {
    this.engine.listen(new Events.Listener(
      'isWithoutEntity', 
      this.onIsWithoutEntity.bind(this)
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
    this.engine.listen(new Events.Listener(
      'getPath', 
      this.onGetPath.bind(this)
    ));
  }

  private onGetPath(event: Events.Event) {
    let start = event.data.start;
    let target = event.data.target;

    return this.map.getPath(start, target);
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

  private onIsWithoutEntity(event: Events.Event): boolean {
    let position = event.data.position;
    return this.isWithoutEntity(position);
  }

  private isWithoutEntity(position: Core.Position): boolean {
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
