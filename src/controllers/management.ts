import type { NextFunction, Request, RequestHandler, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpException, HttpErrorCode } from "../exceptions/root.js";
import { UpdateUserRoleSchema, UpdateOrderStatusSchema, OrderFilterSchema } from "../schema/management.js";
import { CreatePostSchema, UpdatePostSchema } from "../schema/post.js";

export const listUsers: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                metaData: true,
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        res.json(users);
    } catch (error) {
        next(error);
    }
}

export const getUserById: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    try {
        const user = await prisma.user.findFirst({
            where: { id },
            include: {
                metaData: {
                    include: {
                        address: true
                    }
                },
                orders: {
                    include: {
                        orderItems: true
                    }
                }
            }
        });
        if (!user) {
            return next(new HttpException("User not found", HttpErrorCode.NotFound));
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
}

export const changeUserRole: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    const { role } = UpdateUserRoleSchema.parse(req.body);

    try {
        const user = await prisma.user.update({
            where: { id },
            data: { role }
        });
        res.json(user);
    } catch (error) {
        next(error);
    }
}

export const listAllOrders: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const { status } = OrderFilterSchema.parse(req.query);
    try {
        const orders = await prisma.order.findMany({
            where: status ? { status } : {},
            include: {
                user: true,
                orderItems: {
                    include: {
                        product: true
                    }
                },
                paymentMethod: true
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

export const changeOrderStatus: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const id = Number(req.params.id);
    const { status } = UpdateOrderStatusSchema.parse(req.body);

    try {
        const order = await prisma.order.update({
            where: { id },
            data: { status }
        });
        res.json(order);
    } catch (error) {
        next(error);
    }
}

export const getDashboardStats: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalOrders = await prisma.order.count();
        const totalProducts = await prisma.product.count();
        const totalPosts = await prisma.post.count();
        
        const revenueResult = await prisma.order.aggregate({
            _sum: {
                totalAmount: true
            }
        });

        const recentOrders = await prisma.order.findMany({
            take: 5,
            orderBy: {
                createdAt: "desc"
            },
            include: {
                user: true
            }
        });

        res.json({
            stats: {
                totalUsers,
                totalOrders,
                totalProducts,
                totalPosts,
                totalRevenue: revenueResult._sum.totalAmount || 0
            },
            recentOrders
        });
    } catch (error) {
        next(error);
    }
}

// Post Management
export const createPost: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const validatedData = CreatePostSchema.parse(req.body);
        
        // Generate slug from title
        const slug = validatedData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const post = await prisma.post.create({
            data: {
                ...validatedData,
                summary: validatedData.summary ?? null,
                thumbnail: validatedData.thumbnail ?? null,
                slug,
                authorId: userId
            }
        });
        res.status(201).json(post);
    } catch (error) {
        next(error);
    }
}

export const updatePost: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const validatedData = UpdatePostSchema.parse(req.body);

        const post = await prisma.post.update({
            where: { id },
            data: {
                ...(validatedData.title !== undefined && { title: validatedData.title }),
                ...(validatedData.content !== undefined && { content: validatedData.content }),
                ...(validatedData.summary !== undefined && { summary: validatedData.summary ?? null }),
                ...(validatedData.thumbnail !== undefined && { thumbnail: validatedData.thumbnail ?? null }),
                ...(validatedData.categoryId !== undefined && { categoryId: validatedData.categoryId }),
                ...(validatedData.published !== undefined && { published: validatedData.published }),
            }
        });
        res.json(post);
    } catch (error) {
        next(error);
    }
}

export const deletePost: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        await prisma.post.delete({ where: { id } });
        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        next(error);
    }
}

export const listAllPosts: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const posts = await prisma.post.findMany({
            include: {
                author: { select: { name: true } },
                category: true,
                _count: { select: { comments: true } }
            },
            orderBy: { createdAt: "desc" }
        });
        res.json(posts);
    } catch (error) {
        next(error);
    }
}
