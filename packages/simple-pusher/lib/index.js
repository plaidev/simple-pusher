class SimplePusher {
  constructor(server, socketIoOptions = {}) {
    const _socketIoOptions = Object.assign(
      {
        serveClient: false
      },
      socketIoOptions
    );

    this.io = require('socket.io')(server, _socketIoOptions);

    this.beforeJoinHook = (socket, data, cb) => {
      return cb(null, data.room);
    };

    this.beforeLeaveHook = (socket, data, cb) => {
      return cb(null, data.room);
    };

    this.io.on('connection', socket => {
      socket.on('join', (data, cb) => {
        this.beforeJoinHook(socket, data, (err, room) => {
          if (err) {
            return cb(err.message);
          }

          socket.join(room || data.room, () => {
            const rooms = Object.keys(socket.rooms);
            rooms.shift();
            cb(null, rooms);
          });
        });
      });

      socket.on('leave', (data, cb) => {
        this.beforeLeaveHook(socket, data, (err, room) => {
          if (err) {
            return cb(err.message);
          }

          socket.leave(room || data.room, () => {
            const rooms = Object.keys(socket.rooms);
            rooms.shift();
            cb(null, rooms);
          });
        });
      });
    });
  }

  setMiddleware(func) {
    this.io.use(func);
  }

  setBeforeJoinHook(hook) {
    this.beforeJoinHook = hook;
  }

  setBeforeLeaveHook(hook) {
    this.beforeLeaveHook = hook;
  }

  emit(eventName, message) {
    this.io.sockets.to(eventName).emit(eventName, message);
  }
}

module.exports = SimplePusher;
