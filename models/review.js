import { Schema, model } from 'mongoose'

const reviewSchema = new Schema({
   text: String,
   rating: Number,
})

export const Review = model('Review', reviewSchema)
