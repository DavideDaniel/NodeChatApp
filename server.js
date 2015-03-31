var WSS = require( 'ws' )
	.Server;
var server = new WSS( {
	port: 3000
} );

// Message types - all as strings
// enter = entering client object
// msg = message from client object
// whisper = private message

console.log( "Server listening on port 3000" );
var moment = require( 'moment' );
var now = moment()
	.format( 'MMM Do, h:mm a' );
	console.log(now);
var userDb = [];
var i = 0;
console.log( i );
var msgObj = {};
// var channels = [];
server.on( 'connection', function ( connection ) {
	console.log( "new client" );

	i++
	var user = new User( connection );

	user.client.on( 'message', function ( j_msgObj ) {
		var msgObj = JSON.parse( j_msgObj );

		checkMsgType( msgObj, user );
	} )

	connection.on( 'close', function () {

		user.exit( userDb, user );
	} )

} )

var checkMsgType = function ( msgObj, user ) {
	console.log( user.name + ': ' + msgObj.type );
	var msgType = msgObj.type

	if ( msgType === "entering" ) {
		user.enter( msgObj )
		
	}
	else if ( msgType === "msg" ) {
		user.send( userDb, now, msgObj, user ); //user

	}

}

var User = function ( connection ) {
	this.type = 'user';
	this.connected = false;
	this.client = connection;
	this.name = 'anonymous';
	this.id = '';
	this.room = '';

	this.enter = function ( msgObj ) {
		this.connected = true;
		console.log(this.connected);
		this.id = i;
		this.name = msgObj.name;
		this.room = msgObj.room;
			userDb.push( this )
		console.log( this.name + " is user #" + this.id+this.connected);
		connection.send( JSON.stringify( {
			type: 'enter',
			userId: this.id
		} ) )
	}

	this.exit = function ( userDb, user ) {
		this.connected = false;
		// announceExit( user );

		userDb.forEach( function ( users ) {
			if ( users === user ) {
				index = userDb.indexOf( users );
				userDb.splice( index, 1 );
			}

		} )
		i--
	}

	this.send = function ( userDb, time, msgObj,  user ) {


		var message = jsonMsg( this.name, now, msgObj.msg, this.room, '' )
		console.log(message);
		userDb.forEach( function ( other ) {
			other.client.send( message )
		} )
	}
}

// var announceExit = function ( users, user ) {

// 	userDb.forEach( function ( users ) {
// 		var exiter = {
// 			type: "exiting",
// 			msg: user.name
// 		}

// 		users.client.send( JSON.stringify( exiter ) )
// 	} )
// }

var jsonMsg = function ( from, at, message, room, to ) {
	
	var msgObj = {
		type: 'msg',
		at: now,
		from: from,
		msg: message,
		room: room,
		to: to
	};
	var jsonedMsg = JSON.stringify( msgObj );

	return jsonedMsg;
}

var determineRoom = function ( message, to ) {
	var users = channels[ room ]
	if ( to == 'General' ) {
		users.client.send( JSON.stringify( message.msg ) )
	}
	else {
		for ( var i in users ) {
			users( i )
				.send( message );
		}
	}
}

