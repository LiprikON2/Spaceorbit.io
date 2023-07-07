import express from "express";

import userRoutes from "~/server/routes/users/User";

const routes = express.Router();

routes.use("/users", userRoutes);

export default routes;
