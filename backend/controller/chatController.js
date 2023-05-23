const Chat= require('../models/chatModel')
const User = require('../models/UsersModel')
const asyncHandler = require("express-async-handler");

//The .populate() function is used to specify which document(s) from other collections to include in the result set. 

////////////Create Chat/////////////////////////
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }
  if (!req.user || !req.user._id) { // check if req.user or req.user._id is undefined
    console.log("User is not authenticated or user ID is not defined");
    return res.sendStatus(401);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [           //both of these req ahve to be true 
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestmsg");

  isChat = await User.populate(isChat, {
    path: "latestmsg.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});


///////////Fetch Chats//////////////////////////
const fetchChats = asyncHandler(async(req,res)=>{
  try {
    const result = await Chat.find({users: {$elemMatch:{$eq: req.user._id}}})
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestmsg")
    .sort({updatedAt: -1} )
    .then(async(results)=>{
      results = await User.populate(results,{
        path: "latestmsg.sender",
        select : "name pic email"
      });
      res.status(200).send(results);
    })
    res.send(result); // send the result to the client
  } catch (error) {
    res.status(400);
    //throw new Error(error.message);
  }
})


/////////CreateGroupChat///////////////////////
const CreateGroupChat = asyncHandler(async(req,res) => {
  if (!req.body.users || !req.body.name){
    return res.status(400).send({message: "Please fill all the fields"})
  }
  var users = JSON.parse(req.body.users)

  if ( users.length < 2){
    return res
    .status(400)
    .send("More than 2 users are needed to create a groupt chat");

  }
  users.push(req.user)

  try {
    const groupChat = await Chat.create({
      chatName : req.body.name,
      users:users,
      isGroupChat: true,
      groupAdmin : req.user,
    })

    const chatGroup = await Chat.findOne({ _id: groupChat._id})
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
    res.status(200).json(chatGroup)


  } catch (error) {
    res.status(400)
    
  }
})


/////////Rename Group///////////////////////
const renameGroup = asyncHandler(async(req,res) =>{
  const { chatId , chatName} = req.body
  const updatedChat = await Chat.findById(chatId,
    {
      chatName,
    },
    {
      new:true,
    }
    )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat){
    res.status(404);
    throw new Error ("Chat Not found")

  }else{
    res.json(updatedChat)
  }
})


/////////add Group User///////////////////////
const addGroupUser = asyncHandler(async(req,res) =>{

  const {groupId , userId} = req.body;
  const added = await Chat.findByIdAndUpdate(
    groupId,
    {
      $push: {users: userId},
    },
    {
      new: true
    }
  )
  .populate("users", "-password")
  .populate("groupAdmin", "-password")
 if (!added){
    res.status(404);
    throw new Error ("Chat Not found")

  }else{
    res.json(added)
  }
})


/////////Remove From Group///////////////////////
const removeFromGroup = asyncHandler(async(req,res) =>{

  const {groupId , userId} = req.body;
  const removed = await Chat.findByIdAndUpdate(
    groupId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});


module.exports = { 
  accessChat, 
  fetchChats, 
  CreateGroupChat, 
  renameGroup, 
  addGroupUser, 
  removeFromGroup
};
