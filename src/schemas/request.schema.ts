import { MoveType } from "@prisma/client";
import z from "zod";

export const CreateRequestSchema = z.object({
  moveType: z.nativeEnum(MoveType, {
    errorMap: () => ({ message: "올바른 이사 종류를 선택해주세요." }),
  }),
  moveDate: z.coerce.date({
    errorMap: () => ({ message: "올바른 날짜 형식이 아닙니다." }),
  }),
  fromAddress: z.string().min(1, "출발지 주소를 입력해주세요."),
  toAddress: z.string().min(1, "도착지 주소를 입력해주세요."),
});
