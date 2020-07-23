'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pg = require('pg')
const superagent = require('superagent');
const morgan = require('morgan');

const PORT = process.env.PORT || 3000;
const client = new pg.Client(process.env.DATABASE_URL);
const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }))
app.use(express.static('./public'));

app.set('view engine', 'ejs');


//----------Routes
app.get('/', connectionTest);
//-----Error Routes
app.use('*', routeNotFound);
app.use(bigError);



//----------Connection Test Function
function connectionTest(req, res){
  res.status(200).render('pages/setting')
}

//----------Search API
app.get('/searches', (req, res) => {
    let API = 'https://financialmodelingprep.com/api/v3/profile/AAPL';
    let queryKey = {
      apikey: process.env.STOCK_API
    }

  superagent.get(API).query(queryKey).then(data =>{
    let output = data.body.map(object => new StockInfo(object));

    res.render('pages/stockSearch', {info:output});

  }).catch(error => res.render('pages/error'));
});

//----------Stock info Constructor
function StockInfo(data){
  this.symbol = typeof(data.symbol) !== 'undefined' ?  (data.symbol) : ""
  this.companyName = typeof(data.companyName) !== 'undefined' ? (data.companyName) : ""
  this.sector = typeof(data.sector) !== 'undefined' ? (data.sector) : ""
  this.state = typeof(data.state) !=='undefined' ? data.state : ""
  this.zip = typeof(data.zip) !=='undefined' ? data.state : ""
  this.current_price = typeof(data.price) !=='undefined' ? data.price : ""
}

//----------404 Error
function routeNotFound(req, res) {
  res.status(404).send('Route NOT Be Found!');
}

//----------All Errors minus 404
function bigError(error, req, res, next) {
  console.log(error);
  res.status(error).send('BROKEN!');
}

//----------Listen on PORT
client.connect(() => {
  app.listen(PORT, () => console.log(`WORKING: ${PORT}.`));
})
