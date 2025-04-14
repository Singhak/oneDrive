import express from "express";
import fileRouter from "./routers/file.router.js"
import dirRouter from "./routers/dir.router.js"

const app = express();

//parse json
app.use(express.json())

app.use("/file", fileRouter);
app.use("/folder", dirRouter);

app.listen(8081, (error) => {
    console.log('app.js', error)
})