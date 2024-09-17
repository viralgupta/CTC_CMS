import express from "express";
import { getAuthConfig } from "@auth/index";
import { authenticatedUser } from "./middlewear/authenticateUser";
import { allowedToken } from "./middlewear/allowedToken";
import inventoryRouter from "./routes/inventoryRoutes";
import architectRouter from "./routes/architectRoutes";
import carpanterRouter from "./routes/carpanterRoutes";
import customerRouter from "./routes/customerRoutes";
import driverRouter from "./routes/driverRoutes";
import estimateRouter from "./routes/estimateRoutes";
import orderRouter from "./routes/orderRoutes";
import miscellaneousRouter from "./routes/miscellaneousRouter";
import cors from "cors"

const app = express();

app.set("trust proxy", true);
app.use(express.json());
app.use(cors());

app.use("/auth/*", getAuthConfig());

app.get("/authcallbackoverride", (req, res) => {
  res.status(200).json({ url: req.query.callback ? req.query.callback : "/" })
});

app.use("/api/*", authenticatedUser);

app.use("/api/*", allowedToken);

app.use("/api/architect", architectRouter);
app.use("/api/carpanter", carpanterRouter);
app.use("/api/customer", customerRouter);
app.use("/api/driver", driverRouter);
app.use("/api/estimate", estimateRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/miscellaneous", miscellaneousRouter);
app.use("/api/order", orderRouter);

export { app };