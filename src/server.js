import "dotenv/config";
import { PORT } from "./config/env.config.js";
import app from "./app.js";

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});