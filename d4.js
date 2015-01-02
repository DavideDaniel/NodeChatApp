var WSS = require( 'ws' )
	.Server;
var server = new WSS( {
	port: 3000
} );
var moment = require( 'moment' );
var now = moment()
	.format( 'MMM Do, h:mm a' );
var userDb = [];
var i = 0;
console.log( i );

server.on( 'connection', function ( connection ) {

	i++
	var user = new User( connection );
	user.id = i;
	console.log( user.id );
	server.send( JSON.stringify( user ) )

	user.client.on( 'message', function ( j_msgObj ) {
		var msgObj = JSON.parse( j_msgObj );
		var message = msgObj.message;
		var url = msgObj.url;
		console.log( 'success' );
	} )

	var User = function ( connection ) {
		this.type = 'user';
		this.connected = false;
		this.client = connection;
		this.name = '';
	}

	
} )