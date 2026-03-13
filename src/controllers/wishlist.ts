import type { NextFunction, Request, RequestHandler, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpException, HttpErrorCode } from "../exceptions/root.js";
import { z } from "zod";

const WishlistItemSchema = z.object({
    productId: z.number().int().positive().optional(),
    postId: z.number().int().positive().optional(),
});

export const listWishlist: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = Number((req as any).user?.id);
        if (!userId) {
            return next(new HttpException("Unauthorized", HttpErrorCode.Unauthorized));
        }

        const items = await prisma.wishlist.findMany({
            where: { userId },
            include: {
                product: {
                    include: {
                        thumbnails: true
                    }
                },
                post: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        res.status(200).json({ message: "Wishlist fetched", data: items });
    } catch (error) {
        next(error);
    }
};

export const addToWishlist: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = Number((req as any).user?.id);
        if (!userId) {
            return next(new HttpException("Unauthorized", HttpErrorCode.Unauthorized));
        }

        const { productId, postId } = WishlistItemSchema.parse(req.body);

        if ((!productId && !postId) || (productId && postId)) {
            return next(new HttpException("Provide exactly one of productId or postId", HttpErrorCode.BadRequest));
        }

        if (productId) {
            const exists = await prisma.product.findUnique({ where: { id: productId } });
            if (!exists) {
                return next(new HttpException("Product not found", HttpErrorCode.NotFound));
            }

            const existing = await prisma.wishlist.findFirst({ where: { userId, productId } });
            if (existing) {
                return next(new HttpException("Product already in wishlist", HttpErrorCode.BadRequest));
            }

            const item = await prisma.wishlist.create({ data: { userId, productId } });
            return res.status(201).json({ message: "Product added to wishlist", data: item });
        }

        if (postId) {
            const exists = await prisma.post.findUnique({ where: { id: postId } });
            if (!exists) {
                return next(new HttpException("Post not found", HttpErrorCode.NotFound));
            }

            const existing = await prisma.wishlist.findFirst({ where: { userId, postId } });
            if (existing) {
                return next(new HttpException("Post already in wishlist", HttpErrorCode.BadRequest));
            }

            const item = await prisma.wishlist.create({ data: { userId, postId } });
            return res.status(201).json({ message: "Post added to wishlist", data: item });
        }

        next(new HttpException("Invalid wishlist payload", HttpErrorCode.BadRequest));
    } catch (error) {
        next(error);
    }
};

export const removeFromWishlist: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = Number((req as any).user?.id);
        if (!userId) {
            return next(new HttpException("Unauthorized", HttpErrorCode.Unauthorized));
        }

        const id = Number(req.params.id);
        if (!id) {
            return next(new HttpException("Invalid ID", HttpErrorCode.BadRequest));
        }

        const item = await prisma.wishlist.findUnique({ where: { id } });
        if (!item || item.userId !== userId) {
            return next(new HttpException("Wishlist item not found", HttpErrorCode.NotFound));
        }

        await prisma.wishlist.delete({ where: { id } });
        res.status(200).json({ message: "Wishlist item removed" });
    } catch (error) {
        next(error);
    }
};

export const clearWishlist: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = Number((req as any).user?.id);
        if (!userId) {
            return next(new HttpException("Unauthorized", HttpErrorCode.Unauthorized));
        }

        await prisma.wishlist.deleteMany({ where: { userId } });
        res.status(200).json({ message: "Wishlist cleared" });
    } catch (error) {
        next(error);
    }
};
