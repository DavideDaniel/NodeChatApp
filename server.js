var WebSocketServer = require('ws')
    .Server;
var moment = require('moment');

// vars available to all 
var now = moment()
    .format('MMM Do, h:mm a'); // old server format
var clientNow = moment()
    .format('h:mm a'); // client format to make it uniform
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

// Channel constructor
function Channel(name) {
    this.name = name;
    this.id = channelList.length;
    this.type = '';
    this.pw = '';
    this.users = [];
    this.history = [];
};

// Channel prototype functions
Channel.prototype = {
    join: function (user) {
        user.channelName = this.name;
        this.users.push(user);
        console.log('Server:' + user.name + ' is joining ' + user.channelName);
        joinChanMsg(user, this.name);
        console.log('here are the users');
        console.log(this.users);
    },

    leave: function (user) {
        var index = this.users.indexOf(user);
        console.log('Server:' + user.name + ' is leaving ' + this.name);
        this.users.splice(index, 1);
        leaveChanMsg(user, this.name)
    },

    save: function (msgObj) {
        this.history.push(msgObj)
        console.log(this.history);
    }

};

// User constructor
function User(connection) {
    this.connected = false;
    this.client = connection;
    this.name = '';
    this.id = userDb.length;
    this.channelName = '';
};

// User prototype functions
User.prototype = {
    enter: function (msgObj, channels) {
        this.connected = true;
        console.log(this.connected);
        this.name = msgObj.from;
        userDb.push(this)
        general.join(this)
        console.log(this.name + " is user #" + " " + this.id + " & connection is now " + this.connected);
        processUser(channelList, this);
    },
    sendMsg: function (channelUsers, time, msgObj) {
        var message = jsonMsg(this.name, now, msgObj.msg);
        channelUsers.forEach(function each(other) {
            other.client.send(message)
        })
    }
};

// // NEED TO MAKE A CLASS FOR MSG

function Message(typeOfMsg, inChannel, userFrom, time, message) {
    this.type = typeOfMsg;
    this.msgObj = {
        channel: inChannel,
        from: userFrom,
        at: time,
        msg: message
    }
};

Message.prototype = {
    jsonify: function () {
        var msgToSend = JSON.stringify(this.msgObj)
        return msgToSend
    },

    filter: function (user) {
        var msgObj = this.msgObj;
        console.log(msgObj);
        if (this.type === 'firstEntering') {
            user.enter(msgObj);
        }
        else if (this.type === 'exiting') {}
        else if (this.type === 'creating') {
            console.log('CREATE WITH');
            console.log(msgObj);
            newChannelFunc(user, msgObj.msg, channelList.length);
        }
        else if (this.type === 'join') {
            if (user.channelName != msgObj.msg) {
                user.channelName = msgObj.msg;
                console.log('JOINING: ' + msgObj.msg);
                for (var i = 0; i < channelList.length; i++) {
                    if (user.channelName === channelList[i].name) {
                        channelList[i].join(user);
                    }
                    else {
                        channelList[i].leave(user);
                    }
                }
            }
        }
        else if (this.type === 'msg') {
            console.log('THIS = ' + msgObj.channel);
            // // can potentially just send with class method
            // var msgToGo = this.jsonify();
            // console.log(msgToGo); 
            channelList.forEach(function each(channel) {
                // filter to channel only
                if (msgObj.channel === channel.name) {
                    channel.users.forEach(function each(chanUser) {
                        // check if user is in channel
                        if (user.name === chanUser.name) {
                            user.sendMsg(channel.users, now, msgObj, user); // from user to channel
                        }
                    })
                }
            });
        }
    }
};

var newMessageFunc = function (msgObj, user) {
    // if (msgObj.msg != null) {
    console.log(msgObj);
    var message = new Message(msgObj.type, msgObj.channel, msgObj.from, now, msgObj.msg);
    console.log(message);
    message.filter(user);
    // }
}

var processUser = function (channelArray, user) {
    var processMsg = {
        type: 'firstEnter',
        msgObj: {
            userId: user.id,
            channels: []
        }
    }
    var packChannel;
    var channelHistory = [];
    for (var i = 0; i < channelArray.length; i++) {
        packChannel = function (channelObj) {
            var minifyUser; // set var for later
            var userArray = channelObj.users;
            // console.log(userArray);
            var miniChan = {
                name: channelObj.name,
                id: channelObj.id,
                type: channelObj.type,
                users: [],
                history: channelObj.history
            }
            var miniUserList = [];
            for (var i = 0; i < userArray.length; i++) {
                minifyUser = function (userObj) {
                    var miniUser = {
                        name: userObj.name,
                        id: userObj.id
                    }
                    miniUserList.push(miniUser);
                    console.log(miniUserList);
                };
                minifyUser(userArray[i]);
            }
            miniChan.users = miniUserList;
            channelHistory.push(miniChan);
        };
        packChannel(channelArray[i]);
    };
    processMsg.channels = channelHistory;
    user.client.send(JSON.stringify(processMsg));
};

var newChannelFunc = function (user, channelName, chanId) {
    if (channelName != null) {
        channelName = new Channel(channelName, chanId);
        channelList.push(channelName);
        sendChannel(channelName);
    };
};

var sendChannel = function (channel) {
    var minifyUser; // set var for later

    var userArray = channel.users;
    var miniChan = {
        name: channel.name,
        id: channel.id,
        type: channel.type,
        users: [],
        history: channel.history
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
        type: 'exiting',
        msg: user.name + " has left the server."
    }
    console.log('inside the announceExit function with ' + user);
    userDb.forEach(function each(userObj) {
        if (userObj === user) {
            var index = userDb.indexOf(userObj);
            userDb.splice(index, 1);
        }
    })
    server.broadcast(JSON.stringify(exitMsg));
    // console.log(userDb);
};

var joinChanMsg = function (user, channelName) {
    var joinMsg = {
        type: 'joining',
        msg: user.name + ' has joined channel: ' + channelName
    }
    server.broadcast(JSON.stringify(joinMsg));
};

var leaveChanMsg = function (user, channelName) {
    var leaveMsg = {
        type: 'leaving',
        msg: user.name + ' has left ' + channelName + ' channel'
    }
    server.broadcast(JSON.stringify(leaveMsg));
}

var jsonMsg = function (from, now, message) {
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
    user.client.on('message', function (data) {
        var msgObj = JSON.parse(data);
        // save message to channel history
        channelList.forEach(function each(channel) {
            if (channel.name === user.channelName && msgObj.type === 'msg') {
                channel.save(msgObj)
            }
        });
        newMessageFunc(msgObj, user);

    });
    // connection closing
    connection.on('close', function () {
        channelList.forEach(function each(channel) {
            var atIndex = channel.users.indexOf(user)
            if (channel.users[atIndex] === user) {
                channel.users.splice(atIndex, 1);
            }
        });
        announceExit(userDb, user);
        console.log('Server: ' + userDb.length + ' user/s online.');
    });
});

console.log('Server listening on port 2000');