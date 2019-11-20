const express=require('express');
const http=require('http');
const path=require('path');
const socketio=require('socket.io');
const app=express();
const server =http.createServer(app);
const directory_path=path.join(__dirname+'./public');
app.use(express.static(directory_path));
app.set('view engine','ejs');

app.get('/',(req,res)=>{
    res.render('index');
})
const io=socketio(server);
 io.on('connection',()=>{
     console.log('hello world');    
 })

server.listen(3000,()=>{
    console.log('running in 3000');
})