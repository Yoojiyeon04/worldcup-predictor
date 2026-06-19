import { z } from "zod";

export const qcIssueSeveritySchema = z.enum(["낮음", "중간", "높음"]);
export const qcIssueCategorySchema = z.enum(["장비", "시약", "공정", "환경", "문서"]);
export const qcIssueStatusSchema = z.enum(["접수", "검토중", "조치완료"], {
  message: "상태는 접수, 검토중, 조치완료 중 하나여야 합니다.",
});

export const createQcIssueInputSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해 주세요."),
  description: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => v || null),
  category: qcIssueCategorySchema.optional().nullable(),
  severity: qcIssueSeveritySchema.optional().nullable(),
  status: qcIssueStatusSchema.optional().nullable(),
  assignee: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => v || null),
  equipment_name: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => v || null),
  test_item: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((v) => v || null),
  occurred_at: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "발생일은 YYYY-MM-DD 형식이어야 합니다."), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v && v !== "" ? v : null)),
});

export const updateQcIssueStatusInputSchema = z.object({
  id: z.string().uuid("유효하지 않은 ID입니다."),
  status: qcIssueStatusSchema,
});
