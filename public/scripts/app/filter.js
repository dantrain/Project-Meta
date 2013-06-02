define(['jquery', 'jquery.isotope.min'], function($) {
	var $body = $('html, body');
	var $items, $noresults;

	/**
	 * Filters the items based on the UI controls.
	 * @param {!Object} data Comes from the 'filter' computed observable on the model.
	 */
	var doFilter = function (data) {
		// Cache jQuery selections.
		$items = $items || $('.items');
		$noresults = $noresults || $('#no-results-container');

		$items.isotope({
			filter: function() {
				var $this = $(this);

				var score = parseInt($this.data('score'), 10);
				var criticno = parseInt($this.data('criticNumber'), 10);

				// Check for matches in genre data, using some jQuery utility functions.
				var genreintersect = $.grep($this.data('genres').split(','), function(element) {
					return $.inArray(element, data.genrefilter) > -1;
				});

				var genrefilter;

				if (data.genreswitch === 'exclude') {
					genrefilter = genreintersect.length === 0;
				} else {
					genrefilter = data.genrefilter.length > 0 ? genreintersect.length > 0 : true;
				}

				return score >= data.scorerange[0] &&
					score <= data.scorerange[1] &&
					// Metacritic only assign scores when there are over 4 reviews.
					criticno >= Math.max(4, data.criticreviews) &&
					genrefilter;
			},

			sortBy: data.sortby,
			sortAscending: false
		});

		if (!$items.data('isotope').$filteredAtoms.length) {
			// Show a message if there are no results.
			$noresults.delay(600).fadeIn(500);
		} else {
			$noresults.fadeOut(200);
		}
	};

	return function(data) {
		// Scroll to the top before filtering to see the isotope animations properly.
		if ($('body').scrollTop() !== 0 || $('html').scrollTop() !== 0) {
			$body.animate({ scrollTop: 0 }, 200, 'swing', function () {
				doFilter(data);
			});
		} else {
			doFilter(data);
		}
	};
});