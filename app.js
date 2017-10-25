var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var DB = require('./Database');

app.use(express.static("client"));

users = [];
posicion = 0;
ganador = false;
DB.createTable();
tiempo = 10;

io.on('connection', function(socket){

	console.log("Conexion exitosa");
	posicion = 0;
	ganador = false;

	socket.on('setUsername', function(data){

		if(users.find(validateUsername)){
			socket.emit('userExists', data + ' username is taken! Try some other username.');
		}else{
			user = {"id":socket.id, "username":data.nombre, "frase":data.frase, "avatar": data.pic};
			users.push(user);
			io.sockets.connected[ socket.id ].emit('usuariosConectados', users.length);
			io.sockets.connected[ socket.id ].emit('userSet', user);

			if (users.length >= 2) {
				var intervaloInicio = setInterval(
					function(){
						tiempo--;
						if (tiempo >= 0) {
							io.sockets.emit('tiempo',{tiempo:tiempo});
						}else {
							console.log(tiempo);
							clearInterval(intervaloInicio);
							io.sockets.emit('addUser', users);
						}
				}, 1000);
			}

		}
		function validateUsername(item){
			//return users.findIndex(x => x.username == data.nombre);
			return item.nombre === data.nombre;
		}
	});

	socket.on('moverUser', function (data) {
		io.sockets.emit('moverTodo', {idelement:socket.id});
	});

	socket.on('validarGanador', function () {
		posicion++;
		if(posicion == 1 && !ganador){

			ganador = true;
			index = users.findIndex(x => x.id==socket.id);
			io.sockets.emit('mostrarGanador', { usuario: users[index] });
			io.sockets.emit('ganador', {ganador:true});
            users[index].ganador = ganador;
			DB.insertScore({
				username:users[index].username,
				puntaje:10
			});
			console.log("gano: ", users[index].id);
		}
	});

	socket.on('validarPerdedores', function (data) {

	    index = users.findIndex(x => x.ganador==true);
		if (socket.id != users[index].id) {
	        console.log(users[index].id + " == " + socket.id);
			posicion++;
			if (posicion == 2) {
				DB.insertScore({
					username:users[index].username,
					puntaje:5
				});
			}

			if (posicion == 3) {
				DB.insertScore({
					username:users[index].username,
					puntaje:2
				});
			}

			//console.log(posicion, el.id , data.usuario.id);
			io.sockets.emit('mostrarPerdedores', {id:socket.id, num: posicion});
		}
	});

	socket.on('disconnect', function () {
		socket.broadcast.emit('usuarioDesconectado',{ id: socket.id});

		index = users.findIndex(x => x.id == socket.id);
		console.log("desconectado: " + index);
		users.splice(index,1);
		console.log('cantidad:' ,users.length);
		if (users.length == 0) {
			tiempo = 10;
		}
	});

	socket.on('mov', function(){
		io.sockets.emit('m', {idelement:socket.id});
	});
});

server.listen(3000, function(){
	console.log('listening on localhost:3000');
});

