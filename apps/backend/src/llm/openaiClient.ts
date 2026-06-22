import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if(!apiKey) {
    throw new Error("OPENAT_API_KEY is not set");
}

export const openai = new OpenAI({apiKey });

export async function  callCodeGenModel(messages : {role : "system" | "user" | "assistant" ; content : string}[]) {
    const completion = await openai.chat.completions.create({
        model :  "gpt-4.1",
        messages,
        temperature : 0.2,
        response_format : {type : "json_object"}
    });

    const content = completion.choices[0]?.message?.content;
    if(!content) {
        throw new Error("OPENAI returned an empty response")
    }
    return content;
}