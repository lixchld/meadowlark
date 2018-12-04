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

var credential = require('./credential.js');

var app = express();
app.engine( 'handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set( 'port', process.env.PORT || 3000 );

app.use( require('cookie-parser')(credential.cookieSecret));

app.use( require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: credential.cookieSecret,
}) );

app.use(express.static(__dirname + '/public'));

app.use( require('body-parser')() );

app.use(function(req, res, next){
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});

app.use(function(req, res, next){
    res.locals.showTests = app.get('env') !== 'production' &&
         req.query.test === '1';
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

// for now, we're mocking NewsletterSignup:
function NewsletterSignup(){
}
NewsletterSignup.prototype.save = function(cb){
	cb();
};

app.post('/newsletter', function(req, res){
    var name = req.body.name || '', email = req.body.email || '';

    if( !email.match(VALID_EMAIL_REGEX)){
        if(req.xhr) return res.json( { error: 'Invalid anme email address.'});
        req.session.flash = {
            type: 'danger',
            intro: 'Validation error!',
            message: 'The email adress you entered was not valid.',
        };
        return res.redirect(303, '/newsletter/archive');
    }

    new NewsletterSignup({
        name: name,
        email: email,
    }).save( function(err){
        if(err){
            if(req.xhr) return res.json( {error: 'Database error.'});
            req.session.flash = {
                type: 'danger',
                intro: 'Database error!',
                message: 'There was a database error; please try again later.',
            };
            return res.redirect(303, '/newsletter/archive');
        }

        if( req.xhr) return res.json( {sucess: true});
        req.session.flash = {
            type: 'success',
            intro: 'Thank you',
            message: 'You have now been signed up for the newsletter.',
        };

        return res.redirect(303, '/newsletter/archive');
    });
})

app.get('/newsletter/archive', function(req, res){
	res.render('newsletter/archive');
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