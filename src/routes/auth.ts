import { Router } from 'express'
import { login, me, register, addMetaData, updateMetaData, addAddress, updateAddress, deleteAddress, getMetaData, getAddress, changePassword, forgotPassword, resetPasswordWithToken, getUserWithMeta } from '~/controllers/auth'
import { authMiddleware } from '~/middlewares/authorization'
import { errorHandle } from '~/middlewares/errorhandler'
const authRouter = Router()
authRouter.get("/me", authMiddleware, errorHandle(me))
authRouter.get("/me-with-meta", authMiddleware, errorHandle(getUserWithMeta))
authRouter.get("/metadata", authMiddleware, errorHandle(getMetaData))
authRouter.get("/address", authMiddleware, errorHandle(getAddress))
authRouter.post("/login", errorHandle(login))
authRouter.post("/register", errorHandle(register))
authRouter.post("/metadata", authMiddleware, errorHandle(addMetaData))
authRouter.put("/metadata", authMiddleware, errorHandle(updateMetaData))
authRouter.post("/address", authMiddleware, errorHandle(addAddress))
authRouter.put("/address/:id", authMiddleware, errorHandle(updateAddress))
authRouter.delete("/address/:id", authMiddleware, errorHandle(deleteAddress))
authRouter.put("/change-password", authMiddleware, errorHandle(changePassword))
authRouter.post("/forgot-password", errorHandle(forgotPassword))
authRouter.post("/reset-password-token", errorHandle(resetPasswordWithToken))
export default authRouter