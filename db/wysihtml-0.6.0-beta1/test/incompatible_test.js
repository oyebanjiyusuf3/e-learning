module("wysihtml - Incompatible", {
  setup: function() {
    this.originalSupportCheck = wysihtml.browser.supported;
    wysihtml.browser.supported = function() { return false; };
    
    this.textareaElement = document.createElement("textarea");
    document.body.appendChild(this.textareaElement);
  },
  
  teardown: function() {
    wysihtml.browser.supported = this.originalSupportCheck;
    this.textareaElement.parentNode.removeChild(this.textareaElement);
  }
});


asyncTest("Basic test", function() {
  expect(12);
  
  var that = this;
  
  var oldIframesLength = document.getElementsByTagName("iframe").length;
  
  var oldInputsLength = document.getElementsByTagName("input").length;
  
  var editor = new wysihtml.Editor(this.textareaElement);
  editor.on("load", function() {
    ok(true, "'load' event correctly triggered");
    ok(!wysihtml.dom.hasClass(document.body, "wysihtml-supported"), "<body> didn't receive the 'wysihtml-supported' class");
    ok(!editor.isCompatible(), "isCompatible returns false when rich text editing is not correctly supported in the current browser");
    equal(that.textareaElement.style.display, "", "Textarea is visible");
    ok(!editor.composer, "Composer not initialized");
    
    equal(document.getElementsByTagName("iframe").length, oldIframesLength, "No hidden field has been inserted into the dom");
    equal(document.getElementsByTagName("input").length,  oldInputsLength,  "Composer not initialized");
    
    var html = "foobar<br>";
    editor.setValue(html);
    equal(that.textareaElement.value, html);
    equal(editor.getValue(), html);
    editor.clear();
    equal(that.textareaElement.value, "");
    
    editor.on("focus", function() {
      ok(true, "Generic 'focus' event fired");
    });
    
    editor.on("focus:textarea", function() {
      ok(true, "Specific 'focus:textarea' event fired");
    });
    
    editor.on("focus:composer", function() {
      ok(false, "Specific 'focus:composer' event fired, and that's wrong, there shouldn't be a composer element/view");
    });
    
    var eventOptions = {};
    eventOptions.type = wysihtml.browser.supportsEvent("focusin") ? "focusin" : "focus";
    happen.once(that.textareaElement, eventOptions);
    
    start();
  });
});
