import { z } from "zod";

export const ProductMetaDataSchema = z.object({
  author: z.string().nullish().transform(val => val ?? null),
  active_ingredient: z.string().nullish().transform(val => val ?? null),
  expire_date: z.string().nullish().transform((val) => val ? new Date(val) : null),
  area: z.string().nullish().transform(val => val ?? null),
  legal_status: z.boolean().nullish().transform(val => val ?? null),
  location: z.string().nullish().transform(val => val ?? null),
  latitude: z.string().nullish().transform(val => val ?? null),
  longitude: z.string().nullish().transform(val => val ?? null),
});

export const ThumbnailSchema = z.object({
  url: z.string().url(),
});

export const ProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  tags: z.string().nullish().transform(val => val ?? null),
  description: z.string().nullish().transform(val => val ?? null),
  categoryId: z.number().nullish().transform(val => val ?? null),
  metadata: ProductMetaDataSchema.optional(),
  thumbnails: z.array(ThumbnailSchema).optional(),
});

export const UpdateProductSchema = ProductSchema.partial();

export const CategorySchema = z.object({
  name: z.string().min(1).max(255),
});
