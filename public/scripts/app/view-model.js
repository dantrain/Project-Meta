define(['app/flip', 'app/swing', 'app/reveal', 'knockout-2.2.1', 'jquery'], function(flip, swing, reveal, ko, $) {
	/**
	 * The View Model.
	 * @constructor
	 */
	return function() {
		var self = this;

		self.albums = ko.observableArray();
		self.scorerange = ko.observableArray([70, 100]);
		self.criticreviews = ko.observable(10);
		self.genres = ko.observableArray();
		self.genrefilter = ko.observableArray();
		self.genreswitch = ko.observable('include');
		self.sortby = ko.observable('date');

		// Contains the global modal state (open, closing etc.).
		self.modal = {
			isOpen: false,
			closingPromise: null
		};

		// Closes the open modal if it's not already closing.
		self.closeModal = function () {
			if (typeof self.modal.close === 'function' && self.modal.closingPromise === null) {
				self.modal.close();
			}
		};

		// Closes modals on pressing Esc, but throttled to prevent mashing the key.
		var throttle = false;

		$(document).on('keyup', function (e) {
			if (e.keyCode === 27 && !throttle) {
				throttle = true;
				setTimeout(function () { throttle = false; }, 500);
				self.closeModal();
			}
		});

		// Build and register the methods for the animated transitions.
		self.flip = flip(self.modal);
		self.swing = swing(self.modal);
		self.reveal = reveal(self.modal);

		// External website search strings for showing in the 'Search on:' list.
		// Note '{artist}' and '{title}' are replaced with regex in the item template.
		var services = [
			{ name: 'iTunes', string: 'http://itunes.com/{artist}/{title}', separator: '' },
			{ name: 'Google Play', string: 'https://play.google.com/store/search?q={artist}+{title}&c=music', separator: '+' },
			{ name: 'Last.fm', string: 'http://www.last.fm/search?q={artist}+{title}&from=ac', separator: '+'},
			{ name: 'Spotify', string: 'spotify:search:artist:{artist}+album:{title}', separator: '+' },
			{ name: 'Grooveshark', string: 'http://grooveshark.com/#!/search/album?q={artist}+{title}', separator: '+' },
			{ name: 'Rdio', string: 'http://www.rdio.com/search/{artist}%20{title}/albums/', separator: '%20' }
		];

		// Hidden feature for defining your own services with HTML5 Web Storage.
		if (Modernizr.localstorage) {
			var userServices = localStorage["services"];

			if (typeof userServices !== 'undefined') {
				services = services.concat(JSON.parse(userServices));
			}
		}

		self.services = ko.observableArray(services);

		// Computed observable for the highest number of critic reviews for an item in the data.
		self.maxcriticreviews = ko.computed(function() {
			var albums = self.albums();

			if (albums.length === 0) {
				return 40;		// Default when no data so the critic reviews slider looks okay.
			}

			return Math.max.apply(Math, albums.map(function(item) {
				return item.critic_number;
			}));
		});

		// Consolidate the filter properties into one observable.
		// Throttled to trigger filtering after a slight delay while dragging sliders.
		self.filter = ko.computed(function() {
			return {
				scorerange: self.scorerange(),
				criticreviews: self.criticreviews(),
				genrefilter: self.genrefilter(),
				genreswitch: self.genreswitch(),
				sortby: self.sortby()
			};
		}).extend({ throttle: 150 });
	};
});