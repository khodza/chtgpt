import { Scenes, Telegraf } from "telegraf";
import { endChatKeyboard } from "../keyboards/end-chat.js";
import { code } from "telegraf/format";
import { openai } from "../openAi.js";
import { startKeyboard } from "../keyboards/start-keyboard.js";
import { ogg } from "../ogg.js";
import { saveChat } from "../keyboards/SaveChatKeyboard.js";
import { Chat ,User } from "../models/chat.model.js";
import { sendError} from "../sendError.js";

export function  INITIAL_SESSION(messages){
    return {messages:[...messages]};
  }

  
const chatMiddleware =Telegraf.on(['text','voice'],async ctx=>{
  try{
    const message = ctx.message;
    let response;
    const userId = ctx.from.id.toString();

    //DELETE THE KEYBOARD IF NEW MESSAGE ARRIVED 
    if (ctx.session[userId].chatAndMessageKeyboard && ctx.chat.id === ctx.session[userId].chatAndMessageKeyboard.chat_id) {
      await ctx.telegram.editMessageReplyMarkup(ctx.session[userId].chatAndMessageKeyboard.chat_id, ctx.session[userId].chatAndMessageKeyboard.message_id, null);
    }
    //WORKING WITH TEXT MESSAGES
  
    if (message.text) {
      // Accepted message set to the session to delete later
      ctx.scene.session.acceptedMessage = await ctx.reply(code(`Text message accepted! ✅📝\nPlease wait for a response... ⏳💬`));
      await ctx.replyWithChatAction('typing'); // Display typing indicator
  
      // Saving the REQ message to the chat
      ctx.session[userId].messages.push({ role: openai.roles.USER, content: ctx.message.text });

      // Getting RES from openai
      response = await openai.chat(ctx.session[userId].messages);
    
      // Saving RES message to the chat
      ctx.session[userId].messages.push({ role: openai.roles.ASSISTANT, content: response.content });
    } 

    //WORKING WITH VOICE MESSAGES
    else if (message.voice) {
      // Accepted voice message
      ctx.scene.session.acceptedMessage = await ctx.reply(code(`Voice message accepted please wait for response 🕓✅`));

      //Getting voice link from telegram 
      const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);

      //Saving ogg voice as mp3
      const userId =String(ctx.message.from.id);
      const tepmName = 'voice-file'
      const oggPath = await ogg.create(link.href,tepmName);
      const mp3Path =await ogg.toMp3(oggPath,tepmName);

      //Converting mp3 to text
      const text = await openai.transportation(mp3Path)
      await ctx.replyWithHTML(`<b> 🫵🏼 Your request:\n\n${text}</b>`);

      //Saving Req message to the chat
      ctx.session[userId].messages.push({role:openai.roles.USER,content:text})

      //Getting response
      response = await openai.chat(ctx.session[userId].messages);

      //Saving Res message to the chat
      ctx.session[userId].messages.push({role:openai.roles.ASSISTANT,content:response.content})
    }

    if(message.text || message.voice){
      await ctx.deleteMessage(ctx.scene.session.acceptedMessage.message_id)
    }
    //SENDING FINAL RESPONSE
    const chatAndMessageKeyboard = await endChatKeyboard(response.content, ctx);

    //Making that keyboard exist and attaching it
    ctx.session[userId].chatAndMessageKeyboard = chatAndMessageKeyboard;
}catch(err){
    await sendError(ctx,'ERROR-CHAT_SCENE',err)
  }
}
)
const wizardScene = new Scenes.WizardScene('chatgpt-chat',chatMiddleware);
const continueChat = new Scenes.WizardScene('continue-chat',chatMiddleware)

                                                                //ENTERING TO THE SCENE
wizardScene.enter(async (ctx)=>{
  try{
    let chatAndMessageKeyboard;
    const userId = ctx.from.id.toString();
      chatAndMessageKeyboard = await endChatKeyboard(`🌟 Welcome to Chatgpt in Telegram! 🤖🎉\n\nYou can send both Voice 🗣️ and Text 📝 messages while chatting.`,ctx)
     //Setting session to the user
       ctx.session[userId] = INITIAL_SESSION([])
    //Making that keyboard exist and attaching it
    ctx.session[userId].chatAndMessageKeyboard = chatAndMessageKeyboard;
  }catch(err){
    await sendError(ctx,"ENTERING-TO-THE-CHATGPT-SCENE",err)
  }
}
);

                                                        //STAGING THE SCENE
const stage = new Scenes.Stage([wizardScene,continueChat]);
                                                    //END OF CHAT (KEYBOARD)
stage.action('end-of-chat',async ctx=>{
  const userId = ctx.from.id.toString();
  try{
    //DELETE THE KEYBOARD
    await ctx.editMessageReplyMarkup()
    if(ctx.session[userId].messages.length!==0){
    //Asking for saving the chat
      await saveChat(ctx);
    }else{
    //CHAT even not started 
      await ctx.reply(`Chat ended, nothing to save! 🙅‍♂️💾`);
    //Provide start buttons
      await startKeyboard(ctx);
  }
  //Leave the scene
  await ctx.scene.leave();
  }catch(err){
    sendError(ctx,'ASK-SAVING-CHAT',err)
  }
});
                                                        //NO SAVE CHAT
stage.action('no-save-chat',async ctx=>{
  try{
    //DELETE THE KEYBOARD
    await ctx.deleteMessage()
    //Clearing the chat
    const userId = ctx.from.id.toString();
    delete ctx.session[userId]

    // Notice user that chat ended
    await ctx.reply(`Chat ended without saving 💤`);
    //Provide start buttons
    await  startKeyboard(ctx);
  }catch(err){
   await  sendError(ctx,'NOT_SAVING-CHAT',err)
  }
});
                                                        //YES SAVE CHAT

stage.action('yes-save-chat',async ctx=>{
  try{
       //DELETE THE KEYBOARD
  await ctx.deleteMessage()
  //Clearing the chat
  const userId = ctx.from.id.toString();
  //Update chat
  if(ctx.session[userId].chatId){
      const chat = await Chat.findById(ctx.session[userId].chatId);
      if(!chat) return;
      chat.messages =ctx.session[userId].messages;
      chat.save();
     await ctx.reply(`Chat updated`)
  }else{
    //Saving the chat to the DB
    const newChat = await Chat.create(ctx.session[userId])
    //Update user
    const user = await User.findOne({userId});
    user.chats.push(newChat._id)
    await user.save();
    // Notice user that chat ended
    await ctx.reply(`Chat ended and saved`);
  }
   
  //Clearing the session(chat)
  ctx.session[userId] = undefined;
  //Provide start buttons
  await startKeyboard(ctx);
  }catch(err){
    await sendError(ctx,'YES-SAVING-CHAT',err)
  }
})

export {stage};