import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Link,
} from "@react-email/components";

export default function MagicLinkEmail({ url }: { url: string }) {
  return (
    <Html>
      <Head />
      <Preview>Вход на сайт — магическая ссылка</Preview>
      <Body
        style={{ backgroundColor: "#f7fbff", fontFamily: "Arial, sans-serif" }}
      >
        <Container
          style={{
            maxWidth: 520,
            margin: "32px auto",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 6px 30px rgba(0,0,0,.06)",
          }}
        >
          <Section style={{ padding: "24px 28px 12px" }}>
            <Text
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                color: "#0ea5e9",
              }}
            >
              Я есть
            </Text>
            <Text style={{ margin: "16px 0 0", fontSize: 18, fontWeight: 700 }}>
              Вход в аккаунт
            </Text>
            <Text
              style={{ margin: "8px 0 0", color: "#475569", lineHeight: 1.5 }}
            >
              Нажмите на кнопку ниже, чтобы войти. Ссылка одноразовая и
              действует ограниченное время.
            </Text>
            <Section style={{ marginTop: 20 }}>
              <a
                href={url}
                style={{
                  display: "inline-block",
                  background: "#f59e0b",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "12px 18px",
                  borderRadius: 8,
                  fontWeight: 700,
                }}
              >
                Войти
              </a>
            </Section>
            <Text style={{ marginTop: 24, fontSize: 12, color: "#64748b" }}>
              Если кнопка не работает — скопируйте и вставьте ссылку в адресную
              строку:
              <br />
              <Link
                href={url}
                style={{ color: "#0ea5e9", wordBreak: "break-all" }}
              >
                {url}
              </Link>
            </Text>
          </Section>
        </Container>
        <Text style={{ textAlign: "center", fontSize: 12, color: "#94a3b8" }}>
          Если вы не запрашивали вход, просто проигнорируйте это письмо.
        </Text>
      </Body>
    </Html>
  );
}
