var WebSocketServer = require('ws')
    .Server;
var moment = require('moment');

// vars available to all 
var now = moment()
    .format('MMM Do, h:mm a');
var userDb = [];
// var userCounter = userDb.length;
var channelList = [];
// var chanId = channelList.length;
// var msgObj = {};
console.log('channelList length = ' + channelList.length);

var server = new WebSocketServer({
    port: 2000
});

// function to have server send msgs to all
server.broadcast = function broadcast(data) {
    server.clients.forEach(function each(client) {
        client.send(data);
    });
};

var Channel = function (name) {
    this.name = name;
    this.id = channelList.length;
    this.type = '';
    this.pw = '';
    this.users = [];
    this.join = function (user) {
        user.channelName = this.name;
        this.users.push(user);
        console.log('Server:' + user.name + ' is joining ' + user.channelName);
        joinChanMsg(user);
    };
    this.leave = function (user) {
        var index = this.users.indexOf(user);
        this.users.splice(index, 1);
    };
    this.sendMsg = function (msgObj) {
        this.users.forEach(function (user) {
            user.send(msg);
        });
    };
};

var checkMsgType = function (msgObj, user) {
    console.log(user.name + ' in channel ' + user.channelName + ' is sending ' + msgObj.type);
    var msgType = msgObj.type
    if (msgType === "firstEntering") {
        user.enter(msgObj);
        // announceEntry(userDb, user);
        // sendChannels(channelList);
    }
    else if (msgType === "exiting") {
        // announceExit(userDb);
    }
    else if (msgType === 'creating') {
        newChannelFunc(user, msgObj.name, channelList.length)
    }
    else if (msgType === 'join') {
        
        if (user.channelName != msgObj.name) {
            user.channelName = msgObj.name
            for (var i = 0; i < channelList.length; i++) {
                if (user.channelName === channelList[i].name) {
                    console.log(channelList[i].name);
                    channelList[i].join(user);
                }
                else {
                    channelList[i].leave(user);
                }
            }
        }
    }
    else if (msgType === "msg") {
        channelList.forEach(function each(channel) {
            if (channel.name === user.channelName) {
                user.sendMsg(channel.users, now, msgObj, user); //user
            }
        });
    }
};

var User = function (connection) {
    this.connected = false;
    this.client = connection;
    this.name = '';
    this.id = userDb.length+1;
    this.channelName = '';
    this.enter = function (msgObj) {
        this.connected = true;
        console.log(this.connected);
        this.name = msgObj.name;
        userDb.push(this)
        general.join(this)
        console.log(this.name + " is user #" + " " + this.id + " & connection is now " + this.connected);
        var setIdMsg = {
            type: 'setId',
            userId: this.id
        }
        connection.send(JSON.stringify(setIdMsg));
    }
    this.sendMsg = function (channelUsers, time, msgObj) {
        var message = jsonMsg(this.name, now, msgObj.msg)
        console.log('from user.sendMsg' + message);
        channelUsers.forEach(function each(other) {
            other.client.send(message)
        })
    }
};

var newChannelFunc = function (user, channelName, chanId) {
    if (channelName != null) {
        console.log('creating func');
        channelName = new Channel(channelName, chanId);
        channelList.push(channelName);
        console.log(channelList);
        sendChannel(channelName);
        createChanPingBack(user, channelName.name, channelName.id);
    };
};

var sendChannel = function (channel) {
    var minifyUser; // set var for later

    var userArray = channel.users;
    var miniChan = {
        name: channel.name,
        id: channel.id,
        type: channel.type,
        users: []
    }
    console.log('before loop\n' + miniChan);
    var miniUserList = [];
    for (var i = 0; i < userArray.length; i++) {
        minifyUser = function (userObj, array) {
            var miniUser = {
                name: userObj.name,
                id: userObj.id
            }
            array.push(miniUser);
        };

        minifyUser(userArray[i], miniUserList);
    }
    console.log(miniUserList);
    miniChan.users = miniUserList
    console.log(miniChan);

server.broadcast(JSON.stringify({
    type: 'channel',
    channel: miniChan
}))
};

var announceExit = function (userDb, user) {
    var exitMsg = {
        type: "exiting",
        msg: user.name + " has left the channel."
    }
    console.log('inside the announceExit function with ' + user);
    userDb.forEach(function each(userObj) {
        if (userObj === user) {
            'made it inside announce exit loop'
            var index = userDb.indexOf(userObj);
            userDb.splice(index, 1);
        }
    })
    server.broadcast(JSON.stringify(exitMsg));
    console.log(userDb);
};

// var announceEntry = function(userDb, user) {
//     var entryMsg = {
//         type: "entering",
//         name: user.name,
//         msg: " is now in channel " + user.channelName
//     }
//     server.broadcast(JSON.stringify(entryMsg));
// };

var joinChanMsg = function (user) {
    var joinMsg = {
        type: "joining",
        msg: user.name + " has joined channel: " + user.channelName
    }
    server.broadcast(JSON.stringify(joinMsg));
};

var createChanPingBack = function (user, channelName, chanId) {
    var chanForClient = {
        type: 'create',
        chanId: chanId,
        channelName: channelName
    }

    user.client.send(JSON.stringify(chanForClient))
};

var jsonMsg = function (from, at, message) {
    var msgObj = {
        type: 'msg',
        from: from,
        at: now,
        msg: message
    };

    var jsonedMsg = JSON.stringify(msgObj);
    return jsonedMsg;
};

// create general channel when server starts
var general = new Channel("General");
// general.id = chanId;
channelList.push(general);

// establish client connection
server.on('connection', function (connection) {
    var user = new User(connection);
    console.log('Server: ' + userDb.length + ' user/s online.');
    // client on message
    if (user.connected === false) {
        for (var i = 0; i < channelList.length; i++) {
            sendChannel(channelList[i])
        };
    }
    user.client.on('message', function (data) {
        var msgObj = JSON.parse(data);
        checkMsgType(msgObj, user);
    });
    // connection closing
    connection.on('close', function () {
        channelList.forEach(function each(channel) {
            var atIndex = channel.users.indexOf(user)
            if (channel.users[atIndex] === user) {
                console.log('normal loop for connection close');
                console.log('yeah user in' + channel.name + 'here');
                channel.users.splice(atIndex, 1);
                console.log(channel.users);
            }
        });
        announceExit(userDb, user);
        console.log('Server: ' + userDb.length + ' user/s online.');
    });
});

console.log("Server listening on port 2000");