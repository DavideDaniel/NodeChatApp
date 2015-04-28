var client = new WebSocket("ws://localhost:5210");
var user = {
    type: 'user',
    name: 'anonymous',
    connected: false,
    id: '',
    channel: {
        name: 'General'
    },
    msg: ''
};
var channelList = [];
var chatList = [];
var userList = document.querySelector("ul#users")
var userListDiv = document.querySelector("div#usrs")
client.addEventListener("open", function(evt) {
    console.log("Connected to server");
    user.connected = true;
    console.log(user.connected);
    var inputOne = document.getElementById("inputOne")
    var inputTwo = document.getElementById("inputTwo")
    inputTwo.addEventListener("keyup", function(e) {
        if (e.keyCode === 13 && inputOne.value.trim() != "") {
            var hiddenDiv = document.querySelector("#hiddenDiv")
            var button = document.getElementById("login");
            user.name = inputOne.value;
            user.channel.name = inputTwo.value;
            if (inputTwo.value === '' || inputTwo.value === 'general') {
                user.channel.name = 'General';
            }
            entering(user.name, user.channel.name)
            hiddenDiv.style.display = "none";
        }
    });
    var joinChan = document.getElementById("joinChan");
    joinChan.addEventListener("click", function(){
    var channelName = prompt("Pick a channel");
    var msgToJoin = {
        type: "join",
        channel: channelName
    }
    client.send(JSON.stringify(msgToJoin));
})
});
client.addEventListener('message', function(message) {
    var msgObj = JSON.parse(message.data);
    checkMsgType(msgObj)
})
client.addEventListener('close', function(close) {
    user.connected = false;
    console.log(user.connected);
});
var input = document.getElementById('inputMsg')
input.addEventListener('keyup', function(e) {
    if (e.keyCode === 13) {
        var newMsg = new ObjToSend('msg', input.value, user.channel.name);
        client.send(JSON.stringify(newMsg));
        input.value = '';
    }
})
var ObjToSend = function(type, message, channel) {
    this.type = type;
    this.msg = message;
    this.channel = channel;
}
var entering = function(name, channel) {
    var onEnter = {
        type: 'firstEntering',
        name: user.name,
        channel: user.channel.name
    }
    client.send(JSON.stringify(onEnter));
}
var successfulEnter = function(msgObj) {
    user.id = msgObj.userId
    console.log("You are user #" + user.id)
}
var checkMsgType = function(msgObj) {
    var msgType = msgObj.type
    console.log(msgType);
    if (msgType === "setId") {
        successfulEnter(msgObj)
    } else if (msgType === "entering") {
        serverAlert(msgObj)
    } else if (msgType === 'exiting') {
        serverAlert(msgObj)
    } else if (msgType === "msg") {
        displayMsg(msgObj);
    } else if (msgType === 'channels'){
        channelList = msgObj.channels
        channelList.forEach(function(channel){
            displayChannel(channel);
        });
    }
}

var displayChannel = function(msgObj) {
    var ul = document.getElementById('channels')
    var li = document.createElement('li')
    ul.appendChild(li)
    li.innerHTML = msgObj.channel;
}
var serverAlert = function(msgObj) {
    var message = msgObj.msg;
    console.log(message);
    var now = moment().format('h:mm a');
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
}
var displayMsg = function(msgObj) {
    var now = moment().format('h:mm a');
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
}
// TEST appending
// var input = document.getElementById("inputMsg")
//         input.addEventListener("keyup", function(e) {
//         if(e.keyCode === 13) {
//         
//         var li = document.createElement("li");
//       	li.innerText= input.value;
//       	li.setAttribute('id', 'msg')
//       	var msgHolder = document.querySelector("ul#msgHolder");
//       	msgHolder.appendChild(li);
//       	var before = ul.firstChild;
// 		ul.insertBefore( li, before )
//         input.value = ''; //clear the input area
//       }
//   });