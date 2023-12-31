const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('BookNook is running!')
})



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lcnowhl.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
     await client.connect();
     

    const serviceCollection = client.db('bookNook').collection('services');
    const bookingCollection = client.db('bookNook').collection('bookings')

    // all get 
    app.get('/rooms', async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/rooms/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await serviceCollection.findOne(query);
      res.send(result);
    })
    
    // bookings
    app.get('/bookings', async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = {email: req.query.email}
      }
      const result = await bookingCollection.find().toArray();
      res.send(result)
    })

    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      console.log(booking)
      const result = await bookingCollection.insertOne(booking);
      res.send(result)
    })

    app.get('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bookingCollection.findOne(query);
      res.send(result)
    })

    app.put('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedBooking = req.body;
      const updateDoc = {
        $set: {
          phone: updatedBooking.phone,
          date: updatedBooking.date
        },
      }
      const result = await bookingCollection.updateOne(filter, updateDoc, options)
      res.send(result)

    })

    app.delete('/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bookingCollection.deleteOne(query)
      res.send(result)
    })
        
        
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   //  await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})