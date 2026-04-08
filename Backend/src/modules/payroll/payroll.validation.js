import { z } from 'zod';

export const processSalarySchema = z.object({
  body: z.object({
    userId: z.number().int(),
    month: z.union([z.string(), z.number()]),
    year: z.number().int(),
    basicSalary: z.number().min(0),
    allowances: z.number().default(0),
    deductions: z.number().default(0),
    status: z.enum(['pending', 'paid']).optional(),
  }),
});

export const payrollQuerySchema = z.object({
  query: z.object({
    month: z.string(),
    year: z.string(),
  }),
});
