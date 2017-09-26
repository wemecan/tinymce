define(
  'ephox.snooker.selection.CellBounds',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.snooker.model.Warehouse'
  ],

  function (Fun, Option, Warehouse) {
    var inSelection = function (bounds, detail) {
      var leftEdge = detail.column();
      var rightEdge = detail.column() + detail.colspan() - 1;
      var topEdge = detail.row();
      var bottomEdge = detail.row() + detail.rowspan() - 1;
      return (
        leftEdge <= bounds.finishCol() && rightEdge >= bounds.startCol()
      ) && (
        topEdge <= bounds.finishRow() && bottomEdge >= bounds.startRow()
      );
    };

    // Note, something is *within* if it is completely contained within the bounds.
    var isWithin = function (bounds, detail) {
      return (
        detail.column() >= bounds.startCol() &&
        (detail.column() + detail.colspan() - 1) <= bounds.finishCol() &&
        detail.row() >= bounds.startRow() &&
        (detail.row() + detail.rowspan() - 1) <= bounds.finishRow()
      );
    };

    var isRectangular = function (warehouse, bounds) {
      var isRect = true;
      var detailIsWithin = Fun.curry(isWithin, bounds);

      for (var i = bounds.startRow(); i<=bounds.finishRow(); i++) {
        for (var j = bounds.startCol(); j<=bounds.finishCol(); j++) {
          isRect = isRect && Warehouse.getAt(warehouse, i, j).exists(detailIsWithin);
        }
      }

      return isRect ? Option.some(bounds) : Option.none();
    };


    return {
      inSelection: inSelection,
      isWithin: isWithin,
      isRectangular: isRectangular
    };
  }
);