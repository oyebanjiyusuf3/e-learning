if (wysihtml.browser.supported()) {
  module("wysihtml.Editor contenteditable mode", {
    setup: function() {
      wysihtml.dom.insertCSS([
        "#wysihtml-test-editable { width: 50%; height: 100px; margin-top: 5px; font-style: italic; border: 2px solid red; border-radius: 2px; }",
        "#wysihtml-test-editable:focus { margin-top: 10px; }",
        "#wysihtml-test-editable:disabled { margin-top: 20px; }"
      ]).into(document);

      this.editableArea        = document.createElement("div");
      this.editableArea.id     = "wysihtml-test-editable";
      this.editableArea.className = "wysihtml-test-class";
      this.editableArea.title  = "Please enter your foo";
      this.editableArea.innerHTML  = "hey tiff, what's up?";

      this.originalBodyClassName = document.body.className;

      document.body.appendChild(this.editableArea);

    },

    clickOn: function(element) {
      var mEvent;
      //This is true only for IE,firefox
      if (document.createEvent){
        // To create a mouse event , first we need to create an event and then initialize it.
        mEvent = document.createEvent('MouseEvent');
        mEvent.initMouseEvent('click',true,true,window,0,0,0,0,0,false,false,false,false,0,null);
      } else {
        mEvent = new MouseEvent('click', {
          'view': window,
          'bubbles': true,
          'cancelable': true
        });
      }
      element.dispatchEvent(mEvent);
    },

    teardown: function() {
      var leftover;
      if (this.editableArea && this.editableArea.parentNode) {
        this.editableArea.parentNode.removeChild(this.editableArea);
      }
      while (leftover = document.querySelector("div.wysihtml-sandbox, div.wysihtml-test-class")) {
        leftover.parentNode.removeChild(leftover);
      }
      document.body.className = this.originalBodyClassName;
    }
  });
// Editor initiation tests
  asyncTest("Basic test", function() {
    expect(14);
    var that = this;
    var editor = new wysihtml.Editor(this.editableArea);
    editor.on("load", function() {
      var editableElement   = that.editableArea;

      ok(true, "Load callback triggered");
      ok(wysihtml.dom.hasClass(document.body, "wysihtml-supported"), "<body> received correct class name");
      ok(wysihtml.dom.hasClass(editableElement, "wysihtml-test-class"), "editable kept its original class name");
      ok(wysihtml.dom.hasClass(editableElement, "wysihtml-sandbox"), "editable added its own sandbox class name");

      equal(editor.config.contentEditableMode, true, "contentEditableMode deduced correctly as editable is initiated on non textarea");
      equal(editor.config.noTextarea, true, "noTextarea mode deduced correctly as editable is initiated on non textarea");
      equal(editableElement.style.display, "", "Editor contenteditable is visible");
      equal(editor.currentView.name, "composer", "Current view is 'composer'");
      equal(editableElement.getAttribute("contentEditable"), "true", "Element is editable");
      equal(typeof editor.textarea, "undefined", "Textarea correctly not available on editor instance");
      equal(editor.composer.element, editableElement, "contentEditable element available on editor instance");
      equal(editableElement.innerHTML.toLowerCase(), "hey tiff, what's up?", "Initial value preserved in editor");
      ok(wysihtml.dom.hasClass(editableElement, "wysihtml-editor"), "Editor element has correct class name");
      equal(typeof editor.synchronizer, "undefined", "Syncronizer correctly not initiated in contenteditable mode");

      start();
    });
  });

// EVENTS TESTS
  asyncTest("Check events", function() {
    expect(17);

    var that = this;
    var editor = new wysihtml.Editor(this.editableArea);

    editor.on("beforeload", function() {
      ok(true, "'beforeload' event correctly fired");
    });

    editor.on("load", function() {
      var composerElement = that.editableArea;

      editor.on("focus", function(event) {
        ok(true, "'focus' event correctly fired");
        ok(event, "event is defined");
        ok(event instanceof Event, "event is instance of 'Event'");
        ok(event && event.type === 'focus', "event is of type 'focus'");
      });

      editor.on("blur", function(event) {
        ok(true, "'blur' event correctly fired");
        ok(event, "event is defined");
        ok(event instanceof Event, "event is instance of 'Event'");
        ok(event && event.type === 'blur', "event is of type 'blur'");
      });

      editor.on("change", function(event) {
        ok(true, "'change' event correctly fired");
        ok(event, "event is defined");
        ok(event instanceof Event, "event is instance of 'Event'");
        ok(event && event.type === 'change', "event is of type 'change'");
      });


      editor.on("custom_event", function(event) {
        ok(true, "'custom_event' correctly fired");
        ok(event, "event is defined");
        ok(event && event.type === 'custom_event', "event is of type 'custom_event'");
      });

      happen.once(composerElement, {type: "focus"});
      editor.stopObserving("focus");

      // Modify innerHTML in order to force 'change' event to trigger onblur
      composerElement.innerHTML = "foobar";
      happen.once(composerElement, {type: "blur"});
      happen.once(composerElement, {type: "focusout"});

      equal(wysihtml.dom.getStyle("margin-top").from(composerElement), "5px", ":focus styles are correctly unset");


      editor.fire("custom_event", { type: 'custom_event' });

      setTimeout(function() { start(); }, 100);
    });
  });

  asyncTest("Check events paste", function() {
    expect(12);

    var that = this;
    var editor = new wysihtml.Editor(this.editableArea);

    editor.on("load", function() {
      var composerElement = that.editableArea;

      editor.on("paste", function(event) {
        ok(event, "event is defined");
        ok(event instanceof Event, "event is instance of 'Event'");
        ok(event && event.type === 'paste', "event is of type 'paste'");
      });

      //Assure that the event on the dom element works as expected
      that.editableArea.addEventListener('paste', function (event) {
        ok(event, "event is defined");
        ok(event instanceof Event, "event is instance of 'Event'");
        ok(event && event.type === 'paste', "event is of type 'paste'");
      });

      happen.once(composerElement, {type: "paste"});
      var pasteEvent = document.createEvent("Event");
      pasteEvent.initEvent("paste", true, true);
      that.editableArea.dispatchEvent(pasteEvent);

      setTimeout(function() { start(); }, 100);
    });
  });

  asyncTest("Check events drop", function() {
    expect(12);

    var that = this;
    var editor = new wysihtml.Editor(this.editableArea);

    editor.on("load", function() {
      var composerElement = that.editableArea;

      //if changing from drop to paste it works
      editor.on('drop', function(event) {
        ok(event, "event is defined");
        ok(event instanceof Event, "event is instance of 'Event'");
        ok(event && event.type === 'drop', "event is of type 'drop'");
      });

      editor.on('paste', function(event) {
        ok(false, "No 'paste' event was fired.");
      });

      //Assure that the event on the dom element works as expected
      that.editableArea.addEventListener('drop', function (event) {
        ok(event, "event is defined");
        ok(event instanceof Event, "event is instance of 'Event'");
        ok(event && event.type === 'drop', "event is of type 'drop'");
      });

      happen.once(composerElement, {type: "drop"});
      var dropEvent = document.createEvent("Event");
      dropEvent.initEvent("drop", true, true);
      that.editableArea.dispatchEvent(dropEvent);

      setTimeout(function() { start(); }, 100);
    });
  });


// Placeholder tests
  asyncTest("Check placeholder", function() {
    expect(12);

    var that = this;

    var placeholderText = "enter text ...";
    this.editableArea.innerHTML = "";
    this.editableArea.setAttribute("data-placeholder", "enter text ...");

    var editor = new wysihtml.Editor(this.editableArea);
    editor.on("load", function() {
      var composerElement = that.editableArea;
      equal(wysihtml.dom.getTextContent(composerElement), placeholderText, "Placeholder text correctly copied into textarea");

      ok(wysihtml.dom.hasClass(composerElement, "wysihtml-placeholder"), "Editor got 'placeholder' css class");
      ok(editor.hasPlaceholderSet(), "'hasPlaceholderSet' returns correct value when placeholder is actually set");
      editor.fire("focus:composer");
      equal(wysihtml.dom.getTextContent(composerElement), "", "Editor is empty after focus");
      ok(!wysihtml.dom.hasClass(composerElement, "wysihtml-placeholder"), "Editor hasn't got 'placeholder' css class");
      ok(!editor.hasPlaceholderSet(), "'hasPlaceholderSet' returns correct value when placeholder isn't actually set");
      editor.fire("blur:composer");
      equal(wysihtml.dom.getTextContent(composerElement), placeholderText, "Editor restored placeholder text after unfocus");
      editor.fire("focus:composer");
      equal(wysihtml.dom.getTextContent(composerElement), "");
      composerElement.innerHTML = "some content";
      editor.fire("blur:composer");
      equal(wysihtml.dom.getTextContent(composerElement), "some content");
      ok(!wysihtml.dom.hasClass(composerElement, "wysihtml-placeholder"), "Editor hasn't got 'placeholder' css class");
      editor.fire("focus:composer");
      // Following html causes innerText and textContent to report an empty string
      var html = '<img>';
      composerElement.innerHTML = html;
      editor.fire("blur:composer");
      equal(composerElement.innerHTML.toLowerCase(), html, "HTML hasn't been cleared even though the innerText and textContent properties indicate empty content.");
      ok(!wysihtml.dom.hasClass(composerElement, "wysihtml-placeholder"), "Editor hasn't got 'placeholder' css class");
      start();
    });
  });

// Editor available functions test
  asyncTest("Check public api", function() {
    expect(13);

    var that = this;

    var editor = new wysihtml.Editor(this.editableArea, {
      parserRules:        { tags: { p: { rename_tag: "div" }, "strong": {} } },
      classNames: {
        body:      "editor-is-supported",
        composer:  "editor"
      }
    });

    editor.on("load", function() {
      ok(editor.isCompatible(), "isCompatible() returns correct value");
      ok(wysihtml.dom.hasClass(document.body, "editor-is-supported"), "<body> received correct class name");

      var composerElement = that.editableArea;
      editor.clear();
      equal(wysihtml.dom.getTextContent(composerElement), "", "Editor empty after calling 'clear'");
      ok(wysihtml.dom.hasClass(composerElement, "editor"), "Composer element has correct class name");

      var html = "hello <strong>foo</strong>!";
      editor.setValue(html);
      equal(composerElement.innerHTML.toLowerCase(), html, "Editor content correctly set after calling 'setValue'");
      ok(!editor.isEmpty(), "'isEmpty' returns correct value when the composer element isn't actually empty");

      var value = editor.getValue(false, false);
      equal(value.toLowerCase(), html, "Editor content correctly returned after calling 'getValue(false, false)'");

      editor.clear();
      value = editor.getValue();
      equal(value, "");
      ok(editor.isEmpty(), "'isEmpty' returns correct value when the composer element is actually empty");

      equal(editor.parse("<p>foo</p>").toLowerCase(), "<div>foo</div>", "'parse' returns correct value");

      // Check disable/enable
      editor.disable();
      ok(!composerElement.getAttribute("contentEditable"), "When disabled the composer hasn't the contentEditable attribute");

      editor.enable();
      equal(composerElement.getAttribute("contentEditable"), "true", "After enabling the editor the contentEditable property is true");
      ok(!composerElement.getAttribute("disabled"), "After enabling the disabled attribute is unset");

      start();
    });
  });

// Parser tests
  asyncTest("Parser (default parser method with parserRules as object)", function() {
    expect(2);

    var parserRules = {
      tags: {
        div: true,
        p: { rename_tag: "div" },
        span: true,
        script: undefined
      }
    };

    var input   = "<p>foobar</p>",
        output  = "<div>foobar</div>";

    var editor = new wysihtml.Editor(this.editableArea, {
      parserRules: parserRules
    });

    editor.on("load", function() {
      deepEqual(editor.config.parserRules, parserRules, "Parser rules correctly set on config object");
      // Invoke parsing via second parameter of setValue()
      editor.setValue(input, true);
      equal(editor.getValue(false, false).toLowerCase(), output, "HTML got correctly parsed within setValue()");
      start();
    });
  });

  asyncTest("Editable area html should be cleaned up upon initiation", function() {
      expect(2);
      var that = this,
          parserRules = {
              "tags": {
                  "div": { "unwrap": 1 }
              }
          },
          input       = "<div><div>Hi,</div> there!</div>",
          output      = "Hi,<br> there!<br>",
          editor;

      this.editableArea.innerHTML = input;
      equal(that.editableArea.innerHTML, input, "Content is set as unclean before editor initiation");
      editor = new wysihtml.Editor(this.editableArea, {
          parserRules: parserRules
      });

      editor.on("load", function() {
          equal(that.editableArea.innerHTML, output, "Content is cleaned after initiation");
          start();
      });
  });


  asyncTest("Parser (custom parser method with parserRules as object", function() {
    expect(6);

    this.editableArea.innerHTML = "<p>foobar</p><script>alert(1);</script>";

    var that        = this,
        parserRules = { script: undefined },
        input       = this.editableArea.innerHTML,
        output      = input;


    var editor = new wysihtml.Editor(this.editableArea, {
      parserRules: parserRules,
      parser:      function(html, config) {
        if (typeof html !== "string") {
            html = html.innerHTML;
            ok(true, "Custom parser is run element upon initiation");
        }
        equal(html.toLowerCase(), input, "HTML passed into parser is equal to the one which just got inserted");
        deepEqual(config.rules, parserRules, "Rules passed into parser are equal to those given to the editor");
        return html.replace(/\<script\>.*?\<\/script\>/gi, "");
      }
    });

    editor.on("load", function() {
      var output2  = "<p>foobar</p>";
      // Invoke parsing via second parameter of setValue()
      equal(editor.getValue(true, true).toLowerCase(), output2, "HTML got correctly parsed within setValue()");
      start();
    });
  });

  asyncTest("Inserting an element which causes the textContent/innerText of the contentEditable element to be empty works correctly", function() {
    expect(1);

    var that = this;

    var editor = new wysihtml.Editor(this.editableArea, {
      parserRules: { tags: { "img": {} } }
    });
    editor.on("load", function() {
      var html            = '<img>',
          composerElement = that.editableArea;

      composerElement.innerHTML = html;

      // Fire events that could cause a change in the composer

      happen.once(composerElement, {type: "keypress"});
      happen.once(composerElement, {type: "keyup"});
      happen.once(composerElement, {type: "cut"});
      happen.once(composerElement, {type: "blur"});

      setTimeout(function() {
        equal(composerElement.innerHTML.toLowerCase(), html, "Composer still has correct content");
        start();
      }, 500);
    });
  });


  // currently qunit does not catch the errors for testing (dispatchevent will not work with try catch), but is better than no test at all
  asyncTest("Test editor.destroy", function() {
    expect(1);

    var toolbar = document.createElement('div'),
        that = this,
        noerror = true;

    toolbar.innerHTML = '<a data-wysihtml-command="bold">bold</a>';
    document.body.appendChild(toolbar);

    var editor = new wysihtml.Editor(this.editableArea, {
      toolbar: toolbar
    });

    editor.on("load", function() {

      // destroy the editor
      editor.destroy();
      editor.composer.element.parentNode.removeChild(editor.composer.element);
      toolbar.parentNode.removeChild(toolbar);

      var range = rangy.createRange();
      range.selectNode(document.body);
      rangy.getSelection().setSingleRange(range);

      window.onerror = function() {
        noerror = false;
      };

      this.clickOn(toolbar);
      this.clickOn(document.body);
      this.clickOn(editor.composer.element);

      setTimeout(function() {
        ok(noerror, "Toolbar or body click did not bring up any error");
        start();
      }, 100);

    }.bind(this));
  });

  /*
  // TODO: needs logic rethink of terms and conditions

  asyncTest("If selection borders cross contenteditabel only editable gets modified", function() {
      expect(3);
      var that = this,
          editor = new wysihtml.Editor(this.editableArea);

      editor.on("load", function() {
          editor.setValue("foobar", true);
          editor.composer.selection.selectNode(that.editableArea);
          equal(that.editableArea.innerHTML, "foobar", "Content was not bold before");
          window.e = editor;
          editor.composer.commands.exec('bold');

          ok(wysihtml.dom.getStyle("font-weight").from(that.editableArea.children[0]) == 700 || wysihtml.dom.getStyle("font-weight").from(that.editableArea.children[0]) == "bold", "First child has style bold");
          ok(wysihtml.dom.getStyle("font-weight").from(that.editableArea) == 400 || wysihtml.dom.getStyle("font-weight").from(that.editableArea) == "normal", "Editable element itself is not bold");
          start();
      });
  });
  */

}
