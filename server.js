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
  let API = 'https://financialmodelingprep.com/api/v3/profile/AAPL';
  let queryKey = {
    apikey: process.env.STOCK_API
  }

  superagent.get(API).query(queryKey).then(data =>{
    
    let output = data.body.map(object => new StockInfo(object));

    res.render('pages/stockSearch', {info:output});

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

function getHousingData(){

  app.fetch("https://realtor.p.rapidapi.com/properties/list-sold?age_max=5&postal_code=98036&radius=10&sort=relevance&sqft_min=1000&state_code=NY&city=New%20York%20City&offset=0&limit=5", {
	"method": "GET",
	  "headers": {
		  "x-rapidapi-host": "realtor.p.rapidapi.com",
		  "x-rapidapi-key": process.env.RAPID_API_KEY
	  }
  })
.then(response => {
	console.log(response);
})
.catch(err => {
	console.log(err);
});

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
  app.listen(PORT, () => console.log(`WORKING: ${PORT}.`));
})
