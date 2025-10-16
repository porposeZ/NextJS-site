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
    from: `Я есть <${env.EMAIL_FROM}>`, // например: "noreply@yayest.site"
    to,
    subject,
    ...(react ? { react } : { html: html ?? "" }),
  });

  if (result.error) {
    console.error("[resend] send error:", result.error);
  }
  return result;
}
