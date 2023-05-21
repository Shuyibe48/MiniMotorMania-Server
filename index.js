const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

// middleware 
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jukjd3u.mongodb.net/?retryWrites=true&w=majority`;

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

        const toysCollection = client.db("MiniMotorMania").collection("toys")

        app.get('/toys', async (req, res) => {
            const page = parseInt(req.query.page) || 0
            const limit = parseInt(req.query.limit) || 20
            const skip = page * limit

            let query = {}
            let sort = {}
            if (req.query?.email) {
                query = { seller_email: req.query.email }
            }
            if (req.query?.ascending === 'true') {
                sort = { price: 1 }
            }
            if (req.query?.descending == 'true') {
                sort = { price: -1 }
            }
            console.log(sort);
            const result = await toysCollection.find(query).sort(sort).skip(skip).limit(limit).toArray()
            res.send(result)
        })

        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.findOne(query)
            res.send(result)
        })

        // post data 
        app.post('/toys', async (req, res) => {
            const toy = req.body
            const result = await toysCollection.insertOne(toy)
            res.send(result)
        })

        // update data
        app.put('/toys/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateToy = req.body
            const toy = {
                $set: {
                    price: updateToy.price,
                    available_quantity: updateToy.available_quantity,
                    description: updateToy.description
                }
            }
            const result = await toysCollection.updateOne(filter, toy, options)
            res.send(result)
        })

        // total toy
        app.get('/totalToys', async (req, res) => {
            const result = await toysCollection.estimatedDocumentCount()
            res.send({ totalToys: result })
        })

        // delete data 
        app.delete('/toys/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.deleteOne(query)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('The MiniMotorMania Server is running')
})

app.listen(port, () => {
    console.log(`app is running on port ${port}`);
})