import express from 'express'
import { Campground } from '../models/campground.js'
import { campgroundSchema } from '../validation/schemas.js'
import { ExpressError, catchAsyncErr } from '../utils/errors.js'
import { isLoggedIn } from '../middleware.js'

const router = express.Router()

router.get(
   '/',
   catchAsyncErr(async (req, res, next) => {
      const campgrounds = await Campground.find({})
      res.render('campgrounds/index', { campgrounds })
   })
)

router.get('/new', isLoggedIn, (req, res) => {
   res.render('campgrounds/new')
})
router.post(
   '/',
   isLoggedIn,
   validateCampground,
   catchAsyncErr(async (req, res, next) => {
      const campground = new Campground(req.body.campground)
      await campground.save()
      req.flash('success', 'Successfully made a new campground!')
      res.redirect(`/campgrounds/${campground._id}`)
   })
)

router.get(
   '/:id',
   catchAsyncErr(async (req, res, next) => {
      const { id } = req.params
      const campground = await Campground.findById(id).populate('reviews')
      if (!campground) {
         req.flash('error', 'Cannot find the campground!')
         return res.redirect('/campgrounds')
      }
      res.render('campgrounds/show', { campground })
   })
)

router.get(
   '/:id/edit',
   isLoggedIn,
   catchAsyncErr(async (req, res, next) => {
      const { id } = req.params
      const campground = await Campground.findById(id)
      if (!campground) {
         req.flash('error', 'Cannot find the campground!')
         return res.redirect('/campgrounds')
      }
      res.render('campgrounds/edit', { campground })
   })
)
router.put(
   '/:id',
   isLoggedIn,
   validateCampground,
   catchAsyncErr(async (req, res, next) => {
      const { id } = req.params
      const campground = await Campground.findByIdAndUpdate(id, {
         ...req.body.campground,
      })
      req.flash('success', 'Successfully updated the campground!')
      res.redirect(`/campgrounds/${campground._id}`)
   })
)

router.delete(
   '/:id',
   isLoggedIn,
   catchAsyncErr(async (req, res, next) => {
      const { id } = req.params
      const deletedCamp = await Campground.findByIdAndDelete(id)
      console.log(deletedCamp)
      req.flash('success', 'Successfully deleted the campground!')
      res.redirect('/campgrounds')
   })
)

function validateCampground(req, res, next) {
   const { error } = campgroundSchema.validate(req.body)
   if (error) {
      const errMessage = error.details.map(el => el.message)
      throw new ExpressError(errMessage, 400)
   }
   next()
}

export default router
