const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const Filter = require('bad-words')
const { generateMessage, generateLocation } = require('./utils/messages')
const directory_path = path.join(__dirname + './public');
const {addUser,removeUser,getUser,getUserInRoom}=require('./utils/users')
app.use(express.static(directory_path));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
})
app.get('/chat', (req, res) => {
    res.render('chat')
})

let count = 0;
const io = socketio(server);
io.on('connection', (socket) => {
    //console.log('hello world');
    socket.on('disconnect', () => {
        const user=removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage('admin',user.username+' left the chats'))
            io.to(user.room).emit('roomdata',{
                room:user.room,
                users:getUserInRoom(user.room)
            })
        }
    })
    socket.on('increase', () => {
        count++;
        io.emit('countIncrement', count);





    })
    socket.on('sendMessage', (message, callback) => {
        const user=getUser(socket.id)
    //    console.log(user[0])
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback('dont abuse')
        }
        io.to(user[0].room).emit('message', generateMessage(user[0].username,message));

        callback('delivered')
    })
    socket.on('getLocation', (coords, callback) => {
        const user=getUser(socket.id)
        io.to(user[0].room).emit('locationMessage', generateLocation(user[0].username,`https://google.com/maps?q=${coords.lattitude},${coords.longitude}`))
        callback()

    })
    socket.on('join', ({ user, room },callback) => {
        const {error,use}=addUser({id:socket.id,username:user,room:room})
    //    console.log("current",use)
        if(error){
          return  callback('not working')
        }
        socket.join(use.room)
        socket.broadcast.to(use.room).emit('message', generateMessage('admin',`${use.username} a new client joined`))
        io.to(use.room).emit('roomdata',{
            room:use.room,
            users:getUserInRoom(use.room)
        })
    })
})
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
    console.log('running in ' + PORT);
})