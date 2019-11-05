wysihtml.commands.createTable = {
  exec: function(composer, command, value) {
    var col, row, html;
    if (value && value.cols && value.rows && parseInt(value.cols, 10) > 0 && parseInt(value.rows, 10) > 0) {
      if (value.tableStyle) {
        html = '<table style="' + value.tableStyle + '">';
      } else {
        html = '<table>';
      }
      html += '<tbody>';
      for (row = 0; row < value.rows; row ++) {
        html += '<tr>';
        for (col = 0; col < value.cols; col ++) {
          html += '<td><br></td>';
        }
        html += '</tr>';
      }
      html += '</tbody></table>';
      composer.commands.exec('insertHTML', html);
    }
  },

  state: function(composer, command) {
    return false;
  }
};
