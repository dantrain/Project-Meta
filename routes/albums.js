var mongo = require('mongodb');

var mongoUri = process.env.MONGOLAB_URI ||
	process.env.MONGOHQ_URL ||
	'mongodb://localhost/metadb';

var collectionName = process.env.NODE_ENV === 'test' ? 'albumstest' : 'albums';

mongo.Db.connect(mongoUri, function (err, db) {
	if (!err && process.env.NODE_ENV !== 'test') {
		console.log("Connected to database");
	}
});

exports.daysback = function (req, res) {
	var date = new Date();
	var days = req.params[0] < 100 ? req.params[0] : 100;
	date.setDate(date.getDate() - days);

	mongo.Db.connect(mongoUri, function (err, db) {
		if (err) {
			res.send(503, { error: 'Problem connecting to the database' });
			return;
		}
		db.collection(collectionName, function (err, collection) {
			if (err) {
				res.send(404, { error: 'Problem finding the collection' });
				return;
			}
			collection.find({"release_date" : {$gte: date}}).sort({"release_date": -1})
				.toArray(function (err, items) {
				if (err) {
					res.send(404, { error: 'Problem with date range query' });
					return;
				}
				collection.distinct("genres", {"release_date" : {$gte: date}}, function (err, results) {
					if (err) {
						res.send(404, { error: 'Problem with genres query' });
						return;
					}
					res.send({
						items: items,
						genres: results.filter(function(e) { return e; })
					});
				});
			});
		});
	});
};

var months = {
	jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

exports.daterange = function (req, res) {
	var fromDate = new Date(parseInt(req.params[1], 10), months[req.params[0].toLowerCase()], 1);
	var toDate = new Date(parseInt(req.params[3], 10), months[req.params[2].toLowerCase()], 1);
	toDate.setMonth(toDate.getMonth() + 1);
	mongo.Db.connect(mongoUri, function (err, db) {
		if (err) {
			res.send(503, { error: 'Problem connecting to the database' });
			return;
		}
		db.collection(collectionName, function (err, collection) {
			if (err) {
				res.send(404, { error: 'Problem finding the collection' });
				return;
			}
			collection.find({"release_date" : {$gte: fromDate, $lt: toDate}}).sort({"release_date": -1})
				.toArray(function (err, items) {
				if (err) {
					res.send(404, { error: 'Problem with date range query' });
					return;
				}
				collection.distinct("genres", {"release_date" : {$gte: fromDate, $lt: toDate}}, function (err, results) {
					if (err) {
						res.send(404, { error: 'Problem with genres query' });
						return;
					}
					res.send({
						items: items,
						genres: results.filter(function(e) { return e; })
					});
				});
			});
		});
	});
};
