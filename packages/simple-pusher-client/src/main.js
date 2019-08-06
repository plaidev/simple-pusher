import io from 'socket.io-client';

class SimplePusherClient {
  constructor(socketUrl, options = {}) {
    const { namespace, ioOptions } = Object.assign(
      {
        namespace: '',
        ioOptions: {},
      },
      options,
    );

    this.socketUrl = socketUrl || '';
    this.namespace = namespace;
    this.ioOptions = ioOptions;
    this.socket = null;
    this.events = [];
  }

  on(eventName, listener) {
    if (!this.socket) {
      this._createSocket();
    }

    if (!this.socket.hasListeners(eventName)) {
      this.events.push(eventName);
      this._join(eventName);
    }

    this.socket.on(eventName, listener);
  }

  off(eventName, options, listener) {
    if (typeof options === 'function') {
      listener = options;
      options = {};
    }

    if (!this.socket) {
      console.error('socket dose not exist');
      return;
    }

    const { throwError } = Object.assign(
      {
        throwError: true,
      },
      options,
    );

    const listenerLength = this.socket.listeners(eventName).length;

    this.socket.off(eventName, listener);

    if (this.socket.listeners(eventName).length === listenerLength) {
      if (throwError) throw new Error('cannot remove listener');
      else return;
    }

    if (!this.socket.hasListeners(eventName)) {
      this.events = this.events.filter(v => v !== eventName);
      this._leave(eventName);
    }
  }

  _createSocket() {
    this.socket = io(this.socketUrl + this.namespace, this.ioOptions);

    this.socket.on('error', err => {
      console.error('socket error: ' + err);
    });

    this.socket.on('reconnect', () => {
      console.log('reconnect');
      this.events.forEach(eventName => {
        this._join(eventName);
      });
    });
  }

  _join(eventName) {
    this.socket.emit('join', { room: eventName }, err => {
      if (err) return console.error('cannot join room: ' + err);
    });
  }

  _leave(eventName) {
    this.socket.emit('leave', { room: eventName }, (err, rooms) => {
      if (err) return console.error('cannot leave room: ', err);
      if (rooms && rooms.length === 0 && this.events.length === 0) {
        this.socket.close();
        this.socket = null;
      }
    });
  }
}

export default SimplePusherClient;
