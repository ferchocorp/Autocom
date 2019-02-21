const path = require('path');
const express = require('express');
const app = express();
const mysql = require('mysql');

var conexion = mysql.createConnection({
		host:'localhost',
		user:'root',
		password:'',
		database:'chat'
});

app.set('port', process.env.PORT || 8088);
app.use(express.static(path.join(__dirname,'views')));

const server =app.listen(app.get('port'),()=>{

});

const socket = require('socket.io'); 
const io = socket.listen(server);
const userconnect = {};
io.on('connection',(socket) =>{
	// console.log("nueva connection",socket.id);
	socket.on("sendmessage", (data)=>{
		console.log(data);
		conexion.query("INSERT INTO message SET?",{id_user:data.id_user, message:data.message} ,(err,result)=>{
			if(err){
				throw err;
			}else
			{
				io.sockets.emit('messageserver',data);
			}
		});
		
	});

	socket.on("sendname", (data)=>{
		conexion.query("select COUNT(*) as valor from user where nickname = ?",[data] ,(err,result)=>{
			if(err){
				throw err;
			}
			else{
				var id_user = "";
				if(!result[0].valor)
				{
					conexion.query("INSERT INTO user SET?",{nickname:data} ,(err,result)=>{
						if(err){
							throw err;
						}else
						{
							conexion.query("SELECT @@identity AS id",(err,result)=>{
								if(err){
									throw err;
								}else
								{
									// console.log(result[0].id);
									id_user = result[0].id;
									console.log(id_user);
									socket.emit("validateuser",{"resultado":result, "name":data,"id":id_user});
								}
							});
						}
					});
				}else
					socket.emit("validateuser",{"resultado":result, "name":data,"id":id_user});
			}
		})
	});
});

