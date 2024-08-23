import mongoose from 'mongoose'
import express from 'express'
import methodOverride from 'method-override'
import ejsMate from 'ejs-mate'
import session from 'express-session'
import flash from 'connect-flash'
import morgan from 'morgan'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { ExpressError } from './utils/errors.js'
import campgrounds from './routes/campground.js'
import reviews from './routes/reviews.js'

mongoose
   .connect('mongodb://127.0.0.1:27017/yelp-camp')
   .then(() => console.log('Database connected ✅'))
   .catch(err =>
      console.error(`Database initial connection error 🔴: ${err.message}`)
   )

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
app.set('views', join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.engine('ejs', ejsMate)

app.use(morgan('dev'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride('_method'))
app.use(express.static(join(__dirname, 'public')))

const cookieMaxAgeInMs = 1000 * 60 * 60 * 24 * 7
const sessionConfig = {
   secret: 'mySecretLine',
   resave: false,
   saveUninitialized: true,
   cookie: {
      httpOnly: true,
      expires: Date.now() + cookieMaxAgeInMs,
      maxAge: cookieMaxAgeInMs,
   },
}
app.use(session(sessionConfig))
app.use(flash())

app.use((req, res, next) => {
   res.locals.success = req.flash('success')
   res.locals.error = req.flash('error')
   next()
})

app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

app.get('/', (req, res) => {
   res.render('home')
})

app.all('*', (req, res, next) => {
   next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
   err.statusCode = err.statusCode ?? 500
   err.message = err.message ?? 'Something Went Wrong 😥'
   res.render('error', { err })
   console.log(
      `🔴 Houston, we have a problem ${err.statusCode}: ${err.message} \n${err.stack}`
   )
})

app.listen(3000, () => console.log(`listening on http://localhost:3000 ✅`))
