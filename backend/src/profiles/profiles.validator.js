const { z } = require('zod');

const organizerProfileSchema = z.object({
  body: z.object({
    organizationName: z.string().max(200).optional(),
    phone: z.string().max(50).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    organizationType: z.string().max(100).optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

const adminSettingsSchema = z.object({
  body: z.object({
    displayName: z.string().max(100).optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

module.exports = { organizerProfileSchema, adminSettingsSchema };
