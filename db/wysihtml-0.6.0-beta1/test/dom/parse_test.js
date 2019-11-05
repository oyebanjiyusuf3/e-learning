if (wysihtml.browser.supported()) {

  module("wysihtml.dom.parse", {
    sanitize: function(html, rules, context, cleanUp, uneditableClass) {
      return wysihtml.dom.parse(html, {
        "rules": rules,
        "cleanUp": cleanUp,
        "context": context,
        "uneditableClass": uneditableClass
      });
    },

    equal: function(actual, expected, message) {
      return QUnit.assert.htmlEqual(actual, expected, message);
    }
  });

  test("Simple tests using plain tags only", function() {
    var rules = {
      tags: {
        p:      "div",
        script: undefined,
        div:    {}
      }
    };

    this.equal(
      this.sanitize("<i id=\"foo\">bar</i>", rules),
      "<span>bar</span>",
      "Unknown tag gets renamed to span"
    );

    this.equal(
      this.sanitize("<p>foo</p>", rules),
      "<div>foo</div>",
      "Known tag gets renamed to it's corresponding conversion"
    );

    this.equal(
      this.sanitize("<script>window;</script>", rules),
      "",
      "Forbidden tag gets correctly removed"
    );

    this.equal(
      this.sanitize("foobar", rules),
      "foobar",
      "Plain text is kept"
    );

    this.equal(
      this.sanitize("<table><tbody><tr><td>I'm a table!</td></tr></tbody></table>"),
      "<span><span><span><span>I'm a table!</span></span></span></span>",
      "Passing no conversion renames all into <span> elements"
    );

    this.equal(
      this.sanitize("<p>foobar<br></p>", { tags: { p: true, br: true } }),
      "<p>foobar<br></p>",
      "Didn't rewrite the HTML"
    );

    this.equal(
      this.sanitize("<div><!-- COMMENT -->foo</div>"),
      "<span>foo</span>",
      "Stripped out comments"
    );
    
    this.equal(
      this.sanitize("<article>foo</article>", { tags: { article: true } }),
      "<article>foo</article>",
      "Check html5 tags"
    );
    
    this.equal(
      this.sanitize("<!DOCTYPE html><p>html5 doctype</p>", { tags: { p: true } }),
      "<p>html5 doctype</p>",
      "Stripped out doctype"
    );
  });


  test("Advanced tests using tags and attributes", function() {
    var rules = {
      tags: {
        img: {
          set_attributes: { alt: "foo", border: "1" },
          check_attributes: { src: "url", width: "numbers", height: "numbers", border: "numbers" }
        },
        a: {
          rename_tag: "i",
          set_attributes: { title: "" }
        },
        video: undefined,
        h1: { rename_tag: "h2" },
        h2: true,
        h3: undefined
      }
    };

    this.equal(
      this.sanitize(
        '<h1 id="main-headline" >take this you snorty little sanitizer</h1>' +
        '<h2>yes, you!</h2>' +
        '<h3>i\'m old and ready to die</h3>' +
        '<div><video src="pr0n.avi">foobar</video><img src="http://foo.gif" height="10" width="10"><img src="/foo.gif"></div>' +
        '<div><a href="http://www.google.de"></a></div>',
        rules
      ),
      '<h2>take this you snorty little sanitizer</h2>' +
      '<h2>yes, you!</h2>' +
      '<span><img alt="foo" border="1" src="http://foo.gif" height="10" width="10"><img alt="foo" border="1"></span>' +
      '<span><i title=""></i></span>'
    );
  });

  test("Attribute check of 'url' cleans up", function() {
    var rules = {
      tags: {
        img: {
          check_attributes: { src: "url" }
        }
      }
    };

    QUnit.equal(
      this.sanitize(
        '<img src="http://url.gif">' +
        '<img src="/path/to/absolute%20href.gif">' +
        '<img src="mango time">',
        rules
      ),
      '<img src="http://url.gif"><img><img>'
    );
  });

  test("Attribute check of 'src' cleans up", function() {
    var rules = {
      tags: {
        img: {
          check_attributes: { src: "src" }
        }
      }
    };

    QUnit.equal(
      this.sanitize(
        '<img src="HTTP://url.gif">' +
        '<img src="/path/to/absolute%20href.gif">' +
        '<img src="mailto:christopher@foobar.com">' +
        '<img src="mango time">',
        rules
      ),
      '<img src="http://url.gif">' +
      '<img src="/path/to/absolute%20href.gif">' +
      '<img>' +
      '<img>'
    );
  });
  
  test("Attribute check of 'href' cleans up", function() {
    var rules = {
      tags: {
        a: {
          check_attributes: { href: "href" }
        }
      }
    };

    this.equal(
      this.sanitize(
        '<a href="/foobar"></a>' +
        '<a href="HTTPS://google.com"></a>' +
        '<a href="http://google.com"></a>' +
        '<a href="MAILTO:christopher@foobar.com"></a>' +
        '<a href="mango time"></a>' +
        '<a href="ftp://google.com"></a>',
        rules
      ),
      '<a href="/foobar"></a>' +
      '<a href="https://google.com"></a>' +
      '<a href="http://google.com"></a>' +
      '<a href="mailto:christopher@foobar.com"></a>' +
      '<a></a>' +
      '<a></a>'
    );
  });

  test("Attribute check of 'any' works", function() {
    var rules = {
      tags: {
        a: {
          check_attributes: {
            href: "href",
            title: "any"
          }
        }
      }
    };

    this.equal(
      this.sanitize(
        '<a href="/foobar" title="A goose"></a>'+
        '<a href="/foobar" title></a>',
        rules
      ),
      '<a href="/foobar" title="A goose"></a>'+
      '<a href="/foobar"></a>'
    );
  });

  test("Attribute check method of function works", function() {
    var rules = {
      tags: {
        a: {
          check_attributes: {
            href: "href",
            title: function(val) {
              return val + " foo";
            }
          }
        }
      }
    };

    this.equal(
      this.sanitize(
        '<a href="/foobar" title="A goose"></a>',
        rules
      ),
      '<a href="/foobar" title="A goose foo"></a>'
    );
  });

  test("Attribute check method of function can pass attributes without value", function() {
    var rules = {
      tags: {
        a: {
          check_attributes: {
            href: "href",
            title: function(val) {
              return val || "";
            }
          }
        }
      }
    };

    this.equal(
      this.sanitize(
        '<a href="/foobar" title></a>',
        rules
      ),
      '<a href="/foobar" title></a>'
    );
  });

  test("Bug in IE8 where invalid html causes duplicated content", function() {
    var rules = {
      tags: { p: true, span: true, div: true }
    };
    
    var result = this.sanitize('<SPAN><P><SPAN><div>FOO</div>', rules);
    ok(result.indexOf("FOO") === result.lastIndexOf("FOO"));
  });
  
  
  test("Bug in IE8 where elements are duplicated when multiple parsed", function() {
    var rules = {
      tags: { p: true, span: true, div: true }
    };
    
    var firstResult = this.sanitize('<SPAN><P><SPAN>foo<P></P>', rules);
    var secondResult = this.sanitize(firstResult, rules);
    
    ok(secondResult.indexOf("foo") !== -1);
    this.equal(firstResult, secondResult);
    
    firstResult = this.sanitize('<SPAN><DIV><SPAN>foo<DIV></DIV>', rules);
    secondResult = this.sanitize(firstResult, rules);
    
    ok(secondResult.indexOf("foo") !== -1);
    this.equal(firstResult, secondResult);
  });
  
  test("Test cleanup mode", function() {
    var rules = {
      classes: { a: 1, c: 1 },
      tags: { span: true, div: true }
    };
    
    this.equal(
      this.sanitize("<div><span>foo</span></div>", rules, null, true),
      "<div>foo</div>"
    );
    
    this.equal(
      this.sanitize("<span><p>foo</p></span>", rules, null, true),
      "foo"
    );
    
    this.equal(
      this.sanitize('<span class="a"></span><span class="a">foo</span>', rules, null, true),
      '<span class="a">foo</span>',
      "Empty 'span' is correctly removed"
    );
    
    this.equal(
      this.sanitize('<span><span class="a">1</span> <span class="b">2</span> <span class="c">3</span></span>', rules, null, true),
      '<span class="a">1</span> 2 <span class="c">3</span>',
      "Senseless 'span' is correctly removed"
    );
  });
  
  
  test("Advanced tests for 'img' elements", function() {
    var rules = {
      classes: {
        "wysiwyg-float-right":  1,
        "wysiwyg-float-left":   1
      },
      tags: {
        img: {
          check_attributes: {
            width:    "numbers",
            alt:      "alt",
            src:      "url",
            height:   "numbers"
          },
          add_class: {
            align: "align_img"
          }
        }
      }
    };

    this.equal(
      this.sanitize(
        '<img src="https://www.xing.com/img/users/1/2/7/f98db1f73.6149675_s4.jpg" alt="Christopher Blum" width="57" height="75" class="wysiwyg-float-right">',
        rules
      ),
      '<img alt="Christopher Blum" class="wysiwyg-float-right" height="75" src="https://www.xing.com/img/users/1/2/7/f98db1f73.6149675_s4.jpg" width="57">'
    );

    this.equal(
      this.sanitize(
        '<img src="https://www.xing.com/img/users/1/2/7/f98db1f73.6149675_s4.jpg" alt="Christopher Blum" width="57" height="75" ALIGN="RIGHT">',
        rules
      ),
      '<img alt="Christopher Blum" class="wysiwyg-float-right" height="75" src="https://www.xing.com/img/users/1/2/7/f98db1f73.6149675_s4.jpg" width="57">'
    );

    this.equal(
      this.sanitize(
        '<img src="https://www.xing.com/img/users/1/2/7/f98db1f73.6149675_s4.jpg" alt="Christopher Blum" width="57" height="75" align="left">',
        rules
      ),
      '<img alt="Christopher Blum" class="wysiwyg-float-left" height="75" src="https://www.xing.com/img/users/1/2/7/f98db1f73.6149675_s4.jpg" width="57">'
    );

    this.equal(
      this.sanitize(
        '<img src="https://www.xing.com/img/users/1/2/7/f98db1f73.6149675_s4.jpg" alt="Christopher Blum" width="57" height="75" align="">',
        rules
      ),
      '<img alt="Christopher Blum" height="75" src="https://www.xing.com/img/users/1/2/7/f98db1f73.6149675_s4.jpg" width="57">'
    );

    this.equal(
      this.sanitize(
        '<img src="/img/users/1/2/7/f98db1f73.6149675_s4.jpg" alt="Christopher Blum" width="57" height="75">',
        rules
      ),
      '<img alt="Christopher Blum" height="75" width="57">'
    );

    this.equal(
      this.sanitize(
        '<img src="file://foobar.jpg" alt="Christopher Blum" width="57" height="75">',
        rules
      ),
      '<img alt="Christopher Blum" height="75" width="57">'
    );

    this.equal(
      this.sanitize(
        '<img src="https://www.xing.com/img/users/1/2/7/f98db1f73.6149675_s4.jpg" width="57" height="75">',
        rules
      ),
      '<img alt="" height="75" src="https://www.xing.com/img/users/1/2/7/f98db1f73.6149675_s4.jpg" width="57">'
    );

    this.equal(
      this.sanitize(
        '<img>',
        rules
      ),
      '<img alt="">'
    );
  });


  test("Advanced tests for 'br' elements", function() {
    var rules = {
      classes: {
        "wysiwyg-clear-both":   1,
        "wysiwyg-clear-left":   1,
        "wysiwyg-clear-right":  1
      },
      tags: {
        div: true,
        br: {
          add_class: {
            clear: "clear_br"
          }
        }
      }
    };

    this.equal(
      this.sanitize(
        '<div>foo<br clear="both">bar</div>',
        rules
      ),
      '<div>foo<br class="wysiwyg-clear-both">bar</div>'
    );

    this.equal(
      this.sanitize(
        '<div>foo<br clear="all">bar</div>',
        rules
      ),
      '<div>foo<br class="wysiwyg-clear-both">bar</div>'
    );

    this.equal(
      this.sanitize(
        '<div>foo<br clear="left" id="foo">bar</div>',
        rules
      ),
      '<div>foo<br class="wysiwyg-clear-left">bar</div>'
    );

    this.equal(
      this.sanitize(
        '<br clear="right">',
        rules
      ),
      '<br class="wysiwyg-clear-right">'
    );

    this.equal(
      this.sanitize(
        '<br clear="">',
        rules
      ),
      '<br>'
    );

    this.equal(
      this.sanitize(
        '<br clear="LEFT">',
        rules
      ),
      '<br class="wysiwyg-clear-left">'
    );
    
    this.equal(
      this.sanitize(
        '<br class="wysiwyg-clear-left">',
        rules
      ),
      '<br class="wysiwyg-clear-left">'
    );
    
    this.equal(
      this.sanitize(
        '<br clear="left" class="wysiwyg-clear-left">',
        rules
      ),
      '<br class="wysiwyg-clear-left">'
    );
    
    this.equal(
      this.sanitize(
        '<br clear="left" class="wysiwyg-clear-left wysiwyg-clear-right">',
        rules
      ),
      '<br class="wysiwyg-clear-left wysiwyg-clear-right">'
    );
    
    this.equal(
      this.sanitize(
        '<br clear="left" class="wysiwyg-clear-right">',
        rules
      ),
      '<br class="wysiwyg-clear-left wysiwyg-clear-right">'
    );
  });
  
  
  test("Advanced tests for 'font' elements", function() {
    var rules = {
      classes: {
        "wysiwyg-font-size-xx-small": 1,
        "wysiwyg-font-size-small":    1,
        "wysiwyg-font-size-medium":   1,
        "wysiwyg-font-size-large":    1,
        "wysiwyg-font-size-x-large":  1,
        "wysiwyg-font-size-xx-large": 1,
        "wysiwyg-font-size-smaller":  1,
        "wysiwyg-font-size-larger":   1
      },
      tags: {
        font: {
          add_class: { size: "size_font" },
          rename_tag: "span"
        }
      }
    };
    
    this.equal(
      this.sanitize(
        '<font size="1">foo</font>',
        rules
      ),
      '<span class="wysiwyg-font-size-xx-small">foo</span>'
    );
    
    this.equal(
      this.sanitize(
        '<font size="2">foo</font>',
        rules
      ),
      '<span class="wysiwyg-font-size-small">foo</span>'
    );
    
    this.equal(
      this.sanitize(
        '<font size="3">foo</font>',
        rules
      ),
      '<span class="wysiwyg-font-size-medium">foo</span>'
    );
    
    this.equal(
      this.sanitize(
        '<font size="4">foo</font>',
        rules
      ),
      '<span class="wysiwyg-font-size-large">foo</span>'
    );
    
    this.equal(
      this.sanitize(
        '<font size="5">foo</font>',
        rules
      ),
      '<span class="wysiwyg-font-size-x-large">foo</span>'
    );
    
    this.equal(
      this.sanitize(
        '<font size="6">foo</font>',
        rules
      ),
      '<span class="wysiwyg-font-size-xx-large">foo</span>'
    );
    
    this.equal(
      this.sanitize(
        '<font size="7">foo</font>',
        rules
      ),
      '<span class="wysiwyg-font-size-xx-large">foo</span>'
    );
    
    this.equal(
      this.sanitize(
        '<font size="+1">foo</font>',
        rules
      ),
      '<span class="wysiwyg-font-size-larger">foo</span>'
    );
    
    this.equal(
      this.sanitize(
        '<font size="-1">foo</font>',
        rules
      ),
      '<span class="wysiwyg-font-size-smaller">foo</span>'
    );
  });
  
  
  test("Check whether namespaces are handled correctly", function() {
    var rules = {
      tags: {
        p: true
      }
    };

    this.equal(
      this.sanitize("<o:p>foo</o:p>", rules),
      "<span>foo</span>",
      "Unknown tag with namespace gets renamed to span"
    );
  });
  
  
  test("Check whether classes are correctly treated", function() {
    var rules = {
      classes: {
        a: 1,
        c: 1
      },
      tags: {
        footer: "div"
      }
    };
    
    this.equal(
      this.sanitize('<header class="a b c">foo</header>', rules),
      '<span class="a c">foo</span>',
      "Allowed classes 'a' and 'c' are correctly kept and unknown class 'b' is correctly removed."
    );
    
    this.equal(
      this.sanitize('<footer class="ab c d" class="a">foo</footer>', rules),
      '<div class="c">foo</div>',
      "Allowed classes 'c' is correctly kept and unknown class 'b' is correctly removed."
    );
  });
  
  test("Check mailto links", function() {
    var rules = {
      tags: {
        a: {
          check_attributes: {
            href: "href"
          }
        }
      }
    };
    

    this.equal(
      this.sanitize('<a href="mailto:foo@bar.com">foo</a>', rules),
      '<a href="mailto:foo@bar.com">foo</a>',
      "'mailto:' urls are not stripped"
    );
  });

  test("Check anchor links", function() {
    var rules = {
      tags: {
        a: {
          check_attributes: {
            href: "href"
          }
        }
      }
    };

    this.equal(
      this.sanitize('<a href="#anchor">foo</a>', rules),
      '<a href="#anchor">foo</a>',
      "'#'-starting anchor urls are not stripped"
    );
  });
  
  test("Check custom data attributes", function() {
    var rules = {
      tags: {
        span: {
          check_attributes: {
            "data-max-width": "numbers"
          }
        }
      }
    };
    

    this.equal(
      this.sanitize('<span data-max-width="24px" data-min-width="25">foo</span>', rules),
      '<span data-max-width="24">foo</span>',
      "custom data attributes are not stripped"
    );
  });
  
  test("Check Firefox misbehavior with tilde characters in urls", function() {
    var rules = {
      tags: {
        a: {
          set_attributes: {
            target: "_blank",
            rel:    "nofollow"
          },
          check_attributes: {
            href:   "url"
          }
        }
      }
    };
    
    // See https://bugzilla.mozilla.org/show_bug.cgi?id=664398
    //
    // In Firefox this:
    //      var d = document.createElement("div");
    //      d.innerHTML ='<a href="~"></a>';
    //      d.innerHTML;
    // will result in:
    //      <a href="%7E"></a>
    // which is wrong
    ok(
      this.sanitize('<a href="http://google.com/~foo"></a>', rules).indexOf("~") !== -1
    );
  });
  
  test("Check concatenation of text nodes", function() {
    var rules = {
      tags: { span: 1, div: 1 }
    };
    
    var tree = document.createElement("div");
    tree.appendChild(document.createTextNode("foo "));
    tree.appendChild(document.createTextNode("bar baz "));
    tree.appendChild(document.createTextNode("bam! "));
    
    var span = document.createElement("span");
    span.innerHTML = "boobs! hihihi ...";
    tree.appendChild(span);
    
    var result = this.sanitize(tree, rules);
    equal(result.childNodes.length, 2);
    equal(result.innerHTML, "foo bar baz bam! <span>boobs! hihihi ...</span>");
  });
  
  test("Check element unwrapping", function() {
    var rules = {
      tags: { 
          div: {
              unwrap: 1
          },
          span: {
            unwrap: 1
          }
       }
    },
    input = "<div>Hi,<span> there<span></span>!</span></div>",
    output = "Hi, there!<br>";
    this.equal(this.sanitize(input, rules), output);
  });
  
  test("Check spacing when unwrapping elements", function() {
    var rules = {
      tags: { 
          table: {
              unwrap: 1
          },
          td: {
            unwrap: 1
          },
          tr: {
            unwrap: 1
          },
          tbody: {
            unwrap: 1
          },
          ul: {
            unwrap: 1
          },
          li: {
            unwrap: 1
          }
       }
    },
    input_list = "<ul><li>This</li><li>is</li><li>a</li><li>list</li></ul>",
    output_list = "This is a list<br>",
    input_table = "<table><tbody><tr><td>This</td><td>is</td><td>a</td><td>table</td></tr></tbody></table>",
    output_table = "This is a table<br>";
    
    this.equal(this.sanitize(input_list, rules), output_list, "List unwrapping working ok");
    this.equal(this.sanitize(input_table, rules), output_table, "Table unwrapping working ok");
  });
  
  test("Test valid type check by attributes", function() {
    var rules = {
      "type_definitions": {
        "valid_image_src": {
            "attrs": {
                "src": /^[^data\:]/i
            }
         }
      },
      "tags": {
          "img": {
              "one_of_type": {
                  "valid_image_src": 1
              },
              "check_attributes": {
                  "src": "src",
                  "height": "numbers",
                  "width": "numbers",
                  "alt": "alt"
              }
          }
       }
    },
    input = '<img src="data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" alt="alt" />',
    input_valid = '<img alt="" src="http://www.asd/a.jpg">',
    input_valid_2 = '<img src="http://reykjavik.edicy.co/photos/photo02.jpg" alt="" height="243" width="710">';
    
    this.equal(this.sanitize(input, rules), "", "Image with data src gets removed");
    this.equal(this.sanitize(input_valid, rules), input_valid, "Valid image is kept");
    this.equal(this.sanitize(input_valid_2, rules), input_valid_2, "Valid image is kept2");
  });

  test("Test valid type check and remove_action", function() {
    var rules = {
      "type_definitions": {
        "valid_element": {
          "classes": {
            "testclass": 1
          }
        }
      },
      "tags": {
        "div": {
          "one_of_type": {
            "valid_element": 1
          },
          "check_attributes": {
            "class": "any"
          },
          "remove_action": "rename",
          "remove_action_rename_to": "span"
        },
        "span": {
          "check_attributes": {
            "class": "any"
          }
        }
      }
    },
    input = '<div class="testclass">Test</div>',
    input2 = '<div class="otherclass">Test</div>',
    output2 = '<span class="otherclass">Test</span>';
    
    this.equal(this.sanitize(input, rules), input, "Div is kept as having valid class");
    this.equal(this.sanitize(input2, rules), output2, "Div is renamed to span when type declaration is not met");
  });

  test("Test valid type definition visible_content_object ", function() {
    var rules = {
      "type_definitions": {
        "visible_content_object": {
            "methods": {
                "has_visible_contet": 1
            }
        },
      },
      "tags": {
          'div': {
              "one_of_type": {
                  "visible_content_object": 1
              },
              "remove_action": "unwrap",
              "check_attributes": {
                  "style": "any"
              }
          },
          'img': {
            "check_attributes": {
              "src": "any"
            }
          },
          'span': {}
       }
    },
    input1 = '<div></div>',
    input2 = '<div>   <span>  </span>  </div>',
    input3 = '<div><img src="pic.jpg"></div>',
    input4 = '<div>test</div>',
    input5 = '<div style="width: 10px; height: 10px;">   <span>  </span>  </div>',
    tester = document.createElement('div');

    this.equal(this.sanitize(input1, rules), "<br>", "Empty DIV gets removed");
    this.equal(this.sanitize(input2, rules), "   <span>  </span>  <br>", "DIV with no textual content gets unwrapped");

    QUnit.equal(this.sanitize(input3, rules), input3, "DIV with img inside is kept");
    this.equal(this.sanitize(input4, rules), input4, "DIV with textual content is kept");

    document.body.appendChild(tester);

    tester.innerHTML = input2;
    this.equal(this.sanitize(tester, rules).innerHTML, "   <span>  </span>  <br>", "DIV with no dimesions and in dom gets unwrapped");

    tester.innerHTML = input5;
    this.equal(this.sanitize(tester, rules).innerHTML, input5 , "DIV with dimensions and in dom is kept");

  });

  test("Test keeping comments ", function() {
    var rules = {
      "comments": 1
    },
    input = 'Test <!-- some comment -->';
    this.equal(this.sanitize(input, rules), input, "Comments are kept if configured to keep");
  });

  test("Test global valid attributes for all elements ", function() {
    var rules = {
          "attributes": {
              "id": "any",
              "data-*": "any"
          },
          "tags": {
            'div': {},
            'span': {
              "check_attributes": {
                "data-*": "numbers"
              }
            }
          }
        },
        rules2 = {
          "attributes": {
              "id": "any",
              "data-*": "any"
          },
          "tags": {
            'div': {}
          }
        },
        input1 = '<div id="test">Test</div>',
        input2 = '<div class="test">Test</div>',
        output2 = '<div>Test</div>',
        input3 = '<div data-name="test" data-value="test">Test</div>',
        input4 = '<span data-name="test" data-value="1234">Test</span>',
        output4 = '<span data-value="1234">Test</span>';

    this.equal(this.sanitize(input1, rules), input1, "Global attribute allows id for all elements and div is allowewd tag and kept");
    this.equal(this.sanitize(input1, rules2), input1, "Global attribute allows id for all elements and div is allowewd tag and kept even if no check_attributes");
    this.equal(this.sanitize(input2, rules), output2, "Div is kept but attribute 'class' is not allowed locally and globally, so it is removed.");
    this.equal(this.sanitize(input3, rules), input3, "Global eattribute configuration allows all attributes beginning with 'data-'.");
    this.equal(this.sanitize(input4, rules), output4, "Local check_attributes overwrites global attributes");
  
  });

  test("Test classes blacklist ", function() {
    var rules = {
      "classes": "any",
      "classes_blacklist": {
        "Apple-interchange-newline": 1
      },
      "tags": {
        'span': {
        }
      }
    },
    input1 = '<span class="Apple-interchange-newline">Test</span',
    output1 = '<span>Test</span>',
    input2 = '<span class="SomeClass">Test</span>',
    input3 = '<span class="SomeClass Apple-interchange-newline">Test</span>';

    this.equal(this.sanitize(input1, rules), output1, "Blacklist class removed");
    this.equal(this.sanitize(input2, rules), input2, "Other class kept");
    this.equal(this.sanitize(input3, rules), input2, "Other class kept, but blacklisted class removed");

  
  });
}
