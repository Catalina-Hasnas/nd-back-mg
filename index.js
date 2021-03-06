const express = require('express')
const uuid = require('uuid');

const app = express()
const db = require('./dumbDb')

// Add headers
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.get('/products', (req, res) => {
  res.send(db.get("products"));
});

app.get('/products/:id', (req, res) => {
  let product = db.get("products").find(product => product.id == req.params.id);
  if(product){
    res.send(product);
  }
  res.send({error: true, message: "Product with id: " + req.params.id + " not found"});
});

app.get('/products/category/:category', (req, res) => {
  let products = db.get("products").filter(product => product.category == req.params.category);
  if(products){
    res.send(products);
  }
  res.send({error: true, message: "No products with category: " + req.params.category});
});

app.get('/products/category/:category/:type', (req, res) => {
  let products = db.get("products").filter(product => product.category == req.params.category && product.type == req.params.type);
  if(products){
    res.send(products);
  }
  res.send({error: true, message: "No products with type: " + req.params.type + " and category " + req.params.category});
});

app.post('/products/new', (req, res) => {
  // Content-Type: application/json; charset=utf-8
  // console.log(req.body);
  let product = {
    "id": uuid.v4(),
    "name": req.body.name,
    "img": req.body.img,
    "price": req.body.price,
    "discount": req.body.discount,
    "description": req.body.description,
    "material" : req.body.material,
    "color" : req.body.color,
    "category": req.body.category,
    "type": req.body.type
  }
  db.set('products', product);
  res.status(200).json(product);
});

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++//

app.get('/orders', (req,res) => {
  res.send(db.get("orders"));
});

app.get('/orders/:id', (req, res) => {
  let order = db.get("orders").find(order => order.id == req.params.id);
  if(order){
    res.send(order);
  }
  res.status(404).send({error: true, message: "Order with id: " + req.params.id + " not found"});
});

app.get('/orders/summary/:id', (req, res) => {
  let order = db.get("orders").find(order => order.id == req.params.id);
  if(order){
    let orderSummary = {
      productsTotal: 0,
      products: []
    }
    order.products.forEach(orderProduct => {
      let product = db.get("products").find(product => product.id == orderProduct.productId);
      if(product){
        orderSummary.productsTotal += parseInt(orderProduct.quantity) * parseInt(orderProduct.price);
        orderSummary.products.push({
          "id": product.id,
          "name": product.name,
          "price": orderProduct.price,
          "quantity": orderProduct.quantity
        });
      }
    });

    res.send(orderSummary);
  }
  res.status(404).send({error: true, message: "Order with id: " + req.params.id + " not found"});
});

app.post('/orders/new', (req, res) => {
  let order = {
    "id" : uuid.v4(),
    "products" : []
  };
  db.set('orders', order);
  res.status(200).json(order);
});

app.post('/orders/addProduct', (req, res) => {
  let order = db.get("orders").find(order => order.id == req.body.orderId);

  if(order){
    db.pop('orders', order);
    productIndex = order.products.findIndex(product => product.productId == req.body.productId);
    if(productIndex > -1) {
      order.products[productIndex] = {
        "productId" : req.body.productId,
        "quantity" : req.body.quantity,
        "price" : req.body.price
      };
    } else {
      order.products.push({
        "productId" : req.body.productId,
        "quantity" : req.body.quantity,
        "price" : req.body.price
      });
    }
    db.set('orders', order);
    res.status(200).json(order);
  }
  res.status(404).send({error: true, message: "Order with id: " + req.body.id + " not found"});
});

app.post('/orders/removeProduct', (req, res) => {
  let order = db.get("orders").find(order => order.id == req.body.orderId);

  if(order){
    db.pop('orders', order);
    productIndex = order.products.findIndex(product => product.productId == req.body.productId);
    if(productIndex > -1) {
      order.products.splice(productIndex, 1);
    }
    db.set('orders', order);
    res.status(200).json(order);
  }
  res.status(300).send({error: true, message: "Order with id: " + req.body.id + " not found"});
});

app.listen(8000, () => {
  console.log('Example app listening on port 8000!')
});