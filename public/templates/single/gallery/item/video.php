<?php
/*
 * Gallery Item Type: Video
 * @since 1.0.0
 * @modified 1.0.0
 */
/**
 * @var \Photography_Portfolio\Frontend\Gallery\Attachment $attachment
 */
global $attachment;
?>
<div class="video-overlay">
	<?php // Link element will allow this to be clickable in Photoswipe ?>
	<a href="#" class="video-overlay__play-wrapper">
		<svg class="video-overlay__play-button" viewBox="0 0 200 200" alt="Play video">
			<circle cx="100" cy="100" r="90" fill="none" stroke-width="15" stroke="#fff"/>
			<polygon points="70, 55 70, 145 145, 100" fill="#fff"/>
		</svg>
	</a>
</div>

<div class="PP_Gallery__item--video__wrapper js__video-wrapper">
	<?php echo $attachment->get_video(); ?>
</div>