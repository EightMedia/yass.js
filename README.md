yass.js
=========

Yet Another SrcSet implementation. Simple and lightweight.

### How to use it

Add yass.js just after the last img tag on your page. 
Yass works from a mobile-first perspective, so the properties are seen as a minimal value. ([So isnt valid with the W3 proposed syntax](http://www.w3.org/html/wg/drafts/srcset/w3c-srcset/#adaptive-images))
So 500w should be visible on a 500px or wider screen.

The order of the queries is not important, these are sorted by Yass. To force the update of the (including new) images, just call `YASS()` in your code.

````html
<img src="small.png" 
  srcset="medium.png 500w, small@2x.png 2x, large.png 1000w, large@2x.png 1000w 2x">
````

You can also use it without the loading of the `src`, and provide a `noscript` fallback.

````html
<img srcset="small.png, medium.png 500w, small@2x.png 2x, large.png 1000w, large@2x.png 1000w 2x">
<noscript><img src="medium.png"></noscript>
````

### CSS trick

For slightly better user experience you can add some css to hide the images with a srcset onload.
Yass sets the image to `visibility: visible` when loaded. So with a simple line of css you can hide the srcset images:

````css
img[srcset] { visibility: hidden; }
````

Check the /demo directory for a sample implementation.

### Notes

Yass.js is small, under 500bytes when minified and gzipped...

Tested in Chrome 28, Android 4.2, IOS6, BlackBerry10 and IE6. Should work on most/all browsers.
