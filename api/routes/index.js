import healthRoute from "./health.routes.js";
import usersRoute from "./users.routes.js";
import statsRoute from "./stats.routes.js";
import transactionRoute from "./transaction.routes.js";
import eventsRoute from "./events.routes.js";
import betsRoute from "./bets.routes.js";
export default (app) => {
  app.use("/health", healthRoute);
  app.use("/users", usersRoute);
  app.use("/transaction", transactionRoute);
  app.use("/stats", statsRoute);
  app.use("/events", eventsRoute);
  app.use("/bets", betsRoute);
};
