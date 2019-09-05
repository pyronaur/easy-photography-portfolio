<?php
namespace Photography_Portfolio\Contracts;


/**
 * Class Item
 * @package Easy_Photography_Portfolio\Frontend\Layout\Single
 */
interface Render_Inline_Attribute {
	/**
	 * Output HTML data="" attribute
	 */
	public function render();
}
