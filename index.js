const express = require('express');
const cors = require('cors');
const res = require('express/lib/response');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.podxe.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try {
        await client.connect();
        const partsCollection = client.db('assignment-12').collection('parts');
        const usersCollection = client.db('assignment-12').collection('user');
        
    
        app.get('/parts', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        });
        // for finding one

        app.get('/parts/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const item = await partsCollection.findOne(query);
            res.send(item);
        })

        // for update
        // app.patch('/items/:id', async (req, res)=>{
        //     const updateItem = req.body;
        //     console.log(updateItem);
        //     const filter = {_id: ObjectId(id)};
        //     const options = { upsert: true };
        //     const updateQuantity = {
        //         $set:{
        //             quantity: updateItem.quantity
        //         },
        //     };
        //     const result = await itemCollection.updateOne(filter,updateQuantity,options);
        //     res.send(result);
        // })
        // for adding one item
        app.post('/users', async (req, res)=>{
            const newItem = req.body;
            const result = await usersCollection.insertOne(newItem);
            res.send(result);
        })
        
        // app.delete('/items/:id', async (req, res)=>{
        //     const id = req.params.id;
        //     const query = {_id: ObjectId(id)};
        //     const result = await itemCollection.deleteOne(query);
        //     res.send(result);
        // })

    }
    finally {

    }
}



run().catch(console.dir);

app.get('/', (req,res) => {
    res.send('running server');
});

app.listen(port, ()=>{
    console.log('listening on port');
});