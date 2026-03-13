import { Router } from 'express'
import authRouter from './auth.js'
import productRouter from './product.js'
import cartRouter from './cart.js'
import orderRouter from './order.js'
import managementRouter from './management.js'
import postRouter from './post.js'
import wishlistRouter from './whishlist.js'

const rootRouter = Router()

rootRouter.use("/auth", authRouter)
rootRouter.use("/product", productRouter)
rootRouter.use("/cart", cartRouter)
rootRouter.use("/orders", orderRouter)
rootRouter.use("/management", managementRouter)
rootRouter.use("/posts", postRouter)
rootRouter.use("/wishlist", wishlistRouter)

export default rootRouter