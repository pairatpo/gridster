'use strict';

// some of gridster functions will be overridden by this file

(function ($) {

    /**
    * Add a new widget to the grid.
    *
    * @method add_widget
    * @param {String|HTMLElement} html The string representing the HTML of the widget or the HTMLElement.
    * @param {Number} [size_x] The nº of rows the widget occupies horizontally.
    * @param {Number} [size_y] The nº of columns the widget occupies vertically.
    * @param {Number} [col] The column the widget should start in.
    * @param {Number} [row] The row the widget should start in.
    * @param {Array} [max_size] max_size Maximun size (in units) for width and height.
    * @param {Array} [min_size] min_size Minimum size (in units) for width and height.
    * @return {HTMLElement} Returns the jQuery wrapped HTMLElement representing the widget that was just created.
    */
    Gridster.prototype.add_widget = function (html, size_x, size_y, col, row, max_size, min_size, last_size, isBatch, callbacks) {

        //console.log('#####################################################################');

        //console.log('name : ' + html.attr('name'));
        //console.log('size_x : ' + size_x);
        //console.log('size_y : ' + size_y);
        //console.log('col : ' + col);
        //console.log('row : ' + row);
        //console.log('max_size : ' + max_size);
        //console.log('min_size : ' + min_size);
        //console.log('last_size : ' + last_size);

        if (this.options.max_widgets && (this.$widgets.length >= this.options.max_widgets)) {
            if (callbacks && callbacks[0]) callbacks[0];
            return;
        }

        var pos;
        size_x || (size_x = 1);
        size_y || (size_y = 1);

        if (!col & !row) {
            pos = this.next_position(size_x, size_y);

            //console.log('pos : ' + JSON.stringify(pos));
        } else {
            pos = {
                col: col,
                row: row,
                size_x: size_x,
                size_y: size_y
            };

            this.empty_cells(col, row, size_x, size_y);

            //console.log('pos : ' + JSON.stringify(pos));
        }



        // var $w = $(html).attr({
        //     'data-col': pos.col,
        //     'data-row': pos.row,
        //     'data-sizex': size_x,
        //     'data-sizey': size_y,
        //     'data-max-sizex': max_size[0],
        //     'data-max-sizey': max_size[1],
        //     'data-min-sizex': min_size[0],
        //     'data-min-sizey': min_size[1],
        //     'last-sizey': last_size || size_y,
        // }).addClass('gs-w').appendTo(this.$el).hide();

        var attr = {
            'data-col': pos.col,
            'data-row': pos.row,
            'data-sizex': pos.size_x,
            'data-sizey': pos.size_y,
            'last-sizey': last_size || pos.size_y
        };

        if (max_size) {
            attr['data-max-sizex'] = max_size[0];
            attr['data-max-sizey'] = max_size[1];
        }
        if (min_size) {
            attr['data-min-sizex'] = min_size[0];
            attr['data-min-sizey'] = min_size[1];
        }

        //console.log('attr : ' + JSON.stringify(attr));

        var array = [attr['last-sizey'], attr['data-sizey']];
        var largest = Math.max.apply(Math, array); // 306


        //console.log('this.rows (before) : ' + this.rows);

        if ((pos.row - 1 + largest) > this.rows) {
            //this.add_faux_rows((pos.row - 1 + (largest)) - this.rows);
            this.add_faux_rows(largest);
        }

        //console.log('this.rows (after) : ' + this.rows);

        var $w = $(html).attr(attr).addClass('gs-w').appendTo(this.$el); //.hide();


        this.$widgets = this.$widgets.add($w);

        this.register_widget($w);


        //// if (pos.row * pos.size_y > this.rows) {
        //this.add_faux_rows(largest);
        //// }
        //this.add_faux_cols(pos.size_x);

        if (max_size) {
            this.set_widget_max_size($w, max_size);
        }

        if (min_size) {
            this.set_widget_min_size($w, min_size);
        }

        this.set_dom_grid_width();
        this.set_dom_grid_height();

        this.drag_api.set_limits(this.cols * this.min_widget_width);

        if (!isBatch) {
            //this.remove_style_tags();
            this.generate_stylesheet();
        }
        return $w; //$w.fadeIn();
    };



    /**
    * Resizing widget_base_dimensions
    *
    * @method resizeBaseDimension
    * @param {Array} [newBaseDimension] new size in unit the widget that was just created.
    */
    Gridster.prototype.resizeBaseDimension = function (newBaseDimension) {
        // this.options.widget_base_dimensions = newBaseDimension;
        // this.recalculate_faux_grid();
        // this.remove_style_tags();
        // this.generate_stylesheet();

        // this.container_width = this.cols * this.min_widget_width;
        // this.$el.css('width', this.container_width);

        // reassign base dimension & recalculate wrapper width
        this.options.widget_base_dimensions = newBaseDimension;
        this.wrapper_width = this.$wrapper.width();
        this.min_widget_width = (this.options.widget_margins[0] * 2) + this.options.widget_base_dimensions[0];

        // remove css style tags
        //this.remove_style_tags();
        this.set_dom_grid_width();
        this.recalculate_faux_grid();

        $.each(this.$widgets, $.proxy(function (index, widget) {
            var $wdg = $(widget);
            var wdg = $wdg.coords().grid;
            var gridData = {
                col: wdg.col,
                row: wdg.row,
                size_x: wdg.size_x,
                size_y: wdg.size_y
            };

            this.mutate_widget_in_gridmap($wdg, wdg, gridData);
        }, this));

        this.drag_api.set_limits(this.cols * this.min_widget_width);
        this.generate_stylesheet();
    };

    /**
    * Collapse widget
    *   
    * @param el element to collapse
    */
    Gridster.prototype.collapseWidget = function (el) {
        var collapseSizeY = (this.options.collapse_size_y || 1);

        var $el = el.parent() instanceof $ ? el.parent() : angular.element(el.parent());

        var newSizeY = 1;
        var newSizeX = parseInt($el.attr('data-sizex'), 10);

        this.resize_widget($el, newSizeX, newSizeY);

        if (this.options.resize.enabled) {
            el.next().removeClass('gs-resize-handle');
        }
    };

    /**
    * Expand widget
    *   
    * @param el element to expand
    */
    Gridster.prototype.expandWidget = function (el) {
        var collapseSizeY = (this.options.collapse_size_y || 1);

        var $el = el.parent() instanceof $ ? el.parent() : angular.element(el.parent());

        var newSizeY = parseInt($el.attr('last-sizey'), 10);
        var newSizeX = parseInt($el.attr('data-sizex'), 10);

        this.resize_widget($el, newSizeX, newSizeY);

        if (this.options.resize.enabled) {
            el.next().addClass('gs-resize-handle');
        }
    };


    /**
    * Sorts an Array of grid coords objects (representing the grid coords of each widget) in descending way.
    *
    * @method manage_movements
    * @param {jQuery} $widgets A jQuery collection of HTMLElements representing the widgets you want to move.
    * @param {Number} to_col The column to which we want to move the widgets.
    * @param {Number} to_row The row to which we want to move the widgets.
    * @return {Class} Returns the instance of the Gridster Class.
    */
    Gridster.prototype.manage_movements = function ($widgets, to_col, to_row) {
        //console.log('to_col: ' + to_col);
        //console.log('to_row: ' + to_row);
        //console.log('------------------');
        $.each($widgets, $.proxy(function (i, w) {
            var wgd = w;
            var $w = wgd.el;

            var can_go_widget_up = this.can_go_widget_up(wgd);

            if (can_go_widget_up) {
                //target CAN go up
                //so move widget up
                this.move_widget_to($w, can_go_widget_up);
                this.set_placeholder(to_col, can_go_widget_up + wgd.size_y);

            } else {
                //target can't go up
                var can_go_player_up = this.can_go_player_up(
                    this.player_grid_data);

                if (!can_go_player_up) {
                    // target can't go up
                    // player cant't go up
                    // so we need to move widget down to a position that dont
                    // overlaps player
                    var y = (to_row + this.player_grid_data.size_y) - wgd.row;

                    this.move_widget_down($w, y);
                    this.set_placeholder(to_col, to_row);
                }
            }
        }, this));

        return this;
    };

    /**
    * Determines whether a widget can move to a position above.
    *
    * @method can_go_widget_up
    * @param {Object} widget_grid_data The actual grid coords object of the widget we want to check.
    * @return {Number|Boolean} If the widget can be moved to an upper row returns the row number, else returns false.
    */
    Gridster.prototype.can_go_widget_up = function (widget_grid_data) {
        //console.log(widget_grid_data);  /////////////
        var p_bottom_row = widget_grid_data.row + widget_grid_data.size_y - 1;
        var result = true;
        var upper_rows = [];
        var min_row = 10000;

        /* generate an array with columns as index and array with topmost rows
         * empty as value */
        this.for_each_column_occupied(widget_grid_data, function (tcol) {
            var grid_col = this.gridmap[tcol];
            upper_rows[tcol] = [];

            var r = p_bottom_row + 1;
            // iterate over each row
            while (--r > 0) {
                if (this.is_widget(tcol, r) && !this.is_player_in(tcol, r)) {
                    if (!grid_col[r].is(widget_grid_data.el)) {
                        break;
                    }
                }

                if (!this.is_player(tcol, r) &&
                    !this.is_placeholder_in(tcol, r) &&
                    !this.is_player_in(tcol, r)) {
                    upper_rows[tcol].push(r);
                }

                if (r < min_row) {
                    min_row = r;
                }
            }

            if (upper_rows[tcol].length === 0) {
                result = false;
                return true; //break
            }

            upper_rows[tcol].sort(function (a, b) {
                return a - b;
            });
        });

        //console.log(result);  /////////////
        if (!result) { return false; }

        var returnResult = this.get_valid_rows(widget_grid_data, upper_rows, min_row);
        //console.log(returnResult);  /////////////

        return returnResult;
    };

    /**
     * Set the current height of the parent grid.
     *
     * @method set_dom_grid_height
     * @return {Object} Returns the instance of the Gridster class.
     */
    Gridster.prototype.set_dom_grid_height = function (height) {
        if (typeof height === 'undefined') {
            var r = this.get_highest_occupied_cell().row;
            height = r * this.min_widget_height;
        }

        this.container_height = this.$widgets.length > 0 ? height : 0;
        this.$el.css('height', this.container_height);
        return this;
    };

    /**
    * Remove a widget from the grid.
    *
    * @method remove_widget
    * @param {HTMLElement} el The jQuery wrapped HTMLElement you want to remove.
    * @param {Boolean|Function} silent If true, widgets below the removed one will not move up. If a Function is passed it will be used as callback.
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

    /**
    * Remove the style tag with the associated id from the head of the document
    *
    * @method  remove_style_tag
    * @return {Object} Returns the instance of the Gridster class.
    */
    Gridster.prototype.remove_style_tags = function () {
        var all_styles = Gridster.generated_stylesheets;
        var ins_styles = this.generated_stylesheets;

        this.$style_tags.remove();
        this.$style_tags = $([]);

        Gridster.generated_stylesheets = $.map(all_styles, function (s) {
            if ($.inArray(s, ins_styles) === -1) { return s; }
        });
    };




    /**
     * Move widget position programmatically
     * @param $widget widget to move
     * @param new_col new column position in unit
     * @param new_row new row position in unit
     * @param callback
     */
    Gridster.prototype.move_widget = function ($widget, new_col, new_row, callback) {

        //console.log('move to [' + new_col + ', ' + new_row + ']');

        //console.log('# gridster, $widget : ');
        //console.log($widget);

        var wgd = $widget.coords().grid;
        //console.log('# gridster, wgd : ');
        //console.log(wgd);

        //var maxCols = this.options.max_cols;
        //var maxColsAfterMove = wgd.size_x + new_col - 1;

        //if (maxColsAfterMove > maxCols) {
        //    new_col = new_col - (maxColsAfterMove - maxCols);
        //}

        var new_grid_data = {
            col: new_col,
            row: new_row,
            size_x: wgd.size_x,
            size_y: wgd.size_y,
            last_size: wgd.last_size
        };
        //console.log('# gridster, new_grid_data : ');
        //console.log(new_grid_data);

        this.mutate_widget_in_gridmap($widget, wgd, new_grid_data);

        this.set_dom_grid_height();
        this.set_dom_grid_width();

        if (callback) {
            callback.call(this, new_grid_data.size_x, new_grid_data.size_y);
        }

        return $widget;
    };



    /**
    * Change the size of a widget. Width is limited to the current grid width.
    *
    * @method resize_widget
    * @param {HTMLElement} $widget The jQuery wrapped HTMLElement representing the widget.
    * @param {Number} size_x The number of columns that will occupy the widget. By default <code>size_x</code> is limited to the space available from the column where the widget begins, until the last column to the right.
    * @param {Number} size_y The number of rows that will occupy the widget.
    * @param {Function} [callback] Function executed when the widget is removed.
    * @return {HTMLElement} Returns $widget.
    */
    Gridster.prototype.resize_widget = function ($widget, size_x, size_y, callback) {
        var wgd = $widget.coords().grid;
        var col = wgd.col;
        var max_cols = this.options.max_cols;
        var old_size_y = wgd.size_y;
        var old_col = wgd.col;
        var new_col = old_col;
        var last_size = parseInt($widget.attr('last-sizey'));

        size_x || (size_x = wgd.size_x);
        size_y || (size_y = wgd.size_y);

        if (max_cols !== Infinity) {
            size_x = Math.min(size_x, max_cols - col + 1);
        }

        if (size_y > old_size_y) {
            this.add_faux_rows(Math.max(size_y - old_size_y, 0));
        }

        var player_rcol = (col + size_x - 1);
        if (player_rcol > this.cols) {
            this.add_faux_cols(player_rcol - this.cols);
        }

        var new_grid_data = {
            col: new_col,
            row: wgd.row,
            size_x: size_x,
            size_y: size_y,
            last_size: isNaN(last_size) ? size_y : last_size
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
    * Mutate widget dimensions and position in the grid map.
    *
    * @method mutate_widget_in_gridmap
    * @param {HTMLElement} $widget The jQuery wrapped HTMLElement representing the widget to mutate.
    * @param {Object} wgd Current widget grid data (col, row, size_x, size_y).
    * @param {Object} new_wgd New widget grid data.
    * @return {HTMLElement} Returns instance of gridster Class.
    */
    Gridster.prototype.mutate_widget_in_gridmap = function ($widget, wgd, new_wgd) {
        var old_size_x = wgd.size_x;
        var old_size_y = wgd.size_y;

        var old_cells_occupied = this.get_cells_occupied(wgd);
        var new_cells_occupied = this.get_cells_occupied(new_wgd);

        var empty_cols = [];
        $.each(old_cells_occupied.cols, function (i, col) {
            if ($.inArray(col, new_cells_occupied.cols) === -1) {
                empty_cols.push(col);
            }
        });

        var occupied_cols = [];
        $.each(new_cells_occupied.cols, function (i, col) {
            if ($.inArray(col, old_cells_occupied.cols) === -1) {
                occupied_cols.push(col);
            }
        });

        var empty_rows = [];
        $.each(old_cells_occupied.rows, function (i, row) {
            if ($.inArray(row, new_cells_occupied.rows) === -1) {
                empty_rows.push(row);
            }
        });

        var occupied_rows = [];
        $.each(new_cells_occupied.rows, function (i, row) {
            if ($.inArray(row, old_cells_occupied.rows) === -1) {
                occupied_rows.push(row);
            }
        });

        this.remove_from_gridmap(wgd);

        if (occupied_cols.length) {
            var cols_to_empty = [
                new_wgd.col, new_wgd.row, new_wgd.size_x, Math.min(old_size_y, new_wgd.size_y), $widget
            ];
            this.empty_cells.apply(this, cols_to_empty);
        }

        if (occupied_rows.length) {
            var rows_to_empty = [new_wgd.col, new_wgd.row, new_wgd.size_x, new_wgd.size_y, $widget];
            this.empty_cells.apply(this, rows_to_empty);
        }

        // not the same that wgd = new_wgd;
        wgd.col = new_wgd.col;
        wgd.row = new_wgd.row;
        wgd.size_x = new_wgd.size_x;
        wgd.size_y = new_wgd.size_y;

        this.add_to_gridmap(new_wgd, $widget);

        $widget.removeClass('player-revert');

        //update coords instance attributes
        $widget.data('coords').update({
            width: (new_wgd.size_x * this.options.widget_base_dimensions[0] +
                ((new_wgd.size_x - 1) * this.options.widget_margins[0]) * 2),
            height: (new_wgd.size_y * this.options.widget_base_dimensions[1] +
                ((new_wgd.size_y - 1) * this.options.widget_margins[1]) * 2)
        });

        $widget.attr({
            'data-col': new_wgd.col,
            'data-row': new_wgd.row,
            'data-sizex': new_wgd.size_x,
            'data-sizey': new_wgd.size_y,
            'last-sizey': new_wgd.last_size || new_wgd.size_y
        });

        if (empty_cols.length) {
            var cols_to_remove_holes = [
                empty_cols[0], new_wgd.row,
                empty_cols.length,
                Math.min(old_size_y, new_wgd.size_y),
                $widget
            ];

            this.remove_empty_cells.apply(this, cols_to_remove_holes);
        }

        if (empty_rows.length) {
            var rows_to_remove_holes = [
                new_wgd.col, new_wgd.row, new_wgd.size_x, new_wgd.size_y, $widget
            ];
            this.remove_empty_cells.apply(this, rows_to_remove_holes);
        }

        this.move_widget_up($widget);

        return this;
    };
})(jQuery);
