(function() {
  var WHITE_SPACE_START = /^\s+/,
      WHITE_SPACE_END   = /\s+$/,
      ENTITY_REG_EXP    = /[&<>\t"]/g,
      ENTITY_MAP = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': "&quot;",
        '\t':"&nbsp; "
      };
  wysihtml.lang.string = function(str) {
    str = String(str);
    return {
      /**
       * @example
       *    wysihtml.lang.string("   foo   ").trim();
       *    // => "foo"
       */
      trim: function() {
        return str.replace(WHITE_SPACE_START, "").replace(WHITE_SPACE_END, "");
      },

      /**
       * @example
       *    wysihtml.lang.string("Hello #{name}").interpolate({ name: "Christopher" });
       *    // => "Hello Christopher"
       */
      interpolate: function(vars) {
        for (var i in vars) {
          str = this.replace("#{" + i + "}").by(vars[i]);
        }
        return str;
      },

      /**
       * @example
       *    wysihtml.lang.string("Hello Tom").replace("Tom").with("Hans");
       *    // => "Hello Hans"
       */
      replace: function(search) {
        return {
          by: function(replace) {
            return str.split(search).join(replace);
          }
        };
      },

      /**
       * @example
       *    wysihtml.lang.string("hello<br>").escapeHTML();
       *    // => "hello&lt;br&gt;"
       */
      escapeHTML: function(linebreaks, convertSpaces) {
        var html = str.replace(ENTITY_REG_EXP, function(c) { return ENTITY_MAP[c]; });
        if (linebreaks) {
          html = html.replace(/(?:\r\n|\r|\n)/g, '<br />');
        }
        if (convertSpaces) {
          html = html.replace(/  /gi, "&nbsp; ");
        }
        return html;
      }
    };
  };
})();
