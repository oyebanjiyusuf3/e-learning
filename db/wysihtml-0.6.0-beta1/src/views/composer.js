(function(wysihtml) {
  var dom       = wysihtml.dom,
      browser   = wysihtml.browser;

  wysihtml.views.Composer = wysihtml.views.View.extend(
    /** @scope wysihtml.views.Composer.prototype */ {
    name: "composer",

    constructor: function(parent, editableElement, config) {
      this.base(parent, editableElement, config);
      if (!this.config.noTextarea) {
          this.textarea = this.parent.textarea;
      } else {
          this.editableArea = editableElement;
      }
      if (this.config.contentEditableMode) {
          this._initContentEditableArea();
      } else {
          this._initSandbox();
      }
    },

    clear: function() {
      this.element.innerHTML = browser.displaysCaretInEmptyContentEditableCorrectly() ? "" : "<br>";
    },

    getValue: function(parse, clearInternals) {
      var value = this.isEmpty() ? "" : wysihtml.quirks.getCorrectInnerHTML(this.element);
      if (parse !== false) {
        value = this.parent.parse(value, (clearInternals === false) ? false : true);
      }
      return value;
    },

    setValue: function(html, parse) {
      if (parse !== false) {
        html = this.parent.parse(html);
      }

      try {
        this.element.innerHTML = html;
      } catch (e) {
        this.element.innerText = html;
      }
    },

    cleanUp: function(rules) {
      var bookmark;
      if (this.selection && this.selection.isInThisEditable()) {
        bookmark = rangy.saveSelection(this.win);
      }
      this.parent.parse(this.element, undefined, rules);
      if (bookmark) {
        rangy.restoreSelection(bookmark);
      }
    },

    show: function() {
      this.editableArea.style.display = this._displayStyle || "";

      if (!this.config.noTextarea && !this.textarea.element.disabled) {
        // Firefox needs this, otherwise contentEditable becomes uneditable
        this.disable();
        this.enable();
      }
    },

    hide: function() {
      this._displayStyle = dom.getStyle("display").from(this.editableArea);
      if (this._displayStyle === "none") {
        this._displayStyle = null;
      }
      this.editableArea.style.display = "none";
    },

    disable: function() {
      this.parent.fire("disable:composer");
      this.element.removeAttribute("contentEditable");
    },

    enable: function() {
      this.parent.fire("enable:composer");
      this.element.setAttribute("contentEditable", "true");
    },

    focus: function(setToEnd) {
      // IE 8 fires the focus event after .focus()
      // This is needed by our simulate_placeholder.js to work
      // therefore we clear it ourselves this time
      if (wysihtml.browser.doesAsyncFocus() && this.hasPlaceholderSet()) {
        this.clear();
      }

      this.base();

      var lastChild = this.element.lastChild;
      if (setToEnd && lastChild && this.selection) {
        if (lastChild.nodeName === "BR") {
          this.selection.setBefore(this.element.lastChild);
        } else {
          this.selection.setAfter(this.element.lastChild);
        }
      }
    },

    getScrollPos: function() {
      if (this.doc && this.win) {
        var pos = {};

        if (typeof this.win.pageYOffset !== "undefined") {
          pos.y = this.win.pageYOffset;
        } else {
          pos.y = (this.doc.documentElement || this.doc.body.parentNode || this.doc.body).scrollTop;
        }

        if (typeof this.win.pageXOffset !== "undefined") {
          pos.x = this.win.pageXOffset;
        } else {
          pos.x = (this.doc.documentElement || this.doc.body.parentNode || this.doc.body).scrollLeft;
        }

        return pos;
      }
    },

    setScrollPos: function(pos) {
      if (pos && typeof pos.x !== "undefined" && typeof pos.y !== "undefined") {
        this.win.scrollTo(pos.x, pos.y);
      }
    },

    getTextContent: function() {
      return dom.getTextContent(this.element);
    },

    hasPlaceholderSet: function() {
      return this.getTextContent() == ((this.config.noTextarea) ? this.editableArea.getAttribute("data-placeholder") : this.textarea.element.getAttribute("placeholder")) && this.placeholderSet;
    },

    isEmpty: function() {
      var innerHTML = this.element.innerHTML.toLowerCase();
      return (/^(\s|<br>|<\/br>|<p>|<\/p>)*$/i).test(innerHTML)  ||
             innerHTML === ""            ||
             innerHTML === "<br>"        ||
             innerHTML === "<p></p>"     ||
             innerHTML === "<p><br></p>" ||
             this.hasPlaceholderSet();
    },

    _initContentEditableArea: function() {
        var that = this;
        if (this.config.noTextarea) {
            this.sandbox = new dom.ContentEditableArea(function() {
                that._create();
            }, {
              className: this.config.classNames.sandbox
            }, this.editableArea);
        } else {
            this.sandbox = new dom.ContentEditableArea(function() {
                that._create();
            }, {
              className: this.config.classNames.sandbox
            });
            this.editableArea = this.sandbox.getContentEditable();
            dom.insert(this.editableArea).after(this.textarea.element);
            this._createWysiwygFormField();
        }
    },

    _initSandbox: function() {
      var that = this;
      this.sandbox = new dom.Sandbox(function() {
        that._create();
      }, {
        stylesheets:  this.config.stylesheets,
        className: this.config.classNames.sandbox
      });
      this.editableArea  = this.sandbox.getIframe();

      var textareaElement = this.textarea.element;
      dom.insert(this.editableArea).after(textareaElement);

      this._createWysiwygFormField();
    },

    // Creates hidden field which tells the server after submit, that the user used an wysiwyg editor
    _createWysiwygFormField: function() {
        if (this.textarea.element.form) {
          var hiddenField = document.createElement("input");
          hiddenField.type   = "hidden";
          hiddenField.name   = "_wysihtml_mode";
          hiddenField.value  = 1;
          dom.insert(hiddenField).after(this.textarea.element);
        }
    },

    _create: function() {
      var that = this;
      this.doc                = this.sandbox.getDocument();
      this.win                = this.sandbox.getWindow();
      this.element            = (this.config.contentEditableMode) ? this.sandbox.getContentEditable() : this.doc.body;
      if (!this.config.noTextarea) {
          this.textarea           = this.parent.textarea;
          this.element.innerHTML  = this.textarea.getValue(true, false);
      } else {
          this.cleanUp(); // cleans contenteditable on initiation as it may contain html
      }

      // Make sure our selection handler is ready
      this.selection = new wysihtml.Selection(this.parent, this.element, this.config.classNames.uneditableContainer);

      // Make sure commands dispatcher is ready
      this.commands  = new wysihtml.Commands(this.parent);

      if (!this.config.noTextarea) {
          dom.copyAttributes([
              "className", "spellcheck", "title", "lang", "dir", "accessKey"
          ]).from(this.textarea.element).to(this.element);
      }

      this._initAutoLinking();

      dom.addClass(this.element, this.config.classNames.composer);
      //
      // Make the editor look like the original textarea, by syncing styles
      if (this.config.style && !this.config.contentEditableMode) {
        this.style();
      }

      this.observe();

      var name = this.config.name;
      if (name) {
        dom.addClass(this.element, name);
        if (!this.config.contentEditableMode) { dom.addClass(this.editableArea, name); }
      }

      this.enable();

      if (!this.config.noTextarea && this.textarea.element.disabled) {
        this.disable();
      }

      // Simulate html5 placeholder attribute on contentEditable element
      var placeholderText = typeof(this.config.placeholder) === "string"
        ? this.config.placeholder
        : ((this.config.noTextarea) ? this.editableArea.getAttribute("data-placeholder") : this.textarea.element.getAttribute("placeholder"));
      if (placeholderText) {
        dom.simulatePlaceholder(this.parent, this, placeholderText, this.config.classNames.placeholder);
      }

      // Make sure that the browser avoids using inline styles whenever possible
      this.commands.exec("styleWithCSS", false);

      this._initObjectResizing();
      this._initUndoManager();
      this._initLineBreaking();

      // Simulate html5 autofocus on contentEditable element
      // This doesn't work on IOS (5.1.1)
      if (!this.config.noTextarea && (this.textarea.element.hasAttribute("autofocus") || document.querySelector(":focus") == this.textarea.element) && !browser.isIos()) {
        setTimeout(function() { that.focus(true); }, 100);
      }

      // IE sometimes leaves a single paragraph, which can't be removed by the user
      if (!browser.clearsContentEditableCorrectly()) {
        wysihtml.quirks.ensureProperClearing(this);
      }

      // Set up a sync that makes sure that textarea and editor have the same content
      if (this.initSync && this.config.sync) {
        this.initSync();
      }

      // Okay hide the textarea, we are ready to go
      if (!this.config.noTextarea) { this.textarea.hide(); }

      // Fire global (before-)load event
      this.parent.fire("beforeload").fire("load");
    },

    _initAutoLinking: function() {
      var that                           = this,
          supportsDisablingOfAutoLinking = browser.canDisableAutoLinking(),
          supportsAutoLinking            = browser.doesAutoLinkingInContentEditable();

      if (supportsDisablingOfAutoLinking) {
        this.commands.exec("AutoUrlDetect", false, false);
      }

      if (!this.config.autoLink) {
        return;
      }

      // Only do the auto linking by ourselves when the browser doesn't support auto linking
      // OR when he supports auto linking but we were able to turn it off (IE9+)
      if (!supportsAutoLinking || (supportsAutoLinking && supportsDisablingOfAutoLinking)) {
        this.parent.on("newword:composer", function() {
          if (dom.getTextContent(that.element).match(dom.autoLink.URL_REG_EXP)) {
            var nodeWithSelection = that.selection.getSelectedNode(),
                uneditables = that.element.querySelectorAll("." + that.config.classNames.uneditableContainer),
                isInUneditable = false;

            for (var i = uneditables.length; i--;) {
              if (wysihtml.dom.contains(uneditables[i], nodeWithSelection)) {
                isInUneditable = true;
              }
            }

            if (!isInUneditable) dom.autoLink(nodeWithSelection, [that.config.classNames.uneditableContainer]);
          }
        });

        dom.observe(this.element, "blur", function() {
          dom.autoLink(that.element, [that.config.classNames.uneditableContainer]);
        });
      }

      // Assuming we have the following:
      //  <a href="http://www.google.de">http://www.google.de</a>
      // If a user now changes the url in the innerHTML we want to make sure that
      // it's synchronized with the href attribute (as long as the innerHTML is still a url)
      var // Use a live NodeList to check whether there are any links in the document
          links           = this.sandbox.getDocument().getElementsByTagName("a"),
          // The autoLink helper method reveals a reg exp to detect correct urls
          urlRegExp       = dom.autoLink.URL_REG_EXP,
          getTextContent  = function(element) {
            var textContent = wysihtml.lang.string(dom.getTextContent(element)).trim();
            if (textContent.substr(0, 4) === "www.") {
              textContent = "http://" + textContent;
            }
            return textContent;
          };

      dom.observe(this.element, "keydown", function(event) {
        if (!links.length) {
          return;
        }

        var selectedNode = that.selection.getSelectedNode(event.target.ownerDocument),
            link         = dom.getParentElement(selectedNode, { query: "a" }, 4),
            textContent;

        if (!link) {
          return;
        }

        textContent = getTextContent(link);
        // keydown is fired before the actual content is changed
        // therefore we set a timeout to change the href
        setTimeout(function() {
          var newTextContent = getTextContent(link);
          if (newTextContent === textContent) {
            return;
          }

          // Only set href when new href looks like a valid url
          if (newTextContent.match(urlRegExp)) {
            link.setAttribute("href", newTextContent);
          }
        }, 0);
      });
    },

    _initObjectResizing: function() {
      this.commands.exec("enableObjectResizing", true);

      // IE sets inline styles after resizing objects
      // The following lines make sure that the width/height css properties
      // are copied over to the width/height attributes
      if (browser.supportsEvent("resizeend")) {
        var properties        = ["width", "height"],
            propertiesLength  = properties.length,
            element           = this.element;

        dom.observe(element, "resizeend", function(event) {
          var target = event.target || event.srcElement,
              style  = target.style,
              i      = 0,
              property;

          if (target.nodeName !== "IMG") {
            return;
          }

          for (; i<propertiesLength; i++) {
            property = properties[i];
            if (style[property]) {
              target.setAttribute(property, parseInt(style[property], 10));
              style[property] = "";
            }
          }

          // After resizing IE sometimes forgets to remove the old resize handles
          wysihtml.quirks.redraw(element);
        });
      }
    },

    _initUndoManager: function() {
      this.undoManager = new wysihtml.UndoManager(this.parent);
    },

    _initLineBreaking: function() {
      var that                              = this,
          USE_NATIVE_LINE_BREAK_INSIDE_TAGS = "li, p, h1, h2, h3, h4, h5, h6",
          LIST_TAGS                         = "ul, ol, menu";

      function adjust(selectedNode) {
        var parentElement = dom.getParentElement(selectedNode, { query: "p, div" }, 2);
        if (parentElement && dom.contains(that.element, parentElement)) {
          that.selection.executeAndRestoreRangy(function() {
            if (that.config.useLineBreaks) {
              if (!parentElement.firstChild || (parentElement.firstChild === parentElement.lastChild && parentElement.firstChild.nodeType === 1 && parentElement.firstChild.classList.contains('rangySelectionBoundary'))) {
                parentElement.appendChild(that.doc.createElement('br'));
              }
              dom.replaceWithChildNodes(parentElement);
            } else if (parentElement.nodeName !== "P") {
              dom.renameElement(parentElement, "p");
            }
          });
        }
      }

      // Ensures when editor is empty and not line breaks mode, the inital state has a paragraph in it on focus with caret inside paragraph
      if (!this.config.useLineBreaks) {
        dom.observe(this.element, ["focus"], function() {
          if (that.isEmpty()) {
            setTimeout(function() {
              var paragraph = that.doc.createElement("P");
              that.element.innerHTML = "";
              that.element.appendChild(paragraph);
              if (!browser.displaysCaretInEmptyContentEditableCorrectly()) {
                paragraph.innerHTML = "<br>";
                that.selection.setBefore(paragraph.firstChild);
              } else {
                that.selection.selectNode(paragraph, true);
              }
            }, 0);
          }
        });
      }

      dom.observe(this.element, "keydown", function(event) {
        var keyCode = event.keyCode;

        if (event.shiftKey || event.ctrlKey || event.defaultPrevented) {
          return;
        }

        if (keyCode !== wysihtml.ENTER_KEY && keyCode !== wysihtml.BACKSPACE_KEY) {
          return;
        }
        var blockElement = dom.getParentElement(that.selection.getSelectedNode(), { query: USE_NATIVE_LINE_BREAK_INSIDE_TAGS }, 4);
        if (blockElement) {
          setTimeout(function() {
            // Unwrap paragraph after leaving a list or a H1-6
            var selectedNode = that.selection.getSelectedNode(),
                list;

            if (blockElement.nodeName === "LI") {
              if (!selectedNode) {
                return;
              }

              list = dom.getParentElement(selectedNode, { query: LIST_TAGS }, 2);

              if (!list) {
                adjust(selectedNode);
              }
            }

            if (keyCode === wysihtml.ENTER_KEY && blockElement.nodeName.match(/^H[1-6]$/)) {
              adjust(selectedNode);
            }
          }, 0);
          return;
        }
        if (that.config.useLineBreaks && keyCode === wysihtml.ENTER_KEY && !wysihtml.browser.insertsLineBreaksOnReturn()) {
          event.preventDefault();
          that.commands.exec("insertLineBreak");
        }
      });
    }
  });
})(wysihtml);
