var client = new WebSocket("ws://localhost:2000");
// user literal obj defined
var user = {
    type: 'user',
    name: 'anonymous',
    connected: false,
    id: '',
    channelName: '',
    msg: ''
};

// empty arrays defined for scope 
var channelList = [];
var chatList = [];
var onlineUserList = [];

// client open
client.addEventListener("open", function (evt) {
    console.log("Connected to server");
    user.connected = true;
    console.log(user.connected);
    var inputOne = document.getElementById("inputOne")
    var inputTwo = document.getElementById("inputTwo")
    inputTwo.addEventListener("keyup", function (e) {
        if (e.keyCode === 13 && inputOne.value.trim() != "") {
            var hiddenDiv = document.querySelector("#hiddenDiv")
            var button = document.getElementById("login");
            user.name = inputOne.value;
            user.channelName = inputTwo.value;
            if (inputTwo.value === '' || inputTwo.value === 'general') {
                user.channelName = 'General';
            }
            firstEntering(user.name, user.channelName)
            hiddenDiv.style.display = "none";
        }
    });
    var createChan = document.getElementById('createChan');
    createChan.addEventListener('click', function click() {
        var channelName = prompt('Name the channel');
        // displayChannel(channelName);
        var msgToCreate = {
            type: 'creating',
            name: channelName
        }
        client.send(JSON.stringify(msgToCreate));
    })
});

// client message
client.addEventListener('message', function (message) {
    var msgObj = JSON.parse(message.data);
    checkMsgType(msgObj);
});

// client close
client.addEventListener('close', function (close) {
    user.connected = false;
    console.log(user.connected);
});

// grab DOM elem for chat input
var inputMsg = document.getElementById('inputMsg')
// add eventlistener to it
inputMsg.addEventListener('keyup', function (e) {
    if (e.keyCode === 13) {
        var newMsg = {
            type: 'msg',
            msg: inputMsg.value
        }
        client.send(JSON.stringify(newMsg));
        inputMsg.value = '';
    }
});

// Functions available for all 
// ===========================
var joinChannel = function (channelName) {
    var msgToJoin = {
        type: "join",
        name: channelName
    }
    client.send(JSON.stringify(msgToJoin));
};

var firstEntering = function (name, channel) {
    var enteringMsg = {
        type: 'firstEntering',
        name: user.name,
        channel: user.channelName
    }
    client.send(JSON.stringify(enteringMsg));
};

var setUserId = function (msgObj) {
    user.id = msgObj.userId
    console.log("You are user #" + user.id)
};

var displayOnlineUser = function (msgObj) {
    var ul = document.getElementById("onlineUsers");
    var li = document.createElement("li");
    li.innerHTML = msgObj.name;
    ul.appendChild(li);
    onlineUserList.push(li);
};

var removeOfflineUser = function (msgObj) {
    onlineUserList.forEach(function each(name) {
        if (name.innerHTML === msgObj.name) {
            name.remove();
        }
    })
};

// function to filter message types & determine response
var checkMsgType = function (msgObj) {
    var msgType = msgObj.type;
    console.log(msgType);
    if (msgType === "setId") {
        setUserId(msgObj);
    }
    else if (msgType === "create") {
        console.log('inside create in else if with ' + msgObj);
        console.log(msgObj.channelName);
        displayChannel(msgObj.channel, channelList);
    }
    else if (msgType === "joining") {
        serverAlert(msgObj);
    }
    else if (msgType === "entering") {
        displayOnlineUser(msgObj);
    }
    else if (msgType === 'exiting') {
        serverAlert(msgObj);
        removeOfflineUser(msgObj);
    }
    else if (msgType === "msg") {
        displayMsg(msgObj);
    }
    else if (msgType === 'channel') {
            displayChannel(msgObj.channel, channelList);
    }
};

// function to add unique id to element for correct eventlistener use
var addListener = function (elemId) {
    var joinChanLiElement = document.getElementById(elemId);
    joinChanLiElement.addEventListener("click", function () {
        console.log(this);
        joinChannel(joinChanLiElement.innerText);
    });
};

var displayChannel = function (channelObj, channelArray) {
    console.log('inside display function: \n'+channelObj);
    var alreadyExists = false;
    console.log('at top exists = '+alreadyExists);
    var ul = document.getElementById('channels');
    var li = document.createElement('li');
    var a = document.createElement('a');
    var uniqueChanId = channelObj.name + channelObj.id;

    channelArray.forEach(function each(channel){
        console.log('comparing '+channel.name+' with '+channelObj.name);
        if(channelObj.name === channel.name){
            
            alreadyExists = true;
        }
        console.log('inside loop after if statement exists = '+alreadyExists);
    });
    console.log('outside loop first exists = '+alreadyExists);
    if(alreadyExists === false){console.log('inside === statement exists = '+alreadyExists);}
    if(!alreadyExists){console.log('inside ! statement exists = '+alreadyExists);}
    ul.appendChild(li)
    li.appendChild(a)
    li.setAttribute('id', uniqueChanId)
    li.innerText = channelObj.name;
    // function called here so that it's not defined first due to hoisting
    addListener(uniqueChanId);
    channelArray.push(li);
};

// display as server msg
var serverAlert = function (msgObj) {
    var message = msgObj.msg;
    console.log(message);
    var now = moment()
        .format('h:mm a');
    var inset = document.getElementById("inset");
    var msgDiv = document.createElement("div");
    msgDiv.setAttribute('class', 'chatter')
    var msgName = document.createElement("span");
    msgName.setAttribute("class", "name");
    var msgTime = document.createElement("span");
    msgTime.setAttribute("class", "time");
    msgTime.innerHTML = now;
    var msgHolder = document.createElement("div");
    msgHolder.setAttribute("class", "alert");
    msgHolder.innerHTML = message;
    msgDiv.appendChild(msgName);
    msgDiv.appendChild(msgTime);
    msgDiv.appendChild(msgHolder);
    inset.appendChild(msgDiv)
    var before = inset.firstChild;
    inset.insertBefore(msgDiv, before)
};

// display as user msgs
var displayMsg = function (msgObj) {
    var now = moment()
        .format('h:mm a');
    var inset = document.getElementById("inset");
    var msgDiv = document.createElement("div");
    msgDiv.setAttribute('class', 'chatter')
    var msgName = document.createElement("span");
    msgName.setAttribute("class", "name");
    msgName.innerHTML = msgObj.from;
    var msgTime = document.createElement("span");
    msgTime.setAttribute("class", "time");
    msgTime.innerHTML = now;
    var msgHolder = document.createElement("div");
    msgHolder.setAttribute("class", "message");
    msgHolder.innerHTML = msgObj.msg;
    msgDiv.appendChild(msgName);
    msgDiv.appendChild(msgTime);
    msgDiv.appendChild(msgHolder);
    inset.appendChild(msgDiv)
    var before = inset.firstChild;
    inset.insertBefore(msgDiv, before)
};