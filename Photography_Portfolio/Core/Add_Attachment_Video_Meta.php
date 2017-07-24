<?php


namespace Photography_Portfolio\Core;


//-----------------------------------*/
// Add attachment meta for attachment Video URL
//-----------------------------------*/
class Add_Attachment_Video_Meta {


	/**
	 * Add_Attachment_Video_Meta constructor.
	 */
	public function __construct() {

		add_filter( 'attachment_fields_to_edit', [ $this, 'show_video_field' ], 25, 2 );
		add_action( 'edit_attachment', [ $this, 'store_meta' ] );

	}


	public function show_video_field( $form_fields, $post ) {

		$field_value              = get_post_meta( $post->ID, '_attachment_video_url', true );
		$form_fields['video_url'] = array(
			'value' => $field_value ? $field_value : '',
			'label' => esc_html__( 'Video URL', 'phort-instance' ),
			'input' => 'text',
		);

		return $form_fields;
	}


	public function store_meta( $attachment_id ) {

		if ( isset( $_REQUEST['attachments'][ $attachment_id ]['video_url'] ) ) {
			$video_url = $_REQUEST['attachments'][ $attachment_id ]['video_url'];
			update_post_meta( $attachment_id, '_attachment_video_url', $video_url );
		}
	}


}