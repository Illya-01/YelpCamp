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

export const reviewSchema = Joi.object({
   review: Joi.object({
      text: Joi.string().min(20).required(),
      rating: Joi.number().integer().min(1).max(5).required(),
   }).required(),
})
