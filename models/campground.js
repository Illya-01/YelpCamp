import { Schema, model } from 'mongoose'
import { Review } from './review.js'

const campgroundSchema = new Schema({
   title: String,
   price: Number,
   description: String,
   image: String,
   location: String,
   reviews: [
      {
         type: Schema.Types.ObjectId,
         ref: 'Review',
      },
   ],
})

// ! better to move this to rotes/campgrounds.js
campgroundSchema.post('findOneAndDelete', async function (camp) {
   if (!camp) return
   await Review.deleteMany({ _id: { $in: camp.reviews } })
})

export const Campground = model('Campground', campgroundSchema)
