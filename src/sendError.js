
const ADMIN = 5086062238;
export async function sendError(ctx,errMessage,err){
    console.log(err);
    ctx.telegram.sendMessage(ADMIN,`🫠 There was 💥 ERROR 💥 in ${errMessage}\n\n👤 With user: @${ctx.from.username}\n\n${err}`);
    ctx.reply(`Unknown error please contact with admin`);
}