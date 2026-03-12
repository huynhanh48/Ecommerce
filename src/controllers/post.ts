import type { NextFunction, Request, RequestHandler, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpException, HttpErrorCode } from "../exceptions/root.js";

export const listPosts: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const skip = Number(req.query.skip) || 0;
        const take = Number(req.query.take) || 10;
        const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;

        const posts = await prisma.post.findMany({
            where: {
                published: true,
                ...(categoryId ? { categoryId } : {})
            },
            skip,
            take,
            include: {
                author: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                category: true,
                _count: {
                    select: { comments: true }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        const total = await prisma.post.count({
            where: {
                published: true,
                ...(categoryId ? { categoryId } : {})
            }
        });

        res.json({
            data: posts,
            meta: {
                total,
                skip,
                take
            }
        });
    } catch (error) {
        next(error);
    }
}

export const getPostBySlug: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const slug = req.params.slug as string;
        const post = await prisma.post.update({
            where: { slug },
            data: {
                viewCount: {
                    increment: 1
                }
            },
            include: {
                author: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                category: true,
                comments: {
                    where: { parentId: null },
                    include: {
                        user: {
                            select: { name: true }
                        },
                        replies: {
                            include: {
                                user: {
                                    select: { name: true }
                                }
                            }
                        }
                    },
                    orderBy: {
                        createdAt: "desc"
                    }
                }
            }
        });

        if (!post || !post.published) {
            return next(new HttpException("Post not found", HttpErrorCode.NotFound));
        }

        res.json(post);
    } catch (error) {
        next(error);
    }
}
