import express, { urlencoded } from 'express'
import ejsMate from 'ejs-mate'
import methodOverride from 'method-override'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { connect } from 'mongoose'
import { Campground } from './models/campground.js'

connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => console.log('Database connected ✅'))
    .catch(err => console.error(`Database initial connection error 🔴: ${err.message}`))

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', join(__dirname, 'views'))

app.use(urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('pages/index', { campgrounds })
})

app.get('/campgrounds/new', (req, res) => {
    res.render('pages/new')
})
app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground)
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
})

app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('pages/show', { campground })
})

app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('pages/edit', { campground })
})
app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`)
})

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
})

app.listen(3000, () => console.log('listening on port 3000 ✅'))
