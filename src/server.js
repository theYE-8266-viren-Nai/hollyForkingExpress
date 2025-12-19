import { log } from 'console'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
const app = express()
const PORT = process.env.PORT || 5002

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log(__dirname);
console.log(__filename);

app.get('/' , async(req,res)=>{
    try {
        return res.send("Hello world")
    } catch (error) {
        console.error(err);
        return res.status(500).send("Server Error")
    }
} )


app.listen(PORT , ()=> {
    console.log(`Server has started on port : ${PORT}`);
})