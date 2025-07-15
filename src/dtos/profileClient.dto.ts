import { z } from "zod";
import { ErrorMessage } from "../constants/ErrorMessage";

// 프로필 생성
export const clientProfileSchema = z
  .object({
    profileImage: z.string().url().optional(),

    serviceType: z.array(z.enum(["SMALL", "HOME", "OFFICE"])).optional(),

    livingArea: z.array(z.object({ id: z.string().uuid(), regionName: z.string() })).optional(),
  })
  .refine(
    (data) =>
      data.profileImage ||
      (data.serviceType && data.serviceType.length > 0) ||
      (data.livingArea && data.livingArea.length > 0),
    {
      message: ErrorMessage.NO_CLIENT_PROFILE,
      path: ["profileImage", "serviceType", "livingArea"],
    },
  );

export type ProfilePostRequest = z.infer<typeof clientProfileSchema>;
