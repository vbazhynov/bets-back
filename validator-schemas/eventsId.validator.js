import Joi from "joi";
var eventsIdSchema = Joi.object({
  score: Joi.string().required(),
}).required();

export { eventsIdSchema };
