import { Router } from "express";
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../lib/cloudinary.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getProducts,
  searchProducts,
  createCategory,
  getCategories
} from "../controllers/product.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authorization.js";

const productRouter = Router();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  } as any,
});

const parser = multer({ storage: storage });

// Public routes
productRouter.get("/", getProducts);
productRouter.get("/search", searchProducts);
productRouter.get("/:id", getProductById);
productRouter.get("/categories/all", getCategories);

// Admin only routes
productRouter.post("/categories", [authMiddleware, adminMiddleware], createCategory);
productRouter.post("/", [authMiddleware, adminMiddleware, parser.array('images', 10)], createProduct);
productRouter.put("/:id", [authMiddleware, adminMiddleware, parser.array('images', 10)], updateProduct);
productRouter.delete("/:id", [authMiddleware, adminMiddleware], deleteProduct);

export default productRouter;