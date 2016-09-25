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

},{"./Glyph":4,"./core":35}],2:[function(require,module,exports){
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

},{"./InputHandler":5,"./PixiConsole":10,"./components":32,"./core":35,"./entities":38,"./events":41,"./mixins":43}],3:[function(require,module,exports){
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
    function LogView(engine, width, height) {
        _classCallCheck(this, LogView);

        this.engine = engine;
        this.width = width;
        this.height = height;
        this.registerListeners();
        this.console = new Console(this.width, this.height);
        this.currentTurn = 1;
        this.messages = [];
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
            if (this.messages.length > this.height) {
                this.messages.pop();
            }
        }
    }, {
        key: 'render',
        value: function render(blitFunction) {
            var _this = this;

            this.console.setText(' ', this.width - 10, 0, 10);
            this.console.print('Turn: ' + this.currentTurn, this.width - 10, 0, 0xffffff);
            if (this.messages.length > 0) {
                (function () {
                    var maxHeight = _this.messages.length - 1;
                    _this.messages.forEach(function (data, idx) {
                        var color = 0xffffff;
                        if (data.turn < _this.currentTurn - 5) {
                            color = 0x666666;
                        } else if (data.turn < _this.currentTurn - 2) {
                            color = 0xaaaaaa;
                        }
                        _this.console.print(data.message, 0, maxHeight - idx, color);
                    });
                })();
            }
            blitFunction(this.console);
        }
    }]);

    return LogView;
}();

module.exports = LogView;

},{"./Console":1,"./events":41}],7:[function(require,module,exports){
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

},{"./Tile":12,"./core":35}],8:[function(require,module,exports){
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

},{"./Glyph":4,"./Map":7,"./Tile":12,"./core":35}],9:[function(require,module,exports){
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

},{"./Console":1,"./components":32,"./events":41}],10:[function(require,module,exports){
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

},{"./Glyph":4,"./core":35}],11:[function(require,module,exports){
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
            this.logView = new LogView(this.engine, this.width, 5);
            this.generateWily();
            this.generateRats();
        }
    }, {
        key: 'generateWily',
        value: function generateWily() {
            this.positionEntity(Entities.createWily(this.engine));
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
                positioned = this.canMove(position);
            }
            if (positioned) {
                component.moveTo(position);
            }
        }
    }, {
        key: 'registerListeners',
        value: function registerListeners() {
            this.engine.listen(new Events.Listener('canMove', this.onCanMove.bind(this)));
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
        key: 'onCanMove',
        value: function onCanMove(event) {
            var position = event.data.position;
            return this.canMove(position);
        }
    }, {
        key: 'canMove',
        value: function canMove(position) {
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

},{"./Exceptions":3,"./LogView":6,"./MapGenerator":8,"./MapView":9,"./components":32,"./core":35,"./entities":38,"./events":41}],12:[function(require,module,exports){
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
            var canMove = false;
            var position = null;
            while (!canMove && positions.length > 0) {
                position = positions.pop();
                canMove = this.engine.can(new Events.Event('canMove', { position: position }));
            }
            if (canMove) {
                return new Behaviours.WalkAction(this.physicsComponent, position);
            } else {
                return new Behaviours.NullAction();
            }
        }
    }]);

    return RandomWalkBehaviour;
}(Behaviours.Behaviour);

exports.RandomWalkBehaviour = RandomWalkBehaviour;

},{"../components":32,"../core":35,"../events":41,"./index":20}],18:[function(require,module,exports){
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
            var rune = new Entities.Entity(this.engine, 'Rune');
            rune.addComponent(new Components.PhysicsComponent(this.engine, {
                position: this.physics.position,
                blocking: false
            }));
            rune.addComponent(new Components.RenderableComponent(this.engine, {
                glyph: new Glyph('#', 0x00ffaa, 0x000000)
            }));
            rune.addComponent(new Components.SelfDestructComponent(this.engine, {
                turns: 10
            }));
            rune.addComponent(new Components.RuneDamageComponent(this.engine));
            return this.cost;
        }
    }]);

    return WriteRuneAction;
}(Behaviours.Action);

exports.WriteRuneAction = WriteRuneAction;

},{"../Glyph":4,"../components":32,"../entities":38,"./index":20}],20:[function(require,module,exports){
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

},{"../Exceptions":3,"../core":35}],22:[function(require,module,exports){
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
        var data = arguments.length <= 1 || arguments[1] === undefined ? { regenratationRate: 100, max: 1000 } : arguments[1];

        _classCallCheck(this, EnergyComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(EnergyComponent).call(this, engine));

        _this._currentEnergy = _this._maxEnergy = data.max;
        _this._energyRegenerationRate = data.regenratationRate;
        return _this;
    }

    _createClass(EnergyComponent, [{
        key: 'registerListeners',
        value: function registerListeners() {
            this.listeners.push(this.engine.listen(new Events.Listener('tick', this.onTick.bind(this))));
        }
    }, {
        key: 'onTick',
        value: function onTick(event) {
            this._currentEnergy = Math.min(this.maxEnergy, this._currentEnergy + this._energyRegenerationRate);
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

},{"../events":41,"./index":32}],23:[function(require,module,exports){
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

},{"../events":41,"./index":32}],24:[function(require,module,exports){
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
            var canMove = this.engine.can(new Events.Event('canMove', { position: position }));
            if (canMove) {
                this.performAction(new Behaviours.WalkAction(this.physicsComponent, position));
            }
        }
    }]);

    return InputComponent;
}(Components.Component);

exports.InputComponent = InputComponent;

},{"../InputHandler":5,"../behaviours":20,"../core":35,"../events":41,"./index":32}],25:[function(require,module,exports){
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

},{"../events":41,"./index":32}],26:[function(require,module,exports){
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

},{"../Exceptions":3,"../events":41,"./index":32}],27:[function(require,module,exports){
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

},{"../behaviours":20,"../events":41,"./index":32}],28:[function(require,module,exports){
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

},{"../events":41,"./index":32}],29:[function(require,module,exports){
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
                if (tile.props[key].name === 'rune') {
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

},{"../behaviours":20,"../events":41,"./index":32}],30:[function(require,module,exports){
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

},{"../events":41,"./index":32}],31:[function(require,module,exports){
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

},{"../events":41,"./index":32}],32:[function(require,module,exports){
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
__export(require('./RuneWriterComponent'));
__export(require('./RuneDamageComponent'));
__export(require('./HealthComponent'));

},{"./Component":21,"./EnergyComponent":22,"./HealthComponent":23,"./InputComponent":24,"./PhysicsComponent":25,"./RenderableComponent":26,"./RoamingAIComponent":27,"./RuneDamageComponent":28,"./RuneWriterComponent":29,"./SelfDestructComponent":30,"./TimeHandlerComponent":31}],33:[function(require,module,exports){
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

},{}],34:[function(require,module,exports){
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

},{}],35:[function(require,module,exports){
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

},{"./Color":33,"./Position":34}],36:[function(require,module,exports){
"use strict";

var Components = require('../components');
var Entities = require('./index');
var Glyph = require('../Glyph');
function createWily(engine) {
    var wily = new Entities.Entity(engine, 'wily');
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
    var rat = new Entities.Entity(engine, 'rat');
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

},{"../Glyph":4,"../components":32,"./index":38}],37:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Core = require('../core');
var Mixins = require('../mixins');

var Entity = function () {
    function Entity(engine) {
        var _name = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

        _classCallCheck(this, Entity);

        this.engine = engine;
        this._guid = Core.Utils.generateGuid();
        this._name = _name;
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

},{"../core":35,"../mixins":43}],38:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./Creator'));
__export(require('./Entity'));

},{"./Creator":36,"./Entity":37}],39:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Event = function Event(type) {
    var data = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    _classCallCheck(this, Event);

    this.type = type;
    this.data = data;
};

exports.Event = Event;

},{}],40:[function(require,module,exports){
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

},{"../core":35}],41:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./Event'));
__export(require('./Listener'));

},{"./Event":39,"./Listener":40}],42:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventHandler = function () {
    function EventHandler() {
        _classCallCheck(this, EventHandler);

        this.listeners = {};
    }

    _createClass(EventHandler, [{
        key: 'listen',
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
        key: 'removeListener',
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
        key: 'emit',
        value: function emit(event) {
            if (event.type === 'message') {
                console.log(event);
            }
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
        key: 'can',
        value: function can(event) {
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
        key: 'fire',
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
    }]);

    return EventHandler;
}();

exports.EventHandler = EventHandler;

},{}],43:[function(require,module,exports){
"use strict";

function __export(m) {
    for (var p in m) {
        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
}
__export(require('./EventHandler'));

},{"./EventHandler":42}]},{},[13])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDb25zb2xlLnRzIiwiRW5naW5lLnRzIiwiRXhjZXB0aW9ucy50cyIsIkdseXBoLnRzIiwiSW5wdXRIYW5kbGVyLnRzIiwiTG9nVmlldy50cyIsIk1hcC50cyIsIk1hcEdlbmVyYXRvci50cyIsIk1hcFZpZXcudHMiLCJQaXhpQ29uc29sZS50cyIsIlNjZW5lLnRzIiwiVGlsZS50cyIsImFwcC50cyIsImJlaGF2aW91cnMvQWN0aW9uLnRzIiwiYmVoYXZpb3Vycy9CZWhhdmlvdXIudHMiLCJiZWhhdmlvdXJzL051bGxBY3Rpb24udHMiLCJiZWhhdmlvdXJzL1JhbmRvbVdhbGtCZWhhdmlvdXIudHMiLCJiZWhhdmlvdXJzL1dhbGtBY3Rpb24udHMiLCJiZWhhdmlvdXJzL1dyaXRlUnVuZUFjdGlvbi50cyIsImJlaGF2aW91cnMvaW5kZXgudHMiLCJjb21wb25lbnRzL0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvRW5lcmd5Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9IZWFsdGhDb21wb25lbnQudHMiLCJjb21wb25lbnRzL0lucHV0Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9QaHlzaWNzQ29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9SZW5kZXJhYmxlQ29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9Sb2FtaW5nQUlDb21wb25lbnQudHMiLCJjb21wb25lbnRzL1J1bmVEYW1hZ2VDb21wb25lbnQudHMiLCJjb21wb25lbnRzL1J1bmVXcml0ZXJDb21wb25lbnQudHMiLCJjb21wb25lbnRzL1NlbGZEZXN0cnVjdENvbXBvbmVudC50cyIsImNvbXBvbmVudHMvVGltZUhhbmRsZXJDb21wb25lbnQudHMiLCJjb21wb25lbnRzL2luZGV4LnRzIiwiY29yZS9Db2xvci50cyIsImNvcmUvUG9zaXRpb24udHMiLCJjb3JlL2luZGV4LnRzIiwiZW50aXRpZXMvQ3JlYXRvci50cyIsImVudGl0aWVzL0VudGl0eS50cyIsImVudGl0aWVzL2luZGV4LnRzIiwiZXZlbnRzL0V2ZW50LnRzIiwiZXZlbnRzL0xpc3RlbmVyLnRzIiwiZXZlbnRzL2luZGV4LnRzIiwibWl4aW5zL0V2ZW50SGFuZGxlci50cyIsIm1peGlucy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQ0FBLElBQVksQUFBSSxlQUFNLEFBQVEsQUFBQztBQUMvQixJQUFPLEFBQUssZ0JBQVcsQUFBUyxBQUFDLEFBQUMsQUFFbEM7OztBQThCRSxxQkFBWSxBQUFhLE9BQUUsQUFBYztZQUFFLEFBQVUsbUVBQWUsQUFBUTtZQUFFLEFBQVUsbUVBQWUsQUFBUTs7OztBQUM3RyxBQUFJLGFBQUMsQUFBTSxTQUFHLEFBQUssQUFBQztBQUNwQixBQUFJLGFBQUMsQUFBTyxVQUFHLEFBQU0sQUFBQztBQUV0QixBQUFJLGFBQUMsQUFBaUIsb0JBQUcsQUFBTyxBQUFDO0FBQ2pDLEFBQUksYUFBQyxBQUFpQixvQkFBRyxBQUFPLEFBQUM7QUFFakMsQUFBSSxhQUFDLEFBQUssUUFBRyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQVcsWUFBUyxBQUFJLEtBQUMsQUFBSyxPQUFFLEFBQUksS0FBQyxBQUFNLFFBQUUsQUFBSyxNQUFDLEFBQVUsQUFBQyxBQUFDO0FBQ3ZGLEFBQUksYUFBQyxBQUFLLFFBQUcsQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFXLFlBQWEsQUFBSSxLQUFDLEFBQUssT0FBRSxBQUFJLEtBQUMsQUFBTSxRQUFFLEFBQUksS0FBQyxBQUFpQixBQUFDLEFBQUM7QUFDakcsQUFBSSxhQUFDLEFBQUssUUFBRyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQVcsWUFBYSxBQUFJLEtBQUMsQUFBSyxPQUFFLEFBQUksS0FBQyxBQUFNLFFBQUUsQUFBSSxLQUFDLEFBQWlCLEFBQUMsQUFBQztBQUNqRyxBQUFJLGFBQUMsQUFBUSxXQUFHLEFBQUksS0FBQyxBQUFLLE1BQUMsQUFBVyxZQUFVLEFBQUksS0FBQyxB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QUN6QztBQUFDLEFBQUMsQUFBQyxBQUNMO0FBQUMsQUFDSCxBQUFDOzs7Ozs7QUF4RWUsYUFBVSxhQUFXLEFBQUcsQUFBQztBQUN6QixhQUFRLFdBQVcsQUFBRSxBQUFDO0FBQ3RCLGFBQU0sU0FBVyxBQUFFLEFBQUM7QUFDcEIsYUFBUyxZQUFXLEFBQUUsQUFBQztBQUN2QixhQUFRLFdBQVcsQUFBRSxBQUFDO0FBRXRCLGFBQUssUUFBVyxBQUFFLEFBQUM7QUFDbkIsYUFBSyxRQUFXLEFBQUUsQUFBQztBQUNuQixhQUFLLFFBQVcsQUFBRSxBQUFDO0FBQ25CLGFBQUssUUFBVyxBQUFFLEFBQUM7QUFDbkIsYUFBSyxRQUFXLEFBQUUsQUFBQztBQUNuQixhQUFLLFFBQVcsQUFBRSxBQUFDO0FBQ25CLGFBQUssUUFBVyxBQUFFLEFBQUM7QUFDbkIsYUFBSyxRQUFXLEFBQUUsQUFBQztBQUNuQixhQUFLLFFBQVcsQUFBRSxBQUFDO0FBQ25CLGFBQUssUUFBVyxBQUFFLEFBQUM7QUFFbkIsYUFBSyxRQUFXLEFBQUUsQUFBQztBQUNuQixhQUFLLFFBQVcsQUFBRSxBQUFDO0FBQ25CLGFBQUssUUFBVyxBQUFFLEFBQUM7QUFDbkIsYUFBSyxRQUFXLEFBQUUsQUFBQztBQUNuQixhQUFLLFFBQVcsQUFBRSxBQUFDO0FBQ25CLGFBQUssUUFBVyxBQUFFLEFBQUM7QUFDbkIsYUFBSyxRQUFXLEFBQUUsQUFBQztBQUNuQixhQUFLLFFBQVcsQUFBRSxBQUFDO0FBQ25CLGFBQUssUUFBVyxBQUFFLEFBQUM7QUFDbkIsYUFBSyxRQUFXLEFBQUUsQUFBQztBQUNuQixhQUFLLFFBQVcsQUFBRSxBQUFDO0FBQ25CLGFBQUssUUFBVyxBQUFFLEFBQUM7QUFDbkIsYUFBSyxRQUFXLEFBQUUsQUFBQztBQUNuQixhQUFLLFFBQVcsQUFBRSxBQUFDO0FBQ25CLGFBQUssUUFBVyxBQUFFLEFBQUM7QUFDbkIsYUFBSyxRQUFXLEFBQUUsQUFBQztBQUNuQixhQUFLLFFBQVcsQUFBRSxBQUFDO0FBQ25CLGFBQUssUUFBVyxBQUFFLEFB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LEFBQ2Q7QUFBQztBQUVELGdCQUFJLEFBQWEsZ0JBQUcsQUFBSSxBQUFDO0FBRXpCLEFBQUksaUJBQUMsQUFBUyxVQUFDLEFBQUssTUFBQyxBQUFJLEFBQUMsTUFBQyxBQUFPLFFBQUMsVUFBQyxBQUFRO0FBQzFDLEFBQUUsQUFBQyxvQkFBQyxDQUFDLEFBQWEsQUFBQyxlQUFDLEFBQUM7QUFDbkIsQUFBTSxBQUFDLEFBQ1Q7QUFBQztBQUNELEFBQWEsZ0NBQUcsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFLLEFBQUMsQUFBQyxBQUMzQztBQUFDLEFBQUMsQUFBQztBQUNILEFBQU0sbUJBQUMsQUFBYSxBQUFDLEFBQ3ZCO0FBQUMsQUFFRCxBQUFJOzs7NkJBQUMsQUFBbUI7QUFDdEIsQUFBRSxBQUFDLGdCQUFDLENBQUMsQUFBSSxLQUFDLEFBQVMsVUFBQyxBQUFLLE1BQUMsQUFBSSxBQUFDLEFBQUMsT0FBQyxBQUFDO0FBQ2hDLEFBQU0sdUJBQUMsQUFBSSxBQUFDLEFBQ2Q7QUFBQztBQUVELGdCQUFJLEFBQWEsZ0JBQUcsQUFBSSxBQUFDO0FBRXpCLEFBQUksaUJBQUMsQUFBUyxVQUFDLEFBQUssTUFBQyxBQUFJLEFBQUMsTUFBQyxBQUFPLFFBQUMsVUFBQyxBQUFRO0FBQzFDLEFBQWEsZ0NBQUcsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFLLEFBQUMsQUFBQyxBQUMzQztBQUFDLEFBQUMsQUFBQztBQUNILEFBQU0sbUJBQUMsQUFBYSxBQUFDLEFBQ3ZCO0FBQUMsQUFDSCxBQUFDOzs7Ozs7QUF4RVksUUFBWSxlQXdFeEI7Ozs7Ozs7Ozs7QUNsRkQsaUJBQWMsQUFBZ0IsQUFBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4vY29yZSc7XG5pbXBvcnQgR2x5cGggPSByZXF1aXJlKCcuL0dseXBoJyk7XG5cbmNsYXNzIENvbnNvbGUge1xuICBwcml2YXRlIF93aWR0aDogbnVtYmVyO1xuICBnZXQgd2lkdGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3dpZHRoO1xuICB9XG4gIHByaXZhdGUgX2hlaWdodDogbnVtYmVyO1xuICBnZXQgaGVpZ2h0KCkge1xuICAgIHJldHVybiB0aGlzLl9oZWlnaHQ7XG4gIH1cblxuICBwcml2YXRlIF90ZXh0OiBudW1iZXJbXVtdO1xuICBnZXQgdGV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy5fdGV4dDtcbiAgfVxuICBwcml2YXRlIF9mb3JlOiBDb3JlLkNvbG9yW11bXTtcbiAgZ2V0IGZvcmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZvcmU7XG4gIH1cbiAgcHJpdmF0ZSBfYmFjazogQ29yZS5Db2xvcltdW107XG4gIGdldCBiYWNrKCkge1xuICAgIHJldHVybiB0aGlzLl9iYWNrO1xuICB9XG4gIHByaXZhdGUgX2lzRGlydHk6IGJvb2xlYW5bXVtdO1xuICBnZXQgaXNEaXJ0eSgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNEaXJ0eTtcbiAgfVxuXG4gIHByaXZhdGUgZGVmYXVsdEJhY2tncm91bmQ6IENvcmUuQ29sb3I7XG4gIHByaXZhdGUgZGVmYXVsdEZvcmVncm91bmQ6IENvcmUuQ29sb3I7XG5cbiAgY29uc3RydWN0b3Iod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGZvcmVncm91bmQ6IENvcmUuQ29sb3IgPSAweGZmZmZmZiwgYmFja2dyb3VuZDogQ29yZS5Db2xvciA9IDB4MDAwMDAwKSB7XG4gICAgdGhpcy5fd2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLl9oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICB0aGlzLmRlZmF1bHRCYWNrZ3JvdW5kID0gMHgwMDAwMDtcbiAgICB0aGlzLmRlZmF1bHRGb3JlZ3JvdW5kID0gMHhmZmZmZjtcblxuICAgIHRoaXMuX3RleHQgPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4PG51bWJlcj4odGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIEdseXBoLkNIQVJfU1BBQ0UpO1xuICAgIHRoaXMuX2ZvcmUgPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4PENvcmUuQ29sb3I+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0aGlzLmRlZmF1bHRGb3JlZ3JvdW5kKTtcbiAgICB0aGlzLl9iYWNrID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeDxDb3JlLkNvbG9yPih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5kZWZhdWx0QmFja2dyb3VuZCk7XG4gICAgdGhpcy5faXNEaXJ0eSA9IENvcmUuVXRpbHMuYnVpbGRNYXRyaXg8Ym9vbGVhbj4odGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIHRydWUpO1xuICB9XG5cbiAgY2xlYW5DZWxsKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgdGhpcy5faXNEaXJ0eVt4XVt5XSA9IGZhbHNlO1xuICB9XG5cbiAgcHJpbnQodGV4dDogc3RyaW5nLCB4OiBudW1iZXIsIHk6IG51bWJlciwgY29sb3I6IENvcmUuQ29sb3IgPSAweGZmZmZmZikge1xuICAgIGxldCBiZWdpbiA9IDA7XG4gICAgbGV0IGVuZCA9IHRleHQubGVuZ3RoO1xuICAgIGlmICh4ICsgZW5kID4gdGhpcy53aWR0aCkge1xuICAgICAgZW5kID0gdGhpcy53aWR0aCAtIHg7XG4gICAgfVxuICAgIGlmICh4IDwgMCkge1xuICAgICAgZW5kICs9IHg7XG4gICAgICB4ID0gMDtcbiAgICB9XG4gICAgdGhpcy5zZXRGb3JlZ3JvdW5kKGNvbG9yLCB4LCB5LCBlbmQsIDEpO1xuICAgIGZvciAobGV0IGkgPSBiZWdpbjsgaSA8IGVuZDsgKytpKSB7XG4gICAgICB0aGlzLnNldFRleHQodGV4dC5jaGFyQ29kZUF0KGkpLCB4ICsgaSwgeSk7XG4gICAgfVxuICB9XG5cbiAgc2V0VGV4dChhc2NpaTogbnVtYmVyIHwgc3RyaW5nLCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciA9IDEsIGhlaWdodDogbnVtYmVyID0gMSkge1xuICAgIGlmICh0eXBlb2YgYXNjaWkgPT09ICdzdHJpbmcnKSB7XG4gICAgICBhc2NpaSA9ICg8c3RyaW5nPmFzY2lpKS5jaGFyQ29kZUF0KDApO1xuICAgIH1cbiAgICB0aGlzLnNldE1hdHJpeCh0aGlzLl90ZXh0LCBhc2NpaSwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gIH1cblxuICBzZXRGb3JlZ3JvdW5kKGNvbG9yOiBDb3JlLkNvbG9yLCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciA9IDEsIGhlaWdodDogbnVtYmVyID0gMSkge1xuICAgIHRoaXMuc2V0TWF0cml4KHRoaXMuX2ZvcmUsIGNvbG9yLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcbiAgfVxuXG4gIHNldEJhY2tncm91bmQoY29sb3I6IENvcmUuQ29sb3IsIHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyID0gMSwgaGVpZ2h0OiBudW1iZXIgPSAxKSB7XG4gICAgdGhpcy5zZXRNYXRyaXgodGhpcy5fYmFjaywgY29sb3IsIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXRNYXRyaXg8VD4obWF0cml4OiBUW11bXSwgdmFsdWU6IFQsIHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgIGZvciAobGV0IGkgPSB4OyBpIDwgeCArIHdpZHRoOyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSB5OyBqIDwgeSArIGhlaWdodDsgaisrKSB7XG4gICAgICAgIGlmIChtYXRyaXhbaV1bal0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgbWF0cml4W2ldW2pdID0gdmFsdWU7XG4gICAgICAgIHRoaXMuX2lzRGlydHlbaV1bal0gPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgPSBDb25zb2xlO1xuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuL2NvcmUnO1xuaW1wb3J0ICogYXMgRW50aXRpZXMgZnJvbSAnLi9lbnRpdGllcyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vY29tcG9uZW50cyc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgQ29sbGVjdGlvbnMgZnJvbSAndHlwZXNjcmlwdC1jb2xsZWN0aW9ucyc7XG5pbXBvcnQgKiBhcyBNaXhpbnMgZnJvbSAnLi9taXhpbnMnO1xuXG5pbXBvcnQgUGl4aUNvbnNvbGUgPSByZXF1aXJlKCcuL1BpeGlDb25zb2xlJyk7XG5pbXBvcnQgQ29uc29sZSA9IHJlcXVpcmUoJy4vQ29uc29sZScpO1xuXG5pbXBvcnQgSW5wdXRIYW5kbGVyID0gcmVxdWlyZSgnLi9JbnB1dEhhbmRsZXInKTtcblxuaW1wb3J0IFNjZW5lID0gcmVxdWlyZSgnLi9TY2VuZScpO1xuXG5pbnRlcmZhY2UgRnJhbWVSZW5kZXJlciB7XG4gIChlbGFwc2VkVGltZTogbnVtYmVyKTogdm9pZDtcbn1cbmxldCByZW5kZXJlcjogRnJhbWVSZW5kZXJlcjtcbmxldCBmcmFtZUxvb3A6IChjYWxsYmFjazogKGVsYXBzZWRUaW1lOiBudW1iZXIpID0+IHZvaWQpID0+IHZvaWQ7XG5cbmxldCBmcmFtZUZ1bmMgPSAoZWxhcHNlZFRpbWU6IG51bWJlcikgPT4ge1xuICBmcmFtZUxvb3AoZnJhbWVGdW5jKTtcbiAgcmVuZGVyZXIoZWxhcHNlZFRpbWUpO1xufVxuXG5sZXQgbG9vcCA9ICh0aGVSZW5kZXJlcjogRnJhbWVSZW5kZXJlcikgPT4ge1xuICByZW5kZXJlciA9IHRoZVJlbmRlcmVyO1xuICBmcmFtZUxvb3AoZnJhbWVGdW5jKTtcbn1cblxuY2xhc3MgRW5naW5lIGltcGxlbWVudHMgTWl4aW5zLklFdmVudEhhbmRsZXIge1xuICAvLyBFdmVudEhhbmRsZXIgbWl4aW5cbiAgbGlzdGVuOiAobGlzdGVuZXI6IEV2ZW50cy5MaXN0ZW5lcikgPT4gRXZlbnRzLkxpc3RlbmVyO1xuICByZW1vdmVMaXN0ZW5lcjogKGxpc3RlbmVyOiBFdmVudHMuTGlzdGVuZXIpID0+IHZvaWQ7XG4gIGVtaXQ6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiB2b2lkO1xuICBmaXJlOiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gYW55O1xuICBjYW46IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiBib29sZWFuO1xuXG4gIHByaXZhdGUgcGl4aUNvbnNvbGU6IFBpeGlDb25zb2xlO1xuXG4gIHByaXZhdGUgZ2FtZVRpbWU6IG51bWJlciA9IDA7XG4gIHByaXZhdGUgZW5naW5lVGlja3NQZXJTZWNvbmQ6IG51bWJlciA9IDEwO1xuICBwcml2YXRlIGVuZ2luZVRpY2tMZW5ndGg6IG51bWJlciA9IDEwMDtcbiAgcHJpdmF0ZSBlbGFwc2VkVGltZTogbnVtYmVyID0gMDtcbiAgcHJpdmF0ZSB0aW1lSGFuZGxlckNvbXBvbmVudDogQ29tcG9uZW50cy5UaW1lSGFuZGxlckNvbXBvbmVudDtcblxuICBwcml2YXRlIHdpZHRoOiBudW1iZXI7XG4gIHByaXZhdGUgaGVpZ2h0OiBudW1iZXI7XG4gIHByaXZhdGUgY2FudmFzSWQ6IHN0cmluZztcblxuICBwcml2YXRlIGVudGl0aWVzOiB7W2d1aWQ6IHN0cmluZ106IEVudGl0aWVzLkVudGl0eX07XG4gIHByaXZhdGUgdG9EZXN0cm95OiBFbnRpdGllcy5FbnRpdHlbXTtcblxuICBwcml2YXRlIHBhdXNlZDogYm9vbGVhbjtcblxuICBwcml2YXRlIF9pbnB1dEhhbmRsZXI6IElucHV0SGFuZGxlcjtcbiAgZ2V0IGlucHV0SGFuZGxlcigpIHtcbiAgICByZXR1cm4gdGhpcy5faW5wdXRIYW5kbGVyO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3VycmVudFNjZW5lOiBTY2VuZTtcbiAgZ2V0IGN1cnJlbnRTY2VuZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudFNjZW5lO1xuICB9XG5cbiAgY29uc3RydWN0b3Iod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGNhbnZhc0lkOiBzdHJpbmcpIHtcbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMuY2FudmFzSWQgPSBjYW52YXNJZDtcblxuICAgIHRoaXMuZW50aXRpZXMgPSB7fTtcbiAgICB0aGlzLnRvRGVzdHJveSA9IFtdO1xuXG4gICAgdGhpcy5lbmdpbmVUaWNrc1BlclNlY29uZCA9IDEwO1xuICAgIGZyYW1lTG9vcCA9IChmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICg8YW55PndpbmRvdykud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8ICg8YW55PndpbmRvdykubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICg8YW55PndpbmRvdykub1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAoPGFueT53aW5kb3cpLm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgIGZ1bmN0aW9uKGNhbGxiYWNrOiAoZWxhcHNlZFRpbWU6IG51bWJlcikgPT4gdm9pZCkge1xuICAgICAgICB3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwLCBuZXcgRGF0ZSgpLmdldFRpbWUoKSk7XG4gICAgICB9O1xuICAgIH0pKCk7XG5cbiAgICB0aGlzLmVuZ2luZVRpY2tMZW5ndGggPSAxMDAwIC8gdGhpcy5lbmdpbmVUaWNrc1BlclNlY29uZDtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsICgpID0+IHtcbiAgICAgIHRoaXMucGF1c2VkID0gZmFsc2U7XG4gICAgfSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2JsdXInLCAoKSA9PiB7XG4gICAgICB0aGlzLnBhdXNlZCA9IHRydWU7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9pbnB1dEhhbmRsZXIgPSBuZXcgSW5wdXRIYW5kbGVyKHRoaXMpO1xuICB9XG5cbiAgc3RhcnQoc2NlbmU6IFNjZW5lKSB7XG4gICAgdGhpcy5fY3VycmVudFNjZW5lID0gc2NlbmU7XG4gICAgdGhpcy5fY3VycmVudFNjZW5lLnN0YXJ0KCk7XG5cbiAgICBsZXQgdGltZUtlZXBlciA9IG5ldyBFbnRpdGllcy5FbnRpdHkodGhpcywgJ3RpbWVLZWVwZXInKTtcbiAgICB0aGlzLnRpbWVIYW5kbGVyQ29tcG9uZW50ID0gbmV3IENvbXBvbmVudHMuVGltZUhhbmRsZXJDb21wb25lbnQodGhpcyk7XG4gICAgdGltZUtlZXBlci5hZGRDb21wb25lbnQodGhpcy50aW1lSGFuZGxlckNvbXBvbmVudCk7XG5cbiAgICB0aGlzLnBpeGlDb25zb2xlID0gbmV3IFBpeGlDb25zb2xlKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0aGlzLmNhbnZhc0lkLCAweGZmZmZmZiwgMHgwMDAwMDApO1xuICAgIGxvb3AoKHRpbWUpID0+IHtcbiAgICAgIGlmICh0aGlzLnBhdXNlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLmVsYXBzZWRUaW1lID0gdGltZSAtIHRoaXMuZ2FtZVRpbWU7XG5cbiAgICAgIGlmICh0aGlzLmVsYXBzZWRUaW1lID49IHRoaXMuZW5naW5lVGlja0xlbmd0aCkge1xuICAgICAgICB0aGlzLmdhbWVUaW1lID0gdGltZTtcbiAgICAgICAgdGhpcy50aW1lSGFuZGxlckNvbXBvbmVudC5lbmdpbmVUaWNrKHRoaXMuZ2FtZVRpbWUpO1xuXG4gICAgICAgIHRoaXMuZGVzdHJveUVudGl0aWVzKCk7XG5cbiAgICAgICAgc2NlbmUucmVuZGVyKChjb25zb2xlOiBDb25zb2xlLCB4OiBudW1iZXIsIHk6IG51bWJlcikgPT4ge1xuICAgICAgICAgIHRoaXMucGl4aUNvbnNvbGUuYmxpdChjb25zb2xlLCB4LCB5KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICB0aGlzLnBpeGlDb25zb2xlLnJlbmRlcigpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVnaXN0ZXJFbnRpdHkoZW50aXR5OiBFbnRpdGllcy5FbnRpdHkpIHtcbiAgICB0aGlzLmVudGl0aWVzW2VudGl0eS5ndWlkXSA9IGVudGl0eTtcbiAgfVxuXG4gIHJlbW92ZUVudGl0eShlbnRpdHk6IEVudGl0aWVzLkVudGl0eSkge1xuICAgIHRoaXMudG9EZXN0cm95LnB1c2goZW50aXR5KTtcbiAgfVxuXG4gIHByaXZhdGUgZGVzdHJveUVudGl0aWVzKCkge1xuICAgIHRoaXMudG9EZXN0cm95LmZvckVhY2goKGVudGl0eSkgPT4ge1xuICAgICAgZW50aXR5LmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuZW1pdChuZXcgRXZlbnRzLkV2ZW50KCdlbnRpdHlEZXN0cm95ZWQnLCB7ZW50aXR5OiBlbnRpdHl9KSk7XG4gICAgICBkZWxldGUgdGhpcy5lbnRpdGllc1tlbnRpdHkuZ3VpZF07XG4gICAgfSk7XG4gICAgdGhpcy50b0Rlc3Ryb3kgPSBbXTtcbiAgfVxuXG4gIGdldEVudGl0eShndWlkOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5lbnRpdGllc1tndWlkXTtcbiAgfVxufVxuXG5Db3JlLlV0aWxzLmFwcGx5TWl4aW5zKEVuZ2luZSwgW01peGlucy5FdmVudEhhbmRsZXJdKTtcblxuZXhwb3J0ID0gRW5naW5lO1xuIiwiZXhwb3J0IGNsYXNzIE1pc3NpbmdDb21wb25lbnRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgcHVibGljIG5hbWU6IHN0cmluZztcbiAgcHVibGljIG1lc3NhZ2U6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNaXNzaW5nSW1wbGVtZW50YXRpb25FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgcHVibGljIG5hbWU6IHN0cmluZztcbiAgcHVibGljIG1lc3NhZ2U6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBFbnRpdHlPdmVybGFwRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gIHB1YmxpYyBtZXNzYWdlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuL2NvcmUnO1xuXG5jbGFzcyBHbHlwaCB7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9GVUxMOiBudW1iZXIgPSAxMjk7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9TUEFDRTogbnVtYmVyID0gMzI7XG5cdC8vIHNpbmdsZSB3YWxsc1xuXHRwdWJsaWMgc3RhdGljIENIQVJfSExJTkU6IG51bWJlciA9IDE5Njtcblx0cHVibGljIHN0YXRpYyBDSEFSX1ZMSU5FOiBudW1iZXIgPSAxNzk7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9TVzogbnVtYmVyID0gMTkxO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU0U6IG51bWJlciA9IDIxODtcblx0cHVibGljIHN0YXRpYyBDSEFSX05XOiBudW1iZXIgPSAyMTc7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9ORTogbnVtYmVyID0gMTkyO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfVEVFVzogbnVtYmVyID0gMTgwO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfVEVFRTogbnVtYmVyID0gMTk1O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfVEVFTjogbnVtYmVyID0gMTkzO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfVEVFUzogbnVtYmVyID0gMTk0O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQ1JPU1M6IG51bWJlciA9IDE5Nztcblx0Ly8gZG91YmxlIHdhbGxzXG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9ESExJTkU6IG51bWJlciA9IDIwNTtcblx0cHVibGljIHN0YXRpYyBDSEFSX0RWTElORTogbnVtYmVyID0gMTg2O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRE5FOiBudW1iZXIgPSAxODc7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9ETlc6IG51bWJlciA9IDIwMTtcblx0cHVibGljIHN0YXRpYyBDSEFSX0RTRTogbnVtYmVyID0gMTg4O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRFNXOiBudW1iZXIgPSAyMDA7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9EVEVFVzogbnVtYmVyID0gMTg1O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRFRFRUU6IG51bWJlciA9IDIwNDtcblx0cHVibGljIHN0YXRpYyBDSEFSX0RURUVOOiBudW1iZXIgPSAyMDI7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9EVEVFUzogbnVtYmVyID0gMjAzO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRENST1NTOiBudW1iZXIgPSAyMDY7XG5cdC8vIGJsb2NrcyBcblx0cHVibGljIHN0YXRpYyBDSEFSX0JMT0NLMTogbnVtYmVyID0gMTc2O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQkxPQ0syOiBudW1iZXIgPSAxNzc7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9CTE9DSzM6IG51bWJlciA9IDE3ODtcblx0Ly8gYXJyb3dzIFxuXHRwdWJsaWMgc3RhdGljIENIQVJfQVJST1dfTjogbnVtYmVyID0gMjQ7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9BUlJPV19TOiBudW1iZXIgPSAyNTtcblx0cHVibGljIHN0YXRpYyBDSEFSX0FSUk9XX0U6IG51bWJlciA9IDI2O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQVJST1dfVzogbnVtYmVyID0gMjc7XG5cdC8vIGFycm93cyB3aXRob3V0IHRhaWwgXG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9BUlJPVzJfTjogbnVtYmVyID0gMzA7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9BUlJPVzJfUzogbnVtYmVyID0gMzE7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9BUlJPVzJfRTogbnVtYmVyID0gMTY7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9BUlJPVzJfVzogbnVtYmVyID0gMTc7XG5cdC8vIGRvdWJsZSBhcnJvd3MgXG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9EQVJST1dfSDogbnVtYmVyID0gMjk7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9EQVJST1dfVjogbnVtYmVyID0gMTg7XG5cdC8vIEdVSSBzdHVmZiBcblx0cHVibGljIHN0YXRpYyBDSEFSX0NIRUNLQk9YX1VOU0VUOiBudW1iZXIgPSAyMjQ7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9DSEVDS0JPWF9TRVQ6IG51bWJlciA9IDIyNTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1JBRElPX1VOU0VUOiBudW1iZXIgPSA5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfUkFESU9fU0VUOiBudW1iZXIgPSAxMDtcblx0Ly8gc3ViLXBpeGVsIHJlc29sdXRpb24ga2l0IFxuXHRwdWJsaWMgc3RhdGljIENIQVJfU1VCUF9OVzogbnVtYmVyID0gMjI2O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU1VCUF9ORTogbnVtYmVyID0gMjI3O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU1VCUF9OOiBudW1iZXIgPSAyMjg7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9TVUJQX1NFOiBudW1iZXIgPSAyMjk7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9TVUJQX0RJQUc6IG51bWJlciA9IDIzMDtcblx0cHVibGljIHN0YXRpYyBDSEFSX1NVQlBfRTogbnVtYmVyID0gMjMxO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU1VCUF9TVzogbnVtYmVyID0gMjMyO1xuXHQvLyBtaXNjZWxsYW5lb3VzIFxuXHRwdWJsaWMgc3RhdGljIENIQVJfU01JTElFIDogbnVtYmVyID0gIDE7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9TTUlMSUVfSU5WIDogbnVtYmVyID0gIDI7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9IRUFSVCA6IG51bWJlciA9ICAzO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRElBTU9ORCA6IG51bWJlciA9ICA0O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQ0xVQiA6IG51bWJlciA9ICA1O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU1BBREUgOiBudW1iZXIgPSAgNjtcblx0cHVibGljIHN0YXRpYyBDSEFSX0JVTExFVCA6IG51bWJlciA9ICA3O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQlVMTEVUX0lOViA6IG51bWJlciA9ICA4O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfTUFMRSA6IG51bWJlciA9ICAxMTtcblx0cHVibGljIHN0YXRpYyBDSEFSX0ZFTUFMRSA6IG51bWJlciA9ICAxMjtcblx0cHVibGljIHN0YXRpYyBDSEFSX05PVEUgOiBudW1iZXIgPSAgMTM7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9OT1RFX0RPVUJMRSA6IG51bWJlciA9ICAxNDtcblx0cHVibGljIHN0YXRpYyBDSEFSX0xJR0hUIDogbnVtYmVyID0gIDE1O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRVhDTEFNX0RPVUJMRSA6IG51bWJlciA9ICAxOTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1BJTENST1cgOiBudW1iZXIgPSAgMjA7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9TRUNUSU9OIDogbnVtYmVyID0gIDIxO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfUE9VTkQgOiBudW1iZXIgPSAgMTU2O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfTVVMVElQTElDQVRJT04gOiBudW1iZXIgPSAgMTU4O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRlVOQ1RJT04gOiBudW1iZXIgPSAgMTU5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfUkVTRVJWRUQgOiBudW1iZXIgPSAgMTY5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfSEFMRiA6IG51bWJlciA9ICAxNzE7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9PTkVfUVVBUlRFUiA6IG51bWJlciA9ICAxNzI7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9DT1BZUklHSFQgOiBudW1iZXIgPSAgMTg0O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQ0VOVCA6IG51bWJlciA9ICAxODk7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9ZRU4gOiBudW1iZXIgPSAgMTkwO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQ1VSUkVOQ1kgOiBudW1iZXIgPSAgMjA3O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfVEhSRUVfUVVBUlRFUlMgOiBudW1iZXIgPSAgMjQzO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRElWSVNJT04gOiBudW1iZXIgPSAgMjQ2O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfR1JBREUgOiBudW1iZXIgPSAgMjQ4O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfVU1MQVVUIDogbnVtYmVyID0gIDI0OTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1BPVzEgOiBudW1iZXIgPSAgMjUxO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfUE9XMyA6IG51bWJlciA9ICAyNTI7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9QT1cyIDogbnVtYmVyID0gIDI1Mztcblx0cHVibGljIHN0YXRpYyBDSEFSX0JVTExFVF9TUVVBUkUgOiBudW1iZXIgPSAgMjU0O1xuXG4gIHByaXZhdGUgX2dseXBoOiBudW1iZXI7XG4gIGdldCBnbHlwaCgpIHtcbiAgICByZXR1cm4gdGhpcy5fZ2x5cGg7XG4gIH1cbiAgcHJpdmF0ZSBfZm9yZWdyb3VuZENvbG9yOiBDb3JlLkNvbG9yO1xuICBnZXQgZm9yZWdyb3VuZENvbG9yKCkge1xuICAgIHJldHVybiB0aGlzLl9mb3JlZ3JvdW5kQ29sb3I7XG4gIH1cbiAgcHJpdmF0ZSBfYmFja2dyb3VuZENvbG9yOiBDb3JlLkNvbG9yO1xuICBnZXQgYmFja2dyb3VuZENvbG9yKCkge1xuICAgIHJldHVybiB0aGlzLl9iYWNrZ3JvdW5kQ29sb3I7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihnOiBzdHJpbmcgfCBudW1iZXIgPSBHbHlwaC5DSEFSX1NQQUNFLCBmOiBDb3JlLkNvbG9yID0gMHhmZmZmZmYsIGI6IENvcmUuQ29sb3IgPSAweDAwMDAwMCkge1xuICAgIHRoaXMuX2dseXBoID0gdHlwZW9mIGcgPT09ICdzdHJpbmcnID8gZy5jaGFyQ29kZUF0KDApIDogZztcbiAgICB0aGlzLl9mb3JlZ3JvdW5kQ29sb3IgPSBmO1xuICAgIHRoaXMuX2JhY2tncm91bmRDb2xvciA9IGI7XG4gIH1cbn1cblxuZXhwb3J0ID0gR2x5cGg7XG4iLCJpbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi9FbmdpbmUnKTtcblxuY2xhc3MgSW5wdXRIYW5kbGVyIHtcbiAgcHVibGljIHN0YXRpYyBLRVlfUEVSSU9EOiBudW1iZXIgPSAxOTA7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0xFRlQ6IG51bWJlciA9IDM3O1xuICBwdWJsaWMgc3RhdGljIEtFWV9VUDogbnVtYmVyID0gMzg7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1JJR0hUOiBudW1iZXIgPSAzOTtcbiAgcHVibGljIHN0YXRpYyBLRVlfRE9XTjogbnVtYmVyID0gNDA7XG5cbiAgcHVibGljIHN0YXRpYyBLRVlfMDogbnVtYmVyID0gNDg7XG4gIHB1YmxpYyBzdGF0aWMgS0VZXzE6IG51bWJlciA9IDQ5O1xuICBwdWJsaWMgc3RhdGljIEtFWV8yOiBudW1iZXIgPSA1MDtcbiAgcHVibGljIHN0YXRpYyBLRVlfMzogbnVtYmVyID0gNTE7XG4gIHB1YmxpYyBzdGF0aWMgS0VZXzQ6IG51bWJlciA9IDUyO1xuICBwdWJsaWMgc3RhdGljIEtFWV81OiBudW1iZXIgPSA1MztcbiAgcHVibGljIHN0YXRpYyBLRVlfNjogbnVtYmVyID0gNTQ7XG4gIHB1YmxpYyBzdGF0aWMgS0VZXzc6IG51bWJlciA9IDU1O1xuICBwdWJsaWMgc3RhdGljIEtFWV84OiBudW1iZXIgPSA1NjtcbiAgcHVibGljIHN0YXRpYyBLRVlfOTogbnVtYmVyID0gNTc7XG5cbiAgcHVibGljIHN0YXRpYyBLRVlfQTogbnVtYmVyID0gNjU7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0I6IG51bWJlciA9IDY2O1xuICBwdWJsaWMgc3RhdGljIEtFWV9DOiBudW1iZXIgPSA2NztcbiAgcHVibGljIHN0YXRpYyBLRVlfRDogbnVtYmVyID0gNjg7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0U6IG51bWJlciA9IDY5O1xuICBwdWJsaWMgc3RhdGljIEtFWV9GOiBudW1iZXIgPVx0NzA7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0c6IG51bWJlciA9XHQ3MTtcbiAgcHVibGljIHN0YXRpYyBLRVlfSDogbnVtYmVyID1cdDcyO1xuICBwdWJsaWMgc3RhdGljIEtFWV9JOiBudW1iZXIgPVx0NzM7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0o6IG51bWJlciA9XHQ3NDtcbiAgcHVibGljIHN0YXRpYyBLRVlfSzogbnVtYmVyID1cdDc1O1xuICBwdWJsaWMgc3RhdGljIEtFWV9MOiBudW1iZXIgPVx0NzY7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX006IG51bWJlciA9XHQ3NztcbiAgcHVibGljIHN0YXRpYyBLRVlfTjogbnVtYmVyID1cdDc4O1xuICBwdWJsaWMgc3RhdGljIEtFWV9POiBudW1iZXIgPVx0Nzk7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1A6IG51bWJlciA9XHQ4MDtcbiAgcHVibGljIHN0YXRpYyBLRVlfUTogbnVtYmVyID1cdDgxO1xuICBwdWJsaWMgc3RhdGljIEtFWV9SOiBudW1iZXIgPVx0ODI7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1M6IG51bWJlciA9XHQ4MztcbiAgcHVibGljIHN0YXRpYyBLRVlfVDogbnVtYmVyID1cdDg0O1xuICBwdWJsaWMgc3RhdGljIEtFWV9VOiBudW1iZXIgPVx0ODU7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1Y6IG51bWJlciA9XHQ4NjtcbiAgcHVibGljIHN0YXRpYyBLRVlfVzogbnVtYmVyID1cdDg3O1xuICBwdWJsaWMgc3RhdGljIEtFWV9YOiBudW1iZXIgPVx0ODg7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1k6IG51bWJlciA9XHQ4OTtcbiAgcHVibGljIHN0YXRpYyBLRVlfWjogbnVtYmVyID1cdDkwO1xuXG4gIHByaXZhdGUgbGlzdGVuZXJzOiB7W2tleWNvZGU6IG51bWJlcl06ICgoKSA9PiBhbnkpW119O1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZW5naW5lOiBFbmdpbmUpIHtcbiAgICB0aGlzLmxpc3RlbmVycyA9IHt9O1xuXG4gICAgdGhpcy5yZWdpc3Rlckxpc3RlbmVycygpO1xuICB9XG5cbiAgcHJpdmF0ZSByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMub25LZXlEb3duLmJpbmQodGhpcykpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbktleURvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBpZiAodGhpcy5saXN0ZW5lcnNbZXZlbnQua2V5Q29kZV0pIHtcbiAgICAgIHRoaXMubGlzdGVuZXJzW2V2ZW50LmtleUNvZGVdLmZvckVhY2goKGNhbGxiYWNrKSA9PiB7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgbGlzdGVuKGtleWNvZGVzOiBudW1iZXJbXSwgY2FsbGJhY2s6ICgpID0+IGFueSkge1xuICAgIGtleWNvZGVzLmZvckVhY2goKGtleWNvZGUpID0+IHtcbiAgICAgIGlmICghdGhpcy5saXN0ZW5lcnNba2V5Y29kZV0pIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNba2V5Y29kZV0gPSBbXTtcbiAgICAgIH1cbiAgICAgIHRoaXMubGlzdGVuZXJzW2tleWNvZGVdLnB1c2goY2FsbGJhY2spO1xuICAgIH0pO1xuICB9XG59XG5cbmV4cG9ydCA9IElucHV0SGFuZGxlcjtcbiIsImltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuL2V2ZW50cyc7XG5cbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuL0VuZ2luZScpO1xuaW1wb3J0IENvbnNvbGUgPSByZXF1aXJlKCcuL0NvbnNvbGUnKTtcblxuY2xhc3MgTG9nVmlldyB7XG4gIHByaXZhdGUgY3VycmVudFR1cm46IG51bWJlcjtcbiAgcHJpdmF0ZSBtZXNzYWdlczoge3R1cm46IG51bWJlciwgbWVzc2FnZTogc3RyaW5nfVtdO1xuICBwcml2YXRlIGNvbnNvbGU6IENvbnNvbGU7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlbmdpbmU6IEVuZ2luZSwgcHJpdmF0ZSB3aWR0aDogbnVtYmVyLCBwcml2YXRlIGhlaWdodDogbnVtYmVyKSB7XG4gICAgdGhpcy5yZWdpc3Rlckxpc3RlbmVycygpO1xuXG4gICAgdGhpcy5jb25zb2xlID0gbmV3IENvbnNvbGUodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIHRoaXMuY3VycmVudFR1cm4gPSAxO1xuICAgIHRoaXMubWVzc2FnZXMgPSBbXTtcbiAgfVxuXG4gIHByaXZhdGUgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAndHVybicsXG4gICAgICB0aGlzLm9uVHVybi5iaW5kKHRoaXMpXG4gICAgKSk7XG5cbiAgICB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdtZXNzYWdlJyxcbiAgICAgIHRoaXMub25NZXNzYWdlLmJpbmQodGhpcylcbiAgICApKTtcbiAgfVxuXG4gIHByaXZhdGUgb25UdXJuKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICB0aGlzLmN1cnJlbnRUdXJuID0gZXZlbnQuZGF0YS5jdXJyZW50VHVybjtcbiAgICBpZiAodGhpcy5tZXNzYWdlcy5sZW5ndGggPiAwICYmIHRoaXMubWVzc2FnZXNbdGhpcy5tZXNzYWdlcy5sZW5ndGggLSAxXS50dXJuIDwgdGhpcy5jdXJyZW50VHVybiAtIDEwKSB7XG4gICAgICB0aGlzLm1lc3NhZ2VzLnBvcCgpO1xuICAgICAgdGhpcy5jb25zb2xlLnNldFRleHQoJyAnLCAwLCAwLCB0aGlzLmNvbnNvbGUud2lkdGgsIHRoaXMuY29uc29sZS5oZWlnaHQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25NZXNzYWdlKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBpZiAoZXZlbnQuZGF0YS5tZXNzYWdlKSB7XG4gICAgICB0aGlzLm1lc3NhZ2VzLnVuc2hpZnQoe1xuICAgICAgICB0dXJuOiB0aGlzLmN1cnJlbnRUdXJuLFxuICAgICAgICBtZXNzYWdlOiBldmVudC5kYXRhLm1lc3NhZ2VcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5tZXNzYWdlcy5sZW5ndGggPiB0aGlzLmhlaWdodCkge1xuICAgICAgdGhpcy5tZXNzYWdlcy5wb3AoKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoYmxpdEZ1bmN0aW9uOiBhbnkpIHtcbiAgICB0aGlzLmNvbnNvbGUuc2V0VGV4dCgnICcsIHRoaXMud2lkdGggLSAxMCwgMCwgMTApO1xuICAgIHRoaXMuY29uc29sZS5wcmludCgnVHVybjogJyArIHRoaXMuY3VycmVudFR1cm4sIHRoaXMud2lkdGggLSAxMCwgMCwgMHhmZmZmZmYpO1xuICAgIGlmICh0aGlzLm1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IG1heEhlaWdodCA9IHRoaXMubWVzc2FnZXMubGVuZ3RoIC0gMTtcbiAgICAgIHRoaXMubWVzc2FnZXMuZm9yRWFjaCgoZGF0YSwgaWR4KSA9PiB7XG4gICAgICAgIGxldCBjb2xvciA9IDB4ZmZmZmZmO1xuICAgICAgICBpZiAoZGF0YS50dXJuIDwgdGhpcy5jdXJyZW50VHVybiAtIDUpIHtcbiAgICAgICAgICBjb2xvciA9IDB4NjY2NjY2O1xuICAgICAgICB9IGVsc2UgaWYgKGRhdGEudHVybiA8IHRoaXMuY3VycmVudFR1cm4gLSAyKSB7XG4gICAgICAgICAgY29sb3IgPSAweGFhYWFhYTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbnNvbGUucHJpbnQoZGF0YS5tZXNzYWdlLCAwLCBtYXhIZWlnaHQgLSBpZHgsIGNvbG9yKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBibGl0RnVuY3Rpb24odGhpcy5jb25zb2xlKTtcbiAgfVxufVxuXG5leHBvcnQgPSBMb2dWaWV3O1xuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuL2NvcmUnO1xuXG5pbXBvcnQgVGlsZSA9IHJlcXVpcmUoJy4vVGlsZScpO1xuXG5jbGFzcyBNYXAge1xuICBwcml2YXRlIF93aWR0aDtcbiAgZ2V0IHdpZHRoKCkge1xuICAgIHJldHVybiB0aGlzLl93aWR0aDtcbiAgfVxuICBwcml2YXRlIF9oZWlnaHQ7XG4gIGdldCBoZWlnaHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2hlaWdodDtcbiAgfVxuICBwdWJsaWMgdGlsZXM6IFRpbGVbXVtdO1xuXG4gIGNvbnN0cnVjdG9yKHc6IG51bWJlciwgaDogbnVtYmVyKSB7XG4gICAgdGhpcy5fd2lkdGggPSB3O1xuICAgIHRoaXMuX2hlaWdodCA9IGg7XG4gICAgdGhpcy50aWxlcyA9IFtdO1xuICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5fd2lkdGg7IHgrKykge1xuICAgICAgdGhpcy50aWxlc1t4XSA9IFtdO1xuICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLl9oZWlnaHQ7IHkrKykge1xuICAgICAgICB0aGlzLnRpbGVzW3hdW3ldID0gVGlsZS5jcmVhdGVUaWxlKFRpbGUuRU1QVFkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldFRpbGUocG9zaXRpb246IENvcmUuUG9zaXRpb24pOiBUaWxlIHtcbiAgICByZXR1cm4gdGhpcy50aWxlc1twb3NpdGlvbi54XVtwb3NpdGlvbi55XTtcbiAgfVxuXG4gIHNldFRpbGUocG9zaXRpb246IENvcmUuUG9zaXRpb24sIHRpbGU6IFRpbGUpIHtcbiAgICB0aGlzLnRpbGVzW3Bvc2l0aW9uLnhdW3Bvc2l0aW9uLnldID0gdGlsZTtcbiAgfVxuXG4gIGZvckVhY2goY2FsbGJhY2s6IChwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbiwgdGlsZTogVGlsZSkgPT4gdm9pZCk6IHZvaWQge1xuICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5faGVpZ2h0OyB5KyspIHtcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5fd2lkdGg7IHgrKykge1xuICAgICAgICBjYWxsYmFjayhuZXcgQ29yZS5Qb3NpdGlvbih4LCB5KSwgdGhpcy50aWxlc1t4XVt5XSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaXNXYWxrYWJsZShwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbik6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnRpbGVzW3Bvc2l0aW9uLnhdW3Bvc2l0aW9uLnldLndhbGthYmxlO1xuICB9XG59XG5cbmV4cG9ydCA9IE1hcDtcbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcblxuaW1wb3J0IE1hcCA9IHJlcXVpcmUoJy4vTWFwJyk7XG5pbXBvcnQgVGlsZSA9IHJlcXVpcmUoJy4vVGlsZScpO1xuaW1wb3J0IEdseXBoID0gcmVxdWlyZSgnLi9HbHlwaCcpO1xuXG5jbGFzcyBNYXBHZW5lcmF0b3Ige1xuICBwcml2YXRlIHdpZHRoOiBudW1iZXI7XG4gIHByaXZhdGUgaGVpZ2h0OiBudW1iZXI7XG5cbiAgcHJpdmF0ZSBiYWNrZ3JvdW5kQ29sb3I6IENvcmUuQ29sb3I7XG4gIHByaXZhdGUgZm9yZWdyb3VuZENvbG9yOiBDb3JlLkNvbG9yO1xuXG4gIGNvbnN0cnVjdG9yKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgdGhpcy5iYWNrZ3JvdW5kQ29sb3IgPSAweDAwMDAwMDtcbiAgICB0aGlzLmZvcmVncm91bmRDb2xvciA9IDB4YWFhYWFhO1xuICB9XG5cbiAgZ2VuZXJhdGUoKTogTWFwIHtcbiAgICBsZXQgY2VsbHM6IG51bWJlcltdW10gPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCAwKTtcbiAgICBsZXQgbWFwID0gbmV3IE1hcCh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG5cbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgIGlmICh4ID09PSAwIHx8IHggPT09ICh0aGlzLndpZHRoIC0gMSkgfHwgeSA9PT0gMCB8fCB5ID09PSAodGhpcy5oZWlnaHQgLSAxKSkge1xuICAgICAgICAgIGNlbGxzW3hdW3ldID0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA+IDAuOSkge1xuICAgICAgICAgICAgY2VsbHNbeF1beV0gPSAxO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjZWxsc1t4XVt5XSA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGxldCB0aWxlOiBUaWxlO1xuICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgaWYgKGNlbGxzW3hdW3ldID09PSAwKSB7XG4gICAgICAgICAgdGlsZSA9IFRpbGUuY3JlYXRlVGlsZShUaWxlLkZMT09SKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aWxlID0gVGlsZS5jcmVhdGVUaWxlKFRpbGUuV0FMTCk7XG4gICAgICAgICAgdGlsZS5nbHlwaCA9IHRoaXMuZ2V0V2FsbEdseXBoKHgsIHksIGNlbGxzKTtcbiAgICAgICAgfVxuICAgICAgICBtYXAuc2V0VGlsZShuZXcgQ29yZS5Qb3NpdGlvbih4LCB5KSwgdGlsZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0V2FsbEdseXBoKHg6IG51bWJlciwgeTogbnVtYmVyLCBjZWxsczogbnVtYmVyW11bXSk6IEdseXBoIHtcbiAgICBsZXQgVyA9ICh4ID4gMCAmJiBjZWxsc1t4IC0gMV1beV0gPT09IDEpO1xuICAgIGxldCBFID0gKHggPCB0aGlzLndpZHRoIC0gMSAmJiBjZWxsc1t4ICsgMV1beV0gPT09IDEpO1xuICAgIGxldCBOID0gKHkgPiAwICYmIGNlbGxzW3hdW3kgLSAxXSA9PT0gMSk7XG4gICAgbGV0IFMgPSAoeSA8IHRoaXMuaGVpZ2h0IC0gMSAmJiBjZWxsc1t4XVt5ICsgMV0gPT09IDEpO1xuXG4gICAgbGV0IGdseXBoID0gbmV3IEdseXBoKEdseXBoLkNIQVJfQ1JPU1MsIHRoaXMuZm9yZWdyb3VuZENvbG9yLCB0aGlzLmJhY2tncm91bmRDb2xvcik7XG4gICAgaWYgKFcgJiYgRSAmJiBTICYmIE4pIHtcbiAgICAgIGdseXBoID0gbmV3IEdseXBoKEdseXBoLkNIQVJfQ1JPU1MsIHRoaXMuZm9yZWdyb3VuZENvbG9yLCB0aGlzLmJhY2tncm91bmRDb2xvcik7XG4gICAgfSBlbHNlIGlmICgoVyB8fCBFKSAmJiAhUyAmJiAhTikge1xuICAgICAgZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9ITElORSwgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9IGVsc2UgaWYgKChTIHx8IE4pICYmICFXICYmICFFKSB7XG4gICAgICBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX1ZMSU5FLCB0aGlzLmZvcmVncm91bmRDb2xvciwgdGhpcy5iYWNrZ3JvdW5kQ29sb3IpO1xuICAgIH0gZWxzZSBpZiAoUyAmJiBFICYmICFXICYmICFOKSB7XG4gICAgICBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX1NFLCB0aGlzLmZvcmVncm91bmRDb2xvciwgdGhpcy5iYWNrZ3JvdW5kQ29sb3IpO1xuICAgIH0gZWxzZSBpZiAoUyAmJiBXICYmICFFICYmICFOKSB7XG4gICAgICBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX1NXLCB0aGlzLmZvcmVncm91bmRDb2xvciwgdGhpcy5iYWNrZ3JvdW5kQ29sb3IpO1xuICAgIH0gZWxzZSBpZiAoTiAmJiBFICYmICFXICYmICFTKSB7XG4gICAgICBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX05FLCB0aGlzLmZvcmVncm91bmRDb2xvciwgdGhpcy5iYWNrZ3JvdW5kQ29sb3IpO1xuICAgIH0gZWxzZSBpZiAoTiAmJiBXICYmICFFICYmICFTKSB7XG4gICAgICBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX05XLCB0aGlzLmZvcmVncm91bmRDb2xvciwgdGhpcy5iYWNrZ3JvdW5kQ29sb3IpO1xuICAgIH0gZWxzZSBpZiAoTiAmJiBXICYmIEUgJiYgIVMpIHtcbiAgICAgIGdseXBoID0gbmV3IEdseXBoKEdseXBoLkNIQVJfVEVFTiwgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9IGVsc2UgaWYgKFMgJiYgVyAmJiBFICYmICFOKSB7XG4gICAgICBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX1RFRVMsIHRoaXMuZm9yZWdyb3VuZENvbG9yLCB0aGlzLmJhY2tncm91bmRDb2xvcik7XG4gICAgfSBlbHNlIGlmIChOICYmIFMgJiYgRSAmJiAhVykge1xuICAgICAgZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9URUVFLCB0aGlzLmZvcmVncm91bmRDb2xvciwgdGhpcy5iYWNrZ3JvdW5kQ29sb3IpO1xuICAgIH0gZWxzZSBpZiAoTiAmJiBTICYmIFcgJiYgIUUpIHtcbiAgICAgIGdseXBoID0gbmV3IEdseXBoKEdseXBoLkNIQVJfVEVFVywgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2x5cGg7XG4gIH1cbn1cblxuZXhwb3J0ID0gTWFwR2VuZXJhdG9yO1xuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuL2NvcmUnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2NvbXBvbmVudHMnO1xuaW1wb3J0ICogYXMgRW50aXRpZXMgZnJvbSAnLi9lbnRpdGllcyc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi9ldmVudHMnO1xuXG5pbXBvcnQgR2x5cGggPSByZXF1aXJlKCcuL0dseXBoJyk7XG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi9FbmdpbmUnKTtcbmltcG9ydCBDb25zb2xlID0gcmVxdWlyZSgnLi9Db25zb2xlJyk7XG5pbXBvcnQgTWFwID0gcmVxdWlyZSgnLi9NYXAnKTtcbmltcG9ydCBUaWxlID0gcmVxdWlyZSgnLi9UaWxlJyk7XG5cbmNsYXNzIE1hcFZpZXcge1xuICBwcml2YXRlIHJlbmRlcmFibGVFbnRpdGllczogKHtndWlkOiBzdHJpbmcsIHJlbmRlcmFibGU6IENvbXBvbmVudHMuUmVuZGVyYWJsZUNvbXBvbmVudCwgcGh5c2ljczogQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50fSlbXTtcbiAgcHJpdmF0ZSByZW5kZXJhYmxlSXRlbXM6ICh7Z3VpZDogc3RyaW5nLCByZW5kZXJhYmxlOiBDb21wb25lbnRzLlJlbmRlcmFibGVDb21wb25lbnQsIHBoeXNpY3M6IENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudH0pW107XG4gIHByaXZhdGUgY29uc29sZTogQ29uc29sZTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVuZ2luZTogRW5naW5lLCBwcml2YXRlIG1hcDogTWFwLCBwcml2YXRlIHdpZHRoOiBudW1iZXIsIHByaXZhdGUgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICB0aGlzLnJlZ2lzdGVyTGlzdGVuZXJzKCk7XG4gICAgdGhpcy5jb25zb2xlID0gbmV3IENvbnNvbGUodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIHRoaXMucmVuZGVyYWJsZUVudGl0aWVzID0gW107XG4gICAgdGhpcy5yZW5kZXJhYmxlSXRlbXMgPSBbXTtcbiAgfVxuXG4gIHByaXZhdGUgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAncmVuZGVyYWJsZUNvbXBvbmVudENyZWF0ZWQnLFxuICAgICAgdGhpcy5vblJlbmRlcmFibGVDb21wb25lbnRDcmVhdGVkLmJpbmQodGhpcylcbiAgICApKTtcbiAgICB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdyZW5kZXJhYmxlQ29tcG9uZW50RGVzdHJveWVkJyxcbiAgICAgIHRoaXMub25SZW5kZXJhYmxlQ29tcG9uZW50RGVzdHJveWVkLmJpbmQodGhpcylcbiAgICApKTtcbiAgfVxuXG4gIHByaXZhdGUgb25SZW5kZXJhYmxlQ29tcG9uZW50RGVzdHJveWVkKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBjb25zdCBwaHlzaWNzID0gPENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudD5ldmVudC5kYXRhLmVudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KTtcbiAgICBsZXQgaWR4ID0gbnVsbDtcblxuICAgIGlmIChwaHlzaWNzLmJsb2NraW5nKSB7XG4gICAgICBpZHggPSB0aGlzLnJlbmRlcmFibGVFbnRpdGllcy5maW5kSW5kZXgoKGVudGl0eSkgPT4ge1xuICAgICAgICByZXR1cm4gZW50aXR5Lmd1aWQgPT09IGV2ZW50LmRhdGEuZW50aXR5Lmd1aWQ7XG4gICAgICB9KTtcbiAgICAgIGlmIChpZHggIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJhYmxlRW50aXRpZXMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlkeCA9IHRoaXMucmVuZGVyYWJsZUl0ZW1zLmZpbmRJbmRleCgoZW50aXR5KSA9PiB7XG4gICAgICAgIHJldHVybiBlbnRpdHkuZ3VpZCA9PT0gZXZlbnQuZGF0YS5lbnRpdHkuZ3VpZDtcbiAgICAgIH0pO1xuICAgICAgaWYgKGlkeCAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnJlbmRlcmFibGVJdGVtcy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uUmVuZGVyYWJsZUNvbXBvbmVudENyZWF0ZWQoZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGNvbnN0IHBoeXNpY3MgPSA8Q29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50PmV2ZW50LmRhdGEuZW50aXR5LmdldENvbXBvbmVudChDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQpO1xuXG4gICAgaWYgKHBoeXNpY3MuYmxvY2tpbmcpIHtcbiAgICAgIHRoaXMucmVuZGVyYWJsZUVudGl0aWVzLnB1c2goe1xuICAgICAgICBndWlkOiBldmVudC5kYXRhLmVudGl0eS5ndWlkLFxuICAgICAgICByZW5kZXJhYmxlOiBldmVudC5kYXRhLnJlbmRlcmFibGVDb21wb25lbnQsXG4gICAgICAgIHBoeXNpY3M6IHBoeXNpY3NcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlbmRlcmFibGVJdGVtcy5wdXNoKHtcbiAgICAgICAgZ3VpZDogZXZlbnQuZGF0YS5lbnRpdHkuZ3VpZCxcbiAgICAgICAgcmVuZGVyYWJsZTogZXZlbnQuZGF0YS5yZW5kZXJhYmxlQ29tcG9uZW50LFxuICAgICAgICBwaHlzaWNzOiBwaHlzaWNzXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoYmxpdEZ1bmN0aW9uOiBhbnkpIHtcbiAgICB0aGlzLnJlbmRlck1hcCh0aGlzLmNvbnNvbGUpO1xuICAgIGJsaXRGdW5jdGlvbih0aGlzLmNvbnNvbGUpO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJNYXAoY29uc29sZTogQ29uc29sZSkge1xuICAgIHRoaXMucmVuZGVyQmFja2dyb3VuZChjb25zb2xlKTtcbiAgICB0aGlzLnJlbmRlckl0ZW1zKGNvbnNvbGUpO1xuICAgIHRoaXMucmVuZGVyRW50aXRpZXMoY29uc29sZSk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckVudGl0aWVzKGNvbnNvbGU6IENvbnNvbGUpIHtcbiAgICB0aGlzLnJlbmRlcmFibGVFbnRpdGllcy5mb3JFYWNoKChkYXRhKSA9PiB7XG4gICAgICBpZiAoZGF0YS5yZW5kZXJhYmxlICYmIGRhdGEucGh5c2ljcykge1xuICAgICAgICB0aGlzLnJlbmRlckdseXBoKGNvbnNvbGUsIGRhdGEucmVuZGVyYWJsZS5nbHlwaCwgZGF0YS5waHlzaWNzLnBvc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVySXRlbXMoY29uc29sZTogQ29uc29sZSkge1xuICAgIHRoaXMucmVuZGVyYWJsZUl0ZW1zLmZvckVhY2goKGRhdGEpID0+IHtcbiAgICAgIGlmIChkYXRhLnJlbmRlcmFibGUgJiYgZGF0YS5waHlzaWNzKSB7XG4gICAgICAgIHRoaXMucmVuZGVyR2x5cGgoY29uc29sZSwgZGF0YS5yZW5kZXJhYmxlLmdseXBoLCBkYXRhLnBoeXNpY3MucG9zaXRpb24pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJHbHlwaChjb25zb2xlOiBDb25zb2xlLCBnbHlwaDogR2x5cGgsIHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uKSB7XG4gICAgY29uc29sZS5zZXRUZXh0KGdseXBoLmdseXBoLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcbiAgICBjb25zb2xlLnNldEZvcmVncm91bmQoZ2x5cGguZm9yZWdyb3VuZENvbG9yLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyQmFja2dyb3VuZChjb25zb2xlOiBDb25zb2xlKSB7XG4gICAgdGhpcy5tYXAuZm9yRWFjaCgocG9zaXRpb246IENvcmUuUG9zaXRpb24sIHRpbGU6IFRpbGUpID0+IHtcbiAgICAgIGxldCBnbHlwaCA9IHRpbGUuZ2x5cGg7XG4gICAgICBjb25zb2xlLnNldFRleHQoZ2x5cGguZ2x5cGgsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xuICAgICAgY29uc29sZS5zZXRGb3JlZ3JvdW5kKGdseXBoLmZvcmVncm91bmRDb2xvciwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XG4gICAgICBjb25zb2xlLnNldEJhY2tncm91bmQoZ2x5cGguYmFja2dyb3VuZENvbG9yLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgPSBNYXBWaWV3O1xuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vdHlwaW5ncy9pbmRleC5kLnRzJyAvPlxuXG5pbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4vY29yZSc7XG5cbmltcG9ydCBHbHlwaCA9IHJlcXVpcmUoJy4vR2x5cGgnKTtcbmltcG9ydCBDb25zb2xlID0gcmVxdWlyZSgnLi9Db25zb2xlJyk7XG5cbmNsYXNzIFBpeGlDb25zb2xlIHtcbiAgcHJpdmF0ZSBfd2lkdGg6IG51bWJlcjtcbiAgcHJpdmF0ZSBfaGVpZ2h0OiBudW1iZXI7XG5cbiAgcHJpdmF0ZSBjYW52YXNJZDogc3RyaW5nO1xuICBwcml2YXRlIHRleHQ6IG51bWJlcltdW107XG4gIHByaXZhdGUgZm9yZTogQ29yZS5Db2xvcltdW107XG4gIHByaXZhdGUgYmFjazogQ29yZS5Db2xvcltdW107XG4gIHByaXZhdGUgaXNEaXJ0eTogYm9vbGVhbltdW107XG5cbiAgcHJpdmF0ZSByZW5kZXJlcjogYW55O1xuICBwcml2YXRlIHN0YWdlOiBQSVhJLkNvbnRhaW5lcjtcblxuICBwcml2YXRlIGxvYWRlZDogYm9vbGVhbjtcblxuICBwcml2YXRlIGNoYXJXaWR0aDogbnVtYmVyO1xuICBwcml2YXRlIGNoYXJIZWlnaHQ6IG51bWJlcjtcblxuICBwcml2YXRlIGZvbnQ6IFBJWEkuQmFzZVRleHR1cmU7XG4gIHByaXZhdGUgY2hhcnM6IFBJWEkuVGV4dHVyZVtdO1xuXG4gIHByaXZhdGUgZm9yZUNlbGxzOiBQSVhJLlNwcml0ZVtdW107XG4gIHByaXZhdGUgYmFja0NlbGxzOiBQSVhJLlNwcml0ZVtdW107XG5cbiAgcHJpdmF0ZSBkZWZhdWx0QmFja2dyb3VuZDogQ29yZS5Db2xvcjtcbiAgcHJpdmF0ZSBkZWZhdWx0Rm9yZWdyb3VuZDogQ29yZS5Db2xvcjtcblxuICBwcml2YXRlIGNhbnZhczogYW55O1xuICBwcml2YXRlIHRvcExlZnRQb3NpdGlvbjogQ29yZS5Qb3NpdGlvbjtcblxuICBjb25zdHJ1Y3Rvcih3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgY2FudmFzSWQ6IHN0cmluZywgZm9yZWdyb3VuZDogQ29yZS5Db2xvciA9IDB4ZmZmZmZmLCBiYWNrZ3JvdW5kOiBDb3JlLkNvbG9yID0gMHgwMDAwMDApIHtcbiAgICB0aGlzLl93aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuX2hlaWdodCA9IGhlaWdodDtcblxuICAgIHRoaXMuY2FudmFzSWQgPSBjYW52YXNJZDtcblxuICAgIHRoaXMubG9hZGVkID0gZmFsc2U7XG4gICAgdGhpcy5zdGFnZSA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xuXG4gICAgdGhpcy5sb2FkRm9udCgpO1xuICAgIHRoaXMuZGVmYXVsdEJhY2tncm91bmQgPSAweDAwMDAwO1xuICAgIHRoaXMuZGVmYXVsdEZvcmVncm91bmQgPSAweGZmZmZmO1xuXG4gICAgdGhpcy50ZXh0ID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeDxudW1iZXI+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCBHbHlwaC5DSEFSX1NQQUNFKTtcbiAgICB0aGlzLmZvcmUgPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4PENvcmUuQ29sb3I+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0aGlzLmRlZmF1bHRGb3JlZ3JvdW5kKTtcbiAgICB0aGlzLmJhY2sgPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4PENvcmUuQ29sb3I+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0aGlzLmRlZmF1bHRCYWNrZ3JvdW5kKTtcbiAgICB0aGlzLmlzRGlydHkgPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4PGJvb2xlYW4+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0cnVlKTtcbiAgfVxuXG4gIGdldCBoZWlnaHQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5faGVpZ2h0O1xuICB9XG5cbiAgZ2V0IHdpZHRoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3dpZHRoO1xuICB9XG5cbiAgcHJpdmF0ZSBsb2FkRm9udCgpIHtcbiAgICBsZXQgZm9udFVybCA9ICcuL3Rlcm1pbmFsMTZ4MTYucG5nJztcbiAgICB0aGlzLmZvbnQgPSBQSVhJLkJhc2VUZXh0dXJlLmZyb21JbWFnZShmb250VXJsLCBmYWxzZSwgUElYSS5TQ0FMRV9NT0RFUy5ORUFSRVNUKTtcbiAgICBpZiAodGhpcy5mb250Lmhhc0xvYWRlZCkge1xuICAgICAgdGhpcy5vbkZvbnRMb2FkZWQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5mb250Lm9uKCdsb2FkZWQnLCB0aGlzLm9uRm9udExvYWRlZC5iaW5kKHRoaXMpKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uRm9udExvYWRlZCgpIHtcbiAgICB0aGlzLmNoYXJXaWR0aCA9IHRoaXMuZm9udC53aWR0aCAvIDE2O1xuICAgIHRoaXMuY2hhckhlaWdodCA9IHRoaXMuZm9udC5oZWlnaHQgLyAxNjtcblxuICAgIHRoaXMuaW5pdENhbnZhcygpO1xuICAgIHRoaXMuaW5pdENoYXJhY3Rlck1hcCgpO1xuICAgIHRoaXMuaW5pdEJhY2tncm91bmRDZWxscygpO1xuICAgIHRoaXMuaW5pdEZvcmVncm91bmRDZWxscygpO1xuICAgIHRoaXMuYWRkR3JpZE92ZXJsYXkoKVxuICAgIHRoaXMubG9hZGVkID0gdHJ1ZTtcbiAgICAvL3RoaXMuYW5pbWF0ZSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBpbml0Q2FudmFzKCkge1xuICAgIGxldCBjYW52YXNXaWR0aCA9IHRoaXMud2lkdGggKiB0aGlzLmNoYXJXaWR0aDtcbiAgICBsZXQgY2FudmFzSGVpZ2h0ID0gdGhpcy5oZWlnaHQgKiB0aGlzLmNoYXJIZWlnaHQ7XG5cbiAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRoaXMuY2FudmFzSWQpO1xuXG4gICAgbGV0IHBpeGlPcHRpb25zID0ge1xuICAgICAgYW50aWFsaWFzOiBmYWxzZSxcbiAgICAgIGNsZWFyQmVmb3JlUmVuZGVyOiBmYWxzZSxcbiAgICAgIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjogZmFsc2UsXG4gICAgICByZXNvbHV0aW9uOiAxLFxuICAgICAgdHJhbnNwYXJlbnQ6IGZhbHNlLFxuICAgICAgYmFja2dyb3VuZENvbG9yOiBDb3JlLkNvbG9yVXRpbHMudG9OdW1iZXIodGhpcy5kZWZhdWx0QmFja2dyb3VuZCksXG4gICAgICB2aWV3OiB0aGlzLmNhbnZhc1xuICAgIH07XG4gICAgdGhpcy5yZW5kZXJlciA9IFBJWEkuYXV0b0RldGVjdFJlbmRlcmVyKGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQsIHBpeGlPcHRpb25zKTtcbiAgICB0aGlzLnJlbmRlcmVyLmJhY2tncm91bmRDb2xvciA9IENvcmUuQ29sb3JVdGlscy50b051bWJlcih0aGlzLmRlZmF1bHRCYWNrZ3JvdW5kKTtcbiAgICB0aGlzLnRvcExlZnRQb3NpdGlvbiA9IG5ldyBDb3JlLlBvc2l0aW9uKHRoaXMuY2FudmFzLm9mZnNldExlZnQsIHRoaXMuY2FudmFzLm9mZnNldFRvcCk7XG4gIH1cblxuICBwcml2YXRlIGluaXRDaGFyYWN0ZXJNYXAoKSB7XG4gICAgdGhpcy5jaGFycyA9IFtdO1xuICAgIGZvciAoIGxldCB4ID0gMDsgeCA8IDE2OyB4KyspIHtcbiAgICAgIGZvciAoIGxldCB5ID0gMDsgeSA8IDE2OyB5KyspIHtcbiAgICAgICAgbGV0IHJlY3QgPSBuZXcgUElYSS5SZWN0YW5nbGUoeCAqIHRoaXMuY2hhcldpZHRoLCB5ICogdGhpcy5jaGFySGVpZ2h0LCB0aGlzLmNoYXJXaWR0aCwgdGhpcy5jaGFySGVpZ2h0KTtcbiAgICAgICAgdGhpcy5jaGFyc1t4ICsgeSAqIDE2XSA9IG5ldyBQSVhJLlRleHR1cmUodGhpcy5mb250LCByZWN0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGluaXRCYWNrZ3JvdW5kQ2VsbHMoKSB7XG4gICAgdGhpcy5iYWNrQ2VsbHMgPSBbXTtcbiAgICBmb3IgKCBsZXQgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgIHRoaXMuYmFja0NlbGxzW3hdID0gW107XG4gICAgICBmb3IgKCBsZXQgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgIGxldCBjZWxsID0gbmV3IFBJWEkuU3ByaXRlKHRoaXMuY2hhcnNbR2x5cGguQ0hBUl9GVUxMXSk7XG4gICAgICAgIGNlbGwucG9zaXRpb24ueCA9IHggKiB0aGlzLmNoYXJXaWR0aDtcbiAgICAgICAgY2VsbC5wb3NpdGlvbi55ID0geSAqIHRoaXMuY2hhckhlaWdodDtcbiAgICAgICAgY2VsbC53aWR0aCA9IHRoaXMuY2hhcldpZHRoO1xuICAgICAgICBjZWxsLmhlaWdodCA9IHRoaXMuY2hhckhlaWdodDtcbiAgICAgICAgY2VsbC50aW50ID0gQ29yZS5Db2xvclV0aWxzLnRvTnVtYmVyKHRoaXMuZGVmYXVsdEJhY2tncm91bmQpO1xuICAgICAgICB0aGlzLmJhY2tDZWxsc1t4XVt5XSA9IGNlbGw7XG4gICAgICAgIHRoaXMuc3RhZ2UuYWRkQ2hpbGQoY2VsbCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBpbml0Rm9yZWdyb3VuZENlbGxzKCkge1xuICAgIHRoaXMuZm9yZUNlbGxzID0gW107XG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgIHRoaXMuZm9yZUNlbGxzW3hdID0gW107XG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgbGV0IGNlbGwgPSBuZXcgUElYSS5TcHJpdGUodGhpcy5jaGFyc1tHbHlwaC5DSEFSX1NQQUNFXSk7XG4gICAgICAgIGNlbGwucG9zaXRpb24ueCA9IHggKiB0aGlzLmNoYXJXaWR0aDtcbiAgICAgICAgY2VsbC5wb3NpdGlvbi55ID0geSAqIHRoaXMuY2hhckhlaWdodDtcbiAgICAgICAgY2VsbC53aWR0aCA9IHRoaXMuY2hhcldpZHRoO1xuICAgICAgICBjZWxsLmhlaWdodCA9IHRoaXMuY2hhckhlaWdodDtcbiAgICAgICAgY2VsbC50aW50ID0gQ29yZS5Db2xvclV0aWxzLnRvTnVtYmVyKHRoaXMuZGVmYXVsdEZvcmVncm91bmQpO1xuICAgICAgICB0aGlzLmZvcmVDZWxsc1t4XVt5XSA9IGNlbGw7XG4gICAgICAgIHRoaXMuc3RhZ2UuYWRkQ2hpbGQoY2VsbCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhZGRHcmlkT3ZlcmxheSgpIHtcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgIGxldCBjZWxsID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgICAgICAgY2VsbC5saW5lU3R5bGUoMSwgMHg0NDQ0NDQsIDAuNSk7XG4gICAgICAgIGNlbGwuYmVnaW5GaWxsKDAsIDApO1xuICAgICAgICBjZWxsLmRyYXdSZWN0KHggKiB0aGlzLmNoYXJXaWR0aCwgeSAqIHRoaXMuY2hhckhlaWdodCwgdGhpcy5jaGFyV2lkdGgsIHRoaXMuY2hhckhlaWdodCk7XG4gICAgICAgIHRoaXMuc3RhZ2UuYWRkQ2hpbGQoY2VsbCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLypcbiAgcHJpdmF0ZSBhbmltYXRlKCkge1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmFuaW1hdGUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zdGFnZSk7XG4gIH1cbiAgKi9cblxuICByZW5kZXIoKSB7XG4gICAgaWYgKHRoaXMubG9hZGVkKSB7XG4gICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnN0YWdlKTtcbiAgICB9XG4gIH1cblxuICBibGl0KGNvbnNvbGU6IENvbnNvbGUsIG9mZnNldFg6IG51bWJlciA9IDAsIG9mZnNldFk6IG51bWJlciA9IDAsIGZvcmNlRGlydHk6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIGlmICghdGhpcy5sb2FkZWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCBjb25zb2xlLndpZHRoOyB4KyspIHtcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgY29uc29sZS5oZWlnaHQ7IHkrKykge1xuICAgICAgICBpZiAoZm9yY2VEaXJ0eSB8fCBjb25zb2xlLmlzRGlydHlbeF1beV0pIHtcbiAgICAgICAgICBsZXQgYXNjaWkgPSBjb25zb2xlLnRleHRbeF1beV07XG4gICAgICAgICAgbGV0IHB4ID0gb2Zmc2V0WCArIHg7XG4gICAgICAgICAgbGV0IHB5ID0gb2Zmc2V0WSArIHk7XG4gICAgICAgICAgaWYgKGFzY2lpID4gMCAmJiBhc2NpaSA8PSAyNTUpIHtcbiAgICAgICAgICAgIHRoaXMuZm9yZUNlbGxzW3B4XVtweV0udGV4dHVyZSA9IHRoaXMuY2hhcnNbYXNjaWldO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmZvcmVDZWxsc1tweF1bcHldLnRpbnQgPSBDb3JlLkNvbG9yVXRpbHMudG9OdW1iZXIoY29uc29sZS5mb3JlW3hdW3ldKTtcbiAgICAgICAgICB0aGlzLmJhY2tDZWxsc1tweF1bcHldLnRpbnQgPSBDb3JlLkNvbG9yVXRpbHMudG9OdW1iZXIoY29uc29sZS5iYWNrW3hdW3ldKTtcbiAgICAgICAgICBjb25zb2xlLmNsZWFuQ2VsbCh4LCB5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldFBvc2l0aW9uRnJvbVBpeGVscyh4OiBudW1iZXIsIHk6IG51bWJlcikgOiBDb3JlLlBvc2l0aW9uIHtcbiAgICBpZiAoIXRoaXMubG9hZGVkKSB7XG4gICAgICByZXR1cm4gbmV3IENvcmUuUG9zaXRpb24oLTEsIC0xKTtcbiAgICB9IFxuICAgIGxldCBkeDogbnVtYmVyID0geCAtIHRoaXMudG9wTGVmdFBvc2l0aW9uLng7XG4gICAgbGV0IGR5OiBudW1iZXIgPSB5IC0gdGhpcy50b3BMZWZ0UG9zaXRpb24ueTtcbiAgICBsZXQgcnggPSBNYXRoLmZsb29yKGR4IC8gdGhpcy5jaGFyV2lkdGgpO1xuICAgIGxldCByeSA9IE1hdGguZmxvb3IoZHkgLyB0aGlzLmNoYXJIZWlnaHQpO1xuICAgIHJldHVybiBuZXcgQ29yZS5Qb3NpdGlvbihyeCwgcnkpO1xuICB9XG59XG5cbmV4cG9ydCA9IFBpeGlDb25zb2xlO1xuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuL2NvcmUnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9jb21wb25lbnRzJztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4vZW50aXRpZXMnO1xuaW1wb3J0ICogYXMgRXhjZXB0aW9ucyBmcm9tICcuL0V4Y2VwdGlvbnMnO1xuXG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi9FbmdpbmUnKTtcbmltcG9ydCBDb25zb2xlID0gcmVxdWlyZSgnLi9Db25zb2xlJyk7XG5pbXBvcnQgTWFwR2VuZXJhdG9yID0gcmVxdWlyZSgnLi9NYXBHZW5lcmF0b3InKTtcbmltcG9ydCBNYXAgPSByZXF1aXJlKCcuL01hcCcpO1xuaW1wb3J0IFRpbGUgPSByZXF1aXJlKCcuL1RpbGUnKTtcbmltcG9ydCBHbHlwaCA9IHJlcXVpcmUoJy4vR2x5cGgnKTtcblxuaW1wb3J0IE1hcFZpZXcgPSByZXF1aXJlKCcuL01hcFZpZXcnKTtcbmltcG9ydCBMb2dWaWV3ID0gcmVxdWlyZSgnLi9Mb2dWaWV3Jyk7XG5cbmNsYXNzIFNjZW5lIHtcbiAgcHJpdmF0ZSBfZW5naW5lOiBFbmdpbmU7XG4gIGdldCBlbmdpbmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuZ2luZTtcbiAgfVxuXG4gIHByaXZhdGUgX21hcDogTWFwO1xuICBnZXQgbWFwKCkge1xuICAgIHJldHVybiB0aGlzLl9tYXA7XG4gIH1cblxuICBwcml2YXRlIHdpZHRoOiBudW1iZXI7XG4gIHByaXZhdGUgaGVpZ2h0OiBudW1iZXI7XG5cbiAgcHJpdmF0ZSBsb2dWaWV3OiBMb2dWaWV3O1xuICBwcml2YXRlIG1hcFZpZXc6IE1hcFZpZXc7XG5cbiAgY29uc3RydWN0b3IoZW5naW5lOiBFbmdpbmUsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgdGhpcy5fZW5naW5lID0gZW5naW5lO1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcblxuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgbGV0IG1hcEdlbmVyYXRvciA9IG5ldyBNYXBHZW5lcmF0b3IodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQgLSA1KTtcbiAgICB0aGlzLl9tYXAgPSBtYXBHZW5lcmF0b3IuZ2VuZXJhdGUoKTtcbiAgICBDb3JlLlBvc2l0aW9uLnNldE1heFZhbHVlcyh0aGlzLm1hcC53aWR0aCwgdGhpcy5tYXAuaGVpZ2h0KTtcblxuICAgIHRoaXMucmVnaXN0ZXJMaXN0ZW5lcnMoKTtcblxuICAgIHRoaXMubWFwVmlldyA9IG5ldyBNYXBWaWV3KHRoaXMuZW5naW5lLCB0aGlzLm1hcCwgdGhpcy5tYXAud2lkdGgsIHRoaXMubWFwLmhlaWdodCk7XG4gICAgdGhpcy5sb2dWaWV3ID0gbmV3IExvZ1ZpZXcodGhpcy5lbmdpbmUsIHRoaXMud2lkdGgsIDUpO1xuXG4gICAgdGhpcy5nZW5lcmF0ZVdpbHkoKTtcbiAgICB0aGlzLmdlbmVyYXRlUmF0cygpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZW5lcmF0ZVdpbHkoKSB7XG4gICAgdGhpcy5wb3NpdGlvbkVudGl0eShFbnRpdGllcy5jcmVhdGVXaWx5KHRoaXMuZW5naW5lKSk7XG4gIH1cblxuICBwcml2YXRlIGdlbmVyYXRlUmF0cyhudW06IG51bWJlciA9IDEwKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW07IGkrKykge1xuICAgICAgdGhpcy5nZW5lcmF0ZVJhdCgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgZ2VuZXJhdGVSYXQoKSB7XG4gICAgdGhpcy5wb3NpdGlvbkVudGl0eShFbnRpdGllcy5jcmVhdGVSYXQodGhpcy5lbmdpbmUpKTtcbiAgfVxuXG4gIHByaXZhdGUgcG9zaXRpb25FbnRpdHkoZW50aXR5OiBFbnRpdGllcy5FbnRpdHkpIHtcbiAgICBsZXQgY29tcG9uZW50ID0gPENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCk7XG4gICAgbGV0IHBvc2l0aW9uZWQgPSBmYWxzZTtcbiAgICBsZXQgdHJpZXMgPSAwO1xuICAgIGxldCBwb3NpdGlvbiA9IG51bGw7XG4gICAgd2hpbGUgKHRyaWVzIDwgMTAwICYmICFwb3NpdGlvbmVkKSB7XG4gICAgICBwb3NpdGlvbiA9IENvcmUuUG9zaXRpb24uZ2V0UmFuZG9tKCk7XG4gICAgICBwb3NpdGlvbmVkID0gdGhpcy5jYW5Nb3ZlKHBvc2l0aW9uKTtcbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb25lZCkge1xuICAgICAgY29tcG9uZW50Lm1vdmVUbyhwb3NpdGlvbik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdjYW5Nb3ZlJywgXG4gICAgICB0aGlzLm9uQ2FuTW92ZS5iaW5kKHRoaXMpXG4gICAgKSk7XG4gICAgdGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAnbW92ZWRGcm9tJywgXG4gICAgICB0aGlzLm9uTW92ZWRGcm9tLmJpbmQodGhpcylcbiAgICApKTtcbiAgICB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdtb3ZlZFRvJywgXG4gICAgICB0aGlzLm9uTW92ZWRUby5iaW5kKHRoaXMpXG4gICAgKSk7XG4gICAgdGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAnZ2V0VGlsZScsIFxuICAgICAgdGhpcy5vbkdldFRpbGUuYmluZCh0aGlzKVxuICAgICkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbkdldFRpbGUoZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGxldCBwb3NpdGlvbiA9IGV2ZW50LmRhdGEucG9zaXRpb247XG4gICAgcmV0dXJuIHRoaXMubWFwLmdldFRpbGUocG9zaXRpb24pO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVkRnJvbShldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgbGV0IHRpbGUgPSB0aGlzLm1hcC5nZXRUaWxlKGV2ZW50LmRhdGEucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbik7XG4gICAgaWYgKCFldmVudC5kYXRhLnBoeXNpY3NDb21wb25lbnQuYmxvY2tpbmcpIHtcbiAgICAgIGRlbGV0ZSB0aWxlLnByb3BzW2V2ZW50LmRhdGEuZW50aXR5Lmd1aWRdO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aWxlLmVudGl0eSA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVkVG8oZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGxldCB0aWxlID0gdGhpcy5tYXAuZ2V0VGlsZShldmVudC5kYXRhLnBoeXNpY3NDb21wb25lbnQucG9zaXRpb24pO1xuICAgIGlmICghZXZlbnQuZGF0YS5waHlzaWNzQ29tcG9uZW50LmJsb2NraW5nKSB7XG4gICAgICB0aWxlLnByb3BzW2V2ZW50LmRhdGEuZW50aXR5Lmd1aWRdID0gZXZlbnQuZGF0YS5lbnRpdHk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aWxlLmVudGl0eSkge1xuICAgICAgICB0aHJvdyBuZXcgRXhjZXB0aW9ucy5FbnRpdHlPdmVybGFwRXJyb3IoJ1R3byBlbnRpdGllcyBjYW5ub3QgYmUgYXQgdGhlIHNhbWUgc3BvdCcpO1xuICAgICAgfVxuICAgICAgdGlsZS5lbnRpdHkgPSBldmVudC5kYXRhLmVudGl0eTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uQ2FuTW92ZShldmVudDogRXZlbnRzLkV2ZW50KTogYm9vbGVhbiB7XG4gICAgbGV0IHBvc2l0aW9uID0gZXZlbnQuZGF0YS5wb3NpdGlvbjtcbiAgICByZXR1cm4gdGhpcy5jYW5Nb3ZlKHBvc2l0aW9uKTtcbiAgfVxuXG4gIHByaXZhdGUgY2FuTW92ZShwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbik6IGJvb2xlYW4ge1xuICAgIGxldCB0aWxlID0gdGhpcy5tYXAuZ2V0VGlsZShwb3NpdGlvbik7XG4gICAgcmV0dXJuIHRpbGUud2Fsa2FibGUgJiYgdGlsZS5lbnRpdHkgPT09IG51bGw7XG4gIH1cblxuICByZW5kZXIoYmxpdEZ1bmN0aW9uOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLm1hcFZpZXcucmVuZGVyKChjb25zb2xlOiBDb25zb2xlKSA9PiB7XG4gICAgICBibGl0RnVuY3Rpb24oY29uc29sZSwgMCwgMCk7XG4gICAgfSk7XG4gICAgdGhpcy5sb2dWaWV3LnJlbmRlcigoY29uc29sZTogQ29uc29sZSkgPT4ge1xuICAgICAgYmxpdEZ1bmN0aW9uKGNvbnNvbGUsIDAsIHRoaXMuaGVpZ2h0IC0gNSk7XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0ID0gU2NlbmU7XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4vY29yZSc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuL2VudGl0aWVzJztcblxuaW1wb3J0IEdseXBoID0gcmVxdWlyZSgnLi9HbHlwaCcpO1xuXG5pbnRlcmZhY2UgVGlsZURlc2NyaXB0aW9uIHtcbiAgZ2x5cGg6IEdseXBoO1xuICB3YWxrYWJsZTogYm9vbGVhbjtcbiAgYmxvY2tzU2lnaHQ6IGJvb2xlYW47XG59XG5cbmNsYXNzIFRpbGUge1xuICBwdWJsaWMgZ2x5cGg6IEdseXBoO1xuICBwdWJsaWMgd2Fsa2FibGU6IGJvb2xlYW47XG4gIHB1YmxpYyBibG9ja3NTaWdodDogYm9vbGVhbjtcbiAgcHVibGljIGVudGl0eTogRW50aXRpZXMuRW50aXR5O1xuICBwdWJsaWMgcHJvcHM6IHtbZ3VpZDogc3RyaW5nXTogRW50aXRpZXMuRW50aXR5fTtcblxuICBwdWJsaWMgc3RhdGljIEVNUFRZOiBUaWxlRGVzY3JpcHRpb24gPSB7XG4gICAgZ2x5cGg6IG5ldyBHbHlwaChHbHlwaC5DSEFSX1NQQUNFLCAweGZmZmZmZiwgMHgwMDAwMDApLFxuICAgIHdhbGthYmxlOiBmYWxzZSxcbiAgICBibG9ja3NTaWdodDogdHJ1ZSxcbiAgfTtcblxuICBwdWJsaWMgc3RhdGljIEZMT09SOiBUaWxlRGVzY3JpcHRpb24gPSB7XG4gICAgZ2x5cGg6IG5ldyBHbHlwaCgnXFwnJywgMHgyMjIyMjIsIDB4MDAwMDAwKSxcbiAgICB3YWxrYWJsZTogdHJ1ZSxcbiAgICBibG9ja3NTaWdodDogdHJ1ZSxcbiAgfTtcblxuICBwdWJsaWMgc3RhdGljIFdBTEw6IFRpbGVEZXNjcmlwdGlvbiA9IHtcbiAgICBnbHlwaDogbmV3IEdseXBoKEdseXBoLkNIQVJfSExJTkUsIDB4ZmZmZmZmLCAweDAwMDAwMCksXG4gICAgd2Fsa2FibGU6IGZhbHNlLFxuICAgIGJsb2Nrc1NpZ2h0OiB0cnVlLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKGdseXBoOiBHbHlwaCwgd2Fsa2FibGU6IGJvb2xlYW4sIGJsb2Nrc1NpZ2h0OiBib29sZWFuKSB7XG4gICAgdGhpcy5nbHlwaCA9IGdseXBoO1xuICAgIHRoaXMud2Fsa2FibGUgPSB3YWxrYWJsZTtcbiAgICB0aGlzLmJsb2Nrc1NpZ2h0ID0gYmxvY2tzU2lnaHQ7XG4gICAgdGhpcy5lbnRpdHkgPSBudWxsO1xuICAgIHRoaXMucHJvcHMgPSB7fTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlVGlsZShkZXNjOiBUaWxlRGVzY3JpcHRpb24pIHtcbiAgICByZXR1cm4gbmV3IFRpbGUoZGVzYy5nbHlwaCwgZGVzYy53YWxrYWJsZSwgZGVzYy5ibG9ja3NTaWdodCk7XG4gIH1cbn1cblxuZXhwb3J0ID0gVGlsZTtcbiIsImltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuL0VuZ2luZScpO1xuaW1wb3J0IFNjZW5lID0gcmVxdWlyZSgnLi9TY2VuZScpO1xuXG53aW5kb3cub25sb2FkID0gKCkgPT4ge1xuICBsZXQgZW5naW5lID0gbmV3IEVuZ2luZSg2MCwgNDAsICdyb2d1ZScpO1xuICBsZXQgc2NlbmUgPSBuZXcgU2NlbmUoZW5naW5lLCA2MCwgNDApO1xuICBlbmdpbmUuc3RhcnQoc2NlbmUpO1xufTtcbiIsImltcG9ydCAqIGFzIEV4Y2VwdGlvbnMgZnJvbSAnLi4vRXhjZXB0aW9ucyc7XG5cbmV4cG9ydCBjbGFzcyBBY3Rpb24ge1xuICBwcm90ZWN0ZWQgY29zdDogbnVtYmVyID0gMTAwO1xuICBhY3QoKTogbnVtYmVyIHtcbiAgICB0aHJvdyBuZXcgRXhjZXB0aW9ucy5NaXNzaW5nSW1wbGVtZW50YXRpb25FcnJvcignQWN0aW9uLmFjdCBtdXN0IGJlIG92ZXJ3cml0dGVuJyk7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIEV4Y2VwdGlvbnMgZnJvbSAnLi4vRXhjZXB0aW9ucyc7XG5pbXBvcnQgKiBhcyBCZWhhdmlvdXJzIGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0ICogYXMgRW50aXRpZXMgZnJvbSAnLi4vZW50aXRpZXMnO1xuXG5leHBvcnQgY2xhc3MgQmVoYXZpb3VyIHtcbiAgcHJvdGVjdGVkIG5leHRBY3Rpb246IEJlaGF2aW91cnMuQWN0aW9uO1xuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgZW50aXR5OiBFbnRpdGllcy5FbnRpdHkpIHtcbiAgfVxuICBnZXROZXh0QWN0aW9uKCk6IEJlaGF2aW91cnMuQWN0aW9uIHtcbiAgICB0aHJvdyBuZXcgRXhjZXB0aW9ucy5NaXNzaW5nSW1wbGVtZW50YXRpb25FcnJvcignQmVoYXZpb3VyLmdldE5leHRBY3Rpb24gbXVzdCBiZSBvdmVyd3JpdHRlbicpO1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBCZWhhdmlvdXJzIGZyb20gJy4vaW5kZXgnO1xuXG5leHBvcnQgY2xhc3MgTnVsbEFjdGlvbiBleHRlbmRzIEJlaGF2aW91cnMuQWN0aW9uIHtcbiAgYWN0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuY29zdDtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgQmVoYXZpb3VycyBmcm9tICcuL2luZGV4JztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi4vY29tcG9uZW50cyc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuLi9lbnRpdGllcyc7XG5cbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIFJhbmRvbVdhbGtCZWhhdmlvdXIgZXh0ZW5kcyBCZWhhdmlvdXJzLkJlaGF2aW91ciB7XG4gIHByaXZhdGUgcGh5c2ljc0NvbXBvbmVudDogQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50O1xuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBlbmdpbmU6IEVuZ2luZSwgcHJvdGVjdGVkIGVudGl0eTogRW50aXRpZXMuRW50aXR5KSB7XG4gICAgc3VwZXIoZW50aXR5KTtcbiAgICB0aGlzLnBoeXNpY3NDb21wb25lbnQgPSA8Q29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KTtcbiAgfVxuXG4gIGdldE5leHRBY3Rpb24oKTogQmVoYXZpb3Vycy5BY3Rpb24ge1xuICAgIGxldCBwb3NpdGlvbnMgPSBDb3JlLlV0aWxzLnJhbmRvbWl6ZUFycmF5KENvcmUuUG9zaXRpb24uZ2V0TmVpZ2hib3Vycyh0aGlzLnBoeXNpY3NDb21wb25lbnQucG9zaXRpb24pKTtcbiAgICBsZXQgY2FuTW92ZSA9IGZhbHNlO1xuICAgIGxldCBwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbiA9IG51bGw7XG4gICAgd2hpbGUoIWNhbk1vdmUgJiYgcG9zaXRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgIHBvc2l0aW9uID0gcG9zaXRpb25zLnBvcCgpO1xuICAgICAgY2FuTW92ZSA9IHRoaXMuZW5naW5lLmNhbihuZXcgRXZlbnRzLkV2ZW50KCdjYW5Nb3ZlJywge3Bvc2l0aW9uOiBwb3NpdGlvbn0pKTtcbiAgICB9XG4gICAgXG4gICAgaWYgKGNhbk1vdmUpIHtcbiAgICAgIHJldHVybiBuZXcgQmVoYXZpb3Vycy5XYWxrQWN0aW9uKHRoaXMucGh5c2ljc0NvbXBvbmVudCwgcG9zaXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IEJlaGF2aW91cnMuTnVsbEFjdGlvbigpO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi4vY29tcG9uZW50cyc7XG5pbXBvcnQgKiBhcyBCZWhhdmlvdXJzIGZyb20gJy4vaW5kZXgnO1xuXG5leHBvcnQgY2xhc3MgV2Fsa0FjdGlvbiBleHRlbmRzIEJlaGF2aW91cnMuQWN0aW9uIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBwaHlzaWNzQ29tcG9uZW50OiBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQsIHByaXZhdGUgcG9zaXRpb246IENvcmUuUG9zaXRpb24pIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgYWN0KCk6IG51bWJlciB7XG4gICAgdGhpcy5waHlzaWNzQ29tcG9uZW50Lm1vdmVUbyh0aGlzLnBvc2l0aW9uKTtcbiAgICByZXR1cm4gdGhpcy5jb3N0O1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBCZWhhdmlvdXJzIGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0ICogYXMgRW50aXRpZXMgZnJvbSAnLi4vZW50aXRpZXMnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4uL2NvbXBvbmVudHMnO1xuXG5pbXBvcnQgVGlsZSA9IHJlcXVpcmUoJy4uL1RpbGUnKTtcbmltcG9ydCBHbHlwaCA9IHJlcXVpcmUoJy4uL0dseXBoJyk7XG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBXcml0ZVJ1bmVBY3Rpb24gZXh0ZW5kcyBCZWhhdmlvdXJzLkFjdGlvbiB7XG4gIHByaXZhdGUgZW5naW5lOiBFbmdpbmU7XG4gIHByaXZhdGUgcGh5c2ljczogQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50O1xuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBlbnRpdHk6IEVudGl0aWVzLkVudGl0eSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5lbmdpbmUgPSBlbmdpbmU7XG4gICAgdGhpcy5waHlzaWNzID0gPENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCk7XG4gIH1cblxuICBhY3QoKTogbnVtYmVyIHtcbiAgICBjb25zdCBydW5lID0gbmV3IEVudGl0aWVzLkVudGl0eSh0aGlzLmVuZ2luZSwgJ1J1bmUnKTtcbiAgICBydW5lLmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KHRoaXMuZW5naW5lLCB7XG4gICAgICBwb3NpdGlvbjogdGhpcy5waHlzaWNzLnBvc2l0aW9uLFxuICAgICAgYmxvY2tpbmc6IGZhbHNlXG4gICAgfSkpO1xuICAgIHJ1bmUuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLlJlbmRlcmFibGVDb21wb25lbnQodGhpcy5lbmdpbmUsIHtcbiAgICAgIGdseXBoOiBuZXcgR2x5cGgoJyMnLCAweDAwZmZhYSwgMHgwMDAwMDApXG4gICAgfSkpO1xuICAgIHJ1bmUuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLlNlbGZEZXN0cnVjdENvbXBvbmVudCh0aGlzLmVuZ2luZSwge1xuICAgICAgdHVybnM6IDEwXG4gICAgfSkpO1xuICAgIHJ1bmUuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLlJ1bmVEYW1hZ2VDb21wb25lbnQodGhpcy5lbmdpbmUpKTtcbiAgICByZXR1cm4gdGhpcy5jb3N0O1xuICB9XG59XG4iLCJleHBvcnQgKiBmcm9tICcuL0FjdGlvbic7XG5leHBvcnQgKiBmcm9tICcuL0JlaGF2aW91cic7XG5leHBvcnQgKiBmcm9tICcuL1dhbGtBY3Rpb24nO1xuZXhwb3J0ICogZnJvbSAnLi9OdWxsQWN0aW9uJztcbmV4cG9ydCAqIGZyb20gJy4vV3JpdGVSdW5lQWN0aW9uJztcbmV4cG9ydCAqIGZyb20gJy4vUmFuZG9tV2Fsa0JlaGF2aW91cic7XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgRXhjZXB0aW9ucyBmcm9tICcuLi9FeGNlcHRpb25zJztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4uL2VudGl0aWVzJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50IHtcbiAgcHJvdGVjdGVkIGxpc3RlbmVyczogRXZlbnRzLkxpc3RlbmVyW107XG5cbiAgcHJvdGVjdGVkIF9ndWlkOiBzdHJpbmc7XG4gIGdldCBndWlkKCkge1xuICAgIHJldHVybiB0aGlzLl9ndWlkO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9lbnRpdHk6IEVudGl0aWVzLkVudGl0eTtcbiAgZ2V0IGVudGl0eSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW50aXR5O1xuICB9XG5cbiAgcHJvdGVjdGVkIF9lbmdpbmU6IEVuZ2luZTtcbiAgZ2V0IGVuZ2luZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5naW5lO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZW5naW5lOiBFbmdpbmUsIGRhdGE6IGFueSA9IHt9KSB7XG4gICAgdGhpcy5fZ3VpZCA9IENvcmUuVXRpbHMuZ2VuZXJhdGVHdWlkKCk7XG4gICAgdGhpcy5fZW5naW5lID0gZW5naW5lO1xuICAgIHRoaXMubGlzdGVuZXJzID0gW107XG4gIH1cblxuICByZWdpc3RlckVudGl0eShlbnRpdHk6IEVudGl0aWVzLkVudGl0eSkge1xuICAgIHRoaXMuX2VudGl0eSA9IGVudGl0eTtcbiAgICB0aGlzLmNoZWNrUmVxdWlyZW1lbnRzKCk7XG4gICAgdGhpcy5pbml0aWFsaXplKCk7XG4gICAgdGhpcy5yZWdpc3Rlckxpc3RlbmVycygpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGNoZWNrUmVxdWlyZW1lbnRzKCk6IHZvaWQge1xuICB9XG5cbiAgcHJvdGVjdGVkIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICB9XG5cbiAgcHJvdGVjdGVkIGluaXRpYWxpemUoKSB7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGlmICghdGhpcy5saXN0ZW5lcnMgfHwgdHlwZW9mIHRoaXMubGlzdGVuZXJzLmZvckVhY2ggIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xuICAgICAgZGVidWdnZXI7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9ucy5NaXNzaW5nSW1wbGVtZW50YXRpb25FcnJvcignYHRoaXMubGlzdGVuZXJzYCBoYXMgYmVlbiByZWRlZmluZWQsIGRlZmF1bHQgYGRlc3Ryb3lgIGZ1bmN0aW9uIHNob3VsZCBub3QgYmUgdXNlZC4gRm9yOiAnICsgdGhpcy5lbnRpdHkubmFtZSk7XG4gICAgfVxuICAgIHRoaXMubGlzdGVuZXJzLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XG4gICAgICB0aGlzLmVuZ2luZS5yZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgfSk7XG4gICAgdGhpcy5saXN0ZW5lcnMgPSBbXTtcbiAgfVxufVxuIiwiaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2luZGV4JztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuXG5leHBvcnQgY2xhc3MgRW5lcmd5Q29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICBwcml2YXRlIF9jdXJyZW50RW5lcmd5OiBudW1iZXI7XG4gIGdldCBjdXJyZW50RW5lcmd5KCkge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50RW5lcmd5O1xuICB9XG5cbiAgcHJpdmF0ZSBfZW5lcmd5UmVnZW5lcmF0aW9uUmF0ZTogbnVtYmVyO1xuICBnZXQgZW5lcmd5UmVnZW5lcmF0aW9uUmF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5lcmd5UmVnZW5lcmF0aW9uUmF0ZTtcbiAgfVxuXG4gIHByaXZhdGUgX21heEVuZXJneTogbnVtYmVyO1xuICBnZXQgbWF4RW5lcmd5KCkge1xuICAgIHJldHVybiB0aGlzLl9tYXhFbmVyZ3k7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihlbmdpbmU6IEVuZ2luZSwgZGF0YToge3JlZ2VucmF0YXRpb25SYXRlOiBudW1iZXIsIG1heDogbnVtYmVyfSA9IHtyZWdlbnJhdGF0aW9uUmF0ZTogMTAwLCBtYXg6IDEwMDB9KSB7XG4gICAgc3VwZXIoZW5naW5lKTtcbiAgICB0aGlzLl9jdXJyZW50RW5lcmd5ID0gdGhpcy5fbWF4RW5lcmd5ID0gZGF0YS5tYXg7XG4gICAgdGhpcy5fZW5lcmd5UmVnZW5lcmF0aW9uUmF0ZSA9IGRhdGEucmVnZW5yYXRhdGlvblJhdGU7XG4gIH1cblxuICBwcm90ZWN0ZWQgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaCh0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICd0aWNrJyxcbiAgICAgIHRoaXMub25UaWNrLmJpbmQodGhpcylcbiAgICApKSk7XG4gIH1cblxuICBwcml2YXRlIG9uVGljayhldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgdGhpcy5fY3VycmVudEVuZXJneSA9IE1hdGgubWluKHRoaXMubWF4RW5lcmd5LCB0aGlzLl9jdXJyZW50RW5lcmd5ICsgdGhpcy5fZW5lcmd5UmVnZW5lcmF0aW9uUmF0ZSk7XG4gIH1cblxuICB1c2VFbmVyZ3koZW5lcmd5OiBudW1iZXIpOiBudW1iZXIge1xuICAgIHRoaXMuX2N1cnJlbnRFbmVyZ3kgPSB0aGlzLl9jdXJyZW50RW5lcmd5IC0gZW5lcmd5O1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50RW5lcmd5O1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuXG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBIZWFsdGhDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZW50aXR5Lmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgICdkYW1hZ2UnLFxuICAgICAgdGhpcy5vbkRhbWFnZS5iaW5kKHRoaXMpXG4gICAgKSk7XG4gIH1cblxuICBwcml2YXRlIG9uRGFtYWdlKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICAgIHRoaXMuZW5naW5lLnJlbW92ZUVudGl0eSh0aGlzLmVudGl0eSk7XG4gICAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ21lc3NhZ2UnLCB7XG4gICAgICAgIG1lc3NhZ2U6IHRoaXMuZW50aXR5Lm5hbWUgKyAnIHdhcyBraWxsZWQgYnkgJyArIGV2ZW50LmRhdGEuc291cmNlLm5hbWUgKyAnLicsXG4gICAgICAgIHRhcmdldDogdGhpcy5lbnRpdHlcbiAgICAgIH0pKTtcbiAgfTtcbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgKiBhcyBCZWhhdmlvdXJzIGZyb20gJy4uL2JlaGF2aW91cnMnO1xuXG5pbXBvcnQgSW5wdXRIYW5kbGVyID0gcmVxdWlyZSgnLi4vSW5wdXRIYW5kbGVyJyk7XG5pbXBvcnQgR2x5cGggPSByZXF1aXJlKCcuLi9HbHlwaCcpO1xuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgSW5wdXRDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gIHByaXZhdGUgZW5lcmd5Q29tcG9uZW50OiBDb21wb25lbnRzLkVuZXJneUNvbXBvbmVudDtcbiAgcHJpdmF0ZSBwaHlzaWNzQ29tcG9uZW50OiBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ7XG4gIHByaXZhdGUgaGFzRm9jdXM6IGJvb2xlYW47XG5cbiAgcHJvdGVjdGVkIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5lbmVyZ3lDb21wb25lbnQgPSA8Q29tcG9uZW50cy5FbmVyZ3lDb21wb25lbnQ+dGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KENvbXBvbmVudHMuRW5lcmd5Q29tcG9uZW50KTtcbiAgICB0aGlzLnBoeXNpY3NDb21wb25lbnQgPSA8Q29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50PnRoaXMuZW50aXR5LmdldENvbXBvbmVudChDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQpO1xuICAgIHRoaXMuaGFzRm9jdXMgPSBmYWxzZTtcbiAgfVxuXG4gIHByb3RlY3RlZCByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ3RpY2snLFxuICAgICAgdGhpcy5vblRpY2suYmluZCh0aGlzKVxuICAgICkpKTtcblxuICAgIHRoaXMuZW5naW5lLmlucHV0SGFuZGxlci5saXN0ZW4oXG4gICAgICBbSW5wdXRIYW5kbGVyLktFWV9VUCwgSW5wdXRIYW5kbGVyLktFWV9LXSwgXG4gICAgICB0aGlzLm9uTW92ZVVwLmJpbmQodGhpcylcbiAgICApO1xuICAgIHRoaXMuZW5naW5lLmlucHV0SGFuZGxlci5saXN0ZW4oXG4gICAgICBbSW5wdXRIYW5kbGVyLktFWV9VXSxcbiAgICAgIHRoaXMub25Nb3ZlVXBSaWdodC5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICB0aGlzLmVuZ2luZS5pbnB1dEhhbmRsZXIubGlzdGVuKFxuICAgICAgW0lucHV0SGFuZGxlci5LRVlfUklHSFQsIElucHV0SGFuZGxlci5LRVlfTF0sIFxuICAgICAgdGhpcy5vbk1vdmVSaWdodC5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICB0aGlzLmVuZ2luZS5pbnB1dEhhbmRsZXIubGlzdGVuKFxuICAgICAgW0lucHV0SGFuZGxlci5LRVlfTl0sXG4gICAgICB0aGlzLm9uTW92ZURvd25SaWdodC5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICB0aGlzLmVuZ2luZS5pbnB1dEhhbmRsZXIubGlzdGVuKFxuICAgICAgW0lucHV0SGFuZGxlci5LRVlfRE9XTiwgSW5wdXRIYW5kbGVyLktFWV9KXSwgXG4gICAgICB0aGlzLm9uTW92ZURvd24uYmluZCh0aGlzKVxuICAgICk7XG4gICAgdGhpcy5lbmdpbmUuaW5wdXRIYW5kbGVyLmxpc3RlbihcbiAgICAgIFtJbnB1dEhhbmRsZXIuS0VZX0JdLFxuICAgICAgdGhpcy5vbk1vdmVEb3duTGVmdC5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICB0aGlzLmVuZ2luZS5pbnB1dEhhbmRsZXIubGlzdGVuKFxuICAgICAgW0lucHV0SGFuZGxlci5LRVlfTEVGVCwgSW5wdXRIYW5kbGVyLktFWV9IXSwgXG4gICAgICB0aGlzLm9uTW92ZUxlZnQuYmluZCh0aGlzKVxuICAgICk7XG4gICAgdGhpcy5lbmdpbmUuaW5wdXRIYW5kbGVyLmxpc3RlbihcbiAgICAgIFtJbnB1dEhhbmRsZXIuS0VZX1ldLFxuICAgICAgdGhpcy5vbk1vdmVVcExlZnQuYmluZCh0aGlzKVxuICAgICk7XG4gICAgdGhpcy5lbmdpbmUuaW5wdXRIYW5kbGVyLmxpc3RlbihcbiAgICAgIFtJbnB1dEhhbmRsZXIuS0VZX1BFUklPRF0sIFxuICAgICAgdGhpcy5vbldhaXQuYmluZCh0aGlzKVxuICAgICk7XG4gICAgdGhpcy5lbmdpbmUuaW5wdXRIYW5kbGVyLmxpc3RlbihcbiAgICAgIFtJbnB1dEhhbmRsZXIuS0VZXzBdLCBcbiAgICAgIHRoaXMub25UcmFwT25lLmJpbmQodGhpcylcbiAgICApO1xuICB9XG5cbiAgb25UaWNrKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBpZiAodGhpcy5lbmVyZ3lDb21wb25lbnQuY3VycmVudEVuZXJneSA+PSAxMDApIHtcbiAgICAgIHRoaXMuYWN0KCk7XG4gICAgfVxuICB9XG5cbiAgYWN0KCkge1xuICAgIHRoaXMuaGFzRm9jdXMgPSB0cnVlO1xuICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgncGF1c2VUaW1lJykpO1xuICB9XG5cbiAgcHJpdmF0ZSBwZXJmb3JtQWN0aW9uKGFjdGlvbjogQmVoYXZpb3Vycy5BY3Rpb24pIHtcbiAgICB0aGlzLmhhc0ZvY3VzID0gZmFsc2U7XG4gICAgdGhpcy5lbmdpbmUuZW1pdChuZXcgRXZlbnRzLkV2ZW50KCdyZXN1bWVUaW1lJykpO1xuICAgIHRoaXMuZW5lcmd5Q29tcG9uZW50LnVzZUVuZXJneShhY3Rpb24uYWN0KCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbldhaXQoKSB7XG4gICAgaWYgKCF0aGlzLmhhc0ZvY3VzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucGVyZm9ybUFjdGlvbihuZXcgQmVoYXZpb3Vycy5OdWxsQWN0aW9uKCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvblRyYXBPbmUoKSB7XG4gICAgaWYgKCF0aGlzLmhhc0ZvY3VzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGFjdGlvbiA9IHRoaXMuZW50aXR5LmZpcmUobmV3IEV2ZW50cy5FdmVudCgnd3JpdGVSdW5lJywge30pKTtcbiAgICBpZiAoYWN0aW9uKSB7XG4gICAgICB0aGlzLnBlcmZvcm1BY3Rpb24oYWN0aW9uKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZVVwKCkge1xuICAgIGlmICghdGhpcy5oYXNGb2N1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmhhbmRsZU1vdmVtZW50KG5ldyBDb3JlLlBvc2l0aW9uKDAsIC0xKSk7XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZVVwUmlnaHQoKSB7XG4gICAgaWYgKCF0aGlzLmhhc0ZvY3VzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuaGFuZGxlTW92ZW1lbnQobmV3IENvcmUuUG9zaXRpb24oMSwgLTEpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Nb3ZlUmlnaHQoKSB7XG4gICAgaWYgKCF0aGlzLmhhc0ZvY3VzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuaGFuZGxlTW92ZW1lbnQobmV3IENvcmUuUG9zaXRpb24oMSwgMCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVEb3duUmlnaHQoKSB7XG4gICAgaWYgKCF0aGlzLmhhc0ZvY3VzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuaGFuZGxlTW92ZW1lbnQobmV3IENvcmUuUG9zaXRpb24oMSwgMSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVEb3duKCkge1xuICAgIGlmICghdGhpcy5oYXNGb2N1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmhhbmRsZU1vdmVtZW50KG5ldyBDb3JlLlBvc2l0aW9uKDAsIDEpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Nb3ZlRG93bkxlZnQoKSB7XG4gICAgaWYgKCF0aGlzLmhhc0ZvY3VzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuaGFuZGxlTW92ZW1lbnQobmV3IENvcmUuUG9zaXRpb24oLTEsIDEpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Nb3ZlTGVmdCgpIHtcbiAgICBpZiAoIXRoaXMuaGFzRm9jdXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5oYW5kbGVNb3ZlbWVudChuZXcgQ29yZS5Qb3NpdGlvbigtMSwgMCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVVcExlZnQoKSB7XG4gICAgaWYgKCF0aGlzLmhhc0ZvY3VzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuaGFuZGxlTW92ZW1lbnQobmV3IENvcmUuUG9zaXRpb24oLTEsIC0xKSk7XG4gIH1cblxuICBwcml2YXRlIGhhbmRsZU1vdmVtZW50KGRpcmVjdGlvbjogQ29yZS5Qb3NpdGlvbikge1xuICAgIGNvbnN0IHBvc2l0aW9uID0gQ29yZS5Qb3NpdGlvbi5hZGQodGhpcy5waHlzaWNzQ29tcG9uZW50LnBvc2l0aW9uLCBkaXJlY3Rpb24pO1xuICAgIGNvbnN0IGNhbk1vdmUgPSB0aGlzLmVuZ2luZS5jYW4obmV3IEV2ZW50cy5FdmVudCgnY2FuTW92ZScsIHtwb3NpdGlvbjogcG9zaXRpb259KSk7XG4gICAgaWYgKGNhbk1vdmUpIHtcbiAgICAgIHRoaXMucGVyZm9ybUFjdGlvbihuZXcgQmVoYXZpb3Vycy5XYWxrQWN0aW9uKHRoaXMucGh5c2ljc0NvbXBvbmVudCwgcG9zaXRpb24pKTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5cbmltcG9ydCBHbHlwaCA9IHJlcXVpcmUoJy4uL0dseXBoJyk7XG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBQaHlzaWNzQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICBwcml2YXRlIF9ibG9ja2luZzogYm9vbGVhbjtcbiAgZ2V0IGJsb2NraW5nKCkge1xuICAgIHJldHVybiB0aGlzLl9ibG9ja2luZztcbiAgfVxuICBwcml2YXRlIF9wb3NpdGlvbjogQ29yZS5Qb3NpdGlvbjtcbiAgZ2V0IHBvc2l0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9wb3NpdGlvbjtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBkYXRhOiB7cG9zaXRpb246IENvcmUuUG9zaXRpb24sIGJsb2NraW5nOiBib29sZWFufSA9IHtwb3NpdGlvbjogbnVsbCwgYmxvY2tpbmc6IHRydWV9KSB7XG4gICAgc3VwZXIoZW5naW5lKTtcbiAgICB0aGlzLl9wb3NpdGlvbiA9IGRhdGEucG9zaXRpb247XG4gICAgdGhpcy5fYmxvY2tpbmcgPSBkYXRhLmJsb2NraW5nO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBpZiAodGhpcy5wb3NpdGlvbikge1xuICAgICAgdGhpcy5lbmdpbmUuZW1pdChuZXcgRXZlbnRzLkV2ZW50KCdtb3ZlZFRvJywge3BoeXNpY3NDb21wb25lbnQ6IHRoaXMsIGVudGl0eTogdGhpcy5lbnRpdHl9KSk7XG4gICAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ21vdmUnLCB7cGh5c2ljc0NvbXBvbmVudDogdGhpcywgZW50aXR5OiB0aGlzLmVudGl0eX0pKTtcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHN1cGVyLmRlc3Ryb3koKTtcbiAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ21vdmVkRnJvbScsIHtwaHlzaWNzQ29tcG9uZW50OiB0aGlzLCBlbnRpdHk6IHRoaXMuZW50aXR5fSkpO1xuICB9XG5cbiAgbW92ZVRvKHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uKSB7XG4gICAgaWYgKHRoaXMuX3Bvc2l0aW9uKSB7XG4gICAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ21vdmVkRnJvbScsIHtwaHlzaWNzQ29tcG9uZW50OiB0aGlzLCBlbnRpdHk6IHRoaXMuZW50aXR5fSkpO1xuICAgIH1cbiAgICB0aGlzLl9wb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgnbW92ZWRUbycsIHtwaHlzaWNzQ29tcG9uZW50OiB0aGlzLCBlbnRpdHk6IHRoaXMuZW50aXR5fSkpO1xuICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgnbW92ZScsIHtwaHlzaWNzQ29tcG9uZW50OiB0aGlzLCBlbnRpdHk6IHRoaXMuZW50aXR5fSkpO1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuLi9lbnRpdGllcyc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIEV4Y2VwdGlvbnMgZnJvbSAnLi4vRXhjZXB0aW9ucyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuXG5pbXBvcnQgR2x5cGggPSByZXF1aXJlKCcuLi9HbHlwaCcpO1xuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgUmVuZGVyYWJsZUNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSBfZ2x5cGg6IEdseXBoO1xuICBnZXQgZ2x5cGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dseXBoO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZW5naW5lOiBFbmdpbmUsIGRhdGE6IHtnbHlwaDogR2x5cGh9KSB7XG4gICAgc3VwZXIoZW5naW5lKTtcbiAgICB0aGlzLl9nbHlwaCA9IGRhdGEuZ2x5cGg7XG4gIH1cblxuICBwcm90ZWN0ZWQgY2hlY2tSZXF1aXJlbWVudHMoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmVudGl0eS5oYXNDb21wb25lbnQoQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KSkge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbnMuTWlzc2luZ0NvbXBvbmVudEVycm9yKCdSZW5kZXJhYmxlQ29tcG9uZW50IHJlcXVpcmVzIFBoeXNpY3NDb21wb25lbnQnKTtcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ3JlbmRlcmFibGVDb21wb25lbnRDcmVhdGVkJywge2VudGl0eTogdGhpcy5lbnRpdHksIHJlbmRlcmFibGVDb21wb25lbnQ6IHRoaXN9KSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgncmVuZGVyYWJsZUNvbXBvbmVudERlc3Ryb3llZCcsIHtlbnRpdHk6IHRoaXMuZW50aXR5LCByZW5kZXJhYmxlQ29tcG9uZW50OiB0aGlzfSkpO1xuICB9XG59XG4iLCJpbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmltcG9ydCAqIGFzIEJlaGF2aW91cnMgZnJvbSAnLi4vYmVoYXZpb3Vycyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5cbmV4cG9ydCBjbGFzcyBSb2FtaW5nQUlDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gIHByaXZhdGUgZW5lcmd5Q29tcG9uZW50OiBDb21wb25lbnRzLkVuZXJneUNvbXBvbmVudDtcblxuICBwcml2YXRlIHJhbmRvbVdhbGtCZWhhdmlvdXI6IEJlaGF2aW91cnMuUmFuZG9tV2Fsa0JlaGF2aW91cjtcblxuICBwcm90ZWN0ZWQgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLmVuZXJneUNvbXBvbmVudCA9IDxDb21wb25lbnRzLkVuZXJneUNvbXBvbmVudD50aGlzLmVudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5FbmVyZ3lDb21wb25lbnQpO1xuICAgIHRoaXMucmFuZG9tV2Fsa0JlaGF2aW91ciA9IG5ldyBCZWhhdmlvdXJzLlJhbmRvbVdhbGtCZWhhdmlvdXIodGhpcy5lbmdpbmUsIHRoaXMuZW50aXR5KTtcbiAgfVxuXG4gIHByb3RlY3RlZCByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ3RpY2snLFxuICAgICAgdGhpcy5vblRpY2suYmluZCh0aGlzKVxuICAgICkpKTtcbiAgfVxuXG4gIG9uVGljayhldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgaWYgKHRoaXMuZW5lcmd5Q29tcG9uZW50LmN1cnJlbnRFbmVyZ3kgPj0gMTAwKSB7XG4gICAgICBsZXQgYWN0aW9uID0gdGhpcy5yYW5kb21XYWxrQmVoYXZpb3VyLmdldE5leHRBY3Rpb24oKTtcbiAgICAgIHRoaXMuZW5lcmd5Q29tcG9uZW50LnVzZUVuZXJneShhY3Rpb24uYWN0KCkpO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2luZGV4JztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgUnVuZURhbWFnZUNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSByYWRpdXM6IG51bWJlcjtcbiAgcHJpdmF0ZSBjaGFyZ2VzOiBudW1iZXI7XG4gIHByaXZhdGUgcGh5c2ljc0NvbXBvbmVudDogQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50O1xuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBkYXRhOiB7cmFkaXVzOiBudW1iZXIsIGNoYXJnZXM6IG51bWJlcn0gPSB7cmFkaXVzOiAxLCBjaGFyZ2VzOiAxfSkge1xuICAgIHN1cGVyKGVuZ2luZSk7XG4gICAgdGhpcy5yYWRpdXMgPSBkYXRhLnJhZGl1cztcbiAgICB0aGlzLmNoYXJnZXMgPSBkYXRhLmNoYXJnZXM7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMucGh5c2ljc0NvbXBvbmVudCA9IDxDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ+dGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCk7XG4gIH1cblxuICByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ21vdmVkVG8nLFxuICAgICAgdGhpcy5vbk1vdmVkVG8uYmluZCh0aGlzKSxcbiAgICAgIDUwXG4gICAgKSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVkVG8oZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGlmICh0aGlzLmNoYXJnZXMgPD0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBldmVudFBvc2l0aW9uID0gZXZlbnQuZGF0YS5waHlzaWNzQ29tcG9uZW50LnBvc2l0aW9uOyBcbiAgICBpZiAoZXZlbnRQb3NpdGlvbi54ID09IHRoaXMucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbi54ICYmIFxuICAgICAgICBldmVudFBvc2l0aW9uLnkgPT09IHRoaXMucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbi55KSB7XG4gICAgICBldmVudC5kYXRhLmVudGl0eS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ2RhbWFnZScsIHtcbiAgICAgICAgc291cmNlOiB0aGlzLmVudGl0eVxuICAgICAgfSkpO1xuICAgICAgdGhpcy5jaGFyZ2VzLS07XG4gICAgICBpZiAodGhpcy5jaGFyZ2VzIDw9IDApIHtcbiAgICAgICAgdGhpcy5lbmdpbmUucmVtb3ZlRW50aXR5KHRoaXMuZW50aXR5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBCZWhhdmlvdXJzIGZyb20gJy4uL2JlaGF2aW91cnMnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuLi9lbnRpdGllcyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuXG5pbXBvcnQgR2x5cGggPSByZXF1aXJlKCcuLi9HbHlwaCcpO1xuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgUnVuZVdyaXRlckNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSBwaHlzaWNhbENvbXBvbmVudDogQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50O1xuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBkYXRhOiB7fSA9IHt9KSB7XG4gICAgc3VwZXIoZW5naW5lKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBpbml0aWFsaXplKCkge1xuICAgIHRoaXMucGh5c2ljYWxDb21wb25lbnQgPSA8Q29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50PnRoaXMuZW50aXR5LmdldENvbXBvbmVudChDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZW50aXR5Lmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ3dyaXRlUnVuZScsXG4gICAgICB0aGlzLm9uV3JpdGVSdW5lLmJpbmQodGhpcylcbiAgICApKTtcbiAgfVxuXG4gIG9uV3JpdGVSdW5lKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBjb25zdCB0aWxlID0gdGhpcy5lbmdpbmUuZmlyZShuZXcgRXZlbnRzLkV2ZW50KCdnZXRUaWxlJywge1xuICAgICAgcG9zaXRpb246IHRoaXMucGh5c2ljYWxDb21wb25lbnQucG9zaXRpb25cbiAgICB9KSk7XG5cbiAgICBsZXQgaGFzUnVuZSA9IGZhbHNlO1xuICAgIGZvciAodmFyIGtleSBpbiB0aWxlLnByb3BzKSB7XG4gICAgICBpZiAodGlsZS5wcm9wc1trZXldLm5hbWUgPT09ICdydW5lJykge1xuICAgICAgICBoYXNSdW5lID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaGFzUnVuZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICBcbiAgICByZXR1cm4gbmV3IEJlaGF2aW91cnMuV3JpdGVSdW5lQWN0aW9uKHRoaXMuZW5naW5lLCB0aGlzLmVudGl0eSk7XG5cbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2luZGV4JztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgU2VsZkRlc3RydWN0Q29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICBwcml2YXRlIG1heFR1cm5zOiBudW1iZXI7XG4gIHByaXZhdGUgdHVybnNMZWZ0OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoZW5naW5lOiBFbmdpbmUsIGRhdGE6IHt0dXJuczogbnVtYmVyfSkge1xuICAgIHN1cGVyKGVuZ2luZSk7XG4gICAgdGhpcy5tYXhUdXJucyA9IGRhdGEudHVybnM7XG4gICAgdGhpcy50dXJuc0xlZnQgPSBkYXRhLnR1cm5zO1xuICAgIHRoaXMubGlzdGVuZXJzID0gW107XG4gIH1cblxuICByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ3R1cm4nLFxuICAgICAgdGhpcy5vblR1cm4uYmluZCh0aGlzKSxcbiAgICAgIDUwXG4gICAgKSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvblR1cm4oZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIHRoaXMudHVybnNMZWZ0LS07XG4gICAgaWYgKHRoaXMudHVybnNMZWZ0IDwgMCkge1xuICAgICAgdGhpcy5lbmdpbmUucmVtb3ZlRW50aXR5KHRoaXMuZW50aXR5KTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcblxuZXhwb3J0IGNsYXNzIFRpbWVIYW5kbGVyQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICBwcml2YXRlIF9jdXJyZW50VGljazogbnVtYmVyO1xuICBnZXQgY3VycmVudFRpY2soKSB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRUaWNrO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3VycmVudFR1cm46IG51bWJlcjtcbiAgZ2V0IGN1cnJlbnRUdXJuKCkge1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50VHVybjtcbiAgfVxuXG4gIHByaXZhdGUgdGlja3NQZXJUdXJuOiBudW1iZXI7XG4gIHByaXZhdGUgdHVyblRpbWU6IG51bWJlcjtcblxuICBwcml2YXRlIHBhdXNlZDogYm9vbGVhbjtcblxuICBwcm90ZWN0ZWQgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnRpY2tzUGVyVHVybiA9IDE7XG4gICAgdGhpcy50dXJuVGltZSA9IDA7XG4gICAgdGhpcy5fY3VycmVudFR1cm4gPSAwO1xuICAgIHRoaXMuX2N1cnJlbnRUaWNrID0gMDtcbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICB9XG5cbiAgcHJvdGVjdGVkIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ3BhdXNlVGltZScsXG4gICAgICB0aGlzLm9uUGF1c2VUaW1lLmJpbmQodGhpcylcbiAgICApKTtcbiAgICB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdyZXN1bWVUaW1lJyxcbiAgICAgIHRoaXMub25SZXN1bWVUaW1lLmJpbmQodGhpcylcbiAgICApKTtcbiAgfVxuXG4gIHByaXZhdGUgb25QYXVzZVRpbWUoZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIHRoaXMucGF1c2VkID0gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgb25SZXN1bWVUaW1lKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICB9XG5cbiAgZW5naW5lVGljayhnYW1lVGltZTogbnVtYmVyKSB7XG4gICAgaWYgKHRoaXMucGF1c2VkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2N1cnJlbnRUaWNrKys7XG4gICAgaWYgKCh0aGlzLl9jdXJyZW50VGljayAlIHRoaXMudGlja3NQZXJUdXJuKSA9PT0gMCkge1xuICAgICAgdGhpcy5fY3VycmVudFR1cm4rKztcbiAgICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgndHVybicsIHtjdXJyZW50VHVybjogdGhpcy5fY3VycmVudFR1cm4sIGN1cnJlbnRUaWNrOiB0aGlzLl9jdXJyZW50VGlja30pKTtcblxuICAgICAgdGhpcy50dXJuVGltZSA9IGdhbWVUaW1lO1xuXG4gICAgfVxuICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgndGljaycsIHtjdXJyZW50VHVybjogdGhpcy5fY3VycmVudFR1cm4sIGN1cnJlbnRUaWNrOiB0aGlzLl9jdXJyZW50VGlja30pKTtcbiAgfVxuXG59XG4iLCJleHBvcnQgKiBmcm9tICcuL0NvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL1RpbWVIYW5kbGVyQ29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vU2VsZkRlc3RydWN0Q29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vUm9hbWluZ0FJQ29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vRW5lcmd5Q29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vSW5wdXRDb21wb25lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9SZW5kZXJhYmxlQ29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vUGh5c2ljc0NvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL1J1bmVXcml0ZXJDb21wb25lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9SdW5lRGFtYWdlQ29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vSGVhbHRoQ29tcG9uZW50JztcbiIsIlwidXNlIHN0cmljdFwiO1xuZXhwb3J0IHR5cGUgQ29sb3IgPSBTdHJpbmcgfCBudW1iZXI7XG5cbmV4cG9ydCBjbGFzcyBDb2xvclV0aWxzIHtcbiAgLyoqXG4gICAgRnVuY3Rpb246IG11bHRpcGx5XG4gICAgTXVsdGlwbHkgYSBjb2xvciB3aXRoIGEgbnVtYmVyLiBcbiAgICA+IChyLGcsYikgKiBuID09IChyKm4sIGcqbiwgYipuKVxuXG4gICAgUGFyYW1ldGVyczpcbiAgICBjb2xvciAtIHRoZSBjb2xvclxuICAgIGNvZWYgLSB0aGUgZmFjdG9yXG5cbiAgICBSZXR1cm5zOlxuICAgIEEgbmV3IGNvbG9yIGFzIGEgbnVtYmVyIGJldHdlZW4gMHgwMDAwMDAgYW5kIDB4RkZGRkZGXG4gICAqL1xuICBzdGF0aWMgbXVsdGlwbHkoY29sb3I6IENvbG9yLCBjb2VmOiBudW1iZXIpOiBDb2xvciB7XG4gICAgbGV0IHIsIGcsIGI6IG51bWJlcjtcbiAgICBpZiAodHlwZW9mIGNvbG9yID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIgPSAoPG51bWJlcj5jb2xvciAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcgPSAoPG51bWJlcj5jb2xvciAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYiA9IDxudW1iZXI+Y29sb3IgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjogbnVtYmVyW10gPSBDb2xvclV0aWxzLnRvUmdiKGNvbG9yKTtcbiAgICAgIHIgPSByZ2JbMF07XG4gICAgICBnID0gcmdiWzFdO1xuICAgICAgYiA9IHJnYlsyXTtcbiAgICB9XG4gICAgciA9IE1hdGgucm91bmQociAqIGNvZWYpO1xuICAgIGcgPSBNYXRoLnJvdW5kKGcgKiBjb2VmKTtcbiAgICBiID0gTWF0aC5yb3VuZChiICogY29lZik7XG4gICAgciA9IHIgPCAwID8gMCA6IHIgPiAyNTUgPyAyNTUgOiByO1xuICAgIGcgPSBnIDwgMCA/IDAgOiBnID4gMjU1ID8gMjU1IDogZztcbiAgICBiID0gYiA8IDAgPyAwIDogYiA+IDI1NSA/IDI1NSA6IGI7XG4gICAgcmV0dXJuIGIgfCAoZyA8PCA4KSB8IChyIDw8IDE2KTtcbiAgfVxuXG4gIHN0YXRpYyBtYXgoY29sMTogQ29sb3IsIGNvbDI6IENvbG9yKSB7XG4gICAgbGV0IHIxLGcxLGIxLHIyLGcyLGIyOiBudW1iZXI7XG4gICAgaWYgKHR5cGVvZiBjb2wxID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIxID0gKDxudW1iZXI+Y29sMSAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcxID0gKDxudW1iZXI+Y29sMSAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYjEgPSA8bnVtYmVyPmNvbDEgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjE6IG51bWJlcltdID0gQ29sb3JVdGlscy50b1JnYihjb2wxKTtcbiAgICAgIHIxID0gcmdiMVswXTtcbiAgICAgIGcxID0gcmdiMVsxXTtcbiAgICAgIGIxID0gcmdiMVsyXTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjb2wyID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIyID0gKDxudW1iZXI+Y29sMiAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcyID0gKDxudW1iZXI+Y29sMiAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYjIgPSA8bnVtYmVyPmNvbDIgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjI6IG51bWJlcltdID0gQ29sb3JVdGlscy50b1JnYihjb2wyKTtcbiAgICAgIHIyID0gcmdiMlswXTtcbiAgICAgIGcyID0gcmdiMlsxXTtcbiAgICAgIGIyID0gcmdiMlsyXTtcbiAgICB9XG4gICAgaWYgKHIyID4gcjEpIHtcbiAgICAgIHIxID0gcjI7XG4gICAgfVxuICAgIGlmIChnMiA+IGcxKSB7XG4gICAgICBnMSA9IGcyO1xuICAgIH1cbiAgICBpZiAoYjIgPiBiMSkge1xuICAgICAgYjEgPSBiMjtcbiAgICB9XG4gICAgcmV0dXJuIGIxIHwgKGcxIDw8IDgpIHwgKHIxIDw8IDE2KTtcbiAgfVxuXG4gIHN0YXRpYyBtaW4oY29sMTogQ29sb3IsIGNvbDI6IENvbG9yKSB7XG4gICAgbGV0IHIxLGcxLGIxLHIyLGcyLGIyOiBudW1iZXI7XG4gICAgaWYgKHR5cGVvZiBjb2wxID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIxID0gKDxudW1iZXI+Y29sMSAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcxID0gKDxudW1iZXI+Y29sMSAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYjEgPSA8bnVtYmVyPmNvbDEgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjE6IG51bWJlcltdID0gQ29sb3JVdGlscy50b1JnYihjb2wxKTtcbiAgICAgIHIxID0gcmdiMVswXTtcbiAgICAgIGcxID0gcmdiMVsxXTtcbiAgICAgIGIxID0gcmdiMVsyXTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjb2wyID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIyID0gKDxudW1iZXI+Y29sMiAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcyID0gKDxudW1iZXI+Y29sMiAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYjIgPSA8bnVtYmVyPmNvbDIgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjI6IG51bWJlcltdID0gQ29sb3JVdGlscy50b1JnYihjb2wyKTtcbiAgICAgIHIyID0gcmdiMlswXTtcbiAgICAgIGcyID0gcmdiMlsxXTtcbiAgICAgIGIyID0gcmdiMlsyXTtcbiAgICB9XG4gICAgaWYgKHIyIDwgcjEpIHtcbiAgICAgIHIxID0gcjI7XG4gICAgfVxuICAgIGlmIChnMiA8IGcxKSB7XG4gICAgICBnMSA9IGcyO1xuICAgIH1cbiAgICBpZiAoYjIgPCBiMSkge1xuICAgICAgYjEgPSBiMjtcbiAgICB9XG4gICAgcmV0dXJuIGIxIHwgKGcxIDw8IDgpIHwgKHIxIDw8IDE2KTtcbiAgfSAgICAgICAgXG5cbiAgc3RhdGljIGNvbG9yTXVsdGlwbHkoY29sMTogQ29sb3IsIGNvbDI6IENvbG9yKSB7XG4gICAgbGV0IHIxLGcxLGIxLHIyLGcyLGIyOiBudW1iZXI7XG4gICAgaWYgKHR5cGVvZiBjb2wxID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIxID0gKDxudW1iZXI+Y29sMSAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcxID0gKDxudW1iZXI+Y29sMSAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYjEgPSA8bnVtYmVyPmNvbDEgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjE6IG51bWJlcltdID0gQ29sb3JVdGlscy50b1JnYihjb2wxKTtcbiAgICAgIHIxID0gcmdiMVswXTtcbiAgICAgIGcxID0gcmdiMVsxXTtcbiAgICAgIGIxID0gcmdiMVsyXTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjb2wyID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIyID0gKDxudW1iZXI+Y29sMiAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcyID0gKDxudW1iZXI+Y29sMiAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYjIgPSA8bnVtYmVyPmNvbDIgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjI6IG51bWJlcltdID0gQ29sb3JVdGlscy50b1JnYihjb2wyKTtcbiAgICAgIHIyID0gcmdiMlswXTtcbiAgICAgIGcyID0gcmdiMlsxXTtcbiAgICAgIGIyID0gcmdiMlsyXTtcbiAgICB9ICAgICAgICAgICBcbiAgICByMSA9IE1hdGguZmxvb3IocjEgKiByMiAvIDI1NSk7XG4gICAgZzEgPSBNYXRoLmZsb29yKGcxICogZzIgLyAyNTUpO1xuICAgIGIxID0gTWF0aC5mbG9vcihiMSAqIGIyIC8gMjU1KTtcbiAgICByMSA9IHIxIDwgMCA/IDAgOiByMSA+IDI1NSA/IDI1NSA6IHIxO1xuICAgIGcxID0gZzEgPCAwID8gMCA6IGcxID4gMjU1ID8gMjU1IDogZzE7XG4gICAgYjEgPSBiMSA8IDAgPyAwIDogYjEgPiAyNTUgPyAyNTUgOiBiMTtcbiAgICByZXR1cm4gYjEgfCAoZzEgPDwgOCkgfCAocjEgPDwgMTYpO1xuICB9XG5cbiAgLyoqXG4gICAgRnVuY3Rpb246IGNvbXB1dGVJbnRlbnNpdHlcbiAgICBSZXR1cm4gdGhlIGdyYXlzY2FsZSBpbnRlbnNpdHkgYmV0d2VlbiAwIGFuZCAxXG4gICAqL1xuICBzdGF0aWMgY29tcHV0ZUludGVuc2l0eShjb2xvcjogQ29sb3IpOiBudW1iZXIge1xuICAgIC8vIENvbG9yaW1ldHJpYyAobHVtaW5hbmNlLXByZXNlcnZpbmcpIGNvbnZlcnNpb24gdG8gZ3JheXNjYWxlXG4gICAgbGV0IHIsIGcsIGI6IG51bWJlcjtcbiAgICBpZiAodHlwZW9mIGNvbG9yID09PSBcIm51bWJlclwiKSB7XG4gICAgICAvLyBkdXBsaWNhdGVkIHRvUmdiRnJvbU51bWJlciBjb2RlIHRvIGF2b2lkIGZ1bmN0aW9uIGNhbGwgYW5kIGFycmF5IGFsbG9jYXRpb25cbiAgICAgIHIgPSAoPG51bWJlcj5jb2xvciAmIDB4RkYwMDAwKSA+PiAxNjtcbiAgICAgIGcgPSAoPG51bWJlcj5jb2xvciAmIDB4MDBGRjAwKSA+PiA4O1xuICAgICAgYiA9IDxudW1iZXI+Y29sb3IgJiAweDAwMDBGRjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYjogbnVtYmVyW10gPSBDb2xvclV0aWxzLnRvUmdiKGNvbG9yKTtcbiAgICAgIHIgPSByZ2JbMF07XG4gICAgICBnID0gcmdiWzFdO1xuICAgICAgYiA9IHJnYlsyXTtcbiAgICB9XG4gICAgcmV0dXJuICgwLjIxMjYgKiByICsgMC43MTUyKmcgKyAwLjA3MjIgKiBiKSAqICgxLzI1NSk7XG4gIH1cblxuICAvKipcbiAgICBGdW5jdGlvbjogYWRkXG4gICAgQWRkIHR3byBjb2xvcnMuXG4gICAgPiAocjEsZzEsYjEpICsgKHIyLGcyLGIyKSA9IChyMStyMixnMStnMixiMStiMilcblxuICAgIFBhcmFtZXRlcnM6XG4gICAgY29sMSAtIHRoZSBmaXJzdCBjb2xvclxuICAgIGNvbDIgLSB0aGUgc2Vjb25kIGNvbG9yXG5cbiAgICBSZXR1cm5zOlxuICAgIEEgbmV3IGNvbG9yIGFzIGEgbnVtYmVyIGJldHdlZW4gMHgwMDAwMDAgYW5kIDB4RkZGRkZGXG4gICAqL1xuICBzdGF0aWMgYWRkKGNvbDE6IENvbG9yLCBjb2wyOiBDb2xvcik6IENvbG9yIHtcbiAgICBsZXQgciA9ICgoPG51bWJlcj5jb2wxICYgMHhGRjAwMDApID4+IDE2KSArICgoPG51bWJlcj5jb2wyICYgMHhGRjAwMDApID4+IDE2KTtcbiAgICBsZXQgZyA9ICgoPG51bWJlcj5jb2wxICYgMHgwMEZGMDApID4+IDgpICsgKCg8bnVtYmVyPmNvbDIgJiAweDAwRkYwMCkgPj4gOCk7XG4gICAgbGV0IGIgPSAoPG51bWJlcj5jb2wxICYgMHgwMDAwRkYpICsgKDxudW1iZXI+Y29sMiAmIDB4MDAwMEZGKTtcbiAgICBpZiAociA+IDI1NSkge1xuICAgICAgciA9IDI1NTtcbiAgICB9XG4gICAgaWYgKGcgPiAyNTUpIHtcbiAgICAgIGcgPSAyNTU7XG4gICAgfVxuICAgIGlmIChiID4gMjU1KSB7XG4gICAgICBiID0gMjU1O1xuICAgIH1cbiAgICByZXR1cm4gYiB8IChnIDw8IDgpIHwgKHIgPDwgMTYpO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgc3RkQ29sID0ge1xuICAgIFwiYXF1YVwiOiBbMCwgMjU1LCAyNTVdLFxuICAgIFwiYmxhY2tcIjogWzAsIDAsIDBdLFxuICAgIFwiYmx1ZVwiOiBbMCwgMCwgMjU1XSxcbiAgICBcImZ1Y2hzaWFcIjogWzI1NSwgMCwgMjU1XSxcbiAgICBcImdyYXlcIjogWzEyOCwgMTI4LCAxMjhdLFxuICAgIFwiZ3JlZW5cIjogWzAsIDEyOCwgMF0sXG4gICAgXCJsaW1lXCI6IFswLCAyNTUsIDBdLFxuICAgIFwibWFyb29uXCI6IFsxMjgsIDAsIDBdLFxuICAgIFwibmF2eVwiOiBbMCwgMCwgMTI4XSxcbiAgICBcIm9saXZlXCI6IFsxMjgsIDEyOCwgMF0sXG4gICAgXCJvcmFuZ2VcIjogWzI1NSwgMTY1LCAwXSxcbiAgICBcInB1cnBsZVwiOiBbMTI4LCAwLCAxMjhdLFxuICAgIFwicmVkXCI6IFsyNTUsIDAsIDBdLFxuICAgIFwic2lsdmVyXCI6IFsxOTIsIDE5MiwgMTkyXSxcbiAgICBcInRlYWxcIjogWzAsIDEyOCwgMTI4XSxcbiAgICBcIndoaXRlXCI6IFsyNTUsIDI1NSwgMjU1XSxcbiAgICBcInllbGxvd1wiOiBbMjU1LCAyNTUsIDBdXG4gIH07XG4gIC8qKlxuICAgIEZ1bmN0aW9uOiB0b1JnYlxuICAgIENvbnZlcnQgYSBzdHJpbmcgY29sb3IgaW50byBhIFtyLGcsYl0gbnVtYmVyIGFycmF5LlxuXG4gICAgUGFyYW1ldGVyczpcbiAgICBjb2xvciAtIHRoZSBjb2xvclxuXG4gICAgUmV0dXJuczpcbiAgICBBbiBhcnJheSBvZiAzIG51bWJlcnMgW3IsZyxiXSBiZXR3ZWVuIDAgYW5kIDI1NS5cbiAgICovXG4gIHN0YXRpYyB0b1JnYihjb2xvcjogQ29sb3IpOiBudW1iZXJbXSB7XG4gICAgaWYgKHR5cGVvZiBjb2xvciA9PT0gXCJudW1iZXJcIikge1xuICAgICAgcmV0dXJuIENvbG9yVXRpbHMudG9SZ2JGcm9tTnVtYmVyKDxudW1iZXI+Y29sb3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gQ29sb3JVdGlscy50b1JnYkZyb21TdHJpbmcoPFN0cmluZz5jb2xvcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAgRnVuY3Rpb246IHRvV2ViXG4gICAgQ29udmVydCBhIGNvbG9yIGludG8gYSBDU1MgY29sb3IgZm9ybWF0IChhcyBhIHN0cmluZylcbiAgICovXG4gIHN0YXRpYyB0b1dlYihjb2xvcjogQ29sb3IpOiBzdHJpbmcge1xuICAgIGlmICh0eXBlb2YgY29sb3IgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIGxldCByZXQ6IHN0cmluZyA9IGNvbG9yLnRvU3RyaW5nKDE2KTtcbiAgICAgIGxldCBtaXNzaW5nWmVyb2VzOiBudW1iZXIgPSA2IC0gcmV0Lmxlbmd0aDtcbiAgICAgIGlmIChtaXNzaW5nWmVyb2VzID4gMCkge1xuICAgICAgICByZXQgPSBcIjAwMDAwMFwiLnN1YnN0cigwLCBtaXNzaW5nWmVyb2VzKSArIHJldDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBcIiNcIiArIHJldDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIDxzdHJpbmc+Y29sb3I7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgdG9SZ2JGcm9tTnVtYmVyKGNvbG9yOiBudW1iZXIpOiBudW1iZXJbXSB7XG4gICAgbGV0IHIgPSAoY29sb3IgJiAweEZGMDAwMCkgPj4gMTY7XG4gICAgbGV0IGcgPSAoY29sb3IgJiAweDAwRkYwMCkgPj4gODtcbiAgICBsZXQgYiA9IGNvbG9yICYgMHgwMDAwRkY7XG4gICAgcmV0dXJuIFtyLCBnLCBiXTtcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIHRvUmdiRnJvbVN0cmluZyhjb2xvcjogU3RyaW5nKTogbnVtYmVyW10ge1xuICAgIGNvbG9yID0gY29sb3IudG9Mb3dlckNhc2UoKTtcbiAgICBsZXQgc3RkQ29sVmFsdWVzOiBudW1iZXJbXSA9IENvbG9yVXRpbHMuc3RkQ29sW1N0cmluZyhjb2xvcildO1xuICAgIGlmIChzdGRDb2xWYWx1ZXMpIHtcbiAgICAgIHJldHVybiBzdGRDb2xWYWx1ZXM7XG4gICAgfVxuICAgIGlmIChjb2xvci5jaGFyQXQoMCkgPT09IFwiI1wiKSB7XG4gICAgICAvLyAjRkZGIG9yICNGRkZGRkYgZm9ybWF0XG4gICAgICBpZiAoY29sb3IubGVuZ3RoID09PSA0KSB7XG4gICAgICAgIC8vIGV4cGFuZCAjRkZGIHRvICNGRkZGRkZcbiAgICAgICAgY29sb3IgPSBcIiNcIiArIGNvbG9yLmNoYXJBdCgxKSArIGNvbG9yLmNoYXJBdCgxKSArIGNvbG9yLmNoYXJBdCgyKVxuICAgICAgICArIGNvbG9yLmNoYXJBdCgyKSArIGNvbG9yLmNoYXJBdCgzKSArIGNvbG9yLmNoYXJBdCgzKTtcbiAgICAgIH1cbiAgICAgIGxldCByOiBudW1iZXIgPSBwYXJzZUludChjb2xvci5zdWJzdHIoMSwgMiksIDE2KTtcbiAgICAgIGxldCBnOiBudW1iZXIgPSBwYXJzZUludChjb2xvci5zdWJzdHIoMywgMiksIDE2KTtcbiAgICAgIGxldCBiOiBudW1iZXIgPSBwYXJzZUludChjb2xvci5zdWJzdHIoNSwgMiksIDE2KTtcbiAgICAgIHJldHVybiBbciwgZywgYl07XG4gICAgfSBlbHNlIGlmIChjb2xvci5pbmRleE9mKFwicmdiKFwiKSA9PT0gMCkge1xuICAgICAgLy8gcmdiKHIsZyxiKSBmb3JtYXRcbiAgICAgIGxldCByZ2JMaXN0ID0gY29sb3Iuc3Vic3RyKDQsIGNvbG9yLmxlbmd0aCAtIDUpLnNwbGl0KFwiLFwiKTtcbiAgICAgIHJldHVybiBbcGFyc2VJbnQocmdiTGlzdFswXSwgMTApLCBwYXJzZUludChyZ2JMaXN0WzFdLCAxMCksIHBhcnNlSW50KHJnYkxpc3RbMl0sIDEwKV07XG4gICAgfVxuICAgIHJldHVybiBbMCwgMCwgMF07XG4gIH1cblxuICAvKipcbiAgICBGdW5jdGlvbjogdG9OdW1iZXJcbiAgICBDb252ZXJ0IGEgc3RyaW5nIGNvbG9yIGludG8gYSBudW1iZXIuXG5cbiAgICBQYXJhbWV0ZXJzOlxuICAgIGNvbG9yIC0gdGhlIGNvbG9yXG5cbiAgICBSZXR1cm5zOlxuICAgIEEgbnVtYmVyIGJldHdlZW4gMHgwMDAwMDAgYW5kIDB4RkZGRkZGLlxuICAgKi9cbiAgc3RhdGljIHRvTnVtYmVyKGNvbG9yOiBDb2xvcik6IG51bWJlciB7XG4gICAgaWYgKHR5cGVvZiBjb2xvciA9PT0gXCJudW1iZXJcIikge1xuICAgICAgcmV0dXJuIDxudW1iZXI+Y29sb3I7XG4gICAgfVxuICAgIGxldCBzY29sOiBTdHJpbmcgPSA8U3RyaW5nPmNvbG9yO1xuICAgIGlmIChzY29sLmNoYXJBdCgwKSA9PT0gXCIjXCIgJiYgc2NvbC5sZW5ndGggPT09IDcpIHtcbiAgICAgIHJldHVybiBwYXJzZUludChzY29sLnN1YnN0cigxKSwgMTYpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgcmdiID0gQ29sb3JVdGlscy50b1JnYkZyb21TdHJpbmcoc2NvbCk7XG4gICAgICByZXR1cm4gcmdiWzBdICogNjU1MzYgKyByZ2JbMV0gKiAyNTYgKyByZ2JbMl07XG4gICAgfVxuICB9XG59XG4iLCJleHBvcnQgY2xhc3MgUG9zaXRpb24ge1xuICBwcml2YXRlIF94OiBudW1iZXI7XG4gIHByaXZhdGUgX3k6IG51bWJlcjtcblxuICBwcml2YXRlIHN0YXRpYyBtYXhXaWR0aDogbnVtYmVyO1xuICBwcml2YXRlIHN0YXRpYyBtYXhIZWlnaHQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgIHRoaXMuX3ggPSB4O1xuICAgIHRoaXMuX3kgPSB5O1xuICB9XG5cbiAgZ2V0IHgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5feDtcbiAgfVxuXG4gIGdldCB5KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3k7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIHNldE1heFZhbHVlcyh3OiBudW1iZXIsIGg6IG51bWJlcikge1xuICAgIFBvc2l0aW9uLm1heFdpZHRoID0gdztcbiAgICBQb3NpdGlvbi5tYXhIZWlnaHQgPSBoO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBnZXRSYW5kb20od2lkdGg6IG51bWJlciA9IC0xLCBoZWlnaHQ6IG51bWJlciA9IC0xKTogUG9zaXRpb24ge1xuICAgIGlmICh3aWR0aCA9PT0gLTEpIHtcbiAgICAgIHdpZHRoID0gUG9zaXRpb24ubWF4V2lkdGg7XG4gICAgfVxuICAgIGlmIChoZWlnaHQgPT09IC0xKSB7XG4gICAgICBoZWlnaHQgPSBQb3NpdGlvbi5tYXhIZWlnaHQ7XG4gICAgfVxuICAgIHZhciB4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogd2lkdGgpO1xuICAgIHZhciB5ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaGVpZ2h0KTtcbiAgICByZXR1cm4gbmV3IFBvc2l0aW9uKHgsIHkpO1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBnZXROZWlnaGJvdXJzKHBvczogUG9zaXRpb24sIHdpZHRoOiBudW1iZXIgPSAtMSwgaGVpZ2h0OiBudW1iZXIgPSAtMSwgb25seUNhcmRpbmFsOiBib29sZWFuID0gZmFsc2UpOiBQb3NpdGlvbltdIHtcbiAgICBpZiAod2lkdGggPT09IC0xKSB7XG4gICAgICB3aWR0aCA9IFBvc2l0aW9uLm1heFdpZHRoO1xuICAgIH1cbiAgICBpZiAoaGVpZ2h0ID09PSAtMSkge1xuICAgICAgaGVpZ2h0ID0gUG9zaXRpb24ubWF4SGVpZ2h0O1xuICAgIH1cbiAgICBsZXQgeCA9IHBvcy54O1xuICAgIGxldCB5ID0gcG9zLnk7XG4gICAgbGV0IHBvc2l0aW9ucyA9IFtdO1xuICAgIGlmICh4ID4gMCkge1xuICAgICAgcG9zaXRpb25zLnB1c2gobmV3IFBvc2l0aW9uKHggLSAxLCB5KSk7XG4gICAgfVxuICAgIGlmICh4IDwgd2lkdGggLSAxKSB7XG4gICAgICBwb3NpdGlvbnMucHVzaChuZXcgUG9zaXRpb24oeCArIDEsIHkpKTtcbiAgICB9XG4gICAgaWYgKHkgPiAwKSB7XG4gICAgICBwb3NpdGlvbnMucHVzaChuZXcgUG9zaXRpb24oeCwgeSAtIDEpKTtcbiAgICB9XG4gICAgaWYgKHkgPCBoZWlnaHQgLSAxKSB7XG4gICAgICBwb3NpdGlvbnMucHVzaChuZXcgUG9zaXRpb24oeCwgeSArIDEpKTtcbiAgICB9XG4gICAgaWYgKCFvbmx5Q2FyZGluYWwpIHtcbiAgICAgIGlmICh4ID4gMCAmJiB5ID4gMCkge1xuICAgICAgICBwb3NpdGlvbnMucHVzaChuZXcgUG9zaXRpb24oeCAtIDEsIHkgLSAxKSk7XG4gICAgICB9XG4gICAgICBpZiAoeCA+IDAgJiYgeSA8IGhlaWdodCAtIDEpIHtcbiAgICAgICAgcG9zaXRpb25zLnB1c2gobmV3IFBvc2l0aW9uKHggLSAxLCB5ICsgMSkpO1xuICAgICAgfVxuICAgICAgaWYgKHggPCB3aWR0aCAtIDEgJiYgeSA8IGhlaWdodCAtIDEpIHtcbiAgICAgICAgcG9zaXRpb25zLnB1c2gobmV3IFBvc2l0aW9uKHggKyAxLCB5ICsgMSkpO1xuICAgICAgfVxuICAgICAgaWYgKHggPCB3aWR0aCAtIDEgJiYgeSA+IDApIHtcbiAgICAgICAgcG9zaXRpb25zLnB1c2gobmV3IFBvc2l0aW9uKHggKyAxLCB5IC0gMSkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcG9zaXRpb25zO1xuXG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGdldERpcmVjdGlvbnMob25seUNhcmRpbmFsOiBib29sZWFuID0gZmFsc2UpOiBQb3NpdGlvbltdIHtcbiAgICBsZXQgZGlyZWN0aW9uczogUG9zaXRpb25bXSA9IFtdO1xuXG4gICAgZGlyZWN0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbiggMCwgLTEpKTtcbiAgICBkaXJlY3Rpb25zLnB1c2gobmV3IFBvc2l0aW9uKCAwLCAgMSkpO1xuICAgIGRpcmVjdGlvbnMucHVzaChuZXcgUG9zaXRpb24oLTEsICAwKSk7XG4gICAgZGlyZWN0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbiggMSwgIDApKTtcbiAgICBpZiAoIW9ubHlDYXJkaW5hbCkge1xuICAgICAgZGlyZWN0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbigtMSwgLTEpKTtcbiAgICAgIGRpcmVjdGlvbnMucHVzaChuZXcgUG9zaXRpb24oIDEsICAxKSk7XG4gICAgICBkaXJlY3Rpb25zLnB1c2gobmV3IFBvc2l0aW9uKC0xLCAgMSkpO1xuICAgICAgZGlyZWN0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbiggMSwgLTEpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZGlyZWN0aW9ucztcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgYWRkKGE6IFBvc2l0aW9uLCBiOiBQb3NpdGlvbikge1xuICAgIHJldHVybiBuZXcgUG9zaXRpb24oYS54ICsgYi54LCBhLnkgKyBiLnkpO1xuICB9XG59XG4iLCJleHBvcnQgKiBmcm9tICcuL0NvbG9yJztcbmV4cG9ydCAqIGZyb20gJy4vUG9zaXRpb24nO1xuXG5leHBvcnQgbmFtZXNwYWNlIFV0aWxzIHtcbiAgLy8gQ1JDMzIgdXRpbGl0eS4gQWRhcHRlZCBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTg2Mzg5MDAvamF2YXNjcmlwdC1jcmMzMlxuICBsZXQgY3JjVGFibGU6IG51bWJlcltdO1xuICBmdW5jdGlvbiBtYWtlQ1JDVGFibGUoKSB7XG4gICAgbGV0IGM6IG51bWJlcjtcbiAgICBjcmNUYWJsZSA9IFtdO1xuICAgIGZvciAobGV0IG46IG51bWJlciA9IDA7IG4gPCAyNTY7IG4rKykge1xuICAgICAgYyA9IG47XG4gICAgICBmb3IgKGxldCBrOiBudW1iZXIgPSAwOyBrIDwgODsgaysrKSB7XG4gICAgICAgIGMgPSAoKGMgJiAxKSA/ICgweEVEQjg4MzIwIF4gKGMgPj4+IDEpKSA6IChjID4+PiAxKSk7XG4gICAgICB9XG4gICAgICBjcmNUYWJsZVtuXSA9IGM7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkTWF0cml4PFQ+KHc6IG51bWJlciwgaDogbnVtYmVyLCB2YWx1ZTogVCk6IFRbXVtdIHtcbiAgICBsZXQgcmV0OiBUW11bXSA9IFtdO1xuICAgIGZvciAoIGxldCB4OiBudW1iZXIgPSAwOyB4IDwgdzsgKyt4KSB7XG4gICAgICByZXRbeF0gPSBbXTtcbiAgICAgIGZvciAoIGxldCB5OiBudW1iZXIgPSAwOyB5IDwgaDsgKyt5KSB7XG4gICAgICAgIHJldFt4XVt5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIGNyYzMyKHN0cjogc3RyaW5nKTogbnVtYmVyIHtcbiAgICBpZiAoIWNyY1RhYmxlKSB7XG4gICAgICBtYWtlQ1JDVGFibGUoKTtcbiAgICB9XG4gICAgbGV0IGNyYzogbnVtYmVyID0gMCBeICgtMSk7XG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMCwgbGVuOiBudW1iZXIgPSBzdHIubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGNyYyA9IChjcmMgPj4+IDgpIF4gY3JjVGFibGVbKGNyYyBeIHN0ci5jaGFyQ29kZUF0KGkpKSAmIDB4RkZdO1xuICAgIH1cbiAgICByZXR1cm4gKGNyYyBeICgtMSkpID4+PiAwO1xuICB9O1xuXG4gIGV4cG9ydCBmdW5jdGlvbiB0b0NhbWVsQ2FzZShpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gaW5wdXQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC8oXFxifF8pXFx3L2csIGZ1bmN0aW9uKG0pIHtcbiAgICAgIHJldHVybiBtLnRvVXBwZXJDYXNlKCkucmVwbGFjZSgvXy8sIFwiXCIpO1xuICAgIH0pO1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlR3VpZCgpIHtcbiAgICByZXR1cm4gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCcucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbihjKSB7XG4gICAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkqMTZ8MCwgdiA9IGMgPT0gJ3gnID8gciA6IChyJjB4M3wweDgpO1xuICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgIH0pO1xuICB9XG4gIGV4cG9ydCBmdW5jdGlvbiBnZXRSYW5kb20obWluOiBudW1iZXIsIG1heDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gZ2V0UmFuZG9tSW5kZXg8VD4oYXJyYXk6IFRbXSk6IFQge1xuICAgIHJldHVybiBhcnJheVtnZXRSYW5kb20oMCwgYXJyYXkubGVuZ3RoIC0gMSldO1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbWl6ZUFycmF5PFQ+KGFycmF5OiBUW10pOiBUW10ge1xuICAgIGlmIChhcnJheS5sZW5ndGggPD0gMSkgcmV0dXJuIGFycmF5O1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcmFuZG9tQ2hvaWNlSW5kZXggPSBnZXRSYW5kb20oaSwgYXJyYXkubGVuZ3RoIC0gMSk7XG5cbiAgICAgIFthcnJheVtpXSwgYXJyYXlbcmFuZG9tQ2hvaWNlSW5kZXhdXSA9IFthcnJheVtyYW5kb21DaG9pY2VJbmRleF0sIGFycmF5W2ldXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJyYXk7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gYXBwbHlNaXhpbnMoZGVyaXZlZEN0b3I6IGFueSwgYmFzZUN0b3JzOiBhbnlbXSkge1xuICAgIGJhc2VDdG9ycy5mb3JFYWNoKGJhc2VDdG9yID0+IHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGJhc2VDdG9yLnByb3RvdHlwZSkuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgICAgZGVyaXZlZEN0b3IucHJvdG90eXBlW25hbWVdID0gYmFzZUN0b3IucHJvdG90eXBlW25hbWVdO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi4vY29tcG9uZW50cyc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuL2luZGV4JztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuaW1wb3J0IEdseXBoID0gcmVxdWlyZSgnLi4vR2x5cGgnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVdpbHkoZW5naW5lOiBFbmdpbmUpIHtcbiAgICBsZXQgd2lseSA9IG5ldyBFbnRpdGllcy5FbnRpdHkoZW5naW5lLCAnd2lseScpO1xuICAgIHdpbHkuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQoZW5naW5lKSk7XG4gICAgd2lseS5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuUmVuZGVyYWJsZUNvbXBvbmVudChlbmdpbmUsIHtcbiAgICAgIGdseXBoOiBuZXcgR2x5cGgoJ0AnLCAweGZmZmZmZiwgMHgwMDAwMDApXG4gICAgfSkpO1xuICAgIHdpbHkuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLkVuZXJneUNvbXBvbmVudChlbmdpbmUpKTtcbiAgICB3aWx5LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5JbnB1dENvbXBvbmVudChlbmdpbmUpKTtcbiAgICB3aWx5LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5SdW5lV3JpdGVyQ29tcG9uZW50KGVuZ2luZSkpO1xuICAgIHdpbHkuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLkhlYWx0aENvbXBvbmVudChlbmdpbmUpKTtcblxuICAgIHJldHVybiB3aWx5O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUmF0KGVuZ2luZTogRW5naW5lKSB7XG4gICAgbGV0IHJhdCA9IG5ldyBFbnRpdGllcy5FbnRpdHkoZW5naW5lLCAncmF0Jyk7XG4gICAgcmF0LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KGVuZ2luZSkpO1xuICAgIHJhdC5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuUmVuZGVyYWJsZUNvbXBvbmVudChlbmdpbmUsIHtcbiAgICAgIGdseXBoOiBuZXcgR2x5cGgoJ3InLCAweGZmZmZmZiwgMHgwMDAwMDApXG4gICAgfSkpO1xuICAgIHJhdC5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuRW5lcmd5Q29tcG9uZW50KGVuZ2luZSkpO1xuICAgIHJhdC5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuUm9hbWluZ0FJQ29tcG9uZW50KGVuZ2luZSkpO1xuICAgIHJhdC5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuSGVhbHRoQ29tcG9uZW50KGVuZ2luZSkpO1xuXG4gICAgcmV0dXJuIHJhdDtcbn1cbiIsImltcG9ydCAqIGFzIENvbGxlY3Rpb25zIGZyb20gJ3R5cGVzY3JpcHQtY29sbGVjdGlvbnMnO1xuXG5pbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4uL2NvbXBvbmVudHMnO1xuaW1wb3J0ICogYXMgTWl4aW5zIGZyb20gJy4uL21peGlucyc7XG5cbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIEVudGl0eSBpbXBsZW1lbnRzIE1peGlucy5JRXZlbnRIYW5kbGVyIHtcbiAgLy8gRXZlbnRIYW5kbGVyIG1peGluXG4gIGxpc3RlbjogKGxpc3RlbmVyOiBFdmVudHMuTGlzdGVuZXIpID0+IEV2ZW50cy5MaXN0ZW5lcjtcbiAgcmVtb3ZlTGlzdGVuZXI6IChsaXN0ZW5lcjogRXZlbnRzLkxpc3RlbmVyKSA9PiB2b2lkO1xuICBlbWl0OiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gdm9pZDtcbiAgZmlyZTogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IGFueTtcbiAgY2FuOiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gYm9vbGVhbjtcblxuICBwcml2YXRlIF9uYW1lOiBzdHJpbmc7XG4gIGdldCBuYW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICB9XG4gIHByaXZhdGUgX2d1aWQ6IHN0cmluZztcbiAgZ2V0IGd1aWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2d1aWQ7XG4gIH1cbiAgcHJpdmF0ZSBlbmdpbmU6IEVuZ2luZTtcbiAgcHJpdmF0ZSBjb21wb25lbnRzOiBDb21wb25lbnRzLkNvbXBvbmVudFtdO1xuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBfbmFtZTogc3RyaW5nID0gJycpIHtcbiAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTtcbiAgICB0aGlzLl9ndWlkID0gQ29yZS5VdGlscy5nZW5lcmF0ZUd1aWQoKTtcbiAgICB0aGlzLl9uYW1lID0gX25hbWU7XG5cblxuICAgIHRoaXMuY29tcG9uZW50cyA9IFtdO1xuXG4gICAgdGhpcy5lbmdpbmUucmVnaXN0ZXJFbnRpdHkodGhpcyk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuY29tcG9uZW50cy5mb3JFYWNoKChjb21wb25lbnQpID0+IHtcbiAgICAgIGNvbXBvbmVudC5kZXN0cm95KCk7XG4gICAgICBjb21wb25lbnQgPSBudWxsO1xuICAgIH0pO1xuICAgIHRoaXMuZW5naW5lLnJlbW92ZUVudGl0eSh0aGlzKTtcbiAgfVxuXG4gIGFkZENvbXBvbmVudChjb21wb25lbnQ6IENvbXBvbmVudHMuQ29tcG9uZW50KSB7XG4gICAgdGhpcy5jb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcbiAgICBjb21wb25lbnQucmVnaXN0ZXJFbnRpdHkodGhpcyk7XG4gIH1cblxuICBoYXNDb21wb25lbnQoY29tcG9uZW50VHlwZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHMuZmlsdGVyKChjb21wb25lbnQpID0+IHtcbiAgICAgIHJldHVybiBjb21wb25lbnQgaW5zdGFuY2VvZiBjb21wb25lbnRUeXBlO1xuICAgIH0pLmxlbmd0aCA+IDA7XG4gIH1cblxuICBnZXRDb21wb25lbnQoY29tcG9uZW50VHlwZSk6IENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgICBsZXQgY29tcG9uZW50ID0gdGhpcy5jb21wb25lbnRzLmZpbHRlcigoY29tcG9uZW50KSA9PiB7XG4gICAgICByZXR1cm4gY29tcG9uZW50IGluc3RhbmNlb2YgY29tcG9uZW50VHlwZTtcbiAgICB9KTtcbiAgICBpZiAoY29tcG9uZW50Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBjb21wb25lbnRbMF07XG4gIH1cbn1cblxuQ29yZS5VdGlscy5hcHBseU1peGlucyhFbnRpdHksIFtNaXhpbnMuRXZlbnRIYW5kbGVyXSk7XG4iLCJleHBvcnQgKiBmcm9tICcuL0NyZWF0b3InO1xuZXhwb3J0ICogZnJvbSAnLi9FbnRpdHknO1xuIiwiZXhwb3J0IGNsYXNzIEV2ZW50IHtcbiAgcHVibGljIHR5cGU6IHN0cmluZztcbiAgcHVibGljIGRhdGE6IGFueTtcblxuICBjb25zdHJ1Y3Rvcih0eXBlOiBzdHJpbmcsIGRhdGE6IGFueSA9IG51bGwpIHtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi9pbmRleCc7XG5cbmV4cG9ydCBjbGFzcyBMaXN0ZW5lciB7XG4gIHB1YmxpYyB0eXBlOiBzdHJpbmc7XG4gIHB1YmxpYyBwcmlvcml0eTogbnVtYmVyO1xuICBwdWJsaWMgY2FsbGJhY2s6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiBhbnk7XG4gIHB1YmxpYyBndWlkOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IodHlwZTogc3RyaW5nLCBjYWxsYmFjazogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IGFueSwgcHJpb3JpdHk6IG51bWJlciA9IDEwMCwgZ3VpZDogc3RyaW5nID0gbnVsbCkge1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5wcmlvcml0eSA9IHByaW9yaXR5O1xuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB0aGlzLmd1aWQgPSBndWlkIHx8IENvcmUuVXRpbHMuZ2VuZXJhdGVHdWlkKCk7XG4gIH1cbn1cbiIsImV4cG9ydCAqIGZyb20gJy4vRXZlbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9JTGlzdGVuZXInO1xuZXhwb3J0ICogZnJvbSAnLi9MaXN0ZW5lcic7XG4iLCJpbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcblxuZXhwb3J0IGludGVyZmFjZSBJRXZlbnRIYW5kbGVyIHtcbiAgbGlzdGVuOiAobGlzdGVuZXI6IEV2ZW50cy5MaXN0ZW5lcikgPT4gRXZlbnRzLkxpc3RlbmVyO1xuICByZW1vdmVMaXN0ZW5lcjogKGxpc3RlbmVyOiBFdmVudHMuTGlzdGVuZXIpID0+IHZvaWQ7XG4gIGVtaXQ6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiB2b2lkO1xuICBmaXJlOiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gYW55O1xuICBjYW46IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiBib29sZWFuO1xufVxuXG5leHBvcnQgY2xhc3MgRXZlbnRIYW5kbGVyIGltcGxlbWVudHMgSUV2ZW50SGFuZGxlciB7XG4gIHByaXZhdGUgbGlzdGVuZXJzOiB7W2V2ZW50OiBzdHJpbmddOiBFdmVudHMuTGlzdGVuZXJbXX0gPSB7fTtcblxuICBsaXN0ZW4obGlzdGVuZXI6IEV2ZW50cy5MaXN0ZW5lcikge1xuICAgIGlmICghdGhpcy5saXN0ZW5lcnMpIHtcbiAgICAgIHRoaXMubGlzdGVuZXJzID0ge307XG4gICAgfVxuICAgIGlmICghdGhpcy5saXN0ZW5lcnNbbGlzdGVuZXIudHlwZV0pIHtcbiAgICAgIHRoaXMubGlzdGVuZXJzW2xpc3RlbmVyLnR5cGVdID0gW107XG4gICAgfVxuXG4gICAgdGhpcy5saXN0ZW5lcnNbbGlzdGVuZXIudHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gICAgdGhpcy5saXN0ZW5lcnNbbGlzdGVuZXIudHlwZV0gPSB0aGlzLmxpc3RlbmVyc1tsaXN0ZW5lci50eXBlXS5zb3J0KChhOiBFdmVudHMuTGlzdGVuZXIsIGI6IEV2ZW50cy5MaXN0ZW5lcikgPT4gYS5wcmlvcml0eSAtIGIucHJpb3JpdHkpO1xuXG4gICAgcmV0dXJuIGxpc3RlbmVyO1xuICB9XG5cbiAgcmVtb3ZlTGlzdGVuZXIobGlzdGVuZXI6IEV2ZW50cy5MaXN0ZW5lcikge1xuICAgIGlmICghdGhpcy5saXN0ZW5lcnNbbGlzdGVuZXIudHlwZV0pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGlkeCA9IHRoaXMubGlzdGVuZXJzW2xpc3RlbmVyLnR5cGVdLmZpbmRJbmRleCgobCkgPT4ge1xuICAgICAgcmV0dXJuIGwuZ3VpZCA9PT0gbGlzdGVuZXIuZ3VpZDtcbiAgICB9KTtcbiAgICBpZiAodHlwZW9mIGlkeCA9PT0gJ251bWJlcicpIHtcbiAgICAgIHRoaXMubGlzdGVuZXJzW2xpc3RlbmVyLnR5cGVdLnNwbGljZShpZHgsIDEpO1xuICAgIH1cbiAgfVxuXG4gIGVtaXQoZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGlmIChldmVudC50eXBlID09PSAnbWVzc2FnZScpIHtcbiAgICAgIGNvbnNvbGUubG9nKGV2ZW50KTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tldmVudC50eXBlXSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzW2V2ZW50LnR5cGVdLm1hcCgoaSkgPT4gaSk7XG5cbiAgICBsaXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgIGxpc3RlbmVyLmNhbGxiYWNrKGV2ZW50KTtcbiAgICB9KTtcbiAgfVxuXG4gIGNhbihldmVudDogRXZlbnRzLkV2ZW50KTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tldmVudC50eXBlXSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgbGV0IHJldHVybmVkVmFsdWUgPSB0cnVlO1xuXG4gICAgdGhpcy5saXN0ZW5lcnNbZXZlbnQudHlwZV0uZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgIGlmICghcmV0dXJuZWRWYWx1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXR1cm5lZFZhbHVlID0gbGlzdGVuZXIuY2FsbGJhY2soZXZlbnQpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXR1cm5lZFZhbHVlO1xuICB9XG5cbiAgZmlyZShldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tldmVudC50eXBlXSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IHJldHVybmVkVmFsdWUgPSBudWxsO1xuXG4gICAgdGhpcy5saXN0ZW5lcnNbZXZlbnQudHlwZV0uZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgIHJldHVybmVkVmFsdWUgPSBsaXN0ZW5lci5jYWxsYmFjayhldmVudCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJldHVybmVkVmFsdWU7XG4gIH1cbn1cbiIsImV4cG9ydCAqIGZyb20gJy4vRXZlbnRIYW5kbGVyJztcbiJdfQ==
