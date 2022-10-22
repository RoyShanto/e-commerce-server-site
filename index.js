const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors');
const fileupload = require('express-fileupload');

app.use(cors());
app.use(express.json());
app.use(fileupload());

const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i3qcq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




async function run(){
    try {
        await client.connect();
        const database = client.db("e-commerce");
        const productsCollection = database.collection("products");
        const categoriesCollection = database.collection("categories");
          
        app.post('/addProduct', async (req, res) => {
            const categoryName = req.body.categoryName;
            const name = req.body.name;
            const price = req.body.price;
            const description = req.body.description;
            const img = req.files.image;
            const imgData = img.data;
            const encodedImg = imgData.toString('base64');
            const imgBuffer = Buffer.from(encodedImg, 'base64');
            const newProduct = {
              categoryName,
              name,
              price,
              description,
              productimage: imgBuffer
            }
            const result = await productsCollection.insertOne(newProduct);
            console.log('Added Product', result);
            // console.log(newProduct);
            res.json(result);
        })
        app.post('/addCategory', async (req, res) => {
          const categoryName = req.body.categoryName;
          const img = req.files.image;
          const imgData = img.data;
          const encodedImg = imgData.toString('base64');
          const imgBuffer = Buffer.from(encodedImg, 'base64');
          const newCategory = {
            categoryName,
            categoryimage: imgBuffer
          }
          // console.log(category);
            // const newCategory = req.body;
            const result = await categoriesCollection.insertOne(newCategory);
            // console.log('Added Category', result);
            res.json(result);
            // console.log('res' + newCategory);
        })
        app.get('/categories', async (req, res) => {
          const cursor = categoriesCollection.find({});
          const category = await cursor.toArray();
          res.send(category);
        })
        app.delete('/category/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const result = await categoriesCollection.deleteOne(query);
          console.log('delete Category with id', id);
          res.json(result);
        })
        app.get('/products', async (req, res) => {
          const cursor = productsCollection.find({});
          const products = await cursor.toArray();
          res.send(products);
        })
        app.delete('/products/:id', async (req, res) => {
          const id = req.params.id;
          const query = { _id: ObjectId(id) };
          const result = await productsCollection.deleteOne(query);
          console.log('delete Product with id', id);
          res.json(result);
        })
        
        app.get('/products/:categoryName', async (req, res) => {
          const Name = req.params.categoryName;
          // const query = { categoryName: categoryName };
          const user = await productsCollection.find({ categoryName: Name }).toArray((err, categoryName) => { res.send(categoryName)});
          console.log('load user with id', user);
          // res.send(user);
        })
        app.get('/product/:id', async (req, res) => {
          const id = req.params.id;
          // console.log("id..." + id);
          // const query = { categoryName: categoryName };
          const query = { _id: ObjectId(id) };
          const user = await productsCollection.findOne(query);
          // console.log('load user with id', user);
          res.send(user);
        })
      }
    finally{
        // await client.close()
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('E-commerce Server is ready..!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


