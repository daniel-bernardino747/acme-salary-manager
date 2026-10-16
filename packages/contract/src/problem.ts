import { z } from 'zod';

/** RFC 9457 media type for every error response. */
export const PROBLEM_CONTENT_TYPE = 'application/problem+json';

/** RFC 9457 Problem Details. `errors[].path` is the Zod issue path, so the UI can map it to a field. */
export const problemSchema = z.strictObject({
  type: z.string(),
  title: z.string(),
  status: z.int(),
  detail: z.string().optional(),
  errors: z
    .array(z.object({ path: z.array(z.union([z.string(), z.int()])), message: z.string() }))
    .optional(),
});
export type Problem = z.infer<typeof problemSchema>;
