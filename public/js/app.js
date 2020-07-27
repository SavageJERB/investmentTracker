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
    $('main').animate({marginLeft: '40%', opacity: 0.3}, 600);
    $('nav').animate({marginLeft: '0vw'}, 600);
    $('.header').animate({marginLeft: '10%'}, 600);
    // $('deatils').setAttr('open');
})


$('main').click('click', () => {
    $('main').animate({marginLeft: '10%', opacity: 1}, 600);
    $('nav').animate({marginLeft: '-17vw'}, 600);
    $('.header').animate({marginLeft: '5%'}, 600);
})


