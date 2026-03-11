import { Router } from 'express'
import { login, me, register } from '~/controllers/auth'
const authRouter = Router()
authRouter.get("/me", me)
authRouter.post("/login", login)
authRouter.post("/register", register)
export default authRouter