import mongoose from 'mongoose'
import express from 'express'
import methodOverride from 'method-override'
import ejsMate from 'ejs-mate'
import session from 'express-session'
import flash from 'connect-flash'
import morgan from 'morgan'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import passport from 'passport'
import LocalAuthStrategy from 'passport-local'
import { User } from './models/user.js'
import { ExpressError } from './utils/errors.js'
import campgroundRoutes from './routes/campground.js'
import reviewRoutes from './routes/reviews.js'
import userRoutes from './routes/users.js'

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

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalAuthStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
   console.log(req.session)

   res.locals.currentUser = req.user
   res.locals.success = req.flash('success')
   res.locals.error = req.flash('error')
   next()
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

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

app.listen(3000, () => console.log(`listening on http://127.0.0.1:3000 ✅`))
