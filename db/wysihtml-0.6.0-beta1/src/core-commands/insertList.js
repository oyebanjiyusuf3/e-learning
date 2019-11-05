wysihtml.commands.insertList = (function(wysihtml) {

  var isNode = function(node, name) {
    if (node && node.nodeName) {
      if (typeof name === 'string') {
        name = [name];
      }
      for (var n = name.length; n--;) {
        if (node.nodeName === name[n]) {
          return true;
        }
      }
    }
    return false;
  };

  var findListEl = function(node, nodeName, composer) {
    var ret = {
          el: null,
          other: false
        };

    if (node) {
      var parentLi = wysihtml.dom.getParentElement(node, { query: "li" }, false, composer.element),
          otherNodeName = (nodeName === "UL") ? "OL" : "UL";

      if (isNode(node, nodeName)) {
        ret.el = node;
      } else if (isNode(node, otherNodeName)) {
        ret = {
          el: node,
          other: true
        };
      } else if (parentLi) {
        if (isNode(parentLi.parentNode, nodeName)) {
          ret.el = parentLi.parentNode;
        } else if (isNode(parentLi.parentNode, otherNodeName)) {
          ret = {
            el : parentLi.parentNode,
            other: true
          };
        }
      }
    }

    // do not count list elements outside of composer
    if (ret.el && !composer.element.contains(ret.el)) {
      ret.el = null;
    }

    return ret;
  };

  var handleSameTypeList = function(el, nodeName, composer) {
    var otherNodeName = (nodeName === "UL") ? "OL" : "UL",
        otherLists, innerLists;
    // Unwrap list
    // <ul><li>foo</li><li>bar</li></ul>
    // becomes:
    // foo<br>bar<br>

    composer.selection.executeAndRestoreRangy(function() {
      otherLists = getListsInSelection(otherNodeName, composer);
      if (otherLists.length) {
        for (var l = otherLists.length; l--;) {
          wysihtml.dom.renameElement(otherLists[l], nodeName.toLowerCase());
        }
      } else {
        innerLists = getListsInSelection(['OL', 'UL'], composer);
        for (var i = innerLists.length; i--;) {
          wysihtml.dom.resolveList(innerLists[i], composer.config.useLineBreaks);
        }
        if (innerLists.length === 0) {
          wysihtml.dom.resolveList(el, composer.config.useLineBreaks);
        }
      }
    });
  };

  var handleOtherTypeList =  function(el, nodeName, composer) {
    var otherNodeName = (nodeName === "UL") ? "OL" : "UL";
    // Turn an ordered list into an unordered list
    // <ol><li>foo</li><li>bar</li></ol>
    // becomes:
    // <ul><li>foo</li><li>bar</li></ul>
    // Also rename other lists in selection
    composer.selection.executeAndRestoreRangy(function() {
      var renameLists = [el].concat(getListsInSelection(otherNodeName, composer));

      // All selection inner lists get renamed too
      for (var l = renameLists.length; l--;) {
        wysihtml.dom.renameElement(renameLists[l], nodeName.toLowerCase());
      }
    });
  };

  var getListsInSelection = function(nodeName, composer) {
      var ranges = composer.selection.getOwnRanges(),
          renameLists = [];

      for (var r = ranges.length; r--;) {
        renameLists = renameLists.concat(ranges[r].getNodes([1], function(node) {
          return isNode(node, nodeName);
        }));
      }

      return renameLists;
  };

  var createListFallback = function(nodeName, composer) {
    var sel = rangy.saveSelection(composer.win);

    // Fallback for Create list
    var tempClassName =  "_wysihtml-temp-" + new Date().getTime(),
        isEmpty, list;

    composer.commands.exec("formatBlock", {
      "nodeName": "div",
      "className": tempClassName
    });

    var tempElement = composer.element.querySelector("." + tempClassName);

    // This space causes new lists to never break on enter
    var INVISIBLE_SPACE_REG_EXP = /\uFEFF/g;
    tempElement.innerHTML = tempElement.innerHTML.replace(wysihtml.INVISIBLE_SPACE_REG_EXP, "");
    if (tempElement) {
      isEmpty = (/^(\s|(<br>))+$/i).test(tempElement.innerHTML);
      list = wysihtml.dom.convertToList(tempElement, nodeName.toLowerCase(), composer.parent.config.classNames.uneditableContainer);
      if (sel) {
        rangy.restoreSelection(sel);
      }
      if (isEmpty) {
        composer.selection.selectNode(list.querySelector("li"), true);
      }
    }
  };

  return {
    exec: function(composer, command, nodeName) {
      var doc           = composer.doc,
          cmd           = (nodeName === "OL") ? "insertOrderedList" : "insertUnorderedList",
          s = composer.selection.getSelection(),
          anode = s.anchorNode.nodeType === 1 && s.anchorNode.firstChild ? s.anchorNode.childNodes[s.anchorOffset] : s.anchorNode,
          fnode = s.focusNode.nodeType === 1 && s.focusNode.firstChild ? s.focusNode.childNodes[s.focusOffset] || s.focusNode.lastChild : s.focusNode,
          selectedNode, list;

      if (s.isBackwards()) {
        // swap variables
        anode = [fnode, fnode = anode][0];
      }

      if (wysihtml.dom.domNode(fnode).is.emptyTextNode(true) && fnode) {
        fnode = wysihtml.dom.domNode(fnode).prev({nodeTypes: [1,3], ignoreBlankTexts: true});
      }
      if (wysihtml.dom.domNode(anode).is.emptyTextNode(true) && anode) {
        anode = wysihtml.dom.domNode(anode).next({nodeTypes: [1,3], ignoreBlankTexts: true});
      }

      if (anode && fnode) {
        if (anode === fnode) {
          selectedNode = anode;
        } else {
          selectedNode = wysihtml.dom.domNode(anode).commonAncestor(fnode, composer.element);
        }
      } else {
        selectedNode  = composer.selection.getSelectedNode();
      }

      list = findListEl(selectedNode, nodeName, composer);

      if (!list.el) {
        if (composer.commands.support(cmd)) {
          doc.execCommand(cmd, false, null);
        } else {
          createListFallback(nodeName, composer);
        }
      } else if (list.other) {
        handleOtherTypeList(list.el, nodeName, composer);
      } else {
        handleSameTypeList(list.el, nodeName, composer);
      }
    },

    state: function(composer, command, nodeName) {
      var selectedNode = composer.selection.getSelectedNode(),
          list         = findListEl(selectedNode, nodeName, composer);

      return (list.el && !list.other) ? list.el : false;
    }
  };

})(wysihtml);
