var ftpd = require('ftpd');
var util = require('util');

var options = {
  host: process.env.IP || '127.0.0.1',
  port: process.env.PORT || '7002'
};

server = new ftpd.FtpServer(options.host, {
  getInitialCwd: function() {
    return '/tmp';
  },
  getRoot: function() {
    return process.cwd();
  },
  useReadFile: true
});

server.on('error', function(err) {
  console.log('FTP Server error:', error);
});

server.on('client:connected', function(connection) {
  var username = null;
  console.log('client connected: ' + connection.socket.remoteAddress);
  connection.on('command:user', function(user, success, failure) {
    if (user) {
      username = user;
      success();
    } else {
      failure();
    }
  });

  connection.on('command:pass', function(pass, success, failure) {
    if (pass) {
      success(username, {
        readdir: function(path, cb) {
          // always return the same file list
          return cb(null, ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
        },
        stat: function(path, cb) {
          // always return stats for a file with on-the-fly created timestamps
          return cb(null, {
            //dev: 2114,
            //ino: 48064969,
            //mode: 33188,
            //nlink: 1,
            //uid: 85,
            //gid: 100,
            //rdev: 0,
            size: 0,
            //blksize: 4096,
            //blocks: 8,
            atime: new Date(),
            mtime: new Date(),
            ctime: new Date(),
            birthtime: new Date(),
            isFile: function() { return true; },
            isDirectory: function() { return false; },
            isBlockDevice: function() { return false; },
            isCharacterDevice: function() { return false; },
            isSymbolicLink: function() { return false; },
            isFIFO: function() { return false; },
            isSocket: function() { return false; }
          });
        },
        readFile: function(path, cb) {
          return cb(null, '');
        },
        mkdir: function(path, mode, cb) {
          // creating directories is not supported
          var err = new Error('permission denied');
          err.code = 'EACCES';
          return cb(err);
        }
      });
    } else {
      failure();
    }
  })
});

server.debugging = 4;
server.listen(options.port);
console.log('Listening on port ' + options.port);
