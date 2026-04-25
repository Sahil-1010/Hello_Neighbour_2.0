const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/users", require("./src/routes/users"));
app.use("/api/posts", require("./src/routes/posts"));
app.use("/api/jobs", require("./src/routes/jobs"));
app.use("/api/businesses", require("./src/routes/businesses"));
app.use("/api/notifications", require("./src/routes/notifications"));
app.use("/api/neighborhoods", require("./src/routes/neighborhoods"));
app.use("/api/messages", require("./src/routes/messages"));
app.use("/api/reports", require("./src/routes/reports"));
app.use("/api/search", require("./src/routes/search"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
