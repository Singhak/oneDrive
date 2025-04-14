import express from "express";
import fileRouter from "./routers/file.router.js"

const app = express();

//parse json
app.use(express.json())

app.use("/file", fileRouter);

app.listen(8081, (error) => {
    console.log('app.js', error)
})