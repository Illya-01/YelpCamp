import mongoose from 'mongoose'
import express from 'express'
import bodyParser from 'body-parser'
import methodOverride from 'method-override'
import ejsMate from 'ejs-mate'
import Joi from 'joi'
import morgan from 'morgan'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { Campground } from './models/campground.js'
import { ExpressError, catchAsyncErr } from './utils/errors.js'
import { campgroundSchema } from './validation/schemas.js'

mongoose
    .connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => console.log('Database connected ✅'))
    .catch(err => console.error(`Database initial connection error 🔴: ${err.message}`))

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', join(__dirname, 'views'))

app.use(morgan('dev'))
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(methodOverride('_method'))

function validateCampground(req, res, next) {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const errMessage = error.details.map(el => el.message)
        throw new ExpressError(errMessage, 400)
    }

    next()
}

app.get('/', (req, res) => {
    res.render('pages/home')
})

app.get(
    '/campgrounds',
    catchAsyncErr(async (req, res, next) => {
        const campgrounds = await Campground.find({})
        res.render('pages/index', { campgrounds })
    })
)

app.get('/campgrounds/new', (req, res) => {
    res.render('pages/new')
})
app.post(
    '/campgrounds',
    validateCampground,
    catchAsyncErr(async (req, res, next) => {
        const campground = new Campground(req.body.campground)
        await campground.save()
        res.redirect(`/campgrounds/${campground._id}`)
    })
)

app.get(
    '/campgrounds/:id',
    catchAsyncErr(async (req, res, next) => {
        const campground = await Campground.findById(req.params.id)
        res.render('pages/show', { campground })
    })
)

app.get(
    '/campgrounds/:id/edit',
    catchAsyncErr(async (req, res, next) => {
        const campground = await Campground.findById(req.params.id)
        res.render('pages/edit', { campground })
    })
)
app.put(
    '/campgrounds/:id',
    validateCampground,
    catchAsyncErr(async (req, res, next) => {
        const { id } = req.params
        const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
        res.redirect(`/campgrounds/${campground._id}`)
    })
)

app.delete(
    '/campgrounds/:id',
    catchAsyncErr(async (req, res, next) => {
        const { id } = req.params
        const deletedCamp = await Campground.findByIdAndDelete(id)
        console.log(deletedCamp)
        res.redirect('/campgrounds')
    })
)

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    err.statusCode = err.statusCode ?? 500
    err.message = err.message ?? 'Something Went Wrong 😥'
    console.log(`🔴 Houston, we have a problem ${err.statusCode}: ${err.message}`)
    res.render('pages/error', { err })
})

app.listen(3000, () => console.log('listening on port 3000 ✅'))
