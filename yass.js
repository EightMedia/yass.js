var YASS = (function(win, doc) {
  var yass_attr = 'data-yass',
    visible_class = 'yass-ready',
    srcset_attr = win.YASS_ATTRIBUTE || 'srcset',

  // shortcuts
    docEl = doc.documentElement,
    screen = win.screen,

  // collect all instances
    instances = [],

  // media query input data
    media = {};


  /**
   * SrcSet object per obj in the document
   * @param obj
   * @constructor
   */
  function SrcSet(obj) {
    var self = this;

    this.obj = obj;

    this.candidates = null;
    this.has_srcset = obj.getAttribute(srcset_attr);

    obj.setAttribute(yass_attr, true);

    this.collectCandidates();
    this.update();

    // initial we hide the obj with css.
    // when the obj is loaded we will show it, also after a timeout,
    // because sometimes the obj is already loaded (like from cache)
    addEvent(obj, "load", function() {
      self.show();
    });
    setTimeout(function() {
      self.show();
    }, 500);
  }


  SrcSet.prototype = {

    /**
     * parse the srcset attribute as an array
     */
    collectCandidates: function() {
      // already got the candidates
      if(this.candidates || !this.has_srcset) {
        return;
      }

      this.candidates = [];

      // read the srcset attribute
      var attr = this.obj.getAttribute(srcset_attr),
        parts = attr.split(/\s*,\s*/g);

      // walk the srcsets and collect the properties
      for(var i = 0; i < parts.length; i++) {
        var props = parts[i].split(" "),
          values = {
            src: props.shift(),
            w: 0,
            h: 0,
            x: 1
          };

        for(var p = 0; p < props.length; p++) {
          values[props[p].slice(-1)] = parseFloat(props[p]);
        }

        this.candidates.push(values);
      }

      // also append the initial obj to the set
      if(this.obj.src) {
        this.candidates.push({
          src: this.obj.src,
          w: 0,
          h: 0,
          x: 1
        });
      }


      // sort srcsets from high to low
      this.candidates.sort(function(a,b) {
        if(a.x > b.x) { return -1; }
        if(a.x < b.x) { return 1; }

        if(a.w > b.w) { return -1; }
        if(a.w < b.w) { return 1; }

        if(a.h > b.h) { return -1; }
        if(a.h < b.h) { return 1; }

        return 1;
      });
    },


    /**
     * get the src matching current viewport
     */
    getSrc: function() {
      var c, i;
      for(i = 0; i < this.candidates.length; i++) {
        c = this.candidates[i];

        if(c.x <= media.density &&
          (c.w === 0 || c.w < media.width) &&
          (c.h === 0 || c.h < media.height)) {
          return c.src;
        }
      }

      // return the smallest, probarly the initial
      return c.src;
    },


    /**
     * show the obj
     */
    show: function() {
      if(this.obj.className.indexOf(visible_class) === -1) {
        this.obj.className += ' ' + visible_class;
      }

      if(this.obj.naturalWidth) {
        this.obj.width = this.obj.naturalWidth;
        this.obj.height = this.obj.naturalHeight;
      }
    },


    /**
     * update the obj
     */
    update: function() {
      // only if the obj still exists
      if(this.obj.parentNode && this.has_srcset) {
        var new_src = this.getSrc();
        if(this.obj.src != new_src) {
          this.obj.src = new_src;
        }
        this.show();
      }
    }
  };


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
    return obj.attachEvent("on" + event, fn);
  }


  /**
   * update all images to match their srcset
   */
  function update() {
    getMediaProperties();
    for(var i = 0, len = instances.length; i < len; i++) {
      instances[i].update();
    }
  }


  /**
   * look at the document for new images and register these
   */
  function registerImages() {
    // create instances
    var imgs = doc.images;
    for(var i = 0, len = imgs.length; i < len; i++) {
      if(imgs[i].getAttribute(srcset_attr)) {
        instances.push(new ImageSrcSet(imgs[i]));
      }
    }
  }


  /**
   * get media properties to test the srcSet values
   */
  function getMediaProperties() {
    media = {
      width: win.innerWidth || docEl.clientWidth || screen.width,
      height: win.innerHeight || docEl.clientHeight || screen.height,
      density: win.devicePixelRatio || 1
    };
  }


  // initial magic
  getMediaProperties();
  registerImages();


  // update on resize
  var resize_timer;
  addEvent(win, "resize", function() {
    clearTimeout(resize_timer);
    resize_timer = setTimeout(update, 100);
  });


  // on orientation change
  addEvent(win, "orientationchange", update);


  /**
   * you can also create new instances, so you can create things like responsive iframes
   * by default it returns an update and register method
   *
   * @param [obj=null]
   */
  return function(obj) {
    if(obj) {
      var inst = new SrcSet(obj);
      instances.push(inst);
      return inst;
    }
    registerImages();
    return update();
  };
})(window, document);