import { Router } from "express";
const router = Router();

router.post("/", (req, res) => {
  var schema = joi
    .object({
      id: joi.string().uuid(),
      type: joi.string().required(),
      homeTeam: joi.string().required(),
      awayTeam: joi.string().required(),
      startAt: joi.date().required(),
      odds: joi
        .object({
          homeWin: joi.number().min(1.01).required(),
          awayWin: joi.number().min(1.01).required(),
          draw: joi.number().min(1.01).required(),
        })
        .required(),
    })
    .required();
  var isValidResult = schema.validate(req.body);
  if (isValidResult.error) {
    res.status(400).send({ error: isValidResult.error.details[0].message });
    return;
  }

  try {
    let token = req.headers["authorization"];
    if (!token) {
      return res.status(401).send({ error: "Not Authorized" });
    }
    token = token.replace("Bearer ", "");
    try {
      var tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
      if (tokenPayload.type != "admin") {
        throw new Error();
      }
    } catch (err) {
      return res.status(401).send({ error: "Not Authorized" });
    }

    req.body.odds.home_win = req.body.odds.homeWin;
    delete req.body.odds.homeWin;
    req.body.odds.away_win = req.body.odds.awayWin;
    delete req.body.odds.awayWin;
    db("odds")
      .insert(req.body.odds)
      .returning("*")
      .then(([odds]) => {
        delete req.body.odds;
        req.body.away_team = req.body.awayTeam;
        req.body.home_team = req.body.homeTeam;
        req.body.start_at = req.body.startAt;
        delete req.body.awayTeam;
        delete req.body.homeTeam;
        delete req.body.startAt;
        db("event")
          .insert({
            ...req.body,
            odds_id: odds.id,
          })
          .returning("*")
          .then(([event]) => {
            statEmitter.emit("newEvent");
            [
              "bet_amount",
              "event_id",
              "away_team",
              "home_team",
              "odds_id",
              "start_at",
              "updated_at",
              "created_at",
            ].forEach((whatakey) => {
              var index = whatakey.indexOf("_");
              var newKey = whatakey.replace("_", "");
              newKey = newKey.split("");
              newKey[index] = newKey[index].toUpperCase();
              newKey = newKey.join("");
              event[newKey] = event[whatakey];
              delete event[whatakey];
            });
            ["home_win", "away_win", "created_at", "updated_at"].forEach(
              (whatakey) => {
                var index = whatakey.indexOf("_");
                var newKey = whatakey.replace("_", "");
                newKey = newKey.split("");
                newKey[index] = newKey[index].toUpperCase();
                newKey = newKey.join("");
                odds[newKey] = odds[whatakey];
                delete odds[whatakey];
              }
            );
            return res.send({
              ...event,
              odds,
            });
          });
      });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
    return;
  }
});

router.put("/:id", (req, res) => {
  var schema = joi
    .object({
      score: joi.string().required(),
    })
    .required();
  var isValidResult = schema.validate(req.body);
  if (isValidResult.error) {
    res.status(400).send({ error: isValidResult.error.details[0].message });
    return;
  }

  try {
    let token = req.headers["authorization"];
    if (!token) {
      return res.status(401).send({ error: "Not Authorized" });
    }
    token = token.replace("Bearer ", "");
    try {
      var tokenPayload = jwt.verify(token, process.env.JWT_SECRET);
      if (tokenPayload.type != "admin") {
        throw new Error();
      }
    } catch (err) {
      console.log(err);
      return res.status(401).send({ error: "Not Authorized" });
    }

    var eventId = req.params.id;
    console.log(eventId);
    db("bet")
      .where("event_id", eventId)
      .andWhere("win", null)
      .then((bets) => {
        var [w1, w2] = req.body.score.split(":");
        let result;
        if (+w1 > +w2) {
          result = "w1";
        } else if (+w2 > +w1) {
          result = "w2";
        } else {
          result = "x";
        }
        db("event")
          .where("id", eventId)
          .update({ score: req.body.score })
          .returning("*")
          .then(([event]) => {
            Promise.all(
              bets.map((bet) => {
                if (bet.prediction == result) {
                  db("bet").where("id", bet.id).update({
                    win: true,
                  });
                  db("user")
                    .where("id", bet.user_id)
                    .then(([user]) => {
                      return db("user")
                        .where("id", bet.user_id)
                        .update({
                          balance:
                            user.balance + bet.bet_amount * bet.multiplier,
                        });
                    });
                } else if (bet.prediction != result) {
                  return db("bet").where("id", bet.id).update({
                    win: false,
                  });
                }
              })
            );
            setTimeout(() => {
              [
                "bet_amount",
                "event_id",
                "away_team",
                "home_team",
                "odds_id",
                "start_at",
                "updated_at",
                "created_at",
              ].forEach((whatakey) => {
                var index = whatakey.indexOf("_");
                var newKey = whatakey.replace("_", "");
                newKey = newKey.split("");
                newKey[index] = newKey[index].toUpperCase();
                newKey = newKey.join("");
                event[newKey] = event[whatakey];
                delete event[whatakey];
              });
              res.send(event);
            }, 1000);
          });
      });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
    return;
  }
});

export default router;
