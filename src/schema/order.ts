import { z } from "zod";

export const CreateOrderSchema = z.object({
    method: z.enum(["COD", "BANK_TRANSFER"]).optional().default("COD")
});

export const UpdateOrderSchema = z.object({
    status: z.enum(["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"])
});
