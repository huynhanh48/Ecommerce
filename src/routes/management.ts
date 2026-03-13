import { Router } from "express";
import { listUsers, getUserById, changeUserRole, listAllOrders, changeOrderStatus, getDashboardStats, listAllPosts, createPost, updatePost, deletePost, searchProductsAndPosts } from "../controllers/management.js";
import { listWishlist, addToWishlist, removeFromWishlist, clearWishlist } from "../controllers/wishlist.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authorization.js";
import { errorHandle } from "~/middlewares/errorhandler.js";

const managementRouter = Router();

// Dashboard
managementRouter.get("/dashboard", [authMiddleware, adminMiddleware], getDashboardStats);
managementRouter.get("/", errorHandle(searchProductsAndPosts));

// User Management
managementRouter.get("/users", [authMiddleware, adminMiddleware], listUsers);
managementRouter.get("/users/:id", [authMiddleware, adminMiddleware], getUserById);
managementRouter.put("/users/:id/role", [authMiddleware, adminMiddleware], changeUserRole);

// Order Management
managementRouter.get("/orders", [authMiddleware, adminMiddleware], listAllOrders);
managementRouter.put("/orders/:id/status", [authMiddleware, adminMiddleware], changeOrderStatus);

// Post Management
managementRouter.get("/posts", [authMiddleware, adminMiddleware], listAllPosts);
managementRouter.get("/search", [authMiddleware, adminMiddleware], errorHandle(searchProductsAndPosts));
managementRouter.post("/posts", [authMiddleware, adminMiddleware], createPost);
managementRouter.put("/posts/:id", [authMiddleware, adminMiddleware], updatePost);
managementRouter.delete("/posts/:id", [authMiddleware, adminMiddleware], deletePost);

// Wishlist Management (user-level)
managementRouter.get("/wishlist", authMiddleware, errorHandle(listWishlist));
managementRouter.post("/wishlist", authMiddleware, errorHandle(addToWishlist));
managementRouter.delete("/wishlist/:id", authMiddleware, errorHandle(removeFromWishlist));
managementRouter.delete("/wishlist", authMiddleware, errorHandle(clearWishlist));

export default managementRouter;
