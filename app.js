
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var mongoose = require('mongoose');
var request = require('request');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var oh = require('apac').OperationHelper;

var app = express();

var opHelper = require('./config.js').make(oh);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost/litobserver');

var BookSchema = new mongoose.Schema({
	id: String,
	ASIN: String,
	ISBN: String,
	title: String,
	author: String,
	authors: [{firstName: String, lastName: String}],
	group: String, 
	coverurl: String,
	series: String,
	number: Number,
	review: String,
	pubdate: Date,
}),
	Books = mongoose.model('Book', BookSchema);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//INDEX

app.all("/", function(req, res){

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

	Books.find({}).sort("authors[0].lastName").exec(function(err, docs) {
		res.render("books.jade", {lists: [{title:"All Books", books: docs}]});	
	});
});

// ADD ALBUM

app.all('/search', function(req, res){

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

	if (!req.query.p) {page = "1";}
	else {page = req.query.p;}

	query = req.query.q;

	opHelper.execute('ItemSearch', 
		{
  			'SearchIndex': 'Books',
  			'ItemPage': page,
  			'Keywords': query,
  			'ResponseGroup': 'ItemAttributes,Images,EditorialReview'
		}, 
		function(results) { // you can add a second parameter here to examine the raw xml response

			var books = [];
			results = results.ItemSearchResponse.Items[0].Item;
			//for (i = 0; i < results.length; ++i) {
			//	if (results[i].ItemAttributes[0].ProductGroup == "Book") {
			//		books.push(results[i].Item);
			//	}
			//}
    	
    		res.send(results);
		}
	);
});


app.get('/demo', function(req, res){
		opHelper.execute('ItemSearch', 
		{
  			'SearchIndex': 'Books',
  			'Author': 'Tad Williams',
  			'ResponseGroup': 'ItemAttributes,Images,EditorialReview'
		}, 
		function(results) { // you can add a second parameter here to examine the raw xml response

			var books = new Array();
			results = results["ItemSearchResponse"]["Items"]
			for (i = 0; i < results.length; ++i) {
    			books.push(results[i]["Item"]);
			}
    	
    		res.send(books);
		});

});

app.post('/add', function(req,res){
	b=req.body
	if( typeof b.book === 'string' ) {
    	b.book = [ b.book ];
	}
	itemList = b.book.join(",")

	opHelper.execute('ItemLookup', 
		{
  			'ItemId': itemList,
  			'ResponseGroup': 'ItemAttributes,Images,EditorialReview'
		}, 
		function(results) { // you can add a second parameter here to examine the raw xml response

			var books = new Array();
			results = results["ItemLookupResponse"]["Items"][0]["Item"]
			for (i = 0; i < results.length; ++i) {
				//if (results[i]["ItemAttributes"][0]["ProductGroup"] == "Book") {
	    			books.push(
	    				new Books({
							ASIN: results[i]["ASIN"],
							ISBN: results[i]["ItemAttributes"][0]["ISBN"],
							title: results[i]["ItemAttributes"][0]["Title"],
							author: results[i]["ItemAttributes"][0]["Author"],
							group:  results[i]["ItemAttributes"][0]["ProductGroup"],
							coverurl: results[i]["LargeImage"] ? results[i]["LargeImage"][0]["URL"] : "", 
							review: results[i]["EditorialReviews"] ? results[i]["EditorialReviews"][0]["EditorialReview"][0]["Content"] : ""
	    				})	
	    			);
	    		//}
			}
    		
    		//res.send(results)
    		res.render("azsearch_add.jade", {books: books});
		});
})

app.post('/save', function(req,res){
	b=req.body
	books=[]

	for (i = 0; i < b.book.length; ++i) {

		// Construct Author-Object
		authorsString = b.book[i]["author"].split(", ");
		authors = []
		if( typeof authorsString === 'string' ) {
    		authorsString = [ authorsString ];
		}
		authorsString.forEach(function(author){
			authorString = author.split("#");
			authors = authors + [{firstName: authorString[0], lastName: authorString[1]}]
		});


		cur_book = new Books({
				ASIN: b.book[i]["ASIN"],
				ISBN: b.book[i]["ISBN"],
				title: b.book[i]["title"],
				authors: authors,
				series: b.book[i]["series"],
				number: b.book[i]["number"],
				group:  b.book[i]["group"],
				coverurl: b.book[i]["coverurl"],
				review: b.book[i]["review"]
			})
		books.push(cur_book)
		cur_book.save()
	}

	res.redirect("/")
})


app.get('/demo2', function(req, res){
		opHelper.execute('ItemSearch', 
		{
  			'SearchIndex': 'Books',
  			'Author': 'Tad Williams',
  			'ResponseGroup': 'ItemAttributes,Images,EditorialReview'
		}, 
		function(results) { // you can add a second parameter here to examine the raw xml response

			var books = new Array();
			results = results["ItemSearchResponse"]["Items"]
			for (i = 0; i < results.length; ++i) {
    			books.push(results[i]);
			}
    	
    		res.send(results);
		});

});


app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
