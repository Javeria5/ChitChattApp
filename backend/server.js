const express = require("express");
const app = express()
const {chats} = require("./data/data");
const dotenv = require("dotenv");
const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const messagesRoutes = require('./routes/messagesRoutes')
const {NotFound,ErrorHandlers} = require("./middlewares/error")
const cors = require("cors");


//using diffeent methods 
app.use(cors({
origin: '*',
methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}));


///db connection 
const connectDB = require('./config/db')

dotenv.config();

connectDB();

app.use(express.json());  //to accept json dta

///Check API running 
app.get("/", (req,res)=>{
    res.send("API Running")
});


// All Routes 
app.use('/api/user',userRoutes)
app.use('/api/chat',chatRoutes)
app.use('/api/messages',messagesRoutes)


//Errpr Handling 
app.use(NotFound)
app.use(ErrorHandlers)


//////Socket.io Connection////////////////
//Socket.io ----> Real time communication krata hy b/w server & client

const server = app.listen(5000, console.log("Server started on port 5000"))


const io = require('socket.io')( server , {
    pingTimeout: 60000,
    cors: {
        origin : "http://localhost:3000",
    },
});

//io.on("connection", (socket) => { ... })-----> yeh function triggered hoga jab naya client connect hoga server sy
// socket.on("setup", (userData) => { ... })----> yeh event trigger hoga jab client setup event yehk specific room join krta user id k according
//socket.on("join chat", (room) => { ... }) ---> yeh ecent trigger hota jab client specific chat room join krna chahta or log krata k user ny room join krliya hy
//socket.on("typing", (room) => { ... }) ---- yeh trigger hota jab user chat room mae typing start krta hy It emits a "typing" event to all other users in the same room 
//socket.on("stop typing", (room) => { ... }) --> yeh trigger hota jab user stop krdyta typing
//socket.on("new message", (newMessageReceived) => { ... })---> This event is triggered when a new message is received from a user
//socket.off("setup", () => { ... })-->  yeh remove  krta "setup" event listener when a user disconnects. yeh  placed hoga  inside the socket.on("setup", (userData) => { ... }) callback to have access to the userData variable.
//socket.join(room) ---> yeh specific room join krny k liye use hota hy yeh allow krta hy client ka grp hona specific chat mae
//socket.emit(eventName, eventData) ----> yeh use hota function ko emit krny k liye t from the server to the client associated with the socket.
//socket.in(room).emit(eventName, eventData)----> yeh use hota hy emit krny k liye event ko from all sockets/clients yeh specify krta hy specific event name or optional event data to socket


io.on("connection", (socket) => {
    console.log("connected to socket.io")

   //yeh suer data lyga fronted sy  
    socket.on("setup", (userData) => {
        //isny useraData sy id li or particular room join kra 
    socket.join(userData._id);
    console.log(userData._id);
    socket.emit("connected");
    });
    socket.on("join chat", (room) => {
    //isny useraData sy id li or particular room join kra 
    console.log("user want to Join room")
    socket.join(room);
    console.log("user Joined room: "+ room);
    
    });
    // socket.on("typing", (room) => socket.in(room).emit("typing"));
    // socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });
})