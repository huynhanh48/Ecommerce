import type { NextFunction, Request, RequestHandler, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpException, HttpErrorCode } from "../exceptions/root.js";
import { CreateOrderSchema, UpdateOrderSchema } from "../schema/order.js";

export const createOrder: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
    const { method } = CreateOrderSchema.parse(req.body);

    try {
        const order = await prisma.$transaction(async (tx) => {
            const cart = await tx.cart.findFirst({
                where: { userId },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            });

            if (!cart || cart.items.length === 0) {
                throw new HttpException("Cart is empty", HttpErrorCode.BadRequest);
            }

            const totalAmount = cart.items.reduce((acc, item) => {
                return acc + (item.quantity * item.product.price);
            }, 0);

            // Create order
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    totalAmount,
                    status: "PENDING",
                    orderItems: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.product.price
                        }))
                    },
                    paymentMethod: {
                        create: {
                            method,
                            payment: method === "BANK_TRANSFER"
                        }
                    }
                },
                include: {
                    orderItems: true,
                    paymentMethod: true
                }
            });

            // Clear cart
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id }
            });

            return newOrder;
        });

        res.json(order);
    } catch (error) {
        next(error);
    }
}

export const listOrders: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
    try {
        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        res.json(orders);
    } catch (error) {
        next(error);
    }
}

export const getOrderById: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
    const id = Number(req.params.id);

    try {
        const order = await prisma.order.findFirst({
            where: { id, userId },
            include: {
                orderItems: {
                    include: {
                        product: {
                            include: {
                                thumbnails: true
                            }
                        }
                    }
                },
                paymentMethod: true
            }
        });

        if (!order) {
            return next(new HttpException("Order not found", HttpErrorCode.NotFound));
        }

        res.json(order);
    } catch (error) {
        next(error);
    }
}

export const updateOrder: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const { status } = UpdateOrderSchema.parse(req.body);
    const id = Number(req.params.id);
    const userId = (req as any).user.id;

    try {
        const order = await prisma.order.findFirst({ where: { id, userId } });
        if (!order) {
            return next(new HttpException("Order not found", HttpErrorCode.NotFound));
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status }
        });

        res.json(updatedOrder);
    } catch (error) {
        next(error);
    }
}

export const deleteOrder: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    const userId = (req as any).user.id;

    try {
        const order = await prisma.order.findFirst({ where: { id, userId } });
        if (!order) {
            return next(new HttpException("Order not found", HttpErrorCode.NotFound));
        }

        // Instead of deleting, we change status to CANCELLED
        const cancelledOrder = await prisma.order.update({
            where: { id },
            data: { status: "CANCELLED" }
        });

        res.json({ message: "Order cancelled successfully", order: cancelledOrder });
    } catch (error) {
        next(error);
    }
}