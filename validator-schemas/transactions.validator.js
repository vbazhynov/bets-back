import Joi from "joi";
const transactionsSchema = Joi.object({
  id: Joi.string().uuid(),
  userId: Joi.string().uuid().required(),
  cardNumber: Joi.string().required(),
  amount: Joi.number().min(0).required(),
}).required();

export { transactionsSchema };
