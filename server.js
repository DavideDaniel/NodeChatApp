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
var channels = [];
var WebSocket = require('ws');

server.broadcast = function broadcast(data){
    server.clients.forEach(function each(client){
        client.send(data);
    });
};

server.on('connection', function(connection) {
    
    console.log("new client");
    var user = new User(connection);

    user.client.on('message', function(j_msgObj) {
        var msgObj = JSON.parse(j_msgObj);
        checkMsgType(msgObj, user);
    })
    connection.on('close', function() {
        announceExit(userDb, user);
    })
});
// var Channel = function() {
//     this.type = "room";
//     this.name = "";
//     this.open = false;
//     this.pw = "";
//     this.users = [];
//     this.init = function(user, roomName) {
//         while (this.users.length === 0) {
//             this.open = false;
//             channels.forEach(function(channel) {
//                 var index = channels.indexOf(channel);
//                 channels.splice(index, 1);
//             })
//         }
//         if (this.open == false) {
//             this.users.push(user);
//             this.open = true;
//             channels.push(this);
//         } else if (this.open == true) {
//             this.users.push(user)
//         }
//     }
//     this.statusMsg = function(){
//         console.log(this.name+'\n'+
//             this.users+'\n'+
//             this.open);
//     }
// }
// var sendChannels = function(channelList){
//     var msgObj = {
//         type: "channels",
//         channels: channelList
//     }
//     connection.send(JSON.stringify(msgObj))
// };
var checkMsgType = function(msgObj, user, room) {
    console.log(user.name + ': ' + msgObj.type);
    var msgType = msgObj.type
    if (msgType === "firstEntering") {
        user.enter(msgObj)
        // sendChannels(channels);
    } else if (msgType === "exiting") {
        // announceExit(userDb);
    } else if (msgType === 'join') {
        channels.forEach(function(channel) {
            if (channel.name == msgObj.room) {
                var roomName = msgObj.room;
                channel.init(user, roomName);
                channel.statusMsg();
            }
        })
    } else if (msgType === "msg") {
        user.sendMsg(userDb, now, msgObj, user); //user
    }
}
var User = function(connection) {
    this.type = 'user';
    this.connected = false;
    this.client = connection;
    this.name = 'anonymous';
    this.id = '';
    this.room = '';
    this.enter = function(msgObj) {
        this.connected = true;
        console.log(this.connected);
        this.id = i;
        this.name = msgObj.name;
        this.room = msgObj.room;
        userDb.push(this)
        console.log(this.name + " is user #" +" "+ this.id + this.connected);
        connection.send(JSON.stringify({
            type: 'entering',
            userId: this.id
        }))
    }
    this.sendMsg = function(userDb, time, msgObj, user) {
        var message = jsonMsg(this.name, now, msgObj.msg, this.room)
        console.log(message);
        userDb.forEach(function(other) {
            other.client.send(message)
        })
    }
};
var announceExit = function(userDb, user) {
    var exitMsg = {
        type: "exiting",
        msg: user.name + " has left the room."
    }
    userDb.forEach(function(users) {
        var exitMsg = {
            type: "exiting",
            msg: user.name
        }
        if (users === user) {
            var index = userDb.indexOf(users);
            userDb.splice(index, 1);
        }
    
    })
    server.broadcast(JSON.stringify(exitMsg))
    i--
    
};
var announceEntry = function(userDb, user) {
    var entryMsg = {
            type: "entering",
            msg: user.name + " has joined the room."
        }
    server.broadcast(JSON.stringify(entryMsg))
    i++
    
};
var jsonMsg = function(from, at, message, room, to) {
    var msgObj = {
        type: 'msg',
        at: now,
        from: from,
        msg: message,
        room: room,
        to: to
    };
    var jsonedMsg = JSON.stringify(msgObj);
    return jsonedMsg;
};
// var determineRoom = function(message, to) {
//     var users = channels[room]
//     if (to == 'General') {
//         users.client.send(JSON.stringify(message.msg))
//     } else {
//         for (var i in users) {
//             users(i).send(message);
//         }
//     }
// }