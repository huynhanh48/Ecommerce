import type { NextFunction, Request, RequestHandler, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpException, HttpErrorCode } from "../exceptions/root.js";
import { AddToCartSchema, ChangeQuantitySchema } from "../schema/cart.js";

export const addItemToCart: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const { productId, quantity } = AddToCartSchema.parse(req.body);
    const userId = (req as any).user.id;

    const product = await prisma.product.findFirst({ where: { id: productId } });
    if (!product) {
        return next(new HttpException("Product not found", HttpErrorCode.NotFound));
    }

    let cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) {
        cart = await prisma.cart.create({ data: { userId } });
    }

    const cartItem = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId }
    });

    if (cartItem) {
        const updatedItem = await prisma.cartItem.update({
            where: { id: cartItem.id },
            data: { quantity: cartItem.quantity + quantity }
        });
        res.json(updatedItem);
    } else {
        const newItem = await prisma.cartItem.create({
            data: { cartId: cart.id, productId, quantity }
        });
        res.json(newItem);
    }
}

export const removeItemFromCart: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    const userId = (req as any).user.id;

    const cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) {
        return next(new HttpException("Cart not found", HttpErrorCode.NotFound));
    }

    const cartItem = await prisma.cartItem.findFirst({
        where: { id, cartId: cart.id }
    });

    if (!cartItem) {
        return next(new HttpException("Cart item not found", HttpErrorCode.NotFound));
    }

    await prisma.cartItem.delete({ where: { id } });
    res.json({ message: "Item removed from cart" });
}

export const changeQuantity: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    const { quantity } = ChangeQuantitySchema.parse(req.body);
    const userId = (req as any).user.id;

    const cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) {
        return next(new HttpException("Cart not found", HttpErrorCode.NotFound));
    }

    const cartItem = await prisma.cartItem.findFirst({
        where: { id, cartId: cart.id }
    });

    if (!cartItem) {
        return next(new HttpException("Cart item not found", HttpErrorCode.NotFound));
    }

    const updatedItem = await prisma.cartItem.update({
        where: { id },
        data: { quantity }
    });
    res.json(updatedItem);
}

export const getCart: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;

    let cart = await prisma.cart.findFirst({
        where: { userId },
        include: {
            items: {
                include: {
                    product: {
                        include: {
                            thumbnails: true
                        }
                    }
                }
            }
        }
    });

    if (!cart) {
        cart = await prisma.cart.create({
            data: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                thumbnails: true
                            }
                        }
                    }
                }
            }
        });
    }

    res.json(cart);
}