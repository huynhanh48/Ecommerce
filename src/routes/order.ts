import { Router } from "express";

const orderRouter = Router();

import { createOrder, deleteOrder, getOrderById, listOrders, updateOrder } from "../controllers/order.js";
import { authMiddleware, optionalAuthMiddleware } from "~/middlewares/authorization.js";

orderRouter.post("/", optionalAuthMiddleware, createOrder);
orderRouter.get("/", authMiddleware, listOrders);
orderRouter.get("/:id", authMiddleware, getOrderById);
orderRouter.put("/:id", authMiddleware, updateOrder);
orderRouter.delete("/:id", authMiddleware, deleteOrder);

export default orderRouter;