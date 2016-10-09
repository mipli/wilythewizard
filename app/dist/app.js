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
var Glyph = require('./Glyph');
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
                        this.console.setText(Glyph.CHAR_SE, i, j);
                        drawn = true;
                    } else if (i === this.width - 1 && j === 0) {
                        this.console.setText(Glyph.CHAR_SW, i, j);
                        drawn = true;
                    } else if (i === this.width - 1 && j === this.height - 1) {
                        this.console.setText(Glyph.CHAR_NW, i, j);
                        drawn = true;
                    } else if (i === 0 && j === this.height - 1) {
                        this.console.setText(Glyph.CHAR_NE, i, j);
                        drawn = true;
                    } else if (i === 0 || i === this.width - 1) {
                        this.console.setText(Glyph.CHAR_VLINE, i, j);
                        drawn = true;
                    } else if (j === 0 || j === this.height - 1) {
                        this.console.setText(Glyph.CHAR_HLINE, i, j);
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

},{"./Console":1,"./Glyph":4,"./events":43}],7:[function(require,module,exports){
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

var Core = require('./core');
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
    glyph: new Glyph(Glyph.CHAR_SPACE, 0x000000, 0x000000),
    walkable: false,
    blocksSight: true
};
Tile.FLOOR = {
    glyph: [new Glyph('.', 0x3a4444, 0x222222), new Glyph('.', 0x443a44, 0x222222), new Glyph('.', 0x44443a, 0x222222), new Glyph(',', 0x3a4444, 0x222222), new Glyph(',', 0x443a44, 0x222222), new Glyph(',', 0x44443a, 0x222222)],
    walkable: true,
    blocksSight: false
};
Tile.WALL = {
    glyph: new Glyph(Glyph.CHAR_HLINE, 0xdddddd, 0x111111),
    walkable: false,
    blocksSight: true
};
module.exports = Tile;

},{"./Glyph":4,"./core":37}],13:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDb25zb2xlLnRzIiwiRW5naW5lLnRzIiwiRXhjZXB0aW9ucy50cyIsIkdseXBoLnRzIiwiSW5wdXRIYW5kbGVyLnRzIiwiTG9nVmlldy50cyIsIk1hcC50cyIsIk1hcEdlbmVyYXRvci50cyIsIk1hcFZpZXcudHMiLCJQaXhpQ29uc29sZS50cyIsIlNjZW5lLnRzIiwiVGlsZS50cyIsImFwcC50cyIsImJlaGF2aW91cnMvQWN0aW9uLnRzIiwiYmVoYXZpb3Vycy9CZWhhdmlvdXIudHMiLCJiZWhhdmlvdXJzL051bGxBY3Rpb24udHMiLCJiZWhhdmlvdXJzL1JhbmRvbVdhbGtCZWhhdmlvdXIudHMiLCJiZWhhdmlvdXJzL1dhbGtBY3Rpb24udHMiLCJiZWhhdmlvdXJzL1dyaXRlUnVuZUFjdGlvbi50cyIsImJlaGF2aW91cnMvaW5kZXgudHMiLCJjb21wb25lbnRzL0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvRW5lcmd5Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9IZWFsdGhDb21wb25lbnQudHMiLCJjb21wb25lbnRzL0lucHV0Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9QaHlzaWNzQ29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9SZW5kZXJhYmxlQ29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9Sb2FtaW5nQUlDb21wb25lbnQudHMiLCJjb21wb25lbnRzL1J1bmVEYW1hZ2VDb21wb25lbnQudHMiLCJjb21wb25lbnRzL1J1bmVGcmVlemVDb21wb25lbnQudHMiLCJjb21wb25lbnRzL1J1bmVXcml0ZXJDb21wb25lbnQudHMiLCJjb21wb25lbnRzL1NlbGZEZXN0cnVjdENvbXBvbmVudC50cyIsImNvbXBvbmVudHMvU2xvd0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvVGltZUhhbmRsZXJDb21wb25lbnQudHMiLCJjb21wb25lbnRzL2luZGV4LnRzIiwiY29yZS9Db2xvci50cyIsImNvcmUvUG9zaXRpb24udHMiLCJjb3JlL2luZGV4LnRzIiwiZW50aXRpZXMvQ3JlYXRvci50cyIsImVudGl0aWVzL0VudGl0eS50cyIsImVudGl0aWVzL2luZGV4LnRzIiwiZXZlbnRzL0V2ZW50LnRzIiwiZXZlbnRzL0xpc3RlbmVyLnRzIiwiZXZlbnRzL2luZGV4LnRzIiwibWFwL0ZvVi50cyIsIm1hcC9NYXplUmVjdXJzaXZlQmFja3RyYWNrR2VuZXJhdG9yLnRzIiwibWFwL1Jvb21HZW5lcmF0b3IudHMiLCJtYXAvVG9wb2xvZ3lDb21iaW5hdG9yLnRzIiwibWFwL1V0aWxzLnRzIiwibWFwL2luZGV4LnRzIiwibWl4aW5zL0V2ZW50SGFuZGxlci50cyIsIm1peGlucy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQ0FBLElBQVksQUFBSSxlQUFNLEFBQVEsQUFBQztBQUMvQixJQUFPLEFBQUssZ0JBQVcsQUFBUyxBQUFDLEFBQUMsQUFFbEM7OztBQThCRSxxQkFBWSxBQUFhLE9BQUUsQUFBYztZQUFFLEFBQVUsbUVBQWUsQUFBUTtZQUFFLEFBQVUsbUVBQWUsQUFBUTs7OztBQUM3RyxBQUFJLGFBQUMsQUFBTSxTQUFHLEFBQUssQUFBQztBQUNwQixBQUFJLGFBQUMsQUFBTyxVQUFHLEFBQU0sQUFBQztBQUV0QixBQUFJLGFBQUMsQUFBaUIsb0JBQUcsQUFBTyxBQUFDO0FBQ2pDLEFBQUksYUFBQyxBQUFpQixvQkFBRyxBQUFPLEFBQUM7QUFFakMsQUFBSSxhQUFDLEFBQUssUUFBRyxBQUFJLEtBQUMsQUFBSyxNQUFDLEFBQVcsWUFBUyxBQUFJLEtBQUMsQUFBSyxPQUFFLEFBQUksS0FBQyxBQUFNLFFBQUUsQUFBSyxNQUFDLEFBQVUsQUFBQyxBQUFDO0FBQ3ZGLEFBQUksYUFBQyxBQUFLLFFBQUcsQUFBSSxLQUFDLEFBQUssTUFBQyxBQUFXLFlBQWEsQUFBSSxLQUFDLEFBQUssT0FBRSxBQUFJLEtBQUMsQUFBTSxRQUFFLEFBQUksS0FBQyxBQUFp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QUFBQyxBQUFDLE9BQzdELEFBQVMsVUFBQyxBQUFHLEtBQUUsSUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxHQUFFLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxBQUFDLEFBQUMsT0FDakUsQUFBUyxVQUFDLEFBQUcsS0FBRSxJQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsQUFBQyxBQUFDLEFBQUM7QUFDM0UsaUJBQUssQUFBUyxVQUFDLEFBQUs7QUFDbEIsQUFBTSx1QkFBQyxBQUFTLFVBQUMsQUFBRyxLQUFFLElBQUksQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsR0FBRSxBQUFRLFNBQUMsQUFBQyxBQUFDLEFBQUMsT0FDekQsQUFBUyxVQUFDLEFBQUcsS0FBRSxJQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEFBQUMsQUFBQyxPQUNqRSxBQUFTLFVBQUMsQUFBRyxLQUFFLElBQUksQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBQyxHQUFFLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxBQUFDLEFBQUMsT0FDN0QsQUFBUyxVQUFDLEFBQUcsS0FBRSxJQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEFBQUMsQUFBQyxPQUNqRSxBQUFTLFVBQUMsQUFBRyxLQUFFLElBQUksQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsR0FBRSxBQUFRLFNBQUMsQUFBQyxBQUFDLEFBQUMsQUFBQztBQUMzRSxpQkFBSyxBQUFTLFVBQUMsQUFBSTtBQUNqQixBQUFNLHVCQUFDLEFBQVMsVUFBQyxBQUFHLEtBQUUsSUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEFBQUMsQUFBQyxPQUN6RCxBQUFTLFVBQUMsQUFBRyxLQUFFLElBQUksQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsR0FBRSxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsQUFBQyxBQUFDLE9BQ2pFLEFBQVMsVUFBQyxBQUFHLEtBQUUsSUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxHQUFFLEFBQVEsU0FBQyxBQUFDLEFBQUMsQUFBQyxPQUM3RCxBQUFTLFVBQUMsQUFBRyxLQUFFLElBQUksQUFBSSxLQUFDLEFBQVEsU0FBQyxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsR0FBRSxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsQUFBQyxBQUFDLE9BQ2pFLEFBQVMsVUFBQyxBQUFHLEtBQUUsSUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEFBQUMsQUFBQyxBQUFDO0FBQzNFLGlCQUFLLEFBQVMsVUFBQyxBQUFJO0FBQ2pCLEFBQU0sdUJBQUMsQUFBUyxVQUFDLEFBQUcsS0FBRSxJQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUMsR0FBRSxBQUFRLFNBQUMsQUFBQyxJQUFHLEFBQUMsQUFBQyxBQUFDLE9BQ3pELEFBQVMsVUFBQyxBQUFHLEtBQUUsSUFBSSxBQUFJLEtBQUMsQUFBUSxTQUFDLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxHQUFFLEFBQVEsU0FBQyxBQUFDLElBQUcsQUFBQyxBQUFDLEFBQUMsT0FDakUsQUFBUyxVQUFDLEFBQUcsS0FBRSxJQUFJLEFBQUksS0FBQyxBQUFRLFNBQUMsQUFBUSxTQUFDLEFBQUMsSUFBRyxBQUFDLEdBQUUsQUFBUSxTQUFDLEFBQUMsQUFBQyxBQUFDLE9BQzdELEFBQVMs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ZUFrRnhCOzs7Ozs7Ozs7O0FDN0ZELGlCQUFjLEFBQWdCLEFBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuL2NvcmUnO1xuaW1wb3J0IEdseXBoID0gcmVxdWlyZSgnLi9HbHlwaCcpO1xuXG5jbGFzcyBDb25zb2xlIHtcbiAgcHJpdmF0ZSBfd2lkdGg6IG51bWJlcjtcbiAgZ2V0IHdpZHRoKCkge1xuICAgIHJldHVybiB0aGlzLl93aWR0aDtcbiAgfVxuICBwcml2YXRlIF9oZWlnaHQ6IG51bWJlcjtcbiAgZ2V0IGhlaWdodCgpIHtcbiAgICByZXR1cm4gdGhpcy5faGVpZ2h0O1xuICB9XG5cbiAgcHJpdmF0ZSBfdGV4dDogbnVtYmVyW11bXTtcbiAgZ2V0IHRleHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RleHQ7XG4gIH1cbiAgcHJpdmF0ZSBfZm9yZTogQ29yZS5Db2xvcltdW107XG4gIGdldCBmb3JlKCkge1xuICAgIHJldHVybiB0aGlzLl9mb3JlO1xuICB9XG4gIHByaXZhdGUgX2JhY2s6IENvcmUuQ29sb3JbXVtdO1xuICBnZXQgYmFjaygpIHtcbiAgICByZXR1cm4gdGhpcy5fYmFjaztcbiAgfVxuICBwcml2YXRlIF9pc0RpcnR5OiBib29sZWFuW11bXTtcbiAgZ2V0IGlzRGlydHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzRGlydHk7XG4gIH1cblxuICBwcml2YXRlIGRlZmF1bHRCYWNrZ3JvdW5kOiBDb3JlLkNvbG9yO1xuICBwcml2YXRlIGRlZmF1bHRGb3JlZ3JvdW5kOiBDb3JlLkNvbG9yO1xuXG4gIGNvbnN0cnVjdG9yKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBmb3JlZ3JvdW5kOiBDb3JlLkNvbG9yID0gMHhmZmZmZmYsIGJhY2tncm91bmQ6IENvcmUuQ29sb3IgPSAweDAwMDAwMCkge1xuICAgIHRoaXMuX3dpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5faGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgdGhpcy5kZWZhdWx0QmFja2dyb3VuZCA9IDB4MDAwMDA7XG4gICAgdGhpcy5kZWZhdWx0Rm9yZWdyb3VuZCA9IDB4ZmZmZmY7XG5cbiAgICB0aGlzLl90ZXh0ID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeDxudW1iZXI+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCBHbHlwaC5DSEFSX1NQQUNFKTtcbiAgICB0aGlzLl9mb3JlID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeDxDb3JlLkNvbG9yPih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5kZWZhdWx0Rm9yZWdyb3VuZCk7XG4gICAgdGhpcy5fYmFjayA9IENvcmUuVXRpbHMuYnVpbGRNYXRyaXg8Q29yZS5Db2xvcj4odGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIHRoaXMuZGVmYXVsdEJhY2tncm91bmQpO1xuICAgIHRoaXMuX2lzRGlydHkgPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4PGJvb2xlYW4+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0cnVlKTtcbiAgfVxuXG4gIGNsZWFuQ2VsbCh4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgIHRoaXMuX2lzRGlydHlbeF1beV0gPSBmYWxzZTtcbiAgfVxuXG4gIHByaW50KHRleHQ6IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIsIGNvbG9yOiBDb3JlLkNvbG9yID0gMHhmZmZmZmYpIHtcbiAgICBsZXQgYmVnaW4gPSAwO1xuICAgIGxldCBlbmQgPSB0ZXh0Lmxlbmd0aDtcbiAgICBpZiAoeCArIGVuZCA+IHRoaXMud2lkdGgpIHtcbiAgICAgIGVuZCA9IHRoaXMud2lkdGggLSB4O1xuICAgIH1cbiAgICBpZiAoeCA8IDApIHtcbiAgICAgIGVuZCArPSB4O1xuICAgICAgeCA9IDA7XG4gICAgfVxuICAgIHRoaXMuc2V0Rm9yZWdyb3VuZChjb2xvciwgeCwgeSwgZW5kLCAxKTtcbiAgICBmb3IgKGxldCBpID0gYmVnaW47IGkgPCBlbmQ7ICsraSkge1xuICAgICAgdGhpcy5zZXRUZXh0KHRleHQuY2hhckNvZGVBdChpKSwgeCArIGksIHkpO1xuICAgIH1cbiAgfVxuXG4gIHNldFRleHQoYXNjaWk6IG51bWJlciB8IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIgPSAxLCBoZWlnaHQ6IG51bWJlciA9IDEpIHtcbiAgICBpZiAodHlwZW9mIGFzY2lpID09PSAnc3RyaW5nJykge1xuICAgICAgYXNjaWkgPSAoPHN0cmluZz5hc2NpaSkuY2hhckNvZGVBdCgwKTtcbiAgICB9XG4gICAgdGhpcy5zZXRNYXRyaXgodGhpcy5fdGV4dCwgYXNjaWksIHgsIHksIHdpZHRoLCBoZWlnaHQpO1xuICB9XG5cbiAgc2V0Rm9yZWdyb3VuZChjb2xvcjogQ29yZS5Db2xvciwgeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIgPSAxLCBoZWlnaHQ6IG51bWJlciA9IDEpIHtcbiAgICB0aGlzLnNldE1hdHJpeCh0aGlzLl9mb3JlLCBjb2xvciwgeCwgeSwgd2lkdGgsIGhlaWdodCk7XG4gIH1cblxuICBzZXRCYWNrZ3JvdW5kKGNvbG9yOiBDb3JlLkNvbG9yLCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciA9IDEsIGhlaWdodDogbnVtYmVyID0gMSkge1xuICAgIHRoaXMuc2V0TWF0cml4KHRoaXMuX2JhY2ssIGNvbG9yLCB4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0TWF0cml4PFQ+KG1hdHJpeDogVFtdW10sIHZhbHVlOiBULCB4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICBmb3IgKGxldCBpID0geDsgaSA8IHggKyB3aWR0aDsgaSsrKSB7XG4gICAgICBmb3IgKGxldCBqID0geTsgaiA8IHkgKyBoZWlnaHQ7IGorKykge1xuICAgICAgICBpZiAobWF0cml4W2ldW2pdID09PSB2YWx1ZSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIG1hdHJpeFtpXVtqXSA9IHZhbHVlO1xuICAgICAgICB0aGlzLl9pc0RpcnR5W2ldW2pdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0ID0gQ29uc29sZTtcbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4vZW50aXRpZXMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2NvbXBvbmVudHMnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbGxlY3Rpb25zIGZyb20gJ3R5cGVzY3JpcHQtY29sbGVjdGlvbnMnO1xuaW1wb3J0ICogYXMgTWl4aW5zIGZyb20gJy4vbWl4aW5zJztcblxuaW1wb3J0IFBpeGlDb25zb2xlID0gcmVxdWlyZSgnLi9QaXhpQ29uc29sZScpO1xuaW1wb3J0IENvbnNvbGUgPSByZXF1aXJlKCcuL0NvbnNvbGUnKTtcblxuaW1wb3J0IElucHV0SGFuZGxlciA9IHJlcXVpcmUoJy4vSW5wdXRIYW5kbGVyJyk7XG5cbmltcG9ydCBTY2VuZSA9IHJlcXVpcmUoJy4vU2NlbmUnKTtcblxuaW50ZXJmYWNlIEZyYW1lUmVuZGVyZXIge1xuICAoZWxhcHNlZFRpbWU6IG51bWJlcik6IHZvaWQ7XG59XG5sZXQgcmVuZGVyZXI6IEZyYW1lUmVuZGVyZXI7XG5sZXQgZnJhbWVMb29wOiAoY2FsbGJhY2s6IChlbGFwc2VkVGltZTogbnVtYmVyKSA9PiB2b2lkKSA9PiB2b2lkO1xuXG5sZXQgZnJhbWVGdW5jID0gKGVsYXBzZWRUaW1lOiBudW1iZXIpID0+IHtcbiAgZnJhbWVMb29wKGZyYW1lRnVuYyk7XG4gIHJlbmRlcmVyKGVsYXBzZWRUaW1lKTtcbn1cblxubGV0IGxvb3AgPSAodGhlUmVuZGVyZXI6IEZyYW1lUmVuZGVyZXIpID0+IHtcbiAgcmVuZGVyZXIgPSB0aGVSZW5kZXJlcjtcbiAgZnJhbWVMb29wKGZyYW1lRnVuYyk7XG59XG5cbmNsYXNzIEVuZ2luZSBpbXBsZW1lbnRzIE1peGlucy5JRXZlbnRIYW5kbGVyIHtcbiAgLy8gRXZlbnRIYW5kbGVyIG1peGluXG4gIGxpc3RlbjogKGxpc3RlbmVyOiBFdmVudHMuTGlzdGVuZXIpID0+IEV2ZW50cy5MaXN0ZW5lcjtcbiAgcmVtb3ZlTGlzdGVuZXI6IChsaXN0ZW5lcjogRXZlbnRzLkxpc3RlbmVyKSA9PiB2b2lkO1xuICBlbWl0OiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gdm9pZDtcbiAgZmlyZTogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IGFueTtcbiAgaXM6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiBib29sZWFuO1xuICBnYXRoZXI6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiBhbnlbXTtcblxuICBwcml2YXRlIHBpeGlDb25zb2xlOiBQaXhpQ29uc29sZTtcblxuICBwcml2YXRlIGdhbWVUaW1lOiBudW1iZXIgPSAwO1xuICBwcml2YXRlIGVuZ2luZVRpY2tzUGVyU2Vjb25kOiBudW1iZXIgPSAxMDtcbiAgcHJpdmF0ZSBlbmdpbmVUaWNrTGVuZ3RoOiBudW1iZXIgPSAxMDA7XG4gIHByaXZhdGUgZWxhcHNlZFRpbWU6IG51bWJlciA9IDA7XG4gIHByaXZhdGUgdGltZUhhbmRsZXJDb21wb25lbnQ6IENvbXBvbmVudHMuVGltZUhhbmRsZXJDb21wb25lbnQ7XG5cbiAgcHJpdmF0ZSB3aWR0aDogbnVtYmVyO1xuICBwcml2YXRlIGhlaWdodDogbnVtYmVyO1xuICBwcml2YXRlIGNhbnZhc0lkOiBzdHJpbmc7XG5cbiAgcHJpdmF0ZSBlbnRpdGllczoge1tndWlkOiBzdHJpbmddOiBFbnRpdGllcy5FbnRpdHl9O1xuICBwcml2YXRlIHRvRGVzdHJveTogRW50aXRpZXMuRW50aXR5W107XG5cbiAgcHJpdmF0ZSBwYXVzZWQ6IGJvb2xlYW47XG5cbiAgcHJpdmF0ZSBfaW5wdXRIYW5kbGVyOiBJbnB1dEhhbmRsZXI7XG4gIGdldCBpbnB1dEhhbmRsZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lucHV0SGFuZGxlcjtcbiAgfVxuXG4gIHByaXZhdGUgX2N1cnJlbnRTY2VuZTogU2NlbmU7XG4gIGdldCBjdXJyZW50U2NlbmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRTY2VuZTtcbiAgfVxuXG4gIHB1YmxpYyBjdXJyZW50VGljazogbnVtYmVyO1xuICBwdWJsaWMgY3VycmVudFR1cm46IG51bWJlcjtcblxuICBjb25zdHJ1Y3Rvcih3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgY2FudmFzSWQ6IHN0cmluZykge1xuICAgIHRoaXMucGF1c2VkID0gZmFsc2U7XG5cbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5jYW52YXNJZCA9IGNhbnZhc0lkO1xuXG4gICAgdGhpcy5lbnRpdGllcyA9IHt9O1xuICAgIHRoaXMudG9EZXN0cm95ID0gW107XG5cbiAgICB0aGlzLmN1cnJlbnRUaWNrID0gMDtcbiAgICB0aGlzLmN1cnJlbnRUdXJuID0gMDtcblxuICAgIHRoaXMuZW5naW5lVGlja3NQZXJTZWNvbmQgPSAxMDtcbiAgICBmcmFtZUxvb3AgPSAoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAoPGFueT53aW5kb3cpLndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCAoPGFueT53aW5kb3cpLm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAoPGFueT53aW5kb3cpLm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgKDxhbnk+d2luZG93KS5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICBmdW5jdGlvbihjYWxsYmFjazogKGVsYXBzZWRUaW1lOiBudW1iZXIpID0+IHZvaWQpIHtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MCwgbmV3IERhdGUoKS5nZXRUaW1lKCkpO1xuICAgICAgfTtcbiAgICB9KSgpO1xuXG4gICAgdGhpcy5lbmdpbmVUaWNrTGVuZ3RoID0gMTAwMCAvIHRoaXMuZW5naW5lVGlja3NQZXJTZWNvbmQ7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCAoKSA9PiB7XG4gICAgICB0aGlzLnBhdXNlZCA9IGZhbHNlO1xuICAgIH0pO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdibHVyJywgKCkgPT4ge1xuICAgICAgdGhpcy5wYXVzZWQgPSB0cnVlO1xuICAgIH0pO1xuXG4gICAgdGhpcy5faW5wdXRIYW5kbGVyID0gbmV3IElucHV0SGFuZGxlcih0aGlzKTtcbiAgfVxuXG4gIHN0YXJ0KHNjZW5lOiBTY2VuZSkge1xuICAgIHRoaXMuX2N1cnJlbnRTY2VuZSA9IHNjZW5lO1xuICAgIHRoaXMuX2N1cnJlbnRTY2VuZS5zdGFydCgpO1xuXG4gICAgbGV0IHRpbWVLZWVwZXIgPSBuZXcgRW50aXRpZXMuRW50aXR5KHRoaXMsICd0aW1lS2VlcGVyJyk7XG4gICAgdGhpcy50aW1lSGFuZGxlckNvbXBvbmVudCA9IG5ldyBDb21wb25lbnRzLlRpbWVIYW5kbGVyQ29tcG9uZW50KHRoaXMpO1xuICAgIHRpbWVLZWVwZXIuYWRkQ29tcG9uZW50KHRoaXMudGltZUhhbmRsZXJDb21wb25lbnQpO1xuXG4gICAgdGhpcy5waXhpQ29uc29sZSA9IG5ldyBQaXhpQ29uc29sZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdGhpcy5jYW52YXNJZCwgMHhmZmZmZmYsIDB4MDAwMDAwKTtcbiAgICBsb29wKCh0aW1lKSA9PiB7XG4gICAgICBpZiAodGhpcy5wYXVzZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhpcy5lbGFwc2VkVGltZSA9IHRpbWUgLSB0aGlzLmdhbWVUaW1lO1xuXG4gICAgICBpZiAodGhpcy5lbGFwc2VkVGltZSA+PSB0aGlzLmVuZ2luZVRpY2tMZW5ndGgpIHtcbiAgICAgICAgdGhpcy5nYW1lVGltZSA9IHRpbWU7XG4gICAgICAgIHRoaXMudGltZUhhbmRsZXJDb21wb25lbnQuZW5naW5lVGljayh0aGlzLmdhbWVUaW1lKTtcblxuICAgICAgICB0aGlzLmRlc3Ryb3lFbnRpdGllcygpO1xuXG4gICAgICAgIHNjZW5lLnJlbmRlcigoY29uc29sZTogQ29uc29sZSwgeDogbnVtYmVyLCB5OiBudW1iZXIpID0+IHtcbiAgICAgICAgICB0aGlzLnBpeGlDb25zb2xlLmJsaXQoY29uc29sZSwgeCwgeSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgdGhpcy5waXhpQ29uc29sZS5yZW5kZXIoKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlZ2lzdGVyRW50aXR5KGVudGl0eTogRW50aXRpZXMuRW50aXR5KSB7XG4gICAgdGhpcy5lbnRpdGllc1tlbnRpdHkuZ3VpZF0gPSBlbnRpdHk7XG4gIH1cblxuICByZW1vdmVFbnRpdHkoZW50aXR5OiBFbnRpdGllcy5FbnRpdHkpIHtcbiAgICB0aGlzLnRvRGVzdHJveS5wdXNoKGVudGl0eSk7XG4gIH1cblxuICBwcml2YXRlIGRlc3Ryb3lFbnRpdGllcygpIHtcbiAgICB0aGlzLnRvRGVzdHJveS5mb3JFYWNoKChlbnRpdHkpID0+IHtcbiAgICAgIGVudGl0eS5kZXN0cm95KCk7XG4gICAgICB0aGlzLmVtaXQobmV3IEV2ZW50cy5FdmVudCgnZW50aXR5RGVzdHJveWVkJywge2VudGl0eTogZW50aXR5fSkpO1xuICAgICAgZGVsZXRlIHRoaXMuZW50aXRpZXNbZW50aXR5Lmd1aWRdO1xuICAgIH0pO1xuICAgIHRoaXMudG9EZXN0cm95ID0gW107XG4gIH1cblxuICBnZXRFbnRpdHkoZ3VpZDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMuZW50aXRpZXNbZ3VpZF07XG4gIH1cbn1cblxuQ29yZS5VdGlscy5hcHBseU1peGlucyhFbmdpbmUsIFtNaXhpbnMuRXZlbnRIYW5kbGVyXSk7XG5cbmV4cG9ydCA9IEVuZ2luZTtcbiIsImV4cG9ydCBjbGFzcyBNaXNzaW5nQ29tcG9uZW50RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gIHB1YmxpYyBtZXNzYWdlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTWlzc2luZ0ltcGxlbWVudGF0aW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gIHB1YmxpYyBtZXNzYWdlOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRW50aXR5T3ZlcmxhcEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuICBwdWJsaWMgbWVzc2FnZTogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcblxuY2xhc3MgR2x5cGgge1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRlVMTDogbnVtYmVyID0gMjE5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU1BBQ0U6IG51bWJlciA9IDMyO1xuXHQvLyBzaW5nbGUgd2FsbHNcblx0cHVibGljIHN0YXRpYyBDSEFSX0hMSU5FOiBudW1iZXIgPSAxOTY7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9WTElORTogbnVtYmVyID0gMTc5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU1c6IG51bWJlciA9IDE5MTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1NFOiBudW1iZXIgPSAyMTg7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9OVzogbnVtYmVyID0gMjE3O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfTkU6IG51bWJlciA9IDE5Mjtcblx0cHVibGljIHN0YXRpYyBDSEFSX1RFRVc6IG51bWJlciA9IDE4MDtcblx0cHVibGljIHN0YXRpYyBDSEFSX1RFRUU6IG51bWJlciA9IDE5NTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1RFRU46IG51bWJlciA9IDE5Mztcblx0cHVibGljIHN0YXRpYyBDSEFSX1RFRVM6IG51bWJlciA9IDE5NDtcblx0cHVibGljIHN0YXRpYyBDSEFSX0NST1NTOiBudW1iZXIgPSAxOTc7XG5cdC8vIGRvdWJsZSB3YWxsc1xuXHRwdWJsaWMgc3RhdGljIENIQVJfREhMSU5FOiBudW1iZXIgPSAyMDU7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9EVkxJTkU6IG51bWJlciA9IDE4Njtcblx0cHVibGljIHN0YXRpYyBDSEFSX0RORTogbnVtYmVyID0gMTg3O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRE5XOiBudW1iZXIgPSAyMDE7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9EU0U6IG51bWJlciA9IDE4ODtcblx0cHVibGljIHN0YXRpYyBDSEFSX0RTVzogbnVtYmVyID0gMjAwO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRFRFRVc6IG51bWJlciA9IDE4NTtcblx0cHVibGljIHN0YXRpYyBDSEFSX0RURUVFOiBudW1iZXIgPSAyMDQ7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9EVEVFTjogbnVtYmVyID0gMjAyO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfRFRFRVM6IG51bWJlciA9IDIwMztcblx0cHVibGljIHN0YXRpYyBDSEFSX0RDUk9TUzogbnVtYmVyID0gMjA2O1xuXHQvLyBibG9ja3MgXG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9CTE9DSzE6IG51bWJlciA9IDE3Njtcblx0cHVibGljIHN0YXRpYyBDSEFSX0JMT0NLMjogbnVtYmVyID0gMTc3O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQkxPQ0szOiBudW1iZXIgPSAxNzg7XG5cdC8vIGFycm93cyBcblx0cHVibGljIHN0YXRpYyBDSEFSX0FSUk9XX046IG51bWJlciA9IDI0O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQVJST1dfUzogbnVtYmVyID0gMjU7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9BUlJPV19FOiBudW1iZXIgPSAyNjtcblx0cHVibGljIHN0YXRpYyBDSEFSX0FSUk9XX1c6IG51bWJlciA9IDI3O1xuXHQvLyBhcnJvd3Mgd2l0aG91dCB0YWlsIFxuXHRwdWJsaWMgc3RhdGljIENIQVJfQVJST1cyX046IG51bWJlciA9IDMwO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQVJST1cyX1M6IG51bWJlciA9IDMxO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQVJST1cyX0U6IG51bWJlciA9IDE2O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQVJST1cyX1c6IG51bWJlciA9IDE3O1xuXHQvLyBkb3VibGUgYXJyb3dzIFxuXHRwdWJsaWMgc3RhdGljIENIQVJfREFSUk9XX0g6IG51bWJlciA9IDI5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfREFSUk9XX1Y6IG51bWJlciA9IDE4O1xuXHQvLyBHVUkgc3R1ZmYgXG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9DSEVDS0JPWF9VTlNFVDogbnVtYmVyID0gMjI0O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQ0hFQ0tCT1hfU0VUOiBudW1iZXIgPSAyMjU7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9SQURJT19VTlNFVDogbnVtYmVyID0gOTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1JBRElPX1NFVDogbnVtYmVyID0gMTA7XG5cdC8vIHN1Yi1waXhlbCByZXNvbHV0aW9uIGtpdCBcblx0cHVibGljIHN0YXRpYyBDSEFSX1NVQlBfTlc6IG51bWJlciA9IDIyNjtcblx0cHVibGljIHN0YXRpYyBDSEFSX1NVQlBfTkU6IG51bWJlciA9IDIyNztcblx0cHVibGljIHN0YXRpYyBDSEFSX1NVQlBfTjogbnVtYmVyID0gMjI4O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU1VCUF9TRTogbnVtYmVyID0gMjI5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU1VCUF9ESUFHOiBudW1iZXIgPSAyMzA7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9TVUJQX0U6IG51bWJlciA9IDIzMTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1NVQlBfU1c6IG51bWJlciA9IDIzMjtcblx0Ly8gbWlzY2VsbGFuZW91cyBcblx0cHVibGljIHN0YXRpYyBDSEFSX1NNSUxJRSA6IG51bWJlciA9ICAxO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU01JTElFX0lOViA6IG51bWJlciA9ICAyO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfSEVBUlQgOiBudW1iZXIgPSAgMztcblx0cHVibGljIHN0YXRpYyBDSEFSX0RJQU1PTkQgOiBudW1iZXIgPSAgNDtcblx0cHVibGljIHN0YXRpYyBDSEFSX0NMVUIgOiBudW1iZXIgPSAgNTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1NQQURFIDogbnVtYmVyID0gIDY7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9CVUxMRVQgOiBudW1iZXIgPSAgNztcblx0cHVibGljIHN0YXRpYyBDSEFSX0JVTExFVF9JTlYgOiBudW1iZXIgPSAgODtcblx0cHVibGljIHN0YXRpYyBDSEFSX01BTEUgOiBudW1iZXIgPSAgMTE7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9GRU1BTEUgOiBudW1iZXIgPSAgMTI7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9OT1RFIDogbnVtYmVyID0gIDEzO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfTk9URV9ET1VCTEUgOiBudW1iZXIgPSAgMTQ7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9MSUdIVCA6IG51bWJlciA9ICAxNTtcblx0cHVibGljIHN0YXRpYyBDSEFSX0VYQ0xBTV9ET1VCTEUgOiBudW1iZXIgPSAgMTk7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9QSUxDUk9XIDogbnVtYmVyID0gIDIwO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfU0VDVElPTiA6IG51bWJlciA9ICAyMTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1BPVU5EIDogbnVtYmVyID0gIDE1Njtcblx0cHVibGljIHN0YXRpYyBDSEFSX01VTFRJUExJQ0FUSU9OIDogbnVtYmVyID0gIDE1ODtcblx0cHVibGljIHN0YXRpYyBDSEFSX0ZVTkNUSU9OIDogbnVtYmVyID0gIDE1OTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1JFU0VSVkVEIDogbnVtYmVyID0gIDE2OTtcblx0cHVibGljIHN0YXRpYyBDSEFSX0hBTEYgOiBudW1iZXIgPSAgMTcxO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfT05FX1FVQVJURVIgOiBudW1iZXIgPSAgMTcyO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfQ09QWVJJR0hUIDogbnVtYmVyID0gIDE4NDtcblx0cHVibGljIHN0YXRpYyBDSEFSX0NFTlQgOiBudW1iZXIgPSAgMTg5O1xuXHRwdWJsaWMgc3RhdGljIENIQVJfWUVOIDogbnVtYmVyID0gIDE5MDtcblx0cHVibGljIHN0YXRpYyBDSEFSX0NVUlJFTkNZIDogbnVtYmVyID0gIDIwNztcblx0cHVibGljIHN0YXRpYyBDSEFSX1RIUkVFX1FVQVJURVJTIDogbnVtYmVyID0gIDI0Mztcblx0cHVibGljIHN0YXRpYyBDSEFSX0RJVklTSU9OIDogbnVtYmVyID0gIDI0Njtcblx0cHVibGljIHN0YXRpYyBDSEFSX0dSQURFIDogbnVtYmVyID0gIDI0ODtcblx0cHVibGljIHN0YXRpYyBDSEFSX1VNTEFVVCA6IG51bWJlciA9ICAyNDk7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9QT1cxIDogbnVtYmVyID0gIDI1MTtcblx0cHVibGljIHN0YXRpYyBDSEFSX1BPVzMgOiBudW1iZXIgPSAgMjUyO1xuXHRwdWJsaWMgc3RhdGljIENIQVJfUE9XMiA6IG51bWJlciA9ICAyNTM7XG5cdHB1YmxpYyBzdGF0aWMgQ0hBUl9CVUxMRVRfU1FVQVJFIDogbnVtYmVyID0gIDI1NDtcblxuICBwcml2YXRlIF9nbHlwaDogbnVtYmVyO1xuICBnZXQgZ2x5cGgoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2dseXBoO1xuICB9XG4gIHByaXZhdGUgX2ZvcmVncm91bmRDb2xvcjogQ29yZS5Db2xvcjtcbiAgZ2V0IGZvcmVncm91bmRDb2xvcigpIHtcbiAgICByZXR1cm4gdGhpcy5fZm9yZWdyb3VuZENvbG9yO1xuICB9XG4gIHByaXZhdGUgX2JhY2tncm91bmRDb2xvcjogQ29yZS5Db2xvcjtcbiAgZ2V0IGJhY2tncm91bmRDb2xvcigpIHtcbiAgICByZXR1cm4gdGhpcy5fYmFja2dyb3VuZENvbG9yO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZzogc3RyaW5nIHwgbnVtYmVyID0gR2x5cGguQ0hBUl9TUEFDRSwgZjogQ29yZS5Db2xvciA9IDB4ZmZmZmZmLCBiOiBDb3JlLkNvbG9yID0gMHgwMDAwMDApIHtcbiAgICB0aGlzLl9nbHlwaCA9IHR5cGVvZiBnID09PSAnc3RyaW5nJyA/IGcuY2hhckNvZGVBdCgwKSA6IGc7XG4gICAgdGhpcy5fZm9yZWdyb3VuZENvbG9yID0gZjtcbiAgICB0aGlzLl9iYWNrZ3JvdW5kQ29sb3IgPSBiO1xuICB9XG59XG5cbmV4cG9ydCA9IEdseXBoO1xuIiwiaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4vRW5naW5lJyk7XG5cbmNsYXNzIElucHV0SGFuZGxlciB7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1BFUklPRDogbnVtYmVyID0gMTkwO1xuICBwdWJsaWMgc3RhdGljIEtFWV9MRUZUOiBudW1iZXIgPSAzNztcbiAgcHVibGljIHN0YXRpYyBLRVlfVVA6IG51bWJlciA9IDM4O1xuICBwdWJsaWMgc3RhdGljIEtFWV9SSUdIVDogbnVtYmVyID0gMzk7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0RPV046IG51bWJlciA9IDQwO1xuXG4gIHB1YmxpYyBzdGF0aWMgS0VZXzA6IG51bWJlciA9IDQ4O1xuICBwdWJsaWMgc3RhdGljIEtFWV8xOiBudW1iZXIgPSA0OTtcbiAgcHVibGljIHN0YXRpYyBLRVlfMjogbnVtYmVyID0gNTA7XG4gIHB1YmxpYyBzdGF0aWMgS0VZXzM6IG51bWJlciA9IDUxO1xuICBwdWJsaWMgc3RhdGljIEtFWV80OiBudW1iZXIgPSA1MjtcbiAgcHVibGljIHN0YXRpYyBLRVlfNTogbnVtYmVyID0gNTM7XG4gIHB1YmxpYyBzdGF0aWMgS0VZXzY6IG51bWJlciA9IDU0O1xuICBwdWJsaWMgc3RhdGljIEtFWV83OiBudW1iZXIgPSA1NTtcbiAgcHVibGljIHN0YXRpYyBLRVlfODogbnVtYmVyID0gNTY7XG4gIHB1YmxpYyBzdGF0aWMgS0VZXzk6IG51bWJlciA9IDU3O1xuXG4gIHB1YmxpYyBzdGF0aWMgS0VZX0E6IG51bWJlciA9IDY1O1xuICBwdWJsaWMgc3RhdGljIEtFWV9COiBudW1iZXIgPSA2NjtcbiAgcHVibGljIHN0YXRpYyBLRVlfQzogbnVtYmVyID0gNjc7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0Q6IG51bWJlciA9IDY4O1xuICBwdWJsaWMgc3RhdGljIEtFWV9FOiBudW1iZXIgPSA2OTtcbiAgcHVibGljIHN0YXRpYyBLRVlfRjogbnVtYmVyID1cdDcwO1xuICBwdWJsaWMgc3RhdGljIEtFWV9HOiBudW1iZXIgPVx0NzE7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0g6IG51bWJlciA9XHQ3MjtcbiAgcHVibGljIHN0YXRpYyBLRVlfSTogbnVtYmVyID1cdDczO1xuICBwdWJsaWMgc3RhdGljIEtFWV9KOiBudW1iZXIgPVx0NzQ7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX0s6IG51bWJlciA9XHQ3NTtcbiAgcHVibGljIHN0YXRpYyBLRVlfTDogbnVtYmVyID1cdDc2O1xuICBwdWJsaWMgc3RhdGljIEtFWV9NOiBudW1iZXIgPVx0Nzc7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX046IG51bWJlciA9XHQ3ODtcbiAgcHVibGljIHN0YXRpYyBLRVlfTzogbnVtYmVyID1cdDc5O1xuICBwdWJsaWMgc3RhdGljIEtFWV9QOiBudW1iZXIgPVx0ODA7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1E6IG51bWJlciA9XHQ4MTtcbiAgcHVibGljIHN0YXRpYyBLRVlfUjogbnVtYmVyID1cdDgyO1xuICBwdWJsaWMgc3RhdGljIEtFWV9TOiBudW1iZXIgPVx0ODM7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1Q6IG51bWJlciA9XHQ4NDtcbiAgcHVibGljIHN0YXRpYyBLRVlfVTogbnVtYmVyID1cdDg1O1xuICBwdWJsaWMgc3RhdGljIEtFWV9WOiBudW1iZXIgPVx0ODY7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1c6IG51bWJlciA9XHQ4NztcbiAgcHVibGljIHN0YXRpYyBLRVlfWDogbnVtYmVyID1cdDg4O1xuICBwdWJsaWMgc3RhdGljIEtFWV9ZOiBudW1iZXIgPVx0ODk7XG4gIHB1YmxpYyBzdGF0aWMgS0VZX1o6IG51bWJlciA9XHQ5MDtcblxuICBwcml2YXRlIGxpc3RlbmVyczoge1trZXljb2RlOiBudW1iZXJdOiAoKCkgPT4gYW55KVtdfTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVuZ2luZTogRW5naW5lKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMgPSB7fTtcblxuICAgIHRoaXMucmVnaXN0ZXJMaXN0ZW5lcnMoKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCB0aGlzLm9uS2V5RG93bi5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25LZXlEb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgaWYgKHRoaXMubGlzdGVuZXJzW2V2ZW50LmtleUNvZGVdKSB7XG4gICAgICB0aGlzLmxpc3RlbmVyc1tldmVudC5rZXlDb2RlXS5mb3JFYWNoKChjYWxsYmFjaykgPT4ge1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGxpc3RlbihrZXljb2RlczogbnVtYmVyW10sIGNhbGxiYWNrOiAoKSA9PiBhbnkpIHtcbiAgICBrZXljb2Rlcy5mb3JFYWNoKChrZXljb2RlKSA9PiB7XG4gICAgICBpZiAoIXRoaXMubGlzdGVuZXJzW2tleWNvZGVdKSB7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzW2tleWNvZGVdID0gW107XG4gICAgICB9XG4gICAgICB0aGlzLmxpc3RlbmVyc1trZXljb2RlXS5wdXNoKGNhbGxiYWNrKTtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgPSBJbnB1dEhhbmRsZXI7XG4iLCJpbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgRW50aXRpZXMgZnJvbSAnLi9lbnRpdGllcyc7XG5cbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuL0VuZ2luZScpO1xuaW1wb3J0IEdseXBoID0gcmVxdWlyZSgnLi9HbHlwaCcpO1xuaW1wb3J0IENvbnNvbGUgPSByZXF1aXJlKCcuL0NvbnNvbGUnKTtcblxuY2xhc3MgTG9nVmlldyB7XG4gIHByaXZhdGUgY3VycmVudFR1cm46IG51bWJlcjtcbiAgcHJpdmF0ZSBtZXNzYWdlczoge3R1cm46IG51bWJlciwgbWVzc2FnZTogc3RyaW5nfVtdO1xuICBwcml2YXRlIGNvbnNvbGU6IENvbnNvbGU7XG4gIHByaXZhdGUgcGxheWVyOiBFbnRpdGllcy5FbnRpdHk7XG4gIHByaXZhdGUgbWF4TWVzc2FnZXM6IG51bWJlcjtcbiAgcHJpdmF0ZSBlZmZlY3RzOiBhbnlbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVuZ2luZTogRW5naW5lLCBwcml2YXRlIHdpZHRoOiBudW1iZXIsIHByaXZhdGUgaGVpZ2h0OiBudW1iZXIsIHBsYXllcjogRW50aXRpZXMuRW50aXR5KSB7XG4gICAgdGhpcy5yZWdpc3Rlckxpc3RlbmVycygpO1xuXG4gICAgdGhpcy5jb25zb2xlID0gbmV3IENvbnNvbGUodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIHRoaXMuY3VycmVudFR1cm4gPSAxO1xuICAgIHRoaXMubWVzc2FnZXMgPSBbXTtcbiAgICB0aGlzLm1heE1lc3NhZ2VzID0gdGhpcy5oZWlnaHQgLSAxO1xuXG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgdGhpcy5lZmZlY3RzID0gW107XG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ3R1cm4nLFxuICAgICAgdGhpcy5vblR1cm4uYmluZCh0aGlzKVxuICAgICkpO1xuXG4gICAgdGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAnbWVzc2FnZScsXG4gICAgICB0aGlzLm9uTWVzc2FnZS5iaW5kKHRoaXMpXG4gICAgKSk7XG4gIH1cblxuICBwcml2YXRlIG9uVHVybihldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgdGhpcy5jdXJyZW50VHVybiA9IGV2ZW50LmRhdGEuY3VycmVudFR1cm47XG4gICAgaWYgKHRoaXMubWVzc2FnZXMubGVuZ3RoID4gMCAmJiB0aGlzLm1lc3NhZ2VzW3RoaXMubWVzc2FnZXMubGVuZ3RoIC0gMV0udHVybiA8IHRoaXMuY3VycmVudFR1cm4gLSAxMCkge1xuICAgICAgdGhpcy5tZXNzYWdlcy5wb3AoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMucGxheWVyKSB7XG4gICAgICB0aGlzLmVmZmVjdHMgPSB0aGlzLnBsYXllci5nYXRoZXIobmV3IEV2ZW50cy5FdmVudCgnZ2V0U3RhdHVzRWZmZWN0JykpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25NZXNzYWdlKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBpZiAoZXZlbnQuZGF0YS5tZXNzYWdlKSB7XG4gICAgICB0aGlzLm1lc3NhZ2VzLnVuc2hpZnQoe1xuICAgICAgICB0dXJuOiB0aGlzLmN1cnJlbnRUdXJuLFxuICAgICAgICBtZXNzYWdlOiBldmVudC5kYXRhLm1lc3NhZ2VcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAodGhpcy5tZXNzYWdlcy5sZW5ndGggPiB0aGlzLm1heE1lc3NhZ2VzKSB7XG4gICAgICB0aGlzLm1lc3NhZ2VzLnBvcCgpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcihibGl0RnVuY3Rpb246IGFueSkge1xuICAgIHRoaXMuY29uc29sZS5zZXRUZXh0KCcgJywgMCwgMCwgdGhpcy5jb25zb2xlLndpZHRoLCB0aGlzLmNvbnNvbGUuaGVpZ2h0KTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy53aWR0aDsgaSsrKSB7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMuaGVpZ2h0OyBqKyspIHtcbiAgICAgICAgbGV0IGRyYXduID0gZmFsc2U7XG4gICAgICAgIGlmIChpID09PSAwICYmIGogPT09IDApIHtcbiAgICAgICAgICB0aGlzLmNvbnNvbGUuc2V0VGV4dChHbHlwaC5DSEFSX1NFLCBpLCBqKTtcbiAgICAgICAgICBkcmF3biA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoaSA9PT0gdGhpcy53aWR0aCAtIDEgJiYgaiA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuY29uc29sZS5zZXRUZXh0KEdseXBoLkNIQVJfU1csIGksIGopO1xuICAgICAgICAgIGRyYXduID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChpID09PSB0aGlzLndpZHRoIC0gMSAmJiBqID09PSB0aGlzLmhlaWdodCAtIDEpIHtcbiAgICAgICAgICB0aGlzLmNvbnNvbGUuc2V0VGV4dChHbHlwaC5DSEFSX05XLCBpLCBqKTtcbiAgICAgICAgICBkcmF3biA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoaSA9PT0gMCAmJiBqID09PSB0aGlzLmhlaWdodCAtIDEpIHtcbiAgICAgICAgICB0aGlzLmNvbnNvbGUuc2V0VGV4dChHbHlwaC5DSEFSX05FLCBpLCBqKTtcbiAgICAgICAgICBkcmF3biA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoaSA9PT0gMCB8fCBpID09PSB0aGlzLndpZHRoIC0gMSkge1xuICAgICAgICAgIHRoaXMuY29uc29sZS5zZXRUZXh0KEdseXBoLkNIQVJfVkxJTkUsIGksIGopO1xuICAgICAgICAgIGRyYXduID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChqID09PSAwIHx8IGogPT09ICh0aGlzLmhlaWdodCAtIDEpKSB7XG4gICAgICAgICAgdGhpcy5jb25zb2xlLnNldFRleHQoR2x5cGguQ0hBUl9ITElORSwgaSwgaik7XG4gICAgICAgICAgZHJhd24gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkcmF3bikge1xuICAgICAgICAgIHRoaXMuY29uc29sZS5zZXRGb3JlZ3JvdW5kKDB4ZmZmZmZmLCBpLCBqKTtcbiAgICAgICAgICB0aGlzLmNvbnNvbGUuc2V0QmFja2dyb3VuZCgweDAwMDAwMCwgaSwgaik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmNvbnNvbGUucHJpbnQoJ1R1cm46ICcgKyB0aGlzLmN1cnJlbnRUdXJuLCB0aGlzLndpZHRoIC0gMTAsIDEsIDB4ZmZmZmZmKTtcbiAgICBpZiAodGhpcy5lZmZlY3RzLmxlbmd0aCA+IDApIHtcbiAgICAgIGxldCBzdHIgPSB0aGlzLmVmZmVjdHMucmVkdWNlKChhY2MsIGVmZmVjdCwgaWR4KSA9PiB7XG4gICAgICAgIHJldHVybiBhY2MgKyBlZmZlY3QubmFtZSArIChpZHggIT09IHRoaXMuZWZmZWN0cy5sZW5ndGggLSAxID8gJywgJyA6ICcnKTtcbiAgICAgIH0sICdFZmZlY3RzOiAnKTtcbiAgICAgIHRoaXMuY29uc29sZS5wcmludChzdHIsIDEsIDEsIDB4ZmZmZmZmKTtcbiAgICB9XG4gICAgaWYgKHRoaXMubWVzc2FnZXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5tZXNzYWdlcy5mb3JFYWNoKChkYXRhLCBpZHgpID0+IHtcbiAgICAgICAgbGV0IGNvbG9yID0gMHhmZmZmZmY7XG4gICAgICAgIGlmIChkYXRhLnR1cm4gPCB0aGlzLmN1cnJlbnRUdXJuIC0gNSkge1xuICAgICAgICAgIGNvbG9yID0gMHg2NjY2NjY7XG4gICAgICAgIH0gZWxzZSBpZiAoZGF0YS50dXJuIDwgdGhpcy5jdXJyZW50VHVybiAtIDIpIHtcbiAgICAgICAgICBjb2xvciA9IDB4YWFhYWFhO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29uc29sZS5wcmludChkYXRhLm1lc3NhZ2UsIDEsIHRoaXMuaGVpZ2h0IC0gKGlkeCArIDEpLCBjb2xvcik7XG4gICAgICB9KTtcbiAgICB9XG4gICAgYmxpdEZ1bmN0aW9uKHRoaXMuY29uc29sZSk7XG4gIH1cbn1cblxuZXhwb3J0ID0gTG9nVmlldztcbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcblxuaW1wb3J0IFRpbGUgPSByZXF1aXJlKCcuL1RpbGUnKTtcblxuY2xhc3MgTWFwIHtcbiAgcHJpdmF0ZSBfd2lkdGg7XG4gIGdldCB3aWR0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5fd2lkdGg7XG4gIH1cbiAgcHJpdmF0ZSBfaGVpZ2h0O1xuICBnZXQgaGVpZ2h0KCkge1xuICAgIHJldHVybiB0aGlzLl9oZWlnaHQ7XG4gIH1cbiAgcHVibGljIHRpbGVzOiBUaWxlW11bXTtcblxuICBjb25zdHJ1Y3Rvcih3OiBudW1iZXIsIGg6IG51bWJlcikge1xuICAgIHRoaXMuX3dpZHRoID0gdztcbiAgICB0aGlzLl9oZWlnaHQgPSBoO1xuICAgIHRoaXMudGlsZXMgPSBbXTtcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMuX3dpZHRoOyB4KyspIHtcbiAgICAgIHRoaXMudGlsZXNbeF0gPSBbXTtcbiAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5faGVpZ2h0OyB5KyspIHtcbiAgICAgICAgdGhpcy50aWxlc1t4XVt5XSA9IFRpbGUuY3JlYXRlVGlsZShUaWxlLkVNUFRZKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRUaWxlKHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uKTogVGlsZSB7XG4gICAgcmV0dXJuIHRoaXMudGlsZXNbcG9zaXRpb24ueF1bcG9zaXRpb24ueV07XG4gIH1cblxuICBzZXRUaWxlKHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uLCB0aWxlOiBUaWxlKSB7XG4gICAgdGhpcy50aWxlc1twb3NpdGlvbi54XVtwb3NpdGlvbi55XSA9IHRpbGU7XG4gIH1cblxuICBmb3JFYWNoKGNhbGxiYWNrOiAocG9zaXRpb246IENvcmUuUG9zaXRpb24sIHRpbGU6IFRpbGUpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuX2hlaWdodDsgeSsrKSB7XG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMuX3dpZHRoOyB4KyspIHtcbiAgICAgICAgY2FsbGJhY2sobmV3IENvcmUuUG9zaXRpb24oeCwgeSksIHRoaXMudGlsZXNbeF1beV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlzV2Fsa2FibGUocG9zaXRpb246IENvcmUuUG9zaXRpb24pOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy50aWxlc1twb3NpdGlvbi54XVtwb3NpdGlvbi55XS53YWxrYWJsZTtcbiAgfVxufVxuXG5leHBvcnQgPSBNYXA7XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4vY29yZSc7XG5pbXBvcnQgKiBhcyBHZW5lcmF0b3IgZnJvbSAnLi9tYXAnO1xuXG5pbXBvcnQgTWFwID0gcmVxdWlyZSgnLi9NYXAnKTtcbmltcG9ydCBUaWxlID0gcmVxdWlyZSgnLi9UaWxlJyk7XG5pbXBvcnQgR2x5cGggPSByZXF1aXJlKCcuL0dseXBoJyk7XG5cbmNsYXNzIE1hcEdlbmVyYXRvciB7XG4gIHByaXZhdGUgd2lkdGg6IG51bWJlcjtcbiAgcHJpdmF0ZSBoZWlnaHQ6IG51bWJlcjtcblxuICBwcml2YXRlIGJhY2tncm91bmRDb2xvcjogQ29yZS5Db2xvcjtcbiAgcHJpdmF0ZSBmb3JlZ3JvdW5kQ29sb3I6IENvcmUuQ29sb3I7XG5cbiAgY29uc3RydWN0b3Iod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9IDB4MDAwMDAwO1xuICAgIHRoaXMuZm9yZWdyb3VuZENvbG9yID0gMHhhYWFhYWE7XG4gIH1cblxuICBwcml2YXRlIGdlbmVyYXRlTWFwKCk6IG51bWJlcltdW10ge1xuICAgIGxldCBjZWxsczogbnVtYmVyW11bXSA9IENvcmUuVXRpbHMuYnVpbGRNYXRyaXgodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIDEpO1xuICAgIGxldCByb29tR2VuZXJhdG9yID0gbmV3IEdlbmVyYXRvci5Sb29tR2VuZXJhdG9yKGNlbGxzKTtcblxuICAgIHdoaWxlIChyb29tR2VuZXJhdG9yLml0ZXJhdGUoKSkge1xuICAgIH1cblxuICAgIGNlbGxzID0gcm9vbUdlbmVyYXRvci5nZXRNYXAoKTtcblxuICAgIGxldCBzdGFydFBvc2l0aW9uID0gR2VuZXJhdG9yLlV0aWxzLmZpbmRDYXJ2ZWFibGVTcG90KGNlbGxzKTtcbiAgICBsZXQgbWF6ZUdlbmVyYXRvciA9IG51bGw7XG5cbiAgICB3aGlsZSAoc3RhcnRQb3NpdGlvbiAhPT0gbnVsbCkge1xuICAgICAgbWF6ZUdlbmVyYXRvciA9IG5ldyBHZW5lcmF0b3IuTWF6ZVJlY3Vyc2l2ZUJhY2t0cmFja0dlbmVyYXRvcihjZWxscywgc3RhcnRQb3NpdGlvbik7XG4gICAgICB3aGlsZSAobWF6ZUdlbmVyYXRvci5pdGVyYXRlKCkpIHsgfVxuICAgICAgY2VsbHMgPSBtYXplR2VuZXJhdG9yLmdldE1hcCgpO1xuICAgICAgc3RhcnRQb3NpdGlvbiA9IEdlbmVyYXRvci5VdGlscy5maW5kQ2FydmVhYmxlU3BvdChjZWxscyk7XG4gICAgfVxuXG4gICAgY2VsbHMgPSBtYXplR2VuZXJhdG9yLmdldE1hcCgpO1xuXG4gICAgbGV0IHRvcG9sb2d5Q29tYmluYXRvciA9IG5ldyBHZW5lcmF0b3IuVG9wb2xvZ3lDb21iaW5hdG9yKGNlbGxzKTtcbiAgICB0b3BvbG9neUNvbWJpbmF0b3IuaW5pdGlhbGl6ZSgpO1xuICAgIGxldCByZW1haW5pbmdUb3BvbG9naWVzID0gdG9wb2xvZ3lDb21iaW5hdG9yLmNvbWJpbmUoKTtcbiAgICBpZiAocmVtYWluaW5nVG9wb2xvZ2llcyA+IDUpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdyZW1haW5pbmcgdG9wb2xvZ2llcycsIHJlbWFpbmluZ1RvcG9sb2dpZXMpO1xuICAgICAgcmV0dXJuIHRoaXMuZ2VuZXJhdGVNYXAoKTtcbiAgICB9XG4gICAgdG9wb2xvZ3lDb21iaW5hdG9yLnBydW5lRGVhZEVuZHMoKTtcblxuICAgIHJldHVybiB0b3BvbG9neUNvbWJpbmF0b3IuZ2V0TWFwKCk7XG4gIH1cblxuICBnZW5lcmF0ZSgpOiBNYXAge1xuICAgIGxldCBtYXAgPSBuZXcgTWFwKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICBsZXQgY2VsbHMgPSB0aGlzLmdlbmVyYXRlTWFwKCk7XG5cbiAgICBsZXQgdGlsZTogVGlsZTtcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgIGlmIChjZWxsc1t4XVt5XSA9PT0gMCkge1xuICAgICAgICAgIHRpbGUgPSBUaWxlLmNyZWF0ZVRpbGUoVGlsZS5GTE9PUik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGlsZSA9IFRpbGUuY3JlYXRlVGlsZShUaWxlLldBTEwpO1xuICAgICAgICAgIHRpbGUuZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9CTE9DSzMsIHRoaXMuZm9yZWdyb3VuZENvbG9yLCB0aGlzLmJhY2tncm91bmRDb2xvcik7XG4gICAgICAgIH1cbiAgICAgICAgbWFwLnNldFRpbGUobmV3IENvcmUuUG9zaXRpb24oeCwgeSksIHRpbGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtYXA7XG4gIH1cblxuICBwcml2YXRlIGdldFdhbGxHbHlwaCh4OiBudW1iZXIsIHk6IG51bWJlciwgY2VsbHM6IG51bWJlcltdW10pOiBHbHlwaCB7XG4gICAgbGV0IFcgPSAoeCA+IDAgJiYgY2VsbHNbeCAtIDFdW3ldID09PSAxKTtcbiAgICBsZXQgRSA9ICh4IDwgdGhpcy53aWR0aCAtIDEgJiYgY2VsbHNbeCArIDFdW3ldID09PSAxKTtcbiAgICBsZXQgTiA9ICh5ID4gMCAmJiBjZWxsc1t4XVt5IC0gMV0gPT09IDEpO1xuICAgIGxldCBTID0gKHkgPCB0aGlzLmhlaWdodCAtIDEgJiYgY2VsbHNbeF1beSArIDFdID09PSAxKTtcblxuICAgIGxldCBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX0NST1NTLCB0aGlzLmZvcmVncm91bmRDb2xvciwgdGhpcy5iYWNrZ3JvdW5kQ29sb3IpO1xuICAgIGlmIChXICYmIEUgJiYgUyAmJiBOKSB7XG4gICAgICBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX0NST1NTLCB0aGlzLmZvcmVncm91bmRDb2xvciwgdGhpcy5iYWNrZ3JvdW5kQ29sb3IpO1xuICAgIH0gZWxzZSBpZiAoKFcgfHwgRSkgJiYgIVMgJiYgIU4pIHtcbiAgICAgIGdseXBoID0gbmV3IEdseXBoKEdseXBoLkNIQVJfSExJTkUsIHRoaXMuZm9yZWdyb3VuZENvbG9yLCB0aGlzLmJhY2tncm91bmRDb2xvcik7XG4gICAgfSBlbHNlIGlmICgoUyB8fCBOKSAmJiAhVyAmJiAhRSkge1xuICAgICAgZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9WTElORSwgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9IGVsc2UgaWYgKFMgJiYgRSAmJiAhVyAmJiAhTikge1xuICAgICAgZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9TRSwgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9IGVsc2UgaWYgKFMgJiYgVyAmJiAhRSAmJiAhTikge1xuICAgICAgZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9TVywgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9IGVsc2UgaWYgKE4gJiYgRSAmJiAhVyAmJiAhUykge1xuICAgICAgZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9ORSwgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9IGVsc2UgaWYgKE4gJiYgVyAmJiAhRSAmJiAhUykge1xuICAgICAgZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9OVywgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9IGVsc2UgaWYgKE4gJiYgVyAmJiBFICYmICFTKSB7XG4gICAgICBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX1RFRU4sIHRoaXMuZm9yZWdyb3VuZENvbG9yLCB0aGlzLmJhY2tncm91bmRDb2xvcik7XG4gICAgfSBlbHNlIGlmIChTICYmIFcgJiYgRSAmJiAhTikge1xuICAgICAgZ2x5cGggPSBuZXcgR2x5cGgoR2x5cGguQ0hBUl9URUVTLCB0aGlzLmZvcmVncm91bmRDb2xvciwgdGhpcy5iYWNrZ3JvdW5kQ29sb3IpO1xuICAgIH0gZWxzZSBpZiAoTiAmJiBTICYmIEUgJiYgIVcpIHtcbiAgICAgIGdseXBoID0gbmV3IEdseXBoKEdseXBoLkNIQVJfVEVFRSwgdGhpcy5mb3JlZ3JvdW5kQ29sb3IsIHRoaXMuYmFja2dyb3VuZENvbG9yKTtcbiAgICB9IGVsc2UgaWYgKE4gJiYgUyAmJiBXICYmICFFKSB7XG4gICAgICBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX1RFRVcsIHRoaXMuZm9yZWdyb3VuZENvbG9yLCB0aGlzLmJhY2tncm91bmRDb2xvcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdseXBoO1xuICB9XG59XG5cbmV4cG9ydCA9IE1hcEdlbmVyYXRvcjtcbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi9jb3JlJztcbmltcG9ydCAqIGFzIEdlbmVyYXRvciBmcm9tICcuL21hcCc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vY29tcG9uZW50cyc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuL2VudGl0aWVzJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuL2V2ZW50cyc7XG5cbmltcG9ydCBHbHlwaCA9IHJlcXVpcmUoJy4vR2x5cGgnKTtcbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuL0VuZ2luZScpO1xuaW1wb3J0IENvbnNvbGUgPSByZXF1aXJlKCcuL0NvbnNvbGUnKTtcbmltcG9ydCBNYXAgPSByZXF1aXJlKCcuL01hcCcpO1xuaW1wb3J0IFRpbGUgPSByZXF1aXJlKCcuL1RpbGUnKTtcblxuY2xhc3MgTWFwVmlldyB7XG4gIHByaXZhdGUgcmVuZGVyYWJsZUVudGl0aWVzOiAoe2d1aWQ6IHN0cmluZywgcmVuZGVyYWJsZTogQ29tcG9uZW50cy5SZW5kZXJhYmxlQ29tcG9uZW50LCBwaHlzaWNzOiBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnR9KVtdO1xuICBwcml2YXRlIHJlbmRlcmFibGVJdGVtczogKHtndWlkOiBzdHJpbmcsIHJlbmRlcmFibGU6IENvbXBvbmVudHMuUmVuZGVyYWJsZUNvbXBvbmVudCwgcGh5c2ljczogQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50fSlbXTtcbiAgcHJpdmF0ZSBjb25zb2xlOiBDb25zb2xlO1xuXG4gIHByaXZhdGUgdmlld0VudGl0eTogRW50aXRpZXMuRW50aXR5O1xuXG4gIHByaXZhdGUgbGlnaHRNYXA6IG51bWJlcltdW107XG4gIHByaXZhdGUgZm92Q2FsY3VsYXRvcjogR2VuZXJhdG9yLkZvVjtcblxuICBwcml2YXRlIGhhc1NlZW46IGJvb2xlYW5bXVtdO1xuXG4gIHByaXZhdGUgZm9nT2ZXYXJDb2xvcjogQ29yZS5Db2xvcjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVuZ2luZTogRW5naW5lLCBwcml2YXRlIG1hcDogTWFwLCBwcml2YXRlIHdpZHRoOiBudW1iZXIsIHByaXZhdGUgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICB0aGlzLmZvZ09mV2FyQ29sb3IgPSAweDk5OTlhYTtcbiAgICB0aGlzLnJlZ2lzdGVyTGlzdGVuZXJzKCk7XG4gICAgdGhpcy5jb25zb2xlID0gbmV3IENvbnNvbGUodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgIHRoaXMucmVuZGVyYWJsZUVudGl0aWVzID0gW107XG4gICAgdGhpcy5yZW5kZXJhYmxlSXRlbXMgPSBbXTtcbiAgICB0aGlzLnZpZXdFbnRpdHkgPSBudWxsO1xuICAgIHRoaXMuZm92Q2FsY3VsYXRvciA9IG51bGw7XG4gICAgdGhpcy5saWdodE1hcCA9IENvcmUuVXRpbHMuYnVpbGRNYXRyaXg8bnVtYmVyPih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgMCk7XG4gICAgdGhpcy5oYXNTZWVuID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeDxib29sZWFuPih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgZmFsc2UpO1xuICB9XG5cbiAgc2V0Vmlld0VudGl0eShlbnRpdHk6IEVudGl0aWVzLkVudGl0eSkge1xuICAgIHRoaXMuaGFzU2VlbiA9IENvcmUuVXRpbHMuYnVpbGRNYXRyaXg8Ym9vbGVhbj4odGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIGZhbHNlKTtcblxuICAgIHRoaXMudmlld0VudGl0eSA9IGVudGl0eTtcbiAgICB0aGlzLnZpZXdFbnRpdHkubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAnbW92ZScsXG4gICAgICB0aGlzLm9uVmlld0VudGl0eU1vdmUuYmluZCh0aGlzKVxuICAgICkpO1xuXG4gICAgdGhpcy5mb3ZDYWxjdWxhdG9yID0gbmV3IEdlbmVyYXRvci5Gb1YoXG4gICAgICAocG9zOiBDb3JlLlBvc2l0aW9uKSA9PiB7XG4gICAgICAgIGxldCB0aWxlID0gdGhpcy5tYXAuZ2V0VGlsZShwb3MpO1xuICAgICAgICByZXR1cm4gIXRpbGUuYmxvY2tzU2lnaHQ7ICBcbiAgICAgIH0sXG4gICAgICB0aGlzLm1hcC53aWR0aCxcbiAgICAgIHRoaXMubWFwLmhlaWdodCxcbiAgICAgIDIwIFxuICAgICk7XG5cbiAgICB0aGlzLm9uVmlld0VudGl0eU1vdmUobnVsbCk7XG4gIH1cblxuICBwcml2YXRlIG9uVmlld0VudGl0eU1vdmUoZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGxldCBwb3M6IENvcmUuUG9zaXRpb24gPSAoPENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudD50aGlzLnZpZXdFbnRpdHkuZ2V0Q29tcG9uZW50KENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCkpLnBvc2l0aW9uO1xuXG4gICAgdGhpcy5saWdodE1hcCA9IHRoaXMuZm92Q2FsY3VsYXRvci5jYWxjdWxhdGUocG9zKTtcblxuICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgaWYgKHRoaXMubGlnaHRNYXBbeF1beV0gPiAwKSB7XG4gICAgICAgICAgdGhpcy5oYXNTZWVuW3hdW3ldID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAncmVuZGVyYWJsZUNvbXBvbmVudENyZWF0ZWQnLFxuICAgICAgdGhpcy5vblJlbmRlcmFibGVDb21wb25lbnRDcmVhdGVkLmJpbmQodGhpcylcbiAgICApKTtcbiAgICB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdyZW5kZXJhYmxlQ29tcG9uZW50RGVzdHJveWVkJyxcbiAgICAgIHRoaXMub25SZW5kZXJhYmxlQ29tcG9uZW50RGVzdHJveWVkLmJpbmQodGhpcylcbiAgICApKTtcbiAgfVxuXG4gIHByaXZhdGUgb25SZW5kZXJhYmxlQ29tcG9uZW50RGVzdHJveWVkKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBjb25zdCBwaHlzaWNzID0gPENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudD5ldmVudC5kYXRhLmVudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KTtcbiAgICBsZXQgaWR4ID0gbnVsbDtcblxuICAgIGlmIChwaHlzaWNzLmJsb2NraW5nKSB7XG4gICAgICBpZHggPSB0aGlzLnJlbmRlcmFibGVFbnRpdGllcy5maW5kSW5kZXgoKGVudGl0eSkgPT4ge1xuICAgICAgICByZXR1cm4gZW50aXR5Lmd1aWQgPT09IGV2ZW50LmRhdGEuZW50aXR5Lmd1aWQ7XG4gICAgICB9KTtcbiAgICAgIGlmIChpZHggIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJhYmxlRW50aXRpZXMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlkeCA9IHRoaXMucmVuZGVyYWJsZUl0ZW1zLmZpbmRJbmRleCgoZW50aXR5KSA9PiB7XG4gICAgICAgIHJldHVybiBlbnRpdHkuZ3VpZCA9PT0gZXZlbnQuZGF0YS5lbnRpdHkuZ3VpZDtcbiAgICAgIH0pO1xuICAgICAgaWYgKGlkeCAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnJlbmRlcmFibGVJdGVtcy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uUmVuZGVyYWJsZUNvbXBvbmVudENyZWF0ZWQoZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGNvbnN0IHBoeXNpY3MgPSA8Q29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50PmV2ZW50LmRhdGEuZW50aXR5LmdldENvbXBvbmVudChDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQpO1xuXG4gICAgaWYgKHBoeXNpY3MuYmxvY2tpbmcpIHtcbiAgICAgIHRoaXMucmVuZGVyYWJsZUVudGl0aWVzLnB1c2goe1xuICAgICAgICBndWlkOiBldmVudC5kYXRhLmVudGl0eS5ndWlkLFxuICAgICAgICByZW5kZXJhYmxlOiBldmVudC5kYXRhLnJlbmRlcmFibGVDb21wb25lbnQsXG4gICAgICAgIHBoeXNpY3M6IHBoeXNpY3NcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlbmRlcmFibGVJdGVtcy5wdXNoKHtcbiAgICAgICAgZ3VpZDogZXZlbnQuZGF0YS5lbnRpdHkuZ3VpZCxcbiAgICAgICAgcmVuZGVyYWJsZTogZXZlbnQuZGF0YS5yZW5kZXJhYmxlQ29tcG9uZW50LFxuICAgICAgICBwaHlzaWNzOiBwaHlzaWNzXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoYmxpdEZ1bmN0aW9uOiBhbnkpIHtcbiAgICB0aGlzLnJlbmRlck1hcCh0aGlzLmNvbnNvbGUpO1xuICAgIGJsaXRGdW5jdGlvbih0aGlzLmNvbnNvbGUpO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJNYXAoY29uc29sZTogQ29uc29sZSkge1xuICAgIGlmICh0aGlzLnZpZXdFbnRpdHkgPT09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5yZW5kZXJCYWNrZ3JvdW5kKGNvbnNvbGUpO1xuICAgIHRoaXMucmVuZGVySXRlbXMoY29uc29sZSk7XG4gICAgdGhpcy5yZW5kZXJFbnRpdGllcyhjb25zb2xlKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVuZGVyRW50aXRpZXMoY29uc29sZTogQ29uc29sZSkge1xuICAgIHRoaXMucmVuZGVyYWJsZUVudGl0aWVzLmZvckVhY2goKGRhdGEpID0+IHtcbiAgICAgIGlmIChkYXRhLnJlbmRlcmFibGUgJiYgZGF0YS5waHlzaWNzKSB7XG4gICAgICAgIHRoaXMucmVuZGVyR2x5cGgoY29uc29sZSwgZGF0YS5yZW5kZXJhYmxlLmdseXBoLCBkYXRhLnBoeXNpY3MucG9zaXRpb24pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJJdGVtcyhjb25zb2xlOiBDb25zb2xlKSB7XG4gICAgdGhpcy5yZW5kZXJhYmxlSXRlbXMuZm9yRWFjaCgoZGF0YSkgPT4ge1xuICAgICAgaWYgKGRhdGEucmVuZGVyYWJsZSAmJiBkYXRhLnBoeXNpY3MpIHtcbiAgICAgICAgdGhpcy5yZW5kZXJHbHlwaChjb25zb2xlLCBkYXRhLnJlbmRlcmFibGUuZ2x5cGgsIGRhdGEucGh5c2ljcy5wb3NpdGlvbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHJlbmRlckdseXBoKGNvbnNvbGU6IENvbnNvbGUsIGdseXBoOiBHbHlwaCwgcG9zaXRpb246IENvcmUuUG9zaXRpb24pIHtcbiAgICBpZiAoIXRoaXMuaXNWaXNpYmxlKHBvc2l0aW9uKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zb2xlLnNldFRleHQoZ2x5cGguZ2x5cGgsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xuICAgIGNvbnNvbGUuc2V0Rm9yZWdyb3VuZChnbHlwaC5mb3JlZ3JvdW5kQ29sb3IsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xuICB9XG5cbiAgcHJpdmF0ZSByZW5kZXJCYWNrZ3JvdW5kKGNvbnNvbGU6IENvbnNvbGUpIHtcbiAgICB0aGlzLm1hcC5mb3JFYWNoKChwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbiwgdGlsZTogVGlsZSkgPT4ge1xuICAgICAgbGV0IGdseXBoID0gdGlsZS5nbHlwaDtcbiAgICAgIGlmICghdGhpcy5pc1Zpc2libGUocG9zaXRpb24pKSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1NlZW5bcG9zaXRpb24ueF1bcG9zaXRpb24ueV0pIHtcbiAgICAgICAgICBnbHlwaCA9IG5ldyBHbHlwaChcbiAgICAgICAgICAgIGdseXBoLmdseXBoLFxuICAgICAgICAgICAgQ29yZS5Db2xvclV0aWxzLmNvbG9yTXVsdGlwbHkoZ2x5cGguZm9yZWdyb3VuZENvbG9yLCB0aGlzLmZvZ09mV2FyQ29sb3IpLFxuICAgICAgICAgICAgQ29yZS5Db2xvclV0aWxzLmNvbG9yTXVsdGlwbHkoZ2x5cGguYmFja2dyb3VuZENvbG9yLCB0aGlzLmZvZ09mV2FyQ29sb3IpXG4gICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBnbHlwaCA9IG5ldyBHbHlwaChHbHlwaC5DSEFSX0ZVTEwsIDB4MTExMTExLCAweDExMTExMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnNvbGUuc2V0VGV4dChnbHlwaC5nbHlwaCwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XG4gICAgICBjb25zb2xlLnNldEZvcmVncm91bmQoZ2x5cGguZm9yZWdyb3VuZENvbG9yLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcbiAgICAgIGNvbnNvbGUuc2V0QmFja2dyb3VuZChnbHlwaC5iYWNrZ3JvdW5kQ29sb3IsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBpc1Zpc2libGUocG9zaXRpb246IENvcmUuUG9zaXRpb24pIHtcbiAgICByZXR1cm4gdGhpcy5saWdodE1hcFtwb3NpdGlvbi54XVtwb3NpdGlvbi55XSA9PT0gMTtcbiAgfVxufVxuXG5leHBvcnQgPSBNYXBWaWV3O1xuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD0nLi4vdHlwaW5ncy9pbmRleC5kLnRzJyAvPlxuXG5pbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4vY29yZSc7XG5cbmltcG9ydCBHbHlwaCA9IHJlcXVpcmUoJy4vR2x5cGgnKTtcbmltcG9ydCBDb25zb2xlID0gcmVxdWlyZSgnLi9Db25zb2xlJyk7XG5cbmNsYXNzIFBpeGlDb25zb2xlIHtcbiAgcHJpdmF0ZSBfd2lkdGg6IG51bWJlcjtcbiAgcHJpdmF0ZSBfaGVpZ2h0OiBudW1iZXI7XG5cbiAgcHJpdmF0ZSBjYW52YXNJZDogc3RyaW5nO1xuICBwcml2YXRlIHRleHQ6IG51bWJlcltdW107XG4gIHByaXZhdGUgZm9yZTogQ29yZS5Db2xvcltdW107XG4gIHByaXZhdGUgYmFjazogQ29yZS5Db2xvcltdW107XG4gIHByaXZhdGUgaXNEaXJ0eTogYm9vbGVhbltdW107XG5cbiAgcHJpdmF0ZSByZW5kZXJlcjogYW55O1xuICBwcml2YXRlIHN0YWdlOiBQSVhJLkNvbnRhaW5lcjtcblxuICBwcml2YXRlIGxvYWRlZDogYm9vbGVhbjtcblxuICBwcml2YXRlIGNoYXJXaWR0aDogbnVtYmVyO1xuICBwcml2YXRlIGNoYXJIZWlnaHQ6IG51bWJlcjtcblxuICBwcml2YXRlIGZvbnQ6IFBJWEkuQmFzZVRleHR1cmU7XG4gIHByaXZhdGUgY2hhcnM6IFBJWEkuVGV4dHVyZVtdO1xuXG4gIHByaXZhdGUgZm9yZUNlbGxzOiBQSVhJLlNwcml0ZVtdW107XG4gIHByaXZhdGUgYmFja0NlbGxzOiBQSVhJLlNwcml0ZVtdW107XG5cbiAgcHJpdmF0ZSBkZWZhdWx0QmFja2dyb3VuZDogQ29yZS5Db2xvcjtcbiAgcHJpdmF0ZSBkZWZhdWx0Rm9yZWdyb3VuZDogQ29yZS5Db2xvcjtcblxuICBwcml2YXRlIGNhbnZhczogYW55O1xuICBwcml2YXRlIHRvcExlZnRQb3NpdGlvbjogQ29yZS5Qb3NpdGlvbjtcblxuICBjb25zdHJ1Y3Rvcih3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgY2FudmFzSWQ6IHN0cmluZywgZm9yZWdyb3VuZDogQ29yZS5Db2xvciA9IDB4ZmZmZmZmLCBiYWNrZ3JvdW5kOiBDb3JlLkNvbG9yID0gMHgwMDAwMDApIHtcbiAgICB0aGlzLl93aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuX2hlaWdodCA9IGhlaWdodDtcblxuICAgIHRoaXMuY2FudmFzSWQgPSBjYW52YXNJZDtcblxuICAgIHRoaXMubG9hZGVkID0gZmFsc2U7XG4gICAgdGhpcy5zdGFnZSA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xuXG4gICAgdGhpcy5sb2FkRm9udCgpO1xuICAgIHRoaXMuZGVmYXVsdEJhY2tncm91bmQgPSAweDAwMDAwO1xuICAgIHRoaXMuZGVmYXVsdEZvcmVncm91bmQgPSAweGZmZmZmO1xuXG4gICAgdGhpcy50ZXh0ID0gQ29yZS5VdGlscy5idWlsZE1hdHJpeDxudW1iZXI+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCBHbHlwaC5DSEFSX1NQQUNFKTtcbiAgICB0aGlzLmZvcmUgPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4PENvcmUuQ29sb3I+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0aGlzLmRlZmF1bHRGb3JlZ3JvdW5kKTtcbiAgICB0aGlzLmJhY2sgPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4PENvcmUuQ29sb3I+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0aGlzLmRlZmF1bHRCYWNrZ3JvdW5kKTtcbiAgICB0aGlzLmlzRGlydHkgPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4PGJvb2xlYW4+KHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0cnVlKTtcbiAgfVxuXG4gIGdldCBoZWlnaHQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5faGVpZ2h0O1xuICB9XG5cbiAgZ2V0IHdpZHRoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3dpZHRoO1xuICB9XG5cbiAgcHJpdmF0ZSBsb2FkRm9udCgpIHtcbiAgICBsZXQgZm9udFVybCA9ICcuL1RhbHJ5dGhfc3F1YXJlXzE1eDE1LnBuZyc7XG4gICAgdGhpcy5mb250ID0gUElYSS5CYXNlVGV4dHVyZS5mcm9tSW1hZ2UoZm9udFVybCwgZmFsc2UsIFBJWEkuU0NBTEVfTU9ERVMuTkVBUkVTVCk7XG4gICAgaWYgKHRoaXMuZm9udC5oYXNMb2FkZWQpIHtcbiAgICAgIHRoaXMub25Gb250TG9hZGVkKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZm9udC5vbignbG9hZGVkJywgdGhpcy5vbkZvbnRMb2FkZWQuYmluZCh0aGlzKSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBvbkZvbnRMb2FkZWQoKSB7XG4gICAgdGhpcy5jaGFyV2lkdGggPSB0aGlzLmZvbnQud2lkdGggLyAxNjtcbiAgICB0aGlzLmNoYXJIZWlnaHQgPSB0aGlzLmZvbnQuaGVpZ2h0IC8gMTY7XG5cbiAgICB0aGlzLmluaXRDYW52YXMoKTtcbiAgICB0aGlzLmluaXRDaGFyYWN0ZXJNYXAoKTtcbiAgICB0aGlzLmluaXRCYWNrZ3JvdW5kQ2VsbHMoKTtcbiAgICB0aGlzLmluaXRGb3JlZ3JvdW5kQ2VsbHMoKTtcbiAgICB0aGlzLmxvYWRlZCA9IHRydWU7XG4gIH1cblxuICBwcml2YXRlIGluaXRDYW52YXMoKSB7XG4gICAgbGV0IGNhbnZhc1dpZHRoID0gdGhpcy53aWR0aCAqIHRoaXMuY2hhcldpZHRoO1xuICAgIGxldCBjYW52YXNIZWlnaHQgPSB0aGlzLmhlaWdodCAqIHRoaXMuY2hhckhlaWdodDtcblxuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5jYW52YXNJZCk7XG5cbiAgICBsZXQgcGl4aU9wdGlvbnMgPSB7XG4gICAgICBhbnRpYWxpYXM6IGZhbHNlLFxuICAgICAgY2xlYXJCZWZvcmVSZW5kZXI6IGZhbHNlLFxuICAgICAgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiBmYWxzZSxcbiAgICAgIHJlc29sdXRpb246IDEsXG4gICAgICB0cmFuc3BhcmVudDogZmFsc2UsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6IENvcmUuQ29sb3JVdGlscy50b051bWJlcih0aGlzLmRlZmF1bHRCYWNrZ3JvdW5kKSxcbiAgICAgIHZpZXc6IHRoaXMuY2FudmFzXG4gICAgfTtcbiAgICB0aGlzLnJlbmRlcmVyID0gUElYSS5hdXRvRGV0ZWN0UmVuZGVyZXIoY2FudmFzV2lkdGgsIGNhbnZhc0hlaWdodCwgcGl4aU9wdGlvbnMpO1xuICAgIHRoaXMucmVuZGVyZXIuYmFja2dyb3VuZENvbG9yID0gQ29yZS5Db2xvclV0aWxzLnRvTnVtYmVyKHRoaXMuZGVmYXVsdEJhY2tncm91bmQpO1xuICAgIHRoaXMudG9wTGVmdFBvc2l0aW9uID0gbmV3IENvcmUuUG9zaXRpb24odGhpcy5jYW52YXMub2Zmc2V0TGVmdCwgdGhpcy5jYW52YXMub2Zmc2V0VG9wKTtcbiAgfVxuXG4gIHByaXZhdGUgaW5pdENoYXJhY3Rlck1hcCgpIHtcbiAgICB0aGlzLmNoYXJzID0gW107XG4gICAgZm9yICggbGV0IHggPSAwOyB4IDwgMTY7IHgrKykge1xuICAgICAgZm9yICggbGV0IHkgPSAwOyB5IDwgMTY7IHkrKykge1xuICAgICAgICBsZXQgcmVjdCA9IG5ldyBQSVhJLlJlY3RhbmdsZSh4ICogdGhpcy5jaGFyV2lkdGgsIHkgKiB0aGlzLmNoYXJIZWlnaHQsIHRoaXMuY2hhcldpZHRoLCB0aGlzLmNoYXJIZWlnaHQpO1xuICAgICAgICB0aGlzLmNoYXJzW3ggKyB5ICogMTZdID0gbmV3IFBJWEkuVGV4dHVyZSh0aGlzLmZvbnQsIHJlY3QpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgaW5pdEJhY2tncm91bmRDZWxscygpIHtcbiAgICB0aGlzLmJhY2tDZWxscyA9IFtdO1xuICAgIGZvciAoIGxldCB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgdGhpcy5iYWNrQ2VsbHNbeF0gPSBbXTtcbiAgICAgIGZvciAoIGxldCB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgbGV0IGNlbGwgPSBuZXcgUElYSS5TcHJpdGUodGhpcy5jaGFyc1tHbHlwaC5DSEFSX0ZVTExdKTtcbiAgICAgICAgY2VsbC5wb3NpdGlvbi54ID0geCAqIHRoaXMuY2hhcldpZHRoO1xuICAgICAgICBjZWxsLnBvc2l0aW9uLnkgPSB5ICogdGhpcy5jaGFySGVpZ2h0O1xuICAgICAgICBjZWxsLndpZHRoID0gdGhpcy5jaGFyV2lkdGg7XG4gICAgICAgIGNlbGwuaGVpZ2h0ID0gdGhpcy5jaGFySGVpZ2h0O1xuICAgICAgICBjZWxsLnRpbnQgPSBDb3JlLkNvbG9yVXRpbHMudG9OdW1iZXIodGhpcy5kZWZhdWx0QmFja2dyb3VuZCk7XG4gICAgICAgIHRoaXMuYmFja0NlbGxzW3hdW3ldID0gY2VsbDtcbiAgICAgICAgdGhpcy5zdGFnZS5hZGRDaGlsZChjZWxsKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGluaXRGb3JlZ3JvdW5kQ2VsbHMoKSB7XG4gICAgdGhpcy5mb3JlQ2VsbHMgPSBbXTtcbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgdGhpcy5mb3JlQ2VsbHNbeF0gPSBbXTtcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICBsZXQgY2VsbCA9IG5ldyBQSVhJLlNwcml0ZSh0aGlzLmNoYXJzW0dseXBoLkNIQVJfU1BBQ0VdKTtcbiAgICAgICAgY2VsbC5wb3NpdGlvbi54ID0geCAqIHRoaXMuY2hhcldpZHRoO1xuICAgICAgICBjZWxsLnBvc2l0aW9uLnkgPSB5ICogdGhpcy5jaGFySGVpZ2h0O1xuICAgICAgICBjZWxsLndpZHRoID0gdGhpcy5jaGFyV2lkdGg7XG4gICAgICAgIGNlbGwuaGVpZ2h0ID0gdGhpcy5jaGFySGVpZ2h0O1xuICAgICAgICBjZWxsLnRpbnQgPSBDb3JlLkNvbG9yVXRpbHMudG9OdW1iZXIodGhpcy5kZWZhdWx0Rm9yZWdyb3VuZCk7XG4gICAgICAgIHRoaXMuZm9yZUNlbGxzW3hdW3ldID0gY2VsbDtcbiAgICAgICAgdGhpcy5zdGFnZS5hZGRDaGlsZChjZWxsKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhZGRHcmlkT3ZlcmxheSh4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHdpZHRoOyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgaGVpZ2h0OyBqKyspIHtcbiAgICAgICAgbGV0IGNlbGwgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgICAgICBjZWxsLmxpbmVTdHlsZSgxLCAweDQ0NDQ0NCwgMC41KTtcbiAgICAgICAgY2VsbC5iZWdpbkZpbGwoMCwgMCk7XG4gICAgICAgIGNlbGwuZHJhd1JlY3QoKGkgKyB4KSAqIHRoaXMuY2hhcldpZHRoLCAoaiArIHkpICogdGhpcy5jaGFySGVpZ2h0LCB0aGlzLmNoYXJXaWR0aCwgdGhpcy5jaGFySGVpZ2h0KTtcbiAgICAgICAgdGhpcy5zdGFnZS5hZGRDaGlsZChjZWxsKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhZGRCb3JkZXIoeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgbGV0IGNlbGwgPSBuZXcgUElYSS5HcmFwaGljcygpO1xuICAgIGNlbGwubGluZVN0eWxlKDEsIDB4NDQ0NDQ0LCAwLjUpO1xuICAgIGNlbGwuYmVnaW5GaWxsKDAsIDApO1xuICAgIGNlbGwuZHJhd1JlY3QoeCAqIHRoaXMuY2hhcldpZHRoLCB5ICogdGhpcy5jaGFySGVpZ2h0LCB4ICogd2lkdGggKiB0aGlzLmNoYXJXaWR0aCwgeSAqIGhlaWdodCAqIHRoaXMuY2hhckhlaWdodCk7XG4gICAgdGhpcy5zdGFnZS5hZGRDaGlsZChjZWxsKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBpZiAodGhpcy5sb2FkZWQpIHtcbiAgICAgIHRoaXMucmVuZGVyZXIucmVuZGVyKHRoaXMuc3RhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIGJsaXQoY29uc29sZTogQ29uc29sZSwgb2Zmc2V0WDogbnVtYmVyID0gMCwgb2Zmc2V0WTogbnVtYmVyID0gMCwgZm9yY2VEaXJ0eTogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgaWYgKCF0aGlzLmxvYWRlZCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBmb3IgKGxldCB4ID0gMDsgeCA8IGNvbnNvbGUud2lkdGg7IHgrKykge1xuICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCBjb25zb2xlLmhlaWdodDsgeSsrKSB7XG4gICAgICAgIGlmIChmb3JjZURpcnR5IHx8IGNvbnNvbGUuaXNEaXJ0eVt4XVt5XSkge1xuICAgICAgICAgIGxldCBhc2NpaSA9IGNvbnNvbGUudGV4dFt4XVt5XTtcbiAgICAgICAgICBsZXQgcHggPSBvZmZzZXRYICsgeDtcbiAgICAgICAgICBsZXQgcHkgPSBvZmZzZXRZICsgeTtcbiAgICAgICAgICBpZiAoYXNjaWkgPiAwICYmIGFzY2lpIDw9IDI1NSkge1xuICAgICAgICAgICAgdGhpcy5mb3JlQ2VsbHNbcHhdW3B5XS50ZXh0dXJlID0gdGhpcy5jaGFyc1thc2NpaV07XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuZm9yZUNlbGxzW3B4XVtweV0udGludCA9IENvcmUuQ29sb3JVdGlscy50b051bWJlcihjb25zb2xlLmZvcmVbeF1beV0pO1xuICAgICAgICAgIHRoaXMuYmFja0NlbGxzW3B4XVtweV0udGludCA9IENvcmUuQ29sb3JVdGlscy50b051bWJlcihjb25zb2xlLmJhY2tbeF1beV0pO1xuICAgICAgICAgIGNvbnNvbGUuY2xlYW5DZWxsKHgsIHkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0UG9zaXRpb25Gcm9tUGl4ZWxzKHg6IG51bWJlciwgeTogbnVtYmVyKSA6IENvcmUuUG9zaXRpb24ge1xuICAgIGlmICghdGhpcy5sb2FkZWQpIHtcbiAgICAgIHJldHVybiBuZXcgQ29yZS5Qb3NpdGlvbigtMSwgLTEpO1xuICAgIH0gXG4gICAgbGV0IGR4OiBudW1iZXIgPSB4IC0gdGhpcy50b3BMZWZ0UG9zaXRpb24ueDtcbiAgICBsZXQgZHk6IG51bWJlciA9IHkgLSB0aGlzLnRvcExlZnRQb3NpdGlvbi55O1xuICAgIGxldCByeCA9IE1hdGguZmxvb3IoZHggLyB0aGlzLmNoYXJXaWR0aCk7XG4gICAgbGV0IHJ5ID0gTWF0aC5mbG9vcihkeSAvIHRoaXMuY2hhckhlaWdodCk7XG4gICAgcmV0dXJuIG5ldyBDb3JlLlBvc2l0aW9uKHJ4LCByeSk7XG4gIH1cbn1cblxuZXhwb3J0ID0gUGl4aUNvbnNvbGU7XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4vY29yZSc7XG5pbXBvcnQgKiBhcyBHZW5lcmF0b3IgZnJvbSAnLi9tYXAnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9jb21wb25lbnRzJztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4vZW50aXRpZXMnO1xuaW1wb3J0ICogYXMgRXhjZXB0aW9ucyBmcm9tICcuL0V4Y2VwdGlvbnMnO1xuXG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi9FbmdpbmUnKTtcbmltcG9ydCBDb25zb2xlID0gcmVxdWlyZSgnLi9Db25zb2xlJyk7XG5pbXBvcnQgTWFwR2VuZXJhdG9yID0gcmVxdWlyZSgnLi9NYXBHZW5lcmF0b3InKTtcbmltcG9ydCBNYXAgPSByZXF1aXJlKCcuL01hcCcpO1xuaW1wb3J0IFRpbGUgPSByZXF1aXJlKCcuL1RpbGUnKTtcbmltcG9ydCBHbHlwaCA9IHJlcXVpcmUoJy4vR2x5cGgnKTtcblxuaW1wb3J0IE1hcFZpZXcgPSByZXF1aXJlKCcuL01hcFZpZXcnKTtcbmltcG9ydCBMb2dWaWV3ID0gcmVxdWlyZSgnLi9Mb2dWaWV3Jyk7XG5cbmNsYXNzIFNjZW5lIHtcbiAgcHJpdmF0ZSBfZW5naW5lOiBFbmdpbmU7XG4gIGdldCBlbmdpbmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2VuZ2luZTtcbiAgfVxuXG4gIHByaXZhdGUgX21hcDogTWFwO1xuICBnZXQgbWFwKCkge1xuICAgIHJldHVybiB0aGlzLl9tYXA7XG4gIH1cblxuICBwcml2YXRlIHdpZHRoOiBudW1iZXI7XG4gIHByaXZhdGUgaGVpZ2h0OiBudW1iZXI7XG5cbiAgcHJpdmF0ZSBsb2dWaWV3OiBMb2dWaWV3O1xuICBwcml2YXRlIG1hcFZpZXc6IE1hcFZpZXc7XG5cbiAgcHJpdmF0ZSBwbGF5ZXI6IEVudGl0aWVzLkVudGl0eTtcblxuICBjb25zdHJ1Y3RvcihlbmdpbmU6IEVuZ2luZSwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICB0aGlzLl9lbmdpbmUgPSBlbmdpbmU7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gIH1cblxuICBzdGFydCgpIHtcbiAgICBDb3JlLlBvc2l0aW9uLnNldE1heFZhbHVlcyh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCAtIDUpO1xuICAgIGxldCBtYXBHZW5lcmF0b3IgPSBuZXcgTWFwR2VuZXJhdG9yKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0IC0gNSk7XG4gICAgdGhpcy5fbWFwID0gbWFwR2VuZXJhdG9yLmdlbmVyYXRlKCk7XG5cbiAgICB0aGlzLnJlZ2lzdGVyTGlzdGVuZXJzKCk7XG5cbiAgICB0aGlzLm1hcFZpZXcgPSBuZXcgTWFwVmlldyh0aGlzLmVuZ2luZSwgdGhpcy5tYXAsIHRoaXMubWFwLndpZHRoLCB0aGlzLm1hcC5oZWlnaHQpO1xuXG4gICAgdGhpcy5nZW5lcmF0ZVdpbHkoKTtcbiAgICB0aGlzLmdlbmVyYXRlUmF0cygpO1xuXG4gICAgdGhpcy5sb2dWaWV3ID0gbmV3IExvZ1ZpZXcodGhpcy5lbmdpbmUsIHRoaXMud2lkdGgsIDUsIHRoaXMucGxheWVyKTtcblxuICAgIHRoaXMubWFwVmlldy5zZXRWaWV3RW50aXR5KHRoaXMucGxheWVyKTtcblxuICB9XG5cbiAgcHJpdmF0ZSBnZW5lcmF0ZVdpbHkoKSB7XG4gICAgdGhpcy5wbGF5ZXIgPSBFbnRpdGllcy5jcmVhdGVXaWx5KHRoaXMuZW5naW5lKTtcbiAgICB0aGlzLnBvc2l0aW9uRW50aXR5KHRoaXMucGxheWVyKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2VuZXJhdGVSYXRzKG51bTogbnVtYmVyID0gMTApIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTsgaSsrKSB7XG4gICAgICB0aGlzLmdlbmVyYXRlUmF0KCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBnZW5lcmF0ZVJhdCgpIHtcbiAgICB0aGlzLnBvc2l0aW9uRW50aXR5KEVudGl0aWVzLmNyZWF0ZVJhdCh0aGlzLmVuZ2luZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBwb3NpdGlvbkVudGl0eShlbnRpdHk6IEVudGl0aWVzLkVudGl0eSkge1xuICAgIGxldCBjb21wb25lbnQgPSA8Q29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KTtcbiAgICBsZXQgcG9zaXRpb25lZCA9IGZhbHNlO1xuICAgIGxldCB0cmllcyA9IDA7XG4gICAgbGV0IHBvc2l0aW9uID0gbnVsbDtcbiAgICB3aGlsZSAodHJpZXMgPCAxMDAwICYmICFwb3NpdGlvbmVkKSB7XG4gICAgICBwb3NpdGlvbiA9IENvcmUuUG9zaXRpb24uZ2V0UmFuZG9tKCk7XG4gICAgICBwb3NpdGlvbmVkID0gdGhpcy5pc1dpdGhvdXRFbnRpdHkocG9zaXRpb24pO1xuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbmVkKSB7XG4gICAgICBjb21wb25lbnQubW92ZVRvKHBvc2l0aW9uKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ2lzV2l0aG91dEVudGl0eScsIFxuICAgICAgdGhpcy5vbklzV2l0aG91dEVudGl0eS5iaW5kKHRoaXMpXG4gICAgKSk7XG4gICAgdGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAnbW92ZWRGcm9tJywgXG4gICAgICB0aGlzLm9uTW92ZWRGcm9tLmJpbmQodGhpcylcbiAgICApKTtcbiAgICB0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdtb3ZlZFRvJywgXG4gICAgICB0aGlzLm9uTW92ZWRUby5iaW5kKHRoaXMpXG4gICAgKSk7XG4gICAgdGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAnZ2V0VGlsZScsIFxuICAgICAgdGhpcy5vbkdldFRpbGUuYmluZCh0aGlzKVxuICAgICkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbkdldFRpbGUoZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGxldCBwb3NpdGlvbiA9IGV2ZW50LmRhdGEucG9zaXRpb247XG4gICAgcmV0dXJuIHRoaXMubWFwLmdldFRpbGUocG9zaXRpb24pO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVkRnJvbShldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgbGV0IHRpbGUgPSB0aGlzLm1hcC5nZXRUaWxlKGV2ZW50LmRhdGEucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbik7XG4gICAgaWYgKCFldmVudC5kYXRhLnBoeXNpY3NDb21wb25lbnQuYmxvY2tpbmcpIHtcbiAgICAgIGRlbGV0ZSB0aWxlLnByb3BzW2V2ZW50LmRhdGEuZW50aXR5Lmd1aWRdO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aWxlLmVudGl0eSA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVkVG8oZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGxldCB0aWxlID0gdGhpcy5tYXAuZ2V0VGlsZShldmVudC5kYXRhLnBoeXNpY3NDb21wb25lbnQucG9zaXRpb24pO1xuICAgIGlmICghZXZlbnQuZGF0YS5waHlzaWNzQ29tcG9uZW50LmJsb2NraW5nKSB7XG4gICAgICB0aWxlLnByb3BzW2V2ZW50LmRhdGEuZW50aXR5Lmd1aWRdID0gZXZlbnQuZGF0YS5lbnRpdHk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aWxlLmVudGl0eSkge1xuICAgICAgICB0aHJvdyBuZXcgRXhjZXB0aW9ucy5FbnRpdHlPdmVybGFwRXJyb3IoJ1R3byBlbnRpdGllcyBjYW5ub3QgYmUgYXQgdGhlIHNhbWUgc3BvdCcpO1xuICAgICAgfVxuICAgICAgdGlsZS5lbnRpdHkgPSBldmVudC5kYXRhLmVudGl0eTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIG9uSXNXaXRob3V0RW50aXR5KGV2ZW50OiBFdmVudHMuRXZlbnQpOiBib29sZWFuIHtcbiAgICBsZXQgcG9zaXRpb24gPSBldmVudC5kYXRhLnBvc2l0aW9uO1xuICAgIHJldHVybiB0aGlzLmlzV2l0aG91dEVudGl0eShwb3NpdGlvbik7XG4gIH1cblxuICBwcml2YXRlIGlzV2l0aG91dEVudGl0eShwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbik6IGJvb2xlYW4ge1xuICAgIGxldCB0aWxlID0gdGhpcy5tYXAuZ2V0VGlsZShwb3NpdGlvbik7XG4gICAgcmV0dXJuIHRpbGUud2Fsa2FibGUgJiYgdGlsZS5lbnRpdHkgPT09IG51bGw7XG4gIH1cblxuICByZW5kZXIoYmxpdEZ1bmN0aW9uOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLm1hcFZpZXcucmVuZGVyKChjb25zb2xlOiBDb25zb2xlKSA9PiB7XG4gICAgICBibGl0RnVuY3Rpb24oY29uc29sZSwgMCwgMCk7XG4gICAgfSk7XG4gICAgdGhpcy5sb2dWaWV3LnJlbmRlcigoY29uc29sZTogQ29uc29sZSkgPT4ge1xuICAgICAgYmxpdEZ1bmN0aW9uKGNvbnNvbGUsIDAsIHRoaXMuaGVpZ2h0IC0gNSk7XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0ID0gU2NlbmU7XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4vY29yZSc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuL2VudGl0aWVzJztcblxuaW1wb3J0IEdseXBoID0gcmVxdWlyZSgnLi9HbHlwaCcpO1xuXG5pbnRlcmZhY2UgVGlsZURlc2NyaXB0aW9uIHtcbiAgZ2x5cGg6IEdseXBoIHwgR2x5cGhbXTtcbiAgd2Fsa2FibGU6IGJvb2xlYW47XG4gIGJsb2Nrc1NpZ2h0OiBib29sZWFuO1xufVxuXG5jbGFzcyBUaWxlIHtcbiAgcHVibGljIGdseXBoOiBHbHlwaDtcbiAgcHVibGljIHdhbGthYmxlOiBib29sZWFuO1xuICBwdWJsaWMgYmxvY2tzU2lnaHQ6IGJvb2xlYW47XG4gIHB1YmxpYyBlbnRpdHk6IEVudGl0aWVzLkVudGl0eTtcbiAgcHVibGljIHByb3BzOiB7W2d1aWQ6IHN0cmluZ106IEVudGl0aWVzLkVudGl0eX07XG5cbiAgcHVibGljIHN0YXRpYyBFTVBUWTogVGlsZURlc2NyaXB0aW9uID0ge1xuICAgIGdseXBoOiBuZXcgR2x5cGgoR2x5cGguQ0hBUl9TUEFDRSwgMHgwMDAwMDAsIDB4MDAwMDAwKSxcbiAgICB3YWxrYWJsZTogZmFsc2UsXG4gICAgYmxvY2tzU2lnaHQ6IHRydWUsXG4gIH07XG5cbiAgcHVibGljIHN0YXRpYyBGTE9PUjogVGlsZURlc2NyaXB0aW9uID0ge1xuICAgIGdseXBoOiBbXG4gICAgICBuZXcgR2x5cGgoJy4nLCAweDNhNDQ0NCwgMHgyMjIyMjIpLFxuICAgICAgbmV3IEdseXBoKCcuJywgMHg0NDNhNDQsIDB4MjIyMjIyKSxcbiAgICAgIG5ldyBHbHlwaCgnLicsIDB4NDQ0NDNhLCAweDIyMjIyMiksXG4gICAgICBuZXcgR2x5cGgoJywnLCAweDNhNDQ0NCwgMHgyMjIyMjIpLFxuICAgICAgbmV3IEdseXBoKCcsJywgMHg0NDNhNDQsIDB4MjIyMjIyKSxcbiAgICAgIG5ldyBHbHlwaCgnLCcsIDB4NDQ0NDNhLCAweDIyMjIyMilcbiAgICBdLFxuICAgIHdhbGthYmxlOiB0cnVlLFxuICAgIGJsb2Nrc1NpZ2h0OiBmYWxzZSxcbiAgfTtcblxuICBwdWJsaWMgc3RhdGljIFdBTEw6IFRpbGVEZXNjcmlwdGlvbiA9IHtcbiAgICBnbHlwaDogbmV3IEdseXBoKEdseXBoLkNIQVJfSExJTkUsIDB4ZGRkZGRkLCAweDExMTExMSksXG4gICAgd2Fsa2FibGU6IGZhbHNlLFxuICAgIGJsb2Nrc1NpZ2h0OiB0cnVlLFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKGdseXBoOiBHbHlwaCwgd2Fsa2FibGU6IGJvb2xlYW4sIGJsb2Nrc1NpZ2h0OiBib29sZWFuKSB7XG4gICAgdGhpcy5nbHlwaCA9IGdseXBoO1xuICAgIHRoaXMud2Fsa2FibGUgPSB3YWxrYWJsZTtcbiAgICB0aGlzLmJsb2Nrc1NpZ2h0ID0gYmxvY2tzU2lnaHQ7XG4gICAgdGhpcy5lbnRpdHkgPSBudWxsO1xuICAgIHRoaXMucHJvcHMgPSB7fTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlVGlsZShkZXNjOiBUaWxlRGVzY3JpcHRpb24pIHtcbiAgICB2YXIgZzogR2x5cGggPSBudWxsO1xuICAgIGlmICgoPEFycmF5PEdseXBoPj5kZXNjLmdseXBoKS5sZW5ndGggJiYgKDxBcnJheTxHbHlwaD4+ZGVzYy5nbHlwaCkubGVuZ3RoID4gMCkge1xuICAgICAgZyA9IDxHbHlwaD5Db3JlLlV0aWxzLmdldFJhbmRvbUluZGV4KDxBcnJheTxHbHlwaD4+ZGVzYy5nbHlwaCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGcgPSA8R2x5cGg+ZGVzYy5nbHlwaDtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUaWxlKGcsIGRlc2Mud2Fsa2FibGUsIGRlc2MuYmxvY2tzU2lnaHQpO1xuICB9XG59XG5cbmV4cG9ydCA9IFRpbGU7XG4iLCJpbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi9FbmdpbmUnKTtcbmltcG9ydCBTY2VuZSA9IHJlcXVpcmUoJy4vU2NlbmUnKTtcblxud2luZG93Lm9ubG9hZCA9ICgpID0+IHtcbiAgbGV0IGVuZ2luZSA9IG5ldyBFbmdpbmUoNjAsIDQwLCAncm9ndWUnKTtcbiAgbGV0IHNjZW5lID0gbmV3IFNjZW5lKGVuZ2luZSwgNjAsIDQwKTtcbiAgZW5naW5lLnN0YXJ0KHNjZW5lKTtcbn07XG4iLCJpbXBvcnQgKiBhcyBFeGNlcHRpb25zIGZyb20gJy4uL0V4Y2VwdGlvbnMnO1xuXG5leHBvcnQgY2xhc3MgQWN0aW9uIHtcbiAgcHJvdGVjdGVkIGNvc3Q6IG51bWJlciA9IDEwMDtcbiAgYWN0KCk6IG51bWJlciB7XG4gICAgdGhyb3cgbmV3IEV4Y2VwdGlvbnMuTWlzc2luZ0ltcGxlbWVudGF0aW9uRXJyb3IoJ0FjdGlvbi5hY3QgbXVzdCBiZSBvdmVyd3JpdHRlbicpO1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBFeGNlcHRpb25zIGZyb20gJy4uL0V4Y2VwdGlvbnMnO1xuaW1wb3J0ICogYXMgQmVoYXZpb3VycyBmcm9tICcuL2luZGV4JztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4uL2VudGl0aWVzJztcblxuZXhwb3J0IGNsYXNzIEJlaGF2aW91ciB7XG4gIHByb3RlY3RlZCBuZXh0QWN0aW9uOiBCZWhhdmlvdXJzLkFjdGlvbjtcbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIGVudGl0eTogRW50aXRpZXMuRW50aXR5KSB7XG4gIH1cbiAgZ2V0TmV4dEFjdGlvbigpOiBCZWhhdmlvdXJzLkFjdGlvbiB7XG4gICAgdGhyb3cgbmV3IEV4Y2VwdGlvbnMuTWlzc2luZ0ltcGxlbWVudGF0aW9uRXJyb3IoJ0JlaGF2aW91ci5nZXROZXh0QWN0aW9uIG11c3QgYmUgb3ZlcndyaXR0ZW4nKTtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQmVoYXZpb3VycyBmcm9tICcuL2luZGV4JztcblxuZXhwb3J0IGNsYXNzIE51bGxBY3Rpb24gZXh0ZW5kcyBCZWhhdmlvdXJzLkFjdGlvbiB7XG4gIGFjdCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmNvc3Q7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIEJlaGF2aW91cnMgZnJvbSAnLi9pbmRleCc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4uL2NvbXBvbmVudHMnO1xuaW1wb3J0ICogYXMgRW50aXRpZXMgZnJvbSAnLi4vZW50aXRpZXMnO1xuXG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBSYW5kb21XYWxrQmVoYXZpb3VyIGV4dGVuZHMgQmVoYXZpb3Vycy5CZWhhdmlvdXIge1xuICBwcml2YXRlIHBoeXNpY3NDb21wb25lbnQ6IENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudDtcblxuICBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgZW5naW5lOiBFbmdpbmUsIHByb3RlY3RlZCBlbnRpdHk6IEVudGl0aWVzLkVudGl0eSkge1xuICAgIHN1cGVyKGVudGl0eSk7XG4gICAgdGhpcy5waHlzaWNzQ29tcG9uZW50ID0gPENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCk7XG4gIH1cblxuICBnZXROZXh0QWN0aW9uKCk6IEJlaGF2aW91cnMuQWN0aW9uIHtcbiAgICBsZXQgcG9zaXRpb25zID0gQ29yZS5VdGlscy5yYW5kb21pemVBcnJheShDb3JlLlBvc2l0aW9uLmdldE5laWdoYm91cnModGhpcy5waHlzaWNzQ29tcG9uZW50LnBvc2l0aW9uKSk7XG4gICAgbGV0IGlzV2l0aG91dEVudGl0eSA9IGZhbHNlO1xuICAgIGxldCBwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbiA9IG51bGw7XG4gICAgd2hpbGUoIWlzV2l0aG91dEVudGl0eSAmJiBwb3NpdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgcG9zaXRpb24gPSBwb3NpdGlvbnMucG9wKCk7XG4gICAgICBpc1dpdGhvdXRFbnRpdHkgPSB0aGlzLmVuZ2luZS5pcyhuZXcgRXZlbnRzLkV2ZW50KCdpc1dpdGhvdXRFbnRpdHknLCB7cG9zaXRpb246IHBvc2l0aW9ufSkpO1xuICAgIH1cbiAgICBcbiAgICBpZiAoaXNXaXRob3V0RW50aXR5KSB7XG4gICAgICByZXR1cm4gbmV3IEJlaGF2aW91cnMuV2Fsa0FjdGlvbih0aGlzLnBoeXNpY3NDb21wb25lbnQsIHBvc2l0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBCZWhhdmlvdXJzLk51bGxBY3Rpb24oKTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4uL2NvbXBvbmVudHMnO1xuaW1wb3J0ICogYXMgQmVoYXZpb3VycyBmcm9tICcuL2luZGV4JztcblxuZXhwb3J0IGNsYXNzIFdhbGtBY3Rpb24gZXh0ZW5kcyBCZWhhdmlvdXJzLkFjdGlvbiB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcGh5c2ljc0NvbXBvbmVudDogQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50LCBwcml2YXRlIHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGFjdCgpOiBudW1iZXIge1xuICAgIHRoaXMucGh5c2ljc0NvbXBvbmVudC5tb3ZlVG8odGhpcy5wb3NpdGlvbik7XG4gICAgcmV0dXJuIHRoaXMuY29zdDtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQmVoYXZpb3VycyBmcm9tICcuL2luZGV4JztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4uL2VudGl0aWVzJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuLi9jb21wb25lbnRzJztcblxuaW1wb3J0IFRpbGUgPSByZXF1aXJlKCcuLi9UaWxlJyk7XG5pbXBvcnQgR2x5cGggPSByZXF1aXJlKCcuLi9HbHlwaCcpO1xuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgV3JpdGVSdW5lQWN0aW9uIGV4dGVuZHMgQmVoYXZpb3Vycy5BY3Rpb24ge1xuICBwcml2YXRlIGVuZ2luZTogRW5naW5lO1xuICBwcml2YXRlIHBoeXNpY3M6IENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudDtcblxuICBjb25zdHJ1Y3RvcihlbmdpbmU6IEVuZ2luZSwgZW50aXR5OiBFbnRpdGllcy5FbnRpdHkpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuZW5naW5lID0gZW5naW5lO1xuICAgIHRoaXMucGh5c2ljcyA9IDxDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudChDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQpO1xuICB9XG5cbiAgYWN0KCk6IG51bWJlciB7XG4gICAgY29uc3QgcnVuZSA9IG5ldyBFbnRpdGllcy5FbnRpdHkodGhpcy5lbmdpbmUsICdSdW5lJywgJ3J1bmUnKTtcbiAgICBydW5lLmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KHRoaXMuZW5naW5lLCB7XG4gICAgICBwb3NpdGlvbjogdGhpcy5waHlzaWNzLnBvc2l0aW9uLFxuICAgICAgYmxvY2tpbmc6IGZhbHNlXG4gICAgfSkpO1xuICAgIHJ1bmUuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLlJlbmRlcmFibGVDb21wb25lbnQodGhpcy5lbmdpbmUsIHtcbiAgICAgIGdseXBoOiBuZXcgR2x5cGgoJyMnLCAweDQ0ZmY4OCwgMHgwMDAwMDApXG4gICAgfSkpO1xuICAgIHJ1bmUuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLlNlbGZEZXN0cnVjdENvbXBvbmVudCh0aGlzLmVuZ2luZSwge1xuICAgICAgdHVybnM6IDEwXG4gICAgfSkpO1xuICAgIHJ1bmUuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLlJ1bmVGcmVlemVDb21wb25lbnQodGhpcy5lbmdpbmUpKTtcbiAgICByZXR1cm4gdGhpcy5jb3N0O1xuICB9XG59XG4iLCJleHBvcnQgKiBmcm9tICcuL0FjdGlvbic7XG5leHBvcnQgKiBmcm9tICcuL0JlaGF2aW91cic7XG5leHBvcnQgKiBmcm9tICcuL1dhbGtBY3Rpb24nO1xuZXhwb3J0ICogZnJvbSAnLi9OdWxsQWN0aW9uJztcbmV4cG9ydCAqIGZyb20gJy4vV3JpdGVSdW5lQWN0aW9uJztcbmV4cG9ydCAqIGZyb20gJy4vUmFuZG9tV2Fsa0JlaGF2aW91cic7XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgRXhjZXB0aW9ucyBmcm9tICcuLi9FeGNlcHRpb25zJztcbmltcG9ydCAqIGFzIEVudGl0aWVzIGZyb20gJy4uL2VudGl0aWVzJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50IHtcbiAgcHJvdGVjdGVkIGxpc3RlbmVyczogRXZlbnRzLkxpc3RlbmVyW107XG5cbiAgcHJvdGVjdGVkIF9ndWlkOiBzdHJpbmc7XG4gIGdldCBndWlkKCkge1xuICAgIHJldHVybiB0aGlzLl9ndWlkO1xuICB9XG5cbiAgcHJvdGVjdGVkIF9lbnRpdHk6IEVudGl0aWVzLkVudGl0eTtcbiAgZ2V0IGVudGl0eSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW50aXR5O1xuICB9XG5cbiAgcHJvdGVjdGVkIF9lbmdpbmU6IEVuZ2luZTtcbiAgZ2V0IGVuZ2luZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fZW5naW5lO1xuICB9XG5cbiAgY29uc3RydWN0b3IoZW5naW5lOiBFbmdpbmUsIGRhdGE6IGFueSA9IHt9KSB7XG4gICAgdGhpcy5fZ3VpZCA9IENvcmUuVXRpbHMuZ2VuZXJhdGVHdWlkKCk7XG4gICAgdGhpcy5fZW5naW5lID0gZW5naW5lO1xuICAgIHRoaXMubGlzdGVuZXJzID0gW107XG4gIH1cblxuICByZWdpc3RlckVudGl0eShlbnRpdHk6IEVudGl0aWVzLkVudGl0eSkge1xuICAgIHRoaXMuX2VudGl0eSA9IGVudGl0eTtcbiAgICB0aGlzLmNoZWNrUmVxdWlyZW1lbnRzKCk7XG4gICAgdGhpcy5pbml0aWFsaXplKCk7XG4gICAgdGhpcy5yZWdpc3Rlckxpc3RlbmVycygpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGNoZWNrUmVxdWlyZW1lbnRzKCk6IHZvaWQge1xuICB9XG5cbiAgcHJvdGVjdGVkIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICB9XG5cbiAgcHJvdGVjdGVkIGluaXRpYWxpemUoKSB7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIGlmICghdGhpcy5saXN0ZW5lcnMgfHwgdHlwZW9mIHRoaXMubGlzdGVuZXJzLmZvckVhY2ggIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb25zLk1pc3NpbmdJbXBsZW1lbnRhdGlvbkVycm9yKCdgdGhpcy5saXN0ZW5lcnNgIGhhcyBiZWVuIHJlZGVmaW5lZCwgZGVmYXVsdCBgZGVzdHJveWAgZnVuY3Rpb24gc2hvdWxkIG5vdCBiZSB1c2VkLiBGb3I6ICcgKyB0aGlzLmVudGl0eS5uYW1lKTtcbiAgICB9XG4gICAgdGhpcy5saXN0ZW5lcnMuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgIHRoaXMuZW5naW5lLnJlbW92ZUxpc3RlbmVyKGxpc3RlbmVyKTtcbiAgICAgIHRoaXMuZW50aXR5LnJlbW92ZUxpc3RlbmVyKGxpc3RlbmVyKTtcbiAgICB9KTtcbiAgICB0aGlzLmxpc3RlbmVycyA9IFtdO1xuICB9XG59XG4iLCJpbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5cbmV4cG9ydCBjbGFzcyBFbmVyZ3lDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gIHByaXZhdGUgX2N1cnJlbnRFbmVyZ3k6IG51bWJlcjtcbiAgZ2V0IGN1cnJlbnRFbmVyZ3koKSB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRFbmVyZ3k7XG4gIH1cblxuICBwcml2YXRlIF9lbmVyZ3lSZWdlbmVyYXRpb25SYXRlOiBudW1iZXI7XG4gIGdldCBlbmVyZ3lSZWdlbmVyYXRpb25SYXRlKCkge1xuICAgIHJldHVybiB0aGlzLl9lbmVyZ3lSZWdlbmVyYXRpb25SYXRlO1xuICB9XG5cbiAgcHJpdmF0ZSBfbWF4RW5lcmd5OiBudW1iZXI7XG4gIGdldCBtYXhFbmVyZ3koKSB7XG4gICAgcmV0dXJuIHRoaXMuX21heEVuZXJneTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBkYXRhOiB7cmVnZW5yYXRhdGlvblJhdGU6IG51bWJlciwgbWF4OiBudW1iZXJ9ID0ge3JlZ2VucmF0YXRpb25SYXRlOiAxMDAsIG1heDogMTAwfSkge1xuICAgIHN1cGVyKGVuZ2luZSk7XG4gICAgdGhpcy5fY3VycmVudEVuZXJneSA9IHRoaXMuX21heEVuZXJneSA9IGRhdGEubWF4O1xuICAgIHRoaXMuX2VuZXJneVJlZ2VuZXJhdGlvblJhdGUgPSBkYXRhLnJlZ2VucmF0YXRpb25SYXRlO1xuICB9XG5cbiAgcHJvdGVjdGVkIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMubGlzdGVuZXJzLnB1c2godGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAndGljaycsXG4gICAgICB0aGlzLm9uVGljay5iaW5kKHRoaXMpLFxuICAgICAgMVxuICAgICkpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25UaWNrKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBsZXQgcmF0ZSA9IHRoaXMuX2VuZXJneVJlZ2VuZXJhdGlvblJhdGU7XG4gICAgbGV0IHJhdGVNb2RpZmllcnMgPSB0aGlzLmVudGl0eS5nYXRoZXIobmV3IEV2ZW50cy5FdmVudCgnb25FbmVyZ3lSZWdlbmVyYXRpb24nKSk7XG4gICAgcmF0ZU1vZGlmaWVycy5mb3JFYWNoKChtb2RpZmllcikgPT4ge1xuICAgICAgcmF0ZSA9IHJhdGUgKiBtb2RpZmllcjtcbiAgICB9KTtcbiAgICB0aGlzLl9jdXJyZW50RW5lcmd5ID0gTWF0aC5taW4odGhpcy5tYXhFbmVyZ3ksIHRoaXMuX2N1cnJlbnRFbmVyZ3kgKyByYXRlKTtcbiAgfVxuXG4gIHVzZUVuZXJneShlbmVyZ3k6IG51bWJlcik6IG51bWJlciB7XG4gICAgdGhpcy5fY3VycmVudEVuZXJneSA9IHRoaXMuX2N1cnJlbnRFbmVyZ3kgLSBlbmVyZ3k7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRFbmVyZ3k7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5cbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIEhlYWx0aENvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5lbnRpdHkubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAgJ2RhbWFnZScsXG4gICAgICB0aGlzLm9uRGFtYWdlLmJpbmQodGhpcylcbiAgICApKTtcbiAgfVxuXG4gIHByaXZhdGUgb25EYW1hZ2UoZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgICAgdGhpcy5lbmdpbmUucmVtb3ZlRW50aXR5KHRoaXMuZW50aXR5KTtcbiAgICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgnbWVzc2FnZScsIHtcbiAgICAgICAgbWVzc2FnZTogdGhpcy5lbnRpdHkubmFtZSArICcgd2FzIGtpbGxlZCBieSAnICsgZXZlbnQuZGF0YS5zb3VyY2UubmFtZSArICcuJyxcbiAgICAgICAgdGFyZ2V0OiB0aGlzLmVudGl0eVxuICAgICAgfSkpO1xuICB9O1xufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2luZGV4JztcbmltcG9ydCAqIGFzIEJlaGF2aW91cnMgZnJvbSAnLi4vYmVoYXZpb3Vycyc7XG5cbmltcG9ydCBJbnB1dEhhbmRsZXIgPSByZXF1aXJlKCcuLi9JbnB1dEhhbmRsZXInKTtcbmltcG9ydCBHbHlwaCA9IHJlcXVpcmUoJy4uL0dseXBoJyk7XG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBJbnB1dENvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSBlbmVyZ3lDb21wb25lbnQ6IENvbXBvbmVudHMuRW5lcmd5Q29tcG9uZW50O1xuICBwcml2YXRlIHBoeXNpY3NDb21wb25lbnQ6IENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudDtcbiAgcHJpdmF0ZSBoYXNGb2N1czogYm9vbGVhbjtcblxuICBwcm90ZWN0ZWQgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLmVuZXJneUNvbXBvbmVudCA9IDxDb21wb25lbnRzLkVuZXJneUNvbXBvbmVudD50aGlzLmVudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5FbmVyZ3lDb21wb25lbnQpO1xuICAgIHRoaXMucGh5c2ljc0NvbXBvbmVudCA9IDxDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ+dGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCk7XG4gICAgdGhpcy5oYXNGb2N1cyA9IGZhbHNlO1xuICB9XG5cbiAgcHJvdGVjdGVkIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMubGlzdGVuZXJzLnB1c2godGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAndGljaycsXG4gICAgICB0aGlzLm9uVGljay5iaW5kKHRoaXMpXG4gICAgKSkpO1xuXG4gICAgdGhpcy5lbmdpbmUuaW5wdXRIYW5kbGVyLmxpc3RlbihcbiAgICAgIFtJbnB1dEhhbmRsZXIuS0VZX1VQLCBJbnB1dEhhbmRsZXIuS0VZX0tdLCBcbiAgICAgIHRoaXMub25Nb3ZlVXAuYmluZCh0aGlzKVxuICAgICk7XG4gICAgdGhpcy5lbmdpbmUuaW5wdXRIYW5kbGVyLmxpc3RlbihcbiAgICAgIFtJbnB1dEhhbmRsZXIuS0VZX1VdLFxuICAgICAgdGhpcy5vbk1vdmVVcFJpZ2h0LmJpbmQodGhpcylcbiAgICApO1xuICAgIHRoaXMuZW5naW5lLmlucHV0SGFuZGxlci5saXN0ZW4oXG4gICAgICBbSW5wdXRIYW5kbGVyLktFWV9SSUdIVCwgSW5wdXRIYW5kbGVyLktFWV9MXSwgXG4gICAgICB0aGlzLm9uTW92ZVJpZ2h0LmJpbmQodGhpcylcbiAgICApO1xuICAgIHRoaXMuZW5naW5lLmlucHV0SGFuZGxlci5saXN0ZW4oXG4gICAgICBbSW5wdXRIYW5kbGVyLktFWV9OXSxcbiAgICAgIHRoaXMub25Nb3ZlRG93blJpZ2h0LmJpbmQodGhpcylcbiAgICApO1xuICAgIHRoaXMuZW5naW5lLmlucHV0SGFuZGxlci5saXN0ZW4oXG4gICAgICBbSW5wdXRIYW5kbGVyLktFWV9ET1dOLCBJbnB1dEhhbmRsZXIuS0VZX0pdLCBcbiAgICAgIHRoaXMub25Nb3ZlRG93bi5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICB0aGlzLmVuZ2luZS5pbnB1dEhhbmRsZXIubGlzdGVuKFxuICAgICAgW0lucHV0SGFuZGxlci5LRVlfQl0sXG4gICAgICB0aGlzLm9uTW92ZURvd25MZWZ0LmJpbmQodGhpcylcbiAgICApO1xuICAgIHRoaXMuZW5naW5lLmlucHV0SGFuZGxlci5saXN0ZW4oXG4gICAgICBbSW5wdXRIYW5kbGVyLktFWV9MRUZULCBJbnB1dEhhbmRsZXIuS0VZX0hdLCBcbiAgICAgIHRoaXMub25Nb3ZlTGVmdC5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICB0aGlzLmVuZ2luZS5pbnB1dEhhbmRsZXIubGlzdGVuKFxuICAgICAgW0lucHV0SGFuZGxlci5LRVlfWV0sXG4gICAgICB0aGlzLm9uTW92ZVVwTGVmdC5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICB0aGlzLmVuZ2luZS5pbnB1dEhhbmRsZXIubGlzdGVuKFxuICAgICAgW0lucHV0SGFuZGxlci5LRVlfUEVSSU9EXSwgXG4gICAgICB0aGlzLm9uV2FpdC5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICB0aGlzLmVuZ2luZS5pbnB1dEhhbmRsZXIubGlzdGVuKFxuICAgICAgW0lucHV0SGFuZGxlci5LRVlfMF0sIFxuICAgICAgdGhpcy5vblRyYXBPbmUuYmluZCh0aGlzKVxuICAgICk7XG4gIH1cblxuICBvblRpY2soZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGlmICh0aGlzLmVuZXJneUNvbXBvbmVudC5jdXJyZW50RW5lcmd5ID49IDEwMCkge1xuICAgICAgdGhpcy5hY3QoKTtcbiAgICB9XG4gIH1cblxuICBhY3QoKSB7XG4gICAgdGhpcy5oYXNGb2N1cyA9IHRydWU7XG4gICAgdGhpcy5lbmdpbmUuZW1pdChuZXcgRXZlbnRzLkV2ZW50KCdwYXVzZVRpbWUnKSk7XG4gIH1cblxuICBwcml2YXRlIHBlcmZvcm1BY3Rpb24oYWN0aW9uOiBCZWhhdmlvdXJzLkFjdGlvbikge1xuICAgIHRoaXMuaGFzRm9jdXMgPSBmYWxzZTtcbiAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ3Jlc3VtZVRpbWUnKSk7XG4gICAgdGhpcy5lbmVyZ3lDb21wb25lbnQudXNlRW5lcmd5KGFjdGlvbi5hY3QoKSk7XG4gIH1cblxuICBwcml2YXRlIG9uV2FpdCgpIHtcbiAgICBpZiAoIXRoaXMuaGFzRm9jdXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5wZXJmb3JtQWN0aW9uKG5ldyBCZWhhdmlvdXJzLk51bGxBY3Rpb24oKSk7XG4gIH1cblxuICBwcml2YXRlIG9uVHJhcE9uZSgpIHtcbiAgICBpZiAoIXRoaXMuaGFzRm9jdXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgYWN0aW9uID0gdGhpcy5lbnRpdHkuZmlyZShuZXcgRXZlbnRzLkV2ZW50KCd3cml0ZVJ1bmUnLCB7fSkpO1xuICAgIGlmIChhY3Rpb24pIHtcbiAgICAgIHRoaXMucGVyZm9ybUFjdGlvbihhY3Rpb24pO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgb25Nb3ZlVXAoKSB7XG4gICAgaWYgKCF0aGlzLmhhc0ZvY3VzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuaGFuZGxlTW92ZW1lbnQobmV3IENvcmUuUG9zaXRpb24oMCwgLTEpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Nb3ZlVXBSaWdodCgpIHtcbiAgICBpZiAoIXRoaXMuaGFzRm9jdXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5oYW5kbGVNb3ZlbWVudChuZXcgQ29yZS5Qb3NpdGlvbigxLCAtMSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVSaWdodCgpIHtcbiAgICBpZiAoIXRoaXMuaGFzRm9jdXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5oYW5kbGVNb3ZlbWVudChuZXcgQ29yZS5Qb3NpdGlvbigxLCAwKSk7XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZURvd25SaWdodCgpIHtcbiAgICBpZiAoIXRoaXMuaGFzRm9jdXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5oYW5kbGVNb3ZlbWVudChuZXcgQ29yZS5Qb3NpdGlvbigxLCAxKSk7XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZURvd24oKSB7XG4gICAgaWYgKCF0aGlzLmhhc0ZvY3VzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuaGFuZGxlTW92ZW1lbnQobmV3IENvcmUuUG9zaXRpb24oMCwgMSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVEb3duTGVmdCgpIHtcbiAgICBpZiAoIXRoaXMuaGFzRm9jdXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5oYW5kbGVNb3ZlbWVudChuZXcgQ29yZS5Qb3NpdGlvbigtMSwgMSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbk1vdmVMZWZ0KCkge1xuICAgIGlmICghdGhpcy5oYXNGb2N1cykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmhhbmRsZU1vdmVtZW50KG5ldyBDb3JlLlBvc2l0aW9uKC0xLCAwKSk7XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZVVwTGVmdCgpIHtcbiAgICBpZiAoIXRoaXMuaGFzRm9jdXMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5oYW5kbGVNb3ZlbWVudChuZXcgQ29yZS5Qb3NpdGlvbigtMSwgLTEpKTtcbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlTW92ZW1lbnQoZGlyZWN0aW9uOiBDb3JlLlBvc2l0aW9uKSB7XG4gICAgY29uc3QgcG9zaXRpb24gPSBDb3JlLlBvc2l0aW9uLmFkZCh0aGlzLnBoeXNpY3NDb21wb25lbnQucG9zaXRpb24sIGRpcmVjdGlvbik7XG4gICAgY29uc3QgaXNXaXRob3V0RW50aXR5ID0gdGhpcy5lbmdpbmUuaXMobmV3IEV2ZW50cy5FdmVudCgnaXNXaXRob3V0RW50aXR5Jywge3Bvc2l0aW9uOiBwb3NpdGlvbn0pKTtcbiAgICBpZiAoaXNXaXRob3V0RW50aXR5KSB7XG4gICAgICB0aGlzLnBlcmZvcm1BY3Rpb24obmV3IEJlaGF2aW91cnMuV2Fsa0FjdGlvbih0aGlzLnBoeXNpY3NDb21wb25lbnQsIHBvc2l0aW9uKSk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuXG5pbXBvcnQgR2x5cGggPSByZXF1aXJlKCcuLi9HbHlwaCcpO1xuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgUGh5c2ljc0NvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSBfYmxvY2tpbmc6IGJvb2xlYW47XG4gIGdldCBibG9ja2luZygpIHtcbiAgICByZXR1cm4gdGhpcy5fYmxvY2tpbmc7XG4gIH1cbiAgcHJpdmF0ZSBfcG9zaXRpb246IENvcmUuUG9zaXRpb247XG4gIGdldCBwb3NpdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fcG9zaXRpb247XG4gIH1cblxuICBjb25zdHJ1Y3RvcihlbmdpbmU6IEVuZ2luZSwgZGF0YToge3Bvc2l0aW9uOiBDb3JlLlBvc2l0aW9uLCBibG9ja2luZzogYm9vbGVhbn0gPSB7cG9zaXRpb246IG51bGwsIGJsb2NraW5nOiB0cnVlfSkge1xuICAgIHN1cGVyKGVuZ2luZSk7XG4gICAgdGhpcy5fcG9zaXRpb24gPSBkYXRhLnBvc2l0aW9uO1xuICAgIHRoaXMuX2Jsb2NraW5nID0gZGF0YS5ibG9ja2luZztcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgaWYgKHRoaXMucG9zaXRpb24pIHtcbiAgICAgIHRoaXMuZW5naW5lLmVtaXQobmV3IEV2ZW50cy5FdmVudCgnbW92ZWRUbycsIHtwaHlzaWNzQ29tcG9uZW50OiB0aGlzLCBlbnRpdHk6IHRoaXMuZW50aXR5fSkpO1xuICAgICAgdGhpcy5lbmdpbmUuZW1pdChuZXcgRXZlbnRzLkV2ZW50KCdtb3ZlJywge3BoeXNpY3NDb21wb25lbnQ6IHRoaXMsIGVudGl0eTogdGhpcy5lbnRpdHl9KSk7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBzdXBlci5kZXN0cm95KCk7XG4gICAgdGhpcy5lbmdpbmUuZW1pdChuZXcgRXZlbnRzLkV2ZW50KCdtb3ZlZEZyb20nLCB7cGh5c2ljc0NvbXBvbmVudDogdGhpcywgZW50aXR5OiB0aGlzLmVudGl0eX0pKTtcbiAgfVxuXG4gIG1vdmVUbyhwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbikge1xuICAgIGlmICh0aGlzLl9wb3NpdGlvbikge1xuICAgICAgdGhpcy5lbmdpbmUuZW1pdChuZXcgRXZlbnRzLkV2ZW50KCdtb3ZlZEZyb20nLCB7cGh5c2ljc0NvbXBvbmVudDogdGhpcywgZW50aXR5OiB0aGlzLmVudGl0eX0pKTtcbiAgICB9XG4gICAgdGhpcy5fcG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ21vdmVkVG8nLCB7cGh5c2ljc0NvbXBvbmVudDogdGhpcywgZW50aXR5OiB0aGlzLmVudGl0eX0pKTtcbiAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ21vdmUnLCB7cGh5c2ljc0NvbXBvbmVudDogdGhpcywgZW50aXR5OiB0aGlzLmVudGl0eX0pKTtcbiAgICB0aGlzLmVudGl0eS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ21vdmUnLCB7cGh5c2ljc0NvbXBvbmVudDogdGhpcywgZW50aXR5OiB0aGlzLmVudGl0eX0pKTtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgRW50aXRpZXMgZnJvbSAnLi4vZW50aXRpZXMnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBFeGNlcHRpb25zIGZyb20gJy4uL0V4Y2VwdGlvbnMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2luZGV4JztcblxuaW1wb3J0IEdseXBoID0gcmVxdWlyZSgnLi4vR2x5cGgnKTtcbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIFJlbmRlcmFibGVDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gIHByaXZhdGUgX2dseXBoOiBHbHlwaDtcbiAgZ2V0IGdseXBoKCkge1xuICAgIHJldHVybiB0aGlzLl9nbHlwaDtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBkYXRhOiB7Z2x5cGg6IEdseXBofSkge1xuICAgIHN1cGVyKGVuZ2luZSk7XG4gICAgdGhpcy5fZ2x5cGggPSBkYXRhLmdseXBoO1xuICB9XG5cbiAgcHJvdGVjdGVkIGNoZWNrUmVxdWlyZW1lbnRzKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5lbnRpdHkuaGFzQ29tcG9uZW50KENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudCkpIHtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb25zLk1pc3NpbmdDb21wb25lbnRFcnJvcignUmVuZGVyYWJsZUNvbXBvbmVudCByZXF1aXJlcyBQaHlzaWNzQ29tcG9uZW50Jyk7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5lbmdpbmUuZW1pdChuZXcgRXZlbnRzLkV2ZW50KCdyZW5kZXJhYmxlQ29tcG9uZW50Q3JlYXRlZCcsIHtlbnRpdHk6IHRoaXMuZW50aXR5LCByZW5kZXJhYmxlQ29tcG9uZW50OiB0aGlzfSkpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmVuZ2luZS5lbWl0KG5ldyBFdmVudHMuRXZlbnQoJ3JlbmRlcmFibGVDb21wb25lbnREZXN0cm95ZWQnLCB7ZW50aXR5OiB0aGlzLmVudGl0eSwgcmVuZGVyYWJsZUNvbXBvbmVudDogdGhpc30pKTtcbiAgfVxufVxuIiwiaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5pbXBvcnQgKiBhcyBCZWhhdmlvdXJzIGZyb20gJy4uL2JlaGF2aW91cnMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2luZGV4JztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuXG5leHBvcnQgY2xhc3MgUm9hbWluZ0FJQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICBwcml2YXRlIGVuZXJneUNvbXBvbmVudDogQ29tcG9uZW50cy5FbmVyZ3lDb21wb25lbnQ7XG5cbiAgcHJpdmF0ZSByYW5kb21XYWxrQmVoYXZpb3VyOiBCZWhhdmlvdXJzLlJhbmRvbVdhbGtCZWhhdmlvdXI7XG5cbiAgcHJvdGVjdGVkIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5lbmVyZ3lDb21wb25lbnQgPSA8Q29tcG9uZW50cy5FbmVyZ3lDb21wb25lbnQ+dGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KENvbXBvbmVudHMuRW5lcmd5Q29tcG9uZW50KTtcbiAgICB0aGlzLnJhbmRvbVdhbGtCZWhhdmlvdXIgPSBuZXcgQmVoYXZpb3Vycy5SYW5kb21XYWxrQmVoYXZpb3VyKHRoaXMuZW5naW5lLCB0aGlzLmVudGl0eSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaCh0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICd0aWNrJyxcbiAgICAgIHRoaXMub25UaWNrLmJpbmQodGhpcylcbiAgICApKSk7XG4gIH1cblxuICBvblRpY2soZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGlmICh0aGlzLmVuZXJneUNvbXBvbmVudC5jdXJyZW50RW5lcmd5ID49IDEwMCkge1xuICAgICAgbGV0IGFjdGlvbiA9IHRoaXMucmFuZG9tV2Fsa0JlaGF2aW91ci5nZXROZXh0QWN0aW9uKCk7XG4gICAgICB0aGlzLmVuZXJneUNvbXBvbmVudC51c2VFbmVyZ3koYWN0aW9uLmFjdCgpKTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5cbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIFJ1bmVEYW1hZ2VDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gIHByaXZhdGUgcmFkaXVzOiBudW1iZXI7XG4gIHByaXZhdGUgY2hhcmdlczogbnVtYmVyO1xuICBwcml2YXRlIHBoeXNpY3NDb21wb25lbnQ6IENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudDtcblxuICBjb25zdHJ1Y3RvcihlbmdpbmU6IEVuZ2luZSwgZGF0YToge3JhZGl1czogbnVtYmVyLCBjaGFyZ2VzOiBudW1iZXJ9ID0ge3JhZGl1czogMSwgY2hhcmdlczogMX0pIHtcbiAgICBzdXBlcihlbmdpbmUpO1xuICAgIHRoaXMucmFkaXVzID0gZGF0YS5yYWRpdXM7XG4gICAgdGhpcy5jaGFyZ2VzID0gZGF0YS5jaGFyZ2VzO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnBoeXNpY3NDb21wb25lbnQgPSA8Q29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50PnRoaXMuZW50aXR5LmdldENvbXBvbmVudChDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQpO1xuICB9XG5cbiAgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaCh0aGlzLmVuZ2luZS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdtb3ZlZFRvJyxcbiAgICAgIHRoaXMub25Nb3ZlZFRvLmJpbmQodGhpcyksXG4gICAgICA1MFxuICAgICkpKTtcbiAgfVxuXG4gIHByaXZhdGUgb25Nb3ZlZFRvKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBpZiAodGhpcy5jaGFyZ2VzIDw9IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZXZlbnRQb3NpdGlvbiA9IGV2ZW50LmRhdGEucGh5c2ljc0NvbXBvbmVudC5wb3NpdGlvbjsgXG4gICAgaWYgKGV2ZW50UG9zaXRpb24ueCA9PSB0aGlzLnBoeXNpY3NDb21wb25lbnQucG9zaXRpb24ueCAmJiBcbiAgICAgICAgZXZlbnRQb3NpdGlvbi55ID09PSB0aGlzLnBoeXNpY3NDb21wb25lbnQucG9zaXRpb24ueSkge1xuICAgICAgZXZlbnQuZGF0YS5lbnRpdHkuZW1pdChuZXcgRXZlbnRzLkV2ZW50KCdkYW1hZ2UnLCB7XG4gICAgICAgIHNvdXJjZTogdGhpcy5lbnRpdHlcbiAgICAgIH0pKTtcbiAgICAgIHRoaXMuY2hhcmdlcy0tO1xuICAgICAgaWYgKHRoaXMuY2hhcmdlcyA8PSAwKSB7XG4gICAgICAgIHRoaXMuZW5naW5lLnJlbW92ZUVudGl0eSh0aGlzLmVudGl0eSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuXG5pbXBvcnQgRW5naW5lID0gcmVxdWlyZSgnLi4vRW5naW5lJyk7XG5cbmV4cG9ydCBjbGFzcyBSdW5lRnJlZXplQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICBwcml2YXRlIHJhZGl1czogbnVtYmVyO1xuICBwcml2YXRlIGNoYXJnZXM6IG51bWJlcjtcbiAgcHJpdmF0ZSBwaHlzaWNzQ29tcG9uZW50OiBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQ7XG5cbiAgY29uc3RydWN0b3IoZW5naW5lOiBFbmdpbmUsIGRhdGE6IHtyYWRpdXM6IG51bWJlciwgY2hhcmdlczogbnVtYmVyfSA9IHtyYWRpdXM6IDEsIGNoYXJnZXM6IDF9KSB7XG4gICAgc3VwZXIoZW5naW5lKTtcbiAgICB0aGlzLnJhZGl1cyA9IGRhdGEucmFkaXVzO1xuICAgIHRoaXMuY2hhcmdlcyA9IGRhdGEuY2hhcmdlcztcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5waHlzaWNzQ29tcG9uZW50ID0gPENvbXBvbmVudHMuUGh5c2ljc0NvbXBvbmVudD50aGlzLmVudGl0eS5nZXRDb21wb25lbnQoQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KTtcbiAgfVxuXG4gIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMubGlzdGVuZXJzLnB1c2godGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAnbW92ZWRUbycsXG4gICAgICB0aGlzLm9uTW92ZWRUby5iaW5kKHRoaXMpLFxuICAgICAgNTBcbiAgICApKSk7XG4gIH1cblxuICBwcml2YXRlIG9uTW92ZWRUbyhldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgaWYgKHRoaXMuY2hhcmdlcyA8PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGV2ZW50UG9zaXRpb24gPSBldmVudC5kYXRhLnBoeXNpY3NDb21wb25lbnQucG9zaXRpb247IFxuICAgIGlmIChldmVudFBvc2l0aW9uLnggPT0gdGhpcy5waHlzaWNzQ29tcG9uZW50LnBvc2l0aW9uLnggJiYgXG4gICAgICAgIGV2ZW50UG9zaXRpb24ueSA9PT0gdGhpcy5waHlzaWNzQ29tcG9uZW50LnBvc2l0aW9uLnkpIHtcbiAgICAgIGV2ZW50LmRhdGEuZW50aXR5LmFkZENvbXBvbmVudChcbiAgICAgICAgbmV3IENvbXBvbmVudHMuU2xvd0NvbXBvbmVudCh0aGlzLmVuZ2luZSwge2ZhY3RvcjogMC41fSksXG4gICAgICAgIHsgXG4gICAgICAgICAgZHVyYXRpb246IDEwXG4gICAgICAgIH1cbiAgICAgICk7IFxuICAgICAgdGhpcy5jaGFyZ2VzLS07XG4gICAgICBpZiAodGhpcy5jaGFyZ2VzIDw9IDApIHtcbiAgICAgICAgdGhpcy5lbmdpbmUucmVtb3ZlRW50aXR5KHRoaXMuZW50aXR5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBCZWhhdmlvdXJzIGZyb20gJy4uL2JlaGF2aW91cnMnO1xuaW1wb3J0ICogYXMgRXZlbnRzIGZyb20gJy4uL2V2ZW50cyc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuLi9lbnRpdGllcyc7XG5pbXBvcnQgKiBhcyBDb21wb25lbnRzIGZyb20gJy4vaW5kZXgnO1xuXG5pbXBvcnQgR2x5cGggPSByZXF1aXJlKCcuLi9HbHlwaCcpO1xuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgUnVuZVdyaXRlckNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudHMuQ29tcG9uZW50IHtcbiAgcHJpdmF0ZSBwaHlzaWNhbENvbXBvbmVudDogQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50O1xuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBkYXRhOiB7fSA9IHt9KSB7XG4gICAgc3VwZXIoZW5naW5lKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBpbml0aWFsaXplKCkge1xuICAgIHRoaXMucGh5c2ljYWxDb21wb25lbnQgPSA8Q29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50PnRoaXMuZW50aXR5LmdldENvbXBvbmVudChDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHJlZ2lzdGVyTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuZW50aXR5Lmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ3dyaXRlUnVuZScsXG4gICAgICB0aGlzLm9uV3JpdGVSdW5lLmJpbmQodGhpcylcbiAgICApKTtcbiAgfVxuXG4gIG9uV3JpdGVSdW5lKGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBjb25zdCB0aWxlID0gdGhpcy5lbmdpbmUuZmlyZShuZXcgRXZlbnRzLkV2ZW50KCdnZXRUaWxlJywge1xuICAgICAgcG9zaXRpb246IHRoaXMucGh5c2ljYWxDb21wb25lbnQucG9zaXRpb25cbiAgICB9KSk7XG5cbiAgICBsZXQgaGFzUnVuZSA9IGZhbHNlO1xuICAgIGZvciAodmFyIGtleSBpbiB0aWxlLnByb3BzKSB7XG4gICAgICBpZiAodGlsZS5wcm9wc1trZXldLnR5cGUgPT09ICdydW5lJykge1xuICAgICAgICBoYXNSdW5lID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaGFzUnVuZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICBcbiAgICByZXR1cm4gbmV3IEJlaGF2aW91cnMuV3JpdGVSdW5lQWN0aW9uKHRoaXMuZW5naW5lLCB0aGlzLmVudGl0eSk7XG5cbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2luZGV4JztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgU2VsZkRlc3RydWN0Q29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50cy5Db21wb25lbnQge1xuICBwcml2YXRlIG1heFR1cm5zOiBudW1iZXI7XG4gIHByaXZhdGUgdHVybnNMZWZ0OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoZW5naW5lOiBFbmdpbmUsIGRhdGE6IHt0dXJuczogbnVtYmVyfSkge1xuICAgIHN1cGVyKGVuZ2luZSk7XG4gICAgdGhpcy5tYXhUdXJucyA9IGRhdGEudHVybnM7XG4gICAgdGhpcy50dXJuc0xlZnQgPSBkYXRhLnR1cm5zO1xuICAgIHRoaXMubGlzdGVuZXJzID0gW107XG4gIH1cblxuICByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ3R1cm4nLFxuICAgICAgdGhpcy5vblR1cm4uYmluZCh0aGlzKSxcbiAgICAgIDUwXG4gICAgKSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvblR1cm4oZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIHRoaXMudHVybnNMZWZ0LS07XG4gICAgaWYgKHRoaXMudHVybnNMZWZ0IDwgMCkge1xuICAgICAgdGhpcy5lbmdpbmUucmVtb3ZlRW50aXR5KHRoaXMuZW50aXR5KTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi9pbmRleCc7XG5cbmltcG9ydCBFbmdpbmUgPSByZXF1aXJlKCcuLi9FbmdpbmUnKTtcblxuZXhwb3J0IGNsYXNzIFNsb3dDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gIHByaXZhdGUgX2ZhY3RvcjogbnVtYmVyO1xuICBnZXQgZmFjdG9yKCkge1xuICAgIHJldHVybiB0aGlzLl9mYWN0b3I7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihlbmdpbmU6IEVuZ2luZSwgZGF0YToge2ZhY3RvcjogbnVtYmVyfSkge1xuICAgIHN1cGVyKGVuZ2luZSk7XG4gICAgdGhpcy5fZmFjdG9yID0gZGF0YS5mYWN0b3I7XG4gIH1cblxuICByZWdpc3Rlckxpc3RlbmVycygpIHtcbiAgICB0aGlzLmxpc3RlbmVycy5wdXNoKHRoaXMuZW50aXR5Lmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ29uRW5lcmd5UmVnZW5lcmF0aW9uJyxcbiAgICAgIHRoaXMub25FbmVyZ3lSZWdlbmVyYXRpb24uYmluZCh0aGlzKSxcbiAgICAgIDUwXG4gICAgKSkpO1xuXG4gICAgdGhpcy5saXN0ZW5lcnMucHVzaCh0aGlzLmVudGl0eS5saXN0ZW4obmV3IEV2ZW50cy5MaXN0ZW5lcihcbiAgICAgICdnZXRTdGF0dXNFZmZlY3QnLFxuICAgICAgdGhpcy5vbkdldFN0YXR1c0VmZmVjdC5iaW5kKHRoaXMpXG4gICAgKSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvbkVuZXJneVJlZ2VuZXJhdGlvbihldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZhY3RvcjtcbiAgfVxuXG4gIHByaXZhdGUgb25HZXRTdGF0dXNFZmZlY3QoZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiAnU2xvdycsXG4gICAgICBzeW1ib2w6ICdTJ1xuICAgIH07XG4gIH1cblxufVxuIiwiaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuaW1wb3J0ICogYXMgQ29tcG9uZW50cyBmcm9tICcuL2luZGV4JztcbmltcG9ydCAqIGFzIEV2ZW50cyBmcm9tICcuLi9ldmVudHMnO1xuXG5leHBvcnQgY2xhc3MgVGltZUhhbmRsZXJDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnRzLkNvbXBvbmVudCB7XG4gIHByaXZhdGUgX2N1cnJlbnRUaWNrOiBudW1iZXI7XG4gIGdldCBjdXJyZW50VGljaygpIHtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudFRpY2s7XG4gIH1cblxuICBwcml2YXRlIF9jdXJyZW50VHVybjogbnVtYmVyO1xuICBnZXQgY3VycmVudFR1cm4oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRUdXJuO1xuICB9XG5cbiAgcHJpdmF0ZSB0aWNrc1BlclR1cm46IG51bWJlcjtcbiAgcHJpdmF0ZSB0dXJuVGltZTogbnVtYmVyO1xuXG4gIHByaXZhdGUgcGF1c2VkOiBib29sZWFuO1xuXG4gIHByb3RlY3RlZCBpbml0aWFsaXplKCkge1xuICAgIHRoaXMudGlja3NQZXJUdXJuID0gMTtcbiAgICB0aGlzLnR1cm5UaW1lID0gMDtcbiAgICB0aGlzLl9jdXJyZW50VHVybiA9IDA7XG4gICAgdGhpcy5fY3VycmVudFRpY2sgPSAwO1xuICAgIHRoaXMucGF1c2VkID0gZmFsc2U7XG4gIH1cblxuICBwcm90ZWN0ZWQgcmVnaXN0ZXJMaXN0ZW5lcnMoKSB7XG4gICAgdGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAncGF1c2VUaW1lJyxcbiAgICAgIHRoaXMub25QYXVzZVRpbWUuYmluZCh0aGlzKVxuICAgICkpO1xuICAgIHRoaXMuZW5naW5lLmxpc3RlbihuZXcgRXZlbnRzLkxpc3RlbmVyKFxuICAgICAgJ3Jlc3VtZVRpbWUnLFxuICAgICAgdGhpcy5vblJlc3VtZVRpbWUuYmluZCh0aGlzKVxuICAgICkpO1xuICB9XG5cbiAgcHJpdmF0ZSBvblBhdXNlVGltZShldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgdGhpcy5wYXVzZWQgPSB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSBvblJlc3VtZVRpbWUoZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIHRoaXMucGF1c2VkID0gZmFsc2U7XG4gIH1cblxuICBlbmdpbmVUaWNrKGdhbWVUaW1lOiBudW1iZXIpIHtcbiAgICBpZiAodGhpcy5wYXVzZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fY3VycmVudFRpY2srKztcbiAgICB0aGlzLmVuZ2luZS5jdXJyZW50VGljayA9IHRoaXMuX2N1cnJlbnRUaWNrO1xuICAgIGlmICgodGhpcy5fY3VycmVudFRpY2sgJSB0aGlzLnRpY2tzUGVyVHVybikgPT09IDApIHtcbiAgICAgIHRoaXMuX2N1cnJlbnRUdXJuKys7XG4gICAgICB0aGlzLmVuZ2luZS5jdXJyZW50VHVybiA9IHRoaXMuX2N1cnJlbnRUdXJuO1xuICAgICAgdGhpcy5lbmdpbmUuZW1pdChuZXcgRXZlbnRzLkV2ZW50KCd0dXJuJywge2N1cnJlbnRUdXJuOiB0aGlzLl9jdXJyZW50VHVybiwgY3VycmVudFRpY2s6IHRoaXMuX2N1cnJlbnRUaWNrfSkpO1xuXG4gICAgICB0aGlzLnR1cm5UaW1lID0gZ2FtZVRpbWU7XG5cbiAgICB9XG4gICAgdGhpcy5lbmdpbmUuZW1pdChuZXcgRXZlbnRzLkV2ZW50KCd0aWNrJywge2N1cnJlbnRUdXJuOiB0aGlzLl9jdXJyZW50VHVybiwgY3VycmVudFRpY2s6IHRoaXMuX2N1cnJlbnRUaWNrfSkpO1xuICB9XG5cbn1cbiIsImV4cG9ydCAqIGZyb20gJy4vQ29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vVGltZUhhbmRsZXJDb21wb25lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9TZWxmRGVzdHJ1Y3RDb21wb25lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9Sb2FtaW5nQUlDb21wb25lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9FbmVyZ3lDb21wb25lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9JbnB1dENvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL1JlbmRlcmFibGVDb21wb25lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9QaHlzaWNzQ29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vSGVhbHRoQ29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vUnVuZVdyaXRlckNvbXBvbmVudCc7XG5leHBvcnQgKiBmcm9tICcuL1J1bmVEYW1hZ2VDb21wb25lbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9SdW5lRnJlZXplQ29tcG9uZW50JztcbmV4cG9ydCAqIGZyb20gJy4vU2xvd0NvbXBvbmVudCc7XG4iLCJcInVzZSBzdHJpY3RcIjtcbmV4cG9ydCB0eXBlIENvbG9yID0gU3RyaW5nIHwgbnVtYmVyO1xuXG5leHBvcnQgY2xhc3MgQ29sb3JVdGlscyB7XG4gIC8qKlxuICAgIEZ1bmN0aW9uOiBtdWx0aXBseVxuICAgIE11bHRpcGx5IGEgY29sb3Igd2l0aCBhIG51bWJlci4gXG4gICAgPiAocixnLGIpICogbiA9PSAocipuLCBnKm4sIGIqbilcblxuICAgIFBhcmFtZXRlcnM6XG4gICAgY29sb3IgLSB0aGUgY29sb3JcbiAgICBjb2VmIC0gdGhlIGZhY3RvclxuXG4gICAgUmV0dXJuczpcbiAgICBBIG5ldyBjb2xvciBhcyBhIG51bWJlciBiZXR3ZWVuIDB4MDAwMDAwIGFuZCAweEZGRkZGRlxuICAgKi9cbiAgc3RhdGljIG11bHRpcGx5KGNvbG9yOiBDb2xvciwgY29lZjogbnVtYmVyKTogQ29sb3Ige1xuICAgIGxldCByLCBnLCBiOiBudW1iZXI7XG4gICAgaWYgKHR5cGVvZiBjb2xvciA9PT0gXCJudW1iZXJcIikge1xuICAgICAgLy8gZHVwbGljYXRlZCB0b1JnYkZyb21OdW1iZXIgY29kZSB0byBhdm9pZCBmdW5jdGlvbiBjYWxsIGFuZCBhcnJheSBhbGxvY2F0aW9uXG4gICAgICByID0gKDxudW1iZXI+Y29sb3IgJiAweEZGMDAwMCkgPj4gMTY7XG4gICAgICBnID0gKDxudW1iZXI+Y29sb3IgJiAweDAwRkYwMCkgPj4gODtcbiAgICAgIGIgPSA8bnVtYmVyPmNvbG9yICYgMHgwMDAwRkY7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCByZ2I6IG51bWJlcltdID0gQ29sb3JVdGlscy50b1JnYihjb2xvcik7XG4gICAgICByID0gcmdiWzBdO1xuICAgICAgZyA9IHJnYlsxXTtcbiAgICAgIGIgPSByZ2JbMl07XG4gICAgfVxuICAgIHIgPSBNYXRoLnJvdW5kKHIgKiBjb2VmKTtcbiAgICBnID0gTWF0aC5yb3VuZChnICogY29lZik7XG4gICAgYiA9IE1hdGgucm91bmQoYiAqIGNvZWYpO1xuICAgIHIgPSByIDwgMCA/IDAgOiByID4gMjU1ID8gMjU1IDogcjtcbiAgICBnID0gZyA8IDAgPyAwIDogZyA+IDI1NSA/IDI1NSA6IGc7XG4gICAgYiA9IGIgPCAwID8gMCA6IGIgPiAyNTUgPyAyNTUgOiBiO1xuICAgIHJldHVybiBiIHwgKGcgPDwgOCkgfCAociA8PCAxNik7XG4gIH1cblxuICBzdGF0aWMgbWF4KGNvbDE6IENvbG9yLCBjb2wyOiBDb2xvcikge1xuICAgIGxldCByMSxnMSxiMSxyMixnMixiMjogbnVtYmVyO1xuICAgIGlmICh0eXBlb2YgY29sMSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgLy8gZHVwbGljYXRlZCB0b1JnYkZyb21OdW1iZXIgY29kZSB0byBhdm9pZCBmdW5jdGlvbiBjYWxsIGFuZCBhcnJheSBhbGxvY2F0aW9uXG4gICAgICByMSA9ICg8bnVtYmVyPmNvbDEgJiAweEZGMDAwMCkgPj4gMTY7XG4gICAgICBnMSA9ICg8bnVtYmVyPmNvbDEgJiAweDAwRkYwMCkgPj4gODtcbiAgICAgIGIxID0gPG51bWJlcj5jb2wxICYgMHgwMDAwRkY7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCByZ2IxOiBudW1iZXJbXSA9IENvbG9yVXRpbHMudG9SZ2IoY29sMSk7XG4gICAgICByMSA9IHJnYjFbMF07XG4gICAgICBnMSA9IHJnYjFbMV07XG4gICAgICBiMSA9IHJnYjFbMl07XG4gICAgfVxuICAgIGlmICh0eXBlb2YgY29sMiA9PT0gXCJudW1iZXJcIikge1xuICAgICAgLy8gZHVwbGljYXRlZCB0b1JnYkZyb21OdW1iZXIgY29kZSB0byBhdm9pZCBmdW5jdGlvbiBjYWxsIGFuZCBhcnJheSBhbGxvY2F0aW9uXG4gICAgICByMiA9ICg8bnVtYmVyPmNvbDIgJiAweEZGMDAwMCkgPj4gMTY7XG4gICAgICBnMiA9ICg8bnVtYmVyPmNvbDIgJiAweDAwRkYwMCkgPj4gODtcbiAgICAgIGIyID0gPG51bWJlcj5jb2wyICYgMHgwMDAwRkY7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCByZ2IyOiBudW1iZXJbXSA9IENvbG9yVXRpbHMudG9SZ2IoY29sMik7XG4gICAgICByMiA9IHJnYjJbMF07XG4gICAgICBnMiA9IHJnYjJbMV07XG4gICAgICBiMiA9IHJnYjJbMl07XG4gICAgfVxuICAgIGlmIChyMiA+IHIxKSB7XG4gICAgICByMSA9IHIyO1xuICAgIH1cbiAgICBpZiAoZzIgPiBnMSkge1xuICAgICAgZzEgPSBnMjtcbiAgICB9XG4gICAgaWYgKGIyID4gYjEpIHtcbiAgICAgIGIxID0gYjI7XG4gICAgfVxuICAgIHJldHVybiBiMSB8IChnMSA8PCA4KSB8IChyMSA8PCAxNik7XG4gIH1cblxuICBzdGF0aWMgbWluKGNvbDE6IENvbG9yLCBjb2wyOiBDb2xvcikge1xuICAgIGxldCByMSxnMSxiMSxyMixnMixiMjogbnVtYmVyO1xuICAgIGlmICh0eXBlb2YgY29sMSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgLy8gZHVwbGljYXRlZCB0b1JnYkZyb21OdW1iZXIgY29kZSB0byBhdm9pZCBmdW5jdGlvbiBjYWxsIGFuZCBhcnJheSBhbGxvY2F0aW9uXG4gICAgICByMSA9ICg8bnVtYmVyPmNvbDEgJiAweEZGMDAwMCkgPj4gMTY7XG4gICAgICBnMSA9ICg8bnVtYmVyPmNvbDEgJiAweDAwRkYwMCkgPj4gODtcbiAgICAgIGIxID0gPG51bWJlcj5jb2wxICYgMHgwMDAwRkY7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCByZ2IxOiBudW1iZXJbXSA9IENvbG9yVXRpbHMudG9SZ2IoY29sMSk7XG4gICAgICByMSA9IHJnYjFbMF07XG4gICAgICBnMSA9IHJnYjFbMV07XG4gICAgICBiMSA9IHJnYjFbMl07XG4gICAgfVxuICAgIGlmICh0eXBlb2YgY29sMiA9PT0gXCJudW1iZXJcIikge1xuICAgICAgLy8gZHVwbGljYXRlZCB0b1JnYkZyb21OdW1iZXIgY29kZSB0byBhdm9pZCBmdW5jdGlvbiBjYWxsIGFuZCBhcnJheSBhbGxvY2F0aW9uXG4gICAgICByMiA9ICg8bnVtYmVyPmNvbDIgJiAweEZGMDAwMCkgPj4gMTY7XG4gICAgICBnMiA9ICg8bnVtYmVyPmNvbDIgJiAweDAwRkYwMCkgPj4gODtcbiAgICAgIGIyID0gPG51bWJlcj5jb2wyICYgMHgwMDAwRkY7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCByZ2IyOiBudW1iZXJbXSA9IENvbG9yVXRpbHMudG9SZ2IoY29sMik7XG4gICAgICByMiA9IHJnYjJbMF07XG4gICAgICBnMiA9IHJnYjJbMV07XG4gICAgICBiMiA9IHJnYjJbMl07XG4gICAgfVxuICAgIGlmIChyMiA8IHIxKSB7XG4gICAgICByMSA9IHIyO1xuICAgIH1cbiAgICBpZiAoZzIgPCBnMSkge1xuICAgICAgZzEgPSBnMjtcbiAgICB9XG4gICAgaWYgKGIyIDwgYjEpIHtcbiAgICAgIGIxID0gYjI7XG4gICAgfVxuICAgIHJldHVybiBiMSB8IChnMSA8PCA4KSB8IChyMSA8PCAxNik7XG4gIH0gICAgICAgIFxuXG4gIHN0YXRpYyBjb2xvck11bHRpcGx5KGNvbDE6IENvbG9yLCBjb2wyOiBDb2xvcikge1xuICAgIGxldCByMSxnMSxiMSxyMixnMixiMjogbnVtYmVyO1xuICAgIGlmICh0eXBlb2YgY29sMSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgLy8gZHVwbGljYXRlZCB0b1JnYkZyb21OdW1iZXIgY29kZSB0byBhdm9pZCBmdW5jdGlvbiBjYWxsIGFuZCBhcnJheSBhbGxvY2F0aW9uXG4gICAgICByMSA9ICg8bnVtYmVyPmNvbDEgJiAweEZGMDAwMCkgPj4gMTY7XG4gICAgICBnMSA9ICg8bnVtYmVyPmNvbDEgJiAweDAwRkYwMCkgPj4gODtcbiAgICAgIGIxID0gPG51bWJlcj5jb2wxICYgMHgwMDAwRkY7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCByZ2IxOiBudW1iZXJbXSA9IENvbG9yVXRpbHMudG9SZ2IoY29sMSk7XG4gICAgICByMSA9IHJnYjFbMF07XG4gICAgICBnMSA9IHJnYjFbMV07XG4gICAgICBiMSA9IHJnYjFbMl07XG4gICAgfVxuICAgIGlmICh0eXBlb2YgY29sMiA9PT0gXCJudW1iZXJcIikge1xuICAgICAgLy8gZHVwbGljYXRlZCB0b1JnYkZyb21OdW1iZXIgY29kZSB0byBhdm9pZCBmdW5jdGlvbiBjYWxsIGFuZCBhcnJheSBhbGxvY2F0aW9uXG4gICAgICByMiA9ICg8bnVtYmVyPmNvbDIgJiAweEZGMDAwMCkgPj4gMTY7XG4gICAgICBnMiA9ICg8bnVtYmVyPmNvbDIgJiAweDAwRkYwMCkgPj4gODtcbiAgICAgIGIyID0gPG51bWJlcj5jb2wyICYgMHgwMDAwRkY7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCByZ2IyOiBudW1iZXJbXSA9IENvbG9yVXRpbHMudG9SZ2IoY29sMik7XG4gICAgICByMiA9IHJnYjJbMF07XG4gICAgICBnMiA9IHJnYjJbMV07XG4gICAgICBiMiA9IHJnYjJbMl07XG4gICAgfSAgICAgICAgICAgXG4gICAgcjEgPSBNYXRoLmZsb29yKHIxICogcjIgLyAyNTUpO1xuICAgIGcxID0gTWF0aC5mbG9vcihnMSAqIGcyIC8gMjU1KTtcbiAgICBiMSA9IE1hdGguZmxvb3IoYjEgKiBiMiAvIDI1NSk7XG4gICAgcjEgPSByMSA8IDAgPyAwIDogcjEgPiAyNTUgPyAyNTUgOiByMTtcbiAgICBnMSA9IGcxIDwgMCA/IDAgOiBnMSA+IDI1NSA/IDI1NSA6IGcxO1xuICAgIGIxID0gYjEgPCAwID8gMCA6IGIxID4gMjU1ID8gMjU1IDogYjE7XG4gICAgcmV0dXJuIGIxIHwgKGcxIDw8IDgpIHwgKHIxIDw8IDE2KTtcbiAgfVxuXG4gIC8qKlxuICAgIEZ1bmN0aW9uOiBjb21wdXRlSW50ZW5zaXR5XG4gICAgUmV0dXJuIHRoZSBncmF5c2NhbGUgaW50ZW5zaXR5IGJldHdlZW4gMCBhbmQgMVxuICAgKi9cbiAgc3RhdGljIGNvbXB1dGVJbnRlbnNpdHkoY29sb3I6IENvbG9yKTogbnVtYmVyIHtcbiAgICAvLyBDb2xvcmltZXRyaWMgKGx1bWluYW5jZS1wcmVzZXJ2aW5nKSBjb252ZXJzaW9uIHRvIGdyYXlzY2FsZVxuICAgIGxldCByLCBnLCBiOiBudW1iZXI7XG4gICAgaWYgKHR5cGVvZiBjb2xvciA9PT0gXCJudW1iZXJcIikge1xuICAgICAgLy8gZHVwbGljYXRlZCB0b1JnYkZyb21OdW1iZXIgY29kZSB0byBhdm9pZCBmdW5jdGlvbiBjYWxsIGFuZCBhcnJheSBhbGxvY2F0aW9uXG4gICAgICByID0gKDxudW1iZXI+Y29sb3IgJiAweEZGMDAwMCkgPj4gMTY7XG4gICAgICBnID0gKDxudW1iZXI+Y29sb3IgJiAweDAwRkYwMCkgPj4gODtcbiAgICAgIGIgPSA8bnVtYmVyPmNvbG9yICYgMHgwMDAwRkY7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCByZ2I6IG51bWJlcltdID0gQ29sb3JVdGlscy50b1JnYihjb2xvcik7XG4gICAgICByID0gcmdiWzBdO1xuICAgICAgZyA9IHJnYlsxXTtcbiAgICAgIGIgPSByZ2JbMl07XG4gICAgfVxuICAgIHJldHVybiAoMC4yMTI2ICogciArIDAuNzE1MipnICsgMC4wNzIyICogYikgKiAoMS8yNTUpO1xuICB9XG5cbiAgLyoqXG4gICAgRnVuY3Rpb246IGFkZFxuICAgIEFkZCB0d28gY29sb3JzLlxuICAgID4gKHIxLGcxLGIxKSArIChyMixnMixiMikgPSAocjErcjIsZzErZzIsYjErYjIpXG5cbiAgICBQYXJhbWV0ZXJzOlxuICAgIGNvbDEgLSB0aGUgZmlyc3QgY29sb3JcbiAgICBjb2wyIC0gdGhlIHNlY29uZCBjb2xvclxuXG4gICAgUmV0dXJuczpcbiAgICBBIG5ldyBjb2xvciBhcyBhIG51bWJlciBiZXR3ZWVuIDB4MDAwMDAwIGFuZCAweEZGRkZGRlxuICAgKi9cbiAgc3RhdGljIGFkZChjb2wxOiBDb2xvciwgY29sMjogQ29sb3IpOiBDb2xvciB7XG4gICAgbGV0IHIgPSAoKDxudW1iZXI+Y29sMSAmIDB4RkYwMDAwKSA+PiAxNikgKyAoKDxudW1iZXI+Y29sMiAmIDB4RkYwMDAwKSA+PiAxNik7XG4gICAgbGV0IGcgPSAoKDxudW1iZXI+Y29sMSAmIDB4MDBGRjAwKSA+PiA4KSArICgoPG51bWJlcj5jb2wyICYgMHgwMEZGMDApID4+IDgpO1xuICAgIGxldCBiID0gKDxudW1iZXI+Y29sMSAmIDB4MDAwMEZGKSArICg8bnVtYmVyPmNvbDIgJiAweDAwMDBGRik7XG4gICAgaWYgKHIgPiAyNTUpIHtcbiAgICAgIHIgPSAyNTU7XG4gICAgfVxuICAgIGlmIChnID4gMjU1KSB7XG4gICAgICBnID0gMjU1O1xuICAgIH1cbiAgICBpZiAoYiA+IDI1NSkge1xuICAgICAgYiA9IDI1NTtcbiAgICB9XG4gICAgcmV0dXJuIGIgfCAoZyA8PCA4KSB8IChyIDw8IDE2KTtcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIHN0ZENvbCA9IHtcbiAgICBcImFxdWFcIjogWzAsIDI1NSwgMjU1XSxcbiAgICBcImJsYWNrXCI6IFswLCAwLCAwXSxcbiAgICBcImJsdWVcIjogWzAsIDAsIDI1NV0sXG4gICAgXCJmdWNoc2lhXCI6IFsyNTUsIDAsIDI1NV0sXG4gICAgXCJncmF5XCI6IFsxMjgsIDEyOCwgMTI4XSxcbiAgICBcImdyZWVuXCI6IFswLCAxMjgsIDBdLFxuICAgIFwibGltZVwiOiBbMCwgMjU1LCAwXSxcbiAgICBcIm1hcm9vblwiOiBbMTI4LCAwLCAwXSxcbiAgICBcIm5hdnlcIjogWzAsIDAsIDEyOF0sXG4gICAgXCJvbGl2ZVwiOiBbMTI4LCAxMjgsIDBdLFxuICAgIFwib3JhbmdlXCI6IFsyNTUsIDE2NSwgMF0sXG4gICAgXCJwdXJwbGVcIjogWzEyOCwgMCwgMTI4XSxcbiAgICBcInJlZFwiOiBbMjU1LCAwLCAwXSxcbiAgICBcInNpbHZlclwiOiBbMTkyLCAxOTIsIDE5Ml0sXG4gICAgXCJ0ZWFsXCI6IFswLCAxMjgsIDEyOF0sXG4gICAgXCJ3aGl0ZVwiOiBbMjU1LCAyNTUsIDI1NV0sXG4gICAgXCJ5ZWxsb3dcIjogWzI1NSwgMjU1LCAwXVxuICB9O1xuICAvKipcbiAgICBGdW5jdGlvbjogdG9SZ2JcbiAgICBDb252ZXJ0IGEgc3RyaW5nIGNvbG9yIGludG8gYSBbcixnLGJdIG51bWJlciBhcnJheS5cblxuICAgIFBhcmFtZXRlcnM6XG4gICAgY29sb3IgLSB0aGUgY29sb3JcblxuICAgIFJldHVybnM6XG4gICAgQW4gYXJyYXkgb2YgMyBudW1iZXJzIFtyLGcsYl0gYmV0d2VlbiAwIGFuZCAyNTUuXG4gICAqL1xuICBzdGF0aWMgdG9SZ2IoY29sb3I6IENvbG9yKTogbnVtYmVyW10ge1xuICAgIGlmICh0eXBlb2YgY29sb3IgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIHJldHVybiBDb2xvclV0aWxzLnRvUmdiRnJvbU51bWJlcig8bnVtYmVyPmNvbG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIENvbG9yVXRpbHMudG9SZ2JGcm9tU3RyaW5nKDxTdHJpbmc+Y29sb3IpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgIEZ1bmN0aW9uOiB0b1dlYlxuICAgIENvbnZlcnQgYSBjb2xvciBpbnRvIGEgQ1NTIGNvbG9yIGZvcm1hdCAoYXMgYSBzdHJpbmcpXG4gICAqL1xuICBzdGF0aWMgdG9XZWIoY29sb3I6IENvbG9yKTogc3RyaW5nIHtcbiAgICBpZiAodHlwZW9mIGNvbG9yID09PSBcIm51bWJlclwiKSB7XG4gICAgICBsZXQgcmV0OiBzdHJpbmcgPSBjb2xvci50b1N0cmluZygxNik7XG4gICAgICBsZXQgbWlzc2luZ1plcm9lczogbnVtYmVyID0gNiAtIHJldC5sZW5ndGg7XG4gICAgICBpZiAobWlzc2luZ1plcm9lcyA+IDApIHtcbiAgICAgICAgcmV0ID0gXCIwMDAwMDBcIi5zdWJzdHIoMCwgbWlzc2luZ1plcm9lcykgKyByZXQ7XG4gICAgICB9XG4gICAgICByZXR1cm4gXCIjXCIgKyByZXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiA8c3RyaW5nPmNvbG9yO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIHRvUmdiRnJvbU51bWJlcihjb2xvcjogbnVtYmVyKTogbnVtYmVyW10ge1xuICAgIGxldCByID0gKGNvbG9yICYgMHhGRjAwMDApID4+IDE2O1xuICAgIGxldCBnID0gKGNvbG9yICYgMHgwMEZGMDApID4+IDg7XG4gICAgbGV0IGIgPSBjb2xvciAmIDB4MDAwMEZGO1xuICAgIHJldHVybiBbciwgZywgYl07XG4gIH1cblxuICBwcml2YXRlIHN0YXRpYyB0b1JnYkZyb21TdHJpbmcoY29sb3I6IFN0cmluZyk6IG51bWJlcltdIHtcbiAgICBjb2xvciA9IGNvbG9yLnRvTG93ZXJDYXNlKCk7XG4gICAgbGV0IHN0ZENvbFZhbHVlczogbnVtYmVyW10gPSBDb2xvclV0aWxzLnN0ZENvbFtTdHJpbmcoY29sb3IpXTtcbiAgICBpZiAoc3RkQ29sVmFsdWVzKSB7XG4gICAgICByZXR1cm4gc3RkQ29sVmFsdWVzO1xuICAgIH1cbiAgICBpZiAoY29sb3IuY2hhckF0KDApID09PSBcIiNcIikge1xuICAgICAgLy8gI0ZGRiBvciAjRkZGRkZGIGZvcm1hdFxuICAgICAgaWYgKGNvbG9yLmxlbmd0aCA9PT0gNCkge1xuICAgICAgICAvLyBleHBhbmQgI0ZGRiB0byAjRkZGRkZGXG4gICAgICAgIGNvbG9yID0gXCIjXCIgKyBjb2xvci5jaGFyQXQoMSkgKyBjb2xvci5jaGFyQXQoMSkgKyBjb2xvci5jaGFyQXQoMilcbiAgICAgICAgKyBjb2xvci5jaGFyQXQoMikgKyBjb2xvci5jaGFyQXQoMykgKyBjb2xvci5jaGFyQXQoMyk7XG4gICAgICB9XG4gICAgICBsZXQgcjogbnVtYmVyID0gcGFyc2VJbnQoY29sb3Iuc3Vic3RyKDEsIDIpLCAxNik7XG4gICAgICBsZXQgZzogbnVtYmVyID0gcGFyc2VJbnQoY29sb3Iuc3Vic3RyKDMsIDIpLCAxNik7XG4gICAgICBsZXQgYjogbnVtYmVyID0gcGFyc2VJbnQoY29sb3Iuc3Vic3RyKDUsIDIpLCAxNik7XG4gICAgICByZXR1cm4gW3IsIGcsIGJdO1xuICAgIH0gZWxzZSBpZiAoY29sb3IuaW5kZXhPZihcInJnYihcIikgPT09IDApIHtcbiAgICAgIC8vIHJnYihyLGcsYikgZm9ybWF0XG4gICAgICBsZXQgcmdiTGlzdCA9IGNvbG9yLnN1YnN0cig0LCBjb2xvci5sZW5ndGggLSA1KS5zcGxpdChcIixcIik7XG4gICAgICByZXR1cm4gW3BhcnNlSW50KHJnYkxpc3RbMF0sIDEwKSwgcGFyc2VJbnQocmdiTGlzdFsxXSwgMTApLCBwYXJzZUludChyZ2JMaXN0WzJdLCAxMCldO1xuICAgIH1cbiAgICByZXR1cm4gWzAsIDAsIDBdO1xuICB9XG5cbiAgLyoqXG4gICAgRnVuY3Rpb246IHRvTnVtYmVyXG4gICAgQ29udmVydCBhIHN0cmluZyBjb2xvciBpbnRvIGEgbnVtYmVyLlxuXG4gICAgUGFyYW1ldGVyczpcbiAgICBjb2xvciAtIHRoZSBjb2xvclxuXG4gICAgUmV0dXJuczpcbiAgICBBIG51bWJlciBiZXR3ZWVuIDB4MDAwMDAwIGFuZCAweEZGRkZGRi5cbiAgICovXG4gIHN0YXRpYyB0b051bWJlcihjb2xvcjogQ29sb3IpOiBudW1iZXIge1xuICAgIGlmICh0eXBlb2YgY29sb3IgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgIHJldHVybiA8bnVtYmVyPmNvbG9yO1xuICAgIH1cbiAgICBsZXQgc2NvbDogU3RyaW5nID0gPFN0cmluZz5jb2xvcjtcbiAgICBpZiAoc2NvbC5jaGFyQXQoMCkgPT09IFwiI1wiICYmIHNjb2wubGVuZ3RoID09PSA3KSB7XG4gICAgICByZXR1cm4gcGFyc2VJbnQoc2NvbC5zdWJzdHIoMSksIDE2KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHJnYiA9IENvbG9yVXRpbHMudG9SZ2JGcm9tU3RyaW5nKHNjb2wpO1xuICAgICAgcmV0dXJuIHJnYlswXSAqIDY1NTM2ICsgcmdiWzFdICogMjU2ICsgcmdiWzJdO1xuICAgIH1cbiAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIFBvc2l0aW9uIHtcbiAgcHJpdmF0ZSBfeDogbnVtYmVyO1xuICBwcml2YXRlIF95OiBudW1iZXI7XG5cbiAgcHJpdmF0ZSBzdGF0aWMgbWF4V2lkdGg6IG51bWJlcjtcbiAgcHJpdmF0ZSBzdGF0aWMgbWF4SGVpZ2h0OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICB0aGlzLl94ID0geDtcbiAgICB0aGlzLl95ID0geTtcbiAgfVxuXG4gIGdldCB4KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3g7XG4gIH1cblxuICBnZXQgeSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl95O1xuICB9XG5cbiAgcHVibGljIHN0YXRpYyBzZXRNYXhWYWx1ZXModzogbnVtYmVyLCBoOiBudW1iZXIpIHtcbiAgICBQb3NpdGlvbi5tYXhXaWR0aCA9IHc7XG4gICAgUG9zaXRpb24ubWF4SGVpZ2h0ID0gaDtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgZ2V0UmFuZG9tKHdpZHRoOiBudW1iZXIgPSAtMSwgaGVpZ2h0OiBudW1iZXIgPSAtMSk6IFBvc2l0aW9uIHtcbiAgICBpZiAod2lkdGggPT09IC0xKSB7XG4gICAgICB3aWR0aCA9IFBvc2l0aW9uLm1heFdpZHRoO1xuICAgIH1cbiAgICBpZiAoaGVpZ2h0ID09PSAtMSkge1xuICAgICAgaGVpZ2h0ID0gUG9zaXRpb24ubWF4SGVpZ2h0O1xuICAgIH1cbiAgICB2YXIgeCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHdpZHRoKTtcbiAgICB2YXIgeSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGhlaWdodCk7XG4gICAgcmV0dXJuIG5ldyBQb3NpdGlvbih4LCB5KTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgZ2V0TmVpZ2hib3Vycyhwb3M6IFBvc2l0aW9uLCB3aWR0aDogbnVtYmVyID0gLTEsIGhlaWdodDogbnVtYmVyID0gLTEsIG9ubHlDYXJkaW5hbDogYm9vbGVhbiA9IGZhbHNlKTogUG9zaXRpb25bXSB7XG4gICAgaWYgKHdpZHRoID09PSAtMSkge1xuICAgICAgd2lkdGggPSBQb3NpdGlvbi5tYXhXaWR0aDtcbiAgICB9XG4gICAgaWYgKGhlaWdodCA9PT0gLTEpIHtcbiAgICAgIGhlaWdodCA9IFBvc2l0aW9uLm1heEhlaWdodDtcbiAgICB9XG4gICAgbGV0IHggPSBwb3MueDtcbiAgICBsZXQgeSA9IHBvcy55O1xuICAgIGxldCBwb3NpdGlvbnMgPSBbXTtcbiAgICBpZiAoeCA+IDApIHtcbiAgICAgIHBvc2l0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbih4IC0gMSwgeSkpO1xuICAgIH1cbiAgICBpZiAoeCA8IHdpZHRoIC0gMSkge1xuICAgICAgcG9zaXRpb25zLnB1c2gobmV3IFBvc2l0aW9uKHggKyAxLCB5KSk7XG4gICAgfVxuICAgIGlmICh5ID4gMCkge1xuICAgICAgcG9zaXRpb25zLnB1c2gobmV3IFBvc2l0aW9uKHgsIHkgLSAxKSk7XG4gICAgfVxuICAgIGlmICh5IDwgaGVpZ2h0IC0gMSkge1xuICAgICAgcG9zaXRpb25zLnB1c2gobmV3IFBvc2l0aW9uKHgsIHkgKyAxKSk7XG4gICAgfVxuICAgIGlmICghb25seUNhcmRpbmFsKSB7XG4gICAgICBpZiAoeCA+IDAgJiYgeSA+IDApIHtcbiAgICAgICAgcG9zaXRpb25zLnB1c2gobmV3IFBvc2l0aW9uKHggLSAxLCB5IC0gMSkpO1xuICAgICAgfVxuICAgICAgaWYgKHggPiAwICYmIHkgPCBoZWlnaHQgLSAxKSB7XG4gICAgICAgIHBvc2l0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbih4IC0gMSwgeSArIDEpKTtcbiAgICAgIH1cbiAgICAgIGlmICh4IDwgd2lkdGggLSAxICYmIHkgPCBoZWlnaHQgLSAxKSB7XG4gICAgICAgIHBvc2l0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbih4ICsgMSwgeSArIDEpKTtcbiAgICAgIH1cbiAgICAgIGlmICh4IDwgd2lkdGggLSAxICYmIHkgPiAwKSB7XG4gICAgICAgIHBvc2l0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbih4ICsgMSwgeSAtIDEpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHBvc2l0aW9ucztcblxuICB9XG5cbiAgcHVibGljIHN0YXRpYyBnZXREaXJlY3Rpb25zKG9ubHlDYXJkaW5hbDogYm9vbGVhbiA9IGZhbHNlKTogUG9zaXRpb25bXSB7XG4gICAgbGV0IGRpcmVjdGlvbnM6IFBvc2l0aW9uW10gPSBbXTtcblxuICAgIGRpcmVjdGlvbnMucHVzaChuZXcgUG9zaXRpb24oIDAsIC0xKSk7XG4gICAgZGlyZWN0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbiggMCwgIDEpKTtcbiAgICBkaXJlY3Rpb25zLnB1c2gobmV3IFBvc2l0aW9uKC0xLCAgMCkpO1xuICAgIGRpcmVjdGlvbnMucHVzaChuZXcgUG9zaXRpb24oIDEsICAwKSk7XG4gICAgaWYgKCFvbmx5Q2FyZGluYWwpIHtcbiAgICAgIGRpcmVjdGlvbnMucHVzaChuZXcgUG9zaXRpb24oLTEsIC0xKSk7XG4gICAgICBkaXJlY3Rpb25zLnB1c2gobmV3IFBvc2l0aW9uKCAxLCAgMSkpO1xuICAgICAgZGlyZWN0aW9ucy5wdXNoKG5ldyBQb3NpdGlvbigtMSwgIDEpKTtcbiAgICAgIGRpcmVjdGlvbnMucHVzaChuZXcgUG9zaXRpb24oIDEsIC0xKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRpcmVjdGlvbnM7XG4gIH1cblxuICBwdWJsaWMgc3RhdGljIGFkZChhOiBQb3NpdGlvbiwgYjogUG9zaXRpb24pIHtcbiAgICByZXR1cm4gbmV3IFBvc2l0aW9uKGEueCArIGIueCwgYS55ICsgYi55KTtcbiAgfVxuXG4gIHB1YmxpYyBzdGF0aWMgZ2V0RGlhZ29uYWxPZmZzZXRzKCkge1xuICAgIHJldHVybiBbXG4gICAgICB7eDogLTEsIHk6IC0xfSwge3g6ICAxLCB5OiAgLTF9LFxuICAgICAge3g6IC0xLCB5OiAgMX0sIHt4OiAgMSwgeTogIDF9XG4gICAgXVxuICB9XG59XG4iLCJleHBvcnQgKiBmcm9tICcuL0NvbG9yJztcbmV4cG9ydCAqIGZyb20gJy4vUG9zaXRpb24nO1xuXG5leHBvcnQgbmFtZXNwYWNlIFV0aWxzIHtcbiAgLy8gQ1JDMzIgdXRpbGl0eS4gQWRhcHRlZCBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTg2Mzg5MDAvamF2YXNjcmlwdC1jcmMzMlxuICBsZXQgY3JjVGFibGU6IG51bWJlcltdO1xuICBmdW5jdGlvbiBtYWtlQ1JDVGFibGUoKSB7XG4gICAgbGV0IGM6IG51bWJlcjtcbiAgICBjcmNUYWJsZSA9IFtdO1xuICAgIGZvciAobGV0IG46IG51bWJlciA9IDA7IG4gPCAyNTY7IG4rKykge1xuICAgICAgYyA9IG47XG4gICAgICBmb3IgKGxldCBrOiBudW1iZXIgPSAwOyBrIDwgODsgaysrKSB7XG4gICAgICAgIGMgPSAoKGMgJiAxKSA/ICgweEVEQjg4MzIwIF4gKGMgPj4+IDEpKSA6IChjID4+PiAxKSk7XG4gICAgICB9XG4gICAgICBjcmNUYWJsZVtuXSA9IGM7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkTWF0cml4PFQ+KHc6IG51bWJlciwgaDogbnVtYmVyLCB2YWx1ZTogVCk6IFRbXVtdIHtcbiAgICBsZXQgcmV0OiBUW11bXSA9IFtdO1xuICAgIGZvciAoIGxldCB4OiBudW1iZXIgPSAwOyB4IDwgdzsgKyt4KSB7XG4gICAgICByZXRbeF0gPSBbXTtcbiAgICAgIGZvciAoIGxldCB5OiBudW1iZXIgPSAwOyB5IDwgaDsgKyt5KSB7XG4gICAgICAgIHJldFt4XVt5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIGNyYzMyKHN0cjogc3RyaW5nKTogbnVtYmVyIHtcbiAgICBpZiAoIWNyY1RhYmxlKSB7XG4gICAgICBtYWtlQ1JDVGFibGUoKTtcbiAgICB9XG4gICAgbGV0IGNyYzogbnVtYmVyID0gMCBeICgtMSk7XG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMCwgbGVuOiBudW1iZXIgPSBzdHIubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGNyYyA9IChjcmMgPj4+IDgpIF4gY3JjVGFibGVbKGNyYyBeIHN0ci5jaGFyQ29kZUF0KGkpKSAmIDB4RkZdO1xuICAgIH1cbiAgICByZXR1cm4gKGNyYyBeICgtMSkpID4+PiAwO1xuICB9O1xuXG4gIGV4cG9ydCBmdW5jdGlvbiB0b0NhbWVsQ2FzZShpbnB1dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gaW5wdXQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC8oXFxifF8pXFx3L2csIGZ1bmN0aW9uKG0pIHtcbiAgICAgIHJldHVybiBtLnRvVXBwZXJDYXNlKCkucmVwbGFjZSgvXy8sIFwiXCIpO1xuICAgIH0pO1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlR3VpZCgpIHtcbiAgICByZXR1cm4gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCcucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbihjKSB7XG4gICAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkqMTZ8MCwgdiA9IGMgPT0gJ3gnID8gciA6IChyJjB4M3wweDgpO1xuICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgIH0pO1xuICB9XG4gIGV4cG9ydCBmdW5jdGlvbiBnZXRSYW5kb20obWluOiBudW1iZXIsIG1heDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gZ2V0UmFuZG9tSW5kZXg8VD4oYXJyYXk6IFRbXSk6IFQge1xuICAgIHJldHVybiBhcnJheVtnZXRSYW5kb20oMCwgYXJyYXkubGVuZ3RoIC0gMSldO1xuICB9XG5cbiAgZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbWl6ZUFycmF5PFQ+KGFycmF5OiBUW10pOiBUW10ge1xuICAgIGlmIChhcnJheS5sZW5ndGggPD0gMSkgcmV0dXJuIGFycmF5O1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcmFuZG9tQ2hvaWNlSW5kZXggPSBnZXRSYW5kb20oaSwgYXJyYXkubGVuZ3RoIC0gMSk7XG5cbiAgICAgIFthcnJheVtpXSwgYXJyYXlbcmFuZG9tQ2hvaWNlSW5kZXhdXSA9IFthcnJheVtyYW5kb21DaG9pY2VJbmRleF0sIGFycmF5W2ldXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJyYXk7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gYXBwbHlNaXhpbnMoZGVyaXZlZEN0b3I6IGFueSwgYmFzZUN0b3JzOiBhbnlbXSkge1xuICAgIGJhc2VDdG9ycy5mb3JFYWNoKGJhc2VDdG9yID0+IHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGJhc2VDdG9yLnByb3RvdHlwZSkuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgICAgZGVyaXZlZEN0b3IucHJvdG90eXBlW25hbWVdID0gYmFzZUN0b3IucHJvdG90eXBlW25hbWVdO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi4vY29tcG9uZW50cyc7XG5pbXBvcnQgKiBhcyBFbnRpdGllcyBmcm9tICcuL2luZGV4JztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuaW1wb3J0IEdseXBoID0gcmVxdWlyZSgnLi4vR2x5cGgnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVdpbHkoZW5naW5lOiBFbmdpbmUpIHtcbiAgICBsZXQgd2lseSA9IG5ldyBFbnRpdGllcy5FbnRpdHkoZW5naW5lLCAnV2lseScsICdwbGF5ZXInKTtcbiAgICB3aWx5LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5QaHlzaWNzQ29tcG9uZW50KGVuZ2luZSkpO1xuICAgIHdpbHkuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLlJlbmRlcmFibGVDb21wb25lbnQoZW5naW5lLCB7XG4gICAgICBnbHlwaDogbmV3IEdseXBoKCdAJywgMHhmZmZmZmYsIDB4MDAwMDAwKVxuICAgIH0pKTtcbiAgICB3aWx5LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5FbmVyZ3lDb21wb25lbnQoZW5naW5lKSk7XG4gICAgd2lseS5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuSW5wdXRDb21wb25lbnQoZW5naW5lKSk7XG4gICAgd2lseS5hZGRDb21wb25lbnQobmV3IENvbXBvbmVudHMuUnVuZVdyaXRlckNvbXBvbmVudChlbmdpbmUpKTtcbiAgICB3aWx5LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5IZWFsdGhDb21wb25lbnQoZW5naW5lKSk7XG5cbiAgICByZXR1cm4gd2lseTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJhdChlbmdpbmU6IEVuZ2luZSkge1xuICAgIGxldCByYXQgPSBuZXcgRW50aXRpZXMuRW50aXR5KGVuZ2luZSwgJ1JhdCcsICd2ZXJtaW4nKTtcbiAgICByYXQuYWRkQ29tcG9uZW50KG5ldyBDb21wb25lbnRzLlBoeXNpY3NDb21wb25lbnQoZW5naW5lKSk7XG4gICAgcmF0LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5SZW5kZXJhYmxlQ29tcG9uZW50KGVuZ2luZSwge1xuICAgICAgZ2x5cGg6IG5ldyBHbHlwaCgncicsIDB4ZmZmZmZmLCAweDAwMDAwMClcbiAgICB9KSk7XG4gICAgcmF0LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5FbmVyZ3lDb21wb25lbnQoZW5naW5lKSk7XG4gICAgcmF0LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5Sb2FtaW5nQUlDb21wb25lbnQoZW5naW5lKSk7XG4gICAgcmF0LmFkZENvbXBvbmVudChuZXcgQ29tcG9uZW50cy5IZWFsdGhDb21wb25lbnQoZW5naW5lKSk7XG5cbiAgICByZXR1cm4gcmF0O1xufVxuIiwiaW1wb3J0ICogYXMgQ29sbGVjdGlvbnMgZnJvbSAndHlwZXNjcmlwdC1jb2xsZWN0aW9ucyc7XG5cbmltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcbmltcG9ydCAqIGFzIENvbXBvbmVudHMgZnJvbSAnLi4vY29tcG9uZW50cyc7XG5pbXBvcnQgKiBhcyBNaXhpbnMgZnJvbSAnLi4vbWl4aW5zJztcblxuaW1wb3J0IEVuZ2luZSA9IHJlcXVpcmUoJy4uL0VuZ2luZScpO1xuXG5leHBvcnQgY2xhc3MgRW50aXR5IGltcGxlbWVudHMgTWl4aW5zLklFdmVudEhhbmRsZXIge1xuICAvLyBFdmVudEhhbmRsZXIgbWl4aW5cbiAgbGlzdGVuOiAobGlzdGVuZXI6IEV2ZW50cy5MaXN0ZW5lcikgPT4gRXZlbnRzLkxpc3RlbmVyO1xuICByZW1vdmVMaXN0ZW5lcjogKGxpc3RlbmVyOiBFdmVudHMuTGlzdGVuZXIpID0+IHZvaWQ7XG4gIGVtaXQ6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiB2b2lkO1xuICBmaXJlOiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gYW55O1xuICBpczogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IGJvb2xlYW47XG4gIGdhdGhlcjogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IGFueVtdO1xuXG4gIHByaXZhdGUgX3R5cGU6IHN0cmluZztcbiAgZ2V0IHR5cGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGU7XG4gIH1cblxuICBwcml2YXRlIF9uYW1lOiBzdHJpbmc7XG4gIGdldCBuYW1lKCkge1xuICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICB9XG4gIHByaXZhdGUgX2d1aWQ6IHN0cmluZztcbiAgZ2V0IGd1aWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2d1aWQ7XG4gIH1cbiAgcHJpdmF0ZSBlbmdpbmU6IEVuZ2luZTtcbiAgcHJpdmF0ZSBjb21wb25lbnRzOiBDb21wb25lbnRzLkNvbXBvbmVudFtdO1xuXG4gIGNvbnN0cnVjdG9yKGVuZ2luZTogRW5naW5lLCBuYW1lOiBzdHJpbmcgPSAnJywgdHlwZTogc3RyaW5nID0gJycpIHtcbiAgICB0aGlzLmVuZ2luZSA9IGVuZ2luZTtcbiAgICB0aGlzLl9ndWlkID0gQ29yZS5VdGlscy5nZW5lcmF0ZUd1aWQoKTtcbiAgICB0aGlzLl9uYW1lID0gbmFtZTtcbiAgICB0aGlzLl90eXBlID0gdHlwZTtcblxuXG4gICAgdGhpcy5jb21wb25lbnRzID0gW107XG5cbiAgICB0aGlzLmVuZ2luZS5yZWdpc3RlckVudGl0eSh0aGlzKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5jb21wb25lbnRzLmZvckVhY2goKGNvbXBvbmVudCkgPT4ge1xuICAgICAgY29tcG9uZW50LmRlc3Ryb3koKTtcbiAgICAgIGNvbXBvbmVudCA9IG51bGw7XG4gICAgfSk7XG4gICAgdGhpcy5lbmdpbmUucmVtb3ZlRW50aXR5KHRoaXMpO1xuICB9XG5cbiAgYWRkQ29tcG9uZW50KGNvbXBvbmVudDogQ29tcG9uZW50cy5Db21wb25lbnQsIG9wdGlvbnM6IHtkdXJhdGlvbjogbnVtYmVyfSA9IG51bGwpIHtcbiAgICB0aGlzLmNvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuICAgIGNvbXBvbmVudC5yZWdpc3RlckVudGl0eSh0aGlzKTtcblxuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZHVyYXRpb24pIHtcbiAgICAgIGNvbnN0IGRlbGF5ZWRDb21wb25lbnRSZW1vdmVyID0gbmV3IERlbGF5ZWRDb21wb25lbnRSZW1vdmVyKCk7XG4gICAgICBkZWxheWVkQ29tcG9uZW50UmVtb3Zlci50cmlnZ2VyVHVybiA9IHRoaXMuZW5naW5lLmN1cnJlbnRUdXJuICsgb3B0aW9ucy5kdXJhdGlvbjtcbiAgICAgIGRlbGF5ZWRDb21wb25lbnRSZW1vdmVyLmVudGl0eSA9IHRoaXM7XG4gICAgICBkZWxheWVkQ29tcG9uZW50UmVtb3Zlci5lbmdpbmUgPSB0aGlzLmVuZ2luZTtcbiAgICAgIGRlbGF5ZWRDb21wb25lbnRSZW1vdmVyLmd1aWQgPSBjb21wb25lbnQuZ3VpZDtcbiAgICAgIGRlbGF5ZWRDb21wb25lbnRSZW1vdmVyLmxpc3RlbmVyID0gdGhpcy5lbmdpbmUubGlzdGVuKG5ldyBFdmVudHMuTGlzdGVuZXIoXG4gICAgICAgICd0dXJuJyxcbiAgICAgICAgZGVsYXllZENvbXBvbmVudFJlbW92ZXIuY2hlY2suYmluZChkZWxheWVkQ29tcG9uZW50UmVtb3ZlcilcbiAgICAgICkpO1xuICAgIH1cbiAgfVxuXG4gIGhhc0NvbXBvbmVudChjb21wb25lbnRUeXBlKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY29tcG9uZW50cy5maWx0ZXIoKGNvbXBvbmVudCkgPT4ge1xuICAgICAgcmV0dXJuIGNvbXBvbmVudCBpbnN0YW5jZW9mIGNvbXBvbmVudFR5cGU7XG4gICAgfSkubGVuZ3RoID4gMDtcbiAgfVxuXG4gIGdldENvbXBvbmVudChjb21wb25lbnRUeXBlKTogQ29tcG9uZW50cy5Db21wb25lbnQge1xuICAgIGxldCBjb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudHMuZmlsdGVyKChjb21wb25lbnQpID0+IHtcbiAgICAgIHJldHVybiBjb21wb25lbnQgaW5zdGFuY2VvZiBjb21wb25lbnRUeXBlO1xuICAgIH0pO1xuICAgIGlmIChjb21wb25lbnQubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBvbmVudFswXTtcbiAgfVxuXG4gIHJlbW92ZUNvbXBvbmVudChndWlkOiBzdHJpbmcpIHtcbiAgICBjb25zdCBpZHggPSB0aGlzLmNvbXBvbmVudHMuZmluZEluZGV4KChjb21wb25lbnQpID0+IHtcbiAgICAgIHJldHVybiBjb21wb25lbnQuZ3VpZCA9PT0gZ3VpZDtcbiAgICB9KTtcbiAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgIHRoaXMuY29tcG9uZW50c1tpZHhdLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuY29tcG9uZW50cy5zcGxpY2UoaWR4LCAxKTtcbiAgICB9XG4gIH1cblxufVxuXG5jbGFzcyBEZWxheWVkQ29tcG9uZW50UmVtb3ZlciB7XG4gIHRyaWdnZXJUdXJuOiBudW1iZXI7XG4gIGxpc3RlbmVyOiBFdmVudHMuTGlzdGVuZXI7XG4gIGVudGl0eTogRW50aXR5O1xuICBlbmdpbmU6IEVuZ2luZTtcbiAgZ3VpZDogc3RyaW5nO1xuICBjaGVjayhldmVudDogRXZlbnRzLkV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LmRhdGEuY3VycmVudFR1cm4gPj0gdGhpcy50cmlnZ2VyVHVybikge1xuICAgICAgdGhpcy5lbnRpdHkucmVtb3ZlQ29tcG9uZW50KHRoaXMuZ3VpZCk7XG4gICAgICB0aGlzLmVuZ2luZS5yZW1vdmVMaXN0ZW5lcih0aGlzLmxpc3RlbmVyKTtcbiAgICB9XG4gIH1cbn1cblxuQ29yZS5VdGlscy5hcHBseU1peGlucyhFbnRpdHksIFtNaXhpbnMuRXZlbnRIYW5kbGVyXSk7XG4iLCJleHBvcnQgKiBmcm9tICcuL0NyZWF0b3InO1xuZXhwb3J0ICogZnJvbSAnLi9FbnRpdHknO1xuIiwiZXhwb3J0IGNsYXNzIEV2ZW50IHtcbiAgcHVibGljIHR5cGU6IHN0cmluZztcbiAgcHVibGljIGRhdGE6IGFueTtcblxuICBjb25zdHJ1Y3Rvcih0eXBlOiBzdHJpbmcsIGRhdGE6IGFueSA9IG51bGwpIHtcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi9pbmRleCc7XG5cbmV4cG9ydCBjbGFzcyBMaXN0ZW5lciB7XG4gIHB1YmxpYyB0eXBlOiBzdHJpbmc7XG4gIHB1YmxpYyBwcmlvcml0eTogbnVtYmVyO1xuICBwdWJsaWMgY2FsbGJhY2s6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiBhbnk7XG4gIHB1YmxpYyBndWlkOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IodHlwZTogc3RyaW5nLCBjYWxsYmFjazogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IGFueSwgcHJpb3JpdHk6IG51bWJlciA9IDEwMCwgZ3VpZDogc3RyaW5nID0gbnVsbCkge1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5wcmlvcml0eSA9IHByaW9yaXR5O1xuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB0aGlzLmd1aWQgPSBndWlkIHx8IENvcmUuVXRpbHMuZ2VuZXJhdGVHdWlkKCk7XG4gIH1cbn1cbiIsImV4cG9ydCAqIGZyb20gJy4vRXZlbnQnO1xuZXhwb3J0ICogZnJvbSAnLi9JTGlzdGVuZXInO1xuZXhwb3J0ICogZnJvbSAnLi9MaXN0ZW5lcic7XG4iLCJpbXBvcnQgKiBhcyBDb3JlIGZyb20gJy4uL2NvcmUnO1xuXG5leHBvcnQgY2xhc3MgRm9WIHtcbiAgcHJpdmF0ZSB2aXNpYmxpdHlDaGVjazogKHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uKSA9PiBib29sZWFuO1xuICBwcml2YXRlIHdpZHRoOiBudW1iZXI7XG4gIHByaXZhdGUgaGVpZ2h0OiBudW1iZXI7XG4gIHByaXZhdGUgcmFkaXVzOiBudW1iZXI7XG4gIFxuICBwcml2YXRlIHN0YXJ0UG9zaXRpb246IENvcmUuUG9zaXRpb247XG4gIHByaXZhdGUgbGlnaHRNYXA6IG51bWJlcltdW107XG5cbiAgY29uc3RydWN0b3IodmlzaWJsaXR5Q2hlY2s6IChwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbikgPT4gYm9vbGVhbiwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIHJhZGl1czogbnVtYmVyKSB7XG4gICAgdGhpcy52aXNpYmxpdHlDaGVjayA9IHZpc2libGl0eUNoZWNrO1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcbiAgfVxuXG4gIGNhbGN1bGF0ZShwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbikge1xuICAgIHRoaXMuc3RhcnRQb3NpdGlvbiA9IHBvc2l0aW9uO1xuICAgIHRoaXMubGlnaHRNYXAgPSBDb3JlLlV0aWxzLmJ1aWxkTWF0cml4PG51bWJlcj4odGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIDApO1xuXG4gICAgaWYgKCF0aGlzLnZpc2libGl0eUNoZWNrKHBvc2l0aW9uKSkge1xuICAgICAgcmV0dXJuIHRoaXMubGlnaHRNYXA7XG4gICAgfVxuXG4gICAgdGhpcy5saWdodE1hcFtwb3NpdGlvbi54XVtwb3NpdGlvbi55XSA9IDE7XG4gICAgQ29yZS5Qb3NpdGlvbi5nZXREaWFnb25hbE9mZnNldHMoKS5mb3JFYWNoKChvZmZzZXQpID0+IHtcbiAgICAgIHRoaXMuY2FzdExpZ2h0KDEsIDEuMCwgMC4wLCAwLCBvZmZzZXQueCwgb2Zmc2V0LnksIDApO1xuICAgICAgdGhpcy5jYXN0TGlnaHQoMSwgMS4wLCAwLjAsIG9mZnNldC54LCAwLCAwLCBvZmZzZXQueSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcy5saWdodE1hcDtcbiAgfVxuXG4gIHByaXZhdGUgY2FzdExpZ2h0KHJvdzogbnVtYmVyLCBzdGFydDogbnVtYmVyLCBlbmQ6IG51bWJlciwgeHg6IG51bWJlciwgeHk6IG51bWJlciwgeXg6IG51bWJlciwgeXk6IG51bWJlcikge1xuICAgIGxldCBuZXdTdGFydCA9IDA7XG4gICAgbGV0IGJsb2NrZWQgPSBmYWxzZTtcblxuICAgIGlmIChzdGFydCA8IGVuZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvciAobGV0IGRpc3RhbmNlID0gcm93OyBkaXN0YW5jZSA8PSB0aGlzLnJhZGl1cyAmJiAhYmxvY2tlZDsgZGlzdGFuY2UrKykge1xuICAgICAgbGV0IGRlbHRhWSA9IC1kaXN0YW5jZTtcbiAgICAgIGZvciAobGV0IGRlbHRhWCA9IC1kaXN0YW5jZTsgZGVsdGFYIDw9IDA7IGRlbHRhWCsrKSB7XG4gICAgICAgIGxldCBjeCA9IHRoaXMuc3RhcnRQb3NpdGlvbi54ICsgKGRlbHRhWCAqIHh4KSArIChkZWx0YVkgKiB4eSk7XG4gICAgICAgIGxldCBjeSA9IHRoaXMuc3RhcnRQb3NpdGlvbi55ICsgKGRlbHRhWCAqIHl4KSArIChkZWx0YVkgKiB5eSk7XG5cbiAgICAgICAgbGV0IGxlZnRTbG9wZSA9IChkZWx0YVggLSAwLjUpIC8gKGRlbHRhWSArIDAuNSk7XG4gICAgICAgIGxldCByaWdodFNsb3BlID0gKGRlbHRhWCArIDAuNSkgLyAoZGVsdGFZIC0gMC41KTtcblxuICAgICAgICBpZiAoIShjeCA+PSAwICYmIGN5ID49IDAgJiYgY3ggPCB0aGlzLndpZHRoICYmIGN5IDwgdGhpcy5oZWlnaHQpIHx8IHN0YXJ0IDwgcmlnaHRTbG9wZSkge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGVuZCA+IGxlZnRTbG9wZSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGRpc3QgPSBNYXRoLm1heChNYXRoLmFicyhkZWx0YVgpLCBNYXRoLmFicyhkZWx0YVkpKTtcblxuICAgICAgICBpZiAoZGlzdCA8PSB0aGlzLnJhZGl1cykge1xuICAgICAgICAgIHRoaXMubGlnaHRNYXBbY3hdW2N5XSA9IDE7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYmxvY2tlZCkge1xuICAgICAgICAgIGlmICghdGhpcy52aXNpYmxpdHlDaGVjayhuZXcgQ29yZS5Qb3NpdGlvbihjeCwgY3kpKSkge1xuICAgICAgICAgICAgbmV3U3RhcnQgPSByaWdodFNsb3BlO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJsb2NrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHN0YXJ0ID0gbmV3U3RhcnQ7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnZpc2libGl0eUNoZWNrKG5ldyBDb3JlLlBvc2l0aW9uKGN4LCBjeSkpICYmIGRpc3RhbmNlIDw9IHRoaXMucmFkaXVzKSB7XG4gICAgICAgICAgYmxvY2tlZCA9IHRydWU7XG4gICAgICAgICAgdGhpcy5jYXN0TGlnaHQoZGlzdGFuY2UgKyAxLCBzdGFydCwgbGVmdFNsb3BlLCB4eCwgeHksIHl4LCB5eSk7XG4gICAgICAgICAgbmV3U3RhcnQgPSByaWdodFNsb3BlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBNYXAgZnJvbSAnLi9pbmRleCc7XG5cbmV4cG9ydCBjbGFzcyBNYXplUmVjdXJzaXZlQmFja3RyYWNrR2VuZXJhdG9yIHtcbiAgcHJpdmF0ZSB3aWR0aDogbnVtYmVyO1xuICBwcml2YXRlIGhlaWdodDogbnVtYmVyO1xuXG4gIHByaXZhdGUgbWF4QXR0ZW1wczogbnVtYmVyO1xuICBwcml2YXRlIGF0dGVtcHRzOiBudW1iZXI7XG5cbiAgcHJpdmF0ZSBzdGFjazogQ29yZS5Qb3NpdGlvbltdO1xuXG4gIHByaXZhdGUgbWFwOiBudW1iZXJbXVtdO1xuXG4gIGNvbnN0cnVjdG9yKG1hcDogbnVtYmVyW11bXSwgcG9zaXRpb246IENvcmUuUG9zaXRpb24pIHtcbiAgICB0aGlzLm1hcCA9IG1hcDtcbiAgICB0aGlzLndpZHRoID0gdGhpcy5tYXAubGVuZ3RoO1xuICAgIHRoaXMuaGVpZ2h0ID0gdGhpcy5tYXBbMF0ubGVuZ3RoO1xuXG4gICAgdGhpcy5tYXhBdHRlbXBzID0gNTAwMDA7XG4gICAgdGhpcy5hdHRlbXB0cyA9IDA7XG5cbiAgICB0aGlzLnN0YWNrID0gW107XG4gICAgdGhpcy5tYXBbcG9zaXRpb24ueF1bcG9zaXRpb24ueV0gPSAwO1xuICAgIHRoaXMucG9wdWxhdGVTdGFjayhwb3NpdGlvbik7XG4gIH1cblxuICBwcml2YXRlIHBvcHVsYXRlU3RhY2socG9zaXRpb246IENvcmUuUG9zaXRpb24pIHtcbiAgICBjb25zdCBuZWlnaGJvdXJzID0gQ29yZS5Qb3NpdGlvbi5nZXROZWlnaGJvdXJzKHBvc2l0aW9uLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgdHJ1ZSk7XG4gICAgY29uc3QgbmV3Q2VsbHMgPSBbXTtcbiAgICBmb3IgKGxldCBkaXJlY3Rpb24gaW4gbmVpZ2hib3Vycykge1xuICAgICAgY29uc3QgcG9zaXRpb24gPSBuZWlnaGJvdXJzW2RpcmVjdGlvbl07XG4gICAgICBpZiAocG9zaXRpb24gJiYgTWFwLlV0aWxzLmNhbkNhcnZlKHRoaXMubWFwLCBwb3NpdGlvbiwgMSkpIHtcbiAgICAgICAgbmV3Q2VsbHMucHVzaChwb3NpdGlvbik7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChuZXdDZWxscy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnN0YWNrID0gdGhpcy5zdGFjay5jb25jYXQoQ29yZS5VdGlscy5yYW5kb21pemVBcnJheShuZXdDZWxscykpO1xuICAgIH1cbiAgfVxuXG4gIGl0ZXJhdGUoKSB7XG4gICAgdGhpcy5hdHRlbXB0cysrO1xuXG4gICAgaWYgKHRoaXMuYXR0ZW1wdHMgPiB0aGlzLm1heEF0dGVtcHMpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdtYXggYXR0ZW1wdHMgZG9uZScpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGxldCBwb3M6IENvcmUuUG9zaXRpb247XG4gICAgd2hpbGUgKHRoaXMuc3RhY2sgJiYgdGhpcy5zdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICBwb3MgPSB0aGlzLnN0YWNrLnBvcCgpO1xuXG4gICAgICBpZiAoTWFwLlV0aWxzLmNhbkV4dGVuZFR1bm5lbCh0aGlzLm1hcCwgcG9zKSkge1xuICAgICAgICB0aGlzLm1hcFtwb3MueF1bcG9zLnldID0gMDtcbiAgICAgICAgdGhpcy5wb3B1bGF0ZVN0YWNrKHBvcyk7XG5cbiAgICAgICAgcmV0dXJuIHBvczsgXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZ2V0TWFwKCkge1xuICAgIHJldHVybiB0aGlzLm1hcDtcbiAgfVxufVxuIiwiaW1wb3J0ICogYXMgQ29yZSBmcm9tICcuLi9jb3JlJztcbmltcG9ydCAqIGFzIE1hcCBmcm9tICcuL2luZGV4JztcblxuZXhwb3J0IGNsYXNzIFJvb21HZW5lcmF0b3Ige1xuICBwcml2YXRlIG1hcDogbnVtYmVyW11bXTtcblxuICBwcml2YXRlIHdpZHRoOiBudW1iZXI7XG4gIHByaXZhdGUgaGVpZ2h0OiBudW1iZXI7XG5cbiAgcHJpdmF0ZSBtYXhBdHRlbXB0czogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKG1hcDogbnVtYmVyW11bXSwgbWF4QXR0ZW1wdHM6IG51bWJlciA9IDUwMCkge1xuICAgIHRoaXMubWFwID0gbWFwO1xuXG4gICAgdGhpcy53aWR0aCA9IHRoaXMubWFwLmxlbmd0aDtcbiAgICB0aGlzLmhlaWdodCA9IHRoaXMubWFwWzBdLmxlbmd0aDtcblxuICAgIHRoaXMubWF4QXR0ZW1wdHMgPSBtYXhBdHRlbXB0cztcbiAgfVxuXG4gIHByaXZhdGUgaXNTcGFjZUF2YWlsYWJsZSh4OiBudW1iZXIsIHk6IG51bWJlciwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICBmb3IgKGxldCBpID0geDsgaSA8IHggKyB3aWR0aDsgaSsrKSB7XG4gICAgICBmb3IgKGxldCBqID0geTsgaiA8IHkgKyBoZWlnaHQ7IGorKykge1xuICAgICAgICBpZiAoIU1hcC5VdGlscy5jYW5DYXJ2ZSh0aGlzLm1hcCwgbmV3IENvcmUuUG9zaXRpb24oaSwgaiksIDAsIHRydWUpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaXRlcmF0ZSgpIHtcbiAgICBsZXQgcm9vbUdlbmVyYXRlZCA9IGZhbHNlO1xuICAgIGxldCBhdHRlbXB0cyA9IDA7XG4gICAgd2hpbGUgKCFyb29tR2VuZXJhdGVkICYmIGF0dGVtcHRzIDwgdGhpcy5tYXhBdHRlbXB0cykge1xuICAgICAgcm9vbUdlbmVyYXRlZCA9IHRoaXMuZ2VuZXJhdGVSb29tKCk7XG4gICAgICBhdHRlbXB0cysrXG4gICAgfVxuXG4gICAgcmV0dXJuIHJvb21HZW5lcmF0ZWQ7XG4gIH1cblxuICBwcml2YXRlIGdlbmVyYXRlUm9vbSgpIHtcbiAgICBjb25zdCBzaXplID0gQ29yZS5VdGlscy5nZXRSYW5kb20oMywgNSk7XG4gICAgY29uc3QgcmVjdGFuZ3VsYXJpdHkgPSBDb3JlLlV0aWxzLmdldFJhbmRvbSgxLCAzKTtcbiAgICBsZXQgd2lkdGg6IG51bWJlcjtcbiAgICBsZXQgaGVpZ2h0OiBudW1iZXI7XG4gICAgaWYgKE1hdGgucmFuZG9tKCkgPiAwLjUpIHtcbiAgICAgIGhlaWdodCA9IHNpemU7XG4gICAgICB3aWR0aCA9IHNpemUgKyByZWN0YW5ndWxhcml0eTtcbiAgICB9IGVsc2Uge1xuICAgICAgd2lkdGggPSBzaXplO1xuICAgICAgaGVpZ2h0ID0gc2l6ZSArIHJlY3Rhbmd1bGFyaXR5O1xuICAgIH1cblxuICAgIGxldCB4ID0gQ29yZS5VdGlscy5nZXRSYW5kb20oMCwgKHRoaXMud2lkdGggLSB3aWR0aCAtIDIpKTtcbiAgICB4ID0gTWF0aC5mbG9vcih4LzIpICogMiArIDE7XG4gICAgbGV0IHkgPSBDb3JlLlV0aWxzLmdldFJhbmRvbSgwLCAodGhpcy5oZWlnaHQgLSBoZWlnaHQgLSAyKSk7XG4gICAgeSA9IE1hdGguZmxvb3IoeS8yKSAqIDIgKyAxO1xuXG4gICAgaWYgKHRoaXMuaXNTcGFjZUF2YWlsYWJsZSh4LCB5LCB3aWR0aCwgaGVpZ2h0KSkge1xuICAgICAgICBmb3IgKHZhciBpID0geDsgaSA8IHggKyB3aWR0aDsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBqID0geTsgaiA8IHkgKyBoZWlnaHQ7IGorKykge1xuICAgICAgICAgICAgICB0aGlzLm1hcFtpXVtqXSA9IDA7ICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGdldE1hcCgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXA7XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5pbXBvcnQgKiBhcyBNYXAgZnJvbSAnLi9pbmRleCc7XG5cbmV4cG9ydCBjbGFzcyBUb3BvbG9neUNvbWJpbmF0b3Ige1xuICBwcml2YXRlIG1hcDogbnVtYmVyW11bXTtcbiAgcHJpdmF0ZSB0b3BvbG9naWVzOiBudW1iZXJbXVtdO1xuXG4gIHByaXZhdGUgd2lkdGg6IG51bWJlcjtcbiAgcHJpdmF0ZSBoZWlnaHQ6IG51bWJlcjtcblxuICBwcml2YXRlIHRvcG9sb2d5SWQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihtYXA6IG51bWJlcltdW10pIHtcbiAgICB0aGlzLm1hcCA9IG1hcDtcblxuICAgIHRoaXMud2lkdGggPSB0aGlzLm1hcC5sZW5ndGg7XG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLm1hcFswXS5sZW5ndGg7XG5cbiAgICB0aGlzLnRvcG9sb2dpZXMgPSBbXTtcblxuICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICB0aGlzLnRvcG9sb2dpZXNbeF0gPSBbXTtcbiAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICB0aGlzLnRvcG9sb2dpZXNbeF1beV0gPSAwO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldE1hcCgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXA7XG4gIH1cblxuICBpbml0aWFsaXplKCk6IG51bWJlcltdW10ge1xuICAgIHRoaXMudG9wb2xvZ3lJZCA9IDA7XG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICB0aGlzLmFkZFRvcG9sb2d5KG5ldyBDb3JlLlBvc2l0aW9uKHgsIHkpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudG9wb2xvZ2llcztcbiAgfVxuXG4gIGNvbWJpbmUoKSB7XG4gICAgbGV0IGkgPSAyO1xuICAgIGNvbnN0IG1heCA9IHRoaXMudG9wb2xvZ3lJZDtcbiAgICBsZXQgcmVtYWluaW5nVG9wb2xvZ2llcyA9IFtdO1xuICAgIGZvciAodmFyIGogPSAyOyBqIDw9IHRoaXMudG9wb2xvZ3lJZDsgaisrKSB7XG4gICAgICByZW1haW5pbmdUb3BvbG9naWVzLnB1c2goaik7XG4gICAgfVxuICAgIHdoaWxlIChyZW1haW5pbmdUb3BvbG9naWVzLmxlbmd0aCA+IDAgJiYgaSA8IG1heCAqIDUpIHtcbiAgICAgIGxldCB0b3BvbG9neUlkID0gcmVtYWluaW5nVG9wb2xvZ2llcy5zaGlmdCgpO1xuICAgICAgaSsrO1xuICAgICAgaWYgKCF0aGlzLmNvbWJpbmVUb3BvbG9neSgxLCB0b3BvbG9neUlkKSkge1xuICAgICAgICByZW1haW5pbmdUb3BvbG9naWVzLnB1c2godG9wb2xvZ3lJZCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZW1haW5pbmdUb3BvbG9naWVzLmxlbmd0aDtcbiAgfVxuXG4gIHByaXZhdGUgY29tYmluZVRvcG9sb2d5KGE6IG51bWJlciwgYjogbnVtYmVyKSB7XG4gICAgY29uc3QgZWRnZXMgPSB0aGlzLmdldEVkZ2VzKGEsIGIpO1xuICAgIGlmIChlZGdlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgY29tYmluZWQgPSBmYWxzZTtcblxuICAgIHdoaWxlICghY29tYmluZWQgJiYgZWRnZXMubGVuZ3RoID4gMCkge1xuICAgICAgbGV0IGlkeCA9IENvcmUuVXRpbHMuZ2V0UmFuZG9tKDAsIGVkZ2VzLmxlbmd0aCAtIDEpOyBcbiAgICAgIGxldCBlZGdlID0gZWRnZXNbaWR4XTtcbiAgICAgIGVkZ2VzLnNwbGljZShpZHgsIDEpO1xuICAgICAgbGV0IHN1cnJvdW5kaW5nVGlsZXMgPSBNYXAuVXRpbHMuY291bnRTdXJyb3VuZGluZ1RpbGVzKHRoaXMubWFwLCBlZGdlKTtcbiAgICAgIGlmIChzdXJyb3VuZGluZ1RpbGVzID09PSAyKSB7XG4gICAgICAgIHRoaXMubWFwW2VkZ2UueF1bZWRnZS55XSA9IDA7XG4gICAgICAgIHRoaXMudG9wb2xvZ2llc1tlZGdlLnhdW2VkZ2UueV0gPSBhO1xuICAgICAgICBpZiAoZWRnZXMubGVuZ3RoID49IDQpIHtcbiAgICAgICAgICBpZiAoTWF0aC5yYW5kb20oKSA+IDAuMikge1xuICAgICAgICAgICAgY29tYmluZWQgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb21iaW5lZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY29tYmluZWQpIHtcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgIGlmICh0aGlzLnRvcG9sb2dpZXNbeF1beV0gPT09IGIpIHtcbiAgICAgICAgICAgIHRoaXMudG9wb2xvZ2llc1t4XVt5XSA9IGE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjb21iaW5lZDtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0RWRnZXMoYTogbnVtYmVyLCBiOiBudW1iZXIpIHtcbiAgICBjb25zdCBoYXNUb3BvbG9neU5laWdoYm91ciA9IChwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbiwgdG9wb2xvZ3lJZDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCBuZWlnaGJvdXJzID0gQ29yZS5Qb3NpdGlvbi5nZXROZWlnaGJvdXJzKHBvc2l0aW9uLCAtMSwgLTEsIHRydWUpO1xuICAgICAgcmV0dXJuIG5laWdoYm91cnMuZmlsdGVyKChwb3NpdGlvbikgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy50b3BvbG9naWVzW3Bvc2l0aW9uLnhdW3Bvc2l0aW9uLnldID09PSB0b3BvbG9neUlkXG4gICAgICB9KS5sZW5ndGggPiAwO1xuICAgIH1cbiAgICBsZXQgZWRnZXMgPSBbXTtcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgIGxldCBwb3NpdGlvbiA9IG5ldyBDb3JlLlBvc2l0aW9uKHgsIHkpO1xuICAgICAgICBpZiAoaGFzVG9wb2xvZ3lOZWlnaGJvdXIocG9zaXRpb24sIGEpICYmIGhhc1RvcG9sb2d5TmVpZ2hib3VyKHBvc2l0aW9uLCBiKSkge1xuICAgICAgICAgIGVkZ2VzLnB1c2gocG9zaXRpb24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBlZGdlcztcbiAgfVxuXG4gIHByaXZhdGUgYWRkVG9wb2xvZ3kocG9zaXRpb246IENvcmUuUG9zaXRpb24sIHRvcG9sb2d5SWQ6IG51bWJlciA9IC0xKSB7XG4gICAgY29uc3QgeCA9IHBvc2l0aW9uLng7XG4gICAgY29uc3QgeSA9IHBvc2l0aW9uLnk7XG4gICAgaWYgKHRoaXMubWFwW3hdW3ldICE9PSAwIHx8IHRoaXMudG9wb2xvZ2llc1t4XVt5XSAhPT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0b3BvbG9neUlkID09PSAtMSkge1xuICAgICAgdGhpcy50b3BvbG9neUlkKys7XG4gICAgICB0b3BvbG9neUlkID0gdGhpcy50b3BvbG9neUlkO1xuICAgIH1cblxuICAgIHRoaXMudG9wb2xvZ2llc1t4XVt5XSA9IHRvcG9sb2d5SWQ7XG5cbiAgICBjb25zdCBuZWlnaGJvdXJzID0gQ29yZS5Qb3NpdGlvbi5nZXROZWlnaGJvdXJzKG5ldyBDb3JlLlBvc2l0aW9uKHgsIHkpLCAtMSwgLTEsIHRydWUpO1xuICAgIG5laWdoYm91cnMuZm9yRWFjaCgocG9zaXRpb24pID0+IHtcbiAgICAgIGlmICh0aGlzLm1hcFtwb3NpdGlvbi54XVtwb3NpdGlvbi55XSA9PT0gMCAmJiB0aGlzLnRvcG9sb2dpZXNbcG9zaXRpb24ueF1bcG9zaXRpb24ueV0gPT09IDApIHtcbiAgICAgICAgdGhpcy5hZGRUb3BvbG9neShwb3NpdGlvbiwgdG9wb2xvZ3lJZCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHBydW5lRGVhZEVuZChwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbikge1xuICAgIGlmICh0aGlzLm1hcFtwb3NpdGlvbi54XVtwb3NpdGlvbi55XSA9PT0gMCkge1xuICAgICAgbGV0IHN1cnJvdW5kaW5nVGlsZXMgPSBNYXAuVXRpbHMuY291bnRTdXJyb3VuZGluZ1RpbGVzKHRoaXMubWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54LCBwb3NpdGlvbi55KSk7XG4gICAgICBpZiAoc3Vycm91bmRpbmdUaWxlcyA8PSAxKSB7XG4gICAgICAgIHRoaXMubWFwW3Bvc2l0aW9uLnhdW3Bvc2l0aW9uLnldID0gMTtcbiAgICAgICAgQ29yZS5Qb3NpdGlvbi5nZXROZWlnaGJvdXJzKHBvc2l0aW9uLCAtMSwgLTEsIHRydWUpLmZvckVhY2goKG5laWdoYm91cikgPT4ge1xuICAgICAgICAgIHRoaXMucHJ1bmVEZWFkRW5kKG5laWdoYm91cik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHBydW5lRGVhZEVuZHMoKSB7XG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICBpZiAodGhpcy5tYXBbeF1beV0gPT09IDApIHtcbiAgICAgICAgICB0aGlzLnBydW5lRGVhZEVuZChuZXcgQ29yZS5Qb3NpdGlvbih4LCB5KSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCAqIGFzIENvcmUgZnJvbSAnLi4vY29yZSc7XG5cbmVudW0gRGlyZWN0aW9uIHtcbiAgTm9uZSA9IDEsXG4gIE5vcnRoLFxuICBFYXN0LFxuICBTb3V0aCxcbiAgV2VzdCxcbn1cblxuZXhwb3J0IG5hbWVzcGFjZSBVdGlscyB7XG4gIGZ1bmN0aW9uIGNhcnZlYWJsZShtYXA6IG51bWJlcltdW10sIHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uKSB7XG4gICAgaWYgKHBvc2l0aW9uLnggPCAwIHx8IHBvc2l0aW9uLnggPiBtYXAubGVuZ3RoIC0gMSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAocG9zaXRpb24ueSA8IDAgfHwgcG9zaXRpb24ueSA+IG1hcFswXS5sZW5ndGggLSAxKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBtYXBbcG9zaXRpb24ueF1bcG9zaXRpb24ueV0gPT09IDE7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gZmluZENhcnZlYWJsZVNwb3QobWFwOiBudW1iZXJbXVtdKSB7XG4gICAgY29uc3Qgd2lkdGggPSBtYXAubGVuZ3RoO1xuICAgIGNvbnN0IGhlaWdodCA9IG1hcFswXS5sZW5ndGg7XG5cbiAgICBsZXQgcG9zaXRpb24gPSBudWxsO1xuXG4gICAgbGV0IGNhcnZhYmxlc1Bvc2l0aW9ucyA9IFtdO1xuXG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG4gICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XG4gICAgICAgIGxldCBwb3NpdGlvbiA9IG5ldyBDb3JlLlBvc2l0aW9uKENvcmUuVXRpbHMuZ2V0UmFuZG9tKDAsIHdpZHRoKSwgQ29yZS5VdGlscy5nZXRSYW5kb20oMCwgaGVpZ2h0KSk7XG4gICAgICAgIGlmIChVdGlscy5jYW5DYXJ2ZShtYXAsIHBvc2l0aW9uLCAwLCB0cnVlKSkge1xuICAgICAgICAgIGNhcnZhYmxlc1Bvc2l0aW9ucy5wdXNoKHBvc2l0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjYXJ2YWJsZXNQb3NpdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIENvcmUuVXRpbHMuZ2V0UmFuZG9tSW5kZXgoY2FydmFibGVzUG9zaXRpb25zKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gY291bnRTdXJyb3VuZGluZ1RpbGVzKG1hcDogbnVtYmVyW11bXSwgcG9zaXRpb246IENvcmUuUG9zaXRpb24sIGNoZWNrRGlhZ29uYWxzOiBib29sZWFuID0gZmFsc2UpOiBudW1iZXIge1xuICAgIGxldCBjb25uZWN0aW9ucyA9IDA7XG4gICAgcmV0dXJuIENvcmUuUG9zaXRpb24uZ2V0TmVpZ2hib3Vycyhwb3NpdGlvbiwgbWFwLmxlbmd0aCwgbWFwWzBdLmxlbmd0aCwgIWNoZWNrRGlhZ29uYWxzKS5maWx0ZXIoKHBvcykgPT4ge1xuICAgICAgcmV0dXJuIG1hcFtwb3MueF1bcG9zLnldID09PSAwO1xuICAgIH0pLmxlbmd0aDtcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBjYW5DYXJ2ZShtYXA6IG51bWJlcltdW10sIHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uLCBhbGxvd2VkQ29ubmVjdGlvbnM6IG51bWJlciA9IDAsIGNoZWNrRGlhZ29uYWxzOiBib29sZWFuID0gZmFsc2UpOiBib29sZWFuIHtcbiAgICBpZiAoIWNhcnZlYWJsZShtYXAsIHBvc2l0aW9uKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jb3VudFN1cnJvdW5kaW5nVGlsZXMobWFwLCBwb3NpdGlvbiwgY2hlY2tEaWFnb25hbHMpIDw9IGFsbG93ZWRDb25uZWN0aW9ucztcbiAgfVxuXG4gIGV4cG9ydCBmdW5jdGlvbiBjYW5FeHRlbmRUdW5uZWwobWFwOiBudW1iZXJbXVtdLCBwb3NpdGlvbjogQ29yZS5Qb3NpdGlvbikge1xuICAgIGlmICghY2FydmVhYmxlKG1hcCwgcG9zaXRpb24pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGxldCBjb25uZWN0ZWRGcm9tID0gRGlyZWN0aW9uLk5vbmU7XG4gICAgbGV0IGNvbm5lY3Rpb25zID0gMDtcblxuICAgIGlmIChwb3NpdGlvbi55ID4gMCAmJiBtYXBbcG9zaXRpb24ueF1bcG9zaXRpb24ueSAtIDFdID09PSAwKSB7XG4gICAgICBjb25uZWN0ZWRGcm9tID0gRGlyZWN0aW9uLk5vcnRoO1xuICAgICAgY29ubmVjdGlvbnMrKztcbiAgICB9XG4gICAgaWYgKHBvc2l0aW9uLnkgPCBtYXBbMF0ubGVuZ3RoIC0gMSAmJiBtYXBbcG9zaXRpb24ueF1bcG9zaXRpb24ueSArIDFdID09PSAwKSB7XG4gICAgICBjb25uZWN0ZWRGcm9tID0gRGlyZWN0aW9uLlNvdXRoO1xuICAgICAgY29ubmVjdGlvbnMrKztcbiAgICB9XG4gICAgaWYgKHBvc2l0aW9uLnggPiAwICYmIG1hcFtwb3NpdGlvbi54IC0gMV1bcG9zaXRpb24ueV0gPT09IDApIHtcbiAgICAgIGNvbm5lY3RlZEZyb20gPSBEaXJlY3Rpb24uV2VzdDtcbiAgICAgIGNvbm5lY3Rpb25zKys7XG4gICAgfVxuICAgIGlmIChwb3NpdGlvbi54IDwgbWFwLmxlbmd0aCAtIDEgJiYgbWFwW3Bvc2l0aW9uLnggKyAxXVtwb3NpdGlvbi55XSA9PT0gMCkge1xuICAgICAgY29ubmVjdGVkRnJvbSA9IERpcmVjdGlvbi5FYXN0O1xuICAgICAgY29ubmVjdGlvbnMrKztcbiAgICB9XG5cbiAgICBpZiAoY29ubmVjdGlvbnMgPiAxKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNhbkV4dGVuZFR1bm5lbEZyb20obWFwLCBwb3NpdGlvbiwgY29ubmVjdGVkRnJvbSk7XG4gIH1cblxuICBleHBvcnQgZnVuY3Rpb24gY2FuRXh0ZW5kVHVubmVsRnJvbShtYXA6IG51bWJlcltdW10sIHBvc2l0aW9uOiBDb3JlLlBvc2l0aW9uLCBkaXJlY3Rpb246IERpcmVjdGlvbikge1xuICAgIGlmIChtYXBbcG9zaXRpb24ueF1bcG9zaXRpb24ueV0gPT09IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xuICAgICAgY2FzZSBEaXJlY3Rpb24uU291dGg6XG4gICAgICAgIHJldHVybiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54IC0gMSwgcG9zaXRpb24ueSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCAtIDEsIHBvc2l0aW9uLnkgLSAxKSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54LCBwb3NpdGlvbi55IC0gMSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCArIDEsIHBvc2l0aW9uLnkgLSAxKSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54ICsgMSwgcG9zaXRpb24ueSkpO1xuICAgICAgY2FzZSBEaXJlY3Rpb24uTm9ydGg6XG4gICAgICAgIHJldHVybiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54ICsgMSwgcG9zaXRpb24ueSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCArIDEsIHBvc2l0aW9uLnkgKyAxKSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54LCBwb3NpdGlvbi55ICsgMSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCAtIDEsIHBvc2l0aW9uLnkgKyAxKSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54IC0gMSwgcG9zaXRpb24ueSkpO1xuICAgICAgY2FzZSBEaXJlY3Rpb24uV2VzdDpcbiAgICAgICAgcmV0dXJuIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgLSAxKSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54ICsgMSwgcG9zaXRpb24ueSAtIDEpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLnggKyAxLCBwb3NpdGlvbi55KSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54ICsgMSwgcG9zaXRpb24ueSArIDEpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgKyAxKSk7XG4gICAgICBjYXNlIERpcmVjdGlvbi5FYXN0OlxuICAgICAgICByZXR1cm4gY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCwgcG9zaXRpb24ueSAtIDEpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLnggLSAxLCBwb3NpdGlvbi55IC0gMSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCAtIDEsIHBvc2l0aW9uLnkpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLnggLSAxLCBwb3NpdGlvbi55ICsgMSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCwgcG9zaXRpb24ueSArIDEpKTtcbiAgICAgIGNhc2UgRGlyZWN0aW9uLk5vbmU6XG4gICAgICAgIHJldHVybiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54LCBwb3NpdGlvbi55IC0gMSkpXG4gICAgICAgICAgICAgICAgJiYgY2FydmVhYmxlKG1hcCwgbmV3IENvcmUuUG9zaXRpb24ocG9zaXRpb24ueCAtIDEsIHBvc2l0aW9uLnkpKVxuICAgICAgICAgICAgICAgICYmIGNhcnZlYWJsZShtYXAsIG5ldyBDb3JlLlBvc2l0aW9uKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgKyAxKSlcbiAgICAgICAgICAgICAgICAmJiBjYXJ2ZWFibGUobWFwLCBuZXcgQ29yZS5Qb3NpdGlvbihwb3NpdGlvbi54ICsgMSwgcG9zaXRpb24ueSkpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cbiIsImV4cG9ydCAqIGZyb20gJy4vUm9vbUdlbmVyYXRvcic7XG5leHBvcnQgKiBmcm9tICcuL01hemVSZWN1cnNpdmVCYWNrdHJhY2tHZW5lcmF0b3InO1xuZXhwb3J0ICogZnJvbSAnLi9VdGlscyc7XG5leHBvcnQgKiBmcm9tICcuL0ZvVic7XG5leHBvcnQgKiBmcm9tICcuL1RvcG9sb2d5Q29tYmluYXRvcic7XG4iLCJpbXBvcnQgKiBhcyBFdmVudHMgZnJvbSAnLi4vZXZlbnRzJztcblxuZXhwb3J0IGludGVyZmFjZSBJRXZlbnRIYW5kbGVyIHtcbiAgbGlzdGVuOiAobGlzdGVuZXI6IEV2ZW50cy5MaXN0ZW5lcikgPT4gRXZlbnRzLkxpc3RlbmVyO1xuICByZW1vdmVMaXN0ZW5lcjogKGxpc3RlbmVyOiBFdmVudHMuTGlzdGVuZXIpID0+IHZvaWQ7XG4gIGVtaXQ6IChldmVudDogRXZlbnRzLkV2ZW50KSA9PiB2b2lkO1xuICBmaXJlOiAoZXZlbnQ6IEV2ZW50cy5FdmVudCkgPT4gYW55O1xuICBpczogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IGJvb2xlYW47XG4gIGdhdGhlcjogKGV2ZW50OiBFdmVudHMuRXZlbnQpID0+IGFueVtdO1xufVxuXG5leHBvcnQgY2xhc3MgRXZlbnRIYW5kbGVyIGltcGxlbWVudHMgSUV2ZW50SGFuZGxlciB7XG4gIHByaXZhdGUgbGlzdGVuZXJzOiB7W2V2ZW50OiBzdHJpbmddOiBFdmVudHMuTGlzdGVuZXJbXX0gPSB7fTtcblxuICBsaXN0ZW4obGlzdGVuZXI6IEV2ZW50cy5MaXN0ZW5lcikge1xuICAgIGlmICghdGhpcy5saXN0ZW5lcnMpIHtcbiAgICAgIHRoaXMubGlzdGVuZXJzID0ge307XG4gICAgfVxuICAgIGlmICghdGhpcy5saXN0ZW5lcnNbbGlzdGVuZXIudHlwZV0pIHtcbiAgICAgIHRoaXMubGlzdGVuZXJzW2xpc3RlbmVyLnR5cGVdID0gW107XG4gICAgfVxuXG4gICAgdGhpcy5saXN0ZW5lcnNbbGlzdGVuZXIudHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gICAgdGhpcy5saXN0ZW5lcnNbbGlzdGVuZXIudHlwZV0gPSB0aGlzLmxpc3RlbmVyc1tsaXN0ZW5lci50eXBlXS5zb3J0KChhOiBFdmVudHMuTGlzdGVuZXIsIGI6IEV2ZW50cy5MaXN0ZW5lcikgPT4gYS5wcmlvcml0eSAtIGIucHJpb3JpdHkpO1xuXG4gICAgcmV0dXJuIGxpc3RlbmVyO1xuICB9XG5cbiAgcmVtb3ZlTGlzdGVuZXIobGlzdGVuZXI6IEV2ZW50cy5MaXN0ZW5lcikge1xuICAgIGlmICghdGhpcy5saXN0ZW5lcnMgfHwgIXRoaXMubGlzdGVuZXJzW2xpc3RlbmVyLnR5cGVdKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBpZHggPSB0aGlzLmxpc3RlbmVyc1tsaXN0ZW5lci50eXBlXS5maW5kSW5kZXgoKGwpID0+IHtcbiAgICAgIHJldHVybiBsLmd1aWQgPT09IGxpc3RlbmVyLmd1aWQ7XG4gICAgfSk7XG4gICAgaWYgKHR5cGVvZiBpZHggPT09ICdudW1iZXInKSB7XG4gICAgICB0aGlzLmxpc3RlbmVyc1tsaXN0ZW5lci50eXBlXS5zcGxpY2UoaWR4LCAxKTtcbiAgICB9XG4gIH1cblxuICBlbWl0KGV2ZW50OiBFdmVudHMuRXZlbnQpIHtcbiAgICBpZiAoIXRoaXMubGlzdGVuZXJzW2V2ZW50LnR5cGVdKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgbGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnNbZXZlbnQudHlwZV0ubWFwKChpKSA9PiBpKTtcblxuICAgIGxpc3RlbmVycy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgbGlzdGVuZXIuY2FsbGJhY2soZXZlbnQpO1xuICAgIH0pO1xuICB9XG5cbiAgaXMoZXZlbnQ6IEV2ZW50cy5FdmVudCk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5saXN0ZW5lcnNbZXZlbnQudHlwZV0pIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGxldCByZXR1cm5lZFZhbHVlID0gdHJ1ZTtcblxuICAgIHRoaXMubGlzdGVuZXJzW2V2ZW50LnR5cGVdLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XG4gICAgICBpZiAoIXJldHVybmVkVmFsdWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmV0dXJuZWRWYWx1ZSA9IGxpc3RlbmVyLmNhbGxiYWNrKGV2ZW50KTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmV0dXJuZWRWYWx1ZTtcbiAgfVxuXG4gIGZpcmUoZXZlbnQ6IEV2ZW50cy5FdmVudCkge1xuICAgIGlmICghdGhpcy5saXN0ZW5lcnNbZXZlbnQudHlwZV0pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxldCByZXR1cm5lZFZhbHVlID0gbnVsbDtcblxuICAgIHRoaXMubGlzdGVuZXJzW2V2ZW50LnR5cGVdLmZvckVhY2goKGxpc3RlbmVyKSA9PiB7XG4gICAgICByZXR1cm5lZFZhbHVlID0gbGlzdGVuZXIuY2FsbGJhY2soZXZlbnQpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXR1cm5lZFZhbHVlO1xuICB9XG5cbiAgZ2F0aGVyKGV2ZW50OiBFdmVudHMuRXZlbnQpOiBhbnlbXSB7XG4gICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tldmVudC50eXBlXSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIGxldCB2YWx1ZXMgPSBbXVxuXG4gICAgdGhpcy5saXN0ZW5lcnNbZXZlbnQudHlwZV0uZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgIHZhbHVlcy5wdXNoKGxpc3RlbmVyLmNhbGxiYWNrKGV2ZW50KSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfVxufVxuIiwiZXhwb3J0ICogZnJvbSAnLi9FdmVudEhhbmRsZXInO1xuIl19
