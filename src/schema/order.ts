import { z } from "zod";

export const CreateOrderSchema = z.object({
    method: z.enum(["COD", "BANK_TRANSFER"]).optional().default("COD"),
    guestName: z.string().optional(),
    guestPhone: z.string().optional(),
    shippingAmount: z.number().min(0).optional().default(0),
    address: z.object({
        lineone: z.string(),
        linetwo: z.string().optional(),
        province: z.string(),
        district: z.string()
    }).optional(),
    items: z.array(z.object({
        productId: z.number(),
        quantity: z.number().min(1)
    })).optional()
});

export const UpdateOrderSchema = z.object({
    status: z.enum(["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
    shippingAmount: z.number().min(0).optional(),
    address: z.object({
        lineone: z.string().optional(),
        linetwo: z.string().optional(),
        province: z.string().optional(),
        district: z.string().optional()
    }).optional()
});
