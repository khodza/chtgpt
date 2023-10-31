import { Markup } from "telegraf";
import { User } from "../models/chat.model.js";

export async function mychats(userId,ctx) {
    const userChats  = await User.findOne({userId}).populate('chats');
    let inlineKeyboard =[]
    for(let i =0 ;i<userChats.chats.length;i++){
        const message = userChats.chats[i].messages[0].content;
        const chatId  = userChats.chats[i]._id;

         inlineKeyboard.push(
            [Markup.button.callback(`${i+1}. ${message}`,`chatId-${chatId}` )]
          );
    }
    inlineKeyboard.push([Markup.button.callback(`Delete All Chats! 🧹🗑️`,'delete-all-chats')])
    const readyInlineKeyboard =Markup.inlineKeyboard(inlineKeyboard);
    
      const message =await ctx.replyWithHTML('📩📨 <b>Your Chats</b> 📩📨', readyInlineKeyboard);
      
      const chatAndMessageKeyboard ={message_id:message.message_id,chat_id:message.chat.id};
      return chatAndMessageKeyboard;
  }

  export async function backToChat(chat_id,ctx){
    const inlineKeyboard = Markup.inlineKeyboard([[Markup.button.callback('Yes',`continueChat-${chat_id}`),Markup.button.callback('No','No-ContinueChat')],[Markup.button.callback(`Delete chat 🗑️`,`deleteChat-${chat_id}`)]]);
    await ctx.reply(`Do you want to continue conversation ?`,inlineKeyboard);
  }