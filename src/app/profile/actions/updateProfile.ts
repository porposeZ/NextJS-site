"use server";

import { z } from "zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { revalidatePath } from "next/cache";

const Input = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .optional()
    .transform((v) => (v ?? "").trim()),
  defaultCity: z.string().trim().max(120).optional().or(z.literal("")),
  organization: z.string().trim().max(120).optional().or(z.literal("")),
});

export type UpdateProfileResult =
  | { ok: true }
  | {
      ok: false;
      error:
        | "NOT_AUTHENTICATED"
        | "VALIDATION_ERROR"
        | "PHONE_TAKEN"
        | "DB_ERROR";
    };

export async function updateProfile(
  raw: unknown,
): Promise<UpdateProfileResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "NOT_AUTHENTICATED" };

  const parsed = Input.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "VALIDATION_ERROR" };

  const { name, phone: rawPhone, defaultCity, organization } = parsed.data;

  const digits = (rawPhone ?? "").replace(/\D/g, "");
  const phone = digits.length ? `+${digits}` : null;

  try {
    await db.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        defaultCity: defaultCity ?? null,
        organization: organization ?? null,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/");
    return { ok: true };
  } catch (e: unknown) {
    const err = e as { code?: string; meta?: { target?: string[] } } | null;
    if (err?.code === "P2002") {
      const target = err.meta?.target ?? [];
      if (Array.isArray(target) && target.includes("phone")) {
        return { ok: false, error: "PHONE_TAKEN" };
      }
    }
    console.error("[profile] update failed:", e);
    return { ok: false, error: "DB_ERROR" };
  }
}
