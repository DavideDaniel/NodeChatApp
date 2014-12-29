var WebSocketServer = require( "ws" )
  .Server;
var server = new WebSocketServer( {
  port: 3000
} );
var moment = require( 'moment' );
var now = moment()
  .format( 'MMM Do, h:mm a' );
//  Added fs as requirement
var fs = require( 'fs' );
//Random color generator for user colors
var r = Math.floor( Math.random() * ( 255 - 100 ) );
var g = Math.floor( Math.random() * ( 255 - 100 ) );
var b = Math.floor( Math.random() * ( 255 - 100 ) );
var rgb = "rgb(" + r + ", " + g + ", " + b + ")"
//User database - array to store incoming clients and to track when they leave as well
// var channel = {chName:"", userDB:[]};
var userDB = [];
// //Channel constructor
//   var Channel = function(name, pw, type){
//    this.type = "channel";
//    this.pw = pw;
//    this.chDB = [];
//     this.name = name;
//    // this.size = num;
//    this.create = function(){
//      // if (){
//      //  user.DB.length = 10
//      // }
//      // else if (){
//      //  user.DB
//      }
//    }
// var join = function (chName, pw,) 
//   }
// }
//Message database - array to store chat history for new clients and alleviate FOMO ;)
var msgDB = {
  type: "history",
  list: []
}
//  Added var for files to point to history.txt and backupFile.txt
var file = "history.txt";
var backupFile = "backupFile.txt";
//Display users via list
var onlineUsrs = {
  type: "userList",
  list: []
}
//User object - establish that connecting client is User and assign name
var User = function ( connection, name ) {
  this.name = "";
  this.color = rgb;
  this.channel = "";
  this.client = connection;
};
//Log to check server's up
console.log( "Server running on port 3000." )
// Channel.general = general
//On connection...
server.on( "connection", function ( client ) {
  //serialization addition:
  var historyMsg = msgDB.list.join( "\n" );
  //Create new user object and push to userDB
  var currUser = new User( client );
  userDB.push( currUser );
  console.log( "New client has connected." );
  console.log( msgDB );
  //Broadcast client in channel  
  fs.readFile( file, function ( err, data ) { // ** NOTE - data for txt files is formatted properly on wscat and .split is bad news bears
    var backedUp = data
    console.log( msgDB.list.length + "history" )
    console.log( backedUp.length + "backedup" )
    userDB.forEach( function ( user ) {
      if ( user.client != client ) {
        currUser.send( JSON.stringify( "Welcome!" ) );
      }
    } );
    if ( msgDB.list.length < backedUp.toString()
      .split( "," )
      .length ) {
      msgDB.list.push( backedUp );
      currUser.send( historyMsg );
    }
    else {
      currUser.send( historyMsg );
    }
  } )
  //On message...
  client.on( "message", function ( msg ) {
    if ( currUser.name === "" ) { // if name is null
      client.send( JSON.stringify( msgDB ) );
      currUser.name = msg;
      onlineUsrs.list.push( msg );
      userDB.forEach( function ( user ) {
        user.client.send( JSON.stringify( onlineUsrs ) );
      } );
    }
    else {
      var parsedMsg = JSON.parse( msg );
      parsedMsg.msgType = "history";
      msgDB.list.push( now + ":" + parsedMsg );
      userDB.forEach( function ( user ) {
        user.client.send( now + ":" + msg );
      } );
    }
  } );
  //On close...
  client.on( "close", function () {
    var exitingUsr = "";
    userDB.forEach( function ( ext ) {
      if ( ext.currUser === client ) {
        exitingUsr = ext.name;
        var index = userDB.indexOf( ext );
        userDB.splice( index, 1 );
        console.log( userDB );
      }
    } );
    onlineUsrs.list.forEach( function ( sn ) {
      if ( sn === exitingUsr ) {
        var exit = onlineUsrs.list.indexOf( sn );
        onlineUsrs.list.splice( exit, 1 );
      }
    } );
    userDB.forEach( function ( user ) {
      onlineUsrs.type = "exit";
      console.log( onlineUsrs );
      user.currUser.send( JSON.stringify( onlineUsrs ) );
      user.currUser.send( JSON.stringify( {
        type: "end",
        message: exitingUsr + " is offline."
      } ) );
    } );
  } );
} );

var json = function (currUser, msg, channel){
  var msgObj = {type:"msg", from:currUser, message:msg, to:channel};
  var jsoned = JSON.stringify(msgObj);
  console.log(msgObj);
}

var online = function()