var express = require('express');
var handlebars = require('express-handlebars').create( {defaultLayout:'main'} );
var fortune = require('./lib/fortune.js');

var app = express();
app.engine( 'handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set( 'port', process.env.PORT || 3000 );

app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next){
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    next();
});

app.get('/', function(req, res){
    //res.type('text/plain');
    //res.send('Meadowlark Travel');
    res.render('home');
});

app.get('/about', function(req, res){
    //res.type('text/plain');
    //res.send('About Meadowlark Travel');
    res.render('about', {
        fortune:fortune.getFortune(),
        pageTestScript: '/qa/tests-about.js'
    });
});

app.use( function(req, res, next){
    //res.type('text/plain');
    //res.status(404);
    //res.send('404 - Not found');
    res.status(404);
    res.render('404');
});

app.use(function(err, req, res){
    console.error(err.statck);
    //res.type('text/plain');
    //res.status(500);
    //res.send('500 - Server Error');
    res.status(500);
    res.render('500');
});

app.listen( app.get('port'), function(){
    console.log('Express started on http://localhost:' + 
    app.get('port') + '; press Ctrl-C to terminate.');
});