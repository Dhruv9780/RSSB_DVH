import type { RequestHandler } from 'express';
import type { AnyZodObject } from 'zod';

export const validateRequest = (schema: AnyZodObject): RequestHandler => {
  return (req, _res, next) => {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    req.body = parsed.body;
    req.query = parsed.query;
    req.params = parsed.params;

    next();
  };
};
