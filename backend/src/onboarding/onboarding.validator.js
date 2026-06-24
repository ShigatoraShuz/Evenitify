const { z } = require('zod');

const onboardingCompleteSchema = z.object({
  body: z.object({
    role: z.enum(['organizer', 'vendor']),
    organizationName: z.string().trim().min(1).max(150).optional(),
    organizationType: z.string().trim().max(100).optional(),
    address: z.string().trim().max(250).optional(),
    businessName: z.string().trim().min(1).max(150).optional(),
    businessDescription: z.string().trim().max(1000).optional(),
    serviceArea: z.string().trim().max(150).optional(),
    phone: z.string().trim().max(50).optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

module.exports = { onboardingCompleteSchema };
