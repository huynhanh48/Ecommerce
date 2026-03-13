import { Router } from "express";
import { authMiddleware } from "../middlewares/authorization.js";
import { errorHandle } from "~/middlewares/errorhandler.js";
import { listWishlist, addToWishlist, removeFromWishlist, clearWishlist } from "../controllers/wishlist.js";

const wishlistRouter = Router();

wishlistRouter.get("/", authMiddleware, errorHandle(listWishlist));
wishlistRouter.post("/", authMiddleware, errorHandle(addToWishlist));
wishlistRouter.delete("/:id", authMiddleware, errorHandle(removeFromWishlist));
wishlistRouter.delete("/", authMiddleware, errorHandle(clearWishlist));

export default wishlistRouter;
