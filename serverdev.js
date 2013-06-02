var express = require('express'),
	path = require('path'),
    http = require('http'),
	albums = require('./routes/albums');

var app = express();

app.configure(function () {
	app.set('port', process.env.PORT || 3000);
	if (process.env.NODE_ENV !== 'test') {
		app.use(express.logger('dev'));
	}
	app.use(express['static'](path.join(__dirname, 'public')));
});

app.get(/^\/albums\/past-(\d+)-days$/, albums.daysback);
app.get(/^\/albums\/([a-zA-Z]{3})-(\d{4})-to-([a-zA-Z]{3})-(\d{4})$/, albums.daterange);

module.exports = app;
if (!module.parent) {
	http.createServer(app).listen(app.get('port'), function () {
		console.log("Express server listening on port " + app.get('port'));
	});
}
