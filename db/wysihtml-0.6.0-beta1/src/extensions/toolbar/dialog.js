/**
 * Toolbar Dialog
 *
 * @param {Element} link The toolbar link which causes the dialog to show up
 * @param {Element} container The dialog container
 *
 * @example
 *    <!-- Toolbar link -->
 *    <a data-wysihtml-command="insertImage">insert an image</a>
 *
 *    <!-- Dialog -->
 *    <div data-wysihtml-dialog="insertImage" style="display: none;">
 *      <label>
 *        URL: <input data-wysihtml-dialog-field="src" value="http://">
 *      </label>
 *      <label>
 *        Alternative text: <input data-wysihtml-dialog-field="alt" value="">
 *      </label>
 *    </div>
 *
 *    <script>
 *      var dialog = new wysihtml.toolbar.Dialog(
 *        document.querySelector("[data-wysihtml-command='insertImage']"),
 *        document.querySelector("[data-wysihtml-dialog='insertImage']")
 *      );
 *      dialog.observe("save", function(attributes) {
 *        // do something
 *      });
 *    </script>
 */
(function(wysihtml) {
  var dom                     = wysihtml.dom,
      CLASS_NAME_OPENED       = "wysihtml-command-dialog-opened",
      SELECTOR_FORM_ELEMENTS  = "input, select, textarea",
      SELECTOR_FIELDS         = "[data-wysihtml-dialog-field]",
      ATTRIBUTE_FIELDS        = "data-wysihtml-dialog-field";


  wysihtml.toolbar.Dialog = wysihtml.lang.Dispatcher.extend(
    /** @scope wysihtml.toolbar.Dialog.prototype */ {
    constructor: function(link, container) {
      this.link       = link;
      this.container  = container;
    },

    _observe: function() {
      if (this._observed) {
        return;
      }

      var that = this,
          callbackWrapper = function(event) {
            var attributes = that._serialize();
            that.fire("save", attributes);
            that.hide();
            event.preventDefault();
            event.stopPropagation();
          };

      dom.observe(that.link, "click", function() {
        if (dom.hasClass(that.link, CLASS_NAME_OPENED)) {
          setTimeout(function() { that.hide(); }, 0);
        }
      });

      dom.observe(this.container, "keydown", function(event) {
        var keyCode = event.keyCode;
        if (keyCode === wysihtml.ENTER_KEY) {
          callbackWrapper(event);
        }
        if (keyCode === wysihtml.ESCAPE_KEY) {
          that.cancel();
        }
      });

      dom.delegate(this.container, "[data-wysihtml-dialog-action=save]", "click", callbackWrapper);

      dom.delegate(this.container, "[data-wysihtml-dialog-action=cancel]", "click", function(event) {
        that.cancel();
        event.preventDefault();
        event.stopPropagation();
      });

      this._observed = true;
    },

    /**
     * Grabs all fields in the dialog and puts them in key=>value style in an object which
     * then gets returned
     */
    _serialize: function() {
      var data    = {},
          fields  = this.container.querySelectorAll(SELECTOR_FIELDS),
          length  = fields.length,
          i       = 0;

      for (; i<length; i++) {
        data[fields[i].getAttribute(ATTRIBUTE_FIELDS)] = fields[i].value;
      }
      return data;
    },

    /**
     * Takes the attributes of the "elementToChange"
     * and inserts them in their corresponding dialog input fields
     *
     * Assume the "elementToChange" looks like this:
     *    <a href="http://www.google.com" target="_blank">foo</a>
     *
     * and we have the following dialog:
     *    <input type="text" data-wysihtml-dialog-field="href" value="">
     *    <input type="text" data-wysihtml-dialog-field="target" value="">
     *
     * after calling _interpolate() the dialog will look like this
     *    <input type="text" data-wysihtml-dialog-field="href" value="http://www.google.com">
     *    <input type="text" data-wysihtml-dialog-field="target" value="_blank">
     *
     * Basically it adopted the attribute values into the corresponding input fields
     *
     */
    _interpolate: function(avoidHiddenFields) {
      var field,
          fieldName,
          newValue,
          focusedElement = document.querySelector(":focus"),
          fields         = this.container.querySelectorAll(SELECTOR_FIELDS),
          length         = fields.length,
          i              = 0;
      for (; i<length; i++) {
        field = fields[i];

        // Never change elements where the user is currently typing in
        if (field === focusedElement) {
          continue;
        }

        // Don't update hidden fields
        // See https://github.com/xing/wysihtml5/pull/14
        if (avoidHiddenFields && field.type === "hidden") {
          continue;
        }

        fieldName = field.getAttribute(ATTRIBUTE_FIELDS);
        newValue  = (this.elementToChange && typeof(this.elementToChange) !== 'boolean') ? (this.elementToChange.getAttribute(fieldName) || "") : field.defaultValue;
        field.value = newValue;
      }
    },

    update: function (elementToChange) {
      this.elementToChange = elementToChange ? elementToChange : this.elementToChange;
      this._interpolate();
    },

    /**
     * Show the dialog element
     */
    show: function(elementToChange) {
      var firstField  = this.container.querySelector(SELECTOR_FORM_ELEMENTS);

      this._observe();
      this.update(elementToChange);

      dom.addClass(this.link, CLASS_NAME_OPENED);
      this.container.style.display = "";
      this.isOpen = true;
      this.fire("show");

      if (firstField && !elementToChange) {
        try {
          firstField.focus();
        } catch(e) {}
      }
    },

    /**
     * Hide the dialog element
     */
    _hide: function(focus) {
      this.elementToChange = null;
      dom.removeClass(this.link, CLASS_NAME_OPENED);
      this.container.style.display = "none";
      this.isOpen = false;
    },

    hide: function() {
      this._hide();
      this.fire("hide");
    },

    cancel: function() {
      this._hide();
      this.fire("cancel");
    }
  });
})(wysihtml); //jshint ignore:line
