'use strict';

require('dotenv').config();

const cors = require('cors');
const methodOverride = require('method-override');
const express = require('express');
const pg = require('pg')
const superagent = require('superagent');
const morgan = require('morgan');
const fetch = require('node-fetch');

const PORT = process.env.PORT || 3001;
const client = new pg.Client(process.env.DATABASE_URL);
const app = express();

app.set('view engine', 'ejs');

app.use(cors());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }))
app.use(express.static('./public'));
app.use(methodOverride('_method'));
app.use(express.static('./public'));

// app.get ('') ???????

//----------Routes
app.get('/', home);
app.get('/sql_view', viewSQL);
app.post('/searches', getStockData)//----we need an app.post
app.post('/sql_search', searchByParams);
app.get('/searches_green', getGreenData)
app.get('/searches_housing', getHousingData)
app.get('/sentiment', getSentimentData)
app.post('/addStock', addStock)
app.get('/sql1', insertStocks)
app.get('/search', search)
app.get('/setting', settings)
app.get('/developers', developers)

app.get('/watchlist', buildWatchList)
app.delete('/delete/:id',deleteStock);
//-----Error Routes
app.use('*', routeNotFound);
app.use(bigError);

//----------Use For Connection Tests
function connectionTest(req, res){
  res.status(200).render('pages/home')
}

function developers(req,res){
  res.status(200).render('pages/developers', {title: 'About the Developers', footer: 'Home'});
}

function settings(req,res){
  res.status(200).render('pages/setting', {title: 'Settings', footer: 'Home'});
}

//----------Delete Stock from Watchlist
function deleteStock(req,res) {
  
  let SQL = 'DELETE from investment_info WHERE id=$1;';
  let param = [req.params.id]
  console.log(param)

  client.query(SQL, param)
    .then(()=>{
      res.redirect('/')
    }).catch(error => console.log(error));
}


let articlesArray = [];

//----------Search Sentiment API
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

function searchByParams(req, res){
  let SQL = 'SELECT symbol FROM stock_info WHERE day_low > $1 AND day_high < $2';
  let params = [req.body.price[0], req.body.price[1]];
  
  client
  .query(SQL, params)
  .then(result => {
    console.log(result.rows);
    let matchStocks = result.rows;
  })
}


//----------Stock Data API
function getStockData(req, res){
  console.log(req.body.ticker)
  let API = `https://financialmodelingprep.com/api/v3/profile/${req.body.ticker}`;
  let queryKey = {
    apikey: process.env.STOCK_API
  }
  superagent.get(API).query(queryKey)
  .then(data =>{

    // console.log(data.body);
    let details = data.body.map(object => new StockDetails(object));

    let allInfo = details[0];
    getHousingData(data.body)
    .then(housingData => {
      let priceArray = [];

      housingData.listings.forEach(object=>{
        priceArray.push(object.price)
      })
      // let housingUpdate = details;
      allInfo.listings = priceArray
      // housingUpdate.listings = priceArray;
      // console.log('housingData: ',housingData.listings);
    });
    getGreenData(data.body)
    // console.log('======================', data.body)
    .then(greenData => {
      allInfo.greencheck = greenData.green
    });
    getNewsData(data.body)
    .then(newsData => {
      newsData.articles.forEach(object=>{
        articlesArray.push(object.title) // creates an array of headline titles from news API
        allInfo.newsTitles = articlesArray.slice(0,5); //saves to overall object the first 5 news titles
      })
      let documents = [];
      for (let i = 0; i<articlesArray.length; i++){
       documents.push({id: i, language: "en", text: articlesArray[i]})
      }
      let output = {documents:documents} // creates object needed for Sentiment API
      getSentimentData(output)   
      .then(sentimentResults=>{
        
        let sentimentArray = []
        
        sentimentResults.documents.forEach(object=>{
            sentimentArray.push(object.sentiment)
        })
        let sentimentNumbersArray = sentimentArray.map(value=>{
          if (value == 'negative'){
            return value = 0;
          }else if(value == 'neutral'){
            return value = 1;
          }else if(value == 'positive'){
            return value = 2;
          }
        })
        
        let sentimentSum = sentimentNumbersArray.reduce((previous,current) => current += previous);
        let sentimentAvgScore = Math.round(sentimentSum / sentimentNumbersArray.length);
        let sentimentResult = 'N/A'
        if(sentimentAvgScore == 0){
          sentimentResult = "Negative" 
        }else if(sentimentAvgScore == 1){
          sentimentResult = "Neutral"
        }else if(sentimentAvgScore == 2){
          sentimentResult = "Positive"
        }
        allInfo.sentimentResult = sentimentResult;

      })
      .then(response=> res.render('pages/results', {output: allInfo, title: 'Search Results', footer: 'Home'}))
    })
    // .then(getSentimentData(newsData.articles[0]))
  })
  // }).catch(error => res.render('pages/error'));
};

//----------Search for Stocks Page
function search(req, res){
  res.status(200).render('pages/search', {title: 'Search', footer: 'Home'});
}

//----------Home Page
function home(req, res){
  res.status(200).render('pages/home', {title: 'Intellectual Investor', footer: 'About the Developers'});
}

//----------Get Data from Database for Watchlist
function buildWatchList(req,res){
  let SQL = `SELECT * FROM investment_info`;
  
  client.query(SQL)
    .then(results => {
      let dataBaseInfo = results.rows;
      console.log(dataBaseInfo);
      res.render('pages/watchlist', { output: dataBaseInfo, title: 'Your Watchlist', footer: 'Home'});
    }).catch(err => console.log(err));
}

//----------Add Stock to Watchlist
function addStock(req,res){

  const SQL = 'INSERT INTO investment_info (companyName, symbol, sentimentResult, sector,current_price) VALUES ($1, $2, $3,$4,$5) RETURNING *';
  let userInput = req.body
  console.log(req.body)
  const param = [userInput.companyName,userInput.symbol,userInput.sentimentResult,userInput.sector,userInput.current_price]
  
  client.query(SQL, param) // information being stored in database
  .then(result =>{
    let finalOutput = result.rows[0]
    console.log(finalOutput)
    res.render('/pages/watchlist', {output:finalOutput, title: 'Your Watchlist', footer: 'Home'} )
  })
  .catch(()=>{
    res.redirect('/pages/watchlist')
  })
};
//----------News, Green, Housing, and Sentiment APIs Below
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
  let url = data[0].website;
  let newURL = url.replace('http://', '');
  // let newURL2 = url.replace("https://", "");
  // console.log('url :',newURL);
  let API = `http://api.thegreenwebfoundation.org/greencheck/${newURL}`;
  return superagent.get(API);
};

function getHousingData(data){
    // console.log(data);
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
}

function getSentimentData(data){
  return fetch("https://microsoft-text-analytics1.p.rapidapi.com/sentiment", {
    "method": "POST",
    "headers": {
      "x-rapidapi-host": "microsoft-text-analytics1.p.rapidapi.com",
      "x-rapidapi-key": "a4c90cc7bamshb0b1ddff9e9141cp1a01c1jsn6fa1375e0872",
      "content-type": "application/json",
      "accept": "application/json"
    },
    "body": JSON.stringify(data)
  })
  .then(response => response.json())
  .catch(err => {
    console.log(err);
  });
}

//----------Stock info Constructor
function StockDetails(data){
  this.symbol = typeof(data.symbol) !== 'undefined' ?  (data.symbol) : ""
  this.companyName = typeof(data.companyName) !== 'undefined' ? (data.companyName) : ""
  this.sector = typeof(data.sector) !== 'undefined' ? (data.sector) : ""
  this.state = typeof(data.state) !=='undefined' ? data.state : ""
  this.zip = typeof(data.zip) !=='undefined' ? data.zip : ""
  this.current_price = typeof(data.price) !=='undefined' ? data.price : ""
}

//----------Add Stock to Database
function insertStocks(req, res) {
  console.log('////////////////////////Proof of life line 324: ////////////////////////', process.env.PORT);
  let API = `https://financialmodelingprep.com/api/v3/quotes/nyse?apikey=${process.env.STOCK_API}`;
  
  superagent
  .get(API)
  .then(apiData => {
    console.log('////////////////////////Proof of life line 328: ////////////////////////', process.env.PORT);
    let stockInfo = apiData.body;
    console.log('////////////////////////stock info line 329: ////////////////////////');

    stockInfo.forEach( rawData => {
      // console.log("Data In: ", rawData);
      const SQL = `
      INSERT INTO stock_info (companyname, symbol, current_price, day_low, day_high) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING * ;`;
      const safeQuery = [rawData.name, rawData.symbol, rawData.price, rawData.dayLow, rawData.dayHigh];
        client
        .query(SQL, safeQuery)

    });

  })
    
}

//----------Puts all Stocks in Database Table
function viewSQL(req, res){
  const SQL = `Select * from stock_info;`;

  client
  .query(SQL)
  .then((data) => {
    res.send(data.rows);

  }).catch(error => console.log(error));

}



// function Headlines(data)

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
