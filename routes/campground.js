import express from 'express'
import { Campground } from '../models/campground.js'
import { campgroundSchema } from '../validation/schemas.js'
import { ExpressError, catchAsyncErr } from '../utils/errors.js'

const router = express.Router()

router.get(
   '/',
   catchAsyncErr(async (req, res, next) => {
      const campgrounds = await Campground.find({})
      res.render('campgrounds/index', { campgrounds })
   })
)

router.get('/new', (req, res) => {
   res.render('campgrounds/new')
})
router.post(
   '/',
   validateCampground,
   catchAsyncErr(async (req, res, next) => {
      const campground = new Campground(req.body.campground)
      await campground.save()
      res.redirect(`/campgrounds/${campground._id}`)
   })
)

router.get(
   '/:id',
   catchAsyncErr(async (req, res, next) => {
      const { id } = req.params
      const campground = await Campground.findById(id).populate('reviews')
      res.render('campgrounds/show', { campground })
   })
)

router.get(
   '/:id/edit',
   catchAsyncErr(async (req, res, next) => {
      const { id } = req.params
      const campground = await Campground.findById(id)
      res.render('campgrounds/edit', { campground })
   })
)
router.put(
   '/:id',
   validateCampground,
   catchAsyncErr(async (req, res, next) => {
      const { id } = req.params
      const campground = await Campground.findByIdAndUpdate(id, {
         ...req.body.campground,
      })
      res.redirect(`/campgrounds/${campground._id}`)
   })
)

router.delete(
   '/:id',
   catchAsyncErr(async (req, res, next) => {
      const { id } = req.params
      const deletedCamp = await Campground.findByIdAndDelete(id)
      console.log(deletedCamp)
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
