"use server";

import { revalidatePath } from "next/cache";
import {
  createQcIssueInputSchema,
  updateQcIssueStatusInputSchema,
} from "@/lib/qc-issues/schema";
import type { CreateQcIssueInput, QcIssueStatus } from "@/lib/qc-issues/types";
import { createClient } from "@/lib/supabase/server";

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string };

export async function createQcIssueAction(
  input: CreateQcIssueInput,
): Promise<ActionResult> {
  const parsed = createQcIssueInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다." };
  }

  const data = parsed.data;
  const supabase = await createClient();

  const row = {
    title: data.title,
    description: data.description,
    category: data.category ?? null,
    severity: data.severity ?? null,
    assignee: data.assignee,
    equipment_name: data.equipment_name,
    test_item: data.test_item,
    occurred_at: data.occurred_at,
  };

  const { data: inserted, error } = await supabase.from("qc_issues").insert(row).select("id").single();
  if (error) {
    return { ok: false, message: error.message };
  }

  if (!inserted) {
    return { ok: false, message: "저장에 실패했습니다. 다시 시도해 주세요." };
  }

  revalidatePath("/", "page");
  revalidatePath("/new", "page");
  return { ok: true };
}

export async function updateQcIssueStatusAction(
  id: string,
  status: QcIssueStatus,
): Promise<ActionResult> {
  const parsed = updateQcIssueStatusInputSchema.safeParse({ id, status });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다." };
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("qc_issues")
    .update({ status: parsed.data.status, updated_at: now })
    .eq("id", parsed.data.id)
    .select("id, status, updated_at")
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data) {
    return { ok: false, message: "이슈를 찾을 수 없습니다." };
  }

  revalidatePath("/", "page");
  return { ok: true };
}
