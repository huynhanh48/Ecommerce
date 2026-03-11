import express from 'express'
import { PORT } from '~/secrets.js'
import rootRouter from './routes'
const app = express()

app.use(express.json())
app.get("/", (req, res) => {
    res.send("Hello World!")
})
app.use("/api", rootRouter)
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})