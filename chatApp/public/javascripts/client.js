var client = new WebSocket("ws://localhost:5210");
var user = {
    type: 'user',
    name: 'anonymous',
    connected: false,
    id: '',
    channelName: '',
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
            user.channelName = inputTwo.value;
            if (inputTwo.value === '' || inputTwo.value === 'general') {
                user.channelName = 'General';
            }
            entering(user.name, user.channelName)
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
        var newMsg = new ObjToSend('msg', input.value);
        client.send(JSON.stringify(newMsg));
        input.value = '';
    }
})
var ObjToSend = function(type, message) {
    this.type = type;
    this.msg = message;
}
var joinChannel = function(channelName) {
    var msgToJoin = {
        type: "join",
        name: channelName
    }
    client.send(JSON.stringify(msgToJoin));
}
var entering = function(name, channel) {
    var onEnter = {
        type: 'firstEntering',
        name: user.name,
        channel: user.channelName
    }
    client.send(JSON.stringify(onEnter));
}
var successfulEnter = function(msgObj) {
    user.id = msgObj.userId
    console.log("You are user #" + user.id)
}
var checkMsgType = function(msgObj) {
    var msgType = msgObj.type;
    console.log(msgType);
    if (msgType === "setId") {
        successfulEnter(msgObj)
    } else if (msgType === "create") {

        console.log('inside create in else if with '+ msgObj);
        console.log(msgObj.channelName);
        displayChannel(msgObj.channelName, msgObj.chanId)
        
    } else if (msgType === "joining") {
        serverAlert(msgObj)
    } else if (msgType === 'exiting') {
        serverAlert(msgObj)
    } else if (msgType === "msg") {
        displayMsg(msgObj);
    } else if (msgType === 'channels') {
        channelList = msgObj.channels
        channelList.forEach(function(channel) {
            // displayChannel(channel);
        });
    }
}
var addListener = function(elemId) {
    console.log('adding listener with '+elemId);
    var joinChanLiElement = document.getElementById(elemId);
    console.log(joinChanLiElement);
    joinChanLiElement.addEventListener("click", function() {
        console.log(this);
        joinChannel(joinChanLiElement.innerText);
    })
};
var displayChannel = function(channelName, elemId) {
    var ul = document.getElementById('channels')
    var li = document.createElement('li')
    var a = document.createElement('a')
    var chanId = channelName+elemId
    ul.appendChild(li)
    li.appendChild(a)
    li.setAttribute('id', chanId)
    li.innerHTML = channelName;
    console.log(li);
    addListener(chanId)
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
//          li.innerText= input.value;
//          li.setAttribute('id', 'msg')
//          var msgHolder = document.querySelector("ul#msgHolder");
//          msgHolder.appendChild(li);
//          var before = ul.firstChild;
//      ul.insertBefore( li, before )
//         input.value = ''; //clear the input area
//       }
//   });