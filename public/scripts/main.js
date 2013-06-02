requirejs.config({
    baseUrl: 'scripts/lib',
    paths: {
        app: '../app'
    },
    waitSeconds: 30
});

requirejs([
	'app/view-model',
	'app/filter',
	'app/range-bubbles',
	'knockout-2.2.1',
	'jquery',
	'jquery-ui-1.10.2.custom',
	'app/binding-handlers',
	'domReady!'],

function(ViewModel, filter, bubbles, ko, $) {
	var daysback = 60,	// Default number of days of data to retrieve.
		viewModel = new ViewModel();

	ko.applyBindings(viewModel);

	// Draw the range bubbles.
	bubbles.score();
	bubbles.critics();

	$('#filters').removeClass('is-invisible');

	// Sign up the range bubbles to update when model changes.
	viewModel.scorerange.subscribe(bubbles.score);
	viewModel.criticreviews.subscribe(bubbles.critics);
	viewModel.maxcriticreviews.subscribe(bubbles.critics);

	// Lower the amount to data to be retrieved based on screen width.
	// Mobiles and tablets tend to struggle with more data.
	if (window.screen.width <= 1024) {
		daysback = 35;
		if (window.screen.width <= 320) {
			daysback = 25;
		}
	}

	// Call the REST API for data.
	$.getJSON('/albums/past-' + daysback + '-days')
	.done(function(data) {
		// Update the model with the retrieved data.
		viewModel.genres(data.genres.sort());
		viewModel.albums(data.items);

		$('#loading-container').hide();
		$('#items').removeClass('is-invisible');

		// Subscribe the filter method to changes made to the filter controls.
		viewModel.filter.subscribe(filter);
	})
	.fail(function() {
		$('#loading-container').html(
			'<p>Problem connecting to the database</p>' +
			'<p>Oh god how did this get here I am not good with computer</p>');
	});
});
