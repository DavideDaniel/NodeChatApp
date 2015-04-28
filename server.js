var WebSocketServer = require('ws').Server;
var server = new WebSocketServer({
    port: 5210
});
console.log("Server listening on port 3000");
var moment = require('moment');
var now = moment().format('MMM Do, h:mm a');
var userDb = [];
var i = 0;
var msgObj = {};
var channelList = [];
var WebSocket = require('ws');
server.broadcast = function broadcast(data) {
    server.clients.forEach(function each(client) {
        client.send(data);
    });
};
var Channel = function(name) {
    this.name = name;
    this.chanType = '';
    this.pw = '';
    this.users = [];
    this.join = function(user) {
        this.users.push(user);
    };
    this.leave = function(user) {
        var index = this.users.indexOf(user);
        this.users.splice(index, 1);
    };
    this.sendMsg = function(msgObj) {
        this.users.forEach(function(user) {
            user.send(msg);
        });
    };
};
// var sendChannels = function(channelList){
//     var msgObj = {
//         type: "channels",
//         channels: channelList
//     }
//     connection.send(JSON.stringify(msgObj))
// };
var checkMsgType = function(msgObj, user) {
    console.log(user.name + ': ' + msgObj.type);
    var msgType = msgObj.type
    if (msgType === "firstEntering") {
        user.enter(msgObj)
        announceEntry(userDb, user)
        // sendChannels(channels);
    } else if (msgType === "exiting") {
        // announceExit(userDb);
    } else if (msgType === 'join') {
        channelList.forEach(function each(channel) {
            if (channel.name === msgObj.channel.name) {
                channel.join(user);
            }
        })
    } else if (msgType === "msg") {
        // chanFilter(msgObj, user);

        var userChannel = msgObj.channel
        console.log(userChannel);
        console.log(channelList);
    channelList.forEach(function each(channel) {
        if (channel.name === userChannel) {
            console.log('comparing '+channel+' to '+userChannel);
            user.sendMsg(channel.users, now, msgObj, user); //user
        }
    });
    }
};
// var chanFilter = function(msgObj, user) {
//     var userChannel = msgObj.channel
//     channelList.forEach(function each(channel) {
//         if (channel === user_channel) {
//             user.sendMsg(channel, now, msgObj, user); //user
//         }
//     });
// };
var User = function(connection) {
    this.connected = false;
    this.client = connection;
    this.name = '';
    this.id = '';
    this.channel = {};
    this.enter = function(msgObj) {
        this.connected = true;
        console.log(this.connected);
        this.id = i;
        this.name = msgObj.name;
        this.channel = msgObj.channel;
        userDb.push(this)
        console.log(this.name + " is user #" + " " + this.id + " & connection is now " + this.connected);
        var setIdMsg = {
            type: 'setId',
            userId: this.id
        }
        connection.send(JSON.stringify(setIdMsg));
    }
    this.sendMsg = function(channelUsers, time, msgObj, channel) {
        var message = jsonMsg(this.name, now, msgObj.msg, this.channel)
        console.log(message);
        channelUsers.forEach(function each(other) {
            other.client.send(message)
        })
    }
};
var announceExit = function(userDb, user) {
    var exitMsg = {
        type: "exiting",
        msg: user.name + " has left the channel."
    }
    userDb.forEach(function each(userObj) {
        if (userObj === user) {
            var index = userDb.indexOf(userObj);
            userDb.splice(index, 1);
        }
    })
    server.broadcast(JSON.stringify(exitMsg));
    console.log(userDb);
};
var announceEntry = function(userDb, user) {
    var entryMsg = {
        type: "entering",
        msg: user.name + " has joined the channel."
    }
    server.broadcast(JSON.stringify(entryMsg));
    console.log(userDb);
};
var jsonMsg = function(from, at, message, channel) {
    var msgObj = {
        type: 'msg',
        from: from,
        at: now,
        msg: message,
        channel: channel
    };
    var jsonedMsg = JSON.stringify(msgObj);
    return jsonedMsg;
};
var general = new Channel("General");
channelList.push(general);
server.on('connection', function(connection) {
    console.log("new client");
    var user = new User(connection);
    general.users.push(user)
    i++

    user.client.on('message', function(data) {
        var msgObj = JSON.parse(data);
        checkMsgType(msgObj, user);
    })
    connection.on('close', function() {
        var atIndex = general.users.indexOf(user)
        if (general.users[atIndex] === user){
            console.log('yeah user in here');
            general.users.splice(atIndex, 1);
            console.log(general.users);
        }
        announceExit(userDb, user);
        i--
    })
});