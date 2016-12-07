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
  }
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
      success(username);
    } else {
      failure();
    }
  })
});

server.debugging = 4;
server.listen(options.port);
console.log('Listening on port ' + options.port);
