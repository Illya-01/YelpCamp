import mongoose from 'mongoose'
import { Campground } from '../models/campground.js'
import { places, descriptors } from '../seeds/seedHelpers.js'
import citiesUA from '../seeds/citiesUA.js'

mongoose
   .connect('mongodb://127.0.0.1:27017/yelp-camp')
   .then(() => console.log('Database connected ✅'))
   .catch(err =>
      console.error(`Database initial connection error 🔴: ${err.message}`)
   )

seedDB().then(() => mongoose.connection.close())

async function seedDB(campCount = 25) {
   await Campground.deleteMany({})

   for (let i = 0; i < campCount; i++) {
      const randCity = Math.floor(Math.random() * citiesUA.length)
      const randPrice = Math.floor(Math.random() * 20) + 10
      const camp = new Campground({
         title: `${sample(descriptors)} ${sample(places)}`,
         price: randPrice,
         location: `${citiesUA[randCity].city}, ${citiesUA[randCity].admin_name}`,
         image: `https://source.unsplash.com/random?camping,${i}`,
         description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt',
      })
      await camp.save()
   }
}

function sample(array) {
   return array[Math.floor(Math.random() * array.length)]
}
