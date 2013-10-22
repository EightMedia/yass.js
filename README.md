yass.js
=========

Yet Another SrcSet implementation.


### How to use it

Add yass.js just after the last img tag on your page.
Yass works from a mobile-first perspective, so the properties are seen as a minimal value.
So 500w should be visible on a 500px or wider screen.

The order of the queries is not important, these are sorted by Yass. To force the update of the (including new) images, just call `YASS()` in your code.

#### Simple img tag with srcset
This may cause 2 requests for a image, when it matches one in the srcset.
````html
<img src="small.png"
  srcset="medium.png 500w, small@2x.png 2x, large.png 1000w, large@2x.png 1000w 2x">
````

#### Img tag with noscript fallback
Now only the image that matches the device/viewport is loaded, and non-js users (also spiders)
will get the fallback between the `noscript` tags. With a library like [Modernizr](http://modernizr.com) you can hide
the images for non-js users.

````html
<img srcset="small.png, medium.png 500w, small@2x.png 2x, large.png 1000w, large@2x.png 1000w 2x">
<noscript><img src="medium.png"></noscript>
````
````css
.no-js img[srcset] { display: none; }
````


### API

`YASS([obj], [options], [callback])`
One method with multiple functions. When called without arguments it updates all current instances of Yass, and searches and updates new images.
The return value will be all YassSrcSet instances.

You can pass an object that will be updated. This must be a valid DOM object. You can pass options (see below), and a callback which is called each time the src will be changed.
The return value will be the created instance.

#### Options
You can set these properties for all instances, by setting these on `window.YASS_OPTIONS` before including `yass.js`.

##### ready_class: 'yass-ready'
ClassName to be set on the element when it has been Yassified

##### src_attr: 'src'
Property to set. This can be anything, most times `src`, but can also be `poster` etc..

##### srcset_attr: 'srcset'
Property to read the candidates from



### CSS trick

For slightly better user experience you can add some css to hide the images with a srcset onload.
Yass gives the img the class `yass-ready` when loaded. So with a simple line of css you can hide the srcset images:

````css
img[srcset] { visibility: hidden; }
img.yass-ready { visibility: visible; }
````

Check the /demo directory for a sample implementation.


### Notes

Yass.js is small, under 500bytes when minified and gzipped...

Tested in Chrome 28, Android 4.2, IOS6, BlackBerry10 and IE6. Should work on most/all browsers.
