import "dotenv/config";
import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { errorHandler } from "./middlewares/errorHandler.js";
import router from "./routes/routes.js";

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(morgan("dev"));

// serve public/ as static - need to go up one level since we're in src/
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/", router);

app.use((req, res) => res.status(404).json({ message: "Not Found" }));
app.use(errorHandler);

export default app;
