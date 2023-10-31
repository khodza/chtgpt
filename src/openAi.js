import { OpenAIApi,Configuration } from "openai"
import {createReadStream} from 'fs'
import  dotenv from 'dotenv';
dotenv.config();


class OpenAi {
    roles ={
        ASSISTANT:'assistant',
        USER:'user',
        SYSTEM:'system'
    }
    constructor(apiKey){
        const configuration = new Configuration({apiKey});
        this.openai =new OpenAIApi(configuration);
    }
   async chat(messages){
        try{
            const response =await this.openai.createChatCompletion({
                model:'gpt-3.5-turbo',
                messages,
            })
            return response.data.choices[0].message 
        }catch(e){console.error(e);}
    }
    async CreateImage(prompt){
        try{
            const response = await this.openai.createImage({
                prompt,
                n:2,
                size:"1024x1024"
            });
            
            const imageUrl = response.data.data[0].url;
            return imageUrl;
        }catch(e){
            // console.error(e);
            // return e;
        }
    }
    async transportation(filePath){
        try{
            const response =await this.openai.createTranscription(createReadStream(filePath),'whisper-1');
            return response.data.text;
        }catch(e){
            console.error(e);
        }
    }

}
const token = process.env.OPENAI_KEY
export const openai = new OpenAi(token)