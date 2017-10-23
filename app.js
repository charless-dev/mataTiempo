var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static("client"));

users = [];
posicion = 0;
tiempo = 5;
//console.log(usuario);

io.on('connection', function(socket){

	console.log("Conexion exitosa");
	posicion = 0;

	socket.on('setUsername', function(data){

		if(users.find(validateUsername)){
			socket.emit('userExists', data + ' username is taken! Try some other username.');
		}else{
			user = {"id":socket.id, "username":data.nombre, "frase":data.frase, "avatar": data.pic};
			users.push(user);
			io.sockets.connected[ socket.id ].emit('usuariosConectados', users.length);
			io.sockets.connected[ socket.id ].emit('userSet', user);

			if (users.length >= 1) {
				var intervaloInicio = setInterval(
					function(){
						tiempo--;
						if (tiempo >= 0) {
							io.sockets.emit('tiempo',{tiempo:tiempo});
						}else {
							clearInterval(intervaloInicio);
							io.sockets.emit('addUser', users);
						}
				}, 1000);
			}
			//io.sockets.emit('addUser', users);
		}
		function validateUsername(item){
			//return users.findIndex(x => x.username == data.nombre);
			return item.nombre === data.nombre;
		}
	});

	socket.on('moverUser', function (data) {
		io.sockets.emit('moverTodo', {idelement:socket.id});
	});

	socket.on('validarGano', function () {
		posicion++;
		if(posicion == 1){

			index = users.findIndex(x => x.id==socket.id);
			console.log("gano"+ users[index]);
			io.sockets.emit('mostrarGano', { usuario: users[index] });
		}else{
			io.sockets.emit('mostrarPerdio', {id:socket.id, num: posicion/*(Math.floor(Math.random() * 9) + 1)*/});
		}
	});

	socket.on('disconnect', function () {
		socket.broadcast.emit('usuarioDesconectado',{ id: socket.id});

		index = users.findIndex(x => x.id == socket.id);
		console.log("desconectado: " + index);
		users.splice(index,1);
		if (users.length == 0) {
			tiempo = 20;
		}
	});
});

server.listen(3000, function(){
	console.log('listening on localhost:3000');
});

