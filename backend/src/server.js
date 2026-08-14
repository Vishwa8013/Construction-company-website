import { app } from "./app.js";
import { config } from "./config.js";

app.listen(config.port, () => {
  console.log(`BL Construction backend running on http://localhost:${config.port}`);
});
