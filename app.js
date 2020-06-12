const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser=require('body-parser')
const socketio = require('socket.io');
const app = express();
const mongoose = require('mongoose')
const server = http.createServer(app);
const jwt = require('jsonwebtoken');
const Filter = require('bad-words')
var cookieParser = require('cookie-parser')
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
const { generateMessage, generateLocation, generateMessage1 } = require('./utils/messages')
const directory_path = path.join(__dirname + './public');
const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users')
const secret = "JWTdmsod"
mongoose.connect('mongodb+srv://Nipun:nipun@cluster0-6kwx6.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true })
    .then(() => console.log('connected'))
    .catch(err => { console.log(err); })
const Group = require('./group.js')
const User = require('./user.js')
const generateToken =async (res, {username,email}) => {
    const expiration = 604800000000000;
    const token =await jwt.sign({ username ,email}, secret);
   return res.cookie('token', token, {
        expires: new Date(Date.now() + expiration)
    });
};
const verifyToken = async (req, res, next) => {
    if (req.cookies.token == undefined) {
        res.render('login');
    }
    else {
        const token = req.cookies.token || '';
        try {
            if (!token) {
                return res.render('login');
            }
            const decrypt = await jwt.verify(token, secret);
            req.user = {
                username: decrypt.username,
                email:decrypt.email
            };
            if(req.user.username==undefined || req.user.email==undefined){
                res.render('login');
            }
            else{
                next();
            }
        } catch (err) {
            return res.render('login');
        }
    }
};
app.use(express.static(directory_path));
app.set('view engine', 'ejs');

app.get('/', verifyToken,(req, res) => {
    if(req.user.email!=undefined)
        res.redirect('/logined');
    else
        res.render('login')
})

app.post('/checkUser',(req,res)=>{
    const {email,password}=req.body;
    User.findOne({email:email,password:password})
    .then(async (doc)=>{
        if(doc){
            await generateToken(res,{username:doc.name,email:email});
            res.status(200).json({message:'congo'});
        }
        else{
            res.status(200).json({message:'user credentials are wrong'});
        }
    })
    .catch((err)=>{
        res.status(200).json({message:'some error'});
    })

})
app.get('/signup', (req, res) => {
    res.render('signup');
})
app.post('/addUser', async (req, res) => {
    const data=req.body;
   
    await User.findOne({ email: data.email })
        .then((doc) => {
            if (doc) {
                 res.status(800).json({'message':'already present'});
            }
            else {
                const newUser = new User({
                    name: data.name,
                    email: data.email,
                    image: data.imageUrl,
                    password: data.password
                })
                newUser.save(async (err, re) => {
                    if(err){
                        res.status(800).json({"message" :err});
                    }
                    await generateToken(res,{username:data.name,email:data.email});
                    
                    res.status(200).json({'message':'enjoy'});
                });
            }
        })
})
app.get('/logined', verifyToken,async (req, res) => {
        var username;
        let group=[];
        await User.findOne({email:req.user.email})
        .then((doc)=>{
            if(doc){
                username=doc.name;
                group=doc.group
            }
        })
        res.render('index', { name:username,group :group});
})
app.get('/chat', verifyToken, async (req, res) => {
    if(req.query==null){
        res.render('login');
    }
    else{
        await User.findOne({email:req.user.email})
        .then((doc)=>{
            doc.group=doc.group.filter((value)=>{
                if(value.name!=req.query.room)
                return true;
            })
            doc.group.push({name:req.query.room});
            doc.save('done');
        })
      res.render('chat');
    }
})
let count = 0;
let serv = 0;
const io = socketio(server);
io.on('connection', async (socket) => {

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage('admin', user.username + ' left the chats'))
            io.to(user.room).emit('roomdata', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }
    })
    socket.on('increase', async () => {
        count++;
        io.emit('countIncrement', count);
    })
    socket.on('sendMessage', async (message, callback) => {

        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback('dont abuse')

        }
        const user = await getUser(socket.id)
        await io.to(user[0].room).emit('message', generateMessage(user[0].username, message));
        await Group.findOne({ name: user[0].room })
            .then((doc) => {
                if (doc) {
                    doc.text.push({
                        Sender: user[0].username,
                        Time: Date.now(),
                        Message: message
                    })
                    doc.save('done');
                }
                else {
                    const newDoc = new Group({
                        name: user[0].room,
                        text: [{

                            Sender: user[0].username,
                            Time: Date.now(),
                            Message: message
                        }]
                    })
                    newDoc.save((err, res) => {
                        if (err) {
                            res.send('err');
                        }
                    })
                }
            })
        callback('delivered')
    })
    socket.on('getLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user[0].room).emit('locationMessage', generateLocation(user[0].username, `https://google.com/maps?q=${coords.lattitude},${coords.longitude}`))
        callback()

    })
    socket.on('previousMessage', async (callback) => {
        user = await getUser(socket.id);
        await Group.findOne({ name: user[0].room })
            .then(async (doc) => {
                if (doc) {
                    callback(doc.text);
                }
            })
    })
    socket.on('join', async ({ user, room }, callback) => {

        const { error, use } = await addUser({ id: socket.id, username: user, room: room })

        if (error) {
            return callback(error)
        }
        socket.join(use.room)
        socket.broadcast.to(use.room).emit('message', generateMessage('admin', `${use.username} a new client joined`))
        io.to(use.room).emit('roomdata', {
            room: use.room,
            users: getUserInRoom(use.room)
        })
    })

})
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
    console.log('running in ' + PORT);
})