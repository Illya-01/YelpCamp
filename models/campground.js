import { Schema, model } from 'mongoose'

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    image: String,
    location: String,
})

export const Campground = model('Campground', campgroundSchema)
