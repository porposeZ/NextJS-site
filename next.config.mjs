import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // Разрешаем оба дев-ориджина
  allowedDevOrigins: ["http://localhost:3000", "http://172.19.0.1:3000"],
  ignoreBuildErrors: true,
};

export default config;
