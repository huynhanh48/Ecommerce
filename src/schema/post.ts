import { z } from "zod";

export const CreatePostSchema = z.object({
    title: z.string().min(5).max(255),
    content: z.string().min(10),
    summary: z.string().max(500).optional(),
    thumbnail: z.string().url().optional(),
    categoryId: z.number(),
    published: z.boolean().optional().default(false),
});

export const UpdatePostSchema = CreatePostSchema.partial();

export const CreateCommentSchema = z.object({
    content: z.string().min(1).max(1000),
    postId: z.number(),
    parentId: z.number().optional(),
});
