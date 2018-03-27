var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);


server.listen(process.env.PORT || 3000);
console.log('Sever is Running');

app.get('/',function(req,res){
	res.sendFile(__dirname+'/index.html');
});

app.get('/paint',function(req,res){
	res.sendFile(__dirname+'/paint.html');
});

var connections = [];
var users = [];
var typingUsers = {};

io.sockets.on('connection',function(socket){
	console.log('Connected');
	connections.push(socket);
	console.log('connected: %s sockets connected',connections.length);

	socket.on('disconnect',function(data){
		connections.splice(connections.indexOf(socket),1);
		users.splice(users.indexOf(socket.username),1);
		UpdateUsersList();
		console.log('Disconnected: %s sockets connected',connections.length);
	});

	socket.on('new message',function(data){
		console.log(data);
		setTimeout(function(){
			io.sockets.emit('new message',{
				'clientID':data.clientID,
				'user':data.user,
				'msg':data.msg
			});	
		},1);
		
	});

	socket.on('new user',function(data,callback){
		callback(true);
		socket.username = data;
		users.push(data);
		UpdateUsersList();
		console.log("New User Added: "+data);
	});

	socket.on('typing',function(data){
		typingUsers[data.user] = data.istyping;
		current = [];
		for(u in typingUsers){
			if(typingUsers[u]){
				current.push(u);
			}
		}
		io.sockets.emit('typing users',current);
	});

	function UpdateUsersList(){
		io.sockets.emit('get users',users);
	}

});



