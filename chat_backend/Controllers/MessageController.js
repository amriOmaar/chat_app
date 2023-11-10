const asyncHandler = require("express-async-handler")
const Message = require("../Models/MessageModel.js")

const getMessages = asyncHandler(async (req, res) => {
  const { sender, receiver } = req.body;

  try{
    const messages = await Message.find({$or:[{ sender, receiver }, { receiver: sender, sender: receiver }]});
    res.json(JSON.stringify(messages));
  }catch(error){
    res.status(400).json({message: error.message});
  }
});

const addMessage = async(req, res) => {
  try{
    const currData = new Message(req.body)
    const doc = await currData.save()
    res.status(200).json(doc)
  }catch(error){
    res.status(400).json({message: error.message});
  }
}

module.exports = { getMessages, addMessage };