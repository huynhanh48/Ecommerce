import { Router } from "express";
import { listUsers, getUserById, changeUserRole, listAllOrders, changeOrderStatus, getDashboardStats, listAllPosts, createPost, updatePost, deletePost } from "../controllers/management.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authorization.js";

const managementRouter = Router();

// Dashboard
managementRouter.get("/dashboard", [authMiddleware, adminMiddleware], getDashboardStats);

// User Management
managementRouter.get("/users", [authMiddleware, adminMiddleware], listUsers);
managementRouter.get("/users/:id", [authMiddleware, adminMiddleware], getUserById);
managementRouter.put("/users/:id/role", [authMiddleware, adminMiddleware], changeUserRole);

// Order Management
managementRouter.get("/orders", [authMiddleware, adminMiddleware], listAllOrders);
managementRouter.put("/orders/:id/status", [authMiddleware, adminMiddleware], changeOrderStatus);

// Post Management
managementRouter.get("/posts", [authMiddleware, adminMiddleware], listAllPosts);
managementRouter.post("/posts", [authMiddleware, adminMiddleware], createPost);
managementRouter.put("/posts/:id", [authMiddleware, adminMiddleware], updatePost);
managementRouter.delete("/posts/:id", [authMiddleware, adminMiddleware], deletePost);

export default managementRouter;
