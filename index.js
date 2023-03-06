import express, { Router } from "express";
import knex from "knex";
import dbConfig from "./knexfile.js";
import jwt from "jsonwebtoken";
import joi from "joi";
import ee from "events";
import routes from "./api/routes/index.js";

const app = express();

const port = 3000;

export const statEmitter = new ee();
const stats = {
  totalUsers: 3,
  totalBets: 1,
  totalEvents: 1,
};
routes(app);

export let db;
app.use(express.json());
app.use((uselessRequest, uselessResponse, neededNext) => {
  db = knex(dbConfig.development);
  db.raw("select 1+1 as result")
    .then(function () {
      neededNext();
    })
    .catch(() => {
      throw new Error("No db connection");
    });
});

app.listen(port, () => {
  statEmitter.on("newUser", () => {
    stats.totalUsers++;
  });
  statEmitter.on("newBet", () => {
    stats.totalBets++;
  });
  statEmitter.on("newEvent", () => {
    stats.totalEvents++;
  });

  console.log(`App listening at http://localhost:${port}`);
});

// Do not change this line

export default app;
