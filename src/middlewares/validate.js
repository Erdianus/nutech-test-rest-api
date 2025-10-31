import { validationResult } from "express-validator";

/**
 * validate(rules, opts)
 * - rules: array of express-validator rules
 * - opts: optional object { customError, bodyStatus, httpStatus }
 *    - customError: if true, middleware will respond directly with custom JSON
 *    - bodyStatus: numeric `status` value inside JSON body (default 102)
 *    - httpStatus: HTTP status code to send (default 400 when customError=true)
 */
function validate(rules) {
  return [
    ...rules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const arr = errors.array();
        const first = arr[0] || {};

        // send a custom structured response body
        const body = {
          status: 102,
          message: first.msg || "Parameter tidak sesuai format",
          data: null,
        };
        return res.status(400).json(body);
      }
      next();
    },
  ];
}

export default validate;
