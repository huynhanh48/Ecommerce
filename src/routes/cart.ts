import { Router } from "express";
import { addItemToCart, removeItemFromCart, changeQuantity, getCart } from "../controllers/cart.js";
import { authMiddleware } from "../middlewares/authorization.js";
import { errorHandle } from "../middlewares/errorhandler.js";

const cartRouter = Router();

cartRouter.post("/", authMiddleware, errorHandle(addItemToCart));
cartRouter.delete("/:id", authMiddleware, errorHandle(removeItemFromCart));
cartRouter.put("/:id", authMiddleware, errorHandle(changeQuantity));
cartRouter.get("/", authMiddleware, errorHandle(getCart));
export default cartRouter;