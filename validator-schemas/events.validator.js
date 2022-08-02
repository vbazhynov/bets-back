import Joi from "joi";

const eventsSchema = Joi.object({
  id: Joi.string().uuid(),
  type: Joi.string().required(),
  homeTeam: Joi.string().required(),
  awayTeam: Joi.string().required(),
  startAt: Joi.date().required(),
  odds: Joi.object({
    homeWin: Joi.number().min(1.01).required(),
    awayWin: Joi.number().min(1.01).required(),
    draw: Joi.number().min(1.01).required(),
  }).required(),
}).required();

export { eventsSchema };
