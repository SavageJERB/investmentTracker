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

//+++++++++++++++++++++Render ejs pages Tests: Start+++++++++++++++++++++++++++
app.get('/', home);
app.get('/search', search);
app.get('/setting', setting);
app.get('/watchlist', watchlist_Ex);
app.get('/results', results);

function home(req, res){
  res.status(200).render('pages/home', {title: 'Intellectual Investor', footer: 'About the Developers'});
}
function search(req, res){
  res.status(200).render('pages/search', {title: 'Search', footer: 'Home'});
}
function setting(req, res){
  res.status(200).render('pages/setting', {title: 'Settings', footer: 'Home'});
}
function watchlist_Ex(req, res){
  res.status(200).render('pages/watchlist_Ex', {title: 'Your Watchlist', footer: 'Home'});
}
function results(req, res){
  res.status(200).render('pages/watchlist_Ex', {title: 'Search Results', footer: 'Home'});
}
//+++++++++++++++++++++Render ejs pages Tests: End+++++++++++++++++++++++++++++


//----------Routes
app.get('/', connectionTest);
app.get('/searches', getStockData)
app.get('/searches_green', getGreenData)
app.get('/searches_housing', getHousingData)
app.get('/sentiment', getSentimentData)
//-----Error Routes
app.use('*', routeNotFound);
app.use(bigError);


//----------Connection Test Function
function connectionTest(req, res){
  res.status(200).render('pages/home')



}

//----------Search API

function getSentimentData(req, res){
  fetch("https://microsoft-text-analytics1.p.rapidapi.com/sentiment", {
    "method": "POST",
    "headers": {
      "x-rapidapi-host": "microsoft-text-analytics1.p.rapidapi.com",
      "x-rapidapi-key": `${process.env.RAPID_API_KEY}`,
      "content-type": "application/json",
      "accept": "application/json"
    },
    "body": JSON.stringify({
      "documents": [
        {
          "id": "1",
          "language": "en",
          "text": "Hello world. This is some input text that I love."
        },
        {
          "id": "2",
          "language": "en",
          "text": "It's incredibly sunny outside! I'm so happy."
        },
        {
          "id": "3",
          "language": "en",
          "text": "Pike place market is my favorite Seattle attraction."
        }
      ]
    })
  })
  .then(response => response.json())
  .then(json => res.send(json.documents[0].sentences[1].sentiment))
  .catch(err => {
    console.log(err);
  });
}

function TryingSentiment(data){
  this.sentiment = data.documents[0].sentences[1].sentiment
}

function getStockData(req, res){
  let API = 'https://financialmodelingprep.com/api/v3/profile/msft';
  let queryKey = {
    apikey: process.env.STOCK_API
  }

  superagent.get(API).query(queryKey).then(data =>{
    
    let stockInfo = data.body;
    getHousingData(stockInfo)
    .then(housingData => {
      console.log('housingData: ',housingData.listings);
    });
    getGreenData(stockInfo)
    .then(greenData => {
      console.log('greenData: ',greenData.body)
    });
    getNewsData(stockInfo)
    .then(newsData => {
      console.log('newsData: ',newsData.articles[0])
    })
    // .then(getSentimentData(newsData.articles[0]))


  // }).catch(error => res.render('pages/error'));
})
};

function getNewsData(data){
  let tickerSymbol = data[0].symbol;
  return fetch(`https://stock-google-news.p.rapidapi.com/v1/search?when=1d&lang=en&country=US&ticker=${tickerSymbol}`, {
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "stock-google-news.p.rapidapi.com",
		"x-rapidapi-key": `${process.env.RAPID_API_KEY}`
	}
})
.then(response => response.json())
// .then(json => console.log(json));
};

function getGreenData(data){
  // let url = 'http://www.microsoft.com';
  let url = data[0].website;
  let newURL = url.replace('http://', '');
  // let newURL2 = url.replace("https://", "");
  console.log('url :',newURL);
  let API = `http://api.thegreenwebfoundation.org/greencheck/${newURL}`
  
  return superagent.get(API)

};

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
