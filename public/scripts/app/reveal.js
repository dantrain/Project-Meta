define(['jquery'], function($) {
	/**
	 * Factory for the filters pane reveal animation method.
	 * @param {!Object} modal Contains the global modal state (open, closing etc.).
	 * @return {function()} Triggers the reveal.
	 */
	return function (modal) {
		var $modal = $('#filters');
		var $bodyandhtml = $('body, html');

		var open = function () {
			modal.isOpen = true;
			modal.close = close;	// Set the close method, defined below.
			modal.closingPromise = null;	// Ensure modal can be closed without delay.

			// Try and prevent the body from scrolling while the modal is open.
			// Doesn't seem to work on iOS for now.
			$bodyandhtml.addClass('is-not-scrollable');

			// Trigger the CSS transitions after a tiny delay.
			setTimeout(function () {
				$modal.removeClass('is-invisible-mobile').addClass('is-revealed');
			}, 50);
		};

		/**
		 * @return {Promise} Allows you to wait for the closing to complete before opening another modal.
		 */
		var close = function () {
			var dfd = $.Deferred();
			modal.closingPromise = dfd.promise();

			if (modal.isOpen) {
				$modal.removeClass('is-revealed');

				// Wait for the css transitions to finish.
				setTimeout(function () {
					$bodyandhtml.removeClass('is-not-scrollable');
					$modal.addClass('is-invisible-mobile');
					modal.isOpen = false;

					dfd.resolve();
				}, 300);
			} else {
				// Already closed, resolve promise immediately.
				dfd.resolve();
			}

			return dfd.promise();
		};

		return function (dataIn, eventIn) {
			var prevTarget = modal.target;
			modal.target = eventIn.currentTarget;

			// Check if trying to open a different modal to one already open.
			// If so, close that modal first.
			if (modal.isOpen && modal.target !== prevTarget) {
				modal.close().done(open);
			} else if (modal.isOpen && modal.target === prevTarget) {
				// If trying to reopen the same modal, close it.
				// Unless it is already closing! Then wait for it to close and reopen it.
				if (modal.closingPromise !== null) {
					modal.closingPromise.done(open);
				} else {
					close();
				}
			} else {
				open();
			}
		};
	};
});