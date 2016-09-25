(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('./core');
var Glyph = require('./Glyph');

var Console = function () {
    function Console(width, height) {
        var foreground = arguments.length <= 2 || arguments[2] === undefined ? 0xffffff : arguments[2];
        var background = arguments.length <= 3 || arguments[3] === undefined ? 0x000000 : arguments[3];

        _classCallCheck(this, Console);

        this._width = width;
        this._height = height;
        this.defaultBackground = 0x00000;
        this.defaultForeground = 0xfffff;
        this._text = Core.Utils.buildMatrix(this.width, this.height, Glyph.CHAR_SPACE);
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

},{"./Glyph":4,"./core":37}],2:[function(require,module,exports){
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

},{"./InputHandler":5,"./PixiConsole":10,"./components":34,"./core":37,"./entities":40,"./events":43,"./mixins":45}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

Glyph.CHAR_FULL = 129;
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
module.exports = Glyph;

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Events = require('./events');
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
                this.console.setText(' ', 0, 0, this.console.width, this.console.height);
            }
            this.effects = this.player.gather(new Events.Event('getStatusEffect'));
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

            this.console.setText(' ', this.width - 10, 0, 10);
            this.console.print('Turn: ' + this.currentTurn, this.width - 10, 0, 0xffffff);
            if (this.effects.length > 0) {
                var str = this.effects.reduce(function (acc, effect, idx) {
                    return acc + effect.name + (idx !== _this.effects.length - 1 ? ', ' : '');
                }, 'Effects: ');
                this.console.print(str, 0, 0, 0xffffff);
            }
            this.console.print;
            if (this.messages.length > 0) {
                this.messages.forEach(function (data, idx) {
                    var color = 0xffffff;
                    if (data.turn < _this.currentTurn - 5) {
                        color = 0x666666;
                    } else if (data.turn < _this.currentTurn - 2) {
                        color = 0xaaaaaa;
                    }
                    _this.console.print(data.message, 0, _this.height - idx, color);
                });
            }
            blitFunction(this.console);
        }
    }]);

    return LogView;
}();

module.exports = LogView;

},{"./Console":1,"./events":43}],7:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('./core');
var Tile = require('./Tile');

var Map = function () {
    function Map(w, h) {
        _classCallCheck(this, Map);

        this._width = w;
        this._height = h;
        this.tiles = [];
        for (var x = 0; x < this._width; x++) {
            this.tiles[x] = [];
            for (var y = 0; y < this._height; y++) {
                this.tiles[x][y] = Tile.createTile(Tile.EMPTY);
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

module.exports = Map;

},{"./Tile":12,"./core":37}],8:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('./core');
var Map = require('./Map');
var Tile = require('./Tile');
var Glyph = require('./Glyph');

var MapGenerator = function () {
    function MapGenerator(width, height) {
        _classCallCheck(this, MapGenerator);

        this.width = width;
        this.height = height;
        this.backgroundColor = 0x000000;
        this.foregroundColor = 0xaaaaaa;
    }

    _createClass(MapGenerator, [{
        key: 'generate',
        value: function generate() {
            var cells = Core.Utils.buildMatrix(this.width, this.height, 0);
            var map = new Map(this.width, this.height);
            for (var x = 0; x < this.width; x++) {
                for (var y = 0; y < this.height; y++) {
                    if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
                        cells[x][y] = 1;
                    } else {
                        if (Math.random() > 0.9) {
                            cells[x][y] = 1;
                        } else {
                            cells[x][y] = 0;
                        }
                    }
                }
            }
            var tile = void 0;
            for (var x = 0; x < this.width; x++) {
                for (var y = 0; y < this.height; y++) {
                    if (cells[x][y] === 0) {
                        tile = Tile.createTile(Tile.FLOOR);
                    } else {
                        tile = Tile.createTile(Tile.WALL);
                        tile.glyph = this.getWallGlyph(x, y, cells);
                    }
                    map.setTile(new Core.Position(x, y), tile);
                }
            }
            return map;
        }
    }, {
        key: 'getWallGlyph',
        value: function getWallGlyph(x, y, cells) {
            var W = x > 0 && cells[x - 1][y] === 1;
            var E = x < this.width - 1 && cells[x + 1][y] === 1;
            var N = y > 0 && cells[x][y - 1] === 1;
            var S = y < this.height - 1 && cells[x][y + 1] === 1;
            var glyph = new Glyph(Glyph.CHAR_CROSS, this.foregroundColor, this.backgroundColor);
            if (W && E && S && N) {
                glyph = new Glyph(Glyph.CHAR_CROSS, this.foregroundColor, this.backgroundColor);
            } else if ((W || E) && !S && !N) {
                glyph = new Glyph(Glyph.CHAR_HLINE, this.foregroundColor, this.backgroundColor);
            } else if ((S || N) && !W && !E) {
                glyph = new Glyph(Glyph.CHAR_VLINE, this.foregroundColor, this.backgroundColor);
            } else if (S && E && !W && !N) {
                glyph = new Glyph(Glyph.CHAR_SE, this.foregroundColor, this.backgroundColor);
            } else if (S && W && !E && !N) {
                glyph = new Glyph(Glyph.CHAR_SW, this.foregroundColor, this.backgroundColor);
            } else if (N && E && !W && !S) {
                glyph = new Glyph(Glyph.CHAR_NE, this.foregroundColor, this.backgroundColor);
            } else if (N && W && !E && !S) {
                glyph = new Glyph(Glyph.CHAR_NW, this.foregroundColor, this.backgroundColor);
            } else if (N && W && E && !S) {
                glyph = new Glyph(Glyph.CHAR_TEEN, this.foregroundColor, this.backgroundColor);
            } else if (S && W && E && !N) {
                glyph = new Glyph(Glyph.CHAR_TEES, this.foregroundColor, this.backgroundColor);
            } else if (N && S && E && !W) {
                glyph = new Glyph(Glyph.CHAR_TEEE, this.foregroundColor, this.backgroundColor);
            } else if (N && S && W && !E) {
                glyph = new Glyph(Glyph.CHAR_TEEW, this.foregroundColor, this.backgroundColor);
            }
            return glyph;
        }
    }]);

    return MapGenerator;
}();

module.exports = MapGenerator;

},{"./Glyph":4,"./Map":7,"./Tile":12,"./core":37}],9:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Components = require('./components');
var Events = require('./events');
var Console = require('./Console');

var MapView = function () {
    function MapView(engine, map, width, height) {
        _classCallCheck(this, MapView);

        this.engine = engine;
        this.map = map;
        this.width = width;
        this.height = height;
        this.registerListeners();
        this.console = new Console(this.width, this.height);
        this.renderableEntities = [];
        this.renderableItems = [];
    }

    _createClass(MapView, [{
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
            this.renderBackground(console);
            this.renderItems(console);
            this.renderEntities(console);
        }
    }, {
        key: 'renderEntities',
        value: function renderEntities(console) {
            var _this = this;

            this.renderableEntities.forEach(function (data) {
                if (data.renderable && data.physics) {
                    _this.renderGlyph(console, data.renderable.glyph, data.physics.position);
                }
            });
        }
    }, {
        key: 'renderItems',
        value: function renderItems(console) {
            var _this2 = this;

            this.renderableItems.forEach(function (data) {
                if (data.renderable && data.physics) {
                    _this2.renderGlyph(console, data.renderable.glyph, data.physics.position);
                }
            });
        }
    }, {
        key: 'renderGlyph',
        value: function renderGlyph(console, glyph, position) {
            console.setText(glyph.glyph, position.x, position.y);
            console.setForeground(glyph.foregroundColor, position.x, position.y);
        }
    }, {
        key: 'renderBackground',
        value: function renderBackground(console) {
            this.map.forEach(function (position, tile) {
                var glyph = tile.glyph;
                console.setText(glyph.glyph, position.x, position.y);
                console.setForeground(glyph.foregroundColor, position.x, position.y);
                console.setBackground(glyph.backgroundColor, position.x, position.y);
            });
        }
    }]);

    return MapView;
}();

module.exports = MapView;

},{"./Console":1,"./components":34,"./events":43}],10:[function(require,module,exports){
/// <reference path='../typings/index.d.ts' />
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('./core');
var Glyph = require('./Glyph');

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
        this.text = Core.Utils.buildMatrix(this.width, this.height, Glyph.CHAR_SPACE);
        this.fore = Core.Utils.buildMatrix(this.width, this.height, this.defaultForeground);
        this.back = Core.Utils.buildMatrix(this.width, this.height, this.defaultBackground);
        this.isDirty = Core.Utils.buildMatrix(this.width, this.height, true);
    }

    _createClass(PixiConsole, [{
        key: 'loadFont',
        value: function loadFont() {
            var fontUrl = './terminal16x16.png';
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
            this.addGridOverlay();
            this.loaded = true;
            //this.animate();
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
                    var cell = new PIXI.Sprite(this.chars[Glyph.CHAR_FULL]);
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
                    var cell = new PIXI.Sprite(this.chars[Glyph.CHAR_SPACE]);
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
        value: function addGridOverlay() {
            for (var x = 0; x < this.width; x++) {
                for (var y = 0; y < this.height; y++) {
                    var cell = new PIXI.Graphics();
                    cell.lineStyle(1, 0x444444, 0.5);
                    cell.beginFill(0, 0);
                    cell.drawRect(x * this.charWidth, y * this.charHeight, this.charWidth, this.charHeight);
                    this.stage.addChild(cell);
                }
            }
        }
        /*
        private animate() {
          requestAnimationFrame(this.animate.bind(this));
          this.renderer.render(this.stage);
        }
        */

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

},{"./Glyph":4,"./core":37}],11:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('./core');
var Events = require('./events');
var Components = require('./components');
var Entities = require('./entities');
var Exceptions = require('./Exceptions');
var MapGenerator = require('./MapGenerator');
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
            var mapGenerator = new MapGenerator(this.width, this.height - 5);
            this._map = mapGenerator.generate();
            Core.Position.setMaxValues(this.map.width, this.map.height);
            this.registerListeners();
            this.mapView = new MapView(this.engine, this.map, this.map.width, this.map.height);
            this.generateWily();
            this.logView = new LogView(this.engine, this.width, 5, this.player);
            this.generateRats();
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
            while (tries < 100 && !positioned) {
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

},{"./Exceptions":3,"./LogView":6,"./MapGenerator":8,"./MapView":9,"./components":34,"./core":37,"./entities":40,"./events":43}],12:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Glyph = require('./Glyph');

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
            return new Tile(desc.glyph, desc.walkable, desc.blocksSight);
        }
    }]);

    return Tile;
}();

Tile.EMPTY = {
    glyph: new Glyph(Glyph.CHAR_SPACE, 0xffffff, 0x000000),
    walkable: false,
    blocksSight: true
};
Tile.FLOOR = {
    glyph: new Glyph('\'', 0x222222, 0x000000),
    walkable: true,
    blocksSight: true
};
Tile.WALL = {
    glyph: new Glyph(Glyph.CHAR_HLINE, 0xffffff, 0x000000),
    walkable: false,
    blocksSight: true
};
module.exports = Tile;

},{"./Glyph":4}],13:[function(require,module,exports){
"use strict";

var Engine = require('./Engine');
var Scene = require('./Scene');
window.onload = function () {
    var engine = new Engine(60, 40, 'rogue');
    var scene = new Scene(engine, 60, 40);
    engine.start(scene);
};

},{"./Engine":2,"./Scene":11}],14:[function(require,module,exports){
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

},{"../Exceptions":3}],15:[function(require,module,exports){
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

},{"../Exceptions":3}],16:[function(require,module,exports){
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

},{"./index":20}],17:[function(require,module,exports){
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

},{"../components":34,"../core":37,"../events":43,"./index":20}],18:[function(require,module,exports){
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

},{"./index":20}],19:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Behaviours = require('./index');
var Entities = require('../entities');
var Components = require('../components');
var Glyph = require('../Glyph');

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
                glyph: new Glyph('#', 0x44ff88, 0x000000)
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

},{"../Glyph":4,"../components":34,"../entities":40,"./index":20}],20:[function(require,module,exports){
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

},{"./Action":14,"./Behaviour":15,"./NullAction":16,"./RandomWalkBehaviour":17,"./WalkAction":18,"./WriteRuneAction":19}],21:[function(require,module,exports){
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
                console.log(this);
                debugger;
                throw new Exceptions.MissingImplementationError('`this.listeners` has been redefined, default `destroy` function should not be used. For: ' + this.entity.name);
            }
            this.listeners.forEach(function (listener) {
                _this.engine.removeListener(listener);
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

},{"../Exceptions":3,"../core":37}],22:[function(require,module,exports){
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

},{"../events":43,"./index":34}],23:[function(require,module,exports){
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

},{"../events":43,"./index":34}],24:[function(require,module,exports){
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

},{"../InputHandler":5,"../behaviours":20,"../core":37,"../events":43,"./index":34}],25:[function(require,module,exports){
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

},{"../events":43,"./index":34}],26:[function(require,module,exports){
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

},{"../Exceptions":3,"../events":43,"./index":34}],27:[function(require,module,exports){
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

},{"../behaviours":20,"../events":43,"./index":34}],28:[function(require,module,exports){
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

},{"../events":43,"./index":34}],29:[function(require,module,exports){
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
                event.data.entity.addComponent(new Components.SlowComponent(this.engine, { factor: 0.5 }));
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

},{"../events":43,"./index":34}],30:[function(require,module,exports){
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

},{"../behaviours":20,"../events":43,"./index":34}],31:[function(require,module,exports){
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

},{"../events":43,"./index":34}],32:[function(require,module,exports){
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
            this.entity.listen(new Events.Listener('onEnergyRegeneration', this.onEnergyRegeneration.bind(this), 50));
            this.entity.listen(new Events.Listener('getStatusEffect', this.onGetStatusEffect.bind(this)));
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

},{"../events":43,"./index":34}],33:[function(require,module,exports){
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
            if (this._currentTick % this.ticksPerTurn === 0) {
                this._currentTurn++;
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

},{"../events":43,"./index":34}],34:[function(require,module,exports){
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

},{"./Component":21,"./EnergyComponent":22,"./HealthComponent":23,"./InputComponent":24,"./PhysicsComponent":25,"./RenderableComponent":26,"./RoamingAIComponent":27,"./RuneDamageComponent":28,"./RuneFreezeComponent":29,"./RuneWriterComponent":30,"./SelfDestructComponent":31,"./SlowComponent":32,"./TimeHandlerComponent":33}],35:[function(require,module,exports){
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

},{}],36:[function(require,module,exports){
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
    }]);

    return Position;
}();

exports.Position = Position;

},{}],37:[function(require,module,exports){
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

},{"./Color":35,"./Position":36}],38:[function(require,module,exports){
"use strict";

var Components = require('../components');
var Entities = require('./index');
var Glyph = require('../Glyph');
function createWily(engine) {
    var wily = new Entities.Entity(engine, 'Wily', 'player');
    wily.addComponent(new Components.PhysicsComponent(engine));
    wily.addComponent(new Components.RenderableComponent(engine, {
        glyph: new Glyph('@', 0xffffff, 0x000000)
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
        glyph: new Glyph('r', 0xffffff, 0x000000)
    }));
    rat.addComponent(new Components.EnergyComponent(engine));
    rat.addComponent(new Components.RoamingAIComponent(engine));
    rat.addComponent(new Components.HealthComponent(engine));
    return rat;
}
exports.createRat = createRat;

},{"../Glyph":4,"../components":34,"./index":40}],39:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('../core');
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
            this.components.push(component);
            component.registerEntity(this);
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
Core.Utils.applyMixins(Entity, [Mixins.EventHandler]);

},{"../core":37,"../mixins":45}],40:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./Creator'));
__export(require('./Entity'));

},{"./Creator":38,"./Entity":39}],41:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Event = function Event(type) {
    var data = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    _classCallCheck(this, Event);

    this.type = type;
    this.data = data;
};

exports.Event = Event;

},{}],42:[function(require,module,exports){
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

},{"../core":37}],43:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./Event'));
__export(require('./Listener'));

},{"./Event":41,"./Listener":42}],44:[function(require,module,exports){
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
            if (!this.listeners[listener.type]) {
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

},{}],45:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./EventHandler'));

},{"./EventHandler":44}]},{},[13])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDb25zb2xlLnRzIiwiRW5naW5lLnRzIiwiRXhjZXB0aW9ucy50cyIsIkdseXBoLnRzIiwiSW5wdXRIYW5kbGVyLnRzIiwiTG9nVmlldy50cyIsIk1hcC50cyIsIk1hcEdlbmVyYXRvci50cyIsIk1hcFZpZXcudHMiLCJQaXhpQ29uc29sZS50cyIsIlNjZW5lLnRzIiwiVGlsZS50cyIsImFwcC50cyIsImJlaGF2aW91cnMvQWN0aW9uLnRzIiwiYmVoYXZpb3Vycy9CZWhhdmlvdXIudHMiLCJiZWhhdmlvdXJzL051bGxBY3Rpb24udHMiLCJiZWhhdmlvdXJzL1JhbmRvbVdhbGtCZWhhdmlvdXIudHMiLCJiZWhhdmlvdXJzL1dhbGtBY3Rpb24udHMiLCJiZWhhdmlvdXJzL1dyaXRlUnVuZUFjdGlvbi50cyIsImJlaGF2aW91cnMvaW5kZXgudHMiLCJjb21wb25lbnRzL0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvRW5lcmd5Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9IZWFsdGhDb21wb25lbnQudHMiLCJjb21wb25lbnRzL0lucHV0Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9QaHlzaWNzQ29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9SZW5kZXJhYmxlQ29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9Sb2FtaW5nQUlDb21wb25lbnQudHMiLCJjb21wb25lbnRzL1J1bmVEYW1hZ2VDb21wb25lbnQudHMiLCJjb21wb25lbnRzL1J1bmVGcmVlemVDb21wb25lbnQudHMiLCJjb21wb25lbnRzL1J1bmVXcml0ZXJDb21wb25lbnQudHMiLCJjb21wb25lbnRzL1NlbGZEZXN0cnVjdENvbXBvbmVudC50cyIsImNvbXBvbmVudHMvU2xvd0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvVGltZUhhbmRsZXJDb21wb25lbnQudHMiLCJjb21wb25lbnRzL2luZGV4LnRzIiwiY29yZS9Db2xvci50cyIsImNvcmUvUG9zaXRpb24udHMiLCJjb3JlL2luZGV4LnRzIiwiZW50aXRpZXMvQ3JlYXRvci50cyIsImVudGl0aWVzL0VudGl0eS50cyIsImVudGl0aWVzL2luZGV4LnRzIiwiZXZlbnRzL0V2ZW50LnRzIiwiZXZlbnRzL0xpc3RlbmVyLnRzIiwiZXZlbnRzL2luZGV4LnRzIiwibWl4aW5zL0V2ZW50SGFuZGxlci50cyIsIm1peGlucy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQ0FBLElBQVksQUFBSSxlQUFNLEFBQVEsQUFBQztBQUMvQixJQUFPLEFBQUssZ0JBQVcsQUFBUyxBQUFDLEFBQUMsQUFFbEM7OztBQThCRSxxQkFBWSxBQUFhLE9BQUUsQUFBYztZQUFFLEFBQVUsbUVBQWUsQUFBUTtZQUFFLEFBQVUsbUVBQWUsQUFBUTs7OztBQUM3RyxBQUFJLGFBQUMsQUFBTSxTQUFHLEFBQUssQUFBQztBQUNwQixBQUFJLGFBQUMsQUFBTyxVQUFHLEFBQU0sQUFBQztBQUV0QixBQUFJLGFBQUMsQUFBaUIsb0JBQUcsQUFBTyxBQUFDO0FBQ2pDLEFBQUksYUFBQyxBQUFpQixvQkFBRyxBQUFPLEFBQUM7QUFFakMsQUFBSSxhQUFDLEFBQUssUUFBRyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQVcsWUFBUyxBQUFJLEtBQUMsQUFBSyxPQUFFLEFBQUksS0FBQyxBQUFNLFFBQUUsQUFBSyxNQUFDLEFBQVUsQUFBQyxBQUFDO0FBQ3ZGLEFBQUksYUFBQyxBQUFLLFFBQUcsQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFXLFlBQWEsQUFBSSxLQUFDLEFBQUssT0FBRSxBQUFJLEtBQUMsQUFBTSxRQUFFLEFBQUksS0FBQyxBQUFpQixBQUFDLEFBQUM7QUFDakcsQUFBSSxhQUFDLEFBQUssUUFBRyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQVcsWUFBYSxBQUFJLEtBQUMsQUFBSyxPQUFFLEFBQUksS0FBQyxBQUFNLFFBQUUsQUFBSSxLQUFDLEFBQWlCLEFBQUMsQUFBQztB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QyxPQUFDLEFBQUM7QUFDaEMsQUFBTSx1QkFBQyxBQUFJLEFBQUMsQUFDZDtBQUFDO0FBRUQsZ0JBQUksQUFBYSxnQkFBRyxBQUFJLEFBQUM7QUFFekIsQUFBSSxpQkFBQyxBQUFTLFVBQUMsQUFBSyxNQUFDLEFBQUksQUFBQyxNQUFDLEFBQU8sUUFBQyxVQUFDLEFBQVE7QUFDMUMsQUFBYSxnQ0FBRyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUssQUFBQyxBQUFDLEFBQzNDO0FBQUMsQUFBQyxBQUFDO0FBQ0gsQUFBTSxtQkFBQyxBQUFhLEFBQUMsQUFDdkI7QUFBQyxBQUVELEFBQU07OzsrQkFBQyxBQUFtQjtBQUN4QixBQUFFLEFBQUMsZ0JBQUMsQ0FBQyxBQUFJLEtBQUMsQUFBUyxVQUFDLEFBQUssTUFBQyxBQUFJLEFBQUMsQUFBQyxPQUFDLEFBQUM7QUFDaEMsQUFBTSx1QkFBQyxBQUFFLEFBQUMsQUFDWjtBQUFDO0FBRUQsZ0JBQUksQUFBTSxTQUFHLEFBQUU7QUFFZixBQUFJLGlCQUFDLEFBQVMsVUFBQyxBQUFLLE1BQUMsQUFBSSxBQUFDLE1BQUMsQUFBTyxRQUFDLFVBQUMsQUFBUTtBQUMxQyxBQUFNLHVCQUFDLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUssQUFBQyxBQUFDLEFBQUMsQUFDeEM7QUFBQyxBQUFDLEFBQUM7QUFDSCxBQUFNLG1CQUFDLEFBQU0sQUFBQyxBQUNoQjtBQUFDLEFBQ0gsQUFBQzs7Ozs7O0FBbEZZLFFBQVksZUFrRnhCOzs7Ozs7Ozs7O0FDN0ZELGlCQUFjLEFBQWdCLEFBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuL2NvcmUnO1xuaW1wb3J0IEdseXBoID0gcmVxdWlyZSgnLi9HbHlwaCcpO1xuXG5jbGFzcyBDb25zb2xlIHtcbiAgcHJpdmF0ZSBfd2lkdGg6IG51bWJlcjtcbiAgZ2V0IHdpZHRoKCkge1xuICAgIHJldHVybiB0aGlzLl93aWR0aDtcbiAgfVxuICBwcml2YXRlIF9oZWlnaHQ6IG51bWJlcjtcbiAgZ2V0IGhlaWdodCgpIHtcbiAgICByZXR1cm4gdGhpcy5faGVpZ2h0O1xuICB9XG5cbiAgcHJpdmF0ZSBfdGV4dDogbnVtYmVyW11bXTtcbiAgZ2V0IHRleHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RleHQ7XG4gIH1cbiAgcHJpdmF0ZSBfZm9yZTogQ29yZS5Db2xvcltdW107XG4gIGdldCBmb3JlKCkge1xuICAgIHJldHVybiB0aGlzLl9mb3JlO1xuICB9XG4gIHByaXZhdGUgX2JhY2s6IENvcmUuQ29sb3JbXVtdO1xuICBnZXQgYmFjaygpIHtcbiAgICByZXR1cm4gdGhpcy5fYmFjaztcbiAgfVxuICBwcml2YXRlIF9pc0RpcnR5OiBib29sZWFuW11bXTtcbiAgZ2V0IGlzRGlydHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzRGlydHk7XG4gIH1cblxuICBwcml2YXRlIGRlZmF1bHRCYWNrZ3JvdW5kOiBDb3JlLkNvbG9yO1xuICBwcml2YXRlIGRlZmF1bHRGb3JlZ3JvdW5kOiBDb3JlLkNvbG9yO1xuXG4gIGNvbnN0cnVjdG9yKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBmb3JlZ3JvdW5kOiBDb3JlLkNvbG9yID0gMHhmZmZmZmYsIGJhY2tncm91bmQ6IENvcmUuQ29sb3IgPSAweDAwMDAwMCkge1xuICAgIHRoaXMuX3dpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5faGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgdGhpcy5kZWZhdWx0QmFja2dyb3VuZCA9IDB4MDAwMDA7XG4gICAgdGhpcy5kZWZhdWx0Rm9yZWdyb3VuZCA9IDB4ZmZmZmY7XG5cbiAgICB0aGlzLl90ZXh0ID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeDxudW1iZXI+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCBHbHlwaC5DSEFSX1NQQUNFKTtcbiAgICB0aGlzLl9mb3JlID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeDxDb3JlLkNvbG9yPih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5kZWZhdWx0Rm9yZWdyb3VuZCk7XG4gICAgdGhpcy5fYmFjayA9IENvcmUuVXRpbHMuYnVpbGRNYXRyaXg8Q29yZS5Db2xvcj4odGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIHRoaXMuZGVmYXVsdEJhY2tncm91bmQpO1xuICAgIHRoaXMuX2lzRGlydHkgPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4PGJvb2xlYW4+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0cnVlKTtcbiAgfVxuXG4gIGNsZWFuQ2VsbCh4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgIHRoaXMuX2lzRGlydHlbeF1beV0gPSBmYWxzZTtcbiAgfVxuXG4gIHByaW50KHRleHQ6IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIsIGNvbG9yOiBDb3JlLkNvbG9yID0gMHhmZmZmZmYpIHtcbiAgICBsZXQgYmVnaW4gPSAwO1xuICAgIGxldCBlbmQgPSB0ZXh0Lmxlbmd0aDtcbiAgICBpZiAoeCArIGVuZCA+IHRoaXMud2lkdGgpIHtcbiAgICAgIGVuZCA9IHRoaXMud2lkdGggLSB4O1xuICAgIH1cbiAgICBpZiAoeCA8IDApIHtcbiAgICAgIGVuZCArPSB4O1xuICAgICAgeCA9IDA7XG4gICAgfVxuICAgIHRoaXMuc2V0Rm9yZWdyb3VuZChjb2xvciwgeCwgeSwgZW5kLCAxKTtcbiAgICBmb3IgKGxldCBpID0gYmVnaW47IGkgPCBlbmQ7ICsraSkge1xuICAgICAgdGhpcy5zZXRUZXh0KHRleHQuY2hhckNvZGVBdChpKSwgeCArIGksIHkpO1xuICAgIH1cbiAgfVxuXG4gIHNldFRleHQoYXNjaWk6IG51bWJlciB8IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIgPSAxLCBoZWlnaHQ6IG51bWJlciA9IDEpIHtcbiAgICBpZiAodHlwZW9mIGFzY2lpID09PSAnc3RyaW5nJykge1xuICAgICAgYXNjaWkgPSAoPHN0cmluZz5hc2NpaSkuY2hhckNvZGVBdCgwKTtcbiAgICB9XG4gICAgdGhpcy5zZXRNYXRyaXgodGhpcy5fdGV4dCwgYXNjaWksIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuICB9XG5cbiAgc2V0Rm9yZWdyb3VuZChjb2xvcjogQ29yZS5Db2xvciwgeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIgPSAxLCBoZWlnaHQ6IG51bWJlciA9IDEpIHtcbiAgICB0aGlzLnNldE1hdHJpeCh0aGlzLl9mb3JlLCBjb2xvciwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gIH1cblxuICBzZXRCYWNrZ3JvdW5kKGNvbG9yOiBDb3JlLkNvbG9yLCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciA9IDEsIGhlaWdodDogbnVtYmVyID0gMSkge1xuICAgIHRoaXMuc2V0TWF0cml4KHRoaXMuX2JhY2ssIGNvbG9yLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0TWF0cml4PFQ+KG1hdHJpeDogVFtdW10sIHZhbHVlOiBULCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICBmb3IgKGxldCBpID0geDsgaSA8IHggKyB3aWR0aDsgaSsrKSB7XG4gICAgICBmb3IgKGxldCBqID0geTsgaiA8IHkgKyBoZWlnaHQ7IGorKykge1xuICAgICAgICBpZiAobWF0cml4W2ldW2pdID09PSB2YWx1ZSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIG1hdHJpeFtpXVtqXSA9IHZhbHVlO1xuICAgICAgICB0aGlzLl9pc0RpcnR5W2ldW2pdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0ID0gQ29uc29sZTtcbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4vZW50aXRpZXMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2NvbXBvbmVudHMnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbGxlY3Rpb25zIGZyb20gJ3R5cGVzY3JpcHQtY29sbGVjdGlvbnMnO1xuaW1wb3J0ICogYXMgTWl4aW5zIGZyb20gJy4vbWl4aW5zJztcblxuaW1wb3J0IFBpeGlDb25zb2xlID0gcmVxdWlyZSgnLi9QaXhpQ29uc29sZScpO1xuaW1wb3J0IENvbnNvbGUgPSByZXF1aXJlKCcuL0NvbnNvbGUnKTtcblxuaW1wb3J0IElucHV0SGFuZGxlciA9IHJlcXVpcmUoJy4vSW5wdXRIYW5kbGVyJyk7XG5cbmltcG9ydCBTY2VuZSA9IHJlcXVpcmUoJy4vU2NlbmUnKTtcblxuaW50ZXJmYWNlIEZyYW1lUmVuZGVyZXIge1xuICAoZWxhcHNlZFRpbWU6IG51bWJlcik6IHZvaWQ7XG59XG5sZXQgcmVuZGVyZXI6IEZyYW1lUmVuZGVyZXI7XG5sZXQgZnJhbWVMb29wOiAoY2FsbGJhY2s6IChlbGFwc2VkVGltZTogbnVtYmVyKSA9PiB2b2lkKSA9PiB2b2lkO1xuXG5sZXQgZnJhbWVGdW5jID0gKGVsYXBzZWRUaW1lOiBudW1iZXIpID0+IHtcbiAgZnJhbWVMb29wKGZyYW1lRnVuYyk7XG4gIHJlbmRlcmVyKGVsYXBzZWRUaW1lKTtcbn1cblxubGV0IGxvb3AgPSAodGhlUmVuZGVyZXI6IEZyYW1lUmVuZGVyZXIpID0+IHtcbiAgcmVuZGVyZXIgPSB0aGVSZW5kZXJlcjtcbiAgZnJhbWVMb29wKGZyYW1lRnVuYyk7XG59XG5cbmNsYXNzIEVuZ2luZSBpbXBsZW1lbnRzIE1peGlucy5JRXZlbnRIYW5kbGVyIHtcbiAgLy8gRXZlbnRIYW5kbGVyIG1peGluXG4gIGxpc3RlbjogKGxpc3RlbmVyOiBFdmVudHMuTGlzdGVuZXIpID0+IEV2ZW50cy5MaXN0ZW5lcjtcbiAgcmVtb3ZlTGlzdGVuZXI6IChsaXN0ZW5lcjogRXZlbnRzLkxpc3RlbmVyKSA9PiB2b2lkO1xuICBlbWl0OiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gdm9pZDtcbiAgZmlyZTogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IGFueTtcbiAgaXM6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiBib29sZWFuO1xuICBnYXRoZXI6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiBhbnlbXTtcblxuICBwcml2YXRlIHBpeGlDb25zb2xlOiBQaXhpQ29uc29sZTtcblxuICBwcml2YXRlIGdhbWVUaW1lOiBudW1iZXIgPSAwO1xuICBwcml2YXRlIGVuZ2luZVRpY2tzUGVyU2Vjb25kOiBudW1iZXIgPSAxMDtcbiAgcHJpdmF0ZSBlbmdpbmVUaWNrTGVuZ3RoOiBudW1iZXIgPSAxMDA7XG4gIHByaXZhdGUgZWxhcHNlZFRpbWU6IG51bWJlciA9IDA7XG4gIHByaXZhdGUgdGltZUhhbmRsZXJDb21wb25lbnQ6IENvbXBvbmVudHMuVGltZUhhbmRsZXJDb21wb25lbnQ7XG5cbiAgcHJpdmF0ZSB3aWR0aDogbnVtYmVyO1xuICBwcml2YXRlIGhlaWdodDogbnVtYmVyO1xuICBwcml2YXRlIGNhbnZhc0lkOiBzdHJpbmc7XG5cbiAgcHJpdmF0ZSBlbnRpdGllczoge1tndWlkOiBzdHJpbmddOiBFbnRpdGllcy5FbnRpdHl9O1xuICBwcml2YXRlIHRvRGVzdHJveTogRW50aXRpZXMuRW50aXR5W107XG5cbiAgcHJpdmF0ZSBwYXVzZWQ6IGJvb2xlYW47XG5cbiAgcHJpdmF0ZSBfaW5wdXRIYW5kbGVyOiBJbnB1dEhhbmRsZXI7XG4gIGdldCBpbnB1dEhhbmRsZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lucHV0SGFuZGxlcjtcbiAgfVxuXG4gIHByaXZhdGUgX2N1cnJlbnRTY2VuZTogU2NlbmU7XG4gIGdldCBjdXJyZW50U2NlbmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRTY2VuZTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBjYW52YXNJZDogc3RyaW5nKSB7XG4gICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcblxuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLmNhbnZhc0lkID0gY2FudmFzSWQ7XG5cbiAgICB0aGlzLmVudGl0aWVzID0ge307XG4gICAgdGhpcy50b0Rlc3Ryb3kgPSBbXTtcblxuICAgIHRoaXMuZW5naW5lVGlja3NQZXJTZWNvbmQgPSAxMDtcbiAgICBmcmFtZUxvb3AgPSAoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAoPGFueT53aW5kb3cpLndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCAoPGFueT53aW5kb3cpLm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAoPGFueT53aW5kb3cpLm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgKDxhbnk+d2luZG93KS5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICBmdW5jdGlvbihjYWxsYmFjazogKGVsYXBzZWRUaW1lOiBudW1iZXIpID0+IHZvaWQpIHtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCwgbmV3IERhdGUoKS5nZXRUaW1lKCkpO1xuICAgICAgfTtcbiAgICB9KSgpO1xuXG4gICAgdGhpcy5lbmdpbmVUaWNrTGVuZ3RoID0gMTAwMCAvIHRoaXMuZW5naW5lVGlja3NQZXJTZWNvbmQ7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCAoKSA9PiB7XG4gICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICAgIH0pO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgKCkgPT4ge1xuICAgICAgdGhpcy5wYXVzZWQgPSB0cnVlO1xuICAgIH0pO1xuXG4gICAgdGhpcy5faW5wdXRIYW5kbGVyID0gbmV3IElucHV0SGFuZGxlcih0aGlzKTtcbiAgfVxuXG4gIHN0YXJ0KHNjZW5lOiBTY2VuZSkge1xuICAgIHRoaXMuX2N1cnJlbnRTY2VuZSA9IHNjZW5lO1xuICAgIHRoaXMuX2N1cnJlbnRTY2VuZS5zdGFydCgpO1xuXG4gICAgbGV0IHRpbWVLZWVwZXIgPSBuZXcgRW50aXRpZXMuRW50aXR5KHRoaXMsICd0aW1lS2VlcGVyJyk7XG4gICAgdGhpcy50aW1lSGFuZGxlckNvbXBvbmVudCA9IG5ldyBDb21wb25lbnRzLlRpbWVIYW5kbGVyQ29tcG9uZW50KHRoaXMpO1xuICAgIHRpbWVLZWVwZXIuYWRkQ29tcG9uZW50KHRoaXMudGltZUhhbmRsZXJDb21wb25lbnQpO1xuXG4gICAgdGhpcy5waXhpQ29uc29sZSA9IG5ldyBQaXhpQ29uc29sZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5jYW52YXNJZCwgMHhmZmZmZmYsIDB4MDAwMDAwKTtcbiAgICBsb29wKCh0aW1lKSA9PiB7XG4gICAgICBpZiAodGhpcy5wYXVzZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5lbGFwc2VkVGltZSA9IHRpbWUgLSB0aGlzLmdhbWVUaW1lO1xuXG4gICAgICBpZiAodGhpcy5lbGFwc2VkVGltZSA+PSB0aGlzLmVuZ2luZVRpY2tMZW5ndGgpIHtcbiAgICAgICAgdGhpcy5nYW1lVGltZSA9IHRpbWU7XG4gICAgICAgIHRoaXMudGltZUhhbmRsZXJDb21wb25lbnQuZW5naW5lVGljayh0aGlzLmdhbWVUaW1lKTtcblxuICAgICAgICB0aGlzLmRlc3Ryb3lFbnRpdGllcygpO1xuXG4gICAgICAgIHNjZW5lLnJlbmRlcigoY29uc29sZTogQ29uc29sZSwgeDogbnVtYmVyLCB5OiBudW1iZXIpID0+IHtcbiAgICAgICAgICB0aGlzLnBpeGlDb25zb2xlLmJsaXQoY29uc29sZSwgeCwgeSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgdGhpcy5waXhpQ29uc29sZS5yZW5kZXIoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlZ2lzdGVyRW50aXR5KGVudGl0eTogRW50aXRpZXMuRW50aXR5KSB7XG4gICAgdGhpcy5lbnRpdGllc1tlbnRpdHkuZ3VpZF0gPSBlbnRpdHk7XG4gIH1cblxuICByZW1vdmVFbnRpdHkoZW50aXR5OiBFbnRpdGllcy5FbnRpdHkpIHtcbiAgICB0aGlzLnRvRGVzdHJveS5wdXNoKGVudGl0eSk7XG4gIH1cblxuICBwcml2YXRlIGRlc3Ryb3lFbnRpdGllcygpIHtcbiAgICB0aGlzLnRvRGVzdHJveS5mb3JFYWNoKChlbnRpdHkpID0+IHtcbiAgICAgIGVudGl0eS5kZXN0cm95KCk7XG4gICAgICB0aGlzLmVtaXQobmV3IEV2ZW50cy5FdmVudCgnZW50aXR5RGVzdHJveWVkJywge2VudGl0eTogZW50aXR5fSkpO1xuICAgICAgZGVsZXRlIHRoaXMuZW50aXRpZXNbZW50aXR5Lmd1aWRdO1xuICAgIH0pO1xuICAgIHRoaXMudG9EZXN0cm95ID0gW107XG4gIH1cblxuICBnZXRFbnRpdHkoZ3VpZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZW50aXRpZXNbZ3VpZF07XG4gIH1cbn1cblxuQ29yZS5VdGlscy5hcHBseU1peGlucyhFbmdpbmUsIFtNaXhpbnMuRXZlbnRIYW5kbGVyXSk7XG5cbmV4cG9ydCA9IEVuZ2luZTtcbiIsImV4cG9ydCBjbGFzcyBNaXNzaW5nQ29tcG9uZW50RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gIHB1YmxpYyBtZXNzYWdlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTWlzc2luZ0ltcGxlbWVudGF0aW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gIHB1YmxpYyBtZXNzYWdlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRW50aXR5T3ZlcmxhcEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuICBwdWJsaWMgbWVzc2FnZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcblxuY2xhc3MgR2x5cGgge1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRlVMTDogbnVtYmVyID0gMTI5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU1BBQ0U6IG51bWJlciA9IDMyO1xuXHQvLyBzaW5nbGUgd2FsbHNcblx0cHVibGljIHN0YXRpYyBDSEFSX0hMSU5FOiBudW1iZXIgPSAxOTY7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9WTElORTogbnVtYmVyID0gMTc5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU1c6IG51bWJlciA9IDE5MTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1NFOiBudW1iZXIgPSAyMTg7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9OVzogbnVtYmVyID0gMjE3O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfTkU6IG51bWJlciA9IDE5Mjtcblx0cHVibGljIHN0YXRpYyBDSEFSX1RFRVc6IG51bWJlciA9IDE4MDtcblx0cHVibGljIHN0YXRpYyBDSEFSX1RFRUU6IG51bWJlciA9IDE5NTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1RFRU46IG51bWJlciA9IDE5Mztcblx0cHVibGljIHN0YXRpYyBDSEFSX1RFRVM6IG51bWJlciA9IDE5NDtcblx0cHVibGljIHN0YXRpYyBDSEFSX0NST1NTOiBudW1iZXIgPSAxOTc7XG5cdC8vIGRvdWJsZSB3YWxsc1xuXHRwdWJsaWMgc3RhdGljIENIQVJfREhMSU5FOiBudW1iZXIgPSAyMDU7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9EVkxJTkU6IG51bWJlciA9IDE4Njtcblx0cHVibGljIHN0YXRpYyBDSEFSX0RORTogbnVtYmVyID0gMTg3O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRE5XOiBudW1iZXIgPSAyMDE7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9EU0U6IG51bWJlciA9IDE4ODtcblx0cHVibGljIHN0YXRpYyBDSEFSX0RTVzogbnVtYmVyID0gMjAwO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRFRFRVc6IG51bWJlciA9IDE4NTtcblx0cHVibGljIHN0YXRpYyBDSEFSX0RURUVFOiBudW1iZXIgPSAyMDQ7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9EVEVFTjogbnVtYmVyID0gMjAyO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRFRFRVM6IG51bWJlciA9IDIwMztcblx0cHVibGljIHN0YXRpYyBDSEFSX0RDUk9TUzogbnVtYmVyID0gMjA2O1xuXHQvLyBibG9ja3MgXG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9CTE9DSzE6IG51bWJlciA9IDE3Njtcblx0cHVibGljIHN0YXRpYyBDSEFSX0JMT0NLMjogbnVtYmVyID0gMTc3O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQkxPQ0szOiBudW1iZXIgPSAxNzg7XG5cdC8vIGFycm93cyBcblx0cHVibGljIHN0YXRpYyBDSEFSX0FSUk9XX046IG51bWJlciA9IDI0O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQVJST1dfUzogbnVtYmVyID0gMjU7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9BUlJPV19FOiBudW1iZXIgPSAyNjtcblx0cHVibGljIHN0YXRpYyBDSEFSX0FSUk9XX1c6IG51bWJlciA9IDI3O1xuXHQvLyBhcnJvd3Mgd2l0aG91dCB0YWlsIFxuXHRwdWJsaWMgc3RhdGljIENIQVJfQVJST1cyX046IG51bWJlciA9IDMwO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQVJST1cyX1M6IG51bWJlciA9IDMxO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQVJST1cyX0U6IG51bWJlciA9IDE2O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQVJST1cyX1c6IG51bWJlciA9IDE3O1xuXHQvLyBkb3VibGUgYXJyb3dzIFxuXHRwdWJsaWMgc3RhdGljIENIQVJfREFSUk9XX0g6IG51bWJlciA9IDI5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfREFSUk9XX1Y6IG51bWJlciA9IDE4O1xuXHQvLyBHVUkgc3R1ZmYgXG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9DSEVDS0JPWF9VTlNFVDogbnVtYmVyID0gMjI0O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQ0hFQ0tCT1hfU0VUOiBudW1iZXIgPSAyMjU7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9SQURJT19VTlNFVDogbnVtYmVyID0gOTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1JBRElPX1NFVDogbnVtYmVyID0gMTA7XG5cdC8vIHN1Yi1waXhlbCByZXNvbHV0aW9uIGtpdCBcblx0cHVibGljIHN0YXRpYyBDSEFSX1NVQlBfTlc6IG51bWJlciA9IDIyNjtcblx0cHVibGljIHN0YXRpYyBDSEFSX1NVQlBfTkU6IG51bWJlciA9IDIyNztcblx0cHVibGljIHN0YXRpYyBDSEFSX1NVQlBfTjogbnVtYmVyID0gMjI4O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU1VCUF9TRTogbnVtYmVyID0gMjI5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU1VCUF9ESUFHOiBudW1iZXIgPSAyMzA7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9TVUJQX0U6IG51bWJlciA9IDIzMTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1NVQlBfU1c6IG51bWJlciA9IDIzMjtcblx0Ly8gbWlzY2VsbGFuZW91cyBcblx0cHVibGljIHN0YXRpYyBDSEFSX1NNSUxJRSA6IG51bWJlciA9ICAxO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU01JTElFX0lOViA6IG51bWJlciA9ICAyO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfSEVBUlQgOiBudW1iZXIgPSAgMztcblx0cHVibGljIHN0YXRpYyBDSEFSX0RJQU1PTkQgOiBudW1iZXIgPSAgNDtcblx0cHVibGljIHN0YXRpYyBDSEFSX0NMVUIgOiBudW1iZXIgPSAgNTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1NQQURFIDogbnVtYmVyID0gIDY7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9CVUxMRVQgOiBudW1iZXIgPSAgNztcblx0cHVibGljIHN0YXRpYyBDSEFSX0JVTExFVF9JTlYgOiBudW1iZXIgPSAgODtcblx0cHVibGljIHN0YXRpYyBDSEFSX01BTEUgOiBudW1iZXIgPSAgMTE7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9GRU1BTEUgOiBudW1iZXIgPSAgMTI7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9OT1RFIDogbnVtYmVyID0gIDEzO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfTk9URV9ET1VCTEUgOiBudW1iZXIgPSAgMTQ7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9MSUdIVCA6IG51bWJlciA9ICAxNTtcblx0cHVibGljIHN0YXRpYyBDSEFSX0VYQ0xBTV9ET1VCTEUgOiBudW1iZXIgPSAgMTk7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9QSUxDUk9XIDogbnVtYmVyID0gIDIwO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU0VDVElPTiA6IG51bWJlciA9ICAyMTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1BPVU5EIDogbnVtYmVyID0gIDE1Njtcblx0cHVibGljIHN0YXRpYyBDSEFSX01VTFRJUExJQ0FUSU9OIDogbnVtYmVyID0gIDE1ODtcblx0cHVibGljIHN0YXRpYyBDSEFSX0ZVTkNUSU9OIDogbnVtYmVyID0gIDE1OTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1JFU0VSVkVEIDogbnVtYmVyID0gIDE2OTtcblx0cHVibGljIHN0YXRpYyBDSEFSX0hBTEYgOiBudW1iZXIgPSAgMTcxO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfT05FX1FVQVJURVIgOiBudW1iZXIgPSAgMTcyO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQ09QWVJJR0hUIDogbnVtYmVyID0gIDE4NDtcblx0cHVibGljIHN0YXRpYyBDSEFSX0NFTlQgOiBudW1iZXIgPSAgMTg5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfWUVOIDogbnVtYmVyID0gIDE5MDtcblx0cHVibGljIHN0YXRpYyBDSEFSX0NVUlJFTkNZIDogbnVtYmVyID0gIDIwNztcblx0cHVibGljIHN0YXRpYyBDSEFSX1RIUkVFX1FVQVJURVJTIDogbnVtYmVyID0gIDI0Mztcblx0cHVibGljIHN0YXRpYyBDSEFSX0RJVklTSU9OIDogbnVtYmVyID0gIDI0Njtcblx0cHVibGljIHN0YXRpYyBDSEFSX0dSQURFIDogbnVtYmVyID0gIDI0ODtcblx0cHVibGljIHN0YXRpYyBDSEFSX1VNTEFVVCA6IG51bWJlciA9ICAyNDk7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9QT1cxIDogbnVtYmVyID0gIDI1MTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1BPVzMgOiBudW1iZXIgPSAgMjUyO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfUE9XMiA6IG51bWJlciA9ICAyNTM7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9CVUxMRVRfU1FVQVJFIDogbnVtYmVyID0gIDI1NDtcblxuICBwcml2YXRlIF9nbHlwaDogbnVtYmVyO1xuICBnZXQgZ2x5cGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dseXBoO1xuICB9XG4gIHByaXZhdGUgX2ZvcmVncm91bmRDb2xvcjogQ29yZS5Db2xvcjtcbiAgZ2V0IGZvcmVncm91bmRDb2xvcigpIHtcbiAgICByZXR1cm4gdGhpcy5fZm9yZWdyb3VuZENvbG9yO1xuICB9XG4gIHByaXZhdGUgX2JhY2tncm91bmRDb2xvcjogQ29yZS5Db2xvcjtcbiAgZ2V0IGJhY2tncm91bmRDb2xvcigpIHtcbiAgICByZXR1cm4gdGhpcy5fYmFja2dyb3VuZENvbG9yO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZzogc3RyaW5nIHwgbnVtYmVyID0gR2x5cGguQ0hBUl9TUEFDRSwgZjogQ29yZS5Db2xvciA9IDB4ZmZmZmZmLCBiOiBDb3JlLkNvbG9yID0gMHgwMDAwMDApIHtcbiAgICB0aGlzLl9nbHlwaCA9IHR5cGVvZiBnID09PSAnc3RyaW5nJyA/IGcuY2hhckNvZGVBdCgwKSA6IGc7XG4gICAgdGhpcy5fZm9yZWdyb3VuZENvbG9yID0gZjtcbiAgICB0aGlzLl9iYWNrZ3JvdW5kQ29sb3IgPSBiO1xuICB9XG59XG5cbmV4cG9ydCA9IEdseXBoO1xuIiwiaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4vRW5naW5lJyk7XG5cbmNsYXNzIElucHV0SGFuZGxlciB7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1BFUklPRDogbnVtYmVyID0gMTkwO1xuICBwdWJsaWMgc3RhdGljIEtFWV9MRUZUOiBudW1iZXIgPSAzNztcbiAgcHVibGljIHN0YXRpYyBLRVlfVVA6IG51bWJlciA9IDM4O1xuICBwdWJsaWMgc3RhdGljIEtFWV9SSUdIVDogbnVtYmVyID0gMzk7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0RPV046IG51bWJlciA9IDQwO1xuXG4gIHB1YmxpYyBzdGF0aWMgS0VZXzA6IG51bWJlciA9IDQ4O1xuICBwdWJsaWMgc3RhdGljIEtFWV8xOiBudW1iZXIgPSA0OTtcbiAgcHVibGljIHN0YXRpYyBLRVlfMjogbnVtYmVyID0gNTA7XG4gIHB1YmxpYyBzdGF0aWMgS0VZXzM6IG51bWJlciA9IDUxO1xuICBwdWJsaWMgc3RhdGljIEtFWV80OiBudW1iZXIgPSA1MjtcbiAgcHVibGljIHN0YXRpYyBLRVlfNTogbnVtYmVyID0gNTM7XG4gIHB1YmxpYyBzdGF0aWMgS0VZXzY6IG51bWJlciA9IDU0O1xuICBwdWJsaWMgc3RhdGljIEtFWV83OiBudW1iZXIgPSA1NTtcbiAgcHVibGljIHN0YXRpYyBLRVlfODogbnVtYmVyID0gNTY7XG4gIHB1YmxpYyBzdGF0aWMgS0VZXzk6IG51bWJlciA9IDU3O1xuXG4gIHB1YmxpYyBzdGF0aWMgS0VZX0E6IG51bWJlciA9IDY1O1xuICBwdWJsaWMgc3RhdGljIEtFWV9COiBudW1iZXIgPSA2NjtcbiAgcHVibGljIHN0YXRpYyBLRVlfQzogbnVtYmVyID0gNjc7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0Q6IG51bWJlciA9IDY4O1xuICBwdWJsaWMgc3RhdGljIEtFWV9FOiBudW1iZXIgPSA2OTtcbiAgcHVibGljIHN0YXRpYyBLRVlfRjogbnVtYmVyID1cdDcwO1xuICBwdWJsaWMgc3RhdGljIEtFWV9HOiBudW1iZXIgPVx0NzE7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0g6IG51bWJlciA9XHQ3MjtcbiAgcHVibGljIHN0YXRpYyBLRVlfSTogbnVtYmVyID1cdDczO1xuICBwdWJsaWMgc3RhdGljIEtFWV9KOiBudW1iZXIgPVx0NzQ7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0s6IG51bWJlciA9XHQ3NTtcbiAgcHVibGljIHN0YXRpYyBLRVlfTDogbnVtYmVyID1cdDc2O1xuICBwdWJsaWMgc3RhdGljIEtFWV9NOiBudW1iZXIgPVx0Nzc7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX046IG51bWJlciA9XHQ3ODtcbiAgcHVibGljIHN0YXRpYyBLRVlfTzogbnVtYmVyID1cdDc5O1xuICBwdWJsaWMgc3RhdGljIEtFWV9QOiBudW1iZXIgPVx0ODA7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1E6IG51bWJlciA9XHQ4MTtcbiAgcHVibGljIHN0YXRpYyBLRVlfUjogbnVtYmVyID1cdDgyO1xuICBwdWJsaWMgc3RhdGljIEtFWV9TOiBudW1iZXIgPVx0ODM7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1Q6IG51bWJlciA9XHQ4NDtcbiAgcHVibGljIHN0YXRpYyBLRVlfVTogbnVtYmVyID1cdDg1O1xuICBwdWJsaWMgc3RhdGljIEtFWV9WOiBudW1iZXIgPVx0ODY7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1c6IG51bWJlciA9XHQ4NztcbiAgcHVibGljIHN0YXRpYyBLRVlfWDogbnVtYmVyID1cdDg4O1xuICBwdWJsaWMgc3RhdGljIEtFWV9ZOiBudW1iZXIgPVx0ODk7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1o6IG51bWJlciA9XHQ5MDtcblxuICBwcml2YXRlIGxpc3RlbmVyczoge1trZXljb2RlOiBudW1iZXJdOiAoKCkgPT4gYW55KVtdfTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVuZ2luZTogRW5naW5lKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMgPSB7fTtcblxuICAgIHRoaXMucmVnaXN0ZXJMaXN0ZW5lcnMoKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLm9uS2V5RG93bi5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25LZXlEb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYgKHRoaXMubGlzdGVuZXJzW2V2ZW50LmtleUNvZGVdKSB7XG4gICAgICB0aGlzLmxpc3RlbmVyc1tldmVudC5rZXlDb2RlXS5mb3JFYWNoKChjYWxsYmFjaykgPT4ge1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGxpc3RlbihrZXljb2RlczogbnVtYmVyW10sIGNhbGxiYWNrOiAoKSA9PiBhbnkpIHtcbiAgICBrZXljb2Rlcy5mb3JFYWNoKChrZXljb2RlKSA9PiB7XG4gICAgICBpZiAoIXRoaXMubGlzdGVuZXJzW2tleWNvZGVdKSB7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzW2tleWNvZGVdID0gW107XG4gICAgICB9XG4gICAgICB0aGlzLmxpc3RlbmVyc1trZXljb2RlXS5wdXNoKGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgPSBJbnB1dEhhbmRsZXI7XG4iLCJpbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgRW50aXRpZXMgZnJvbSAnLi9lbnRpdGllcyc7XG5cbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuL0VuZ2luZScpO1xuaW1wb3J0IENvbnNvbGUgPSByZXF1aXJlKCcuL0NvbnNvbGUnKTtcblxuY2xhc3MgTG9nVmlldyB7XG4gIHByaXZhdGUgY3VycmVudFR1cm46IG51bWJlcjtcbiAgcHJpdmF0ZSBtZXNzYWdlczoge3R1cm46IG51bWJlciwgbWVzc2FnZTogc3RyaW5nfVtdO1xuICBwcml2YXRlIGNvbnNvbGU6IENvbnNvbGU7XG4gIHByaXZhdGUgcGxheWVyOiBFbnRpdGllcy5FbnRpdHk7XG4gIHByaXZhdGUgbWF4TWVzc2FnZXM6IG51bWJlcjtcbiAgcHJpdmF0ZSBlZmZlY3RzOiBhbnlbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVuZ2luZTogRW5naW5lLCBwcml2YXRlIHdpZHRoOiBudW1iZXIsIHByaXZhdGUgaGVpZ2h0OiBudW1iZXIsIHBsYXllcjogRW50aXRpZXMuRW50aXR5KSB7XG4gICAgdGhpcy5yZWdpc3Rlckxpc3RlbmVycygpO1xuXG4gICAgdGhpcy5jb25zb2xlID0gbmV3IENvbnNvbGUodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIHRoaXMuY3VycmVudFR1cm4gPSAxO1xuICAgIHRoaXMubWVzc2FnZXMgPSBbXTtcbiAgICB0aGlzLm1heE1lc3NhZ2VzID0gdGhpcy5oZWlnaHQgLSAxO1xuXG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgdGhpcy5lZmZlY3RzID0gW107XG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ3R1cm4nLFxuICAgICAgdGhpcy5vblR1cm4uYmluZCh0aGlzKVxuICAgICkpO1xuXG4gICAgdGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAnbWVzc2FnZScsXG4gICAgICB0aGlzLm9uTWVzc2FnZS5iaW5kKHRoaXMpXG4gICAgKSk7XG4gIH1cblxuICBwcml2YXRlIG9uVHVybihldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgdGhpcy5jdXJyZW50VHVybiA9IGV2ZW50LmRhdGEuY3VycmVudFR1cm47XG4gICAgaWYgKHRoaXMubWVzc2FnZXMubGVuZ3RoID4gMCAmJiB0aGlzLm1lc3NhZ2VzW3RoaXMubWVzc2FnZXMubGVuZ3RoIC0gMV0udHVybiA8IHRoaXMuY3VycmVudFR1cm4gLSAxMCkge1xuICAgICAgdGhpcy5tZXNzYWdlcy5wb3AoKTtcbiAgICAgIHRoaXMuY29uc29sZS5zZXRUZXh0KCcgJywgMCwgMCwgdGhpcy5jb25zb2xlLndpZHRoLCB0aGlzLmNvbnNvbGUuaGVpZ2h0KTtcbiAgICB9XG5cbiAgICB0aGlzLmVmZmVjdHMgPSB0aGlzLnBsYXllci5nYXRoZXIobmV3IEV2ZW50cy5FdmVudCgnZ2V0U3RhdHVzRWZmZWN0JykpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1lc3NhZ2UoZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGlmIChldmVudC5kYXRhLm1lc3NhZ2UpIHtcbiAgICAgIHRoaXMubWVzc2FnZXMudW5zaGlmdCh7XG4gICAgICAgIHR1cm46IHRoaXMuY3VycmVudFR1cm4sXG4gICAgICAgIG1lc3NhZ2U6IGV2ZW50LmRhdGEubWVzc2FnZVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+IHRoaXMubWF4TWVzc2FnZXMpIHtcbiAgICAgIHRoaXMubWVzc2FnZXMucG9wKCk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKGJsaXRGdW5jdGlvbjogYW55KSB7XG4gICAgdGhpcy5jb25zb2xlLnNldFRleHQoJyAnLCB0aGlzLndpZHRoIC0gMTAsIDAsIDEwKTtcbiAgICB0aGlzLmNvbnNvbGUucHJpbnQoJ1R1cm46ICcgKyB0aGlzLmN1cnJlbnRUdXJuLCB0aGlzLndpZHRoIC0gMTAsIDAsIDB4ZmZmZmZmKTtcbiAgICBpZiAodGhpcy5lZmZlY3RzLmxlbmd0aCA+IDApIHtcbiAgICAgIGxldCBzdHIgPSB0aGlzLmVmZmVjdHMucmVkdWNlKChhY2MsIGVmZmVjdCwgaWR4KSA9PiB7XG4gICAgICAgIHJldHVybiBhY2MgKyBlZmZlY3QubmFtZSArIChpZHggIT09IHRoaXMuZWZmZWN0cy5sZW5ndGggLSAxID8gJywgJyA6ICcnKTtcbiAgICAgIH0sICdFZmZlY3RzOiAnKTtcbiAgICAgIHRoaXMuY29uc29sZS5wcmludChzdHIsIDAsIDAsIDB4ZmZmZmZmKTtcbiAgICB9XG4gICAgdGhpcy5jb25zb2xlLnByaW50XG4gICAgaWYgKHRoaXMubWVzc2FnZXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5tZXNzYWdlcy5mb3JFYWNoKChkYXRhLCBpZHgpID0+IHtcbiAgICAgICAgbGV0IGNvbG9yID0gMHhmZmZmZmY7XG4gICAgICAgIGlmIChkYXRhLnR1cm4gPCB0aGlzLmN1cnJlbnRUdXJuIC0gNSkge1xuICAgICAgICAgIGNvbG9yID0gMHg2NjY2NjY7XG4gICAgICAgIH0gZWxzZSBpZiAoZGF0YS50dXJuIDwgdGhpcy5jdXJyZW50VHVybiAtIDIpIHtcbiAgICAgICAgICBjb2xvciA9IDB4YWFhYWFhO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29uc29sZS5wcmludChkYXRhLm1lc3NhZ2UsIDAsIHRoaXMuaGVpZ2h0IC0gaWR4LCBjb2xvcik7XG4gICAgICB9KTtcbiAgICB9XG4gICAgYmxpdEZ1bmN0aW9uKHRoaXMuY29uc29sZSk7XG4gIH1cbn1cblxuZXhwb3J0ID0gTG9nVmlldztcbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcblxuaW1wb3J0IFRpbGUgPSByZXF1aXJlKCcuL1RpbGUnKTtcblxuY2xhc3MgTWFwIHtcbiAgcHJpdmF0ZSBfd2lkdGg7XG4gIGdldCB3aWR0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5fd2lkdGg7XG4gIH1cbiAgcHJpdmF0ZSBfaGVpZ2h0O1xuICBnZXQgaGVpZ2h0KCkge1xuICAgIHJldHVybiB0aGlzLl9oZWlnaHQ7XG4gIH1cbiAgcHVibGljIHRpbGVzOiBUaWxlW11bXTtcblxuICBjb25zdHJ1Y3Rvcih3OiBudW1iZXIsIGg6IG51bWJlcikge1xuICAgIHRoaXMuX3dpZHRoID0gdztcbiAgICB0aGlzLl9oZWlnaHQgPSBoO1xuICAgIHRoaXMudGlsZXMgPSBbXTtcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMuX3dpZHRoOyB4KyspIHtcbiAgICAgIHRoaXMudGlsZXNbeF0gPSBbXTtcbiAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5faGVpZ2h0OyB5KyspIHtcbiAgICAgICAgdGhpcy50aWxlc1t4XVt5XSA9IFRpbGUuY3JlYXRlVGlsZShUaWxlLkVNUFRZKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRUaWxlKHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uKTogVGlsZSB7XG4gICAgcmV0dXJuIHRoaXMudGlsZXNbcG9zaXRpb24ueF1bcG9zaXRpb24ueV07XG4gIH1cblxuICBzZXRUaWxlKHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uLCB0aWxlOiBUaWxlKSB7XG4gICAgdGhpcy50aWxlc1twb3NpdGlvbi54XVtwb3NpdGlvbi55XSA9IHRpbGU7XG4gIH1cblxuICBmb3JFYWNoKGNhbGxiYWNrOiAocG9zaXRpb246IENvcmUuUG9zaXRpb24sIHRpbGU6IFRpbGUpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuX2hlaWdodDsgeSsrKSB7XG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMuX3dpZHRoOyB4KyspIHtcbiAgICAgICAgY2FsbGJhY2sobmV3IENvcmUuUG9zaXRpb24oeCwgeSksIHRoaXMudGlsZXNbeF1beV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlzV2Fsa2FibGUocG9zaXRpb246IENvcmUuUG9zaXRpb24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy50aWxlc1twb3NpdGlvbi54XVtwb3NpdGlvbi55XS53YWxrYWJsZTtcbiAgfVxufVxuXG5leHBvcnQgPSBNYXA7XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4vY29yZSc7XG5cbmltcG9ydCBNYXAgPSByZXF1aXJlKCcuL01hcCcpO1xuaW1wb3J0IFRpbGUgPSByZXF1aXJlKCcuL1RpbGUnKTtcbmltcG9ydCBHbHlwaCA9IHJlcXVpcmUoJy4vR2x5cGgnKTtcblxuY2xhc3MgTWFwR2VuZXJhdG9yIHtcbiAgcHJpdmF0ZSB3aWR0aDogbnVtYmVyO1xuICBwcml2YXRlIGhlaWdodDogbnVtYmVyO1xuXG4gIHByaXZhdGUgYmFja2dyb3VuZENvbG9yOiBDb3JlLkNvbG9yO1xuICBwcml2YXRlIGZvcmVncm91bmRDb2xvcjogQ29yZS5Db2xvcjtcblxuICBjb25zdHJ1Y3Rvcih3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcblxuICAgIHRoaXMuYmFja2dyb3VuZENvbG9yID0gMHgwMDAwMDA7XG4gICAgdGhpcy5mb3JlZ3JvdW5kQ29sb3IgPSAweGFhYWFhYTtcbiAgfVxuXG4gIGdlbmVyYXRlKCk6IE1hcCB7XG4gICAgbGV0IGNlbGxzOiBudW1iZXJbXVtdID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeCh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgMCk7XG4gICAgbGV0IG1hcCA9IG5ldyBNYXAodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuXG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICBpZiAoeCA9PT0gMCB8fCB4ID09PSAodGhpcy53aWR0aCAtIDEpIHx8IHkgPT09IDAgfHwgeSA9PT0gKHRoaXMuaGVpZ2h0IC0gMSkpIHtcbiAgICAgICAgICBjZWxsc1t4XVt5XSA9IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKE1hdGgucmFuZG9tKCkgPiAwLjkpIHtcbiAgICAgICAgICAgIGNlbGxzW3hdW3ldID0gMTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2VsbHNbeF1beV0gPSAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBsZXQgdGlsZTogVGlsZTtcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgIGlmIChjZWxsc1t4XVt5XSA9PT0gMCkge1xuICAgICAgICAgIHRpbGUgPSBUaWxlLmNyZWF0ZVRpbGUoVGlsZS5GTE9PUik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGlsZSA9IFRpbGUuY3JlYXRlVGlsZShUaWxlLldBTEwpO1xuICAgICAgICAgIHRpbGUuZ2x5cGggPSB0aGlzLmdldFdhbGxHbHlwaCh4LCB5LCBjZWxscyk7XG4gICAgICAgIH1cbiAgICAgICAgbWFwLnNldFRpbGUobmV3IENvcmUuUG9zaXRpb24oeCwgeSksIHRpbGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtYXA7XG4gIH1cblxuICBwcml2YXRlIGdldFdhbGxHbHlwaCh4OiBudW1iZXIsIHk6IG51bWJlciwgY2VsbHM6IG51bWJlcltdW10pOiBHbHlwaCB7XG4gICAgbGV0IFcgPSAoeCA+IDAgJiYgY2VsbHNbeCAtIDFdW3ldID09PSAxKTtcbiAgICBsZXQgRSA9ICh4IDwgdGhpcy53aWR0aCAtIDEgJiYgY2VsbHNbeCArIDFdW3ldID09PSAxKTtcbiAgICBsZXQgTiA9ICh5ID4gMCAmJiBjZWxsc1t4XVt5IC0gMV0gPT09IDEpO1xuICAgIGxldCBTID0gKHkgPCB0aGlzLmhlaWdodCAtIDEgJiYgY2VsbHNbeF1beSArIDFdID09PSAxKTtcblxuICAgIGxldCBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX0NST1NTLCB0aGlzLmZvcmVncm91bmRDb2xvciwgdGhpcy5iYWNrZ3JvdW5kQ29sb3IpO1xuICAgIGlmIChXICYmIEUgJiYgUyAmJiBOKSB7XG4gICAgICBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX0NST1NTLCB0aGlzLmZvcmVncm91bmRDb2xvciwgdGhpcy5iYWNrZ3JvdW5kQ29sb3IpO1xuICAgIH0gZWxzZSBpZiAoKFcgfHwgRSkgJiYgIVMgJiYgIU4pIHtcbiAgICAgIGdseXBoID0gbmV3IEdseXBoKEdseXBoLkNIQVJfSExJTkUsIHRoaXMuZm9yZWdyb3VuZENvbG9yLCB0aGlzLmJhY2tncm91bmRDb2xvcik7XG4gICAgfSBlbHNlIGlmICgoUyB8fCBOKSAmJiAhVyAmJiAhRSkge1xuICAgICAgZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9WTElORSwgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9IGVsc2UgaWYgKFMgJiYgRSAmJiAhVyAmJiAhTikge1xuICAgICAgZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9TRSwgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9IGVsc2UgaWYgKFMgJiYgVyAmJiAhRSAmJiAhTikge1xuICAgICAgZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9TVywgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9IGVsc2UgaWYgKE4gJiYgRSAmJiAhVyAmJiAhUykge1xuICAgICAgZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9ORSwgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9IGVsc2UgaWYgKE4gJiYgVyAmJiAhRSAmJiAhUykge1xuICAgICAgZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9OVywgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9IGVsc2UgaWYgKE4gJiYgVyAmJiBFICYmICFTKSB7XG4gICAgICBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX1RFRU4sIHRoaXMuZm9yZWdyb3VuZENvbG9yLCB0aGlzLmJhY2tncm91bmRDb2xvcik7XG4gICAgfSBlbHNlIGlmIChTICYmIFcgJiYgRSAmJiAhTikge1xuICAgICAgZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9URUVTLCB0aGlzLmZvcmVncm91bmRDb2xvciwgdGhpcy5iYWNrZ3JvdW5kQ29sb3IpO1xuICAgIH0gZWxzZSBpZiAoTiAmJiBTICYmIEUgJiYgIVcpIHtcbiAgICAgIGdseXBoID0gbmV3IEdseXBoKEdseXBoLkNIQVJfVEVFRSwgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9IGVsc2UgaWYgKE4gJiYgUyAmJiBXICYmICFFKSB7XG4gICAgICBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX1RFRVcsIHRoaXMuZm9yZWdyb3VuZENvbG9yLCB0aGlzLmJhY2tncm91bmRDb2xvcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdseXBoO1xuICB9XG59XG5cbmV4cG9ydCA9IE1hcEdlbmVyYXRvcjtcbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9jb21wb25lbnRzJztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4vZW50aXRpZXMnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4vZXZlbnRzJztcblxuaW1wb3J0IEdseXBoID0gcmVxdWlyZSgnLi9HbHlwaCcpO1xuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4vRW5naW5lJyk7XG5pbXBvcnQgQ29uc29sZSA9IHJlcXVpcmUoJy4vQ29uc29sZScpO1xuaW1wb3J0IE1hcCA9IHJlcXVpcmUoJy4vTWFwJyk7XG5pbXBvcnQgVGlsZSA9IHJlcXVpcmUoJy4vVGlsZScpO1xuXG5jbGFzcyBNYXBWaWV3IHtcbiAgcHJpdmF0ZSByZW5kZXJhYmxlRW50aXRpZXM6ICh7Z3VpZDogc3RyaW5nLCByZW5kZXJhYmxlOiBDb21wb25lbnRzLlJlbmRlcmFibGVDb21wb25lbnQsIHBoeXNpY3M6IENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudH0pW107XG4gIHByaXZhdGUgcmVuZGVyYWJsZUl0ZW1zOiAoe2d1aWQ6IHN0cmluZywgcmVuZGVyYWJsZTogQ29tcG9uZW50cy5SZW5kZXJhYmxlQ29tcG9uZW50LCBwaHlzaWNzOiBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnR9KVtdO1xuICBwcml2YXRlIGNvbnNvbGU6IENvbnNvbGU7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlbmdpbmU6IEVuZ2luZSwgcHJpdmF0ZSBtYXA6IE1hcCwgcHJpdmF0ZSB3aWR0aDogbnVtYmVyLCBwcml2YXRlIGhlaWdodDogbnVtYmVyKSB7XG4gICAgdGhpcy5yZWdpc3Rlckxpc3RlbmVycygpO1xuICAgIHRoaXMuY29uc29sZSA9IG5ldyBDb25zb2xlKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICB0aGlzLnJlbmRlcmFibGVFbnRpdGllcyA9IFtdO1xuICAgIHRoaXMucmVuZGVyYWJsZUl0ZW1zID0gW107XG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ3JlbmRlcmFibGVDb21wb25lbnRDcmVhdGVkJyxcbiAgICAgIHRoaXMub25SZW5kZXJhYmxlQ29tcG9uZW50Q3JlYXRlZC5iaW5kKHRoaXMpXG4gICAgKSk7XG4gICAgdGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAncmVuZGVyYWJsZUNvbXBvbmVudERlc3Ryb3llZCcsXG4gICAgICB0aGlzLm9uUmVuZGVyYWJsZUNvbXBvbmVudERlc3Ryb3llZC5iaW5kKHRoaXMpXG4gICAgKSk7XG4gIH1cblxuICBwcml2YXRlIG9uUmVuZGVyYWJsZUNvbXBvbmVudERlc3Ryb3llZChldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgY29uc3QgcGh5c2ljcyA9IDxDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ+ZXZlbnQuZGF0YS5lbnRpdHkuZ2V0Q29tcG9uZW50KENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCk7XG4gICAgbGV0IGlkeCA9IG51bGw7XG5cbiAgICBpZiAocGh5c2ljcy5ibG9ja2luZykge1xuICAgICAgaWR4ID0gdGhpcy5yZW5kZXJhYmxlRW50aXRpZXMuZmluZEluZGV4KChlbnRpdHkpID0+IHtcbiAgICAgICAgcmV0dXJuIGVudGl0eS5ndWlkID09PSBldmVudC5kYXRhLmVudGl0eS5ndWlkO1xuICAgICAgfSk7XG4gICAgICBpZiAoaWR4ICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMucmVuZGVyYWJsZUVudGl0aWVzLnNwbGljZShpZHgsIDEpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZHggPSB0aGlzLnJlbmRlcmFibGVJdGVtcy5maW5kSW5kZXgoKGVudGl0eSkgPT4ge1xuICAgICAgICByZXR1cm4gZW50aXR5Lmd1aWQgPT09IGV2ZW50LmRhdGEuZW50aXR5Lmd1aWQ7XG4gICAgICB9KTtcbiAgICAgIGlmIChpZHggIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJhYmxlSXRlbXMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBvblJlbmRlcmFibGVDb21wb25lbnRDcmVhdGVkKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBjb25zdCBwaHlzaWNzID0gPENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudD5ldmVudC5kYXRhLmVudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KTtcblxuICAgIGlmIChwaHlzaWNzLmJsb2NraW5nKSB7XG4gICAgICB0aGlzLnJlbmRlcmFibGVFbnRpdGllcy5wdXNoKHtcbiAgICAgICAgZ3VpZDogZXZlbnQuZGF0YS5lbnRpdHkuZ3VpZCxcbiAgICAgICAgcmVuZGVyYWJsZTogZXZlbnQuZGF0YS5yZW5kZXJhYmxlQ29tcG9uZW50LFxuICAgICAgICBwaHlzaWNzOiBwaHlzaWNzXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZW5kZXJhYmxlSXRlbXMucHVzaCh7XG4gICAgICAgIGd1aWQ6IGV2ZW50LmRhdGEuZW50aXR5Lmd1aWQsXG4gICAgICAgIHJlbmRlcmFibGU6IGV2ZW50LmRhdGEucmVuZGVyYWJsZUNvbXBvbmVudCxcbiAgICAgICAgcGh5c2ljczogcGh5c2ljc1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKGJsaXRGdW5jdGlvbjogYW55KSB7XG4gICAgdGhpcy5yZW5kZXJNYXAodGhpcy5jb25zb2xlKTtcbiAgICBibGl0RnVuY3Rpb24odGhpcy5jb25zb2xlKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyTWFwKGNvbnNvbGU6IENvbnNvbGUpIHtcbiAgICB0aGlzLnJlbmRlckJhY2tncm91bmQoY29uc29sZSk7XG4gICAgdGhpcy5yZW5kZXJJdGVtcyhjb25zb2xlKTtcbiAgICB0aGlzLnJlbmRlckVudGl0aWVzKGNvbnNvbGUpO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJFbnRpdGllcyhjb25zb2xlOiBDb25zb2xlKSB7XG4gICAgdGhpcy5yZW5kZXJhYmxlRW50aXRpZXMuZm9yRWFjaCgoZGF0YSkgPT4ge1xuICAgICAgaWYgKGRhdGEucmVuZGVyYWJsZSAmJiBkYXRhLnBoeXNpY3MpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJHbHlwaChjb25zb2xlLCBkYXRhLnJlbmRlcmFibGUuZ2x5cGgsIGRhdGEucGh5c2ljcy5wb3NpdGlvbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckl0ZW1zKGNvbnNvbGU6IENvbnNvbGUpIHtcbiAgICB0aGlzLnJlbmRlcmFibGVJdGVtcy5mb3JFYWNoKChkYXRhKSA9PiB7XG4gICAgICBpZiAoZGF0YS5yZW5kZXJhYmxlICYmIGRhdGEucGh5c2ljcykge1xuICAgICAgICB0aGlzLnJlbmRlckdseXBoKGNvbnNvbGUsIGRhdGEucmVuZGVyYWJsZS5nbHlwaCwgZGF0YS5waHlzaWNzLnBvc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyR2x5cGgoY29uc29sZTogQ29uc29sZSwgZ2x5cGg6IEdseXBoLCBwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbikge1xuICAgIGNvbnNvbGUuc2V0VGV4dChnbHlwaC5nbHlwaCwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XG4gICAgY29uc29sZS5zZXRGb3JlZ3JvdW5kKGdseXBoLmZvcmVncm91bmRDb2xvciwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckJhY2tncm91bmQoY29uc29sZTogQ29uc29sZSkge1xuICAgIHRoaXMubWFwLmZvckVhY2goKHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uLCB0aWxlOiBUaWxlKSA9PiB7XG4gICAgICBsZXQgZ2x5cGggPSB0aWxlLmdseXBoO1xuICAgICAgY29uc29sZS5zZXRUZXh0KGdseXBoLmdseXBoLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcbiAgICAgIGNvbnNvbGUuc2V0Rm9yZWdyb3VuZChnbHlwaC5mb3JlZ3JvdW5kQ29sb3IsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xuICAgICAgY29uc29sZS5zZXRCYWNrZ3JvdW5kKGdseXBoLmJhY2tncm91bmRDb2xvciwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0ID0gTWFwVmlldztcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9Jy4uL3R5cGluZ3MvaW5kZXguZC50cycgLz5cblxuaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuL2NvcmUnO1xuXG5pbXBvcnQgR2x5cGggPSByZXF1aXJlKCcuL0dseXBoJyk7XG5pbXBvcnQgQ29uc29sZSA9IHJlcXVpcmUoJy4vQ29uc29sZScpO1xuXG5jbGFzcyBQaXhpQ29uc29sZSB7XG4gIHByaXZhdGUgX3dpZHRoOiBudW1iZXI7XG4gIHByaXZhdGUgX2hlaWdodDogbnVtYmVyO1xuXG4gIHByaXZhdGUgY2FudmFzSWQ6IHN0cmluZztcbiAgcHJpdmF0ZSB0ZXh0OiBudW1iZXJbXVtdO1xuICBwcml2YXRlIGZvcmU6IENvcmUuQ29sb3JbXVtdO1xuICBwcml2YXRlIGJhY2s6IENvcmUuQ29sb3JbXVtdO1xuICBwcml2YXRlIGlzRGlydHk6IGJvb2xlYW5bXVtdO1xuXG4gIHByaXZhdGUgcmVuZGVyZXI6IGFueTtcbiAgcHJpdmF0ZSBzdGFnZTogUElYSS5Db250YWluZXI7XG5cbiAgcHJpdmF0ZSBsb2FkZWQ6IGJvb2xlYW47XG5cbiAgcHJpdmF0ZSBjaGFyV2lkdGg6IG51bWJlcjtcbiAgcHJpdmF0ZSBjaGFySGVpZ2h0OiBudW1iZXI7XG5cbiAgcHJpdmF0ZSBmb250OiBQSVhJLkJhc2VUZXh0dXJlO1xuICBwcml2YXRlIGNoYXJzOiBQSVhJLlRleHR1cmVbXTtcblxuICBwcml2YXRlIGZvcmVDZWxsczogUElYSS5TcHJpdGVbXVtdO1xuICBwcml2YXRlIGJhY2tDZWxsczogUElYSS5TcHJpdGVbXVtdO1xuXG4gIHByaXZhdGUgZGVmYXVsdEJhY2tncm91bmQ6IENvcmUuQ29sb3I7XG4gIHByaXZhdGUgZGVmYXVsdEZvcmVncm91bmQ6IENvcmUuQ29sb3I7XG5cbiAgcHJpdmF0ZSBjYW52YXM6IGFueTtcbiAgcHJpdmF0ZSB0b3BMZWZ0UG9zaXRpb246IENvcmUuUG9zaXRpb247XG5cbiAgY29uc3RydWN0b3Iod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGNhbnZhc0lkOiBzdHJpbmcsIGZvcmVncm91bmQ6IENvcmUuQ29sb3IgPSAweGZmZmZmZiwgYmFja2dyb3VuZDogQ29yZS5Db2xvciA9IDB4MDAwMDAwKSB7XG4gICAgdGhpcy5fd2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLl9oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICB0aGlzLmNhbnZhc0lkID0gY2FudmFzSWQ7XG5cbiAgICB0aGlzLmxvYWRlZCA9IGZhbHNlO1xuICAgIHRoaXMuc3RhZ2UgPSBuZXcgUElYSS5Db250YWluZXIoKTtcblxuICAgIHRoaXMubG9hZEZvbnQoKTtcbiAgICB0aGlzLmRlZmF1bHRCYWNrZ3JvdW5kID0gMHgwMDAwMDtcbiAgICB0aGlzLmRlZmF1bHRGb3JlZ3JvdW5kID0gMHhmZmZmZjtcblxuICAgIHRoaXMudGV4dCA9IENvcmUuVXRpbHMuYnVpbGRNYXRyaXg8bnVtYmVyPih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgR2x5cGguQ0hBUl9TUEFDRSk7XG4gICAgdGhpcy5mb3JlID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeDxDb3JlLkNvbG9yPih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5kZWZhdWx0Rm9yZWdyb3VuZCk7XG4gICAgdGhpcy5iYWNrID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeDxDb3JlLkNvbG9yPih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5kZWZhdWx0QmFja2dyb3VuZCk7XG4gICAgdGhpcy5pc0RpcnR5ID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeDxib29sZWFuPih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdHJ1ZSk7XG4gIH1cblxuICBnZXQgaGVpZ2h0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2hlaWdodDtcbiAgfVxuXG4gIGdldCB3aWR0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl93aWR0aDtcbiAgfVxuXG4gIHByaXZhdGUgbG9hZEZvbnQoKSB7XG4gICAgbGV0IGZvbnRVcmwgPSAnLi90ZXJtaW5hbDE2eDE2LnBuZyc7XG4gICAgdGhpcy5mb250ID0gUElYSS5CYXNlVGV4dHVyZS5mcm9tSW1hZ2UoZm9udFVybCwgZmFsc2UsIFBJWEkuU0NBTEVfTU9ERVMuTkVBUkVTVCk7XG4gICAgaWYgKHRoaXMuZm9udC5oYXNMb2FkZWQpIHtcbiAgICAgIHRoaXMub25Gb250TG9hZGVkKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZm9udC5vbignbG9hZGVkJywgdGhpcy5vbkZvbnRMb2FkZWQuYmluZCh0aGlzKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBvbkZvbnRMb2FkZWQoKSB7XG4gICAgdGhpcy5jaGFyV2lkdGggPSB0aGlzLmZvbnQud2lkdGggLyAxNjtcbiAgICB0aGlzLmNoYXJIZWlnaHQgPSB0aGlzLmZvbnQuaGVpZ2h0IC8gMTY7XG5cbiAgICB0aGlzLmluaXRDYW52YXMoKTtcbiAgICB0aGlzLmluaXRDaGFyYWN0ZXJNYXAoKTtcbiAgICB0aGlzLmluaXRCYWNrZ3JvdW5kQ2VsbHMoKTtcbiAgICB0aGlzLmluaXRGb3JlZ3JvdW5kQ2VsbHMoKTtcbiAgICB0aGlzLmFkZEdyaWRPdmVybGF5KClcbiAgICB0aGlzLmxvYWRlZCA9IHRydWU7XG4gICAgLy90aGlzLmFuaW1hdGUoKTtcbiAgfVxuXG4gIHByaXZhdGUgaW5pdENhbnZhcygpIHtcbiAgICBsZXQgY2FudmFzV2lkdGggPSB0aGlzLndpZHRoICogdGhpcy5jaGFyV2lkdGg7XG4gICAgbGV0IGNhbnZhc0hlaWdodCA9IHRoaXMuaGVpZ2h0ICogdGhpcy5jaGFySGVpZ2h0O1xuXG4gICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aGlzLmNhbnZhc0lkKTtcblxuICAgIGxldCBwaXhpT3B0aW9ucyA9IHtcbiAgICAgIGFudGlhbGlhczogZmFsc2UsXG4gICAgICBjbGVhckJlZm9yZVJlbmRlcjogZmFsc2UsXG4gICAgICBwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IGZhbHNlLFxuICAgICAgcmVzb2x1dGlvbjogMSxcbiAgICAgIHRyYW5zcGFyZW50OiBmYWxzZSxcbiAgICAgIGJhY2tncm91bmRDb2xvcjogQ29yZS5Db2xvclV0aWxzLnRvTnVtYmVyKHRoaXMuZGVmYXVsdEJhY2tncm91bmQpLFxuICAgICAgdmlldzogdGhpcy5jYW52YXNcbiAgICB9O1xuICAgIHRoaXMucmVuZGVyZXIgPSBQSVhJLmF1dG9EZXRlY3RSZW5kZXJlcihjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0LCBwaXhpT3B0aW9ucyk7XG4gICAgdGhpcy5yZW5kZXJlci5iYWNrZ3JvdW5kQ29sb3IgPSBDb3JlLkNvbG9yVXRpbHMudG9OdW1iZXIodGhpcy5kZWZhdWx0QmFja2dyb3VuZCk7XG4gICAgdGhpcy50b3BMZWZ0UG9zaXRpb24gPSBuZXcgQ29yZS5Qb3NpdGlvbih0aGlzLmNhbnZhcy5vZmZzZXRMZWZ0LCB0aGlzLmNhbnZhcy5vZmZzZXRUb3ApO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0Q2hhcmFjdGVyTWFwKCkge1xuICAgIHRoaXMuY2hhcnMgPSBbXTtcbiAgICBmb3IgKCBsZXQgeCA9IDA7IHggPCAxNjsgeCsrKSB7XG4gICAgICBmb3IgKCBsZXQgeSA9IDA7IHkgPCAxNjsgeSsrKSB7XG4gICAgICAgIGxldCByZWN0ID0gbmV3IFBJWEkuUmVjdGFuZ2xlKHggKiB0aGlzLmNoYXJXaWR0aCwgeSAqIHRoaXMuY2hhckhlaWdodCwgdGhpcy5jaGFyV2lkdGgsIHRoaXMuY2hhckhlaWdodCk7XG4gICAgICAgIHRoaXMuY2hhcnNbeCArIHkgKiAxNl0gPSBuZXcgUElYSS5UZXh0dXJlKHRoaXMuZm9udCwgcmVjdCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBpbml0QmFja2dyb3VuZENlbGxzKCkge1xuICAgIHRoaXMuYmFja0NlbGxzID0gW107XG4gICAgZm9yICggbGV0IHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICB0aGlzLmJhY2tDZWxsc1t4XSA9IFtdO1xuICAgICAgZm9yICggbGV0IHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICBsZXQgY2VsbCA9IG5ldyBQSVhJLlNwcml0ZSh0aGlzLmNoYXJzW0dseXBoLkNIQVJfRlVMTF0pO1xuICAgICAgICBjZWxsLnBvc2l0aW9uLnggPSB4ICogdGhpcy5jaGFyV2lkdGg7XG4gICAgICAgIGNlbGwucG9zaXRpb24ueSA9IHkgKiB0aGlzLmNoYXJIZWlnaHQ7XG4gICAgICAgIGNlbGwud2lkdGggPSB0aGlzLmNoYXJXaWR0aDtcbiAgICAgICAgY2VsbC5oZWlnaHQgPSB0aGlzLmNoYXJIZWlnaHQ7XG4gICAgICAgIGNlbGwudGludCA9IENvcmUuQ29sb3JVdGlscy50b051bWJlcih0aGlzLmRlZmF1bHRCYWNrZ3JvdW5kKTtcbiAgICAgICAgdGhpcy5iYWNrQ2VsbHNbeF1beV0gPSBjZWxsO1xuICAgICAgICB0aGlzLnN0YWdlLmFkZENoaWxkKGNlbGwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaW5pdEZvcmVncm91bmRDZWxscygpIHtcbiAgICB0aGlzLmZvcmVDZWxscyA9IFtdO1xuICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICB0aGlzLmZvcmVDZWxsc1t4XSA9IFtdO1xuICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgIGxldCBjZWxsID0gbmV3IFBJWEkuU3ByaXRlKHRoaXMuY2hhcnNbR2x5cGguQ0hBUl9TUEFDRV0pO1xuICAgICAgICBjZWxsLnBvc2l0aW9uLnggPSB4ICogdGhpcy5jaGFyV2lkdGg7XG4gICAgICAgIGNlbGwucG9zaXRpb24ueSA9IHkgKiB0aGlzLmNoYXJIZWlnaHQ7XG4gICAgICAgIGNlbGwud2lkdGggPSB0aGlzLmNoYXJXaWR0aDtcbiAgICAgICAgY2VsbC5oZWlnaHQgPSB0aGlzLmNoYXJIZWlnaHQ7XG4gICAgICAgIGNlbGwudGludCA9IENvcmUuQ29sb3JVdGlscy50b051bWJlcih0aGlzLmRlZmF1bHRGb3JlZ3JvdW5kKTtcbiAgICAgICAgdGhpcy5mb3JlQ2VsbHNbeF1beV0gPSBjZWxsO1xuICAgICAgICB0aGlzLnN0YWdlLmFkZENoaWxkKGNlbGwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYWRkR3JpZE92ZXJsYXkoKSB7XG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICBsZXQgY2VsbCA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG4gICAgICAgIGNlbGwubGluZVN0eWxlKDEsIDB4NDQ0NDQ0LCAwLjUpO1xuICAgICAgICBjZWxsLmJlZ2luRmlsbCgwLCAwKTtcbiAgICAgICAgY2VsbC5kcmF3UmVjdCh4ICogdGhpcy5jaGFyV2lkdGgsIHkgKiB0aGlzLmNoYXJIZWlnaHQsIHRoaXMuY2hhcldpZHRoLCB0aGlzLmNoYXJIZWlnaHQpO1xuICAgICAgICB0aGlzLnN0YWdlLmFkZENoaWxkKGNlbGwpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qXG4gIHByaXZhdGUgYW5pbWF0ZSgpIHtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5hbmltYXRlLmJpbmQodGhpcykpO1xuICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc3RhZ2UpO1xuICB9XG4gICovXG5cbiAgcmVuZGVyKCkge1xuICAgIGlmICh0aGlzLmxvYWRlZCkge1xuICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zdGFnZSk7XG4gICAgfVxuICB9XG5cbiAgYmxpdChjb25zb2xlOiBDb25zb2xlLCBvZmZzZXRYOiBudW1iZXIgPSAwLCBvZmZzZXRZOiBudW1iZXIgPSAwLCBmb3JjZURpcnR5OiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBpZiAoIXRoaXMubG9hZGVkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgY29uc29sZS53aWR0aDsgeCsrKSB7XG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IGNvbnNvbGUuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgaWYgKGZvcmNlRGlydHkgfHwgY29uc29sZS5pc0RpcnR5W3hdW3ldKSB7XG4gICAgICAgICAgbGV0IGFzY2lpID0gY29uc29sZS50ZXh0W3hdW3ldO1xuICAgICAgICAgIGxldCBweCA9IG9mZnNldFggKyB4O1xuICAgICAgICAgIGxldCBweSA9IG9mZnNldFkgKyB5O1xuICAgICAgICAgIGlmIChhc2NpaSA+IDAgJiYgYXNjaWkgPD0gMjU1KSB7XG4gICAgICAgICAgICB0aGlzLmZvcmVDZWxsc1tweF1bcHldLnRleHR1cmUgPSB0aGlzLmNoYXJzW2FzY2lpXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5mb3JlQ2VsbHNbcHhdW3B5XS50aW50ID0gQ29yZS5Db2xvclV0aWxzLnRvTnVtYmVyKGNvbnNvbGUuZm9yZVt4XVt5XSk7XG4gICAgICAgICAgdGhpcy5iYWNrQ2VsbHNbcHhdW3B5XS50aW50ID0gQ29yZS5Db2xvclV0aWxzLnRvTnVtYmVyKGNvbnNvbGUuYmFja1t4XVt5XSk7XG4gICAgICAgICAgY29uc29sZS5jbGVhbkNlbGwoeCwgeSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRQb3NpdGlvbkZyb21QaXhlbHMoeDogbnVtYmVyLCB5OiBudW1iZXIpIDogQ29yZS5Qb3NpdGlvbiB7XG4gICAgaWYgKCF0aGlzLmxvYWRlZCkge1xuICAgICAgcmV0dXJuIG5ldyBDb3JlLlBvc2l0aW9uKC0xLCAtMSk7XG4gICAgfSBcbiAgICBsZXQgZHg6IG51bWJlciA9IHggLSB0aGlzLnRvcExlZnRQb3NpdGlvbi54O1xuICAgIGxldCBkeTogbnVtYmVyID0geSAtIHRoaXMudG9wTGVmdFBvc2l0aW9uLnk7XG4gICAgbGV0IHJ4ID0gTWF0aC5mbG9vcihkeCAvIHRoaXMuY2hhcldpZHRoKTtcbiAgICBsZXQgcnkgPSBNYXRoLmZsb29yKGR5IC8gdGhpcy5jaGFySGVpZ2h0KTtcbiAgICByZXR1cm4gbmV3IENvcmUuUG9zaXRpb24ocngsIHJ5KTtcbiAgfVxufVxuXG5leHBvcnQgPSBQaXhpQ29uc29sZTtcbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vY29tcG9uZW50cyc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuL2VudGl0aWVzJztcbmltcG9ydCAqIGFzIEV4Y2VwdGlvbnMgZnJvbSAnLi9FeGNlcHRpb25zJztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4vRW5naW5lJyk7XG5pbXBvcnQgQ29uc29sZSA9IHJlcXVpcmUoJy4vQ29uc29sZScpO1xuaW1wb3J0IE1hcEdlbmVyYXRvciA9IHJlcXVpcmUoJy4vTWFwR2VuZXJhdG9yJyk7XG5pbXBvcnQgTWFwID0gcmVxdWlyZSgnLi9NYXAnKTtcbmltcG9ydCBUaWxlID0gcmVxdWlyZSgnLi9UaWxlJyk7XG5pbXBvcnQgR2x5cGggPSByZXF1aXJlKCcuL0dseXBoJyk7XG5cbmltcG9ydCBNYXBWaWV3ID0gcmVxdWlyZSgnLi9NYXBWaWV3Jyk7XG5pbXBvcnQgTG9nVmlldyA9IHJlcXVpcmUoJy4vTG9nVmlldycpO1xuXG5jbGFzcyBTY2VuZSB7XG4gIHByaXZhdGUgX2VuZ2luZTogRW5naW5lO1xuICBnZXQgZW5naW5lKCkge1xuICAgIHJldHVybiB0aGlzLl9lbmdpbmU7XG4gIH1cblxuICBwcml2YXRlIF9tYXA6IE1hcDtcbiAgZ2V0IG1hcCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwO1xuICB9XG5cbiAgcHJpdmF0ZSB3aWR0aDogbnVtYmVyO1xuICBwcml2YXRlIGhlaWdodDogbnVtYmVyO1xuXG4gIHByaXZhdGUgbG9nVmlldzogTG9nVmlldztcbiAgcHJpdmF0ZSBtYXBWaWV3OiBNYXBWaWV3O1xuXG4gIHByaXZhdGUgcGxheWVyOiBFbnRpdGllcy5FbnRpdHk7XG5cbiAgY29uc3RydWN0b3IoZW5naW5lOiBFbmdpbmUsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgdGhpcy5fZW5naW5lID0gZW5naW5lO1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcblxuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgbGV0IG1hcEdlbmVyYXRvciA9IG5ldyBNYXBHZW5lcmF0b3IodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQgLSA1KTtcbiAgICB0aGlzLl9tYXAgPSBtYXBHZW5lcmF0b3IuZ2VuZXJhdGUoKTtcbiAgICBDb3JlLlBvc2l0aW9uLnNldE1heFZhbHVlcyh0aGlzLm1hcC53aWR0aCwgdGhpcy5tYXAuaGVpZ2h0KTtcblxuICAgIHRoaXMucmVnaXN0ZXJMaXN0ZW5lcnMoKTtcblxuICAgIHRoaXMubWFwVmlldyA9IG5ldyBNYXBWaWV3KHRoaXMuZW5naW5lLCB0aGlzLm1hcCwgdGhpcy5tYXAud2lkdGgsIHRoaXMubWFwLmhlaWdodCk7XG5cbiAgICB0aGlzLmdlbmVyYXRlV2lseSgpO1xuICAgIHRoaXMubG9nVmlldyA9IG5ldyBMb2dWaWV3KHRoaXMuZW5naW5lLCB0aGlzLndpZHRoLCA1LCB0aGlzLnBsYXllcik7XG5cbiAgICB0aGlzLmdlbmVyYXRlUmF0cygpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZW5lcmF0ZVdpbHkoKSB7XG4gICAgdGhpcy5wbGF5ZXIgPSBFbnRpdGllcy5jcmVhdGVXaWx5KHRoaXMuZW5naW5lKTtcbiAgICB0aGlzLnBvc2l0aW9uRW50aXR5KHRoaXMucGxheWVyKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2VuZXJhdGVSYXRzKG51bTogbnVtYmVyID0gMTApIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTsgaSsrKSB7XG4gICAgICB0aGlzLmdlbmVyYXRlUmF0KCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBnZW5lcmF0ZVJhdCgpIHtcbiAgICB0aGlzLnBvc2l0aW9uRW50aXR5KEVudGl0aWVzLmNyZWF0ZVJhdCh0aGlzLmVuZ2luZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBwb3NpdGlvbkVudGl0eShlbnRpdHk6IEVudGl0aWVzLkVudGl0eSkge1xuICAgIGxldCBjb21wb25lbnQgPSA8Q29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KTtcbiAgICBsZXQgcG9zaXRpb25lZCA9IGZhbHNlO1xuICAgIGxldCB0cmllcyA9IDA7XG4gICAgbGV0IHBvc2l0aW9uID0gbnVsbDtcbiAgICB3aGlsZSAodHJpZXMgPCAxMDAgJiYgIXBvc2l0aW9uZWQpIHtcbiAgICAgIHBvc2l0aW9uID0gQ29yZS5Qb3NpdGlvbi5nZXRSYW5kb20oKTtcbiAgICAgIHBvc2l0aW9uZWQgPSB0aGlzLmlzV2l0aG91dEVudGl0eShwb3NpdGlvbik7XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uZWQpIHtcbiAgICAgIGNvbXBvbmVudC5tb3ZlVG8ocG9zaXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAnaXNXaXRob3V0RW50aXR5JywgXG4gICAgICB0aGlzLm9uSXNXaXRob3V0RW50aXR5LmJpbmQodGhpcylcbiAgICApKTtcbiAgICB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdtb3ZlZEZyb20nLCBcbiAgICAgIHRoaXMub25Nb3ZlZEZyb20uYmluZCh0aGlzKVxuICAgICkpO1xuICAgIHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ21vdmVkVG8nLCBcbiAgICAgIHRoaXMub25Nb3ZlZFRvLmJpbmQodGhpcylcbiAgICApKTtcbiAgICB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdnZXRUaWxlJywgXG4gICAgICB0aGlzLm9uR2V0VGlsZS5iaW5kKHRoaXMpXG4gICAgKSk7XG4gIH1cblxuICBwcml2YXRlIG9uR2V0VGlsZShldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgbGV0IHBvc2l0aW9uID0gZXZlbnQuZGF0YS5wb3NpdGlvbjtcbiAgICByZXR1cm4gdGhpcy5tYXAuZ2V0VGlsZShwb3NpdGlvbik7XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZWRGcm9tKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBsZXQgdGlsZSA9IHRoaXMubWFwLmdldFRpbGUoZXZlbnQuZGF0YS5waHlzaWNzQ29tcG9uZW50LnBvc2l0aW9uKTtcbiAgICBpZiAoIWV2ZW50LmRhdGEucGh5c2ljc0NvbXBvbmVudC5ibG9ja2luZykge1xuICAgICAgZGVsZXRlIHRpbGUucHJvcHNbZXZlbnQuZGF0YS5lbnRpdHkuZ3VpZF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRpbGUuZW50aXR5ID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZWRUbyhldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgbGV0IHRpbGUgPSB0aGlzLm1hcC5nZXRUaWxlKGV2ZW50LmRhdGEucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbik7XG4gICAgaWYgKCFldmVudC5kYXRhLnBoeXNpY3NDb21wb25lbnQuYmxvY2tpbmcpIHtcbiAgICAgIHRpbGUucHJvcHNbZXZlbnQuZGF0YS5lbnRpdHkuZ3VpZF0gPSBldmVudC5kYXRhLmVudGl0eTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRpbGUuZW50aXR5KSB7XG4gICAgICAgIHRocm93IG5ldyBFeGNlcHRpb25zLkVudGl0eU92ZXJsYXBFcnJvcignVHdvIGVudGl0aWVzIGNhbm5vdCBiZSBhdCB0aGUgc2FtZSBzcG90Jyk7XG4gICAgICB9XG4gICAgICB0aWxlLmVudGl0eSA9IGV2ZW50LmRhdGEuZW50aXR5O1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25Jc1dpdGhvdXRFbnRpdHkoZXZlbnQ6IEV2ZW50cy5FdmVudCk6IGJvb2xlYW4ge1xuICAgIGxldCBwb3NpdGlvbiA9IGV2ZW50LmRhdGEucG9zaXRpb247XG4gICAgcmV0dXJuIHRoaXMuaXNXaXRob3V0RW50aXR5KHBvc2l0aW9uKTtcbiAgfVxuXG4gIHByaXZhdGUgaXNXaXRob3V0RW50aXR5KHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uKTogYm9vbGVhbiB7XG4gICAgbGV0IHRpbGUgPSB0aGlzLm1hcC5nZXRUaWxlKHBvc2l0aW9uKTtcbiAgICByZXR1cm4gdGlsZS53YWxrYWJsZSAmJiB0aWxlLmVudGl0eSA9PT0gbnVsbDtcbiAgfVxuXG4gIHJlbmRlcihibGl0RnVuY3Rpb246IGFueSk6IHZvaWQge1xuICAgIHRoaXMubWFwVmlldy5yZW5kZXIoKGNvbnNvbGU6IENvbnNvbGUpID0+IHtcbiAgICAgIGJsaXRGdW5jdGlvbihjb25zb2xlLCAwLCAwKTtcbiAgICB9KTtcbiAgICB0aGlzLmxvZ1ZpZXcucmVuZGVyKChjb25zb2xlOiBDb25zb2xlKSA9PiB7XG4gICAgICBibGl0RnVuY3Rpb24oY29uc29sZSwgMCwgdGhpcy5oZWlnaHQgLSA1KTtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgPSBTY2VuZTtcbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4vZW50aXRpZXMnO1xuXG5pbXBvcnQgR2x5cGggPSByZXF1aXJlKCcuL0dseXBoJyk7XG5cbmludGVyZmFjZSBUaWxlRGVzY3JpcHRpb24ge1xuICBnbHlwaDogR2x5cGg7XG4gIHdhbGthYmxlOiBib29sZWFuO1xuICBibG9ja3NTaWdodDogYm9vbGVhbjtcbn1cblxuY2xhc3MgVGlsZSB7XG4gIHB1YmxpYyBnbHlwaDogR2x5cGg7XG4gIHB1YmxpYyB3YWxrYWJsZTogYm9vbGVhbjtcbiAgcHVibGljIGJsb2Nrc1NpZ2h0OiBib29sZWFuO1xuICBwdWJsaWMgZW50aXR5OiBFbnRpdGllcy5FbnRpdHk7XG4gIHB1YmxpYyBwcm9wczoge1tndWlkOiBzdHJpbmddOiBFbnRpdGllcy5FbnRpdHl9O1xuXG4gIHB1YmxpYyBzdGF0aWMgRU1QVFk6IFRpbGVEZXNjcmlwdGlvbiA9IHtcbiAgICBnbHlwaDogbmV3IEdseXBoKEdseXBoLkNIQVJfU1BBQ0UsIDB4ZmZmZmZmLCAweDAwMDAwMCksXG4gICAgd2Fsa2FibGU6IGZhbHNlLFxuICAgIGJsb2Nrc1NpZ2h0OiB0cnVlLFxuICB9O1xuXG4gIHB1YmxpYyBzdGF0aWMgRkxPT1I6IFRpbGVEZXNjcmlwdGlvbiA9IHtcbiAgICBnbHlwaDogbmV3IEdseXBoKCdcXCcnLCAweDIyMjIyMiwgMHgwMDAwMDApLFxuICAgIHdhbGthYmxlOiB0cnVlLFxuICAgIGJsb2Nrc1NpZ2h0OiB0cnVlLFxuICB9O1xuXG4gIHB1YmxpYyBzdGF0aWMgV0FMTDogVGlsZURlc2NyaXB0aW9uID0ge1xuICAgIGdseXBoOiBuZXcgR2x5cGgoR2x5cGguQ0hBUl9ITElORSwgMHhmZmZmZmYsIDB4MDAwMDAwKSxcbiAgICB3YWxrYWJsZTogZmFsc2UsXG4gICAgYmxvY2tzU2lnaHQ6IHRydWUsXG4gIH07XG5cbiAgY29uc3RydWN0b3IoZ2x5cGg6IEdseXBoLCB3YWxrYWJsZTogYm9vbGVhbiwgYmxvY2tzU2lnaHQ6IGJvb2xlYW4pIHtcbiAgICB0aGlzLmdseXBoID0gZ2x5cGg7XG4gICAgdGhpcy53YWxrYWJsZSA9IHdhbGthYmxlO1xuICAgIHRoaXMuYmxvY2tzU2lnaHQgPSBibG9ja3NTaWdodDtcbiAgICB0aGlzLmVudGl0eSA9IG51bGw7XG4gICAgdGhpcy5wcm9wcyA9IHt9O1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBjcmVhdGVUaWxlKGRlc2M6IFRpbGVEZXNjcmlwdGlvbikge1xuICAgIHJldHVybiBuZXcgVGlsZShkZXNjLmdseXBoLCBkZXNjLndhbGthYmxlLCBkZXNjLmJsb2Nrc1NpZ2h0KTtcbiAgfVxufVxuXG5leHBvcnQgPSBUaWxlO1xuIiwiaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4vRW5naW5lJyk7XG5pbXBvcnQgU2NlbmUgPSByZXF1aXJlKCcuL1NjZW5lJyk7XG5cbndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG4gIGxldCBlbmdpbmUgPSBuZXcgRW5naW5lKDYwLCA0MCwgJ3JvZ3VlJyk7XG4gIGxldCBzY2VuZSA9IG5ldyBTY2VuZShlbmdpbmUsIDYwLCA0MCk7XG4gIGVuZ2luZS5zdGFydChzY2VuZSk7XG59O1xuIiwiaW1wb3J0ICogYXMgRXhjZXB0aW9ucyBmcm9tICcuLi9FeGNlcHRpb25zJztcblxuZXhwb3J0IGNsYXNzIEFjdGlvbiB7XG4gIHByb3RlY3RlZCBjb3N0OiBudW1iZXIgPSAxMDA7XG4gIGFjdCgpOiBudW1iZXIge1xuICAgIHRocm93IG5ldyBFeGNlcHRpb25zLk1pc3NpbmdJbXBsZW1lbnRhdGlvbkVycm9yKCdBY3Rpb24uYWN0IG11c3QgYmUgb3ZlcndyaXR0ZW4nKTtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgRXhjZXB0aW9ucyBmcm9tICcuLi9FeGNlcHRpb25zJztcbmltcG9ydCAqIGFzIEJlaGF2aW91cnMgZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuLi9lbnRpdGllcyc7XG5cbmV4cG9ydCBjbGFzcyBCZWhhdmlvdXIge1xuICBwcm90ZWN0ZWQgbmV4dEFjdGlvbjogQmVoYXZpb3Vycy5BY3Rpb247XG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBlbnRpdHk6IEVudGl0aWVzLkVudGl0eSkge1xuICB9XG4gIGdldE5leHRBY3Rpb24oKTogQmVoYXZpb3Vycy5BY3Rpb24ge1xuICAgIHRocm93IG5ldyBFeGNlcHRpb25zLk1pc3NpbmdJbXBsZW1lbnRhdGlvbkVycm9yKCdCZWhhdmlvdXIuZ2V0TmV4dEFjdGlvbiBtdXN0IGJlIG92ZXJ3cml0dGVuJyk7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIEJlaGF2aW91cnMgZnJvbSAnLi9pbmRleCc7XG5cbmV4cG9ydCBjbGFzcyBOdWxsQWN0aW9uIGV4dGVuZHMgQmVoYXZpb3Vycy5BY3Rpb24ge1xuICBhY3QoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5jb3N0O1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBCZWhhdmlvdXJzIGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuLi9jb21wb25lbnRzJztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4uL2VudGl0aWVzJztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgUmFuZG9tV2Fsa0JlaGF2aW91ciBleHRlbmRzIEJlaGF2aW91cnMuQmVoYXZpb3VyIHtcbiAgcHJpdmF0ZSBwaHlzaWNzQ29tcG9uZW50OiBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ7XG5cbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIGVuZ2luZTogRW5naW5lLCBwcm90ZWN0ZWQgZW50aXR5OiBFbnRpdGllcy5FbnRpdHkpIHtcbiAgICBzdXBlcihlbnRpdHkpO1xuICAgIHRoaXMucGh5c2ljc0NvbXBvbmVudCA9IDxDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudChDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQpO1xuICB9XG5cbiAgZ2V0TmV4dEFjdGlvbigpOiBCZWhhdmlvdXJzLkFjdGlvbiB7XG4gICAgbGV0IHBvc2l0aW9ucyA9IENvcmUuVXRpbHMucmFuZG9taXplQXJyYXkoQ29yZS5Qb3NpdGlvbi5nZXROZWlnaGJvdXJzKHRoaXMucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbikpO1xuICAgIGxldCBpc1dpdGhvdXRFbnRpdHkgPSBmYWxzZTtcbiAgICBsZXQgcG9zaXRpb246IENvcmUuUG9zaXRpb24gPSBudWxsO1xuICAgIHdoaWxlKCFpc1dpdGhvdXRFbnRpdHkgJiYgcG9zaXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgIHBvc2l0aW9uID0gcG9zaXRpb25zLnBvcCgpO1xuICAgICAgaXNXaXRob3V0RW50aXR5ID0gdGhpcy5lbmdpbmUuaXMobmV3IEV2ZW50cy5FdmVudCgnaXNXaXRob3V0RW50aXR5Jywge3Bvc2l0aW9uOiBwb3NpdGlvbn0pKTtcbiAgICB9XG4gICAgXG4gICAgaWYgKGlzV2l0aG91dEVudGl0eSkge1xuICAgICAgcmV0dXJuIG5ldyBCZWhhdmlvdXJzLldhbGtBY3Rpb24odGhpcy5waHlzaWNzQ29tcG9uZW50LCBwb3NpdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgQmVoYXZpb3Vycy5OdWxsQWN0aW9uKCk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuLi9jb21wb25lbnRzJztcbmltcG9ydCAqIGFzIEJlaGF2aW91cnMgZnJvbSAnLi9pbmRleCc7XG5cbmV4cG9ydCBjbGFzcyBXYWxrQWN0aW9uIGV4dGVuZHMgQmVoYXZpb3Vycy5BY3Rpb24ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHBoeXNpY3NDb21wb25lbnQ6IENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCwgcHJpdmF0ZSBwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbikge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBhY3QoKTogbnVtYmVyIHtcbiAgICB0aGlzLnBoeXNpY3NDb21wb25lbnQubW92ZVRvKHRoaXMucG9zaXRpb24pO1xuICAgIHJldHVybiB0aGlzLmNvc3Q7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIEJlaGF2aW91cnMgZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuLi9lbnRpdGllcyc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi4vY29tcG9uZW50cyc7XG5cbmltcG9ydCBUaWxlID0gcmVxdWlyZSgnLi4vVGlsZScpO1xuaW1wb3J0IEdseXBoID0gcmVxdWlyZSgnLi4vR2x5cGgnKTtcbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIFdyaXRlUnVuZUFjdGlvbiBleHRlbmRzIEJlaGF2aW91cnMuQWN0aW9uIHtcbiAgcHJpdmF0ZSBlbmdpbmU6IEVuZ2luZTtcbiAgcHJpdmF0ZSBwaHlzaWNzOiBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ7XG5cbiAgY29uc3RydWN0b3IoZW5naW5lOiBFbmdpbmUsIGVudGl0eTogRW50aXRpZXMuRW50aXR5KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTtcbiAgICB0aGlzLnBoeXNpY3MgPSA8Q29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KTtcbiAgfVxuXG4gIGFjdCgpOiBudW1iZXIge1xuICAgIGNvbnN0IHJ1bmUgPSBuZXcgRW50aXRpZXMuRW50aXR5KHRoaXMuZW5naW5lLCAnUnVuZScsICdydW5lJyk7XG4gICAgcnVuZS5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCh0aGlzLmVuZ2luZSwge1xuICAgICAgcG9zaXRpb246IHRoaXMucGh5c2ljcy5wb3NpdGlvbixcbiAgICAgIGJsb2NraW5nOiBmYWxzZVxuICAgIH0pKTtcbiAgICBydW5lLmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5SZW5kZXJhYmxlQ29tcG9uZW50KHRoaXMuZW5naW5lLCB7XG4gICAgICBnbHlwaDogbmV3IEdseXBoKCcjJywgMHg0NGZmODgsIDB4MDAwMDAwKVxuICAgIH0pKTtcbiAgICBydW5lLmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5TZWxmRGVzdHJ1Y3RDb21wb25lbnQodGhpcy5lbmdpbmUsIHtcbiAgICAgIHR1cm5zOiAxMFxuICAgIH0pKTtcbiAgICBydW5lLmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5SdW5lRnJlZXplQ29tcG9uZW50KHRoaXMuZW5naW5lKSk7XG4gICAgcmV0dXJuIHRoaXMuY29zdDtcbiAgfVxufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9BY3Rpb24nO1xuZXhwb3J0ICogZnJvbSAnLi9CZWhhdmlvdXInO1xuZXhwb3J0ICogZnJvbSAnLi9XYWxrQWN0aW9uJztcbmV4cG9ydCAqIGZyb20gJy4vTnVsbEFjdGlvbic7XG5leHBvcnQgKiBmcm9tICcuL1dyaXRlUnVuZUFjdGlvbic7XG5leHBvcnQgKiBmcm9tICcuL1JhbmRvbVdhbGtCZWhhdmlvdXInO1xuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV4Y2VwdGlvbnMgZnJvbSAnLi4vRXhjZXB0aW9ucyc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuLi9lbnRpdGllcyc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIENvbXBvbmVudCB7XG4gIHByb3RlY3RlZCBsaXN0ZW5lcnM6IEV2ZW50cy5MaXN0ZW5lcltdO1xuXG4gIHByb3RlY3RlZCBfZ3VpZDogc3RyaW5nO1xuICBnZXQgZ3VpZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ3VpZDtcbiAgfVxuXG4gIHByb3RlY3RlZCBfZW50aXR5OiBFbnRpdGllcy5FbnRpdHk7XG4gIGdldCBlbnRpdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VudGl0eTtcbiAgfVxuXG4gIHByb3RlY3RlZCBfZW5naW5lOiBFbmdpbmU7XG4gIGdldCBlbmdpbmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuZ2luZTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBkYXRhOiBhbnkgPSB7fSkge1xuICAgIHRoaXMuX2d1aWQgPSBDb3JlLlV0aWxzLmdlbmVyYXRlR3VpZCgpO1xuICAgIHRoaXMuX2VuZ2luZSA9IGVuZ2luZTtcbiAgICB0aGlzLmxpc3RlbmVycyA9IFtdO1xuICB9XG5cbiAgcmVnaXN0ZXJFbnRpdHkoZW50aXR5OiBFbnRpdGllcy5FbnRpdHkpIHtcbiAgICB0aGlzLl9lbnRpdHkgPSBlbnRpdHk7XG4gICAgdGhpcy5jaGVja1JlcXVpcmVtZW50cygpO1xuICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xuICAgIHRoaXMucmVnaXN0ZXJMaXN0ZW5lcnMoKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBjaGVja1JlcXVpcmVtZW50cygpOiB2b2lkIHtcbiAgfVxuXG4gIHByb3RlY3RlZCByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgfVxuXG4gIHByb3RlY3RlZCBpbml0aWFsaXplKCkge1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAoIXRoaXMubGlzdGVuZXJzIHx8IHR5cGVvZiB0aGlzLmxpc3RlbmVycy5mb3JFYWNoICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLmxvZyh0aGlzKTtcbiAgICAgIGRlYnVnZ2VyO1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbnMuTWlzc2luZ0ltcGxlbWVudGF0aW9uRXJyb3IoJ2B0aGlzLmxpc3RlbmVyc2AgaGFzIGJlZW4gcmVkZWZpbmVkLCBkZWZhdWx0IGBkZXN0cm95YCBmdW5jdGlvbiBzaG91bGQgbm90IGJlIHVzZWQuIEZvcjogJyArIHRoaXMuZW50aXR5Lm5hbWUpO1xuICAgIH1cbiAgICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgdGhpcy5lbmdpbmUucmVtb3ZlTGlzdGVuZXIobGlzdGVuZXIpO1xuICAgIH0pO1xuICAgIHRoaXMubGlzdGVuZXJzID0gW107XG4gIH1cbn1cbiIsImltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcblxuZXhwb3J0IGNsYXNzIEVuZXJneUNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSBfY3VycmVudEVuZXJneTogbnVtYmVyO1xuICBnZXQgY3VycmVudEVuZXJneSgpIHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudEVuZXJneTtcbiAgfVxuXG4gIHByaXZhdGUgX2VuZXJneVJlZ2VuZXJhdGlvblJhdGU6IG51bWJlcjtcbiAgZ2V0IGVuZXJneVJlZ2VuZXJhdGlvblJhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuZXJneVJlZ2VuZXJhdGlvblJhdGU7XG4gIH1cblxuICBwcml2YXRlIF9tYXhFbmVyZ3k6IG51bWJlcjtcbiAgZ2V0IG1heEVuZXJneSgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWF4RW5lcmd5O1xuICB9XG5cbiAgY29uc3RydWN0b3IoZW5naW5lOiBFbmdpbmUsIGRhdGE6IHtyZWdlbnJhdGF0aW9uUmF0ZTogbnVtYmVyLCBtYXg6IG51bWJlcn0gPSB7cmVnZW5yYXRhdGlvblJhdGU6IDEwMCwgbWF4OiAxMDB9KSB7XG4gICAgc3VwZXIoZW5naW5lKTtcbiAgICB0aGlzLl9jdXJyZW50RW5lcmd5ID0gdGhpcy5fbWF4RW5lcmd5ID0gZGF0YS5tYXg7XG4gICAgdGhpcy5fZW5lcmd5UmVnZW5lcmF0aW9uUmF0ZSA9IGRhdGEucmVnZW5yYXRhdGlvblJhdGU7XG4gIH1cblxuICBwcm90ZWN0ZWQgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaCh0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICd0aWNrJyxcbiAgICAgIHRoaXMub25UaWNrLmJpbmQodGhpcyksXG4gICAgICAxXG4gICAgKSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvblRpY2soZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGxldCByYXRlID0gdGhpcy5fZW5lcmd5UmVnZW5lcmF0aW9uUmF0ZTtcbiAgICBsZXQgcmF0ZU1vZGlmaWVycyA9IHRoaXMuZW50aXR5LmdhdGhlcihuZXcgRXZlbnRzLkV2ZW50KCdvbkVuZXJneVJlZ2VuZXJhdGlvbicpKTtcbiAgICByYXRlTW9kaWZpZXJzLmZvckVhY2goKG1vZGlmaWVyKSA9PiB7XG4gICAgICByYXRlID0gcmF0ZSAqIG1vZGlmaWVyO1xuICAgIH0pO1xuICAgIHRoaXMuX2N1cnJlbnRFbmVyZ3kgPSBNYXRoLm1pbih0aGlzLm1heEVuZXJneSwgdGhpcy5fY3VycmVudEVuZXJneSArIHJhdGUpO1xuICB9XG5cbiAgdXNlRW5lcmd5KGVuZXJneTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICB0aGlzLl9jdXJyZW50RW5lcmd5ID0gdGhpcy5fY3VycmVudEVuZXJneSAtIGVuZXJneTtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudEVuZXJneTtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2luZGV4JztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgSGVhbHRoQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmVudGl0eS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICAnZGFtYWdlJyxcbiAgICAgIHRoaXMub25EYW1hZ2UuYmluZCh0aGlzKVxuICAgICkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbkRhbWFnZShldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgICB0aGlzLmVuZ2luZS5yZW1vdmVFbnRpdHkodGhpcy5lbnRpdHkpO1xuICAgICAgdGhpcy5lbmdpbmUuZW1pdChuZXcgRXZlbnRzLkV2ZW50KCdtZXNzYWdlJywge1xuICAgICAgICBtZXNzYWdlOiB0aGlzLmVudGl0eS5uYW1lICsgJyB3YXMga2lsbGVkIGJ5ICcgKyBldmVudC5kYXRhLnNvdXJjZS5uYW1lICsgJy4nLFxuICAgICAgICB0YXJnZXQ6IHRoaXMuZW50aXR5XG4gICAgICB9KSk7XG4gIH07XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0ICogYXMgQmVoYXZpb3VycyBmcm9tICcuLi9iZWhhdmlvdXJzJztcblxuaW1wb3J0IElucHV0SGFuZGxlciA9IHJlcXVpcmUoJy4uL0lucHV0SGFuZGxlcicpO1xuaW1wb3J0IEdseXBoID0gcmVxdWlyZSgnLi4vR2x5cGgnKTtcbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIElucHV0Q29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICBwcml2YXRlIGVuZXJneUNvbXBvbmVudDogQ29tcG9uZW50cy5FbmVyZ3lDb21wb25lbnQ7XG4gIHByaXZhdGUgcGh5c2ljc0NvbXBvbmVudDogQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50O1xuICBwcml2YXRlIGhhc0ZvY3VzOiBib29sZWFuO1xuXG4gIHByb3RlY3RlZCBpbml0aWFsaXplKCkge1xuICAgIHRoaXMuZW5lcmd5Q29tcG9uZW50ID0gPENvbXBvbmVudHMuRW5lcmd5Q29tcG9uZW50PnRoaXMuZW50aXR5LmdldENvbXBvbmVudChDb21wb25lbnRzLkVuZXJneUNvbXBvbmVudCk7XG4gICAgdGhpcy5waHlzaWNzQ29tcG9uZW50ID0gPENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudD50aGlzLmVudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KTtcbiAgICB0aGlzLmhhc0ZvY3VzID0gZmFsc2U7XG4gIH1cblxuICBwcm90ZWN0ZWQgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaCh0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICd0aWNrJyxcbiAgICAgIHRoaXMub25UaWNrLmJpbmQodGhpcylcbiAgICApKSk7XG5cbiAgICB0aGlzLmVuZ2luZS5pbnB1dEhhbmRsZXIubGlzdGVuKFxuICAgICAgW0lucHV0SGFuZGxlci5LRVlfVVAsIElucHV0SGFuZGxlci5LRVlfS10sIFxuICAgICAgdGhpcy5vbk1vdmVVcC5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICB0aGlzLmVuZ2luZS5pbnB1dEhhbmRsZXIubGlzdGVuKFxuICAgICAgW0lucHV0SGFuZGxlci5LRVlfVV0sXG4gICAgICB0aGlzLm9uTW92ZVVwUmlnaHQuYmluZCh0aGlzKVxuICAgICk7XG4gICAgdGhpcy5lbmdpbmUuaW5wdXRIYW5kbGVyLmxpc3RlbihcbiAgICAgIFtJbnB1dEhhbmRsZXIuS0VZX1JJR0hULCBJbnB1dEhhbmRsZXIuS0VZX0xdLCBcbiAgICAgIHRoaXMub25Nb3ZlUmlnaHQuYmluZCh0aGlzKVxuICAgICk7XG4gICAgdGhpcy5lbmdpbmUuaW5wdXRIYW5kbGVyLmxpc3RlbihcbiAgICAgIFtJbnB1dEhhbmRsZXIuS0VZX05dLFxuICAgICAgdGhpcy5vbk1vdmVEb3duUmlnaHQuYmluZCh0aGlzKVxuICAgICk7XG4gICAgdGhpcy5lbmdpbmUuaW5wdXRIYW5kbGVyLmxpc3RlbihcbiAgICAgIFtJbnB1dEhhbmRsZXIuS0VZX0RPV04sIElucHV0SGFuZGxlci5LRVlfSl0sIFxuICAgICAgdGhpcy5vbk1vdmVEb3duLmJpbmQodGhpcylcbiAgICApO1xuICAgIHRoaXMuZW5naW5lLmlucHV0SGFuZGxlci5saXN0ZW4oXG4gICAgICBbSW5wdXRIYW5kbGVyLktFWV9CXSxcbiAgICAgIHRoaXMub25Nb3ZlRG93bkxlZnQuYmluZCh0aGlzKVxuICAgICk7XG4gICAgdGhpcy5lbmdpbmUuaW5wdXRIYW5kbGVyLmxpc3RlbihcbiAgICAgIFtJbnB1dEhhbmRsZXIuS0VZX0xFRlQsIElucHV0SGFuZGxlci5LRVlfSF0sIFxuICAgICAgdGhpcy5vbk1vdmVMZWZ0LmJpbmQodGhpcylcbiAgICApO1xuICAgIHRoaXMuZW5naW5lLmlucHV0SGFuZGxlci5saXN0ZW4oXG4gICAgICBbSW5wdXRIYW5kbGVyLktFWV9ZXSxcbiAgICAgIHRoaXMub25Nb3ZlVXBMZWZ0LmJpbmQodGhpcylcbiAgICApO1xuICAgIHRoaXMuZW5naW5lLmlucHV0SGFuZGxlci5saXN0ZW4oXG4gICAgICBbSW5wdXRIYW5kbGVyLktFWV9QRVJJT0RdLCBcbiAgICAgIHRoaXMub25XYWl0LmJpbmQodGhpcylcbiAgICApO1xuICAgIHRoaXMuZW5naW5lLmlucHV0SGFuZGxlci5saXN0ZW4oXG4gICAgICBbSW5wdXRIYW5kbGVyLktFWV8wXSwgXG4gICAgICB0aGlzLm9uVHJhcE9uZS5iaW5kKHRoaXMpXG4gICAgKTtcbiAgfVxuXG4gIG9uVGljayhldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgaWYgKHRoaXMuZW5lcmd5Q29tcG9uZW50LmN1cnJlbnRFbmVyZ3kgPj0gMTAwKSB7XG4gICAgICB0aGlzLmFjdCgpO1xuICAgIH1cbiAgfVxuXG4gIGFjdCgpIHtcbiAgICB0aGlzLmhhc0ZvY3VzID0gdHJ1ZTtcbiAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ3BhdXNlVGltZScpKTtcbiAgfVxuXG4gIHByaXZhdGUgcGVyZm9ybUFjdGlvbihhY3Rpb246IEJlaGF2aW91cnMuQWN0aW9uKSB7XG4gICAgdGhpcy5oYXNGb2N1cyA9IGZhbHNlO1xuICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgncmVzdW1lVGltZScpKTtcbiAgICB0aGlzLmVuZXJneUNvbXBvbmVudC51c2VFbmVyZ3koYWN0aW9uLmFjdCgpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25XYWl0KCkge1xuICAgIGlmICghdGhpcy5oYXNGb2N1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnBlcmZvcm1BY3Rpb24obmV3IEJlaGF2aW91cnMuTnVsbEFjdGlvbigpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25UcmFwT25lKCkge1xuICAgIGlmICghdGhpcy5oYXNGb2N1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBhY3Rpb24gPSB0aGlzLmVudGl0eS5maXJlKG5ldyBFdmVudHMuRXZlbnQoJ3dyaXRlUnVuZScsIHt9KSk7XG4gICAgaWYgKGFjdGlvbikge1xuICAgICAgdGhpcy5wZXJmb3JtQWN0aW9uKGFjdGlvbik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVVcCgpIHtcbiAgICBpZiAoIXRoaXMuaGFzRm9jdXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5oYW5kbGVNb3ZlbWVudChuZXcgQ29yZS5Qb3NpdGlvbigwLCAtMSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVVcFJpZ2h0KCkge1xuICAgIGlmICghdGhpcy5oYXNGb2N1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmhhbmRsZU1vdmVtZW50KG5ldyBDb3JlLlBvc2l0aW9uKDEsIC0xKSk7XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZVJpZ2h0KCkge1xuICAgIGlmICghdGhpcy5oYXNGb2N1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmhhbmRsZU1vdmVtZW50KG5ldyBDb3JlLlBvc2l0aW9uKDEsIDApKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Nb3ZlRG93blJpZ2h0KCkge1xuICAgIGlmICghdGhpcy5oYXNGb2N1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmhhbmRsZU1vdmVtZW50KG5ldyBDb3JlLlBvc2l0aW9uKDEsIDEpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Nb3ZlRG93bigpIHtcbiAgICBpZiAoIXRoaXMuaGFzRm9jdXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5oYW5kbGVNb3ZlbWVudChuZXcgQ29yZS5Qb3NpdGlvbigwLCAxKSk7XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZURvd25MZWZ0KCkge1xuICAgIGlmICghdGhpcy5oYXNGb2N1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmhhbmRsZU1vdmVtZW50KG5ldyBDb3JlLlBvc2l0aW9uKC0xLCAxKSk7XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZUxlZnQoKSB7XG4gICAgaWYgKCF0aGlzLmhhc0ZvY3VzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuaGFuZGxlTW92ZW1lbnQobmV3IENvcmUuUG9zaXRpb24oLTEsIDApKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Nb3ZlVXBMZWZ0KCkge1xuICAgIGlmICghdGhpcy5oYXNGb2N1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmhhbmRsZU1vdmVtZW50KG5ldyBDb3JlLlBvc2l0aW9uKC0xLCAtMSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVNb3ZlbWVudChkaXJlY3Rpb246IENvcmUuUG9zaXRpb24pIHtcbiAgICBjb25zdCBwb3NpdGlvbiA9IENvcmUuUG9zaXRpb24uYWRkKHRoaXMucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbiwgZGlyZWN0aW9uKTtcbiAgICBjb25zdCBpc1dpdGhvdXRFbnRpdHkgPSB0aGlzLmVuZ2luZS5pcyhuZXcgRXZlbnRzLkV2ZW50KCdpc1dpdGhvdXRFbnRpdHknLCB7cG9zaXRpb246IHBvc2l0aW9ufSkpO1xuICAgIGlmIChpc1dpdGhvdXRFbnRpdHkpIHtcbiAgICAgIHRoaXMucGVyZm9ybUFjdGlvbihuZXcgQmVoYXZpb3Vycy5XYWxrQWN0aW9uKHRoaXMucGh5c2ljc0NvbXBvbmVudCwgcG9zaXRpb24pKTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5cbmltcG9ydCBHbHlwaCA9IHJlcXVpcmUoJy4uL0dseXBoJyk7XG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBQaHlzaWNzQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICBwcml2YXRlIF9ibG9ja2luZzogYm9vbGVhbjtcbiAgZ2V0IGJsb2NraW5nKCkge1xuICAgIHJldHVybiB0aGlzLl9ibG9ja2luZztcbiAgfVxuICBwcml2YXRlIF9wb3NpdGlvbjogQ29yZS5Qb3NpdGlvbjtcbiAgZ2V0IHBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9wb3NpdGlvbjtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBkYXRhOiB7cG9zaXRpb246IENvcmUuUG9zaXRpb24sIGJsb2NraW5nOiBib29sZWFufSA9IHtwb3NpdGlvbjogbnVsbCwgYmxvY2tpbmc6IHRydWV9KSB7XG4gICAgc3VwZXIoZW5naW5lKTtcbiAgICB0aGlzLl9wb3NpdGlvbiA9IGRhdGEucG9zaXRpb247XG4gICAgdGhpcy5fYmxvY2tpbmcgPSBkYXRhLmJsb2NraW5nO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBpZiAodGhpcy5wb3NpdGlvbikge1xuICAgICAgdGhpcy5lbmdpbmUuZW1pdChuZXcgRXZlbnRzLkV2ZW50KCdtb3ZlZFRvJywge3BoeXNpY3NDb21wb25lbnQ6IHRoaXMsIGVudGl0eTogdGhpcy5lbnRpdHl9KSk7XG4gICAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ21vdmUnLCB7cGh5c2ljc0NvbXBvbmVudDogdGhpcywgZW50aXR5OiB0aGlzLmVudGl0eX0pKTtcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ21vdmVkRnJvbScsIHtwaHlzaWNzQ29tcG9uZW50OiB0aGlzLCBlbnRpdHk6IHRoaXMuZW50aXR5fSkpO1xuICB9XG5cbiAgbW92ZVRvKHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uKSB7XG4gICAgaWYgKHRoaXMuX3Bvc2l0aW9uKSB7XG4gICAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ21vdmVkRnJvbScsIHtwaHlzaWNzQ29tcG9uZW50OiB0aGlzLCBlbnRpdHk6IHRoaXMuZW50aXR5fSkpO1xuICAgIH1cbiAgICB0aGlzLl9wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgnbW92ZWRUbycsIHtwaHlzaWNzQ29tcG9uZW50OiB0aGlzLCBlbnRpdHk6IHRoaXMuZW50aXR5fSkpO1xuICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgnbW92ZScsIHtwaHlzaWNzQ29tcG9uZW50OiB0aGlzLCBlbnRpdHk6IHRoaXMuZW50aXR5fSkpO1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuLi9lbnRpdGllcyc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIEV4Y2VwdGlvbnMgZnJvbSAnLi4vRXhjZXB0aW9ucyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuXG5pbXBvcnQgR2x5cGggPSByZXF1aXJlKCcuLi9HbHlwaCcpO1xuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgUmVuZGVyYWJsZUNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSBfZ2x5cGg6IEdseXBoO1xuICBnZXQgZ2x5cGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dseXBoO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZW5naW5lOiBFbmdpbmUsIGRhdGE6IHtnbHlwaDogR2x5cGh9KSB7XG4gICAgc3VwZXIoZW5naW5lKTtcbiAgICB0aGlzLl9nbHlwaCA9IGRhdGEuZ2x5cGg7XG4gIH1cblxuICBwcm90ZWN0ZWQgY2hlY2tSZXF1aXJlbWVudHMoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmVudGl0eS5oYXNDb21wb25lbnQoQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KSkge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbnMuTWlzc2luZ0NvbXBvbmVudEVycm9yKCdSZW5kZXJhYmxlQ29tcG9uZW50IHJlcXVpcmVzIFBoeXNpY3NDb21wb25lbnQnKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ3JlbmRlcmFibGVDb21wb25lbnRDcmVhdGVkJywge2VudGl0eTogdGhpcy5lbnRpdHksIHJlbmRlcmFibGVDb21wb25lbnQ6IHRoaXN9KSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgncmVuZGVyYWJsZUNvbXBvbmVudERlc3Ryb3llZCcsIHtlbnRpdHk6IHRoaXMuZW50aXR5LCByZW5kZXJhYmxlQ29tcG9uZW50OiB0aGlzfSkpO1xuICB9XG59XG4iLCJpbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmltcG9ydCAqIGFzIEJlaGF2aW91cnMgZnJvbSAnLi4vYmVoYXZpb3Vycyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5cbmV4cG9ydCBjbGFzcyBSb2FtaW5nQUlDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gIHByaXZhdGUgZW5lcmd5Q29tcG9uZW50OiBDb21wb25lbnRzLkVuZXJneUNvbXBvbmVudDtcblxuICBwcml2YXRlIHJhbmRvbVdhbGtCZWhhdmlvdXI6IEJlaGF2aW91cnMuUmFuZG9tV2Fsa0JlaGF2aW91cjtcblxuICBwcm90ZWN0ZWQgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLmVuZXJneUNvbXBvbmVudCA9IDxDb21wb25lbnRzLkVuZXJneUNvbXBvbmVudD50aGlzLmVudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5FbmVyZ3lDb21wb25lbnQpO1xuICAgIHRoaXMucmFuZG9tV2Fsa0JlaGF2aW91ciA9IG5ldyBCZWhhdmlvdXJzLlJhbmRvbVdhbGtCZWhhdmlvdXIodGhpcy5lbmdpbmUsIHRoaXMuZW50aXR5KTtcbiAgfVxuXG4gIHByb3RlY3RlZCByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ3RpY2snLFxuICAgICAgdGhpcy5vblRpY2suYmluZCh0aGlzKVxuICAgICkpKTtcbiAgfVxuXG4gIG9uVGljayhldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgaWYgKHRoaXMuZW5lcmd5Q29tcG9uZW50LmN1cnJlbnRFbmVyZ3kgPj0gMTAwKSB7XG4gICAgICBsZXQgYWN0aW9uID0gdGhpcy5yYW5kb21XYWxrQmVoYXZpb3VyLmdldE5leHRBY3Rpb24oKTtcbiAgICAgIHRoaXMuZW5lcmd5Q29tcG9uZW50LnVzZUVuZXJneShhY3Rpb24uYWN0KCkpO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2luZGV4JztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgUnVuZURhbWFnZUNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSByYWRpdXM6IG51bWJlcjtcbiAgcHJpdmF0ZSBjaGFyZ2VzOiBudW1iZXI7XG4gIHByaXZhdGUgcGh5c2ljc0NvbXBvbmVudDogQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50O1xuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBkYXRhOiB7cmFkaXVzOiBudW1iZXIsIGNoYXJnZXM6IG51bWJlcn0gPSB7cmFkaXVzOiAxLCBjaGFyZ2VzOiAxfSkge1xuICAgIHN1cGVyKGVuZ2luZSk7XG4gICAgdGhpcy5yYWRpdXMgPSBkYXRhLnJhZGl1cztcbiAgICB0aGlzLmNoYXJnZXMgPSBkYXRhLmNoYXJnZXM7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMucGh5c2ljc0NvbXBvbmVudCA9IDxDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ+dGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCk7XG4gIH1cblxuICByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ21vdmVkVG8nLFxuICAgICAgdGhpcy5vbk1vdmVkVG8uYmluZCh0aGlzKSxcbiAgICAgIDUwXG4gICAgKSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVkVG8oZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGlmICh0aGlzLmNoYXJnZXMgPD0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBldmVudFBvc2l0aW9uID0gZXZlbnQuZGF0YS5waHlzaWNzQ29tcG9uZW50LnBvc2l0aW9uOyBcbiAgICBpZiAoZXZlbnRQb3NpdGlvbi54ID09IHRoaXMucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbi54ICYmIFxuICAgICAgICBldmVudFBvc2l0aW9uLnkgPT09IHRoaXMucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbi55KSB7XG4gICAgICBldmVudC5kYXRhLmVudGl0eS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ2RhbWFnZScsIHtcbiAgICAgICAgc291cmNlOiB0aGlzLmVudGl0eVxuICAgICAgfSkpO1xuICAgICAgdGhpcy5jaGFyZ2VzLS07XG4gICAgICBpZiAodGhpcy5jaGFyZ2VzIDw9IDApIHtcbiAgICAgICAgdGhpcy5lbmdpbmUucmVtb3ZlRW50aXR5KHRoaXMuZW50aXR5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5cbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIFJ1bmVGcmVlemVDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gIHByaXZhdGUgcmFkaXVzOiBudW1iZXI7XG4gIHByaXZhdGUgY2hhcmdlczogbnVtYmVyO1xuICBwcml2YXRlIHBoeXNpY3NDb21wb25lbnQ6IENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudDtcblxuICBjb25zdHJ1Y3RvcihlbmdpbmU6IEVuZ2luZSwgZGF0YToge3JhZGl1czogbnVtYmVyLCBjaGFyZ2VzOiBudW1iZXJ9ID0ge3JhZGl1czogMSwgY2hhcmdlczogMX0pIHtcbiAgICBzdXBlcihlbmdpbmUpO1xuICAgIHRoaXMucmFkaXVzID0gZGF0YS5yYWRpdXM7XG4gICAgdGhpcy5jaGFyZ2VzID0gZGF0YS5jaGFyZ2VzO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnBoeXNpY3NDb21wb25lbnQgPSA8Q29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50PnRoaXMuZW50aXR5LmdldENvbXBvbmVudChDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQpO1xuICB9XG5cbiAgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaCh0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdtb3ZlZFRvJyxcbiAgICAgIHRoaXMub25Nb3ZlZFRvLmJpbmQodGhpcyksXG4gICAgICA1MFxuICAgICkpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Nb3ZlZFRvKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBpZiAodGhpcy5jaGFyZ2VzIDw9IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZXZlbnRQb3NpdGlvbiA9IGV2ZW50LmRhdGEucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbjsgXG4gICAgaWYgKGV2ZW50UG9zaXRpb24ueCA9PSB0aGlzLnBoeXNpY3NDb21wb25lbnQucG9zaXRpb24ueCAmJiBcbiAgICAgICAgZXZlbnRQb3NpdGlvbi55ID09PSB0aGlzLnBoeXNpY3NDb21wb25lbnQucG9zaXRpb24ueSkge1xuICAgICAgZXZlbnQuZGF0YS5lbnRpdHkuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLlNsb3dDb21wb25lbnQodGhpcy5lbmdpbmUsIHtmYWN0b3I6IDAuNX0pKTsgXG4gICAgICB0aGlzLmNoYXJnZXMtLTtcbiAgICAgIGlmICh0aGlzLmNoYXJnZXMgPD0gMCkge1xuICAgICAgICB0aGlzLmVuZ2luZS5yZW1vdmVFbnRpdHkodGhpcy5lbnRpdHkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEJlaGF2aW91cnMgZnJvbSAnLi4vYmVoYXZpb3Vycyc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4uL2VudGl0aWVzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5cbmltcG9ydCBHbHlwaCA9IHJlcXVpcmUoJy4uL0dseXBoJyk7XG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBSdW5lV3JpdGVyQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICBwcml2YXRlIHBoeXNpY2FsQ29tcG9uZW50OiBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ7XG5cbiAgY29uc3RydWN0b3IoZW5naW5lOiBFbmdpbmUsIGRhdGE6IHt9ID0ge30pIHtcbiAgICBzdXBlcihlbmdpbmUpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5waHlzaWNhbENvbXBvbmVudCA9IDxDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ+dGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5lbnRpdHkubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAnd3JpdGVSdW5lJyxcbiAgICAgIHRoaXMub25Xcml0ZVJ1bmUuYmluZCh0aGlzKVxuICAgICkpO1xuICB9XG5cbiAgb25Xcml0ZVJ1bmUoZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGNvbnN0IHRpbGUgPSB0aGlzLmVuZ2luZS5maXJlKG5ldyBFdmVudHMuRXZlbnQoJ2dldFRpbGUnLCB7XG4gICAgICBwb3NpdGlvbjogdGhpcy5waHlzaWNhbENvbXBvbmVudC5wb3NpdGlvblxuICAgIH0pKTtcblxuICAgIGxldCBoYXNSdW5lID0gZmFsc2U7XG4gICAgZm9yICh2YXIga2V5IGluIHRpbGUucHJvcHMpIHtcbiAgICAgIGlmICh0aWxlLnByb3BzW2tleV0udHlwZSA9PT0gJ3J1bmUnKSB7XG4gICAgICAgIGhhc1J1bmUgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChoYXNSdW5lKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIFxuICAgIHJldHVybiBuZXcgQmVoYXZpb3Vycy5Xcml0ZVJ1bmVBY3Rpb24odGhpcy5lbmdpbmUsIHRoaXMuZW50aXR5KTtcblxuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuXG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBTZWxmRGVzdHJ1Y3RDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gIHByaXZhdGUgbWF4VHVybnM6IG51bWJlcjtcbiAgcHJpdmF0ZSB0dXJuc0xlZnQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihlbmdpbmU6IEVuZ2luZSwgZGF0YToge3R1cm5zOiBudW1iZXJ9KSB7XG4gICAgc3VwZXIoZW5naW5lKTtcbiAgICB0aGlzLm1heFR1cm5zID0gZGF0YS50dXJucztcbiAgICB0aGlzLnR1cm5zTGVmdCA9IGRhdGEudHVybnM7XG4gICAgdGhpcy5saXN0ZW5lcnMgPSBbXTtcbiAgfVxuXG4gIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMubGlzdGVuZXJzLnB1c2godGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAndHVybicsXG4gICAgICB0aGlzLm9uVHVybi5iaW5kKHRoaXMpLFxuICAgICAgNTBcbiAgICApKSk7XG4gIH1cblxuICBwcml2YXRlIG9uVHVybihldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgdGhpcy50dXJuc0xlZnQtLTtcbiAgICBpZiAodGhpcy50dXJuc0xlZnQgPCAwKSB7XG4gICAgICB0aGlzLmVuZ2luZS5yZW1vdmVFbnRpdHkodGhpcy5lbnRpdHkpO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2luZGV4JztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgU2xvd0NvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSBfZmFjdG9yOiBudW1iZXI7XG4gIGdldCBmYWN0b3IoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZhY3RvcjtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBkYXRhOiB7ZmFjdG9yOiBudW1iZXJ9KSB7XG4gICAgc3VwZXIoZW5naW5lKTtcbiAgICB0aGlzLl9mYWN0b3IgPSBkYXRhLmZhY3RvcjtcbiAgfVxuXG4gIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZW50aXR5Lmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ29uRW5lcmd5UmVnZW5lcmF0aW9uJyxcbiAgICAgIHRoaXMub25FbmVyZ3lSZWdlbmVyYXRpb24uYmluZCh0aGlzKSxcbiAgICAgIDUwXG4gICAgKSk7XG5cbiAgICB0aGlzLmVudGl0eS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdnZXRTdGF0dXNFZmZlY3QnLFxuICAgICAgdGhpcy5vbkdldFN0YXR1c0VmZmVjdC5iaW5kKHRoaXMpXG4gICAgKSk7XG4gIH1cblxuICBwcml2YXRlIG9uRW5lcmd5UmVnZW5lcmF0aW9uKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICByZXR1cm4gdGhpcy5fZmFjdG9yO1xuICB9XG5cbiAgcHJpdmF0ZSBvbkdldFN0YXR1c0VmZmVjdChldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdTbG93JyxcbiAgICAgIHN5bWJvbDogJ1MnXG4gICAgfTtcbiAgfVxuXG59XG4iLCJpbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5cbmV4cG9ydCBjbGFzcyBUaW1lSGFuZGxlckNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSBfY3VycmVudFRpY2s6IG51bWJlcjtcbiAgZ2V0IGN1cnJlbnRUaWNrKCkge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50VGljaztcbiAgfVxuXG4gIHByaXZhdGUgX2N1cnJlbnRUdXJuOiBudW1iZXI7XG4gIGdldCBjdXJyZW50VHVybigpIHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudFR1cm47XG4gIH1cblxuICBwcml2YXRlIHRpY2tzUGVyVHVybjogbnVtYmVyO1xuICBwcml2YXRlIHR1cm5UaW1lOiBudW1iZXI7XG5cbiAgcHJpdmF0ZSBwYXVzZWQ6IGJvb2xlYW47XG5cbiAgcHJvdGVjdGVkIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy50aWNrc1BlclR1cm4gPSAxO1xuICAgIHRoaXMudHVyblRpbWUgPSAwO1xuICAgIHRoaXMuX2N1cnJlbnRUdXJuID0gMDtcbiAgICB0aGlzLl9jdXJyZW50VGljayA9IDA7XG4gICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgfVxuXG4gIHByb3RlY3RlZCByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdwYXVzZVRpbWUnLFxuICAgICAgdGhpcy5vblBhdXNlVGltZS5iaW5kKHRoaXMpXG4gICAgKSk7XG4gICAgdGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAncmVzdW1lVGltZScsXG4gICAgICB0aGlzLm9uUmVzdW1lVGltZS5iaW5kKHRoaXMpXG4gICAgKSk7XG4gIH1cblxuICBwcml2YXRlIG9uUGF1c2VUaW1lKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICB0aGlzLnBhdXNlZCA9IHRydWU7XG4gIH1cblxuICBwcml2YXRlIG9uUmVzdW1lVGltZShldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGVuZ2luZVRpY2soZ2FtZVRpbWU6IG51bWJlcikge1xuICAgIGlmICh0aGlzLnBhdXNlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9jdXJyZW50VGljaysrO1xuICAgIGlmICgodGhpcy5fY3VycmVudFRpY2sgJSB0aGlzLnRpY2tzUGVyVHVybikgPT09IDApIHtcbiAgICAgIHRoaXMuX2N1cnJlbnRUdXJuKys7XG4gICAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ3R1cm4nLCB7Y3VycmVudFR1cm46IHRoaXMuX2N1cnJlbnRUdXJuLCBjdXJyZW50VGljazogdGhpcy5fY3VycmVudFRpY2t9KSk7XG5cbiAgICAgIHRoaXMudHVyblRpbWUgPSBnYW1lVGltZTtcblxuICAgIH1cbiAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ3RpY2snLCB7Y3VycmVudFR1cm46IHRoaXMuX2N1cnJlbnRUdXJuLCBjdXJyZW50VGljazogdGhpcy5fY3VycmVudFRpY2t9KSk7XG4gIH1cblxufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9Db21wb25lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9UaW1lSGFuZGxlckNvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL1NlbGZEZXN0cnVjdENvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL1JvYW1pbmdBSUNvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL0VuZXJneUNvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL0lucHV0Q29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vUmVuZGVyYWJsZUNvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL1BoeXNpY3NDb21wb25lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9IZWFsdGhDb21wb25lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9SdW5lV3JpdGVyQ29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vUnVuZURhbWFnZUNvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL1J1bmVGcmVlemVDb21wb25lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9TbG93Q29tcG9uZW50JztcbiIsIlwidXNlIHN0cmljdFwiO1xuZXhwb3J0IHR5cGUgQ29sb3IgPSBTdHJpbmcgfCBudW1iZXI7XG5cbmV4cG9ydCBjbGFzcyBDb2xvclV0aWxzIHtcbiAgLyoqXG4gICAgRnVuY3Rpb246IG11bHRpcGx5XG4gICAgTXVsdGlwbHkgYSBjb2xvciB3aXRoIGEgbnVtYmVyLiBcbiAgICA+IChyLGcsYikgKiBuID09IChyKm4sIGcqbiwgYipuKVxuXG4gICAgUGFyYW1ldGVyczpcbiAgICBjb2xvciAtIHRoZSBjb2xvclxuICAgIGNvZWYgLSB0aGUgZmFjdG9yXG5cbiAgICBSZXR1cm5zOlxuICAgIEEgbmV3IGNvbG9yIGFzIGEgbnVtYmVyIGJldHdlZW4gMHgwMDAwMDAgYW5kIDB4RkZGRkZGXG4gICAqL1xuICBzdGF0aWMgbXVsdGlwbHkoY29sb3I6IENvbG9yLCBjb2VmOiBudW1iZXIpOiBDb2xvciB7XG4gICAgbGV0IHIsIGcsIGI6IG51bWJlcjtcbiAgICBpZiAodHlwZW9mIGNvbG9yID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIgPSAoPG51bWJlcj5jb2xvciAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcgPSAoPG51bWJlcj5jb2xvciAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYiA9IDxudW1iZXI+Y29sb3IgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjogbnVtYmVyW10gPSBDb2xvclV0aWxzLnRvUmdiKGNvbG9yKTtcbiAgICAgIHIgPSByZ2JbMF07XG4gICAgICBnID0gcmdiWzFdO1xuICAgICAgYiA9IHJnYlsyXTtcbiAgICB9XG4gICAgciA9IE1hdGgucm91bmQociAqIGNvZWYpO1xuICAgIGcgPSBNYXRoLnJvdW5kKGcgKiBjb2VmKTtcbiAgICBiID0gTWF0aC5yb3VuZChiICogY29lZik7XG4gICAgciA9IHIgPCAwID8gMCA6IHIgPiAyNTUgPyAyNTUgOiByO1xuICAgIGcgPSBnIDwgMCA/IDAgOiBnID4gMjU1ID8gMjU1IDogZztcbiAgICBiID0gYiA8IDAgPyAwIDogYiA+IDI1NSA/IDI1NSA6IGI7XG4gICAgcmV0dXJuIGIgfCAoZyA8PCA4KSB8IChyIDw8IDE2KTtcbiAgfVxuXG4gIHN0YXRpYyBtYXgoY29sMTogQ29sb3IsIGNvbDI6IENvbG9yKSB7XG4gICAgbGV0IHIxLGcxLGIxLHIyLGcyLGIyOiBudW1iZXI7XG4gICAgaWYgKHR5cGVvZiBjb2wxID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIxID0gKDxudW1iZXI+Y29sMSAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcxID0gKDxudW1iZXI+Y29sMSAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYjEgPSA8bnVtYmVyPmNvbDEgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjE6IG51bWJlcltdID0gQ29sb3JVdGlscy50b1JnYihjb2wxKTtcbiAgICAgIHIxID0gcmdiMVswXTtcbiAgICAgIGcxID0gcmdiMVsxXTtcbiAgICAgIGIxID0gcmdiMVsyXTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjb2wyID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIyID0gKDxudW1iZXI+Y29sMiAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcyID0gKDxudW1iZXI+Y29sMiAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYjIgPSA8bnVtYmVyPmNvbDIgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjI6IG51bWJlcltdID0gQ29sb3JVdGlscy50b1JnYihjb2wyKTtcbiAgICAgIHIyID0gcmdiMlswXTtcbiAgICAgIGcyID0gcmdiMlsxXTtcbiAgICAgIGIyID0gcmdiMlsyXTtcbiAgICB9XG4gICAgaWYgKHIyID4gcjEpIHtcbiAgICAgIHIxID0gcjI7XG4gICAgfVxuICAgIGlmIChnMiA+IGcxKSB7XG4gICAgICBnMSA9IGcyO1xuICAgIH1cbiAgICBpZiAoYjIgPiBiMSkge1xuICAgICAgYjEgPSBiMjtcbiAgICB9XG4gICAgcmV0dXJuIGIxIHwgKGcxIDw8IDgpIHwgKHIxIDw8IDE2KTtcbiAgfVxuXG4gIHN0YXRpYyBtaW4oY29sMTogQ29sb3IsIGNvbDI6IENvbG9yKSB7XG4gICAgbGV0IHIxLGcxLGIxLHIyLGcyLGIyOiBudW1iZXI7XG4gICAgaWYgKHR5cGVvZiBjb2wxID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIxID0gKDxudW1iZXI+Y29sMSAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcxID0gKDxudW1iZXI+Y29sMSAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYjEgPSA8bnVtYmVyPmNvbDEgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjE6IG51bWJlcltdID0gQ29sb3JVdGlscy50b1JnYihjb2wxKTtcbiAgICAgIHIxID0gcmdiMVswXTtcbiAgICAgIGcxID0gcmdiMVsxXTtcbiAgICAgIGIxID0gcmdiMVsyXTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjb2wyID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIyID0gKDxudW1iZXI+Y29sMiAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcyID0gKDxudW1iZXI+Y29sMiAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYjIgPSA8bnVtYmVyPmNvbDIgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjI6IG51bWJlcltdID0gQ29sb3JVdGlscy50b1JnYihjb2wyKTtcbiAgICAgIHIyID0gcmdiMlswXTtcbiAgICAgIGcyID0gcmdiMlsxXTtcbiAgICAgIGIyID0gcmdiMlsyXTtcbiAgICB9XG4gICAgaWYgKHIyIDwgcjEpIHtcbiAgICAgIHIxID0gcjI7XG4gICAgfVxuICAgIGlmIChnMiA8IGcxKSB7XG4gICAgICBnMSA9IGcyO1xuICAgIH1cbiAgICBpZiAoYjIgPCBiMSkge1xuICAgICAgYjEgPSBiMjtcbiAgICB9XG4gICAgcmV0dXJuIGIxIHwgKGcxIDw8IDgpIHwgKHIxIDw8IDE2KTtcbiAgfSAgICAgICAgXG5cbiAgc3RhdGljIGNvbG9yTXVsdGlwbHkoY29sMTogQ29sb3IsIGNvbDI6IENvbG9yKSB7XG4gICAgbGV0IHIxLGcxLGIxLHIyLGcyLGIyOiBudW1iZXI7XG4gICAgaWYgKHR5cGVvZiBjb2wxID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIxID0gKDxudW1iZXI+Y29sMSAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcxID0gKDxudW1iZXI+Y29sMSAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYjEgPSA8bnVtYmVyPmNvbDEgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjE6IG51bWJlcltdID0gQ29sb3JVdGlscy50b1JnYihjb2wxKTtcbiAgICAgIHIxID0gcmdiMVswXTtcbiAgICAgIGcxID0gcmdiMVsxXTtcbiAgICAgIGIxID0gcmdiMVsyXTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjb2wyID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIyID0gKDxudW1iZXI+Y29sMiAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcyID0gKDxudW1iZXI+Y29sMiAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYjIgPSA8bnVtYmVyPmNvbDIgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjI6IG51bWJlcltdID0gQ29sb3JVdGlscy50b1JnYihjb2wyKTtcbiAgICAgIHIyID0gcmdiMlswXTtcbiAgICAgIGcyID0gcmdiMlsxXTtcbiAgICAgIGIyID0gcmdiMlsyXTtcbiAgICB9ICAgICAgICAgICBcbiAgICByMSA9IE1hdGguZmxvb3IocjEgKiByMiAvIDI1NSk7XG4gICAgZzEgPSBNYXRoLmZsb29yKGcxICogZzIgLyAyNTUpO1xuICAgIGIxID0gTWF0aC5mbG9vcihiMSAqIGIyIC8gMjU1KTtcbiAgICByMSA9IHIxIDwgMCA/IDAgOiByMSA+IDI1NSA/IDI1NSA6IHIxO1xuICAgIGcxID0gZzEgPCAwID8gMCA6IGcxID4gMjU1ID8gMjU1IDogZzE7XG4gICAgYjEgPSBiMSA8IDAgPyAwIDogYjEgPiAyNTUgPyAyNTUgOiBiMTtcbiAgICByZXR1cm4gYjEgfCAoZzEgPDwgOCkgfCAocjEgPDwgMTYpO1xuICB9XG5cbiAgLyoqXG4gICAgRnVuY3Rpb246IGNvbXB1dGVJbnRlbnNpdHlcbiAgICBSZXR1cm4gdGhlIGdyYXlzY2FsZSBpbnRlbnNpdHkgYmV0d2VlbiAwIGFuZCAxXG4gICAqL1xuICBzdGF0aWMgY29tcHV0ZUludGVuc2l0eShjb2xvcjogQ29sb3IpOiBudW1iZXIge1xuICAgIC8vIENvbG9yaW1ldHJpYyAobHVtaW5hbmNlLXByZXNlcnZpbmcpIGNvbnZlcnNpb24gdG8gZ3JheXNjYWxlXG4gICAgbGV0IHIsIGcsIGI6IG51bWJlcjtcbiAgICBpZiAodHlwZW9mIGNvbG9yID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIgPSAoPG51bWJlcj5jb2xvciAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcgPSAoPG51bWJlcj5jb2xvciAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYiA9IDxudW1iZXI+Y29sb3IgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjogbnVtYmVyW10gPSBDb2xvclV0aWxzLnRvUmdiKGNvbG9yKTtcbiAgICAgIHIgPSByZ2JbMF07XG4gICAgICBnID0gcmdiWzFdO1xuICAgICAgYiA9IHJnYlsyXTtcbiAgICB9XG4gICAgcmV0dXJuICgwLjIxMjYgKiByICsgMC43MTUyKmcgKyAwLjA3MjIgKiBiKSAqICgxLzI1NSk7XG4gIH1cblxuICAvKipcbiAgICBGdW5jdGlvbjogYWRkXG4gICAgQWRkIHR3byBjb2xvcnMuXG4gICAgPiAocjEsZzEsYjEpICsgKHIyLGcyLGIyKSA9IChyMStyMixnMStnMixiMStiMilcblxuICAgIFBhcmFtZXRlcnM6XG4gICAgY29sMSAtIHRoZSBmaXJzdCBjb2xvclxuICAgIGNvbDIgLSB0aGUgc2Vjb25kIGNvbG9yXG5cbiAgICBSZXR1cm5zOlxuICAgIEEgbmV3IGNvbG9yIGFzIGEgbnVtYmVyIGJldHdlZW4gMHgwMDAwMDAgYW5kIDB4RkZGRkZGXG4gICAqL1xuICBzdGF0aWMgYWRkKGNvbDE6IENvbG9yLCBjb2wyOiBDb2xvcik6IENvbG9yIHtcbiAgICBsZXQgciA9ICgoPG51bWJlcj5jb2wxICYgMHhGRjAwMDApID4+IDE2KSArICgoPG51bWJlcj5jb2wyICYgMHhGRjAwMDApID4+IDE2KTtcbiAgICBsZXQgZyA9ICgoPG51bWJlcj5jb2wxICYgMHgwMEZGMDApID4+IDgpICsgKCg8bnVtYmVyPmNvbDIgJiAweDAwRkYwMCkgPj4gOCk7XG4gICAgbGV0IGIgPSAoPG51bWJlcj5jb2wxICYgMHgwMDAwRkYpICsgKDxudW1iZXI+Y29sMiAmIDB4MDAwMEZGKTtcbiAgICBpZiAociA+IDI1NSkge1xuICAgICAgciA9IDI1NTtcbiAgICB9XG4gICAgaWYgKGcgPiAyNTUpIHtcbiAgICAgIGcgPSAyNTU7XG4gICAgfVxuICAgIGlmIChiID4gMjU1KSB7XG4gICAgICBiID0gMjU1O1xuICAgIH1cbiAgICByZXR1cm4gYiB8IChnIDw8IDgpIHwgKHIgPDwgMTYpO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgc3RkQ29sID0ge1xuICAgIFwiYXF1YVwiOiBbMCwgMjU1LCAyNTVdLFxuICAgIFwiYmxhY2tcIjogWzAsIDAsIDBdLFxuICAgIFwiYmx1ZVwiOiBbMCwgMCwgMjU1XSxcbiAgICBcImZ1Y2hzaWFcIjogWzI1NSwgMCwgMjU1XSxcbiAgICBcImdyYXlcIjogWzEyOCwgMTI4LCAxMjhdLFxuICAgIFwiZ3JlZW5cIjogWzAsIDEyOCwgMF0sXG4gICAgXCJsaW1lXCI6IFswLCAyNTUsIDBdLFxuICAgIFwibWFyb29uXCI6IFsxMjgsIDAsIDBdLFxuICAgIFwibmF2eVwiOiBbMCwgMCwgMTI4XSxcbiAgICBcIm9saXZlXCI6IFsxMjgsIDEyOCwgMF0sXG4gICAgXCJvcmFuZ2VcIjogWzI1NSwgMTY1LCAwXSxcbiAgICBcInB1cnBsZVwiOiBbMTI4LCAwLCAxMjhdLFxuICAgIFwicmVkXCI6IFsyNTUsIDAsIDBdLFxuICAgIFwic2lsdmVyXCI6IFsxOTIsIDE5MiwgMTkyXSxcbiAgICBcInRlYWxcIjogWzAsIDEyOCwgMTI4XSxcbiAgICBcIndoaXRlXCI6IFsyNTUsIDI1NSwgMjU1XSxcbiAgICBcInllbGxvd1wiOiBbMjU1LCAyNTUsIDBdXG4gIH07XG4gIC8qKlxuICAgIEZ1bmN0aW9uOiB0b1JnYlxuICAgIENvbnZlcnQgYSBzdHJpbmcgY29sb3IgaW50byBhIFtyLGcsYl0gbnVtYmVyIGFycmF5LlxuXG4gICAgUGFyYW1ldGVyczpcbiAgICBjb2xvciAtIHRoZSBjb2xvclxuXG4gICAgUmV0dXJuczpcbiAgICBBbiBhcnJheSBvZiAzIG51bWJlcnMgW3IsZyxiXSBiZXR3ZWVuIDAgYW5kIDI1NS5cbiAgICovXG4gIHN0YXRpYyB0b1JnYihjb2xvcjogQ29sb3IpOiBudW1iZXJbXSB7XG4gICAgaWYgKHR5cGVvZiBjb2xvciA9PT0gXCJudW1iZXJcIikge1xuICAgICAgcmV0dXJuIENvbG9yVXRpbHMudG9SZ2JGcm9tTnVtYmVyKDxudW1iZXI+Y29sb3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gQ29sb3JVdGlscy50b1JnYkZyb21TdHJpbmcoPFN0cmluZz5jb2xvcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAgRnVuY3Rpb246IHRvV2ViXG4gICAgQ29udmVydCBhIGNvbG9yIGludG8gYSBDU1MgY29sb3IgZm9ybWF0IChhcyBhIHN0cmluZylcbiAgICovXG4gIHN0YXRpYyB0b1dlYihjb2xvcjogQ29sb3IpOiBzdHJpbmcge1xuICAgIGlmICh0eXBlb2YgY29sb3IgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIGxldCByZXQ6IHN0cmluZyA9IGNvbG9yLnRvU3RyaW5nKDE2KTtcbiAgICAgIGxldCBtaXNzaW5nWmVyb2VzOiBudW1iZXIgPSA2IC0gcmV0Lmxlbmd0aDtcbiAgICAgIGlmIChtaXNzaW5nWmVyb2VzID4gMCkge1xuICAgICAgICByZXQgPSBcIjAwMDAwMFwiLnN1YnN0cigwLCBtaXNzaW5nWmVyb2VzKSArIHJldDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBcIiNcIiArIHJldDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIDxzdHJpbmc+Y29sb3I7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgdG9SZ2JGcm9tTnVtYmVyKGNvbG9yOiBudW1iZXIpOiBudW1iZXJbXSB7XG4gICAgbGV0IHIgPSAoY29sb3IgJiAweEZGMDAwMCkgPj4gMTY7XG4gICAgbGV0IGcgPSAoY29sb3IgJiAweDAwRkYwMCkgPj4gODtcbiAgICBsZXQgYiA9IGNvbG9yICYgMHgwMDAwRkY7XG4gICAgcmV0dXJuIFtyLCBnLCBiXTtcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIHRvUmdiRnJvbVN0cmluZyhjb2xvcjogU3RyaW5nKTogbnVtYmVyW10ge1xuICAgIGNvbG9yID0gY29sb3IudG9Mb3dlckNhc2UoKTtcbiAgICBsZXQgc3RkQ29sVmFsdWVzOiBudW1iZXJbXSA9IENvbG9yVXRpbHMuc3RkQ29sW1N0cmluZyhjb2xvcildO1xuICAgIGlmIChzdGRDb2xWYWx1ZXMpIHtcbiAgICAgIHJldHVybiBzdGRDb2xWYWx1ZXM7XG4gICAgfVxuICAgIGlmIChjb2xvci5jaGFyQXQoMCkgPT09IFwiI1wiKSB7XG4gICAgICAvLyAjRkZGIG9yICNGRkZGRkYgZm9ybWF0XG4gICAgICBpZiAoY29sb3IubGVuZ3RoID09PSA0KSB7XG4gICAgICAgIC8vIGV4cGFuZCAjRkZGIHRvICNGRkZGRkZcbiAgICAgICAgY29sb3IgPSBcIiNcIiArIGNvbG9yLmNoYXJBdCgxKSArIGNvbG9yLmNoYXJBdCgxKSArIGNvbG9yLmNoYXJBdCgyKVxuICAgICAgICArIGNvbG9yLmNoYXJBdCgyKSArIGNvbG9yLmNoYXJBdCgzKSArIGNvbG9yLmNoYXJBdCgzKTtcbiAgICAgIH1cbiAgICAgIGxldCByOiBudW1iZXIgPSBwYXJzZUludChjb2xvci5zdWJzdHIoMSwgMiksIDE2KTtcbiAgICAgIGxldCBnOiBudW1iZXIgPSBwYXJzZUludChjb2xvci5zdWJzdHIoMywgMiksIDE2KTtcbiAgICAgIGxldCBiOiBudW1iZXIgPSBwYXJzZUludChjb2xvci5zdWJzdHIoNSwgMiksIDE2KTtcbiAgICAgIHJldHVybiBbciwgZywgYl07XG4gICAgfSBlbHNlIGlmIChjb2xvci5pbmRleE9mKFwicmdiKFwiKSA9PT0gMCkge1xuICAgICAgLy8gcmdiKHIsZyxiKSBmb3JtYXRcbiAgICAgIGxldCByZ2JMaXN0ID0gY29sb3Iuc3Vic3RyKDQsIGNvbG9yLmxlbmd0aCAtIDUpLnNwbGl0KFwiLFwiKTtcbiAgICAgIHJldHVybiBbcGFyc2VJbnQocmdiTGlzdFswXSwgMTApLCBwYXJzZUludChyZ2JMaXN0WzFdLCAxMCksIHBhcnNlSW50KHJnYkxpc3RbMl0sIDEwKV07XG4gICAgfVxuICAgIHJldHVybiBbMCwgMCwgMF07XG4gIH1cblxuICAvKipcbiAgICBGdW5jdGlvbjogdG9OdW1iZXJcbiAgICBDb252ZXJ0IGEgc3RyaW5nIGNvbG9yIGludG8gYSBudW1iZXIuXG5cbiAgICBQYXJhbWV0ZXJzOlxuICAgIGNvbG9yIC0gdGhlIGNvbG9yXG5cbiAgICBSZXR1cm5zOlxuICAgIEEgbnVtYmVyIGJldHdlZW4gMHgwMDAwMDAgYW5kIDB4RkZGRkZGLlxuICAgKi9cbiAgc3RhdGljIHRvTnVtYmVyKGNvbG9yOiBDb2xvcik6IG51bWJlciB7XG4gICAgaWYgKHR5cGVvZiBjb2xvciA9PT0gXCJudW1iZXJcIikge1xuICAgICAgcmV0dXJuIDxudW1iZXI+Y29sb3I7XG4gICAgfVxuICAgIGxldCBzY29sOiBTdHJpbmcgPSA8U3RyaW5nPmNvbG9yO1xuICAgIGlmIChzY29sLmNoYXJBdCgwKSA9PT0gXCIjXCIgJiYgc2NvbC5sZW5ndGggPT09IDcpIHtcbiAgICAgIHJldHVybiBwYXJzZUludChzY29sLnN1YnN0cigxKSwgMTYpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmdiID0gQ29sb3JVdGlscy50b1JnYkZyb21TdHJpbmcoc2NvbCk7XG4gICAgICByZXR1cm4gcmdiWzBdICogNjU1MzYgKyByZ2JbMV0gKiAyNTYgKyByZ2JbMl07XG4gICAgfVxuICB9XG59XG4iLCJleHBvcnQgY2xhc3MgUG9zaXRpb24ge1xuICBwcml2YXRlIF94OiBudW1iZXI7XG4gIHByaXZhdGUgX3k6IG51bWJlcjtcblxuICBwcml2YXRlIHN0YXRpYyBtYXhXaWR0aDogbnVtYmVyO1xuICBwcml2YXRlIHN0YXRpYyBtYXhIZWlnaHQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgIHRoaXMuX3ggPSB4O1xuICAgIHRoaXMuX3kgPSB5O1xuICB9XG5cbiAgZ2V0IHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5feDtcbiAgfVxuXG4gIGdldCB5KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3k7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHNldE1heFZhbHVlcyh3OiBudW1iZXIsIGg6IG51bWJlcikge1xuICAgIFBvc2l0aW9uLm1heFdpZHRoID0gdztcbiAgICBQb3NpdGlvbi5tYXhIZWlnaHQgPSBoO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBnZXRSYW5kb20od2lkdGg6IG51bWJlciA9IC0xLCBoZWlnaHQ6IG51bWJlciA9IC0xKTogUG9zaXRpb24ge1xuICAgIGlmICh3aWR0aCA9PT0gLTEpIHtcbiAgICAgIHdpZHRoID0gUG9zaXRpb24ubWF4V2lkdGg7XG4gICAgfVxuICAgIGlmIChoZWlnaHQgPT09IC0xKSB7XG4gICAgICBoZWlnaHQgPSBQb3NpdGlvbi5tYXhIZWlnaHQ7XG4gICAgfVxuICAgIHZhciB4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogd2lkdGgpO1xuICAgIHZhciB5ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaGVpZ2h0KTtcbiAgICByZXR1cm4gbmV3IFBvc2l0aW9uKHgsIHkpO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBnZXROZWlnaGJvdXJzKHBvczogUG9zaXRpb24sIHdpZHRoOiBudW1iZXIgPSAtMSwgaGVpZ2h0OiBudW1iZXIgPSAtMSwgb25seUNhcmRpbmFsOiBib29sZWFuID0gZmFsc2UpOiBQb3NpdGlvbltdIHtcbiAgICBpZiAod2lkdGggPT09IC0xKSB7XG4gICAgICB3aWR0aCA9IFBvc2l0aW9uLm1heFdpZHRoO1xuICAgIH1cbiAgICBpZiAoaGVpZ2h0ID09PSAtMSkge1xuICAgICAgaGVpZ2h0ID0gUG9zaXRpb24ubWF4SGVpZ2h0O1xuICAgIH1cbiAgICBsZXQgeCA9IHBvcy54O1xuICAgIGxldCB5ID0gcG9zLnk7XG4gICAgbGV0IHBvc2l0aW9ucyA9IFtdO1xuICAgIGlmICh4ID4gMCkge1xuICAgICAgcG9zaXRpb25zLnB1c2gobmV3IFBvc2l0aW9uKHggLSAxLCB5KSk7XG4gICAgfVxuICAgIGlmICh4IDwgd2lkdGggLSAxKSB7XG4gICAgICBwb3NpdGlvbnMucHVzaChuZXcgUG9zaXRpb24oeCArIDEsIHkpKTtcbiAgICB9XG4gICAgaWYgKHkgPiAwKSB7XG4gICAgICBwb3NpdGlvbnMucHVzaChuZXcgUG9zaXRpb24oeCwgeSAtIDEpKTtcbiAgICB9XG4gICAgaWYgKHkgPCBoZWlnaHQgLSAxKSB7XG4gICAgICBwb3NpdGlvbnMucHVzaChuZXcgUG9zaXRpb24oeCwgeSArIDEpKTtcbiAgICB9XG4gICAgaWYgKCFvbmx5Q2FyZGluYWwpIHtcbiAgICAgIGlmICh4ID4gMCAmJiB5ID4gMCkge1xuICAgICAgICBwb3NpdGlvbnMucHVzaChuZXcgUG9zaXRpb24oeCAtIDEsIHkgLSAxKSk7XG4gICAgICB9XG4gICAgICBpZiAoeCA+IDAgJiYgeSA8IGhlaWdodCAtIDEpIHtcbiAgICAgICAgcG9zaXRpb25zLnB1c2gobmV3IFBvc2l0aW9uKHggLSAxLCB5ICsgMSkpO1xuICAgICAgfVxuICAgICAgaWYgKHggPCB3aWR0aCAtIDEgJiYgeSA8IGhlaWdodCAtIDEpIHtcbiAgICAgICAgcG9zaXRpb25zLnB1c2gobmV3IFBvc2l0aW9uKHggKyAxLCB5ICsgMSkpO1xuICAgICAgfVxuICAgICAgaWYgKHggPCB3aWR0aCAtIDEgJiYgeSA+IDApIHtcbiAgICAgICAgcG9zaXRpb25zLnB1c2gobmV3IFBvc2l0aW9uKHggKyAxLCB5IC0gMSkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcG9zaXRpb25zO1xuXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGdldERpcmVjdGlvbnMob25seUNhcmRpbmFsOiBib29sZWFuID0gZmFsc2UpOiBQb3NpdGlvbltdIHtcbiAgICBsZXQgZGlyZWN0aW9uczogUG9zaXRpb25bXSA9IFtdO1xuXG4gICAgZGlyZWN0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbiggMCwgLTEpKTtcbiAgICBkaXJlY3Rpb25zLnB1c2gobmV3IFBvc2l0aW9uKCAwLCAgMSkpO1xuICAgIGRpcmVjdGlvbnMucHVzaChuZXcgUG9zaXRpb24oLTEsICAwKSk7XG4gICAgZGlyZWN0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbiggMSwgIDApKTtcbiAgICBpZiAoIW9ubHlDYXJkaW5hbCkge1xuICAgICAgZGlyZWN0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbigtMSwgLTEpKTtcbiAgICAgIGRpcmVjdGlvbnMucHVzaChuZXcgUG9zaXRpb24oIDEsICAxKSk7XG4gICAgICBkaXJlY3Rpb25zLnB1c2gobmV3IFBvc2l0aW9uKC0xLCAgMSkpO1xuICAgICAgZGlyZWN0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbiggMSwgLTEpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGlyZWN0aW9ucztcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgYWRkKGE6IFBvc2l0aW9uLCBiOiBQb3NpdGlvbikge1xuICAgIHJldHVybiBuZXcgUG9zaXRpb24oYS54ICsgYi54LCBhLnkgKyBiLnkpO1xuICB9XG59XG4iLCJleHBvcnQgKiBmcm9tICcuL0NvbG9yJztcbmV4cG9ydCAqIGZyb20gJy4vUG9zaXRpb24nO1xuXG5leHBvcnQgbmFtZXNwYWNlIFV0aWxzIHtcbiAgLy8gQ1JDMzIgdXRpbGl0eS4gQWRhcHRlZCBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTg2Mzg5MDAvamF2YXNjcmlwdC1jcmMzMlxuICBsZXQgY3JjVGFibGU6IG51bWJlcltdO1xuICBmdW5jdGlvbiBtYWtlQ1JDVGFibGUoKSB7XG4gICAgbGV0IGM6IG51bWJlcjtcbiAgICBjcmNUYWJsZSA9IFtdO1xuICAgIGZvciAobGV0IG46IG51bWJlciA9IDA7IG4gPCAyNTY7IG4rKykge1xuICAgICAgYyA9IG47XG4gICAgICBmb3IgKGxldCBrOiBudW1iZXIgPSAwOyBrIDwgODsgaysrKSB7XG4gICAgICAgIGMgPSAoKGMgJiAxKSA/ICgweEVEQjg4MzIwIF4gKGMgPj4+IDEpKSA6IChjID4+PiAxKSk7XG4gICAgICB9XG4gICAgICBjcmNUYWJsZVtuXSA9IGM7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkTWF0cml4PFQ+KHc6IG51bWJlciwgaDogbnVtYmVyLCB2YWx1ZTogVCk6IFRbXVtdIHtcbiAgICBsZXQgcmV0OiBUW11bXSA9IFtdO1xuICAgIGZvciAoIGxldCB4OiBudW1iZXIgPSAwOyB4IDwgdzsgKyt4KSB7XG4gICAgICByZXRbeF0gPSBbXTtcbiAgICAgIGZvciAoIGxldCB5OiBudW1iZXIgPSAwOyB5IDwgaDsgKyt5KSB7XG4gICAgICAgIHJldFt4XVt5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIGNyYzMyKHN0cjogc3RyaW5nKTogbnVtYmVyIHtcbiAgICBpZiAoIWNyY1RhYmxlKSB7XG4gICAgICBtYWtlQ1JDVGFibGUoKTtcbiAgICB9XG4gICAgbGV0IGNyYzogbnVtYmVyID0gMCBeICgtMSk7XG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMCwgbGVuOiBudW1iZXIgPSBzdHIubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGNyYyA9IChjcmMgPj4+IDgpIF4gY3JjVGFibGVbKGNyYyBeIHN0ci5jaGFyQ29kZUF0KGkpKSAmIDB4RkZdO1xuICAgIH1cbiAgICByZXR1cm4gKGNyYyBeICgtMSkpID4+PiAwO1xuICB9O1xuXG4gIGV4cG9ydCBmdW5jdGlvbiB0b0NhbWVsQ2FzZShpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gaW5wdXQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC8oXFxifF8pXFx3L2csIGZ1bmN0aW9uKG0pIHtcbiAgICAgIHJldHVybiBtLnRvVXBwZXJDYXNlKCkucmVwbGFjZSgvXy8sIFwiXCIpO1xuICAgIH0pO1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlR3VpZCgpIHtcbiAgICByZXR1cm4gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCcucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbihjKSB7XG4gICAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkqMTZ8MCwgdiA9IGMgPT0gJ3gnID8gciA6IChyJjB4M3wweDgpO1xuICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgIH0pO1xuICB9XG4gIGV4cG9ydCBmdW5jdGlvbiBnZXRSYW5kb20obWluOiBudW1iZXIsIG1heDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gZ2V0UmFuZG9tSW5kZXg8VD4oYXJyYXk6IFRbXSk6IFQge1xuICAgIHJldHVybiBhcnJheVtnZXRSYW5kb20oMCwgYXJyYXkubGVuZ3RoIC0gMSldO1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbWl6ZUFycmF5PFQ+KGFycmF5OiBUW10pOiBUW10ge1xuICAgIGlmIChhcnJheS5sZW5ndGggPD0gMSkgcmV0dXJuIGFycmF5O1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcmFuZG9tQ2hvaWNlSW5kZXggPSBnZXRSYW5kb20oaSwgYXJyYXkubGVuZ3RoIC0gMSk7XG5cbiAgICAgIFthcnJheVtpXSwgYXJyYXlbcmFuZG9tQ2hvaWNlSW5kZXhdXSA9IFthcnJheVtyYW5kb21DaG9pY2VJbmRleF0sIGFycmF5W2ldXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJyYXk7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gYXBwbHlNaXhpbnMoZGVyaXZlZEN0b3I6IGFueSwgYmFzZUN0b3JzOiBhbnlbXSkge1xuICAgIGJhc2VDdG9ycy5mb3JFYWNoKGJhc2VDdG9yID0+IHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGJhc2VDdG9yLnByb3RvdHlwZSkuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgICAgZGVyaXZlZEN0b3IucHJvdG90eXBlW25hbWVdID0gYmFzZUN0b3IucHJvdG90eXBlW25hbWVdO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi4vY29tcG9uZW50cyc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuL2luZGV4JztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuaW1wb3J0IEdseXBoID0gcmVxdWlyZSgnLi4vR2x5cGgnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVdpbHkoZW5naW5lOiBFbmdpbmUpIHtcbiAgICBsZXQgd2lseSA9IG5ldyBFbnRpdGllcy5FbnRpdHkoZW5naW5lLCAnV2lseScsICdwbGF5ZXInKTtcbiAgICB3aWx5LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KGVuZ2luZSkpO1xuICAgIHdpbHkuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLlJlbmRlcmFibGVDb21wb25lbnQoZW5naW5lLCB7XG4gICAgICBnbHlwaDogbmV3IEdseXBoKCdAJywgMHhmZmZmZmYsIDB4MDAwMDAwKVxuICAgIH0pKTtcbiAgICB3aWx5LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5FbmVyZ3lDb21wb25lbnQoZW5naW5lKSk7XG4gICAgd2lseS5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuSW5wdXRDb21wb25lbnQoZW5naW5lKSk7XG4gICAgd2lseS5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuUnVuZVdyaXRlckNvbXBvbmVudChlbmdpbmUpKTtcbiAgICB3aWx5LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5IZWFsdGhDb21wb25lbnQoZW5naW5lKSk7XG5cbiAgICByZXR1cm4gd2lseTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJhdChlbmdpbmU6IEVuZ2luZSkge1xuICAgIGxldCByYXQgPSBuZXcgRW50aXRpZXMuRW50aXR5KGVuZ2luZSwgJ1JhdCcsICd2ZXJtaW4nKTtcbiAgICByYXQuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQoZW5naW5lKSk7XG4gICAgcmF0LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5SZW5kZXJhYmxlQ29tcG9uZW50KGVuZ2luZSwge1xuICAgICAgZ2x5cGg6IG5ldyBHbHlwaCgncicsIDB4ZmZmZmZmLCAweDAwMDAwMClcbiAgICB9KSk7XG4gICAgcmF0LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5FbmVyZ3lDb21wb25lbnQoZW5naW5lKSk7XG4gICAgcmF0LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5Sb2FtaW5nQUlDb21wb25lbnQoZW5naW5lKSk7XG4gICAgcmF0LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5IZWFsdGhDb21wb25lbnQoZW5naW5lKSk7XG5cbiAgICByZXR1cm4gcmF0O1xufVxuIiwiaW1wb3J0ICogYXMgQ29sbGVjdGlvbnMgZnJvbSAndHlwZXNjcmlwdC1jb2xsZWN0aW9ucyc7XG5cbmltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi4vY29tcG9uZW50cyc7XG5pbXBvcnQgKiBhcyBNaXhpbnMgZnJvbSAnLi4vbWl4aW5zJztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgRW50aXR5IGltcGxlbWVudHMgTWl4aW5zLklFdmVudEhhbmRsZXIge1xuICAvLyBFdmVudEhhbmRsZXIgbWl4aW5cbiAgbGlzdGVuOiAobGlzdGVuZXI6IEV2ZW50cy5MaXN0ZW5lcikgPT4gRXZlbnRzLkxpc3RlbmVyO1xuICByZW1vdmVMaXN0ZW5lcjogKGxpc3RlbmVyOiBFdmVudHMuTGlzdGVuZXIpID0+IHZvaWQ7XG4gIGVtaXQ6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiB2b2lkO1xuICBmaXJlOiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gYW55O1xuICBpczogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IGJvb2xlYW47XG4gIGdhdGhlcjogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IGFueVtdO1xuXG4gIHByaXZhdGUgX3R5cGU6IHN0cmluZztcbiAgZ2V0IHR5cGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGU7XG4gIH1cblxuICBwcml2YXRlIF9uYW1lOiBzdHJpbmc7XG4gIGdldCBuYW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICB9XG4gIHByaXZhdGUgX2d1aWQ6IHN0cmluZztcbiAgZ2V0IGd1aWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2d1aWQ7XG4gIH1cbiAgcHJpdmF0ZSBlbmdpbmU6IEVuZ2luZTtcbiAgcHJpdmF0ZSBjb21wb25lbnRzOiBDb21wb25lbnRzLkNvbXBvbmVudFtdO1xuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBuYW1lOiBzdHJpbmcgPSAnJywgdHlwZTogc3RyaW5nID0gJycpIHtcbiAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTtcbiAgICB0aGlzLl9ndWlkID0gQ29yZS5VdGlscy5nZW5lcmF0ZUd1aWQoKTtcbiAgICB0aGlzLl9uYW1lID0gbmFtZTtcbiAgICB0aGlzLl90eXBlID0gdHlwZTtcblxuXG4gICAgdGhpcy5jb21wb25lbnRzID0gW107XG5cbiAgICB0aGlzLmVuZ2luZS5yZWdpc3RlckVudGl0eSh0aGlzKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5jb21wb25lbnRzLmZvckVhY2goKGNvbXBvbmVudCkgPT4ge1xuICAgICAgY29tcG9uZW50LmRlc3Ryb3koKTtcbiAgICAgIGNvbXBvbmVudCA9IG51bGw7XG4gICAgfSk7XG4gICAgdGhpcy5lbmdpbmUucmVtb3ZlRW50aXR5KHRoaXMpO1xuICB9XG5cbiAgYWRkQ29tcG9uZW50KGNvbXBvbmVudDogQ29tcG9uZW50cy5Db21wb25lbnQpIHtcbiAgICB0aGlzLmNvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuICAgIGNvbXBvbmVudC5yZWdpc3RlckVudGl0eSh0aGlzKTtcbiAgfVxuXG4gIGhhc0NvbXBvbmVudChjb21wb25lbnRUeXBlKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5maWx0ZXIoKGNvbXBvbmVudCkgPT4ge1xuICAgICAgcmV0dXJuIGNvbXBvbmVudCBpbnN0YW5jZW9mIGNvbXBvbmVudFR5cGU7XG4gICAgfSkubGVuZ3RoID4gMDtcbiAgfVxuXG4gIGdldENvbXBvbmVudChjb21wb25lbnRUeXBlKTogQ29tcG9uZW50cy5Db21wb25lbnQge1xuICAgIGxldCBjb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudHMuZmlsdGVyKChjb21wb25lbnQpID0+IHtcbiAgICAgIHJldHVybiBjb21wb25lbnQgaW5zdGFuY2VvZiBjb21wb25lbnRUeXBlO1xuICAgIH0pO1xuICAgIGlmIChjb21wb25lbnQubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBvbmVudFswXTtcbiAgfVxufVxuXG5Db3JlLlV0aWxzLmFwcGx5TWl4aW5zKEVudGl0eSwgW01peGlucy5FdmVudEhhbmRsZXJdKTtcbiIsImV4cG9ydCAqIGZyb20gJy4vQ3JlYXRvcic7XG5leHBvcnQgKiBmcm9tICcuL0VudGl0eSc7XG4iLCJleHBvcnQgY2xhc3MgRXZlbnQge1xuICBwdWJsaWMgdHlwZTogc3RyaW5nO1xuICBwdWJsaWMgZGF0YTogYW55O1xuXG4gIGNvbnN0cnVjdG9yKHR5cGU6IHN0cmluZywgZGF0YTogYW55ID0gbnVsbCkge1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuL2luZGV4JztcblxuZXhwb3J0IGNsYXNzIExpc3RlbmVyIHtcbiAgcHVibGljIHR5cGU6IHN0cmluZztcbiAgcHVibGljIHByaW9yaXR5OiBudW1iZXI7XG4gIHB1YmxpYyBjYWxsYmFjazogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IGFueTtcbiAgcHVibGljIGd1aWQ6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcih0eXBlOiBzdHJpbmcsIGNhbGxiYWNrOiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gYW55LCBwcmlvcml0eTogbnVtYmVyID0gMTAwLCBndWlkOiBzdHJpbmcgPSBudWxsKSB7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLnByaW9yaXR5ID0gcHJpb3JpdHk7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIHRoaXMuZ3VpZCA9IGd1aWQgfHwgQ29yZS5VdGlscy5nZW5lcmF0ZUd1aWQoKTtcbiAgfVxufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9FdmVudCc7XG5leHBvcnQgKiBmcm9tICcuL0lMaXN0ZW5lcic7XG5leHBvcnQgKiBmcm9tICcuL0xpc3RlbmVyJztcbiIsImltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIElFdmVudEhhbmRsZXIge1xuICBsaXN0ZW46IChsaXN0ZW5lcjogRXZlbnRzLkxpc3RlbmVyKSA9PiBFdmVudHMuTGlzdGVuZXI7XG4gIHJlbW92ZUxpc3RlbmVyOiAobGlzdGVuZXI6IEV2ZW50cy5MaXN0ZW5lcikgPT4gdm9pZDtcbiAgZW1pdDogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IHZvaWQ7XG4gIGZpcmU6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiBhbnk7XG4gIGlzOiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gYm9vbGVhbjtcbiAgZ2F0aGVyOiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gYW55W107XG59XG5cbmV4cG9ydCBjbGFzcyBFdmVudEhhbmRsZXIgaW1wbGVtZW50cyBJRXZlbnRIYW5kbGVyIHtcbiAgcHJpdmF0ZSBsaXN0ZW5lcnM6IHtbZXZlbnQ6IHN0cmluZ106IEV2ZW50cy5MaXN0ZW5lcltdfSA9IHt9O1xuXG4gIGxpc3RlbihsaXN0ZW5lcjogRXZlbnRzLkxpc3RlbmVyKSB7XG4gICAgaWYgKCF0aGlzLmxpc3RlbmVycykge1xuICAgICAgdGhpcy5saXN0ZW5lcnMgPSB7fTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tsaXN0ZW5lci50eXBlXSkge1xuICAgICAgdGhpcy5saXN0ZW5lcnNbbGlzdGVuZXIudHlwZV0gPSBbXTtcbiAgICB9XG5cbiAgICB0aGlzLmxpc3RlbmVyc1tsaXN0ZW5lci50eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgICB0aGlzLmxpc3RlbmVyc1tsaXN0ZW5lci50eXBlXSA9IHRoaXMubGlzdGVuZXJzW2xpc3RlbmVyLnR5cGVdLnNvcnQoKGE6IEV2ZW50cy5MaXN0ZW5lciwgYjogRXZlbnRzLkxpc3RlbmVyKSA9PiBhLnByaW9yaXR5IC0gYi5wcmlvcml0eSk7XG5cbiAgICByZXR1cm4gbGlzdGVuZXI7XG4gIH1cblxuICByZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcjogRXZlbnRzLkxpc3RlbmVyKSB7XG4gICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tsaXN0ZW5lci50eXBlXSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgaWR4ID0gdGhpcy5saXN0ZW5lcnNbbGlzdGVuZXIudHlwZV0uZmluZEluZGV4KChsKSA9PiB7XG4gICAgICByZXR1cm4gbC5ndWlkID09PSBsaXN0ZW5lci5ndWlkO1xuICAgIH0pO1xuICAgIGlmICh0eXBlb2YgaWR4ID09PSAnbnVtYmVyJykge1xuICAgICAgdGhpcy5saXN0ZW5lcnNbbGlzdGVuZXIudHlwZV0uc3BsaWNlKGlkeCwgMSk7XG4gICAgfVxuICB9XG5cbiAgZW1pdChldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tldmVudC50eXBlXSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzW2V2ZW50LnR5cGVdLm1hcCgoaSkgPT4gaSk7XG5cbiAgICBsaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgIGxpc3RlbmVyLmNhbGxiYWNrKGV2ZW50KTtcbiAgICB9KTtcbiAgfVxuXG4gIGlzKGV2ZW50OiBFdmVudHMuRXZlbnQpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMubGlzdGVuZXJzW2V2ZW50LnR5cGVdKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBsZXQgcmV0dXJuZWRWYWx1ZSA9IHRydWU7XG5cbiAgICB0aGlzLmxpc3RlbmVyc1tldmVudC50eXBlXS5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgaWYgKCFyZXR1cm5lZFZhbHVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHJldHVybmVkVmFsdWUgPSBsaXN0ZW5lci5jYWxsYmFjayhldmVudCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJldHVybmVkVmFsdWU7XG4gIH1cblxuICBmaXJlKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBpZiAoIXRoaXMubGlzdGVuZXJzW2V2ZW50LnR5cGVdKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQgcmV0dXJuZWRWYWx1ZSA9IG51bGw7XG5cbiAgICB0aGlzLmxpc3RlbmVyc1tldmVudC50eXBlXS5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgcmV0dXJuZWRWYWx1ZSA9IGxpc3RlbmVyLmNhbGxiYWNrKGV2ZW50KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmV0dXJuZWRWYWx1ZTtcbiAgfVxuXG4gIGdhdGhlcihldmVudDogRXZlbnRzLkV2ZW50KTogYW55W10ge1xuICAgIGlmICghdGhpcy5saXN0ZW5lcnNbZXZlbnQudHlwZV0pIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICBsZXQgdmFsdWVzID0gW11cblxuICAgIHRoaXMubGlzdGVuZXJzW2V2ZW50LnR5cGVdLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XG4gICAgICB2YWx1ZXMucHVzaChsaXN0ZW5lci5jYWxsYmFjayhldmVudCkpO1xuICAgIH0pO1xuICAgIHJldHVybiB2YWx1ZXM7XG4gIH1cbn1cbiIsImV4cG9ydCAqIGZyb20gJy4vRXZlbnRIYW5kbGVyJztcbiJdfQ==
