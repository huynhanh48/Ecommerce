import { z } from "zod";

export const AddToCartSchema = z.object({
  productId: z.number(),
  quantity: z.number().int().positive(),
});

export const ChangeQuantitySchema = z.object({
  quantity: z.number().int().positive(),
});
