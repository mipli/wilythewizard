import * as Core from './core';
import * as Entities from './entities';
import * as Components from './components';
import * as Events from './events';
import * as Collections from 'typescript-collections';

import PixiConsole = require('./PixiConsole');
import Console = require('./Console');

import InputHandler = require('./InputHandler');

import Scene = require('./Scene');

interface FrameRenderer {
  (elapsedTime: number): void;
}
let renderer: FrameRenderer;
let frameLoop: (callback: (elapsedTime: number) => void) => void;

let frameFunc = (elapsedTime: number) => {
  frameLoop(frameFunc);
  renderer(elapsedTime);
}

let loop = (theRenderer: FrameRenderer) => {
  renderer = theRenderer;
  frameLoop(frameFunc);
}

class Engine {
  private pixiConsole: PixiConsole;

  private gameTime: number = 0;
  private engineTicksPerSecond: number = 10;
  private engineTickLength: number = 100;
  private elapsedTime: number = 0;
  private timeHandlerComponent: Components.TimeHandlerComponent;

  private width: number;
  private height: number;
  private canvasId: string;

  private entities: {[guid: string]: Entities.Entity};
  private toDestroy: Entities.Entity[];

//  private listeners: {[event: string]: Collections.PriorityQueue<Events.Listener>};
  private listeners: {[event: string]: Events.Listener[]};

  private paused: boolean;

  private _inputHandler: InputHandler;
  get inputHandler() {
    return this._inputHandler;
  }

  private _currentScene: Scene;
  get currentScene() {
    return this._currentScene;
  }

  constructor(width: number, height: number, canvasId: string) {
    this.paused = false;

    this.width = width;
    this.height = height;
    this.canvasId = canvasId;

    this.listeners = {};
    this.entities = {};
    this.toDestroy = [];

    this.engineTicksPerSecond = 10;
    frameLoop = (function() {
      return window.requestAnimationFrame ||
        (<any>window).webkitRequestAnimationFrame || (<any>window).mozRequestAnimationFrame ||
        (<any>window).oRequestAnimationFrame ||
        (<any>window).msRequestAnimationFrame ||
        function(callback: (elapsedTime: number) => void) {
        window.setTimeout(callback, 1000 / 60, new Date().getTime());
      };
    })();

    this.engineTickLength = 1000 / this.engineTicksPerSecond;

    window.addEventListener('focus', () => {
      this.paused = false;
    });
    window.addEventListener('blur', () => {
      this.paused = true;
    });

    this._inputHandler = new InputHandler(this);
  }

  start(scene: Scene) {
    this._currentScene = scene;
    this._currentScene.start();

    let timeKeeper = new Entities.Entity(this, 'timeKeeper');
    this.timeHandlerComponent = new Components.TimeHandlerComponent(this);
    timeKeeper.addComponent(this.timeHandlerComponent);

    this.pixiConsole = new PixiConsole(this.width, this.height, this.canvasId, 0xffffff, 0x000000);
    loop((time) => {
      if (this.paused) {
        return;
      }
      this.elapsedTime = time - this.gameTime;

      if (this.elapsedTime >= this.engineTickLength) {
        this.gameTime = time;
        this.timeHandlerComponent.engineTick(this.gameTime);

        this.destroyEntities();

        scene.render((console: Console, x: number, y: number) => {
          this.pixiConsole.blit(console, x, y);
        });
      }
      this.pixiConsole.render();
    });
  }

  registerEntity(entity: Entities.Entity) {
    this.entities[entity.guid] = entity;
  }

  removeEntity(entity: Entities.Entity) {
    this.toDestroy.push(entity);
  }

  private destroyEntities() {
    this.toDestroy.forEach((entity) => {
      entity.destroy();
      this.emit(new Events.Event('entityDestroyed', {entity: entity}));
      delete this.entities[entity.guid];
    });
    this.toDestroy = [];
  }

  getEntity(guid: string) {
    return this.entities[guid];
  }

  listen(listener: Events.Listener) {
    if (!this.listeners[listener.type]) {
      this.listeners[listener.type] = [];
    }

    this.listeners[listener.type].push(listener);
    this.listeners[listener.type] = this.listeners[listener.type].sort((a: Events.Listener, b: Events.Listener) => a.priority - b.priority);

    return listener;
  }

  removeListener(listener: Events.Listener) {
    if (!this.listeners[listener.type]) {
      return null;
    }

    const idx = this.listeners[listener.type].findIndex((l) => {
      return l.guid === listener.guid;
    });
    if (typeof idx === 'number') {
      this.listeners[listener.type].splice(idx, 1);
    }
  }

  emit(event: Events.Event) {
    if (event.type === 'message') {
      console.log(event);
    }
    if (!this.listeners[event.type]) {
      return null;
    }
    const listeners = this.listeners[event.type].map((i) => i);

    listeners.forEach((listener) => {
      listener.callback(event);
    });
  }

  can(event: Events.Event): boolean {
    if (!this.listeners[event.type]) {
      return true;
    }

    let returnedValue = true;

    this.listeners[event.type].forEach((listener) => {
      if (!returnedValue) {
        return;
      }
      returnedValue = listener.callback(event);
    });
    return returnedValue;
  }

  fire(event: Events.Event) {
    if (!this.listeners[event.type]) {
      return null;
    }

    let returnedValue = null;

    this.listeners[event.type].forEach((listener) => {
      returnedValue = listener.callback(event);
    });
    return returnedValue;
  }
}

export = Engine;
