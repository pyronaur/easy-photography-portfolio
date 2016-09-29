<?php
namespace Photography_Portfolio\Frontend\Contracts;


/**
 * Class Item
 * @package Photography_Portfolio\Frontend\Layout\Single
 */
interface Render_Inline_Attribute {
	/**
	 * Output HTML data="" attribute
	 */
	public function render();
}