import Joi from "joi";

const betsSchema = Joi.object({
  id: Joi.string().uuid(),
  eventId: Joi.string().uuid().required(),
  betAmount: Joi.number().min(1).required(),
  prediction: Joi.string().valid("w1", "w2", "x").required(),
}).required();

export { betsSchema };
