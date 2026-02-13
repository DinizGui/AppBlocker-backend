import { createApp } from "./app.js";
import { config } from "./lib/config.js";

const app = createApp();

// 0.0.0.0 = aceita conexões do celular/emulador na rede (não só localhost)
const host = process.env.HOST || "0.0.0.0";
app.listen(config.port, host, () => {
  console.log(`API listening on http://localhost:${config.port}`);
  console.log(`Rede: use o IP do seu PC (ipconfig) + :${config.port} no app`);
});
