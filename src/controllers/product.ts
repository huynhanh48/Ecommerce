import type { NextFunction, Request, RequestHandler, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpException, HttpErrorCode } from "../exceptions/root.js";
import { ProductSchema, UpdateProductSchema, CategorySchema } from "../schema/product.js";

// Helper to remove undefined values from an object
const cleanData = (obj: any) => {
  const newObj: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

export const createProduct: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Multer files are in req.files
    const files = req.files as Express.Multer.File[];
    const imageUrls = files?.map(file => ({ url: file.path })) || [];

    // Parse body - note: fields might be strings if coming from form-data
    // Handle potential string to number conversions for price, stock, categoryId
    const body = {
      ...req.body,
      price: req.body.price ? Number(req.body.price) : undefined,
      stock: req.body.stock ? Number(req.body.stock) : undefined,
      categoryId: req.body.categoryId ? Number(req.body.categoryId) : undefined,
    };

    const validatedData = ProductSchema.parse(body);
    const { metadata, ...productData } = validatedData;

    const createData: any = {
      ...productData,
      thumbnails: imageUrls.length > 0 ? { create: imageUrls } : undefined,
    };

    if (metadata) {
      createData.metadata = { create: metadata };
    }

    const product = await prisma.product.create({
      data: createData,
      include: {
        metadata: true,
        thumbnails: true,
      },
    });

    res.status(201).json({
      message: "Product created successful",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const files = req.files as Express.Multer.File[];
    const imageUrls = files?.map(file => ({ url: file.path })) || [];

    const body = {
      ...req.body,
      price: req.body.price ? Number(req.body.price) : undefined,
      stock: req.body.stock ? Number(req.body.stock) : undefined,
      categoryId: req.body.categoryId ? Number(req.body.categoryId) : undefined,
    };

    const validatedData = UpdateProductSchema.parse(body);
    const { metadata, ...productData } = validatedData;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return next(new HttpException("Product not found", HttpErrorCode.NotFound));
    }

    const updateData: any = cleanData(productData);

    if (metadata) {
      updateData.metadata = {
        upsert: {
          create: metadata,
          update: metadata,
        }
      };
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        metadata: true,
        thumbnails: true,
      },
    });

    // Handle thumbnails separately if new ones are uploaded
    if (imageUrls.length > 0) {
      await prisma.thumbnail.deleteMany({ where: { productId: id } });
      await prisma.thumbnail.createMany({
        data: imageUrls.map(t => ({ ...t, productId: id }))
      });
    }

    res.status(200).json({
      message: "Product updated successful",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return next(new HttpException("Product not found", HttpErrorCode.NotFound));
    }

    await prisma.product.delete({ where: { id } });

    res.status(200).json({
      message: "Product deleted successful",
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        metadata: true,
        thumbnails: true,
        category: true,
        reviews: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!product) {
      return next(new HttpException("Product not found", HttpErrorCode.NotFound));
    }

    const reviewCount = product.reviews?.length ?? 0;
    const averageRating = reviewCount > 0
      ? Number((product.reviews.reduce((sum, item) => sum + item.rating, 0) / reviewCount).toFixed(2))
      : null;

    res.status(200).json({
      message: "Get product successful",
      data: {
        ...product,
        rating: averageRating,
        reviewCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 10;
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;

    const products = await prisma.product.findMany({
      where: {
        ...(categoryId !== undefined ? { categoryId } : {}),
      },
      skip,
      take,
      include: {
        thumbnails: true,
        reviews: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const count = await prisma.product.count({
      where: {
        ...(categoryId !== undefined ? { categoryId } : {}),
      }
    });

    const enrichedProducts = products.map(product => {
      const reviewCount = product.reviews?.length ?? 0;
      const averageRating = reviewCount > 0
        ? Number((product.reviews.reduce((sum, item) => sum + item.rating, 0) / reviewCount).toFixed(2))
        : null;

      return {
        ...product,
        rating: averageRating,
        reviewCount,
      };
    });

    res.status(200).json({
      message: "Get products successful",
      data: enrichedProducts,
      meta: {
        total: count,
        skip,
        take,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const searchProducts: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = String(req.query.q || '');
    const skip = Number(req.query.skip) || 0;
    const take = Number(req.query.take) || 10;

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { tags: { contains: query } },
        ]
      },
      skip,
      take,
      include: {
        thumbnails: true,
      },
    });

    res.status(200).json({
      message: "Search products successful",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = CategorySchema.parse(req.body);

    const category = await prisma.category.create({
      data: validatedData,
    });

    res.status(201).json({
      message: "Category created successful",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany();

    res.status(200).json({
      message: "Get categories successful",
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};
