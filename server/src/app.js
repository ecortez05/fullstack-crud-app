const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const openapi = require("./docs/openapi");

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));

// slow down password guessing
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }));

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapi));
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use((req, res) => res.status(404).json({ message: "Not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // bad ObjectId in the URL
  if (err.name === "CastError") return res.status(400).json({ message: "Invalid id" });
  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
});

module.exports = app;
