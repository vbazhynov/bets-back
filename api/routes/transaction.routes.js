import { Router } from "express";

const router = Router();

router.post("/", (req, res) => {
  var schema = joi
    .object({
      id: joi.string().uuid(),
      userId: joi.string().uuid().required(),
      cardNumber: joi.string().required(),
      amount: joi.number().min(0).required(),
    })
    .required();
  var isValidResult = schema.validate(req.body);
  if (isValidResult.error) {
    res.status(400).send({ error: isValidResult.error.details[0].message });
    return;
  }

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

  db("user")
    .where("id", req.body.userId)
    .then(([user]) => {
      if (!user) {
        res.status(400).send({ error: "User does not exist" });
        return;
      }
      req.body.card_number = req.body.cardNumber;
      delete req.body.cardNumber;
      req.body.user_id = req.body.userId;
      delete req.body.userId;
      db("transaction")
        .insert(req.body)
        .returning("*")
        .then(([result]) => {
          var currentBalance = req.body.amount + user.balance;
          db("user")
            .where("id", req.body.user_id)
            .update("balance", currentBalance)
            .then(() => {
              ["user_id", "card_number", "created_at", "updated_at"].forEach(
                (whatakey) => {
                  var index = whatakey.indexOf("_");
                  var newKey = whatakey.replace("_", "");
                  newKey = newKey.split("");
                  newKey[index] = newKey[index].toUpperCase();
                  newKey = newKey.join("");
                  result[newKey] = result[whatakey];
                  delete result[whatakey];
                }
              );
              return res.send({
                ...result,
                currentBalance,
              });
            });
        });
    })
    .catch((err) => {
      res.status(500).send("Internal Server Error");
      return;
    });
});

export default router;
