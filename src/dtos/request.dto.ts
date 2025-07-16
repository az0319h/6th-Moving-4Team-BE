import z from "zod";
import { CreateRequestSchema } from "../schemas/request.schema";

export type CreateRequestDto = z.infer<typeof CreateRequestSchema>;
