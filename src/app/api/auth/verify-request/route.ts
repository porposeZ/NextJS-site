// Редиректим с /api/auth/verify-request на пользовательскую страницу /auth/verify-request
export const runtime = "nodejs";

export function GET(req: Request) {
  const url = new URL(req.url);
  url.pathname = "/auth/verify-request"; // твоя страница подтверждения
  // сохраняем query (?provider=email&type=email) на всякий
  return Response.redirect(url, 302);
}
