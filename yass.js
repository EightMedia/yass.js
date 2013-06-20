/**
 * Yet Another SrcSet implementation.
 * https://github.com/EightMedia/yass.js
 */
var YASS = (function(win, doc) {
    var yass_attr = 'data-yass';
    var srcset_attr = 'srcset';

    // collect all instances
    var srcset_instances = [];

    // media query input data
    var media = {
        width: 0,
        height: 0,
        pxratio: 1
    };


    // dont do anything if srcset is implemented in the browser!
    if(srcset_attr in new Image()) {
        return function() {};
    }


    /**
     * ImageSrcSet object per image in the document
     * @param image
     * @constructor
     */
    function ImageSrcSet(image) {
        var self = this;

        this.image = image;
        this.id = generateId();

        this.srcset = null;

        this.image.setAttribute(yass_attr, this.id);

        // initial we hide the image with css.
        // when the image is loaded we will show it, also after a timeout,
        // because sometimes the image is already loaded (like from cache)
        addEvent(this.image, "load", function() { self.show(); });
        setTimeout(function(){ self.show(); }, 500);


        this.getSrcSet();
    }

    ImageSrcSet.prototype = {

        /**
         * get the srcset value as an array
         * @returns [array]
         */
        getSrcSet : function() {
            // already got the srcset
            if(this.srcset) {
                return this.srcset;
            }

            this.srcset = [];

            // read the srcset attribute
            var attr = this.image.getAttribute(srcset_attr);
            if(attr) {
                splitted = attr.split(/\s*,\s*/g).reverse();

                // walk the srcsets and collect the properties
                for (var i=0,len=splitted.length; i<len; i++) {
                    var props = splitted[i].split(" "),
                        keyval = {
                            src: props.shift(),
                            w: 0,
                            h: 0,
                            x: 1
                        };

                    for(var p=0; p<props.length; p++) {
                        keyval[props[p].slice(-1)] = parseFloat(props[p]);
                    }

                    this.srcset.push(keyval);
                }
            }

            // also append the initial image to the set
            this.srcset.push({
                src: this.image.src,
                w: 0,
                h: 0,
                x: 1
            });


            // sort srcsets from high to low
            this.srcset.sort(function(a,b) {
                if(a.x > b.x) { return -1; }
                if(a.x < b.x) { return 1; }

                if(a.w > b.w) { return -1; }
                if(a.w < b.w) { return 1; }

                if(a.h > b.h) { return -1; }
                if(a.h < b.h) { return 1; }

                return 1;
            });

            return this.srcset;
        },


        /**
         * get the src matching current viewport
         */
        getSrc : function() {
            for(var i=0; i<this.srcset.length; i++) {
                var s = this.srcset[i];

                if(s.x <= media.pxratio &&
                    (s.w === 0 || s.w < media.width) &&
                    (s.h === 0 || s.h < media.height)) {
                    return s.src;
                }
            }

            // return the smallest, probarly the initial
            return s.src;
        },


        /**
         * show the image
         */
        show : function() {
            this.image.style.visibility = 'visible';
        },


        /**
         * update the image
         */
        update : function() {
            // only if the image still exists
            if(this.image.parentNode) {
                this.image.src = this.getSrc();
                this.show();
            }
        }
    };



    /**
     * image id generator
     * @type {number}
     */
    var last_id = 0;
    function generateId() {
        return last_id++;
    }


    /**
     * add event listeners
     * @param   {object}    obj
     * @param   {string}    event
     * @param   {Function}  fn
     */
    function addEvent(obj, event, fn) {
        if(obj.addEventListener) {
            return obj.addEventListener(event, fn, false);
        }
        return obj.attachEvent("on"+ event, fn);
    }


    /**
     * update all images to match their srcset
     * @param   {array}     [imgs]
     */
    function update() {
        media = {
            width : win.innerWidth ? win.innerWidth : win.screen.width,
            height : win.innerHeight ? win.innerHeight : win.screen.height,
            pxratio : win.devicePixelRatio || 1
        };

        for(var i= 0,len=srcset_instances.length; i<len; i++) {
            srcset_instances[i].update();
        }

        return srcset_instances;
    }


    /**
     * look at the document for new images and register these
     */
    function registerImages() {
        // create instances
        var imgs = doc.images;
        for(var i= 0,len=imgs.length; i<len; i++) {
            if(!imgs[i].hasAttribute(yass_attr)) {
                srcset_instances.push(new ImageSrcSet(imgs[i]));
            }
        }
    }


    registerImages();
    update();


    // update on resize
    var resize_timer;
    addEvent(win, "resize", function() {
        clearTimeout(resize_timer);
        resize_timer = setTimeout(update, 25);
    });


    // on orientation change
    addEvent(win, "orientationchange", update);


    // return an update and register method
    return function() {
        registerImages();
        return update();
    };
})(window, document);