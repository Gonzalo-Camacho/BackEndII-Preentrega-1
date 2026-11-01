const requiredEnvVars = ["MONGO_URL", "JWT_SECRET"];

for (const variable of requiredEnvVars) {
  if (!process.env[variable]) {
    throw new Error(
      `La variable de entorno ${variable} es obligatoria`
    );
  }
}

export const PORT = Number(process.env.PORT) || 8080;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const MONGO_URL = process.env.MONGO_URL;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

export const MAIL_HOST = process.env.MAIL_HOST;
export const MAIL_PORT = Number(process.env.MAIL_PORT) || 587;
export const MAIL_USER = process.env.MAIL_USER;
export const MAIL_PASS = process.env.MAIL_PASS;
export const MAIL_FROM = process.env.MAIL_FROM;
