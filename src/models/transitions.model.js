import joi from 'joi';

export const transationsSchema = joi.object({
    value: joi.string().required().min(1),
    description: joi.string().required().min(1),
})
