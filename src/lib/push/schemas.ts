import { z } from "zod";

export const pushSubscriptionSchema = z.object({
  endpoint: z.url({ protocol: /^https$/ }).max(1000),
  p256dh: z.string().min(1).max(200),
  auth: z.string().min(1).max(100),
  userAgent: z.string().max(300).optional(),
});

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;
