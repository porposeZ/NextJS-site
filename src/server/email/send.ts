import { Resend } from "resend";
import { env } from "../env";
import type * as React from "react";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendMail({
  to,
  subject,
  html,
  react,
}: {
  to: string | string[];
  subject: string;
  html?: string;
  react?: React.ReactElement;
}) {
  const result = await resend.emails.send({
    from: `Я есть <${env.EMAIL_FROM}>`,
    to,
    subject,
    ...(react ? { react } : { html: html ?? "" }),
  });

  if (result.error) {
    // Чтобы сразу видеть причину отказа (unverified recipient, invalid from и т.д.)
    console.error("[resend] send error:", result.error);
  }
  return result;
}
