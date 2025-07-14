import z from "zod";

export const createRequestSchema = z.object({
  moveType: z.enum(["SMALL", "HOME", "OFFICE"], {
    required_error: "이사 종류를 선택해주세요.",
  }),
  moveDate: z.coerce.date({
    required_error: "이사 날짜를 입력해주세요.",
    invalid_type_error: "올바른 날짜 형식이 아닙니다.",
  }),
  fromAddress: z.string().min(1, { message: "출발지 주소를 입력해주세요." }),
  toAddress: z.string().min(1, { message: "도착지 주소를 입력해주세요." }),
});

export type CreateRequestDto = z.infer<typeof createRequestSchema>;
