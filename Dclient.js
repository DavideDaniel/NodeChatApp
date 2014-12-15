var client = new WebSocket("ws://localhost:3000")

     var body = document.querySelector("body");
        var onlineUsrs = document.querySelector("u#users")
        
        
        var usidebar = document.querySelector("div#usrs")
        var chatbox = document.querySelector("ul#chat")
        

        var User = function( ) {
        this.name = "";
        this.msg= "";
        this.msgType= "";
        }

        var usr = new User();

        var usersCurrent= [];

        //FUNCTIONS

        client.addEventListener("open", function(connection) {
        console.log("you are connected!");



        
            
            // button.addEventListener("click", function(){
                // window.location.href= "dHTML"
            // })
        
        // var inputOne = document.getElementById("inputOne")
        // inputOne.addEventListener("keyup", function(e) {
        // if(e.keyCode === 13) {
        // var button = document.getElementById("login");
        // usr.name = inputOne.value;
        // console.log(usr);
        // client.send(usr.name);
        // window.location.href="dHTML.html"
        // }

        });
// })
        client.addEventListener("message", function(msg) {
    console.log(msg.data);
    var parsedMsg = JSON.parse(msg.data);
    console.log(parsedMsg);

    if (parsedMsg.type === "userList") {
      var list = parsedMsg.list;
      list.forEach(function(name) {
        var onlineUsrs = document.querySelector("ul#users")
        if(name != usr.name) {
          var li = document.createElement("li");
          li.setAttribute("class","online");
          li.innerText = name;
          onlineUsrs.appendChild(li);
        }
      });
    } 
    else if (parsedMsg.type === "history") {
      console.log(parsedMsg);
      console.log(parsedMsg.list);
      var history = parsedMsg.list;
      history.forEach(function(historyMsg) {
        var li = document.createElement("li");
        li.innerText= historyMsg.name + ": " + historyMsg.msg;
        li.style.listStyle = "none";
        var chatbox = document.getElementById("chat");
        chatbox.appendChild(li)
    })} 
      else if (parsedMsg === "Welcome!"){
      var li = document.createElement("li");
      li.innerText= parsedMsg;
      li.style.listStyle = "none";
      var chatbox = document.getElementById("chat");
      chatbox.appendChild(li);
    }

     
    else {
      var li = document.createElement("li");
      li.innerText= parsedMsg.name + ": " + parsedMsg.msg;
      li.style.listStyle = "none";
      var chatbox = document.getElementById("chat");
      chatbox.appendChild(li);
   }
});

        var input = document.getElementById("inputMsg")
        
        input.addEventListener("keyup", function(e) {
        if(e.keyCode === 13) {
        var newMsg = input.value;
        usr.msg = newMsg;
        client.send(JSON.stringify(usr));
        input.value = "";
      }

  });

