define(['jquery'], function($) {
	/**
	 * Factory for the tile flip animation method.
	 * @param {!Object} modal Contains the global modal state (open, closing etc.).
	 * @return {function()} Triggers the flip.
	 */
	return function (modal) {
		var $item, $parent, $back, event, offset, left, top;
		var $overlay = $('#overlay');
		var oldBrowser = false;

		var open = function () {
			modal.isOpen = true;
			modal.close = close;	// Set the close method, defined below.
			modal.closingPromise = null;	// Ensure modal can be closed without delay.

			$item = $(event.currentTarget);		// Get the item that was clicked.
			$parent = $item.parent();			// The li element containing the front and back of the tile.
			$back = $item.next();				// The back of the tile.

			// Some lovely regex to find the co-ordinates of the tile as set by Isotope.
			var regex = /matrix\(\d+, \d+, \d+, \d+, (\d+), (\d+)\)/i;
			var matches = ($parent.css('transform')).match(regex);

			if (matches === null) {
				// IE10 transform property looks different.
				regex = /matrix3d\(\d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, \d+, (\d+), (\d+), \d+, \d+\)/i;
				matches = ($parent.css('transform')).match(regex);

				if (matches === null) {
					// Browser doesn't have CSS3 transform property, don't bother with the animation.
					oldBrowser = true;
					$parent.removeClass('isotope-item').addClass('is-flipping is-flipped is-translating');
					$item.hide();
					$overlay.show().addClass('is-semitransparent');
				}
			}

			if (matches !== null) {
				// Find the pixel co-ordinates of the tile relative to the document.
				offset = $('.items').offset();
				left = offset.left + parseInt(matches[1], 10);
				top = offset.top + parseInt(matches[2], 10);

				$parent.removeClass('isotope-item');

				// Change from position: absolute to position: fixed, but don't move!
				$parent.addClass('is-flipping').css({
					'left': left,
					'top': top - $(window).scrollTop()
				});

				// Fade out the rest of the page.
				$overlay.show();

				// Trigger the CSS transitions after a tiny delay.
				setTimeout(function () {
					$overlay.addClass('is-semitransparent');
					$parent.addClass('is-flipped is-translating');
				}, 50);
			}
		};

		/**
		 * @return {Promise} Allows you to wait for the closing to complete before opening another modal.
		 */
		var close = function () {
			var dfd = $.Deferred();
			modal.closingPromise = dfd.promise();

			if (modal.isOpen && !oldBrowser) {
				// Need to reset this as the user may have scrolled the body.
				$parent.css('top', top - $(window).scrollTop());

				$parent.removeClass('is-flipped');
				$overlay.removeClass('is-semitransparent');

				// Wait for the css transitions to finish.
				setTimeout(function () {
					$overlay.hide();
					$parent.removeClass('is-flipping is-translating')
						.css({
							'left': 0,
							'top': 0
						});
					setTimeout(function () {
						$parent.addClass('isotope-item');
						modal.isOpen = false;
						dfd.resolve();
					}, 50);
				}, 400);
			} else if (modal.isOpen && oldBrowser) {
				$parent.removeClass('is-flipping is-flipped is-translating').addClass('isotope-item');
				$item.show();
				$overlay.hide().removeClass('is-semitransparent');
				modal.isOpen = false;
				dfd.resolve();
			} else {
				// Already closed, resolve promise immediately.
				dfd.resolve();
			}

			return dfd.promise();
		};

		return function (dataIn, eventIn) {
			var prevTarget = modal.target;
			modal.target = eventIn.currentTarget;
			event = eventIn;

			// Check if trying to open a different modal to one already open.
			// If so, close that modal first.
			if (modal.isOpen && modal.target !== prevTarget) {
				modal.close().done(open);
			} else {
				open();
			}
		};
	};
});