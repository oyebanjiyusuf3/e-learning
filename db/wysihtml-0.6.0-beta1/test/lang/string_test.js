module("wysihtml.lang.string");

test("trim()", function() {
  equal(wysihtml.lang.string("   foo   \n").trim(), "foo");
});

test("interpolate()", function() {
  equal(
    wysihtml.lang.string("Hello #{name}, I LOVE YOUR NAME. IT'S VERY GERMAN AND SOUNDS STRONG.").interpolate({ name: "Reinhold" }),
    "Hello Reinhold, I LOVE YOUR NAME. IT'S VERY GERMAN AND SOUNDS STRONG."
  );
});

test("replace()", function() {
  equal(
    wysihtml.lang.string("I LOVE CAKE").replace("CAKE").by("BOOBS"),
    "I LOVE BOOBS"
  );
});

test("escapeHTML()", function() {
  equal(wysihtml.lang.string('&<>"').escapeHTML(), "&amp;&lt;&gt;&quot;");
});