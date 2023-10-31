import { User } from "../models/chat.model.js";
import { sendError } from "../sendError.js";

export async function startKeyboard(ctx) {
   await ctx.reply('Please select:', {
      reply_markup: {
        keyboard: [
          ['Chatgpt 💬 🗣️','My Chats/Мои чаты 📨'],
          ['Audio to text/Аудио в текст 🎵➡️📃'],
          ['Generate Image/Создать изображение 🌠']
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
}


export async function startLogic(ctx){
  try{
    const userId = ctx.from.id.toString();
    const oldUser = await User.find({userId});
    if(oldUser.length ===0){
      //new User
      await User.create({userId});
    }
    await ctx.replyWithHTML(`<b>Assalamu Alaykum  <i>${ctx.from.first_name}</i></b> 😁`);
    await startKeyboard(ctx);
  }catch(err){
   await sendError(ctx,'Starting',err);
   console.log(err);
  }
}

