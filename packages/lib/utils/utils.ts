import * as readline from "readline";
import fs from "fs";

export const askMove = (query: string) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

export const loadJSON = (path: string) => {
    const json = JSON.parse(fs.readFileSync(path).toString());
    return json;
}
