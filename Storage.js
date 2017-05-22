"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Data = function () {
  function Data() {
    _classCallCheck(this, Data);
  }

  _createClass(Data, [{
    key: "_toString",
    value: function _toString(type, value) {
      if (type & this.Array) {
        return value.toString();
      } else if (type & this.ArrayBuffer) {
        return String.fromCharCode.apply(null, new Uint16Array(value));
      } else if (type & this.Blob) {
        var canvas = document.createElement("canvas");
        canvas.width = value.naturalWidth;
        canvas.height = value.naturalHeight;

        canvas.getContext("2d").drawImage(value, 0, 0);
        return canvas.toDataURL("image/png");
      } else if (type & this.Number) {
        return value.toString();
      } else if (type & this.Object) {
        return JSON.stringify(value);
      } else if (type & this.String) {
        return value;
      } else {
        console.error("[ERROR] unknown type");
        return undefined;
      }
    }
  }, {
    key: "_toData",
    value: function _toData(type, value) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        if (type & _this.Array) {
          resolve(JSON.parse("[" + value + "]"));
        } else if (type & _this.ArrayBuffer) {
          var _buffer = new ArrayBuffer(value.length * 2);
          var bufferView = new Uint16Array(_buffer);

          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = str[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var char = _step.value;

              bufferView.push(char);
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }

          return _buffer;
        } else if (type & _this.Blob) {
          var image = new Image();
          image.src = value;

          image.addEventListener("load", function () {
            resolve(image);
          });
        } else if (type & _this.Number) {
          if (value % 1 === 0) {
            resolve(parseInt(value, 10));
          } else {
            resolve(parseFloat(value));
          }
        } else if (type & _this.Object) {
          resolve(JSON.parse(value));
        } else if (type & _this.String) {
          resolve(value);
        } else {
          console.error("[ERROR] unknown type");
          return undefined;
        }
      });
    }
  }]);

  return Data;
}();

var Storage = function (_Data) {
  _inherits(Storage, _Data);

  function Storage() {
    var persistence = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
    var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 157680000000;

    _classCallCheck(this, Storage);

    var _this2 = _possibleConstructorReturn(this, (Storage.__proto__ || Object.getPrototypeOf(Storage)).call(this)); // par défaut 5 ans


    _this2.Array = 0x01;
    _this2.ArrayBuffer = 0x02;
    _this2.Blob = 0x04;
    _this2.Number = 0x08;
    _this2.Object = 0x10;
    _this2.String = 0x20;

    _this2.persistence = persistence;
    _this2.time = time;

    switch (_this2.persistence) {
      case true:
        _this2.usage = (typeof localStorage === "undefined" ? "undefined" : _typeof(localStorage)) != undefined ? "localStorage" : "cookie";break;
      case false:
        _this2.usage = (typeof localStorage === "undefined" ? "undefined" : _typeof(localStorage)) != undefined ? "sessionStorage" : "cookie";break;
      default:
        _this2.usage = "cookie";
    }

    if (_this2.usage == "cookie") console.log("[WARNING] unrecognized storage: use of cookies");
    return _this2;
  }

  _createClass(Storage, [{
    key: "set",
    value: function set(option) {
      var _this3 = this;

      if ((typeof option === "undefined" ? "undefined" : _typeof(option)) != "object") {
        console.error("[ERROR] an object is expected");
      }

      option = Object.assign({
        type: this.String,
        key: "default",
        value: ""
      }, option);

      return new Promise(function (resolve, reject) {
        option.value = _this3._toString(option.type, option.value);

        if (option.value === undefined) {
          reject();
          return;
        }

        if (_this3.usage == "localStorage") {
          _this3._set_localStorage(option.key, option.value);
        } else if (_this3.usage == "sessionStorage") {
          _this3._set_sessionStorage(option.key, option.value);
        } else {
          _this3._set_cookie(option.key, option.value);
        }

        resolve();
      });
    }
  }, {
    key: "_set_localStorage",
    value: function _set_localStorage(id, value) {
      localStorage.setItem(id, value);
    }
  }, {
    key: "_set_sessionStorage",
    value: function _set_sessionStorage(id, value) {
      sessionStorage.setItem(id, value);
    }
  }, {
    key: "_set_cookie",
    value: function _set_cookie(id, value) {
      if (this.persistence) {
        var date = new Date();
        date.setTime(date.getTime() + this.time);

        document.cookie = id + "=" + value + "; expires=" + date.toGMTString();
      } else {
        document.cookie = id + "=" + value;
      }
    }
  }, {
    key: "get",
    value: function get(option) {
      var _this4 = this;

      if ((typeof option === "undefined" ? "undefined" : _typeof(option)) != "object") {
        console.error("[ERROR] an object is expected");
      }

      option = Object.assign({
        type: this.String,
        key: "default",
        value: ""
      }, option);

      return new Promise(function (resolve, reject) {
        if (_this4.usage == "localStorage") {
          _this4._get_localStorage(option.type, option.key).then(function (value) {
            resolve(value);
          });
        } else if (_this4.usage = "sessionStorage") {
          resolve(_this4._get_sessionStorage(option.type, option.key));
        } else {
          resolve(_this4._get_cookie(option.type, option.key));
        }
      });
    }
  }, {
    key: "_get_localStorage",
    value: function _get_localStorage(type, id) {
      var _this5 = this;

      return new Promise(function (resolve, reject) {
        var _return = localStorage.getItem(id);
        _get(Storage.prototype.__proto__ || Object.getPrototypeOf(Storage.prototype), "_toData", _this5).call(_this5, type, _return).then(function (value) {
          resolve(value);
        });
      });
    }
  }, {
    key: "_get_sessionStorage",
    value: function _get_sessionStorage(type, id) {
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        var _return = sessionStorage.getItem(id);
        _get(Storage.prototype.__proto__ || Object.getPrototypeOf(Storage.prototype), "_toData", _this6).call(_this6, type, _return).then(function (value) {
          resolve(value);
        });
      });
    }
  }, {
    key: "_get_cookie",
    value: function _get_cookie(type, id) {
      var _this7 = this;

      return new Promise(function (resolve, reject) {
        var search = document.cookie.match("(^|;)\\s*" + id + "\\s*=\\s*([^;]+)");
        var _return = search ? search.pop() : "";

        _get(Storage.prototype.__proto__ || Object.getPrototypeOf(Storage.prototype), "_toData", _this7).call(_this7, type, _return).then(function (value) {
          resolve(value);
        });
      });
    }
  }, {
    key: "remove",
    value: function remove(id) {
      eval("this._remove_" + this.usage + "(" + id + ")");
    }
  }, {
    key: "_remove_localStorage",
    value: function _remove_localStorage(id) {
      localStorage.removeItem(id);
    }
  }, {
    key: "_remove_sessionStorage",
    value: function _remove_sessionStorage(id) {
      sessionStorage.removeItem(id);
    }
  }, {
    key: "_remove_cookie",
    value: function _remove_cookie(id) {
      document.cookie = id + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
  }, {
    key: "removeAll",
    value: function removeAll() {
      eval("this._clear_" + this.usage + "()");
    }
  }, {
    key: "_clear_localStorage",
    value: function _clear_localStorage(id) {
      localStorage.clear();
    }
  }, {
    key: "_clear_sessionStorage",
    value: function _clear_sessionStorage(id) {
      sessionStorage.clear();
    }
  }, {
    key: "_clear_cookie",
    value: function _clear_cookie(id) {
      var cookies = document.cookie.split(";");

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = cookies[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var cookie = _step2.value;

          var eqPos = cookie.indexOf("=");
          var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;

          document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }]);

  return Storage;
}(Data);