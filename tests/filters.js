process.env.NODE_ENV = 'test';

var http = require('http'),
	phantom = require('phantom'),
	should = require('should'),
	mongo = require('mongodb'),
	app = require('../serverdev');

var port = 4000;
	timeout = 8000;
	delay1 = 500;
	delay2 = 700;
	delay3 = 1500;

describe('Filters', function () {
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
					"url" : "http://www.metacritic.com/music/guzo/samuel-yirga",
					"title" : "Guzo",
					"artist" : "Samuel Yirga",
					"release_date" : date,
					"score" : 78,
					"critic_number" : 7,
					"summary" : "The Ethiopian pianist melds American jazz, funk, and his native music together on his debut release.",
					"image_url" : "http://static.metacritic.com/images/products/music/6/a30c189a32058279988ea50b8250f520-98.jpg",
					"genres" : ["Jazz", "International"],
					"record_label" : "Real World Records"
				});

				date.setDate(date.getDate() - 1);

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

				date.setDate(date.getDate() - 1);

				collection.insert({
					"url" : "http://www.metacritic.com/music/the-predicting-machine/john-tejada",
					"title" : "The  Predicting Machine",
					"artist" : "John Tejada",
					"release_date" : date,
					"score" : 71,
					"critic_number" : 5,
					"summary" : "This the ninth solo release from the Austria-born, California-based techno producer.",
					"image_url" : "http://static.metacritic.com/images/products/music/0/226359bde3252a04ec84df4acd017a8e-98.jpg",
					"genres" : ["Club/Dance"],
					"record_label" : "Kompakt"
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

	it('should have the score range 70-100, critics 10+ on page load',
		function(done) {
			setTimeout(function() {
				page.evaluate(function() {
					return [
						$('#score-slider').slider('values', 0),
						$('#score-slider').slider('values', 1),
						$('#critic-slider').slider('value')];
				}, function(result) {
					result[0].should.equal(70);
					result[1].should.equal(100);
					result[2].should.equal(10);
					done();
				});
			}, delay1);
	});

	it('should have no genres selected, "include" and "release date" selected on page load',
		function(done) {
			setTimeout(function() {
				page.evaluate(function() {
					return [
						$('#filters select').select2('val'),
						$('#filters .radio-field[data-value="include"]').hasClass('checked'),
						$('#filters .radio-field[data-value="exclude"]').hasClass('checked'),
						$('#filters .radio-field[data-value="date"]').hasClass('checked'),
						$('#filters .radio-field[data-value="score"]').hasClass('checked')];
				}, function(result) {
					result[0].should.be.empty;
					result[1].should.be.true;
					result[2].should.be.false;
					result[3].should.be.true;
					result[4].should.be.false;
					done();
				});
			}, delay1);
	});

	it('should show all items when score range set 0-100, critics set 0+',
		function(done) {
			setTimeout(function() {
				page.evaluate(function() {
					$('#score-slider').slider('values', [0, 100]);
					$('#critic-slider').slider('value', 0);
					$('#filters select').select2('val', '').trigger('change');
				});
			}, delay1);
			setTimeout(function() {
				page.evaluate(function() {
					return $('.item:not(.isotope-hidden)').length;
				}, function(result) {
					result.should.equal(3);
					done();
				});
			}, delay2);
	});

	it('should filter items correctly when score range is changed',
		function(done) {
			setTimeout(function() {
				page.evaluate(function() {
					$('#score-slider').slider('values', [75, 79]);
					$('#critic-slider').slider('value', 0);
					$('#filters select').select2('val', '').trigger('change');
				});
			}, delay1);
			setTimeout(function() {
				page.evaluate(function() {
					var $result = $('.item:not(.isotope-hidden)');
					return [
						$result.length,
						$result.data('score')];
				}, function(result) {
					result[0].should.equal(1);
					result[1].should.be.within(75, 79);
					done();
				});
			}, delay2);
	});

	it('should filter items correctly when min critic reviews is changed',
		function(done) {
			setTimeout(function() {
				page.evaluate(function() {
					$('#score-slider').slider('values', [0, 100]);
					$('#critic-slider').slider('value', 30);
					$('#filters select').select2('val', '').trigger('change');
				});
			}, delay1);
			setTimeout(function() {
				page.evaluate(function() {
					var $result = $('.item:not(.isotope-hidden)');
					return [
						$result.length,
						$result.data('critic-number')];
				}, function(result) {
					result[0].should.equal(1);
					result[1].should.be.above(30);
					done();
				});
			}, delay2);
	});

	it('should filter items correctly when genres are included',
		function(done) {
			setTimeout(function() {
				page.evaluate(function() {
					$('#score-slider').slider('values', [0, 100]);
					$('#critic-slider').slider('value', 0);
					$('#filters select').select2('val', ['Jazz','Club/Dance']).trigger('change');
					$('#filters .radio-field[data-value="include"]').click();
				});
			}, delay1);
			setTimeout(function() {
				page.evaluate(function() {
					var $results = $('.item:not(.isotope-hidden)');
					return [
						$results.length,
						$($results[0]).data('genres'),
						$($results[1]).data('genres')];
				}, function(result) {
					result[0].should.equal(2);
					result[1].should.match(/.*(Jazz|Club\/Dance).*/);
					result[2].should.match(/.*(Jazz|Club\/Dance).*/);
					done();
				});
			}, delay2);
	});

	it('should filter items correctly when genres are excluded',
		function(done) {
			setTimeout(function() {
				page.evaluate(function() {
					$('#score-slider').slider('values', [0, 100]);
					$('#critic-slider').slider('value', 0);
					$('#filters select').select2('val', ['Jazz','Club/Dance']).trigger('change');
					$('#filters .radio-field[data-value="exclude"]').click();
				});
			}, delay1);
			setTimeout(function() {
				page.evaluate(function() {
					var $result = $('.item:not(.isotope-hidden)');
					return [
						$result.length,
						$result.data('genres')];
				}, function(result) {
					result[0].should.equal(1);
					result[1].should.not.match(/.*(Jazz|Club\/Dance).*/);
					done();
				});
			}, delay2);
	});

	it('should sort items correctly when "release date" is selected',
		function(done) {
			setTimeout(function() {
				page.evaluate(function() {
					$('#score-slider').slider('values', [0, 100]);
					$('#critic-slider').slider('value', 0);
					$('#filters select').select2('val', '').trigger('change');
					$('#filters .radio-field[data-value="date"]').click();
				});
			}, delay1);
			setTimeout(function() {
				page.evaluate(function() {
					var $results = $('.item:not(.isotope-hidden)')
						.sort(function(a, b) {
							var regex = /matrix\(\d+\.?\d*, \d+\.?\d*, \d+\.?\d*, \d+\.?\d*, (\d+\.?\d*), (\d+\.?\d*)\)/i;
							var aMatches = ($(a).css('transform')).match(regex);
							var bMatches = ($(b).css('transform')).match(regex);

							var ydiff = aMatches[2] - bMatches[2];

							if (ydiff === 0) {
								return aMatches[1] - bMatches[1];
							}
							return ydiff;
						});
					return [
						$($results[0]).data('release-date'),
						$($results[1]).data('release-date'),
						$($results[2]).data('release-date')];
				}, function(result) {
					var date1 = new Date(result[0]),
						date2 = new Date(result[1]),
						date3 = new Date(result[2]);

					date1.should.be.above(date2);
					date2.should.be.above(date3);
					done();
				});
			}, delay3);
	});

	it('should sort items correctly when "metascore" is selected',
		function(done) {
			setTimeout(function() {
				page.evaluate(function() {
					$('#score-slider').slider('values', [0, 100]);
					$('#critic-slider').slider('value', 0);
					$('#filters select').select2('val', '').trigger('change');
					$('#filters .radio-field[data-value="score"]').click();
				});
			}, delay1);
			setTimeout(function() {
				page.evaluate(function() {
					var $results = $('.item:not(.isotope-hidden)')
						.sort(function(a, b) {
							var regex = /matrix\(\d+\.?\d*, \d+\.?\d*, \d+\.?\d*, \d+\.?\d*, (\d+\.?\d*), (\d+\.?\d*)\)/i;
							var aMatches = ($(a).css('transform')).match(regex);
							var bMatches = ($(b).css('transform')).match(regex);

							var ydiff = aMatches[2] - bMatches[2];

							if (ydiff === 0) {
								return aMatches[1] - bMatches[1];
							}
							return ydiff;
						});
					return [
						$($results[0]).data('score'),
						$($results[1]).data('score'),
						$($results[2]).data('score')];
				}, function(result) {
					result[0].should.be.above(result[1]);
					result[1].should.be.above(result[2]);
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