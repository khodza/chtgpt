import { Telegraf,session } from "telegraf";
import  dotenv from 'dotenv';
dotenv.config();
import{startLogic} from "./keyboards/start-keyboard.js"
import { globalKeyboardHandler } from "./keyboard-handlers/keyboard-handler.js"
import { globalCallbackQueryHandler } from "./keyboard-handlers/globalInlineHandler.js";
import { stage } from "./scenes/chatgp-scene.js";
import mongoose from "mongoose";

                                                          //DATABASE
const DB = process.env.DATABASE
mongoose.connect(DB).then(() => {
  console.log(`DATABASE CONNECTED SUCCESSFULLY`);
});
//////////////////////////////////////////////////////////////////

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
// Start the bot
bot.start(async (ctx) => {
  startLogic(ctx);
});

// Register the wizard scene with the bot
bot.use(session(),stage.middleware());
bot.on('text', globalKeyboardHandler);
bot.on('callback_query',globalCallbackQueryHandler);

//LAUNCHING THE BOT
const PORT = process.env.PORT || 3000;
bot.launch({
  webhook: {
    domain: 'https://chatgptbotteleg.herokuapp.com',
    PORT}
})
console.log(`Bot started`);

process.once('SIGINT',()=>bot.use('SIGINT'))
process.once('SIGTERM',()=> bot.stop('SIGTERM'))