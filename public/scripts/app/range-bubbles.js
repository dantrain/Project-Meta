define(['jquery', 'domReady!'], function ($) {
	var minpos = 13,	// Magic numbers for aligning the range bubbles.
		maxpos = 264,
		$scoreMinBubble = $('#score-min-bubble-inner'),
		$scoreMaxBubble = $('#score-max-bubble-inner'),
		$scoreMinArrow = $('#score-min-bubble-arrow'),
		$scoreMaxArrow = $('#score-max-bubble-arrow'),
		$criticsBubble = $('#critic-bubble-inner'),
		$criticsArrow = $('#critic-bubble-arrow'),
		$scoreMinHandle,
		$scoreMaxHandle,
		$criticsHandle;

	return {
		score: function () {
			// Cache jQuery selections.
			$scoreMinHandle = $scoreMinHandle || $('#score-slider a:nth-child(2)');
			$scoreMaxHandle = $scoreMaxHandle || $('#score-slider a:nth-child(3)');

			var minsliderpos = parseFloat($scoreMinHandle.css('left').replace('px', ''));
			var maxsliderpos = parseFloat($scoreMaxHandle.css('left').replace('px', ''));

			var minbubblepos = Math.min(Math.max(minsliderpos, minpos), maxpos) + 'px';
			var maxbubblepos = Math.min(Math.max(maxsliderpos, minpos), maxpos) + 'px';

			$scoreMinBubble.css('left', minbubblepos);
			$scoreMinArrow.css('left', minsliderpos);

			$scoreMaxBubble.css('left', maxbubblepos);
			$scoreMaxArrow.css('left', maxsliderpos);
		},

		critics: function () {
			// Cache jQuery selection.
			$criticsHandle = $criticsHandle || $('#critic-slider a');

			var sliderpos = parseFloat($criticsHandle.css('left').replace('px', ''));

			var bubblepos = Math.min(Math.max(sliderpos, minpos), maxpos) + 'px';

			$criticsBubble.css('left', bubblepos);
			$criticsArrow.css('left', sliderpos);
		}
	};
});