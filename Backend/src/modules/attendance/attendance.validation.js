import { z } from 'zod';

export const punchSchema = z.object({
  body: z.object({}).optional(),
});

export const getTeamAttendanceSchema = z.object({
  query: z.object({
    date: z.string().optional(),
  }).optional(),
});
