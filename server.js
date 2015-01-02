var WebSocketServer = require( "ws" )
    .Server;
var server = new WebSocketServer(
{
    port: 3000
} );
//Random color generator for user colors
var r = Math.floor( Math.random() * ( 255 - 100 ) );
var g = Math.floor( Math.random() * ( 255 - 100 ) ); 
var b = Math.floor( Math.random() * ( 255 - 100 ) );
var rgb = "rgb(" + r + ", " + g + ", " + b + ")"


//User database - array to store incoming clients and to track when they leave as well
var userDB = [];

// Channel constructor - 
// var Channel = function(name, pw, num, type){
//  this.name =  ""
//  this.type = "channel";
//  this.pw = pw;
//  this.userDB = [];
//  this.size = num;
//  this.join = function(){

//  }
//  this.create = function(){
//    if (user.DB.length > 2){
//      this.join = false;
//    }
//     else if (userDB.length >10)
//      user.DB
//    }
//  }

 //// Whisper Object
// var msgW = {
//   type: "whisper",
//   this.userDB = [];
//   this.create = function(user){
//     while userDB 
//   }
// }
//Message database - array to store chat history for new clients and alleviate FOMO ;)
var msgDB = {
    type: "history",
    list: []
}
//Display users via list
var onlineUsrs = {
    type: "userList",
    list: []
}
//User object - establish that connecting client is User and assign name
var User = function ( connection )
{
    this.name = "";
    // this.color = rgb;
    this.client = connection;
};

if(msgDB.list.length>1){
  server.send(JSON.stringify({type:"history", list: history}))
}
//Log to check server's up
console.log( "Server running on port 3000." )
// Channel.general = general
//On connection...
server.on( "connection", function ( client )
{
    //Create new user object and push to userDB
    var currUser = new User( client );
    userDB.push( currUser );
    console.log( "New client has connected." );

    //Broadcast client in channel  
    userDB.forEach( function ( user )
    {
        if ( user.client != client )
        {
            user.client.send( JSON.stringify( "Welcome!" ) );
        }
    } );
    //On message...
    client.on( "message", function ( msg )
    {
        if ( currUser.name === "" )
        { // if name is null
            client.send( JSON.stringify( msgDB ) );
            currUser.name = msg;
            onlineUsrs.list.push( msg );
            userDB.forEach( function ( user )
            {
                user.client.send( JSON.stringify( onlineUsrs ) );
            } );
        }
        else
        {
            var parsedMsg = JSON.parse( msg );
            parsedMsg.msgType = "history";
            msgDB.list.push( parsedMsg );
            userDB.forEach( function ( user )
            
            {

                currUser.client.send( msg );
            } );
        }
    } );
    // On close...
    client.on( "close", function ()
    {
        var exitingUsr = "";
        userDB.forEach( function ( ext )
        {
            if ( ext.currUser === client )
            {
                exitingUsr = ext.name;
                var index = userDB.indexOf( ext );
                userDB.splice( index, 1 );

            }
        } );
    //     onlineUsrs.list.forEach( function ( sn )
    //     {
    //         if ( sn === exitingUsr )
    //         {
    //             var exit = onlineUsrs.list.indexOf( sn );
    //             onlineUsrs.list.splice( exit, 1 );
    //         }
    //     } );
    //     userDB.forEach( function ( user )
    //     {
    //         onlineUsrs.type = "exit";
    //         user.client.send( JSON.stringify( onlineUsrs ) );
    //         user.client.send( JSON.stringify(
    //         {
    //             type: "end",
    //             message: exitingUsr + " is offline."
    //         } ) );
        } );
    } );
// } );