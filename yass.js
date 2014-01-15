(function YASS(win, doc) {

  var docEl = doc.documentElement,
    screen = win.screen,

    // collect all instances
    instances = [],

    // media query input data
    media = {},

    // default options
    options = merge({
        ready_class: 'yass-ready',
        yass_attr: 'data-yass',
        src_attr: 'src',
        srcset_attr: 'srcset',
        resize_timeout: 50
      }, win.YASS_OPTIONS || {});


  /**
   * SrcSet object per obj in the document
   * @param obj
   * @param [inst_options]
   * @param [callback]
   * @constructor
   */
  function SrcSet(obj, inst_options, callback) {
    var self = this;

    if(inst_options) {
      this.options = merge(options, inst_options);
    } else {
      this.options = options;
    }

    this.callback = callback || function(){};
    this.obj = obj;

    this.candidates = null;
    this.has_srcset = obj.getAttribute(this.options.srcset_attr);

    obj.setAttribute(this.options.yass_attr, true);

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
      var attr = this.obj.getAttribute(this.options.srcset_attr),
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
          src: this.obj[this.options.src_attr],
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
      if(this.obj.className.indexOf(this.options.ready_class) === -1) {
        this.obj.className += ' ' + this.options.ready_class;
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
        if(this.obj.getAttribute(this.options.src_attr) != new_src) {
          this.obj.setAttribute(this.options.src_attr, new_src);
          this.callback.call(this, new_src);
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
   * simple merge objects into a new one
   * @param   {object}  obj1
   * @param   {object}  obj2
   * @returns {object}  merged
   */
  function merge(obj1, obj2) {
    var merged = {};
    for(var key in obj1) {
      merged[key] = obj2[key] || obj1[key];
    }
    return merged;
  }


  /**
   * look at the document for new images and register these
   */
  function registerImages() {
    // create instances
    var imgs = doc.images;
    for(var i = 0, len = imgs.length; i < len; i++) {
      if(imgs[i].getAttribute(options.srcset_attr) && !imgs[i].getAttribute(options.yass_attr)) {
        instances.push(new SrcSet(imgs[i]));
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
   * try to trigger update in an animation frame
   */
  function triggerUpdate() {
    (win.requestAnimationFrame) ? win.requestAnimationFrame(update) : update();
  }


  // initial magic
  getMediaProperties();
  registerImages();


  // update on resize
  var resize_timer;
  addEvent(win, "resize", function() {
    clearTimeout(resize_timer);
    resize_timer = setTimeout(triggerUpdate, options.resize_timeout);
  });


  // on orientation change
  addEvent(win, "orientationchange", triggerUpdate);


  /**
   * you can also create new instances, so you can create things like responsive iframes
   * by default it returns an update and register method
   *
   * @param [obj=null]
   * @param [options=null]
   * @param [callback=null]
   */
  return function(obj, options, callback) {
    if(obj) {
      var inst = new SrcSet(obj, options, callback);
      instances.push(inst);
      return inst;
    }

    registerImages();
    triggerUpdate();
    return instances;
  };
})(window, document);

if(typeof module != 'undefined' && module.exports) {
  module.exports = YASS;
}