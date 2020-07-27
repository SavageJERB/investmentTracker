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

//----------Toggle Menu
$('.fa-bars').click('click', () => {
    $('.navigation').animate({marginLeft: '8vw'}, 600);
    $('.setting').animate({marginLeft: '40%'}, 600);
})


$('main').click('click', () => {
    $('.navigation').animate({marginLeft: '-19%'}, 600);
    $('.setting').animate({marginLeft: '10%'}, 600);
})


