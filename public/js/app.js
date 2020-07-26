'use strict'

//----------Sorting Watchlist: Each saved company
$( () => $( "#sortable" ).sortable({axis: "y"}));


//----------Toggle Search By
$('.searchParams').hide();

$('#params').click('click', () => {
    $('.searchByTicker').hide();
    $('.searchParams').show();
})

$('#tickerS').click('click', () => {
    $('.searchByTicker').show();
    $('.searchParams').hide();
})

$('.clickNav').click(nav => {
    $('.navigation').hide();
})

