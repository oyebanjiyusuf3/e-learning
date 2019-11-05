module("wysihtml.dom.delegate", {
  setup: function() {
    this.container    = document.createElement("div");
    this.link1        = document.createElement("a");
    this.link2        = document.createElement("a");
    this.nestedSpan   = document.createElement("span");
    
    this.link2.appendChild(this.nestedSpan);
    this.container.appendChild(this.link1);
    this.container.appendChild(this.link2);
    
    document.body.appendChild(this.container);
  },
  
  teardown: function() {
    this.container.parentNode.removeChild(this.container);
  }
});

test("Basic test", function() {
  expect(3);
  
  var that = this;
  
  wysihtml.dom.delegate(this.container, "a", "click", function(event) {
    ok(true, "Callback handler executed");
    equal(this, that.link1, "Callback handler executed in correct scope");
    ok(event.stopPropagation && event.preventDefault, "Parameter passed into callback handler is a proper event object");
  });
  
  happen.click(this.link1);
});

test("Click on nested element works as well", function() {
  expect(3);
  
  var that = this;
  
  wysihtml.dom.delegate(this.container, "a", "click", function(event) {
    ok(true, "Callback handler executed");
    equal(this, that.link2, "Callback handler executed in correct scope");
    ok(event.stopPropagation && event.preventDefault, "Parameter passed into callback handler is a proper event object");
  });
  
  happen.click(this.nestedSpan);
});

test("Delegation on the body", function() {
  expect(1);
  
  var delegater = wysihtml.dom.delegate(document.body, ".delegation-test", "mousedown", function() {
    ok(true, "Callback handler executed");
  });
  
  this.link1.className = "delegation-test another-class";
  
  happen.mousedown(this.link1);
  
  delegater.stop();
  
  happen.mousedown(this.link1);
});
