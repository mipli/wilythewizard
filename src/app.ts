let hash = window.location.hash;
if (hash) {
  (<any>window).SEED = hash.substring(1);
}

import Engine = require('./Engine');
import Scene = require('./Scene');
import * as Events from './events';

window.onload = () => {
  let engine = new Engine(60, 40, 'rogue');
  let scene = new Scene(engine, 60, 40);
  engine.start(scene);

  (<any>window).ToggleFogOfWar = () => {
    engine.emit(new Events.Event('toggleFogOfWar'));
  };
};
