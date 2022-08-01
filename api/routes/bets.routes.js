import { Router } from "express";

const router = Router();

router.post("/", (req, res) => {
  var schema = joi
    .object({
      id: joi.string().uuid(),
      eventId: joi.string().uuid().required(),
      betAmount: joi.number().min(1).required(),
      prediction: joi.string().valid("w1", "w2", "x").required(),
    })
    .required();
  var isValidResult = schema.validate(req.body);
  if (isValidResult.error) {
    res.status(400).send({ error: isValidResult.error.details[0].message });
    return;
  }

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
                let multiplier;
                switch (req.body.prediction) {
                  case "w1":
                    multiplier = odds.home_win;
                    break;
                  case "w2":
                    multiplier = odds.away_win;
                    break;
                  case "x":
                    multiplier = odds.draw;
                    break;
                }
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
                        [
                          "bet_amount",
                          "event_id",
                          "away_team",
                          "home_team",
                          "odds_id",
                          "start_at",
                          "updated_at",
                          "created_at",
                          "user_id",
                        ].forEach((whatakey) => {
                          var index = whatakey.indexOf("_");
                          var newKey = whatakey.replace("_", "");
                          newKey = newKey.split("");
                          newKey[index] = newKey[index].toUpperCase();
                          newKey = newKey.join("");
                          bet[newKey] = bet[whatakey];
                          delete bet[whatakey];
                        });
                        return res.send({
                          ...bet,
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
