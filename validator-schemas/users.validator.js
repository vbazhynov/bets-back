import Joi from "joi";

var usersSchema = Joi.object({
  id: Joi.string().uuid(),
  type: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^\+?3?8?(0\d{9})$/)
    .required(),
  name: Joi.string().required(),
  city: Joi.string(),
}).required();

export { usersSchema };
