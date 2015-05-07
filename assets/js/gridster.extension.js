'use strict';

// some of gridster functions will be overridden by this file

(function ($) {
    Gridster.prototype.move_widget = function ($widget, new_col, new_row, callback) {

        console.log('move to [' + new_col + ', ' + new_row + ']');

        var wgd = $widget.coords().grid;

        var maxCols = gridster.options.max_cols;
        var maxColsAfterMove = wgd.size_x + new_col - 1;

        if (maxColsAfterMove > maxCols) {
            new_col = new_col - (maxColsAfterMove - maxCols);
        }

        var new_grid_data = {
            col: new_col,
            row: new_row,
            size_x: wgd.size_x,
            size_y: wgd.size_y
        };

        this.mutate_widget_in_gridmap($widget, wgd, new_grid_data);

        this.set_dom_grid_height();
        this.set_dom_grid_width();

        if (callback) {
            callback.call(this, new_grid_data.size_x, new_grid_data.size_y);
        }

        return $widget;
    };



    /**
* Remove a widget from the grid.
*
* @method remove_widget
* @param {HTMLElement} el The jQuery wrapped HTMLElement you want to remove.
* @param {Boolean|Function} silent If true, widgets below the removed one
* will not move up. If a Function is passed it will be used as callback.
* @param {Function} callback Function executed when the widget is removed.
* @return {Class} Returns the instance of the Gridster Class.
*/
    Gridster.prototype.remove_widget = function (el, silent, callback) {
        var $el = el instanceof $ ? el : $(el);
        var wgd = $el.coords().grid;

        // if silent is a function assume it's a callback
        if ($.isFunction(silent)) {
            callback = silent;
            silent = false;
        }

        this.cells_occupied_by_placeholder = {};
        this.$widgets = this.$widgets.not($el);

        var $nexts = this.widgets_below($el);

        this.remove_from_gridmap(wgd);

        //$el.fadeOut($.proxy(function () {
            $el.remove();

            if (!silent) {
                $nexts.each($.proxy(function (i, widget) {
                    this.move_widget_up($(widget), wgd.size_y);
                }, this));
            }

            this.set_dom_grid_height();

            if (callback) {
                callback.call(this, el);
            }
        //}, this));

        return this;
    };
})(jQuery);
