import { Markup } from "telegraf";

export async function saveChat(ctx) {
  const inlineKeyboard = Markup.inlineKeyboard([
    Markup.button.callback('Yes', 'yes-save-chat'),
    Markup.button.callback('No', 'no-save-chat'),
  ]);
  await ctx.reply('Would you like to save this chat? 💬💾', inlineKeyboard);
}