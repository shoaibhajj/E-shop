//1) Core Module
const path = require("path");

// 2) third party modules

const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");

dotenv.config({ path: "config.env" });

// 3) Module that inside project
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");
const dbConnection = require("./config/database");
const { webhookCheckout } = require("./services/orderService");
// Routes
const mountRoutes = require("./routes");
// Connect with db
dbConnection();

// express app
const app = express();
// Enable othe domains to access your application
app.use(cors());
app.options("*", cors());
// compress all responses
app.use(compression());

// Checkout webhook
app.post(
  ("/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout)
);

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// Mount Routes
mountRoutes(app);
app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// Global error handling middleware for express
app.use(globalError);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App running running on port ${PORT}`);
});

// Handle rejection outside express
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
