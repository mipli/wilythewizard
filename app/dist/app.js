(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('./core');
var Map = require('./map');

var Console = function () {
    function Console(width, height) {
        var foreground = arguments.length <= 2 || arguments[2] === undefined ? 0xffffff : arguments[2];
        var background = arguments.length <= 3 || arguments[3] === undefined ? 0x000000 : arguments[3];

        _classCallCheck(this, Console);

        this._width = width;
        this._height = height;
        this.defaultBackground = 0x00000;
        this.defaultForeground = 0xfffff;
        this._text = Core.Utils.buildMatrix(this.width, this.height, Map.Glyph.CHAR_SPACE);
        this._fore = Core.Utils.buildMatrix(this.width, this.height, this.defaultForeground);
        this._back = Core.Utils.buildMatrix(this.width, this.height, this.defaultBackground);
        this._isDirty = Core.Utils.buildMatrix(this.width, this.height, true);
    }

    _createClass(Console, [{
        key: 'cleanCell',
        value: function cleanCell(x, y) {
            this._isDirty[x][y] = false;
        }
    }, {
        key: 'print',
        value: function print(text, x, y) {
            var color = arguments.length <= 3 || arguments[3] === undefined ? 0xffffff : arguments[3];

            var begin = 0;
            var end = text.length;
            if (x + end > this.width) {
                end = this.width - x;
            }
            if (x < 0) {
                end += x;
                x = 0;
            }
            this.setForeground(color, x, y, end, 1);
            for (var i = begin; i < end; ++i) {
                this.setText(text.charCodeAt(i), x + i, y);
            }
        }
    }, {
        key: 'setText',
        value: function setText(ascii, x, y) {
            var width = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];
            var height = arguments.length <= 4 || arguments[4] === undefined ? 1 : arguments[4];

            if (typeof ascii === 'string') {
                ascii = ascii.charCodeAt(0);
            }
            this.setMatrix(this._text, ascii, x, y, width, height);
        }
    }, {
        key: 'setForeground',
        value: function setForeground(color, x, y) {
            var width = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];
            var height = arguments.length <= 4 || arguments[4] === undefined ? 1 : arguments[4];

            this.setMatrix(this._fore, color, x, y, width, height);
        }
    }, {
        key: 'setBackground',
        value: function setBackground(color, x, y) {
            var width = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];
            var height = arguments.length <= 4 || arguments[4] === undefined ? 1 : arguments[4];

            this.setMatrix(this._back, color, x, y, width, height);
        }
    }, {
        key: 'setMatrix',
        value: function setMatrix(matrix, value, x, y, width, height) {
            for (var i = x; i < x + width; i++) {
                for (var j = y; j < y + height; j++) {
                    if (matrix[i][j] === value) {
                        continue;
                    }
                    matrix[i][j] = value;
                    this._isDirty[i][j] = true;
                }
            }
        }
    }, {
        key: 'width',
        get: function get() {
            return this._width;
        }
    }, {
        key: 'height',
        get: function get() {
            return this._height;
        }
    }, {
        key: 'text',
        get: function get() {
            return this._text;
        }
    }, {
        key: 'fore',
        get: function get() {
            return this._fore;
        }
    }, {
        key: 'back',
        get: function get() {
            return this._back;
        }
    }, {
        key: 'isDirty',
        get: function get() {
            return this._isDirty;
        }
    }]);

    return Console;
}();

module.exports = Console;

},{"./core":33,"./map":50}],2:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('./core');
var Entities = require('./entities');
var Components = require('./components');
var Events = require('./events');
var Mixins = require('./mixins');
var PixiConsole = require('./PixiConsole');
var InputHandler = require('./InputHandler');
var renderer = void 0;
var frameLoop = void 0;
var frameFunc = function frameFunc(elapsedTime) {
    frameLoop(frameFunc);
    renderer(elapsedTime);
};
var loop = function loop(theRenderer) {
    renderer = theRenderer;
    frameLoop(frameFunc);
};

var Engine = function () {
    function Engine(width, height, canvasId) {
        var _this = this;

        _classCallCheck(this, Engine);

        this.gameTime = 0;
        this.engineTicksPerSecond = 10;
        this.engineTickLength = 100;
        this.elapsedTime = 0;
        this.paused = false;
        this.width = width;
        this.height = height;
        this.canvasId = canvasId;
        this.entities = {};
        this.toDestroy = [];
        this.currentTick = 0;
        this.currentTurn = 0;
        this.engineTicksPerSecond = 10;
        frameLoop = function () {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
                window.setTimeout(callback, 1000 / 60, new Date().getTime());
            };
        }();
        this.engineTickLength = 1000 / this.engineTicksPerSecond;
        window.addEventListener('focus', function () {
            _this.paused = false;
        });
        window.addEventListener('blur', function () {
            _this.paused = true;
        });
        this._inputHandler = new InputHandler(this);
    }

    _createClass(Engine, [{
        key: 'start',
        value: function start(scene) {
            var _this2 = this;

            this._currentScene = scene;
            this._currentScene.start();
            var timeKeeper = new Entities.Entity(this, 'timeKeeper');
            this.timeHandlerComponent = new Components.TimeHandlerComponent(this);
            timeKeeper.addComponent(this.timeHandlerComponent);
            this.pixiConsole = new PixiConsole(this.width, this.height, this.canvasId, 0xffffff, 0x000000);
            loop(function (time) {
                if (_this2.paused) {
                    return;
                }
                _this2.elapsedTime = time - _this2.gameTime;
                if (_this2.elapsedTime >= _this2.engineTickLength) {
                    _this2.gameTime = time;
                    _this2.timeHandlerComponent.engineTick(_this2.gameTime);
                    _this2.destroyEntities();
                    scene.render(function (console, x, y) {
                        _this2.pixiConsole.blit(console, x, y);
                    });
                }
                _this2.pixiConsole.render();
            });
        }
    }, {
        key: 'registerEntity',
        value: function registerEntity(entity) {
            this.entities[entity.guid] = entity;
        }
    }, {
        key: 'removeEntity',
        value: function removeEntity(entity) {
            this.toDestroy.push(entity);
        }
    }, {
        key: 'destroyEntities',
        value: function destroyEntities() {
            var _this3 = this;

            this.toDestroy.forEach(function (entity) {
                entity.destroy();
                _this3.emit(new Events.Event('entityDestroyed', { entity: entity }));
                delete _this3.entities[entity.guid];
            });
            this.toDestroy = [];
        }
    }, {
        key: 'getEntity',
        value: function getEntity(guid) {
            return this.entities[guid];
        }
    }, {
        key: 'inputHandler',
        get: function get() {
            return this._inputHandler;
        }
    }, {
        key: 'currentScene',
        get: function get() {
            return this._currentScene;
        }
    }]);

    return Engine;
}();

Core.Utils.applyMixins(Engine, [Mixins.EventHandler]);
module.exports = Engine;

},{"./InputHandler":4,"./PixiConsole":7,"./components":30,"./core":33,"./entities":36,"./events":39,"./mixins":52}],3:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MissingComponentError = function (_Error) {
    _inherits(MissingComponentError, _Error);

    function MissingComponentError(message) {
        _classCallCheck(this, MissingComponentError);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MissingComponentError).call(this, message));

        _this.message = message;
        return _this;
    }

    return MissingComponentError;
}(Error);

exports.MissingComponentError = MissingComponentError;

var MissingImplementationError = function (_Error2) {
    _inherits(MissingImplementationError, _Error2);

    function MissingImplementationError(message) {
        _classCallCheck(this, MissingImplementationError);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(MissingImplementationError).call(this, message));

        _this2.message = message;
        return _this2;
    }

    return MissingImplementationError;
}(Error);

exports.MissingImplementationError = MissingImplementationError;

var EntityOverlapError = function (_Error3) {
    _inherits(EntityOverlapError, _Error3);

    function EntityOverlapError(message) {
        _classCallCheck(this, EntityOverlapError);

        var _this3 = _possibleConstructorReturn(this, Object.getPrototypeOf(EntityOverlapError).call(this, message));

        _this3.message = message;
        return _this3;
    }

    return EntityOverlapError;
}(Error);

exports.EntityOverlapError = EntityOverlapError;

var CouldNotGenerateMap = function (_Error4) {
    _inherits(CouldNotGenerateMap, _Error4);

    function CouldNotGenerateMap(message) {
        _classCallCheck(this, CouldNotGenerateMap);

        var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(CouldNotGenerateMap).call(this, message));

        _this4.message = message;
        return _this4;
    }

    return CouldNotGenerateMap;
}(Error);

exports.CouldNotGenerateMap = CouldNotGenerateMap;

},{}],4:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var InputHandler = function () {
    function InputHandler(engine) {
        _classCallCheck(this, InputHandler);

        this.engine = engine;
        this.listeners = {};
        this.registerListeners();
    }

    _createClass(InputHandler, [{
        key: "registerListeners",
        value: function registerListeners() {
            window.addEventListener('keydown', this.onKeyDown.bind(this));
        }
    }, {
        key: "onKeyDown",
        value: function onKeyDown(event) {
            if (this.listeners[event.keyCode]) {
                this.listeners[event.keyCode].forEach(function (callback) {
                    callback();
                });
            }
        }
    }, {
        key: "listen",
        value: function listen(keycodes, callback) {
            var _this = this;

            keycodes.forEach(function (keycode) {
                if (!_this.listeners[keycode]) {
                    _this.listeners[keycode] = [];
                }
                _this.listeners[keycode].push(callback);
            });
        }
    }]);

    return InputHandler;
}();

InputHandler.KEY_PERIOD = 190;
InputHandler.KEY_LEFT = 37;
InputHandler.KEY_UP = 38;
InputHandler.KEY_RIGHT = 39;
InputHandler.KEY_DOWN = 40;
InputHandler.KEY_0 = 48;
InputHandler.KEY_1 = 49;
InputHandler.KEY_2 = 50;
InputHandler.KEY_3 = 51;
InputHandler.KEY_4 = 52;
InputHandler.KEY_5 = 53;
InputHandler.KEY_6 = 54;
InputHandler.KEY_7 = 55;
InputHandler.KEY_8 = 56;
InputHandler.KEY_9 = 57;
InputHandler.KEY_A = 65;
InputHandler.KEY_B = 66;
InputHandler.KEY_C = 67;
InputHandler.KEY_D = 68;
InputHandler.KEY_E = 69;
InputHandler.KEY_F = 70;
InputHandler.KEY_G = 71;
InputHandler.KEY_H = 72;
InputHandler.KEY_I = 73;
InputHandler.KEY_J = 74;
InputHandler.KEY_K = 75;
InputHandler.KEY_L = 76;
InputHandler.KEY_M = 77;
InputHandler.KEY_N = 78;
InputHandler.KEY_O = 79;
InputHandler.KEY_P = 80;
InputHandler.KEY_Q = 81;
InputHandler.KEY_R = 82;
InputHandler.KEY_S = 83;
InputHandler.KEY_T = 84;
InputHandler.KEY_U = 85;
InputHandler.KEY_V = 86;
InputHandler.KEY_W = 87;
InputHandler.KEY_X = 88;
InputHandler.KEY_Y = 89;
InputHandler.KEY_Z = 90;
module.exports = InputHandler;

},{}],5:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Events = require('./events');
var Map = require('./map');
var Console = require('./Console');

var LogView = function () {
    function LogView(engine, width, height, player) {
        _classCallCheck(this, LogView);

        this.engine = engine;
        this.width = width;
        this.height = height;
        this.registerListeners();
        this.console = new Console(this.width, this.height);
        this.currentTurn = 1;
        this.messages = [];
        this.maxMessages = this.height - 1;
        this.player = player;
        this.effects = [];
    }

    _createClass(LogView, [{
        key: 'registerListeners',
        value: function registerListeners() {
            this.engine.listen(new Events.Listener('turn', this.onTurn.bind(this)));
            this.engine.listen(new Events.Listener('message', this.onMessage.bind(this)));
        }
    }, {
        key: 'onTurn',
        value: function onTurn(event) {
            this.currentTurn = event.data.currentTurn;
            if (this.messages.length > 0 && this.messages[this.messages.length - 1].turn < this.currentTurn - 10) {
                this.messages.pop();
            }
            if (this.player) {
                this.effects = this.player.gather(new Events.Event('getStatusEffect'));
            }
        }
    }, {
        key: 'onMessage',
        value: function onMessage(event) {
            if (event.data.message) {
                this.messages.unshift({
                    turn: this.currentTurn,
                    message: event.data.message
                });
            }
            if (this.messages.length > this.maxMessages) {
                this.messages.pop();
            }
        }
    }, {
        key: 'render',
        value: function render(blitFunction) {
            var _this = this;

            this.console.setText(' ', 0, 0, this.console.width, this.console.height);
            for (var i = 0; i < this.width; i++) {
                for (var j = 0; j < this.height; j++) {
                    var drawn = false;
                    if (i === 0 && j === 0) {
                        this.console.setText(Map.Glyph.CHAR_SE, i, j);
                        drawn = true;
                    } else if (i === this.width - 1 && j === 0) {
                        this.console.setText(Map.Glyph.CHAR_SW, i, j);
                        drawn = true;
                    } else if (i === this.width - 1 && j === this.height - 1) {
                        this.console.setText(Map.Glyph.CHAR_NW, i, j);
                        drawn = true;
                    } else if (i === 0 && j === this.height - 1) {
                        this.console.setText(Map.Glyph.CHAR_NE, i, j);
                        drawn = true;
                    } else if (i === 0 || i === this.width - 1) {
                        this.console.setText(Map.Glyph.CHAR_VLINE, i, j);
                        drawn = true;
                    } else if (j === 0 || j === this.height - 1) {
                        this.console.setText(Map.Glyph.CHAR_HLINE, i, j);
                        drawn = true;
                    }
                    if (drawn) {
                        this.console.setForeground(0xffffff, i, j);
                        this.console.setBackground(0x000000, i, j);
                    }
                }
            }
            this.console.print('Turn: ' + this.currentTurn, this.width - 10, 1, 0xffffff);
            if (this.effects.length > 0) {
                var str = this.effects.reduce(function (acc, effect, idx) {
                    return acc + effect.name + (idx !== _this.effects.length - 1 ? ', ' : '');
                }, 'Effects: ');
                this.console.print(str, 1, 1, 0xffffff);
            }
            if (this.messages.length > 0) {
                this.messages.forEach(function (data, idx) {
                    var color = 0xffffff;
                    if (data.turn < _this.currentTurn - 5) {
                        color = 0x666666;
                    } else if (data.turn < _this.currentTurn - 2) {
                        color = 0xaaaaaa;
                    }
                    _this.console.print(data.message, 1, _this.height - (idx + 1), color);
                });
            }
            blitFunction(this.console);
        }
    }]);

    return LogView;
}();

module.exports = LogView;

},{"./Console":1,"./events":39,"./map":50}],6:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('./core');
var Components = require('./components');
var Events = require('./events');
var Map = require('./map');
var Console = require('./Console');

var MapView = function () {
    function MapView(engine, map, width, height) {
        _classCallCheck(this, MapView);

        this.engine = engine;
        this.map = map;
        this.width = width;
        this.height = height;
        this.fogOfWarColor = 0x9999aa;
        this.registerListeners();
        this.console = new Console(this.width, this.height);
        this.renderableEntities = [];
        this.renderableItems = [];
        this.viewEntity = null;
        this.fovCalculator = null;
        this.lightMap = Core.Utils.buildMatrix(this.width, this.height, 0);
        this.hasSeen = Core.Utils.buildMatrix(this.width, this.height, false);
    }

    _createClass(MapView, [{
        key: 'setViewEntity',
        value: function setViewEntity(entity) {
            var _this = this;

            this.hasSeen = Core.Utils.buildMatrix(this.width, this.height, false);
            this.viewEntity = entity;
            this.viewEntity.listen(new Events.Listener('move', this.onViewEntityMove.bind(this)));
            this.fovCalculator = new Map.FoV(function (pos) {
                var tile = _this.map.getTile(pos);
                return !tile.blocksSight;
            }, this.map.width, this.map.height, 20);
            this.onViewEntityMove(null);
        }
    }, {
        key: 'onViewEntityMove',
        value: function onViewEntityMove(event) {
            var pos = this.viewEntity.getComponent(Components.PhysicsComponent).position;
            this.lightMap = this.fovCalculator.calculate(pos);
            for (var x = 0; x < this.width; x++) {
                for (var y = 0; y < this.height; y++) {
                    if (this.lightMap[x][y] > 0) {
                        this.hasSeen[x][y] = true;
                    }
                }
            }
        }
    }, {
        key: 'registerListeners',
        value: function registerListeners() {
            this.engine.listen(new Events.Listener('renderableComponentCreated', this.onRenderableComponentCreated.bind(this)));
            this.engine.listen(new Events.Listener('renderableComponentDestroyed', this.onRenderableComponentDestroyed.bind(this)));
        }
    }, {
        key: 'onRenderableComponentDestroyed',
        value: function onRenderableComponentDestroyed(event) {
            var physics = event.data.entity.getComponent(Components.PhysicsComponent);
            var idx = null;
            if (physics.blocking) {
                idx = this.renderableEntities.findIndex(function (entity) {
                    return entity.guid === event.data.entity.guid;
                });
                if (idx !== null) {
                    this.renderableEntities.splice(idx, 1);
                }
            } else {
                idx = this.renderableItems.findIndex(function (entity) {
                    return entity.guid === event.data.entity.guid;
                });
                if (idx !== null) {
                    this.renderableItems.splice(idx, 1);
                }
            }
        }
    }, {
        key: 'onRenderableComponentCreated',
        value: function onRenderableComponentCreated(event) {
            var physics = event.data.entity.getComponent(Components.PhysicsComponent);
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
    }, {
        key: 'render',
        value: function render(blitFunction) {
            this.renderMap(this.console);
            blitFunction(this.console);
        }
    }, {
        key: 'renderMap',
        value: function renderMap(console) {
            if (this.viewEntity === null) {
                return;
            }
            this.renderBackground(console);
            this.renderItems(console);
            this.renderEntities(console);
        }
    }, {
        key: 'renderEntities',
        value: function renderEntities(console) {
            var _this2 = this;

            this.renderableEntities.forEach(function (data) {
                if (data.renderable && data.physics) {
                    _this2.renderGlyph(console, data.renderable.glyph, data.physics.position);
                }
            });
        }
    }, {
        key: 'renderItems',
        value: function renderItems(console) {
            var _this3 = this;

            this.renderableItems.forEach(function (data) {
                if (data.renderable && data.physics) {
                    _this3.renderGlyph(console, data.renderable.glyph, data.physics.position);
                }
            });
        }
    }, {
        key: 'renderGlyph',
        value: function renderGlyph(console, glyph, position) {
            if (!this.isVisible(position)) {
                return;
            }
            console.setText(glyph.glyph, position.x, position.y);
            console.setForeground(glyph.foregroundColor, position.x, position.y);
        }
    }, {
        key: 'renderBackground',
        value: function renderBackground(console) {
            var _this4 = this;

            this.map.forEach(function (position, tile) {
                var glyph = tile.glyph;
                if (!_this4.isVisible(position)) {
                    if (_this4.hasSeen[position.x][position.y]) {
                        glyph = new Map.Glyph(glyph.glyph, Core.ColorUtils.colorMultiply(glyph.foregroundColor, _this4.fogOfWarColor), Core.ColorUtils.colorMultiply(glyph.backgroundColor, _this4.fogOfWarColor));
                    } else {
                        glyph = new Map.Glyph(Map.Glyph.CHAR_FULL, 0x111111, 0x111111);
                    }
                }
                console.setText(glyph.glyph, position.x, position.y);
                console.setForeground(glyph.foregroundColor, position.x, position.y);
                console.setBackground(glyph.backgroundColor, position.x, position.y);
            });
        }
    }, {
        key: 'isVisible',
        value: function isVisible(position) {
            return this.lightMap[position.x][position.y] === 1;
        }
    }]);

    return MapView;
}();

module.exports = MapView;

},{"./Console":1,"./components":30,"./core":33,"./events":39,"./map":50}],7:[function(require,module,exports){
/// <reference path='../typings/index.d.ts' />
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('./core');
var Map = require('./map');

var PixiConsole = function () {
    function PixiConsole(width, height, canvasId) {
        var foreground = arguments.length <= 3 || arguments[3] === undefined ? 0xffffff : arguments[3];
        var background = arguments.length <= 4 || arguments[4] === undefined ? 0x000000 : arguments[4];

        _classCallCheck(this, PixiConsole);

        this._width = width;
        this._height = height;
        this.canvasId = canvasId;
        this.loaded = false;
        this.stage = new PIXI.Container();
        this.loadFont();
        this.defaultBackground = 0x00000;
        this.defaultForeground = 0xfffff;
        this.text = Core.Utils.buildMatrix(this.width, this.height, Map.Glyph.CHAR_SPACE);
        this.fore = Core.Utils.buildMatrix(this.width, this.height, this.defaultForeground);
        this.back = Core.Utils.buildMatrix(this.width, this.height, this.defaultBackground);
        this.isDirty = Core.Utils.buildMatrix(this.width, this.height, true);
    }

    _createClass(PixiConsole, [{
        key: 'loadFont',
        value: function loadFont() {
            var fontUrl = './Talryth_square_15x15.png';
            this.font = PIXI.BaseTexture.fromImage(fontUrl, false, PIXI.SCALE_MODES.NEAREST);
            if (this.font.hasLoaded) {
                this.onFontLoaded();
            } else {
                this.font.on('loaded', this.onFontLoaded.bind(this));
            }
        }
    }, {
        key: 'onFontLoaded',
        value: function onFontLoaded() {
            this.charWidth = this.font.width / 16;
            this.charHeight = this.font.height / 16;
            this.initCanvas();
            this.initCharacterMap();
            this.initBackgroundCells();
            this.initForegroundCells();
            this.loaded = true;
        }
    }, {
        key: 'initCanvas',
        value: function initCanvas() {
            var canvasWidth = this.width * this.charWidth;
            var canvasHeight = this.height * this.charHeight;
            this.canvas = document.getElementById(this.canvasId);
            var pixiOptions = {
                antialias: false,
                clearBeforeRender: false,
                preserveDrawingBuffer: false,
                resolution: 1,
                transparent: false,
                backgroundColor: Core.ColorUtils.toNumber(this.defaultBackground),
                view: this.canvas
            };
            this.renderer = PIXI.autoDetectRenderer(canvasWidth, canvasHeight, pixiOptions);
            this.renderer.backgroundColor = Core.ColorUtils.toNumber(this.defaultBackground);
            this.topLeftPosition = new Core.Position(this.canvas.offsetLeft, this.canvas.offsetTop);
        }
    }, {
        key: 'initCharacterMap',
        value: function initCharacterMap() {
            this.chars = [];
            for (var x = 0; x < 16; x++) {
                for (var y = 0; y < 16; y++) {
                    var rect = new PIXI.Rectangle(x * this.charWidth, y * this.charHeight, this.charWidth, this.charHeight);
                    this.chars[x + y * 16] = new PIXI.Texture(this.font, rect);
                }
            }
        }
    }, {
        key: 'initBackgroundCells',
        value: function initBackgroundCells() {
            this.backCells = [];
            for (var x = 0; x < this.width; x++) {
                this.backCells[x] = [];
                for (var y = 0; y < this.height; y++) {
                    var cell = new PIXI.Sprite(this.chars[Map.Glyph.CHAR_FULL]);
                    cell.position.x = x * this.charWidth;
                    cell.position.y = y * this.charHeight;
                    cell.width = this.charWidth;
                    cell.height = this.charHeight;
                    cell.tint = Core.ColorUtils.toNumber(this.defaultBackground);
                    this.backCells[x][y] = cell;
                    this.stage.addChild(cell);
                }
            }
        }
    }, {
        key: 'initForegroundCells',
        value: function initForegroundCells() {
            this.foreCells = [];
            for (var x = 0; x < this.width; x++) {
                this.foreCells[x] = [];
                for (var y = 0; y < this.height; y++) {
                    var cell = new PIXI.Sprite(this.chars[Map.Glyph.CHAR_SPACE]);
                    cell.position.x = x * this.charWidth;
                    cell.position.y = y * this.charHeight;
                    cell.width = this.charWidth;
                    cell.height = this.charHeight;
                    cell.tint = Core.ColorUtils.toNumber(this.defaultForeground);
                    this.foreCells[x][y] = cell;
                    this.stage.addChild(cell);
                }
            }
        }
    }, {
        key: 'addGridOverlay',
        value: function addGridOverlay(x, y, width, height) {
            for (var i = 0; i < width; i++) {
                for (var j = 0; j < height; j++) {
                    var cell = new PIXI.Graphics();
                    cell.lineStyle(1, 0x444444, 0.5);
                    cell.beginFill(0, 0);
                    cell.drawRect((i + x) * this.charWidth, (j + y) * this.charHeight, this.charWidth, this.charHeight);
                    this.stage.addChild(cell);
                }
            }
        }
    }, {
        key: 'addBorder',
        value: function addBorder(x, y, width, height) {
            var cell = new PIXI.Graphics();
            cell.lineStyle(1, 0x444444, 0.5);
            cell.beginFill(0, 0);
            cell.drawRect(x * this.charWidth, y * this.charHeight, x * width * this.charWidth, y * height * this.charHeight);
            this.stage.addChild(cell);
        }
    }, {
        key: 'render',
        value: function render() {
            if (this.loaded) {
                this.renderer.render(this.stage);
            }
        }
    }, {
        key: 'blit',
        value: function blit(console) {
            var offsetX = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
            var offsetY = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
            var forceDirty = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

            if (!this.loaded) {
                return false;
            }
            for (var x = 0; x < console.width; x++) {
                for (var y = 0; y < console.height; y++) {
                    if (forceDirty || console.isDirty[x][y]) {
                        var ascii = console.text[x][y];
                        var px = offsetX + x;
                        var py = offsetY + y;
                        if (ascii > 0 && ascii <= 255) {
                            this.foreCells[px][py].texture = this.chars[ascii];
                        }
                        this.foreCells[px][py].tint = Core.ColorUtils.toNumber(console.fore[x][y]);
                        this.backCells[px][py].tint = Core.ColorUtils.toNumber(console.back[x][y]);
                        console.cleanCell(x, y);
                    }
                }
            }
        }
    }, {
        key: 'getPositionFromPixels',
        value: function getPositionFromPixels(x, y) {
            if (!this.loaded) {
                return new Core.Position(-1, -1);
            }
            var dx = x - this.topLeftPosition.x;
            var dy = y - this.topLeftPosition.y;
            var rx = Math.floor(dx / this.charWidth);
            var ry = Math.floor(dy / this.charHeight);
            return new Core.Position(rx, ry);
        }
    }, {
        key: 'height',
        get: function get() {
            return this._height;
        }
    }, {
        key: 'width',
        get: function get() {
            return this._width;
        }
    }]);

    return PixiConsole;
}();

module.exports = PixiConsole;

},{"./core":33,"./map":50}],8:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('./core');
var Events = require('./events');
var Components = require('./components');
var Entities = require('./entities');
var Map = require('./map');
var Exceptions = require('./Exceptions');
var MapView = require('./MapView');
var LogView = require('./LogView');

var Scene = function () {
    function Scene(engine, width, height) {
        _classCallCheck(this, Scene);

        this._engine = engine;
        this.width = width;
        this.height = height;
    }

    _createClass(Scene, [{
        key: 'start',
        value: function start() {
            Core.Position.setMaxValues(this.width, this.height - 5);
            var dungeonGenerator = new Map.DungeonGenerator(this.width, this.height - 5);
            this._map = dungeonGenerator.generate();
            this.registerListeners();
            this.mapView = new MapView(this.engine, this.map, this.map.width, this.map.height);
            this.generateWily();
            this.generateRats();
            this.logView = new LogView(this.engine, this.width, 5, this.player);
            this.mapView.setViewEntity(this.player);
        }
    }, {
        key: 'generateWily',
        value: function generateWily() {
            this.player = Entities.createWily(this.engine);
            this.positionEntity(this.player);
        }
    }, {
        key: 'generateRats',
        value: function generateRats() {
            var num = arguments.length <= 0 || arguments[0] === undefined ? 10 : arguments[0];

            for (var i = 0; i < num; i++) {
                this.generateRat();
            }
        }
    }, {
        key: 'generateRat',
        value: function generateRat() {
            this.positionEntity(Entities.createRat(this.engine));
        }
    }, {
        key: 'positionEntity',
        value: function positionEntity(entity) {
            var component = entity.getComponent(Components.PhysicsComponent);
            var positioned = false;
            var tries = 0;
            var position = null;
            while (tries < 1000 && !positioned) {
                position = Core.Position.getRandom();
                positioned = this.isWithoutEntity(position);
            }
            if (positioned) {
                component.moveTo(position);
            }
        }
    }, {
        key: 'registerListeners',
        value: function registerListeners() {
            this.engine.listen(new Events.Listener('isWithoutEntity', this.onIsWithoutEntity.bind(this)));
            this.engine.listen(new Events.Listener('movedFrom', this.onMovedFrom.bind(this)));
            this.engine.listen(new Events.Listener('movedTo', this.onMovedTo.bind(this)));
            this.engine.listen(new Events.Listener('getTile', this.onGetTile.bind(this)));
        }
    }, {
        key: 'onGetTile',
        value: function onGetTile(event) {
            var position = event.data.position;
            return this.map.getTile(position);
        }
    }, {
        key: 'onMovedFrom',
        value: function onMovedFrom(event) {
            var tile = this.map.getTile(event.data.physicsComponent.position);
            if (!event.data.physicsComponent.blocking) {
                delete tile.props[event.data.entity.guid];
            } else {
                tile.entity = null;
            }
        }
    }, {
        key: 'onMovedTo',
        value: function onMovedTo(event) {
            var tile = this.map.getTile(event.data.physicsComponent.position);
            if (!event.data.physicsComponent.blocking) {
                tile.props[event.data.entity.guid] = event.data.entity;
            } else {
                if (tile.entity) {
                    throw new Exceptions.EntityOverlapError('Two entities cannot be at the same spot');
                }
                tile.entity = event.data.entity;
            }
        }
    }, {
        key: 'onIsWithoutEntity',
        value: function onIsWithoutEntity(event) {
            var position = event.data.position;
            return this.isWithoutEntity(position);
        }
    }, {
        key: 'isWithoutEntity',
        value: function isWithoutEntity(position) {
            var tile = this.map.getTile(position);
            return tile.walkable && tile.entity === null;
        }
    }, {
        key: 'render',
        value: function render(blitFunction) {
            var _this = this;

            this.mapView.render(function (console) {
                blitFunction(console, 0, 0);
            });
            this.logView.render(function (console) {
                blitFunction(console, 0, _this.height - 5);
            });
        }
    }, {
        key: 'engine',
        get: function get() {
            return this._engine;
        }
    }, {
        key: 'map',
        get: function get() {
            return this._map;
        }
    }]);

    return Scene;
}();

module.exports = Scene;

},{"./Exceptions":3,"./LogView":5,"./MapView":6,"./components":30,"./core":33,"./entities":36,"./events":39,"./map":50}],9:[function(require,module,exports){
"use strict";

var Engine = require('./Engine');
var Scene = require('./Scene');
window.onload = function () {
    var engine = new Engine(60, 40, 'rogue');
    var scene = new Scene(engine, 60, 40);
    engine.start(scene);
};

},{"./Engine":2,"./Scene":8}],10:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Exceptions = require('../Exceptions');

var Action = function () {
    function Action() {
        _classCallCheck(this, Action);

        this.cost = 100;
    }

    _createClass(Action, [{
        key: 'act',
        value: function act() {
            throw new Exceptions.MissingImplementationError('Action.act must be overwritten');
        }
    }]);

    return Action;
}();

exports.Action = Action;

},{"../Exceptions":3}],11:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Exceptions = require('../Exceptions');

var Behaviour = function () {
    function Behaviour(entity) {
        _classCallCheck(this, Behaviour);

        this.entity = entity;
    }

    _createClass(Behaviour, [{
        key: 'getNextAction',
        value: function getNextAction() {
            throw new Exceptions.MissingImplementationError('Behaviour.getNextAction must be overwritten');
        }
    }]);

    return Behaviour;
}();

exports.Behaviour = Behaviour;

},{"../Exceptions":3}],12:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Behaviours = require('./index');

var NullAction = function (_Behaviours$Action) {
    _inherits(NullAction, _Behaviours$Action);

    function NullAction() {
        _classCallCheck(this, NullAction);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(NullAction).apply(this, arguments));
    }

    _createClass(NullAction, [{
        key: "act",
        value: function act() {
            return this.cost;
        }
    }]);

    return NullAction;
}(Behaviours.Action);

exports.NullAction = NullAction;

},{"./index":16}],13:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Core = require('../core');
var Events = require('../events');
var Behaviours = require('./index');
var Components = require('../components');

var RandomWalkBehaviour = function (_Behaviours$Behaviour) {
    _inherits(RandomWalkBehaviour, _Behaviours$Behaviour);

    function RandomWalkBehaviour(engine, entity) {
        _classCallCheck(this, RandomWalkBehaviour);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(RandomWalkBehaviour).call(this, entity));

        _this.engine = engine;
        _this.entity = entity;
        _this.physicsComponent = entity.getComponent(Components.PhysicsComponent);
        return _this;
    }

    _createClass(RandomWalkBehaviour, [{
        key: 'getNextAction',
        value: function getNextAction() {
            var positions = Core.Utils.randomizeArray(Core.Position.getNeighbours(this.physicsComponent.position));
            var isWithoutEntity = false;
            var position = null;
            while (!isWithoutEntity && positions.length > 0) {
                position = positions.pop();
                isWithoutEntity = this.engine.is(new Events.Event('isWithoutEntity', { position: position }));
            }
            if (isWithoutEntity) {
                return new Behaviours.WalkAction(this.physicsComponent, position);
            } else {
                return new Behaviours.NullAction();
            }
        }
    }]);

    return RandomWalkBehaviour;
}(Behaviours.Behaviour);

exports.RandomWalkBehaviour = RandomWalkBehaviour;

},{"../components":30,"../core":33,"../events":39,"./index":16}],14:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Behaviours = require('./index');

var WalkAction = function (_Behaviours$Action) {
    _inherits(WalkAction, _Behaviours$Action);

    function WalkAction(physicsComponent, position) {
        _classCallCheck(this, WalkAction);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WalkAction).call(this));

        _this.physicsComponent = physicsComponent;
        _this.position = position;
        return _this;
    }

    _createClass(WalkAction, [{
        key: "act",
        value: function act() {
            this.physicsComponent.moveTo(this.position);
            return this.cost;
        }
    }]);

    return WalkAction;
}(Behaviours.Action);

exports.WalkAction = WalkAction;

},{"./index":16}],15:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Behaviours = require('./index');
var Entities = require('../entities');
var Components = require('../components');
var Map = require('../map');

var WriteRuneAction = function (_Behaviours$Action) {
    _inherits(WriteRuneAction, _Behaviours$Action);

    function WriteRuneAction(engine, entity) {
        _classCallCheck(this, WriteRuneAction);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WriteRuneAction).call(this));

        _this.engine = engine;
        _this.physics = entity.getComponent(Components.PhysicsComponent);
        return _this;
    }

    _createClass(WriteRuneAction, [{
        key: 'act',
        value: function act() {
            var rune = new Entities.Entity(this.engine, 'Rune', 'rune');
            rune.addComponent(new Components.PhysicsComponent(this.engine, {
                position: this.physics.position,
                blocking: false
            }));
            rune.addComponent(new Components.RenderableComponent(this.engine, {
                glyph: new Map.Glyph('#', 0x44ff88, 0x000000)
            }));
            rune.addComponent(new Components.SelfDestructComponent(this.engine, {
                turns: 10
            }));
            rune.addComponent(new Components.RuneFreezeComponent(this.engine));
            return this.cost;
        }
    }]);

    return WriteRuneAction;
}(Behaviours.Action);

exports.WriteRuneAction = WriteRuneAction;

},{"../components":30,"../entities":36,"../map":50,"./index":16}],16:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./Action'));
__export(require('./Behaviour'));
__export(require('./WalkAction'));
__export(require('./NullAction'));
__export(require('./WriteRuneAction'));
__export(require('./RandomWalkBehaviour'));

},{"./Action":10,"./Behaviour":11,"./NullAction":12,"./RandomWalkBehaviour":13,"./WalkAction":14,"./WriteRuneAction":15}],17:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('../core');
var Exceptions = require('../Exceptions');

var Component = function () {
    function Component(engine) {
        var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, Component);

        this._guid = Core.Utils.generateGuid();
        this._engine = engine;
        this.listeners = [];
    }

    _createClass(Component, [{
        key: 'registerEntity',
        value: function registerEntity(entity) {
            this._entity = entity;
            this.checkRequirements();
            this.initialize();
            this.registerListeners();
        }
    }, {
        key: 'checkRequirements',
        value: function checkRequirements() {}
    }, {
        key: 'registerListeners',
        value: function registerListeners() {}
    }, {
        key: 'initialize',
        value: function initialize() {}
    }, {
        key: 'destroy',
        value: function destroy() {
            var _this = this;

            if (!this.listeners || typeof this.listeners.forEach !== 'function') {
                throw new Exceptions.MissingImplementationError('`this.listeners` has been redefined, default `destroy` function should not be used. For: ' + this.entity.name);
            }
            this.listeners.forEach(function (listener) {
                _this.engine.removeListener(listener);
                _this.entity.removeListener(listener);
            });
            this.listeners = [];
        }
    }, {
        key: 'guid',
        get: function get() {
            return this._guid;
        }
    }, {
        key: 'entity',
        get: function get() {
            return this._entity;
        }
    }, {
        key: 'engine',
        get: function get() {
            return this._engine;
        }
    }]);

    return Component;
}();

exports.Component = Component;

},{"../Exceptions":3,"../core":33}],18:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Components = require('./index');
var Events = require('../events');

var EnergyComponent = function (_Components$Component) {
    _inherits(EnergyComponent, _Components$Component);

    function EnergyComponent(engine) {
        var data = arguments.length <= 1 || arguments[1] === undefined ? { regenratationRate: 100, max: 100 } : arguments[1];

        _classCallCheck(this, EnergyComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(EnergyComponent).call(this, engine));

        _this._currentEnergy = _this._maxEnergy = data.max;
        _this._energyRegenerationRate = data.regenratationRate;
        return _this;
    }

    _createClass(EnergyComponent, [{
        key: 'registerListeners',
        value: function registerListeners() {
            this.listeners.push(this.engine.listen(new Events.Listener('tick', this.onTick.bind(this), 1)));
        }
    }, {
        key: 'onTick',
        value: function onTick(event) {
            var rate = this._energyRegenerationRate;
            var rateModifiers = this.entity.gather(new Events.Event('onEnergyRegeneration'));
            rateModifiers.forEach(function (modifier) {
                rate = rate * modifier;
            });
            this._currentEnergy = Math.min(this.maxEnergy, this._currentEnergy + rate);
        }
    }, {
        key: 'useEnergy',
        value: function useEnergy(energy) {
            this._currentEnergy = this._currentEnergy - energy;
            return this._currentEnergy;
        }
    }, {
        key: 'currentEnergy',
        get: function get() {
            return this._currentEnergy;
        }
    }, {
        key: 'energyRegenerationRate',
        get: function get() {
            return this._energyRegenerationRate;
        }
    }, {
        key: 'maxEnergy',
        get: function get() {
            return this._maxEnergy;
        }
    }]);

    return EnergyComponent;
}(Components.Component);

exports.EnergyComponent = EnergyComponent;

},{"../events":39,"./index":30}],19:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Events = require('../events');
var Components = require('./index');

var HealthComponent = function (_Components$Component) {
    _inherits(HealthComponent, _Components$Component);

    function HealthComponent() {
        _classCallCheck(this, HealthComponent);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(HealthComponent).apply(this, arguments));
    }

    _createClass(HealthComponent, [{
        key: 'registerListeners',
        value: function registerListeners() {
            this.entity.listen(new Events.Listener('damage', this.onDamage.bind(this)));
        }
    }, {
        key: 'onDamage',
        value: function onDamage(event) {
            this.engine.removeEntity(this.entity);
            this.engine.emit(new Events.Event('message', {
                message: this.entity.name + ' was killed by ' + event.data.source.name + '.',
                target: this.entity
            }));
        }
    }]);

    return HealthComponent;
}(Components.Component);

exports.HealthComponent = HealthComponent;

},{"../events":39,"./index":30}],20:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Core = require('../core');
var Events = require('../events');
var Components = require('./index');
var Behaviours = require('../behaviours');
var InputHandler = require('../InputHandler');

var InputComponent = function (_Components$Component) {
    _inherits(InputComponent, _Components$Component);

    function InputComponent() {
        _classCallCheck(this, InputComponent);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(InputComponent).apply(this, arguments));
    }

    _createClass(InputComponent, [{
        key: 'initialize',
        value: function initialize() {
            this.energyComponent = this.entity.getComponent(Components.EnergyComponent);
            this.physicsComponent = this.entity.getComponent(Components.PhysicsComponent);
            this.hasFocus = false;
        }
    }, {
        key: 'registerListeners',
        value: function registerListeners() {
            this.listeners.push(this.engine.listen(new Events.Listener('tick', this.onTick.bind(this))));
            this.engine.inputHandler.listen([InputHandler.KEY_UP, InputHandler.KEY_K], this.onMoveUp.bind(this));
            this.engine.inputHandler.listen([InputHandler.KEY_U], this.onMoveUpRight.bind(this));
            this.engine.inputHandler.listen([InputHandler.KEY_RIGHT, InputHandler.KEY_L], this.onMoveRight.bind(this));
            this.engine.inputHandler.listen([InputHandler.KEY_N], this.onMoveDownRight.bind(this));
            this.engine.inputHandler.listen([InputHandler.KEY_DOWN, InputHandler.KEY_J], this.onMoveDown.bind(this));
            this.engine.inputHandler.listen([InputHandler.KEY_B], this.onMoveDownLeft.bind(this));
            this.engine.inputHandler.listen([InputHandler.KEY_LEFT, InputHandler.KEY_H], this.onMoveLeft.bind(this));
            this.engine.inputHandler.listen([InputHandler.KEY_Y], this.onMoveUpLeft.bind(this));
            this.engine.inputHandler.listen([InputHandler.KEY_PERIOD], this.onWait.bind(this));
            this.engine.inputHandler.listen([InputHandler.KEY_0], this.onTrapOne.bind(this));
        }
    }, {
        key: 'onTick',
        value: function onTick(event) {
            if (this.energyComponent.currentEnergy >= 100) {
                this.act();
            }
        }
    }, {
        key: 'act',
        value: function act() {
            this.hasFocus = true;
            this.engine.emit(new Events.Event('pauseTime'));
        }
    }, {
        key: 'performAction',
        value: function performAction(action) {
            this.hasFocus = false;
            this.engine.emit(new Events.Event('resumeTime'));
            this.energyComponent.useEnergy(action.act());
        }
    }, {
        key: 'onWait',
        value: function onWait() {
            if (!this.hasFocus) {
                return;
            }
            this.performAction(new Behaviours.NullAction());
        }
    }, {
        key: 'onTrapOne',
        value: function onTrapOne() {
            if (!this.hasFocus) {
                return;
            }
            var action = this.entity.fire(new Events.Event('writeRune', {}));
            if (action) {
                this.performAction(action);
            }
        }
    }, {
        key: 'onMoveUp',
        value: function onMoveUp() {
            if (!this.hasFocus) {
                return;
            }
            this.handleMovement(new Core.Position(0, -1));
        }
    }, {
        key: 'onMoveUpRight',
        value: function onMoveUpRight() {
            if (!this.hasFocus) {
                return;
            }
            this.handleMovement(new Core.Position(1, -1));
        }
    }, {
        key: 'onMoveRight',
        value: function onMoveRight() {
            if (!this.hasFocus) {
                return;
            }
            this.handleMovement(new Core.Position(1, 0));
        }
    }, {
        key: 'onMoveDownRight',
        value: function onMoveDownRight() {
            if (!this.hasFocus) {
                return;
            }
            this.handleMovement(new Core.Position(1, 1));
        }
    }, {
        key: 'onMoveDown',
        value: function onMoveDown() {
            if (!this.hasFocus) {
                return;
            }
            this.handleMovement(new Core.Position(0, 1));
        }
    }, {
        key: 'onMoveDownLeft',
        value: function onMoveDownLeft() {
            if (!this.hasFocus) {
                return;
            }
            this.handleMovement(new Core.Position(-1, 1));
        }
    }, {
        key: 'onMoveLeft',
        value: function onMoveLeft() {
            if (!this.hasFocus) {
                return;
            }
            this.handleMovement(new Core.Position(-1, 0));
        }
    }, {
        key: 'onMoveUpLeft',
        value: function onMoveUpLeft() {
            if (!this.hasFocus) {
                return;
            }
            this.handleMovement(new Core.Position(-1, -1));
        }
    }, {
        key: 'handleMovement',
        value: function handleMovement(direction) {
            var position = Core.Position.add(this.physicsComponent.position, direction);
            var isWithoutEntity = this.engine.is(new Events.Event('isWithoutEntity', { position: position }));
            if (isWithoutEntity) {
                this.performAction(new Behaviours.WalkAction(this.physicsComponent, position));
            }
        }
    }]);

    return InputComponent;
}(Components.Component);

exports.InputComponent = InputComponent;

},{"../InputHandler":4,"../behaviours":16,"../core":33,"../events":39,"./index":30}],21:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Events = require('../events');
var Components = require('./index');

var PhysicsComponent = function (_Components$Component) {
    _inherits(PhysicsComponent, _Components$Component);

    function PhysicsComponent(engine) {
        var data = arguments.length <= 1 || arguments[1] === undefined ? { position: null, blocking: true } : arguments[1];

        _classCallCheck(this, PhysicsComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(PhysicsComponent).call(this, engine));

        _this._position = data.position;
        _this._blocking = data.blocking;
        return _this;
    }

    _createClass(PhysicsComponent, [{
        key: 'initialize',
        value: function initialize() {
            if (this.position) {
                this.engine.emit(new Events.Event('movedTo', { physicsComponent: this, entity: this.entity }));
                this.engine.emit(new Events.Event('move', { physicsComponent: this, entity: this.entity }));
            }
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            _get(Object.getPrototypeOf(PhysicsComponent.prototype), 'destroy', this).call(this);
            this.engine.emit(new Events.Event('movedFrom', { physicsComponent: this, entity: this.entity }));
        }
    }, {
        key: 'moveTo',
        value: function moveTo(position) {
            if (this._position) {
                this.engine.emit(new Events.Event('movedFrom', { physicsComponent: this, entity: this.entity }));
            }
            this._position = position;
            this.engine.emit(new Events.Event('movedTo', { physicsComponent: this, entity: this.entity }));
            this.engine.emit(new Events.Event('move', { physicsComponent: this, entity: this.entity }));
            this.entity.emit(new Events.Event('move', { physicsComponent: this, entity: this.entity }));
        }
    }, {
        key: 'blocking',
        get: function get() {
            return this._blocking;
        }
    }, {
        key: 'position',
        get: function get() {
            return this._position;
        }
    }]);

    return PhysicsComponent;
}(Components.Component);

exports.PhysicsComponent = PhysicsComponent;

},{"../events":39,"./index":30}],22:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Events = require('../events');
var Exceptions = require('../Exceptions');
var Components = require('./index');

var RenderableComponent = function (_Components$Component) {
    _inherits(RenderableComponent, _Components$Component);

    function RenderableComponent(engine, data) {
        _classCallCheck(this, RenderableComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(RenderableComponent).call(this, engine));

        _this._glyph = data.glyph;
        return _this;
    }

    _createClass(RenderableComponent, [{
        key: 'checkRequirements',
        value: function checkRequirements() {
            if (!this.entity.hasComponent(Components.PhysicsComponent)) {
                throw new Exceptions.MissingComponentError('RenderableComponent requires PhysicsComponent');
            }
        }
    }, {
        key: 'initialize',
        value: function initialize() {
            this.engine.emit(new Events.Event('renderableComponentCreated', { entity: this.entity, renderableComponent: this }));
        }
    }, {
        key: 'destroy',
        value: function destroy() {
            this.engine.emit(new Events.Event('renderableComponentDestroyed', { entity: this.entity, renderableComponent: this }));
        }
    }, {
        key: 'glyph',
        get: function get() {
            return this._glyph;
        }
    }]);

    return RenderableComponent;
}(Components.Component);

exports.RenderableComponent = RenderableComponent;

},{"../Exceptions":3,"../events":39,"./index":30}],23:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Behaviours = require('../behaviours');
var Components = require('./index');
var Events = require('../events');

var RoamingAIComponent = function (_Components$Component) {
    _inherits(RoamingAIComponent, _Components$Component);

    function RoamingAIComponent() {
        _classCallCheck(this, RoamingAIComponent);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(RoamingAIComponent).apply(this, arguments));
    }

    _createClass(RoamingAIComponent, [{
        key: 'initialize',
        value: function initialize() {
            this.energyComponent = this.entity.getComponent(Components.EnergyComponent);
            this.randomWalkBehaviour = new Behaviours.RandomWalkBehaviour(this.engine, this.entity);
        }
    }, {
        key: 'registerListeners',
        value: function registerListeners() {
            this.listeners.push(this.engine.listen(new Events.Listener('tick', this.onTick.bind(this))));
        }
    }, {
        key: 'onTick',
        value: function onTick(event) {
            if (this.energyComponent.currentEnergy >= 100) {
                var action = this.randomWalkBehaviour.getNextAction();
                this.energyComponent.useEnergy(action.act());
            }
        }
    }]);

    return RoamingAIComponent;
}(Components.Component);

exports.RoamingAIComponent = RoamingAIComponent;

},{"../behaviours":16,"../events":39,"./index":30}],24:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Events = require('../events');
var Components = require('./index');

var RuneDamageComponent = function (_Components$Component) {
    _inherits(RuneDamageComponent, _Components$Component);

    function RuneDamageComponent(engine) {
        var data = arguments.length <= 1 || arguments[1] === undefined ? { radius: 1, charges: 1 } : arguments[1];

        _classCallCheck(this, RuneDamageComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(RuneDamageComponent).call(this, engine));

        _this.radius = data.radius;
        _this.charges = data.charges;
        return _this;
    }

    _createClass(RuneDamageComponent, [{
        key: 'initialize',
        value: function initialize() {
            this.physicsComponent = this.entity.getComponent(Components.PhysicsComponent);
        }
    }, {
        key: 'registerListeners',
        value: function registerListeners() {
            this.listeners.push(this.engine.listen(new Events.Listener('movedTo', this.onMovedTo.bind(this), 50)));
        }
    }, {
        key: 'onMovedTo',
        value: function onMovedTo(event) {
            if (this.charges <= 0) {
                return;
            }
            var eventPosition = event.data.physicsComponent.position;
            if (eventPosition.x == this.physicsComponent.position.x && eventPosition.y === this.physicsComponent.position.y) {
                event.data.entity.emit(new Events.Event('damage', {
                    source: this.entity
                }));
                this.charges--;
                if (this.charges <= 0) {
                    this.engine.removeEntity(this.entity);
                }
            }
        }
    }]);

    return RuneDamageComponent;
}(Components.Component);

exports.RuneDamageComponent = RuneDamageComponent;

},{"../events":39,"./index":30}],25:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Events = require('../events');
var Components = require('./index');

var RuneFreezeComponent = function (_Components$Component) {
    _inherits(RuneFreezeComponent, _Components$Component);

    function RuneFreezeComponent(engine) {
        var data = arguments.length <= 1 || arguments[1] === undefined ? { radius: 1, charges: 1 } : arguments[1];

        _classCallCheck(this, RuneFreezeComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(RuneFreezeComponent).call(this, engine));

        _this.radius = data.radius;
        _this.charges = data.charges;
        return _this;
    }

    _createClass(RuneFreezeComponent, [{
        key: 'initialize',
        value: function initialize() {
            this.physicsComponent = this.entity.getComponent(Components.PhysicsComponent);
        }
    }, {
        key: 'registerListeners',
        value: function registerListeners() {
            this.listeners.push(this.engine.listen(new Events.Listener('movedTo', this.onMovedTo.bind(this), 50)));
        }
    }, {
        key: 'onMovedTo',
        value: function onMovedTo(event) {
            if (this.charges <= 0) {
                return;
            }
            var eventPosition = event.data.physicsComponent.position;
            if (eventPosition.x == this.physicsComponent.position.x && eventPosition.y === this.physicsComponent.position.y) {
                event.data.entity.addComponent(new Components.SlowComponent(this.engine, { factor: 0.5 }), {
                    duration: 10
                });
                this.charges--;
                if (this.charges <= 0) {
                    this.engine.removeEntity(this.entity);
                }
            }
        }
    }]);

    return RuneFreezeComponent;
}(Components.Component);

exports.RuneFreezeComponent = RuneFreezeComponent;

},{"../events":39,"./index":30}],26:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Behaviours = require('../behaviours');
var Events = require('../events');
var Components = require('./index');

var RuneWriterComponent = function (_Components$Component) {
    _inherits(RuneWriterComponent, _Components$Component);

    function RuneWriterComponent(engine) {
        var data = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        _classCallCheck(this, RuneWriterComponent);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(RuneWriterComponent).call(this, engine));
    }

    _createClass(RuneWriterComponent, [{
        key: 'initialize',
        value: function initialize() {
            this.physicalComponent = this.entity.getComponent(Components.PhysicsComponent);
        }
    }, {
        key: 'registerListeners',
        value: function registerListeners() {
            this.entity.listen(new Events.Listener('writeRune', this.onWriteRune.bind(this)));
        }
    }, {
        key: 'onWriteRune',
        value: function onWriteRune(event) {
            var tile = this.engine.fire(new Events.Event('getTile', {
                position: this.physicalComponent.position
            }));
            var hasRune = false;
            for (var key in tile.props) {
                if (tile.props[key].type === 'rune') {
                    hasRune = true;
                }
            }
            if (hasRune) {
                return null;
            }
            return new Behaviours.WriteRuneAction(this.engine, this.entity);
        }
    }]);

    return RuneWriterComponent;
}(Components.Component);

exports.RuneWriterComponent = RuneWriterComponent;

},{"../behaviours":16,"../events":39,"./index":30}],27:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Events = require('../events');
var Components = require('./index');

var SelfDestructComponent = function (_Components$Component) {
    _inherits(SelfDestructComponent, _Components$Component);

    function SelfDestructComponent(engine, data) {
        _classCallCheck(this, SelfDestructComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SelfDestructComponent).call(this, engine));

        _this.maxTurns = data.turns;
        _this.turnsLeft = data.turns;
        _this.listeners = [];
        return _this;
    }

    _createClass(SelfDestructComponent, [{
        key: 'registerListeners',
        value: function registerListeners() {
            this.listeners.push(this.engine.listen(new Events.Listener('turn', this.onTurn.bind(this), 50)));
        }
    }, {
        key: 'onTurn',
        value: function onTurn(event) {
            this.turnsLeft--;
            if (this.turnsLeft < 0) {
                this.engine.removeEntity(this.entity);
            }
        }
    }]);

    return SelfDestructComponent;
}(Components.Component);

exports.SelfDestructComponent = SelfDestructComponent;

},{"../events":39,"./index":30}],28:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Events = require('../events');
var Components = require('./index');

var SlowComponent = function (_Components$Component) {
    _inherits(SlowComponent, _Components$Component);

    function SlowComponent(engine, data) {
        _classCallCheck(this, SlowComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SlowComponent).call(this, engine));

        _this._factor = data.factor;
        return _this;
    }

    _createClass(SlowComponent, [{
        key: 'registerListeners',
        value: function registerListeners() {
            this.listeners.push(this.entity.listen(new Events.Listener('onEnergyRegeneration', this.onEnergyRegeneration.bind(this), 50)));
            this.listeners.push(this.entity.listen(new Events.Listener('getStatusEffect', this.onGetStatusEffect.bind(this))));
        }
    }, {
        key: 'onEnergyRegeneration',
        value: function onEnergyRegeneration(event) {
            return this._factor;
        }
    }, {
        key: 'onGetStatusEffect',
        value: function onGetStatusEffect(event) {
            return {
                name: 'Slow',
                symbol: 'S'
            };
        }
    }, {
        key: 'factor',
        get: function get() {
            return this._factor;
        }
    }]);

    return SlowComponent;
}(Components.Component);

exports.SlowComponent = SlowComponent;

},{"../events":39,"./index":30}],29:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Components = require('./index');
var Events = require('../events');

var TimeHandlerComponent = function (_Components$Component) {
    _inherits(TimeHandlerComponent, _Components$Component);

    function TimeHandlerComponent() {
        _classCallCheck(this, TimeHandlerComponent);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(TimeHandlerComponent).apply(this, arguments));
    }

    _createClass(TimeHandlerComponent, [{
        key: 'initialize',
        value: function initialize() {
            this.ticksPerTurn = 1;
            this.turnTime = 0;
            this._currentTurn = 0;
            this._currentTick = 0;
            this.paused = false;
        }
    }, {
        key: 'registerListeners',
        value: function registerListeners() {
            this.engine.listen(new Events.Listener('pauseTime', this.onPauseTime.bind(this)));
            this.engine.listen(new Events.Listener('resumeTime', this.onResumeTime.bind(this)));
        }
    }, {
        key: 'onPauseTime',
        value: function onPauseTime(event) {
            this.paused = true;
        }
    }, {
        key: 'onResumeTime',
        value: function onResumeTime(event) {
            this.paused = false;
        }
    }, {
        key: 'engineTick',
        value: function engineTick(gameTime) {
            if (this.paused) {
                return;
            }
            this._currentTick++;
            this.engine.currentTick = this._currentTick;
            if (this._currentTick % this.ticksPerTurn === 0) {
                this._currentTurn++;
                this.engine.currentTurn = this._currentTurn;
                this.engine.emit(new Events.Event('turn', { currentTurn: this._currentTurn, currentTick: this._currentTick }));
                this.turnTime = gameTime;
            }
            this.engine.emit(new Events.Event('tick', { currentTurn: this._currentTurn, currentTick: this._currentTick }));
        }
    }, {
        key: 'currentTick',
        get: function get() {
            return this._currentTick;
        }
    }, {
        key: 'currentTurn',
        get: function get() {
            return this._currentTurn;
        }
    }]);

    return TimeHandlerComponent;
}(Components.Component);

exports.TimeHandlerComponent = TimeHandlerComponent;

},{"../events":39,"./index":30}],30:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./Component'));
__export(require('./TimeHandlerComponent'));
__export(require('./SelfDestructComponent'));
__export(require('./RoamingAIComponent'));
__export(require('./EnergyComponent'));
__export(require('./InputComponent'));
__export(require('./RenderableComponent'));
__export(require('./PhysicsComponent'));
__export(require('./HealthComponent'));
__export(require('./RuneWriterComponent'));
__export(require('./RuneDamageComponent'));
__export(require('./RuneFreezeComponent'));
__export(require('./SlowComponent'));

},{"./Component":17,"./EnergyComponent":18,"./HealthComponent":19,"./InputComponent":20,"./PhysicsComponent":21,"./RenderableComponent":22,"./RoamingAIComponent":23,"./RuneDamageComponent":24,"./RuneFreezeComponent":25,"./RuneWriterComponent":26,"./SelfDestructComponent":27,"./SlowComponent":28,"./TimeHandlerComponent":29}],31:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ColorUtils = function () {
    function ColorUtils() {
        _classCallCheck(this, ColorUtils);
    }

    _createClass(ColorUtils, null, [{
        key: "multiply",

        /**
          Function: multiply
          Multiply a color with a number.
          > (r,g,b) * n == (r*n, g*n, b*n)
             Parameters:
          color - the color
          coef - the factor
             Returns:
          A new color as a number between 0x000000 and 0xFFFFFF
         */
        value: function multiply(color, coef) {
            var r = void 0,
                g = void 0,
                b = void 0;
            if (typeof color === "number") {
                // duplicated toRgbFromNumber code to avoid function call and array allocation
                r = (color & 0xFF0000) >> 16;
                g = (color & 0x00FF00) >> 8;
                b = color & 0x0000FF;
            } else {
                var rgb = ColorUtils.toRgb(color);
                r = rgb[0];
                g = rgb[1];
                b = rgb[2];
            }
            r = Math.round(r * coef);
            g = Math.round(g * coef);
            b = Math.round(b * coef);
            r = r < 0 ? 0 : r > 255 ? 255 : r;
            g = g < 0 ? 0 : g > 255 ? 255 : g;
            b = b < 0 ? 0 : b > 255 ? 255 : b;
            return b | g << 8 | r << 16;
        }
    }, {
        key: "max",
        value: function max(col1, col2) {
            var r1 = void 0,
                g1 = void 0,
                b1 = void 0,
                r2 = void 0,
                g2 = void 0,
                b2 = void 0;
            if (typeof col1 === "number") {
                // duplicated toRgbFromNumber code to avoid function call and array allocation
                r1 = (col1 & 0xFF0000) >> 16;
                g1 = (col1 & 0x00FF00) >> 8;
                b1 = col1 & 0x0000FF;
            } else {
                var rgb1 = ColorUtils.toRgb(col1);
                r1 = rgb1[0];
                g1 = rgb1[1];
                b1 = rgb1[2];
            }
            if (typeof col2 === "number") {
                // duplicated toRgbFromNumber code to avoid function call and array allocation
                r2 = (col2 & 0xFF0000) >> 16;
                g2 = (col2 & 0x00FF00) >> 8;
                b2 = col2 & 0x0000FF;
            } else {
                var rgb2 = ColorUtils.toRgb(col2);
                r2 = rgb2[0];
                g2 = rgb2[1];
                b2 = rgb2[2];
            }
            if (r2 > r1) {
                r1 = r2;
            }
            if (g2 > g1) {
                g1 = g2;
            }
            if (b2 > b1) {
                b1 = b2;
            }
            return b1 | g1 << 8 | r1 << 16;
        }
    }, {
        key: "min",
        value: function min(col1, col2) {
            var r1 = void 0,
                g1 = void 0,
                b1 = void 0,
                r2 = void 0,
                g2 = void 0,
                b2 = void 0;
            if (typeof col1 === "number") {
                // duplicated toRgbFromNumber code to avoid function call and array allocation
                r1 = (col1 & 0xFF0000) >> 16;
                g1 = (col1 & 0x00FF00) >> 8;
                b1 = col1 & 0x0000FF;
            } else {
                var rgb1 = ColorUtils.toRgb(col1);
                r1 = rgb1[0];
                g1 = rgb1[1];
                b1 = rgb1[2];
            }
            if (typeof col2 === "number") {
                // duplicated toRgbFromNumber code to avoid function call and array allocation
                r2 = (col2 & 0xFF0000) >> 16;
                g2 = (col2 & 0x00FF00) >> 8;
                b2 = col2 & 0x0000FF;
            } else {
                var rgb2 = ColorUtils.toRgb(col2);
                r2 = rgb2[0];
                g2 = rgb2[1];
                b2 = rgb2[2];
            }
            if (r2 < r1) {
                r1 = r2;
            }
            if (g2 < g1) {
                g1 = g2;
            }
            if (b2 < b1) {
                b1 = b2;
            }
            return b1 | g1 << 8 | r1 << 16;
        }
    }, {
        key: "colorMultiply",
        value: function colorMultiply(col1, col2) {
            var r1 = void 0,
                g1 = void 0,
                b1 = void 0,
                r2 = void 0,
                g2 = void 0,
                b2 = void 0;
            if (typeof col1 === "number") {
                // duplicated toRgbFromNumber code to avoid function call and array allocation
                r1 = (col1 & 0xFF0000) >> 16;
                g1 = (col1 & 0x00FF00) >> 8;
                b1 = col1 & 0x0000FF;
            } else {
                var rgb1 = ColorUtils.toRgb(col1);
                r1 = rgb1[0];
                g1 = rgb1[1];
                b1 = rgb1[2];
            }
            if (typeof col2 === "number") {
                // duplicated toRgbFromNumber code to avoid function call and array allocation
                r2 = (col2 & 0xFF0000) >> 16;
                g2 = (col2 & 0x00FF00) >> 8;
                b2 = col2 & 0x0000FF;
            } else {
                var rgb2 = ColorUtils.toRgb(col2);
                r2 = rgb2[0];
                g2 = rgb2[1];
                b2 = rgb2[2];
            }
            r1 = Math.floor(r1 * r2 / 255);
            g1 = Math.floor(g1 * g2 / 255);
            b1 = Math.floor(b1 * b2 / 255);
            r1 = r1 < 0 ? 0 : r1 > 255 ? 255 : r1;
            g1 = g1 < 0 ? 0 : g1 > 255 ? 255 : g1;
            b1 = b1 < 0 ? 0 : b1 > 255 ? 255 : b1;
            return b1 | g1 << 8 | r1 << 16;
        }
        /**
          Function: computeIntensity
          Return the grayscale intensity between 0 and 1
         */

    }, {
        key: "computeIntensity",
        value: function computeIntensity(color) {
            // Colorimetric (luminance-preserving) conversion to grayscale
            var r = void 0,
                g = void 0,
                b = void 0;
            if (typeof color === "number") {
                // duplicated toRgbFromNumber code to avoid function call and array allocation
                r = (color & 0xFF0000) >> 16;
                g = (color & 0x00FF00) >> 8;
                b = color & 0x0000FF;
            } else {
                var rgb = ColorUtils.toRgb(color);
                r = rgb[0];
                g = rgb[1];
                b = rgb[2];
            }
            return (0.2126 * r + 0.7152 * g + 0.0722 * b) * (1 / 255);
        }
        /**
          Function: add
          Add two colors.
          > (r1,g1,b1) + (r2,g2,b2) = (r1+r2,g1+g2,b1+b2)
             Parameters:
          col1 - the first color
          col2 - the second color
             Returns:
          A new color as a number between 0x000000 and 0xFFFFFF
         */

    }, {
        key: "add",
        value: function add(col1, col2) {
            var r = ((col1 & 0xFF0000) >> 16) + ((col2 & 0xFF0000) >> 16);
            var g = ((col1 & 0x00FF00) >> 8) + ((col2 & 0x00FF00) >> 8);
            var b = (col1 & 0x0000FF) + (col2 & 0x0000FF);
            if (r > 255) {
                r = 255;
            }
            if (g > 255) {
                g = 255;
            }
            if (b > 255) {
                b = 255;
            }
            return b | g << 8 | r << 16;
        }
        /**
          Function: toRgb
          Convert a string color into a [r,g,b] number array.
             Parameters:
          color - the color
             Returns:
          An array of 3 numbers [r,g,b] between 0 and 255.
         */

    }, {
        key: "toRgb",
        value: function toRgb(color) {
            if (typeof color === "number") {
                return ColorUtils.toRgbFromNumber(color);
            } else {
                return ColorUtils.toRgbFromString(color);
            }
        }
        /**
          Function: toWeb
          Convert a color into a CSS color format (as a string)
         */

    }, {
        key: "toWeb",
        value: function toWeb(color) {
            if (typeof color === "number") {
                var ret = color.toString(16);
                var missingZeroes = 6 - ret.length;
                if (missingZeroes > 0) {
                    ret = "000000".substr(0, missingZeroes) + ret;
                }
                return "#" + ret;
            } else {
                return color;
            }
        }
    }, {
        key: "toRgbFromNumber",
        value: function toRgbFromNumber(color) {
            var r = (color & 0xFF0000) >> 16;
            var g = (color & 0x00FF00) >> 8;
            var b = color & 0x0000FF;
            return [r, g, b];
        }
    }, {
        key: "toRgbFromString",
        value: function toRgbFromString(color) {
            color = color.toLowerCase();
            var stdColValues = ColorUtils.stdCol[String(color)];
            if (stdColValues) {
                return stdColValues;
            }
            if (color.charAt(0) === "#") {
                // #FFF or #FFFFFF format
                if (color.length === 4) {
                    // expand #FFF to #FFFFFF
                    color = "#" + color.charAt(1) + color.charAt(1) + color.charAt(2) + color.charAt(2) + color.charAt(3) + color.charAt(3);
                }
                var r = parseInt(color.substr(1, 2), 16);
                var g = parseInt(color.substr(3, 2), 16);
                var b = parseInt(color.substr(5, 2), 16);
                return [r, g, b];
            } else if (color.indexOf("rgb(") === 0) {
                // rgb(r,g,b) format
                var rgbList = color.substr(4, color.length - 5).split(",");
                return [parseInt(rgbList[0], 10), parseInt(rgbList[1], 10), parseInt(rgbList[2], 10)];
            }
            return [0, 0, 0];
        }
        /**
          Function: toNumber
          Convert a string color into a number.
             Parameters:
          color - the color
             Returns:
          A number between 0x000000 and 0xFFFFFF.
         */

    }, {
        key: "toNumber",
        value: function toNumber(color) {
            if (typeof color === "number") {
                return color;
            }
            var scol = color;
            if (scol.charAt(0) === "#" && scol.length === 7) {
                return parseInt(scol.substr(1), 16);
            } else {
                var rgb = ColorUtils.toRgbFromString(scol);
                return rgb[0] * 65536 + rgb[1] * 256 + rgb[2];
            }
        }
    }]);

    return ColorUtils;
}();

ColorUtils.stdCol = {
    "aqua": [0, 255, 255],
    "black": [0, 0, 0],
    "blue": [0, 0, 255],
    "fuchsia": [255, 0, 255],
    "gray": [128, 128, 128],
    "green": [0, 128, 0],
    "lime": [0, 255, 0],
    "maroon": [128, 0, 0],
    "navy": [0, 0, 128],
    "olive": [128, 128, 0],
    "orange": [255, 165, 0],
    "purple": [128, 0, 128],
    "red": [255, 0, 0],
    "silver": [192, 192, 192],
    "teal": [0, 128, 128],
    "white": [255, 255, 255],
    "yellow": [255, 255, 0]
};
exports.ColorUtils = ColorUtils;

},{}],32:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Position = function () {
    function Position(x, y) {
        _classCallCheck(this, Position);

        this._x = x;
        this._y = y;
    }

    _createClass(Position, [{
        key: "x",
        get: function get() {
            return this._x;
        }
    }, {
        key: "y",
        get: function get() {
            return this._y;
        }
    }], [{
        key: "setMaxValues",
        value: function setMaxValues(w, h) {
            Position.maxWidth = w;
            Position.maxHeight = h;
        }
    }, {
        key: "getRandom",
        value: function getRandom() {
            var width = arguments.length <= 0 || arguments[0] === undefined ? -1 : arguments[0];
            var height = arguments.length <= 1 || arguments[1] === undefined ? -1 : arguments[1];

            if (width === -1) {
                width = Position.maxWidth;
            }
            if (height === -1) {
                height = Position.maxHeight;
            }
            var x = Math.floor(Math.random() * width);
            var y = Math.floor(Math.random() * height);
            return new Position(x, y);
        }
    }, {
        key: "getNeighbours",
        value: function getNeighbours(pos) {
            var width = arguments.length <= 1 || arguments[1] === undefined ? -1 : arguments[1];
            var height = arguments.length <= 2 || arguments[2] === undefined ? -1 : arguments[2];
            var onlyCardinal = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

            if (width === -1) {
                width = Position.maxWidth;
            }
            if (height === -1) {
                height = Position.maxHeight;
            }
            var x = pos.x;
            var y = pos.y;
            var positions = [];
            if (x > 0) {
                positions.push(new Position(x - 1, y));
            }
            if (x < width - 1) {
                positions.push(new Position(x + 1, y));
            }
            if (y > 0) {
                positions.push(new Position(x, y - 1));
            }
            if (y < height - 1) {
                positions.push(new Position(x, y + 1));
            }
            if (!onlyCardinal) {
                if (x > 0 && y > 0) {
                    positions.push(new Position(x - 1, y - 1));
                }
                if (x > 0 && y < height - 1) {
                    positions.push(new Position(x - 1, y + 1));
                }
                if (x < width - 1 && y < height - 1) {
                    positions.push(new Position(x + 1, y + 1));
                }
                if (x < width - 1 && y > 0) {
                    positions.push(new Position(x + 1, y - 1));
                }
            }
            return positions;
        }
    }, {
        key: "getDirections",
        value: function getDirections() {
            var onlyCardinal = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

            var directions = [];
            directions.push(new Position(0, -1));
            directions.push(new Position(0, 1));
            directions.push(new Position(-1, 0));
            directions.push(new Position(1, 0));
            if (!onlyCardinal) {
                directions.push(new Position(-1, -1));
                directions.push(new Position(1, 1));
                directions.push(new Position(-1, 1));
                directions.push(new Position(1, -1));
            }
            return directions;
        }
    }, {
        key: "add",
        value: function add(a, b) {
            return new Position(a.x + b.x, a.y + b.y);
        }
    }, {
        key: "getDiagonalOffsets",
        value: function getDiagonalOffsets() {
            return [{ x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: 1 }];
        }
    }]);

    return Position;
}();

exports.Position = Position;

},{}],33:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./Color'));
__export(require('./Position'));
var Utils;
(function (Utils) {
    // CRC32 utility. Adapted from http://stackoverflow.com/questions/18638900/javascript-crc32
    var crcTable = void 0;
    function makeCRCTable() {
        var c = void 0;
        crcTable = [];
        for (var n = 0; n < 256; n++) {
            c = n;
            for (var k = 0; k < 8; k++) {
                c = c & 1 ? 0xEDB88320 ^ c >>> 1 : c >>> 1;
            }
            crcTable[n] = c;
        }
    }
    function buildMatrix(w, h, value) {
        var ret = [];
        for (var x = 0; x < w; ++x) {
            ret[x] = [];
            for (var y = 0; y < h; ++y) {
                ret[x][y] = value;
            }
        }
        return ret;
    }
    Utils.buildMatrix = buildMatrix;
    function crc32(str) {
        if (!crcTable) {
            makeCRCTable();
        }
        var crc = 0 ^ -1;
        for (var i = 0, len = str.length; i < len; ++i) {
            crc = crc >>> 8 ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
        }
        return (crc ^ -1) >>> 0;
    }
    Utils.crc32 = crc32;
    ;
    function toCamelCase(input) {
        return input.toLowerCase().replace(/(\b|_)\w/g, function (m) {
            return m.toUpperCase().replace(/_/, "");
        });
    }
    Utils.toCamelCase = toCamelCase;
    function generateGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : r & 0x3 | 0x8;
            return v.toString(16);
        });
    }
    Utils.generateGuid = generateGuid;
    function getRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    Utils.getRandom = getRandom;
    function getRandomIndex(array) {
        return array[getRandom(0, array.length - 1)];
    }
    Utils.getRandomIndex = getRandomIndex;
    function randomizeArray(array) {
        if (array.length <= 1) return array;
        for (var i = 0; i < array.length; i++) {
            var randomChoiceIndex = getRandom(i, array.length - 1);
            var _ref = [array[randomChoiceIndex], array[i]];
            array[i] = _ref[0];
            array[randomChoiceIndex] = _ref[1];
        }
        return array;
    }
    Utils.randomizeArray = randomizeArray;
    function applyMixins(derivedCtor, baseCtors) {
        baseCtors.forEach(function (baseCtor) {
            Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
                derivedCtor.prototype[name] = baseCtor.prototype[name];
            });
        });
    }
    Utils.applyMixins = applyMixins;
})(Utils = exports.Utils || (exports.Utils = {}));

},{"./Color":31,"./Position":32}],34:[function(require,module,exports){
"use strict";

var Components = require('../components');
var Map = require('../map');
var Entities = require('./index');
function createWily(engine) {
    var wily = new Entities.Entity(engine, 'Wily', 'player');
    wily.addComponent(new Components.PhysicsComponent(engine));
    wily.addComponent(new Components.RenderableComponent(engine, {
        glyph: new Map.Glyph('@', 0xffffff, 0x000000)
    }));
    wily.addComponent(new Components.EnergyComponent(engine));
    wily.addComponent(new Components.InputComponent(engine));
    wily.addComponent(new Components.RuneWriterComponent(engine));
    wily.addComponent(new Components.HealthComponent(engine));
    return wily;
}
exports.createWily = createWily;
function createRat(engine) {
    var rat = new Entities.Entity(engine, 'Rat', 'vermin');
    rat.addComponent(new Components.PhysicsComponent(engine));
    rat.addComponent(new Components.RenderableComponent(engine, {
        glyph: new Map.Glyph('r', 0xffffff, 0x000000)
    }));
    rat.addComponent(new Components.EnergyComponent(engine));
    rat.addComponent(new Components.RoamingAIComponent(engine));
    rat.addComponent(new Components.HealthComponent(engine));
    return rat;
}
exports.createRat = createRat;

},{"../components":30,"../map":50,"./index":36}],35:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('../core');
var Events = require('../events');
var Mixins = require('../mixins');

var Entity = function () {
    function Entity(engine) {
        var name = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
        var type = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

        _classCallCheck(this, Entity);

        this.engine = engine;
        this._guid = Core.Utils.generateGuid();
        this._name = name;
        this._type = type;
        this.components = [];
        this.engine.registerEntity(this);
    }

    _createClass(Entity, [{
        key: 'destroy',
        value: function destroy() {
            this.components.forEach(function (component) {
                component.destroy();
                component = null;
            });
            this.engine.removeEntity(this);
        }
    }, {
        key: 'addComponent',
        value: function addComponent(component) {
            var options = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            this.components.push(component);
            component.registerEntity(this);
            if (options && options.duration) {
                var delayedComponentRemover = new DelayedComponentRemover();
                delayedComponentRemover.triggerTurn = this.engine.currentTurn + options.duration;
                delayedComponentRemover.entity = this;
                delayedComponentRemover.engine = this.engine;
                delayedComponentRemover.guid = component.guid;
                delayedComponentRemover.listener = this.engine.listen(new Events.Listener('turn', delayedComponentRemover.check.bind(delayedComponentRemover)));
            }
        }
    }, {
        key: 'hasComponent',
        value: function hasComponent(componentType) {
            return this.components.filter(function (component) {
                return component instanceof componentType;
            }).length > 0;
        }
    }, {
        key: 'getComponent',
        value: function getComponent(componentType) {
            var component = this.components.filter(function (component) {
                return component instanceof componentType;
            });
            if (component.length === 0) {
                return null;
            }
            return component[0];
        }
    }, {
        key: 'removeComponent',
        value: function removeComponent(guid) {
            var idx = this.components.findIndex(function (component) {
                return component.guid === guid;
            });
            if (idx >= 0) {
                this.components[idx].destroy();
                this.components.splice(idx, 1);
            }
        }
    }, {
        key: 'type',
        get: function get() {
            return this._type;
        }
    }, {
        key: 'name',
        get: function get() {
            return this._name;
        }
    }, {
        key: 'guid',
        get: function get() {
            return this._guid;
        }
    }]);

    return Entity;
}();

exports.Entity = Entity;

var DelayedComponentRemover = function () {
    function DelayedComponentRemover() {
        _classCallCheck(this, DelayedComponentRemover);
    }

    _createClass(DelayedComponentRemover, [{
        key: 'check',
        value: function check(event) {
            if (event.data.currentTurn >= this.triggerTurn) {
                this.entity.removeComponent(this.guid);
                this.engine.removeListener(this.listener);
            }
        }
    }]);

    return DelayedComponentRemover;
}();

Core.Utils.applyMixins(Entity, [Mixins.EventHandler]);

},{"../core":33,"../events":39,"../mixins":52}],36:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./Creator'));
__export(require('./Entity'));

},{"./Creator":34,"./Entity":35}],37:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Event = function Event(type) {
    var data = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    _classCallCheck(this, Event);

    this.type = type;
    this.data = data;
};

exports.Event = Event;

},{}],38:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('../core');

var Listener = function Listener(type, callback) {
    var priority = arguments.length <= 2 || arguments[2] === undefined ? 100 : arguments[2];
    var guid = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

    _classCallCheck(this, Listener);

    this.type = type;
    this.priority = priority;
    this.callback = callback;
    this.guid = guid || Core.Utils.generateGuid();
};

exports.Listener = Listener;

},{"../core":33}],39:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./Event'));
__export(require('./Listener'));

},{"./Event":37,"./Listener":38}],40:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('../core');

var FoV = function () {
    function FoV(visiblityCheck, width, height, radius) {
        _classCallCheck(this, FoV);

        this.visiblityCheck = visiblityCheck;
        this.width = width;
        this.height = height;
        this.radius = radius;
    }

    _createClass(FoV, [{
        key: "calculate",
        value: function calculate(position) {
            var _this = this;

            this.startPosition = position;
            this.lightMap = Core.Utils.buildMatrix(this.width, this.height, 0);
            if (!this.visiblityCheck(position)) {
                return this.lightMap;
            }
            this.lightMap[position.x][position.y] = 1;
            Core.Position.getDiagonalOffsets().forEach(function (offset) {
                _this.castLight(1, 1.0, 0.0, 0, offset.x, offset.y, 0);
                _this.castLight(1, 1.0, 0.0, offset.x, 0, 0, offset.y);
            });
            return this.lightMap;
        }
    }, {
        key: "castLight",
        value: function castLight(row, start, end, xx, xy, yx, yy) {
            var newStart = 0;
            var blocked = false;
            if (start < end) {
                return;
            }
            for (var distance = row; distance <= this.radius && !blocked; distance++) {
                var deltaY = -distance;
                for (var deltaX = -distance; deltaX <= 0; deltaX++) {
                    var cx = this.startPosition.x + deltaX * xx + deltaY * xy;
                    var cy = this.startPosition.y + deltaX * yx + deltaY * yy;
                    var leftSlope = (deltaX - 0.5) / (deltaY + 0.5);
                    var rightSlope = (deltaX + 0.5) / (deltaY - 0.5);
                    if (!(cx >= 0 && cy >= 0 && cx < this.width && cy < this.height) || start < rightSlope) {
                        continue;
                    } else if (end > leftSlope) {
                        break;
                    }
                    var dist = Math.max(Math.abs(deltaX), Math.abs(deltaY));
                    if (dist <= this.radius) {
                        this.lightMap[cx][cy] = 1;
                    }
                    if (blocked) {
                        if (!this.visiblityCheck(new Core.Position(cx, cy))) {
                            newStart = rightSlope;
                            continue;
                        } else {
                            blocked = false;
                            start = newStart;
                        }
                    } else if (!this.visiblityCheck(new Core.Position(cx, cy)) && distance <= this.radius) {
                        blocked = true;
                        this.castLight(distance + 1, start, leftSlope, xx, xy, yx, yy);
                        newStart = rightSlope;
                    }
                }
            }
        }
    }]);

    return FoV;
}();

exports.FoV = FoV;

},{"../core":33}],41:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Glyph = function () {
    function Glyph() {
        var g = arguments.length <= 0 || arguments[0] === undefined ? Glyph.CHAR_SPACE : arguments[0];
        var f = arguments.length <= 1 || arguments[1] === undefined ? 0xffffff : arguments[1];
        var b = arguments.length <= 2 || arguments[2] === undefined ? 0x000000 : arguments[2];

        _classCallCheck(this, Glyph);

        this._glyph = typeof g === 'string' ? g.charCodeAt(0) : g;
        this._foregroundColor = f;
        this._backgroundColor = b;
    }

    _createClass(Glyph, [{
        key: "glyph",
        get: function get() {
            return this._glyph;
        }
    }, {
        key: "foregroundColor",
        get: function get() {
            return this._foregroundColor;
        }
    }, {
        key: "backgroundColor",
        get: function get() {
            return this._backgroundColor;
        }
    }]);

    return Glyph;
}();

Glyph.CHAR_FULL = 219;
Glyph.CHAR_SPACE = 32;
// single walls
Glyph.CHAR_HLINE = 196;
Glyph.CHAR_VLINE = 179;
Glyph.CHAR_SW = 191;
Glyph.CHAR_SE = 218;
Glyph.CHAR_NW = 217;
Glyph.CHAR_NE = 192;
Glyph.CHAR_TEEW = 180;
Glyph.CHAR_TEEE = 195;
Glyph.CHAR_TEEN = 193;
Glyph.CHAR_TEES = 194;
Glyph.CHAR_CROSS = 197;
// double walls
Glyph.CHAR_DHLINE = 205;
Glyph.CHAR_DVLINE = 186;
Glyph.CHAR_DNE = 187;
Glyph.CHAR_DNW = 201;
Glyph.CHAR_DSE = 188;
Glyph.CHAR_DSW = 200;
Glyph.CHAR_DTEEW = 185;
Glyph.CHAR_DTEEE = 204;
Glyph.CHAR_DTEEN = 202;
Glyph.CHAR_DTEES = 203;
Glyph.CHAR_DCROSS = 206;
// blocks 
Glyph.CHAR_BLOCK1 = 176;
Glyph.CHAR_BLOCK2 = 177;
Glyph.CHAR_BLOCK3 = 178;
// arrows 
Glyph.CHAR_ARROW_N = 24;
Glyph.CHAR_ARROW_S = 25;
Glyph.CHAR_ARROW_E = 26;
Glyph.CHAR_ARROW_W = 27;
// arrows without tail 
Glyph.CHAR_ARROW2_N = 30;
Glyph.CHAR_ARROW2_S = 31;
Glyph.CHAR_ARROW2_E = 16;
Glyph.CHAR_ARROW2_W = 17;
// double arrows 
Glyph.CHAR_DARROW_H = 29;
Glyph.CHAR_DARROW_V = 18;
// GUI stuff 
Glyph.CHAR_CHECKBOX_UNSET = 224;
Glyph.CHAR_CHECKBOX_SET = 225;
Glyph.CHAR_RADIO_UNSET = 9;
Glyph.CHAR_RADIO_SET = 10;
// sub-pixel resolution kit 
Glyph.CHAR_SUBP_NW = 226;
Glyph.CHAR_SUBP_NE = 227;
Glyph.CHAR_SUBP_N = 228;
Glyph.CHAR_SUBP_SE = 229;
Glyph.CHAR_SUBP_DIAG = 230;
Glyph.CHAR_SUBP_E = 231;
Glyph.CHAR_SUBP_SW = 232;
// miscellaneous 
Glyph.CHAR_SMILIE = 1;
Glyph.CHAR_SMILIE_INV = 2;
Glyph.CHAR_HEART = 3;
Glyph.CHAR_DIAMOND = 4;
Glyph.CHAR_CLUB = 5;
Glyph.CHAR_SPADE = 6;
Glyph.CHAR_BULLET = 7;
Glyph.CHAR_BULLET_INV = 8;
Glyph.CHAR_MALE = 11;
Glyph.CHAR_FEMALE = 12;
Glyph.CHAR_NOTE = 13;
Glyph.CHAR_NOTE_DOUBLE = 14;
Glyph.CHAR_LIGHT = 15;
Glyph.CHAR_EXCLAM_DOUBLE = 19;
Glyph.CHAR_PILCROW = 20;
Glyph.CHAR_SECTION = 21;
Glyph.CHAR_POUND = 156;
Glyph.CHAR_MULTIPLICATION = 158;
Glyph.CHAR_FUNCTION = 159;
Glyph.CHAR_RESERVED = 169;
Glyph.CHAR_HALF = 171;
Glyph.CHAR_ONE_QUARTER = 172;
Glyph.CHAR_COPYRIGHT = 184;
Glyph.CHAR_CENT = 189;
Glyph.CHAR_YEN = 190;
Glyph.CHAR_CURRENCY = 207;
Glyph.CHAR_THREE_QUARTERS = 243;
Glyph.CHAR_DIVISION = 246;
Glyph.CHAR_GRADE = 248;
Glyph.CHAR_UMLAUT = 249;
Glyph.CHAR_POW1 = 251;
Glyph.CHAR_POW3 = 252;
Glyph.CHAR_POW2 = 253;
Glyph.CHAR_BULLET_SQUARE = 254;
exports.Glyph = Glyph;

},{}],42:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('../core');
var _Map = require('./index');

var Map = function () {
    function Map(w, h) {
        _classCallCheck(this, Map);

        this._width = w;
        this._height = h;
        this.tiles = [];
        for (var x = 0; x < this._width; x++) {
            this.tiles[x] = [];
            for (var y = 0; y < this._height; y++) {
                this.tiles[x][y] = _Map.Tile.createTile(_Map.Tile.EMPTY);
            }
        }
    }

    _createClass(Map, [{
        key: 'getTile',
        value: function getTile(position) {
            return this.tiles[position.x][position.y];
        }
    }, {
        key: 'setTile',
        value: function setTile(position, tile) {
            this.tiles[position.x][position.y] = tile;
        }
    }, {
        key: 'forEach',
        value: function forEach(callback) {
            for (var y = 0; y < this._height; y++) {
                for (var x = 0; x < this._width; x++) {
                    callback(new Core.Position(x, y), this.tiles[x][y]);
                }
            }
        }
    }, {
        key: 'isWalkable',
        value: function isWalkable(position) {
            return this.tiles[position.x][position.y].walkable;
        }
    }, {
        key: 'width',
        get: function get() {
            return this._width;
        }
    }, {
        key: 'height',
        get: function get() {
            return this._height;
        }
    }]);

    return Map;
}();

exports.Map = Map;

},{"../core":33,"./index":50}],43:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('../core');
var Map = require('./index');

var Tile = function () {
    function Tile(glyph, walkable, blocksSight) {
        _classCallCheck(this, Tile);

        this.glyph = glyph;
        this.walkable = walkable;
        this.blocksSight = blocksSight;
        this.entity = null;
        this.props = {};
    }

    _createClass(Tile, null, [{
        key: 'createTile',
        value: function createTile(desc) {
            var g = null;
            if (desc.glyph.length && desc.glyph.length > 0) {
                g = Core.Utils.getRandomIndex(desc.glyph);
            } else {
                g = desc.glyph;
            }
            return new Tile(g, desc.walkable, desc.blocksSight);
        }
    }]);

    return Tile;
}();

Tile.EMPTY = {
    glyph: new Map.Glyph(Map.Glyph.CHAR_SPACE, 0x000000, 0x000000),
    walkable: false,
    blocksSight: true
};
Tile.FLOOR = {
    glyph: [new Map.Glyph('.', 0x3a4444, 0x222222), new Map.Glyph('.', 0x443a44, 0x222222), new Map.Glyph('.', 0x44443a, 0x222222), new Map.Glyph(',', 0x3a4444, 0x222222), new Map.Glyph(',', 0x443a44, 0x222222), new Map.Glyph(',', 0x44443a, 0x222222)],
    walkable: true,
    blocksSight: false
};
Tile.WALL = {
    glyph: new Map.Glyph(Map.Glyph.CHAR_BLOCK3, 0xdddddd, 0x111111),
    walkable: false,
    blocksSight: true
};
exports.Tile = Tile;

},{"../core":33,"./index":50}],44:[function(require,module,exports){
"use strict";

var Core = require('../core');
var Direction;
(function (Direction) {
    Direction[Direction["None"] = 1] = "None";
    Direction[Direction["North"] = 2] = "North";
    Direction[Direction["East"] = 3] = "East";
    Direction[Direction["South"] = 4] = "South";
    Direction[Direction["West"] = 5] = "West";
})(Direction || (Direction = {}));
var Utils;
(function (Utils) {
    function carveable(map, position) {
        if (position.x < 0 || position.x > map.length - 1) {
            return false;
        }
        if (position.y < 0 || position.y > map[0].length - 1) {
            return false;
        }
        return map[position.x][position.y] === 1;
    }
    function findCarveableSpot(map) {
        var width = map.length;
        var height = map[0].length;
        var position = null;
        var carvablesPositions = [];
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var _position = new Core.Position(Core.Utils.getRandom(0, width), Core.Utils.getRandom(0, height));
                if (Utils.canCarve(map, _position, 0, true)) {
                    carvablesPositions.push(_position);
                }
            }
        }
        if (carvablesPositions.length > 0) {
            return Core.Utils.getRandomIndex(carvablesPositions);
        }
        return null;
    }
    Utils.findCarveableSpot = findCarveableSpot;
    function countSurroundingTiles(map, position) {
        var checkDiagonals = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        var connections = 0;
        return Core.Position.getNeighbours(position, map.length, map[0].length, !checkDiagonals).filter(function (pos) {
            return map[pos.x][pos.y] === 0;
        }).length;
    }
    Utils.countSurroundingTiles = countSurroundingTiles;
    function canCarve(map, position) {
        var allowedConnections = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
        var checkDiagonals = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

        if (!carveable(map, position)) {
            return false;
        }
        return this.countSurroundingTiles(map, position, checkDiagonals) <= allowedConnections;
    }
    Utils.canCarve = canCarve;
    function canExtendTunnel(map, position) {
        if (!carveable(map, position)) {
            return false;
        }
        var connectedFrom = Direction.None;
        var connections = 0;
        if (position.y > 0 && map[position.x][position.y - 1] === 0) {
            connectedFrom = Direction.North;
            connections++;
        }
        if (position.y < map[0].length - 1 && map[position.x][position.y + 1] === 0) {
            connectedFrom = Direction.South;
            connections++;
        }
        if (position.x > 0 && map[position.x - 1][position.y] === 0) {
            connectedFrom = Direction.West;
            connections++;
        }
        if (position.x < map.length - 1 && map[position.x + 1][position.y] === 0) {
            connectedFrom = Direction.East;
            connections++;
        }
        if (connections > 1) {
            return false;
        }
        return canExtendTunnelFrom(map, position, connectedFrom);
    }
    Utils.canExtendTunnel = canExtendTunnel;
    function canExtendTunnelFrom(map, position, direction) {
        if (map[position.x][position.y] === 0) {
            return false;
        }
        switch (direction) {
            case Direction.South:
                return carveable(map, new Core.Position(position.x - 1, position.y)) && carveable(map, new Core.Position(position.x - 1, position.y - 1)) && carveable(map, new Core.Position(position.x, position.y - 1)) && carveable(map, new Core.Position(position.x + 1, position.y - 1)) && carveable(map, new Core.Position(position.x + 1, position.y));
            case Direction.North:
                return carveable(map, new Core.Position(position.x + 1, position.y)) && carveable(map, new Core.Position(position.x + 1, position.y + 1)) && carveable(map, new Core.Position(position.x, position.y + 1)) && carveable(map, new Core.Position(position.x - 1, position.y + 1)) && carveable(map, new Core.Position(position.x - 1, position.y));
            case Direction.West:
                return carveable(map, new Core.Position(position.x, position.y - 1)) && carveable(map, new Core.Position(position.x + 1, position.y - 1)) && carveable(map, new Core.Position(position.x + 1, position.y)) && carveable(map, new Core.Position(position.x + 1, position.y + 1)) && carveable(map, new Core.Position(position.x, position.y + 1));
            case Direction.East:
                return carveable(map, new Core.Position(position.x, position.y - 1)) && carveable(map, new Core.Position(position.x - 1, position.y - 1)) && carveable(map, new Core.Position(position.x - 1, position.y)) && carveable(map, new Core.Position(position.x - 1, position.y + 1)) && carveable(map, new Core.Position(position.x, position.y + 1));
            case Direction.None:
                return carveable(map, new Core.Position(position.x, position.y - 1)) && carveable(map, new Core.Position(position.x - 1, position.y)) && carveable(map, new Core.Position(position.x, position.y + 1)) && carveable(map, new Core.Position(position.x + 1, position.y));
        }
        return false;
    }
    Utils.canExtendTunnelFrom = canExtendTunnelFrom;
})(Utils = exports.Utils || (exports.Utils = {}));

},{"../core":33}],45:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('../../core');
var Map = require('../index');
var Exceptions = require('../../Exceptions');

var DungeonGenerator = function () {
    function DungeonGenerator(width, height) {
        _classCallCheck(this, DungeonGenerator);

        this.width = width;
        this.height = height;
        this.backgroundColor = 0x000000;
        this.foregroundColor = 0xaaaaaa;
    }

    _createClass(DungeonGenerator, [{
        key: 'generateMap',
        value: function generateMap() {
            var cells = Core.Utils.buildMatrix(this.width, this.height, 1);
            var roomGenerator = new Map.RoomGenerator(cells);
            roomGenerator.generate();
            cells = roomGenerator.getCells();
            var mazeGenerator = new Map.MazeRecursiveBacktrackGenerator(cells);
            mazeGenerator.generate();
            cells = mazeGenerator.getCells();
            cells = mazeGenerator.getCells();
            var topologyCombinator = new Map.TopologyCombinator(cells);
            topologyCombinator.initialize();
            var remainingTopologies = topologyCombinator.combine();
            if (remainingTopologies > 5) {
                console.log('remaining topologies', remainingTopologies);
                return null;
            }
            topologyCombinator.pruneDeadEnds();
            return topologyCombinator.getCells();
        }
    }, {
        key: 'generate',
        value: function generate() {
            var map = new Map.Map(this.width, this.height);
            var cells = null;
            var attempts = 0;
            while (cells === null) {
                attempts++;
                cells = this.generateMap();
                if (attempts > 100) {
                    throw new Exceptions.CouldNotGenerateMap('Could not generate dungeon');
                }
            }
            var tile = void 0;
            for (var x = 0; x < this.width; x++) {
                for (var y = 0; y < this.height; y++) {
                    if (cells[x][y] === 0) {
                        tile = Map.Tile.createTile(Map.Tile.FLOOR);
                    } else {
                        tile = Map.Tile.createTile(Map.Tile.WALL);
                    }
                    map.setTile(new Core.Position(x, y), tile);
                }
            }
            return map;
        }
    }]);

    return DungeonGenerator;
}();

exports.DungeonGenerator = DungeonGenerator;

},{"../../Exceptions":3,"../../core":33,"../index":50}],46:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('../../core');
var Map = require('../index');

var MazeRecursiveBacktrackGenerator = function () {
    function MazeRecursiveBacktrackGenerator(cells) {
        _classCallCheck(this, MazeRecursiveBacktrackGenerator);

        this.cells = cells;
        this.width = this.cells.length;
        this.height = this.cells[0].length;
        this.stack = [];
    }

    _createClass(MazeRecursiveBacktrackGenerator, [{
        key: 'populateStack',
        value: function populateStack(position) {
            var neighbours = Core.Position.getNeighbours(position, this.width, this.height, true);
            var newCells = [];
            for (var direction in neighbours) {
                var _position = neighbours[direction];
                if (_position && Map.Utils.canCarve(this.cells, _position, 1)) {
                    newCells.push(_position);
                }
            }
            if (newCells.length > 0) {
                this.stack = this.stack.concat(Core.Utils.randomizeArray(newCells));
            }
        }
    }, {
        key: 'generate',
        value: function generate() {
            var position = Map.Utils.findCarveableSpot(this.cells);
            while (this.carveMaze()) {}
        }
    }, {
        key: 'carveMaze',
        value: function carveMaze() {
            var position = Map.Utils.findCarveableSpot(this.cells);
            if (position === null) {
                return false;
            }
            this.cells[position.x][position.y] = 0;
            this.populateStack(position);
            while (this.stack && this.stack.length > 0) {
                var pos = this.stack.pop();
                if (Map.Utils.canExtendTunnel(this.cells, pos)) {
                    this.cells[pos.x][pos.y] = 0;
                    this.populateStack(pos);
                }
            }
            return true;
        }
    }, {
        key: 'getCells',
        value: function getCells() {
            return this.cells;
        }
    }]);

    return MazeRecursiveBacktrackGenerator;
}();

exports.MazeRecursiveBacktrackGenerator = MazeRecursiveBacktrackGenerator;

},{"../../core":33,"../index":50}],47:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('../../core');
var Map = require('../index');

var RoomGenerator = function () {
    function RoomGenerator(cells) {
        var maxAttempts = arguments.length <= 1 || arguments[1] === undefined ? 500 : arguments[1];

        _classCallCheck(this, RoomGenerator);

        this.cells = cells;
        this.width = this.cells.length;
        this.height = this.cells[0].length;
        this.maxAttempts = maxAttempts;
    }

    _createClass(RoomGenerator, [{
        key: 'isSpaceAvailable',
        value: function isSpaceAvailable(x, y, width, height) {
            for (var i = x; i < x + width; i++) {
                for (var j = y; j < y + height; j++) {
                    if (!Map.Utils.canCarve(this.cells, new Core.Position(i, j), 0, true)) {
                        return false;
                    }
                }
            }
            return true;
        }
    }, {
        key: 'generate',
        value: function generate() {
            while (this.addRoom()) {}
        }
    }, {
        key: 'addRoom',
        value: function addRoom() {
            var roomGenerated = false;
            var attempts = 0;
            while (!roomGenerated && attempts < this.maxAttempts) {
                roomGenerated = this.generateRoom();
                attempts++;
            }
            return roomGenerated;
        }
    }, {
        key: 'generateRoom',
        value: function generateRoom() {
            var size = Core.Utils.getRandom(3, 5);
            var rectangularity = Core.Utils.getRandom(1, 3);
            var width = void 0;
            var height = void 0;
            if (Math.random() > 0.5) {
                height = size;
                width = size + rectangularity;
            } else {
                width = size;
                height = size + rectangularity;
            }
            var x = Core.Utils.getRandom(0, this.width - width - 2);
            x = Math.floor(x / 2) * 2 + 1;
            var y = Core.Utils.getRandom(0, this.height - height - 2);
            y = Math.floor(y / 2) * 2 + 1;
            if (this.isSpaceAvailable(x, y, width, height)) {
                for (var i = x; i < x + width; i++) {
                    for (var j = y; j < y + height; j++) {
                        this.cells[i][j] = 0;
                    }
                }
                return true;
            }
            return false;
        }
    }, {
        key: 'getCells',
        value: function getCells() {
            return this.cells;
        }
    }]);

    return RoomGenerator;
}();

exports.RoomGenerator = RoomGenerator;

},{"../../core":33,"../index":50}],48:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('../../core');
var Map = require('../index');

var TopologyCombinator = function () {
    function TopologyCombinator(cells) {
        _classCallCheck(this, TopologyCombinator);

        this.cells = cells;
        this.width = this.cells.length;
        this.height = this.cells[0].length;
        this.topologies = [];
        for (var x = 0; x < this.width; x++) {
            this.topologies[x] = [];
            for (var y = 0; y < this.height; y++) {
                this.topologies[x][y] = 0;
            }
        }
    }

    _createClass(TopologyCombinator, [{
        key: 'getCells',
        value: function getCells() {
            return this.cells;
        }
    }, {
        key: 'initialize',
        value: function initialize() {
            this.topologyId = 0;
            for (var x = 0; x < this.width; x++) {
                for (var y = 0; y < this.height; y++) {
                    this.addTopology(new Core.Position(x, y));
                }
            }
            return this.topologies;
        }
    }, {
        key: 'combine',
        value: function combine() {
            var i = 2;
            var max = this.topologyId;
            var remainingTopologies = [];
            for (var j = 2; j <= this.topologyId; j++) {
                remainingTopologies.push(j);
            }
            while (remainingTopologies.length > 0 && i < max * 5) {
                var topologyId = remainingTopologies.shift();
                i++;
                if (!this.combineTopology(1, topologyId)) {
                    remainingTopologies.push(topologyId);
                }
            }
            return remainingTopologies.length;
        }
    }, {
        key: 'combineTopology',
        value: function combineTopology(a, b) {
            var edges = this.getEdges(a, b);
            if (edges.length === 0) {
                return false;
            }
            var combined = false;
            while (!combined && edges.length > 0) {
                var idx = Core.Utils.getRandom(0, edges.length - 1);
                var edge = edges[idx];
                edges.splice(idx, 1);
                var surroundingTiles = Map.Utils.countSurroundingTiles(this.cells, edge);
                if (surroundingTiles === 2) {
                    this.cells[edge.x][edge.y] = 0;
                    this.topologies[edge.x][edge.y] = a;
                    if (edges.length >= 4) {
                        if (Math.random() > 0.2) {
                            combined = true;
                        }
                    } else {
                        combined = true;
                    }
                }
            }
            if (combined) {
                for (var x = 0; x < this.width; x++) {
                    for (var y = 0; y < this.height; y++) {
                        if (this.topologies[x][y] === b) {
                            this.topologies[x][y] = a;
                        }
                    }
                }
            }
            return combined;
        }
    }, {
        key: 'getEdges',
        value: function getEdges(a, b) {
            var _this = this;

            var hasTopologyNeighbour = function hasTopologyNeighbour(position, topologyId) {
                var neighbours = Core.Position.getNeighbours(position, -1, -1, true);
                return neighbours.filter(function (position) {
                    return _this.topologies[position.x][position.y] === topologyId;
                }).length > 0;
            };
            var edges = [];
            for (var x = 0; x < this.width; x++) {
                for (var y = 0; y < this.height; y++) {
                    var position = new Core.Position(x, y);
                    if (hasTopologyNeighbour(position, a) && hasTopologyNeighbour(position, b)) {
                        edges.push(position);
                    }
                }
            }
            return edges;
        }
    }, {
        key: 'addTopology',
        value: function addTopology(position) {
            var _this2 = this;

            var topologyId = arguments.length <= 1 || arguments[1] === undefined ? -1 : arguments[1];

            var x = position.x;
            var y = position.y;
            if (this.cells[x][y] !== 0 || this.topologies[x][y] !== 0) {
                return;
            }
            if (topologyId === -1) {
                this.topologyId++;
                topologyId = this.topologyId;
            }
            this.topologies[x][y] = topologyId;
            var neighbours = Core.Position.getNeighbours(new Core.Position(x, y), -1, -1, true);
            neighbours.forEach(function (position) {
                if (_this2.cells[position.x][position.y] === 0 && _this2.topologies[position.x][position.y] === 0) {
                    _this2.addTopology(position, topologyId);
                }
            });
        }
    }, {
        key: 'pruneDeadEnd',
        value: function pruneDeadEnd(position) {
            var _this3 = this;

            if (this.cells[position.x][position.y] === 0) {
                var surroundingTiles = Map.Utils.countSurroundingTiles(this.cells, new Core.Position(position.x, position.y));
                if (surroundingTiles <= 1) {
                    this.cells[position.x][position.y] = 1;
                    Core.Position.getNeighbours(position, -1, -1, true).forEach(function (neighbour) {
                        _this3.pruneDeadEnd(neighbour);
                    });
                }
            }
        }
    }, {
        key: 'pruneDeadEnds',
        value: function pruneDeadEnds() {
            for (var x = 0; x < this.width; x++) {
                for (var y = 0; y < this.height; y++) {
                    if (this.cells[x][y] === 0) {
                        this.pruneDeadEnd(new Core.Position(x, y));
                    }
                }
            }
        }
    }]);

    return TopologyCombinator;
}();

exports.TopologyCombinator = TopologyCombinator;

},{"../../core":33,"../index":50}],49:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./RoomGenerator'));
__export(require('./TopologyCombinator'));
__export(require('./MazeRecursiveBacktrackGenerator'));
__export(require('./DungeonGenerator'));

},{"./DungeonGenerator":45,"./MazeRecursiveBacktrackGenerator":46,"./RoomGenerator":47,"./TopologyCombinator":48}],50:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./generation'));
__export(require('./Utils'));
__export(require('./FoV'));
__export(require('./Map'));
__export(require('./Glyph'));
__export(require('./Tile'));

},{"./FoV":40,"./Glyph":41,"./Map":42,"./Tile":43,"./Utils":44,"./generation":49}],51:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventHandler = function () {
    function EventHandler() {
        _classCallCheck(this, EventHandler);

        this.listeners = {};
    }

    _createClass(EventHandler, [{
        key: "listen",
        value: function listen(listener) {
            if (!this.listeners) {
                this.listeners = {};
            }
            if (!this.listeners[listener.type]) {
                this.listeners[listener.type] = [];
            }
            this.listeners[listener.type].push(listener);
            this.listeners[listener.type] = this.listeners[listener.type].sort(function (a, b) {
                return a.priority - b.priority;
            });
            return listener;
        }
    }, {
        key: "removeListener",
        value: function removeListener(listener) {
            if (!this.listeners || !this.listeners[listener.type]) {
                return null;
            }
            var idx = this.listeners[listener.type].findIndex(function (l) {
                return l.guid === listener.guid;
            });
            if (typeof idx === 'number') {
                this.listeners[listener.type].splice(idx, 1);
            }
        }
    }, {
        key: "emit",
        value: function emit(event) {
            if (!this.listeners[event.type]) {
                return null;
            }
            var listeners = this.listeners[event.type].map(function (i) {
                return i;
            });
            listeners.forEach(function (listener) {
                listener.callback(event);
            });
        }
    }, {
        key: "is",
        value: function is(event) {
            if (!this.listeners[event.type]) {
                return true;
            }
            var returnedValue = true;
            this.listeners[event.type].forEach(function (listener) {
                if (!returnedValue) {
                    return;
                }
                returnedValue = listener.callback(event);
            });
            return returnedValue;
        }
    }, {
        key: "fire",
        value: function fire(event) {
            if (!this.listeners[event.type]) {
                return null;
            }
            var returnedValue = null;
            this.listeners[event.type].forEach(function (listener) {
                returnedValue = listener.callback(event);
            });
            return returnedValue;
        }
    }, {
        key: "gather",
        value: function gather(event) {
            if (!this.listeners[event.type]) {
                return [];
            }
            var values = [];
            this.listeners[event.type].forEach(function (listener) {
                values.push(listener.callback(event));
            });
            return values;
        }
    }]);

    return EventHandler;
}();

exports.EventHandler = EventHandler;

},{}],52:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./EventHandler'));

},{"./EventHandler":51}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDb25zb2xlLnRzIiwiRW5naW5lLnRzIiwiRXhjZXB0aW9ucy50cyIsIklucHV0SGFuZGxlci50cyIsIkxvZ1ZpZXcudHMiLCJNYXBWaWV3LnRzIiwiUGl4aUNvbnNvbGUudHMiLCJTY2VuZS50cyIsImFwcC50cyIsImJlaGF2aW91cnMvQWN0aW9uLnRzIiwiYmVoYXZpb3Vycy9CZWhhdmlvdXIudHMiLCJiZWhhdmlvdXJzL051bGxBY3Rpb24udHMiLCJiZWhhdmlvdXJzL1JhbmRvbVdhbGtCZWhhdmlvdXIudHMiLCJiZWhhdmlvdXJzL1dhbGtBY3Rpb24udHMiLCJiZWhhdmlvdXJzL1dyaXRlUnVuZUFjdGlvbi50cyIsImJlaGF2aW91cnMvaW5kZXgudHMiLCJjb21wb25lbnRzL0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvRW5lcmd5Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9IZWFsdGhDb21wb25lbnQudHMiLCJjb21wb25lbnRzL0lucHV0Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9QaHlzaWNzQ29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9SZW5kZXJhYmxlQ29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9Sb2FtaW5nQUlDb21wb25lbnQudHMiLCJjb21wb25lbnRzL1J1bmVEYW1hZ2VDb21wb25lbnQudHMiLCJjb21wb25lbnRzL1J1bmVGcmVlemVDb21wb25lbnQudHMiLCJjb21wb25lbnRzL1J1bmVXcml0ZXJDb21wb25lbnQudHMiLCJjb21wb25lbnRzL1NlbGZEZXN0cnVjdENvbXBvbmVudC50cyIsImNvbXBvbmVudHMvU2xvd0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvVGltZUhhbmRsZXJDb21wb25lbnQudHMiLCJjb21wb25lbnRzL2luZGV4LnRzIiwiY29yZS9Db2xvci50cyIsImNvcmUvUG9zaXRpb24udHMiLCJjb3JlL2luZGV4LnRzIiwiZW50aXRpZXMvQ3JlYXRvci50cyIsImVudGl0aWVzL0VudGl0eS50cyIsImVudGl0aWVzL2luZGV4LnRzIiwiZXZlbnRzL0V2ZW50LnRzIiwiZXZlbnRzL0xpc3RlbmVyLnRzIiwiZXZlbnRzL2luZGV4LnRzIiwibWFwL0ZvVi50cyIsIm1hcC9HbHlwaC50cyIsIm1hcC9NYXAudHMiLCJtYXAvVGlsZS50cyIsIm1hcC9VdGlscy50cyIsIm1hcC9nZW5lcmF0aW9uL0R1bmdlb25HZW5lcmF0b3IudHMiLCJtYXAvZ2VuZXJhdGlvbi9NYXplUmVjdXJzaXZlQmFja3RyYWNrR2VuZXJhdG9yLnRzIiwibWFwL2dlbmVyYXRpb24vUm9vbUdlbmVyYXRvci50cyIsIm1hcC9nZW5lcmF0aW9uL1RvcG9sb2d5Q29tYmluYXRvci50cyIsIm1hcC9nZW5lcmF0aW9uL2luZGV4LnRzIiwibWFwL2luZGV4LnRzIiwibWl4aW5zL0V2ZW50SGFuZGxlci50cyIsIm1peGlucy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQ0FBLElBQVksQUFBSSxlQUFNLEFBQVEsQUFBQztBQUMvQixJQUFZLEFBQUcsY0FBTSxBQUFPLEFBQUMsQUFFN0I7OztBQThCRSxxQkFBWSxBQUFhLE9BQUUsQUFBYztZQUFFLEFBQVUsbUVBQWUsQUFBUTtZQUFFLEFBQVUsbUVBQWUsQUFBUTs7OztBQUM3RyxBQUFJLGFBQUMsQUFBTSxTQUFHLEFBQUssQUFBQztBQUNwQixBQUFJLGFBQUMsQUFBTyxVQUFHLEFBQU0sQUFBQztBQUV0QixBQUFJLGFBQUMsQUFBaUIsb0JBQUcsQUFBTyxBQUFDO0FBQ2pDLEFBQUksYUFBQyxBQUFpQixvQkFBRyxBQUFPLEFBQUM7QUFFakMsQUFBSSxhQUFDLEFBQUssUUFBRyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQVcsWUFBUyxBQUFJLEtBQUMsQUFBSyxPQUFFLEFBQUksS0FBQyxBQUFNLFFBQUUsQUFBRyxJQUFDLEFBQUssTUFBQyxBQUFVLEFBQUMsQUFBQztBQUMzRixBQUFJLGFBQUMs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U0FBQyxBQUFDLElBQUcsQUFBQyxHQUFFLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxBQUFDLEFBQUMsT0FDakUsQUFBUyxVQUFDLEFBQUcsS0FBRSxJQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsQUFBQyxBQUFDLEFBQUM7QUFDM0UsaUJBQUssQUFBUyxVQUFDLEFBQUs7QUFDbEIsQUFBTSx1QkFBQyxBQUFTLFVBQUMsQUFBRyxLQUFFLElBQUksQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsR0FBRSxBQUFRLFNBQUMsQUFBQyxBQUFDLEFBQUMsT0FDekQsQUFBUyxVQUFDLEFBQUcsS0FBRSxJQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEFBQUMsQUFBQyxPQUNqRSxBQUFTLFVBQUMsQUFBRyxLQUFFLElBQUksQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBQyxHQUFFLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxBQUFDLEFBQUMsT0FDN0QsQUFBUyxVQUFDLEFBQUcsS0FBRSxJQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEFBQUMsQUFBQyxPQUNqRSxBQUFTLFVBQUMsQUFBRyxLQUFFLElBQUksQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsR0FBRSxBQUFRLFNBQUMsQUFBQyxBQUFDLEFBQUMsQUFBQztBQUMzRSxpQkFBSyxBQUFTLFVBQUMsQUFBSTtBQUNqQixBQUFNLHVCQUFDLEFBQVMsVUFBQyxBQUFHLEtBQUUsSUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEFBQUMsQUFBQyxPQUN6RCxBQUFTLFVBQUMsQUFBRyxLQUFFLElBQUksQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsR0FBRSxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsQUFBQyxBQUFDLE9BQ2pFLEFBQVMsVUFBQyxBQUFHLEtBQUUsSUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxHQUFFLEFBQVEsU0FBQyxBQUFDLEFBQUMsQUFBQyxPQUM3RCxBQUFTLFVBQUMsQUFBRyxLQUFFLElBQUksQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsR0FBRSxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsQUFBQyxBQUFDLE9BQ2pFLEFBQVMsVUFBQyxBQUFHLEtBQUUsSUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEFBQUMsQUFBQyxBQUFDO0FBQzNFLGlCQUFLLEFBQVMsVUFBQyxBQUFJO0FBQ2pCLEFBQU0sdUJBQUMsQUFBUyxVQUFDLEFBQUcsS0FBRSxJQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUMsR0FBRSxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsQUFBQyxBQUFDLE9BQ3pELEFBQVMsVUFBQyxBQUFHLEtBQUUsSUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxHQUFFLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxBQUFDLEFBQUMsT0FDakUsQUFBUyxVQUFDLEFBQUcsS0FBRSxJQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsQUFBQyxBQUFDLE9BQzdELEFBQVMsVUFBQyxBQUFHLEtBQUUsSUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxH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LEFBQVMsVUFBQyxBQUFLLE1BQUMsQUFBSSxBQUFDLEFBQUMsT0FBQyxBQUFDO0FBQ2hDLEFBQU0sdUJBQUMsQUFBRSxBQUFDLEFBQ1o7QUFBQztBQUVELGdCQUFJLEFBQU0sU0FBRyxBQUFFO0FBRWYsQUFBSSxpQkFBQyxBQUFTLFVBQUMsQUFBSyxNQUFDLEFBQUksQUFBQyxNQUFDLEFBQU8sUUFBQyxVQUFDLEFBQVE7QUFDMUMsQUFBTSx1QkFBQyxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFLLEFBQUMsQUFBQyxBQUFDLEFBQ3hDO0FBQUMsQUFBQyxBQUFDO0FBQ0gsQUFBTSxtQkFBQyxBQUFNLEFBQUMsQUFDaEI7QUFBQyxBQUNILEFBQUM7Ozs7OztBQWxGWSxRQUFZLGVBa0Z4Qjs7Ozs7Ozs7OztBQzdGRCxpQkFBYyxBQUFnQixBQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcbmltcG9ydCAqIGFzIE1hcCBmcm9tICcuL21hcCc7XG5cbmNsYXNzIENvbnNvbGUge1xuICBwcml2YXRlIF93aWR0aDogbnVtYmVyO1xuICBnZXQgd2lkdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3dpZHRoO1xuICB9XG4gIHByaXZhdGUgX2hlaWdodDogbnVtYmVyO1xuICBnZXQgaGVpZ2h0KCkge1xuICAgIHJldHVybiB0aGlzLl9oZWlnaHQ7XG4gIH1cblxuICBwcml2YXRlIF90ZXh0OiBudW1iZXJbXVtdO1xuICBnZXQgdGV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy5fdGV4dDtcbiAgfVxuICBwcml2YXRlIF9mb3JlOiBDb3JlLkNvbG9yW11bXTtcbiAgZ2V0IGZvcmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZvcmU7XG4gIH1cbiAgcHJpdmF0ZSBfYmFjazogQ29yZS5Db2xvcltdW107XG4gIGdldCBiYWNrKCkge1xuICAgIHJldHVybiB0aGlzLl9iYWNrO1xuICB9XG4gIHByaXZhdGUgX2lzRGlydHk6IGJvb2xlYW5bXVtdO1xuICBnZXQgaXNEaXJ0eSgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNEaXJ0eTtcbiAgfVxuXG4gIHByaXZhdGUgZGVmYXVsdEJhY2tncm91bmQ6IENvcmUuQ29sb3I7XG4gIHByaXZhdGUgZGVmYXVsdEZvcmVncm91bmQ6IENvcmUuQ29sb3I7XG5cbiAgY29uc3RydWN0b3Iod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGZvcmVncm91bmQ6IENvcmUuQ29sb3IgPSAweGZmZmZmZiwgYmFja2dyb3VuZDogQ29yZS5Db2xvciA9IDB4MDAwMDAwKSB7XG4gICAgdGhpcy5fd2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLl9oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICB0aGlzLmRlZmF1bHRCYWNrZ3JvdW5kID0gMHgwMDAwMDtcbiAgICB0aGlzLmRlZmF1bHRGb3JlZ3JvdW5kID0gMHhmZmZmZjtcblxuICAgIHRoaXMuX3RleHQgPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4PG51bWJlcj4odGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIE1hcC5HbHlwaC5DSEFSX1NQQUNFKTtcbiAgICB0aGlzLl9mb3JlID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeDxDb3JlLkNvbG9yPih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5kZWZhdWx0Rm9yZWdyb3VuZCk7XG4gICAgdGhpcy5fYmFjayA9IENvcmUuVXRpbHMuYnVpbGRNYXRyaXg8Q29yZS5Db2xvcj4odGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIHRoaXMuZGVmYXVsdEJhY2tncm91bmQpO1xuICAgIHRoaXMuX2lzRGlydHkgPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4PGJvb2xlYW4+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0cnVlKTtcbiAgfVxuXG4gIGNsZWFuQ2VsbCh4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgIHRoaXMuX2lzRGlydHlbeF1beV0gPSBmYWxzZTtcbiAgfVxuXG4gIHByaW50KHRleHQ6IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIsIGNvbG9yOiBDb3JlLkNvbG9yID0gMHhmZmZmZmYpIHtcbiAgICBsZXQgYmVnaW4gPSAwO1xuICAgIGxldCBlbmQgPSB0ZXh0Lmxlbmd0aDtcbiAgICBpZiAoeCArIGVuZCA+IHRoaXMud2lkdGgpIHtcbiAgICAgIGVuZCA9IHRoaXMud2lkdGggLSB4O1xuICAgIH1cbiAgICBpZiAoeCA8IDApIHtcbiAgICAgIGVuZCArPSB4O1xuICAgICAgeCA9IDA7XG4gICAgfVxuICAgIHRoaXMuc2V0Rm9yZWdyb3VuZChjb2xvciwgeCwgeSwgZW5kLCAxKTtcbiAgICBmb3IgKGxldCBpID0gYmVnaW47IGkgPCBlbmQ7ICsraSkge1xuICAgICAgdGhpcy5zZXRUZXh0KHRleHQuY2hhckNvZGVBdChpKSwgeCArIGksIHkpO1xuICAgIH1cbiAgfVxuXG4gIHNldFRleHQoYXNjaWk6IG51bWJlciB8IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIgPSAxLCBoZWlnaHQ6IG51bWJlciA9IDEpIHtcbiAgICBpZiAodHlwZW9mIGFzY2lpID09PSAnc3RyaW5nJykge1xuICAgICAgYXNjaWkgPSAoPHN0cmluZz5hc2NpaSkuY2hhckNvZGVBdCgwKTtcbiAgICB9XG4gICAgdGhpcy5zZXRNYXRyaXgodGhpcy5fdGV4dCwgYXNjaWksIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuICB9XG5cbiAgc2V0Rm9yZWdyb3VuZChjb2xvcjogQ29yZS5Db2xvciwgeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIgPSAxLCBoZWlnaHQ6IG51bWJlciA9IDEpIHtcbiAgICB0aGlzLnNldE1hdHJpeCh0aGlzLl9mb3JlLCBjb2xvciwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gIH1cblxuICBzZXRCYWNrZ3JvdW5kKGNvbG9yOiBDb3JlLkNvbG9yLCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciA9IDEsIGhlaWdodDogbnVtYmVyID0gMSkge1xuICAgIHRoaXMuc2V0TWF0cml4KHRoaXMuX2JhY2ssIGNvbG9yLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0TWF0cml4PFQ+KG1hdHJpeDogVFtdW10sIHZhbHVlOiBULCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICBmb3IgKGxldCBpID0geDsgaSA8IHggKyB3aWR0aDsgaSsrKSB7XG4gICAgICBmb3IgKGxldCBqID0geTsgaiA8IHkgKyBoZWlnaHQ7IGorKykge1xuICAgICAgICBpZiAobWF0cml4W2ldW2pdID09PSB2YWx1ZSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIG1hdHJpeFtpXVtqXSA9IHZhbHVlO1xuICAgICAgICB0aGlzLl9pc0RpcnR5W2ldW2pdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0ID0gQ29uc29sZTtcbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4vZW50aXRpZXMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2NvbXBvbmVudHMnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbGxlY3Rpb25zIGZyb20gJ3R5cGVzY3JpcHQtY29sbGVjdGlvbnMnO1xuaW1wb3J0ICogYXMgTWl4aW5zIGZyb20gJy4vbWl4aW5zJztcblxuaW1wb3J0IFBpeGlDb25zb2xlID0gcmVxdWlyZSgnLi9QaXhpQ29uc29sZScpO1xuaW1wb3J0IENvbnNvbGUgPSByZXF1aXJlKCcuL0NvbnNvbGUnKTtcblxuaW1wb3J0IElucHV0SGFuZGxlciA9IHJlcXVpcmUoJy4vSW5wdXRIYW5kbGVyJyk7XG5cbmltcG9ydCBTY2VuZSA9IHJlcXVpcmUoJy4vU2NlbmUnKTtcblxuaW50ZXJmYWNlIEZyYW1lUmVuZGVyZXIge1xuICAoZWxhcHNlZFRpbWU6IG51bWJlcik6IHZvaWQ7XG59XG5sZXQgcmVuZGVyZXI6IEZyYW1lUmVuZGVyZXI7XG5sZXQgZnJhbWVMb29wOiAoY2FsbGJhY2s6IChlbGFwc2VkVGltZTogbnVtYmVyKSA9PiB2b2lkKSA9PiB2b2lkO1xuXG5sZXQgZnJhbWVGdW5jID0gKGVsYXBzZWRUaW1lOiBudW1iZXIpID0+IHtcbiAgZnJhbWVMb29wKGZyYW1lRnVuYyk7XG4gIHJlbmRlcmVyKGVsYXBzZWRUaW1lKTtcbn1cblxubGV0IGxvb3AgPSAodGhlUmVuZGVyZXI6IEZyYW1lUmVuZGVyZXIpID0+IHtcbiAgcmVuZGVyZXIgPSB0aGVSZW5kZXJlcjtcbiAgZnJhbWVMb29wKGZyYW1lRnVuYyk7XG59XG5cbmNsYXNzIEVuZ2luZSBpbXBsZW1lbnRzIE1peGlucy5JRXZlbnRIYW5kbGVyIHtcbiAgLy8gRXZlbnRIYW5kbGVyIG1peGluXG4gIGxpc3RlbjogKGxpc3RlbmVyOiBFdmVudHMuTGlzdGVuZXIpID0+IEV2ZW50cy5MaXN0ZW5lcjtcbiAgcmVtb3ZlTGlzdGVuZXI6IChsaXN0ZW5lcjogRXZlbnRzLkxpc3RlbmVyKSA9PiB2b2lkO1xuICBlbWl0OiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gdm9pZDtcbiAgZmlyZTogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IGFueTtcbiAgaXM6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiBib29sZWFuO1xuICBnYXRoZXI6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiBhbnlbXTtcblxuICBwcml2YXRlIHBpeGlDb25zb2xlOiBQaXhpQ29uc29sZTtcblxuICBwcml2YXRlIGdhbWVUaW1lOiBudW1iZXIgPSAwO1xuICBwcml2YXRlIGVuZ2luZVRpY2tzUGVyU2Vjb25kOiBudW1iZXIgPSAxMDtcbiAgcHJpdmF0ZSBlbmdpbmVUaWNrTGVuZ3RoOiBudW1iZXIgPSAxMDA7XG4gIHByaXZhdGUgZWxhcHNlZFRpbWU6IG51bWJlciA9IDA7XG4gIHByaXZhdGUgdGltZUhhbmRsZXJDb21wb25lbnQ6IENvbXBvbmVudHMuVGltZUhhbmRsZXJDb21wb25lbnQ7XG5cbiAgcHJpdmF0ZSB3aWR0aDogbnVtYmVyO1xuICBwcml2YXRlIGhlaWdodDogbnVtYmVyO1xuICBwcml2YXRlIGNhbnZhc0lkOiBzdHJpbmc7XG5cbiAgcHJpdmF0ZSBlbnRpdGllczoge1tndWlkOiBzdHJpbmddOiBFbnRpdGllcy5FbnRpdHl9O1xuICBwcml2YXRlIHRvRGVzdHJveTogRW50aXRpZXMuRW50aXR5W107XG5cbiAgcHJpdmF0ZSBwYXVzZWQ6IGJvb2xlYW47XG5cbiAgcHJpdmF0ZSBfaW5wdXRIYW5kbGVyOiBJbnB1dEhhbmRsZXI7XG4gIGdldCBpbnB1dEhhbmRsZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lucHV0SGFuZGxlcjtcbiAgfVxuXG4gIHByaXZhdGUgX2N1cnJlbnRTY2VuZTogU2NlbmU7XG4gIGdldCBjdXJyZW50U2NlbmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRTY2VuZTtcbiAgfVxuXG4gIHB1YmxpYyBjdXJyZW50VGljazogbnVtYmVyO1xuICBwdWJsaWMgY3VycmVudFR1cm46IG51bWJlcjtcblxuICBjb25zdHJ1Y3Rvcih3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgY2FudmFzSWQ6IHN0cmluZykge1xuICAgIHRoaXMucGF1c2VkID0gZmFsc2U7XG5cbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5jYW52YXNJZCA9IGNhbnZhc0lkO1xuXG4gICAgdGhpcy5lbnRpdGllcyA9IHt9O1xuICAgIHRoaXMudG9EZXN0cm95ID0gW107XG5cbiAgICB0aGlzLmN1cnJlbnRUaWNrID0gMDtcbiAgICB0aGlzLmN1cnJlbnRUdXJuID0gMDtcblxuICAgIHRoaXMuZW5naW5lVGlja3NQZXJTZWNvbmQgPSAxMDtcbiAgICBmcmFtZUxvb3AgPSAoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAoPGFueT53aW5kb3cpLndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCAoPGFueT53aW5kb3cpLm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAoPGFueT53aW5kb3cpLm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgKDxhbnk+d2luZG93KS5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICBmdW5jdGlvbihjYWxsYmFjazogKGVsYXBzZWRUaW1lOiBudW1iZXIpID0+IHZvaWQpIHtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCwgbmV3IERhdGUoKS5nZXRUaW1lKCkpO1xuICAgICAgfTtcbiAgICB9KSgpO1xuXG4gICAgdGhpcy5lbmdpbmVUaWNrTGVuZ3RoID0gMTAwMCAvIHRoaXMuZW5naW5lVGlja3NQZXJTZWNvbmQ7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCAoKSA9PiB7XG4gICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICAgIH0pO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgKCkgPT4ge1xuICAgICAgdGhpcy5wYXVzZWQgPSB0cnVlO1xuICAgIH0pO1xuXG4gICAgdGhpcy5faW5wdXRIYW5kbGVyID0gbmV3IElucHV0SGFuZGxlcih0aGlzKTtcbiAgfVxuXG4gIHN0YXJ0KHNjZW5lOiBTY2VuZSkge1xuICAgIHRoaXMuX2N1cnJlbnRTY2VuZSA9IHNjZW5lO1xuICAgIHRoaXMuX2N1cnJlbnRTY2VuZS5zdGFydCgpO1xuXG4gICAgbGV0IHRpbWVLZWVwZXIgPSBuZXcgRW50aXRpZXMuRW50aXR5KHRoaXMsICd0aW1lS2VlcGVyJyk7XG4gICAgdGhpcy50aW1lSGFuZGxlckNvbXBvbmVudCA9IG5ldyBDb21wb25lbnRzLlRpbWVIYW5kbGVyQ29tcG9uZW50KHRoaXMpO1xuICAgIHRpbWVLZWVwZXIuYWRkQ29tcG9uZW50KHRoaXMudGltZUhhbmRsZXJDb21wb25lbnQpO1xuXG4gICAgdGhpcy5waXhpQ29uc29sZSA9IG5ldyBQaXhpQ29uc29sZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5jYW52YXNJZCwgMHhmZmZmZmYsIDB4MDAwMDAwKTtcbiAgICBsb29wKCh0aW1lKSA9PiB7XG4gICAgICBpZiAodGhpcy5wYXVzZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5lbGFwc2VkVGltZSA9IHRpbWUgLSB0aGlzLmdhbWVUaW1lO1xuXG4gICAgICBpZiAodGhpcy5lbGFwc2VkVGltZSA+PSB0aGlzLmVuZ2luZVRpY2tMZW5ndGgpIHtcbiAgICAgICAgdGhpcy5nYW1lVGltZSA9IHRpbWU7XG4gICAgICAgIHRoaXMudGltZUhhbmRsZXJDb21wb25lbnQuZW5naW5lVGljayh0aGlzLmdhbWVUaW1lKTtcblxuICAgICAgICB0aGlzLmRlc3Ryb3lFbnRpdGllcygpO1xuXG4gICAgICAgIHNjZW5lLnJlbmRlcigoY29uc29sZTogQ29uc29sZSwgeDogbnVtYmVyLCB5OiBudW1iZXIpID0+IHtcbiAgICAgICAgICB0aGlzLnBpeGlDb25zb2xlLmJsaXQoY29uc29sZSwgeCwgeSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgdGhpcy5waXhpQ29uc29sZS5yZW5kZXIoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlZ2lzdGVyRW50aXR5KGVudGl0eTogRW50aXRpZXMuRW50aXR5KSB7XG4gICAgdGhpcy5lbnRpdGllc1tlbnRpdHkuZ3VpZF0gPSBlbnRpdHk7XG4gIH1cblxuICByZW1vdmVFbnRpdHkoZW50aXR5OiBFbnRpdGllcy5FbnRpdHkpIHtcbiAgICB0aGlzLnRvRGVzdHJveS5wdXNoKGVudGl0eSk7XG4gIH1cblxuICBwcml2YXRlIGRlc3Ryb3lFbnRpdGllcygpIHtcbiAgICB0aGlzLnRvRGVzdHJveS5mb3JFYWNoKChlbnRpdHkpID0+IHtcbiAgICAgIGVudGl0eS5kZXN0cm95KCk7XG4gICAgICB0aGlzLmVtaXQobmV3IEV2ZW50cy5FdmVudCgnZW50aXR5RGVzdHJveWVkJywge2VudGl0eTogZW50aXR5fSkpO1xuICAgICAgZGVsZXRlIHRoaXMuZW50aXRpZXNbZW50aXR5Lmd1aWRdO1xuICAgIH0pO1xuICAgIHRoaXMudG9EZXN0cm95ID0gW107XG4gIH1cblxuICBnZXRFbnRpdHkoZ3VpZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZW50aXRpZXNbZ3VpZF07XG4gIH1cbn1cblxuQ29yZS5VdGlscy5hcHBseU1peGlucyhFbmdpbmUsIFtNaXhpbnMuRXZlbnRIYW5kbGVyXSk7XG5cbmV4cG9ydCA9IEVuZ2luZTtcbiIsImV4cG9ydCBjbGFzcyBNaXNzaW5nQ29tcG9uZW50RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gIHB1YmxpYyBtZXNzYWdlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTWlzc2luZ0ltcGxlbWVudGF0aW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gIHB1YmxpYyBtZXNzYWdlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRW50aXR5T3ZlcmxhcEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuICBwdWJsaWMgbWVzc2FnZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvdWxkTm90R2VuZXJhdGVNYXAgZXh0ZW5kcyBFcnJvciB7XG4gIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gIHB1YmxpYyBtZXNzYWdlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgfVxufVxuIiwiaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4vRW5naW5lJyk7XG5cbmNsYXNzIElucHV0SGFuZGxlciB7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1BFUklPRDogbnVtYmVyID0gMTkwO1xuICBwdWJsaWMgc3RhdGljIEtFWV9MRUZUOiBudW1iZXIgPSAzNztcbiAgcHVibGljIHN0YXRpYyBLRVlfVVA6IG51bWJlciA9IDM4O1xuICBwdWJsaWMgc3RhdGljIEtFWV9SSUdIVDogbnVtYmVyID0gMzk7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0RPV046IG51bWJlciA9IDQwO1xuXG4gIHB1YmxpYyBzdGF0aWMgS0VZXzA6IG51bWJlciA9IDQ4O1xuICBwdWJsaWMgc3RhdGljIEtFWV8xOiBudW1iZXIgPSA0OTtcbiAgcHVibGljIHN0YXRpYyBLRVlfMjogbnVtYmVyID0gNTA7XG4gIHB1YmxpYyBzdGF0aWMgS0VZXzM6IG51bWJlciA9IDUxO1xuICBwdWJsaWMgc3RhdGljIEtFWV80OiBudW1iZXIgPSA1MjtcbiAgcHVibGljIHN0YXRpYyBLRVlfNTogbnVtYmVyID0gNTM7XG4gIHB1YmxpYyBzdGF0aWMgS0VZXzY6IG51bWJlciA9IDU0O1xuICBwdWJsaWMgc3RhdGljIEtFWV83OiBudW1iZXIgPSA1NTtcbiAgcHVibGljIHN0YXRpYyBLRVlfODogbnVtYmVyID0gNTY7XG4gIHB1YmxpYyBzdGF0aWMgS0VZXzk6IG51bWJlciA9IDU3O1xuXG4gIHB1YmxpYyBzdGF0aWMgS0VZX0E6IG51bWJlciA9IDY1O1xuICBwdWJsaWMgc3RhdGljIEtFWV9COiBudW1iZXIgPSA2NjtcbiAgcHVibGljIHN0YXRpYyBLRVlfQzogbnVtYmVyID0gNjc7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0Q6IG51bWJlciA9IDY4O1xuICBwdWJsaWMgc3RhdGljIEtFWV9FOiBudW1iZXIgPSA2OTtcbiAgcHVibGljIHN0YXRpYyBLRVlfRjogbnVtYmVyID1cdDcwO1xuICBwdWJsaWMgc3RhdGljIEtFWV9HOiBudW1iZXIgPVx0NzE7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0g6IG51bWJlciA9XHQ3MjtcbiAgcHVibGljIHN0YXRpYyBLRVlfSTogbnVtYmVyID1cdDczO1xuICBwdWJsaWMgc3RhdGljIEtFWV9KOiBudW1iZXIgPVx0NzQ7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0s6IG51bWJlciA9XHQ3NTtcbiAgcHVibGljIHN0YXRpYyBLRVlfTDogbnVtYmVyID1cdDc2O1xuICBwdWJsaWMgc3RhdGljIEtFWV9NOiBudW1iZXIgPVx0Nzc7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX046IG51bWJlciA9XHQ3ODtcbiAgcHVibGljIHN0YXRpYyBLRVlfTzogbnVtYmVyID1cdDc5O1xuICBwdWJsaWMgc3RhdGljIEtFWV9QOiBudW1iZXIgPVx0ODA7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1E6IG51bWJlciA9XHQ4MTtcbiAgcHVibGljIHN0YXRpYyBLRVlfUjogbnVtYmVyID1cdDgyO1xuICBwdWJsaWMgc3RhdGljIEtFWV9TOiBudW1iZXIgPVx0ODM7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1Q6IG51bWJlciA9XHQ4NDtcbiAgcHVibGljIHN0YXRpYyBLRVlfVTogbnVtYmVyID1cdDg1O1xuICBwdWJsaWMgc3RhdGljIEtFWV9WOiBudW1iZXIgPVx0ODY7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1c6IG51bWJlciA9XHQ4NztcbiAgcHVibGljIHN0YXRpYyBLRVlfWDogbnVtYmVyID1cdDg4O1xuICBwdWJsaWMgc3RhdGljIEtFWV9ZOiBudW1iZXIgPVx0ODk7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1o6IG51bWJlciA9XHQ5MDtcblxuICBwcml2YXRlIGxpc3RlbmVyczoge1trZXljb2RlOiBudW1iZXJdOiAoKCkgPT4gYW55KVtdfTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVuZ2luZTogRW5naW5lKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMgPSB7fTtcblxuICAgIHRoaXMucmVnaXN0ZXJMaXN0ZW5lcnMoKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLm9uS2V5RG93bi5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25LZXlEb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYgKHRoaXMubGlzdGVuZXJzW2V2ZW50LmtleUNvZGVdKSB7XG4gICAgICB0aGlzLmxpc3RlbmVyc1tldmVudC5rZXlDb2RlXS5mb3JFYWNoKChjYWxsYmFjaykgPT4ge1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGxpc3RlbihrZXljb2RlczogbnVtYmVyW10sIGNhbGxiYWNrOiAoKSA9PiBhbnkpIHtcbiAgICBrZXljb2Rlcy5mb3JFYWNoKChrZXljb2RlKSA9PiB7XG4gICAgICBpZiAoIXRoaXMubGlzdGVuZXJzW2tleWNvZGVdKSB7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzW2tleWNvZGVdID0gW107XG4gICAgICB9XG4gICAgICB0aGlzLmxpc3RlbmVyc1trZXljb2RlXS5wdXNoKGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgPSBJbnB1dEhhbmRsZXI7XG4iLCJpbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgRW50aXRpZXMgZnJvbSAnLi9lbnRpdGllcyc7XG5pbXBvcnQgKiBhcyBNYXAgZnJvbSAnLi9tYXAnO1xuXG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi9FbmdpbmUnKTtcbmltcG9ydCBDb25zb2xlID0gcmVxdWlyZSgnLi9Db25zb2xlJyk7XG5cbmNsYXNzIExvZ1ZpZXcge1xuICBwcml2YXRlIGN1cnJlbnRUdXJuOiBudW1iZXI7XG4gIHByaXZhdGUgbWVzc2FnZXM6IHt0dXJuOiBudW1iZXIsIG1lc3NhZ2U6IHN0cmluZ31bXTtcbiAgcHJpdmF0ZSBjb25zb2xlOiBDb25zb2xlO1xuICBwcml2YXRlIHBsYXllcjogRW50aXRpZXMuRW50aXR5O1xuICBwcml2YXRlIG1heE1lc3NhZ2VzOiBudW1iZXI7XG4gIHByaXZhdGUgZWZmZWN0czogYW55W107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlbmdpbmU6IEVuZ2luZSwgcHJpdmF0ZSB3aWR0aDogbnVtYmVyLCBwcml2YXRlIGhlaWdodDogbnVtYmVyLCBwbGF5ZXI6IEVudGl0aWVzLkVudGl0eSkge1xuICAgIHRoaXMucmVnaXN0ZXJMaXN0ZW5lcnMoKTtcblxuICAgIHRoaXMuY29uc29sZSA9IG5ldyBDb25zb2xlKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICB0aGlzLmN1cnJlbnRUdXJuID0gMTtcbiAgICB0aGlzLm1lc3NhZ2VzID0gW107XG4gICAgdGhpcy5tYXhNZXNzYWdlcyA9IHRoaXMuaGVpZ2h0IC0gMTtcblxuICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xuICAgIHRoaXMuZWZmZWN0cyA9IFtdO1xuICB9XG5cbiAgcHJpdmF0ZSByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICd0dXJuJyxcbiAgICAgIHRoaXMub25UdXJuLmJpbmQodGhpcylcbiAgICApKTtcblxuICAgIHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ21lc3NhZ2UnLFxuICAgICAgdGhpcy5vbk1lc3NhZ2UuYmluZCh0aGlzKVxuICAgICkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvblR1cm4oZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIHRoaXMuY3VycmVudFR1cm4gPSBldmVudC5kYXRhLmN1cnJlbnRUdXJuO1xuICAgIGlmICh0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+IDAgJiYgdGhpcy5tZXNzYWdlc1t0aGlzLm1lc3NhZ2VzLmxlbmd0aCAtIDFdLnR1cm4gPCB0aGlzLmN1cnJlbnRUdXJuIC0gMTApIHtcbiAgICAgIHRoaXMubWVzc2FnZXMucG9wKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnBsYXllcikge1xuICAgICAgdGhpcy5lZmZlY3RzID0gdGhpcy5wbGF5ZXIuZ2F0aGVyKG5ldyBFdmVudHMuRXZlbnQoJ2dldFN0YXR1c0VmZmVjdCcpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uTWVzc2FnZShldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LmRhdGEubWVzc2FnZSkge1xuICAgICAgdGhpcy5tZXNzYWdlcy51bnNoaWZ0KHtcbiAgICAgICAgdHVybjogdGhpcy5jdXJyZW50VHVybixcbiAgICAgICAgbWVzc2FnZTogZXZlbnQuZGF0YS5tZXNzYWdlXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMubWVzc2FnZXMubGVuZ3RoID4gdGhpcy5tYXhNZXNzYWdlcykge1xuICAgICAgdGhpcy5tZXNzYWdlcy5wb3AoKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoYmxpdEZ1bmN0aW9uOiBhbnkpIHtcbiAgICB0aGlzLmNvbnNvbGUuc2V0VGV4dCgnICcsIDAsIDAsIHRoaXMuY29uc29sZS53aWR0aCwgdGhpcy5jb25zb2xlLmhlaWdodCk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMud2lkdGg7IGkrKykge1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB0aGlzLmhlaWdodDsgaisrKSB7XG4gICAgICAgIGxldCBkcmF3biA9IGZhbHNlO1xuICAgICAgICBpZiAoaSA9PT0gMCAmJiBqID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5jb25zb2xlLnNldFRleHQoTWFwLkdseXBoLkNIQVJfU0UsIGksIGopO1xuICAgICAgICAgIGRyYXduID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChpID09PSB0aGlzLndpZHRoIC0gMSAmJiBqID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5jb25zb2xlLnNldFRleHQoTWFwLkdseXBoLkNIQVJfU1csIGksIGopO1xuICAgICAgICAgIGRyYXduID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChpID09PSB0aGlzLndpZHRoIC0gMSAmJiBqID09PSB0aGlzLmhlaWdodCAtIDEpIHtcbiAgICAgICAgICB0aGlzLmNvbnNvbGUuc2V0VGV4dChNYXAuR2x5cGguQ0hBUl9OVywgaSwgaik7XG4gICAgICAgICAgZHJhd24gPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGkgPT09IDAgJiYgaiA9PT0gdGhpcy5oZWlnaHQgLSAxKSB7XG4gICAgICAgICAgdGhpcy5jb25zb2xlLnNldFRleHQoTWFwLkdseXBoLkNIQVJfTkUsIGksIGopO1xuICAgICAgICAgIGRyYXduID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChpID09PSAwIHx8IGkgPT09IHRoaXMud2lkdGggLSAxKSB7XG4gICAgICAgICAgdGhpcy5jb25zb2xlLnNldFRleHQoTWFwLkdseXBoLkNIQVJfVkxJTkUsIGksIGopO1xuICAgICAgICAgIGRyYXduID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChqID09PSAwIHx8IGogPT09ICh0aGlzLmhlaWdodCAtIDEpKSB7XG4gICAgICAgICAgdGhpcy5jb25zb2xlLnNldFRleHQoTWFwLkdseXBoLkNIQVJfSExJTkUsIGksIGopO1xuICAgICAgICAgIGRyYXduID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZHJhd24pIHtcbiAgICAgICAgICB0aGlzLmNvbnNvbGUuc2V0Rm9yZWdyb3VuZCgweGZmZmZmZiwgaSwgaik7XG4gICAgICAgICAgdGhpcy5jb25zb2xlLnNldEJhY2tncm91bmQoMHgwMDAwMDAsIGksIGopO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jb25zb2xlLnByaW50KCdUdXJuOiAnICsgdGhpcy5jdXJyZW50VHVybiwgdGhpcy53aWR0aCAtIDEwLCAxLCAweGZmZmZmZik7XG4gICAgaWYgKHRoaXMuZWZmZWN0cy5sZW5ndGggPiAwKSB7XG4gICAgICBsZXQgc3RyID0gdGhpcy5lZmZlY3RzLnJlZHVjZSgoYWNjLCBlZmZlY3QsIGlkeCkgPT4ge1xuICAgICAgICByZXR1cm4gYWNjICsgZWZmZWN0Lm5hbWUgKyAoaWR4ICE9PSB0aGlzLmVmZmVjdHMubGVuZ3RoIC0gMSA/ICcsICcgOiAnJyk7XG4gICAgICB9LCAnRWZmZWN0czogJyk7XG4gICAgICB0aGlzLmNvbnNvbGUucHJpbnQoc3RyLCAxLCAxLCAweGZmZmZmZik7XG4gICAgfVxuICAgIGlmICh0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMubWVzc2FnZXMuZm9yRWFjaCgoZGF0YSwgaWR4KSA9PiB7XG4gICAgICAgIGxldCBjb2xvciA9IDB4ZmZmZmZmO1xuICAgICAgICBpZiAoZGF0YS50dXJuIDwgdGhpcy5jdXJyZW50VHVybiAtIDUpIHtcbiAgICAgICAgICBjb2xvciA9IDB4NjY2NjY2O1xuICAgICAgICB9IGVsc2UgaWYgKGRhdGEudHVybiA8IHRoaXMuY3VycmVudFR1cm4gLSAyKSB7XG4gICAgICAgICAgY29sb3IgPSAweGFhYWFhYTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnNvbGUucHJpbnQoZGF0YS5tZXNzYWdlLCAxLCB0aGlzLmhlaWdodCAtIChpZHggKyAxKSwgY29sb3IpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGJsaXRGdW5jdGlvbih0aGlzLmNvbnNvbGUpO1xuICB9XG59XG5cbmV4cG9ydCA9IExvZ1ZpZXc7XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4vY29yZSc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vY29tcG9uZW50cyc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuL2VudGl0aWVzJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBNYXAgZnJvbSAnLi9tYXAnO1xuXG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi9FbmdpbmUnKTtcbmltcG9ydCBDb25zb2xlID0gcmVxdWlyZSgnLi9Db25zb2xlJyk7XG5cbmNsYXNzIE1hcFZpZXcge1xuICBwcml2YXRlIHJlbmRlcmFibGVFbnRpdGllczogKHtndWlkOiBzdHJpbmcsIHJlbmRlcmFibGU6IENvbXBvbmVudHMuUmVuZGVyYWJsZUNvbXBvbmVudCwgcGh5c2ljczogQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50fSlbXTtcbiAgcHJpdmF0ZSByZW5kZXJhYmxlSXRlbXM6ICh7Z3VpZDogc3RyaW5nLCByZW5kZXJhYmxlOiBDb21wb25lbnRzLlJlbmRlcmFibGVDb21wb25lbnQsIHBoeXNpY3M6IENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudH0pW107XG4gIHByaXZhdGUgY29uc29sZTogQ29uc29sZTtcblxuICBwcml2YXRlIHZpZXdFbnRpdHk6IEVudGl0aWVzLkVudGl0eTtcblxuICBwcml2YXRlIGxpZ2h0TWFwOiBudW1iZXJbXVtdO1xuICBwcml2YXRlIGZvdkNhbGN1bGF0b3I6IE1hcC5Gb1Y7XG5cbiAgcHJpdmF0ZSBoYXNTZWVuOiBib29sZWFuW11bXTtcblxuICBwcml2YXRlIGZvZ09mV2FyQ29sb3I6IENvcmUuQ29sb3I7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlbmdpbmU6IEVuZ2luZSwgcHJpdmF0ZSBtYXA6IE1hcC5NYXAsIHByaXZhdGUgd2lkdGg6IG51bWJlciwgcHJpdmF0ZSBoZWlnaHQ6IG51bWJlcikge1xuICAgIHRoaXMuZm9nT2ZXYXJDb2xvciA9IDB4OTk5OWFhO1xuICAgIHRoaXMucmVnaXN0ZXJMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLmNvbnNvbGUgPSBuZXcgQ29uc29sZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgdGhpcy5yZW5kZXJhYmxlRW50aXRpZXMgPSBbXTtcbiAgICB0aGlzLnJlbmRlcmFibGVJdGVtcyA9IFtdO1xuICAgIHRoaXMudmlld0VudGl0eSA9IG51bGw7XG4gICAgdGhpcy5mb3ZDYWxjdWxhdG9yID0gbnVsbDtcbiAgICB0aGlzLmxpZ2h0TWFwID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeDxudW1iZXI+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCAwKTtcbiAgICB0aGlzLmhhc1NlZW4gPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4PGJvb2xlYW4+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCBmYWxzZSk7XG4gIH1cblxuICBzZXRWaWV3RW50aXR5KGVudGl0eTogRW50aXRpZXMuRW50aXR5KSB7XG4gICAgdGhpcy5oYXNTZWVuID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeDxib29sZWFuPih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgZmFsc2UpO1xuXG4gICAgdGhpcy52aWV3RW50aXR5ID0gZW50aXR5O1xuICAgIHRoaXMudmlld0VudGl0eS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdtb3ZlJyxcbiAgICAgIHRoaXMub25WaWV3RW50aXR5TW92ZS5iaW5kKHRoaXMpXG4gICAgKSk7XG5cbiAgICB0aGlzLmZvdkNhbGN1bGF0b3IgPSBuZXcgTWFwLkZvVihcbiAgICAgIChwb3M6IENvcmUuUG9zaXRpb24pID0+IHtcbiAgICAgICAgbGV0IHRpbGUgPSB0aGlzLm1hcC5nZXRUaWxlKHBvcyk7XG4gICAgICAgIHJldHVybiAhdGlsZS5ibG9ja3NTaWdodDsgIFxuICAgICAgfSxcbiAgICAgIHRoaXMubWFwLndpZHRoLFxuICAgICAgdGhpcy5tYXAuaGVpZ2h0LFxuICAgICAgMjAgXG4gICAgKTtcblxuICAgIHRoaXMub25WaWV3RW50aXR5TW92ZShudWxsKTtcbiAgfVxuXG4gIHByaXZhdGUgb25WaWV3RW50aXR5TW92ZShldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgbGV0IHBvczogQ29yZS5Qb3NpdGlvbiA9ICg8Q29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50PnRoaXMudmlld0VudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KSkucG9zaXRpb247XG5cbiAgICB0aGlzLmxpZ2h0TWFwID0gdGhpcy5mb3ZDYWxjdWxhdG9yLmNhbGN1bGF0ZShwb3MpO1xuXG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICBpZiAodGhpcy5saWdodE1hcFt4XVt5XSA+IDApIHtcbiAgICAgICAgICB0aGlzLmhhc1NlZW5beF1beV0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdyZW5kZXJhYmxlQ29tcG9uZW50Q3JlYXRlZCcsXG4gICAgICB0aGlzLm9uUmVuZGVyYWJsZUNvbXBvbmVudENyZWF0ZWQuYmluZCh0aGlzKVxuICAgICkpO1xuICAgIHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ3JlbmRlcmFibGVDb21wb25lbnREZXN0cm95ZWQnLFxuICAgICAgdGhpcy5vblJlbmRlcmFibGVDb21wb25lbnREZXN0cm95ZWQuYmluZCh0aGlzKVxuICAgICkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvblJlbmRlcmFibGVDb21wb25lbnREZXN0cm95ZWQoZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGNvbnN0IHBoeXNpY3MgPSA8Q29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50PmV2ZW50LmRhdGEuZW50aXR5LmdldENvbXBvbmVudChDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQpO1xuICAgIGxldCBpZHggPSBudWxsO1xuXG4gICAgaWYgKHBoeXNpY3MuYmxvY2tpbmcpIHtcbiAgICAgIGlkeCA9IHRoaXMucmVuZGVyYWJsZUVudGl0aWVzLmZpbmRJbmRleCgoZW50aXR5KSA9PiB7XG4gICAgICAgIHJldHVybiBlbnRpdHkuZ3VpZCA9PT0gZXZlbnQuZGF0YS5lbnRpdHkuZ3VpZDtcbiAgICAgIH0pO1xuICAgICAgaWYgKGlkeCAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnJlbmRlcmFibGVFbnRpdGllcy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWR4ID0gdGhpcy5yZW5kZXJhYmxlSXRlbXMuZmluZEluZGV4KChlbnRpdHkpID0+IHtcbiAgICAgICAgcmV0dXJuIGVudGl0eS5ndWlkID09PSBldmVudC5kYXRhLmVudGl0eS5ndWlkO1xuICAgICAgfSk7XG4gICAgICBpZiAoaWR4ICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMucmVuZGVyYWJsZUl0ZW1zLnNwbGljZShpZHgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25SZW5kZXJhYmxlQ29tcG9uZW50Q3JlYXRlZChldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgY29uc3QgcGh5c2ljcyA9IDxDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ+ZXZlbnQuZGF0YS5lbnRpdHkuZ2V0Q29tcG9uZW50KENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCk7XG5cbiAgICBpZiAocGh5c2ljcy5ibG9ja2luZykge1xuICAgICAgdGhpcy5yZW5kZXJhYmxlRW50aXRpZXMucHVzaCh7XG4gICAgICAgIGd1aWQ6IGV2ZW50LmRhdGEuZW50aXR5Lmd1aWQsXG4gICAgICAgIHJlbmRlcmFibGU6IGV2ZW50LmRhdGEucmVuZGVyYWJsZUNvbXBvbmVudCxcbiAgICAgICAgcGh5c2ljczogcGh5c2ljc1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVuZGVyYWJsZUl0ZW1zLnB1c2goe1xuICAgICAgICBndWlkOiBldmVudC5kYXRhLmVudGl0eS5ndWlkLFxuICAgICAgICByZW5kZXJhYmxlOiBldmVudC5kYXRhLnJlbmRlcmFibGVDb21wb25lbnQsXG4gICAgICAgIHBoeXNpY3M6IHBoeXNpY3NcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcihibGl0RnVuY3Rpb246IGFueSkge1xuICAgIHRoaXMucmVuZGVyTWFwKHRoaXMuY29uc29sZSk7XG4gICAgYmxpdEZ1bmN0aW9uKHRoaXMuY29uc29sZSk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlck1hcChjb25zb2xlOiBDb25zb2xlKSB7XG4gICAgaWYgKHRoaXMudmlld0VudGl0eSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnJlbmRlckJhY2tncm91bmQoY29uc29sZSk7XG4gICAgdGhpcy5yZW5kZXJJdGVtcyhjb25zb2xlKTtcbiAgICB0aGlzLnJlbmRlckVudGl0aWVzKGNvbnNvbGUpO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJFbnRpdGllcyhjb25zb2xlOiBDb25zb2xlKSB7XG4gICAgdGhpcy5yZW5kZXJhYmxlRW50aXRpZXMuZm9yRWFjaCgoZGF0YSkgPT4ge1xuICAgICAgaWYgKGRhdGEucmVuZGVyYWJsZSAmJiBkYXRhLnBoeXNpY3MpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJHbHlwaChjb25zb2xlLCBkYXRhLnJlbmRlcmFibGUuZ2x5cGgsIGRhdGEucGh5c2ljcy5wb3NpdGlvbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckl0ZW1zKGNvbnNvbGU6IENvbnNvbGUpIHtcbiAgICB0aGlzLnJlbmRlcmFibGVJdGVtcy5mb3JFYWNoKChkYXRhKSA9PiB7XG4gICAgICBpZiAoZGF0YS5yZW5kZXJhYmxlICYmIGRhdGEucGh5c2ljcykge1xuICAgICAgICB0aGlzLnJlbmRlckdseXBoKGNvbnNvbGUsIGRhdGEucmVuZGVyYWJsZS5nbHlwaCwgZGF0YS5waHlzaWNzLnBvc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyR2x5cGgoY29uc29sZTogQ29uc29sZSwgZ2x5cGg6IE1hcC5HbHlwaCwgcG9zaXRpb246IENvcmUuUG9zaXRpb24pIHtcbiAgICBpZiAoIXRoaXMuaXNWaXNpYmxlKHBvc2l0aW9uKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zb2xlLnNldFRleHQoZ2x5cGguZ2x5cGgsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xuICAgIGNvbnNvbGUuc2V0Rm9yZWdyb3VuZChnbHlwaC5mb3JlZ3JvdW5kQ29sb3IsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJCYWNrZ3JvdW5kKGNvbnNvbGU6IENvbnNvbGUpIHtcbiAgICB0aGlzLm1hcC5mb3JFYWNoKChwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbiwgdGlsZTogTWFwLlRpbGUpID0+IHtcbiAgICAgIGxldCBnbHlwaCA9IHRpbGUuZ2x5cGg7XG4gICAgICBpZiAoIXRoaXMuaXNWaXNpYmxlKHBvc2l0aW9uKSkge1xuICAgICAgICBpZiAodGhpcy5oYXNTZWVuW3Bvc2l0aW9uLnhdW3Bvc2l0aW9uLnldKSB7XG4gICAgICAgICAgZ2x5cGggPSBuZXcgTWFwLkdseXBoKFxuICAgICAgICAgICAgZ2x5cGguZ2x5cGgsXG4gICAgICAgICAgICBDb3JlLkNvbG9yVXRpbHMuY29sb3JNdWx0aXBseShnbHlwaC5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuZm9nT2ZXYXJDb2xvciksXG4gICAgICAgICAgICBDb3JlLkNvbG9yVXRpbHMuY29sb3JNdWx0aXBseShnbHlwaC5iYWNrZ3JvdW5kQ29sb3IsIHRoaXMuZm9nT2ZXYXJDb2xvcilcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGdseXBoID0gbmV3IE1hcC5HbHlwaChNYXAuR2x5cGguQ0hBUl9GVUxMLCAweDExMTExMSwgMHgxMTExMTEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zb2xlLnNldFRleHQoZ2x5cGguZ2x5cGgsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xuICAgICAgY29uc29sZS5zZXRGb3JlZ3JvdW5kKGdseXBoLmZvcmVncm91bmRDb2xvciwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XG4gICAgICBjb25zb2xlLnNldEJhY2tncm91bmQoZ2x5cGguYmFja2dyb3VuZENvbG9yLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgaXNWaXNpYmxlKHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uKSB7XG4gICAgcmV0dXJuIHRoaXMubGlnaHRNYXBbcG9zaXRpb24ueF1bcG9zaXRpb24ueV0gPT09IDE7XG4gIH1cbn1cblxuZXhwb3J0ID0gTWFwVmlldztcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9Jy4uL3R5cGluZ3MvaW5kZXguZC50cycgLz5cblxuaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuL2NvcmUnO1xuaW1wb3J0ICogYXMgTWFwIGZyb20gJy4vbWFwJztcblxuaW1wb3J0IENvbnNvbGUgPSByZXF1aXJlKCcuL0NvbnNvbGUnKTtcblxuY2xhc3MgUGl4aUNvbnNvbGUge1xuICBwcml2YXRlIF93aWR0aDogbnVtYmVyO1xuICBwcml2YXRlIF9oZWlnaHQ6IG51bWJlcjtcblxuICBwcml2YXRlIGNhbnZhc0lkOiBzdHJpbmc7XG4gIHByaXZhdGUgdGV4dDogbnVtYmVyW11bXTtcbiAgcHJpdmF0ZSBmb3JlOiBDb3JlLkNvbG9yW11bXTtcbiAgcHJpdmF0ZSBiYWNrOiBDb3JlLkNvbG9yW11bXTtcbiAgcHJpdmF0ZSBpc0RpcnR5OiBib29sZWFuW11bXTtcblxuICBwcml2YXRlIHJlbmRlcmVyOiBhbnk7XG4gIHByaXZhdGUgc3RhZ2U6IFBJWEkuQ29udGFpbmVyO1xuXG4gIHByaXZhdGUgbG9hZGVkOiBib29sZWFuO1xuXG4gIHByaXZhdGUgY2hhcldpZHRoOiBudW1iZXI7XG4gIHByaXZhdGUgY2hhckhlaWdodDogbnVtYmVyO1xuXG4gIHByaXZhdGUgZm9udDogUElYSS5CYXNlVGV4dHVyZTtcbiAgcHJpdmF0ZSBjaGFyczogUElYSS5UZXh0dXJlW107XG5cbiAgcHJpdmF0ZSBmb3JlQ2VsbHM6IFBJWEkuU3ByaXRlW11bXTtcbiAgcHJpdmF0ZSBiYWNrQ2VsbHM6IFBJWEkuU3ByaXRlW11bXTtcblxuICBwcml2YXRlIGRlZmF1bHRCYWNrZ3JvdW5kOiBDb3JlLkNvbG9yO1xuICBwcml2YXRlIGRlZmF1bHRGb3JlZ3JvdW5kOiBDb3JlLkNvbG9yO1xuXG4gIHByaXZhdGUgY2FudmFzOiBhbnk7XG4gIHByaXZhdGUgdG9wTGVmdFBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBjYW52YXNJZDogc3RyaW5nLCBmb3JlZ3JvdW5kOiBDb3JlLkNvbG9yID0gMHhmZmZmZmYsIGJhY2tncm91bmQ6IENvcmUuQ29sb3IgPSAweDAwMDAwMCkge1xuICAgIHRoaXMuX3dpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5faGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgdGhpcy5jYW52YXNJZCA9IGNhbnZhc0lkO1xuXG4gICAgdGhpcy5sb2FkZWQgPSBmYWxzZTtcbiAgICB0aGlzLnN0YWdlID0gbmV3IFBJWEkuQ29udGFpbmVyKCk7XG5cbiAgICB0aGlzLmxvYWRGb250KCk7XG4gICAgdGhpcy5kZWZhdWx0QmFja2dyb3VuZCA9IDB4MDAwMDA7XG4gICAgdGhpcy5kZWZhdWx0Rm9yZWdyb3VuZCA9IDB4ZmZmZmY7XG5cbiAgICB0aGlzLnRleHQgPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4PG51bWJlcj4odGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIE1hcC5HbHlwaC5DSEFSX1NQQUNFKTtcbiAgICB0aGlzLmZvcmUgPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4PENvcmUuQ29sb3I+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0aGlzLmRlZmF1bHRGb3JlZ3JvdW5kKTtcbiAgICB0aGlzLmJhY2sgPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4PENvcmUuQ29sb3I+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0aGlzLmRlZmF1bHRCYWNrZ3JvdW5kKTtcbiAgICB0aGlzLmlzRGlydHkgPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4PGJvb2xlYW4+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0cnVlKTtcbiAgfVxuXG4gIGdldCBoZWlnaHQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5faGVpZ2h0O1xuICB9XG5cbiAgZ2V0IHdpZHRoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3dpZHRoO1xuICB9XG5cbiAgcHJpdmF0ZSBsb2FkRm9udCgpIHtcbiAgICBsZXQgZm9udFVybCA9ICcuL1RhbHJ5dGhfc3F1YXJlXzE1eDE1LnBuZyc7XG4gICAgdGhpcy5mb250ID0gUElYSS5CYXNlVGV4dHVyZS5mcm9tSW1hZ2UoZm9udFVybCwgZmFsc2UsIFBJWEkuU0NBTEVfTU9ERVMuTkVBUkVTVCk7XG4gICAgaWYgKHRoaXMuZm9udC5oYXNMb2FkZWQpIHtcbiAgICAgIHRoaXMub25Gb250TG9hZGVkKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZm9udC5vbignbG9hZGVkJywgdGhpcy5vbkZvbnRMb2FkZWQuYmluZCh0aGlzKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBvbkZvbnRMb2FkZWQoKSB7XG4gICAgdGhpcy5jaGFyV2lkdGggPSB0aGlzLmZvbnQud2lkdGggLyAxNjtcbiAgICB0aGlzLmNoYXJIZWlnaHQgPSB0aGlzLmZvbnQuaGVpZ2h0IC8gMTY7XG5cbiAgICB0aGlzLmluaXRDYW52YXMoKTtcbiAgICB0aGlzLmluaXRDaGFyYWN0ZXJNYXAoKTtcbiAgICB0aGlzLmluaXRCYWNrZ3JvdW5kQ2VsbHMoKTtcbiAgICB0aGlzLmluaXRGb3JlZ3JvdW5kQ2VsbHMoKTtcbiAgICB0aGlzLmxvYWRlZCA9IHRydWU7XG4gIH1cblxuICBwcml2YXRlIGluaXRDYW52YXMoKSB7XG4gICAgbGV0IGNhbnZhc1dpZHRoID0gdGhpcy53aWR0aCAqIHRoaXMuY2hhcldpZHRoO1xuICAgIGxldCBjYW52YXNIZWlnaHQgPSB0aGlzLmhlaWdodCAqIHRoaXMuY2hhckhlaWdodDtcblxuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5jYW52YXNJZCk7XG5cbiAgICBsZXQgcGl4aU9wdGlvbnMgPSB7XG4gICAgICBhbnRpYWxpYXM6IGZhbHNlLFxuICAgICAgY2xlYXJCZWZvcmVSZW5kZXI6IGZhbHNlLFxuICAgICAgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiBmYWxzZSxcbiAgICAgIHJlc29sdXRpb246IDEsXG4gICAgICB0cmFuc3BhcmVudDogZmFsc2UsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6IENvcmUuQ29sb3JVdGlscy50b051bWJlcih0aGlzLmRlZmF1bHRCYWNrZ3JvdW5kKSxcbiAgICAgIHZpZXc6IHRoaXMuY2FudmFzXG4gICAgfTtcbiAgICB0aGlzLnJlbmRlcmVyID0gUElYSS5hdXRvRGV0ZWN0UmVuZGVyZXIoY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCwgcGl4aU9wdGlvbnMpO1xuICAgIHRoaXMucmVuZGVyZXIuYmFja2dyb3VuZENvbG9yID0gQ29yZS5Db2xvclV0aWxzLnRvTnVtYmVyKHRoaXMuZGVmYXVsdEJhY2tncm91bmQpO1xuICAgIHRoaXMudG9wTGVmdFBvc2l0aW9uID0gbmV3IENvcmUuUG9zaXRpb24odGhpcy5jYW52YXMub2Zmc2V0TGVmdCwgdGhpcy5jYW52YXMub2Zmc2V0VG9wKTtcbiAgfVxuXG4gIHByaXZhdGUgaW5pdENoYXJhY3Rlck1hcCgpIHtcbiAgICB0aGlzLmNoYXJzID0gW107XG4gICAgZm9yICggbGV0IHggPSAwOyB4IDwgMTY7IHgrKykge1xuICAgICAgZm9yICggbGV0IHkgPSAwOyB5IDwgMTY7IHkrKykge1xuICAgICAgICBsZXQgcmVjdCA9IG5ldyBQSVhJLlJlY3RhbmdsZSh4ICogdGhpcy5jaGFyV2lkdGgsIHkgKiB0aGlzLmNoYXJIZWlnaHQsIHRoaXMuY2hhcldpZHRoLCB0aGlzLmNoYXJIZWlnaHQpO1xuICAgICAgICB0aGlzLmNoYXJzW3ggKyB5ICogMTZdID0gbmV3IFBJWEkuVGV4dHVyZSh0aGlzLmZvbnQsIHJlY3QpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaW5pdEJhY2tncm91bmRDZWxscygpIHtcbiAgICB0aGlzLmJhY2tDZWxscyA9IFtdO1xuICAgIGZvciAoIGxldCB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgdGhpcy5iYWNrQ2VsbHNbeF0gPSBbXTtcbiAgICAgIGZvciAoIGxldCB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgbGV0IGNlbGwgPSBuZXcgUElYSS5TcHJpdGUodGhpcy5jaGFyc1tNYXAuR2x5cGguQ0hBUl9GVUxMXSk7XG4gICAgICAgIGNlbGwucG9zaXRpb24ueCA9IHggKiB0aGlzLmNoYXJXaWR0aDtcbiAgICAgICAgY2VsbC5wb3NpdGlvbi55ID0geSAqIHRoaXMuY2hhckhlaWdodDtcbiAgICAgICAgY2VsbC53aWR0aCA9IHRoaXMuY2hhcldpZHRoO1xuICAgICAgICBjZWxsLmhlaWdodCA9IHRoaXMuY2hhckhlaWdodDtcbiAgICAgICAgY2VsbC50aW50ID0gQ29yZS5Db2xvclV0aWxzLnRvTnVtYmVyKHRoaXMuZGVmYXVsdEJhY2tncm91bmQpO1xuICAgICAgICB0aGlzLmJhY2tDZWxsc1t4XVt5XSA9IGNlbGw7XG4gICAgICAgIHRoaXMuc3RhZ2UuYWRkQ2hpbGQoY2VsbCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBpbml0Rm9yZWdyb3VuZENlbGxzKCkge1xuICAgIHRoaXMuZm9yZUNlbGxzID0gW107XG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgIHRoaXMuZm9yZUNlbGxzW3hdID0gW107XG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgbGV0IGNlbGwgPSBuZXcgUElYSS5TcHJpdGUodGhpcy5jaGFyc1tNYXAuR2x5cGguQ0hBUl9TUEFDRV0pO1xuICAgICAgICBjZWxsLnBvc2l0aW9uLnggPSB4ICogdGhpcy5jaGFyV2lkdGg7XG4gICAgICAgIGNlbGwucG9zaXRpb24ueSA9IHkgKiB0aGlzLmNoYXJIZWlnaHQ7XG4gICAgICAgIGNlbGwud2lkdGggPSB0aGlzLmNoYXJXaWR0aDtcbiAgICAgICAgY2VsbC5oZWlnaHQgPSB0aGlzLmNoYXJIZWlnaHQ7XG4gICAgICAgIGNlbGwudGludCA9IENvcmUuQ29sb3JVdGlscy50b051bWJlcih0aGlzLmRlZmF1bHRGb3JlZ3JvdW5kKTtcbiAgICAgICAgdGhpcy5mb3JlQ2VsbHNbeF1beV0gPSBjZWxsO1xuICAgICAgICB0aGlzLnN0YWdlLmFkZENoaWxkKGNlbGwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFkZEdyaWRPdmVybGF5KHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd2lkdGg7IGkrKykge1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBoZWlnaHQ7IGorKykge1xuICAgICAgICBsZXQgY2VsbCA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gICAgICAgIGNlbGwubGluZVN0eWxlKDEsIDB4NDQ0NDQ0LCAwLjUpO1xuICAgICAgICBjZWxsLmJlZ2luRmlsbCgwLCAwKTtcbiAgICAgICAgY2VsbC5kcmF3UmVjdCgoaSArIHgpICogdGhpcy5jaGFyV2lkdGgsIChqICsgeSkgKiB0aGlzLmNoYXJIZWlnaHQsIHRoaXMuY2hhcldpZHRoLCB0aGlzLmNoYXJIZWlnaHQpO1xuICAgICAgICB0aGlzLnN0YWdlLmFkZENoaWxkKGNlbGwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFkZEJvcmRlcih4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICBsZXQgY2VsbCA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gICAgY2VsbC5saW5lU3R5bGUoMSwgMHg0NDQ0NDQsIDAuNSk7XG4gICAgY2VsbC5iZWdpbkZpbGwoMCwgMCk7XG4gICAgY2VsbC5kcmF3UmVjdCh4ICogdGhpcy5jaGFyV2lkdGgsIHkgKiB0aGlzLmNoYXJIZWlnaHQsIHggKiB3aWR0aCAqIHRoaXMuY2hhcldpZHRoLCB5ICogaGVpZ2h0ICogdGhpcy5jaGFySGVpZ2h0KTtcbiAgICB0aGlzLnN0YWdlLmFkZENoaWxkKGNlbGwpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGlmICh0aGlzLmxvYWRlZCkge1xuICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zdGFnZSk7XG4gICAgfVxuICB9XG5cbiAgYmxpdChjb25zb2xlOiBDb25zb2xlLCBvZmZzZXRYOiBudW1iZXIgPSAwLCBvZmZzZXRZOiBudW1iZXIgPSAwLCBmb3JjZURpcnR5OiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBpZiAoIXRoaXMubG9hZGVkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgY29uc29sZS53aWR0aDsgeCsrKSB7XG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IGNvbnNvbGUuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgaWYgKGZvcmNlRGlydHkgfHwgY29uc29sZS5pc0RpcnR5W3hdW3ldKSB7XG4gICAgICAgICAgbGV0IGFzY2lpID0gY29uc29sZS50ZXh0W3hdW3ldO1xuICAgICAgICAgIGxldCBweCA9IG9mZnNldFggKyB4O1xuICAgICAgICAgIGxldCBweSA9IG9mZnNldFkgKyB5O1xuICAgICAgICAgIGlmIChhc2NpaSA+IDAgJiYgYXNjaWkgPD0gMjU1KSB7XG4gICAgICAgICAgICB0aGlzLmZvcmVDZWxsc1tweF1bcHldLnRleHR1cmUgPSB0aGlzLmNoYXJzW2FzY2lpXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5mb3JlQ2VsbHNbcHhdW3B5XS50aW50ID0gQ29yZS5Db2xvclV0aWxzLnRvTnVtYmVyKGNvbnNvbGUuZm9yZVt4XVt5XSk7XG4gICAgICAgICAgdGhpcy5iYWNrQ2VsbHNbcHhdW3B5XS50aW50ID0gQ29yZS5Db2xvclV0aWxzLnRvTnVtYmVyKGNvbnNvbGUuYmFja1t4XVt5XSk7XG4gICAgICAgICAgY29uc29sZS5jbGVhbkNlbGwoeCwgeSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRQb3NpdGlvbkZyb21QaXhlbHMoeDogbnVtYmVyLCB5OiBudW1iZXIpIDogQ29yZS5Qb3NpdGlvbiB7XG4gICAgaWYgKCF0aGlzLmxvYWRlZCkge1xuICAgICAgcmV0dXJuIG5ldyBDb3JlLlBvc2l0aW9uKC0xLCAtMSk7XG4gICAgfSBcbiAgICBsZXQgZHg6IG51bWJlciA9IHggLSB0aGlzLnRvcExlZnRQb3NpdGlvbi54O1xuICAgIGxldCBkeTogbnVtYmVyID0geSAtIHRoaXMudG9wTGVmdFBvc2l0aW9uLnk7XG4gICAgbGV0IHJ4ID0gTWF0aC5mbG9vcihkeCAvIHRoaXMuY2hhcldpZHRoKTtcbiAgICBsZXQgcnkgPSBNYXRoLmZsb29yKGR5IC8gdGhpcy5jaGFySGVpZ2h0KTtcbiAgICByZXR1cm4gbmV3IENvcmUuUG9zaXRpb24ocngsIHJ5KTtcbiAgfVxufVxuXG5leHBvcnQgPSBQaXhpQ29uc29sZTtcbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vY29tcG9uZW50cyc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuL2VudGl0aWVzJztcbmltcG9ydCAqIGFzIE1hcCBmcm9tICcuL21hcCc7XG5cbmltcG9ydCAqIGFzIEV4Y2VwdGlvbnMgZnJvbSAnLi9FeGNlcHRpb25zJztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4vRW5naW5lJyk7XG5pbXBvcnQgQ29uc29sZSA9IHJlcXVpcmUoJy4vQ29uc29sZScpO1xuXG5pbXBvcnQgTWFwVmlldyA9IHJlcXVpcmUoJy4vTWFwVmlldycpO1xuaW1wb3J0IExvZ1ZpZXcgPSByZXF1aXJlKCcuL0xvZ1ZpZXcnKTtcblxuY2xhc3MgU2NlbmUge1xuICBwcml2YXRlIF9lbmdpbmU6IEVuZ2luZTtcbiAgZ2V0IGVuZ2luZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5naW5lO1xuICB9XG5cbiAgcHJpdmF0ZSBfbWFwOiBNYXAuTWFwO1xuICBnZXQgbWFwKCkge1xuICAgIHJldHVybiB0aGlzLl9tYXA7XG4gIH1cblxuICBwcml2YXRlIHdpZHRoOiBudW1iZXI7XG4gIHByaXZhdGUgaGVpZ2h0OiBudW1iZXI7XG5cbiAgcHJpdmF0ZSBsb2dWaWV3OiBMb2dWaWV3O1xuICBwcml2YXRlIG1hcFZpZXc6IE1hcFZpZXc7XG5cbiAgcHJpdmF0ZSBwbGF5ZXI6IEVudGl0aWVzLkVudGl0eTtcblxuICBjb25zdHJ1Y3RvcihlbmdpbmU6IEVuZ2luZSwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICB0aGlzLl9lbmdpbmUgPSBlbmdpbmU7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gIH1cblxuICBzdGFydCgpIHtcbiAgICBDb3JlLlBvc2l0aW9uLnNldE1heFZhbHVlcyh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCAtIDUpO1xuICAgIGxldCBkdW5nZW9uR2VuZXJhdG9yID0gbmV3IE1hcC5EdW5nZW9uR2VuZXJhdG9yKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0IC0gNSk7XG4gICAgdGhpcy5fbWFwID0gZHVuZ2VvbkdlbmVyYXRvci5nZW5lcmF0ZSgpO1xuXG4gICAgdGhpcy5yZWdpc3Rlckxpc3RlbmVycygpO1xuXG4gICAgdGhpcy5tYXBWaWV3ID0gbmV3IE1hcFZpZXcodGhpcy5lbmdpbmUsIHRoaXMubWFwLCB0aGlzLm1hcC53aWR0aCwgdGhpcy5tYXAuaGVpZ2h0KTtcblxuICAgIHRoaXMuZ2VuZXJhdGVXaWx5KCk7XG4gICAgdGhpcy5nZW5lcmF0ZVJhdHMoKTtcblxuICAgIHRoaXMubG9nVmlldyA9IG5ldyBMb2dWaWV3KHRoaXMuZW5naW5lLCB0aGlzLndpZHRoLCA1LCB0aGlzLnBsYXllcik7XG5cbiAgICB0aGlzLm1hcFZpZXcuc2V0Vmlld0VudGl0eSh0aGlzLnBsYXllcik7XG5cbiAgfVxuXG4gIHByaXZhdGUgZ2VuZXJhdGVXaWx5KCkge1xuICAgIHRoaXMucGxheWVyID0gRW50aXRpZXMuY3JlYXRlV2lseSh0aGlzLmVuZ2luZSk7XG4gICAgdGhpcy5wb3NpdGlvbkVudGl0eSh0aGlzLnBsYXllcik7XG4gIH1cblxuICBwcml2YXRlIGdlbmVyYXRlUmF0cyhudW06IG51bWJlciA9IDEwKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW07IGkrKykge1xuICAgICAgdGhpcy5nZW5lcmF0ZVJhdCgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2VuZXJhdGVSYXQoKSB7XG4gICAgdGhpcy5wb3NpdGlvbkVudGl0eShFbnRpdGllcy5jcmVhdGVSYXQodGhpcy5lbmdpbmUpKTtcbiAgfVxuXG4gIHByaXZhdGUgcG9zaXRpb25FbnRpdHkoZW50aXR5OiBFbnRpdGllcy5FbnRpdHkpIHtcbiAgICBsZXQgY29tcG9uZW50ID0gPENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCk7XG4gICAgbGV0IHBvc2l0aW9uZWQgPSBmYWxzZTtcbiAgICBsZXQgdHJpZXMgPSAwO1xuICAgIGxldCBwb3NpdGlvbiA9IG51bGw7XG4gICAgd2hpbGUgKHRyaWVzIDwgMTAwMCAmJiAhcG9zaXRpb25lZCkge1xuICAgICAgcG9zaXRpb24gPSBDb3JlLlBvc2l0aW9uLmdldFJhbmRvbSgpO1xuICAgICAgcG9zaXRpb25lZCA9IHRoaXMuaXNXaXRob3V0RW50aXR5KHBvc2l0aW9uKTtcbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb25lZCkge1xuICAgICAgY29tcG9uZW50Lm1vdmVUbyhwb3NpdGlvbik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdpc1dpdGhvdXRFbnRpdHknLCBcbiAgICAgIHRoaXMub25Jc1dpdGhvdXRFbnRpdHkuYmluZCh0aGlzKVxuICAgICkpO1xuICAgIHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ21vdmVkRnJvbScsIFxuICAgICAgdGhpcy5vbk1vdmVkRnJvbS5iaW5kKHRoaXMpXG4gICAgKSk7XG4gICAgdGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAnbW92ZWRUbycsIFxuICAgICAgdGhpcy5vbk1vdmVkVG8uYmluZCh0aGlzKVxuICAgICkpO1xuICAgIHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ2dldFRpbGUnLCBcbiAgICAgIHRoaXMub25HZXRUaWxlLmJpbmQodGhpcylcbiAgICApKTtcbiAgfVxuXG4gIHByaXZhdGUgb25HZXRUaWxlKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBsZXQgcG9zaXRpb24gPSBldmVudC5kYXRhLnBvc2l0aW9uO1xuICAgIHJldHVybiB0aGlzLm1hcC5nZXRUaWxlKHBvc2l0aW9uKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Nb3ZlZEZyb20oZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGxldCB0aWxlID0gdGhpcy5tYXAuZ2V0VGlsZShldmVudC5kYXRhLnBoeXNpY3NDb21wb25lbnQucG9zaXRpb24pO1xuICAgIGlmICghZXZlbnQuZGF0YS5waHlzaWNzQ29tcG9uZW50LmJsb2NraW5nKSB7XG4gICAgICBkZWxldGUgdGlsZS5wcm9wc1tldmVudC5kYXRhLmVudGl0eS5ndWlkXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGlsZS5lbnRpdHkgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25Nb3ZlZFRvKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBsZXQgdGlsZSA9IHRoaXMubWFwLmdldFRpbGUoZXZlbnQuZGF0YS5waHlzaWNzQ29tcG9uZW50LnBvc2l0aW9uKTtcbiAgICBpZiAoIWV2ZW50LmRhdGEucGh5c2ljc0NvbXBvbmVudC5ibG9ja2luZykge1xuICAgICAgdGlsZS5wcm9wc1tldmVudC5kYXRhLmVudGl0eS5ndWlkXSA9IGV2ZW50LmRhdGEuZW50aXR5O1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGlsZS5lbnRpdHkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbnMuRW50aXR5T3ZlcmxhcEVycm9yKCdUd28gZW50aXRpZXMgY2Fubm90IGJlIGF0IHRoZSBzYW1lIHNwb3QnKTtcbiAgICAgIH1cbiAgICAgIHRpbGUuZW50aXR5ID0gZXZlbnQuZGF0YS5lbnRpdHk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBvbklzV2l0aG91dEVudGl0eShldmVudDogRXZlbnRzLkV2ZW50KTogYm9vbGVhbiB7XG4gICAgbGV0IHBvc2l0aW9uID0gZXZlbnQuZGF0YS5wb3NpdGlvbjtcbiAgICByZXR1cm4gdGhpcy5pc1dpdGhvdXRFbnRpdHkocG9zaXRpb24pO1xuICB9XG5cbiAgcHJpdmF0ZSBpc1dpdGhvdXRFbnRpdHkocG9zaXRpb246IENvcmUuUG9zaXRpb24pOiBib29sZWFuIHtcbiAgICBsZXQgdGlsZSA9IHRoaXMubWFwLmdldFRpbGUocG9zaXRpb24pO1xuICAgIHJldHVybiB0aWxlLndhbGthYmxlICYmIHRpbGUuZW50aXR5ID09PSBudWxsO1xuICB9XG5cbiAgcmVuZGVyKGJsaXRGdW5jdGlvbjogYW55KTogdm9pZCB7XG4gICAgdGhpcy5tYXBWaWV3LnJlbmRlcigoY29uc29sZTogQ29uc29sZSkgPT4ge1xuICAgICAgYmxpdEZ1bmN0aW9uKGNvbnNvbGUsIDAsIDApO1xuICAgIH0pO1xuICAgIHRoaXMubG9nVmlldy5yZW5kZXIoKGNvbnNvbGU6IENvbnNvbGUpID0+IHtcbiAgICAgIGJsaXRGdW5jdGlvbihjb25zb2xlLCAwLCB0aGlzLmhlaWdodCAtIDUpO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCA9IFNjZW5lO1xuIiwiaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4vRW5naW5lJyk7XG5pbXBvcnQgU2NlbmUgPSByZXF1aXJlKCcuL1NjZW5lJyk7XG5cbndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG4gIGxldCBlbmdpbmUgPSBuZXcgRW5naW5lKDYwLCA0MCwgJ3JvZ3VlJyk7XG4gIGxldCBzY2VuZSA9IG5ldyBTY2VuZShlbmdpbmUsIDYwLCA0MCk7XG4gIGVuZ2luZS5zdGFydChzY2VuZSk7XG59O1xuIiwiaW1wb3J0ICogYXMgRXhjZXB0aW9ucyBmcm9tICcuLi9FeGNlcHRpb25zJztcblxuZXhwb3J0IGNsYXNzIEFjdGlvbiB7XG4gIHByb3RlY3RlZCBjb3N0OiBudW1iZXIgPSAxMDA7XG4gIGFjdCgpOiBudW1iZXIge1xuICAgIHRocm93IG5ldyBFeGNlcHRpb25zLk1pc3NpbmdJbXBsZW1lbnRhdGlvbkVycm9yKCdBY3Rpb24uYWN0IG11c3QgYmUgb3ZlcndyaXR0ZW4nKTtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgRXhjZXB0aW9ucyBmcm9tICcuLi9FeGNlcHRpb25zJztcbmltcG9ydCAqIGFzIEJlaGF2aW91cnMgZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuLi9lbnRpdGllcyc7XG5cbmV4cG9ydCBjbGFzcyBCZWhhdmlvdXIge1xuICBwcm90ZWN0ZWQgbmV4dEFjdGlvbjogQmVoYXZpb3Vycy5BY3Rpb247XG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBlbnRpdHk6IEVudGl0aWVzLkVudGl0eSkge1xuICB9XG4gIGdldE5leHRBY3Rpb24oKTogQmVoYXZpb3Vycy5BY3Rpb24ge1xuICAgIHRocm93IG5ldyBFeGNlcHRpb25zLk1pc3NpbmdJbXBsZW1lbnRhdGlvbkVycm9yKCdCZWhhdmlvdXIuZ2V0TmV4dEFjdGlvbiBtdXN0IGJlIG92ZXJ3cml0dGVuJyk7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIEJlaGF2aW91cnMgZnJvbSAnLi9pbmRleCc7XG5cbmV4cG9ydCBjbGFzcyBOdWxsQWN0aW9uIGV4dGVuZHMgQmVoYXZpb3Vycy5BY3Rpb24ge1xuICBhY3QoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5jb3N0O1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBCZWhhdmlvdXJzIGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuLi9jb21wb25lbnRzJztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4uL2VudGl0aWVzJztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgUmFuZG9tV2Fsa0JlaGF2aW91ciBleHRlbmRzIEJlaGF2aW91cnMuQmVoYXZpb3VyIHtcbiAgcHJpdmF0ZSBwaHlzaWNzQ29tcG9uZW50OiBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ7XG5cbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIGVuZ2luZTogRW5naW5lLCBwcm90ZWN0ZWQgZW50aXR5OiBFbnRpdGllcy5FbnRpdHkpIHtcbiAgICBzdXBlcihlbnRpdHkpO1xuICAgIHRoaXMucGh5c2ljc0NvbXBvbmVudCA9IDxDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudChDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQpO1xuICB9XG5cbiAgZ2V0TmV4dEFjdGlvbigpOiBCZWhhdmlvdXJzLkFjdGlvbiB7XG4gICAgbGV0IHBvc2l0aW9ucyA9IENvcmUuVXRpbHMucmFuZG9taXplQXJyYXkoQ29yZS5Qb3NpdGlvbi5nZXROZWlnaGJvdXJzKHRoaXMucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbikpO1xuICAgIGxldCBpc1dpdGhvdXRFbnRpdHkgPSBmYWxzZTtcbiAgICBsZXQgcG9zaXRpb246IENvcmUuUG9zaXRpb24gPSBudWxsO1xuICAgIHdoaWxlKCFpc1dpdGhvdXRFbnRpdHkgJiYgcG9zaXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgIHBvc2l0aW9uID0gcG9zaXRpb25zLnBvcCgpO1xuICAgICAgaXNXaXRob3V0RW50aXR5ID0gdGhpcy5lbmdpbmUuaXMobmV3IEV2ZW50cy5FdmVudCgnaXNXaXRob3V0RW50aXR5Jywge3Bvc2l0aW9uOiBwb3NpdGlvbn0pKTtcbiAgICB9XG4gICAgXG4gICAgaWYgKGlzV2l0aG91dEVudGl0eSkge1xuICAgICAgcmV0dXJuIG5ldyBCZWhhdmlvdXJzLldhbGtBY3Rpb24odGhpcy5waHlzaWNzQ29tcG9uZW50LCBwb3NpdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgQmVoYXZpb3Vycy5OdWxsQWN0aW9uKCk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuLi9jb21wb25lbnRzJztcbmltcG9ydCAqIGFzIEJlaGF2aW91cnMgZnJvbSAnLi9pbmRleCc7XG5cbmV4cG9ydCBjbGFzcyBXYWxrQWN0aW9uIGV4dGVuZHMgQmVoYXZpb3Vycy5BY3Rpb24ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHBoeXNpY3NDb21wb25lbnQ6IENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCwgcHJpdmF0ZSBwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbikge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBhY3QoKTogbnVtYmVyIHtcbiAgICB0aGlzLnBoeXNpY3NDb21wb25lbnQubW92ZVRvKHRoaXMucG9zaXRpb24pO1xuICAgIHJldHVybiB0aGlzLmNvc3Q7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIEJlaGF2aW91cnMgZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuLi9lbnRpdGllcyc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi4vY29tcG9uZW50cyc7XG5pbXBvcnQgKiBhcyBNYXAgZnJvbSAnLi4vbWFwJztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgV3JpdGVSdW5lQWN0aW9uIGV4dGVuZHMgQmVoYXZpb3Vycy5BY3Rpb24ge1xuICBwcml2YXRlIGVuZ2luZTogRW5naW5lO1xuICBwcml2YXRlIHBoeXNpY3M6IENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudDtcblxuICBjb25zdHJ1Y3RvcihlbmdpbmU6IEVuZ2luZSwgZW50aXR5OiBFbnRpdGllcy5FbnRpdHkpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZW5naW5lID0gZW5naW5lO1xuICAgIHRoaXMucGh5c2ljcyA9IDxDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudChDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQpO1xuICB9XG5cbiAgYWN0KCk6IG51bWJlciB7XG4gICAgY29uc3QgcnVuZSA9IG5ldyBFbnRpdGllcy5FbnRpdHkodGhpcy5lbmdpbmUsICdSdW5lJywgJ3J1bmUnKTtcbiAgICBydW5lLmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KHRoaXMuZW5naW5lLCB7XG4gICAgICBwb3NpdGlvbjogdGhpcy5waHlzaWNzLnBvc2l0aW9uLFxuICAgICAgYmxvY2tpbmc6IGZhbHNlXG4gICAgfSkpO1xuICAgIHJ1bmUuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLlJlbmRlcmFibGVDb21wb25lbnQodGhpcy5lbmdpbmUsIHtcbiAgICAgIGdseXBoOiBuZXcgTWFwLkdseXBoKCcjJywgMHg0NGZmODgsIDB4MDAwMDAwKVxuICAgIH0pKTtcbiAgICBydW5lLmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5TZWxmRGVzdHJ1Y3RDb21wb25lbnQodGhpcy5lbmdpbmUsIHtcbiAgICAgIHR1cm5zOiAxMFxuICAgIH0pKTtcbiAgICBydW5lLmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5SdW5lRnJlZXplQ29tcG9uZW50KHRoaXMuZW5naW5lKSk7XG4gICAgcmV0dXJuIHRoaXMuY29zdDtcbiAgfVxufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9BY3Rpb24nO1xuZXhwb3J0ICogZnJvbSAnLi9CZWhhdmlvdXInO1xuZXhwb3J0ICogZnJvbSAnLi9XYWxrQWN0aW9uJztcbmV4cG9ydCAqIGZyb20gJy4vTnVsbEFjdGlvbic7XG5leHBvcnQgKiBmcm9tICcuL1dyaXRlUnVuZUFjdGlvbic7XG5leHBvcnQgKiBmcm9tICcuL1JhbmRvbVdhbGtCZWhhdmlvdXInO1xuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV4Y2VwdGlvbnMgZnJvbSAnLi4vRXhjZXB0aW9ucyc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuLi9lbnRpdGllcyc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIENvbXBvbmVudCB7XG4gIHByb3RlY3RlZCBsaXN0ZW5lcnM6IEV2ZW50cy5MaXN0ZW5lcltdO1xuXG4gIHByb3RlY3RlZCBfZ3VpZDogc3RyaW5nO1xuICBnZXQgZ3VpZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ3VpZDtcbiAgfVxuXG4gIHByb3RlY3RlZCBfZW50aXR5OiBFbnRpdGllcy5FbnRpdHk7XG4gIGdldCBlbnRpdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VudGl0eTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfZW5naW5lOiBFbmdpbmU7XG4gIGdldCBlbmdpbmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuZ2luZTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBkYXRhOiBhbnkgPSB7fSkge1xuICAgIHRoaXMuX2d1aWQgPSBDb3JlLlV0aWxzLmdlbmVyYXRlR3VpZCgpO1xuICAgIHRoaXMuX2VuZ2luZSA9IGVuZ2luZTtcbiAgICB0aGlzLmxpc3RlbmVycyA9IFtdO1xuICB9XG5cbiAgcmVnaXN0ZXJFbnRpdHkoZW50aXR5OiBFbnRpdGllcy5FbnRpdHkpIHtcbiAgICB0aGlzLl9lbnRpdHkgPSBlbnRpdHk7XG4gICAgdGhpcy5jaGVja1JlcXVpcmVtZW50cygpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xuICAgIHRoaXMucmVnaXN0ZXJMaXN0ZW5lcnMoKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBjaGVja1JlcXVpcmVtZW50cygpOiB2b2lkIHtcbiAgfVxuXG4gIHByb3RlY3RlZCByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgfVxuXG4gIHByb3RlY3RlZCBpbml0aWFsaXplKCkge1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAoIXRoaXMubGlzdGVuZXJzIHx8IHR5cGVvZiB0aGlzLmxpc3RlbmVycy5mb3JFYWNoICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9ucy5NaXNzaW5nSW1wbGVtZW50YXRpb25FcnJvcignYHRoaXMubGlzdGVuZXJzYCBoYXMgYmVlbiByZWRlZmluZWQsIGRlZmF1bHQgYGRlc3Ryb3lgIGZ1bmN0aW9uIHNob3VsZCBub3QgYmUgdXNlZC4gRm9yOiAnICsgdGhpcy5lbnRpdHkubmFtZSk7XG4gICAgfVxuICAgIHRoaXMubGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XG4gICAgICB0aGlzLmVuZ2luZS5yZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICB0aGlzLmVudGl0eS5yZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgfSk7XG4gICAgdGhpcy5saXN0ZW5lcnMgPSBbXTtcbiAgfVxufVxuIiwiaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2luZGV4JztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuXG5leHBvcnQgY2xhc3MgRW5lcmd5Q29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICBwcml2YXRlIF9jdXJyZW50RW5lcmd5OiBudW1iZXI7XG4gIGdldCBjdXJyZW50RW5lcmd5KCkge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50RW5lcmd5O1xuICB9XG5cbiAgcHJpdmF0ZSBfZW5lcmd5UmVnZW5lcmF0aW9uUmF0ZTogbnVtYmVyO1xuICBnZXQgZW5lcmd5UmVnZW5lcmF0aW9uUmF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5lcmd5UmVnZW5lcmF0aW9uUmF0ZTtcbiAgfVxuXG4gIHByaXZhdGUgX21heEVuZXJneTogbnVtYmVyO1xuICBnZXQgbWF4RW5lcmd5KCkge1xuICAgIHJldHVybiB0aGlzLl9tYXhFbmVyZ3k7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihlbmdpbmU6IEVuZ2luZSwgZGF0YToge3JlZ2VucmF0YXRpb25SYXRlOiBudW1iZXIsIG1heDogbnVtYmVyfSA9IHtyZWdlbnJhdGF0aW9uUmF0ZTogMTAwLCBtYXg6IDEwMH0pIHtcbiAgICBzdXBlcihlbmdpbmUpO1xuICAgIHRoaXMuX2N1cnJlbnRFbmVyZ3kgPSB0aGlzLl9tYXhFbmVyZ3kgPSBkYXRhLm1heDtcbiAgICB0aGlzLl9lbmVyZ3lSZWdlbmVyYXRpb25SYXRlID0gZGF0YS5yZWdlbnJhdGF0aW9uUmF0ZTtcbiAgfVxuXG4gIHByb3RlY3RlZCByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ3RpY2snLFxuICAgICAgdGhpcy5vblRpY2suYmluZCh0aGlzKSxcbiAgICAgIDFcbiAgICApKSk7XG4gIH1cblxuICBwcml2YXRlIG9uVGljayhldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgbGV0IHJhdGUgPSB0aGlzLl9lbmVyZ3lSZWdlbmVyYXRpb25SYXRlO1xuICAgIGxldCByYXRlTW9kaWZpZXJzID0gdGhpcy5lbnRpdHkuZ2F0aGVyKG5ldyBFdmVudHMuRXZlbnQoJ29uRW5lcmd5UmVnZW5lcmF0aW9uJykpO1xuICAgIHJhdGVNb2RpZmllcnMuZm9yRWFjaCgobW9kaWZpZXIpID0+IHtcbiAgICAgIHJhdGUgPSByYXRlICogbW9kaWZpZXI7XG4gICAgfSk7XG4gICAgdGhpcy5fY3VycmVudEVuZXJneSA9IE1hdGgubWluKHRoaXMubWF4RW5lcmd5LCB0aGlzLl9jdXJyZW50RW5lcmd5ICsgcmF0ZSk7XG4gIH1cblxuICB1c2VFbmVyZ3koZW5lcmd5OiBudW1iZXIpOiBudW1iZXIge1xuICAgIHRoaXMuX2N1cnJlbnRFbmVyZ3kgPSB0aGlzLl9jdXJyZW50RW5lcmd5IC0gZW5lcmd5O1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50RW5lcmd5O1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuXG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBIZWFsdGhDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZW50aXR5Lmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgICdkYW1hZ2UnLFxuICAgICAgdGhpcy5vbkRhbWFnZS5iaW5kKHRoaXMpXG4gICAgKSk7XG4gIH1cblxuICBwcml2YXRlIG9uRGFtYWdlKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICAgIHRoaXMuZW5naW5lLnJlbW92ZUVudGl0eSh0aGlzLmVudGl0eSk7XG4gICAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ21lc3NhZ2UnLCB7XG4gICAgICAgIG1lc3NhZ2U6IHRoaXMuZW50aXR5Lm5hbWUgKyAnIHdhcyBraWxsZWQgYnkgJyArIGV2ZW50LmRhdGEuc291cmNlLm5hbWUgKyAnLicsXG4gICAgICAgIHRhcmdldDogdGhpcy5lbnRpdHlcbiAgICAgIH0pKTtcbiAgfTtcbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgKiBhcyBCZWhhdmlvdXJzIGZyb20gJy4uL2JlaGF2aW91cnMnO1xuXG5pbXBvcnQgSW5wdXRIYW5kbGVyID0gcmVxdWlyZSgnLi4vSW5wdXRIYW5kbGVyJyk7XG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBJbnB1dENvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSBlbmVyZ3lDb21wb25lbnQ6IENvbXBvbmVudHMuRW5lcmd5Q29tcG9uZW50O1xuICBwcml2YXRlIHBoeXNpY3NDb21wb25lbnQ6IENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudDtcbiAgcHJpdmF0ZSBoYXNGb2N1czogYm9vbGVhbjtcblxuICBwcm90ZWN0ZWQgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLmVuZXJneUNvbXBvbmVudCA9IDxDb21wb25lbnRzLkVuZXJneUNvbXBvbmVudD50aGlzLmVudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5FbmVyZ3lDb21wb25lbnQpO1xuICAgIHRoaXMucGh5c2ljc0NvbXBvbmVudCA9IDxDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ+dGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCk7XG4gICAgdGhpcy5oYXNGb2N1cyA9IGZhbHNlO1xuICB9XG5cbiAgcHJvdGVjdGVkIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMubGlzdGVuZXJzLnB1c2godGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAndGljaycsXG4gICAgICB0aGlzLm9uVGljay5iaW5kKHRoaXMpXG4gICAgKSkpO1xuXG4gICAgdGhpcy5lbmdpbmUuaW5wdXRIYW5kbGVyLmxpc3RlbihcbiAgICAgIFtJbnB1dEhhbmRsZXIuS0VZX1VQLCBJbnB1dEhhbmRsZXIuS0VZX0tdLCBcbiAgICAgIHRoaXMub25Nb3ZlVXAuYmluZCh0aGlzKVxuICAgICk7XG4gICAgdGhpcy5lbmdpbmUuaW5wdXRIYW5kbGVyLmxpc3RlbihcbiAgICAgIFtJbnB1dEhhbmRsZXIuS0VZX1VdLFxuICAgICAgdGhpcy5vbk1vdmVVcFJpZ2h0LmJpbmQodGhpcylcbiAgICApO1xuICAgIHRoaXMuZW5naW5lLmlucHV0SGFuZGxlci5saXN0ZW4oXG4gICAgICBbSW5wdXRIYW5kbGVyLktFWV9SSUdIVCwgSW5wdXRIYW5kbGVyLktFWV9MXSwgXG4gICAgICB0aGlzLm9uTW92ZVJpZ2h0LmJpbmQodGhpcylcbiAgICApO1xuICAgIHRoaXMuZW5naW5lLmlucHV0SGFuZGxlci5saXN0ZW4oXG4gICAgICBbSW5wdXRIYW5kbGVyLktFWV9OXSxcbiAgICAgIHRoaXMub25Nb3ZlRG93blJpZ2h0LmJpbmQodGhpcylcbiAgICApO1xuICAgIHRoaXMuZW5naW5lLmlucHV0SGFuZGxlci5saXN0ZW4oXG4gICAgICBbSW5wdXRIYW5kbGVyLktFWV9ET1dOLCBJbnB1dEhhbmRsZXIuS0VZX0pdLCBcbiAgICAgIHRoaXMub25Nb3ZlRG93bi5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICB0aGlzLmVuZ2luZS5pbnB1dEhhbmRsZXIubGlzdGVuKFxuICAgICAgW0lucHV0SGFuZGxlci5LRVlfQl0sXG4gICAgICB0aGlzLm9uTW92ZURvd25MZWZ0LmJpbmQodGhpcylcbiAgICApO1xuICAgIHRoaXMuZW5naW5lLmlucHV0SGFuZGxlci5saXN0ZW4oXG4gICAgICBbSW5wdXRIYW5kbGVyLktFWV9MRUZULCBJbnB1dEhhbmRsZXIuS0VZX0hdLCBcbiAgICAgIHRoaXMub25Nb3ZlTGVmdC5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICB0aGlzLmVuZ2luZS5pbnB1dEhhbmRsZXIubGlzdGVuKFxuICAgICAgW0lucHV0SGFuZGxlci5LRVlfWV0sXG4gICAgICB0aGlzLm9uTW92ZVVwTGVmdC5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICB0aGlzLmVuZ2luZS5pbnB1dEhhbmRsZXIubGlzdGVuKFxuICAgICAgW0lucHV0SGFuZGxlci5LRVlfUEVSSU9EXSwgXG4gICAgICB0aGlzLm9uV2FpdC5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICB0aGlzLmVuZ2luZS5pbnB1dEhhbmRsZXIubGlzdGVuKFxuICAgICAgW0lucHV0SGFuZGxlci5LRVlfMF0sIFxuICAgICAgdGhpcy5vblRyYXBPbmUuYmluZCh0aGlzKVxuICAgICk7XG4gIH1cblxuICBvblRpY2soZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGlmICh0aGlzLmVuZXJneUNvbXBvbmVudC5jdXJyZW50RW5lcmd5ID49IDEwMCkge1xuICAgICAgdGhpcy5hY3QoKTtcbiAgICB9XG4gIH1cblxuICBhY3QoKSB7XG4gICAgdGhpcy5oYXNGb2N1cyA9IHRydWU7XG4gICAgdGhpcy5lbmdpbmUuZW1pdChuZXcgRXZlbnRzLkV2ZW50KCdwYXVzZVRpbWUnKSk7XG4gIH1cblxuICBwcml2YXRlIHBlcmZvcm1BY3Rpb24oYWN0aW9uOiBCZWhhdmlvdXJzLkFjdGlvbikge1xuICAgIHRoaXMuaGFzRm9jdXMgPSBmYWxzZTtcbiAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ3Jlc3VtZVRpbWUnKSk7XG4gICAgdGhpcy5lbmVyZ3lDb21wb25lbnQudXNlRW5lcmd5KGFjdGlvbi5hY3QoKSk7XG4gIH1cblxuICBwcml2YXRlIG9uV2FpdCgpIHtcbiAgICBpZiAoIXRoaXMuaGFzRm9jdXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5wZXJmb3JtQWN0aW9uKG5ldyBCZWhhdmlvdXJzLk51bGxBY3Rpb24oKSk7XG4gIH1cblxuICBwcml2YXRlIG9uVHJhcE9uZSgpIHtcbiAgICBpZiAoIXRoaXMuaGFzRm9jdXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgYWN0aW9uID0gdGhpcy5lbnRpdHkuZmlyZShuZXcgRXZlbnRzLkV2ZW50KCd3cml0ZVJ1bmUnLCB7fSkpO1xuICAgIGlmIChhY3Rpb24pIHtcbiAgICAgIHRoaXMucGVyZm9ybUFjdGlvbihhY3Rpb24pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25Nb3ZlVXAoKSB7XG4gICAgaWYgKCF0aGlzLmhhc0ZvY3VzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuaGFuZGxlTW92ZW1lbnQobmV3IENvcmUuUG9zaXRpb24oMCwgLTEpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Nb3ZlVXBSaWdodCgpIHtcbiAgICBpZiAoIXRoaXMuaGFzRm9jdXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5oYW5kbGVNb3ZlbWVudChuZXcgQ29yZS5Qb3NpdGlvbigxLCAtMSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVSaWdodCgpIHtcbiAgICBpZiAoIXRoaXMuaGFzRm9jdXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5oYW5kbGVNb3ZlbWVudChuZXcgQ29yZS5Qb3NpdGlvbigxLCAwKSk7XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZURvd25SaWdodCgpIHtcbiAgICBpZiAoIXRoaXMuaGFzRm9jdXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5oYW5kbGVNb3ZlbWVudChuZXcgQ29yZS5Qb3NpdGlvbigxLCAxKSk7XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZURvd24oKSB7XG4gICAgaWYgKCF0aGlzLmhhc0ZvY3VzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuaGFuZGxlTW92ZW1lbnQobmV3IENvcmUuUG9zaXRpb24oMCwgMSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVEb3duTGVmdCgpIHtcbiAgICBpZiAoIXRoaXMuaGFzRm9jdXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5oYW5kbGVNb3ZlbWVudChuZXcgQ29yZS5Qb3NpdGlvbigtMSwgMSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVMZWZ0KCkge1xuICAgIGlmICghdGhpcy5oYXNGb2N1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmhhbmRsZU1vdmVtZW50KG5ldyBDb3JlLlBvc2l0aW9uKC0xLCAwKSk7XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZVVwTGVmdCgpIHtcbiAgICBpZiAoIXRoaXMuaGFzRm9jdXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5oYW5kbGVNb3ZlbWVudChuZXcgQ29yZS5Qb3NpdGlvbigtMSwgLTEpKTtcbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlTW92ZW1lbnQoZGlyZWN0aW9uOiBDb3JlLlBvc2l0aW9uKSB7XG4gICAgY29uc3QgcG9zaXRpb24gPSBDb3JlLlBvc2l0aW9uLmFkZCh0aGlzLnBoeXNpY3NDb21wb25lbnQucG9zaXRpb24sIGRpcmVjdGlvbik7XG4gICAgY29uc3QgaXNXaXRob3V0RW50aXR5ID0gdGhpcy5lbmdpbmUuaXMobmV3IEV2ZW50cy5FdmVudCgnaXNXaXRob3V0RW50aXR5Jywge3Bvc2l0aW9uOiBwb3NpdGlvbn0pKTtcbiAgICBpZiAoaXNXaXRob3V0RW50aXR5KSB7XG4gICAgICB0aGlzLnBlcmZvcm1BY3Rpb24obmV3IEJlaGF2aW91cnMuV2Fsa0FjdGlvbih0aGlzLnBoeXNpY3NDb21wb25lbnQsIHBvc2l0aW9uKSk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuXG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBQaHlzaWNzQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICBwcml2YXRlIF9ibG9ja2luZzogYm9vbGVhbjtcbiAgZ2V0IGJsb2NraW5nKCkge1xuICAgIHJldHVybiB0aGlzLl9ibG9ja2luZztcbiAgfVxuICBwcml2YXRlIF9wb3NpdGlvbjogQ29yZS5Qb3NpdGlvbjtcbiAgZ2V0IHBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9wb3NpdGlvbjtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBkYXRhOiB7cG9zaXRpb246IENvcmUuUG9zaXRpb24sIGJsb2NraW5nOiBib29sZWFufSA9IHtwb3NpdGlvbjogbnVsbCwgYmxvY2tpbmc6IHRydWV9KSB7XG4gICAgc3VwZXIoZW5naW5lKTtcbiAgICB0aGlzLl9wb3NpdGlvbiA9IGRhdGEucG9zaXRpb247XG4gICAgdGhpcy5fYmxvY2tpbmcgPSBkYXRhLmJsb2NraW5nO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBpZiAodGhpcy5wb3NpdGlvbikge1xuICAgICAgdGhpcy5lbmdpbmUuZW1pdChuZXcgRXZlbnRzLkV2ZW50KCdtb3ZlZFRvJywge3BoeXNpY3NDb21wb25lbnQ6IHRoaXMsIGVudGl0eTogdGhpcy5lbnRpdHl9KSk7XG4gICAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ21vdmUnLCB7cGh5c2ljc0NvbXBvbmVudDogdGhpcywgZW50aXR5OiB0aGlzLmVudGl0eX0pKTtcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ21vdmVkRnJvbScsIHtwaHlzaWNzQ29tcG9uZW50OiB0aGlzLCBlbnRpdHk6IHRoaXMuZW50aXR5fSkpO1xuICB9XG5cbiAgbW92ZVRvKHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uKSB7XG4gICAgaWYgKHRoaXMuX3Bvc2l0aW9uKSB7XG4gICAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ21vdmVkRnJvbScsIHtwaHlzaWNzQ29tcG9uZW50OiB0aGlzLCBlbnRpdHk6IHRoaXMuZW50aXR5fSkpO1xuICAgIH1cbiAgICB0aGlzLl9wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgnbW92ZWRUbycsIHtwaHlzaWNzQ29tcG9uZW50OiB0aGlzLCBlbnRpdHk6IHRoaXMuZW50aXR5fSkpO1xuICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgnbW92ZScsIHtwaHlzaWNzQ29tcG9uZW50OiB0aGlzLCBlbnRpdHk6IHRoaXMuZW50aXR5fSkpO1xuICAgIHRoaXMuZW50aXR5LmVtaXQobmV3IEV2ZW50cy5FdmVudCgnbW92ZScsIHtwaHlzaWNzQ29tcG9uZW50OiB0aGlzLCBlbnRpdHk6IHRoaXMuZW50aXR5fSkpO1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuLi9lbnRpdGllcyc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIEV4Y2VwdGlvbnMgZnJvbSAnLi4vRXhjZXB0aW9ucyc7XG5pbXBvcnQgKiBhcyBNYXAgZnJvbSAnLi4vbWFwJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5cbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIFJlbmRlcmFibGVDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gIHByaXZhdGUgX2dseXBoOiBNYXAuR2x5cGg7XG4gIGdldCBnbHlwaCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2x5cGg7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihlbmdpbmU6IEVuZ2luZSwgZGF0YToge2dseXBoOiBNYXAuR2x5cGh9KSB7XG4gICAgc3VwZXIoZW5naW5lKTtcbiAgICB0aGlzLl9nbHlwaCA9IGRhdGEuZ2x5cGg7XG4gIH1cblxuICBwcm90ZWN0ZWQgY2hlY2tSZXF1aXJlbWVudHMoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmVudGl0eS5oYXNDb21wb25lbnQoQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KSkge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbnMuTWlzc2luZ0NvbXBvbmVudEVycm9yKCdSZW5kZXJhYmxlQ29tcG9uZW50IHJlcXVpcmVzIFBoeXNpY3NDb21wb25lbnQnKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ3JlbmRlcmFibGVDb21wb25lbnRDcmVhdGVkJywge2VudGl0eTogdGhpcy5lbnRpdHksIHJlbmRlcmFibGVDb21wb25lbnQ6IHRoaXN9KSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgncmVuZGVyYWJsZUNvbXBvbmVudERlc3Ryb3llZCcsIHtlbnRpdHk6IHRoaXMuZW50aXR5LCByZW5kZXJhYmxlQ29tcG9uZW50OiB0aGlzfSkpO1xuICB9XG59XG4iLCJpbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmltcG9ydCAqIGFzIEJlaGF2aW91cnMgZnJvbSAnLi4vYmVoYXZpb3Vycyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5cbmV4cG9ydCBjbGFzcyBSb2FtaW5nQUlDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gIHByaXZhdGUgZW5lcmd5Q29tcG9uZW50OiBDb21wb25lbnRzLkVuZXJneUNvbXBvbmVudDtcblxuICBwcml2YXRlIHJhbmRvbVdhbGtCZWhhdmlvdXI6IEJlaGF2aW91cnMuUmFuZG9tV2Fsa0JlaGF2aW91cjtcblxuICBwcm90ZWN0ZWQgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLmVuZXJneUNvbXBvbmVudCA9IDxDb21wb25lbnRzLkVuZXJneUNvbXBvbmVudD50aGlzLmVudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5FbmVyZ3lDb21wb25lbnQpO1xuICAgIHRoaXMucmFuZG9tV2Fsa0JlaGF2aW91ciA9IG5ldyBCZWhhdmlvdXJzLlJhbmRvbVdhbGtCZWhhdmlvdXIodGhpcy5lbmdpbmUsIHRoaXMuZW50aXR5KTtcbiAgfVxuXG4gIHByb3RlY3RlZCByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ3RpY2snLFxuICAgICAgdGhpcy5vblRpY2suYmluZCh0aGlzKVxuICAgICkpKTtcbiAgfVxuXG4gIG9uVGljayhldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgaWYgKHRoaXMuZW5lcmd5Q29tcG9uZW50LmN1cnJlbnRFbmVyZ3kgPj0gMTAwKSB7XG4gICAgICBsZXQgYWN0aW9uID0gdGhpcy5yYW5kb21XYWxrQmVoYXZpb3VyLmdldE5leHRBY3Rpb24oKTtcbiAgICAgIHRoaXMuZW5lcmd5Q29tcG9uZW50LnVzZUVuZXJneShhY3Rpb24uYWN0KCkpO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2luZGV4JztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgUnVuZURhbWFnZUNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSByYWRpdXM6IG51bWJlcjtcbiAgcHJpdmF0ZSBjaGFyZ2VzOiBudW1iZXI7XG4gIHByaXZhdGUgcGh5c2ljc0NvbXBvbmVudDogQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50O1xuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBkYXRhOiB7cmFkaXVzOiBudW1iZXIsIGNoYXJnZXM6IG51bWJlcn0gPSB7cmFkaXVzOiAxLCBjaGFyZ2VzOiAxfSkge1xuICAgIHN1cGVyKGVuZ2luZSk7XG4gICAgdGhpcy5yYWRpdXMgPSBkYXRhLnJhZGl1cztcbiAgICB0aGlzLmNoYXJnZXMgPSBkYXRhLmNoYXJnZXM7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMucGh5c2ljc0NvbXBvbmVudCA9IDxDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ+dGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCk7XG4gIH1cblxuICByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ21vdmVkVG8nLFxuICAgICAgdGhpcy5vbk1vdmVkVG8uYmluZCh0aGlzKSxcbiAgICAgIDUwXG4gICAgKSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVkVG8oZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGlmICh0aGlzLmNoYXJnZXMgPD0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBldmVudFBvc2l0aW9uID0gZXZlbnQuZGF0YS5waHlzaWNzQ29tcG9uZW50LnBvc2l0aW9uOyBcbiAgICBpZiAoZXZlbnRQb3NpdGlvbi54ID09IHRoaXMucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbi54ICYmIFxuICAgICAgICBldmVudFBvc2l0aW9uLnkgPT09IHRoaXMucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbi55KSB7XG4gICAgICBldmVudC5kYXRhLmVudGl0eS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ2RhbWFnZScsIHtcbiAgICAgICAgc291cmNlOiB0aGlzLmVudGl0eVxuICAgICAgfSkpO1xuICAgICAgdGhpcy5jaGFyZ2VzLS07XG4gICAgICBpZiAodGhpcy5jaGFyZ2VzIDw9IDApIHtcbiAgICAgICAgdGhpcy5lbmdpbmUucmVtb3ZlRW50aXR5KHRoaXMuZW50aXR5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5cbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIFJ1bmVGcmVlemVDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gIHByaXZhdGUgcmFkaXVzOiBudW1iZXI7XG4gIHByaXZhdGUgY2hhcmdlczogbnVtYmVyO1xuICBwcml2YXRlIHBoeXNpY3NDb21wb25lbnQ6IENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudDtcblxuICBjb25zdHJ1Y3RvcihlbmdpbmU6IEVuZ2luZSwgZGF0YToge3JhZGl1czogbnVtYmVyLCBjaGFyZ2VzOiBudW1iZXJ9ID0ge3JhZGl1czogMSwgY2hhcmdlczogMX0pIHtcbiAgICBzdXBlcihlbmdpbmUpO1xuICAgIHRoaXMucmFkaXVzID0gZGF0YS5yYWRpdXM7XG4gICAgdGhpcy5jaGFyZ2VzID0gZGF0YS5jaGFyZ2VzO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnBoeXNpY3NDb21wb25lbnQgPSA8Q29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50PnRoaXMuZW50aXR5LmdldENvbXBvbmVudChDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQpO1xuICB9XG5cbiAgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaCh0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdtb3ZlZFRvJyxcbiAgICAgIHRoaXMub25Nb3ZlZFRvLmJpbmQodGhpcyksXG4gICAgICA1MFxuICAgICkpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Nb3ZlZFRvKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBpZiAodGhpcy5jaGFyZ2VzIDw9IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZXZlbnRQb3NpdGlvbiA9IGV2ZW50LmRhdGEucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbjsgXG4gICAgaWYgKGV2ZW50UG9zaXRpb24ueCA9PSB0aGlzLnBoeXNpY3NDb21wb25lbnQucG9zaXRpb24ueCAmJiBcbiAgICAgICAgZXZlbnRQb3NpdGlvbi55ID09PSB0aGlzLnBoeXNpY3NDb21wb25lbnQucG9zaXRpb24ueSkge1xuICAgICAgZXZlbnQuZGF0YS5lbnRpdHkuYWRkQ29tcG9uZW50KFxuICAgICAgICBuZXcgQ29tcG9uZW50cy5TbG93Q29tcG9uZW50KHRoaXMuZW5naW5lLCB7ZmFjdG9yOiAwLjV9KSxcbiAgICAgICAgeyBcbiAgICAgICAgICBkdXJhdGlvbjogMTBcbiAgICAgICAgfVxuICAgICAgKTsgXG4gICAgICB0aGlzLmNoYXJnZXMtLTtcbiAgICAgIGlmICh0aGlzLmNoYXJnZXMgPD0gMCkge1xuICAgICAgICB0aGlzLmVuZ2luZS5yZW1vdmVFbnRpdHkodGhpcy5lbnRpdHkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEJlaGF2aW91cnMgZnJvbSAnLi4vYmVoYXZpb3Vycyc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4uL2VudGl0aWVzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5cbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIFJ1bmVXcml0ZXJDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gIHByaXZhdGUgcGh5c2ljYWxDb21wb25lbnQ6IENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudDtcblxuICBjb25zdHJ1Y3RvcihlbmdpbmU6IEVuZ2luZSwgZGF0YToge30gPSB7fSkge1xuICAgIHN1cGVyKGVuZ2luZSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnBoeXNpY2FsQ29tcG9uZW50ID0gPENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudD50aGlzLmVudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KTtcbiAgfVxuXG4gIHByb3RlY3RlZCByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmVudGl0eS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICd3cml0ZVJ1bmUnLFxuICAgICAgdGhpcy5vbldyaXRlUnVuZS5iaW5kKHRoaXMpXG4gICAgKSk7XG4gIH1cblxuICBvbldyaXRlUnVuZShldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgY29uc3QgdGlsZSA9IHRoaXMuZW5naW5lLmZpcmUobmV3IEV2ZW50cy5FdmVudCgnZ2V0VGlsZScsIHtcbiAgICAgIHBvc2l0aW9uOiB0aGlzLnBoeXNpY2FsQ29tcG9uZW50LnBvc2l0aW9uXG4gICAgfSkpO1xuXG4gICAgbGV0IGhhc1J1bmUgPSBmYWxzZTtcbiAgICBmb3IgKHZhciBrZXkgaW4gdGlsZS5wcm9wcykge1xuICAgICAgaWYgKHRpbGUucHJvcHNba2V5XS50eXBlID09PSAncnVuZScpIHtcbiAgICAgICAgaGFzUnVuZSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGhhc1J1bmUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgXG4gICAgcmV0dXJuIG5ldyBCZWhhdmlvdXJzLldyaXRlUnVuZUFjdGlvbih0aGlzLmVuZ2luZSwgdGhpcy5lbnRpdHkpO1xuXG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5cbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIFNlbGZEZXN0cnVjdENvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSBtYXhUdXJuczogbnVtYmVyO1xuICBwcml2YXRlIHR1cm5zTGVmdDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBkYXRhOiB7dHVybnM6IG51bWJlcn0pIHtcbiAgICBzdXBlcihlbmdpbmUpO1xuICAgIHRoaXMubWF4VHVybnMgPSBkYXRhLnR1cm5zO1xuICAgIHRoaXMudHVybnNMZWZ0ID0gZGF0YS50dXJucztcbiAgICB0aGlzLmxpc3RlbmVycyA9IFtdO1xuICB9XG5cbiAgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaCh0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICd0dXJuJyxcbiAgICAgIHRoaXMub25UdXJuLmJpbmQodGhpcyksXG4gICAgICA1MFxuICAgICkpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25UdXJuKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICB0aGlzLnR1cm5zTGVmdC0tO1xuICAgIGlmICh0aGlzLnR1cm5zTGVmdCA8IDApIHtcbiAgICAgIHRoaXMuZW5naW5lLnJlbW92ZUVudGl0eSh0aGlzLmVudGl0eSk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuXG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBTbG93Q29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICBwcml2YXRlIF9mYWN0b3I6IG51bWJlcjtcbiAgZ2V0IGZhY3RvcigpIHtcbiAgICByZXR1cm4gdGhpcy5fZmFjdG9yO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZW5naW5lOiBFbmdpbmUsIGRhdGE6IHtmYWN0b3I6IG51bWJlcn0pIHtcbiAgICBzdXBlcihlbmdpbmUpO1xuICAgIHRoaXMuX2ZhY3RvciA9IGRhdGEuZmFjdG9yO1xuICB9XG5cbiAgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaCh0aGlzLmVudGl0eS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdvbkVuZXJneVJlZ2VuZXJhdGlvbicsXG4gICAgICB0aGlzLm9uRW5lcmd5UmVnZW5lcmF0aW9uLmJpbmQodGhpcyksXG4gICAgICA1MFxuICAgICkpKTtcblxuICAgIHRoaXMubGlzdGVuZXJzLnB1c2godGhpcy5lbnRpdHkubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAnZ2V0U3RhdHVzRWZmZWN0JyxcbiAgICAgIHRoaXMub25HZXRTdGF0dXNFZmZlY3QuYmluZCh0aGlzKVxuICAgICkpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25FbmVyZ3lSZWdlbmVyYXRpb24oZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIHJldHVybiB0aGlzLl9mYWN0b3I7XG4gIH1cblxuICBwcml2YXRlIG9uR2V0U3RhdHVzRWZmZWN0KGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogJ1Nsb3cnLFxuICAgICAgc3ltYm9sOiAnUydcbiAgICB9O1xuICB9XG5cbn1cbiIsImltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcblxuZXhwb3J0IGNsYXNzIFRpbWVIYW5kbGVyQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICBwcml2YXRlIF9jdXJyZW50VGljazogbnVtYmVyO1xuICBnZXQgY3VycmVudFRpY2soKSB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRUaWNrO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3VycmVudFR1cm46IG51bWJlcjtcbiAgZ2V0IGN1cnJlbnRUdXJuKCkge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50VHVybjtcbiAgfVxuXG4gIHByaXZhdGUgdGlja3NQZXJUdXJuOiBudW1iZXI7XG4gIHByaXZhdGUgdHVyblRpbWU6IG51bWJlcjtcblxuICBwcml2YXRlIHBhdXNlZDogYm9vbGVhbjtcblxuICBwcm90ZWN0ZWQgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnRpY2tzUGVyVHVybiA9IDE7XG4gICAgdGhpcy50dXJuVGltZSA9IDA7XG4gICAgdGhpcy5fY3VycmVudFR1cm4gPSAwO1xuICAgIHRoaXMuX2N1cnJlbnRUaWNrID0gMDtcbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICB9XG5cbiAgcHJvdGVjdGVkIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ3BhdXNlVGltZScsXG4gICAgICB0aGlzLm9uUGF1c2VUaW1lLmJpbmQodGhpcylcbiAgICApKTtcbiAgICB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdyZXN1bWVUaW1lJyxcbiAgICAgIHRoaXMub25SZXN1bWVUaW1lLmJpbmQodGhpcylcbiAgICApKTtcbiAgfVxuXG4gIHByaXZhdGUgb25QYXVzZVRpbWUoZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIHRoaXMucGF1c2VkID0gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgb25SZXN1bWVUaW1lKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICB9XG5cbiAgZW5naW5lVGljayhnYW1lVGltZTogbnVtYmVyKSB7XG4gICAgaWYgKHRoaXMucGF1c2VkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2N1cnJlbnRUaWNrKys7XG4gICAgdGhpcy5lbmdpbmUuY3VycmVudFRpY2sgPSB0aGlzLl9jdXJyZW50VGljaztcbiAgICBpZiAoKHRoaXMuX2N1cnJlbnRUaWNrICUgdGhpcy50aWNrc1BlclR1cm4pID09PSAwKSB7XG4gICAgICB0aGlzLl9jdXJyZW50VHVybisrO1xuICAgICAgdGhpcy5lbmdpbmUuY3VycmVudFR1cm4gPSB0aGlzLl9jdXJyZW50VHVybjtcbiAgICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgndHVybicsIHtjdXJyZW50VHVybjogdGhpcy5fY3VycmVudFR1cm4sIGN1cnJlbnRUaWNrOiB0aGlzLl9jdXJyZW50VGlja30pKTtcblxuICAgICAgdGhpcy50dXJuVGltZSA9IGdhbWVUaW1lO1xuXG4gICAgfVxuICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgndGljaycsIHtjdXJyZW50VHVybjogdGhpcy5fY3VycmVudFR1cm4sIGN1cnJlbnRUaWNrOiB0aGlzLl9jdXJyZW50VGlja30pKTtcbiAgfVxuXG59XG4iLCJleHBvcnQgKiBmcm9tICcuL0NvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL1RpbWVIYW5kbGVyQ29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vU2VsZkRlc3RydWN0Q29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vUm9hbWluZ0FJQ29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vRW5lcmd5Q29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vSW5wdXRDb21wb25lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9SZW5kZXJhYmxlQ29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vUGh5c2ljc0NvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL0hlYWx0aENvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL1J1bmVXcml0ZXJDb21wb25lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9SdW5lRGFtYWdlQ29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vUnVuZUZyZWV6ZUNvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL1Nsb3dDb21wb25lbnQnO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5leHBvcnQgdHlwZSBDb2xvciA9IFN0cmluZyB8IG51bWJlcjtcblxuZXhwb3J0IGNsYXNzIENvbG9yVXRpbHMge1xuICAvKipcbiAgICBGdW5jdGlvbjogbXVsdGlwbHlcbiAgICBNdWx0aXBseSBhIGNvbG9yIHdpdGggYSBudW1iZXIuIFxuICAgID4gKHIsZyxiKSAqIG4gPT0gKHIqbiwgZypuLCBiKm4pXG5cbiAgICBQYXJhbWV0ZXJzOlxuICAgIGNvbG9yIC0gdGhlIGNvbG9yXG4gICAgY29lZiAtIHRoZSBmYWN0b3JcblxuICAgIFJldHVybnM6XG4gICAgQSBuZXcgY29sb3IgYXMgYSBudW1iZXIgYmV0d2VlbiAweDAwMDAwMCBhbmQgMHhGRkZGRkZcbiAgICovXG4gIHN0YXRpYyBtdWx0aXBseShjb2xvcjogQ29sb3IsIGNvZWY6IG51bWJlcik6IENvbG9yIHtcbiAgICBsZXQgciwgZywgYjogbnVtYmVyO1xuICAgIGlmICh0eXBlb2YgY29sb3IgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIC8vIGR1cGxpY2F0ZWQgdG9SZ2JGcm9tTnVtYmVyIGNvZGUgdG8gYXZvaWQgZnVuY3Rpb24gY2FsbCBhbmQgYXJyYXkgYWxsb2NhdGlvblxuICAgICAgciA9ICg8bnVtYmVyPmNvbG9yICYgMHhGRjAwMDApID4+IDE2O1xuICAgICAgZyA9ICg8bnVtYmVyPmNvbG9yICYgMHgwMEZGMDApID4+IDg7XG4gICAgICBiID0gPG51bWJlcj5jb2xvciAmIDB4MDAwMEZGO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmdiOiBudW1iZXJbXSA9IENvbG9yVXRpbHMudG9SZ2IoY29sb3IpO1xuICAgICAgciA9IHJnYlswXTtcbiAgICAgIGcgPSByZ2JbMV07XG4gICAgICBiID0gcmdiWzJdO1xuICAgIH1cbiAgICByID0gTWF0aC5yb3VuZChyICogY29lZik7XG4gICAgZyA9IE1hdGgucm91bmQoZyAqIGNvZWYpO1xuICAgIGIgPSBNYXRoLnJvdW5kKGIgKiBjb2VmKTtcbiAgICByID0gciA8IDAgPyAwIDogciA+IDI1NSA/IDI1NSA6IHI7XG4gICAgZyA9IGcgPCAwID8gMCA6IGcgPiAyNTUgPyAyNTUgOiBnO1xuICAgIGIgPSBiIDwgMCA/IDAgOiBiID4gMjU1ID8gMjU1IDogYjtcbiAgICByZXR1cm4gYiB8IChnIDw8IDgpIHwgKHIgPDwgMTYpO1xuICB9XG5cbiAgc3RhdGljIG1heChjb2wxOiBDb2xvciwgY29sMjogQ29sb3IpIHtcbiAgICBsZXQgcjEsZzEsYjEscjIsZzIsYjI6IG51bWJlcjtcbiAgICBpZiAodHlwZW9mIGNvbDEgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIC8vIGR1cGxpY2F0ZWQgdG9SZ2JGcm9tTnVtYmVyIGNvZGUgdG8gYXZvaWQgZnVuY3Rpb24gY2FsbCBhbmQgYXJyYXkgYWxsb2NhdGlvblxuICAgICAgcjEgPSAoPG51bWJlcj5jb2wxICYgMHhGRjAwMDApID4+IDE2O1xuICAgICAgZzEgPSAoPG51bWJlcj5jb2wxICYgMHgwMEZGMDApID4+IDg7XG4gICAgICBiMSA9IDxudW1iZXI+Y29sMSAmIDB4MDAwMEZGO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmdiMTogbnVtYmVyW10gPSBDb2xvclV0aWxzLnRvUmdiKGNvbDEpO1xuICAgICAgcjEgPSByZ2IxWzBdO1xuICAgICAgZzEgPSByZ2IxWzFdO1xuICAgICAgYjEgPSByZ2IxWzJdO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGNvbDIgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIC8vIGR1cGxpY2F0ZWQgdG9SZ2JGcm9tTnVtYmVyIGNvZGUgdG8gYXZvaWQgZnVuY3Rpb24gY2FsbCBhbmQgYXJyYXkgYWxsb2NhdGlvblxuICAgICAgcjIgPSAoPG51bWJlcj5jb2wyICYgMHhGRjAwMDApID4+IDE2O1xuICAgICAgZzIgPSAoPG51bWJlcj5jb2wyICYgMHgwMEZGMDApID4+IDg7XG4gICAgICBiMiA9IDxudW1iZXI+Y29sMiAmIDB4MDAwMEZGO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmdiMjogbnVtYmVyW10gPSBDb2xvclV0aWxzLnRvUmdiKGNvbDIpO1xuICAgICAgcjIgPSByZ2IyWzBdO1xuICAgICAgZzIgPSByZ2IyWzFdO1xuICAgICAgYjIgPSByZ2IyWzJdO1xuICAgIH1cbiAgICBpZiAocjIgPiByMSkge1xuICAgICAgcjEgPSByMjtcbiAgICB9XG4gICAgaWYgKGcyID4gZzEpIHtcbiAgICAgIGcxID0gZzI7XG4gICAgfVxuICAgIGlmIChiMiA+IGIxKSB7XG4gICAgICBiMSA9IGIyO1xuICAgIH1cbiAgICByZXR1cm4gYjEgfCAoZzEgPDwgOCkgfCAocjEgPDwgMTYpO1xuICB9XG5cbiAgc3RhdGljIG1pbihjb2wxOiBDb2xvciwgY29sMjogQ29sb3IpIHtcbiAgICBsZXQgcjEsZzEsYjEscjIsZzIsYjI6IG51bWJlcjtcbiAgICBpZiAodHlwZW9mIGNvbDEgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIC8vIGR1cGxpY2F0ZWQgdG9SZ2JGcm9tTnVtYmVyIGNvZGUgdG8gYXZvaWQgZnVuY3Rpb24gY2FsbCBhbmQgYXJyYXkgYWxsb2NhdGlvblxuICAgICAgcjEgPSAoPG51bWJlcj5jb2wxICYgMHhGRjAwMDApID4+IDE2O1xuICAgICAgZzEgPSAoPG51bWJlcj5jb2wxICYgMHgwMEZGMDApID4+IDg7XG4gICAgICBiMSA9IDxudW1iZXI+Y29sMSAmIDB4MDAwMEZGO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmdiMTogbnVtYmVyW10gPSBDb2xvclV0aWxzLnRvUmdiKGNvbDEpO1xuICAgICAgcjEgPSByZ2IxWzBdO1xuICAgICAgZzEgPSByZ2IxWzFdO1xuICAgICAgYjEgPSByZ2IxWzJdO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGNvbDIgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIC8vIGR1cGxpY2F0ZWQgdG9SZ2JGcm9tTnVtYmVyIGNvZGUgdG8gYXZvaWQgZnVuY3Rpb24gY2FsbCBhbmQgYXJyYXkgYWxsb2NhdGlvblxuICAgICAgcjIgPSAoPG51bWJlcj5jb2wyICYgMHhGRjAwMDApID4+IDE2O1xuICAgICAgZzIgPSAoPG51bWJlcj5jb2wyICYgMHgwMEZGMDApID4+IDg7XG4gICAgICBiMiA9IDxudW1iZXI+Y29sMiAmIDB4MDAwMEZGO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmdiMjogbnVtYmVyW10gPSBDb2xvclV0aWxzLnRvUmdiKGNvbDIpO1xuICAgICAgcjIgPSByZ2IyWzBdO1xuICAgICAgZzIgPSByZ2IyWzFdO1xuICAgICAgYjIgPSByZ2IyWzJdO1xuICAgIH1cbiAgICBpZiAocjIgPCByMSkge1xuICAgICAgcjEgPSByMjtcbiAgICB9XG4gICAgaWYgKGcyIDwgZzEpIHtcbiAgICAgIGcxID0gZzI7XG4gICAgfVxuICAgIGlmIChiMiA8IGIxKSB7XG4gICAgICBiMSA9IGIyO1xuICAgIH1cbiAgICByZXR1cm4gYjEgfCAoZzEgPDwgOCkgfCAocjEgPDwgMTYpO1xuICB9ICAgICAgICBcblxuICBzdGF0aWMgY29sb3JNdWx0aXBseShjb2wxOiBDb2xvciwgY29sMjogQ29sb3IpIHtcbiAgICBsZXQgcjEsZzEsYjEscjIsZzIsYjI6IG51bWJlcjtcbiAgICBpZiAodHlwZW9mIGNvbDEgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIC8vIGR1cGxpY2F0ZWQgdG9SZ2JGcm9tTnVtYmVyIGNvZGUgdG8gYXZvaWQgZnVuY3Rpb24gY2FsbCBhbmQgYXJyYXkgYWxsb2NhdGlvblxuICAgICAgcjEgPSAoPG51bWJlcj5jb2wxICYgMHhGRjAwMDApID4+IDE2O1xuICAgICAgZzEgPSAoPG51bWJlcj5jb2wxICYgMHgwMEZGMDApID4+IDg7XG4gICAgICBiMSA9IDxudW1iZXI+Y29sMSAmIDB4MDAwMEZGO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmdiMTogbnVtYmVyW10gPSBDb2xvclV0aWxzLnRvUmdiKGNvbDEpO1xuICAgICAgcjEgPSByZ2IxWzBdO1xuICAgICAgZzEgPSByZ2IxWzFdO1xuICAgICAgYjEgPSByZ2IxWzJdO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGNvbDIgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIC8vIGR1cGxpY2F0ZWQgdG9SZ2JGcm9tTnVtYmVyIGNvZGUgdG8gYXZvaWQgZnVuY3Rpb24gY2FsbCBhbmQgYXJyYXkgYWxsb2NhdGlvblxuICAgICAgcjIgPSAoPG51bWJlcj5jb2wyICYgMHhGRjAwMDApID4+IDE2O1xuICAgICAgZzIgPSAoPG51bWJlcj5jb2wyICYgMHgwMEZGMDApID4+IDg7XG4gICAgICBiMiA9IDxudW1iZXI+Y29sMiAmIDB4MDAwMEZGO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmdiMjogbnVtYmVyW10gPSBDb2xvclV0aWxzLnRvUmdiKGNvbDIpO1xuICAgICAgcjIgPSByZ2IyWzBdO1xuICAgICAgZzIgPSByZ2IyWzFdO1xuICAgICAgYjIgPSByZ2IyWzJdO1xuICAgIH0gICAgICAgICAgIFxuICAgIHIxID0gTWF0aC5mbG9vcihyMSAqIHIyIC8gMjU1KTtcbiAgICBnMSA9IE1hdGguZmxvb3IoZzEgKiBnMiAvIDI1NSk7XG4gICAgYjEgPSBNYXRoLmZsb29yKGIxICogYjIgLyAyNTUpO1xuICAgIHIxID0gcjEgPCAwID8gMCA6IHIxID4gMjU1ID8gMjU1IDogcjE7XG4gICAgZzEgPSBnMSA8IDAgPyAwIDogZzEgPiAyNTUgPyAyNTUgOiBnMTtcbiAgICBiMSA9IGIxIDwgMCA/IDAgOiBiMSA+IDI1NSA/IDI1NSA6IGIxO1xuICAgIHJldHVybiBiMSB8IChnMSA8PCA4KSB8IChyMSA8PCAxNik7XG4gIH1cblxuICAvKipcbiAgICBGdW5jdGlvbjogY29tcHV0ZUludGVuc2l0eVxuICAgIFJldHVybiB0aGUgZ3JheXNjYWxlIGludGVuc2l0eSBiZXR3ZWVuIDAgYW5kIDFcbiAgICovXG4gIHN0YXRpYyBjb21wdXRlSW50ZW5zaXR5KGNvbG9yOiBDb2xvcik6IG51bWJlciB7XG4gICAgLy8gQ29sb3JpbWV0cmljIChsdW1pbmFuY2UtcHJlc2VydmluZykgY29udmVyc2lvbiB0byBncmF5c2NhbGVcbiAgICBsZXQgciwgZywgYjogbnVtYmVyO1xuICAgIGlmICh0eXBlb2YgY29sb3IgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIC8vIGR1cGxpY2F0ZWQgdG9SZ2JGcm9tTnVtYmVyIGNvZGUgdG8gYXZvaWQgZnVuY3Rpb24gY2FsbCBhbmQgYXJyYXkgYWxsb2NhdGlvblxuICAgICAgciA9ICg8bnVtYmVyPmNvbG9yICYgMHhGRjAwMDApID4+IDE2O1xuICAgICAgZyA9ICg8bnVtYmVyPmNvbG9yICYgMHgwMEZGMDApID4+IDg7XG4gICAgICBiID0gPG51bWJlcj5jb2xvciAmIDB4MDAwMEZGO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmdiOiBudW1iZXJbXSA9IENvbG9yVXRpbHMudG9SZ2IoY29sb3IpO1xuICAgICAgciA9IHJnYlswXTtcbiAgICAgIGcgPSByZ2JbMV07XG4gICAgICBiID0gcmdiWzJdO1xuICAgIH1cbiAgICByZXR1cm4gKDAuMjEyNiAqIHIgKyAwLjcxNTIqZyArIDAuMDcyMiAqIGIpICogKDEvMjU1KTtcbiAgfVxuXG4gIC8qKlxuICAgIEZ1bmN0aW9uOiBhZGRcbiAgICBBZGQgdHdvIGNvbG9ycy5cbiAgICA+IChyMSxnMSxiMSkgKyAocjIsZzIsYjIpID0gKHIxK3IyLGcxK2cyLGIxK2IyKVxuXG4gICAgUGFyYW1ldGVyczpcbiAgICBjb2wxIC0gdGhlIGZpcnN0IGNvbG9yXG4gICAgY29sMiAtIHRoZSBzZWNvbmQgY29sb3JcblxuICAgIFJldHVybnM6XG4gICAgQSBuZXcgY29sb3IgYXMgYSBudW1iZXIgYmV0d2VlbiAweDAwMDAwMCBhbmQgMHhGRkZGRkZcbiAgICovXG4gIHN0YXRpYyBhZGQoY29sMTogQ29sb3IsIGNvbDI6IENvbG9yKTogQ29sb3Ige1xuICAgIGxldCByID0gKCg8bnVtYmVyPmNvbDEgJiAweEZGMDAwMCkgPj4gMTYpICsgKCg8bnVtYmVyPmNvbDIgJiAweEZGMDAwMCkgPj4gMTYpO1xuICAgIGxldCBnID0gKCg8bnVtYmVyPmNvbDEgJiAweDAwRkYwMCkgPj4gOCkgKyAoKDxudW1iZXI+Y29sMiAmIDB4MDBGRjAwKSA+PiA4KTtcbiAgICBsZXQgYiA9ICg8bnVtYmVyPmNvbDEgJiAweDAwMDBGRikgKyAoPG51bWJlcj5jb2wyICYgMHgwMDAwRkYpO1xuICAgIGlmIChyID4gMjU1KSB7XG4gICAgICByID0gMjU1O1xuICAgIH1cbiAgICBpZiAoZyA+IDI1NSkge1xuICAgICAgZyA9IDI1NTtcbiAgICB9XG4gICAgaWYgKGIgPiAyNTUpIHtcbiAgICAgIGIgPSAyNTU7XG4gICAgfVxuICAgIHJldHVybiBiIHwgKGcgPDwgOCkgfCAociA8PCAxNik7XG4gIH1cblxuICBwcml2YXRlIHN0YXRpYyBzdGRDb2wgPSB7XG4gICAgXCJhcXVhXCI6IFswLCAyNTUsIDI1NV0sXG4gICAgXCJibGFja1wiOiBbMCwgMCwgMF0sXG4gICAgXCJibHVlXCI6IFswLCAwLCAyNTVdLFxuICAgIFwiZnVjaHNpYVwiOiBbMjU1LCAwLCAyNTVdLFxuICAgIFwiZ3JheVwiOiBbMTI4LCAxMjgsIDEyOF0sXG4gICAgXCJncmVlblwiOiBbMCwgMTI4LCAwXSxcbiAgICBcImxpbWVcIjogWzAsIDI1NSwgMF0sXG4gICAgXCJtYXJvb25cIjogWzEyOCwgMCwgMF0sXG4gICAgXCJuYXZ5XCI6IFswLCAwLCAxMjhdLFxuICAgIFwib2xpdmVcIjogWzEyOCwgMTI4LCAwXSxcbiAgICBcIm9yYW5nZVwiOiBbMjU1LCAxNjUsIDBdLFxuICAgIFwicHVycGxlXCI6IFsxMjgsIDAsIDEyOF0sXG4gICAgXCJyZWRcIjogWzI1NSwgMCwgMF0sXG4gICAgXCJzaWx2ZXJcIjogWzE5MiwgMTkyLCAxOTJdLFxuICAgIFwidGVhbFwiOiBbMCwgMTI4LCAxMjhdLFxuICAgIFwid2hpdGVcIjogWzI1NSwgMjU1LCAyNTVdLFxuICAgIFwieWVsbG93XCI6IFsyNTUsIDI1NSwgMF1cbiAgfTtcbiAgLyoqXG4gICAgRnVuY3Rpb246IHRvUmdiXG4gICAgQ29udmVydCBhIHN0cmluZyBjb2xvciBpbnRvIGEgW3IsZyxiXSBudW1iZXIgYXJyYXkuXG5cbiAgICBQYXJhbWV0ZXJzOlxuICAgIGNvbG9yIC0gdGhlIGNvbG9yXG5cbiAgICBSZXR1cm5zOlxuICAgIEFuIGFycmF5IG9mIDMgbnVtYmVycyBbcixnLGJdIGJldHdlZW4gMCBhbmQgMjU1LlxuICAgKi9cbiAgc3RhdGljIHRvUmdiKGNvbG9yOiBDb2xvcik6IG51bWJlcltdIHtcbiAgICBpZiAodHlwZW9mIGNvbG9yID09PSBcIm51bWJlclwiKSB7XG4gICAgICByZXR1cm4gQ29sb3JVdGlscy50b1JnYkZyb21OdW1iZXIoPG51bWJlcj5jb2xvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBDb2xvclV0aWxzLnRvUmdiRnJvbVN0cmluZyg8U3RyaW5nPmNvbG9yKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICBGdW5jdGlvbjogdG9XZWJcbiAgICBDb252ZXJ0IGEgY29sb3IgaW50byBhIENTUyBjb2xvciBmb3JtYXQgKGFzIGEgc3RyaW5nKVxuICAgKi9cbiAgc3RhdGljIHRvV2ViKGNvbG9yOiBDb2xvcik6IHN0cmluZyB7XG4gICAgaWYgKHR5cGVvZiBjb2xvciA9PT0gXCJudW1iZXJcIikge1xuICAgICAgbGV0IHJldDogc3RyaW5nID0gY29sb3IudG9TdHJpbmcoMTYpO1xuICAgICAgbGV0IG1pc3NpbmdaZXJvZXM6IG51bWJlciA9IDYgLSByZXQubGVuZ3RoO1xuICAgICAgaWYgKG1pc3NpbmdaZXJvZXMgPiAwKSB7XG4gICAgICAgIHJldCA9IFwiMDAwMDAwXCIuc3Vic3RyKDAsIG1pc3NpbmdaZXJvZXMpICsgcmV0O1xuICAgICAgfVxuICAgICAgcmV0dXJuIFwiI1wiICsgcmV0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gPHN0cmluZz5jb2xvcjtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHN0YXRpYyB0b1JnYkZyb21OdW1iZXIoY29sb3I6IG51bWJlcik6IG51bWJlcltdIHtcbiAgICBsZXQgciA9IChjb2xvciAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICBsZXQgZyA9IChjb2xvciAmIDB4MDBGRjAwKSA+PiA4O1xuICAgIGxldCBiID0gY29sb3IgJiAweDAwMDBGRjtcbiAgICByZXR1cm4gW3IsIGcsIGJdO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgdG9SZ2JGcm9tU3RyaW5nKGNvbG9yOiBTdHJpbmcpOiBudW1iZXJbXSB7XG4gICAgY29sb3IgPSBjb2xvci50b0xvd2VyQ2FzZSgpO1xuICAgIGxldCBzdGRDb2xWYWx1ZXM6IG51bWJlcltdID0gQ29sb3JVdGlscy5zdGRDb2xbU3RyaW5nKGNvbG9yKV07XG4gICAgaWYgKHN0ZENvbFZhbHVlcykge1xuICAgICAgcmV0dXJuIHN0ZENvbFZhbHVlcztcbiAgICB9XG4gICAgaWYgKGNvbG9yLmNoYXJBdCgwKSA9PT0gXCIjXCIpIHtcbiAgICAgIC8vICNGRkYgb3IgI0ZGRkZGRiBmb3JtYXRcbiAgICAgIGlmIChjb2xvci5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgLy8gZXhwYW5kICNGRkYgdG8gI0ZGRkZGRlxuICAgICAgICBjb2xvciA9IFwiI1wiICsgY29sb3IuY2hhckF0KDEpICsgY29sb3IuY2hhckF0KDEpICsgY29sb3IuY2hhckF0KDIpXG4gICAgICAgICsgY29sb3IuY2hhckF0KDIpICsgY29sb3IuY2hhckF0KDMpICsgY29sb3IuY2hhckF0KDMpO1xuICAgICAgfVxuICAgICAgbGV0IHI6IG51bWJlciA9IHBhcnNlSW50KGNvbG9yLnN1YnN0cigxLCAyKSwgMTYpO1xuICAgICAgbGV0IGc6IG51bWJlciA9IHBhcnNlSW50KGNvbG9yLnN1YnN0cigzLCAyKSwgMTYpO1xuICAgICAgbGV0IGI6IG51bWJlciA9IHBhcnNlSW50KGNvbG9yLnN1YnN0cig1LCAyKSwgMTYpO1xuICAgICAgcmV0dXJuIFtyLCBnLCBiXTtcbiAgICB9IGVsc2UgaWYgKGNvbG9yLmluZGV4T2YoXCJyZ2IoXCIpID09PSAwKSB7XG4gICAgICAvLyByZ2IocixnLGIpIGZvcm1hdFxuICAgICAgbGV0IHJnYkxpc3QgPSBjb2xvci5zdWJzdHIoNCwgY29sb3IubGVuZ3RoIC0gNSkuc3BsaXQoXCIsXCIpO1xuICAgICAgcmV0dXJuIFtwYXJzZUludChyZ2JMaXN0WzBdLCAxMCksIHBhcnNlSW50KHJnYkxpc3RbMV0sIDEwKSwgcGFyc2VJbnQocmdiTGlzdFsyXSwgMTApXTtcbiAgICB9XG4gICAgcmV0dXJuIFswLCAwLCAwXTtcbiAgfVxuXG4gIC8qKlxuICAgIEZ1bmN0aW9uOiB0b051bWJlclxuICAgIENvbnZlcnQgYSBzdHJpbmcgY29sb3IgaW50byBhIG51bWJlci5cblxuICAgIFBhcmFtZXRlcnM6XG4gICAgY29sb3IgLSB0aGUgY29sb3JcblxuICAgIFJldHVybnM6XG4gICAgQSBudW1iZXIgYmV0d2VlbiAweDAwMDAwMCBhbmQgMHhGRkZGRkYuXG4gICAqL1xuICBzdGF0aWMgdG9OdW1iZXIoY29sb3I6IENvbG9yKTogbnVtYmVyIHtcbiAgICBpZiAodHlwZW9mIGNvbG9yID09PSBcIm51bWJlclwiKSB7XG4gICAgICByZXR1cm4gPG51bWJlcj5jb2xvcjtcbiAgICB9XG4gICAgbGV0IHNjb2w6IFN0cmluZyA9IDxTdHJpbmc+Y29sb3I7XG4gICAgaWYgKHNjb2wuY2hhckF0KDApID09PSBcIiNcIiAmJiBzY29sLmxlbmd0aCA9PT0gNykge1xuICAgICAgcmV0dXJuIHBhcnNlSW50KHNjb2wuc3Vic3RyKDEpLCAxNik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCByZ2IgPSBDb2xvclV0aWxzLnRvUmdiRnJvbVN0cmluZyhzY29sKTtcbiAgICAgIHJldHVybiByZ2JbMF0gKiA2NTUzNiArIHJnYlsxXSAqIDI1NiArIHJnYlsyXTtcbiAgICB9XG4gIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBQb3NpdGlvbiB7XG4gIHByaXZhdGUgX3g6IG51bWJlcjtcbiAgcHJpdmF0ZSBfeTogbnVtYmVyO1xuXG4gIHByaXZhdGUgc3RhdGljIG1heFdpZHRoOiBudW1iZXI7XG4gIHByaXZhdGUgc3RhdGljIG1heEhlaWdodDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgdGhpcy5feCA9IHg7XG4gICAgdGhpcy5feSA9IHk7XG4gIH1cblxuICBnZXQgeCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl94O1xuICB9XG5cbiAgZ2V0IHkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5feTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgc2V0TWF4VmFsdWVzKHc6IG51bWJlciwgaDogbnVtYmVyKSB7XG4gICAgUG9zaXRpb24ubWF4V2lkdGggPSB3O1xuICAgIFBvc2l0aW9uLm1heEhlaWdodCA9IGg7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGdldFJhbmRvbSh3aWR0aDogbnVtYmVyID0gLTEsIGhlaWdodDogbnVtYmVyID0gLTEpOiBQb3NpdGlvbiB7XG4gICAgaWYgKHdpZHRoID09PSAtMSkge1xuICAgICAgd2lkdGggPSBQb3NpdGlvbi5tYXhXaWR0aDtcbiAgICB9XG4gICAgaWYgKGhlaWdodCA9PT0gLTEpIHtcbiAgICAgIGhlaWdodCA9IFBvc2l0aW9uLm1heEhlaWdodDtcbiAgICB9XG4gICAgdmFyIHggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB3aWR0aCk7XG4gICAgdmFyIHkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBoZWlnaHQpO1xuICAgIHJldHVybiBuZXcgUG9zaXRpb24oeCwgeSk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGdldE5laWdoYm91cnMocG9zOiBQb3NpdGlvbiwgd2lkdGg6IG51bWJlciA9IC0xLCBoZWlnaHQ6IG51bWJlciA9IC0xLCBvbmx5Q2FyZGluYWw6IGJvb2xlYW4gPSBmYWxzZSk6IFBvc2l0aW9uW10ge1xuICAgIGlmICh3aWR0aCA9PT0gLTEpIHtcbiAgICAgIHdpZHRoID0gUG9zaXRpb24ubWF4V2lkdGg7XG4gICAgfVxuICAgIGlmIChoZWlnaHQgPT09IC0xKSB7XG4gICAgICBoZWlnaHQgPSBQb3NpdGlvbi5tYXhIZWlnaHQ7XG4gICAgfVxuICAgIGxldCB4ID0gcG9zLng7XG4gICAgbGV0IHkgPSBwb3MueTtcbiAgICBsZXQgcG9zaXRpb25zID0gW107XG4gICAgaWYgKHggPiAwKSB7XG4gICAgICBwb3NpdGlvbnMucHVzaChuZXcgUG9zaXRpb24oeCAtIDEsIHkpKTtcbiAgICB9XG4gICAgaWYgKHggPCB3aWR0aCAtIDEpIHtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbih4ICsgMSwgeSkpO1xuICAgIH1cbiAgICBpZiAoeSA+IDApIHtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbih4LCB5IC0gMSkpO1xuICAgIH1cbiAgICBpZiAoeSA8IGhlaWdodCAtIDEpIHtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbih4LCB5ICsgMSkpO1xuICAgIH1cbiAgICBpZiAoIW9ubHlDYXJkaW5hbCkge1xuICAgICAgaWYgKHggPiAwICYmIHkgPiAwKSB7XG4gICAgICAgIHBvc2l0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbih4IC0gMSwgeSAtIDEpKTtcbiAgICAgIH1cbiAgICAgIGlmICh4ID4gMCAmJiB5IDwgaGVpZ2h0IC0gMSkge1xuICAgICAgICBwb3NpdGlvbnMucHVzaChuZXcgUG9zaXRpb24oeCAtIDEsIHkgKyAxKSk7XG4gICAgICB9XG4gICAgICBpZiAoeCA8IHdpZHRoIC0gMSAmJiB5IDwgaGVpZ2h0IC0gMSkge1xuICAgICAgICBwb3NpdGlvbnMucHVzaChuZXcgUG9zaXRpb24oeCArIDEsIHkgKyAxKSk7XG4gICAgICB9XG4gICAgICBpZiAoeCA8IHdpZHRoIC0gMSAmJiB5ID4gMCkge1xuICAgICAgICBwb3NpdGlvbnMucHVzaChuZXcgUG9zaXRpb24oeCArIDEsIHkgLSAxKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwb3NpdGlvbnM7XG5cbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgZ2V0RGlyZWN0aW9ucyhvbmx5Q2FyZGluYWw6IGJvb2xlYW4gPSBmYWxzZSk6IFBvc2l0aW9uW10ge1xuICAgIGxldCBkaXJlY3Rpb25zOiBQb3NpdGlvbltdID0gW107XG5cbiAgICBkaXJlY3Rpb25zLnB1c2gobmV3IFBvc2l0aW9uKCAwLCAtMSkpO1xuICAgIGRpcmVjdGlvbnMucHVzaChuZXcgUG9zaXRpb24oIDAsICAxKSk7XG4gICAgZGlyZWN0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbigtMSwgIDApKTtcbiAgICBkaXJlY3Rpb25zLnB1c2gobmV3IFBvc2l0aW9uKCAxLCAgMCkpO1xuICAgIGlmICghb25seUNhcmRpbmFsKSB7XG4gICAgICBkaXJlY3Rpb25zLnB1c2gobmV3IFBvc2l0aW9uKC0xLCAtMSkpO1xuICAgICAgZGlyZWN0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbiggMSwgIDEpKTtcbiAgICAgIGRpcmVjdGlvbnMucHVzaChuZXcgUG9zaXRpb24oLTEsICAxKSk7XG4gICAgICBkaXJlY3Rpb25zLnB1c2gobmV3IFBvc2l0aW9uKCAxLCAtMSkpO1xuICAgIH1cblxuICAgIHJldHVybiBkaXJlY3Rpb25zO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBhZGQoYTogUG9zaXRpb24sIGI6IFBvc2l0aW9uKSB7XG4gICAgcmV0dXJuIG5ldyBQb3NpdGlvbihhLnggKyBiLngsIGEueSArIGIueSk7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGdldERpYWdvbmFsT2Zmc2V0cygpIHtcbiAgICByZXR1cm4gW1xuICAgICAge3g6IC0xLCB5OiAtMX0sIHt4OiAgMSwgeTogIC0xfSxcbiAgICAgIHt4OiAtMSwgeTogIDF9LCB7eDogIDEsIHk6ICAxfVxuICAgIF1cbiAgfVxufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9Db2xvcic7XG5leHBvcnQgKiBmcm9tICcuL1Bvc2l0aW9uJztcblxuZXhwb3J0IG5hbWVzcGFjZSBVdGlscyB7XG4gIC8vIENSQzMyIHV0aWxpdHkuIEFkYXB0ZWQgZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzE4NjM4OTAwL2phdmFzY3JpcHQtY3JjMzJcbiAgbGV0IGNyY1RhYmxlOiBudW1iZXJbXTtcbiAgZnVuY3Rpb24gbWFrZUNSQ1RhYmxlKCkge1xuICAgIGxldCBjOiBudW1iZXI7XG4gICAgY3JjVGFibGUgPSBbXTtcbiAgICBmb3IgKGxldCBuOiBudW1iZXIgPSAwOyBuIDwgMjU2OyBuKyspIHtcbiAgICAgIGMgPSBuO1xuICAgICAgZm9yIChsZXQgazogbnVtYmVyID0gMDsgayA8IDg7IGsrKykge1xuICAgICAgICBjID0gKChjICYgMSkgPyAoMHhFREI4ODMyMCBeIChjID4+PiAxKSkgOiAoYyA+Pj4gMSkpO1xuICAgICAgfVxuICAgICAgY3JjVGFibGVbbl0gPSBjO1xuICAgIH1cbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBidWlsZE1hdHJpeDxUPih3OiBudW1iZXIsIGg6IG51bWJlciwgdmFsdWU6IFQpOiBUW11bXSB7XG4gICAgbGV0IHJldDogVFtdW10gPSBbXTtcbiAgICBmb3IgKCBsZXQgeDogbnVtYmVyID0gMDsgeCA8IHc7ICsreCkge1xuICAgICAgcmV0W3hdID0gW107XG4gICAgICBmb3IgKCBsZXQgeTogbnVtYmVyID0gMDsgeSA8IGg7ICsreSkge1xuICAgICAgICByZXRbeF1beV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBjcmMzMihzdHI6IHN0cmluZyk6IG51bWJlciB7XG4gICAgaWYgKCFjcmNUYWJsZSkge1xuICAgICAgbWFrZUNSQ1RhYmxlKCk7XG4gICAgfVxuICAgIGxldCBjcmM6IG51bWJlciA9IDAgXiAoLTEpO1xuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDAsIGxlbjogbnVtYmVyID0gc3RyLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICBjcmMgPSAoY3JjID4+PiA4KSBeIGNyY1RhYmxlWyhjcmMgXiBzdHIuY2hhckNvZGVBdChpKSkgJiAweEZGXTtcbiAgICB9XG4gICAgcmV0dXJuIChjcmMgXiAoLTEpKSA+Pj4gMDtcbiAgfTtcblxuICBleHBvcnQgZnVuY3Rpb24gdG9DYW1lbENhc2UoaW5wdXQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGlucHV0LnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvKFxcYnxfKVxcdy9nLCBmdW5jdGlvbihtKSB7XG4gICAgICByZXR1cm4gbS50b1VwcGVyQ2FzZSgpLnJlcGxhY2UoL18vLCBcIlwiKTtcbiAgICB9KTtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZUd1aWQoKSB7XG4gICAgcmV0dXJuICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24oYykge1xuICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpKjE2fDAsIHYgPSBjID09ICd4JyA/IHIgOiAociYweDN8MHg4KTtcbiAgICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgICB9KTtcbiAgfVxuICBleHBvcnQgZnVuY3Rpb24gZ2V0UmFuZG9tKG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikge1xuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIGdldFJhbmRvbUluZGV4PFQ+KGFycmF5OiBUW10pOiBUIHtcbiAgICByZXR1cm4gYXJyYXlbZ2V0UmFuZG9tKDAsIGFycmF5Lmxlbmd0aCAtIDEpXTtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiByYW5kb21pemVBcnJheTxUPihhcnJheTogVFtdKTogVFtdIHtcbiAgICBpZiAoYXJyYXkubGVuZ3RoIDw9IDEpIHJldHVybiBhcnJheTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHJhbmRvbUNob2ljZUluZGV4ID0gZ2V0UmFuZG9tKGksIGFycmF5Lmxlbmd0aCAtIDEpO1xuXG4gICAgICBbYXJyYXlbaV0sIGFycmF5W3JhbmRvbUNob2ljZUluZGV4XV0gPSBbYXJyYXlbcmFuZG9tQ2hvaWNlSW5kZXhdLCBhcnJheVtpXV07XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycmF5O1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIGFwcGx5TWl4aW5zKGRlcml2ZWRDdG9yOiBhbnksIGJhc2VDdG9yczogYW55W10pIHtcbiAgICBiYXNlQ3RvcnMuZm9yRWFjaChiYXNlQ3RvciA9PiB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhiYXNlQ3Rvci5wcm90b3R5cGUpLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICAgIGRlcml2ZWRDdG9yLnByb3RvdHlwZVtuYW1lXSA9IGJhc2VDdG9yLnByb3RvdHlwZVtuYW1lXTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4uL2NvbXBvbmVudHMnO1xuaW1wb3J0ICogYXMgTWFwIGZyb20gJy4uL21hcCc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuL2luZGV4JztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlV2lseShlbmdpbmU6IEVuZ2luZSkge1xuICAgIGxldCB3aWx5ID0gbmV3IEVudGl0aWVzLkVudGl0eShlbmdpbmUsICdXaWx5JywgJ3BsYXllcicpO1xuICAgIHdpbHkuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQoZW5naW5lKSk7XG4gICAgd2lseS5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuUmVuZGVyYWJsZUNvbXBvbmVudChlbmdpbmUsIHtcbiAgICAgIGdseXBoOiBuZXcgTWFwLkdseXBoKCdAJywgMHhmZmZmZmYsIDB4MDAwMDAwKVxuICAgIH0pKTtcbiAgICB3aWx5LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5FbmVyZ3lDb21wb25lbnQoZW5naW5lKSk7XG4gICAgd2lseS5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuSW5wdXRDb21wb25lbnQoZW5naW5lKSk7XG4gICAgd2lseS5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuUnVuZVdyaXRlckNvbXBvbmVudChlbmdpbmUpKTtcbiAgICB3aWx5LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5IZWFsdGhDb21wb25lbnQoZW5naW5lKSk7XG5cbiAgICByZXR1cm4gd2lseTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJhdChlbmdpbmU6IEVuZ2luZSkge1xuICAgIGxldCByYXQgPSBuZXcgRW50aXRpZXMuRW50aXR5KGVuZ2luZSwgJ1JhdCcsICd2ZXJtaW4nKTtcbiAgICByYXQuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQoZW5naW5lKSk7XG4gICAgcmF0LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5SZW5kZXJhYmxlQ29tcG9uZW50KGVuZ2luZSwge1xuICAgICAgZ2x5cGg6IG5ldyBNYXAuR2x5cGgoJ3InLCAweGZmZmZmZiwgMHgwMDAwMDApXG4gICAgfSkpO1xuICAgIHJhdC5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuRW5lcmd5Q29tcG9uZW50KGVuZ2luZSkpO1xuICAgIHJhdC5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuUm9hbWluZ0FJQ29tcG9uZW50KGVuZ2luZSkpO1xuICAgIHJhdC5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuSGVhbHRoQ29tcG9uZW50KGVuZ2luZSkpO1xuXG4gICAgcmV0dXJuIHJhdDtcbn1cbiIsImltcG9ydCAqIGFzIENvbGxlY3Rpb25zIGZyb20gJ3R5cGVzY3JpcHQtY29sbGVjdGlvbnMnO1xuXG5pbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4uL2NvbXBvbmVudHMnO1xuaW1wb3J0ICogYXMgTWl4aW5zIGZyb20gJy4uL21peGlucyc7XG5cbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIEVudGl0eSBpbXBsZW1lbnRzIE1peGlucy5JRXZlbnRIYW5kbGVyIHtcbiAgLy8gRXZlbnRIYW5kbGVyIG1peGluXG4gIGxpc3RlbjogKGxpc3RlbmVyOiBFdmVudHMuTGlzdGVuZXIpID0+IEV2ZW50cy5MaXN0ZW5lcjtcbiAgcmVtb3ZlTGlzdGVuZXI6IChsaXN0ZW5lcjogRXZlbnRzLkxpc3RlbmVyKSA9PiB2b2lkO1xuICBlbWl0OiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gdm9pZDtcbiAgZmlyZTogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IGFueTtcbiAgaXM6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiBib29sZWFuO1xuICBnYXRoZXI6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiBhbnlbXTtcblxuICBwcml2YXRlIF90eXBlOiBzdHJpbmc7XG4gIGdldCB0eXBlKCkge1xuICAgIHJldHVybiB0aGlzLl90eXBlO1xuICB9XG5cbiAgcHJpdmF0ZSBfbmFtZTogc3RyaW5nO1xuICBnZXQgbmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fbmFtZTtcbiAgfVxuICBwcml2YXRlIF9ndWlkOiBzdHJpbmc7XG4gIGdldCBndWlkKCkge1xuICAgIHJldHVybiB0aGlzLl9ndWlkO1xuICB9XG4gIHByaXZhdGUgZW5naW5lOiBFbmdpbmU7XG4gIHByaXZhdGUgY29tcG9uZW50czogQ29tcG9uZW50cy5Db21wb25lbnRbXTtcblxuICBjb25zdHJ1Y3RvcihlbmdpbmU6IEVuZ2luZSwgbmFtZTogc3RyaW5nID0gJycsIHR5cGU6IHN0cmluZyA9ICcnKSB7XG4gICAgdGhpcy5lbmdpbmUgPSBlbmdpbmU7XG4gICAgdGhpcy5fZ3VpZCA9IENvcmUuVXRpbHMuZ2VuZXJhdGVHdWlkKCk7XG4gICAgdGhpcy5fbmFtZSA9IG5hbWU7XG4gICAgdGhpcy5fdHlwZSA9IHR5cGU7XG5cblxuICAgIHRoaXMuY29tcG9uZW50cyA9IFtdO1xuXG4gICAgdGhpcy5lbmdpbmUucmVnaXN0ZXJFbnRpdHkodGhpcyk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY29tcG9uZW50cy5mb3JFYWNoKChjb21wb25lbnQpID0+IHtcbiAgICAgIGNvbXBvbmVudC5kZXN0cm95KCk7XG4gICAgICBjb21wb25lbnQgPSBudWxsO1xuICAgIH0pO1xuICAgIHRoaXMuZW5naW5lLnJlbW92ZUVudGl0eSh0aGlzKTtcbiAgfVxuXG4gIGFkZENvbXBvbmVudChjb21wb25lbnQ6IENvbXBvbmVudHMuQ29tcG9uZW50LCBvcHRpb25zOiB7ZHVyYXRpb246IG51bWJlcn0gPSBudWxsKSB7XG4gICAgdGhpcy5jb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcbiAgICBjb21wb25lbnQucmVnaXN0ZXJFbnRpdHkodGhpcyk7XG5cbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmR1cmF0aW9uKSB7XG4gICAgICBjb25zdCBkZWxheWVkQ29tcG9uZW50UmVtb3ZlciA9IG5ldyBEZWxheWVkQ29tcG9uZW50UmVtb3ZlcigpO1xuICAgICAgZGVsYXllZENvbXBvbmVudFJlbW92ZXIudHJpZ2dlclR1cm4gPSB0aGlzLmVuZ2luZS5jdXJyZW50VHVybiArIG9wdGlvbnMuZHVyYXRpb247XG4gICAgICBkZWxheWVkQ29tcG9uZW50UmVtb3Zlci5lbnRpdHkgPSB0aGlzO1xuICAgICAgZGVsYXllZENvbXBvbmVudFJlbW92ZXIuZW5naW5lID0gdGhpcy5lbmdpbmU7XG4gICAgICBkZWxheWVkQ29tcG9uZW50UmVtb3Zlci5ndWlkID0gY29tcG9uZW50Lmd1aWQ7XG4gICAgICBkZWxheWVkQ29tcG9uZW50UmVtb3Zlci5saXN0ZW5lciA9IHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgICAndHVybicsXG4gICAgICAgIGRlbGF5ZWRDb21wb25lbnRSZW1vdmVyLmNoZWNrLmJpbmQoZGVsYXllZENvbXBvbmVudFJlbW92ZXIpXG4gICAgICApKTtcbiAgICB9XG4gIH1cblxuICBoYXNDb21wb25lbnQoY29tcG9uZW50VHlwZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHMuZmlsdGVyKChjb21wb25lbnQpID0+IHtcbiAgICAgIHJldHVybiBjb21wb25lbnQgaW5zdGFuY2VvZiBjb21wb25lbnRUeXBlO1xuICAgIH0pLmxlbmd0aCA+IDA7XG4gIH1cblxuICBnZXRDb21wb25lbnQoY29tcG9uZW50VHlwZSk6IENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgICBsZXQgY29tcG9uZW50ID0gdGhpcy5jb21wb25lbnRzLmZpbHRlcigoY29tcG9uZW50KSA9PiB7XG4gICAgICByZXR1cm4gY29tcG9uZW50IGluc3RhbmNlb2YgY29tcG9uZW50VHlwZTtcbiAgICB9KTtcbiAgICBpZiAoY29tcG9uZW50Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBjb21wb25lbnRbMF07XG4gIH1cblxuICByZW1vdmVDb21wb25lbnQoZ3VpZDogc3RyaW5nKSB7XG4gICAgY29uc3QgaWR4ID0gdGhpcy5jb21wb25lbnRzLmZpbmRJbmRleCgoY29tcG9uZW50KSA9PiB7XG4gICAgICByZXR1cm4gY29tcG9uZW50Lmd1aWQgPT09IGd1aWQ7XG4gICAgfSk7XG4gICAgaWYgKGlkeCA+PSAwKSB7XG4gICAgICB0aGlzLmNvbXBvbmVudHNbaWR4XS5kZXN0cm95KCk7XG4gICAgICB0aGlzLmNvbXBvbmVudHMuc3BsaWNlKGlkeCwgMSk7XG4gICAgfVxuICB9XG5cbn1cblxuY2xhc3MgRGVsYXllZENvbXBvbmVudFJlbW92ZXIge1xuICB0cmlnZ2VyVHVybjogbnVtYmVyO1xuICBsaXN0ZW5lcjogRXZlbnRzLkxpc3RlbmVyO1xuICBlbnRpdHk6IEVudGl0eTtcbiAgZW5naW5lOiBFbmdpbmU7XG4gIGd1aWQ6IHN0cmluZztcbiAgY2hlY2soZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGlmIChldmVudC5kYXRhLmN1cnJlbnRUdXJuID49IHRoaXMudHJpZ2dlclR1cm4pIHtcbiAgICAgIHRoaXMuZW50aXR5LnJlbW92ZUNvbXBvbmVudCh0aGlzLmd1aWQpO1xuICAgICAgdGhpcy5lbmdpbmUucmVtb3ZlTGlzdGVuZXIodGhpcy5saXN0ZW5lcik7XG4gICAgfVxuICB9XG59XG5cbkNvcmUuVXRpbHMuYXBwbHlNaXhpbnMoRW50aXR5LCBbTWl4aW5zLkV2ZW50SGFuZGxlcl0pO1xuIiwiZXhwb3J0ICogZnJvbSAnLi9DcmVhdG9yJztcbmV4cG9ydCAqIGZyb20gJy4vRW50aXR5JztcbiIsImV4cG9ydCBjbGFzcyBFdmVudCB7XG4gIHB1YmxpYyB0eXBlOiBzdHJpbmc7XG4gIHB1YmxpYyBkYXRhOiBhbnk7XG5cbiAgY29uc3RydWN0b3IodHlwZTogc3RyaW5nLCBkYXRhOiBhbnkgPSBudWxsKSB7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4vaW5kZXgnO1xuXG5leHBvcnQgY2xhc3MgTGlzdGVuZXIge1xuICBwdWJsaWMgdHlwZTogc3RyaW5nO1xuICBwdWJsaWMgcHJpb3JpdHk6IG51bWJlcjtcbiAgcHVibGljIGNhbGxiYWNrOiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gYW55O1xuICBwdWJsaWMgZ3VpZDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHR5cGU6IHN0cmluZywgY2FsbGJhY2s6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiBhbnksIHByaW9yaXR5OiBudW1iZXIgPSAxMDAsIGd1aWQ6IHN0cmluZyA9IG51bGwpIHtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMucHJpb3JpdHkgPSBwcmlvcml0eTtcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgdGhpcy5ndWlkID0gZ3VpZCB8fCBDb3JlLlV0aWxzLmdlbmVyYXRlR3VpZCgpO1xuICB9XG59XG4iLCJleHBvcnQgKiBmcm9tICcuL0V2ZW50JztcbmV4cG9ydCAqIGZyb20gJy4vSUxpc3RlbmVyJztcbmV4cG9ydCAqIGZyb20gJy4vTGlzdGVuZXInO1xuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcblxuZXhwb3J0IGNsYXNzIEZvViB7XG4gIHByaXZhdGUgdmlzaWJsaXR5Q2hlY2s6IChwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbikgPT4gYm9vbGVhbjtcbiAgcHJpdmF0ZSB3aWR0aDogbnVtYmVyO1xuICBwcml2YXRlIGhlaWdodDogbnVtYmVyO1xuICBwcml2YXRlIHJhZGl1czogbnVtYmVyO1xuICBcbiAgcHJpdmF0ZSBzdGFydFBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uO1xuICBwcml2YXRlIGxpZ2h0TWFwOiBudW1iZXJbXVtdO1xuXG4gIGNvbnN0cnVjdG9yKHZpc2libGl0eUNoZWNrOiAocG9zaXRpb246IENvcmUuUG9zaXRpb24pID0+IGJvb2xlYW4sIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCByYWRpdXM6IG51bWJlcikge1xuICAgIHRoaXMudmlzaWJsaXR5Q2hlY2sgPSB2aXNpYmxpdHlDaGVjaztcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XG4gIH1cblxuICBjYWxjdWxhdGUocG9zaXRpb246IENvcmUuUG9zaXRpb24pIHtcbiAgICB0aGlzLnN0YXJ0UG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICB0aGlzLmxpZ2h0TWFwID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeDxudW1iZXI+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCAwKTtcblxuICAgIGlmICghdGhpcy52aXNpYmxpdHlDaGVjayhwb3NpdGlvbikpIHtcbiAgICAgIHJldHVybiB0aGlzLmxpZ2h0TWFwO1xuICAgIH1cblxuICAgIHRoaXMubGlnaHRNYXBbcG9zaXRpb24ueF1bcG9zaXRpb24ueV0gPSAxO1xuICAgIENvcmUuUG9zaXRpb24uZ2V0RGlhZ29uYWxPZmZzZXRzKCkuZm9yRWFjaCgob2Zmc2V0KSA9PiB7XG4gICAgICB0aGlzLmNhc3RMaWdodCgxLCAxLjAsIDAuMCwgMCwgb2Zmc2V0LngsIG9mZnNldC55LCAwKTtcbiAgICAgIHRoaXMuY2FzdExpZ2h0KDEsIDEuMCwgMC4wLCBvZmZzZXQueCwgMCwgMCwgb2Zmc2V0LnkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMubGlnaHRNYXA7XG4gIH1cblxuICBwcml2YXRlIGNhc3RMaWdodChyb3c6IG51bWJlciwgc3RhcnQ6IG51bWJlciwgZW5kOiBudW1iZXIsIHh4OiBudW1iZXIsIHh5OiBudW1iZXIsIHl4OiBudW1iZXIsIHl5OiBudW1iZXIpIHtcbiAgICBsZXQgbmV3U3RhcnQgPSAwO1xuICAgIGxldCBibG9ja2VkID0gZmFsc2U7XG5cbiAgICBpZiAoc3RhcnQgPCBlbmQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBkaXN0YW5jZSA9IHJvdzsgZGlzdGFuY2UgPD0gdGhpcy5yYWRpdXMgJiYgIWJsb2NrZWQ7IGRpc3RhbmNlKyspIHtcbiAgICAgIGxldCBkZWx0YVkgPSAtZGlzdGFuY2U7XG4gICAgICBmb3IgKGxldCBkZWx0YVggPSAtZGlzdGFuY2U7IGRlbHRhWCA8PSAwOyBkZWx0YVgrKykge1xuICAgICAgICBsZXQgY3ggPSB0aGlzLnN0YXJ0UG9zaXRpb24ueCArIChkZWx0YVggKiB4eCkgKyAoZGVsdGFZICogeHkpO1xuICAgICAgICBsZXQgY3kgPSB0aGlzLnN0YXJ0UG9zaXRpb24ueSArIChkZWx0YVggKiB5eCkgKyAoZGVsdGFZICogeXkpO1xuXG4gICAgICAgIGxldCBsZWZ0U2xvcGUgPSAoZGVsdGFYIC0gMC41KSAvIChkZWx0YVkgKyAwLjUpO1xuICAgICAgICBsZXQgcmlnaHRTbG9wZSA9IChkZWx0YVggKyAwLjUpIC8gKGRlbHRhWSAtIDAuNSk7XG5cbiAgICAgICAgaWYgKCEoY3ggPj0gMCAmJiBjeSA+PSAwICYmIGN4IDwgdGhpcy53aWR0aCAmJiBjeSA8IHRoaXMuaGVpZ2h0KSB8fCBzdGFydCA8IHJpZ2h0U2xvcGUpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIGlmIChlbmQgPiBsZWZ0U2xvcGUpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkaXN0ID0gTWF0aC5tYXgoTWF0aC5hYnMoZGVsdGFYKSwgTWF0aC5hYnMoZGVsdGFZKSk7XG5cbiAgICAgICAgaWYgKGRpc3QgPD0gdGhpcy5yYWRpdXMpIHtcbiAgICAgICAgICB0aGlzLmxpZ2h0TWFwW2N4XVtjeV0gPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJsb2NrZWQpIHtcbiAgICAgICAgICBpZiAoIXRoaXMudmlzaWJsaXR5Q2hlY2sobmV3IENvcmUuUG9zaXRpb24oY3gsIGN5KSkpIHtcbiAgICAgICAgICAgIG5ld1N0YXJ0ID0gcmlnaHRTbG9wZTtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBibG9ja2VkID0gZmFsc2U7XG4gICAgICAgICAgICBzdGFydCA9IG5ld1N0YXJ0O1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy52aXNpYmxpdHlDaGVjayhuZXcgQ29yZS5Qb3NpdGlvbihjeCwgY3kpKSAmJiBkaXN0YW5jZSA8PSB0aGlzLnJhZGl1cykge1xuICAgICAgICAgIGJsb2NrZWQgPSB0cnVlO1xuICAgICAgICAgIHRoaXMuY2FzdExpZ2h0KGRpc3RhbmNlICsgMSwgc3RhcnQsIGxlZnRTbG9wZSwgeHgsIHh5LCB5eCwgeXkpO1xuICAgICAgICAgIG5ld1N0YXJ0ID0gcmlnaHRTbG9wZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuXG5leHBvcnQgY2xhc3MgR2x5cGgge1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRlVMTDogbnVtYmVyID0gMjE5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU1BBQ0U6IG51bWJlciA9IDMyO1xuXHQvLyBzaW5nbGUgd2FsbHNcblx0cHVibGljIHN0YXRpYyBDSEFSX0hMSU5FOiBudW1iZXIgPSAxOTY7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9WTElORTogbnVtYmVyID0gMTc5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU1c6IG51bWJlciA9IDE5MTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1NFOiBudW1iZXIgPSAyMTg7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9OVzogbnVtYmVyID0gMjE3O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfTkU6IG51bWJlciA9IDE5Mjtcblx0cHVibGljIHN0YXRpYyBDSEFSX1RFRVc6IG51bWJlciA9IDE4MDtcblx0cHVibGljIHN0YXRpYyBDSEFSX1RFRUU6IG51bWJlciA9IDE5NTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1RFRU46IG51bWJlciA9IDE5Mztcblx0cHVibGljIHN0YXRpYyBDSEFSX1RFRVM6IG51bWJlciA9IDE5NDtcblx0cHVibGljIHN0YXRpYyBDSEFSX0NST1NTOiBudW1iZXIgPSAxOTc7XG5cdC8vIGRvdWJsZSB3YWxsc1xuXHRwdWJsaWMgc3RhdGljIENIQVJfREhMSU5FOiBudW1iZXIgPSAyMDU7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9EVkxJTkU6IG51bWJlciA9IDE4Njtcblx0cHVibGljIHN0YXRpYyBDSEFSX0RORTogbnVtYmVyID0gMTg3O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRE5XOiBudW1iZXIgPSAyMDE7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9EU0U6IG51bWJlciA9IDE4ODtcblx0cHVibGljIHN0YXRpYyBDSEFSX0RTVzogbnVtYmVyID0gMjAwO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRFRFRVc6IG51bWJlciA9IDE4NTtcblx0cHVibGljIHN0YXRpYyBDSEFSX0RURUVFOiBudW1iZXIgPSAyMDQ7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9EVEVFTjogbnVtYmVyID0gMjAyO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRFRFRVM6IG51bWJlciA9IDIwMztcblx0cHVibGljIHN0YXRpYyBDSEFSX0RDUk9TUzogbnVtYmVyID0gMjA2O1xuXHQvLyBibG9ja3MgXG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9CTE9DSzE6IG51bWJlciA9IDE3Njtcblx0cHVibGljIHN0YXRpYyBDSEFSX0JMT0NLMjogbnVtYmVyID0gMTc3O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQkxPQ0szOiBudW1iZXIgPSAxNzg7XG5cdC8vIGFycm93cyBcblx0cHVibGljIHN0YXRpYyBDSEFSX0FSUk9XX046IG51bWJlciA9IDI0O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQVJST1dfUzogbnVtYmVyID0gMjU7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9BUlJPV19FOiBudW1iZXIgPSAyNjtcblx0cHVibGljIHN0YXRpYyBDSEFSX0FSUk9XX1c6IG51bWJlciA9IDI3O1xuXHQvLyBhcnJvd3Mgd2l0aG91dCB0YWlsIFxuXHRwdWJsaWMgc3RhdGljIENIQVJfQVJST1cyX046IG51bWJlciA9IDMwO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQVJST1cyX1M6IG51bWJlciA9IDMxO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQVJST1cyX0U6IG51bWJlciA9IDE2O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQVJST1cyX1c6IG51bWJlciA9IDE3O1xuXHQvLyBkb3VibGUgYXJyb3dzIFxuXHRwdWJsaWMgc3RhdGljIENIQVJfREFSUk9XX0g6IG51bWJlciA9IDI5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfREFSUk9XX1Y6IG51bWJlciA9IDE4O1xuXHQvLyBHVUkgc3R1ZmYgXG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9DSEVDS0JPWF9VTlNFVDogbnVtYmVyID0gMjI0O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQ0hFQ0tCT1hfU0VUOiBudW1iZXIgPSAyMjU7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9SQURJT19VTlNFVDogbnVtYmVyID0gOTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1JBRElPX1NFVDogbnVtYmVyID0gMTA7XG5cdC8vIHN1Yi1waXhlbCByZXNvbHV0aW9uIGtpdCBcblx0cHVibGljIHN0YXRpYyBDSEFSX1NVQlBfTlc6IG51bWJlciA9IDIyNjtcblx0cHVibGljIHN0YXRpYyBDSEFSX1NVQlBfTkU6IG51bWJlciA9IDIyNztcblx0cHVibGljIHN0YXRpYyBDSEFSX1NVQlBfTjogbnVtYmVyID0gMjI4O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU1VCUF9TRTogbnVtYmVyID0gMjI5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU1VCUF9ESUFHOiBudW1iZXIgPSAyMzA7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9TVUJQX0U6IG51bWJlciA9IDIzMTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1NVQlBfU1c6IG51bWJlciA9IDIzMjtcblx0Ly8gbWlzY2VsbGFuZW91cyBcblx0cHVibGljIHN0YXRpYyBDSEFSX1NNSUxJRSA6IG51bWJlciA9ICAxO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU01JTElFX0lOViA6IG51bWJlciA9ICAyO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfSEVBUlQgOiBudW1iZXIgPSAgMztcblx0cHVibGljIHN0YXRpYyBDSEFSX0RJQU1PTkQgOiBudW1iZXIgPSAgNDtcblx0cHVibGljIHN0YXRpYyBDSEFSX0NMVUIgOiBudW1iZXIgPSAgNTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1NQQURFIDogbnVtYmVyID0gIDY7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9CVUxMRVQgOiBudW1iZXIgPSAgNztcblx0cHVibGljIHN0YXRpYyBDSEFSX0JVTExFVF9JTlYgOiBudW1iZXIgPSAgODtcblx0cHVibGljIHN0YXRpYyBDSEFSX01BTEUgOiBudW1iZXIgPSAgMTE7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9GRU1BTEUgOiBudW1iZXIgPSAgMTI7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9OT1RFIDogbnVtYmVyID0gIDEzO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfTk9URV9ET1VCTEUgOiBudW1iZXIgPSAgMTQ7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9MSUdIVCA6IG51bWJlciA9ICAxNTtcblx0cHVibGljIHN0YXRpYyBDSEFSX0VYQ0xBTV9ET1VCTEUgOiBudW1iZXIgPSAgMTk7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9QSUxDUk9XIDogbnVtYmVyID0gIDIwO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU0VDVElPTiA6IG51bWJlciA9ICAyMTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1BPVU5EIDogbnVtYmVyID0gIDE1Njtcblx0cHVibGljIHN0YXRpYyBDSEFSX01VTFRJUExJQ0FUSU9OIDogbnVtYmVyID0gIDE1ODtcblx0cHVibGljIHN0YXRpYyBDSEFSX0ZVTkNUSU9OIDogbnVtYmVyID0gIDE1OTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1JFU0VSVkVEIDogbnVtYmVyID0gIDE2OTtcblx0cHVibGljIHN0YXRpYyBDSEFSX0hBTEYgOiBudW1iZXIgPSAgMTcxO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfT05FX1FVQVJURVIgOiBudW1iZXIgPSAgMTcyO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQ09QWVJJR0hUIDogbnVtYmVyID0gIDE4NDtcblx0cHVibGljIHN0YXRpYyBDSEFSX0NFTlQgOiBudW1iZXIgPSAgMTg5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfWUVOIDogbnVtYmVyID0gIDE5MDtcblx0cHVibGljIHN0YXRpYyBDSEFSX0NVUlJFTkNZIDogbnVtYmVyID0gIDIwNztcblx0cHVibGljIHN0YXRpYyBDSEFSX1RIUkVFX1FVQVJURVJTIDogbnVtYmVyID0gIDI0Mztcblx0cHVibGljIHN0YXRpYyBDSEFSX0RJVklTSU9OIDogbnVtYmVyID0gIDI0Njtcblx0cHVibGljIHN0YXRpYyBDSEFSX0dSQURFIDogbnVtYmVyID0gIDI0ODtcblx0cHVibGljIHN0YXRpYyBDSEFSX1VNTEFVVCA6IG51bWJlciA9ICAyNDk7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9QT1cxIDogbnVtYmVyID0gIDI1MTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1BPVzMgOiBudW1iZXIgPSAgMjUyO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfUE9XMiA6IG51bWJlciA9ICAyNTM7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9CVUxMRVRfU1FVQVJFIDogbnVtYmVyID0gIDI1NDtcblxuICBwcml2YXRlIF9nbHlwaDogbnVtYmVyO1xuICBnZXQgZ2x5cGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dseXBoO1xuICB9XG4gIHByaXZhdGUgX2ZvcmVncm91bmRDb2xvcjogQ29yZS5Db2xvcjtcbiAgZ2V0IGZvcmVncm91bmRDb2xvcigpIHtcbiAgICByZXR1cm4gdGhpcy5fZm9yZWdyb3VuZENvbG9yO1xuICB9XG4gIHByaXZhdGUgX2JhY2tncm91bmRDb2xvcjogQ29yZS5Db2xvcjtcbiAgZ2V0IGJhY2tncm91bmRDb2xvcigpIHtcbiAgICByZXR1cm4gdGhpcy5fYmFja2dyb3VuZENvbG9yO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZzogc3RyaW5nIHwgbnVtYmVyID0gR2x5cGguQ0hBUl9TUEFDRSwgZjogQ29yZS5Db2xvciA9IDB4ZmZmZmZmLCBiOiBDb3JlLkNvbG9yID0gMHgwMDAwMDApIHtcbiAgICB0aGlzLl9nbHlwaCA9IHR5cGVvZiBnID09PSAnc3RyaW5nJyA/IGcuY2hhckNvZGVBdCgwKSA6IGc7XG4gICAgdGhpcy5fZm9yZWdyb3VuZENvbG9yID0gZjtcbiAgICB0aGlzLl9iYWNrZ3JvdW5kQ29sb3IgPSBiO1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgX01hcCBmcm9tICcuL2luZGV4JztcblxuZXhwb3J0IGNsYXNzIE1hcCB7XG4gIHByaXZhdGUgX3dpZHRoO1xuICBnZXQgd2lkdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3dpZHRoO1xuICB9XG4gIHByaXZhdGUgX2hlaWdodDtcbiAgZ2V0IGhlaWdodCgpIHtcbiAgICByZXR1cm4gdGhpcy5faGVpZ2h0O1xuICB9XG4gIHB1YmxpYyB0aWxlczogX01hcC5UaWxlW11bXTtcblxuICBjb25zdHJ1Y3Rvcih3OiBudW1iZXIsIGg6IG51bWJlcikge1xuICAgIHRoaXMuX3dpZHRoID0gdztcbiAgICB0aGlzLl9oZWlnaHQgPSBoO1xuICAgIHRoaXMudGlsZXMgPSBbXTtcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMuX3dpZHRoOyB4KyspIHtcbiAgICAgIHRoaXMudGlsZXNbeF0gPSBbXTtcbiAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5faGVpZ2h0OyB5KyspIHtcbiAgICAgICAgdGhpcy50aWxlc1t4XVt5XSA9IF9NYXAuVGlsZS5jcmVhdGVUaWxlKF9NYXAuVGlsZS5FTVBUWSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0VGlsZShwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbik6IF9NYXAuVGlsZSB7XG4gICAgcmV0dXJuIHRoaXMudGlsZXNbcG9zaXRpb24ueF1bcG9zaXRpb24ueV07XG4gIH1cblxuICBzZXRUaWxlKHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uLCB0aWxlOiBfTWFwLlRpbGUpIHtcbiAgICB0aGlzLnRpbGVzW3Bvc2l0aW9uLnhdW3Bvc2l0aW9uLnldID0gdGlsZTtcbiAgfVxuXG4gIGZvckVhY2goY2FsbGJhY2s6IChwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbiwgdGlsZTogX01hcC5UaWxlKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLl9oZWlnaHQ7IHkrKykge1xuICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLl93aWR0aDsgeCsrKSB7XG4gICAgICAgIGNhbGxiYWNrKG5ldyBDb3JlLlBvc2l0aW9uKHgsIHkpLCB0aGlzLnRpbGVzW3hdW3ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpc1dhbGthYmxlKHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMudGlsZXNbcG9zaXRpb24ueF1bcG9zaXRpb24ueV0ud2Fsa2FibGU7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuLi9lbnRpdGllcyc7XG5pbXBvcnQgKiBhcyBNYXAgZnJvbSAnLi9pbmRleCc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGlsZURlc2NyaXB0aW9uIHtcbiAgZ2x5cGg6IE1hcC5HbHlwaCB8IE1hcC5HbHlwaFtdO1xuICB3YWxrYWJsZTogYm9vbGVhbjtcbiAgYmxvY2tzU2lnaHQ6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBjbGFzcyBUaWxlIHtcbiAgcHVibGljIGdseXBoOiBNYXAuR2x5cGg7XG4gIHB1YmxpYyB3YWxrYWJsZTogYm9vbGVhbjtcbiAgcHVibGljIGJsb2Nrc1NpZ2h0OiBib29sZWFuO1xuICBwdWJsaWMgZW50aXR5OiBFbnRpdGllcy5FbnRpdHk7XG4gIHB1YmxpYyBwcm9wczoge1tndWlkOiBzdHJpbmddOiBFbnRpdGllcy5FbnRpdHl9O1xuXG4gIHB1YmxpYyBzdGF0aWMgRU1QVFk6IFRpbGVEZXNjcmlwdGlvbiA9IHtcbiAgICBnbHlwaDogbmV3IE1hcC5HbHlwaChNYXAuR2x5cGguQ0hBUl9TUEFDRSwgMHgwMDAwMDAsIDB4MDAwMDAwKSxcbiAgICB3YWxrYWJsZTogZmFsc2UsXG4gICAgYmxvY2tzU2lnaHQ6IHRydWUsXG4gIH07XG5cbiAgcHVibGljIHN0YXRpYyBGTE9PUjogVGlsZURlc2NyaXB0aW9uID0ge1xuICAgIGdseXBoOiBbXG4gICAgICBuZXcgTWFwLkdseXBoKCcuJywgMHgzYTQ0NDQsIDB4MjIyMjIyKSxcbiAgICAgIG5ldyBNYXAuR2x5cGgoJy4nLCAweDQ0M2E0NCwgMHgyMjIyMjIpLFxuICAgICAgbmV3IE1hcC5HbHlwaCgnLicsIDB4NDQ0NDNhLCAweDIyMjIyMiksXG4gICAgICBuZXcgTWFwLkdseXBoKCcsJywgMHgzYTQ0NDQsIDB4MjIyMjIyKSxcbiAgICAgIG5ldyBNYXAuR2x5cGgoJywnLCAweDQ0M2E0NCwgMHgyMjIyMjIpLFxuICAgICAgbmV3IE1hcC5HbHlwaCgnLCcsIDB4NDQ0NDNhLCAweDIyMjIyMilcbiAgICBdLFxuICAgIHdhbGthYmxlOiB0cnVlLFxuICAgIGJsb2Nrc1NpZ2h0OiBmYWxzZSxcbiAgfTtcblxuICBwdWJsaWMgc3RhdGljIFdBTEw6IFRpbGVEZXNjcmlwdGlvbiA9IHtcbiAgICBnbHlwaDogbmV3IE1hcC5HbHlwaChNYXAuR2x5cGguQ0hBUl9CTE9DSzMsIDB4ZGRkZGRkLCAweDExMTExMSksXG4gICAgd2Fsa2FibGU6IGZhbHNlLFxuICAgIGJsb2Nrc1NpZ2h0OiB0cnVlLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKGdseXBoOiBNYXAuR2x5cGgsIHdhbGthYmxlOiBib29sZWFuLCBibG9ja3NTaWdodDogYm9vbGVhbikge1xuICAgIHRoaXMuZ2x5cGggPSBnbHlwaDtcbiAgICB0aGlzLndhbGthYmxlID0gd2Fsa2FibGU7XG4gICAgdGhpcy5ibG9ja3NTaWdodCA9IGJsb2Nrc1NpZ2h0O1xuICAgIHRoaXMuZW50aXR5ID0gbnVsbDtcbiAgICB0aGlzLnByb3BzID0ge307XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGNyZWF0ZVRpbGUoZGVzYzogVGlsZURlc2NyaXB0aW9uKSB7XG4gICAgdmFyIGc6IE1hcC5HbHlwaCA9IG51bGw7XG4gICAgaWYgKCg8QXJyYXk8TWFwLkdseXBoPj5kZXNjLmdseXBoKS5sZW5ndGggJiYgKDxBcnJheTxNYXAuR2x5cGg+PmRlc2MuZ2x5cGgpLmxlbmd0aCA+IDApIHtcbiAgICAgIGcgPSA8TWFwLkdseXBoPkNvcmUuVXRpbHMuZ2V0UmFuZG9tSW5kZXgoPEFycmF5PE1hcC5HbHlwaD4+ZGVzYy5nbHlwaCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGcgPSA8TWFwLkdseXBoPmRlc2MuZ2x5cGg7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGlsZShnLCBkZXNjLndhbGthYmxlLCBkZXNjLmJsb2Nrc1NpZ2h0KTtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcblxuZW51bSBEaXJlY3Rpb24ge1xuICBOb25lID0gMSxcbiAgTm9ydGgsXG4gIEVhc3QsXG4gIFNvdXRoLFxuICBXZXN0LFxufVxuXG5leHBvcnQgbmFtZXNwYWNlIFV0aWxzIHtcbiAgZnVuY3Rpb24gY2FydmVhYmxlKG1hcDogbnVtYmVyW11bXSwgcG9zaXRpb246IENvcmUuUG9zaXRpb24pIHtcbiAgICBpZiAocG9zaXRpb24ueCA8IDAgfHwgcG9zaXRpb24ueCA+IG1hcC5sZW5ndGggLSAxKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChwb3NpdGlvbi55IDwgMCB8fCBwb3NpdGlvbi55ID4gbWFwWzBdLmxlbmd0aCAtIDEpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIG1hcFtwb3NpdGlvbi54XVtwb3NpdGlvbi55XSA9PT0gMTtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBmaW5kQ2FydmVhYmxlU3BvdChtYXA6IG51bWJlcltdW10pIHtcbiAgICBjb25zdCB3aWR0aCA9IG1hcC5sZW5ndGg7XG4gICAgY29uc3QgaGVpZ2h0ID0gbWFwWzBdLmxlbmd0aDtcblxuICAgIGxldCBwb3NpdGlvbiA9IG51bGw7XG5cbiAgICBsZXQgY2FydmFibGVzUG9zaXRpb25zID0gW107XG5cbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcbiAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgbGV0IHBvc2l0aW9uID0gbmV3IENvcmUuUG9zaXRpb24oQ29yZS5VdGlscy5nZXRSYW5kb20oMCwgd2lkdGgpLCBDb3JlLlV0aWxzLmdldFJhbmRvbSgwLCBoZWlnaHQpKTtcbiAgICAgICAgaWYgKFV0aWxzLmNhbkNhcnZlKG1hcCwgcG9zaXRpb24sIDAsIHRydWUpKSB7XG4gICAgICAgICAgY2FydmFibGVzUG9zaXRpb25zLnB1c2gocG9zaXRpb24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNhcnZhYmxlc1Bvc2l0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gQ29yZS5VdGlscy5nZXRSYW5kb21JbmRleChjYXJ2YWJsZXNQb3NpdGlvbnMpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBjb3VudFN1cnJvdW5kaW5nVGlsZXMobWFwOiBudW1iZXJbXVtdLCBwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbiwgY2hlY2tEaWFnb25hbHM6IGJvb2xlYW4gPSBmYWxzZSk6IG51bWJlciB7XG4gICAgbGV0IGNvbm5lY3Rpb25zID0gMDtcbiAgICByZXR1cm4gQ29yZS5Qb3NpdGlvbi5nZXROZWlnaGJvdXJzKHBvc2l0aW9uLCBtYXAubGVuZ3RoLCBtYXBbMF0ubGVuZ3RoLCAhY2hlY2tEaWFnb25hbHMpLmZpbHRlcigocG9zKSA9PiB7XG4gICAgICByZXR1cm4gbWFwW3Bvcy54XVtwb3MueV0gPT09IDA7XG4gICAgfSkubGVuZ3RoO1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIGNhbkNhcnZlKG1hcDogbnVtYmVyW11bXSwgcG9zaXRpb246IENvcmUuUG9zaXRpb24sIGFsbG93ZWRDb25uZWN0aW9uczogbnVtYmVyID0gMCwgY2hlY2tEaWFnb25hbHM6IGJvb2xlYW4gPSBmYWxzZSk6IGJvb2xlYW4ge1xuICAgIGlmICghY2FydmVhYmxlKG1hcCwgcG9zaXRpb24pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNvdW50U3Vycm91bmRpbmdUaWxlcyhtYXAsIHBvc2l0aW9uLCBjaGVja0RpYWdvbmFscykgPD0gYWxsb3dlZENvbm5lY3Rpb25zO1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIGNhbkV4dGVuZFR1bm5lbChtYXA6IG51bWJlcltdW10sIHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uKSB7XG4gICAgaWYgKCFjYXJ2ZWFibGUobWFwLCBwb3NpdGlvbikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgbGV0IGNvbm5lY3RlZEZyb20gPSBEaXJlY3Rpb24uTm9uZTtcbiAgICBsZXQgY29ubmVjdGlvbnMgPSAwO1xuXG4gICAgaWYgKHBvc2l0aW9uLnkgPiAwICYmIG1hcFtwb3NpdGlvbi54XVtwb3NpdGlvbi55IC0gMV0gPT09IDApIHtcbiAgICAgIGNvbm5lY3RlZEZyb20gPSBEaXJlY3Rpb24uTm9ydGg7XG4gICAgICBjb25uZWN0aW9ucysrO1xuICAgIH1cbiAgICBpZiAocG9zaXRpb24ueSA8IG1hcFswXS5sZW5ndGggLSAxICYmIG1hcFtwb3NpdGlvbi54XVtwb3NpdGlvbi55ICsgMV0gPT09IDApIHtcbiAgICAgIGNvbm5lY3RlZEZyb20gPSBEaXJlY3Rpb24uU291dGg7XG4gICAgICBjb25uZWN0aW9ucysrO1xuICAgIH1cbiAgICBpZiAocG9zaXRpb24ueCA+IDAgJiYgbWFwW3Bvc2l0aW9uLnggLSAxXVtwb3NpdGlvbi55XSA9PT0gMCkge1xuICAgICAgY29ubmVjdGVkRnJvbSA9IERpcmVjdGlvbi5XZXN0O1xuICAgICAgY29ubmVjdGlvbnMrKztcbiAgICB9XG4gICAgaWYgKHBvc2l0aW9uLnggPCBtYXAubGVuZ3RoIC0gMSAmJiBtYXBbcG9zaXRpb24ueCArIDFdW3Bvc2l0aW9uLnldID09PSAwKSB7XG4gICAgICBjb25uZWN0ZWRGcm9tID0gRGlyZWN0aW9uLkVhc3Q7XG4gICAgICBjb25uZWN0aW9ucysrO1xuICAgIH1cblxuICAgIGlmIChjb25uZWN0aW9ucyA+IDEpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2FuRXh0ZW5kVHVubmVsRnJvbShtYXAsIHBvc2l0aW9uLCBjb25uZWN0ZWRGcm9tKTtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBjYW5FeHRlbmRUdW5uZWxGcm9tKG1hcDogbnVtYmVyW11bXSwgcG9zaXRpb246IENvcmUuUG9zaXRpb24sIGRpcmVjdGlvbjogRGlyZWN0aW9uKSB7XG4gICAgaWYgKG1hcFtwb3NpdGlvbi54XVtwb3NpdGlvbi55XSA9PT0gMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHN3aXRjaCAoZGlyZWN0aW9uKSB7XG4gICAgICBjYXNlIERpcmVjdGlvbi5Tb3V0aDpcbiAgICAgICAgcmV0dXJuIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLnggLSAxLCBwb3NpdGlvbi55KSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54IC0gMSwgcG9zaXRpb24ueSAtIDEpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgLSAxKSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54ICsgMSwgcG9zaXRpb24ueSAtIDEpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLnggKyAxLCBwb3NpdGlvbi55KSk7XG4gICAgICBjYXNlIERpcmVjdGlvbi5Ob3J0aDpcbiAgICAgICAgcmV0dXJuIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLnggKyAxLCBwb3NpdGlvbi55KSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54ICsgMSwgcG9zaXRpb24ueSArIDEpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgKyAxKSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54IC0gMSwgcG9zaXRpb24ueSArIDEpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLnggLSAxLCBwb3NpdGlvbi55KSk7XG4gICAgICBjYXNlIERpcmVjdGlvbi5XZXN0OlxuICAgICAgICByZXR1cm4gY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCwgcG9zaXRpb24ueSAtIDEpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLnggKyAxLCBwb3NpdGlvbi55IC0gMSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCArIDEsIHBvc2l0aW9uLnkpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLnggKyAxLCBwb3NpdGlvbi55ICsgMSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCwgcG9zaXRpb24ueSArIDEpKTtcbiAgICAgIGNhc2UgRGlyZWN0aW9uLkVhc3Q6XG4gICAgICAgIHJldHVybiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54LCBwb3NpdGlvbi55IC0gMSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCAtIDEsIHBvc2l0aW9uLnkgLSAxKSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54IC0gMSwgcG9zaXRpb24ueSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCAtIDEsIHBvc2l0aW9uLnkgKyAxKSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54LCBwb3NpdGlvbi55ICsgMSkpO1xuICAgICAgY2FzZSBEaXJlY3Rpb24uTm9uZTpcbiAgICAgICAgcmV0dXJuIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgLSAxKSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54IC0gMSwgcG9zaXRpb24ueSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCwgcG9zaXRpb24ueSArIDEpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLnggKyAxLCBwb3NpdGlvbi55KSk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi8uLi9jb3JlJztcbmltcG9ydCAqIGFzIE1hcCBmcm9tICcuLi9pbmRleCc7XG5pbXBvcnQgKiBhcyBFeGNlcHRpb25zIGZyb20gJy4uLy4uL0V4Y2VwdGlvbnMnO1xuXG5leHBvcnQgY2xhc3MgRHVuZ2VvbkdlbmVyYXRvciB7XG4gIHByaXZhdGUgd2lkdGg6IG51bWJlcjtcbiAgcHJpdmF0ZSBoZWlnaHQ6IG51bWJlcjtcblxuICBwcml2YXRlIGJhY2tncm91bmRDb2xvcjogQ29yZS5Db2xvcjtcbiAgcHJpdmF0ZSBmb3JlZ3JvdW5kQ29sb3I6IENvcmUuQ29sb3I7XG5cbiAgY29uc3RydWN0b3Iod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IDB4MDAwMDAwO1xuICAgIHRoaXMuZm9yZWdyb3VuZENvbG9yID0gMHhhYWFhYWE7XG4gIH1cblxuICBwcml2YXRlIGdlbmVyYXRlTWFwKCk6IG51bWJlcltdW10ge1xuICAgIGxldCBjZWxsczogbnVtYmVyW11bXSA9IENvcmUuVXRpbHMuYnVpbGRNYXRyaXgodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIDEpO1xuICAgIGxldCByb29tR2VuZXJhdG9yID0gbmV3IE1hcC5Sb29tR2VuZXJhdG9yKGNlbGxzKTtcblxuICAgIHJvb21HZW5lcmF0b3IuZ2VuZXJhdGUoKTtcbiAgICBjZWxscyA9IHJvb21HZW5lcmF0b3IuZ2V0Q2VsbHMoKTtcblxuICAgIGxldCBtYXplR2VuZXJhdG9yID0gbmV3IE1hcC5NYXplUmVjdXJzaXZlQmFja3RyYWNrR2VuZXJhdG9yKGNlbGxzKTtcbiAgICBtYXplR2VuZXJhdG9yLmdlbmVyYXRlKCk7XG4gICAgY2VsbHMgPSBtYXplR2VuZXJhdG9yLmdldENlbGxzKCk7XG5cbiAgICBjZWxscyA9IG1hemVHZW5lcmF0b3IuZ2V0Q2VsbHMoKTtcblxuICAgIGxldCB0b3BvbG9neUNvbWJpbmF0b3IgPSBuZXcgTWFwLlRvcG9sb2d5Q29tYmluYXRvcihjZWxscyk7XG4gICAgdG9wb2xvZ3lDb21iaW5hdG9yLmluaXRpYWxpemUoKTtcbiAgICBsZXQgcmVtYWluaW5nVG9wb2xvZ2llcyA9IHRvcG9sb2d5Q29tYmluYXRvci5jb21iaW5lKCk7XG4gICAgaWYgKHJlbWFpbmluZ1RvcG9sb2dpZXMgPiA1KSB7XG4gICAgICBjb25zb2xlLmxvZygncmVtYWluaW5nIHRvcG9sb2dpZXMnLCByZW1haW5pbmdUb3BvbG9naWVzKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0b3BvbG9neUNvbWJpbmF0b3IucHJ1bmVEZWFkRW5kcygpO1xuXG4gICAgcmV0dXJuIHRvcG9sb2d5Q29tYmluYXRvci5nZXRDZWxscygpO1xuICB9XG5cbiAgZ2VuZXJhdGUoKTogTWFwLk1hcCB7XG4gICAgbGV0IG1hcCA9IG5ldyBNYXAuTWFwKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICBsZXQgY2VsbHMgPSBudWxsO1xuICAgIGxldCBhdHRlbXB0cyA9IDA7XG4gICAgd2hpbGUgKGNlbGxzID09PSBudWxsKSB7XG4gICAgICBhdHRlbXB0cysrO1xuICAgICAgY2VsbHMgPSB0aGlzLmdlbmVyYXRlTWFwKCk7XG4gICAgICBpZiAoYXR0ZW1wdHMgPiAxMDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbnMuQ291bGROb3RHZW5lcmF0ZU1hcCgnQ291bGQgbm90IGdlbmVyYXRlIGR1bmdlb24nKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgdGlsZTogTWFwLlRpbGU7XG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICBpZiAoY2VsbHNbeF1beV0gPT09IDApIHtcbiAgICAgICAgICB0aWxlID0gTWFwLlRpbGUuY3JlYXRlVGlsZShNYXAuVGlsZS5GTE9PUik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGlsZSA9IE1hcC5UaWxlLmNyZWF0ZVRpbGUoTWFwLlRpbGUuV0FMTCk7XG4gICAgICAgIH1cbiAgICAgICAgbWFwLnNldFRpbGUobmV3IENvcmUuUG9zaXRpb24oeCwgeSksIHRpbGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtYXA7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBNYXAgZnJvbSAnLi4vaW5kZXgnO1xuXG5leHBvcnQgY2xhc3MgTWF6ZVJlY3Vyc2l2ZUJhY2t0cmFja0dlbmVyYXRvciB7XG4gIHByaXZhdGUgd2lkdGg6IG51bWJlcjtcbiAgcHJpdmF0ZSBoZWlnaHQ6IG51bWJlcjtcblxuICBwcml2YXRlIHN0YWNrOiBDb3JlLlBvc2l0aW9uW107XG5cbiAgcHJpdmF0ZSBjZWxsczogbnVtYmVyW11bXTtcblxuICBjb25zdHJ1Y3RvcihjZWxsczogbnVtYmVyW11bXSkge1xuICAgIHRoaXMuY2VsbHMgPSBjZWxscztcbiAgICB0aGlzLndpZHRoID0gdGhpcy5jZWxscy5sZW5ndGg7XG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLmNlbGxzWzBdLmxlbmd0aDtcblxuICAgIHRoaXMuc3RhY2sgPSBbXTtcbiAgfVxuXG4gIHByaXZhdGUgcG9wdWxhdGVTdGFjayhwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbikge1xuICAgIGNvbnN0IG5laWdoYm91cnMgPSBDb3JlLlBvc2l0aW9uLmdldE5laWdoYm91cnMocG9zaXRpb24sIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0cnVlKTtcbiAgICBjb25zdCBuZXdDZWxscyA9IFtdO1xuICAgIGZvciAobGV0IGRpcmVjdGlvbiBpbiBuZWlnaGJvdXJzKSB7XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IG5laWdoYm91cnNbZGlyZWN0aW9uXTtcbiAgICAgIGlmIChwb3NpdGlvbiAmJiBNYXAuVXRpbHMuY2FuQ2FydmUodGhpcy5jZWxscywgcG9zaXRpb24sIDEpKSB7XG4gICAgICAgIG5ld0NlbGxzLnB1c2gocG9zaXRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAobmV3Q2VsbHMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5zdGFjayA9IHRoaXMuc3RhY2suY29uY2F0KENvcmUuVXRpbHMucmFuZG9taXplQXJyYXkobmV3Q2VsbHMpKTtcbiAgICB9XG4gIH1cblxuICBnZW5lcmF0ZSgpIHtcbiAgICBsZXQgcG9zaXRpb24gPSBNYXAuVXRpbHMuZmluZENhcnZlYWJsZVNwb3QodGhpcy5jZWxscyk7XG5cbiAgICB3aGlsZSAodGhpcy5jYXJ2ZU1hemUoKSkge31cbiAgfVxuXG4gIHByaXZhdGUgY2FydmVNYXplKCkge1xuICAgIGxldCBwb3NpdGlvbiA9IE1hcC5VdGlscy5maW5kQ2FydmVhYmxlU3BvdCh0aGlzLmNlbGxzKTtcbiAgICBpZiAocG9zaXRpb24gPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5jZWxsc1twb3NpdGlvbi54XVtwb3NpdGlvbi55XSA9IDA7XG4gICAgdGhpcy5wb3B1bGF0ZVN0YWNrKHBvc2l0aW9uKTtcblxuICAgIHdoaWxlICh0aGlzLnN0YWNrICYmIHRoaXMuc3RhY2subGVuZ3RoID4gMCkge1xuICAgICAgbGV0IHBvcyA9IHRoaXMuc3RhY2sucG9wKCk7XG5cbiAgICAgIGlmIChNYXAuVXRpbHMuY2FuRXh0ZW5kVHVubmVsKHRoaXMuY2VsbHMsIHBvcykpIHtcbiAgICAgICAgdGhpcy5jZWxsc1twb3MueF1bcG9zLnldID0gMDtcbiAgICAgICAgdGhpcy5wb3B1bGF0ZVN0YWNrKHBvcyk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgZ2V0Q2VsbHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuY2VsbHM7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBNYXAgZnJvbSAnLi4vaW5kZXgnO1xuXG5leHBvcnQgY2xhc3MgUm9vbUdlbmVyYXRvciB7XG4gIHByaXZhdGUgY2VsbHM6IG51bWJlcltdW107XG5cbiAgcHJpdmF0ZSB3aWR0aDogbnVtYmVyO1xuICBwcml2YXRlIGhlaWdodDogbnVtYmVyO1xuXG4gIHByaXZhdGUgbWF4QXR0ZW1wdHM6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihjZWxsczogbnVtYmVyW11bXSwgbWF4QXR0ZW1wdHM6IG51bWJlciA9IDUwMCkge1xuICAgIHRoaXMuY2VsbHMgPSBjZWxscztcblxuICAgIHRoaXMud2lkdGggPSB0aGlzLmNlbGxzLmxlbmd0aDtcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMuY2VsbHNbMF0ubGVuZ3RoO1xuXG4gICAgdGhpcy5tYXhBdHRlbXB0cyA9IG1heEF0dGVtcHRzO1xuICB9XG5cbiAgcHJpdmF0ZSBpc1NwYWNlQXZhaWxhYmxlKHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgIGZvciAobGV0IGkgPSB4OyBpIDwgeCArIHdpZHRoOyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSB5OyBqIDwgeSArIGhlaWdodDsgaisrKSB7XG4gICAgICAgIGlmICghTWFwLlV0aWxzLmNhbkNhcnZlKHRoaXMuY2VsbHMsIG5ldyBDb3JlLlBvc2l0aW9uKGksIGopLCAwLCB0cnVlKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGdlbmVyYXRlKCkge1xuICAgIHdoaWxlICh0aGlzLmFkZFJvb20oKSkgeyB9XG4gIH1cblxuICBwcml2YXRlIGFkZFJvb20oKSB7XG4gICAgbGV0IHJvb21HZW5lcmF0ZWQgPSBmYWxzZTtcbiAgICBsZXQgYXR0ZW1wdHMgPSAwO1xuICAgIHdoaWxlICghcm9vbUdlbmVyYXRlZCAmJiBhdHRlbXB0cyA8IHRoaXMubWF4QXR0ZW1wdHMpIHtcbiAgICAgIHJvb21HZW5lcmF0ZWQgPSB0aGlzLmdlbmVyYXRlUm9vbSgpO1xuICAgICAgYXR0ZW1wdHMrK1xuICAgIH1cblxuICAgIHJldHVybiByb29tR2VuZXJhdGVkO1xuICB9XG5cbiAgcHJpdmF0ZSBnZW5lcmF0ZVJvb20oKSB7XG4gICAgY29uc3Qgc2l6ZSA9IENvcmUuVXRpbHMuZ2V0UmFuZG9tKDMsIDUpO1xuICAgIGNvbnN0IHJlY3Rhbmd1bGFyaXR5ID0gQ29yZS5VdGlscy5nZXRSYW5kb20oMSwgMyk7XG4gICAgbGV0IHdpZHRoOiBudW1iZXI7XG4gICAgbGV0IGhlaWdodDogbnVtYmVyO1xuICAgIGlmIChNYXRoLnJhbmRvbSgpID4gMC41KSB7XG4gICAgICBoZWlnaHQgPSBzaXplO1xuICAgICAgd2lkdGggPSBzaXplICsgcmVjdGFuZ3VsYXJpdHk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdpZHRoID0gc2l6ZTtcbiAgICAgIGhlaWdodCA9IHNpemUgKyByZWN0YW5ndWxhcml0eTtcbiAgICB9XG5cbiAgICBsZXQgeCA9IENvcmUuVXRpbHMuZ2V0UmFuZG9tKDAsICh0aGlzLndpZHRoIC0gd2lkdGggLSAyKSk7XG4gICAgeCA9IE1hdGguZmxvb3IoeC8yKSAqIDIgKyAxO1xuICAgIGxldCB5ID0gQ29yZS5VdGlscy5nZXRSYW5kb20oMCwgKHRoaXMuaGVpZ2h0IC0gaGVpZ2h0IC0gMikpO1xuICAgIHkgPSBNYXRoLmZsb29yKHkvMikgKiAyICsgMTtcblxuICAgIGlmICh0aGlzLmlzU3BhY2VBdmFpbGFibGUoeCwgeSwgd2lkdGgsIGhlaWdodCkpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IHg7IGkgPCB4ICsgd2lkdGg7IGkrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IHk7IGogPCB5ICsgaGVpZ2h0OyBqKyspIHtcbiAgICAgICAgICAgICAgdGhpcy5jZWxsc1tpXVtqXSA9IDA7ICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGdldENlbGxzKCkge1xuICAgIHJldHVybiB0aGlzLmNlbGxzO1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uLy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgTWFwIGZyb20gJy4uL2luZGV4JztcblxuZXhwb3J0IGNsYXNzIFRvcG9sb2d5Q29tYmluYXRvciB7XG4gIHByaXZhdGUgY2VsbHM6IG51bWJlcltdW107XG4gIHByaXZhdGUgdG9wb2xvZ2llczogbnVtYmVyW11bXTtcblxuICBwcml2YXRlIHdpZHRoOiBudW1iZXI7XG4gIHByaXZhdGUgaGVpZ2h0OiBudW1iZXI7XG5cbiAgcHJpdmF0ZSB0b3BvbG9neUlkOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoY2VsbHM6IG51bWJlcltdW10pIHtcbiAgICB0aGlzLmNlbGxzID0gY2VsbHM7XG5cbiAgICB0aGlzLndpZHRoID0gdGhpcy5jZWxscy5sZW5ndGg7XG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLmNlbGxzWzBdLmxlbmd0aDtcblxuICAgIHRoaXMudG9wb2xvZ2llcyA9IFtdO1xuXG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgIHRoaXMudG9wb2xvZ2llc1t4XSA9IFtdO1xuICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgIHRoaXMudG9wb2xvZ2llc1t4XVt5XSA9IDA7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0Q2VsbHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuY2VsbHM7XG4gIH1cblxuICBpbml0aWFsaXplKCk6IG51bWJlcltdW10ge1xuICAgIHRoaXMudG9wb2xvZ3lJZCA9IDA7XG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICB0aGlzLmFkZFRvcG9sb2d5KG5ldyBDb3JlLlBvc2l0aW9uKHgsIHkpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudG9wb2xvZ2llcztcbiAgfVxuXG4gIGNvbWJpbmUoKSB7XG4gICAgbGV0IGkgPSAyO1xuICAgIGNvbnN0IG1heCA9IHRoaXMudG9wb2xvZ3lJZDtcbiAgICBsZXQgcmVtYWluaW5nVG9wb2xvZ2llcyA9IFtdO1xuICAgIGZvciAodmFyIGogPSAyOyBqIDw9IHRoaXMudG9wb2xvZ3lJZDsgaisrKSB7XG4gICAgICByZW1haW5pbmdUb3BvbG9naWVzLnB1c2goaik7XG4gICAgfVxuICAgIHdoaWxlIChyZW1haW5pbmdUb3BvbG9naWVzLmxlbmd0aCA+IDAgJiYgaSA8IG1heCAqIDUpIHtcbiAgICAgIGxldCB0b3BvbG9neUlkID0gcmVtYWluaW5nVG9wb2xvZ2llcy5zaGlmdCgpO1xuICAgICAgaSsrO1xuICAgICAgaWYgKCF0aGlzLmNvbWJpbmVUb3BvbG9neSgxLCB0b3BvbG9neUlkKSkge1xuICAgICAgICByZW1haW5pbmdUb3BvbG9naWVzLnB1c2godG9wb2xvZ3lJZCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZW1haW5pbmdUb3BvbG9naWVzLmxlbmd0aDtcbiAgfVxuXG4gIHByaXZhdGUgY29tYmluZVRvcG9sb2d5KGE6IG51bWJlciwgYjogbnVtYmVyKSB7XG4gICAgY29uc3QgZWRnZXMgPSB0aGlzLmdldEVkZ2VzKGEsIGIpO1xuICAgIGlmIChlZGdlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgY29tYmluZWQgPSBmYWxzZTtcblxuICAgIHdoaWxlICghY29tYmluZWQgJiYgZWRnZXMubGVuZ3RoID4gMCkge1xuICAgICAgbGV0IGlkeCA9IENvcmUuVXRpbHMuZ2V0UmFuZG9tKDAsIGVkZ2VzLmxlbmd0aCAtIDEpOyBcbiAgICAgIGxldCBlZGdlID0gZWRnZXNbaWR4XTtcbiAgICAgIGVkZ2VzLnNwbGljZShpZHgsIDEpO1xuICAgICAgbGV0IHN1cnJvdW5kaW5nVGlsZXMgPSBNYXAuVXRpbHMuY291bnRTdXJyb3VuZGluZ1RpbGVzKHRoaXMuY2VsbHMsIGVkZ2UpO1xuICAgICAgaWYgKHN1cnJvdW5kaW5nVGlsZXMgPT09IDIpIHtcbiAgICAgICAgdGhpcy5jZWxsc1tlZGdlLnhdW2VkZ2UueV0gPSAwO1xuICAgICAgICB0aGlzLnRvcG9sb2dpZXNbZWRnZS54XVtlZGdlLnldID0gYTtcbiAgICAgICAgaWYgKGVkZ2VzLmxlbmd0aCA+PSA0KSB7XG4gICAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPiAwLjIpIHtcbiAgICAgICAgICAgIGNvbWJpbmVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29tYmluZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvbWJpbmVkKSB7XG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICBpZiAodGhpcy50b3BvbG9naWVzW3hdW3ldID09PSBiKSB7XG4gICAgICAgICAgICB0aGlzLnRvcG9sb2dpZXNbeF1beV0gPSBhO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY29tYmluZWQ7XG4gIH1cblxuICBwcml2YXRlIGdldEVkZ2VzKGE6IG51bWJlciwgYjogbnVtYmVyKSB7XG4gICAgY29uc3QgaGFzVG9wb2xvZ3lOZWlnaGJvdXIgPSAocG9zaXRpb246IENvcmUuUG9zaXRpb24sIHRvcG9sb2d5SWQ6IG51bWJlcikgPT4ge1xuICAgICAgY29uc3QgbmVpZ2hib3VycyA9IENvcmUuUG9zaXRpb24uZ2V0TmVpZ2hib3Vycyhwb3NpdGlvbiwgLTEsIC0xLCB0cnVlKTtcbiAgICAgIHJldHVybiBuZWlnaGJvdXJzLmZpbHRlcigocG9zaXRpb24pID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMudG9wb2xvZ2llc1twb3NpdGlvbi54XVtwb3NpdGlvbi55XSA9PT0gdG9wb2xvZ3lJZFxuICAgICAgfSkubGVuZ3RoID4gMDtcbiAgICB9XG4gICAgbGV0IGVkZ2VzID0gW107XG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICBsZXQgcG9zaXRpb24gPSBuZXcgQ29yZS5Qb3NpdGlvbih4LCB5KTtcbiAgICAgICAgaWYgKGhhc1RvcG9sb2d5TmVpZ2hib3VyKHBvc2l0aW9uLCBhKSAmJiBoYXNUb3BvbG9neU5laWdoYm91cihwb3NpdGlvbiwgYikpIHtcbiAgICAgICAgICBlZGdlcy5wdXNoKHBvc2l0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZWRnZXM7XG4gIH1cblxuICBwcml2YXRlIGFkZFRvcG9sb2d5KHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uLCB0b3BvbG9neUlkOiBudW1iZXIgPSAtMSkge1xuICAgIGNvbnN0IHggPSBwb3NpdGlvbi54O1xuICAgIGNvbnN0IHkgPSBwb3NpdGlvbi55O1xuICAgIGlmICh0aGlzLmNlbGxzW3hdW3ldICE9PSAwIHx8IHRoaXMudG9wb2xvZ2llc1t4XVt5XSAhPT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0b3BvbG9neUlkID09PSAtMSkge1xuICAgICAgdGhpcy50b3BvbG9neUlkKys7XG4gICAgICB0b3BvbG9neUlkID0gdGhpcy50b3BvbG9neUlkO1xuICAgIH1cblxuICAgIHRoaXMudG9wb2xvZ2llc1t4XVt5XSA9IHRvcG9sb2d5SWQ7XG5cbiAgICBjb25zdCBuZWlnaGJvdXJzID0gQ29yZS5Qb3NpdGlvbi5nZXROZWlnaGJvdXJzKG5ldyBDb3JlLlBvc2l0aW9uKHgsIHkpLCAtMSwgLTEsIHRydWUpO1xuICAgIG5laWdoYm91cnMuZm9yRWFjaCgocG9zaXRpb24pID0+IHtcbiAgICAgIGlmICh0aGlzLmNlbGxzW3Bvc2l0aW9uLnhdW3Bvc2l0aW9uLnldID09PSAwICYmIHRoaXMudG9wb2xvZ2llc1twb3NpdGlvbi54XVtwb3NpdGlvbi55XSA9PT0gMCkge1xuICAgICAgICB0aGlzLmFkZFRvcG9sb2d5KHBvc2l0aW9uLCB0b3BvbG9neUlkKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcHJ1bmVEZWFkRW5kKHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uKSB7XG4gICAgaWYgKHRoaXMuY2VsbHNbcG9zaXRpb24ueF1bcG9zaXRpb24ueV0gPT09IDApIHtcbiAgICAgIGxldCBzdXJyb3VuZGluZ1RpbGVzID0gTWFwLlV0aWxzLmNvdW50U3Vycm91bmRpbmdUaWxlcyh0aGlzLmNlbGxzLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54LCBwb3NpdGlvbi55KSk7XG4gICAgICBpZiAoc3Vycm91bmRpbmdUaWxlcyA8PSAxKSB7XG4gICAgICAgIHRoaXMuY2VsbHNbcG9zaXRpb24ueF1bcG9zaXRpb24ueV0gPSAxO1xuICAgICAgICBDb3JlLlBvc2l0aW9uLmdldE5laWdoYm91cnMocG9zaXRpb24sIC0xLCAtMSwgdHJ1ZSkuZm9yRWFjaCgobmVpZ2hib3VyKSA9PiB7XG4gICAgICAgICAgdGhpcy5wcnVuZURlYWRFbmQobmVpZ2hib3VyKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJ1bmVEZWFkRW5kcygpIHtcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgIGlmICh0aGlzLmNlbGxzW3hdW3ldID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5wcnVuZURlYWRFbmQobmV3IENvcmUuUG9zaXRpb24oeCwgeSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJleHBvcnQgKiBmcm9tICcuL1Jvb21HZW5lcmF0b3InO1xuZXhwb3J0ICogZnJvbSAnLi9Ub3BvbG9neUNvbWJpbmF0b3InO1xuZXhwb3J0ICogZnJvbSAnLi9NYXplUmVjdXJzaXZlQmFja3RyYWNrR2VuZXJhdG9yJztcbmV4cG9ydCAqIGZyb20gJy4vRHVuZ2VvbkdlbmVyYXRvcic7XG4iLCJleHBvcnQgKiBmcm9tICcuL2dlbmVyYXRpb24nO1xuZXhwb3J0ICogZnJvbSAnLi9VdGlscyc7XG5leHBvcnQgKiBmcm9tICcuL0ZvVic7XG5leHBvcnQgKiBmcm9tICcuL01hcCc7XG5leHBvcnQgKiBmcm9tICcuL0dseXBoJztcbmV4cG9ydCAqIGZyb20gJy4vVGlsZSc7XG4iLCJpbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcblxuZXhwb3J0IGludGVyZmFjZSBJRXZlbnRIYW5kbGVyIHtcbiAgbGlzdGVuOiAobGlzdGVuZXI6IEV2ZW50cy5MaXN0ZW5lcikgPT4gRXZlbnRzLkxpc3RlbmVyO1xuICByZW1vdmVMaXN0ZW5lcjogKGxpc3RlbmVyOiBFdmVudHMuTGlzdGVuZXIpID0+IHZvaWQ7XG4gIGVtaXQ6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiB2b2lkO1xuICBmaXJlOiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gYW55O1xuICBpczogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IGJvb2xlYW47XG4gIGdhdGhlcjogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IGFueVtdO1xufVxuXG5leHBvcnQgY2xhc3MgRXZlbnRIYW5kbGVyIGltcGxlbWVudHMgSUV2ZW50SGFuZGxlciB7XG4gIHByaXZhdGUgbGlzdGVuZXJzOiB7W2V2ZW50OiBzdHJpbmddOiBFdmVudHMuTGlzdGVuZXJbXX0gPSB7fTtcblxuICBsaXN0ZW4obGlzdGVuZXI6IEV2ZW50cy5MaXN0ZW5lcikge1xuICAgIGlmICghdGhpcy5saXN0ZW5lcnMpIHtcbiAgICAgIHRoaXMubGlzdGVuZXJzID0ge307XG4gICAgfVxuICAgIGlmICghdGhpcy5saXN0ZW5lcnNbbGlzdGVuZXIudHlwZV0pIHtcbiAgICAgIHRoaXMubGlzdGVuZXJzW2xpc3RlbmVyLnR5cGVdID0gW107XG4gICAgfVxuXG4gICAgdGhpcy5saXN0ZW5lcnNbbGlzdGVuZXIudHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gICAgdGhpcy5saXN0ZW5lcnNbbGlzdGVuZXIudHlwZV0gPSB0aGlzLmxpc3RlbmVyc1tsaXN0ZW5lci50eXBlXS5zb3J0KChhOiBFdmVudHMuTGlzdGVuZXIsIGI6IEV2ZW50cy5MaXN0ZW5lcikgPT4gYS5wcmlvcml0eSAtIGIucHJpb3JpdHkpO1xuXG4gICAgcmV0dXJuIGxpc3RlbmVyO1xuICB9XG5cbiAgcmVtb3ZlTGlzdGVuZXIobGlzdGVuZXI6IEV2ZW50cy5MaXN0ZW5lcikge1xuICAgIGlmICghdGhpcy5saXN0ZW5lcnMgfHwgIXRoaXMubGlzdGVuZXJzW2xpc3RlbmVyLnR5cGVdKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBpZHggPSB0aGlzLmxpc3RlbmVyc1tsaXN0ZW5lci50eXBlXS5maW5kSW5kZXgoKGwpID0+IHtcbiAgICAgIHJldHVybiBsLmd1aWQgPT09IGxpc3RlbmVyLmd1aWQ7XG4gICAgfSk7XG4gICAgaWYgKHR5cGVvZiBpZHggPT09ICdudW1iZXInKSB7XG4gICAgICB0aGlzLmxpc3RlbmVyc1tsaXN0ZW5lci50eXBlXS5zcGxpY2UoaWR4LCAxKTtcbiAgICB9XG4gIH1cblxuICBlbWl0KGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBpZiAoIXRoaXMubGlzdGVuZXJzW2V2ZW50LnR5cGVdKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnNbZXZlbnQudHlwZV0ubWFwKChpKSA9PiBpKTtcblxuICAgIGxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgbGlzdGVuZXIuY2FsbGJhY2soZXZlbnQpO1xuICAgIH0pO1xuICB9XG5cbiAgaXMoZXZlbnQ6IEV2ZW50cy5FdmVudCk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5saXN0ZW5lcnNbZXZlbnQudHlwZV0pIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGxldCByZXR1cm5lZFZhbHVlID0gdHJ1ZTtcblxuICAgIHRoaXMubGlzdGVuZXJzW2V2ZW50LnR5cGVdLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XG4gICAgICBpZiAoIXJldHVybmVkVmFsdWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmV0dXJuZWRWYWx1ZSA9IGxpc3RlbmVyLmNhbGxiYWNrKGV2ZW50KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmV0dXJuZWRWYWx1ZTtcbiAgfVxuXG4gIGZpcmUoZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGlmICghdGhpcy5saXN0ZW5lcnNbZXZlbnQudHlwZV0pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxldCByZXR1cm5lZFZhbHVlID0gbnVsbDtcblxuICAgIHRoaXMubGlzdGVuZXJzW2V2ZW50LnR5cGVdLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XG4gICAgICByZXR1cm5lZFZhbHVlID0gbGlzdGVuZXIuY2FsbGJhY2soZXZlbnQpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXR1cm5lZFZhbHVlO1xuICB9XG5cbiAgZ2F0aGVyKGV2ZW50OiBFdmVudHMuRXZlbnQpOiBhbnlbXSB7XG4gICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tldmVudC50eXBlXSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGxldCB2YWx1ZXMgPSBbXVxuXG4gICAgdGhpcy5saXN0ZW5lcnNbZXZlbnQudHlwZV0uZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgIHZhbHVlcy5wdXNoKGxpc3RlbmVyLmNhbGxiYWNrKGV2ZW50KSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfVxufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9FdmVudEhhbmRsZXInO1xuIl19
