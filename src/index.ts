import express from 'express'
import { PORT } from '~/secrets.js'
import rootRouter from './routes'
import { endpointMiddleware } from './endpointMiddleware'
const app = express()

app.use(express.json())
app.use("/api", rootRouter)
app.use(endpointMiddleware)
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})  