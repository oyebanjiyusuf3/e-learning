module("wysihtml.dom.getParentElement", {
  setup: function() {
    this.container = document.createElement("div");
  }
});


test("Basic test - nodeName only", function() {
  this.container.innerHTML = "<ul><li>foo</li></ul>";
  
  var listItem = this.container.querySelector("li"),
      textNode = listItem.firstChild,
      list     = this.container.querySelector("ul");
  equal(wysihtml.dom.getParentElement(listItem, { query: "li" }), listItem);
  equal(wysihtml.dom.getParentElement(listItem, { query: "li, ul" }), listItem);
  equal(wysihtml.dom.getParentElement(listItem, { query: "ul" }), list);
  equal(wysihtml.dom.getParentElement(listItem, { nodeName: "UL" }), list);
  equal(wysihtml.dom.getParentElement(textNode, { query: "ul" }), list);
  equal(wysihtml.dom.getParentElement(listItem, { query: "span" }), null);
});


test("Check 'levels' param - nodeName only", function() {
  this.container.innerHTML = "<div><div><ul><li></li></ul></div></div>";
  
  var listItem  = this.container.querySelector("li"),
      nestedDiv = this.container.querySelector("div").querySelector("div");
  equal(wysihtml.dom.getParentElement(listItem, { nodeName: "DIV" }, 2), null);
  equal(wysihtml.dom.getParentElement(listItem, { nodeName: "DIV" }, 3), nestedDiv);
  
});


test("Basic test - nodeName + className", function() {
  this.container.innerHTML = '<span class="wysiwyg-color-red wysiwyg-color-green">foo</span>';
  
  var spanElement = this.container.firstChild,
      textNode    = this.container.firstChild.firstChild,
      result;
  
  result = wysihtml.dom.getParentElement(textNode, {
    nodeName:   "SPAN",
    className:  "wysiwyg-color-green",
    classRegExp: /wysiwyg-color-[a-z]+/g
  });
  equal(result, spanElement);
  
  result = wysihtml.dom.getParentElement(textNode, {
    query:   "strong, span",
    className:  "wysiwyg-color-green",
    classRegExp: /wysiwyg-color-[a-z]+/g
  });
  equal(result, spanElement);
  
  result = wysihtml.dom.getParentElement(textNode, {
    nodeName:   "STRONG",
    className:  "wysiwyg-color-green",
    classRegExp: /wysiwyg-color-[a-z]+/g
  });
  equal(result, null);
  
  result = wysihtml.dom.getParentElement(textNode, {
    nodeName:   "DIV",
    className:  "wysiwyg-color-green",
    classRegExp: /wysiwyg-color-[a-z]+/g
  });
  equal(result, null);
  
  result = wysihtml.dom.getParentElement(textNode, {
    nodeName:   "SPAN",
    className:  "wysiwyg-color-blue",
    classRegExp: /wysiwyg-color-[a-z]+/g
  });
  equal(result, null);
  
  result = wysihtml.dom.getParentElement(spanElement, {
    nodeName:   "SPAN",
    className:  "wysiwyg-color-green",
    classRegExp: /wysiwyg-color-[a-z]+/g
  });
  equal(result, spanElement);
  
});


test("Check 'levels' param - nodeName + className", function() {
  this.container.innerHTML = '<div class="wysiwyg-color-green"><div class="wysiwyg-color-green"><ul><li></li></ul></blockquote></div></div>';
  
  var listItem  = this.container.querySelector("li"),
      nestedDiv = this.container.querySelector("div").querySelector("div"),
      result;
  
  result = wysihtml.dom.getParentElement(listItem, {
    nodeName:     "DIV",
    className:    "wysiwyg-color-green",
    classRegExp:  /wysiwyg-color-[a-z]+/g
  }, 2);
  equal(result, null);
  
  result = wysihtml.dom.getParentElement(listItem, {
    nodeName:     "DIV",
    className:    "wysiwyg-color-green",
    classRegExp:  /wysiwyg-color-[a-z]+/g
  }, 3);
  equal(result, nestedDiv);
});


test("Check  - no nodeName", function() {
  this.container.innerHTML = '<div><div class="wysiwyg-text-align-right"><span>foo</span></div></div>';
  
  var spanElement = this.container.querySelector("span"),
      alignedDiv  = this.container.querySelector("div").querySelector("div"),
      result;
  
  result = wysihtml.dom.getParentElement(spanElement, {
    className:    "wysiwyg-text-align-right",
    classRegExp:  /wysiwyg-text-align-[a-z]+/g
  });
  equal(result, alignedDiv);
});

test("Test - with no nodeName", function() {
  this.container.innerHTML = '<div><div class="wysiwyg-text-align-right"><span>foo</span></div></div>';
  
  var spanElement = this.container.querySelector("span"),
      alignedDiv  = this.container.querySelector("div").querySelector("div"),
      result;
  
  result = wysihtml.dom.getParentElement(spanElement, {
    className:    "wysiwyg-text-align-right",
    classRegExp:  /wysiwyg-text-align-[a-z]+/g
  });
  equal(result, alignedDiv);
});

test("Test - with only a classRegExp", function() {
  this.container.innerHTML = '<div><div class="wysiwyg-text-align-right"><span>foo</span></div></div>';
  
  var spanElement = this.container.querySelector("span"),
      alignedDiv  = this.container.querySelector("div").querySelector("div"),
      result;
  
  result = wysihtml.dom.getParentElement(spanElement, {
    classRegExp:  /wysiwyg-text-align-[a-z]+/g
  });
  equal(result, alignedDiv);
});

test("Test - with only a className", function() {
  this.container.innerHTML = '<div><div class="wysiwyg-text-align-right"><span>foo</span></div></div>';

  var spanElement = this.container.querySelector("span"),
      alignedDiv  = this.container.querySelector("div").querySelector("div"),
      result;

  result = wysihtml.dom.getParentElement(spanElement, {
    className:  "wysiwyg-text-align-right"
  });
  equal(result, alignedDiv);
});

test("Test with parent container limit", function() {
  this.container.innerHTML = '<div><div><p><span>foo</span></p></div></div>';
  
  var spanElement = this.container.querySelector("span"),
      limitEl  = this.container.querySelector("p"),
      nestedDiv = this.container.querySelector("div").querySelector("div"),
      result;
  
  result = wysihtml.dom.getParentElement(spanElement, {
    nodeName: "DIV"
  }, false, limitEl);

  equal(result, null);
});
