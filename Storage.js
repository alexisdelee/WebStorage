class Storage {
  constructor(persistence = true, time = 157680000000) { // par défaut 5 ans
    this.persistence = persistence;
    this.time = time;

    switch(this.persistence) {
      case true: this.usage = typeof localStorage != undefined ? "localStorage" : "cookie"; break;
      case false: this.usage = typeof localStorage != undefined ? "sessionStorage" : "cookie"; break;
      default: this.usage = "cookie";
    }

    if(this.usage == "cookie") console.log("Unrecognized storage: use of cookies");
  }

  set(id, value) {
    eval("this._set_" + this.usage + "(" + id + ", \"" + value + "\")");
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

  get(id) {
    return eval("this._get_" + this.usage + "(" + id + ")");
  }

  _get_localStorage(id) {
    return localStorage.getItem(id);
  }

  _get_sessionStorage(id) {
    return sessionStorage.getItem(id);
  }

  _get_cookie(id) {
    let search = document.cookie.match("(^|;)\\s*" + id + "\\s*=\\s*([^;]+)");
    return search ? search.pop() : "";
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