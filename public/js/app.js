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
    $('.setting').animate({marginLeft: '40%', opacity: 0.3}, 600);
    $('.navigation').animate({marginLeft: '8vw'}, 600);
    $('.header').animate({marginLeft: '10%'}, 600);
})


$('main').click('click', () => {
    $('.setting').animate({marginLeft: '10%', opacity: 1}, 600);
    $('.navigation').animate({marginLeft: '-19%'}, 600);
    $('.header').animate({marginLeft: '2%'}, 600);
})


