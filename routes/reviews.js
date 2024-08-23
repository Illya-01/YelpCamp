import express from 'express'
import { Campground } from '../models/campground.js'
import { Review } from '../models/review.js'
import { reviewSchema } from '../validation/schemas.js'
import { ExpressError, catchAsyncErr } from '../utils/errors.js'

const router = express.Router({ mergeParams: true })

router.post(
   '/',
   validateReview,
   catchAsyncErr(async (req, res, next) => {
      const { id } = req.params
      const campground = await Campground.findById(id)
      const review = new Review(req.body.review)
      campground.reviews.push(review)
      await review.save()
      await campground.save()
      req.flash('success', 'Successfully created a new review!')
      res.redirect(`/campgrounds/${campground._id}`)
   })
)

router.delete(
   '/:reviewId',
   catchAsyncErr(async (req, res, next) => {
      const { id, reviewId } = req.params
      await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
      await Review.findByIdAndDelete(reviewId)
      req.flash('success', 'Successfully deleted the review!')
      res.redirect(`/campgrounds/${id}`)
   })
)

function validateReview(req, res, next) {
   const { error } = reviewSchema.validate(req.body)
   if (error) {
      const errMessage = error.details.map(el => el.message)
      throw new ExpressError(errMessage, 400)
   }
   next()
}

export default router
