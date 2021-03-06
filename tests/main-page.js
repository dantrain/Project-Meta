process.env.NODE_ENV = 'test';

var http = require('http'),
	phantom = require('phantom'),
	should = require('should'),
	mongo = require('mongodb'),
	app = require('../serverdev');

var port = 4000;
	timeout = 8000;
	delay1 = 500;
	delay2 = 1000;
	delay3 = 1500;

describe('Main page', function () {
	this.timeout(timeout);
	var browser, page, server;

	before(function(done) {
		mongo.Db.connect('mongodb://localhost/metadb', function(err, db) {
			if (err) {
				throw new Error('Error connecting to mongodb.');
			}

			db.collection('albumstest', function(err, collection) {
				collection.remove();

				collection.insert({
					"url" : "http://www.metacritic.com/music/twins/ty-segall",
					"title" : "Twins",
					"artist" : "Ty Segall",
					"release_date" : new Date(),
					"score" : 80,
					"critic_number" : 31,
					"summary" : "This is the San Francisco rock singer's third release in 2012 (the other two were: Hair with White Fence and Slaughterhouse with his own band).",
					"image_url" : "http://static.metacritic.com/images/products/music/3/27d9f6ba19c98298dedcaf6b29db41ad-98.jpg",
					"genres" : ["Pop/Rock", "Alternative/Indie Rock", "Indie Rock"],
					"record_label" : "Drag City"
				});
			});
		});

		server = http.createServer(app).listen(port);

		phantom.create(function(thebrowser) {
			browser = thebrowser;
			done();
		});
	});

	beforeEach(function(done) {
		browser.createPage(function(thepage) {
			page = thepage;
			page.set('viewportSize',{ width: 1024, height: 768 }, function() {
				page.open('http://localhost:' + port, function(status) {
					done();
				});
			});
		});
	});

	it('should show a loading message', function(done) {
		page.evaluate(function() {
			return [
				$('#loading-container').is(':visible'),
				$('#loading-container').text()];
		}, function(result) {
			result[0].should.be.true;
			result[1].should.match(/\s*Loading...\s*/);
			done();
		});
	});

	it('should hide the loading message after a few seconds', function(done) {
		setTimeout(function() {
			page.evaluate(function() {
				return $('#loading-container').is(':visible');
			}, function(result) {
				result.should.be.false;
				done();
			});
		}, delay2);
	});

	it('should show the filters panel on page load', function(done) {
		setTimeout(function() {
			page.evaluate(function() {
				return $('#filters').css('visibility');
			}, function(result) {
				result.should.equal('visible');
				done();
			});
		}, delay1);
	});

	it('should not show the info panel on page load', function(done) {
		setTimeout(function() {
			page.evaluate(function() {
				return $('#info-modal').is(':visible');
			}, function(result) {
				result.should.be.false;
				done();
			});
		}, delay1);
	});

	it('should show the info panel when the info button is clicked', function(done) {
		setTimeout(function() {
			page.evaluate(function() { $('#info').click(); });
		}, delay1);
		setTimeout(function() {
			page.evaluate(function() {
				return $('#info-modal').is(':visible');
			}, function(result) {
				result.should.be.true;
				done();
			});
		}, delay2);
	});

	it('should hide the open info panel when the close button is clicked', function(done) {
		setTimeout(function() {
			page.evaluate(function() { $('#info').click(); });
		}, delay1);
		setTimeout(function() {
			page.evaluate(function() { $('#info-modal .close-button').click(); });
		}, delay2);
		setTimeout(function() {
			page.evaluate(function() {
				return $('#info-modal').is(':visible');
			}, function(result) {
				result.should.be.false;
				done();
			});
		}, delay3);
	});

	it('should hide the open info panel when the overlay is clicked', function(done) {
		setTimeout(function() {
			page.evaluate(function() { $('#info').click(); });
		}, delay1);
		setTimeout(function() {
			page.evaluate(function() { $('#overlay').click(); });
		}, delay2);
		setTimeout(function() {
			page.evaluate(function() {
				return $('#info-modal').is(':visible');
			}, function(result) {
				result.should.be.false;
				done();
			});
		}, delay3);
	});

	it('should hide the open info panel when the escape key is pressed', function(done) {
		setTimeout(function() {
			page.evaluate(function() { $('#info').click(); });
		}, delay1);
		setTimeout(function() {
			page.sendEvent('keypress', 16777216);
		}, delay2);
		setTimeout(function() {
			page.evaluate(function() {
				return $('#info-modal').is(':visible');
			}, function(result) {
				result.should.be.false;
				done();
			});
		}, delay3);
	});

	it('should hide the open info panel when the info button is clicked', function(done) {
		setTimeout(function() {
			page.evaluate(function() { $('#info').click(); });
		}, delay1);
		setTimeout(function() {
			page.evaluate(function() { $('#info').click(); });
		}, delay2);
		setTimeout(function() {
			page.evaluate(function() {
				return $('#info-modal').is(':visible');
			}, function(result) {
				result.should.be.false;
				done();
			});
		}, delay3);
	});

	afterEach(function() {
		page.close();
	});

	after(function(done) {
		server.close();
		browser.exit();
		setTimeout(function() {
			done();
		}, 500);
	});

});