import Joi from "joi";

var usersIdSchema = Joi.object({
  id: Joi.string().uuid(),
}).required();

export { usersIdSchema };
