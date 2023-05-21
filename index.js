const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qabixji.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    const toysCollection = client.db("allToys").collection("toy");

    // ...................Toys.....................//
    // Create Toys Post:
    app.post("/toys", async (req, res) => {
        const newToy = req.body;
        const result = await toysCollection.insertOne(newToy);
        res.send(result);
      });

    // Read All Toys:
    app.get("/allToys", async (req, res) => {
        const result = await toysCollection.find().limit(20).toArray();
        res.send(result);
      });

    // Read Single Toy:
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    // Read by Category:
    app.get("/allToysByCategory/:category", async (req, res) => {
      const jobs = await toysCollection.find({
          subCategory: req.params.category,
        })
        .toArray();
      res.send(jobs);
    });

    // Update Toy:
    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateToy = req.body;
      const toy = {
        $set: {
          price: updateToy.price,
          quantity: updateToy.quantity,
          description: updateToy.description,
        },
      };
      const result = await toysCollection.updateOne(filter, toy, options);
      res.send(result);
    });

    // Delete Event:
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    // Read by Email:
    // app.get("/myToys/:email", async (req, res) =>{
      // const type = req.params.type === "Ascending";
      // const value = req.query.value;
      // const sortObj = {};
      // sortObj[value] = type ? 1 : -1;
    //   const result = await toysCollection.find({ sellerEmail: req.params.email }).sort({price: 1}).toArray();
    //   res.send(result);
    // });

    // sort by ascending descending condition:
    app.get('/myToy', async (req, res) =>{
      const type = req.query.type == "ascending";
      const value = req.query.value;
      let query = {};
      if(req.query.email) {
        query = { sellerEmail: req.query.email };
      }
      let sortObj = {};
      sortObj[value] = type ? 1 : -1;
      const result = await toysCollection.find(query).sort(sortObj).toArray();
      res.send(result);
    })
    

    // ........Search..............//
    app.get("/getToysName/:text", async (req, res) => {
      const text = req.params.text;
      const result = await toysCollection.find({
          $and: [
            { toyName: text }
          ],
        }).toArray();
      res.send(result);
    });


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Toy Marketplace is running!');
})

app.listen(port, () =>{
    console.log(`Toy Marketplace is running on: ${port}`)
})