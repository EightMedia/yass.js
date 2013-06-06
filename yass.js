/**
 * Yet Another SrcSet implementation.
 * https://github.com/EightMedia/yass.js
 */
var YASS = (function(win, doc) {

    /**
     * add event listeners
     * @param   {object}    obj
     * @param   {string}    event
     * @param   {Function}  fn
     */
    function addEvent(obj, event, fn) {
        if(obj.addEventListener) {
            obj.addEventListener(event, fn, false);
        }
        else {
            obj.attachEvent("on"+ event, fn);
        }
    }


    /**
     * parse the srcset and show the correct img
     * @param   {Image}     image
     * @returns {string}    src
     */
    function getImgSrc(image) {
        var sets,
            srcset = image.getAttribute('srcset'),
            default_src = image.getAttribute('srcset-default');

        // no srcset found
        if(!srcset) {
            return default_src || image.src;
        }

        // split them
        sets = srcset.split(",");

        for (var i=0,len=sets.length; i<len; i++) {
            var src = sets[i].match(/[^\s]+/)[0],
                width = (sets[i].match(/(\d+)w/) || [0,1])[1],
                pxratio = (sets[i].match(/([.0-9]+)x/) || [0,1])[1];

            if (device_width >= width && pxratio <= device_pxratio) {
                return src;
            }
        }

        // Default to the default src one
        return default_src;
    }


    /**
     * update all images to match their srcset
     * @param   {array}     [imgs]
     */
    function updateImages(imgs) {
        if(imgs) {
            images = imgs;
        }

        // This is getting the device width
        device_width = (win.innerWidth > 0) ? win.innerWidth : win.screen.width;

        for(var i= 0,len=images.length; i<len; i++) {
            var img = images[i];

            var new_src = getImgSrc(img);
            if(img.src == new_src) {
                img.style.visibility = 'visible';
            }

            img.src = new_src;
        }
    }


    var device_width,
        device_pxratio = win.devicePixelRatio || 1,
        images = doc.images;

    // store the initial src
    for(var i= 0,len=images.length; i<len; i++) {
        var img = images[i];
        img.setAttribute('srcset-default', img.src);
        addEvent(img, "load", function() {
            this.style.visibility = 'visible';
        });
    }

    updateImages();

    // update on resize
    addEvent(win, "resize", updateImages);
    addEvent(win, "orientationchange", updateImages);


    return updateImages;
})(window, document);