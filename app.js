var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static("client"));

users = [];
usuario = 0;
console.log(usuario+"sssss");

io.on('connection', function(socket){
	console.log("dddd");
	usuario = 0;
	socket.on('setUsername', function(data){
		if(users.find(validateUsername)){
			socket.emit('userExists', data + ' username is taken! Try some other username.');
		}else{
			users.push({"id":socket.id, "username":data.nombre});
			io.sockets.emit('addUser', {id:socket.id, username: data.nombre, avatar: data.pic});
			socket.emit('userSet', {id:socket.id, username: data.nombre});			
		}
		function validateUsername(item){
			return item.nombre===data.nombre;
		}		
	});
	
	socket.on('moverUser', function (data) {
		io.sockets.emit('moverTodo', {idelement:socket.id});
	});

	socket.on('validarGano', function () {
		if(usuario==0){
			usuario = 2;
			io.sockets.emit('mostrarGano', {idelement:socket.id});			
		}else{
			io.sockets.emit('mostrarPerdio', {idelement:socket.id, num: (Math.floor(Math.random() * 9) + 1)});	
		}
	});

	socket.on('disconnect', function () {
		socket.broadcast.emit('usuarioDesconectado',{ id: socket.id});
		index = users.findIndex(x => x.id==socket.id);
		users.splice(index,1);
	});

});

server.listen(3000, function(){
	console.log('listening on localhost:3000');
});

