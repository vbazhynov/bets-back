import * as validators from "../../validator-schemas/index.js";
import createError from "http-errors";

const validateBody = (validator) => {
  return async function (req, res, next) {
    try {
      const validated = await validators[validator].validateAsync(req.body);
      req.body = validated;
      next();
    } catch (err) {
      if (err.isJoi) {
        return next(createError(422, { message: err.message }));
      }
      next(createError(500));
    }
  };
};

const validateParams = (validator) => {
  return function (req, res, next) {
    const validated = validators[validator].validateAsync(req.params);
    if (validated.error) {
      res
        .status(400)
        .send(
          next(
            createError(422, { message: validated.error.details[0].message })
          )
        );
    }
    next();
  };
};

export { validateBody, validateParams };
