module("wysihtml.dom.renameElement", {
  equal: function(actual, expected, message) {
    return QUnit.assert.htmlEqual(actual, expected, message);
  },
  
  renameElement: function(html, newNodeName) {
    var container = wysihtml.dom.getAsDom(html);
    wysihtml.dom.renameElement(container.firstChild, newNodeName);
    return container.innerHTML;
  }
});

test("Basic tests", function() {
  this.equal(
    this.renameElement("<p>foo</p>", "div"),
    "<div>foo</div>"
  );
  
  this.equal(
    this.renameElement("<ul><li>foo</li></ul>", "ol"),
    "<ol><li>foo</li></ol>"
  );
  
  this.equal(
    this.renameElement('<p align="left" class="foo"></p>', "h2"),
    '<h2 align="left" class="foo"></h2>'
  );
});
