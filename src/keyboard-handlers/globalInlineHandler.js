import { backToChat } from "../keyboards/allchats.js";
import { Chat } from "../models/chat.model.js";
import {endChatKeyboard} from '../keyboards/end-chat.js';
import { INITIAL_SESSION } from "../scenes/chatgp-scene.js";
import { User } from "../models/chat.model.js";
import { sendError } from "../sendError.js";
import { startKeyboard } from "../keyboards/start-keyboard.js";

export async function globalCallbackQueryHandler(ctx) {
    const callbackData = ctx.callbackQuery.data;
    if(callbackData.startsWith('chatId-')){
      try{
        await  ctx.deleteMessage();
        const chatId = callbackData.split('-')[1];
        const chat = await Chat.findById(chatId);
        const lastRequest = chat.messages[chat.messages.length-2].content
        const lastResponse = chat.messages[chat.messages.length-1].content
        await ctx.reply(`🫵🏼 Your last request ❓:\n\n${lastRequest}`);
        await ctx.reply(`✅ Our last response:\n\n${lastResponse}`);
        await backToChat(chatId,ctx);
      }catch(err){
        await sendError(ctx,"GET-CHAT",err)
      }
    }
    if(callbackData.startsWith('continueChat-')){
      try{
        await ctx.deleteMessage();
        const chatId = callbackData.split('-')[1];
        const chat = await Chat.findById(chatId);
        // Convert chat object to plain JavaScript object
        const plainChat = chat.toObject();
        const userId = ctx.from.id.toString();
        // Remove _id field from messages array
        plainChat.messages.forEach(message => delete message._id);
        const chatAndMessageKeyboard = await endChatKeyboard(`You can continue chat 😅`,ctx);
        //Setting old messages to the session
        ctx.session[userId] = INITIAL_SESSION(plainChat.messages);
        //Setting old chat ID
        ctx.session[userId].chatId = chatId;
        //Making that keyboard exist and attaching it
        ctx.session[userId].chatAndMessageKeyboard = chatAndMessageKeyboard;
        await ctx.scene.enter('continue-chat');
      }catch(err){
        await sendError(ctx,"CONTINUE-CHAT",err)
      }
    }
    if(callbackData ==="No-ContinueChat"){
      try{
        await ctx.deleteMessage();
        await startKeyboard(ctx);
      }catch(err){
        await sendError(ctx,"NO-CONTINUE-CHAT",err)
      }
    }
    if(callbackData.startsWith('deleteChat-')){
      try{
        await ctx.deleteMessage();
        const chatId = callbackData.split('-')[1];
        const userId = ctx.from.id.toString();
        // Delete the chat by its ID
         await Chat.deleteOne({ _id: chatId });

        // Update the user by removing the chat from their chats array
          const updatedUser = await User.findOneAndUpdate(
            { userId },
            { $pull: { chats: chatId } },
            { new: true }
          );

        if (updatedUser) {
        await ctx.reply('Chat deleted. 🗑️');
        await startKeyboard(ctx);
         } else {
        ctx.reply("Error accrued try latter")
        }
      }catch(err){
        await sendError(ctx,'DELETE-ONE-CHAT',err)
      }
    }
    if(callbackData ==="delete-all-chats"){
      try {
        await ctx.deleteMessage()
      const userId = ctx.from.id.toString();
      const user = await User.findOne({ userId }).populate('chats').exec();
      if (user) {
        const chatIds = user.chats.map((chat) => chat._id);
        await Chat.deleteMany({ _id: { $in: chatIds } });
        await ctx.reply("Chats deleted successfully! 🗑️✅");
        await startKeyboard(ctx)
      } else {
        ctx.reply("Error accrued try latter")
      }
    } catch (err) {
        await sendError(ctx,"DELETE-ALL-CHATS",err)
    }
    }
  }