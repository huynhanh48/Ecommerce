import type { NextFunction, Request, RequestHandler, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpException, HttpErrorCode } from "../exceptions/root.js";
import { CreateCommentSchema } from "../schema/post.js";

export const addComment: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { content, postId, parentId } = CreateCommentSchema.parse(req.body);

        // Check if post exists and is published
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post || !post.published) {
            return next(new HttpException("Post not found", HttpErrorCode.NotFound));
        }

        // Check if parent comment exists if provided
        if (parentId) {
            const parentComment = await prisma.comment.findUnique({ where: { id: parentId } });
            if (!parentComment || parentComment.postId !== postId) {
                return next(new HttpException("Parent comment not found", HttpErrorCode.NotFound));
            }
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                postId,
                userId,
                parentId: parentId ?? null
            },
            include: {
                user: {
                    select: { name: true }
                }
            }
        });

        res.status(201).json(comment);
    } catch (error) {
        next(error);
    }
}

export const listComments: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const postId = Number(req.params.postId);

        const comments = await prisma.comment.findMany({
            where: {
                postId,
                parentId: null
            },
            include: {
                user: {
                    select: { name: true }
                },
                replies: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    },
                    orderBy: {
                        createdAt: "asc"
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        res.json(comments);
    } catch (error) {
        next(error);
    }
}
