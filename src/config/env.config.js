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