function schemaBook(mongoose) {
	return new  mongoose.Schema({
		id: Number,
		ASIN: String,
		ISBN: String,
		title: String,
		otitle: String,
		authors: [Number],
		coverurl: String,
		series: String,
		number: Number,
		publisher: String,
		pages: Number,
		pubdate: Date,
		lang: String,
		olang: String,
		startDate: Date,
		endDate: Date,
		rating: Number,
		status: Number,
		genre: String,
		tags: [Number],
		notes: [{note:String, date:Date}],
		quotes: [{quote:String, source:String}],
		links: [{desc:String, url: String}]
	});
}

function schemaAuthor(mongoose) {
	return new  mongoose.Schema({
		id: Number,
		firstName: String,
		middleName: String,
		lastName: String,
		pic: String,
		about: String,
		links: [{desc:String, url: String}],
		notes: [{note:String, date:Date}],
		tags: [Number],
	});
}

function schemaList(mongoose) {
	return new  mongoose.Schema({
		id: Number,
		type: Number,
		title: String,
		desc: String,
		pic: String,
		books: [Number],
		genre: String,
		about: String,
		links: [{desc:String, url: String}],
		notes: [{note:String, date:Date}],
		tags: [Number]
	});
}

function schemaTag(mongoose) {
	return new mongoose.schema({
		id: Number,
		name: String
	});
}

module.exports.schemaBook = schemaBook;
module.exports.schemaAuthor = schemaAuthor;
module.exports.schemaList = schemaList;
module.exports.schemaTag = schemaTag;