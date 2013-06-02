define(['jquery'], function($) {
	/**
	 * Factory for the swing open, fall off screen animation method.
	 * @param {!Object} modal Contains the global modal state (open, closing etc.).
	 * @return {function()} Triggers the swing/fall.
	 */
	return function (modal) {
		var event, $modal;
		var $overlay = $('#overlay');
		var $modalContainer = $('#modal-container');

		var open = function () {
			modal.isOpen = true;
			modal.close = close;	// Set the close method, defined below.
			modal.closingPromise = null;	// Ensure modal can be closed without delay.

			// Look up the correct modal div from the clicked link's id.
			$modal = $('#' + event.currentTarget.id + '-modal');
			$overlay.show();

			// Trigger the CSS transitions after a tiny delay.
			setTimeout(function () {
				$overlay.addClass('is-semitransparent');
				$modal.addClass('is-swinging');
				$modalContainer.show();
			}, 50);
		};

		/**
		 * @return {Promise} Allows you to wait for the closing to complete before opening another modal.
		 */
		var close = function () {
			var dfd = $.Deferred();
			modal.closingPromise = dfd.promise();

			if (modal.isOpen) {
				$overlay.removeClass('is-semitransparent');
				$modal.removeClass('is-swinging').addClass('is-falling');

				// Wait for the css transitions to finish.
				setTimeout(function () {
					$overlay.hide();
					$modalContainer.hide();
					$modal.removeClass('is-falling');
					modal.isOpen = false;

					dfd.resolve();
				}, 400);
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