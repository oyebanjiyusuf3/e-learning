module("wysihtml.dom.resolveList", {
  equal: function(actual, expected, message) {
    return QUnit.assert.htmlEqual(actual, expected, message);
  },
  
  resolveList: function(html, useLineBreaks) {
    var container = wysihtml.dom.getAsDom(html);
    document.body.appendChild(container);
    wysihtml.dom.resolveList(container.firstChild, useLineBreaks);
    var innerHTML = container.innerHTML;
    container.parentNode.removeChild(container);
    return innerHTML;
  }
});

test("Basic tests (useLineBreaks = true)", function() {
  this.equal(
    this.resolveList("<ul><li>foo</li></ul>", true),
    "foo",
    "List with one li element resolved"
  );

  this.equal(
    this.resolveList("<ul><li>foo</li></ul>Test", true),
    "foo<br>Test",
    "List with test after adds line break"
  );
  
  this.equal(
    this.resolveList("<ul><li>foo</li><li>bar</li></ul>", true),
    "foo<br>bar",
    "List with two li elements resolved"
  );
  
  this.equal(
    this.resolveList("<ol><li>foo</li><li>bar</li></ol>", true),
    "foo<br>bar",
    "Numbered list with two li elements resolved"
  );
  
  this.equal(
    this.resolveList("<ol><li></li><li>bar</li></ol>", true),
    "bar"
  );
  
  this.equal(
    this.resolveList("<ol><li>foo<br></li><li>bar</li></ol>", true),
    "foo<br>bar"
  );
  
  this.equal(
    this.resolveList("<ul><li><h1>foo</h1></li><li><div>bar</div></li><li>baz</li></ul>", true),
    "<h1>foo</h1><div>bar</div>baz"
  );
});

test("Basic tests (useLineBreaks = false)", function() {
  this.equal(
    this.resolveList("<ul><li>foo</li></ul>"),
    "<p>foo</p>"
  );
  
  this.equal(
    this.resolveList("<ul><li>foo</li><li>bar</li></ul>"),
    "<p>foo</p><p>bar</p>"
  );
  
  this.equal(
    this.resolveList("<ol><li>foo</li><li>bar</li></ol>"),
    "<p>foo</p><p>bar</p>"
  );
  
  this.equal(
    this.resolveList("<ol><li></li><li>bar</li></ol>"),
    "<p></p><p>bar</p>"
  );
  
  this.equal(
    this.resolveList("<ol><li>foo<br></li><li>bar</li></ol>"),
    "<p>foo<br></p><p>bar</p>"
  );
  
  this.equal(
    this.resolveList("<ul><li><h1>foo</h1></li><li><div>bar</div></li><li>baz</li></ul>"),
    "<h1>foo</h1><div>bar</div><p>baz</p>"
  );
});
