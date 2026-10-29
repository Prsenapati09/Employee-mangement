import cors from "cors";
import express from "express";
import helmet from "helmet";
import { corsOptions } from "./config/cors";
import { errorHandler } from "./middleware/error-handler";
import { notFound } from "./middleware/not-found";
import { requestLogger } from "./middleware/request-logger";
import { apiRouter } from "./routes";

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(requestLogger);
app.use(express.json({ limit: "1mb" }));
app.use("/api/v1", apiRouter);
app.use(notFound);
app.use(errorHandler);

export { app };
