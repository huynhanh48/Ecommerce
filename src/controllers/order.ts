import type { NextFunction, Request, RequestHandler, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpException, HttpErrorCode } from "../exceptions/root.js";
import { CreateOrderSchema, UpdateOrderSchema } from "../schema/order.js";

export const createOrder: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id;
    const { method, guestName, guestPhone, shippingAmount, address, items } = CreateOrderSchema.parse(req.body);
    try {
        const order = await prisma.$transaction(async (tx) => {
            let orderItems = [];
            let productTotal = 0;

            if (userId) {
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
                orderItems = cart.items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: Number(item.product.price)
                }));
                productTotal = cart.items.reduce((acc, item) => acc + (item.quantity * Number(item.product.price)), 0);

                await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
            } else {
                if (!items || items.length === 0) {
                    throw new HttpException("Order items are required for guest checkout", HttpErrorCode.BadRequest);
                }

                orderItems = await Promise.all(items.map(async (item) => {
                    const product = await tx.product.findUnique({ where: { id: item.productId } });
                    if (!product) {
                        throw new HttpException(`Product ${item.productId} not found`, HttpErrorCode.NotFound);
                    }
                    return {
                        productId: item.productId,
                        quantity: item.quantity,
                        price: Number(product.price)
                    };
                }));

                productTotal = orderItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
            }

            const totalAmount = productTotal + (shippingAmount || 0);

            const orderData: any = {
                ...(userId ? { userId } : {}),
                totalAmount,
                shippingAmount,
                status: "PENDING",
                guestName,
                guestPhone,
                lineone: address?.lineone,
                linetwo: address?.linetwo,
                province: address?.province,
                district: address?.district,
                orderItems: {
                    create: orderItems
                },
                paymentMethod: {
                    create: {
                        method,
                        payment: method === "BANK_TRANSFER"
                    }
                }
            };
            console.log("Creating order with data:", orderData);

            const newOrder = await tx.order.create({
                data: orderData,
                include: {
                    orderItems: true,
                    paymentMethod: true
                }
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
    const { status, address } = UpdateOrderSchema.parse(req.body);
    const id = Number(req.params.id);
    const userId = (req as any).user?.id;

    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: { orderItems: true }
        });
        if (!order) {
            return next(new HttpException("Order not found", HttpErrorCode.NotFound));
        }

        if (order.userId && (!userId || order.userId !== userId)) {
            return next(new HttpException("Forbidden - cannot update other user order", HttpErrorCode.Forbidden));
        }

        const data: any = {};
        if (status !== undefined) data.status = status;

        if (address) {
            if (address.lineone !== undefined) data.lineone = address.lineone;
            if (address.linetwo !== undefined) data.linetwo = address.linetwo;
            if (address.province !== undefined) data.province = address.province;
            if (address.district !== undefined) data.district = address.district;
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data
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