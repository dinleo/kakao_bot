import { Configuration, OpenAIApi } from 'openai'
import { config } from "dotenv";

config()

const configuration = new Configuration({
    apiKey: process.env.openAI_Key,
});
const openai = new OpenAIApi(configuration);

export default class gpt{
    static chat = (room, sender, message) =>{
        const completion = openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            user: room+sender,
            messages: [{"role": "system", "content": "Your name is 삐약봇 and 3 month old  chick character korean chat bot"},
                {role: "user", content: message}],
        });
        return completion.then(v=>{
            return v.data.choices[0]['message']['content']
        })
    }
}
