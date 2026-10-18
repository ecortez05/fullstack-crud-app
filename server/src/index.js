require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const port = process.env.PORT || 4000;

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set, check your .env file");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/crud_app")
  .then(() => {
    app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
  })
  .catch((err) => {
    console.error("Could not connect to MongoDB:", err.message);
    process.exit(1);
  });
