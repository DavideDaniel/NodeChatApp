
var client = new WebSocket( "ws://localhost:3000" )
// var client = new WebSocket( "ws://david.princesspeach.nyc:3000" )
var body = document.querySelector( "body" );
var onlineUsrs = document.querySelector( "u#users" )
var usidebar = document.querySelector( "div#usrs" )
var chatbox = document.querySelector( "ul#chat" )

var User = function ()
{
    this.name = "";
    this.msg = "";
    this.msgType = "";

}


var currUser = new User();
var usersCurrent = [];

client.addEventListener( "open", function ( connection )
{
    console.log( "Connected to server." );

    var inputOne = document.getElementById("inputOne")
    
        
        inputOne.addEventListener("keyup", function(e) {
        if(e.keyCode === 13 && inputOne.value.trim() != "") {
        var fixedDiv = document.querySelector("#fixed")
        var button = document.getElementById("login");
        currUser.name = inputOne.value;
        console.log(currUser);
        client.send(currUser.name);
        fixedDiv.style.display = "none";
        }

        });



} );

client.addEventListener( "message", function ( msg )
{



    var parsedMsg = JSON.parse( msg.data );
if ( parsedMsg.type === "history" )
    {
        var history = parsedMsg.list;
        history.forEach( function ( historyMsg )
        {
            var li = document.createElement( "li" );
            li.innerText = historyMsg.name + ": " + historyMsg.msg;
            li.style.listStyle = "none";
            var chatbox = document.getElementById( "chat" );
            chatbox.appendChild( li )
            ul.insertBefore(li, ul.firstChild);
        } )
    }

    if ( parsedMsg.type === "userList" )
    {
        var list = parsedMsg.list;
        list.forEach( function ( name )
        {
            var onlineUsrs = document.querySelector( "ul#users" )
          
    if ( name != currUser.name )
            {
                var li = document.createElement( "li" );
                li.setAttribute( "class", "online" );
                li.innerText = name;
                onlineUsrs.appendChild( li );
            }
    
        } );
    }
    
    else if ( parsedMsg === "Welcome!" )
    {
        var li = document.createElement( "li" );
        li.innerText = parsedMsg;
        li.style.listStyle = "none";
        var chatbox = document.getElementById( "chat" );
        chatbox.appendChild( li );
        ul.insertBefore(li, ul.firstChild);
    }
    else
    {
        var li = document.createElement( "li" );
        li.innerText = parsedMsg.name + ": " + parsedMsg.msg;
        li.style.listStyle = "none";
        var chatbox = document.getElementById( "chat" );
        chatbox.appendChild( li );
        ul.insertBefore(li, ul.firstChild);
    }
} );
var input = document.getElementById( "inputMsg" )
input.addEventListener( "keydown", function ( e )
{
    if ( e.keyCode === 13 )
    {
        var newMsg = input.value;
        currUser.msg = newMsg;
        client.send( JSON.stringify( currUser ) );
        input.value = "";
    }
} );

// FUNCTIONS
// var filter = function ( parse )
// {
//     var chatbox = document.getElementById( "chat" );
//     var checkMsg = parse.msg;
//     var split = checkMsg.split( " " );
//     split.forEach( function ( e )
//     {
//         var chkForImg = e.charAt( e.length - 3 ) + e.charAt( e.length - 2 ) + e.charAt( e.length - 1 )
//         while
//         // for (var i = e.length - 3; i >= -1; i--) {};
//         ( chkForImg === "gif" || chkForImg === "jpg" || chkForImg === "png" || chkForImg === "bmp" )
//         {
//             var img = document.createElement( "img" );
//             img.setAttribute( "src", e );
//             img.style.width = "120px";
//             img.style.height = "120px";
//             var li = document.createElement( "li" )
//             li.appendChild( img );
//         }
    // } )
    // split.forEach( function ( e )
    // {
    //     var chkForBan = e.indexOf( "unctious" && "frack" );
    //     if ( e.indexOf( "unctious" ) > -1 || e.indexOf( "frack" )
    //     {
    //         ws.send( client.close() );
    //     } )
    //         split.forEach( function ( e )
    //         {
    //             if ( str.indexOf( "(umadbro)" > -2 && str.indexOf( "(umadbro)" < 11 ) ) )
    //             {
    //                 var res = str.replace( /\(umadbro\)/g, " ¯\\_(ツ)_/¯ " );
    //             }
    //             if ( str.indexOf( "(creep)" > -1 ) )
    //             {
    //                 var res = str.replace( /(creep)/g, "( ͡° ͜ʖ ͡°)" );
    //             }
    //             if ( str.indexOf( "(pistols)" > -1 ) )
    //             {
    //                 var res3 = str.replace( /(pistols)/g, "̿' ̿'\\̵͇̿̿\\з=(◕_◕)=ε/̵͇̿̿/'̿'̿ ̿" );
    //             }
    //         } )
    //     // 
    // } )

//     function Emote( text )
//     {
        // var emoticons = {
        //     ':)': "emoji1.jpg",
        //     ':D': "emoji2.jpg",
        //     '><': "emoji3.jpg"
        //     ':*(': "emoji4.jpg"
        //     'O_O': "emoji5.jpg"

//         }; 



//     }

    // var emote = function (str) {   
    // var umadbro = function(str){
    // if (str.indexOf("(umadbro)" > -2 && str.indexOf("(umadbro)" < 11))) {
    // var res = str.replace(/umadbro/g, " ¯\\_(ツ)_/¯ " );
    // return res
    // }}
    // var creep = function(str){
    // if (str.indexOf("(creep)" > -1)) {
    // var res = str.replace(/(creep)/g, "( ͡° ͜ʖ ͡°)" );
    // return res
    // }}
    // var pistols = function(str) {
    // if (str.indexOf("(pistols)" > -1)) {
    // var res3 = str.replace(/(pistols)/g, "̿' ̿'\\̵͇̿̿\\з=(◕_◕)=ε/̵͇̿̿/'̿'̿ ̿" );
    // return res
    // }}
    // var dance = function(str) {
    // if (str.indexOf("(dance)" > -1)) {
    // var res4 = str.replace(/(dance)/g, "♪┏(°.°)┛┗(°.°)┓┗(°.°)┛┏(°.°)┓ ♪" );
    // return res
    // }}
    // var pirate = function(str){
    // if (str.indexOf("(pirate)" > -1)) {
    // var res5 = str.replace(/(pirate)/g, "✌(◕‿-)✌" );
    // return res
    // }}
    // var tableFlip = function(str){
    // if (str.indexOf("(table flip)" > -1)) {
    // var res6 = str.replace(/(table flip)/g, "/(╯°□°）╯︵ ┻━┻" );
    // return res
    // }}
    // }
    // }