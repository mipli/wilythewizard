import Engine = require('./Engine');
import Scene = require('./Scene');

window.onload = () => {
  let engine = new Engine(60, 40, 'rogue');
  let scene = new Scene(engine, 60, 40);
  engine.start(scene);
};
