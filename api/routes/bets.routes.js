import { Router } from "express";
import { validateBody } from "../../middleware/validator/validator.js";
import jwt from "jsonwebtoken";
import { db } from "../../index.js";
import { camelCaseIndexes } from "../../helpers/camelCaseIndexes.js";

const router = Router();

router.post("/", validateBody("bets"), (req, res) => {
  let userId;
  try {
    let token = req.headers["authorization"];
    if (!token) {
      return res.status(401).send({ error: "Not Authorized" });
    }
    token = token.replace("Bearer ", "");
    try {
      var tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
      userId = tokenPayload.id;
    } catch (err) {
      console.log(err);
      return res.status(401).send({ error: "Not Authorized" });
    }

    req.body.event_id = req.body.eventId;
    req.body.bet_amount = req.body.betAmount;
    delete req.body.eventId;
    delete req.body.betAmount;
    req.body.user_id = userId;
    db.select()
      .table("user")
      .then((users) => {
        var user = users.find((u) => u.id == userId);
        if (!user) {
          res.status(400).send({ error: "User does not exist" });
          return;
        }
        if (+user.balance < +req.body.bet_amount) {
          return res.status(400).send({ error: "Not enough balance" });
        }
        db("event")
          .where("id", req.body.event_id)
          .then(([event]) => {
            if (!event) {
              return res.status(404).send({ error: "Event not found" });
            }
            db("odds")
              .where("id", event.odds_id)
              .then(([odds]) => {
                if (!odds) {
                  return res.status(404).send({ error: "Odds not found" });
                }
                let multiplier = multiplierCount(req.body.prediction);
                db("bet")
                  .insert({
                    ...req.body,
                    multiplier,
                    event_id: event.id,
                  })
                  .returning("*")
                  .then(([bet]) => {
                    var currentBalance = user.balance - req.body.bet_amount;
                    db("user")
                      .where("id", userId)
                      .update({
                        balance: currentBalance,
                      })
                      .then(() => {
                        statEmitter.emit("newBet");
                        return res.send({
                          ...camelCaseIndexes(bet),
                          currentBalance: currentBalance,
                        });
                      });
                  });
              });
          });
      });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
    return;
  }
});

export default router;
