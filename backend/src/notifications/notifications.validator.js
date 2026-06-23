const { z } = require('zod');

const notificationIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    notificationId: z.string().uuid('Invalid notification ID')
  }),
  query: z.object({}).optional()
});

const paginationSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    unreadOnly: z.coerce.boolean().optional()
  }).optional()
});

module.exports = { notificationIdSchema, paginationSchema };
