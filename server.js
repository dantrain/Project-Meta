var express = require('express'),
	connect = require('connect'),
	path = require('path'),
    http = require('http'),
	albums = require('./routes/albums');

var app = express();

app.configure(function () {
	app.set('port', process.env.PORT || 3000);
	app.use(express.logger('dev'));
	app.use(connect.compress());
	app.use(express['static'](path.join(__dirname, 'public-built')));
});

app.get(/^\/albums\/past-(\d+)-days$/, albums.daysback);
app.get(/^\/albums\/([a-zA-Z]{3})-(\d{4})-to-([a-zA-Z]{3})-(\d{4})$/, albums.daterange);

http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});