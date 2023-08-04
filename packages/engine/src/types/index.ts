import type { z } from 'zod'

/**
 * @description Schema transformer
 */
export type SchemaTransformer<Schema extends z.ZodSchema> = (beforeTransformation: z.infer<Schema>) => z.infer<Schema>
