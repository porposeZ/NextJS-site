import getServerSession from "next-auth";
import { authConfig } from "./config";

// Возвращаем объект с типом, удобным для нас.
// Это не меняет runtime — только упрощает типы.
export type SafeSession =
  | {
      user?: {
        id?: string | null;
        email?: string | null;
        name?: string | null;
        image?: string | null;
      };
      // можно добавить сюда любые поля, если появятся
    }
  | null;

export async function getSession(): Promise<SafeSession> {
  const s = await getServerSession(authConfig);
  return s as unknown as SafeSession;
}
