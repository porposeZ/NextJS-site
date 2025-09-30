"use server";

import { revalidatePath } from "next/cache";
import { db } from "~/server/db";
import { requireAdmin } from "~/server/auth/roles";

const STATUSES = ["REVIEW","AWAITING_PAYMENT","IN_PROGRESS","DONE","CANCELED"] as const;
type OrderStatus = typeof STATUSES[number];

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as OrderStatus;

  if (!id || !STATUSES.includes(status)) {
    throw new Error("Invalid input");
  }

  await db.order.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/admin/orders");
}
