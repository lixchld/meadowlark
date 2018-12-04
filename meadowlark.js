var express = require('express');
var handlebars = require('express-handlebars').create( {
    defaultLayout:'main',
    helpers: {
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
} );
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

app.use( require('body-parser')() );

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

app.get('/greeting', function(req, res){
    res.render('about', {
        message: 'welcome',
        style:req.query.style,
        userid: req.cookies.userid,
        username: req.session.username,
    });
});

app.get('/no-layout', function(req, res){
    res.render('no-layout', {layout: null});
});

app.get('/custom-layout', function(req, res){
    res.render('custom-layout', {layout:'custom'});
});

app.get('/test', function(req, res){
    res.type('text/plain');
    res.send('this is a text');
});

app.get('/thank-you', function(req, res){
    res.render('thank-you');
});

app.get('/newsletter', function(req, res){

    res.render('newsletter', {csrf: 'CSRF token goes here'});
});

app.post('/process', function(req, res){
    if(req.xhr || req.accepts('json,html')==='json'){
        res.send({success: true});
    } else {
        console.log('Form (from querystring): ' + req.query.form);
        console.log('CSRF token (from hidden form field):' + req.body._csrf);
        console.log('Name (from visible form field):' + req.body.name);
        console.log('Email (from visible form field:' + req.body.email);
        res.redirect(303, '/thank-you');
    }

})

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