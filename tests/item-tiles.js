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
	delay4 = 2000;

describe('Item tiles', function () {
	this.timeout(timeout);
	var browser, page, server;
	var date = new Date();

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
					"release_date" : date,
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

	it('should show the front of a tile with correct artist name, title, score and image',
		function(done) {
			setTimeout(function() {
				page.evaluate(function() {
					var $firstItemFront = $('.item:first-child .item-front');
					return [
						$firstItemFront.is(':visible'),
						$('h3:first-child', $firstItemFront).text(),
						$('h3:last-child', $firstItemFront).text(),
						$('.score-box', $firstItemFront).text(),
						$('img', $firstItemFront).attr('src')];
				}, function(result) {
					result[0].should.be.true;
					result[1].should.equal('Ty Segall');
					result[2].should.equal('Twins');
					parseInt(result[3], 10).should.equal(80);
					result[4].should.equal('http://static.metacritic.com/images/products/music/3/27d9f6ba19c98298dedcaf6b29db41ad-98.jpg');
					done();
				});
			}, delay1);
	});

	it('should not show the back of a tile on page load', function(done) {
		setTimeout(function() {
			page.evaluate(function() {
				var $firstItem = $('.item:first-child');
				return $('.item-back', $firstItem).is(':visible');
			}, function(result) {
				result.should.be.false;
				done();
			});
		}, delay1);
	});

	it('should show the back of a tile when clicked',
		function(done) {
			setTimeout(function() {
				page.evaluate(function() {
					$('.item:first-child .item-front').click();
				});
			}, delay1);
			setTimeout(function() {
				page.evaluate(function() {
					var $firstItem = $('.item:first-child');
					return $('.item-back', $firstItem).is(':visible');
				}, function(result) {
					result.should.be.true;
					done();
				});
			}, delay2);
	});

	it('should show the correct details on the back of a tile',
		function(done) {
			setTimeout(function() {
				page.evaluate(function() {
					var $firstItemBack = $('.item:first-child .item-back');
					return [
						$('.panel-header a:first-child h2', $firstItemBack).text(),
						$('.panel-header a:last-child h2', $firstItemBack).text(),
						$('.image-box img', $firstItemBack).attr('src'),
						$('.score-box', $firstItemBack).text(),
						$('h3:contains("Summary:") + p', $firstItemBack).text(),
						$('h3:contains("Reviews:") + p a', $firstItemBack).attr('href'),
						$('h3:contains("Reviews:") + p a', $firstItemBack).text(),
						$('h3:contains("Record Label:") + p', $firstItemBack).text(),
						$('h3:contains("Genre(s):") + p', $firstItemBack).text()];
				}, function(result) {
					result[0].should.equal('Twins');
					result[1].should.equal('Ty Segall');
					result[2].should.equal('http://static.metacritic.com/images/products/music/3/27d9f6ba19c98298dedcaf6b29db41ad-98.jpg');
					parseInt(result[3], 10).should.equal(80);
					result[4].should.match(/^This is the San Francisco rock singer's third release in 2012.*$/);
					result[5].should.equal('http://www.metacritic.com/music/twins/ty-segall/critic-reviews');
					parseInt(result[6].match(/^(\d+) critics on Metacritic$/), 10).should.equal(31);
					result[7].should.equal('Drag City');
					result[8].should.equal('Pop/Rock, Alternative/Indie Rock, Indie Rock');
					done();
				});
			}, delay1);
	});

	var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	it('should show the correct release date on the back of the tile in the right format',
		function(done) {
			setTimeout(function() {
				page.evaluate(function() {
					return $('.item:first-child .item-back h3:contains("Release Date:") + p').text();
				}, function(result) {
					var regex = /^(\d{1,2}) (\w{3}), (\d{4})$/;
					var matches = result.match(regex);

					parseInt(matches[1], 10).should.equal(date.getDate());
					matches[2].should.equal(monthNames[date.getMonth()]);
					parseInt(matches[3], 10).should.equal(date.getFullYear());
					done();
				});
			}, delay1);
	});

	it('should hide the open tile back when the close button is clicked', function(done) {
		setTimeout(function() {
			page.evaluate(function() {
				$('.item:first-child .item-front').click();
			});
		}, delay1);
		setTimeout(function() {
			page.evaluate(function() {
				$('.item:first-child .item-back .close-button').click();
			});
		}, delay2);
		setTimeout(function() {
			page.evaluate(function() {
				return $('.item:first-child .item-back').is(':visible');
			}, function(result) {
				result.should.be.false;
				done();
			});
		}, delay3);
	});

	it('should hide the open tile back when the overlay is clicked', function(done) {
		setTimeout(function() {
			page.evaluate(function() {
				$('.item:first-child .item-front').click();
			});
		}, delay1);
		setTimeout(function() {
			page.evaluate(function() { $('#overlay').click(); });
		}, delay2);
		setTimeout(function() {
			page.evaluate(function() {
				return $('.item:first-child .item-back').is(':visible');
			}, function(result) {
				result.should.be.false;
				done();
			});
		}, delay3);
	});

	it('should hide the open tile back when the escape key is pressed', function(done) {
		setTimeout(function() {
			page.evaluate(function() {
				$('.item:first-child .item-front').click();
			});
		}, delay1);
		setTimeout(function() {
			page.sendEvent('keypress', 16777216);
		}, delay2);
		setTimeout(function() {
			page.evaluate(function() {
				return $('.item:first-child .item-back').is(':visible');
			}, function(result) {
				result.should.be.false;
				done();
			});
		}, delay3);
	});

	it('should hide the open tile back and open the info panel when the info button is clicked', function(done) {
		setTimeout(function() {
			page.evaluate(function() {
				$('.item:first-child .item-front').click();
			});
		}, delay1);
		setTimeout(function() {
			page.evaluate(function() { $('#info').click(); });
		}, delay2);
		setTimeout(function() {
			page.evaluate(function() {
				return [
					$('.item:first-child .item-back').is(':visible'),
					$('#info-modal').is(':visible')];
			}, function(result) {
				result[0].should.be.false;
				result[1].should.be.true;
				done();
			});
		}, delay4);
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