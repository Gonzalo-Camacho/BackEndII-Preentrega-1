import "dotenv/config";
import { PORT } from "./config/env.config.js";
import { connectDatabase } from "./config/database.config.js";
import app from "./app.js";

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error.message);
    process.exit(1);
  }
};

startServer();
