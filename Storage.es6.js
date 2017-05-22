class Data {
  _toString(type, value) {
    if(type & this.Array) {
      return value.toString();
    } else if(type & this.ArrayBuffer) {
      return String.fromCharCode.apply(null, new Uint16Array(value));
    } else if(type & this.Blob) {
      let canvas = document.createElement("canvas");
      canvas.width = value.naturalWidth;
      canvas.height = value.naturalHeight;

      canvas.getContext("2d").drawImage(value, 0, 0);
      return canvas.toDataURL("image/png");
    } else if(type & this.Number) {
      return value.toString();
    } else if(type & this.Object) {
      return JSON.stringify(value);
    } else if(type & this.String) {
      return value;
    } else {
      console.error("[ERROR] unknown type");
      return undefined;
    }
  }

  _toData(type, value) {
    return new Promise((resolve, reject) => {
      if(type & this.Array) {
        resolve(JSON.parse("[" + value + "]"));
      } else if(type & this.ArrayBuffer) {
        let _buffer = new ArrayBuffer(value.length * 2);
        let bufferView = new Uint16Array(_buffer);

        for(let char of str) {
          bufferView.push(char);
        }

        return _buffer;
      } else if(type & this.Blob) {
        let image = new Image();
        image.src = value;

        image.addEventListener("load", () => {
          resolve(image);
        });
      } else if(type & this.Number) {
        if(value % 1 === 0) {
          resolve(parseInt(value, 10));
        } else {
          resolve(parseFloat(value));
        }
      } else if(type & this.Object) {
        resolve(JSON.parse(value));
      } else if(type & this.String) {
        resolve(value);
      } else {
        console.error("[ERROR] unknown type");
        return undefined;
      }
    });
  }
}

class Storage extends Data {
  constructor(persistence = true, time = 157680000000) { // par défaut 5 ans
    super();

    this.Array = 0x01;
    this.ArrayBuffer = 0x02;
    this.Blob = 0x04;
    this.Number = 0x08;
    this.Object = 0x10;
    this.String = 0x20;

    this.persistence = persistence;
    this.time = time;

    switch(this.persistence) {
      case true: this.usage = typeof localStorage != undefined ? "localStorage" : "cookie"; break;
      case false: this.usage = typeof localStorage != undefined ? "sessionStorage" : "cookie"; break;
      default: this.usage = "cookie";
    }

    if(this.usage == "cookie") console.log("[WARNING] unrecognized storage: use of cookies");
  }

  set(option) {
    if(typeof option != "object") {
      console.error("[ERROR] an object is expected");
    }

    option = Object.assign({
      type: this.String,
      key: "default",
      value: ""
    }, option);

    return new Promise((resolve, reject) => {
      option.value = this._toString(option.type, option.value);

      if(option.value === undefined) {
        reject();
        return;
      }

      if(this.usage == "localStorage") {
        this._set_localStorage(option.key, option.value);
      } else if(this.usage == "sessionStorage") {
        this._set_sessionStorage(option.key, option.value);
      } else {
        this._set_cookie(option.key, option.value);
      }

      resolve();
    });
  }

  _set_localStorage(id, value) {
    localStorage.setItem(id, value);
  }

  _set_sessionStorage(id, value) {
    sessionStorage.setItem(id, value);
  }

  _set_cookie(id, value) {
    if(this.persistence) {
      let date = new Date();
      date.setTime(date.getTime() + this.time);

      document.cookie = id + "=" + value + "; expires=" + date.toGMTString();
    } else {
      document.cookie = id + "=" + value;
    }
  }

  get(option) {
    if(typeof option != "object") {
      console.error("[ERROR] an object is expected");
    }

    option = Object.assign({
      type: this.String,
      key: "default",
      value: ""
    }, option);

    return new Promise((resolve, reject) => {
      if(this.usage == "localStorage") {
        this._get_localStorage(option.type, option.key).then((value) => {
          resolve(value);
        });
      } else if(this.usage = "sessionStorage") {
        resolve(this._get_sessionStorage(option.type, option.key));
      } else {
        resolve(this._get_cookie(option.type, option.key));
      }
    });
  }

  _get_localStorage(type, id) {
    return new Promise((resolve, reject) => {
      let _return = localStorage.getItem(id);
      super._toData(type, _return).then((value) => {
        resolve(value);
      });
    });
  }

  _get_sessionStorage(type, id) {
    return new Promise((resolve, reject) => {
      let _return = sessionStorage.getItem(id);
      super._toData(type, _return).then((value) => {
        resolve(value);
      });
    });
  }

  _get_cookie(type, id) {
    return new Promise((resolve, reject) => {
      let search = document.cookie.match("(^|;)\\s*" + id + "\\s*=\\s*([^;]+)");
      let _return = search ? search.pop() : "";

      super._toData(type, _return).then((value) => {
        resolve(value);
      });
    });
  }

  remove(id) {
    eval("this._remove_" + this.usage + "(" + id + ")");
  }

  _remove_localStorage(id) {
    localStorage.removeItem(id);
  }

  _remove_sessionStorage(id) {
    sessionStorage.removeItem(id);
  }

  _remove_cookie(id) {
    document.cookie = id + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT";
  }

  removeAll() {
    eval("this._clear_" + this.usage + "()");
  }

  _clear_localStorage(id) {
    localStorage.clear();
  }

  _clear_sessionStorage(id) {
    sessionStorage.clear();
  }

  _clear_cookie(id) {
    let cookies = document.cookie.split(";");

    for(let cookie of cookies) {
      let eqPos = cookie.indexOf("=");
      let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;

      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
  }
}