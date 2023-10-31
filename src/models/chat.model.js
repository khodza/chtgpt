import mongoose from "mongoose";


mongoose.set('strictQuery', false);
const userSchema = new mongoose.Schema({
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    chats: [{
      type: String,
      ref: 'Chat',
    }],
  });
  
  
const chatSchema = new mongoose.Schema({
 messages: [{
    role: {
    type: String,
    required: true,
    },
    content: {
    type: String,
    required: true,
    },
}],
});

const User = mongoose.model('User', userSchema);
const Chat = mongoose.model('Chat', chatSchema);
export {User,Chat};