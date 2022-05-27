const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const res = require('express/lib/response');
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
        const usersCollection = client.db('assignment-12').collection('users');
        const ordersCollection = client.db('assignment-12').collection('orders');
        
    
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
        app.put('/parts/:id', async (req, res)=>{
            const id = req.params.id;
            const updateItem = req.body;
            const filter = {_id: ObjectId(id)};
            const options = { upsert: true };
            const updateQuantity = {
                $set:{
                    available: updateItem.available
                },
            };
            const result = await partsCollection.updateOne(filter,updateQuantity,options);
            res.send(result);
        })
        
        // for updating one item
        app.put('/user/:email', async (req, res)=>{
            const email = req.params.email;
            const user = req.body;
            const filter = {email: email};
            const options = {upsert: true};
            const updateDoc = {
                $set:user,
            };
            const result = await usersCollection.updateOne(filter,updateDoc,options);
            // console.log(newItem);
            var token = jwt.sign({ email:email }, process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1d'});
            res.send({result,token});
        })
        // for admin
        app.put('/user/admin/:email', async (req, res)=>{
            const email = req.params.email;
            const requester = req.params.email;
            const requesterAccount = await usersCollection.findOne({email:requester});
            if(!requesterAccount.role === 'admin'){
                const filter = {email: email};
            const updateDoc = {
                $set:{role:'admin'},
            };
            const result = await usersCollection.updateOne(filter,updateDoc);
            res.send({result});
            }
            else{
                res.status(403).send({message: 'forbidden'});
            }
        })
        // for getting all user
        app.get('/user', async (req, res) => {
            
            const users = await usersCollection.find().toArray();
            res.send(users);
        })
        // checking admin or not
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({admin: isAdmin});
        })
        // for inserting one item in orders collection
        app.post('/order', async (req, res)=>{
            const newItem = req.body;
            const result = await ordersCollection.insertOne(newItem);
            // console.log(newItem);
            res.send(result);
        })
        
        app.get('/order', async (req, res) => {
            const email = req.query.email;
            const query = {email:email};
            const orders = await ordersCollection.find(query).toArray();
            res.send(orders);
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