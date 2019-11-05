if (wysihtml.browser.supportsCommand(document, "insertHTML")) {

  module("wysihtml.UndoManager", {
    setup: function() {
      this.textareaElement        = document.createElement("textarea");
      this.textareaElement.value  = "1";

      document.body.appendChild(this.textareaElement);
    },

    teardown: function() {
      var leftover;
      while (leftover = document.querySelector("iframe.wysihtml-sandbox, input[name='_wysihtml_mode']")) {
        leftover.parentNode.removeChild(leftover);
      }
      document.body.removeChild(this.textareaElement);
    },
    
    triggerUndo: function(editor) {
      this.triggerKey(editor, 90);
    },
    
    triggerRedo: function(editor) {
      this.triggerKey(editor, 89);
    },
    
    triggerKey: function(editor, keyCode) {
      var event;
      try {
        event = editor.composer.sandbox.getDocument().createEvent("KeyEvents");
        event.initKeyEvent("keydown", true, true, editor.composer.sandbox.getWindow(), true, false, false, false, keyCode, keyCode);
      } catch(e) {
        event = editor.composer.sandbox.getDocument().createEvent("Events");
        event.initEvent("keydown", true, true);
        event.ctrlKey = true;
        event.keyCode = keyCode;
      }
      editor.composer.element.dispatchEvent(event);
    }
  });


  asyncTest("Basic test", function() {
    expect(5);
    
    var that   = this,
        editor = new wysihtml.Editor(this.textareaElement);
    editor.on("load", function() {
      editor.setValue("1 2").fire("newword:composer");
      editor.setValue("1 2 3").fire("newword:composer");
      editor.setValue("1 2 3 4").fire("newword:composer");
      editor.setValue("1 2 3 4 5");

      that.triggerUndo(editor);
      equal(editor.getValue(false, false), "1 2 3 4");
      that.triggerRedo(editor);
      that.triggerRedo(editor);
      equal(editor.getValue(false, false), "1 2 3 4 5");
      that.triggerUndo(editor);
      that.triggerUndo(editor);
      equal(editor.getValue(false, false), "1 2 3");
      that.triggerUndo(editor);
      that.triggerUndo(editor);
      equal(editor.getValue(false, false), "1");
      that.triggerUndo(editor);
      that.triggerUndo(editor);
      equal(editor.getValue(false, false), "1");
      
      start();
    });
  });
  
  
  asyncTest("Test commands", function() {
    expect(3);
    
    var that   = this,
        editor = new wysihtml.Editor(this.textareaElement);
    editor.on("load", function() {
      editor.setValue("<b>1</b>").fire("beforecommand:composer");
      editor.setValue("<i><b>1</b></i>").fire("beforecommand:composer");
      
      that.triggerUndo(editor);
      equal(editor.getValue(false, false), "<b>1</b>");
      that.triggerRedo(editor);
      equal(editor.getValue(false, false), "<i><b>1</b></i>");
      that.triggerUndo(editor);
      that.triggerUndo(editor);
      equal(editor.getValue(false, false), "1");
      
      start();
    });
  });
}
