/**
 * Inserts an <img>
 * If selection is already an image link, it removes it
 *
 * @example
 *    // either ...
 *    wysihtml.commands.insertImage.exec(composer, "insertImage", "http://www.google.de/logo.jpg");
 *    // ... or ...
 *    wysihtml.commands.insertImage.exec(composer, "insertImage", { src: "http://www.google.de/logo.jpg", title: "foo" });
 */
wysihtml.commands.insertImage = (function() {
  var NODE_NAME = "IMG";
  return {
    exec: function(composer, command, value) {
      value = typeof(value) === "object" ? value : { src: value };

      var doc     = composer.doc,
          image   = this.state(composer),
          textNode,
          parent;

      // If image is selected and src ie empty, set the caret before it and delete the image
      if (image && !value.src) {
        composer.selection.setBefore(image);
        parent = image.parentNode;
        parent.removeChild(image);

        // and it's parent <a> too if it hasn't got any other relevant child nodes
        wysihtml.dom.removeEmptyTextNodes(parent);
        if (parent.nodeName === "A" && !parent.firstChild) {
          composer.selection.setAfter(parent);
          parent.parentNode.removeChild(parent);
        }

        // firefox and ie sometimes don't remove the image handles, even though the image got removed
        wysihtml.quirks.redraw(composer.element);
        return;
      }

      // If image selected change attributes accordingly
      if (image) {
        for (var key in value) {
          if (value.hasOwnProperty(key)) {
            image.setAttribute(key === "className" ? "class" : key, value[key]);
          }
        }
        return;
      }

      // Otherwise lets create the image
      image = doc.createElement(NODE_NAME);

      for (var i in value) {
        image.setAttribute(i === "className" ? "class" : i, value[i]);
      }

      composer.selection.insertNode(image);
      if (wysihtml.browser.hasProblemsSettingCaretAfterImg()) {
        textNode = doc.createTextNode(wysihtml.INVISIBLE_SPACE);
        composer.selection.insertNode(textNode);
        composer.selection.setAfter(textNode);
      } else {
        composer.selection.setAfter(image);
      }
    },

    state: function(composer) {
      var doc = composer.doc,
          selectedNode,
          text,
          imagesInSelection;

      if (!wysihtml.dom.hasElementWithTagName(doc, NODE_NAME)) {
        return false;
      }

      selectedNode = composer.selection.getSelectedNode();
      if (!selectedNode) {
        return false;
      }

      if (selectedNode.nodeName === NODE_NAME) {
        // This works perfectly in IE
        return selectedNode;
      }

      if (selectedNode.nodeType !== wysihtml.ELEMENT_NODE) {
        return false;
      }

      text = composer.selection.getText();
      text = wysihtml.lang.string(text).trim();
      if (text) {
        return false;
      }

      imagesInSelection = composer.selection.getNodes(wysihtml.ELEMENT_NODE, function(node) {
        return node.nodeName === "IMG";
      });

      if (imagesInSelection.length !== 1) {
        return false;
      }

      return imagesInSelection[0];
    }
  };
})();
