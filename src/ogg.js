import axios from "axios";
import {createWriteStream} from 'fs'
import { dirname,resolve } from "path";
import { fileURLToPath } from "url";
import ffmpeg  from "fluent-ffmpeg"
import {removeFile} from "./utils.js"
import installer from "@ffmpeg-installer/ffmpeg"
const __dirname = dirname(fileURLToPath(import.meta.url))

class OggConverter {
    constructor(){
        ffmpeg.setFfmpegPath(installer.path)
    }

    toMp3(input,output){
        try{
            const outputpath =resolve(dirname(input),`${output}.mp3`);
            return new Promise((resolve,reject)=>{
                ffmpeg(input)
                .inputOption('-t 30')
                .output(outputpath)
                .on('end',()=>{
                    // removeFile(input);
                    resolve(outputpath)
                })
                .on('error',(err)=>reject(err.message))
                .run()
            })
        }catch(e){
            console.error(e);
        }
    }

    async create(url,filename){
        try{
            const oggPath =resolve(__dirname,'../voices',`${filename}.ogg`)
            const response =await axios({
                method:'get',
                url,
                responseType:'stream'
            });
            return new Promise(resolve=>{
                const stream =createWriteStream(oggPath);
                response.data.pipe(stream)
                stream.on('finish',()=>{resolve(oggPath)})
            })
     
        } catch(e){
            console.error(e)
        }
    }
}
export const ogg = new OggConverter();