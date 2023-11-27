import Joi from 'joi'

export const campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().min(0).required(),
        description: Joi.string().min(20).required(),
        image: Joi.string().required(),
        location: Joi.string().required(),
    }).required(),
})
