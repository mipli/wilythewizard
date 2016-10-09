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

},{"./InputHandler":5,"./PixiConsole":10,"./components":34,"./core":37,"./entities":40,"./events":43,"./mixins":51}],3:[function(require,module,exports){
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
var Generator = require('./map');
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
        key: 'generateMap',
        value: function generateMap() {
            var cells = Core.Utils.buildMatrix(this.width, this.height, 1);
            var roomGenerator = new Generator.RoomGenerator(cells);
            while (roomGenerator.iterate()) {}
            cells = roomGenerator.getMap();
            var startPosition = Generator.Utils.findCarveableSpot(cells);
            var mazeGenerator = null;
            while (startPosition !== null) {
                mazeGenerator = new Generator.MazeRecursiveBacktrackGenerator(cells, startPosition);
                while (mazeGenerator.iterate()) {}
                cells = mazeGenerator.getMap();
                startPosition = Generator.Utils.findCarveableSpot(cells);
            }
            cells = mazeGenerator.getMap();
            var topologyCombinator = new Generator.TopologyCombinator(cells);
            topologyCombinator.initialize();
            var remainingTopologies = topologyCombinator.combine();
            if (remainingTopologies > 5) {
                console.log('remaining topologies', remainingTopologies);
                return this.generateMap();
            }
            topologyCombinator.pruneDeadEnds();
            return topologyCombinator.getMap();
        }
    }, {
        key: 'generate',
        value: function generate() {
            var map = new Map(this.width, this.height);
            var cells = this.generateMap();
            var tile = void 0;
            for (var x = 0; x < this.width; x++) {
                for (var y = 0; y < this.height; y++) {
                    if (cells[x][y] === 0) {
                        tile = Tile.createTile(Tile.FLOOR);
                    } else {
                        tile = Tile.createTile(Tile.WALL);
                        tile.glyph = new Glyph(Glyph.CHAR_BLOCK3, this.foregroundColor, this.backgroundColor);
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

},{"./Glyph":4,"./Map":7,"./Tile":12,"./core":37,"./map":49}],9:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('./core');
var Generator = require('./map');
var Components = require('./components');
var Events = require('./events');
var Glyph = require('./Glyph');
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
            this.fovCalculator = new Generator.FoV(function (pos) {
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
                        glyph = new Glyph(glyph.glyph, Core.ColorUtils.colorMultiply(glyph.foregroundColor, _this4.fogOfWarColor), Core.ColorUtils.colorMultiply(glyph.backgroundColor, _this4.fogOfWarColor));
                    } else {
                        glyph = new Glyph(Glyph.CHAR_FULL, 0x111111, 0x111111);
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

},{"./Console":1,"./Glyph":4,"./components":34,"./core":37,"./events":43,"./map":49}],10:[function(require,module,exports){
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
            //let fontUrl = './terminal16x16.png';
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
            this.addGridOverlay();
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
            Core.Position.setMaxValues(this.width, this.height - 5);
            var mapGenerator = new MapGenerator(this.width, this.height - 5);
            this._map = mapGenerator.generate();
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
    glyph: new Glyph(Glyph.CHAR_SPACE, 0x000000, 0x000000),
    walkable: false,
    blocksSight: true
};
Tile.FLOOR = {
    glyph: new Glyph('\'', 0x444444, 0x222222),
    walkable: true,
    blocksSight: false
};
Tile.WALL = {
    glyph: new Glyph(Glyph.CHAR_HLINE, 0xdddddd, 0x111111),
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
    }, {
        key: "getDiagonalOffsets",
        value: function getDiagonalOffsets() {
            return [{ x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: 1 }];
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

},{"../core":37,"../events":43,"../mixins":51}],40:[function(require,module,exports){
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

},{"../core":37}],45:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('../core');
var Map = require('./index');

var MazeRecursiveBacktrackGenerator = function () {
    function MazeRecursiveBacktrackGenerator(map, position) {
        _classCallCheck(this, MazeRecursiveBacktrackGenerator);

        this.map = map;
        this.width = this.map.length;
        this.height = this.map[0].length;
        this.maxAttemps = 50000;
        this.attempts = 0;
        this.stack = [];
        this.map[position.x][position.y] = 0;
        this.populateStack(position);
    }

    _createClass(MazeRecursiveBacktrackGenerator, [{
        key: 'populateStack',
        value: function populateStack(position) {
            var neighbours = Core.Position.getNeighbours(position, this.width, this.height, true);
            var newCells = [];
            for (var direction in neighbours) {
                var _position = neighbours[direction];
                if (_position && Map.Utils.canCarve(this.map, _position, 1)) {
                    newCells.push(_position);
                }
            }
            if (newCells.length > 0) {
                this.stack = this.stack.concat(Core.Utils.randomizeArray(newCells));
            }
        }
    }, {
        key: 'iterate',
        value: function iterate() {
            this.attempts++;
            if (this.attempts > this.maxAttemps) {
                console.log('max attempts done');
                return null;
            }
            var pos = void 0;
            while (this.stack && this.stack.length > 0) {
                pos = this.stack.pop();
                if (Map.Utils.canExtendTunnel(this.map, pos)) {
                    this.map[pos.x][pos.y] = 0;
                    this.populateStack(pos);
                    return pos;
                }
            }
            return null;
        }
    }, {
        key: 'getMap',
        value: function getMap() {
            return this.map;
        }
    }]);

    return MazeRecursiveBacktrackGenerator;
}();

exports.MazeRecursiveBacktrackGenerator = MazeRecursiveBacktrackGenerator;

},{"../core":37,"./index":49}],46:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('../core');
var Map = require('./index');

var RoomGenerator = function () {
    function RoomGenerator(map) {
        var maxAttempts = arguments.length <= 1 || arguments[1] === undefined ? 500 : arguments[1];

        _classCallCheck(this, RoomGenerator);

        this.map = map;
        this.width = this.map.length;
        this.height = this.map[0].length;
        this.maxAttempts = maxAttempts;
    }

    _createClass(RoomGenerator, [{
        key: 'isSpaceAvailable',
        value: function isSpaceAvailable(x, y, width, height) {
            for (var i = x; i < x + width; i++) {
                for (var j = y; j < y + height; j++) {
                    if (!Map.Utils.canCarve(this.map, new Core.Position(i, j), 0, true)) {
                        return false;
                    }
                }
            }
            return true;
        }
    }, {
        key: 'iterate',
        value: function iterate() {
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
                        this.map[i][j] = 0;
                    }
                }
                return true;
            }
            return false;
        }
    }, {
        key: 'getMap',
        value: function getMap() {
            return this.map;
        }
    }]);

    return RoomGenerator;
}();

exports.RoomGenerator = RoomGenerator;

},{"../core":37,"./index":49}],47:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('../core');
var Map = require('./index');

var TopologyCombinator = function () {
    function TopologyCombinator(map) {
        _classCallCheck(this, TopologyCombinator);

        this.map = map;
        this.width = this.map.length;
        this.height = this.map[0].length;
        this.topologies = [];
        for (var x = 0; x < this.width; x++) {
            this.topologies[x] = [];
            for (var y = 0; y < this.height; y++) {
                this.topologies[x][y] = 0;
            }
        }
    }

    _createClass(TopologyCombinator, [{
        key: 'getMap',
        value: function getMap() {
            return this.map;
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
                var surroundingTiles = Map.Utils.countSurroundingTiles(this.map, edge);
                if (surroundingTiles === 2) {
                    this.map[edge.x][edge.y] = 0;
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
            if (this.map[x][y] !== 0 || this.topologies[x][y] !== 0) {
                return;
            }
            if (topologyId === -1) {
                this.topologyId++;
                topologyId = this.topologyId;
            }
            this.topologies[x][y] = topologyId;
            var neighbours = Core.Position.getNeighbours(new Core.Position(x, y), -1, -1, true);
            neighbours.forEach(function (position) {
                if (_this2.map[position.x][position.y] === 0 && _this2.topologies[position.x][position.y] === 0) {
                    _this2.addTopology(position, topologyId);
                }
            });
        }
    }, {
        key: 'pruneDeadEnd',
        value: function pruneDeadEnd(position) {
            var _this3 = this;

            if (this.map[position.x][position.y] === 0) {
                var surroundingTiles = Map.Utils.countSurroundingTiles(this.map, new Core.Position(position.x, position.y));
                if (surroundingTiles <= 1) {
                    this.map[position.x][position.y] = 1;
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
                    if (this.map[x][y] === 0) {
                        this.pruneDeadEnd(new Core.Position(x, y));
                    }
                }
            }
        }
    }]);

    return TopologyCombinator;
}();

exports.TopologyCombinator = TopologyCombinator;

},{"../core":37,"./index":49}],48:[function(require,module,exports){
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

},{"../core":37}],49:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./RoomGenerator'));
__export(require('./MazeRecursiveBacktrackGenerator'));
__export(require('./Utils'));
__export(require('./FoV'));
__export(require('./TopologyCombinator'));

},{"./FoV":44,"./MazeRecursiveBacktrackGenerator":45,"./RoomGenerator":46,"./TopologyCombinator":47,"./Utils":48}],50:[function(require,module,exports){
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

},{}],51:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./EventHandler'));

},{"./EventHandler":50}]},{},[13])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDb25zb2xlLnRzIiwiRW5naW5lLnRzIiwiRXhjZXB0aW9ucy50cyIsIkdseXBoLnRzIiwiSW5wdXRIYW5kbGVyLnRzIiwiTG9nVmlldy50cyIsIk1hcC50cyIsIk1hcEdlbmVyYXRvci50cyIsIk1hcFZpZXcudHMiLCJQaXhpQ29uc29sZS50cyIsIlNjZW5lLnRzIiwiVGlsZS50cyIsImFwcC50cyIsImJlaGF2aW91cnMvQWN0aW9uLnRzIiwiYmVoYXZpb3Vycy9CZWhhdmlvdXIudHMiLCJiZWhhdmlvdXJzL051bGxBY3Rpb24udHMiLCJiZWhhdmlvdXJzL1JhbmRvbVdhbGtCZWhhdmlvdXIudHMiLCJiZWhhdmlvdXJzL1dhbGtBY3Rpb24udHMiLCJiZWhhdmlvdXJzL1dyaXRlUnVuZUFjdGlvbi50cyIsImJlaGF2aW91cnMvaW5kZXgudHMiLCJjb21wb25lbnRzL0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvRW5lcmd5Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9IZWFsdGhDb21wb25lbnQudHMiLCJjb21wb25lbnRzL0lucHV0Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9QaHlzaWNzQ29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9SZW5kZXJhYmxlQ29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9Sb2FtaW5nQUlDb21wb25lbnQudHMiLCJjb21wb25lbnRzL1J1bmVEYW1hZ2VDb21wb25lbnQudHMiLCJjb21wb25lbnRzL1J1bmVGcmVlemVDb21wb25lbnQudHMiLCJjb21wb25lbnRzL1J1bmVXcml0ZXJDb21wb25lbnQudHMiLCJjb21wb25lbnRzL1NlbGZEZXN0cnVjdENvbXBvbmVudC50cyIsImNvbXBvbmVudHMvU2xvd0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvVGltZUhhbmRsZXJDb21wb25lbnQudHMiLCJjb21wb25lbnRzL2luZGV4LnRzIiwiY29yZS9Db2xvci50cyIsImNvcmUvUG9zaXRpb24udHMiLCJjb3JlL2luZGV4LnRzIiwiZW50aXRpZXMvQ3JlYXRvci50cyIsImVudGl0aWVzL0VudGl0eS50cyIsImVudGl0aWVzL2luZGV4LnRzIiwiZXZlbnRzL0V2ZW50LnRzIiwiZXZlbnRzL0xpc3RlbmVyLnRzIiwiZXZlbnRzL2luZGV4LnRzIiwibWFwL0ZvVi50cyIsIm1hcC9NYXplUmVjdXJzaXZlQmFja3RyYWNrR2VuZXJhdG9yLnRzIiwibWFwL1Jvb21HZW5lcmF0b3IudHMiLCJtYXAvVG9wb2xvZ3lDb21iaW5hdG9yLnRzIiwibWFwL1V0aWxzLnRzIiwibWFwL2luZGV4LnRzIiwibWl4aW5zL0V2ZW50SGFuZGxlci50cyIsIm1peGlucy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQ0FBLElBQVksQUFBSSxlQUFNLEFBQVEsQUFBQztBQUMvQixJQUFPLEFBQUssZ0JBQVcsQUFBUyxBQUFDLEFBQUMsQUFFbEM7OztBQThCRSxxQkFBWSxBQUFhLE9BQUUsQUFBYztZQUFFLEFBQVUsbUVBQWUsQUFBUTtZQUFFLEFBQVUsbUVBQWUsQUFBUTs7OztBQUM3RyxBQUFJLGFBQUMsQUFBTSxTQUFHLEFBQUssQUFBQztBQUNwQixBQUFJLGFBQUMsQUFBTyxVQUFHLEFBQU0sQUFBQztBQUV0QixBQUFJLGFBQUMsQUFBaUIsb0JBQUcsQUFBTyxBQUFDO0FBQ2pDLEFBQUksYUFBQyxBQUFpQixvQkFBRyxBQUFPLEFBQUM7QUFFakMsQUFBSSxhQUFDLEFBQUssUUFBRyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQVcsWUFBUyxBQUFJLEtBQUMsQUFBSyxPQUFFLEFBQUksS0FBQyxBQUFNLFFBQUUsQUFBSyxNQUFDLEFBQVUsQUFBQyxBQUFDO0FBQ3ZGLEFBQUksYUFBQyxBQUFLLFFBQUcsQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFXLFlBQWEsQUFBSSxLQUFDLEFBQUssT0FBRSxBQUFJLEtBQUMsQUFBTSxRQUFFLEFBQUksS0FBQyxBQUFp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QUFFLElBQUksQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsR0FBRSxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsQUFBQyxBQUFDLE9BQ2pFLEFBQVMsVUFBQyxBQUFHLEtBQUUsSUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxHQUFFLEFBQVEsU0FBQyxBQUFDLEFBQUMsQUFBQyxBQUFDO0FBQzNFLGlCQUFLLEFBQVMsVUFBQyxBQUFLO0FBQ2xCLEFBQU0sdUJBQUMsQUFBUyxVQUFDLEFBQUcsS0FBRSxJQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsQUFBQyxBQUFDLE9BQ3pELEFBQVMsVUFBQyxBQUFHLEtBQUUsSUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxHQUFFLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxBQUFDLEFBQUMsT0FDakUsQUFBUyxVQUFDLEFBQUcsS0FBRSxJQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUMsR0FBRSxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsQUFBQyxBQUFDLE9BQzdELEFBQVMsVUFBQyxBQUFHLEtBQUUsSUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxHQUFFLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxBQUFDLEFBQUMsT0FDakUsQUFBUyxVQUFDLEFBQUcsS0FBRSxJQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsQUFBQyxBQUFDLEFBQUM7QUFDM0UsaUJBQUssQUFBUyxVQUFDLEFBQUk7QUFDakIsQUFBTSx1QkFBQyxBQUFTLFVBQUMsQUFBRyxLQUFFLElBQUksQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBQyxHQUFFLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxBQUFDLEFBQUMsT0FDekQsQUFBUyxVQUFDLEFBQUcsS0FBRSxJQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEFBQUMsQUFBQyxPQUNqRSxBQUFTLFVBQUMsQUFBRyxLQUFFLElBQUksQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsR0FBRSxBQUFRLFNBQUMsQUFBQyxBQUFDLEFBQUMsT0FDN0QsQUFBUyxVQUFDLEFBQUcsS0FBRSxJQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEFBQUMsQUFBQyxPQUNqRSxBQUFTLFVBQUMsQUFBRyxLQUFFLElBQUksQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBQyxHQUFFLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxBQUFDLEFBQUMsQUFBQztBQUMzRSxpQkFBSyxBQUFTLFVBQUMsQUFBSTtBQUNqQixBQUFNLHVCQUFDLEFBQVMsVUFBQyxBQUFHLEtBQUUsSUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEFBQUMsQUFBQyxPQUN6RCxBQUFTLFVBQUMsQUFBRyxLQUFFLElBQUksQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsR0FBRSxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsQUFBQyxBQUFDLE9BQ2pFLEFBQVMsVUFBQyxBQUFHLEtBQUUsSUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxHQUFFLEFBQVEsU0FBQyxBQUFDLEFBQUMsQUFBQyxPQUM3RCxBQUFTLFVBQUMsQUFBRyxLQUFFLElBQUksQUFBSSxLQUFDLEFB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QixBQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcbmltcG9ydCBHbHlwaCA9IHJlcXVpcmUoJy4vR2x5cGgnKTtcblxuY2xhc3MgQ29uc29sZSB7XG4gIHByaXZhdGUgX3dpZHRoOiBudW1iZXI7XG4gIGdldCB3aWR0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5fd2lkdGg7XG4gIH1cbiAgcHJpdmF0ZSBfaGVpZ2h0OiBudW1iZXI7XG4gIGdldCBoZWlnaHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hlaWdodDtcbiAgfVxuXG4gIHByaXZhdGUgX3RleHQ6IG51bWJlcltdW107XG4gIGdldCB0ZXh0KCkge1xuICAgIHJldHVybiB0aGlzLl90ZXh0O1xuICB9XG4gIHByaXZhdGUgX2ZvcmU6IENvcmUuQ29sb3JbXVtdO1xuICBnZXQgZm9yZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZm9yZTtcbiAgfVxuICBwcml2YXRlIF9iYWNrOiBDb3JlLkNvbG9yW11bXTtcbiAgZ2V0IGJhY2soKSB7XG4gICAgcmV0dXJuIHRoaXMuX2JhY2s7XG4gIH1cbiAgcHJpdmF0ZSBfaXNEaXJ0eTogYm9vbGVhbltdW107XG4gIGdldCBpc0RpcnR5KCkge1xuICAgIHJldHVybiB0aGlzLl9pc0RpcnR5O1xuICB9XG5cbiAgcHJpdmF0ZSBkZWZhdWx0QmFja2dyb3VuZDogQ29yZS5Db2xvcjtcbiAgcHJpdmF0ZSBkZWZhdWx0Rm9yZWdyb3VuZDogQ29yZS5Db2xvcjtcblxuICBjb25zdHJ1Y3Rvcih3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgZm9yZWdyb3VuZDogQ29yZS5Db2xvciA9IDB4ZmZmZmZmLCBiYWNrZ3JvdW5kOiBDb3JlLkNvbG9yID0gMHgwMDAwMDApIHtcbiAgICB0aGlzLl93aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuX2hlaWdodCA9IGhlaWdodDtcblxuICAgIHRoaXMuZGVmYXVsdEJhY2tncm91bmQgPSAweDAwMDAwO1xuICAgIHRoaXMuZGVmYXVsdEZvcmVncm91bmQgPSAweGZmZmZmO1xuXG4gICAgdGhpcy5fdGV4dCA9IENvcmUuVXRpbHMuYnVpbGRNYXRyaXg8bnVtYmVyPih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgR2x5cGguQ0hBUl9TUEFDRSk7XG4gICAgdGhpcy5fZm9yZSA9IENvcmUuVXRpbHMuYnVpbGRNYXRyaXg8Q29yZS5Db2xvcj4odGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIHRoaXMuZGVmYXVsdEZvcmVncm91bmQpO1xuICAgIHRoaXMuX2JhY2sgPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4PENvcmUuQ29sb3I+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0aGlzLmRlZmF1bHRCYWNrZ3JvdW5kKTtcbiAgICB0aGlzLl9pc0RpcnR5ID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeDxib29sZWFuPih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdHJ1ZSk7XG4gIH1cblxuICBjbGVhbkNlbGwoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICB0aGlzLl9pc0RpcnR5W3hdW3ldID0gZmFsc2U7XG4gIH1cblxuICBwcmludCh0ZXh0OiBzdHJpbmcsIHg6IG51bWJlciwgeTogbnVtYmVyLCBjb2xvcjogQ29yZS5Db2xvciA9IDB4ZmZmZmZmKSB7XG4gICAgbGV0IGJlZ2luID0gMDtcbiAgICBsZXQgZW5kID0gdGV4dC5sZW5ndGg7XG4gICAgaWYgKHggKyBlbmQgPiB0aGlzLndpZHRoKSB7XG4gICAgICBlbmQgPSB0aGlzLndpZHRoIC0geDtcbiAgICB9XG4gICAgaWYgKHggPCAwKSB7XG4gICAgICBlbmQgKz0geDtcbiAgICAgIHggPSAwO1xuICAgIH1cbiAgICB0aGlzLnNldEZvcmVncm91bmQoY29sb3IsIHgsIHksIGVuZCwgMSk7XG4gICAgZm9yIChsZXQgaSA9IGJlZ2luOyBpIDwgZW5kOyArK2kpIHtcbiAgICAgIHRoaXMuc2V0VGV4dCh0ZXh0LmNoYXJDb2RlQXQoaSksIHggKyBpLCB5KTtcbiAgICB9XG4gIH1cblxuICBzZXRUZXh0KGFzY2lpOiBudW1iZXIgfCBzdHJpbmcsIHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyID0gMSwgaGVpZ2h0OiBudW1iZXIgPSAxKSB7XG4gICAgaWYgKHR5cGVvZiBhc2NpaSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGFzY2lpID0gKDxzdHJpbmc+YXNjaWkpLmNoYXJDb2RlQXQoMCk7XG4gICAgfVxuICAgIHRoaXMuc2V0TWF0cml4KHRoaXMuX3RleHQsIGFzY2lpLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcbiAgfVxuXG4gIHNldEZvcmVncm91bmQoY29sb3I6IENvcmUuQ29sb3IsIHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyID0gMSwgaGVpZ2h0OiBudW1iZXIgPSAxKSB7XG4gICAgdGhpcy5zZXRNYXRyaXgodGhpcy5fZm9yZSwgY29sb3IsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuICB9XG5cbiAgc2V0QmFja2dyb3VuZChjb2xvcjogQ29yZS5Db2xvciwgeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIgPSAxLCBoZWlnaHQ6IG51bWJlciA9IDEpIHtcbiAgICB0aGlzLnNldE1hdHJpeCh0aGlzLl9iYWNrLCBjb2xvciwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gIH1cblxuICBwcml2YXRlIHNldE1hdHJpeDxUPihtYXRyaXg6IFRbXVtdLCB2YWx1ZTogVCwgeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgZm9yIChsZXQgaSA9IHg7IGkgPCB4ICsgd2lkdGg7IGkrKykge1xuICAgICAgZm9yIChsZXQgaiA9IHk7IGogPCB5ICsgaGVpZ2h0OyBqKyspIHtcbiAgICAgICAgaWYgKG1hdHJpeFtpXVtqXSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBtYXRyaXhbaV1bal0gPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5faXNEaXJ0eVtpXVtqXSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCA9IENvbnNvbGU7XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4vY29yZSc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuL2VudGl0aWVzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9jb21wb25lbnRzJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBDb2xsZWN0aW9ucyBmcm9tICd0eXBlc2NyaXB0LWNvbGxlY3Rpb25zJztcbmltcG9ydCAqIGFzIE1peGlucyBmcm9tICcuL21peGlucyc7XG5cbmltcG9ydCBQaXhpQ29uc29sZSA9IHJlcXVpcmUoJy4vUGl4aUNvbnNvbGUnKTtcbmltcG9ydCBDb25zb2xlID0gcmVxdWlyZSgnLi9Db25zb2xlJyk7XG5cbmltcG9ydCBJbnB1dEhhbmRsZXIgPSByZXF1aXJlKCcuL0lucHV0SGFuZGxlcicpO1xuXG5pbXBvcnQgU2NlbmUgPSByZXF1aXJlKCcuL1NjZW5lJyk7XG5cbmludGVyZmFjZSBGcmFtZVJlbmRlcmVyIHtcbiAgKGVsYXBzZWRUaW1lOiBudW1iZXIpOiB2b2lkO1xufVxubGV0IHJlbmRlcmVyOiBGcmFtZVJlbmRlcmVyO1xubGV0IGZyYW1lTG9vcDogKGNhbGxiYWNrOiAoZWxhcHNlZFRpbWU6IG51bWJlcikgPT4gdm9pZCkgPT4gdm9pZDtcblxubGV0IGZyYW1lRnVuYyA9IChlbGFwc2VkVGltZTogbnVtYmVyKSA9PiB7XG4gIGZyYW1lTG9vcChmcmFtZUZ1bmMpO1xuICByZW5kZXJlcihlbGFwc2VkVGltZSk7XG59XG5cbmxldCBsb29wID0gKHRoZVJlbmRlcmVyOiBGcmFtZVJlbmRlcmVyKSA9PiB7XG4gIHJlbmRlcmVyID0gdGhlUmVuZGVyZXI7XG4gIGZyYW1lTG9vcChmcmFtZUZ1bmMpO1xufVxuXG5jbGFzcyBFbmdpbmUgaW1wbGVtZW50cyBNaXhpbnMuSUV2ZW50SGFuZGxlciB7XG4gIC8vIEV2ZW50SGFuZGxlciBtaXhpblxuICBsaXN0ZW46IChsaXN0ZW5lcjogRXZlbnRzLkxpc3RlbmVyKSA9PiBFdmVudHMuTGlzdGVuZXI7XG4gIHJlbW92ZUxpc3RlbmVyOiAobGlzdGVuZXI6IEV2ZW50cy5MaXN0ZW5lcikgPT4gdm9pZDtcbiAgZW1pdDogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IHZvaWQ7XG4gIGZpcmU6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiBhbnk7XG4gIGlzOiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gYm9vbGVhbjtcbiAgZ2F0aGVyOiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gYW55W107XG5cbiAgcHJpdmF0ZSBwaXhpQ29uc29sZTogUGl4aUNvbnNvbGU7XG5cbiAgcHJpdmF0ZSBnYW1lVGltZTogbnVtYmVyID0gMDtcbiAgcHJpdmF0ZSBlbmdpbmVUaWNrc1BlclNlY29uZDogbnVtYmVyID0gMTA7XG4gIHByaXZhdGUgZW5naW5lVGlja0xlbmd0aDogbnVtYmVyID0gMTAwO1xuICBwcml2YXRlIGVsYXBzZWRUaW1lOiBudW1iZXIgPSAwO1xuICBwcml2YXRlIHRpbWVIYW5kbGVyQ29tcG9uZW50OiBDb21wb25lbnRzLlRpbWVIYW5kbGVyQ29tcG9uZW50O1xuXG4gIHByaXZhdGUgd2lkdGg6IG51bWJlcjtcbiAgcHJpdmF0ZSBoZWlnaHQ6IG51bWJlcjtcbiAgcHJpdmF0ZSBjYW52YXNJZDogc3RyaW5nO1xuXG4gIHByaXZhdGUgZW50aXRpZXM6IHtbZ3VpZDogc3RyaW5nXTogRW50aXRpZXMuRW50aXR5fTtcbiAgcHJpdmF0ZSB0b0Rlc3Ryb3k6IEVudGl0aWVzLkVudGl0eVtdO1xuXG4gIHByaXZhdGUgcGF1c2VkOiBib29sZWFuO1xuXG4gIHByaXZhdGUgX2lucHV0SGFuZGxlcjogSW5wdXRIYW5kbGVyO1xuICBnZXQgaW5wdXRIYW5kbGVyKCkge1xuICAgIHJldHVybiB0aGlzLl9pbnB1dEhhbmRsZXI7XG4gIH1cblxuICBwcml2YXRlIF9jdXJyZW50U2NlbmU6IFNjZW5lO1xuICBnZXQgY3VycmVudFNjZW5lKCkge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50U2NlbmU7XG4gIH1cblxuICBwdWJsaWMgY3VycmVudFRpY2s6IG51bWJlcjtcbiAgcHVibGljIGN1cnJlbnRUdXJuOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Iod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGNhbnZhc0lkOiBzdHJpbmcpIHtcbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMuY2FudmFzSWQgPSBjYW52YXNJZDtcblxuICAgIHRoaXMuZW50aXRpZXMgPSB7fTtcbiAgICB0aGlzLnRvRGVzdHJveSA9IFtdO1xuXG4gICAgdGhpcy5jdXJyZW50VGljayA9IDA7XG4gICAgdGhpcy5jdXJyZW50VHVybiA9IDA7XG5cbiAgICB0aGlzLmVuZ2luZVRpY2tzUGVyU2Vjb25kID0gMTA7XG4gICAgZnJhbWVMb29wID0gKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgKDxhbnk+d2luZG93KS53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgKDxhbnk+d2luZG93KS5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgKDxhbnk+d2luZG93KS5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICg8YW55PndpbmRvdykubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgZnVuY3Rpb24oY2FsbGJhY2s6IChlbGFwc2VkVGltZTogbnVtYmVyKSA9PiB2b2lkKSB7XG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjAsIG5ldyBEYXRlKCkuZ2V0VGltZSgpKTtcbiAgICAgIH07XG4gICAgfSkoKTtcblxuICAgIHRoaXMuZW5naW5lVGlja0xlbmd0aCA9IDEwMDAgLyB0aGlzLmVuZ2luZVRpY2tzUGVyU2Vjb25kO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKCkgPT4ge1xuICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgICB9KTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignYmx1cicsICgpID0+IHtcbiAgICAgIHRoaXMucGF1c2VkID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIHRoaXMuX2lucHV0SGFuZGxlciA9IG5ldyBJbnB1dEhhbmRsZXIodGhpcyk7XG4gIH1cblxuICBzdGFydChzY2VuZTogU2NlbmUpIHtcbiAgICB0aGlzLl9jdXJyZW50U2NlbmUgPSBzY2VuZTtcbiAgICB0aGlzLl9jdXJyZW50U2NlbmUuc3RhcnQoKTtcblxuICAgIGxldCB0aW1lS2VlcGVyID0gbmV3IEVudGl0aWVzLkVudGl0eSh0aGlzLCAndGltZUtlZXBlcicpO1xuICAgIHRoaXMudGltZUhhbmRsZXJDb21wb25lbnQgPSBuZXcgQ29tcG9uZW50cy5UaW1lSGFuZGxlckNvbXBvbmVudCh0aGlzKTtcbiAgICB0aW1lS2VlcGVyLmFkZENvbXBvbmVudCh0aGlzLnRpbWVIYW5kbGVyQ29tcG9uZW50KTtcblxuICAgIHRoaXMucGl4aUNvbnNvbGUgPSBuZXcgUGl4aUNvbnNvbGUodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIHRoaXMuY2FudmFzSWQsIDB4ZmZmZmZmLCAweDAwMDAwMCk7XG4gICAgbG9vcCgodGltZSkgPT4ge1xuICAgICAgaWYgKHRoaXMucGF1c2VkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuZWxhcHNlZFRpbWUgPSB0aW1lIC0gdGhpcy5nYW1lVGltZTtcblxuICAgICAgaWYgKHRoaXMuZWxhcHNlZFRpbWUgPj0gdGhpcy5lbmdpbmVUaWNrTGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuZ2FtZVRpbWUgPSB0aW1lO1xuICAgICAgICB0aGlzLnRpbWVIYW5kbGVyQ29tcG9uZW50LmVuZ2luZVRpY2sodGhpcy5nYW1lVGltZSk7XG5cbiAgICAgICAgdGhpcy5kZXN0cm95RW50aXRpZXMoKTtcblxuICAgICAgICBzY2VuZS5yZW5kZXIoKGNvbnNvbGU6IENvbnNvbGUsIHg6IG51bWJlciwgeTogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgdGhpcy5waXhpQ29uc29sZS5ibGl0KGNvbnNvbGUsIHgsIHkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHRoaXMucGl4aUNvbnNvbGUucmVuZGVyKCk7XG4gICAgfSk7XG4gIH1cblxuICByZWdpc3RlckVudGl0eShlbnRpdHk6IEVudGl0aWVzLkVudGl0eSkge1xuICAgIHRoaXMuZW50aXRpZXNbZW50aXR5Lmd1aWRdID0gZW50aXR5O1xuICB9XG5cbiAgcmVtb3ZlRW50aXR5KGVudGl0eTogRW50aXRpZXMuRW50aXR5KSB7XG4gICAgdGhpcy50b0Rlc3Ryb3kucHVzaChlbnRpdHkpO1xuICB9XG5cbiAgcHJpdmF0ZSBkZXN0cm95RW50aXRpZXMoKSB7XG4gICAgdGhpcy50b0Rlc3Ryb3kuZm9yRWFjaCgoZW50aXR5KSA9PiB7XG4gICAgICBlbnRpdHkuZGVzdHJveSgpO1xuICAgICAgdGhpcy5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ2VudGl0eURlc3Ryb3llZCcsIHtlbnRpdHk6IGVudGl0eX0pKTtcbiAgICAgIGRlbGV0ZSB0aGlzLmVudGl0aWVzW2VudGl0eS5ndWlkXTtcbiAgICB9KTtcbiAgICB0aGlzLnRvRGVzdHJveSA9IFtdO1xuICB9XG5cbiAgZ2V0RW50aXR5KGd1aWQ6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLmVudGl0aWVzW2d1aWRdO1xuICB9XG59XG5cbkNvcmUuVXRpbHMuYXBwbHlNaXhpbnMoRW5naW5lLCBbTWl4aW5zLkV2ZW50SGFuZGxlcl0pO1xuXG5leHBvcnQgPSBFbmdpbmU7XG4iLCJleHBvcnQgY2xhc3MgTWlzc2luZ0NvbXBvbmVudEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuICBwdWJsaWMgbWVzc2FnZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1pc3NpbmdJbXBsZW1lbnRhdGlvbkVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuICBwdWJsaWMgbWVzc2FnZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEVudGl0eU92ZXJsYXBFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgcHVibGljIG5hbWU6IHN0cmluZztcbiAgcHVibGljIG1lc3NhZ2U6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4vY29yZSc7XG5cbmNsYXNzIEdseXBoIHtcblx0cHVibGljIHN0YXRpYyBDSEFSX0ZVTEw6IG51bWJlciA9IDIxOTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1NQQUNFOiBudW1iZXIgPSAzMjtcblx0Ly8gc2luZ2xlIHdhbGxzXG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9ITElORTogbnVtYmVyID0gMTk2O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfVkxJTkU6IG51bWJlciA9IDE3OTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1NXOiBudW1iZXIgPSAxOTE7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9TRTogbnVtYmVyID0gMjE4O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfTlc6IG51bWJlciA9IDIxNztcblx0cHVibGljIHN0YXRpYyBDSEFSX05FOiBudW1iZXIgPSAxOTI7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9URUVXOiBudW1iZXIgPSAxODA7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9URUVFOiBudW1iZXIgPSAxOTU7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9URUVOOiBudW1iZXIgPSAxOTM7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9URUVTOiBudW1iZXIgPSAxOTQ7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9DUk9TUzogbnVtYmVyID0gMTk3O1xuXHQvLyBkb3VibGUgd2FsbHNcblx0cHVibGljIHN0YXRpYyBDSEFSX0RITElORTogbnVtYmVyID0gMjA1O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRFZMSU5FOiBudW1iZXIgPSAxODY7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9ETkU6IG51bWJlciA9IDE4Nztcblx0cHVibGljIHN0YXRpYyBDSEFSX0ROVzogbnVtYmVyID0gMjAxO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRFNFOiBudW1iZXIgPSAxODg7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9EU1c6IG51bWJlciA9IDIwMDtcblx0cHVibGljIHN0YXRpYyBDSEFSX0RURUVXOiBudW1iZXIgPSAxODU7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9EVEVFRTogbnVtYmVyID0gMjA0O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRFRFRU46IG51bWJlciA9IDIwMjtcblx0cHVibGljIHN0YXRpYyBDSEFSX0RURUVTOiBudW1iZXIgPSAyMDM7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9EQ1JPU1M6IG51bWJlciA9IDIwNjtcblx0Ly8gYmxvY2tzIFxuXHRwdWJsaWMgc3RhdGljIENIQVJfQkxPQ0sxOiBudW1iZXIgPSAxNzY7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9CTE9DSzI6IG51bWJlciA9IDE3Nztcblx0cHVibGljIHN0YXRpYyBDSEFSX0JMT0NLMzogbnVtYmVyID0gMTc4O1xuXHQvLyBhcnJvd3MgXG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9BUlJPV19OOiBudW1iZXIgPSAyNDtcblx0cHVibGljIHN0YXRpYyBDSEFSX0FSUk9XX1M6IG51bWJlciA9IDI1O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQVJST1dfRTogbnVtYmVyID0gMjY7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9BUlJPV19XOiBudW1iZXIgPSAyNztcblx0Ly8gYXJyb3dzIHdpdGhvdXQgdGFpbCBcblx0cHVibGljIHN0YXRpYyBDSEFSX0FSUk9XMl9OOiBudW1iZXIgPSAzMDtcblx0cHVibGljIHN0YXRpYyBDSEFSX0FSUk9XMl9TOiBudW1iZXIgPSAzMTtcblx0cHVibGljIHN0YXRpYyBDSEFSX0FSUk9XMl9FOiBudW1iZXIgPSAxNjtcblx0cHVibGljIHN0YXRpYyBDSEFSX0FSUk9XMl9XOiBudW1iZXIgPSAxNztcblx0Ly8gZG91YmxlIGFycm93cyBcblx0cHVibGljIHN0YXRpYyBDSEFSX0RBUlJPV19IOiBudW1iZXIgPSAyOTtcblx0cHVibGljIHN0YXRpYyBDSEFSX0RBUlJPV19WOiBudW1iZXIgPSAxODtcblx0Ly8gR1VJIHN0dWZmIFxuXHRwdWJsaWMgc3RhdGljIENIQVJfQ0hFQ0tCT1hfVU5TRVQ6IG51bWJlciA9IDIyNDtcblx0cHVibGljIHN0YXRpYyBDSEFSX0NIRUNLQk9YX1NFVDogbnVtYmVyID0gMjI1O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfUkFESU9fVU5TRVQ6IG51bWJlciA9IDk7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9SQURJT19TRVQ6IG51bWJlciA9IDEwO1xuXHQvLyBzdWItcGl4ZWwgcmVzb2x1dGlvbiBraXQgXG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9TVUJQX05XOiBudW1iZXIgPSAyMjY7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9TVUJQX05FOiBudW1iZXIgPSAyMjc7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9TVUJQX046IG51bWJlciA9IDIyODtcblx0cHVibGljIHN0YXRpYyBDSEFSX1NVQlBfU0U6IG51bWJlciA9IDIyOTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1NVQlBfRElBRzogbnVtYmVyID0gMjMwO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU1VCUF9FOiBudW1iZXIgPSAyMzE7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9TVUJQX1NXOiBudW1iZXIgPSAyMzI7XG5cdC8vIG1pc2NlbGxhbmVvdXMgXG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9TTUlMSUUgOiBudW1iZXIgPSAgMTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1NNSUxJRV9JTlYgOiBudW1iZXIgPSAgMjtcblx0cHVibGljIHN0YXRpYyBDSEFSX0hFQVJUIDogbnVtYmVyID0gIDM7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9ESUFNT05EIDogbnVtYmVyID0gIDQ7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9DTFVCIDogbnVtYmVyID0gIDU7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9TUEFERSA6IG51bWJlciA9ICA2O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQlVMTEVUIDogbnVtYmVyID0gIDc7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9CVUxMRVRfSU5WIDogbnVtYmVyID0gIDg7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9NQUxFIDogbnVtYmVyID0gIDExO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRkVNQUxFIDogbnVtYmVyID0gIDEyO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfTk9URSA6IG51bWJlciA9ICAxMztcblx0cHVibGljIHN0YXRpYyBDSEFSX05PVEVfRE9VQkxFIDogbnVtYmVyID0gIDE0O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfTElHSFQgOiBudW1iZXIgPSAgMTU7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9FWENMQU1fRE9VQkxFIDogbnVtYmVyID0gIDE5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfUElMQ1JPVyA6IG51bWJlciA9ICAyMDtcblx0cHVibGljIHN0YXRpYyBDSEFSX1NFQ1RJT04gOiBudW1iZXIgPSAgMjE7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9QT1VORCA6IG51bWJlciA9ICAxNTY7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9NVUxUSVBMSUNBVElPTiA6IG51bWJlciA9ICAxNTg7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9GVU5DVElPTiA6IG51bWJlciA9ICAxNTk7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9SRVNFUlZFRCA6IG51bWJlciA9ICAxNjk7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9IQUxGIDogbnVtYmVyID0gIDE3MTtcblx0cHVibGljIHN0YXRpYyBDSEFSX09ORV9RVUFSVEVSIDogbnVtYmVyID0gIDE3Mjtcblx0cHVibGljIHN0YXRpYyBDSEFSX0NPUFlSSUdIVCA6IG51bWJlciA9ICAxODQ7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9DRU5UIDogbnVtYmVyID0gIDE4OTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1lFTiA6IG51bWJlciA9ICAxOTA7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9DVVJSRU5DWSA6IG51bWJlciA9ICAyMDc7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9USFJFRV9RVUFSVEVSUyA6IG51bWJlciA9ICAyNDM7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9ESVZJU0lPTiA6IG51bWJlciA9ICAyNDY7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9HUkFERSA6IG51bWJlciA9ICAyNDg7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9VTUxBVVQgOiBudW1iZXIgPSAgMjQ5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfUE9XMSA6IG51bWJlciA9ICAyNTE7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9QT1czIDogbnVtYmVyID0gIDI1Mjtcblx0cHVibGljIHN0YXRpYyBDSEFSX1BPVzIgOiBudW1iZXIgPSAgMjUzO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQlVMTEVUX1NRVUFSRSA6IG51bWJlciA9ICAyNTQ7XG5cbiAgcHJpdmF0ZSBfZ2x5cGg6IG51bWJlcjtcbiAgZ2V0IGdseXBoKCkge1xuICAgIHJldHVybiB0aGlzLl9nbHlwaDtcbiAgfVxuICBwcml2YXRlIF9mb3JlZ3JvdW5kQ29sb3I6IENvcmUuQ29sb3I7XG4gIGdldCBmb3JlZ3JvdW5kQ29sb3IoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZvcmVncm91bmRDb2xvcjtcbiAgfVxuICBwcml2YXRlIF9iYWNrZ3JvdW5kQ29sb3I6IENvcmUuQ29sb3I7XG4gIGdldCBiYWNrZ3JvdW5kQ29sb3IoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2JhY2tncm91bmRDb2xvcjtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGc6IHN0cmluZyB8IG51bWJlciA9IEdseXBoLkNIQVJfU1BBQ0UsIGY6IENvcmUuQ29sb3IgPSAweGZmZmZmZiwgYjogQ29yZS5Db2xvciA9IDB4MDAwMDAwKSB7XG4gICAgdGhpcy5fZ2x5cGggPSB0eXBlb2YgZyA9PT0gJ3N0cmluZycgPyBnLmNoYXJDb2RlQXQoMCkgOiBnO1xuICAgIHRoaXMuX2ZvcmVncm91bmRDb2xvciA9IGY7XG4gICAgdGhpcy5fYmFja2dyb3VuZENvbG9yID0gYjtcbiAgfVxufVxuXG5leHBvcnQgPSBHbHlwaDtcbiIsImltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuL0VuZ2luZScpO1xuXG5jbGFzcyBJbnB1dEhhbmRsZXIge1xuICBwdWJsaWMgc3RhdGljIEtFWV9QRVJJT0Q6IG51bWJlciA9IDE5MDtcbiAgcHVibGljIHN0YXRpYyBLRVlfTEVGVDogbnVtYmVyID0gMzc7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1VQOiBudW1iZXIgPSAzODtcbiAgcHVibGljIHN0YXRpYyBLRVlfUklHSFQ6IG51bWJlciA9IDM5O1xuICBwdWJsaWMgc3RhdGljIEtFWV9ET1dOOiBudW1iZXIgPSA0MDtcblxuICBwdWJsaWMgc3RhdGljIEtFWV8wOiBudW1iZXIgPSA0ODtcbiAgcHVibGljIHN0YXRpYyBLRVlfMTogbnVtYmVyID0gNDk7XG4gIHB1YmxpYyBzdGF0aWMgS0VZXzI6IG51bWJlciA9IDUwO1xuICBwdWJsaWMgc3RhdGljIEtFWV8zOiBudW1iZXIgPSA1MTtcbiAgcHVibGljIHN0YXRpYyBLRVlfNDogbnVtYmVyID0gNTI7XG4gIHB1YmxpYyBzdGF0aWMgS0VZXzU6IG51bWJlciA9IDUzO1xuICBwdWJsaWMgc3RhdGljIEtFWV82OiBudW1iZXIgPSA1NDtcbiAgcHVibGljIHN0YXRpYyBLRVlfNzogbnVtYmVyID0gNTU7XG4gIHB1YmxpYyBzdGF0aWMgS0VZXzg6IG51bWJlciA9IDU2O1xuICBwdWJsaWMgc3RhdGljIEtFWV85OiBudW1iZXIgPSA1NztcblxuICBwdWJsaWMgc3RhdGljIEtFWV9BOiBudW1iZXIgPSA2NTtcbiAgcHVibGljIHN0YXRpYyBLRVlfQjogbnVtYmVyID0gNjY7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0M6IG51bWJlciA9IDY3O1xuICBwdWJsaWMgc3RhdGljIEtFWV9EOiBudW1iZXIgPSA2ODtcbiAgcHVibGljIHN0YXRpYyBLRVlfRTogbnVtYmVyID0gNjk7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0Y6IG51bWJlciA9XHQ3MDtcbiAgcHVibGljIHN0YXRpYyBLRVlfRzogbnVtYmVyID1cdDcxO1xuICBwdWJsaWMgc3RhdGljIEtFWV9IOiBudW1iZXIgPVx0NzI7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0k6IG51bWJlciA9XHQ3MztcbiAgcHVibGljIHN0YXRpYyBLRVlfSjogbnVtYmVyID1cdDc0O1xuICBwdWJsaWMgc3RhdGljIEtFWV9LOiBudW1iZXIgPVx0NzU7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0w6IG51bWJlciA9XHQ3NjtcbiAgcHVibGljIHN0YXRpYyBLRVlfTTogbnVtYmVyID1cdDc3O1xuICBwdWJsaWMgc3RhdGljIEtFWV9OOiBudW1iZXIgPVx0Nzg7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX086IG51bWJlciA9XHQ3OTtcbiAgcHVibGljIHN0YXRpYyBLRVlfUDogbnVtYmVyID1cdDgwO1xuICBwdWJsaWMgc3RhdGljIEtFWV9ROiBudW1iZXIgPVx0ODE7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1I6IG51bWJlciA9XHQ4MjtcbiAgcHVibGljIHN0YXRpYyBLRVlfUzogbnVtYmVyID1cdDgzO1xuICBwdWJsaWMgc3RhdGljIEtFWV9UOiBudW1iZXIgPVx0ODQ7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1U6IG51bWJlciA9XHQ4NTtcbiAgcHVibGljIHN0YXRpYyBLRVlfVjogbnVtYmVyID1cdDg2O1xuICBwdWJsaWMgc3RhdGljIEtFWV9XOiBudW1iZXIgPVx0ODc7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1g6IG51bWJlciA9XHQ4ODtcbiAgcHVibGljIHN0YXRpYyBLRVlfWTogbnVtYmVyID1cdDg5O1xuICBwdWJsaWMgc3RhdGljIEtFWV9aOiBudW1iZXIgPVx0OTA7XG5cbiAgcHJpdmF0ZSBsaXN0ZW5lcnM6IHtba2V5Y29kZTogbnVtYmVyXTogKCgpID0+IGFueSlbXX07XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlbmdpbmU6IEVuZ2luZSkge1xuICAgIHRoaXMubGlzdGVuZXJzID0ge307XG5cbiAgICB0aGlzLnJlZ2lzdGVyTGlzdGVuZXJzKCk7XG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5vbktleURvd24uYmluZCh0aGlzKSk7XG4gIH1cblxuICBwcml2YXRlIG9uS2V5RG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIGlmICh0aGlzLmxpc3RlbmVyc1tldmVudC5rZXlDb2RlXSkge1xuICAgICAgdGhpcy5saXN0ZW5lcnNbZXZlbnQua2V5Q29kZV0uZm9yRWFjaCgoY2FsbGJhY2spID0+IHtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBsaXN0ZW4oa2V5Y29kZXM6IG51bWJlcltdLCBjYWxsYmFjazogKCkgPT4gYW55KSB7XG4gICAga2V5Y29kZXMuZm9yRWFjaCgoa2V5Y29kZSkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmxpc3RlbmVyc1trZXljb2RlXSkge1xuICAgICAgICB0aGlzLmxpc3RlbmVyc1trZXljb2RlXSA9IFtdO1xuICAgICAgfVxuICAgICAgdGhpcy5saXN0ZW5lcnNba2V5Y29kZV0ucHVzaChjYWxsYmFjayk7XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0ID0gSW5wdXRIYW5kbGVyO1xuIiwiaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4vZXZlbnRzJztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4vZW50aXRpZXMnO1xuXG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi9FbmdpbmUnKTtcbmltcG9ydCBDb25zb2xlID0gcmVxdWlyZSgnLi9Db25zb2xlJyk7XG5cbmNsYXNzIExvZ1ZpZXcge1xuICBwcml2YXRlIGN1cnJlbnRUdXJuOiBudW1iZXI7XG4gIHByaXZhdGUgbWVzc2FnZXM6IHt0dXJuOiBudW1iZXIsIG1lc3NhZ2U6IHN0cmluZ31bXTtcbiAgcHJpdmF0ZSBjb25zb2xlOiBDb25zb2xlO1xuICBwcml2YXRlIHBsYXllcjogRW50aXRpZXMuRW50aXR5O1xuICBwcml2YXRlIG1heE1lc3NhZ2VzOiBudW1iZXI7XG4gIHByaXZhdGUgZWZmZWN0czogYW55W107XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlbmdpbmU6IEVuZ2luZSwgcHJpdmF0ZSB3aWR0aDogbnVtYmVyLCBwcml2YXRlIGhlaWdodDogbnVtYmVyLCBwbGF5ZXI6IEVudGl0aWVzLkVudGl0eSkge1xuICAgIHRoaXMucmVnaXN0ZXJMaXN0ZW5lcnMoKTtcblxuICAgIHRoaXMuY29uc29sZSA9IG5ldyBDb25zb2xlKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICB0aGlzLmN1cnJlbnRUdXJuID0gMTtcbiAgICB0aGlzLm1lc3NhZ2VzID0gW107XG4gICAgdGhpcy5tYXhNZXNzYWdlcyA9IHRoaXMuaGVpZ2h0IC0gMTtcblxuICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xuICAgIHRoaXMuZWZmZWN0cyA9IFtdO1xuICB9XG5cbiAgcHJpdmF0ZSByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICd0dXJuJyxcbiAgICAgIHRoaXMub25UdXJuLmJpbmQodGhpcylcbiAgICApKTtcblxuICAgIHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ21lc3NhZ2UnLFxuICAgICAgdGhpcy5vbk1lc3NhZ2UuYmluZCh0aGlzKVxuICAgICkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvblR1cm4oZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIHRoaXMuY3VycmVudFR1cm4gPSBldmVudC5kYXRhLmN1cnJlbnRUdXJuO1xuICAgIGlmICh0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+IDAgJiYgdGhpcy5tZXNzYWdlc1t0aGlzLm1lc3NhZ2VzLmxlbmd0aCAtIDFdLnR1cm4gPCB0aGlzLmN1cnJlbnRUdXJuIC0gMTApIHtcbiAgICAgIHRoaXMubWVzc2FnZXMucG9wKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnBsYXllcikge1xuICAgICAgdGhpcy5lZmZlY3RzID0gdGhpcy5wbGF5ZXIuZ2F0aGVyKG5ldyBFdmVudHMuRXZlbnQoJ2dldFN0YXR1c0VmZmVjdCcpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uTWVzc2FnZShldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LmRhdGEubWVzc2FnZSkge1xuICAgICAgdGhpcy5tZXNzYWdlcy51bnNoaWZ0KHtcbiAgICAgICAgdHVybjogdGhpcy5jdXJyZW50VHVybixcbiAgICAgICAgbWVzc2FnZTogZXZlbnQuZGF0YS5tZXNzYWdlXG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMubWVzc2FnZXMubGVuZ3RoID4gdGhpcy5tYXhNZXNzYWdlcykge1xuICAgICAgdGhpcy5tZXNzYWdlcy5wb3AoKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoYmxpdEZ1bmN0aW9uOiBhbnkpIHtcbiAgICB0aGlzLmNvbnNvbGUuc2V0VGV4dCgnICcsIDAsIDAsIHRoaXMuY29uc29sZS53aWR0aCwgdGhpcy5jb25zb2xlLmhlaWdodCk7XG5cbiAgICB0aGlzLmNvbnNvbGUuc2V0VGV4dCgnICcsIHRoaXMud2lkdGggLSAxMCwgMCwgMTApO1xuICAgIHRoaXMuY29uc29sZS5wcmludCgnVHVybjogJyArIHRoaXMuY3VycmVudFR1cm4sIHRoaXMud2lkdGggLSAxMCwgMCwgMHhmZmZmZmYpO1xuICAgIGlmICh0aGlzLmVmZmVjdHMubGVuZ3RoID4gMCkge1xuICAgICAgbGV0IHN0ciA9IHRoaXMuZWZmZWN0cy5yZWR1Y2UoKGFjYywgZWZmZWN0LCBpZHgpID0+IHtcbiAgICAgICAgcmV0dXJuIGFjYyArIGVmZmVjdC5uYW1lICsgKGlkeCAhPT0gdGhpcy5lZmZlY3RzLmxlbmd0aCAtIDEgPyAnLCAnIDogJycpO1xuICAgICAgfSwgJ0VmZmVjdHM6ICcpO1xuICAgICAgdGhpcy5jb25zb2xlLnByaW50KHN0ciwgMCwgMCwgMHhmZmZmZmYpO1xuICAgIH1cbiAgICB0aGlzLmNvbnNvbGUucHJpbnRcbiAgICBpZiAodGhpcy5tZXNzYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLm1lc3NhZ2VzLmZvckVhY2goKGRhdGEsIGlkeCkgPT4ge1xuICAgICAgICBsZXQgY29sb3IgPSAweGZmZmZmZjtcbiAgICAgICAgaWYgKGRhdGEudHVybiA8IHRoaXMuY3VycmVudFR1cm4gLSA1KSB7XG4gICAgICAgICAgY29sb3IgPSAweDY2NjY2NjtcbiAgICAgICAgfSBlbHNlIGlmIChkYXRhLnR1cm4gPCB0aGlzLmN1cnJlbnRUdXJuIC0gMikge1xuICAgICAgICAgIGNvbG9yID0gMHhhYWFhYWE7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb25zb2xlLnByaW50KGRhdGEubWVzc2FnZSwgMCwgdGhpcy5oZWlnaHQgLSBpZHgsIGNvbG9yKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBibGl0RnVuY3Rpb24odGhpcy5jb25zb2xlKTtcbiAgfVxufVxuXG5leHBvcnQgPSBMb2dWaWV3O1xuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuL2NvcmUnO1xuXG5pbXBvcnQgVGlsZSA9IHJlcXVpcmUoJy4vVGlsZScpO1xuXG5jbGFzcyBNYXAge1xuICBwcml2YXRlIF93aWR0aDtcbiAgZ2V0IHdpZHRoKCkge1xuICAgIHJldHVybiB0aGlzLl93aWR0aDtcbiAgfVxuICBwcml2YXRlIF9oZWlnaHQ7XG4gIGdldCBoZWlnaHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hlaWdodDtcbiAgfVxuICBwdWJsaWMgdGlsZXM6IFRpbGVbXVtdO1xuXG4gIGNvbnN0cnVjdG9yKHc6IG51bWJlciwgaDogbnVtYmVyKSB7XG4gICAgdGhpcy5fd2lkdGggPSB3O1xuICAgIHRoaXMuX2hlaWdodCA9IGg7XG4gICAgdGhpcy50aWxlcyA9IFtdO1xuICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5fd2lkdGg7IHgrKykge1xuICAgICAgdGhpcy50aWxlc1t4XSA9IFtdO1xuICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLl9oZWlnaHQ7IHkrKykge1xuICAgICAgICB0aGlzLnRpbGVzW3hdW3ldID0gVGlsZS5jcmVhdGVUaWxlKFRpbGUuRU1QVFkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldFRpbGUocG9zaXRpb246IENvcmUuUG9zaXRpb24pOiBUaWxlIHtcbiAgICByZXR1cm4gdGhpcy50aWxlc1twb3NpdGlvbi54XVtwb3NpdGlvbi55XTtcbiAgfVxuXG4gIHNldFRpbGUocG9zaXRpb246IENvcmUuUG9zaXRpb24sIHRpbGU6IFRpbGUpIHtcbiAgICB0aGlzLnRpbGVzW3Bvc2l0aW9uLnhdW3Bvc2l0aW9uLnldID0gdGlsZTtcbiAgfVxuXG4gIGZvckVhY2goY2FsbGJhY2s6IChwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbiwgdGlsZTogVGlsZSkgPT4gdm9pZCk6IHZvaWQge1xuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5faGVpZ2h0OyB5KyspIHtcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5fd2lkdGg7IHgrKykge1xuICAgICAgICBjYWxsYmFjayhuZXcgQ29yZS5Qb3NpdGlvbih4LCB5KSwgdGhpcy50aWxlc1t4XVt5XSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaXNXYWxrYWJsZShwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbik6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnRpbGVzW3Bvc2l0aW9uLnhdW3Bvc2l0aW9uLnldLndhbGthYmxlO1xuICB9XG59XG5cbmV4cG9ydCA9IE1hcDtcbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcbmltcG9ydCAqIGFzIEdlbmVyYXRvciBmcm9tICcuL21hcCc7XG5cbmltcG9ydCBNYXAgPSByZXF1aXJlKCcuL01hcCcpO1xuaW1wb3J0IFRpbGUgPSByZXF1aXJlKCcuL1RpbGUnKTtcbmltcG9ydCBHbHlwaCA9IHJlcXVpcmUoJy4vR2x5cGgnKTtcblxuY2xhc3MgTWFwR2VuZXJhdG9yIHtcbiAgcHJpdmF0ZSB3aWR0aDogbnVtYmVyO1xuICBwcml2YXRlIGhlaWdodDogbnVtYmVyO1xuXG4gIHByaXZhdGUgYmFja2dyb3VuZENvbG9yOiBDb3JlLkNvbG9yO1xuICBwcml2YXRlIGZvcmVncm91bmRDb2xvcjogQ29yZS5Db2xvcjtcblxuICBjb25zdHJ1Y3Rvcih3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcblxuICAgIHRoaXMuYmFja2dyb3VuZENvbG9yID0gMHgwMDAwMDA7XG4gICAgdGhpcy5mb3JlZ3JvdW5kQ29sb3IgPSAweGFhYWFhYTtcbiAgfVxuXG4gIHByaXZhdGUgZ2VuZXJhdGVNYXAoKTogbnVtYmVyW11bXSB7XG4gICAgbGV0IGNlbGxzOiBudW1iZXJbXVtdID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeCh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgMSk7XG4gICAgbGV0IHJvb21HZW5lcmF0b3IgPSBuZXcgR2VuZXJhdG9yLlJvb21HZW5lcmF0b3IoY2VsbHMpO1xuXG4gICAgd2hpbGUgKHJvb21HZW5lcmF0b3IuaXRlcmF0ZSgpKSB7XG4gICAgfVxuXG4gICAgY2VsbHMgPSByb29tR2VuZXJhdG9yLmdldE1hcCgpO1xuXG4gICAgbGV0IHN0YXJ0UG9zaXRpb24gPSBHZW5lcmF0b3IuVXRpbHMuZmluZENhcnZlYWJsZVNwb3QoY2VsbHMpO1xuICAgIGxldCBtYXplR2VuZXJhdG9yID0gbnVsbDtcblxuICAgIHdoaWxlIChzdGFydFBvc2l0aW9uICE9PSBudWxsKSB7XG4gICAgICBtYXplR2VuZXJhdG9yID0gbmV3IEdlbmVyYXRvci5NYXplUmVjdXJzaXZlQmFja3RyYWNrR2VuZXJhdG9yKGNlbGxzLCBzdGFydFBvc2l0aW9uKTtcbiAgICAgIHdoaWxlIChtYXplR2VuZXJhdG9yLml0ZXJhdGUoKSkgeyB9XG4gICAgICBjZWxscyA9IG1hemVHZW5lcmF0b3IuZ2V0TWFwKCk7XG4gICAgICBzdGFydFBvc2l0aW9uID0gR2VuZXJhdG9yLlV0aWxzLmZpbmRDYXJ2ZWFibGVTcG90KGNlbGxzKTtcbiAgICB9XG5cbiAgICBjZWxscyA9IG1hemVHZW5lcmF0b3IuZ2V0TWFwKCk7XG5cbiAgICBsZXQgdG9wb2xvZ3lDb21iaW5hdG9yID0gbmV3IEdlbmVyYXRvci5Ub3BvbG9neUNvbWJpbmF0b3IoY2VsbHMpO1xuICAgIHRvcG9sb2d5Q29tYmluYXRvci5pbml0aWFsaXplKCk7XG4gICAgbGV0IHJlbWFpbmluZ1RvcG9sb2dpZXMgPSB0b3BvbG9neUNvbWJpbmF0b3IuY29tYmluZSgpO1xuICAgIGlmIChyZW1haW5pbmdUb3BvbG9naWVzID4gNSkge1xuICAgICAgY29uc29sZS5sb2coJ3JlbWFpbmluZyB0b3BvbG9naWVzJywgcmVtYWluaW5nVG9wb2xvZ2llcyk7XG4gICAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZU1hcCgpO1xuICAgIH1cbiAgICB0b3BvbG9neUNvbWJpbmF0b3IucHJ1bmVEZWFkRW5kcygpO1xuXG4gICAgcmV0dXJuIHRvcG9sb2d5Q29tYmluYXRvci5nZXRNYXAoKTtcbiAgfVxuXG4gIGdlbmVyYXRlKCk6IE1hcCB7XG4gICAgbGV0IG1hcCA9IG5ldyBNYXAodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIGxldCBjZWxscyA9IHRoaXMuZ2VuZXJhdGVNYXAoKTtcblxuICAgIGxldCB0aWxlOiBUaWxlO1xuICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgaWYgKGNlbGxzW3hdW3ldID09PSAwKSB7XG4gICAgICAgICAgdGlsZSA9IFRpbGUuY3JlYXRlVGlsZShUaWxlLkZMT09SKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aWxlID0gVGlsZS5jcmVhdGVUaWxlKFRpbGUuV0FMTCk7XG4gICAgICAgICAgdGlsZS5nbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX0JMT0NLMywgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICAgICAgfVxuICAgICAgICBtYXAuc2V0VGlsZShuZXcgQ29yZS5Qb3NpdGlvbih4LCB5KSwgdGlsZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0V2FsbEdseXBoKHg6IG51bWJlciwgeTogbnVtYmVyLCBjZWxsczogbnVtYmVyW11bXSk6IEdseXBoIHtcbiAgICBsZXQgVyA9ICh4ID4gMCAmJiBjZWxsc1t4IC0gMV1beV0gPT09IDEpO1xuICAgIGxldCBFID0gKHggPCB0aGlzLndpZHRoIC0gMSAmJiBjZWxsc1t4ICsgMV1beV0gPT09IDEpO1xuICAgIGxldCBOID0gKHkgPiAwICYmIGNlbGxzW3hdW3kgLSAxXSA9PT0gMSk7XG4gICAgbGV0IFMgPSAoeSA8IHRoaXMuaGVpZ2h0IC0gMSAmJiBjZWxsc1t4XVt5ICsgMV0gPT09IDEpO1xuXG4gICAgbGV0IGdseXBoID0gbmV3IEdseXBoKEdseXBoLkNIQVJfQ1JPU1MsIHRoaXMuZm9yZWdyb3VuZENvbG9yLCB0aGlzLmJhY2tncm91bmRDb2xvcik7XG4gICAgaWYgKFcgJiYgRSAmJiBTICYmIE4pIHtcbiAgICAgIGdseXBoID0gbmV3IEdseXBoKEdseXBoLkNIQVJfQ1JPU1MsIHRoaXMuZm9yZWdyb3VuZENvbG9yLCB0aGlzLmJhY2tncm91bmRDb2xvcik7XG4gICAgfSBlbHNlIGlmICgoVyB8fCBFKSAmJiAhUyAmJiAhTikge1xuICAgICAgZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9ITElORSwgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9IGVsc2UgaWYgKChTIHx8IE4pICYmICFXICYmICFFKSB7XG4gICAgICBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX1ZMSU5FLCB0aGlzLmZvcmVncm91bmRDb2xvciwgdGhpcy5iYWNrZ3JvdW5kQ29sb3IpO1xuICAgIH0gZWxzZSBpZiAoUyAmJiBFICYmICFXICYmICFOKSB7XG4gICAgICBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX1NFLCB0aGlzLmZvcmVncm91bmRDb2xvciwgdGhpcy5iYWNrZ3JvdW5kQ29sb3IpO1xuICAgIH0gZWxzZSBpZiAoUyAmJiBXICYmICFFICYmICFOKSB7XG4gICAgICBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX1NXLCB0aGlzLmZvcmVncm91bmRDb2xvciwgdGhpcy5iYWNrZ3JvdW5kQ29sb3IpO1xuICAgIH0gZWxzZSBpZiAoTiAmJiBFICYmICFXICYmICFTKSB7XG4gICAgICBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX05FLCB0aGlzLmZvcmVncm91bmRDb2xvciwgdGhpcy5iYWNrZ3JvdW5kQ29sb3IpO1xuICAgIH0gZWxzZSBpZiAoTiAmJiBXICYmICFFICYmICFTKSB7XG4gICAgICBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX05XLCB0aGlzLmZvcmVncm91bmRDb2xvciwgdGhpcy5iYWNrZ3JvdW5kQ29sb3IpO1xuICAgIH0gZWxzZSBpZiAoTiAmJiBXICYmIEUgJiYgIVMpIHtcbiAgICAgIGdseXBoID0gbmV3IEdseXBoKEdseXBoLkNIQVJfVEVFTiwgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9IGVsc2UgaWYgKFMgJiYgVyAmJiBFICYmICFOKSB7XG4gICAgICBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX1RFRVMsIHRoaXMuZm9yZWdyb3VuZENvbG9yLCB0aGlzLmJhY2tncm91bmRDb2xvcik7XG4gICAgfSBlbHNlIGlmIChOICYmIFMgJiYgRSAmJiAhVykge1xuICAgICAgZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9URUVFLCB0aGlzLmZvcmVncm91bmRDb2xvciwgdGhpcy5iYWNrZ3JvdW5kQ29sb3IpO1xuICAgIH0gZWxzZSBpZiAoTiAmJiBTICYmIFcgJiYgIUUpIHtcbiAgICAgIGdseXBoID0gbmV3IEdseXBoKEdseXBoLkNIQVJfVEVFVywgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2x5cGg7XG4gIH1cbn1cblxuZXhwb3J0ID0gTWFwR2VuZXJhdG9yO1xuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuL2NvcmUnO1xuaW1wb3J0ICogYXMgR2VuZXJhdG9yIGZyb20gJy4vbWFwJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9jb21wb25lbnRzJztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4vZW50aXRpZXMnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4vZXZlbnRzJztcblxuaW1wb3J0IEdseXBoID0gcmVxdWlyZSgnLi9HbHlwaCcpO1xuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4vRW5naW5lJyk7XG5pbXBvcnQgQ29uc29sZSA9IHJlcXVpcmUoJy4vQ29uc29sZScpO1xuaW1wb3J0IE1hcCA9IHJlcXVpcmUoJy4vTWFwJyk7XG5pbXBvcnQgVGlsZSA9IHJlcXVpcmUoJy4vVGlsZScpO1xuXG5jbGFzcyBNYXBWaWV3IHtcbiAgcHJpdmF0ZSByZW5kZXJhYmxlRW50aXRpZXM6ICh7Z3VpZDogc3RyaW5nLCByZW5kZXJhYmxlOiBDb21wb25lbnRzLlJlbmRlcmFibGVDb21wb25lbnQsIHBoeXNpY3M6IENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudH0pW107XG4gIHByaXZhdGUgcmVuZGVyYWJsZUl0ZW1zOiAoe2d1aWQ6IHN0cmluZywgcmVuZGVyYWJsZTogQ29tcG9uZW50cy5SZW5kZXJhYmxlQ29tcG9uZW50LCBwaHlzaWNzOiBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnR9KVtdO1xuICBwcml2YXRlIGNvbnNvbGU6IENvbnNvbGU7XG5cbiAgcHJpdmF0ZSB2aWV3RW50aXR5OiBFbnRpdGllcy5FbnRpdHk7XG5cbiAgcHJpdmF0ZSBsaWdodE1hcDogbnVtYmVyW11bXTtcbiAgcHJpdmF0ZSBmb3ZDYWxjdWxhdG9yOiBHZW5lcmF0b3IuRm9WO1xuXG4gIHByaXZhdGUgaGFzU2VlbjogYm9vbGVhbltdW107XG5cbiAgcHJpdmF0ZSBmb2dPZldhckNvbG9yOiBDb3JlLkNvbG9yO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZW5naW5lOiBFbmdpbmUsIHByaXZhdGUgbWFwOiBNYXAsIHByaXZhdGUgd2lkdGg6IG51bWJlciwgcHJpdmF0ZSBoZWlnaHQ6IG51bWJlcikge1xuICAgIHRoaXMuZm9nT2ZXYXJDb2xvciA9IDB4OTk5OWFhO1xuICAgIHRoaXMucmVnaXN0ZXJMaXN0ZW5lcnMoKTtcbiAgICB0aGlzLmNvbnNvbGUgPSBuZXcgQ29uc29sZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgdGhpcy5yZW5kZXJhYmxlRW50aXRpZXMgPSBbXTtcbiAgICB0aGlzLnJlbmRlcmFibGVJdGVtcyA9IFtdO1xuICAgIHRoaXMudmlld0VudGl0eSA9IG51bGw7XG4gICAgdGhpcy5mb3ZDYWxjdWxhdG9yID0gbnVsbDtcbiAgICB0aGlzLmxpZ2h0TWFwID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeDxudW1iZXI+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCAwKTtcbiAgICB0aGlzLmhhc1NlZW4gPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4PGJvb2xlYW4+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCBmYWxzZSk7XG4gIH1cblxuICBzZXRWaWV3RW50aXR5KGVudGl0eTogRW50aXRpZXMuRW50aXR5KSB7XG4gICAgdGhpcy5oYXNTZWVuID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeDxib29sZWFuPih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgZmFsc2UpO1xuXG4gICAgdGhpcy52aWV3RW50aXR5ID0gZW50aXR5O1xuICAgIHRoaXMudmlld0VudGl0eS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdtb3ZlJyxcbiAgICAgIHRoaXMub25WaWV3RW50aXR5TW92ZS5iaW5kKHRoaXMpXG4gICAgKSk7XG5cbiAgICB0aGlzLmZvdkNhbGN1bGF0b3IgPSBuZXcgR2VuZXJhdG9yLkZvVihcbiAgICAgIChwb3M6IENvcmUuUG9zaXRpb24pID0+IHtcbiAgICAgICAgbGV0IHRpbGUgPSB0aGlzLm1hcC5nZXRUaWxlKHBvcyk7XG4gICAgICAgIHJldHVybiAhdGlsZS5ibG9ja3NTaWdodDsgIFxuICAgICAgfSxcbiAgICAgIHRoaXMubWFwLndpZHRoLFxuICAgICAgdGhpcy5tYXAuaGVpZ2h0LFxuICAgICAgMjAgXG4gICAgKTtcblxuICAgIHRoaXMub25WaWV3RW50aXR5TW92ZShudWxsKTtcbiAgfVxuXG4gIHByaXZhdGUgb25WaWV3RW50aXR5TW92ZShldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgbGV0IHBvczogQ29yZS5Qb3NpdGlvbiA9ICg8Q29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50PnRoaXMudmlld0VudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KSkucG9zaXRpb247XG5cbiAgICB0aGlzLmxpZ2h0TWFwID0gdGhpcy5mb3ZDYWxjdWxhdG9yLmNhbGN1bGF0ZShwb3MpO1xuXG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICBpZiAodGhpcy5saWdodE1hcFt4XVt5XSA+IDApIHtcbiAgICAgICAgICB0aGlzLmhhc1NlZW5beF1beV0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdyZW5kZXJhYmxlQ29tcG9uZW50Q3JlYXRlZCcsXG4gICAgICB0aGlzLm9uUmVuZGVyYWJsZUNvbXBvbmVudENyZWF0ZWQuYmluZCh0aGlzKVxuICAgICkpO1xuICAgIHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ3JlbmRlcmFibGVDb21wb25lbnREZXN0cm95ZWQnLFxuICAgICAgdGhpcy5vblJlbmRlcmFibGVDb21wb25lbnREZXN0cm95ZWQuYmluZCh0aGlzKVxuICAgICkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvblJlbmRlcmFibGVDb21wb25lbnREZXN0cm95ZWQoZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGNvbnN0IHBoeXNpY3MgPSA8Q29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50PmV2ZW50LmRhdGEuZW50aXR5LmdldENvbXBvbmVudChDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQpO1xuICAgIGxldCBpZHggPSBudWxsO1xuXG4gICAgaWYgKHBoeXNpY3MuYmxvY2tpbmcpIHtcbiAgICAgIGlkeCA9IHRoaXMucmVuZGVyYWJsZUVudGl0aWVzLmZpbmRJbmRleCgoZW50aXR5KSA9PiB7XG4gICAgICAgIHJldHVybiBlbnRpdHkuZ3VpZCA9PT0gZXZlbnQuZGF0YS5lbnRpdHkuZ3VpZDtcbiAgICAgIH0pO1xuICAgICAgaWYgKGlkeCAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnJlbmRlcmFibGVFbnRpdGllcy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWR4ID0gdGhpcy5yZW5kZXJhYmxlSXRlbXMuZmluZEluZGV4KChlbnRpdHkpID0+IHtcbiAgICAgICAgcmV0dXJuIGVudGl0eS5ndWlkID09PSBldmVudC5kYXRhLmVudGl0eS5ndWlkO1xuICAgICAgfSk7XG4gICAgICBpZiAoaWR4ICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMucmVuZGVyYWJsZUl0ZW1zLnNwbGljZShpZHgsIDEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25SZW5kZXJhYmxlQ29tcG9uZW50Q3JlYXRlZChldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgY29uc3QgcGh5c2ljcyA9IDxDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ+ZXZlbnQuZGF0YS5lbnRpdHkuZ2V0Q29tcG9uZW50KENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCk7XG5cbiAgICBpZiAocGh5c2ljcy5ibG9ja2luZykge1xuICAgICAgdGhpcy5yZW5kZXJhYmxlRW50aXRpZXMucHVzaCh7XG4gICAgICAgIGd1aWQ6IGV2ZW50LmRhdGEuZW50aXR5Lmd1aWQsXG4gICAgICAgIHJlbmRlcmFibGU6IGV2ZW50LmRhdGEucmVuZGVyYWJsZUNvbXBvbmVudCxcbiAgICAgICAgcGh5c2ljczogcGh5c2ljc1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVuZGVyYWJsZUl0ZW1zLnB1c2goe1xuICAgICAgICBndWlkOiBldmVudC5kYXRhLmVudGl0eS5ndWlkLFxuICAgICAgICByZW5kZXJhYmxlOiBldmVudC5kYXRhLnJlbmRlcmFibGVDb21wb25lbnQsXG4gICAgICAgIHBoeXNpY3M6IHBoeXNpY3NcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcihibGl0RnVuY3Rpb246IGFueSkge1xuICAgIHRoaXMucmVuZGVyTWFwKHRoaXMuY29uc29sZSk7XG4gICAgYmxpdEZ1bmN0aW9uKHRoaXMuY29uc29sZSk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlck1hcChjb25zb2xlOiBDb25zb2xlKSB7XG4gICAgaWYgKHRoaXMudmlld0VudGl0eSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnJlbmRlckJhY2tncm91bmQoY29uc29sZSk7XG4gICAgdGhpcy5yZW5kZXJJdGVtcyhjb25zb2xlKTtcbiAgICB0aGlzLnJlbmRlckVudGl0aWVzKGNvbnNvbGUpO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJFbnRpdGllcyhjb25zb2xlOiBDb25zb2xlKSB7XG4gICAgdGhpcy5yZW5kZXJhYmxlRW50aXRpZXMuZm9yRWFjaCgoZGF0YSkgPT4ge1xuICAgICAgaWYgKGRhdGEucmVuZGVyYWJsZSAmJiBkYXRhLnBoeXNpY3MpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJHbHlwaChjb25zb2xlLCBkYXRhLnJlbmRlcmFibGUuZ2x5cGgsIGRhdGEucGh5c2ljcy5wb3NpdGlvbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckl0ZW1zKGNvbnNvbGU6IENvbnNvbGUpIHtcbiAgICB0aGlzLnJlbmRlcmFibGVJdGVtcy5mb3JFYWNoKChkYXRhKSA9PiB7XG4gICAgICBpZiAoZGF0YS5yZW5kZXJhYmxlICYmIGRhdGEucGh5c2ljcykge1xuICAgICAgICB0aGlzLnJlbmRlckdseXBoKGNvbnNvbGUsIGRhdGEucmVuZGVyYWJsZS5nbHlwaCwgZGF0YS5waHlzaWNzLnBvc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyR2x5cGgoY29uc29sZTogQ29uc29sZSwgZ2x5cGg6IEdseXBoLCBwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbikge1xuICAgIGlmICghdGhpcy5pc1Zpc2libGUocG9zaXRpb24pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnNvbGUuc2V0VGV4dChnbHlwaC5nbHlwaCwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XG4gICAgY29uc29sZS5zZXRGb3JlZ3JvdW5kKGdseXBoLmZvcmVncm91bmRDb2xvciwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckJhY2tncm91bmQoY29uc29sZTogQ29uc29sZSkge1xuICAgIHRoaXMubWFwLmZvckVhY2goKHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uLCB0aWxlOiBUaWxlKSA9PiB7XG4gICAgICBsZXQgZ2x5cGggPSB0aWxlLmdseXBoO1xuICAgICAgaWYgKCF0aGlzLmlzVmlzaWJsZShwb3NpdGlvbikpIHtcbiAgICAgICAgaWYgKHRoaXMuaGFzU2Vlbltwb3NpdGlvbi54XVtwb3NpdGlvbi55XSkge1xuICAgICAgICAgIGdseXBoID0gbmV3IEdseXBoKFxuICAgICAgICAgICAgZ2x5cGguZ2x5cGgsXG4gICAgICAgICAgICBDb3JlLkNvbG9yVXRpbHMuY29sb3JNdWx0aXBseShnbHlwaC5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuZm9nT2ZXYXJDb2xvciksXG4gICAgICAgICAgICBDb3JlLkNvbG9yVXRpbHMuY29sb3JNdWx0aXBseShnbHlwaC5iYWNrZ3JvdW5kQ29sb3IsIHRoaXMuZm9nT2ZXYXJDb2xvcilcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGdseXBoID0gbmV3IEdseXBoKEdseXBoLkNIQVJfRlVMTCwgMHgxMTExMTEsIDB4MTExMTExKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc29sZS5zZXRUZXh0KGdseXBoLmdseXBoLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcbiAgICAgIGNvbnNvbGUuc2V0Rm9yZWdyb3VuZChnbHlwaC5mb3JlZ3JvdW5kQ29sb3IsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xuICAgICAgY29uc29sZS5zZXRCYWNrZ3JvdW5kKGdseXBoLmJhY2tncm91bmRDb2xvciwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGlzVmlzaWJsZShwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbikge1xuICAgIHJldHVybiB0aGlzLmxpZ2h0TWFwW3Bvc2l0aW9uLnhdW3Bvc2l0aW9uLnldID09PSAxO1xuICB9XG59XG5cbmV4cG9ydCA9IE1hcFZpZXc7XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPScuLi90eXBpbmdzL2luZGV4LmQudHMnIC8+XG5cbmltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcblxuaW1wb3J0IEdseXBoID0gcmVxdWlyZSgnLi9HbHlwaCcpO1xuaW1wb3J0IENvbnNvbGUgPSByZXF1aXJlKCcuL0NvbnNvbGUnKTtcblxuY2xhc3MgUGl4aUNvbnNvbGUge1xuICBwcml2YXRlIF93aWR0aDogbnVtYmVyO1xuICBwcml2YXRlIF9oZWlnaHQ6IG51bWJlcjtcblxuICBwcml2YXRlIGNhbnZhc0lkOiBzdHJpbmc7XG4gIHByaXZhdGUgdGV4dDogbnVtYmVyW11bXTtcbiAgcHJpdmF0ZSBmb3JlOiBDb3JlLkNvbG9yW11bXTtcbiAgcHJpdmF0ZSBiYWNrOiBDb3JlLkNvbG9yW11bXTtcbiAgcHJpdmF0ZSBpc0RpcnR5OiBib29sZWFuW11bXTtcblxuICBwcml2YXRlIHJlbmRlcmVyOiBhbnk7XG4gIHByaXZhdGUgc3RhZ2U6IFBJWEkuQ29udGFpbmVyO1xuXG4gIHByaXZhdGUgbG9hZGVkOiBib29sZWFuO1xuXG4gIHByaXZhdGUgY2hhcldpZHRoOiBudW1iZXI7XG4gIHByaXZhdGUgY2hhckhlaWdodDogbnVtYmVyO1xuXG4gIHByaXZhdGUgZm9udDogUElYSS5CYXNlVGV4dHVyZTtcbiAgcHJpdmF0ZSBjaGFyczogUElYSS5UZXh0dXJlW107XG5cbiAgcHJpdmF0ZSBmb3JlQ2VsbHM6IFBJWEkuU3ByaXRlW11bXTtcbiAgcHJpdmF0ZSBiYWNrQ2VsbHM6IFBJWEkuU3ByaXRlW11bXTtcblxuICBwcml2YXRlIGRlZmF1bHRCYWNrZ3JvdW5kOiBDb3JlLkNvbG9yO1xuICBwcml2YXRlIGRlZmF1bHRGb3JlZ3JvdW5kOiBDb3JlLkNvbG9yO1xuXG4gIHByaXZhdGUgY2FudmFzOiBhbnk7XG4gIHByaXZhdGUgdG9wTGVmdFBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBjYW52YXNJZDogc3RyaW5nLCBmb3JlZ3JvdW5kOiBDb3JlLkNvbG9yID0gMHhmZmZmZmYsIGJhY2tncm91bmQ6IENvcmUuQ29sb3IgPSAweDAwMDAwMCkge1xuICAgIHRoaXMuX3dpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5faGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgdGhpcy5jYW52YXNJZCA9IGNhbnZhc0lkO1xuXG4gICAgdGhpcy5sb2FkZWQgPSBmYWxzZTtcbiAgICB0aGlzLnN0YWdlID0gbmV3IFBJWEkuQ29udGFpbmVyKCk7XG5cbiAgICB0aGlzLmxvYWRGb250KCk7XG4gICAgdGhpcy5kZWZhdWx0QmFja2dyb3VuZCA9IDB4MDAwMDA7XG4gICAgdGhpcy5kZWZhdWx0Rm9yZWdyb3VuZCA9IDB4ZmZmZmY7XG5cbiAgICB0aGlzLnRleHQgPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4PG51bWJlcj4odGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIEdseXBoLkNIQVJfU1BBQ0UpO1xuICAgIHRoaXMuZm9yZSA9IENvcmUuVXRpbHMuYnVpbGRNYXRyaXg8Q29yZS5Db2xvcj4odGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIHRoaXMuZGVmYXVsdEZvcmVncm91bmQpO1xuICAgIHRoaXMuYmFjayA9IENvcmUuVXRpbHMuYnVpbGRNYXRyaXg8Q29yZS5Db2xvcj4odGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIHRoaXMuZGVmYXVsdEJhY2tncm91bmQpO1xuICAgIHRoaXMuaXNEaXJ0eSA9IENvcmUuVXRpbHMuYnVpbGRNYXRyaXg8Ym9vbGVhbj4odGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIHRydWUpO1xuICB9XG5cbiAgZ2V0IGhlaWdodCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9oZWlnaHQ7XG4gIH1cblxuICBnZXQgd2lkdGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fd2lkdGg7XG4gIH1cblxuICBwcml2YXRlIGxvYWRGb250KCkge1xuICAgIC8vbGV0IGZvbnRVcmwgPSAnLi90ZXJtaW5hbDE2eDE2LnBuZyc7XG4gICAgbGV0IGZvbnRVcmwgPSAnLi9UYWxyeXRoX3NxdWFyZV8xNXgxNS5wbmcnO1xuICAgIHRoaXMuZm9udCA9IFBJWEkuQmFzZVRleHR1cmUuZnJvbUltYWdlKGZvbnRVcmwsIGZhbHNlLCBQSVhJLlNDQUxFX01PREVTLk5FQVJFU1QpO1xuICAgIGlmICh0aGlzLmZvbnQuaGFzTG9hZGVkKSB7XG4gICAgICB0aGlzLm9uRm9udExvYWRlZCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZvbnQub24oJ2xvYWRlZCcsIHRoaXMub25Gb250TG9hZGVkLmJpbmQodGhpcykpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25Gb250TG9hZGVkKCkge1xuICAgIHRoaXMuY2hhcldpZHRoID0gdGhpcy5mb250LndpZHRoIC8gMTY7XG4gICAgdGhpcy5jaGFySGVpZ2h0ID0gdGhpcy5mb250LmhlaWdodCAvIDE2O1xuXG4gICAgdGhpcy5pbml0Q2FudmFzKCk7XG4gICAgdGhpcy5pbml0Q2hhcmFjdGVyTWFwKCk7XG4gICAgdGhpcy5pbml0QmFja2dyb3VuZENlbGxzKCk7XG4gICAgdGhpcy5pbml0Rm9yZWdyb3VuZENlbGxzKCk7XG4gICAgdGhpcy5hZGRHcmlkT3ZlcmxheSgpXG4gICAgdGhpcy5sb2FkZWQgPSB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0Q2FudmFzKCkge1xuICAgIGxldCBjYW52YXNXaWR0aCA9IHRoaXMud2lkdGggKiB0aGlzLmNoYXJXaWR0aDtcbiAgICBsZXQgY2FudmFzSGVpZ2h0ID0gdGhpcy5oZWlnaHQgKiB0aGlzLmNoYXJIZWlnaHQ7XG5cbiAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuY2FudmFzSWQpO1xuXG4gICAgbGV0IHBpeGlPcHRpb25zID0ge1xuICAgICAgYW50aWFsaWFzOiBmYWxzZSxcbiAgICAgIGNsZWFyQmVmb3JlUmVuZGVyOiBmYWxzZSxcbiAgICAgIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjogZmFsc2UsXG4gICAgICByZXNvbHV0aW9uOiAxLFxuICAgICAgdHJhbnNwYXJlbnQ6IGZhbHNlLFxuICAgICAgYmFja2dyb3VuZENvbG9yOiBDb3JlLkNvbG9yVXRpbHMudG9OdW1iZXIodGhpcy5kZWZhdWx0QmFja2dyb3VuZCksXG4gICAgICB2aWV3OiB0aGlzLmNhbnZhc1xuICAgIH07XG4gICAgdGhpcy5yZW5kZXJlciA9IFBJWEkuYXV0b0RldGVjdFJlbmRlcmVyKGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQsIHBpeGlPcHRpb25zKTtcbiAgICB0aGlzLnJlbmRlcmVyLmJhY2tncm91bmRDb2xvciA9IENvcmUuQ29sb3JVdGlscy50b051bWJlcih0aGlzLmRlZmF1bHRCYWNrZ3JvdW5kKTtcbiAgICB0aGlzLnRvcExlZnRQb3NpdGlvbiA9IG5ldyBDb3JlLlBvc2l0aW9uKHRoaXMuY2FudmFzLm9mZnNldExlZnQsIHRoaXMuY2FudmFzLm9mZnNldFRvcCk7XG4gIH1cblxuICBwcml2YXRlIGluaXRDaGFyYWN0ZXJNYXAoKSB7XG4gICAgdGhpcy5jaGFycyA9IFtdO1xuICAgIGZvciAoIGxldCB4ID0gMDsgeCA8IDE2OyB4KyspIHtcbiAgICAgIGZvciAoIGxldCB5ID0gMDsgeSA8IDE2OyB5KyspIHtcbiAgICAgICAgbGV0IHJlY3QgPSBuZXcgUElYSS5SZWN0YW5nbGUoeCAqIHRoaXMuY2hhcldpZHRoLCB5ICogdGhpcy5jaGFySGVpZ2h0LCB0aGlzLmNoYXJXaWR0aCwgdGhpcy5jaGFySGVpZ2h0KTtcbiAgICAgICAgdGhpcy5jaGFyc1t4ICsgeSAqIDE2XSA9IG5ldyBQSVhJLlRleHR1cmUodGhpcy5mb250LCByZWN0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGluaXRCYWNrZ3JvdW5kQ2VsbHMoKSB7XG4gICAgdGhpcy5iYWNrQ2VsbHMgPSBbXTtcbiAgICBmb3IgKCBsZXQgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgIHRoaXMuYmFja0NlbGxzW3hdID0gW107XG4gICAgICBmb3IgKCBsZXQgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgIGxldCBjZWxsID0gbmV3IFBJWEkuU3ByaXRlKHRoaXMuY2hhcnNbR2x5cGguQ0hBUl9GVUxMXSk7XG4gICAgICAgIGNlbGwucG9zaXRpb24ueCA9IHggKiB0aGlzLmNoYXJXaWR0aDtcbiAgICAgICAgY2VsbC5wb3NpdGlvbi55ID0geSAqIHRoaXMuY2hhckhlaWdodDtcbiAgICAgICAgY2VsbC53aWR0aCA9IHRoaXMuY2hhcldpZHRoO1xuICAgICAgICBjZWxsLmhlaWdodCA9IHRoaXMuY2hhckhlaWdodDtcbiAgICAgICAgY2VsbC50aW50ID0gQ29yZS5Db2xvclV0aWxzLnRvTnVtYmVyKHRoaXMuZGVmYXVsdEJhY2tncm91bmQpO1xuICAgICAgICB0aGlzLmJhY2tDZWxsc1t4XVt5XSA9IGNlbGw7XG4gICAgICAgIHRoaXMuc3RhZ2UuYWRkQ2hpbGQoY2VsbCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBpbml0Rm9yZWdyb3VuZENlbGxzKCkge1xuICAgIHRoaXMuZm9yZUNlbGxzID0gW107XG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgIHRoaXMuZm9yZUNlbGxzW3hdID0gW107XG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgbGV0IGNlbGwgPSBuZXcgUElYSS5TcHJpdGUodGhpcy5jaGFyc1tHbHlwaC5DSEFSX1NQQUNFXSk7XG4gICAgICAgIGNlbGwucG9zaXRpb24ueCA9IHggKiB0aGlzLmNoYXJXaWR0aDtcbiAgICAgICAgY2VsbC5wb3NpdGlvbi55ID0geSAqIHRoaXMuY2hhckhlaWdodDtcbiAgICAgICAgY2VsbC53aWR0aCA9IHRoaXMuY2hhcldpZHRoO1xuICAgICAgICBjZWxsLmhlaWdodCA9IHRoaXMuY2hhckhlaWdodDtcbiAgICAgICAgY2VsbC50aW50ID0gQ29yZS5Db2xvclV0aWxzLnRvTnVtYmVyKHRoaXMuZGVmYXVsdEZvcmVncm91bmQpO1xuICAgICAgICB0aGlzLmZvcmVDZWxsc1t4XVt5XSA9IGNlbGw7XG4gICAgICAgIHRoaXMuc3RhZ2UuYWRkQ2hpbGQoY2VsbCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhZGRHcmlkT3ZlcmxheSgpIHtcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgIGxldCBjZWxsID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgICAgICAgY2VsbC5saW5lU3R5bGUoMSwgMHg0NDQ0NDQsIDAuNSk7XG4gICAgICAgIGNlbGwuYmVnaW5GaWxsKDAsIDApO1xuICAgICAgICBjZWxsLmRyYXdSZWN0KHggKiB0aGlzLmNoYXJXaWR0aCwgeSAqIHRoaXMuY2hhckhlaWdodCwgdGhpcy5jaGFyV2lkdGgsIHRoaXMuY2hhckhlaWdodCk7XG4gICAgICAgIHRoaXMuc3RhZ2UuYWRkQ2hpbGQoY2VsbCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGlmICh0aGlzLmxvYWRlZCkge1xuICAgICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zdGFnZSk7XG4gICAgfVxuICB9XG5cbiAgYmxpdChjb25zb2xlOiBDb25zb2xlLCBvZmZzZXRYOiBudW1iZXIgPSAwLCBvZmZzZXRZOiBudW1iZXIgPSAwLCBmb3JjZURpcnR5OiBib29sZWFuID0gZmFsc2UpIHtcbiAgICBpZiAoIXRoaXMubG9hZGVkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZvciAobGV0IHggPSAwOyB4IDwgY29uc29sZS53aWR0aDsgeCsrKSB7XG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IGNvbnNvbGUuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgaWYgKGZvcmNlRGlydHkgfHwgY29uc29sZS5pc0RpcnR5W3hdW3ldKSB7XG4gICAgICAgICAgbGV0IGFzY2lpID0gY29uc29sZS50ZXh0W3hdW3ldO1xuICAgICAgICAgIGxldCBweCA9IG9mZnNldFggKyB4O1xuICAgICAgICAgIGxldCBweSA9IG9mZnNldFkgKyB5O1xuICAgICAgICAgIGlmIChhc2NpaSA+IDAgJiYgYXNjaWkgPD0gMjU1KSB7XG4gICAgICAgICAgICB0aGlzLmZvcmVDZWxsc1tweF1bcHldLnRleHR1cmUgPSB0aGlzLmNoYXJzW2FzY2lpXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5mb3JlQ2VsbHNbcHhdW3B5XS50aW50ID0gQ29yZS5Db2xvclV0aWxzLnRvTnVtYmVyKGNvbnNvbGUuZm9yZVt4XVt5XSk7XG4gICAgICAgICAgdGhpcy5iYWNrQ2VsbHNbcHhdW3B5XS50aW50ID0gQ29yZS5Db2xvclV0aWxzLnRvTnVtYmVyKGNvbnNvbGUuYmFja1t4XVt5XSk7XG4gICAgICAgICAgY29uc29sZS5jbGVhbkNlbGwoeCwgeSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRQb3NpdGlvbkZyb21QaXhlbHMoeDogbnVtYmVyLCB5OiBudW1iZXIpIDogQ29yZS5Qb3NpdGlvbiB7XG4gICAgaWYgKCF0aGlzLmxvYWRlZCkge1xuICAgICAgcmV0dXJuIG5ldyBDb3JlLlBvc2l0aW9uKC0xLCAtMSk7XG4gICAgfSBcbiAgICBsZXQgZHg6IG51bWJlciA9IHggLSB0aGlzLnRvcExlZnRQb3NpdGlvbi54O1xuICAgIGxldCBkeTogbnVtYmVyID0geSAtIHRoaXMudG9wTGVmdFBvc2l0aW9uLnk7XG4gICAgbGV0IHJ4ID0gTWF0aC5mbG9vcihkeCAvIHRoaXMuY2hhcldpZHRoKTtcbiAgICBsZXQgcnkgPSBNYXRoLmZsb29yKGR5IC8gdGhpcy5jaGFySGVpZ2h0KTtcbiAgICByZXR1cm4gbmV3IENvcmUuUG9zaXRpb24ocngsIHJ5KTtcbiAgfVxufVxuXG5leHBvcnQgPSBQaXhpQ29uc29sZTtcbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcbmltcG9ydCAqIGFzIEdlbmVyYXRvciBmcm9tICcuL21hcCc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2NvbXBvbmVudHMnO1xuaW1wb3J0ICogYXMgRW50aXRpZXMgZnJvbSAnLi9lbnRpdGllcyc7XG5pbXBvcnQgKiBhcyBFeGNlcHRpb25zIGZyb20gJy4vRXhjZXB0aW9ucyc7XG5cbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuL0VuZ2luZScpO1xuaW1wb3J0IENvbnNvbGUgPSByZXF1aXJlKCcuL0NvbnNvbGUnKTtcbmltcG9ydCBNYXBHZW5lcmF0b3IgPSByZXF1aXJlKCcuL01hcEdlbmVyYXRvcicpO1xuaW1wb3J0IE1hcCA9IHJlcXVpcmUoJy4vTWFwJyk7XG5pbXBvcnQgVGlsZSA9IHJlcXVpcmUoJy4vVGlsZScpO1xuaW1wb3J0IEdseXBoID0gcmVxdWlyZSgnLi9HbHlwaCcpO1xuXG5pbXBvcnQgTWFwVmlldyA9IHJlcXVpcmUoJy4vTWFwVmlldycpO1xuaW1wb3J0IExvZ1ZpZXcgPSByZXF1aXJlKCcuL0xvZ1ZpZXcnKTtcblxuY2xhc3MgU2NlbmUge1xuICBwcml2YXRlIF9lbmdpbmU6IEVuZ2luZTtcbiAgZ2V0IGVuZ2luZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5naW5lO1xuICB9XG5cbiAgcHJpdmF0ZSBfbWFwOiBNYXA7XG4gIGdldCBtYXAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcDtcbiAgfVxuXG4gIHByaXZhdGUgd2lkdGg6IG51bWJlcjtcbiAgcHJpdmF0ZSBoZWlnaHQ6IG51bWJlcjtcblxuICBwcml2YXRlIGxvZ1ZpZXc6IExvZ1ZpZXc7XG4gIHByaXZhdGUgbWFwVmlldzogTWFwVmlldztcblxuICBwcml2YXRlIHBsYXllcjogRW50aXRpZXMuRW50aXR5O1xuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgIHRoaXMuX2VuZ2luZSA9IGVuZ2luZTtcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIENvcmUuUG9zaXRpb24uc2V0TWF4VmFsdWVzKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0IC0gNSk7XG4gICAgbGV0IG1hcEdlbmVyYXRvciA9IG5ldyBNYXBHZW5lcmF0b3IodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQgLSA1KTtcbiAgICB0aGlzLl9tYXAgPSBtYXBHZW5lcmF0b3IuZ2VuZXJhdGUoKTtcblxuICAgIHRoaXMucmVnaXN0ZXJMaXN0ZW5lcnMoKTtcblxuICAgIHRoaXMubWFwVmlldyA9IG5ldyBNYXBWaWV3KHRoaXMuZW5naW5lLCB0aGlzLm1hcCwgdGhpcy5tYXAud2lkdGgsIHRoaXMubWFwLmhlaWdodCk7XG5cbiAgICB0aGlzLmdlbmVyYXRlV2lseSgpO1xuICAgIHRoaXMuZ2VuZXJhdGVSYXRzKCk7XG5cbiAgICB0aGlzLmxvZ1ZpZXcgPSBuZXcgTG9nVmlldyh0aGlzLmVuZ2luZSwgdGhpcy53aWR0aCwgNSwgdGhpcy5wbGF5ZXIpO1xuXG4gICAgdGhpcy5tYXBWaWV3LnNldFZpZXdFbnRpdHkodGhpcy5wbGF5ZXIpO1xuXG4gIH1cblxuICBwcml2YXRlIGdlbmVyYXRlV2lseSgpIHtcbiAgICB0aGlzLnBsYXllciA9IEVudGl0aWVzLmNyZWF0ZVdpbHkodGhpcy5lbmdpbmUpO1xuICAgIHRoaXMucG9zaXRpb25FbnRpdHkodGhpcy5wbGF5ZXIpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZW5lcmF0ZVJhdHMobnVtOiBudW1iZXIgPSAxMCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtOyBpKyspIHtcbiAgICAgIHRoaXMuZ2VuZXJhdGVSYXQoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdlbmVyYXRlUmF0KCkge1xuICAgIHRoaXMucG9zaXRpb25FbnRpdHkoRW50aXRpZXMuY3JlYXRlUmF0KHRoaXMuZW5naW5lKSk7XG4gIH1cblxuICBwcml2YXRlIHBvc2l0aW9uRW50aXR5KGVudGl0eTogRW50aXRpZXMuRW50aXR5KSB7XG4gICAgbGV0IGNvbXBvbmVudCA9IDxDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudChDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQpO1xuICAgIGxldCBwb3NpdGlvbmVkID0gZmFsc2U7XG4gICAgbGV0IHRyaWVzID0gMDtcbiAgICBsZXQgcG9zaXRpb24gPSBudWxsO1xuICAgIHdoaWxlICh0cmllcyA8IDEwMDAgJiYgIXBvc2l0aW9uZWQpIHtcbiAgICAgIHBvc2l0aW9uID0gQ29yZS5Qb3NpdGlvbi5nZXRSYW5kb20oKTtcbiAgICAgIHBvc2l0aW9uZWQgPSB0aGlzLmlzV2l0aG91dEVudGl0eShwb3NpdGlvbik7XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uZWQpIHtcbiAgICAgIGNvbXBvbmVudC5tb3ZlVG8ocG9zaXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAnaXNXaXRob3V0RW50aXR5JywgXG4gICAgICB0aGlzLm9uSXNXaXRob3V0RW50aXR5LmJpbmQodGhpcylcbiAgICApKTtcbiAgICB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdtb3ZlZEZyb20nLCBcbiAgICAgIHRoaXMub25Nb3ZlZEZyb20uYmluZCh0aGlzKVxuICAgICkpO1xuICAgIHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ21vdmVkVG8nLCBcbiAgICAgIHRoaXMub25Nb3ZlZFRvLmJpbmQodGhpcylcbiAgICApKTtcbiAgICB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdnZXRUaWxlJywgXG4gICAgICB0aGlzLm9uR2V0VGlsZS5iaW5kKHRoaXMpXG4gICAgKSk7XG4gIH1cblxuICBwcml2YXRlIG9uR2V0VGlsZShldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgbGV0IHBvc2l0aW9uID0gZXZlbnQuZGF0YS5wb3NpdGlvbjtcbiAgICByZXR1cm4gdGhpcy5tYXAuZ2V0VGlsZShwb3NpdGlvbik7XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZWRGcm9tKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBsZXQgdGlsZSA9IHRoaXMubWFwLmdldFRpbGUoZXZlbnQuZGF0YS5waHlzaWNzQ29tcG9uZW50LnBvc2l0aW9uKTtcbiAgICBpZiAoIWV2ZW50LmRhdGEucGh5c2ljc0NvbXBvbmVudC5ibG9ja2luZykge1xuICAgICAgZGVsZXRlIHRpbGUucHJvcHNbZXZlbnQuZGF0YS5lbnRpdHkuZ3VpZF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRpbGUuZW50aXR5ID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZWRUbyhldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgbGV0IHRpbGUgPSB0aGlzLm1hcC5nZXRUaWxlKGV2ZW50LmRhdGEucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbik7XG4gICAgaWYgKCFldmVudC5kYXRhLnBoeXNpY3NDb21wb25lbnQuYmxvY2tpbmcpIHtcbiAgICAgIHRpbGUucHJvcHNbZXZlbnQuZGF0YS5lbnRpdHkuZ3VpZF0gPSBldmVudC5kYXRhLmVudGl0eTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRpbGUuZW50aXR5KSB7XG4gICAgICAgIHRocm93IG5ldyBFeGNlcHRpb25zLkVudGl0eU92ZXJsYXBFcnJvcignVHdvIGVudGl0aWVzIGNhbm5vdCBiZSBhdCB0aGUgc2FtZSBzcG90Jyk7XG4gICAgICB9XG4gICAgICB0aWxlLmVudGl0eSA9IGV2ZW50LmRhdGEuZW50aXR5O1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25Jc1dpdGhvdXRFbnRpdHkoZXZlbnQ6IEV2ZW50cy5FdmVudCk6IGJvb2xlYW4ge1xuICAgIGxldCBwb3NpdGlvbiA9IGV2ZW50LmRhdGEucG9zaXRpb247XG4gICAgcmV0dXJuIHRoaXMuaXNXaXRob3V0RW50aXR5KHBvc2l0aW9uKTtcbiAgfVxuXG4gIHByaXZhdGUgaXNXaXRob3V0RW50aXR5KHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uKTogYm9vbGVhbiB7XG4gICAgbGV0IHRpbGUgPSB0aGlzLm1hcC5nZXRUaWxlKHBvc2l0aW9uKTtcbiAgICByZXR1cm4gdGlsZS53YWxrYWJsZSAmJiB0aWxlLmVudGl0eSA9PT0gbnVsbDtcbiAgfVxuXG4gIHJlbmRlcihibGl0RnVuY3Rpb246IGFueSk6IHZvaWQge1xuICAgIHRoaXMubWFwVmlldy5yZW5kZXIoKGNvbnNvbGU6IENvbnNvbGUpID0+IHtcbiAgICAgIGJsaXRGdW5jdGlvbihjb25zb2xlLCAwLCAwKTtcbiAgICB9KTtcbiAgICB0aGlzLmxvZ1ZpZXcucmVuZGVyKChjb25zb2xlOiBDb25zb2xlKSA9PiB7XG4gICAgICBibGl0RnVuY3Rpb24oY29uc29sZSwgMCwgdGhpcy5oZWlnaHQgLSA1KTtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgPSBTY2VuZTtcbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4vZW50aXRpZXMnO1xuXG5pbXBvcnQgR2x5cGggPSByZXF1aXJlKCcuL0dseXBoJyk7XG5cbmludGVyZmFjZSBUaWxlRGVzY3JpcHRpb24ge1xuICBnbHlwaDogR2x5cGg7XG4gIHdhbGthYmxlOiBib29sZWFuO1xuICBibG9ja3NTaWdodDogYm9vbGVhbjtcbn1cblxuY2xhc3MgVGlsZSB7XG4gIHB1YmxpYyBnbHlwaDogR2x5cGg7XG4gIHB1YmxpYyB3YWxrYWJsZTogYm9vbGVhbjtcbiAgcHVibGljIGJsb2Nrc1NpZ2h0OiBib29sZWFuO1xuICBwdWJsaWMgZW50aXR5OiBFbnRpdGllcy5FbnRpdHk7XG4gIHB1YmxpYyBwcm9wczoge1tndWlkOiBzdHJpbmddOiBFbnRpdGllcy5FbnRpdHl9O1xuXG4gIHB1YmxpYyBzdGF0aWMgRU1QVFk6IFRpbGVEZXNjcmlwdGlvbiA9IHtcbiAgICBnbHlwaDogbmV3IEdseXBoKEdseXBoLkNIQVJfU1BBQ0UsIDB4MDAwMDAwLCAweDAwMDAwMCksXG4gICAgd2Fsa2FibGU6IGZhbHNlLFxuICAgIGJsb2Nrc1NpZ2h0OiB0cnVlLFxuICB9O1xuXG4gIHB1YmxpYyBzdGF0aWMgRkxPT1I6IFRpbGVEZXNjcmlwdGlvbiA9IHtcbiAgICBnbHlwaDogbmV3IEdseXBoKCdcXCcnLCAweDQ0NDQ0NCwgMHgyMjIyMjIpLFxuICAgIHdhbGthYmxlOiB0cnVlLFxuICAgIGJsb2Nrc1NpZ2h0OiBmYWxzZSxcbiAgfTtcblxuICBwdWJsaWMgc3RhdGljIFdBTEw6IFRpbGVEZXNjcmlwdGlvbiA9IHtcbiAgICBnbHlwaDogbmV3IEdseXBoKEdseXBoLkNIQVJfSExJTkUsIDB4ZGRkZGRkLCAweDExMTExMSksXG4gICAgd2Fsa2FibGU6IGZhbHNlLFxuICAgIGJsb2Nrc1NpZ2h0OiB0cnVlLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKGdseXBoOiBHbHlwaCwgd2Fsa2FibGU6IGJvb2xlYW4sIGJsb2Nrc1NpZ2h0OiBib29sZWFuKSB7XG4gICAgdGhpcy5nbHlwaCA9IGdseXBoO1xuICAgIHRoaXMud2Fsa2FibGUgPSB3YWxrYWJsZTtcbiAgICB0aGlzLmJsb2Nrc1NpZ2h0ID0gYmxvY2tzU2lnaHQ7XG4gICAgdGhpcy5lbnRpdHkgPSBudWxsO1xuICAgIHRoaXMucHJvcHMgPSB7fTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlVGlsZShkZXNjOiBUaWxlRGVzY3JpcHRpb24pIHtcbiAgICByZXR1cm4gbmV3IFRpbGUoZGVzYy5nbHlwaCwgZGVzYy53YWxrYWJsZSwgZGVzYy5ibG9ja3NTaWdodCk7XG4gIH1cbn1cblxuZXhwb3J0ID0gVGlsZTtcbiIsImltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuL0VuZ2luZScpO1xuaW1wb3J0IFNjZW5lID0gcmVxdWlyZSgnLi9TY2VuZScpO1xuXG53aW5kb3cub25sb2FkID0gKCkgPT4ge1xuICBsZXQgZW5naW5lID0gbmV3IEVuZ2luZSg2MCwgNDAsICdyb2d1ZScpO1xuICBsZXQgc2NlbmUgPSBuZXcgU2NlbmUoZW5naW5lLCA2MCwgNDApO1xuICBlbmdpbmUuc3RhcnQoc2NlbmUpO1xufTtcbiIsImltcG9ydCAqIGFzIEV4Y2VwdGlvbnMgZnJvbSAnLi4vRXhjZXB0aW9ucyc7XG5cbmV4cG9ydCBjbGFzcyBBY3Rpb24ge1xuICBwcm90ZWN0ZWQgY29zdDogbnVtYmVyID0gMTAwO1xuICBhY3QoKTogbnVtYmVyIHtcbiAgICB0aHJvdyBuZXcgRXhjZXB0aW9ucy5NaXNzaW5nSW1wbGVtZW50YXRpb25FcnJvcignQWN0aW9uLmFjdCBtdXN0IGJlIG92ZXJ3cml0dGVuJyk7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIEV4Y2VwdGlvbnMgZnJvbSAnLi4vRXhjZXB0aW9ucyc7XG5pbXBvcnQgKiBhcyBCZWhhdmlvdXJzIGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0ICogYXMgRW50aXRpZXMgZnJvbSAnLi4vZW50aXRpZXMnO1xuXG5leHBvcnQgY2xhc3MgQmVoYXZpb3VyIHtcbiAgcHJvdGVjdGVkIG5leHRBY3Rpb246IEJlaGF2aW91cnMuQWN0aW9uO1xuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgZW50aXR5OiBFbnRpdGllcy5FbnRpdHkpIHtcbiAgfVxuICBnZXROZXh0QWN0aW9uKCk6IEJlaGF2aW91cnMuQWN0aW9uIHtcbiAgICB0aHJvdyBuZXcgRXhjZXB0aW9ucy5NaXNzaW5nSW1wbGVtZW50YXRpb25FcnJvcignQmVoYXZpb3VyLmdldE5leHRBY3Rpb24gbXVzdCBiZSBvdmVyd3JpdHRlbicpO1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBCZWhhdmlvdXJzIGZyb20gJy4vaW5kZXgnO1xuXG5leHBvcnQgY2xhc3MgTnVsbEFjdGlvbiBleHRlbmRzIEJlaGF2aW91cnMuQWN0aW9uIHtcbiAgYWN0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuY29zdDtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgQmVoYXZpb3VycyBmcm9tICcuL2luZGV4JztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi4vY29tcG9uZW50cyc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuLi9lbnRpdGllcyc7XG5cbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIFJhbmRvbVdhbGtCZWhhdmlvdXIgZXh0ZW5kcyBCZWhhdmlvdXJzLkJlaGF2aW91ciB7XG4gIHByaXZhdGUgcGh5c2ljc0NvbXBvbmVudDogQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50O1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBlbmdpbmU6IEVuZ2luZSwgcHJvdGVjdGVkIGVudGl0eTogRW50aXRpZXMuRW50aXR5KSB7XG4gICAgc3VwZXIoZW50aXR5KTtcbiAgICB0aGlzLnBoeXNpY3NDb21wb25lbnQgPSA8Q29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KTtcbiAgfVxuXG4gIGdldE5leHRBY3Rpb24oKTogQmVoYXZpb3Vycy5BY3Rpb24ge1xuICAgIGxldCBwb3NpdGlvbnMgPSBDb3JlLlV0aWxzLnJhbmRvbWl6ZUFycmF5KENvcmUuUG9zaXRpb24uZ2V0TmVpZ2hib3Vycyh0aGlzLnBoeXNpY3NDb21wb25lbnQucG9zaXRpb24pKTtcbiAgICBsZXQgaXNXaXRob3V0RW50aXR5ID0gZmFsc2U7XG4gICAgbGV0IHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uID0gbnVsbDtcbiAgICB3aGlsZSghaXNXaXRob3V0RW50aXR5ICYmIHBvc2l0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICBwb3NpdGlvbiA9IHBvc2l0aW9ucy5wb3AoKTtcbiAgICAgIGlzV2l0aG91dEVudGl0eSA9IHRoaXMuZW5naW5lLmlzKG5ldyBFdmVudHMuRXZlbnQoJ2lzV2l0aG91dEVudGl0eScsIHtwb3NpdGlvbjogcG9zaXRpb259KSk7XG4gICAgfVxuICAgIFxuICAgIGlmIChpc1dpdGhvdXRFbnRpdHkpIHtcbiAgICAgIHJldHVybiBuZXcgQmVoYXZpb3Vycy5XYWxrQWN0aW9uKHRoaXMucGh5c2ljc0NvbXBvbmVudCwgcG9zaXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IEJlaGF2aW91cnMuTnVsbEFjdGlvbigpO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi4vY29tcG9uZW50cyc7XG5pbXBvcnQgKiBhcyBCZWhhdmlvdXJzIGZyb20gJy4vaW5kZXgnO1xuXG5leHBvcnQgY2xhc3MgV2Fsa0FjdGlvbiBleHRlbmRzIEJlaGF2aW91cnMuQWN0aW9uIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBwaHlzaWNzQ29tcG9uZW50OiBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQsIHByaXZhdGUgcG9zaXRpb246IENvcmUuUG9zaXRpb24pIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgYWN0KCk6IG51bWJlciB7XG4gICAgdGhpcy5waHlzaWNzQ29tcG9uZW50Lm1vdmVUbyh0aGlzLnBvc2l0aW9uKTtcbiAgICByZXR1cm4gdGhpcy5jb3N0O1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBCZWhhdmlvdXJzIGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0ICogYXMgRW50aXRpZXMgZnJvbSAnLi4vZW50aXRpZXMnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4uL2NvbXBvbmVudHMnO1xuXG5pbXBvcnQgVGlsZSA9IHJlcXVpcmUoJy4uL1RpbGUnKTtcbmltcG9ydCBHbHlwaCA9IHJlcXVpcmUoJy4uL0dseXBoJyk7XG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBXcml0ZVJ1bmVBY3Rpb24gZXh0ZW5kcyBCZWhhdmlvdXJzLkFjdGlvbiB7XG4gIHByaXZhdGUgZW5naW5lOiBFbmdpbmU7XG4gIHByaXZhdGUgcGh5c2ljczogQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50O1xuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBlbnRpdHk6IEVudGl0aWVzLkVudGl0eSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5lbmdpbmUgPSBlbmdpbmU7XG4gICAgdGhpcy5waHlzaWNzID0gPENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCk7XG4gIH1cblxuICBhY3QoKTogbnVtYmVyIHtcbiAgICBjb25zdCBydW5lID0gbmV3IEVudGl0aWVzLkVudGl0eSh0aGlzLmVuZ2luZSwgJ1J1bmUnLCAncnVuZScpO1xuICAgIHJ1bmUuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQodGhpcy5lbmdpbmUsIHtcbiAgICAgIHBvc2l0aW9uOiB0aGlzLnBoeXNpY3MucG9zaXRpb24sXG4gICAgICBibG9ja2luZzogZmFsc2VcbiAgICB9KSk7XG4gICAgcnVuZS5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuUmVuZGVyYWJsZUNvbXBvbmVudCh0aGlzLmVuZ2luZSwge1xuICAgICAgZ2x5cGg6IG5ldyBHbHlwaCgnIycsIDB4NDRmZjg4LCAweDAwMDAwMClcbiAgICB9KSk7XG4gICAgcnVuZS5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuU2VsZkRlc3RydWN0Q29tcG9uZW50KHRoaXMuZW5naW5lLCB7XG4gICAgICB0dXJuczogMTBcbiAgICB9KSk7XG4gICAgcnVuZS5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuUnVuZUZyZWV6ZUNvbXBvbmVudCh0aGlzLmVuZ2luZSkpO1xuICAgIHJldHVybiB0aGlzLmNvc3Q7XG4gIH1cbn1cbiIsImV4cG9ydCAqIGZyb20gJy4vQWN0aW9uJztcbmV4cG9ydCAqIGZyb20gJy4vQmVoYXZpb3VyJztcbmV4cG9ydCAqIGZyb20gJy4vV2Fsa0FjdGlvbic7XG5leHBvcnQgKiBmcm9tICcuL051bGxBY3Rpb24nO1xuZXhwb3J0ICogZnJvbSAnLi9Xcml0ZVJ1bmVBY3Rpb24nO1xuZXhwb3J0ICogZnJvbSAnLi9SYW5kb21XYWxrQmVoYXZpb3VyJztcbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFeGNlcHRpb25zIGZyb20gJy4uL0V4Y2VwdGlvbnMnO1xuaW1wb3J0ICogYXMgRW50aXRpZXMgZnJvbSAnLi4vZW50aXRpZXMnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBDb21wb25lbnQge1xuICBwcm90ZWN0ZWQgbGlzdGVuZXJzOiBFdmVudHMuTGlzdGVuZXJbXTtcblxuICBwcm90ZWN0ZWQgX2d1aWQ6IHN0cmluZztcbiAgZ2V0IGd1aWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2d1aWQ7XG4gIH1cblxuICBwcm90ZWN0ZWQgX2VudGl0eTogRW50aXRpZXMuRW50aXR5O1xuICBnZXQgZW50aXR5KCkge1xuICAgIHJldHVybiB0aGlzLl9lbnRpdHk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX2VuZ2luZTogRW5naW5lO1xuICBnZXQgZW5naW5lKCkge1xuICAgIHJldHVybiB0aGlzLl9lbmdpbmU7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihlbmdpbmU6IEVuZ2luZSwgZGF0YTogYW55ID0ge30pIHtcbiAgICB0aGlzLl9ndWlkID0gQ29yZS5VdGlscy5nZW5lcmF0ZUd1aWQoKTtcbiAgICB0aGlzLl9lbmdpbmUgPSBlbmdpbmU7XG4gICAgdGhpcy5saXN0ZW5lcnMgPSBbXTtcbiAgfVxuXG4gIHJlZ2lzdGVyRW50aXR5KGVudGl0eTogRW50aXRpZXMuRW50aXR5KSB7XG4gICAgdGhpcy5fZW50aXR5ID0gZW50aXR5O1xuICAgIHRoaXMuY2hlY2tSZXF1aXJlbWVudHMoKTtcbiAgICB0aGlzLmluaXRpYWxpemUoKTtcbiAgICB0aGlzLnJlZ2lzdGVyTGlzdGVuZXJzKCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgY2hlY2tSZXF1aXJlbWVudHMoKTogdm9pZCB7XG4gIH1cblxuICBwcm90ZWN0ZWQgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gIH1cblxuICBwcm90ZWN0ZWQgaW5pdGlhbGl6ZSgpIHtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgaWYgKCF0aGlzLmxpc3RlbmVycyB8fCB0eXBlb2YgdGhpcy5saXN0ZW5lcnMuZm9yRWFjaCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbnMuTWlzc2luZ0ltcGxlbWVudGF0aW9uRXJyb3IoJ2B0aGlzLmxpc3RlbmVyc2AgaGFzIGJlZW4gcmVkZWZpbmVkLCBkZWZhdWx0IGBkZXN0cm95YCBmdW5jdGlvbiBzaG91bGQgbm90IGJlIHVzZWQuIEZvcjogJyArIHRoaXMuZW50aXR5Lm5hbWUpO1xuICAgIH1cbiAgICB0aGlzLmxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgdGhpcy5lbmdpbmUucmVtb3ZlTGlzdGVuZXIobGlzdGVuZXIpO1xuICAgICAgdGhpcy5lbnRpdHkucmVtb3ZlTGlzdGVuZXIobGlzdGVuZXIpO1xuICAgIH0pO1xuICAgIHRoaXMubGlzdGVuZXJzID0gW107XG4gIH1cbn1cbiIsImltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcblxuZXhwb3J0IGNsYXNzIEVuZXJneUNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSBfY3VycmVudEVuZXJneTogbnVtYmVyO1xuICBnZXQgY3VycmVudEVuZXJneSgpIHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudEVuZXJneTtcbiAgfVxuXG4gIHByaXZhdGUgX2VuZXJneVJlZ2VuZXJhdGlvblJhdGU6IG51bWJlcjtcbiAgZ2V0IGVuZXJneVJlZ2VuZXJhdGlvblJhdGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuZXJneVJlZ2VuZXJhdGlvblJhdGU7XG4gIH1cblxuICBwcml2YXRlIF9tYXhFbmVyZ3k6IG51bWJlcjtcbiAgZ2V0IG1heEVuZXJneSgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWF4RW5lcmd5O1xuICB9XG5cbiAgY29uc3RydWN0b3IoZW5naW5lOiBFbmdpbmUsIGRhdGE6IHtyZWdlbnJhdGF0aW9uUmF0ZTogbnVtYmVyLCBtYXg6IG51bWJlcn0gPSB7cmVnZW5yYXRhdGlvblJhdGU6IDEwMCwgbWF4OiAxMDB9KSB7XG4gICAgc3VwZXIoZW5naW5lKTtcbiAgICB0aGlzLl9jdXJyZW50RW5lcmd5ID0gdGhpcy5fbWF4RW5lcmd5ID0gZGF0YS5tYXg7XG4gICAgdGhpcy5fZW5lcmd5UmVnZW5lcmF0aW9uUmF0ZSA9IGRhdGEucmVnZW5yYXRhdGlvblJhdGU7XG4gIH1cblxuICBwcm90ZWN0ZWQgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaCh0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICd0aWNrJyxcbiAgICAgIHRoaXMub25UaWNrLmJpbmQodGhpcyksXG4gICAgICAxXG4gICAgKSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvblRpY2soZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGxldCByYXRlID0gdGhpcy5fZW5lcmd5UmVnZW5lcmF0aW9uUmF0ZTtcbiAgICBsZXQgcmF0ZU1vZGlmaWVycyA9IHRoaXMuZW50aXR5LmdhdGhlcihuZXcgRXZlbnRzLkV2ZW50KCdvbkVuZXJneVJlZ2VuZXJhdGlvbicpKTtcbiAgICByYXRlTW9kaWZpZXJzLmZvckVhY2goKG1vZGlmaWVyKSA9PiB7XG4gICAgICByYXRlID0gcmF0ZSAqIG1vZGlmaWVyO1xuICAgIH0pO1xuICAgIHRoaXMuX2N1cnJlbnRFbmVyZ3kgPSBNYXRoLm1pbih0aGlzLm1heEVuZXJneSwgdGhpcy5fY3VycmVudEVuZXJneSArIHJhdGUpO1xuICB9XG5cbiAgdXNlRW5lcmd5KGVuZXJneTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICB0aGlzLl9jdXJyZW50RW5lcmd5ID0gdGhpcy5fY3VycmVudEVuZXJneSAtIGVuZXJneTtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudEVuZXJneTtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2luZGV4JztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgSGVhbHRoQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmVudGl0eS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICAnZGFtYWdlJyxcbiAgICAgIHRoaXMub25EYW1hZ2UuYmluZCh0aGlzKVxuICAgICkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbkRhbWFnZShldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgICB0aGlzLmVuZ2luZS5yZW1vdmVFbnRpdHkodGhpcy5lbnRpdHkpO1xuICAgICAgdGhpcy5lbmdpbmUuZW1pdChuZXcgRXZlbnRzLkV2ZW50KCdtZXNzYWdlJywge1xuICAgICAgICBtZXNzYWdlOiB0aGlzLmVudGl0eS5uYW1lICsgJyB3YXMga2lsbGVkIGJ5ICcgKyBldmVudC5kYXRhLnNvdXJjZS5uYW1lICsgJy4nLFxuICAgICAgICB0YXJnZXQ6IHRoaXMuZW50aXR5XG4gICAgICB9KSk7XG4gIH07XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0ICogYXMgQmVoYXZpb3VycyBmcm9tICcuLi9iZWhhdmlvdXJzJztcblxuaW1wb3J0IElucHV0SGFuZGxlciA9IHJlcXVpcmUoJy4uL0lucHV0SGFuZGxlcicpO1xuaW1wb3J0IEdseXBoID0gcmVxdWlyZSgnLi4vR2x5cGgnKTtcbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIElucHV0Q29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICBwcml2YXRlIGVuZXJneUNvbXBvbmVudDogQ29tcG9uZW50cy5FbmVyZ3lDb21wb25lbnQ7XG4gIHByaXZhdGUgcGh5c2ljc0NvbXBvbmVudDogQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50O1xuICBwcml2YXRlIGhhc0ZvY3VzOiBib29sZWFuO1xuXG4gIHByb3RlY3RlZCBpbml0aWFsaXplKCkge1xuICAgIHRoaXMuZW5lcmd5Q29tcG9uZW50ID0gPENvbXBvbmVudHMuRW5lcmd5Q29tcG9uZW50PnRoaXMuZW50aXR5LmdldENvbXBvbmVudChDb21wb25lbnRzLkVuZXJneUNvbXBvbmVudCk7XG4gICAgdGhpcy5waHlzaWNzQ29tcG9uZW50ID0gPENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudD50aGlzLmVudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KTtcbiAgICB0aGlzLmhhc0ZvY3VzID0gZmFsc2U7XG4gIH1cblxuICBwcm90ZWN0ZWQgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaCh0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICd0aWNrJyxcbiAgICAgIHRoaXMub25UaWNrLmJpbmQodGhpcylcbiAgICApKSk7XG5cbiAgICB0aGlzLmVuZ2luZS5pbnB1dEhhbmRsZXIubGlzdGVuKFxuICAgICAgW0lucHV0SGFuZGxlci5LRVlfVVAsIElucHV0SGFuZGxlci5LRVlfS10sIFxuICAgICAgdGhpcy5vbk1vdmVVcC5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICB0aGlzLmVuZ2luZS5pbnB1dEhhbmRsZXIubGlzdGVuKFxuICAgICAgW0lucHV0SGFuZGxlci5LRVlfVV0sXG4gICAgICB0aGlzLm9uTW92ZVVwUmlnaHQuYmluZCh0aGlzKVxuICAgICk7XG4gICAgdGhpcy5lbmdpbmUuaW5wdXRIYW5kbGVyLmxpc3RlbihcbiAgICAgIFtJbnB1dEhhbmRsZXIuS0VZX1JJR0hULCBJbnB1dEhhbmRsZXIuS0VZX0xdLCBcbiAgICAgIHRoaXMub25Nb3ZlUmlnaHQuYmluZCh0aGlzKVxuICAgICk7XG4gICAgdGhpcy5lbmdpbmUuaW5wdXRIYW5kbGVyLmxpc3RlbihcbiAgICAgIFtJbnB1dEhhbmRsZXIuS0VZX05dLFxuICAgICAgdGhpcy5vbk1vdmVEb3duUmlnaHQuYmluZCh0aGlzKVxuICAgICk7XG4gICAgdGhpcy5lbmdpbmUuaW5wdXRIYW5kbGVyLmxpc3RlbihcbiAgICAgIFtJbnB1dEhhbmRsZXIuS0VZX0RPV04sIElucHV0SGFuZGxlci5LRVlfSl0sIFxuICAgICAgdGhpcy5vbk1vdmVEb3duLmJpbmQodGhpcylcbiAgICApO1xuICAgIHRoaXMuZW5naW5lLmlucHV0SGFuZGxlci5saXN0ZW4oXG4gICAgICBbSW5wdXRIYW5kbGVyLktFWV9CXSxcbiAgICAgIHRoaXMub25Nb3ZlRG93bkxlZnQuYmluZCh0aGlzKVxuICAgICk7XG4gICAgdGhpcy5lbmdpbmUuaW5wdXRIYW5kbGVyLmxpc3RlbihcbiAgICAgIFtJbnB1dEhhbmRsZXIuS0VZX0xFRlQsIElucHV0SGFuZGxlci5LRVlfSF0sIFxuICAgICAgdGhpcy5vbk1vdmVMZWZ0LmJpbmQodGhpcylcbiAgICApO1xuICAgIHRoaXMuZW5naW5lLmlucHV0SGFuZGxlci5saXN0ZW4oXG4gICAgICBbSW5wdXRIYW5kbGVyLktFWV9ZXSxcbiAgICAgIHRoaXMub25Nb3ZlVXBMZWZ0LmJpbmQodGhpcylcbiAgICApO1xuICAgIHRoaXMuZW5naW5lLmlucHV0SGFuZGxlci5saXN0ZW4oXG4gICAgICBbSW5wdXRIYW5kbGVyLktFWV9QRVJJT0RdLCBcbiAgICAgIHRoaXMub25XYWl0LmJpbmQodGhpcylcbiAgICApO1xuICAgIHRoaXMuZW5naW5lLmlucHV0SGFuZGxlci5saXN0ZW4oXG4gICAgICBbSW5wdXRIYW5kbGVyLktFWV8wXSwgXG4gICAgICB0aGlzLm9uVHJhcE9uZS5iaW5kKHRoaXMpXG4gICAgKTtcbiAgfVxuXG4gIG9uVGljayhldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgaWYgKHRoaXMuZW5lcmd5Q29tcG9uZW50LmN1cnJlbnRFbmVyZ3kgPj0gMTAwKSB7XG4gICAgICB0aGlzLmFjdCgpO1xuICAgIH1cbiAgfVxuXG4gIGFjdCgpIHtcbiAgICB0aGlzLmhhc0ZvY3VzID0gdHJ1ZTtcbiAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ3BhdXNlVGltZScpKTtcbiAgfVxuXG4gIHByaXZhdGUgcGVyZm9ybUFjdGlvbihhY3Rpb246IEJlaGF2aW91cnMuQWN0aW9uKSB7XG4gICAgdGhpcy5oYXNGb2N1cyA9IGZhbHNlO1xuICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgncmVzdW1lVGltZScpKTtcbiAgICB0aGlzLmVuZXJneUNvbXBvbmVudC51c2VFbmVyZ3koYWN0aW9uLmFjdCgpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25XYWl0KCkge1xuICAgIGlmICghdGhpcy5oYXNGb2N1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLnBlcmZvcm1BY3Rpb24obmV3IEJlaGF2aW91cnMuTnVsbEFjdGlvbigpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25UcmFwT25lKCkge1xuICAgIGlmICghdGhpcy5oYXNGb2N1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBhY3Rpb24gPSB0aGlzLmVudGl0eS5maXJlKG5ldyBFdmVudHMuRXZlbnQoJ3dyaXRlUnVuZScsIHt9KSk7XG4gICAgaWYgKGFjdGlvbikge1xuICAgICAgdGhpcy5wZXJmb3JtQWN0aW9uKGFjdGlvbik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVVcCgpIHtcbiAgICBpZiAoIXRoaXMuaGFzRm9jdXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5oYW5kbGVNb3ZlbWVudChuZXcgQ29yZS5Qb3NpdGlvbigwLCAtMSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVVcFJpZ2h0KCkge1xuICAgIGlmICghdGhpcy5oYXNGb2N1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmhhbmRsZU1vdmVtZW50KG5ldyBDb3JlLlBvc2l0aW9uKDEsIC0xKSk7XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZVJpZ2h0KCkge1xuICAgIGlmICghdGhpcy5oYXNGb2N1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmhhbmRsZU1vdmVtZW50KG5ldyBDb3JlLlBvc2l0aW9uKDEsIDApKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Nb3ZlRG93blJpZ2h0KCkge1xuICAgIGlmICghdGhpcy5oYXNGb2N1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmhhbmRsZU1vdmVtZW50KG5ldyBDb3JlLlBvc2l0aW9uKDEsIDEpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Nb3ZlRG93bigpIHtcbiAgICBpZiAoIXRoaXMuaGFzRm9jdXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5oYW5kbGVNb3ZlbWVudChuZXcgQ29yZS5Qb3NpdGlvbigwLCAxKSk7XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZURvd25MZWZ0KCkge1xuICAgIGlmICghdGhpcy5oYXNGb2N1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmhhbmRsZU1vdmVtZW50KG5ldyBDb3JlLlBvc2l0aW9uKC0xLCAxKSk7XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZUxlZnQoKSB7XG4gICAgaWYgKCF0aGlzLmhhc0ZvY3VzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuaGFuZGxlTW92ZW1lbnQobmV3IENvcmUuUG9zaXRpb24oLTEsIDApKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Nb3ZlVXBMZWZ0KCkge1xuICAgIGlmICghdGhpcy5oYXNGb2N1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmhhbmRsZU1vdmVtZW50KG5ldyBDb3JlLlBvc2l0aW9uKC0xLCAtMSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVNb3ZlbWVudChkaXJlY3Rpb246IENvcmUuUG9zaXRpb24pIHtcbiAgICBjb25zdCBwb3NpdGlvbiA9IENvcmUuUG9zaXRpb24uYWRkKHRoaXMucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbiwgZGlyZWN0aW9uKTtcbiAgICBjb25zdCBpc1dpdGhvdXRFbnRpdHkgPSB0aGlzLmVuZ2luZS5pcyhuZXcgRXZlbnRzLkV2ZW50KCdpc1dpdGhvdXRFbnRpdHknLCB7cG9zaXRpb246IHBvc2l0aW9ufSkpO1xuICAgIGlmIChpc1dpdGhvdXRFbnRpdHkpIHtcbiAgICAgIHRoaXMucGVyZm9ybUFjdGlvbihuZXcgQmVoYXZpb3Vycy5XYWxrQWN0aW9uKHRoaXMucGh5c2ljc0NvbXBvbmVudCwgcG9zaXRpb24pKTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5cbmltcG9ydCBHbHlwaCA9IHJlcXVpcmUoJy4uL0dseXBoJyk7XG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBQaHlzaWNzQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICBwcml2YXRlIF9ibG9ja2luZzogYm9vbGVhbjtcbiAgZ2V0IGJsb2NraW5nKCkge1xuICAgIHJldHVybiB0aGlzLl9ibG9ja2luZztcbiAgfVxuICBwcml2YXRlIF9wb3NpdGlvbjogQ29yZS5Qb3NpdGlvbjtcbiAgZ2V0IHBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9wb3NpdGlvbjtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBkYXRhOiB7cG9zaXRpb246IENvcmUuUG9zaXRpb24sIGJsb2NraW5nOiBib29sZWFufSA9IHtwb3NpdGlvbjogbnVsbCwgYmxvY2tpbmc6IHRydWV9KSB7XG4gICAgc3VwZXIoZW5naW5lKTtcbiAgICB0aGlzLl9wb3NpdGlvbiA9IGRhdGEucG9zaXRpb247XG4gICAgdGhpcy5fYmxvY2tpbmcgPSBkYXRhLmJsb2NraW5nO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBpZiAodGhpcy5wb3NpdGlvbikge1xuICAgICAgdGhpcy5lbmdpbmUuZW1pdChuZXcgRXZlbnRzLkV2ZW50KCdtb3ZlZFRvJywge3BoeXNpY3NDb21wb25lbnQ6IHRoaXMsIGVudGl0eTogdGhpcy5lbnRpdHl9KSk7XG4gICAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ21vdmUnLCB7cGh5c2ljc0NvbXBvbmVudDogdGhpcywgZW50aXR5OiB0aGlzLmVudGl0eX0pKTtcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ21vdmVkRnJvbScsIHtwaHlzaWNzQ29tcG9uZW50OiB0aGlzLCBlbnRpdHk6IHRoaXMuZW50aXR5fSkpO1xuICB9XG5cbiAgbW92ZVRvKHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uKSB7XG4gICAgaWYgKHRoaXMuX3Bvc2l0aW9uKSB7XG4gICAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ21vdmVkRnJvbScsIHtwaHlzaWNzQ29tcG9uZW50OiB0aGlzLCBlbnRpdHk6IHRoaXMuZW50aXR5fSkpO1xuICAgIH1cbiAgICB0aGlzLl9wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgnbW92ZWRUbycsIHtwaHlzaWNzQ29tcG9uZW50OiB0aGlzLCBlbnRpdHk6IHRoaXMuZW50aXR5fSkpO1xuICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgnbW92ZScsIHtwaHlzaWNzQ29tcG9uZW50OiB0aGlzLCBlbnRpdHk6IHRoaXMuZW50aXR5fSkpO1xuICAgIHRoaXMuZW50aXR5LmVtaXQobmV3IEV2ZW50cy5FdmVudCgnbW92ZScsIHtwaHlzaWNzQ29tcG9uZW50OiB0aGlzLCBlbnRpdHk6IHRoaXMuZW50aXR5fSkpO1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuLi9lbnRpdGllcyc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIEV4Y2VwdGlvbnMgZnJvbSAnLi4vRXhjZXB0aW9ucyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuXG5pbXBvcnQgR2x5cGggPSByZXF1aXJlKCcuLi9HbHlwaCcpO1xuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgUmVuZGVyYWJsZUNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSBfZ2x5cGg6IEdseXBoO1xuICBnZXQgZ2x5cGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dseXBoO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZW5naW5lOiBFbmdpbmUsIGRhdGE6IHtnbHlwaDogR2x5cGh9KSB7XG4gICAgc3VwZXIoZW5naW5lKTtcbiAgICB0aGlzLl9nbHlwaCA9IGRhdGEuZ2x5cGg7XG4gIH1cblxuICBwcm90ZWN0ZWQgY2hlY2tSZXF1aXJlbWVudHMoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmVudGl0eS5oYXNDb21wb25lbnQoQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KSkge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbnMuTWlzc2luZ0NvbXBvbmVudEVycm9yKCdSZW5kZXJhYmxlQ29tcG9uZW50IHJlcXVpcmVzIFBoeXNpY3NDb21wb25lbnQnKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ3JlbmRlcmFibGVDb21wb25lbnRDcmVhdGVkJywge2VudGl0eTogdGhpcy5lbnRpdHksIHJlbmRlcmFibGVDb21wb25lbnQ6IHRoaXN9KSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgncmVuZGVyYWJsZUNvbXBvbmVudERlc3Ryb3llZCcsIHtlbnRpdHk6IHRoaXMuZW50aXR5LCByZW5kZXJhYmxlQ29tcG9uZW50OiB0aGlzfSkpO1xuICB9XG59XG4iLCJpbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmltcG9ydCAqIGFzIEJlaGF2aW91cnMgZnJvbSAnLi4vYmVoYXZpb3Vycyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5cbmV4cG9ydCBjbGFzcyBSb2FtaW5nQUlDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gIHByaXZhdGUgZW5lcmd5Q29tcG9uZW50OiBDb21wb25lbnRzLkVuZXJneUNvbXBvbmVudDtcblxuICBwcml2YXRlIHJhbmRvbVdhbGtCZWhhdmlvdXI6IEJlaGF2aW91cnMuUmFuZG9tV2Fsa0JlaGF2aW91cjtcblxuICBwcm90ZWN0ZWQgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLmVuZXJneUNvbXBvbmVudCA9IDxDb21wb25lbnRzLkVuZXJneUNvbXBvbmVudD50aGlzLmVudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5FbmVyZ3lDb21wb25lbnQpO1xuICAgIHRoaXMucmFuZG9tV2Fsa0JlaGF2aW91ciA9IG5ldyBCZWhhdmlvdXJzLlJhbmRvbVdhbGtCZWhhdmlvdXIodGhpcy5lbmdpbmUsIHRoaXMuZW50aXR5KTtcbiAgfVxuXG4gIHByb3RlY3RlZCByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ3RpY2snLFxuICAgICAgdGhpcy5vblRpY2suYmluZCh0aGlzKVxuICAgICkpKTtcbiAgfVxuXG4gIG9uVGljayhldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgaWYgKHRoaXMuZW5lcmd5Q29tcG9uZW50LmN1cnJlbnRFbmVyZ3kgPj0gMTAwKSB7XG4gICAgICBsZXQgYWN0aW9uID0gdGhpcy5yYW5kb21XYWxrQmVoYXZpb3VyLmdldE5leHRBY3Rpb24oKTtcbiAgICAgIHRoaXMuZW5lcmd5Q29tcG9uZW50LnVzZUVuZXJneShhY3Rpb24uYWN0KCkpO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2luZGV4JztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgUnVuZURhbWFnZUNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSByYWRpdXM6IG51bWJlcjtcbiAgcHJpdmF0ZSBjaGFyZ2VzOiBudW1iZXI7XG4gIHByaXZhdGUgcGh5c2ljc0NvbXBvbmVudDogQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50O1xuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBkYXRhOiB7cmFkaXVzOiBudW1iZXIsIGNoYXJnZXM6IG51bWJlcn0gPSB7cmFkaXVzOiAxLCBjaGFyZ2VzOiAxfSkge1xuICAgIHN1cGVyKGVuZ2luZSk7XG4gICAgdGhpcy5yYWRpdXMgPSBkYXRhLnJhZGl1cztcbiAgICB0aGlzLmNoYXJnZXMgPSBkYXRhLmNoYXJnZXM7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMucGh5c2ljc0NvbXBvbmVudCA9IDxDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ+dGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCk7XG4gIH1cblxuICByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ21vdmVkVG8nLFxuICAgICAgdGhpcy5vbk1vdmVkVG8uYmluZCh0aGlzKSxcbiAgICAgIDUwXG4gICAgKSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVkVG8oZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGlmICh0aGlzLmNoYXJnZXMgPD0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBldmVudFBvc2l0aW9uID0gZXZlbnQuZGF0YS5waHlzaWNzQ29tcG9uZW50LnBvc2l0aW9uOyBcbiAgICBpZiAoZXZlbnRQb3NpdGlvbi54ID09IHRoaXMucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbi54ICYmIFxuICAgICAgICBldmVudFBvc2l0aW9uLnkgPT09IHRoaXMucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbi55KSB7XG4gICAgICBldmVudC5kYXRhLmVudGl0eS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ2RhbWFnZScsIHtcbiAgICAgICAgc291cmNlOiB0aGlzLmVudGl0eVxuICAgICAgfSkpO1xuICAgICAgdGhpcy5jaGFyZ2VzLS07XG4gICAgICBpZiAodGhpcy5jaGFyZ2VzIDw9IDApIHtcbiAgICAgICAgdGhpcy5lbmdpbmUucmVtb3ZlRW50aXR5KHRoaXMuZW50aXR5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5cbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIFJ1bmVGcmVlemVDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gIHByaXZhdGUgcmFkaXVzOiBudW1iZXI7XG4gIHByaXZhdGUgY2hhcmdlczogbnVtYmVyO1xuICBwcml2YXRlIHBoeXNpY3NDb21wb25lbnQ6IENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudDtcblxuICBjb25zdHJ1Y3RvcihlbmdpbmU6IEVuZ2luZSwgZGF0YToge3JhZGl1czogbnVtYmVyLCBjaGFyZ2VzOiBudW1iZXJ9ID0ge3JhZGl1czogMSwgY2hhcmdlczogMX0pIHtcbiAgICBzdXBlcihlbmdpbmUpO1xuICAgIHRoaXMucmFkaXVzID0gZGF0YS5yYWRpdXM7XG4gICAgdGhpcy5jaGFyZ2VzID0gZGF0YS5jaGFyZ2VzO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnBoeXNpY3NDb21wb25lbnQgPSA8Q29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50PnRoaXMuZW50aXR5LmdldENvbXBvbmVudChDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQpO1xuICB9XG5cbiAgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaCh0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdtb3ZlZFRvJyxcbiAgICAgIHRoaXMub25Nb3ZlZFRvLmJpbmQodGhpcyksXG4gICAgICA1MFxuICAgICkpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Nb3ZlZFRvKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBpZiAodGhpcy5jaGFyZ2VzIDw9IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZXZlbnRQb3NpdGlvbiA9IGV2ZW50LmRhdGEucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbjsgXG4gICAgaWYgKGV2ZW50UG9zaXRpb24ueCA9PSB0aGlzLnBoeXNpY3NDb21wb25lbnQucG9zaXRpb24ueCAmJiBcbiAgICAgICAgZXZlbnRQb3NpdGlvbi55ID09PSB0aGlzLnBoeXNpY3NDb21wb25lbnQucG9zaXRpb24ueSkge1xuICAgICAgZXZlbnQuZGF0YS5lbnRpdHkuYWRkQ29tcG9uZW50KFxuICAgICAgICBuZXcgQ29tcG9uZW50cy5TbG93Q29tcG9uZW50KHRoaXMuZW5naW5lLCB7ZmFjdG9yOiAwLjV9KSxcbiAgICAgICAgeyBcbiAgICAgICAgICBkdXJhdGlvbjogMTBcbiAgICAgICAgfVxuICAgICAgKTsgXG4gICAgICB0aGlzLmNoYXJnZXMtLTtcbiAgICAgIGlmICh0aGlzLmNoYXJnZXMgPD0gMCkge1xuICAgICAgICB0aGlzLmVuZ2luZS5yZW1vdmVFbnRpdHkodGhpcy5lbnRpdHkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEJlaGF2aW91cnMgZnJvbSAnLi4vYmVoYXZpb3Vycyc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4uL2VudGl0aWVzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5cbmltcG9ydCBHbHlwaCA9IHJlcXVpcmUoJy4uL0dseXBoJyk7XG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBSdW5lV3JpdGVyQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICBwcml2YXRlIHBoeXNpY2FsQ29tcG9uZW50OiBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ7XG5cbiAgY29uc3RydWN0b3IoZW5naW5lOiBFbmdpbmUsIGRhdGE6IHt9ID0ge30pIHtcbiAgICBzdXBlcihlbmdpbmUpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5waHlzaWNhbENvbXBvbmVudCA9IDxDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ+dGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5lbnRpdHkubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAnd3JpdGVSdW5lJyxcbiAgICAgIHRoaXMub25Xcml0ZVJ1bmUuYmluZCh0aGlzKVxuICAgICkpO1xuICB9XG5cbiAgb25Xcml0ZVJ1bmUoZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGNvbnN0IHRpbGUgPSB0aGlzLmVuZ2luZS5maXJlKG5ldyBFdmVudHMuRXZlbnQoJ2dldFRpbGUnLCB7XG4gICAgICBwb3NpdGlvbjogdGhpcy5waHlzaWNhbENvbXBvbmVudC5wb3NpdGlvblxuICAgIH0pKTtcblxuICAgIGxldCBoYXNSdW5lID0gZmFsc2U7XG4gICAgZm9yICh2YXIga2V5IGluIHRpbGUucHJvcHMpIHtcbiAgICAgIGlmICh0aWxlLnByb3BzW2tleV0udHlwZSA9PT0gJ3J1bmUnKSB7XG4gICAgICAgIGhhc1J1bmUgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChoYXNSdW5lKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIFxuICAgIHJldHVybiBuZXcgQmVoYXZpb3Vycy5Xcml0ZVJ1bmVBY3Rpb24odGhpcy5lbmdpbmUsIHRoaXMuZW50aXR5KTtcblxuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuXG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBTZWxmRGVzdHJ1Y3RDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gIHByaXZhdGUgbWF4VHVybnM6IG51bWJlcjtcbiAgcHJpdmF0ZSB0dXJuc0xlZnQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihlbmdpbmU6IEVuZ2luZSwgZGF0YToge3R1cm5zOiBudW1iZXJ9KSB7XG4gICAgc3VwZXIoZW5naW5lKTtcbiAgICB0aGlzLm1heFR1cm5zID0gZGF0YS50dXJucztcbiAgICB0aGlzLnR1cm5zTGVmdCA9IGRhdGEudHVybnM7XG4gICAgdGhpcy5saXN0ZW5lcnMgPSBbXTtcbiAgfVxuXG4gIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMubGlzdGVuZXJzLnB1c2godGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAndHVybicsXG4gICAgICB0aGlzLm9uVHVybi5iaW5kKHRoaXMpLFxuICAgICAgNTBcbiAgICApKSk7XG4gIH1cblxuICBwcml2YXRlIG9uVHVybihldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgdGhpcy50dXJuc0xlZnQtLTtcbiAgICBpZiAodGhpcy50dXJuc0xlZnQgPCAwKSB7XG4gICAgICB0aGlzLmVuZ2luZS5yZW1vdmVFbnRpdHkodGhpcy5lbnRpdHkpO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2luZGV4JztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgU2xvd0NvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSBfZmFjdG9yOiBudW1iZXI7XG4gIGdldCBmYWN0b3IoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZhY3RvcjtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBkYXRhOiB7ZmFjdG9yOiBudW1iZXJ9KSB7XG4gICAgc3VwZXIoZW5naW5lKTtcbiAgICB0aGlzLl9mYWN0b3IgPSBkYXRhLmZhY3RvcjtcbiAgfVxuXG4gIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMubGlzdGVuZXJzLnB1c2godGhpcy5lbnRpdHkubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAnb25FbmVyZ3lSZWdlbmVyYXRpb24nLFxuICAgICAgdGhpcy5vbkVuZXJneVJlZ2VuZXJhdGlvbi5iaW5kKHRoaXMpLFxuICAgICAgNTBcbiAgICApKSk7XG5cbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKHRoaXMuZW50aXR5Lmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ2dldFN0YXR1c0VmZmVjdCcsXG4gICAgICB0aGlzLm9uR2V0U3RhdHVzRWZmZWN0LmJpbmQodGhpcylcbiAgICApKSk7XG4gIH1cblxuICBwcml2YXRlIG9uRW5lcmd5UmVnZW5lcmF0aW9uKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICByZXR1cm4gdGhpcy5fZmFjdG9yO1xuICB9XG5cbiAgcHJpdmF0ZSBvbkdldFN0YXR1c0VmZmVjdChldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6ICdTbG93JyxcbiAgICAgIHN5bWJvbDogJ1MnXG4gICAgfTtcbiAgfVxuXG59XG4iLCJpbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5cbmV4cG9ydCBjbGFzcyBUaW1lSGFuZGxlckNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSBfY3VycmVudFRpY2s6IG51bWJlcjtcbiAgZ2V0IGN1cnJlbnRUaWNrKCkge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50VGljaztcbiAgfVxuXG4gIHByaXZhdGUgX2N1cnJlbnRUdXJuOiBudW1iZXI7XG4gIGdldCBjdXJyZW50VHVybigpIHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudFR1cm47XG4gIH1cblxuICBwcml2YXRlIHRpY2tzUGVyVHVybjogbnVtYmVyO1xuICBwcml2YXRlIHR1cm5UaW1lOiBudW1iZXI7XG5cbiAgcHJpdmF0ZSBwYXVzZWQ6IGJvb2xlYW47XG5cbiAgcHJvdGVjdGVkIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy50aWNrc1BlclR1cm4gPSAxO1xuICAgIHRoaXMudHVyblRpbWUgPSAwO1xuICAgIHRoaXMuX2N1cnJlbnRUdXJuID0gMDtcbiAgICB0aGlzLl9jdXJyZW50VGljayA9IDA7XG4gICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgfVxuXG4gIHByb3RlY3RlZCByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdwYXVzZVRpbWUnLFxuICAgICAgdGhpcy5vblBhdXNlVGltZS5iaW5kKHRoaXMpXG4gICAgKSk7XG4gICAgdGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAncmVzdW1lVGltZScsXG4gICAgICB0aGlzLm9uUmVzdW1lVGltZS5iaW5kKHRoaXMpXG4gICAgKSk7XG4gIH1cblxuICBwcml2YXRlIG9uUGF1c2VUaW1lKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICB0aGlzLnBhdXNlZCA9IHRydWU7XG4gIH1cblxuICBwcml2YXRlIG9uUmVzdW1lVGltZShldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGVuZ2luZVRpY2soZ2FtZVRpbWU6IG51bWJlcikge1xuICAgIGlmICh0aGlzLnBhdXNlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9jdXJyZW50VGljaysrO1xuICAgIHRoaXMuZW5naW5lLmN1cnJlbnRUaWNrID0gdGhpcy5fY3VycmVudFRpY2s7XG4gICAgaWYgKCh0aGlzLl9jdXJyZW50VGljayAlIHRoaXMudGlja3NQZXJUdXJuKSA9PT0gMCkge1xuICAgICAgdGhpcy5fY3VycmVudFR1cm4rKztcbiAgICAgIHRoaXMuZW5naW5lLmN1cnJlbnRUdXJuID0gdGhpcy5fY3VycmVudFR1cm47XG4gICAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ3R1cm4nLCB7Y3VycmVudFR1cm46IHRoaXMuX2N1cnJlbnRUdXJuLCBjdXJyZW50VGljazogdGhpcy5fY3VycmVudFRpY2t9KSk7XG5cbiAgICAgIHRoaXMudHVyblRpbWUgPSBnYW1lVGltZTtcblxuICAgIH1cbiAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ3RpY2snLCB7Y3VycmVudFR1cm46IHRoaXMuX2N1cnJlbnRUdXJuLCBjdXJyZW50VGljazogdGhpcy5fY3VycmVudFRpY2t9KSk7XG4gIH1cblxufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9Db21wb25lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9UaW1lSGFuZGxlckNvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL1NlbGZEZXN0cnVjdENvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL1JvYW1pbmdBSUNvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL0VuZXJneUNvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL0lucHV0Q29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vUmVuZGVyYWJsZUNvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL1BoeXNpY3NDb21wb25lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9IZWFsdGhDb21wb25lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9SdW5lV3JpdGVyQ29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vUnVuZURhbWFnZUNvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL1J1bmVGcmVlemVDb21wb25lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9TbG93Q29tcG9uZW50JztcbiIsIlwidXNlIHN0cmljdFwiO1xuZXhwb3J0IHR5cGUgQ29sb3IgPSBTdHJpbmcgfCBudW1iZXI7XG5cbmV4cG9ydCBjbGFzcyBDb2xvclV0aWxzIHtcbiAgLyoqXG4gICAgRnVuY3Rpb246IG11bHRpcGx5XG4gICAgTXVsdGlwbHkgYSBjb2xvciB3aXRoIGEgbnVtYmVyLiBcbiAgICA+IChyLGcsYikgKiBuID09IChyKm4sIGcqbiwgYipuKVxuXG4gICAgUGFyYW1ldGVyczpcbiAgICBjb2xvciAtIHRoZSBjb2xvclxuICAgIGNvZWYgLSB0aGUgZmFjdG9yXG5cbiAgICBSZXR1cm5zOlxuICAgIEEgbmV3IGNvbG9yIGFzIGEgbnVtYmVyIGJldHdlZW4gMHgwMDAwMDAgYW5kIDB4RkZGRkZGXG4gICAqL1xuICBzdGF0aWMgbXVsdGlwbHkoY29sb3I6IENvbG9yLCBjb2VmOiBudW1iZXIpOiBDb2xvciB7XG4gICAgbGV0IHIsIGcsIGI6IG51bWJlcjtcbiAgICBpZiAodHlwZW9mIGNvbG9yID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIgPSAoPG51bWJlcj5jb2xvciAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcgPSAoPG51bWJlcj5jb2xvciAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYiA9IDxudW1iZXI+Y29sb3IgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjogbnVtYmVyW10gPSBDb2xvclV0aWxzLnRvUmdiKGNvbG9yKTtcbiAgICAgIHIgPSByZ2JbMF07XG4gICAgICBnID0gcmdiWzFdO1xuICAgICAgYiA9IHJnYlsyXTtcbiAgICB9XG4gICAgciA9IE1hdGgucm91bmQociAqIGNvZWYpO1xuICAgIGcgPSBNYXRoLnJvdW5kKGcgKiBjb2VmKTtcbiAgICBiID0gTWF0aC5yb3VuZChiICogY29lZik7XG4gICAgciA9IHIgPCAwID8gMCA6IHIgPiAyNTUgPyAyNTUgOiByO1xuICAgIGcgPSBnIDwgMCA/IDAgOiBnID4gMjU1ID8gMjU1IDogZztcbiAgICBiID0gYiA8IDAgPyAwIDogYiA+IDI1NSA/IDI1NSA6IGI7XG4gICAgcmV0dXJuIGIgfCAoZyA8PCA4KSB8IChyIDw8IDE2KTtcbiAgfVxuXG4gIHN0YXRpYyBtYXgoY29sMTogQ29sb3IsIGNvbDI6IENvbG9yKSB7XG4gICAgbGV0IHIxLGcxLGIxLHIyLGcyLGIyOiBudW1iZXI7XG4gICAgaWYgKHR5cGVvZiBjb2wxID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIxID0gKDxudW1iZXI+Y29sMSAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcxID0gKDxudW1iZXI+Y29sMSAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYjEgPSA8bnVtYmVyPmNvbDEgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjE6IG51bWJlcltdID0gQ29sb3JVdGlscy50b1JnYihjb2wxKTtcbiAgICAgIHIxID0gcmdiMVswXTtcbiAgICAgIGcxID0gcmdiMVsxXTtcbiAgICAgIGIxID0gcmdiMVsyXTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjb2wyID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIyID0gKDxudW1iZXI+Y29sMiAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcyID0gKDxudW1iZXI+Y29sMiAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYjIgPSA8bnVtYmVyPmNvbDIgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjI6IG51bWJlcltdID0gQ29sb3JVdGlscy50b1JnYihjb2wyKTtcbiAgICAgIHIyID0gcmdiMlswXTtcbiAgICAgIGcyID0gcmdiMlsxXTtcbiAgICAgIGIyID0gcmdiMlsyXTtcbiAgICB9XG4gICAgaWYgKHIyID4gcjEpIHtcbiAgICAgIHIxID0gcjI7XG4gICAgfVxuICAgIGlmIChnMiA+IGcxKSB7XG4gICAgICBnMSA9IGcyO1xuICAgIH1cbiAgICBpZiAoYjIgPiBiMSkge1xuICAgICAgYjEgPSBiMjtcbiAgICB9XG4gICAgcmV0dXJuIGIxIHwgKGcxIDw8IDgpIHwgKHIxIDw8IDE2KTtcbiAgfVxuXG4gIHN0YXRpYyBtaW4oY29sMTogQ29sb3IsIGNvbDI6IENvbG9yKSB7XG4gICAgbGV0IHIxLGcxLGIxLHIyLGcyLGIyOiBudW1iZXI7XG4gICAgaWYgKHR5cGVvZiBjb2wxID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIxID0gKDxudW1iZXI+Y29sMSAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcxID0gKDxudW1iZXI+Y29sMSAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYjEgPSA8bnVtYmVyPmNvbDEgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjE6IG51bWJlcltdID0gQ29sb3JVdGlscy50b1JnYihjb2wxKTtcbiAgICAgIHIxID0gcmdiMVswXTtcbiAgICAgIGcxID0gcmdiMVsxXTtcbiAgICAgIGIxID0gcmdiMVsyXTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjb2wyID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIyID0gKDxudW1iZXI+Y29sMiAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcyID0gKDxudW1iZXI+Y29sMiAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYjIgPSA8bnVtYmVyPmNvbDIgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjI6IG51bWJlcltdID0gQ29sb3JVdGlscy50b1JnYihjb2wyKTtcbiAgICAgIHIyID0gcmdiMlswXTtcbiAgICAgIGcyID0gcmdiMlsxXTtcbiAgICAgIGIyID0gcmdiMlsyXTtcbiAgICB9XG4gICAgaWYgKHIyIDwgcjEpIHtcbiAgICAgIHIxID0gcjI7XG4gICAgfVxuICAgIGlmIChnMiA8IGcxKSB7XG4gICAgICBnMSA9IGcyO1xuICAgIH1cbiAgICBpZiAoYjIgPCBiMSkge1xuICAgICAgYjEgPSBiMjtcbiAgICB9XG4gICAgcmV0dXJuIGIxIHwgKGcxIDw8IDgpIHwgKHIxIDw8IDE2KTtcbiAgfSAgICAgICAgXG5cbiAgc3RhdGljIGNvbG9yTXVsdGlwbHkoY29sMTogQ29sb3IsIGNvbDI6IENvbG9yKSB7XG4gICAgbGV0IHIxLGcxLGIxLHIyLGcyLGIyOiBudW1iZXI7XG4gICAgaWYgKHR5cGVvZiBjb2wxID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIxID0gKDxudW1iZXI+Y29sMSAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcxID0gKDxudW1iZXI+Y29sMSAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYjEgPSA8bnVtYmVyPmNvbDEgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjE6IG51bWJlcltdID0gQ29sb3JVdGlscy50b1JnYihjb2wxKTtcbiAgICAgIHIxID0gcmdiMVswXTtcbiAgICAgIGcxID0gcmdiMVsxXTtcbiAgICAgIGIxID0gcmdiMVsyXTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjb2wyID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIyID0gKDxudW1iZXI+Y29sMiAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcyID0gKDxudW1iZXI+Y29sMiAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYjIgPSA8bnVtYmVyPmNvbDIgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjI6IG51bWJlcltdID0gQ29sb3JVdGlscy50b1JnYihjb2wyKTtcbiAgICAgIHIyID0gcmdiMlswXTtcbiAgICAgIGcyID0gcmdiMlsxXTtcbiAgICAgIGIyID0gcmdiMlsyXTtcbiAgICB9ICAgICAgICAgICBcbiAgICByMSA9IE1hdGguZmxvb3IocjEgKiByMiAvIDI1NSk7XG4gICAgZzEgPSBNYXRoLmZsb29yKGcxICogZzIgLyAyNTUpO1xuICAgIGIxID0gTWF0aC5mbG9vcihiMSAqIGIyIC8gMjU1KTtcbiAgICByMSA9IHIxIDwgMCA/IDAgOiByMSA+IDI1NSA/IDI1NSA6IHIxO1xuICAgIGcxID0gZzEgPCAwID8gMCA6IGcxID4gMjU1ID8gMjU1IDogZzE7XG4gICAgYjEgPSBiMSA8IDAgPyAwIDogYjEgPiAyNTUgPyAyNTUgOiBiMTtcbiAgICByZXR1cm4gYjEgfCAoZzEgPDwgOCkgfCAocjEgPDwgMTYpO1xuICB9XG5cbiAgLyoqXG4gICAgRnVuY3Rpb246IGNvbXB1dGVJbnRlbnNpdHlcbiAgICBSZXR1cm4gdGhlIGdyYXlzY2FsZSBpbnRlbnNpdHkgYmV0d2VlbiAwIGFuZCAxXG4gICAqL1xuICBzdGF0aWMgY29tcHV0ZUludGVuc2l0eShjb2xvcjogQ29sb3IpOiBudW1iZXIge1xuICAgIC8vIENvbG9yaW1ldHJpYyAobHVtaW5hbmNlLXByZXNlcnZpbmcpIGNvbnZlcnNpb24gdG8gZ3JheXNjYWxlXG4gICAgbGV0IHIsIGcsIGI6IG51bWJlcjtcbiAgICBpZiAodHlwZW9mIGNvbG9yID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIgPSAoPG51bWJlcj5jb2xvciAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcgPSAoPG51bWJlcj5jb2xvciAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYiA9IDxudW1iZXI+Y29sb3IgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjogbnVtYmVyW10gPSBDb2xvclV0aWxzLnRvUmdiKGNvbG9yKTtcbiAgICAgIHIgPSByZ2JbMF07XG4gICAgICBnID0gcmdiWzFdO1xuICAgICAgYiA9IHJnYlsyXTtcbiAgICB9XG4gICAgcmV0dXJuICgwLjIxMjYgKiByICsgMC43MTUyKmcgKyAwLjA3MjIgKiBiKSAqICgxLzI1NSk7XG4gIH1cblxuICAvKipcbiAgICBGdW5jdGlvbjogYWRkXG4gICAgQWRkIHR3byBjb2xvcnMuXG4gICAgPiAocjEsZzEsYjEpICsgKHIyLGcyLGIyKSA9IChyMStyMixnMStnMixiMStiMilcblxuICAgIFBhcmFtZXRlcnM6XG4gICAgY29sMSAtIHRoZSBmaXJzdCBjb2xvclxuICAgIGNvbDIgLSB0aGUgc2Vjb25kIGNvbG9yXG5cbiAgICBSZXR1cm5zOlxuICAgIEEgbmV3IGNvbG9yIGFzIGEgbnVtYmVyIGJldHdlZW4gMHgwMDAwMDAgYW5kIDB4RkZGRkZGXG4gICAqL1xuICBzdGF0aWMgYWRkKGNvbDE6IENvbG9yLCBjb2wyOiBDb2xvcik6IENvbG9yIHtcbiAgICBsZXQgciA9ICgoPG51bWJlcj5jb2wxICYgMHhGRjAwMDApID4+IDE2KSArICgoPG51bWJlcj5jb2wyICYgMHhGRjAwMDApID4+IDE2KTtcbiAgICBsZXQgZyA9ICgoPG51bWJlcj5jb2wxICYgMHgwMEZGMDApID4+IDgpICsgKCg8bnVtYmVyPmNvbDIgJiAweDAwRkYwMCkgPj4gOCk7XG4gICAgbGV0IGIgPSAoPG51bWJlcj5jb2wxICYgMHgwMDAwRkYpICsgKDxudW1iZXI+Y29sMiAmIDB4MDAwMEZGKTtcbiAgICBpZiAociA+IDI1NSkge1xuICAgICAgciA9IDI1NTtcbiAgICB9XG4gICAgaWYgKGcgPiAyNTUpIHtcbiAgICAgIGcgPSAyNTU7XG4gICAgfVxuICAgIGlmIChiID4gMjU1KSB7XG4gICAgICBiID0gMjU1O1xuICAgIH1cbiAgICByZXR1cm4gYiB8IChnIDw8IDgpIHwgKHIgPDwgMTYpO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgc3RkQ29sID0ge1xuICAgIFwiYXF1YVwiOiBbMCwgMjU1LCAyNTVdLFxuICAgIFwiYmxhY2tcIjogWzAsIDAsIDBdLFxuICAgIFwiYmx1ZVwiOiBbMCwgMCwgMjU1XSxcbiAgICBcImZ1Y2hzaWFcIjogWzI1NSwgMCwgMjU1XSxcbiAgICBcImdyYXlcIjogWzEyOCwgMTI4LCAxMjhdLFxuICAgIFwiZ3JlZW5cIjogWzAsIDEyOCwgMF0sXG4gICAgXCJsaW1lXCI6IFswLCAyNTUsIDBdLFxuICAgIFwibWFyb29uXCI6IFsxMjgsIDAsIDBdLFxuICAgIFwibmF2eVwiOiBbMCwgMCwgMTI4XSxcbiAgICBcIm9saXZlXCI6IFsxMjgsIDEyOCwgMF0sXG4gICAgXCJvcmFuZ2VcIjogWzI1NSwgMTY1LCAwXSxcbiAgICBcInB1cnBsZVwiOiBbMTI4LCAwLCAxMjhdLFxuICAgIFwicmVkXCI6IFsyNTUsIDAsIDBdLFxuICAgIFwic2lsdmVyXCI6IFsxOTIsIDE5MiwgMTkyXSxcbiAgICBcInRlYWxcIjogWzAsIDEyOCwgMTI4XSxcbiAgICBcIndoaXRlXCI6IFsyNTUsIDI1NSwgMjU1XSxcbiAgICBcInllbGxvd1wiOiBbMjU1LCAyNTUsIDBdXG4gIH07XG4gIC8qKlxuICAgIEZ1bmN0aW9uOiB0b1JnYlxuICAgIENvbnZlcnQgYSBzdHJpbmcgY29sb3IgaW50byBhIFtyLGcsYl0gbnVtYmVyIGFycmF5LlxuXG4gICAgUGFyYW1ldGVyczpcbiAgICBjb2xvciAtIHRoZSBjb2xvclxuXG4gICAgUmV0dXJuczpcbiAgICBBbiBhcnJheSBvZiAzIG51bWJlcnMgW3IsZyxiXSBiZXR3ZWVuIDAgYW5kIDI1NS5cbiAgICovXG4gIHN0YXRpYyB0b1JnYihjb2xvcjogQ29sb3IpOiBudW1iZXJbXSB7XG4gICAgaWYgKHR5cGVvZiBjb2xvciA9PT0gXCJudW1iZXJcIikge1xuICAgICAgcmV0dXJuIENvbG9yVXRpbHMudG9SZ2JGcm9tTnVtYmVyKDxudW1iZXI+Y29sb3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gQ29sb3JVdGlscy50b1JnYkZyb21TdHJpbmcoPFN0cmluZz5jb2xvcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAgRnVuY3Rpb246IHRvV2ViXG4gICAgQ29udmVydCBhIGNvbG9yIGludG8gYSBDU1MgY29sb3IgZm9ybWF0IChhcyBhIHN0cmluZylcbiAgICovXG4gIHN0YXRpYyB0b1dlYihjb2xvcjogQ29sb3IpOiBzdHJpbmcge1xuICAgIGlmICh0eXBlb2YgY29sb3IgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIGxldCByZXQ6IHN0cmluZyA9IGNvbG9yLnRvU3RyaW5nKDE2KTtcbiAgICAgIGxldCBtaXNzaW5nWmVyb2VzOiBudW1iZXIgPSA2IC0gcmV0Lmxlbmd0aDtcbiAgICAgIGlmIChtaXNzaW5nWmVyb2VzID4gMCkge1xuICAgICAgICByZXQgPSBcIjAwMDAwMFwiLnN1YnN0cigwLCBtaXNzaW5nWmVyb2VzKSArIHJldDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBcIiNcIiArIHJldDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIDxzdHJpbmc+Y29sb3I7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgdG9SZ2JGcm9tTnVtYmVyKGNvbG9yOiBudW1iZXIpOiBudW1iZXJbXSB7XG4gICAgbGV0IHIgPSAoY29sb3IgJiAweEZGMDAwMCkgPj4gMTY7XG4gICAgbGV0IGcgPSAoY29sb3IgJiAweDAwRkYwMCkgPj4gODtcbiAgICBsZXQgYiA9IGNvbG9yICYgMHgwMDAwRkY7XG4gICAgcmV0dXJuIFtyLCBnLCBiXTtcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIHRvUmdiRnJvbVN0cmluZyhjb2xvcjogU3RyaW5nKTogbnVtYmVyW10ge1xuICAgIGNvbG9yID0gY29sb3IudG9Mb3dlckNhc2UoKTtcbiAgICBsZXQgc3RkQ29sVmFsdWVzOiBudW1iZXJbXSA9IENvbG9yVXRpbHMuc3RkQ29sW1N0cmluZyhjb2xvcildO1xuICAgIGlmIChzdGRDb2xWYWx1ZXMpIHtcbiAgICAgIHJldHVybiBzdGRDb2xWYWx1ZXM7XG4gICAgfVxuICAgIGlmIChjb2xvci5jaGFyQXQoMCkgPT09IFwiI1wiKSB7XG4gICAgICAvLyAjRkZGIG9yICNGRkZGRkYgZm9ybWF0XG4gICAgICBpZiAoY29sb3IubGVuZ3RoID09PSA0KSB7XG4gICAgICAgIC8vIGV4cGFuZCAjRkZGIHRvICNGRkZGRkZcbiAgICAgICAgY29sb3IgPSBcIiNcIiArIGNvbG9yLmNoYXJBdCgxKSArIGNvbG9yLmNoYXJBdCgxKSArIGNvbG9yLmNoYXJBdCgyKVxuICAgICAgICArIGNvbG9yLmNoYXJBdCgyKSArIGNvbG9yLmNoYXJBdCgzKSArIGNvbG9yLmNoYXJBdCgzKTtcbiAgICAgIH1cbiAgICAgIGxldCByOiBudW1iZXIgPSBwYXJzZUludChjb2xvci5zdWJzdHIoMSwgMiksIDE2KTtcbiAgICAgIGxldCBnOiBudW1iZXIgPSBwYXJzZUludChjb2xvci5zdWJzdHIoMywgMiksIDE2KTtcbiAgICAgIGxldCBiOiBudW1iZXIgPSBwYXJzZUludChjb2xvci5zdWJzdHIoNSwgMiksIDE2KTtcbiAgICAgIHJldHVybiBbciwgZywgYl07XG4gICAgfSBlbHNlIGlmIChjb2xvci5pbmRleE9mKFwicmdiKFwiKSA9PT0gMCkge1xuICAgICAgLy8gcmdiKHIsZyxiKSBmb3JtYXRcbiAgICAgIGxldCByZ2JMaXN0ID0gY29sb3Iuc3Vic3RyKDQsIGNvbG9yLmxlbmd0aCAtIDUpLnNwbGl0KFwiLFwiKTtcbiAgICAgIHJldHVybiBbcGFyc2VJbnQocmdiTGlzdFswXSwgMTApLCBwYXJzZUludChyZ2JMaXN0WzFdLCAxMCksIHBhcnNlSW50KHJnYkxpc3RbMl0sIDEwKV07XG4gICAgfVxuICAgIHJldHVybiBbMCwgMCwgMF07XG4gIH1cblxuICAvKipcbiAgICBGdW5jdGlvbjogdG9OdW1iZXJcbiAgICBDb252ZXJ0IGEgc3RyaW5nIGNvbG9yIGludG8gYSBudW1iZXIuXG5cbiAgICBQYXJhbWV0ZXJzOlxuICAgIGNvbG9yIC0gdGhlIGNvbG9yXG5cbiAgICBSZXR1cm5zOlxuICAgIEEgbnVtYmVyIGJldHdlZW4gMHgwMDAwMDAgYW5kIDB4RkZGRkZGLlxuICAgKi9cbiAgc3RhdGljIHRvTnVtYmVyKGNvbG9yOiBDb2xvcik6IG51bWJlciB7XG4gICAgaWYgKHR5cGVvZiBjb2xvciA9PT0gXCJudW1iZXJcIikge1xuICAgICAgcmV0dXJuIDxudW1iZXI+Y29sb3I7XG4gICAgfVxuICAgIGxldCBzY29sOiBTdHJpbmcgPSA8U3RyaW5nPmNvbG9yO1xuICAgIGlmIChzY29sLmNoYXJBdCgwKSA9PT0gXCIjXCIgJiYgc2NvbC5sZW5ndGggPT09IDcpIHtcbiAgICAgIHJldHVybiBwYXJzZUludChzY29sLnN1YnN0cigxKSwgMTYpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmdiID0gQ29sb3JVdGlscy50b1JnYkZyb21TdHJpbmcoc2NvbCk7XG4gICAgICByZXR1cm4gcmdiWzBdICogNjU1MzYgKyByZ2JbMV0gKiAyNTYgKyByZ2JbMl07XG4gICAgfVxuICB9XG59XG4iLCJleHBvcnQgY2xhc3MgUG9zaXRpb24ge1xuICBwcml2YXRlIF94OiBudW1iZXI7XG4gIHByaXZhdGUgX3k6IG51bWJlcjtcblxuICBwcml2YXRlIHN0YXRpYyBtYXhXaWR0aDogbnVtYmVyO1xuICBwcml2YXRlIHN0YXRpYyBtYXhIZWlnaHQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgIHRoaXMuX3ggPSB4O1xuICAgIHRoaXMuX3kgPSB5O1xuICB9XG5cbiAgZ2V0IHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5feDtcbiAgfVxuXG4gIGdldCB5KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3k7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHNldE1heFZhbHVlcyh3OiBudW1iZXIsIGg6IG51bWJlcikge1xuICAgIFBvc2l0aW9uLm1heFdpZHRoID0gdztcbiAgICBQb3NpdGlvbi5tYXhIZWlnaHQgPSBoO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBnZXRSYW5kb20od2lkdGg6IG51bWJlciA9IC0xLCBoZWlnaHQ6IG51bWJlciA9IC0xKTogUG9zaXRpb24ge1xuICAgIGlmICh3aWR0aCA9PT0gLTEpIHtcbiAgICAgIHdpZHRoID0gUG9zaXRpb24ubWF4V2lkdGg7XG4gICAgfVxuICAgIGlmIChoZWlnaHQgPT09IC0xKSB7XG4gICAgICBoZWlnaHQgPSBQb3NpdGlvbi5tYXhIZWlnaHQ7XG4gICAgfVxuICAgIHZhciB4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogd2lkdGgpO1xuICAgIHZhciB5ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaGVpZ2h0KTtcbiAgICByZXR1cm4gbmV3IFBvc2l0aW9uKHgsIHkpO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBnZXROZWlnaGJvdXJzKHBvczogUG9zaXRpb24sIHdpZHRoOiBudW1iZXIgPSAtMSwgaGVpZ2h0OiBudW1iZXIgPSAtMSwgb25seUNhcmRpbmFsOiBib29sZWFuID0gZmFsc2UpOiBQb3NpdGlvbltdIHtcbiAgICBpZiAod2lkdGggPT09IC0xKSB7XG4gICAgICB3aWR0aCA9IFBvc2l0aW9uLm1heFdpZHRoO1xuICAgIH1cbiAgICBpZiAoaGVpZ2h0ID09PSAtMSkge1xuICAgICAgaGVpZ2h0ID0gUG9zaXRpb24ubWF4SGVpZ2h0O1xuICAgIH1cbiAgICBsZXQgeCA9IHBvcy54O1xuICAgIGxldCB5ID0gcG9zLnk7XG4gICAgbGV0IHBvc2l0aW9ucyA9IFtdO1xuICAgIGlmICh4ID4gMCkge1xuICAgICAgcG9zaXRpb25zLnB1c2gobmV3IFBvc2l0aW9uKHggLSAxLCB5KSk7XG4gICAgfVxuICAgIGlmICh4IDwgd2lkdGggLSAxKSB7XG4gICAgICBwb3NpdGlvbnMucHVzaChuZXcgUG9zaXRpb24oeCArIDEsIHkpKTtcbiAgICB9XG4gICAgaWYgKHkgPiAwKSB7XG4gICAgICBwb3NpdGlvbnMucHVzaChuZXcgUG9zaXRpb24oeCwgeSAtIDEpKTtcbiAgICB9XG4gICAgaWYgKHkgPCBoZWlnaHQgLSAxKSB7XG4gICAgICBwb3NpdGlvbnMucHVzaChuZXcgUG9zaXRpb24oeCwgeSArIDEpKTtcbiAgICB9XG4gICAgaWYgKCFvbmx5Q2FyZGluYWwpIHtcbiAgICAgIGlmICh4ID4gMCAmJiB5ID4gMCkge1xuICAgICAgICBwb3NpdGlvbnMucHVzaChuZXcgUG9zaXRpb24oeCAtIDEsIHkgLSAxKSk7XG4gICAgICB9XG4gICAgICBpZiAoeCA+IDAgJiYgeSA8IGhlaWdodCAtIDEpIHtcbiAgICAgICAgcG9zaXRpb25zLnB1c2gobmV3IFBvc2l0aW9uKHggLSAxLCB5ICsgMSkpO1xuICAgICAgfVxuICAgICAgaWYgKHggPCB3aWR0aCAtIDEgJiYgeSA8IGhlaWdodCAtIDEpIHtcbiAgICAgICAgcG9zaXRpb25zLnB1c2gobmV3IFBvc2l0aW9uKHggKyAxLCB5ICsgMSkpO1xuICAgICAgfVxuICAgICAgaWYgKHggPCB3aWR0aCAtIDEgJiYgeSA+IDApIHtcbiAgICAgICAgcG9zaXRpb25zLnB1c2gobmV3IFBvc2l0aW9uKHggKyAxLCB5IC0gMSkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcG9zaXRpb25zO1xuXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGdldERpcmVjdGlvbnMob25seUNhcmRpbmFsOiBib29sZWFuID0gZmFsc2UpOiBQb3NpdGlvbltdIHtcbiAgICBsZXQgZGlyZWN0aW9uczogUG9zaXRpb25bXSA9IFtdO1xuXG4gICAgZGlyZWN0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbiggMCwgLTEpKTtcbiAgICBkaXJlY3Rpb25zLnB1c2gobmV3IFBvc2l0aW9uKCAwLCAgMSkpO1xuICAgIGRpcmVjdGlvbnMucHVzaChuZXcgUG9zaXRpb24oLTEsICAwKSk7XG4gICAgZGlyZWN0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbiggMSwgIDApKTtcbiAgICBpZiAoIW9ubHlDYXJkaW5hbCkge1xuICAgICAgZGlyZWN0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbigtMSwgLTEpKTtcbiAgICAgIGRpcmVjdGlvbnMucHVzaChuZXcgUG9zaXRpb24oIDEsICAxKSk7XG4gICAgICBkaXJlY3Rpb25zLnB1c2gobmV3IFBvc2l0aW9uKC0xLCAgMSkpO1xuICAgICAgZGlyZWN0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbiggMSwgLTEpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGlyZWN0aW9ucztcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgYWRkKGE6IFBvc2l0aW9uLCBiOiBQb3NpdGlvbikge1xuICAgIHJldHVybiBuZXcgUG9zaXRpb24oYS54ICsgYi54LCBhLnkgKyBiLnkpO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBnZXREaWFnb25hbE9mZnNldHMoKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgIHt4OiAtMSwgeTogLTF9LCB7eDogIDEsIHk6ICAtMX0sXG4gICAgICB7eDogLTEsIHk6ICAxfSwge3g6ICAxLCB5OiAgMX1cbiAgICBdXG4gIH1cbn1cbiIsImV4cG9ydCAqIGZyb20gJy4vQ29sb3InO1xuZXhwb3J0ICogZnJvbSAnLi9Qb3NpdGlvbic7XG5cbmV4cG9ydCBuYW1lc3BhY2UgVXRpbHMge1xuICAvLyBDUkMzMiB1dGlsaXR5LiBBZGFwdGVkIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xODYzODkwMC9qYXZhc2NyaXB0LWNyYzMyXG4gIGxldCBjcmNUYWJsZTogbnVtYmVyW107XG4gIGZ1bmN0aW9uIG1ha2VDUkNUYWJsZSgpIHtcbiAgICBsZXQgYzogbnVtYmVyO1xuICAgIGNyY1RhYmxlID0gW107XG4gICAgZm9yIChsZXQgbjogbnVtYmVyID0gMDsgbiA8IDI1NjsgbisrKSB7XG4gICAgICBjID0gbjtcbiAgICAgIGZvciAobGV0IGs6IG51bWJlciA9IDA7IGsgPCA4OyBrKyspIHtcbiAgICAgICAgYyA9ICgoYyAmIDEpID8gKDB4RURCODgzMjAgXiAoYyA+Pj4gMSkpIDogKGMgPj4+IDEpKTtcbiAgICAgIH1cbiAgICAgIGNyY1RhYmxlW25dID0gYztcbiAgICB9XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gYnVpbGRNYXRyaXg8VD4odzogbnVtYmVyLCBoOiBudW1iZXIsIHZhbHVlOiBUKTogVFtdW10ge1xuICAgIGxldCByZXQ6IFRbXVtdID0gW107XG4gICAgZm9yICggbGV0IHg6IG51bWJlciA9IDA7IHggPCB3OyArK3gpIHtcbiAgICAgIHJldFt4XSA9IFtdO1xuICAgICAgZm9yICggbGV0IHk6IG51bWJlciA9IDA7IHkgPCBoOyArK3kpIHtcbiAgICAgICAgcmV0W3hdW3ldID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gY3JjMzIoc3RyOiBzdHJpbmcpOiBudW1iZXIge1xuICAgIGlmICghY3JjVGFibGUpIHtcbiAgICAgIG1ha2VDUkNUYWJsZSgpO1xuICAgIH1cbiAgICBsZXQgY3JjOiBudW1iZXIgPSAwIF4gKC0xKTtcbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwLCBsZW46IG51bWJlciA9IHN0ci5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgY3JjID0gKGNyYyA+Pj4gOCkgXiBjcmNUYWJsZVsoY3JjIF4gc3RyLmNoYXJDb2RlQXQoaSkpICYgMHhGRl07XG4gICAgfVxuICAgIHJldHVybiAoY3JjIF4gKC0xKSkgPj4+IDA7XG4gIH07XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIHRvQ2FtZWxDYXNlKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBpbnB1dC50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoLyhcXGJ8XylcXHcvZywgZnVuY3Rpb24obSkge1xuICAgICAgcmV0dXJuIG0udG9VcHBlckNhc2UoKS5yZXBsYWNlKC9fLywgXCJcIik7XG4gICAgfSk7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVHdWlkKCkge1xuICAgIHJldHVybiAneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4Jy5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uKGMpIHtcbiAgICAgIHZhciByID0gTWF0aC5yYW5kb20oKSoxNnwwLCB2ID0gYyA9PSAneCcgPyByIDogKHImMHgzfDB4OCk7XG4gICAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gICAgfSk7XG4gIH1cbiAgZXhwb3J0IGZ1bmN0aW9uIGdldFJhbmRvbShtaW46IG51bWJlciwgbWF4OiBudW1iZXIpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBnZXRSYW5kb21JbmRleDxUPihhcnJheTogVFtdKTogVCB7XG4gICAgcmV0dXJuIGFycmF5W2dldFJhbmRvbSgwLCBhcnJheS5sZW5ndGggLSAxKV07XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gcmFuZG9taXplQXJyYXk8VD4oYXJyYXk6IFRbXSk6IFRbXSB7XG4gICAgaWYgKGFycmF5Lmxlbmd0aCA8PSAxKSByZXR1cm4gYXJyYXk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCByYW5kb21DaG9pY2VJbmRleCA9IGdldFJhbmRvbShpLCBhcnJheS5sZW5ndGggLSAxKTtcblxuICAgICAgW2FycmF5W2ldLCBhcnJheVtyYW5kb21DaG9pY2VJbmRleF1dID0gW2FycmF5W3JhbmRvbUNob2ljZUluZGV4XSwgYXJyYXlbaV1dO1xuICAgIH1cblxuICAgIHJldHVybiBhcnJheTtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBhcHBseU1peGlucyhkZXJpdmVkQ3RvcjogYW55LCBiYXNlQ3RvcnM6IGFueVtdKSB7XG4gICAgYmFzZUN0b3JzLmZvckVhY2goYmFzZUN0b3IgPT4ge1xuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYmFzZUN0b3IucHJvdG90eXBlKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgICBkZXJpdmVkQ3Rvci5wcm90b3R5cGVbbmFtZV0gPSBiYXNlQ3Rvci5wcm90b3R5cGVbbmFtZV07XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuLi9jb21wb25lbnRzJztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4vaW5kZXgnO1xuXG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5pbXBvcnQgR2x5cGggPSByZXF1aXJlKCcuLi9HbHlwaCcpO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlV2lseShlbmdpbmU6IEVuZ2luZSkge1xuICAgIGxldCB3aWx5ID0gbmV3IEVudGl0aWVzLkVudGl0eShlbmdpbmUsICdXaWx5JywgJ3BsYXllcicpO1xuICAgIHdpbHkuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQoZW5naW5lKSk7XG4gICAgd2lseS5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuUmVuZGVyYWJsZUNvbXBvbmVudChlbmdpbmUsIHtcbiAgICAgIGdseXBoOiBuZXcgR2x5cGgoJ0AnLCAweGZmZmZmZiwgMHgwMDAwMDApXG4gICAgfSkpO1xuICAgIHdpbHkuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLkVuZXJneUNvbXBvbmVudChlbmdpbmUpKTtcbiAgICB3aWx5LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5JbnB1dENvbXBvbmVudChlbmdpbmUpKTtcbiAgICB3aWx5LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5SdW5lV3JpdGVyQ29tcG9uZW50KGVuZ2luZSkpO1xuICAgIHdpbHkuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLkhlYWx0aENvbXBvbmVudChlbmdpbmUpKTtcblxuICAgIHJldHVybiB3aWx5O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUmF0KGVuZ2luZTogRW5naW5lKSB7XG4gICAgbGV0IHJhdCA9IG5ldyBFbnRpdGllcy5FbnRpdHkoZW5naW5lLCAnUmF0JywgJ3Zlcm1pbicpO1xuICAgIHJhdC5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudChlbmdpbmUpKTtcbiAgICByYXQuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLlJlbmRlcmFibGVDb21wb25lbnQoZW5naW5lLCB7XG4gICAgICBnbHlwaDogbmV3IEdseXBoKCdyJywgMHhmZmZmZmYsIDB4MDAwMDAwKVxuICAgIH0pKTtcbiAgICByYXQuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLkVuZXJneUNvbXBvbmVudChlbmdpbmUpKTtcbiAgICByYXQuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLlJvYW1pbmdBSUNvbXBvbmVudChlbmdpbmUpKTtcbiAgICByYXQuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLkhlYWx0aENvbXBvbmVudChlbmdpbmUpKTtcblxuICAgIHJldHVybiByYXQ7XG59XG4iLCJpbXBvcnQgKiBhcyBDb2xsZWN0aW9ucyBmcm9tICd0eXBlc2NyaXB0LWNvbGxlY3Rpb25zJztcblxuaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuLi9jb21wb25lbnRzJztcbmltcG9ydCAqIGFzIE1peGlucyBmcm9tICcuLi9taXhpbnMnO1xuXG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBFbnRpdHkgaW1wbGVtZW50cyBNaXhpbnMuSUV2ZW50SGFuZGxlciB7XG4gIC8vIEV2ZW50SGFuZGxlciBtaXhpblxuICBsaXN0ZW46IChsaXN0ZW5lcjogRXZlbnRzLkxpc3RlbmVyKSA9PiBFdmVudHMuTGlzdGVuZXI7XG4gIHJlbW92ZUxpc3RlbmVyOiAobGlzdGVuZXI6IEV2ZW50cy5MaXN0ZW5lcikgPT4gdm9pZDtcbiAgZW1pdDogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IHZvaWQ7XG4gIGZpcmU6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiBhbnk7XG4gIGlzOiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gYm9vbGVhbjtcbiAgZ2F0aGVyOiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gYW55W107XG5cbiAgcHJpdmF0ZSBfdHlwZTogc3RyaW5nO1xuICBnZXQgdHlwZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZTtcbiAgfVxuXG4gIHByaXZhdGUgX25hbWU6IHN0cmluZztcbiAgZ2V0IG5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX25hbWU7XG4gIH1cbiAgcHJpdmF0ZSBfZ3VpZDogc3RyaW5nO1xuICBnZXQgZ3VpZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ3VpZDtcbiAgfVxuICBwcml2YXRlIGVuZ2luZTogRW5naW5lO1xuICBwcml2YXRlIGNvbXBvbmVudHM6IENvbXBvbmVudHMuQ29tcG9uZW50W107XG5cbiAgY29uc3RydWN0b3IoZW5naW5lOiBFbmdpbmUsIG5hbWU6IHN0cmluZyA9ICcnLCB0eXBlOiBzdHJpbmcgPSAnJykge1xuICAgIHRoaXMuZW5naW5lID0gZW5naW5lO1xuICAgIHRoaXMuX2d1aWQgPSBDb3JlLlV0aWxzLmdlbmVyYXRlR3VpZCgpO1xuICAgIHRoaXMuX25hbWUgPSBuYW1lO1xuICAgIHRoaXMuX3R5cGUgPSB0eXBlO1xuXG5cbiAgICB0aGlzLmNvbXBvbmVudHMgPSBbXTtcblxuICAgIHRoaXMuZW5naW5lLnJlZ2lzdGVyRW50aXR5KHRoaXMpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmNvbXBvbmVudHMuZm9yRWFjaCgoY29tcG9uZW50KSA9PiB7XG4gICAgICBjb21wb25lbnQuZGVzdHJveSgpO1xuICAgICAgY29tcG9uZW50ID0gbnVsbDtcbiAgICB9KTtcbiAgICB0aGlzLmVuZ2luZS5yZW1vdmVFbnRpdHkodGhpcyk7XG4gIH1cblxuICBhZGRDb21wb25lbnQoY29tcG9uZW50OiBDb21wb25lbnRzLkNvbXBvbmVudCwgb3B0aW9uczoge2R1cmF0aW9uOiBudW1iZXJ9ID0gbnVsbCkge1xuICAgIHRoaXMuY29tcG9uZW50cy5wdXNoKGNvbXBvbmVudCk7XG4gICAgY29tcG9uZW50LnJlZ2lzdGVyRW50aXR5KHRoaXMpO1xuXG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5kdXJhdGlvbikge1xuICAgICAgY29uc3QgZGVsYXllZENvbXBvbmVudFJlbW92ZXIgPSBuZXcgRGVsYXllZENvbXBvbmVudFJlbW92ZXIoKTtcbiAgICAgIGRlbGF5ZWRDb21wb25lbnRSZW1vdmVyLnRyaWdnZXJUdXJuID0gdGhpcy5lbmdpbmUuY3VycmVudFR1cm4gKyBvcHRpb25zLmR1cmF0aW9uO1xuICAgICAgZGVsYXllZENvbXBvbmVudFJlbW92ZXIuZW50aXR5ID0gdGhpcztcbiAgICAgIGRlbGF5ZWRDb21wb25lbnRSZW1vdmVyLmVuZ2luZSA9IHRoaXMuZW5naW5lO1xuICAgICAgZGVsYXllZENvbXBvbmVudFJlbW92ZXIuZ3VpZCA9IGNvbXBvbmVudC5ndWlkO1xuICAgICAgZGVsYXllZENvbXBvbmVudFJlbW92ZXIubGlzdGVuZXIgPSB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICAgJ3R1cm4nLFxuICAgICAgICBkZWxheWVkQ29tcG9uZW50UmVtb3Zlci5jaGVjay5iaW5kKGRlbGF5ZWRDb21wb25lbnRSZW1vdmVyKVxuICAgICAgKSk7XG4gICAgfVxuICB9XG5cbiAgaGFzQ29tcG9uZW50KGNvbXBvbmVudFR5cGUpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzLmZpbHRlcigoY29tcG9uZW50KSA9PiB7XG4gICAgICByZXR1cm4gY29tcG9uZW50IGluc3RhbmNlb2YgY29tcG9uZW50VHlwZTtcbiAgICB9KS5sZW5ndGggPiAwO1xuICB9XG5cbiAgZ2V0Q29tcG9uZW50KGNvbXBvbmVudFR5cGUpOiBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gICAgbGV0IGNvbXBvbmVudCA9IHRoaXMuY29tcG9uZW50cy5maWx0ZXIoKGNvbXBvbmVudCkgPT4ge1xuICAgICAgcmV0dXJuIGNvbXBvbmVudCBpbnN0YW5jZW9mIGNvbXBvbmVudFR5cGU7XG4gICAgfSk7XG4gICAgaWYgKGNvbXBvbmVudC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gY29tcG9uZW50WzBdO1xuICB9XG5cbiAgcmVtb3ZlQ29tcG9uZW50KGd1aWQ6IHN0cmluZykge1xuICAgIGNvbnN0IGlkeCA9IHRoaXMuY29tcG9uZW50cy5maW5kSW5kZXgoKGNvbXBvbmVudCkgPT4ge1xuICAgICAgcmV0dXJuIGNvbXBvbmVudC5ndWlkID09PSBndWlkO1xuICAgIH0pO1xuICAgIGlmIChpZHggPj0gMCkge1xuICAgICAgdGhpcy5jb21wb25lbnRzW2lkeF0uZGVzdHJveSgpO1xuICAgICAgdGhpcy5jb21wb25lbnRzLnNwbGljZShpZHgsIDEpO1xuICAgIH1cbiAgfVxuXG59XG5cbmNsYXNzIERlbGF5ZWRDb21wb25lbnRSZW1vdmVyIHtcbiAgdHJpZ2dlclR1cm46IG51bWJlcjtcbiAgbGlzdGVuZXI6IEV2ZW50cy5MaXN0ZW5lcjtcbiAgZW50aXR5OiBFbnRpdHk7XG4gIGVuZ2luZTogRW5naW5lO1xuICBndWlkOiBzdHJpbmc7XG4gIGNoZWNrKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBpZiAoZXZlbnQuZGF0YS5jdXJyZW50VHVybiA+PSB0aGlzLnRyaWdnZXJUdXJuKSB7XG4gICAgICB0aGlzLmVudGl0eS5yZW1vdmVDb21wb25lbnQodGhpcy5ndWlkKTtcbiAgICAgIHRoaXMuZW5naW5lLnJlbW92ZUxpc3RlbmVyKHRoaXMubGlzdGVuZXIpO1xuICAgIH1cbiAgfVxufVxuXG5Db3JlLlV0aWxzLmFwcGx5TWl4aW5zKEVudGl0eSwgW01peGlucy5FdmVudEhhbmRsZXJdKTtcbiIsImV4cG9ydCAqIGZyb20gJy4vQ3JlYXRvcic7XG5leHBvcnQgKiBmcm9tICcuL0VudGl0eSc7XG4iLCJleHBvcnQgY2xhc3MgRXZlbnQge1xuICBwdWJsaWMgdHlwZTogc3RyaW5nO1xuICBwdWJsaWMgZGF0YTogYW55O1xuXG4gIGNvbnN0cnVjdG9yKHR5cGU6IHN0cmluZywgZGF0YTogYW55ID0gbnVsbCkge1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuL2luZGV4JztcblxuZXhwb3J0IGNsYXNzIExpc3RlbmVyIHtcbiAgcHVibGljIHR5cGU6IHN0cmluZztcbiAgcHVibGljIHByaW9yaXR5OiBudW1iZXI7XG4gIHB1YmxpYyBjYWxsYmFjazogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IGFueTtcbiAgcHVibGljIGd1aWQ6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcih0eXBlOiBzdHJpbmcsIGNhbGxiYWNrOiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gYW55LCBwcmlvcml0eTogbnVtYmVyID0gMTAwLCBndWlkOiBzdHJpbmcgPSBudWxsKSB7XG4gICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICB0aGlzLnByaW9yaXR5ID0gcHJpb3JpdHk7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIHRoaXMuZ3VpZCA9IGd1aWQgfHwgQ29yZS5VdGlscy5nZW5lcmF0ZUd1aWQoKTtcbiAgfVxufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9FdmVudCc7XG5leHBvcnQgKiBmcm9tICcuL0lMaXN0ZW5lcic7XG5leHBvcnQgKiBmcm9tICcuL0xpc3RlbmVyJztcbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5cbmV4cG9ydCBjbGFzcyBGb1Yge1xuICBwcml2YXRlIHZpc2libGl0eUNoZWNrOiAocG9zaXRpb246IENvcmUuUG9zaXRpb24pID0+IGJvb2xlYW47XG4gIHByaXZhdGUgd2lkdGg6IG51bWJlcjtcbiAgcHJpdmF0ZSBoZWlnaHQ6IG51bWJlcjtcbiAgcHJpdmF0ZSByYWRpdXM6IG51bWJlcjtcbiAgXG4gIHByaXZhdGUgc3RhcnRQb3NpdGlvbjogQ29yZS5Qb3NpdGlvbjtcbiAgcHJpdmF0ZSBsaWdodE1hcDogbnVtYmVyW11bXTtcblxuICBjb25zdHJ1Y3Rvcih2aXNpYmxpdHlDaGVjazogKHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uKSA9PiBib29sZWFuLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgcmFkaXVzOiBudW1iZXIpIHtcbiAgICB0aGlzLnZpc2libGl0eUNoZWNrID0gdmlzaWJsaXR5Q2hlY2s7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMucmFkaXVzID0gcmFkaXVzO1xuICB9XG5cbiAgY2FsY3VsYXRlKHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uKSB7XG4gICAgdGhpcy5zdGFydFBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgdGhpcy5saWdodE1hcCA9IENvcmUuVXRpbHMuYnVpbGRNYXRyaXg8bnVtYmVyPih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgMCk7XG5cbiAgICBpZiAoIXRoaXMudmlzaWJsaXR5Q2hlY2socG9zaXRpb24pKSB7XG4gICAgICByZXR1cm4gdGhpcy5saWdodE1hcDtcbiAgICB9XG5cbiAgICB0aGlzLmxpZ2h0TWFwW3Bvc2l0aW9uLnhdW3Bvc2l0aW9uLnldID0gMTtcbiAgICBDb3JlLlBvc2l0aW9uLmdldERpYWdvbmFsT2Zmc2V0cygpLmZvckVhY2goKG9mZnNldCkgPT4ge1xuICAgICAgdGhpcy5jYXN0TGlnaHQoMSwgMS4wLCAwLjAsIDAsIG9mZnNldC54LCBvZmZzZXQueSwgMCk7XG4gICAgICB0aGlzLmNhc3RMaWdodCgxLCAxLjAsIDAuMCwgb2Zmc2V0LngsIDAsIDAsIG9mZnNldC55KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLmxpZ2h0TWFwO1xuICB9XG5cbiAgcHJpdmF0ZSBjYXN0TGlnaHQocm93OiBudW1iZXIsIHN0YXJ0OiBudW1iZXIsIGVuZDogbnVtYmVyLCB4eDogbnVtYmVyLCB4eTogbnVtYmVyLCB5eDogbnVtYmVyLCB5eTogbnVtYmVyKSB7XG4gICAgbGV0IG5ld1N0YXJ0ID0gMDtcbiAgICBsZXQgYmxvY2tlZCA9IGZhbHNlO1xuXG4gICAgaWYgKHN0YXJ0IDwgZW5kKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yIChsZXQgZGlzdGFuY2UgPSByb3c7IGRpc3RhbmNlIDw9IHRoaXMucmFkaXVzICYmICFibG9ja2VkOyBkaXN0YW5jZSsrKSB7XG4gICAgICBsZXQgZGVsdGFZID0gLWRpc3RhbmNlO1xuICAgICAgZm9yIChsZXQgZGVsdGFYID0gLWRpc3RhbmNlOyBkZWx0YVggPD0gMDsgZGVsdGFYKyspIHtcbiAgICAgICAgbGV0IGN4ID0gdGhpcy5zdGFydFBvc2l0aW9uLnggKyAoZGVsdGFYICogeHgpICsgKGRlbHRhWSAqIHh5KTtcbiAgICAgICAgbGV0IGN5ID0gdGhpcy5zdGFydFBvc2l0aW9uLnkgKyAoZGVsdGFYICogeXgpICsgKGRlbHRhWSAqIHl5KTtcblxuICAgICAgICBsZXQgbGVmdFNsb3BlID0gKGRlbHRhWCAtIDAuNSkgLyAoZGVsdGFZICsgMC41KTtcbiAgICAgICAgbGV0IHJpZ2h0U2xvcGUgPSAoZGVsdGFYICsgMC41KSAvIChkZWx0YVkgLSAwLjUpO1xuXG4gICAgICAgIGlmICghKGN4ID49IDAgJiYgY3kgPj0gMCAmJiBjeCA8IHRoaXMud2lkdGggJiYgY3kgPCB0aGlzLmhlaWdodCkgfHwgc3RhcnQgPCByaWdodFNsb3BlKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH0gZWxzZSBpZiAoZW5kID4gbGVmdFNsb3BlKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZGlzdCA9IE1hdGgubWF4KE1hdGguYWJzKGRlbHRhWCksIE1hdGguYWJzKGRlbHRhWSkpO1xuXG4gICAgICAgIGlmIChkaXN0IDw9IHRoaXMucmFkaXVzKSB7XG4gICAgICAgICAgdGhpcy5saWdodE1hcFtjeF1bY3ldID0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChibG9ja2VkKSB7XG4gICAgICAgICAgaWYgKCF0aGlzLnZpc2libGl0eUNoZWNrKG5ldyBDb3JlLlBvc2l0aW9uKGN4LCBjeSkpKSB7XG4gICAgICAgICAgICBuZXdTdGFydCA9IHJpZ2h0U2xvcGU7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmxvY2tlZCA9IGZhbHNlO1xuICAgICAgICAgICAgc3RhcnQgPSBuZXdTdGFydDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMudmlzaWJsaXR5Q2hlY2sobmV3IENvcmUuUG9zaXRpb24oY3gsIGN5KSkgJiYgZGlzdGFuY2UgPD0gdGhpcy5yYWRpdXMpIHtcbiAgICAgICAgICBibG9ja2VkID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLmNhc3RMaWdodChkaXN0YW5jZSArIDEsIHN0YXJ0LCBsZWZ0U2xvcGUsIHh4LCB4eSwgeXgsIHl5KTtcbiAgICAgICAgICBuZXdTdGFydCA9IHJpZ2h0U2xvcGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIE1hcCBmcm9tICcuL2luZGV4JztcblxuZXhwb3J0IGNsYXNzIE1hemVSZWN1cnNpdmVCYWNrdHJhY2tHZW5lcmF0b3Ige1xuICBwcml2YXRlIHdpZHRoOiBudW1iZXI7XG4gIHByaXZhdGUgaGVpZ2h0OiBudW1iZXI7XG5cbiAgcHJpdmF0ZSBtYXhBdHRlbXBzOiBudW1iZXI7XG4gIHByaXZhdGUgYXR0ZW1wdHM6IG51bWJlcjtcblxuICBwcml2YXRlIHN0YWNrOiBDb3JlLlBvc2l0aW9uW107XG5cbiAgcHJpdmF0ZSBtYXA6IG51bWJlcltdW107XG5cbiAgY29uc3RydWN0b3IobWFwOiBudW1iZXJbXVtdLCBwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbikge1xuICAgIHRoaXMubWFwID0gbWFwO1xuICAgIHRoaXMud2lkdGggPSB0aGlzLm1hcC5sZW5ndGg7XG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLm1hcFswXS5sZW5ndGg7XG5cbiAgICB0aGlzLm1heEF0dGVtcHMgPSA1MDAwMDtcbiAgICB0aGlzLmF0dGVtcHRzID0gMDtcblxuICAgIHRoaXMuc3RhY2sgPSBbXTtcbiAgICB0aGlzLm1hcFtwb3NpdGlvbi54XVtwb3NpdGlvbi55XSA9IDA7XG4gICAgdGhpcy5wb3B1bGF0ZVN0YWNrKHBvc2l0aW9uKTtcbiAgfVxuXG4gIHByaXZhdGUgcG9wdWxhdGVTdGFjayhwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbikge1xuICAgIGNvbnN0IG5laWdoYm91cnMgPSBDb3JlLlBvc2l0aW9uLmdldE5laWdoYm91cnMocG9zaXRpb24sIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0cnVlKTtcbiAgICBjb25zdCBuZXdDZWxscyA9IFtdO1xuICAgIGZvciAobGV0IGRpcmVjdGlvbiBpbiBuZWlnaGJvdXJzKSB7XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IG5laWdoYm91cnNbZGlyZWN0aW9uXTtcbiAgICAgIGlmIChwb3NpdGlvbiAmJiBNYXAuVXRpbHMuY2FuQ2FydmUodGhpcy5tYXAsIHBvc2l0aW9uLCAxKSkge1xuICAgICAgICBuZXdDZWxscy5wdXNoKHBvc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG5ld0NlbGxzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuc3RhY2sgPSB0aGlzLnN0YWNrLmNvbmNhdChDb3JlLlV0aWxzLnJhbmRvbWl6ZUFycmF5KG5ld0NlbGxzKSk7XG4gICAgfVxuICB9XG5cbiAgaXRlcmF0ZSgpIHtcbiAgICB0aGlzLmF0dGVtcHRzKys7XG5cbiAgICBpZiAodGhpcy5hdHRlbXB0cyA+IHRoaXMubWF4QXR0ZW1wcykge1xuICAgICAgY29uc29sZS5sb2coJ21heCBhdHRlbXB0cyBkb25lJyk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgbGV0IHBvczogQ29yZS5Qb3NpdGlvbjtcbiAgICB3aGlsZSAodGhpcy5zdGFjayAmJiB0aGlzLnN0YWNrLmxlbmd0aCA+IDApIHtcbiAgICAgIHBvcyA9IHRoaXMuc3RhY2sucG9wKCk7XG5cbiAgICAgIGlmIChNYXAuVXRpbHMuY2FuRXh0ZW5kVHVubmVsKHRoaXMubWFwLCBwb3MpKSB7XG4gICAgICAgIHRoaXMubWFwW3Bvcy54XVtwb3MueV0gPSAwO1xuICAgICAgICB0aGlzLnBvcHVsYXRlU3RhY2socG9zKTtcblxuICAgICAgICByZXR1cm4gcG9zOyBcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBnZXRNYXAoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwO1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgTWFwIGZyb20gJy4vaW5kZXgnO1xuXG5leHBvcnQgY2xhc3MgUm9vbUdlbmVyYXRvciB7XG4gIHByaXZhdGUgbWFwOiBudW1iZXJbXVtdO1xuXG4gIHByaXZhdGUgd2lkdGg6IG51bWJlcjtcbiAgcHJpdmF0ZSBoZWlnaHQ6IG51bWJlcjtcblxuICBwcml2YXRlIG1heEF0dGVtcHRzOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IobWFwOiBudW1iZXJbXVtdLCBtYXhBdHRlbXB0czogbnVtYmVyID0gNTAwKSB7XG4gICAgdGhpcy5tYXAgPSBtYXA7XG5cbiAgICB0aGlzLndpZHRoID0gdGhpcy5tYXAubGVuZ3RoO1xuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5tYXBbMF0ubGVuZ3RoO1xuXG4gICAgdGhpcy5tYXhBdHRlbXB0cyA9IG1heEF0dGVtcHRzO1xuICB9XG5cbiAgcHJpdmF0ZSBpc1NwYWNlQXZhaWxhYmxlKHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgIGZvciAobGV0IGkgPSB4OyBpIDwgeCArIHdpZHRoOyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSB5OyBqIDwgeSArIGhlaWdodDsgaisrKSB7XG4gICAgICAgIGlmICghTWFwLlV0aWxzLmNhbkNhcnZlKHRoaXMubWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihpLCBqKSwgMCwgdHJ1ZSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpdGVyYXRlKCkge1xuICAgIGxldCByb29tR2VuZXJhdGVkID0gZmFsc2U7XG4gICAgbGV0IGF0dGVtcHRzID0gMDtcbiAgICB3aGlsZSAoIXJvb21HZW5lcmF0ZWQgJiYgYXR0ZW1wdHMgPCB0aGlzLm1heEF0dGVtcHRzKSB7XG4gICAgICByb29tR2VuZXJhdGVkID0gdGhpcy5nZW5lcmF0ZVJvb20oKTtcbiAgICAgIGF0dGVtcHRzKytcbiAgICB9XG5cbiAgICByZXR1cm4gcm9vbUdlbmVyYXRlZDtcbiAgfVxuXG4gIHByaXZhdGUgZ2VuZXJhdGVSb29tKCkge1xuICAgIGNvbnN0IHNpemUgPSBDb3JlLlV0aWxzLmdldFJhbmRvbSgzLCA1KTtcbiAgICBjb25zdCByZWN0YW5ndWxhcml0eSA9IENvcmUuVXRpbHMuZ2V0UmFuZG9tKDEsIDMpO1xuICAgIGxldCB3aWR0aDogbnVtYmVyO1xuICAgIGxldCBoZWlnaHQ6IG51bWJlcjtcbiAgICBpZiAoTWF0aC5yYW5kb20oKSA+IDAuNSkge1xuICAgICAgaGVpZ2h0ID0gc2l6ZTtcbiAgICAgIHdpZHRoID0gc2l6ZSArIHJlY3Rhbmd1bGFyaXR5O1xuICAgIH0gZWxzZSB7XG4gICAgICB3aWR0aCA9IHNpemU7XG4gICAgICBoZWlnaHQgPSBzaXplICsgcmVjdGFuZ3VsYXJpdHk7XG4gICAgfVxuXG4gICAgbGV0IHggPSBDb3JlLlV0aWxzLmdldFJhbmRvbSgwLCAodGhpcy53aWR0aCAtIHdpZHRoIC0gMikpO1xuICAgIHggPSBNYXRoLmZsb29yKHgvMikgKiAyICsgMTtcbiAgICBsZXQgeSA9IENvcmUuVXRpbHMuZ2V0UmFuZG9tKDAsICh0aGlzLmhlaWdodCAtIGhlaWdodCAtIDIpKTtcbiAgICB5ID0gTWF0aC5mbG9vcih5LzIpICogMiArIDE7XG5cbiAgICBpZiAodGhpcy5pc1NwYWNlQXZhaWxhYmxlKHgsIHksIHdpZHRoLCBoZWlnaHQpKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSB4OyBpIDwgeCArIHdpZHRoOyBpKyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSB5OyBqIDwgeSArIGhlaWdodDsgaisrKSB7XG4gICAgICAgICAgICAgIHRoaXMubWFwW2ldW2pdID0gMDsgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZ2V0TWFwKCkge1xuICAgIHJldHVybiB0aGlzLm1hcDtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIE1hcCBmcm9tICcuL2luZGV4JztcblxuZXhwb3J0IGNsYXNzIFRvcG9sb2d5Q29tYmluYXRvciB7XG4gIHByaXZhdGUgbWFwOiBudW1iZXJbXVtdO1xuICBwcml2YXRlIHRvcG9sb2dpZXM6IG51bWJlcltdW107XG5cbiAgcHJpdmF0ZSB3aWR0aDogbnVtYmVyO1xuICBwcml2YXRlIGhlaWdodDogbnVtYmVyO1xuXG4gIHByaXZhdGUgdG9wb2xvZ3lJZDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKG1hcDogbnVtYmVyW11bXSkge1xuICAgIHRoaXMubWFwID0gbWFwO1xuXG4gICAgdGhpcy53aWR0aCA9IHRoaXMubWFwLmxlbmd0aDtcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMubWFwWzBdLmxlbmd0aDtcblxuICAgIHRoaXMudG9wb2xvZ2llcyA9IFtdO1xuXG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgIHRoaXMudG9wb2xvZ2llc1t4XSA9IFtdO1xuICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgIHRoaXMudG9wb2xvZ2llc1t4XVt5XSA9IDA7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0TWFwKCkge1xuICAgIHJldHVybiB0aGlzLm1hcDtcbiAgfVxuXG4gIGluaXRpYWxpemUoKTogbnVtYmVyW11bXSB7XG4gICAgdGhpcy50b3BvbG9neUlkID0gMDtcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgIHRoaXMuYWRkVG9wb2xvZ3kobmV3IENvcmUuUG9zaXRpb24oeCwgeSkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy50b3BvbG9naWVzO1xuICB9XG5cbiAgY29tYmluZSgpIHtcbiAgICBsZXQgaSA9IDI7XG4gICAgY29uc3QgbWF4ID0gdGhpcy50b3BvbG9neUlkO1xuICAgIGxldCByZW1haW5pbmdUb3BvbG9naWVzID0gW107XG4gICAgZm9yICh2YXIgaiA9IDI7IGogPD0gdGhpcy50b3BvbG9neUlkOyBqKyspIHtcbiAgICAgIHJlbWFpbmluZ1RvcG9sb2dpZXMucHVzaChqKTtcbiAgICB9XG4gICAgd2hpbGUgKHJlbWFpbmluZ1RvcG9sb2dpZXMubGVuZ3RoID4gMCAmJiBpIDwgbWF4ICogNSkge1xuICAgICAgbGV0IHRvcG9sb2d5SWQgPSByZW1haW5pbmdUb3BvbG9naWVzLnNoaWZ0KCk7XG4gICAgICBpKys7XG4gICAgICBpZiAoIXRoaXMuY29tYmluZVRvcG9sb2d5KDEsIHRvcG9sb2d5SWQpKSB7XG4gICAgICAgIHJlbWFpbmluZ1RvcG9sb2dpZXMucHVzaCh0b3BvbG9neUlkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlbWFpbmluZ1RvcG9sb2dpZXMubGVuZ3RoO1xuICB9XG5cbiAgcHJpdmF0ZSBjb21iaW5lVG9wb2xvZ3koYTogbnVtYmVyLCBiOiBudW1iZXIpIHtcbiAgICBjb25zdCBlZGdlcyA9IHRoaXMuZ2V0RWRnZXMoYSwgYik7XG4gICAgaWYgKGVkZ2VzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGxldCBjb21iaW5lZCA9IGZhbHNlO1xuXG4gICAgd2hpbGUgKCFjb21iaW5lZCAmJiBlZGdlcy5sZW5ndGggPiAwKSB7XG4gICAgICBsZXQgaWR4ID0gQ29yZS5VdGlscy5nZXRSYW5kb20oMCwgZWRnZXMubGVuZ3RoIC0gMSk7IFxuICAgICAgbGV0IGVkZ2UgPSBlZGdlc1tpZHhdO1xuICAgICAgZWRnZXMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICBsZXQgc3Vycm91bmRpbmdUaWxlcyA9IE1hcC5VdGlscy5jb3VudFN1cnJvdW5kaW5nVGlsZXModGhpcy5tYXAsIGVkZ2UpO1xuICAgICAgaWYgKHN1cnJvdW5kaW5nVGlsZXMgPT09IDIpIHtcbiAgICAgICAgdGhpcy5tYXBbZWRnZS54XVtlZGdlLnldID0gMDtcbiAgICAgICAgdGhpcy50b3BvbG9naWVzW2VkZ2UueF1bZWRnZS55XSA9IGE7XG4gICAgICAgIGlmIChlZGdlcy5sZW5ndGggPj0gNCkge1xuICAgICAgICAgIGlmIChNYXRoLnJhbmRvbSgpID4gMC4yKSB7XG4gICAgICAgICAgICBjb21iaW5lZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbWJpbmVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb21iaW5lZCkge1xuICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgaWYgKHRoaXMudG9wb2xvZ2llc1t4XVt5XSA9PT0gYikge1xuICAgICAgICAgICAgdGhpcy50b3BvbG9naWVzW3hdW3ldID0gYTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbWJpbmVkO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRFZGdlcyhhOiBudW1iZXIsIGI6IG51bWJlcikge1xuICAgIGNvbnN0IGhhc1RvcG9sb2d5TmVpZ2hib3VyID0gKHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uLCB0b3BvbG9neUlkOiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IG5laWdoYm91cnMgPSBDb3JlLlBvc2l0aW9uLmdldE5laWdoYm91cnMocG9zaXRpb24sIC0xLCAtMSwgdHJ1ZSk7XG4gICAgICByZXR1cm4gbmVpZ2hib3Vycy5maWx0ZXIoKHBvc2l0aW9uKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnRvcG9sb2dpZXNbcG9zaXRpb24ueF1bcG9zaXRpb24ueV0gPT09IHRvcG9sb2d5SWRcbiAgICAgIH0pLmxlbmd0aCA+IDA7XG4gICAgfVxuICAgIGxldCBlZGdlcyA9IFtdO1xuICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgbGV0IHBvc2l0aW9uID0gbmV3IENvcmUuUG9zaXRpb24oeCwgeSk7XG4gICAgICAgIGlmIChoYXNUb3BvbG9neU5laWdoYm91cihwb3NpdGlvbiwgYSkgJiYgaGFzVG9wb2xvZ3lOZWlnaGJvdXIocG9zaXRpb24sIGIpKSB7XG4gICAgICAgICAgZWRnZXMucHVzaChwb3NpdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGVkZ2VzO1xuICB9XG5cbiAgcHJpdmF0ZSBhZGRUb3BvbG9neShwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbiwgdG9wb2xvZ3lJZDogbnVtYmVyID0gLTEpIHtcbiAgICBjb25zdCB4ID0gcG9zaXRpb24ueDtcbiAgICBjb25zdCB5ID0gcG9zaXRpb24ueTtcbiAgICBpZiAodGhpcy5tYXBbeF1beV0gIT09IDAgfHwgdGhpcy50b3BvbG9naWVzW3hdW3ldICE9PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRvcG9sb2d5SWQgPT09IC0xKSB7XG4gICAgICB0aGlzLnRvcG9sb2d5SWQrKztcbiAgICAgIHRvcG9sb2d5SWQgPSB0aGlzLnRvcG9sb2d5SWQ7XG4gICAgfVxuXG4gICAgdGhpcy50b3BvbG9naWVzW3hdW3ldID0gdG9wb2xvZ3lJZDtcblxuICAgIGNvbnN0IG5laWdoYm91cnMgPSBDb3JlLlBvc2l0aW9uLmdldE5laWdoYm91cnMobmV3IENvcmUuUG9zaXRpb24oeCwgeSksIC0xLCAtMSwgdHJ1ZSk7XG4gICAgbmVpZ2hib3Vycy5mb3JFYWNoKChwb3NpdGlvbikgPT4ge1xuICAgICAgaWYgKHRoaXMubWFwW3Bvc2l0aW9uLnhdW3Bvc2l0aW9uLnldID09PSAwICYmIHRoaXMudG9wb2xvZ2llc1twb3NpdGlvbi54XVtwb3NpdGlvbi55XSA9PT0gMCkge1xuICAgICAgICB0aGlzLmFkZFRvcG9sb2d5KHBvc2l0aW9uLCB0b3BvbG9neUlkKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcHJ1bmVEZWFkRW5kKHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uKSB7XG4gICAgaWYgKHRoaXMubWFwW3Bvc2l0aW9uLnhdW3Bvc2l0aW9uLnldID09PSAwKSB7XG4gICAgICBsZXQgc3Vycm91bmRpbmdUaWxlcyA9IE1hcC5VdGlscy5jb3VudFN1cnJvdW5kaW5nVGlsZXModGhpcy5tYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpKTtcbiAgICAgIGlmIChzdXJyb3VuZGluZ1RpbGVzIDw9IDEpIHtcbiAgICAgICAgdGhpcy5tYXBbcG9zaXRpb24ueF1bcG9zaXRpb24ueV0gPSAxO1xuICAgICAgICBDb3JlLlBvc2l0aW9uLmdldE5laWdoYm91cnMocG9zaXRpb24sIC0xLCAtMSwgdHJ1ZSkuZm9yRWFjaCgobmVpZ2hib3VyKSA9PiB7XG4gICAgICAgICAgdGhpcy5wcnVuZURlYWRFbmQobmVpZ2hib3VyKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJ1bmVEZWFkRW5kcygpIHtcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgIGlmICh0aGlzLm1hcFt4XVt5XSA9PT0gMCkge1xuICAgICAgICAgIHRoaXMucHJ1bmVEZWFkRW5kKG5ldyBDb3JlLlBvc2l0aW9uKHgsIHkpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcblxuZW51bSBEaXJlY3Rpb24ge1xuICBOb25lID0gMSxcbiAgTm9ydGgsXG4gIEVhc3QsXG4gIFNvdXRoLFxuICBXZXN0LFxufVxuXG5leHBvcnQgbmFtZXNwYWNlIFV0aWxzIHtcbiAgZnVuY3Rpb24gY2FydmVhYmxlKG1hcDogbnVtYmVyW11bXSwgcG9zaXRpb246IENvcmUuUG9zaXRpb24pIHtcbiAgICBpZiAocG9zaXRpb24ueCA8IDAgfHwgcG9zaXRpb24ueCA+IG1hcC5sZW5ndGggLSAxKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChwb3NpdGlvbi55IDwgMCB8fCBwb3NpdGlvbi55ID4gbWFwWzBdLmxlbmd0aCAtIDEpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIG1hcFtwb3NpdGlvbi54XVtwb3NpdGlvbi55XSA9PT0gMTtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBmaW5kQ2FydmVhYmxlU3BvdChtYXA6IG51bWJlcltdW10pIHtcbiAgICBjb25zdCB3aWR0aCA9IG1hcC5sZW5ndGg7XG4gICAgY29uc3QgaGVpZ2h0ID0gbWFwWzBdLmxlbmd0aDtcblxuICAgIGxldCBwb3NpdGlvbiA9IG51bGw7XG5cbiAgICBsZXQgY2FydmFibGVzUG9zaXRpb25zID0gW107XG5cbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHdpZHRoOyB4KyspIHtcbiAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgbGV0IHBvc2l0aW9uID0gbmV3IENvcmUuUG9zaXRpb24oQ29yZS5VdGlscy5nZXRSYW5kb20oMCwgd2lkdGgpLCBDb3JlLlV0aWxzLmdldFJhbmRvbSgwLCBoZWlnaHQpKTtcbiAgICAgICAgaWYgKFV0aWxzLmNhbkNhcnZlKG1hcCwgcG9zaXRpb24sIDAsIHRydWUpKSB7XG4gICAgICAgICAgY2FydmFibGVzUG9zaXRpb25zLnB1c2gocG9zaXRpb24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNhcnZhYmxlc1Bvc2l0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gQ29yZS5VdGlscy5nZXRSYW5kb21JbmRleChjYXJ2YWJsZXNQb3NpdGlvbnMpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBjb3VudFN1cnJvdW5kaW5nVGlsZXMobWFwOiBudW1iZXJbXVtdLCBwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbiwgY2hlY2tEaWFnb25hbHM6IGJvb2xlYW4gPSBmYWxzZSk6IG51bWJlciB7XG4gICAgbGV0IGNvbm5lY3Rpb25zID0gMDtcbiAgICByZXR1cm4gQ29yZS5Qb3NpdGlvbi5nZXROZWlnaGJvdXJzKHBvc2l0aW9uLCBtYXAubGVuZ3RoLCBtYXBbMF0ubGVuZ3RoLCAhY2hlY2tEaWFnb25hbHMpLmZpbHRlcigocG9zKSA9PiB7XG4gICAgICByZXR1cm4gbWFwW3Bvcy54XVtwb3MueV0gPT09IDA7XG4gICAgfSkubGVuZ3RoO1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIGNhbkNhcnZlKG1hcDogbnVtYmVyW11bXSwgcG9zaXRpb246IENvcmUuUG9zaXRpb24sIGFsbG93ZWRDb25uZWN0aW9uczogbnVtYmVyID0gMCwgY2hlY2tEaWFnb25hbHM6IGJvb2xlYW4gPSBmYWxzZSk6IGJvb2xlYW4ge1xuICAgIGlmICghY2FydmVhYmxlKG1hcCwgcG9zaXRpb24pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNvdW50U3Vycm91bmRpbmdUaWxlcyhtYXAsIHBvc2l0aW9uLCBjaGVja0RpYWdvbmFscykgPD0gYWxsb3dlZENvbm5lY3Rpb25zO1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIGNhbkV4dGVuZFR1bm5lbChtYXA6IG51bWJlcltdW10sIHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uKSB7XG4gICAgaWYgKCFjYXJ2ZWFibGUobWFwLCBwb3NpdGlvbikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgbGV0IGNvbm5lY3RlZEZyb20gPSBEaXJlY3Rpb24uTm9uZTtcbiAgICBsZXQgY29ubmVjdGlvbnMgPSAwO1xuXG4gICAgaWYgKHBvc2l0aW9uLnkgPiAwICYmIG1hcFtwb3NpdGlvbi54XVtwb3NpdGlvbi55IC0gMV0gPT09IDApIHtcbiAgICAgIGNvbm5lY3RlZEZyb20gPSBEaXJlY3Rpb24uTm9ydGg7XG4gICAgICBjb25uZWN0aW9ucysrO1xuICAgIH1cbiAgICBpZiAocG9zaXRpb24ueSA8IG1hcFswXS5sZW5ndGggLSAxICYmIG1hcFtwb3NpdGlvbi54XVtwb3NpdGlvbi55ICsgMV0gPT09IDApIHtcbiAgICAgIGNvbm5lY3RlZEZyb20gPSBEaXJlY3Rpb24uU291dGg7XG4gICAgICBjb25uZWN0aW9ucysrO1xuICAgIH1cbiAgICBpZiAocG9zaXRpb24ueCA+IDAgJiYgbWFwW3Bvc2l0aW9uLnggLSAxXVtwb3NpdGlvbi55XSA9PT0gMCkge1xuICAgICAgY29ubmVjdGVkRnJvbSA9IERpcmVjdGlvbi5XZXN0O1xuICAgICAgY29ubmVjdGlvbnMrKztcbiAgICB9XG4gICAgaWYgKHBvc2l0aW9uLnggPCBtYXAubGVuZ3RoIC0gMSAmJiBtYXBbcG9zaXRpb24ueCArIDFdW3Bvc2l0aW9uLnldID09PSAwKSB7XG4gICAgICBjb25uZWN0ZWRGcm9tID0gRGlyZWN0aW9uLkVhc3Q7XG4gICAgICBjb25uZWN0aW9ucysrO1xuICAgIH1cblxuICAgIGlmIChjb25uZWN0aW9ucyA+IDEpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2FuRXh0ZW5kVHVubmVsRnJvbShtYXAsIHBvc2l0aW9uLCBjb25uZWN0ZWRGcm9tKTtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBjYW5FeHRlbmRUdW5uZWxGcm9tKG1hcDogbnVtYmVyW11bXSwgcG9zaXRpb246IENvcmUuUG9zaXRpb24sIGRpcmVjdGlvbjogRGlyZWN0aW9uKSB7XG4gICAgaWYgKG1hcFtwb3NpdGlvbi54XVtwb3NpdGlvbi55XSA9PT0gMCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHN3aXRjaCAoZGlyZWN0aW9uKSB7XG4gICAgICBjYXNlIERpcmVjdGlvbi5Tb3V0aDpcbiAgICAgICAgcmV0dXJuIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLnggLSAxLCBwb3NpdGlvbi55KSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54IC0gMSwgcG9zaXRpb24ueSAtIDEpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgLSAxKSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54ICsgMSwgcG9zaXRpb24ueSAtIDEpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLnggKyAxLCBwb3NpdGlvbi55KSk7XG4gICAgICBjYXNlIERpcmVjdGlvbi5Ob3J0aDpcbiAgICAgICAgcmV0dXJuIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLnggKyAxLCBwb3NpdGlvbi55KSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54ICsgMSwgcG9zaXRpb24ueSArIDEpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgKyAxKSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54IC0gMSwgcG9zaXRpb24ueSArIDEpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLnggLSAxLCBwb3NpdGlvbi55KSk7XG4gICAgICBjYXNlIERpcmVjdGlvbi5XZXN0OlxuICAgICAgICByZXR1cm4gY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCwgcG9zaXRpb24ueSAtIDEpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLnggKyAxLCBwb3NpdGlvbi55IC0gMSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCArIDEsIHBvc2l0aW9uLnkpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLnggKyAxLCBwb3NpdGlvbi55ICsgMSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCwgcG9zaXRpb24ueSArIDEpKTtcbiAgICAgIGNhc2UgRGlyZWN0aW9uLkVhc3Q6XG4gICAgICAgIHJldHVybiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54LCBwb3NpdGlvbi55IC0gMSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCAtIDEsIHBvc2l0aW9uLnkgLSAxKSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54IC0gMSwgcG9zaXRpb24ueSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCAtIDEsIHBvc2l0aW9uLnkgKyAxKSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54LCBwb3NpdGlvbi55ICsgMSkpO1xuICAgICAgY2FzZSBEaXJlY3Rpb24uTm9uZTpcbiAgICAgICAgcmV0dXJuIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgLSAxKSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54IC0gMSwgcG9zaXRpb24ueSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCwgcG9zaXRpb24ueSArIDEpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLnggKyAxLCBwb3NpdGlvbi55KSk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9Sb29tR2VuZXJhdG9yJztcbmV4cG9ydCAqIGZyb20gJy4vTWF6ZVJlY3Vyc2l2ZUJhY2t0cmFja0dlbmVyYXRvcic7XG5leHBvcnQgKiBmcm9tICcuL1V0aWxzJztcbmV4cG9ydCAqIGZyb20gJy4vRm9WJztcbmV4cG9ydCAqIGZyb20gJy4vVG9wb2xvZ3lDb21iaW5hdG9yJztcbiIsImltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIElFdmVudEhhbmRsZXIge1xuICBsaXN0ZW46IChsaXN0ZW5lcjogRXZlbnRzLkxpc3RlbmVyKSA9PiBFdmVudHMuTGlzdGVuZXI7XG4gIHJlbW92ZUxpc3RlbmVyOiAobGlzdGVuZXI6IEV2ZW50cy5MaXN0ZW5lcikgPT4gdm9pZDtcbiAgZW1pdDogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IHZvaWQ7XG4gIGZpcmU6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiBhbnk7XG4gIGlzOiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gYm9vbGVhbjtcbiAgZ2F0aGVyOiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gYW55W107XG59XG5cbmV4cG9ydCBjbGFzcyBFdmVudEhhbmRsZXIgaW1wbGVtZW50cyBJRXZlbnRIYW5kbGVyIHtcbiAgcHJpdmF0ZSBsaXN0ZW5lcnM6IHtbZXZlbnQ6IHN0cmluZ106IEV2ZW50cy5MaXN0ZW5lcltdfSA9IHt9O1xuXG4gIGxpc3RlbihsaXN0ZW5lcjogRXZlbnRzLkxpc3RlbmVyKSB7XG4gICAgaWYgKCF0aGlzLmxpc3RlbmVycykge1xuICAgICAgdGhpcy5saXN0ZW5lcnMgPSB7fTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tsaXN0ZW5lci50eXBlXSkge1xuICAgICAgdGhpcy5saXN0ZW5lcnNbbGlzdGVuZXIudHlwZV0gPSBbXTtcbiAgICB9XG5cbiAgICB0aGlzLmxpc3RlbmVyc1tsaXN0ZW5lci50eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgICB0aGlzLmxpc3RlbmVyc1tsaXN0ZW5lci50eXBlXSA9IHRoaXMubGlzdGVuZXJzW2xpc3RlbmVyLnR5cGVdLnNvcnQoKGE6IEV2ZW50cy5MaXN0ZW5lciwgYjogRXZlbnRzLkxpc3RlbmVyKSA9PiBhLnByaW9yaXR5IC0gYi5wcmlvcml0eSk7XG5cbiAgICByZXR1cm4gbGlzdGVuZXI7XG4gIH1cblxuICByZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcjogRXZlbnRzLkxpc3RlbmVyKSB7XG4gICAgaWYgKCF0aGlzLmxpc3RlbmVycyB8fCAhdGhpcy5saXN0ZW5lcnNbbGlzdGVuZXIudHlwZV0pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGlkeCA9IHRoaXMubGlzdGVuZXJzW2xpc3RlbmVyLnR5cGVdLmZpbmRJbmRleCgobCkgPT4ge1xuICAgICAgcmV0dXJuIGwuZ3VpZCA9PT0gbGlzdGVuZXIuZ3VpZDtcbiAgICB9KTtcbiAgICBpZiAodHlwZW9mIGlkeCA9PT0gJ251bWJlcicpIHtcbiAgICAgIHRoaXMubGlzdGVuZXJzW2xpc3RlbmVyLnR5cGVdLnNwbGljZShpZHgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIGVtaXQoZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGlmICghdGhpcy5saXN0ZW5lcnNbZXZlbnQudHlwZV0pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyc1tldmVudC50eXBlXS5tYXAoKGkpID0+IGkpO1xuXG4gICAgbGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XG4gICAgICBsaXN0ZW5lci5jYWxsYmFjayhldmVudCk7XG4gICAgfSk7XG4gIH1cblxuICBpcyhldmVudDogRXZlbnRzLkV2ZW50KTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tldmVudC50eXBlXSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgbGV0IHJldHVybmVkVmFsdWUgPSB0cnVlO1xuXG4gICAgdGhpcy5saXN0ZW5lcnNbZXZlbnQudHlwZV0uZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgIGlmICghcmV0dXJuZWRWYWx1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXR1cm5lZFZhbHVlID0gbGlzdGVuZXIuY2FsbGJhY2soZXZlbnQpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXR1cm5lZFZhbHVlO1xuICB9XG5cbiAgZmlyZShldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tldmVudC50eXBlXSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IHJldHVybmVkVmFsdWUgPSBudWxsO1xuXG4gICAgdGhpcy5saXN0ZW5lcnNbZXZlbnQudHlwZV0uZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgIHJldHVybmVkVmFsdWUgPSBsaXN0ZW5lci5jYWxsYmFjayhldmVudCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJldHVybmVkVmFsdWU7XG4gIH1cblxuICBnYXRoZXIoZXZlbnQ6IEV2ZW50cy5FdmVudCk6IGFueVtdIHtcbiAgICBpZiAoIXRoaXMubGlzdGVuZXJzW2V2ZW50LnR5cGVdKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgbGV0IHZhbHVlcyA9IFtdXG5cbiAgICB0aGlzLmxpc3RlbmVyc1tldmVudC50eXBlXS5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgdmFsdWVzLnB1c2gobGlzdGVuZXIuY2FsbGJhY2soZXZlbnQpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdmFsdWVzO1xuICB9XG59XG4iLCJleHBvcnQgKiBmcm9tICcuL0V2ZW50SGFuZGxlcic7XG4iXX0=
