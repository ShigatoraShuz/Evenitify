const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['organizer', 'vendor']).optional(),
    displayName: z.string().max(100).optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required')
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const syncProfileSchema = z.object({
  body: z.object({
    role: z.enum(['organizer', 'vendor', 'admin']).optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

module.exports = { registerSchema, loginSchema, syncProfileSchema, refreshSchema };
