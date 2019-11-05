wysihtml.commands.addTableCells = {
  exec: function(composer, command, value) {
    if (composer.tableSelection && composer.tableSelection.start && composer.tableSelection.end) {

      // switches start and end if start is bigger than end (reverse selection)
      var tableSelect = wysihtml.dom.table.orderSelectionEnds(composer.tableSelection.start, composer.tableSelection.end);
      if (value == 'before' || value == 'above') {
        wysihtml.dom.table.addCells(tableSelect.start, value);
      } else if (value == 'after' || value == 'below') {
        wysihtml.dom.table.addCells(tableSelect.end, value);
      }
      setTimeout(function() {
        composer.tableSelection.select(tableSelect.start, tableSelect.end);
      },0);
    }
  },

  state: function(composer, command) {
    return false;
  }
};
