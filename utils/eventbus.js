class EventEmitter {
  constructor() {
    this.list = {};
  }

  static getInstance = () => {
    if (!EventEmitter.instance) {
      EventEmitter.instance = new EventEmitter()
    }

    return EventEmitter.instance;
  }

  $on(event, fn) {
    if (!this.list[event]) {
      this.list[event] = [];
    }
    this.list[event].push(fn);
  }

  $emit(...rest) {
    const event = ([].shift.call(rest));
    const fns = this.list[event] || [];
    fns.forEach((fn) => {
      fn.apply(this, rest);
    });
  }

  $off(event) {
    this.list[event] = [];
  }

  $clean() {
    this.list = {}
  }
}

module.exports = new EventEmitter();
