=== Easy Photography Portfolio ===
Contributors: colormelon, justnorris
Donate link: http://colormelon.com/
Tags: portfolio, photography, gallery, grid, masonry, themeable, album, content gallery, fullscreen gallery, gallery, gallery lightbox, gallery widget, grid gallery, image gallery, masonry gallery, media gallery, photo album, photo gallery, portfolio gallery, post gallery, responsive gallery, thumbnail gallery, video gallery, wordpress gallery, wordpress gallery plugin, youtube gallery, easy photography portfolio, easy
Requires at least: 4.6.0
Tested up to: 4.7.0
Stable tag: 1.1.1
License: GPLv3 or later
License URI: http://www.gnu.org/licenses/gpl-3.0.html

Easy Photography Portfolio is an elegant plugin designed for Photographers. Install the plugin, add portfolio entries and you have a portfolio!

== Description ==

Building a photography portfolio for WordPress should be easy. So we made a plugin to help you with that!


### Quick Overview
Easy Photography Portfolio is based on the idea of albums with images that can optionally be grouped in categories!
By default, albums and images are displayed in a masonry  layout. You open up an album to see all the images. then click on an image to look at it closer.
I think it might be easier to explain with a demo.

Have a look: **[Easy Photography Portfolio Demo](http://default.portfolio.bycolormelon.com/)** with default settings and "Twenty Seventeen Theme".

Here is a quick overview of the plugin and the setup process of that demo site:
https://www.youtube.com/watch?v=MKDWnxmcRWA


### Designed for Photographers

We love the WordPress community and wholeheartedly agree with the [WordPress Philosophy](https://wordpress.org/about/philosophy/).

Great software should work out of the box, without the user having to adjust oceans of buttons and knobs.
That's why Photography Portfolio is designed to be as easy to use as possible.

Photography Portfolio plugin is founded upon years of experience in building Premium Wordpress Themes for Photographers. We've seen it all, great and not-so-great websites, big names, and absolute beginners. We have crystallized the formula of a high-quality portfolio into a simple WordPress plugin that you can use with any WordPress theme or your custom WordPress site!

It all comes down to the simple structure of a real Portfolio book.

You own a Portfolio album for, let's say your Wedding Photography. If you happen to do street Photography too, you also probably have another album that has only your best street photography prints.

That's exactly what Photography Portfolio does for you online. You create albums, add images, and in case you have a huge portfolio, you can categorize albums too.

Then your visitors are able to open any album, quickly scan all of the images, or view them one by one. Simplicity is key!


### Our Story
We have been designing WordPress Portfolio themes for Photographers for years. In that time we've distilled the simplest and most effective ways of building an online Portfolio.

We decided that it is long overdue to give back to the community. So we built a reliable plugin that anyone can use, be it a new Photographer, an existing Customer, or a Developer. At the same time we built the Photography Portfolio Plugin so that we can use it ourselves for our existing customers, yet making it flexible enough so that it can be used in any theme.



### Developed for Extensibility

Out of the box, Photography Portfolio is built using Masonry Layout (think Pinterest). Quite simply - it's the layout most easily portable to any website layout while keeping the feel of the brand.

**Warning**: Strong developer language ahead.
For some, a masonry layout might not be enough, it sure isn't enough for our Photography WordPress themes, because of that, this plugin is packed with Actions and Filters. Not only in PHP but also the JavaScript side.
You can easily extend the plugin with your own custom archive and single-view layouts. Customization is easy as Photography Portfolio plugin templates are based on `get_template_part()` function, similar to the way WooCommerce plugin has a custom template function. That brings a lot of customization power to the table. Pick any part of the view, and append your own template bits or completely rewrite the templates.

The JavaScript side is also very opinionated and easily extensible. You can use filters and actions to either modify the existing functionality, for example modifying the core masonry layout just a bit or completely initialize a brand new layout (like Packery or Horizontal Scroll). If you decide to build a custom view, you can utilize the existing JavaScript hook structure to let the plugin handle all the little things for you.




### WordPress Themes
We also build premium [WordPress themes for Photographers](https://colormelon.com). Have a look at our *Portfolio* and maybe you fall in love with one of them!

Because our business is to build WordPress themes, **this is not "Photography Portfolio Lite"** with a billion up-sells. This is a fully featured Photography Portfolio plugin with albums, images, categories, a Pop-up gallery and even video support.

We respect our users and believe that one can recognize quality on their own, without being bombarded with constant "buy extra functionality" junk. We know we build awesome *ship*, now you know it too. You can have a look at our premium stuff when you feel like it, if not - that's cool too. Especially if you're just starting out, you might have to cut some corners and bootstrap everything on your own, and even then, we truly believe this plugin is going to do wonders for you! Pick a simple minimalistic theme, install the plugin, and enjoy a clean portfolio website that you can grow on your own!


== Frequently Asked Questions ==

= Is this plugin on Github ? =

Of course it is! Have a look here: https://github.com/justnorris/easy-photography-portfolio

= Any examples on how to extend or integrate the plugin in my theme? =
More to come in time. For now, there is this wiki article: https://github.com/justnorris/easy-photography-portfolio/wiki/Useful-Snippets

== Installation ==

**This plugin requires at least PHP 5.4**

1. Upload "Photography Portfolio" plugin to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to "Pages -> Add New" and create a page for your portfolio. Call it "Whatever you like" :)
4. Go to "Portfolio -> Portfolio Settings" and set "Portfolio Page" to the page you called "Whatever you like"
5. Add a few Portfolio entries in "Portfolio -> New Portfolio Entry", don't forget to set a thumbnail!
6. That's it! Enjoy your Portfolio!



== Changelog ==
= 1.1.1 =
* Make sure images have 100% max width, some themes don't do that by default
* Add actions for to make it easier to tap into the templates: `phort/{archive|gallery}/loop/{start|end}`

= 1.1.0 =
* Make sure all top level template wrappers utilize `phort_class()`
* More elaborate plugin settings with dropdowns instead of checkboxes
* Add permalink class `.PP_Entry__permalink`

= 1.0.9 =
* Always make sure an image exists before trying to display it

= 1.0.8 =
* Add function `phort_is_front_page()`
* Add play button overlay on videos
* Validate layouts before returning `phort_slug_current()` value

= 1.0.7 =
* Correctly set-up postdata in single portfolio layouts
* Revolutionary new UI when creating a new portfolio entry ( fixed subtitle alignment )
* Hide layout setting dropdowns if there are no layouts to choose from.
* Clarify code and comments
* By default load 100 portfolio entries. If you need more, you're responsible for displaying them properly. Why would you need a portfolio with more than 100 albums ?
* Remove filter `phort/get_template`.
* Introduce filter `phort/get_template/{$base}`
* Allow themes/plugins to modify EPP Defaults


= 1.0.5 =
* Fix broken portfolio links
* Improve JavaScript hooks
* Other minor improvements

= 1.0.0 =
* First Release!