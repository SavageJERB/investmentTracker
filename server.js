'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pg = require('pg')
const superagent = require('superagent');
const morgan = require('morgan');
const fetch = require('node-fetch');

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
app.get('/searches', getStockData)
app.get('/searches_green', getGreenData)
app.get('/searches_housing', getHousingData)




//-----Error Routes
app.use('*', routeNotFound);
app.use(bigError);






//----------Connection Test Function
function connectionTest(req, res){
  res.status(200).render('pages/home')


}

//----------Search API
function getStockData(req, res){
  let API = 'https://financialmodelingprep.com/api/v3/profile/msft';
  let queryKey = {
    apikey: process.env.STOCK_API
  }

  superagent.get(API).query(queryKey).then(data =>{
    
    // let output = data.body.map(object => new StockInfo(object));
    let stockInfo = data.body;
    //constructor needs more data in it
    getHousingData(stockInfo)
    .then(stockInfo => {
      res.send(stockInfo);
      // res.render('pages/stockSearch', {info:output});
    });


  }).catch(error => res.render('pages/error'));
}

function getGreenData(req,res){
  let url = 'www.apple.com'
  let API = `http://api.thegreenwebfoundation.org/greencheck/${url}`
  
  superagent.get(API)
  .then(data =>{
    console.log(data.body)
    let output = data.body

      res.render('pages/greenSearch', {info:output});
    }).catch(error => res.render('pages/error'));
}

function getHousingData(data){
  console.log(data);
  let ZIP_CODE = data[0].zip;
  let RADIUS = 15;
  let SQFT = 1000;
  let MAX_AGE = 5;
  let RESULT_LIMIT = 5;
return fetch(`https://realtor.p.rapidapi.com/properties/list-sold?age_max=${MAX_AGE}&postal_code=${ZIP_CODE}&radius=${RADIUS}&sort=relevance&sqft_min=${SQFT}&limit=${RESULT_LIMIT}`, {
  "method": "GET",
    "headers": {
      "x-rapidapi-host": "realtor.p.rapidapi.com",
      "x-rapidapi-key": process.env.RAPID_API_KEY
    }
  })
.then(response => response.json())



.catch(err => {
  console.log(err);
});
// property_id, sqft_raw, price_raw

}




app.get ('')

//----------Stock info Constructor

function GreenInfo(data){
  this.green = typeof(data.green) !== 'undefined' ? (data.green) : ''



}

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
  app.listen(PORT, () => console.log(`WORK: ${PORT}.`));
})
