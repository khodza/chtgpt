import { mychats } from "../keyboards/allchats.js";

export function globalKeyboardHandler(ctx) {
    const command = ctx.message.text;
    if (command === 'Chatgpt 💬 🗣️') {
        ctx.scene.enter('chatgpt-chat')
    }
    else if (command === 'My Chats/Мои чаты 📨') {
      mychats(ctx.from.id,ctx)
    }
     else if (command === 'Audio to text/Аудио в текст 🎵➡️📃') {
      ctx.reply('NOT FINISHED');
    } else if (command === 'Generate Image 🌠') {
      ctx.reply('NOT FINISHED')
    }
    else if(command === 'Generate Image/Создать изображение 🌠'){
      ctx.reply('NOT FINISHED')
    }
  }