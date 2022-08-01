const transactionsSchema = joi
  .object({
    id: joi.string().uuid(),
    userId: joi.string().uuid().required(),
    cardNumber: joi.string().required(),
    amount: joi.number().min(0).required(),
  })
  .required();

export default transactionsSchema;
