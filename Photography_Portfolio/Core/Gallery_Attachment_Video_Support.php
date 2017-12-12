<?php


namespace Photography_Portfolio\Core;


//-----------------------------------*/
// Add attachment meta for attachment Video URL
//-----------------------------------*/
class Gallery_Attachment_Video_Support {


	/**
	 * Gallery_Attachment_Video_Support constructor.
	 */
	public static function maybe_add_hooks() {


		// Only enable video meta if lightgallery is selected
		$has_video_support = apply_filters(
			'phort/attachment/video_enabled',
			( phort_get_option( 'popup_gallery' ) == 'lightgallery' )
		);

		if ( $has_video_support ) {
			add_filter( 'attachment_fields_to_edit', [ __CLASS__, 'show_video_field' ], 25, 2 );
			add_action( 'edit_attachment', [ __CLASS__, 'store_meta' ] );
		}


	}


	public static function show_video_field( $form_fields, $post ) {

		$field_value              = get_post_meta( $post->ID, '_attachment_video_url', true );
		$form_fields['video_url'] = [
			'value' => $field_value ? $field_value : '',
			'label' => esc_html__( 'Video URL', 'phort-instance' ),
			'input' => 'text',
		];

		return $form_fields;
	}


	public static function store_meta( $attachment_id ) {

		if ( isset( $_REQUEST['attachments'][ $attachment_id ]['video_url'] ) ) {
			$video_url = $_REQUEST['attachments'][ $attachment_id ]['video_url'];
			update_post_meta( $attachment_id, '_attachment_video_url', $video_url );
		}
	}


}