define([
	'knockout-2.2.1',
	'jquery',
	'jquery.isotope.min',
	'jquery-ui-1.10.2.custom',
	'jquery.ui.touch-punch.min',
	'select2.min'],

function(ko, $) {
	/**
	 * Factory function for binding jQuery UI sliders.
	 * @param {boolean|string} range Sets the range option on the slider widget.
	 *								http://api.jqueryui.com/slider/#option-range
	 */
	var makeSliderBinding = function(range) {
		var accessor = range === true ? 'values' : 'value';

		return {
			init: function(element, valueAccessor, allBindingsAccessor) {
				var options = { range: range };
				// Include the options specified in the template.
				$.extend(options, allBindingsAccessor().slideroptions);
				$(element).slider(options);

				ko.utils.registerEventHandler(element, 'slide', function (event, ui) {
					var observable = valueAccessor();
					observable(ui[accessor]);
				});

				ko.utils.registerEventHandler(element, 'slidechange', function (event, ui) {
					var observable = valueAccessor();
					observable(ui[accessor]);
				});

				ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
					$(element).slider('destroy');
				});
			},

			update: function (element, valueAccessor) {
				var value = ko.utils.unwrapObservable(valueAccessor());
				$(element).slider(accessor, value);
			}
		};
	};

	ko.bindingHandlers.rangeslider = makeSliderBinding(true);
	ko.bindingHandlers.maxslider = makeSliderBinding('max');

	// For setting the max critic reviews to the highest in the data.
	ko.bindingHandlers.slidermaxval = {
		update: function (element, valueAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor());
			$(element).slider("option", "max", value);
		}
	};

	ko.bindingHandlers.select2 = {
		init: function(element, valueAccessor) {
			$(element).select2(valueAccessor()).show();

			ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
				$(element).select2('destroy');
			});
		},

		update: function(element) {
			$(element).trigger('change');
		}
	};

	ko.bindingHandlers.isotopeBinding = {
		update: function(element, valueAccessor) {
			if (valueAccessor()().length > 0 ) {
				$(element).isotope({
					getSortData: {
						// Retrieve items' score and release-date from their data attributes
						// to allow sorting.
						score: function($elem) {
							return parseInt($elem.data('score'), 10);
						},

						date: function($elem) {
							return new Date($elem.data('release-date'));
						}
					}
				});
			}
		}
	};

	ko.bindingHandlers.radioButton = {
		init: function(element, valueAccessor) {
			var $element = $(element);

			$('.radio-button', $element)
			.on('selectstart dragstart mousedown', function() {
				// Prevent click + drag text selection.
				return false;
			})
			.css({
				'MozUserSelect': 'none',
				'msUserSelect': 'none',
				'webkitUserSelect': 'none',
				'userSelect': 'none'
			})
			.mousedown(function () {
				$(this).addClass('active');
			})
			.mouseup(function () {
				$(this).removeClass('active');
			})
			.mouseleave(function () {
				$(this).removeClass('active');
			});

			ko.utils.registerEventHandler(element, 'click', function () {
				if (!$element.hasClass('checked')) {
					// Set the value using the element's data-value attribute.
					valueAccessor()($element.data('value'));
				}
			});
		},

		update: function(element, valueAccessor) {
			var $element = $(element);
			if ($element.data('value') === valueAccessor()()) {
				$element.addClass('checked');
			} else {
				$element.removeClass('checked');
			}
		}
	};
});