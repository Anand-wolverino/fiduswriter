/* This file has been automatically generated. DO NOT EDIT IT. 
 Changes will be overwritten. Edit bibliography-overview.es6.js and run ./es6-transpile.sh */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _overview = require("./es6_modules/bibliography/overview/overview");

var theBibOverview = new _overview.BibliographyOverview();

window.theBibOverview = theBibOverview;

},{"./es6_modules/bibliography/overview/overview":5}],2:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FW_LOCALSTORAGE_VERSION = "1.0";

var BibliographyDB = exports.BibliographyDB = (function () {
    function BibliographyDB(docOwnerId, useLocalStorage, oldBibDB, oldBibCats) {
        _classCallCheck(this, BibliographyDB);

        this.docOwnerId = docOwnerId;
        this.useLocalStorage = useLocalStorage; // Whether to use local storage to cache result
        if (oldBibDB) {
            this.bibDB = oldBibDB;
        } else {
            this.bibDB = {};
        }
        if (oldBibCats) {
            this.bibCats = oldBibCats;
        } else {
            this.bibCats = [];
        }
    }

    // EXPORT
    /** Get the bibliography from the server and create as window.BibDB.
     * @function getBibDB
     * @param callback Will be called afterward.
     */

    _createClass(BibliographyDB, [{
        key: 'getBibDB',
        value: function getBibDB(callback) {

            var lastModified = -1,
                numberOfEntries = -1,
                that = this;

            if (this.useLocalStorage) {
                var _lastModified = parseInt(localStorage.getItem('last_modified_biblist')),
                    _numberOfEntries = parseInt(localStorage.getItem('number_of_entries')),
                    localStorageVersion = localStorage.getItem('version'),
                    localStorageOwnerId = parseInt(localStorage.getItem('owner_id'));
                that = this;

                // A dictionary to look up bib fields by their fw type name. Needed for translation to CSL and Biblatex.
                //jQuery('#bibliography').dataTable().fnDestroy()
                //Fill BibDB

                if (_.isNaN(_lastModified)) {
                    _lastModified = -1;
                }

                if (_.isNaN(_numberOfEntries)) {
                    _numberOfEntries = -1;
                }

                if (localStorageVersion != FW_LOCALSTORAGE_VERSION || localStorageOwnerId != this.docOwnerId) {
                    _lastModified = -1;
                    _numberOfEntries = -1;
                }
            }

            $.activateWait();

            $.ajax({
                url: '/bibliography/biblist/',
                data: {
                    'owner_id': that.docOwnerId,
                    'last_modified': lastModified,
                    'number_of_entries': numberOfEntries
                },
                type: 'POST',
                dataType: 'json',
                success: function success(response, textStatus, jqXHR) {

                    var newBibCats = response.bibCategories;
                    newBibCats.forEach(function (bibCat) {
                        that.bibCats.push(bibCat);
                    });

                    var bibList = [];

                    if (that.useLocalStorage) {
                        if (response.hasOwnProperty('bibList')) {
                            bibList = response.bibList;
                            try {
                                localStorage.setItem('biblist', JSON.stringify(response.bibList));
                                localStorage.setItem('last_modified_biblist', response.last_modified);
                                localStorage.setItem('number_of_entries', response.number_of_entries);
                                localStorage.setItem('owner_id', response.that.docOwnerId);
                                localStorage.setItem('version', FW_LOCALSTORAGE_VERSION);
                            } catch (error) {
                                // The local storage was likely too small
                            }
                        } else {
                                bibList = JSON.parse(localStorage.getItem('biblist'));
                            }
                    } else {
                        bibList = response.bibList;
                    }
                    var newBibPks = [];
                    for (var i = 0; i < bibList.length; i++) {
                        newBibPks.push(that.serverBibItemToBibDB(bibList[i]));
                    }
                    if (callback) {
                        callback(newBibPks, newBibCats);
                    }
                },
                error: function error(jqXHR, textStatus, errorThrown) {
                    $.addAlert('error', jqXHR.responseText);
                },
                complete: function complete() {
                    $.deactivateWait();
                }
            });
        }

        /** Converts a bibliography item as it arrives from the server to a BibDB object.
         * @function serverBibItemToBibDB
         * @param item The bibliography item from the server.
         */
        // NO EXPORT!

    }, {
        key: 'serverBibItemToBibDB',
        value: function serverBibItemToBibDB(item) {
            var id = item['id'];
            var aBibDBEntry = JSON.parse(item['fields']);
            aBibDBEntry['entry_type'] = item['entry_type'];
            aBibDBEntry['entry_key'] = item['entry_key'];
            aBibDBEntry['entry_cat'] = item['entry_cat'];
            this.bibDB[id] = aBibDBEntry;
            return id;
        }

        /** Saves a bibliography entry to the database on the server.
         * @function createBibEntry
         * @param post_data The bibliography data to send to the server.
         */

    }, {
        key: 'createBibEntry',
        value: function createBibEntry(postData, callback) {
            var that = this;
            $.activateWait();
            $.ajax({
                url: '/bibliography/save/',
                data: postData,
                type: 'POST',
                dataType: 'json',
                success: function success(response, textStatus, jqXHR) {
                    if (that.displayCreateBibEntryError(response.errormsg)) {
                        $.addAlert('success', gettext('The bibliography has been updated'));
                        var newBibPks = [];
                        var bibList = response.values;
                        for (var i = 0; i < bibList.length; i++) {
                            newBibPks.push(that.serverBibItemToBibDB(bibList[i]));
                        }
                        if (callback) {
                            callback(newBibPks);
                        }
                    } else {
                        $.addAlert('error', gettext('Some errors are found. Please examine the form.'));
                    }
                },
                error: function error(jqXHR, textStatus, errorThrown) {
                    $.addAlert('error', errorThrown);
                },
                complete: function complete() {
                    $.deactivateWait();
                }
            });
        }

        /** Displays an error on bibliography entry creation
         * @function displayCreateBibEntryError
         * @param errors Errors to be displayed
         */

    }, {
        key: 'displayCreateBibEntryError',
        value: function displayCreateBibEntryError(errors) {
            var noError = true;
            for (var eKey in errors) {
                eMsg = '<div class="warning">' + errors[eKey] + '</div>';
                if ('error' == eKey) {
                    jQuery('#createbook').prepend(eMsg);
                } else {
                    jQuery('#id_' + eKey).after(eMsg);
                }
                noError = false;
            }
            return noError;
        }

        /** Update or create new category
         * @function createCategory
         * @param cats The category objects to add.
         */

    }, {
        key: 'createCategory',
        value: function createCategory(cats, callback) {
            var that = this;
            var postData = {
                'ids[]': cats.ids,
                'titles[]': cats.titles
            };
            $.activateWait();
            $.ajax({
                url: '/bibliography/save_category/',
                data: postData,
                type: 'POST',
                dataType: 'json',
                success: function success(response, textStatus, jqXHR) {
                    if (jqXHR.status == 201) {
                        var bibCats = response.entries; // We receive both existing and new categories.
                        // Replace the old with the new categories, but don't lose the link to the array (so delete each, then add each).
                        while (that.bibCats.length > 0) {
                            that.bibCats.pop();
                        }
                        while (bibCats.length > 0) {
                            that.bibCats.push(bibCats.pop());
                        }

                        $.addAlert('success', gettext('The categories have been updated'));
                        if (callback) {
                            callback(that.bibCats);
                        }
                    }
                },
                error: function error(jqXHR, textStatus, errorThrown) {
                    $.addAlert('error', jqXHR.responseText);
                },
                complete: function complete() {
                    $.deactivateWait();
                }
            });
        }

        /** Delete a categories
         * @function deleteCategory
         * @param ids A list of ids to delete.
         */

    }, {
        key: 'deleteCategory',
        value: function deleteCategory(ids, callback) {

            var postData = {
                'ids[]': ids
            },
                that = this;
            $.ajax({
                url: '/bibliography/delete_category/',
                data: postData,
                type: 'POST',
                dataType: 'json',
                success: function success(response, textStatus, jqXHR) {
                    var deletedPks = ids.slice();
                    var deletedBibCats = [];
                    that.bibCats.forEach(function (bibCat) {
                        if (ids.indexOf(bibCat.id) !== -1) {
                            deletedBibCats.push(bibCat);
                        }
                    });
                    deletedBibCats.forEach(function (bibCat) {
                        var index = that.bibCats.indexOf(bibCat);
                        that.bibCats.splice(index, 1);
                    });
                    if (callback) {
                        callback(deletedPks);
                    }
                }
            });
        }

        /** Delete a list of bibliography items both locally and on the server.
         * @function deleteBibEntry
         * @param ids A list of bibliography item ids that are to be deleted.
         */

    }, {
        key: 'deleteBibEntry',
        value: function deleteBibEntry(ids, callback) {
            var that = this;
            for (var i = 0; i < ids.length; i++) {
                ids[i] = parseInt(ids[i]);
            }
            var postData = {
                'ids[]': ids
            };
            $.activateWait();
            $.ajax({
                url: '/bibliography/delete/',
                data: postData,
                type: 'POST',
                success: function success(response, textStatus, jqXHR) {
                    for (var i = 0; i < ids.length; i++) {
                        delete that.bibDB[ids[i]];
                    }
                    $.addAlert('success', gettext('The bibliography item(s) have been deleted'));
                    if (callback) {
                        callback(ids);
                    }
                },
                error: function error(jqXHR, textStatus, errorThrown) {
                    $.addAlert('error', jqXHR.responseText);
                },
                complete: function complete() {
                    $.deactivateWait();
                }
            });
        }
    }]);

    return BibliographyDB;
})();

},{}],3:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BibEntryForm = undefined;

var _tools = require("../tools");

var _templates = require("./templates");

var _statics = require("../statics.js");

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BibEntryForm = exports.BibEntryForm = (function () {
    function BibEntryForm(itemId, sourceType, bibDB, bibCats, ownerId, callback) {
        _classCallCheck(this, BibEntryForm);

        this.itemId = itemId; // The id of the bibliography item (if available).
        this.sourceType = sourceType; // The id of the type of source (a book, an article, etc.).
        this.bibDB = bibDB;
        this.bibCats = bibCats;
        this.ownerId = ownerId;
        this.callback = callback;
        this.createBibEntryDialog();
    }

    /** Opens a dialog for creating or editing a bibliography entry.
     */

    _createClass(BibEntryForm, [{
        key: "createBibEntryDialog",
        value: function createBibEntryDialog() {
            var rFields = undefined,
                oFields = undefined,
                eoFields = undefined,
                dialogHeader = undefined,
                id = this.itemId,
                type = this.sourceType,
                entryCat = undefined,
                that = this;
            if (!id) {
                dialogHeader = gettext('Register New Source');
                id = 0;
                rFields = [];
                oFields = [];
                eoFields = [];
                entryCat = [];
            } else {
                dialogHeader = gettext('Edit Source');
                var entryType = _statics.BibEntryTypes[type];
                rFields = entryType.required;
                oFields = entryType.optional;
                eoFields = entryType.eitheror;
                entryCat = this.bibDB[id]['entry_cat'].split(',');
            }
            //restore the categories and check if the category is selected
            var eCats = [];
            jQuery.each(this.bibCats, function (i, eCat) {
                var len = eCats.length;
                eCats[len] = {
                    'id': eCat.id,
                    'category_title': eCat.category_title
                };
                if (0 <= jQuery.inArray(String(eCat.id), entryCat)) {
                    eCats[len].checked = ' checked';
                } else {
                    eCats[len].checked = '';
                }
            });
            //get html of select form for selecting a entry type
            //template function from underscore.js

            var typeTitle = '';
            if ('' == type || typeof type === 'undefined') {
                typeTitle = gettext('Select source type');
            } else {
                typeTitle = _statics.BibEntryTypes[type]['title'];
            }

            var sourType = (0, _templates.sourcetypeTemplate)({
                'fieldTitle': typeTitle,
                'fieldName': 'entrytype',
                'fieldValue': type,
                'options': _statics.BibEntryTypes
            });

            //get html of dialog body

            var dialogBody = (0, _templates.createBibitemTemplate)({
                'dialogHeader': dialogHeader,
                'sourcetype': sourType,
                'requiredfields': this.getFieldForms(rFields, eoFields, id),
                'optionalfields': this.getFieldForms(oFields, [], id),
                'extras': (0, _templates.categoryTemplate)({
                    'fieldTitle': gettext('Categories'),
                    'categories': eCats
                })
            });
            jQuery('body').append(dialogBody);

            //open dropdown for selecting source type
            $.addDropdownBox(jQuery('#source-type-selection'), jQuery('#source-type-selection > .fw-pulldown'));
            jQuery('#source-type-selection .fw-pulldown-item').bind('mousedown', function () {
                var source_type_title = jQuery(this).html(),
                    source_type_id = jQuery(this).attr('data-value');
                jQuery(this).parent().siblings('.selected').removeClass('selected');
                jQuery(this).parent().addClass('selected');
                jQuery('#selected-source-type-title').html(source_type_title);
                jQuery('#id_entrytype').val(source_type_id).trigger('change');
            });

            //when the entry type is changed, the whole form has to be updated
            jQuery('#id_entrytype').bind('change', function () {
                var thisVal = jQuery(this).val();
                if ('' != thisVal) {
                    that.updateBibEntryDialog(id, thisVal);
                    type = thisVal;
                }
                jQuery('#bookoptionsTab').show();
            });

            //add and remove name list field
            (0, _tools.addRemoveListHandler)();
            var diaButtons = {};
            diaButtons[gettext('Submit')] = function () {
                if (type) {
                    that.onCreateBibEntrySubmitHandler(id);
                }
            };
            diaButtons[gettext('Cancel')] = function () {
                jQuery(this).dialog('close');
            };

            var dia_height = 500;
            jQuery("#createbook").dialog({
                draggable: false,
                resizable: false,
                width: 710,
                height: dia_height,
                modal: true,
                //position: ['center', 80],
                buttons: diaButtons,
                create: function create() {
                    var $the_dialog = jQuery(this).closest(".ui-dialog");
                    $the_dialog.find(".ui-dialog-buttonpane").addClass('createbook');
                    $the_dialog.find(".ui-button:first-child").addClass("fw-button fw-dark");
                    $the_dialog.find(".ui-button:last").addClass("fw-button fw-orange");
                },
                close: function close() {
                    jQuery("#createbook").dialog('destroy').remove();
                }
            });

            // init ui tabs
            jQuery('#bookoptionsTab').tabs();

            // resize dialog height
            jQuery('#createbook .ui-tabs-panel').css('height', dia_height - 256);
            if ('' == jQuery('#id_entrytype').val()) jQuery('#bookoptionsTab').hide();
            jQuery('.fw-checkable-label').bind('click', function () {
                $.setCheckableLabel(jQuery(this));
            });
        }

        /** Return html with form elements for the bibliography entry dialog.
         * @function getFieldForms
         * @param fields A list of the fields
         * @param eitheror Fields of which either entry A or B is obligatory.
         * @param id The id of the bibliography entry.
         */

    }, {
        key: "getFieldForms",
        value: function getFieldForms(fields, eitheror, id) {
            var that = this;
            if (null == eitheror || undefined == eitheror) {
                eitheror = [];
            }
            var ret = '';
            var eitheror_fields = [],
                the_value = undefined;

            jQuery.each(fields, function () {
                //if the fieldtype must be "either or", then save it in the array
                if (0 === id) {
                    the_value = '';
                } else {
                    the_value = that.bibDB[id][_statics.BibFieldTypes[this].name];
                    if ('undefined' === typeof the_value) {
                        the_value = '';
                    }
                }
                //get html with template function of underscore.js
                if ('f_date' == _statics.BibFieldTypes[this].type) {
                    var date_form_html = that.getFormPart(_statics.BibFieldTypes[this], this, the_value),
                        date_format = date_form_html[1];
                    ret += (0, _templates.dateinputTrTemplate)({
                        'fieldTitle': _statics.BibFieldTypes[this].title,
                        'format': date_format,
                        'inputForm': date_form_html[0],
                        dateFormat: _tools.dateFormat
                    });
                } else {
                    ret += (0, _templates.inputTrTemplate)({
                        'fieldTitle': _statics.BibFieldTypes[this].title,
                        'inputForm': that.getFormPart(_statics.BibFieldTypes[this], this, the_value)
                    });
                }
            });

            jQuery.each(eitheror, function () {
                eitheror_fields.push(_statics.BibFieldTypes[this]);
            });

            if (1 < eitheror.length) {
                var selected_field = eitheror_fields[0];
                jQuery.each(eitheror_fields, function () {
                    //if the field has value, get html with template function of underscore.js
                    if (0 !== id) {
                        var current_val = that.bibDB[id][this.name];
                        if (null != current_val && 'undefined' != typeof current_val && '' != current_val) {
                            selected_field = this;
                            return false;
                        }
                    }
                });

                if (0 === id) {
                    the_value = '';
                } else {
                    the_value = that.bibDB[id][selected_field.name];
                    if ('undefined' === typeof the_value) {
                        the_value = '';
                    }
                }

                ret = (0, _templates.eitherorTrTemplate)({
                    'fields': eitheror_fields,
                    'selected': selected_field,
                    'inputForm': that.getFormPart(selected_field, id, the_value)
                }) + ret;
            }
            return ret;
        }

        /** Change the type of the bibliography item in the form (article, book, etc.)
         * @function updateBibEntryDialog
         * @param id The id of the bibliography entry.
         * @param type The new type of the bibliography entry.
         */

    }, {
        key: "updateBibEntryDialog",
        value: function updateBibEntryDialog(id, type) {
            var entryType = _statics.BibEntryTypes[type];

            jQuery('#optionTab1 > table > tbody').html(this.getFieldForms(entryType.required, entryType.eitheror, id));

            jQuery('#optionTab2 > table > tbody').html(this.getFieldForms(entryType.optional, [], id));

            (0, _tools.addRemoveListHandler)();
        }

        /** Handles the submission of the bibliography entry form.
         * @function onCreateBibEntrySubmitHandler
         * @param id The id of the bibliography item.
         */

    }, {
        key: "onCreateBibEntrySubmitHandler",
        value: function onCreateBibEntrySubmitHandler(id) {
            //when submitted, the values in form elements will be restored
            var formValues = {
                'id': id,
                'entrytype': jQuery('#id_entrytype').val()
            };
            if (this.ownerId) {
                formValues['owner_id'] = this.ownerId;
            }

            jQuery('.entryForm').each(function () {
                var $this = jQuery(this);
                var the_name = $this.attr('name') || $this.attr('data-field-name');
                var the_type = $this.attr('type') || $this.attr('data-type');
                var the_value = '';
                var isMust = 1 == $this.parents('#optionTab1').size();
                var eitheror = $this.parents('.eitheror');
                if (1 == eitheror.size()) {
                    //if it is a either-or-field
                    var field_names = eitheror.find('.field-names .fw-pulldown-item');
                    field_names.each(function () {
                        if (jQuery(this).hasClass('selected')) {
                            the_name = 'eField' + jQuery(this).data('value');
                        } else {
                            formValues['eField' + jQuery(this).data('value')] = '';
                        }
                    });
                }

                dataTypeSwitch: switch (the_type) {
                    case 'fieldkeys':
                        var selected_key_item = $this.find('.fw-pulldown-item.selected');
                        if (0 == selected_key_item.size()) {
                            selected_key_item = $this.find('.fw-pulldown-item:eq(0)');
                        }
                        the_value = selected_key_item.data('value');
                        break;
                    case 'date':
                        //if it is a date form, the values will be formatted yyyy-mm-dd
                        var y_val = $this.find('.select-year').val(),
                            m_val = $this.find('.select-month').val(),
                            d_val = $this.find('.select-date').val(),
                            y2_val = $this.find('.select-year2').val(),
                            m2_val = $this.find('.select-month2').val(),
                            d2_val = $this.find('.select-date2').val(),
                            date_format = $this.siblings('th').find('.fw-data-format-pulldown .fw-pulldown-item.selected').data('value'),
                            date_form = '',
                            date_val = '',
                            required_dates = undefined,
                            required_values = undefined,
                            date_objs = [],
                            i = undefined,
                            len = undefined;

                        switch (date_format) {
                            case 'y':
                                required_values = required_dates = [y_val];
                                date_form = 'Y';
                                break;
                            case 'my':
                                required_values = [y_val, m_val];
                                required_dates = [y_val + '/' + m_val];
                                date_form = 'Y/m';
                                break;
                            case 'mdy':
                                required_values = [y_val, m_val, d_val];
                                required_dates = [y_val + '/' + m_val + '/' + d_val];
                                date_form = 'Y/m/d';
                                break;
                            case 'y/y':
                                required_values = required_dates = [y_val, y2_val];
                                date_form = 'Y-Y2';
                                break;
                            case 'my/my':
                                required_values = [y_val, y2_val, m_val, m2_val];
                                required_dates = [y_val + '/' + m_val, y2_val + '/' + m2_val];
                                date_form = 'Y/m-Y2/m2';
                                break;
                            case 'mdy/mdy':
                                required_values = [y_val, m_val, d_val, y2_val, m2_val, d2_val];
                                required_dates = [y_val + '/' + m_val + '/' + d_val, y2_val + '/' + m2_val + '/' + d2_val];
                                date_form = 'Y/m/d-Y2/m2/d2';
                                break;
                        }

                        len = required_values.length;
                        for (i = 0; i < len; i++) {
                            if ('undefined' === typeof required_values[i] || null == required_values[i] || '' == required_values[i]) {
                                the_value = '';
                                break dataTypeSwitch;
                            }
                        }

                        len = required_dates.length;
                        for (i = 0; i < len; i++) {
                            var date_obj = new Date(required_dates[i]);
                            if ('Invalid Date' == date_obj) {
                                the_value = '';
                                break dataTypeSwitch;
                            }
                            date_objs.push(date_obj);
                        }

                        date_form = date_form.replace('d', date_objs[0].getUTCDate());
                        date_form = date_form.replace('m', date_objs[0].getUTCMonth() + 1);
                        date_form = date_form.replace('Y', date_objs[0].getUTCFullYear());

                        if (2 == date_objs.length) {
                            date_form = date_form.replace('d2', date_objs[1].getUTCDate());
                            date_form = date_form.replace('m2', date_objs[1].getUTCMonth() + 1);
                            date_form = date_form.replace('Y2', date_objs[1].getUTCFullYear());
                        }

                        the_value = date_form;
                        break;
                    case 'namelist':
                        the_value = [];
                        $this.find('.fw-list-input').each(function () {
                            var $tr = jQuery(this);
                            var first_name = jQuery.trim($tr.find('.fw-name-input.fw-first').val());
                            var last_name = jQuery.trim($tr.find('.fw-name-input.fw-last').val());
                            var full_name = '';
                            if ('' == first_name && '' == last_name) {
                                return true;
                            } else if ('' == last_name) {
                                full_name = '{' + first_name + '}';
                            } else if ('' == first_name) {
                                full_name = '{' + last_name + '}';
                            } else {
                                full_name = '{' + first_name + '} {' + last_name + '}';
                            }
                            the_value[the_value.length] = full_name;
                        });
                        if (0 == the_value.length) {
                            the_value = '';
                        } else {
                            the_name += '[]';
                        }
                        break;
                    case 'literallist':
                        the_value = [];
                        $this.find('.fw-list-input').each(function () {
                            var input_val = jQuery.trim(jQuery(this).find('.fw-input').val());
                            if ('' == input_val) return true;
                            the_value[the_value.length] = '{' + input_val + '}';
                        });
                        if (0 == the_value.length) {
                            the_value = '';
                        } else {
                            the_name += '[]';
                        }
                        break;
                    case 'checkbox':
                        //if it is a checkbox, the value will be restored as an Array
                        the_name = the_name + '[]';
                        if (undefined == formValues[the_name]) formValues[the_name] = [];
                        if ($this.prop("checked")) formValues[the_name][formValues[the_name].length] = $this.val();
                        return;
                    default:
                        the_value = $this.val().replace(/(^\s+)|(\s+$)/g, "");
                }

                if (isMust && (undefined == the_value || '' == the_value)) {
                    the_value = 'null';
                }
                formValues[the_name] = the_value;
            });
            this.callback(formValues);
            jQuery('#createbook .warning').detach();
            jQuery("#createbook").dialog('close');
        }

        /** Recover the current value of a certain field in the bibliography item form.
         * @function getFormPart
         * @param form_info Information about the field -- such as it's type (date, text string, etc.)
         * @param the_id The id specifying the field.
         * @param the_value The current value of the field.
         */

    }, {
        key: "getFormPart",
        value: function getFormPart(form_info, the_id, the_value) {
            var the_type = form_info.type;
            var field_name = 'eField' + the_id;
            switch (the_type) {
                case 'f_date':
                    the_value = (0, _tools.formatDateString)(the_value);
                    var dates = the_value.split('-'),
                        y_val = ['', ''],
                        m_val = ['', ''],
                        d_val = ['', ''],
                        min_date_length = 3,
                        date_format = undefined,
                        len = dates.length;

                    for (var i = 0; i < len; i++) {
                        var values = dates[i].split('/'),
                            values_len = values.length;

                        y_val[i] = values[0];
                        if (1 < values_len) {
                            m_val[i] = values[1];
                        }
                        if (2 < values_len) {
                            d_val[i] = values[2];
                        }
                        if (values_len < min_date_length) {
                            min_date_length = values_len;
                        }
                    }

                    if (1 < len) {
                        if (2 < min_date_length) {
                            date_format = 'mdy/mdy';
                        } else if (1 < min_date_length) {
                            date_format = 'my/my';
                        } else {
                            date_format = 'y/y';
                        }
                    } else {
                        if (2 < min_date_length) {
                            date_format = 'mdy';
                        } else if (1 < min_date_length) {
                            date_format = 'my';
                        } else {
                            date_format = 'y';
                        }
                    }

                    return [(0, _templates.dateinputTemplate)({
                        'fieldName': field_name,
                        'dateSelect': (0, _templates.dateselectTemplate)({
                            'type': 'date',
                            'formname': 'date' + the_id,
                            'value': d_val[0]
                        }),
                        'monthSelect': (0, _templates.dateselectTemplate)({
                            'type': 'month',
                            'formname': 'month' + the_id,
                            'value': m_val[0]
                        }),
                        'yearSelect': (0, _templates.dateselectTemplate)({
                            'type': 'year',
                            'formname': 'year' + the_id,
                            'value': y_val[0]
                        }),
                        'date2Select': (0, _templates.dateselectTemplate)({
                            'type': 'date2',
                            'formname': 'date2' + the_id,
                            'value': d_val[1]
                        }),
                        'month2Select': (0, _templates.dateselectTemplate)({
                            'type': 'month2',
                            'formname': 'month2' + the_id,
                            'value': m_val[1]
                        }),
                        'year2Select': (0, _templates.dateselectTemplate)({
                            'type': 'year2',
                            'formname': 'year2' + the_id,
                            'value': y_val[1]
                        })
                    }), date_format];
                    break;
                case 'l_name':
                    var names = the_value.split('} and {'),
                        name_values = [];

                    for (var i = 0; i < names.length; i++) {
                        var name_parts = names[i].split('} {'),
                            f_name = name_parts[0].replace('{', '').replace('}', ''),
                            l_name = 1 < name_parts.length ? name_parts[1].replace('}', '') : '';
                        name_values[name_values.length] = {
                            'first': f_name,
                            'last': l_name
                        };
                    }

                    if (0 == name_values.length) {
                        name_values[0] = {
                            'first': '',
                            'last': ''
                        };
                    }
                    return (0, _templates.listInputTemplate)({
                        'filedType': 'namelist',
                        'fieldName': field_name,
                        'inputForm': (0, _templates.namelistInputTemplate)({
                            'fieldValue': name_values
                        })
                    });
                    break;
                case 'l_key':
                case 'l_literal':
                    var literals = the_value.split('} and {');
                    var literal_values = [];
                    for (var i = 0; i < literals.length; i++) {
                        literal_values[literal_values.length] = literals[i].replace('{', '').replace('}', '');
                    }
                    if (0 == literal_values.length) literal_values[0] = '';
                    return (0, _templates.listInputTemplate)({
                        'filedType': 'literallist',
                        'fieldName': field_name,
                        'inputForm': (0, _templates.literallistInputTemplate)({
                            'fieldValue': literal_values
                        })
                    });
                case 'f_key':
                    if ('undefined' != typeof form_info.localization) {
                        var _ret = (function () {
                            var l_keys = _.select(_statics.LocalizationKeys, function (obj) {
                                return obj.type == form_info.localization;
                            }),
                                key_options = [],
                                selected_value_title = '';
                            jQuery.each(l_keys, function () {
                                if (this.name == the_value) {
                                    selected_value_title = this.title;
                                }
                                key_options.push({
                                    'value': this.name,
                                    'title': this.title
                                });
                            });
                            return {
                                v: (0, _templates.selectTemplate)({
                                    'fieldName': field_name,
                                    'fieldTitle': selected_value_title,
                                    'fieldValue': the_value,
                                    'fieldDefault': {
                                        'value': '',
                                        'title': ''
                                    },
                                    'options': key_options
                                })
                            };
                        })();

                        if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
                    } else {
                        // TODO: Check if we really want this template here.
                        return (0, _templates.inputTemplate)({
                            'fieldType': 'text',
                            'fieldName': field_name,
                            'fieldValue': the_value
                        });
                    }
                    break;
                default:
                    return (0, _templates.inputTemplate)({
                        'fieldType': 'text',
                        'fieldName': field_name,
                        'fieldValue': the_value
                    });
            }
        }
    }]);

    return BibEntryForm;
})();

},{"../statics.js":7,"../tools":8,"./templates":4}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/** A template to select the bibliography item source type */
var sourcetypeTemplate = exports.sourcetypeTemplate = _.template('<div id="source-type-selection" class="fw-button fw-white fw-large">\
        <input type="hidden" id="id_<%- fieldName %>" name="<%- fieldName %>" value="<%- fieldValue %>" />\
        <span id="selected-source-type-title"><%= fieldTitle %></span>\
        <span class="icon-down-dir"></span>\
        <div class="fw-pulldown fw-center">\
            <ul><% _.each(_.sortBy(options, function(source_type){ return source_type.order; }), function(opt) { %>\
                <li>\
                    <span class="fw-pulldown-item" data-value="<%- opt.id %>"><%= gettext(opt.title) %></span>\
                </li>\
            <% }) %></ul>\
        </div>\
    </div>');

/** A template for the bibliography item edit dialog. */
var createBibitemTemplate = exports.createBibitemTemplate = _.template('\
    <div id="createbook" title="<%- dialogHeader %>">\
        <%= sourcetype %>\
        <div id="bookoptionsTab">\
            <ul>\
                <li><a href="#optionTab1" class="fw-button fw-large">' + gettext('Required Fields') + '</a></li>\
                <li><a href="#optionTab2" class="fw-button fw-large">' + gettext('Optional Fields') + '</a></li>\
                <li><a href="#optionTab3" class="fw-button fw-large">' + gettext('Extras') + '</a></li>\
            </ul>\
            <div id="optionTab1"><table class="fw-dialog-table"><tbody><%= requiredfields %></tbody></table></div>\
            <div id="optionTab2"><table class="fw-dialog-table"><tbody><%= optionalfields %></tbody></table></div>\
            <div id="optionTab3"><table class="fw-dialog-table"><tbody><%= extras %></tbody></table></div>\
        </div>\
    </div>');

/* A template to show the category selection pane of the bibliography item edit dialog. */
var categoryTemplate = exports.categoryTemplate = _.template('\
    <tr>\
        <th><h4 class="fw-tablerow-title"><%- fieldTitle %></h4></th>\
        <td><% _.each(categories, function(cat) { %>\
            <label class="fw-checkable fw-checkable-label<%- cat.checked %>" for="entryCat<%- cat.id %>"><%- cat.category_title %></label>\
            <input class="fw-checkable-input entryForm entry-cat" type="checkbox" id="entryCat<%- cat.id %>" name="entryCat" value="<%- cat.id %>"<%- cat.checked %> />\
        <% }) %></td>\
    </tr>');

/** A template of a date input row of the bibliography item edit form. */
var dateinputTrTemplate = exports.dateinputTrTemplate = _.template('<tr class="date-input-tr" data-format="<%= format %>">\
        <th>\
            <div class="fw-data-format-pulldown fw-bib-form-pulldown">\
                <label><%- fieldTitle %> <span>(<%- dateFormat[format] %>)</span></label>\
                <span class="icon-down-dir"></span>\
                <div class="fw-pulldown fw-left">\
                    <ul><% _.each(dateFormat, function(format_title, key) { %>\
                        <li>\
                            <span class="fw-pulldown-item<% if(key == format) { %> selected<% } %>"\
                                data-value="<%= key %>">\
                                <%- format_title %>\
                            </span>\
                        </li>\
                    <% }) %></ul>\
                </div>\
            </div>\
        </th>\
        <%= inputForm %>\
    </tr>');

/** A template for each input field row of the bibliography item edit form. */
var inputTrTemplate = exports.inputTrTemplate = _.template('\
    <tr>\
        <th><h4 class="fw-tablerow-title"><%- gettext(fieldTitle) %></h4></th>\
        <%= inputForm %>\
    </tr>');

/** A template for either-or fields in the bibliography item edit form. */
var eitherorTrTemplate = exports.eitherorTrTemplate = _.template('<tr class="eitheror">\
        <th>\
            <div class="fw-bib-field-pulldown fw-bib-form-pulldown">\
                <label><%- selected.title %></label>\
                <span class="icon-down-dir"></span>\
                <div class="fw-pulldown field-names fw-left">\
                    <ul><% _.each(fields, function(field) { %>\
                        <li>\
                            <span class="fw-pulldown-item<% if(selected.id == field.id) { %> selected<% } %>"\
                                data-value="<%= field.name %>">\
                                <%- field.title %>\
                            </span>\
                        </li>\
                    <% }) %></ul>\
                </div>\
            </div>\
        </th>\
        <%= inputForm %>\
    </tr>');

/** A template for date input fields in the bibliography item edit form. */
var dateinputTemplate = exports.dateinputTemplate = _.template('<td class="entryForm fw-date-form" data-type="date" data-field-name="<%- fieldName %>">\
        <table class="fw-bib-date-table"><tr>\
            <td class="month-td"><input <%= monthSelect %> placeholder="Month" /></td>\
            <td class="day-td"><input <%= dateSelect %> placeholder="Day" /></td>\
            <td class="year-td"><input <%= yearSelect %> placeholder="Year" /></td>\
            <td class="fw-date-separator">-</td>\
            <td class="month-td2"><input <%= month2Select %> placeholder="Month" /></td>\
            <td class="day-td2"><input <%= date2Select %> placeholder="Day" /></td>\
            <td class="year-td2"><input <%= year2Select %> placeholder="Year" /></td>\
        </tr></table>\
    </td>');

/** A template for each item (year, date, month) of a date input fields in the bibliography item edit form. */
var dateselectTemplate = exports.dateselectTemplate = _.template('type="text" name="<%- formname %>" class="select-<%- type %>" value="<%- value %>"');

var listInputTemplate = exports.listInputTemplate = _.template('<td class="entryForm" data-type="<%- filedType %>" data-field-name="<%- fieldName %>">\
        <%= inputForm %>\
    </td>');

/** A template for name list fields (authors, editors) in the bibliography item edit form. */
var namelistInputTemplate = exports.namelistInputTemplate = _.template('<% _.each(fieldValue, function(val) { %>\
        <div class="fw-list-input">\
            <input type="text" class="fw-name-input fw-first" value="<%= val.first %>" placeholder="' + gettext('First Name') + '" />\
            <input type="text" class="fw-name-input fw-last" value="<%= val.last %>" placeholder="' + gettext('Last Name') + '" />\
            <span class="fw-add-input icon-addremove"></span>\
        </div>\
    <% }) %>');

/** A template for name list field items in the bibliography item edit form. */
var literallistInputTemplate = exports.literallistInputTemplate = _.template('<% _.each(fieldValue, function(val) { %>\
        <div class="fw-list-input"><input class="fw-input" type="text" value="<%= val %>" /><span class="fw-add-input icon-addremove"></span></div>\
    <% }) %>');

/** A template for selection fields in the bibliography item edit form. */
var selectTemplate = exports.selectTemplate = _.template('<td>\
        <div class="fw-bib-select-pulldown fw-button fw-white">\
            <label><% if("" == fieldValue) { %><%- fieldDefault.title %><% } else { %><%- fieldTitle %><% } %></label>\
            <span class="icon-down-dir"></span>\
            <div class="fw-pulldown fw-left">\
                <ul class="entryForm" data-field-name="<%- fieldName %>" data-type="fieldkeys" id="id_<%- fieldName %>">\
                    <% if("" != fieldDefault.value) { %>\
                        <li><span\
                            class="fw-pulldown-item<% if("" == fieldValue || fieldDefault.value == fieldValue) { %> selected<% } %>"\
                            data-value="<%- fieldDefault.value %>">\
                            <%- fieldDefault.title %>\
                        </span></li>\
                    <% } %>\
                    <% _.each(options, function(option) { %>\
                        <li><span\
                            class="fw-pulldown-item<% if(option.value == fieldValue) { %> selected<% } %>"\
                            data-value="<%- option.value %>">\
                            <%- option.title %>\
                        </span></li>\
                    <% }) %>\
                </ul>\
            </div>\
        </div>\
    </td>');

/** A template for each input field of the bibliography item edit form. */
var inputTemplate = exports.inputTemplate = _.template('<td>\
        <input class="entryForm" type="<%- fieldType %>" name="<%- fieldName %>" id="id_<%- fieldName %>" value="<%- fieldValue %>" />\
    </td>');

},{}],5:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.BibliographyOverview = undefined;

var _tools = require("../tools");

var _form = require("../form/form");

var _templates = require("./templates");

var _database = require("../database");

var _statics = require("../statics");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BibliographyOverview = exports.BibliographyOverview = (function () {
    function BibliographyOverview() {
        _classCallCheck(this, BibliographyOverview);

        this.getBibDB();
        this.bind();
    }

    /* load data from the bibliography */

    _createClass(BibliographyOverview, [{
        key: "getBibDB",
        value: function getBibDB(callback) {
            var that = this;
            var docOwnerId = 0; // 0 = current user.
            this.db = new _database.BibliographyDB(docOwnerId, true, false, false);

            this.db.getBibDB(function (bibPks, bibCats) {

                that.addBibCategoryList(bibCats);
                that.addBibList(bibPks);
                if (callback) {
                    callback();
                }
            });
        }

        /** Adds a list of bibliography categories to current list of bibliography categories.
         * @function addBibCategoryList
         * @param newBibCategories The new categories which will be added to the existing ones.
         */

    }, {
        key: "addBibCategoryList",
        value: function addBibCategoryList(newBibCategories) {
            for (var i = 0; i < newBibCategories.length; i++) {
                this.appendToBibCatList(newBibCategories[i]);
            }
        }

        /** Add an item to the HTML list of bibliography categories.
         * @function appendToBibCatList
         * @param bCat Category to be appended.
         */

    }, {
        key: "appendToBibCatList",
        value: function appendToBibCatList(bCat) {
            jQuery('#bib-category-list').append((0, _templates.bibliographyCategoryListItemTemplate)({
                'bCat': bCat
            }));
        }

        /** This takes a list of new bib entries and adds them to BibDB and the bibliography table
         * @function addBibList
         */

    }, {
        key: "addBibList",
        value: function addBibList(pks) {
            //if (jQuery('#bibliography').length > 0) {
            this.stopBibliographyTable();
            for (var i = 0; i < pks.length; i++) {
                this.appendToBibTable(pks[i], this.db.bibDB[pks[i]]);
            }
            this.startBibliographyTable();
            //}
        }

        /** Opens a dialog for editing categories.
         * @function createCategoryDialog
         */

    }, {
        key: "createCategoryDialog",
        value: function createCategoryDialog() {
            var that = this;
            var dialogHeader = gettext('Edit Categories');
            var dialogBody = (0, _templates.editCategoriesTemplate)({
                'dialogHeader': dialogHeader,
                'categories': (0, _templates.categoryFormsTemplate)({
                    'categories': this.db.bibCats
                })
            });
            jQuery('body').append(dialogBody);
            var diaButtons = {};
            diaButtons[gettext('Submit')] = function () {
                var new_cat = {
                    'ids': [],
                    'titles': []
                };
                jQuery('#editCategories .category-form').each(function () {
                    var this_val = jQuery.trim(jQuery(this).val());
                    var this_id = jQuery(this).attr('data-id');
                    if ('undefined' == typeof this_id) this_id = 0;
                    if ('' != this_val) {
                        new_cat.ids.push(this_id);
                        new_cat.titles.push(this_val);
                    } else if ('' == this_val && 0 < this_id) {
                        that.deleted_cat[that.deleted_cat.length] = this_id;
                    }
                });
                that.db.deleteCategory(that.deleted_cat);
                that.createCategory(new_cat);
                jQuery(this).dialog('close');
            };
            diaButtons[gettext('Cancel')] = function () {
                jQuery(this).dialog('close');
            };

            jQuery("#editCategories").dialog({
                resizable: false,
                width: 350,
                height: 350,
                modal: true,
                buttons: diaButtons,
                create: function create() {
                    var $the_dialog = jQuery(this).closest(".ui-dialog");
                    $the_dialog.find(".ui-button:first-child").addClass("fw-button fw-dark");
                    $the_dialog.find(".ui-button:last").addClass("fw-button fw-orange");
                },
                close: function close() {
                    jQuery("#editCategories").dialog('destroy').remove();
                }
            });

            this.deleted_cat = [];
            (0, _tools.addRemoveListHandler)();
        }

        /** Dialog to confirm deletion of bibliography items.
         * @function deleteBibEntryDialog
              * @param ids Ids of items that are to be deleted.
         */

    }, {
        key: "deleteBibEntryDialog",
        value: function deleteBibEntryDialog(ids) {
            var that = this;
            jQuery('body').append('<div id="confirmdeletion" title="' + gettext('Confirm deletion') + '"><p>' + gettext('Delete the bibliography item(s)') + '?</p></div>');
            var diaButtons = {};
            diaButtons[gettext('Delete')] = function () {
                that.deleteBibEntry(ids);
                jQuery(this).dialog('close');
            };
            diaButtons[gettext('Cancel')] = function () {
                jQuery(this).dialog('close');
            };
            jQuery("#confirmdeletion").dialog({
                resizable: false,
                height: 180,
                modal: true,
                buttons: diaButtons,
                create: function create() {
                    var $the_dialog = jQuery(this).closest(".ui-dialog");
                    $the_dialog.find(".ui-button:first-child").addClass("fw-button fw-dark");
                    $the_dialog.find(".ui-button:last").addClass("fw-button fw-orange");
                },
                close: function close() {
                    jQuery("#confirmdeletion").dialog('destroy').remove();
                }
            });
        }

        /** Add or update an item in the bibliography table (HTML).
         * @function appendToBibTable
              * @param pk The pk specifying the bibliography item.
         * @param bib_info An object with the current information about the bibliography item.
         */

    }, {
        key: "appendToBibTable",
        value: function appendToBibTable(pk, bib_info) {
            var $tr = jQuery('#Entry_' + pk);
            //reform author field
            var bibauthor = bib_info.author || bib_info.editor;
            // If neither author nor editor were registered, use an empty string instead of nothing.
            // TODO: Such entries should likely not be accepted by the importer.
            if (typeof bibauthor === 'undefined') bibauthor = '';
            var bibauthors = bibauthor.split('} and {');
            //if there are more authors, add "and others" behind.
            var and_others = 1 < bibauthors.length ? gettext(' and others') : '';
            bibauthor = bibauthors[0];
            var bibauthor_list = bibauthor.split('} {');
            if (1 < bibauthor_list.length) {
                bibauthor = bibauthor_list[1] + ', ' + bibauthor_list[0];
            } else {
                bibauthor = bibauthor_list[0];
            }
            bibauthor = bibauthor.replace(/[{}]/g, '');
            bibauthor += and_others;
            // If title is undefined, set it to an empty string.
            // TODO: Such entries should likely not be accepted by the importer.
            if (typeof bib_info.title === 'undefined') bib_info.title = '';

            if (0 < $tr.size()) {
                //if the entry exists, update
                $tr.replaceWith((0, _templates.bibtableTemplate)({
                    'id': pk,
                    'cats': bib_info.entry_cat.split(','),
                    'type': bib_info.entry_type,
                    'typetitle': _statics.BibEntryTypes[bib_info.entry_type]['title'],
                    'title': bib_info.title.replace(/[{}]/g, ''),
                    'author': bibauthor,
                    'published': (0, _tools.formatDateString)(bib_info.date)
                }));
            } else {
                //if this is the new entry, append
                jQuery('#bibliography > tbody').append((0, _templates.bibtableTemplate)({
                    'id': pk,
                    'cats': bib_info.entry_cat.split(','),
                    'type': bib_info.entry_type,
                    'typetitle': _statics.BibEntryTypes[bib_info.entry_type]['title'],
                    'title': bib_info.title.replace(/[{}]/g, ''),
                    'author': bibauthor,
                    'published': (0, _tools.formatDateString)(bib_info.date)
                }));
            }
        }

        /** Stop the interactive parts of the bibliography table.
         * @function stopBibliographyTable
              */

    }, {
        key: "stopBibliographyTable",
        value: function stopBibliographyTable() {
            jQuery('#bibliography').dataTable().fnDestroy();
        }
        /** Start the interactive parts of the bibliography table.
         * @function startBibliographyTable
              */

    }, {
        key: "startBibliographyTable",
        value: function startBibliographyTable() {
            // The sortable table seems not to have an option to accept new data added to the DOM. Instead we destroy and recreate it.
            jQuery('#bibliography').dataTable({
                "bPaginate": false,
                "bLengthChange": false,
                "bFilter": true,
                "bInfo": false,
                "bAutoWidth": false,
                "oLanguage": {
                    "sSearch": ''
                },
                "aoColumnDefs": [{
                    "bSortable": false,
                    "aTargets": [0, 5]
                }]
            });
            jQuery('#bibliography_filter input').attr('placeholder', gettext('Search for Bibliography'));

            jQuery('#bibliography_filter input').unbind('focus, blur');
            jQuery('#bibliography_filter input').bind('focus', function () {
                jQuery(this).parent().addClass('focus');
            });
            jQuery('#bibliography_filter input').bind('blur', function () {
                jQuery(this).parent().removeClass('focus');
            });

            var autocomplete_tags = [];
            jQuery('#bibliography .fw-searchable').each(function () {
                autocomplete_tags.push(this.textContent.replace(/^\s+/g, '').replace(/\s+$/g, ''));
            });
            autocomplete_tags = _.uniq(autocomplete_tags);
            jQuery("#bibliography_filter input").autocomplete({
                source: autocomplete_tags
            });
        }
        /** Bind the init function to jQuery(document).ready.
         * @function bind
         */

    }, {
        key: "bind",
        value: function bind() {
            var that = this;
            jQuery(document).ready(function () {
                that.bindEvents();
            });
        }

        /** Initialize the bibliography table and bind interactive parts.
         * @function init
              */

    }, {
        key: "bindEvents",
        value: function bindEvents() {
            var that = this;
            jQuery(document).on('click', '.delete-bib', function () {
                var BookId = jQuery(this).attr('data-id');
                that.deleteBibEntryDialog([BookId]);
            });
            jQuery('#edit-category').bind('click', function () {
                that.createCategoryDialog();
            });

            jQuery(document).on('click', '.edit-bib', function () {
                var eID = jQuery(this).attr('data-id');
                var eType = jQuery(this).attr('data-type');
                new _form.BibEntryForm(eID, eType, that.db.bibDB, that.db.bibCats, false, function (bibEntryData) {
                    that.createBibEntry(bibEntryData);
                });
            });

            //open dropdown for bib category
            $.addDropdownBox(jQuery('#bib-category-btn'), jQuery('#bib-category-pulldown'));
            jQuery(document).on('click', '#bib-category-pulldown li > span', function () {
                jQuery('#bib-category-btn > label').html(jQuery(this).html());
                jQuery('#bib-category').val(jQuery(this).attr('data-id'));
                jQuery('#bib-category').trigger('change');
            });

            //filtering function for the list of bib entries
            jQuery('#bib-category').bind('change', function () {
                var cat_val = jQuery(this).val();
                if (0 == cat_val) {
                    jQuery('#bibliography > tbody > tr').show();
                } else {
                    jQuery('#bibliography > tbody > tr').hide();
                    jQuery('#bibliography > tbody > tr.cat_' + cat_val).show();
                }
            });

            //select all entries
            jQuery('#select-all-entry').bind('change', function () {
                var new_bool = false;
                if (jQuery(this).prop("checked")) new_bool = true;
                jQuery('.entry-select').each(function () {
                    this.checked = new_bool;
                });
            });

            //open dropdown for selecting action
            $.addDropdownBox(jQuery('#select-action-dropdown'), jQuery('#action-selection-pulldown'));

            //import a bib file
            jQuery('.import-bib').bind('click', function () {
                new BibLatexImporter(function (bibs) {
                    that.addBibList(bibs);
                });
            });

            //submit entry actions
            jQuery('#action-selection-pulldown li > span').bind('mousedown', function () {
                var action_name = jQuery(this).attr('data-action'),
                    ids = [];

                if ('' == action_name || 'undefined' == typeof action_name) {
                    return;
                }

                jQuery('.entry-select:checked').each(function () {
                    ids[ids.length] = jQuery(this).attr('data-id');
                });

                if (0 == ids.length) {
                    return;
                }

                switch (action_name) {
                    case 'delete':
                        that.deleteBibEntryDialog(ids);
                        break;
                    case 'export':
                        new BibLatexExporter(ids, window.BibDB, true);
                        break;
                }
            });
        }
    }, {
        key: "createCategory",
        value: function createCategory(cats) {
            var that = this;
            this.db.createCategory(cats, function (bibCats) {
                jQuery('#bib-category-list li').not(':first').remove();
                that.addBibCategoryList(bibCats);
            });
        }
    }, {
        key: "deleteBibEntry",
        value: function deleteBibEntry(ids) {
            var that = this;
            this.db.deleteBibEntry(ids, function (ids) {
                that.stopBibliographyTable();
                var elements_id = '#Entry_' + ids.join(', #Entry_');
                jQuery(elements_id).detach();
                that.startBibliographyTable();
            });
        }
    }, {
        key: "createBibEntry",
        value: function createBibEntry(bibEntryData) {
            var that = this;
            this.db.createBibEntry(bibEntryData, function (newBibPks) {
                that.addBibList(newBibPks);
            });
        }
    }]);

    return BibliographyOverview;
})();

},{"../database":2,"../form/form":3,"../statics":7,"../tools":8,"./templates":6}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
/** A template for the editing of bibliography categories list. */
var editCategoriesTemplate = exports.editCategoriesTemplate = _.template('\
    <div id="editCategories" title="<%- dialogHeader %>">\
        <table id="editCategoryList" class="fw-dialog-table"><tbody><%= categories %></tbody></table>\
    </div>');

/** A template for each category in the category list edit of the bibliography categories list. */
var categoryFormsTemplate = exports.categoryFormsTemplate = _.template('\
    <% _.each(categories, function(cat) { %>\
    <tr id="categoryTr_<%- cat.id %>" class="fw-list-input">\
        <td>\
            <input type="text" class="category-form" id="categoryTitle_<%- cat.id %>" value="<%= cat.category_title %>" data-id="<%- cat.id %>" />\
            <span class="fw-add-input icon-addremove"></span>\
        </td>\
    </tr>\
    <% }) %>\
    <tr class="fw-list-input">\
        <td>\
            <input type="text" class="category-form" />\
            <span class="fw-add-input icon-addremove"></span>\
        </td>\
    </tr>');

/* A template for the overview list of bibliography items. */
var bibtableTemplate = exports.bibtableTemplate = _.template('\
    <tr id="Entry_<%- id %>" class="<% _.each(cats, function(cat) { %>cat_<%- cat %> <% }) %>">\
        <td width="30">\
            <span class="fw-inline"><input type="checkbox" class="entry-select" data-id="<%- id %>" /></span>\
        </td>\
        <td width="235">\
            <span class="fw-document-table-title fw-inline">\
                <i class="icon-book"></i>\
                <span class="edit-bib fw-link-text fw-searchable" data-id="<%- id %>" data-type="<%- type %>">\
                    <% if (title.length>0) { %>\
                        <%- title %>\
                    <% } else { %>\
                        <i>' + gettext('Untitled') + '</i>\
                    <% } %>\
                </span>\
            </span>\
        </td>\
        <td width="170" class="type"><span class="fw-inline"><%- gettext(typetitle) %></span></td>\
        <td width="175" class="author"><span class="fw-inline fw-searchable"><%- author %></span></td>\
        <td width="100" class="publised"><span class="fw-inline"><%- published %></span></td>\
        <td width="50" align="center">\
            <span class="delete-bib fw-inline fw-link-text" data-id="<%- id %>" data-title="<%= title %>">\
                <i class="icon-trash"></i>\
            </span>\
        </td>\
    </tr>');

/** A template of a bibliography category list item. */
var bibliographyCategoryListItemTemplate = exports.bibliographyCategoryListItemTemplate = _.template('\
    <li>\
        <span class="fw-pulldown-item" data-id="<%- bCat.id %>">\
            <%- bCat.category_title %>\
        </span>\
    </li>\
');

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/** @file Sets up strings for working with TeX 
 This file is automatically created using ./manage.py create_bibliography_js
*/
/** A list of special chars in Tex and their unicode equivalent. */
var texSpecialChars = exports.texSpecialChars = [{ 'unicode': "—", 'tex': "{---}" }, { 'unicode': "¡", 'tex': "{\\textexclamdown}" }, { 'unicode': "¢", 'tex': "{\\textcent}" }, { 'unicode': "£", 'tex': "{\\textsterling}" }, { 'unicode': "¥", 'tex': "{\\textyen}" }, { 'unicode': "¦", 'tex': "{\\textbrokenbar}" }, { 'unicode': "§", 'tex': "{\\textsection}" }, { 'unicode': "¨", 'tex': "{\\textasciidieresis}" }, { 'unicode': "©", 'tex': "{\\textcopyright}" }, { 'unicode': "ª", 'tex': "{\\textordfeminine}" }, { 'unicode': "«", 'tex': "{\\guillemotleft}" }, { 'unicode': "¬", 'tex': "{\\textlnot}" }, { 'unicode': "®", 'tex': "{\\textregistered}" }, { 'unicode': "¯", 'tex': "{\\textasciimacron}" }, { 'unicode': "°", 'tex': "{\\textdegree}" }, { 'unicode': "±", 'tex': "{\\textpm}" }, { 'unicode': "²", 'tex': "{\\texttwosuperior}" }, { 'unicode': "³", 'tex': "{\\textthreesuperior}" }, { 'unicode': "´", 'tex': "{\\textasciiacute}" }, { 'unicode': "µ", 'tex': "{\\textmu}" }, { 'unicode': "¶", 'tex': "{\\textparagraph}" }, { 'unicode': "·", 'tex': "{\\textperiodcentered}" }, { 'unicode': "¸", 'tex': "{\\c\\ }" }, { 'unicode': "¹", 'tex': "{\\textonesuperior}" }, { 'unicode': "º", 'tex': "{\\textordmasculine}" }, { 'unicode': "»", 'tex': "{\\guillemotright}" }, { 'unicode': "¼", 'tex': "{\\textonequarter}" }, { 'unicode': "½", 'tex': "{\\textonehalf}" }, { 'unicode': "¾", 'tex': "{\\textthreequarters}" }, { 'unicode': "¿", 'tex': "{\\textquestiondown}" }, { 'unicode': "Æ", 'tex': "{\\AE}" }, { 'unicode': "Ð", 'tex': "{\\DH}" }, { 'unicode': "×", 'tex': "{\\texttimes}" }, { 'unicode': "Þ", 'tex': "{\\TH}" }, { 'unicode': "ß", 'tex': "{\\ss}" }, { 'unicode': "æ", 'tex': "{\\ae}" }, { 'unicode': "ð", 'tex': "{\\dh}" }, { 'unicode': "÷", 'tex': "{\\textdiv}" }, { 'unicode': "þ", 'tex': "{\\th}" }, { 'unicode': "ı", 'tex': "{\\i}" }, { 'unicode': "Ŋ", 'tex': "{\\NG}" }, { 'unicode': "ŋ", 'tex': "{\\ng}" }, { 'unicode': "Œ", 'tex': "{\\OE}" }, { 'unicode': "œ", 'tex': "{\\oe}" }, { 'unicode': "ˆ", 'tex': "{\\textasciicircum}" }, { 'unicode': "˜", 'tex': "{\\~}" }, { 'unicode': "˝", 'tex': "{\\textacutedbl}" }, { 'unicode': "–", 'tex': "{\\textendash}" }, { 'unicode': "—", 'tex': "{\\textemdash}" }, { 'unicode': "―", 'tex': "{\\textemdash}" }, { 'unicode': "‖", 'tex': "{\\textbardbl}" }, { 'unicode': "‗", 'tex': "{\\textunderscore}" }, { 'unicode': "‘", 'tex': "{\\textquoteleft}" }, { 'unicode': "’", 'tex': "{\\textquoteright}" }, { 'unicode': "‚", 'tex': "{\\quotesinglbase}" }, { 'unicode': "“", 'tex': "{\\textquotedblleft}" }, { 'unicode': "”", 'tex': "{\\textquotedblright}" }, { 'unicode': "„", 'tex': "{\\quotedblbase}" }, { 'unicode': "‟", 'tex': "{\\quotedblbase}" }, { 'unicode': "†", 'tex': "{\\textdagger}" }, { 'unicode': "‡", 'tex': "{\\textdaggerdbl}" }, { 'unicode': "•", 'tex': "{\\textbullet}" }, { 'unicode': "…", 'tex': "{\\textellipsis}" }, { 'unicode': "‰", 'tex': "{\\textperthousand}" }, { 'unicode': "‹", 'tex': "{\\guilsinglleft}" }, { 'unicode': "›", 'tex': "{\\guilsinglright}" }, { 'unicode': "⁄", 'tex': "{\\textfractionsolidus}" }, { 'unicode': "€", 'tex': "{\\texteuro}" }, { 'unicode': "℃", 'tex': "{\\textcelsius}" }, { 'unicode': "№", 'tex': "{\\textnumero}" }, { 'unicode': "℗", 'tex': "{\\textcircledP}" }, { 'unicode': "℠", 'tex': "{\\textservicemark}" }, { 'unicode': "™", 'tex': "{\\texttrademark}" }, { 'unicode': "Ω", 'tex': "{\\textohm}" }, { 'unicode': "℮", 'tex': "{\\textestimated}" }, { 'unicode': "←", 'tex': "{\\textleftarrow}" }, { 'unicode': "↑", 'tex': "{\\textuparrow}" }, { 'unicode': "→", 'tex': "{\\textrightarrow}" }, { 'unicode': "↓", 'tex': "{\\textdownarrow}" }, { 'unicode': "∞", 'tex': "{\\infty}" }, { 'unicode': "∼", 'tex': "{\\~}" }, { 'unicode': "⋕", 'tex': "{\\#}" }, { 'unicode': "〈", 'tex': "{\\textlangle}" }, { 'unicode': "〉", 'tex': "{\\textrangle}" }, { 'unicode': "␣", 'tex': "{\\textvisiblespace}" }, { 'unicode': "◦", 'tex': "{\\textopenbullet}" }, { 'unicode': "✁", 'tex': "{\\%<}" }, { 'unicode': "À", 'tex': "{\\`A}" }, { 'unicode': "Á", 'tex': "{\\'A}" }, { 'unicode': "Â", 'tex': "{\\^A}" }, { 'unicode': "Ã", 'tex': "{\\~A}" }, { 'unicode': "Ä", 'tex': "{\\\"A}" }, { 'unicode': "Å", 'tex': "{\\rA}" }, { 'unicode': "Ç", 'tex': "{\\cC}" }, { 'unicode': "È", 'tex': "{\\`E}" }, { 'unicode': "É", 'tex': "{\\'E}" }, { 'unicode': "Ê", 'tex': "{\\^E}" }, { 'unicode': "Ë", 'tex': "{\\\"E}" }, { 'unicode': "Ì", 'tex': "{\\`I}" }, { 'unicode': "Í", 'tex': "{\\'I}" }, { 'unicode': "Î", 'tex': "{\\^I}" }, { 'unicode': "Ï", 'tex': "{\\\"I}" }, { 'unicode': "Ñ", 'tex': "{\\~N}" }, { 'unicode': "Ò", 'tex': "{\\`O}" }, { 'unicode': "Ó", 'tex': "{\\'O}" }, { 'unicode': "Ô", 'tex': "{\\^O}" }, { 'unicode': "Õ", 'tex': "{\\~O}" }, { 'unicode': "Ö", 'tex': "{\\\"O}" }, { 'unicode': "Ù", 'tex': "{\\`U}" }, { 'unicode': "Ú", 'tex': "{\\'U}" }, { 'unicode': "Û", 'tex': "{\\^U}" }, { 'unicode': "Ü", 'tex': "{\\\"U}" }, { 'unicode': "Ý", 'tex': "{\\'Y}" }, { 'unicode': "à", 'tex': "{\\`a}" }, { 'unicode': "á", 'tex': "{\\'a}" }, { 'unicode': "â", 'tex': "{\\^a}" }, { 'unicode': "ã", 'tex': "{\\~a}" }, { 'unicode': "ä", 'tex': "{\\\"a}" }, { 'unicode': "å", 'tex': "{\\ra}" }, { 'unicode': "ç", 'tex': "{\\cc}" }, { 'unicode': "è", 'tex': "{\\`e}" }, { 'unicode': "é", 'tex': "{\\'e}" }, { 'unicode': "ê", 'tex': "{\\^e}" }, { 'unicode': "ë", 'tex': "{\\\"e}" }, { 'unicode': "ì", 'tex': "{\\`i}" }, { 'unicode': "í", 'tex': "{\\'i}" }, { 'unicode': "î", 'tex': "{\\^i}" }, { 'unicode': "ï", 'tex': "{\\\"i}" }, { 'unicode': "ñ", 'tex': "{\\~n}" }, { 'unicode': "ò", 'tex': "{\\`o}" }, { 'unicode': "ó", 'tex': "{\\'o}" }, { 'unicode': "ô", 'tex': "{\\^o}" }, { 'unicode': "õ", 'tex': "{\\~o}" }, { 'unicode': "ö", 'tex': "{\\\"o}" }, { 'unicode': "ù", 'tex': "{\\`u}" }, { 'unicode': "ú", 'tex': "{\\'u}" }, { 'unicode': "û", 'tex': "{\\^u}" }, { 'unicode': "ü", 'tex': "{\\\"u}" }, { 'unicode': "ý", 'tex': "{\\'y}" }, { 'unicode': "ÿ", 'tex': "{\\\"y}" }, { 'unicode': "Ā", 'tex': "{\\=A}" }, { 'unicode': "ā", 'tex': "{\\=a}" }, { 'unicode': "Ă", 'tex': '{\\uA}' }, { 'unicode': "ă", 'tex': '{\\ua}' }, { 'unicode': "Ą", 'tex': "{\\kA}" }, { 'unicode': "ą", 'tex': "{\\ka}" }, { 'unicode': "Ć", 'tex': "{\\'C}" }, { 'unicode': "ć", 'tex': "{\\'c}" }, { 'unicode': "Ĉ", 'tex': "{\\^C}" }, { 'unicode': "ĉ", 'tex': "{\\^c}" }, { 'unicode': "Ċ", 'tex': "{\\.C}" }, { 'unicode': "ċ", 'tex': "{\\.c}" }, { 'unicode': "Č", 'tex': "{\\vC}" }, { 'unicode': "č", 'tex': "{\\vc}" }, { 'unicode': "Ď", 'tex': "{\\vD}" }, { 'unicode': "ď", 'tex': "{\\vd}" }, { 'unicode': "Ē", 'tex': "{\\=E}" }, { 'unicode': "ē", 'tex': "{\\=e}" }, { 'unicode': "Ĕ", 'tex': '{\\uE}' }, { 'unicode': "ĕ", 'tex': '{\\ue}' }, { 'unicode': "Ė", 'tex': "{\\.E}" }, { 'unicode': "ė", 'tex': "{\\.e}" }, { 'unicode': "Ę", 'tex': "{\\kE}" }, { 'unicode': "ę", 'tex': "{\\ke}" }, { 'unicode': "Ě", 'tex': "{\\vE}" }, { 'unicode': "ě", 'tex': "{\\ve}" }, { 'unicode': "Ĝ", 'tex': "{\\^G}" }, { 'unicode': "ĝ", 'tex': "{\\^g}" }, { 'unicode': "Ğ", 'tex': '{\\uG}' }, { 'unicode': "ğ", 'tex': '{\\ug}' }, { 'unicode': "Ġ", 'tex': "{\\.G}" }, { 'unicode': "ġ", 'tex': "{\\.g}" }, { 'unicode': "Ģ", 'tex': "{\\cG}" }, { 'unicode': "ģ", 'tex': "{\\cg}" }, { 'unicode': "Ĥ", 'tex': "{\\^H}" }, { 'unicode': "ĥ", 'tex': "{\\^h}" }, { 'unicode': "Ĩ", 'tex': "{\\~I}" }, { 'unicode': "ĩ", 'tex': "{\\~i}" }, { 'unicode': "Ī", 'tex': "{\\=I}" }, { 'unicode': "ī", 'tex': "{\\=i}" }, { 'unicode': "Ĭ", 'tex': '{\\uI}' }, { 'unicode': "ĭ", 'tex': '{\\ui}' }, { 'unicode': "Į", 'tex': "{\\kI}" }, { 'unicode': "į", 'tex': "{\\ki}" }, { 'unicode': "İ", 'tex': "{\\.I}" }, { 'unicode': "Ĵ", 'tex': "{\\^J}" }, { 'unicode': "ĵ", 'tex': "{\\^j}" }, { 'unicode': "Ķ", 'tex': "{\\cK}" }, { 'unicode': "ķ", 'tex': "{\\ck}" }, { 'unicode': "Ĺ", 'tex': "{\\'L}" }, { 'unicode': "ĺ", 'tex': "{\\'l}" }, { 'unicode': "Ļ", 'tex': "{\\cL}" }, { 'unicode': "ļ", 'tex': "{\\cl}" }, { 'unicode': "Ľ", 'tex': "{\\vL}" }, { 'unicode': "ľ", 'tex': "{\\vl}" }, { 'unicode': "Ł", 'tex': "\\\\L{}" }, { 'unicode': "ł", 'tex': "\\\\l{}" }, { 'unicode': "Ń", 'tex': "{\\'N}" }, { 'unicode': "ń", 'tex': "{\\'n}" }, { 'unicode': "Ņ", 'tex': "{\\cN}" }, { 'unicode': "ņ", 'tex': "{\\cn}" }, { 'unicode': "Ň", 'tex': "{\\vN}" }, { 'unicode': "ň", 'tex': "{\\vn}" }, { 'unicode': "Ō", 'tex': "{\\=O}" }, { 'unicode': "ō", 'tex': "{\\=o}" }, { 'unicode': "Ŏ", 'tex': '{\\uO}' }, { 'unicode': "ŏ", 'tex': '{\\uo}' }, { 'unicode': "Ő", 'tex': "{\\HO}" }, { 'unicode': "ő", 'tex': "{\\Ho}" }, { 'unicode': "Ŕ", 'tex': "{\\'R}" }, { 'unicode': "ŕ", 'tex': "{\\'r}" }, { 'unicode': "Ŗ", 'tex': "{\\cR}" }, { 'unicode': "ŗ", 'tex': "{\\cr}" }, { 'unicode': "Ř", 'tex': "{\\vR}" }, { 'unicode': "ř", 'tex': "{\\vr}" }, { 'unicode': "Ś", 'tex': "{\\'S}" }, { 'unicode': "ś", 'tex': "{\\'s}" }, { 'unicode': "Ŝ", 'tex': "{\\^S}" }, { 'unicode': "ŝ", 'tex': "{\\^s}" }, { 'unicode': "Ş", 'tex': "{\\cS}" }, { 'unicode': "ş", 'tex': "{\\cs}" }, { 'unicode': "Š", 'tex': "{\\vS}" }, { 'unicode': "š", 'tex': "{\\vs}" }, { 'unicode': "Ţ", 'tex': "{\\cT}" }, { 'unicode': "ţ", 'tex': "{\\ct}" }, { 'unicode': "Ť", 'tex': "{\\vT}" }, { 'unicode': "ť", 'tex': "{\\vt}" }, { 'unicode': "Ũ", 'tex': "{\\~U}" }, { 'unicode': "ũ", 'tex': "{\\~u}" }, { 'unicode': "Ū", 'tex': "{\\=U}" }, { 'unicode': "ū", 'tex': "{\\=u}" }, { 'unicode': "Ŭ", 'tex': '{\\uU}' }, { 'unicode': "ŭ", 'tex': '{\\uu}' }, { 'unicode': "Ű", 'tex': "{\\HU}" }, { 'unicode': "ű", 'tex': "{\\Hu}" }, { 'unicode': "Ų", 'tex': "{\\kU}" }, { 'unicode': "ų", 'tex': "{\\ku}" }, { 'unicode': "Ŵ", 'tex': "{\\^W}" }, { 'unicode': "ŵ", 'tex': "{\\^w}" }, { 'unicode': "Ŷ", 'tex': "{\\^Y}" }, { 'unicode': "ŷ", 'tex': "{\\^y}" }, { 'unicode': "Ÿ", 'tex': "{\\\"Y}" }, { 'unicode': "Ź", 'tex': "{\\'Z}" }, { 'unicode': "ź", 'tex': "{\\'z}" }, { 'unicode': "Ż", 'tex': "{\\.Z}" }, { 'unicode': "ż", 'tex': "{\\.z}" }, { 'unicode': "Ž", 'tex': "{\\vZ}" }, { 'unicode': "ž", 'tex': "{\\vz}" }, { 'unicode': "Ǎ", 'tex': "{\\vA}" }, { 'unicode': "ǎ", 'tex': "{\\va}" }, { 'unicode': "Ǐ", 'tex': "{\\vI}" }, { 'unicode': "ǐ", 'tex': "{\\vi}" }, { 'unicode': "Ǒ", 'tex': "{\\vO}" }, { 'unicode': "ǒ", 'tex': "{\\vo}" }, { 'unicode': "Ǔ", 'tex': "{\\vU}" }, { 'unicode': "ǔ", 'tex': "{\\vu}" }, { 'unicode': "Ǧ", 'tex': "{\\vG}" }, { 'unicode': "ǧ", 'tex': "{\\vg}" }, { 'unicode': "Ǩ", 'tex': "{\\vK}" }, { 'unicode': "ǩ", 'tex': "{\\vk}" }, { 'unicode': "Ǫ", 'tex': "{\\kO}" }, { 'unicode': "ǫ", 'tex': "{\\ko}" }, { 'unicode': "ǰ", 'tex': "{\\vj}" }, { 'unicode': "Ǵ", 'tex': "{\\'G}" }, { 'unicode': "ǵ", 'tex': "{\\'g}" }, { 'unicode': "Ḃ", 'tex': "{\\.B}" }, { 'unicode': "ḃ", 'tex': "{\\.b}" }, { 'unicode': "Ḅ", 'tex': "{\\dB}" }, { 'unicode': "ḅ", 'tex': "{\\db}" }, { 'unicode': "Ḇ", 'tex': "{\\bB}" }, { 'unicode': "ḇ", 'tex': "{\\bb}" }, { 'unicode': "Ḋ", 'tex': "{\\.D}" }, { 'unicode': "ḋ", 'tex': "{\\.d}" }, { 'unicode': "Ḍ", 'tex': "{\\dD}" }, { 'unicode': "ḍ", 'tex': "{\\dd}" }, { 'unicode': "Ḏ", 'tex': "{\\bD}" }, { 'unicode': "ḏ", 'tex': "{\\bd}" }, { 'unicode': "Ḑ", 'tex': "{\\cD}" }, { 'unicode': "ḑ", 'tex': "{\\cd}" }, { 'unicode': "Ḟ", 'tex': "{\\.F}" }, { 'unicode': "ḟ", 'tex': "{\\.f}" }, { 'unicode': "Ḡ", 'tex': "{\\=G}" }, { 'unicode': "ḡ", 'tex': "{\\=g}" }, { 'unicode': "Ḣ", 'tex': "{\\.H}" }, { 'unicode': "ḣ", 'tex': "{\\.h}" }, { 'unicode': "Ḥ", 'tex': "{\\dH}" }, { 'unicode': "ḥ", 'tex': "{\\dh}" }, { 'unicode': "Ḧ", 'tex': "{\\\"H}" }, { 'unicode': "ḧ", 'tex': "{\\\"h}" }, { 'unicode': "Ḩ", 'tex': "{\\cH}" }, { 'unicode': "ḩ", 'tex': "{\\ch}" }, { 'unicode': "Ḱ", 'tex': "{\\'K}" }, { 'unicode': "ḱ", 'tex': "{\\'k}" }, { 'unicode': "Ḳ", 'tex': "{\\dK}" }, { 'unicode': "ḳ", 'tex': "{\\dk}" }, { 'unicode': "Ḵ", 'tex': "{\\bK}" }, { 'unicode': "ḵ", 'tex': "{\\bk}" }, { 'unicode': "Ḷ", 'tex': "{\\dL}" }, { 'unicode': "ḷ", 'tex': "{\\dl}" }, { 'unicode': "Ḻ", 'tex': "{\\bL}" }, { 'unicode': "ḻ", 'tex': "{\\bl}" }, { 'unicode': "Ḿ", 'tex': "{\\'M}" }, { 'unicode': "ḿ", 'tex': "{\\'m}" }, { 'unicode': "Ṁ", 'tex': "{\\.M}" }, { 'unicode': "ṁ", 'tex': "{\\.m}" }, { 'unicode': "Ṃ", 'tex': "{\\dM}" }, { 'unicode': "ṃ", 'tex': "{\\dm}" }, { 'unicode': "Ṅ", 'tex': "{\\.N}" }, { 'unicode': "ṅ", 'tex': "{\\.n}" }, { 'unicode': "Ṇ", 'tex': "{\\dN}" }, { 'unicode': "ṇ", 'tex': "{\\dn}" }, { 'unicode': "Ṉ", 'tex': "{\\bN}" }, { 'unicode': "ṉ", 'tex': "{\\bn}" }, { 'unicode': "Ṕ", 'tex': "{\\'P}" }, { 'unicode': "ṕ", 'tex': "{\\'p}" }, { 'unicode': "Ṗ", 'tex': "{\\.P}" }, { 'unicode': "ṗ", 'tex': "{\\.p}" }, { 'unicode': "Ṙ", 'tex': "{\\.R}" }, { 'unicode': "ṙ", 'tex': "{\\.r}" }, { 'unicode': "Ṛ", 'tex': "{\\dR}" }, { 'unicode': "ṛ", 'tex': "{\\dr}" }, { 'unicode': "Ṟ", 'tex': "{\\bR}" }, { 'unicode': "ṟ", 'tex': "{\\br}" }, { 'unicode': "Ṡ", 'tex': "{\\.S}" }, { 'unicode': "ṡ", 'tex': "{\\.s}" }, { 'unicode': "Ṣ", 'tex': "{\\dS}" }, { 'unicode': "ṣ", 'tex': "{\\ds}" }, { 'unicode': "Ṫ", 'tex': "{\\.T}" }, { 'unicode': "ṫ", 'tex': "{\\.t}" }, { 'unicode': "Ṭ", 'tex': "{\\dT}" }, { 'unicode': "ṭ", 'tex': "{\\dt}" }, { 'unicode': "Ṯ", 'tex': "{\\bT}" }, { 'unicode': "ṯ", 'tex': "{\\bt}" }, { 'unicode': "Ṽ", 'tex': "{\\~V}" }, { 'unicode': "ṽ", 'tex': "{\\~v}" }, { 'unicode': "Ṿ", 'tex': "{\\dV}" }, { 'unicode': "ṿ", 'tex': "{\\dv}" }, { 'unicode': "Ẁ", 'tex': "{\\`W}" }, { 'unicode': "ẁ", 'tex': "{\\`w}" }, { 'unicode': "Ẃ", 'tex': "{\\'W}" }, { 'unicode': "ẃ", 'tex': "{\\'w}" }, { 'unicode': "Ẅ", 'tex': "{\\\"W}" }, { 'unicode': "ẅ", 'tex': "{\\\"w}" }, { 'unicode': "Ẇ", 'tex': "{\\.W}" }, { 'unicode': "ẇ", 'tex': "{\\.w}" }, { 'unicode': "Ẉ", 'tex': "{\\dW}" }, { 'unicode': "ẉ", 'tex': "{\\dw}" }, { 'unicode': "Ẋ", 'tex': "{\\.X}" }, { 'unicode': "ẋ", 'tex': "{\\.x}" }, { 'unicode': "Ẍ", 'tex': "{\\\"X}" }, { 'unicode': "ẍ", 'tex': "{\\\"x}" }, { 'unicode': "Ẏ", 'tex': "{\\.Y}" }, { 'unicode': "ẏ", 'tex': "{\\.y}" }, { 'unicode': "Ẑ", 'tex': "{\\^Z}" }, { 'unicode': "ẑ", 'tex': "{\\^z}" }, { 'unicode': "Ẓ", 'tex': "{\\dZ}" }, { 'unicode': "ẓ", 'tex': "{\\dz}" }, { 'unicode': "Ẕ", 'tex': "{\\bZ}" }, { 'unicode': "ẕ", 'tex': "{\\bz}" }, { 'unicode': "ẖ", 'tex': "{\\bh}" }, { 'unicode': "ẗ", 'tex': "{\\\"t}" }, { 'unicode': "Ạ", 'tex': "{\\dA}" }, { 'unicode': "ạ", 'tex': "{\\da}" }, { 'unicode': "Ẹ", 'tex': "{\\dE}" }, { 'unicode': "ẹ", 'tex': "{\\de}" }, { 'unicode': "Ẽ", 'tex': "{\\~E}" }, { 'unicode': "ẽ", 'tex': "{\\~e}" }, { 'unicode': "Ị", 'tex': "{\\dI}" }, { 'unicode': "ị", 'tex': "{\\di}" }, { 'unicode': "Ọ", 'tex': "{\\dO}" }, { 'unicode': "ọ", 'tex': "{\\do}" }, { 'unicode': "Ụ", 'tex': "{\\dU}" }, { 'unicode': "ụ", 'tex': "{\\du}" }, { 'unicode': "Ỳ", 'tex': "{\\`Y}" }, { 'unicode': "ỳ", 'tex': "{\\`y}" }, { 'unicode': "Ỵ", 'tex': "{\\dY}" }, { 'unicode': "ỵ", 'tex': "{\\dy}" }, { 'unicode': "Ỹ", 'tex': "{\\~Y}" }, { 'unicode': "ỹ", 'tex': "{\\~y}" }, { 'unicode': "£", 'tex': "{\\pounds}" }, { 'unicode': "„", 'tex': "{\\glqq}" }, { 'unicode': "“", 'tex': "{\\grqq}" }, { 'unicode': "À", 'tex': "{\\`{A}}" }, { 'unicode': "Á", 'tex': "{\\'{A}}" }, { 'unicode': "Â", 'tex': "{\\^{A}}" }, { 'unicode': "Ã", 'tex': "{\\~{A}}" }, { 'unicode': "Ä", 'tex': "{\\\"{A}}" }, { 'unicode': "Å", 'tex': "{\\r{A}}" }, { 'unicode': "Ç", 'tex': "{\\c{C}}" }, { 'unicode': "È", 'tex': "{\\`{E}}" }, { 'unicode': "É", 'tex': "{\\'{E}}" }, { 'unicode': "Ê", 'tex': "{\\^{E}}" }, { 'unicode': "Ë", 'tex': "{\\\"{E}}" }, { 'unicode': "Ì", 'tex': "{\\`{I}}" }, { 'unicode': "Í", 'tex': "{\\'{I}}" }, { 'unicode': "Î", 'tex': "{\\^{I}}" }, { 'unicode': "Ï", 'tex': "{\\\"{I}}" }, { 'unicode': "Ñ", 'tex': "{\\~{N}}" }, { 'unicode': "Ò", 'tex': "{\\`{O}}" }, { 'unicode': "Ó", 'tex': "{\\'{O}}" }, { 'unicode': "Ô", 'tex': "{\\^{O}}" }, { 'unicode': "Õ", 'tex': "{\\~{O}}" }, { 'unicode': "Ö", 'tex': "{\\\"{O}}" }, { 'unicode': "Ù", 'tex': "{\\`{U}}" }, { 'unicode': "Ú", 'tex': "{\\'{U}}" }, { 'unicode': "Û", 'tex': "{\\^{U}}" }, { 'unicode': "Ü", 'tex': "{\\\"{U}}" }, { 'unicode': "Ý", 'tex': "{\\'{Y}}" }, { 'unicode': "à", 'tex': "{\\`{a}}" }, { 'unicode': "á", 'tex': "{\\'{a}}" }, { 'unicode': "â", 'tex': "{\\^{a}}" }, { 'unicode': "ã", 'tex': "{\\~{a}}" }, { 'unicode': "ä", 'tex': "{\\\"{a}}" }, { 'unicode': "å", 'tex': "{\\r{a}}" }, { 'unicode': "ç", 'tex': "{\\c{c}}" }, { 'unicode': "è", 'tex': "{\\`{e}}" }, { 'unicode': "é", 'tex': "{\\'{e}}" }, { 'unicode': "ê", 'tex': "{\\^{e}}" }, { 'unicode': "ë", 'tex': "{\\\"{e}}" }, { 'unicode': "ì", 'tex': "{\\`{i}}" }, { 'unicode': "í", 'tex': "{\\'{i}}" }, { 'unicode': "î", 'tex': "{\\^{i}}" }, { 'unicode': "ï", 'tex': "{\\\"{i}}" }, { 'unicode': "ñ", 'tex': "{\\~{n}}" }, { 'unicode': "ò", 'tex': "{\\`{o}}" }, { 'unicode': "ó", 'tex': "{\\'{o}}" }, { 'unicode': "ô", 'tex': "{\\^{o}}" }, { 'unicode': "õ", 'tex': "{\\~{o}}" }, { 'unicode': "ö", 'tex': "{\\\"{o}}" }, { 'unicode': "ù", 'tex': "{\\`{u}}" }, { 'unicode': "ú", 'tex': "{\\'{u}}" }, { 'unicode': "û", 'tex': "{\\^{u}}" }, { 'unicode': "ü", 'tex': "{\\\"{u}}" }, { 'unicode': "ý", 'tex': "{\\'{y}}" }, { 'unicode': "ÿ", 'tex': "{\\\"{y}}" }, { 'unicode': "Ā", 'tex': "{\\={A}}" }, { 'unicode': "ā", 'tex': "{\\={a}}" }, { 'unicode': "Ă", 'tex': '{\\u{A}}' }, { 'unicode': "ă", 'tex': '{\\u{a}}' }, { 'unicode': "Ą", 'tex': "{\\k{A}}" }, { 'unicode': "ą", 'tex': "{\\k{a}}" }, { 'unicode': "Ć", 'tex': "{\\'{C}}" }, { 'unicode': "ć", 'tex': "{\\'{c}}" }, { 'unicode': "Ĉ", 'tex': "{\\^{C}}" }, { 'unicode': "ĉ", 'tex': "{\\^{c}}" }, { 'unicode': "Ċ", 'tex': "{\\.{C}}" }, { 'unicode': "ċ", 'tex': "{\\.{c}}" }, { 'unicode': "Č", 'tex': "{\\v{C}}" }, { 'unicode': "č", 'tex': "{\\v{c}}" }, { 'unicode': "Ď", 'tex': "{\\v{D}}" }, { 'unicode': "ď", 'tex': "{\\v{d}}" }, { 'unicode': "Ē", 'tex': "{\\={E}}" }, { 'unicode': "ē", 'tex': "{\\={e}}" }, { 'unicode': "Ĕ", 'tex': '{\\u{E}}' }, { 'unicode': "ĕ", 'tex': '{\\u{e}}' }, { 'unicode': "Ė", 'tex': "{\\.{E}}" }, { 'unicode': "ė", 'tex': "{\\.{e}}" }, { 'unicode': "Ę", 'tex': "{\\k{E}}" }, { 'unicode': "ę", 'tex': "{\\k{e}}" }, { 'unicode': "Ě", 'tex': "{\\v{E}}" }, { 'unicode': "ě", 'tex': "{\\v{e}}" }, { 'unicode': "Ĝ", 'tex': "{\\^{G}}" }, { 'unicode': "ĝ", 'tex': "{\\^{g}}" }, { 'unicode': "Ğ", 'tex': '{\\u{G}}' }, { 'unicode': "ğ", 'tex': '{\\u{g}}' }, { 'unicode': "Ġ", 'tex': "{\\.{G}}" }, { 'unicode': "ġ", 'tex': "{\\.{g}}" }, { 'unicode': "Ģ", 'tex': "{\\c{G}}" }, { 'unicode': "ģ", 'tex': "{\\c{g}}" }, { 'unicode': "Ĥ", 'tex': "{\\^{H}}" }, { 'unicode': "ĥ", 'tex': "{\\^{h}}" }, { 'unicode': "Ĩ", 'tex': "{\\~{I}}" }, { 'unicode': "ĩ", 'tex': "{\\~{i}}" }, { 'unicode': "Ī", 'tex': "{\\={I}}" }, { 'unicode': "ī", 'tex': "{\\={i}}" }, { 'unicode': "Ĭ", 'tex': '{\\u{I}}' }, { 'unicode': "ĭ", 'tex': '{\\u{i}}' }, { 'unicode': "Į", 'tex': "{\\k{I}}" }, { 'unicode': "į", 'tex': "{\\k{i}}" }, { 'unicode': "İ", 'tex': "{\\.{I}}" }, { 'unicode': "Ĵ", 'tex': "{\\^{J}}" }, { 'unicode': "ĵ", 'tex': "{\\^{j}}" }, { 'unicode': "Ķ", 'tex': "{\\c{K}}" }, { 'unicode': "ķ", 'tex': "{\\c{k}}" }, { 'unicode': "Ĺ", 'tex': "{\\'{L}}" }, { 'unicode': "ĺ", 'tex': "{\\'{l}}" }, { 'unicode': "Ļ", 'tex': "{\\c{L}}" }, { 'unicode': "ļ", 'tex': "{\\c{l}}" }, { 'unicode': "Ľ", 'tex': "{\\v{L}}" }, { 'unicode': "ľ", 'tex': "{\\v{l}}" }, { 'unicode': "Ł", 'tex': "{\\L{}}" }, { 'unicode': "ł", 'tex': "{\\l{}}" }, { 'unicode': "Ń", 'tex': "{\\'{N}}" }, { 'unicode': "ń", 'tex': "{\\'{n}}" }, { 'unicode': "Ņ", 'tex': "{\\c{N}}" }, { 'unicode': "ņ", 'tex': "{\\c{n}}" }, { 'unicode': "Ň", 'tex': "{\\v{N}}" }, { 'unicode': "ň", 'tex': "{\\v{n}}" }, { 'unicode': "Ō", 'tex': "{\\={O}}" }, { 'unicode': "ō", 'tex': "{\\={o}}" }, { 'unicode': "Ŏ", 'tex': '{\\u{O}}' }, { 'unicode': "ŏ", 'tex': '{\\u{o}}' }, { 'unicode': "Ő", 'tex': "{\\H{O}}" }, { 'unicode': "ő", 'tex': "{\\H{o}}" }, { 'unicode': "Ŕ", 'tex': "{\\'{R}}" }, { 'unicode': "ŕ", 'tex': "{\\'{r}}" }, { 'unicode': "Ŗ", 'tex': "{\\c{R}}" }, { 'unicode': "ŗ", 'tex': "{\\c{r}}" }, { 'unicode': "Ř", 'tex': "{\\v{R}}" }, { 'unicode': "ř", 'tex': "{\\v{r}}" }, { 'unicode': "Ś", 'tex': "{\\'{S}}" }, { 'unicode': "ś", 'tex': "{\\'{s}}" }, { 'unicode': "Ŝ", 'tex': "{\\^{S}}" }, { 'unicode': "ŝ", 'tex': "{\\^{s}}" }, { 'unicode': "Ş", 'tex': "{\\c{S}}" }, { 'unicode': "ş", 'tex': "{\\c{s}}" }, { 'unicode': "Š", 'tex': "{\\v{S}}" }, { 'unicode': "š", 'tex': "{\\v{s}}" }, { 'unicode': "Ţ", 'tex': "{\\c{T}}" }, { 'unicode': "ţ", 'tex': "{\\c{t}}" }, { 'unicode': "Ť", 'tex': "{\\v{T}}" }, { 'unicode': "ť", 'tex': "{\\v{t}}" }, { 'unicode': "Ũ", 'tex': "{\\~{U}}" }, { 'unicode': "ũ", 'tex': "{\\~{u}}" }, { 'unicode': "Ū", 'tex': "{\\={U}}" }, { 'unicode': "ū", 'tex': "{\\={u}}" }, { 'unicode': "Ŭ", 'tex': '{\\u{U}}' }, { 'unicode': "ŭ", 'tex': '{\\u{u}}' }, { 'unicode': "Ű", 'tex': "{\\H{U}}" }, { 'unicode': "ű", 'tex': "{\\H{u}}" }, { 'unicode': "Ų", 'tex': "{\\k{U}}" }, { 'unicode': "ų", 'tex': "{\\k{u}}" }, { 'unicode': "Ŵ", 'tex': "{\\^{W}}" }, { 'unicode': "ŵ", 'tex': "{\\^{w}}" }, { 'unicode': "Ŷ", 'tex': "{\\^{Y}}" }, { 'unicode': "ŷ", 'tex': "{\\^{y}}" }, { 'unicode': "Ÿ", 'tex': "{\\\"{Y}}" }, { 'unicode': "Ź", 'tex': "{\\'{Z}}" }, { 'unicode': "ź", 'tex': "{\\'{z}}" }, { 'unicode': "Ż", 'tex': "{\\.{Z}}" }, { 'unicode': "ż", 'tex': "{\\.{z}}" }, { 'unicode': "Ž", 'tex': "{\\v{Z}}" }, { 'unicode': "ž", 'tex': "{\\v{z}}" }, { 'unicode': "Ǎ", 'tex': "{\\v{A}}" }, { 'unicode': "ǎ", 'tex': "{\\v{a}}" }, { 'unicode': "Ǐ", 'tex': "{\\v{I}}" }, { 'unicode': "ǐ", 'tex': "{\\v{i}}" }, { 'unicode': "Ǒ", 'tex': "{\\v{O}}" }, { 'unicode': "ǒ", 'tex': "{\\v{o}}" }, { 'unicode': "Ǔ", 'tex': "{\\v{U}}" }, { 'unicode': "ǔ", 'tex': "{\\v{u}}" }, { 'unicode': "Ǧ", 'tex': "{\\v{G}}" }, { 'unicode': "ǧ", 'tex': "{\\v{g}}" }, { 'unicode': "Ǩ", 'tex': "{\\v{K}}" }, { 'unicode': "ǩ", 'tex': "{\\v{k}}" }, { 'unicode': "Ǫ", 'tex': "{\\k{O}}" }, { 'unicode': "ǫ", 'tex': "{\\k{o}}" }, { 'unicode': "ǰ", 'tex': "{\\v{j}}" }, { 'unicode': "Ǵ", 'tex': "{\\'{G}}" }, { 'unicode': "ǵ", 'tex': "{\\'{g}}" }, { 'unicode': "Ḃ", 'tex': "{\\.{B}}" }, { 'unicode': "ḃ", 'tex': "{\\.{b}}" }, { 'unicode': "Ḅ", 'tex': "{\\d{B}}" }, { 'unicode': "ḅ", 'tex': "{\\d{b}}" }, { 'unicode': "Ḇ", 'tex': "{\\b{B}}" }, { 'unicode': "ḇ", 'tex': "{\\b{b}}" }, { 'unicode': "Ḋ", 'tex': "{\\.{D}}" }, { 'unicode': "ḋ", 'tex': "{\\.{d}}" }, { 'unicode': "Ḍ", 'tex': "{\\d{D}}" }, { 'unicode': "ḍ", 'tex': "{\\d{d}}" }, { 'unicode': "Ḏ", 'tex': "{\\b{D}}" }, { 'unicode': "ḏ", 'tex': "{\\b{d}}" }, { 'unicode': "Ḑ", 'tex': "{\\c{D}}" }, { 'unicode': "ḑ", 'tex': "{\\c{d}}" }, { 'unicode': "Ḟ", 'tex': "{\\.{F}}" }, { 'unicode': "ḟ", 'tex': "{\\.{f}}" }, { 'unicode': "Ḡ", 'tex': "{\\={G}}" }, { 'unicode': "ḡ", 'tex': "{\\={g}}" }, { 'unicode': "Ḣ", 'tex': "{\\.{H}}" }, { 'unicode': "ḣ", 'tex': "{\\.{h}}" }, { 'unicode': "Ḥ", 'tex': "{\\d{H}}" }, { 'unicode': "ḥ", 'tex': "{\\d{h}}" }, { 'unicode': "Ḧ", 'tex': "{\\\"{H}}" }, { 'unicode': "ḧ", 'tex': "{\\\"{h}}" }, { 'unicode': "Ḩ", 'tex': "{\\c{H}}" }, { 'unicode': "ḩ", 'tex': "{\\c{h}}" }, { 'unicode': "Ḱ", 'tex': "{\\'{K}}" }, { 'unicode': "ḱ", 'tex': "{\\'{k}}" }, { 'unicode': "Ḳ", 'tex': "{\\d{K}}" }, { 'unicode': "ḳ", 'tex': "{\\d{k}}" }, { 'unicode': "Ḵ", 'tex': "{\\b{K}}" }, { 'unicode': "ḵ", 'tex': "{\\b{k}}" }, { 'unicode': "Ḷ", 'tex': "{\\d{L}}" }, { 'unicode': "ḷ", 'tex': "{\\d{l}}" }, { 'unicode': "Ḻ", 'tex': "{\\b{L}}" }, { 'unicode': "ḻ", 'tex': "{\\b{l}}" }, { 'unicode': "Ḿ", 'tex': "{\\'{M}}" }, { 'unicode': "ḿ", 'tex': "{\\'{m}}" }, { 'unicode': "Ṁ", 'tex': "{\\.{M}}" }, { 'unicode': "ṁ", 'tex': "{\\.{m}}" }, { 'unicode': "Ṃ", 'tex': "{\\d{M}}" }, { 'unicode': "ṃ", 'tex': "{\\d{m}}" }, { 'unicode': "Ṅ", 'tex': "{\\.{N}}" }, { 'unicode': "ṅ", 'tex': "{\\.{n}}" }, { 'unicode': "Ṇ", 'tex': "{\\d{N}}" }, { 'unicode': "ṇ", 'tex': "{\\d{n}}" }, { 'unicode': "Ṉ", 'tex': "{\\b{N}}" }, { 'unicode': "ṉ", 'tex': "{\\b{n}}" }, { 'unicode': "Ṕ", 'tex': "{\\'{P}}" }, { 'unicode': "ṕ", 'tex': "{\\'{p}}" }, { 'unicode': "Ṗ", 'tex': "{\\.{P}}" }, { 'unicode': "ṗ", 'tex': "{\\.{p}}" }, { 'unicode': "Ṙ", 'tex': "{\\.{R}}" }, { 'unicode': "ṙ", 'tex': "{\\.{r}}" }, { 'unicode': "Ṛ", 'tex': "{\\d{R}}" }, { 'unicode': "ṛ", 'tex': "{\\d{r}}" }, { 'unicode': "Ṟ", 'tex': "{\\b{R}}" }, { 'unicode': "ṟ", 'tex': "{\\b{r}}" }, { 'unicode': "Ṡ", 'tex': "{\\.{S}}" }, { 'unicode': "ṡ", 'tex': "{\\.{s}}" }, { 'unicode': "Ṣ", 'tex': "{\\d{S}}" }, { 'unicode': "ṣ", 'tex': "{\\d{s}}" }, { 'unicode': "Ṫ", 'tex': "{\\.{T}}" }, { 'unicode': "ṫ", 'tex': "{\\.{t}}" }, { 'unicode': "Ṭ", 'tex': "{\\d{T}}" }, { 'unicode': "ṭ", 'tex': "{\\d{t}}" }, { 'unicode': "Ṯ", 'tex': "{\\b{T}}" }, { 'unicode': "ṯ", 'tex': "{\\b{t}}" }, { 'unicode': "Ṽ", 'tex': "{\\~{V}}" }, { 'unicode': "ṽ", 'tex': "{\\~{v}}" }, { 'unicode': "Ṿ", 'tex': "{\\d{V}}" }, { 'unicode': "ṿ", 'tex': "{\\d{v}}" }, { 'unicode': "Ẁ", 'tex': "{\\`{W}}" }, { 'unicode': "ẁ", 'tex': "{\\`{w}}" }, { 'unicode': "Ẃ", 'tex': "{\\'{W}}" }, { 'unicode': "ẃ", 'tex': "{\\'{w}}" }, { 'unicode': "Ẅ", 'tex': "{\\\"{W}}" }, { 'unicode': "ẅ", 'tex': "{\\\"{w}}" }, { 'unicode': "Ẇ", 'tex': "{\\.{W}}" }, { 'unicode': "ẇ", 'tex': "{\\.{w}}" }, { 'unicode': "Ẉ", 'tex': "{\\d{W}}" }, { 'unicode': "ẉ", 'tex': "{\\d{w}}" }, { 'unicode': "Ẋ", 'tex': "{\\.{X}}" }, { 'unicode': "ẋ", 'tex': "{\\.{x}}" }, { 'unicode': "Ẍ", 'tex': "{\\\"{X}}" }, { 'unicode': "ẍ", 'tex': "{\\\"{x}}" }, { 'unicode': "Ẏ", 'tex': "{\\.{Y}}" }, { 'unicode': "ẏ", 'tex': "{\\.{y}}" }, { 'unicode': "Ẑ", 'tex': "{\\^{Z}}" }, { 'unicode': "ẑ", 'tex': "{\\^{z}}" }, { 'unicode': "Ẓ", 'tex': "{\\d{Z}}" }, { 'unicode': "ẓ", 'tex': "{\\d{z}}" }, { 'unicode': "Ẕ", 'tex': "{\\b{Z}}" }, { 'unicode': "ẕ", 'tex': "{\\b{z}}" }, { 'unicode': "ẖ", 'tex': "{\\b{h}}" }, { 'unicode': "ẗ", 'tex': "{\\\"{t}}" }, { 'unicode': "Ạ", 'tex': "{\\d{A}}" }, { 'unicode': "ạ", 'tex': "{\\d{a}}" }, { 'unicode': "Ẹ", 'tex': "{\\d{E}}" }, { 'unicode': "ẹ", 'tex': "{\\d{e}}" }, { 'unicode': "Ẽ", 'tex': "{\\~{E}}" }, { 'unicode': "ẽ", 'tex': "{\\~{e}}" }, { 'unicode': "Ị", 'tex': "{\\d{I}}" }, { 'unicode': "ị", 'tex': "{\\d{i}}" }, { 'unicode': "Ọ", 'tex': "{\\d{O}}" }, { 'unicode': "ọ", 'tex': "{\\d{o}}" }, { 'unicode': "Ụ", 'tex': "{\\d{U}}" }, { 'unicode': "ụ", 'tex': "{\\d{u}}" }, { 'unicode': "Ỳ", 'tex': "{\\`{Y}}" }, { 'unicode': "ỳ", 'tex': "{\\`{y}}" }, { 'unicode': "Ỵ", 'tex': "{\\d{Y}}" }, { 'unicode': "ỵ", 'tex': "{\\d{y}}" }, { 'unicode': "Ỹ", 'tex': "{\\~{Y}}" }, { 'unicode': "ỹ", 'tex': "{\\~{y}}" }];
/** A list of field types of Bibligraphy DB with lookup by field name. */
var BibFieldTypes = exports.BibFieldTypes = {
  abstract: {
    'id': 1, 'type': 'f_literal', 'name': 'abstract', 'biblatex': 'abstract', 'csl': 'abstract', 'title': gettext('Abstract') },
  addendum: {
    'id': 2, 'type': 'f_literal', 'name': 'addendum', 'biblatex': 'addendum', 'title': gettext('Addendum') },
  afterword: {
    'id': 3, 'type': 'l_name', 'name': 'afterword', 'biblatex': 'afterword', 'title': gettext('Afterword') },
  annotation: {
    'id': 4, 'type': 'f_literal', 'name': 'annotation', 'biblatex': 'annotation', 'title': gettext('Annotation') },
  annotator: {
    'id': 5, 'type': 'l_name', 'name': 'annotator', 'biblatex': 'annotator', 'title': gettext('Annotations author(s)') },
  author: {
    'id': 6, 'type': 'l_name', 'name': 'author', 'biblatex': 'author', 'csl': 'author', 'title': gettext('Author(s)') },
  authortype: {
    'id': 7, 'type': 'f_key', 'name': 'authortype', 'biblatex': 'authortype', 'title': gettext('Author type') },
  bookauthor: {
    'id': 8, 'type': 'l_name', 'name': 'bookauthor', 'biblatex': 'bookauthor', 'csl': 'container-author', 'title': gettext('Book author(s)') },
  bookpagination: {
    'id': 9, 'type': 'f_key', 'name': 'bookpagination', 'biblatex': 'bookpagination', 'title': gettext('Book pagination'), 'localization': 'pagination' },
  booksubtitle: {
    'id': 10, 'type': 'f_literal', 'name': 'booksubtitle', 'biblatex': 'booksubtitle', 'title': gettext('Book subtitle') },
  booktitle: {
    'id': 11, 'type': 'f_literal', 'name': 'booktitle', 'biblatex': 'booktitle', 'csl': 'container-title', 'title': gettext('Book title') },
  booktitleaddon: {
    'id': 12, 'type': 'f_literal', 'name': 'booktitleaddon', 'biblatex': 'booktitleaddon', 'title': gettext('Book title annex') },
  chapter: {
    'id': 13, 'type': 'f_literal', 'name': 'chapter', 'biblatex': 'chapter', 'csl': 'chapter-number', 'title': gettext('Chapter or section') },
  commentator: {
    'id': 14, 'type': 'l_name', 'name': 'commentator', 'biblatex': 'commentator', 'title': gettext('Author(s) of a commentary') },
  date: {
    'id': 15, 'type': 'f_date', 'name': 'date', 'biblatex': 'date', 'csl': 'issued', 'title': gettext('Publication date') },
  doi: {
    'id': 16, 'type': 'f_verbatim', 'name': 'doi', 'biblatex': 'doi', 'csl': 'DOI', 'title': gettext('Digital Object Identifier') },
  edition: {
    'id': 17, 'type': 'f_integer', 'name': 'edition', 'biblatex': 'edition', 'csl': 'edition', 'title': gettext('Edition') },
  editor: {
    'id': 18, 'type': 'l_name', 'name': 'editor', 'biblatex': 'editor', 'csl': 'editor', 'title': gettext('Editor(s)') },
  editora: {
    'id': 19, 'type': 'l_name', 'name': 'editora', 'biblatex': 'editora', 'title': gettext('Secondary editor') },
  editorb: {
    'id': 20, 'type': 'l_name', 'name': 'editorb', 'biblatex': 'editorb', 'title': gettext('Secondary editor 2') },
  editorc: {
    'id': 21, 'type': 'l_name', 'name': 'editorc', 'biblatex': 'editorc', 'title': gettext('Secondary editor 3') },
  editortype: {
    'id': 22, 'type': 'f_key', 'name': 'editortype', 'biblatex': 'editortype', 'title': gettext('Role of editor(s)') },
  editoratype: {
    'id': 23, 'type': 'f_key', 'name': 'editoratype', 'biblatex': 'editoratype', 'title': gettext('Role of secondary editor') },
  editorbtype: {
    'id': 24, 'type': 'f_key', 'name': 'editorbtype', 'biblatex': 'editorbtype', 'title': gettext('Role of secondary editor 2') },
  editorctype: {
    'id': 25, 'type': 'f_key', 'name': 'editorctype', 'biblatex': 'editorctype', 'title': gettext('Role of secondary editor 3') },
  eid: {
    'id': 26, 'type': 'f_literal', 'name': 'eid', 'biblatex': 'eid', 'title': gettext('Electronic identifier of an article') },
  entrysubtype: {
    'id': 27, 'type': 'f_literal', 'name': 'entrysubtype', 'biblatex': 'entrysubtype', 'title': gettext('Entry subtype') },
  eprint: {
    'id': 28, 'type': 'f_verbatim', 'name': 'eprint', 'biblatex': 'eprint', 'title': gettext('Electronic identifier of an online publication') },
  eprintclass: {
    'id': 29, 'type': 'l_literal', 'name': 'eprintclass', 'biblatex': 'eprintclass', 'title': gettext('Additional information to an online publication') },
  eprinttype: {
    'id': 30, 'type': 'f_literal', 'name': 'eprinttype', 'biblatex': 'eprinttype', 'title': gettext('Eprint identifier type') },
  eventdate: {
    'id': 31, 'type': 'f_date', 'name': 'eventdate', 'biblatex': 'eventdate', 'csl': 'event-date', 'title': gettext('Event date') },
  eventtitle: {
    'id': 32, 'type': 'f_literal', 'name': 'eventtitle', 'biblatex': 'eventtitle', 'csl': 'event', 'title': gettext('Event title') },
  file: {
    'id': 33, 'type': 'f_verbatim', 'name': 'file', 'biblatex': 'file', 'title': gettext('Local link to the work') },
  foreword: {
    'id': 34, 'type': 'l_name', 'name': 'foreword', 'biblatex': 'foreword', 'title': gettext('Foreword author(s)') },
  holder: {
    'id': 35, 'type': 'l_name', 'name': 'holder', 'biblatex': 'holder', 'title': gettext('Patent holder(s)') },
  howpublished: {
    'id': 36, 'type': 'f_literal', 'name': 'howpublished', 'biblatex': 'howpublished', 'csl': 'medium', 'title': gettext('Publication notice') },
  indextitle: {
    'id': 37, 'type': 'f_literal', 'name': 'indextitle', 'biblatex': 'indextitle', 'title': gettext('Title for indexing') },
  institution: {
    'id': 38, 'type': 'l_literal', 'name': 'institution', 'biblatex': 'institution', 'title': gettext('Institution') },
  introduction: {
    'id': 39, 'type': 'l_name', 'name': 'introduction', 'biblatex': 'introduction', 'title': gettext('Author(s) of an introduction to the work') },
  isan: {
    'id': 40, 'type': 'f_literal', 'name': 'isan', 'biblatex': 'isan', 'title': gettext('ISAN') },
  isbn: {
    'id': 41, 'type': 'f_literal', 'name': 'isbn', 'biblatex': 'isbn', 'csl': 'ISBN', 'title': gettext('ISBN') },
  ismn: {
    'id': 42, 'type': 'f_literal', 'name': 'ismn', 'biblatex': 'ismn', 'title': gettext('ISMN') },
  isrn: {
    'id': 43, 'type': 'f_literal', 'name': 'isrn', 'biblatex': 'isrn', 'title': gettext('ISRN') },
  issn: {
    'id': 44, 'type': 'f_literal', 'name': 'issn', 'biblatex': 'issn', 'csl': 'ISSN', 'title': gettext('ISSN') },
  issue: {
    'id': 45, 'type': 'f_literal', 'name': 'issue', 'biblatex': 'issue', 'csl': 'issue', 'title': gettext('Issue') },
  issuesubtitle: {
    'id': 46, 'type': 'f_literal', 'name': 'issuesubtitle', 'biblatex': 'issuesubtitle', 'title': gettext('Issue subtitle') },
  issuetitle: {
    'id': 47, 'type': 'f_literal', 'name': 'issuetitle', 'biblatex': 'issuetitle', 'title': gettext('Issue title') },
  iswc: {
    'id': 48, 'type': 'f_literal', 'name': 'iswc', 'biblatex': 'iswc', 'title': gettext('ISWC') },
  journalsubtitle: {
    'id': 49, 'type': 'f_literal', 'name': 'journalsubtitle', 'biblatex': 'journalsubtitle', 'title': gettext('Subtitle of publication') },
  journaltitle: {
    'id': 50, 'type': 'f_literal', 'name': 'journaltitle', 'biblatex': 'journaltitle', 'csl': 'container-title', 'title': gettext('Title of publication') },
  label: {
    'id': 51, 'type': 'f_literal', 'name': 'label', 'biblatex': 'label', 'title': gettext('Label') },
  language: {
    'id': 52, 'type': 'l_key', 'name': 'language', 'biblatex': 'language', 'csl': 'language', 'title': gettext('Language(s)') },
  library: {
    'id': 53, 'type': 'f_literal', 'name': 'library', 'biblatex': 'library', 'title': gettext('Library information') },
  location: {
    'id': 54, 'type': 'l_literal', 'name': 'location', 'biblatex': 'location', 'csl': 'publisher-place', 'title': gettext('Location(s) of publication') },
  mainsubtitle: {
    'id': 55, 'type': 'f_literal', 'name': 'mainsubtitle', 'biblatex': 'mainsubtitle', 'title': gettext('Main subtitle') },
  maintitle: {
    'id': 56, 'type': 'f_literal', 'name': 'maintitle', 'biblatex': 'maintitle', 'title': gettext('Maintitle') },
  maintitleaddon: {
    'id': 57, 'type': 'f_literal', 'name': 'maintitleaddon', 'biblatex': 'maintitleaddon', 'title': gettext('Annex to the maintitle') },
  nameaddon: {
    'id': 58, 'type': 'f_literal', 'name': 'nameaddon', 'biblatex': 'nameaddon', 'title': gettext('author name addon') },
  note: {
    'id': 59, 'type': 'f_literal', 'name': 'note', 'biblatex': 'note', 'csl': 'note', 'title': gettext('Note') },
  number: {
    'id': 60, 'type': 'f_literal', 'name': 'number', 'biblatex': 'number', 'csl': 'number', 'title': gettext('Number of the work in a series') },
  organization: {
    'id': 61, 'type': 'l_literal', 'name': 'organization', 'biblatex': 'organization', 'title': gettext('Organization(s)') },
  origdate: {
    'id': 62, 'type': 'f_date', 'name': 'origdate', 'biblatex': 'origdate', 'csl': 'original-date', 'title': gettext('Publication date of the original work') },
  origlanguage: {
    'id': 63, 'type': 'f_key', 'name': 'origlanguage', 'biblatex': 'origlanguage', 'title': gettext('Language of the original work') },
  origlocation: {
    'id': 64, 'type': 'l_literal', 'name': 'origlocation', 'biblatex': 'origlocation', 'csl': 'original-publisher-place', 'title': gettext('Publication location of the original edition') },
  origpublisher: {
    'id': 65, 'type': 'l_literal', 'name': 'origpublisher', 'biblatex': 'origpublisher', 'csl': 'original-publisher', 'title': gettext('Publisher of the original edition') },
  origtitle: {
    'id': 66, 'type': 'f_literal', 'name': 'origtitle', 'biblatex': 'origtitle', 'csl': 'original-title', 'title': gettext('Title of the original work') },
  pages: {
    'id': 67, 'type': 'f_range', 'name': 'pages', 'biblatex': 'pages', 'csl': 'page', 'title': gettext('Page numbers or page ranges') },
  pagetotal: {
    'id': 68, 'type': 'f_literal', 'name': 'pagetotal', 'biblatex': 'pagetotal', 'csl': 'number-of-pages', 'title': gettext('Total number of pages') },
  pagination: {
    'id': 69, 'type': 'f_key', 'name': 'pagination', 'biblatex': 'pagination', 'title': gettext('Pagination'), 'localization': 'pagination' },
  part: {
    'id': 70, 'type': 'f_literal', 'name': 'part', 'biblatex': 'part', 'title': gettext('Number of a partial volume') },
  publisher: {
    'id': 71, 'type': 'l_literal', 'name': 'publisher', 'biblatex': 'publisher', 'csl': 'publisher', 'title': gettext('Publisher(s)') },
  pubstate: {
    'id': 72, 'type': 'f_key', 'name': 'pubstate', 'biblatex': 'pubstate', 'csl': 'status', 'title': gettext('Publication state of the work'), 'localization': 'publication_state' },
  reprinttitle: {
    'id': 73, 'type': 'f_literal', 'name': 'reprinttitle', 'biblatex': 'reprinttitle', 'title': gettext('Title of reprint') },
  series: {
    'id': 74, 'type': 'f_literal', 'name': 'series', 'biblatex': 'series', 'csl': 'collection-title', 'title': gettext('Name of series') },
  shortauthor: {
    'id': 75, 'type': 'l_name', 'name': 'shortauthor', 'biblatex': 'shortauthor', 'title': gettext('Abbreviated author(s)') },
  shorteditor: {
    'id': 76, 'type': 'l_name', 'name': 'shorteditor', 'biblatex': 'shorteditor', 'title': gettext('Abbreviated editor(s)') },
  shorthand: {
    'id': 77, 'type': 'f_literal', 'name': 'shorthand', 'biblatex': 'shorthand', 'title': gettext('Shorthand') },
  shorthandintro: {
    'id': 78, 'type': 'f_literal', 'name': 'shorthandintro', 'biblatex': 'shorthandintro', 'title': gettext('Shorthand intro') },
  shortjournal: {
    'id': 79, 'type': 'f_literal', 'name': 'shortjournal', 'biblatex': 'shortjournal', 'csl': 'container-title-short', 'title': gettext('Acronym of the publication\'s title') },
  shortseries: {
    'id': 80, 'type': 'f_literal', 'name': 'shortseries', 'biblatex': 'shortseries', 'title': gettext('Acronym of the series') },
  shorttitle: {
    'id': 81, 'type': 'f_literal', 'name': 'shorttitle', 'biblatex': 'shorttitle', 'csl': 'title-short', 'title': gettext('Abridged title') },
  subtitle: {
    'id': 82, 'type': 'f_literal', 'name': 'subtitle', 'biblatex': 'subtitle', 'title': gettext('Subtitle') },
  title: {
    'id': 83, 'type': 'f_literal', 'name': 'title', 'biblatex': 'title', 'csl': 'title', 'title': gettext('Title') },
  titleaddon: {
    'id': 84, 'type': 'f_literal', 'name': 'titleaddon', 'biblatex': 'titleaddon', 'title': gettext('Title addon') },
  translator: {
    'id': 85, 'type': 'l_name', 'name': 'translator', 'biblatex': 'translator', 'csl': 'translator', 'title': gettext('Translator(s)') },
  type: {
    'id': 86, 'type': 'f_key', 'name': 'type', 'biblatex': 'type', 'title': gettext('Manual type'), 'localization': 'types' },
  url: {
    'id': 87, 'type': 'f_uri', 'name': 'url', 'biblatex': 'url', 'csl': 'URL', 'title': gettext('URL') },
  urldate: {
    'id': 88, 'type': 'f_date', 'name': 'urldate', 'biblatex': 'urldate', 'csl': 'accessed', 'title': gettext('Access date') },
  venue: {
    'id': 89, 'type': 'f_literal', 'name': 'venue', 'biblatex': 'venue', 'csl': 'event-place', 'title': gettext('Location of a conference') },
  version: {
    'id': 90, 'type': 'f_literal', 'name': 'version', 'biblatex': 'version', 'csl': 'version', 'title': gettext('Version') },
  volume: {
    'id': 91, 'type': 'f_literal', 'name': 'volume', 'biblatex': 'volume', 'csl': 'volume', 'title': gettext('Volume') },
  volumes: {
    'id': 92, 'type': 'f_literal', 'name': 'volumes', 'biblatex': 'volumes', 'csl': 'number-of-volumes', 'title': gettext('Total number of volumes') }
};
/** A list of all bibentry types and their fields. */
var BibEntryTypes = exports.BibEntryTypes = {
  1: {
    'id': 1, 'order': 1, 'name': 'article', 'biblatex': 'article', 'csl': 'article', 'title': gettext('Article'), 'required': ['journaltitle', 'title', 'author', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'annotator', 'commentator', 'doi', 'editor', 'editora', 'editorb', 'editorc', 'eid', 'eprint', 'eprintclass', 'eprinttype', 'issn', 'issue', 'issuesubtitle', 'issuetitle', 'journalsubtitle', 'language', 'note', 'number', 'origlanguage', 'pages', 'pubstate', 'series', 'subtitle', 'titleaddon', 'translator', 'url', 'urldate', 'version', 'volume']
  },
  2: {
    'id': 2, 'order': 10, 'name': 'book', 'biblatex': 'book', 'csl': 'book', 'title': gettext('Book'), 'required': ['title', 'author', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'afterword', 'annotator', 'chapter', 'commentator', 'doi', 'edition', 'editor', 'editora', 'editorb', 'editorc', 'eprint', 'eprintclass', 'eprinttype', 'foreword', 'introduction', 'isbn', 'language', 'location', 'mainsubtitle', 'maintitle', 'maintitleaddon', 'note', 'number', 'origlanguage', 'pages', 'pagetotal', 'part', 'publisher', 'pubstate', 'series', 'subtitle', 'titleaddon', 'translator', 'url', 'urldate', 'volume', 'volumes']
  },
  3: {
    'id': 3, 'order': 11, 'name': 'mvbook', 'biblatex': 'mvbook', 'csl': 'book', 'title': gettext('Multi-volume book'), 'required': ['title', 'author', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'afterword', 'annotator', 'commentator', 'doi', 'edition', 'editor', 'editora', 'editorb', 'editorc', 'eprint', 'eprintclass', 'eprinttype', 'foreword', 'introduction', 'isbn', 'language', 'location', 'note', 'number', 'origlanguage', 'pagetotal', 'publisher', 'pubstate', 'series', 'subtitle', 'titleaddon', 'translator', 'url', 'urldate', 'volumes']
  },
  4: {
    'id': 4, 'order': 12, 'name': 'inbook', 'biblatex': 'inbook', 'csl': 'chapter', 'title': gettext('In book'), 'required': ['title', 'booktitle', 'author', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'afterword', 'annotator', 'bookauthor', 'booksubtitle', 'booktitleaddon', 'chapter', 'commentator', 'doi', 'edition', 'editor', 'editora', 'editorb', 'editorc', 'eprint', 'eprintclass', 'eprinttype', 'foreword', 'introduction', 'isbn', 'language', 'location', 'mainsubtitle', 'maintitle', 'maintitleaddon', 'note', 'number', 'origlanguage', 'pages', 'part', 'publisher', 'pubstate', 'series', 'subtitle', 'titleaddon', 'translator', 'url', 'urldate', 'volume', 'volumes']
  },
  5: {
    'id': 5, 'order': 13, 'name': 'bookinbook', 'biblatex': 'bookinbook', 'csl': 'chapter', 'title': gettext('Book in book'), 'required': ['title', 'booktitle', 'author', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'afterword', 'annotator', 'bookauthor', 'booksubtitle', 'booktitleaddon', 'chapter', 'commentator', 'doi', 'edition', 'editor', 'editora', 'editorb', 'editorc', 'eprint', 'eprintclass', 'eprinttype', 'foreword', 'introduction', 'isbn', 'language', 'location', 'mainsubtitle', 'maintitle', 'maintitleaddon', 'note', 'number', 'origlanguage', 'pages', 'part', 'publisher', 'pubstate', 'series', 'subtitle', 'titleaddon', 'translator', 'url', 'urldate', 'volume', 'volumes']
  },
  6: {
    'id': 6, 'order': 14, 'name': 'suppbook', 'biblatex': 'suppbook', 'csl': 'chapter', 'title': gettext('Supplemental material in a book'), 'required': ['title', 'booktitle', 'author', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'afterword', 'annotator', 'bookauthor', 'booksubtitle', 'booktitleaddon', 'chapter', 'commentator', 'doi', 'edition', 'editor', 'editora', 'editorb', 'editorc', 'eprint', 'eprintclass', 'eprinttype', 'foreword', 'introduction', 'isbn', 'language', 'location', 'mainsubtitle', 'maintitle', 'maintitleaddon', 'note', 'number', 'origlanguage', 'pages', 'part', 'publisher', 'pubstate', 'series', 'subtitle', 'titleaddon', 'translator', 'url', 'urldate', 'volume', 'volumes']
  },
  7: {
    'id': 7, 'order': 15, 'name': 'booklet', 'biblatex': 'booklet', 'csl': 'pamphlet', 'title': gettext('Booklet'), 'required': ['title', 'date'],
    'eitheror': ['editor', 'author'],
    'optional': ['titleaddon', 'addendum', 'pages', 'howpublished', 'type', 'pubstate', 'chapter', 'doi', 'subtitle', 'language', 'location', 'url', 'urldate', 'pagetotal', 'note', 'eprint', 'eprintclass', 'eprinttype']
  },
  8: {
    'id': 8, 'order': 20, 'name': 'collection', 'biblatex': 'collection', 'csl': 'dataset', 'title': gettext('Collection'), 'required': ['editor', 'title', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'afterword', 'annotator', 'chapter', 'commentator', 'doi', 'edition', 'editora', 'editorb', 'editorc', 'eprint', 'eprintclass', 'eprinttype', 'foreword', 'introduction', 'isbn', 'language', 'location', 'mainsubtitle', 'maintitle', 'maintitleaddon', 'note', 'number', 'origlanguage', 'pages', 'pagetotal', 'part', 'publisher', 'pubstate', 'series', 'subtitle', 'titleaddon', 'translator', 'url', 'urldate', 'volume', 'volumes']
  },
  9: {
    'id': 9, 'order': 21, 'name': 'mvcollection', 'biblatex': 'mvcollection', 'csl': 'dataset', 'title': gettext('Multi-volume collection'), 'required': ['editor', 'title', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'afterword', 'annotator', 'commentator', 'doi', 'edition', 'editora', 'editorb', 'editorc', 'eprint', 'eprintclass', 'eprinttype', 'foreword', 'introduction', 'isbn', 'language', 'location', 'note', 'number', 'origlanguage', 'pagetotal', 'publisher', 'pubstate', 'series', 'subtitle', 'titleaddon', 'translator', 'url', 'urldate', 'volumes']
  },
  10: {
    'id': 10, 'order': 22, 'name': 'incollection', 'biblatex': 'incollection', 'csl': 'entry', 'title': gettext('In collection'), 'required': ['title', 'editor', 'booktitle', 'author', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'afterword', 'annotator', 'booksubtitle', 'booktitleaddon', 'chapter', 'commentator', 'doi', 'edition', 'editora', 'editorb', 'editorc', 'eprint', 'eprintclass', 'eprinttype', 'foreword', 'introduction', 'isbn', 'language', 'location', 'mainsubtitle', 'maintitle', 'maintitleaddon', 'note', 'number', 'origlanguage', 'pages', 'part', 'publisher', 'pubstate', 'series', 'subtitle', 'titleaddon', 'translator', 'url', 'urldate', 'volume', 'volumes']
  },
  11: {
    'id': 11, 'order': 23, 'name': 'suppcollection', 'biblatex': 'suppcollection', 'csl': 'entry', 'title': gettext('Supplemental material in a collection'), 'required': ['title', 'editor', 'booktitle', 'author', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'afterword', 'annotator', 'booksubtitle', 'booktitleaddon', 'chapter', 'commentator', 'doi', 'edition', 'editora', 'editorb', 'editorc', 'eprint', 'eprintclass', 'eprinttype', 'foreword', 'introduction', 'isbn', 'language', 'location', 'mainsubtitle', 'maintitle', 'maintitleaddon', 'note', 'number', 'origlanguage', 'pages', 'part', 'publisher', 'pubstate', 'series', 'subtitle', 'titleaddon', 'translator', 'url', 'urldate', 'volume', 'volumes']
  },
  12: {
    'id': 12, 'order': 40, 'name': 'manual', 'biblatex': 'manual', 'csl': 'book', 'title': gettext('Manual'), 'required': ['title', 'date'],
    'eitheror': ['editor', 'author'],
    'optional': ['addendum', 'chapter', 'doi', 'edition', 'eprint', 'eprintclass', 'eprinttype', 'isbn', 'language', 'location', 'note', 'number', 'organization', 'pages', 'pagetotal', 'publisher', 'pubstate', 'series', 'subtitle', 'titleaddon', 'type', 'url', 'urldate', 'version']
  },
  13: {
    'id': 13, 'order': 41, 'name': 'misc', 'biblatex': 'misc', 'csl': 'entry', 'title': gettext('Miscellany'), 'required': ['title', 'date'],
    'eitheror': ['editor', 'author'],
    'optional': ['addendum', 'howpublished', 'type', 'pubstate', 'organization', 'doi', 'subtitle', 'language', 'location', 'url', 'urldate', 'titleaddon', 'version', 'note', 'eprint', 'eprintclass', 'eprinttype']
  },
  14: {
    'id': 14, 'order': 42, 'name': 'online', 'biblatex': 'online', 'csl': 'webpage', 'title': gettext('Online resource'), 'required': ['date', 'title', 'url'],
    'eitheror': ['editor', 'author'],
    'optional': ['addendum', 'pubstate', 'subtitle', 'language', 'urldate', 'titleaddon', 'version', 'note', 'organization']
  },
  15: {
    'id': 15, 'order': 43, 'name': 'patent', 'biblatex': 'patent', 'csl': 'patent', 'title': gettext('Patent'), 'required': ['title', 'number', 'author', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'holder', 'location', 'pubstate', 'doi', 'subtitle', 'titleaddon', 'type', 'url', 'urldate', 'version', 'note', 'eprint', 'eprintclass', 'eprinttype']
  },
  16: {
    'id': 16, 'order': 50, 'name': 'periodical', 'biblatex': 'periodical', 'csl': 'book', 'title': gettext('Periodical'), 'required': ['editor', 'title', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'volume', 'pubstate', 'number', 'series', 'issn', 'issue', 'issuesubtitle', 'issuetitle', 'doi', 'subtitle', 'editora', 'editorb', 'editorc', 'url', 'urldate', 'language', 'note', 'eprint', 'eprintclass', 'eprinttype']
  },
  17: {
    'id': 17, 'order': 51, 'name': 'suppperiodical', 'biblatex': 'suppperiodical', 'csl': 'entry', 'title': gettext('Supplemental material in a periodical'), 'required': ['journaltitle', 'title', 'author', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'annotator', 'commentator', 'doi', 'editor', 'editora', 'editorb', 'editorc', 'eid', 'eprint', 'eprintclass', 'eprinttype', 'issn', 'issue', 'issuesubtitle', 'issuetitle', 'journalsubtitle', 'language', 'note', 'number', 'origlanguage', 'pages', 'pubstate', 'series', 'subtitle', 'titleaddon', 'translator', 'url', 'urldate', 'version', 'volume']
  },
  18: {
    'id': 18, 'order': 60, 'name': 'proceedings', 'biblatex': 'proceedings', 'csl': 'entry', 'title': gettext('Proceedings'), 'required': ['editor', 'title', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'chapter', 'doi', 'eprint', 'eprintclass', 'eprinttype', 'eventdate', 'eventtitle', 'isbn', 'language', 'location', 'mainsubtitle', 'maintitle', 'maintitleaddon', 'note', 'number', 'organization', 'pages', 'pagetotal', 'part', 'publisher', 'pubstate', 'series', 'subtitle', 'titleaddon', 'url', 'urldate', 'venue', 'volume', 'volumes']
  },
  19: {
    'id': 19, 'order': 61, 'name': 'mvproceedings', 'biblatex': 'mvproceedings', 'csl': 'entry', 'title': gettext('Multi-volume proceedings'), 'required': ['editor', 'title', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'doi', 'eprint', 'eprintclass', 'eprinttype', 'eventdate', 'eventtitle', 'isbn', 'language', 'location', 'note', 'number', 'organization', 'pagetotal', 'publisher', 'pubstate', 'series', 'subtitle', 'titleaddon', 'url', 'urldate', 'venue', 'volumes']
  },
  20: {
    'id': 20, 'order': 62, 'name': 'inproceedings', 'biblatex': 'inproceedings', 'csl': 'paper-conference', 'title': gettext('Article in a proceedings'), 'required': ['title', 'editor', 'booktitle', 'author', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'booksubtitle', 'booktitleaddon', 'chapter', 'doi', 'eprint', 'eprintclass', 'eprinttype', 'eventdate', 'eventtitle', 'isbn', 'language', 'location', 'mainsubtitle', 'maintitle', 'maintitleaddon', 'note', 'number', 'organization', 'pages', 'part', 'publisher', 'pubstate', 'series', 'subtitle', 'titleaddon', 'url', 'urldate', 'venue', 'volume', 'volumes']
  },
  21: {
    'id': 21, 'order': 70, 'name': 'reference', 'biblatex': 'book', 'csl': 'reference', 'title': gettext('Reference'), 'required': ['editor', 'title', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'afterword', 'annotator', 'chapter', 'commentator', 'doi', 'edition', 'editora', 'editorb', 'editorc', 'eprint', 'eprintclass', 'eprinttype', 'foreword', 'introduction', 'isbn', 'language', 'location', 'mainsubtitle', 'maintitle', 'maintitleaddon', 'note', 'number', 'origlanguage', 'pages', 'pagetotal', 'part', 'publisher', 'pubstate', 'series', 'subtitle', 'titleaddon', 'translator', 'url', 'urldate', 'volume', 'volumes']
  },
  22: {
    'id': 22, 'order': 71, 'name': 'mvreference', 'biblatex': 'mvreference', 'csl': 'book', 'title': gettext('Multi-volume work of reference'), 'required': ['editor', 'title', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'afterword', 'annotator', 'commentator', 'doi', 'edition', 'editora', 'editorb', 'editorc', 'eprint', 'eprintclass', 'eprinttype', 'foreword', 'introduction', 'isbn', 'language', 'location', 'note', 'number', 'origlanguage', 'pagetotal', 'publisher', 'pubstate', 'series', 'subtitle', 'titleaddon', 'translator', 'url', 'urldate', 'volumes']
  },
  23: {
    'id': 23, 'order': 72, 'name': 'inreference', 'biblatex': 'inreference', 'csl': 'entry', 'title': gettext('Article in a work of reference'), 'required': ['title', 'editor', 'booktitle', 'author', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'afterword', 'annotator', 'booksubtitle', 'booktitleaddon', 'chapter', 'commentator', 'doi', 'edition', 'editora', 'editorb', 'editorc', 'eprint', 'eprintclass', 'eprinttype', 'foreword', 'introduction', 'isbn', 'language', 'location', 'mainsubtitle', 'maintitle', 'maintitleaddon', 'note', 'number', 'origlanguage', 'pages', 'part', 'publisher', 'pubstate', 'series', 'subtitle', 'titleaddon', 'translator', 'url', 'urldate', 'volume', 'volumes']
  },
  24: {
    'id': 24, 'order': 80, 'name': 'report', 'biblatex': 'report', 'csl': 'report', 'title': gettext('Report'), 'required': ['author', 'title', 'type', 'institution', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'pages', 'pagetotal', 'pubstate', 'number', 'isrn', 'chapter', 'doi', 'subtitle', 'language', 'location', 'url', 'urldate', 'titleaddon', 'version', 'note', 'eprint', 'eprintclass', 'eprinttype']
  },
  25: {
    'id': 25, 'order': 81, 'name': 'thesis', 'biblatex': 'thesis', 'csl': 'thesis', 'title': gettext('Thesis'), 'required': ['author', 'title', 'type', 'institution', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'pages', 'pagetotal', 'pubstate', 'isbn', 'chapter', 'doi', 'subtitle', 'language', 'location', 'url', 'urldate', 'titleaddon', 'note', 'eprint', 'eprintclass', 'eprinttype']
  },
  26: {
    'id': 26, 'order': 90, 'name': 'unpublished', 'biblatex': 'unpublished', 'csl': 'manuscript', 'title': gettext('Unpublished'), 'required': ['title', 'author', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'howpublished', 'pubstate', 'isbn', 'date', 'subtitle', 'language', 'location', 'url', 'urldate', 'titleaddon', 'note']
  },
  27: {
    'id': 27, 'order': 2, 'name': 'article-magazine', 'biblatex': 'article', 'csl': 'article-magazine', 'title': gettext('Magazine article'), 'required': ['journaltitle', 'title', 'author', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'annotator', 'commentator', 'doi', 'editor', 'editora', 'editorb', 'editorc', 'eid', 'eprint', 'eprintclass', 'eprinttype', 'issn', 'issue', 'issuesubtitle', 'issuetitle', 'journalsubtitle', 'language', 'note', 'number', 'origlanguage', 'pages', 'pubstate', 'series', 'subtitle', 'titleaddon', 'translator', 'url', 'urldate', 'version', 'volume']
  },
  28: {
    'id': 28, 'order': 3, 'name': 'article-newspaper', 'biblatex': 'article', 'csl': 'article-newspaper', 'title': gettext('Newspaper article'), 'required': ['journaltitle', 'title', 'author', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'annotator', 'commentator', 'doi', 'editor', 'editora', 'editorb', 'editorc', 'eid', 'eprint', 'eprintclass', 'eprinttype', 'issn', 'issue', 'issuesubtitle', 'issuetitle', 'journalsubtitle', 'language', 'note', 'number', 'origlanguage', 'pages', 'pubstate', 'series', 'subtitle', 'titleaddon', 'translator', 'url', 'urldate', 'version', 'volume']
  },
  29: {
    'id': 29, 'order': 4, 'name': 'article-journal', 'biblatex': 'article', 'csl': 'article-journal', 'title': gettext('Journal article'), 'required': ['journaltitle', 'title', 'author', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'annotator', 'commentator', 'doi', 'editor', 'editora', 'editorb', 'editorc', 'eid', 'eprint', 'eprintclass', 'eprinttype', 'issn', 'issue', 'issuesubtitle', 'issuetitle', 'journalsubtitle', 'language', 'note', 'number', 'origlanguage', 'pages', 'pubstate', 'series', 'subtitle', 'titleaddon', 'translator', 'url', 'urldate', 'version', 'volume']
  },
  30: {
    'id': 30, 'order': 73, 'name': 'entry-encyclopedia', 'biblatex': 'inreference', 'csl': 'entry-encyclopedia', 'title': gettext('Encyclopedia entry'), 'required': ['title', 'editor', 'booktitle', 'author', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'afterword', 'annotator', 'booksubtitle', 'booktitleaddon', 'chapter', 'commentator', 'doi', 'edition', 'editora', 'editorb', 'editorc', 'eprint', 'eprintclass', 'eprinttype', 'foreword', 'introduction', 'isbn', 'language', 'location', 'mainsubtitle', 'maintitle', 'maintitleaddon', 'note', 'number', 'origlanguage', 'pages', 'part', 'publisher', 'pubstate', 'series', 'subtitle', 'titleaddon', 'translator', 'url', 'urldate', 'volume', 'volumes']
  },
  31: {
    'id': 31, 'order': 74, 'name': 'entry-dictionary', 'biblatex': 'inreference', 'csl': 'entry-dictionary', 'title': gettext('Dictionary entry'), 'required': ['title', 'editor', 'booktitle', 'author', 'date'],
    'eitheror': [],
    'optional': ['addendum', 'afterword', 'annotator', 'booksubtitle', 'booktitleaddon', 'chapter', 'commentator', 'doi', 'edition', 'editora', 'editorb', 'editorc', 'eprint', 'eprintclass', 'eprinttype', 'foreword', 'introduction', 'isbn', 'language', 'location', 'mainsubtitle', 'maintitle', 'maintitleaddon', 'note', 'number', 'origlanguage', 'pages', 'part', 'publisher', 'pubstate', 'series', 'subtitle', 'titleaddon', 'translator', 'url', 'urldate', 'volume', 'volumes']
  },
  32: {
    'id': 32, 'order': 5, 'name': 'post-weblog', 'biblatex': 'online', 'csl': 'post-weblog', 'title': gettext('Blog post'), 'required': ['date', 'title', 'url'],
    'eitheror': ['editor', 'author'],
    'optional': ['addendum', 'pubstate', 'subtitle', 'language', 'urldate', 'titleaddon', 'version', 'note', 'organization']
  },
  33: {
    'id': 33, 'order': 30, 'name': 'post', 'biblatex': 'online', 'csl': 'post', 'title': gettext('Forum post'), 'required': ['date', 'title', 'url'],
    'eitheror': ['editor', 'author'],
    'optional': ['addendum', 'pubstate', 'subtitle', 'language', 'urldate', 'titleaddon', 'version', 'note', 'organization']
  }
};
/** A list of all the bibliography keys and their full name. */
var LocalizationKeys = exports.LocalizationKeys = [{
  'type': 'publication_state', 'name': 'inpreparation', 'title': 'in\ preparation'
}, {
  'type': 'publication_state', 'name': 'submitted', 'title': 'submitted\ to\ a\ journal\ or\ conference'
}, {
  'type': 'publication_state', 'name': 'forthcoming', 'title': 'forthcoming'
}, {
  'type': 'publication_state', 'name': 'inpress', 'title': 'in\ press'
}, {
  'type': 'publication_state', 'name': 'prepublished', 'title': 'pre\-published'
}, {
  'type': 'pagination', 'name': 'page', 'title': 'page'
}, {
  'type': 'pagination', 'name': 'column', 'title': 'column'
}, {
  'type': 'pagination', 'name': 'section', 'title': 'section'
}, {
  'type': 'pagination', 'name': 'paragraph', 'title': 'paragraph'
}, {
  'type': 'pagination', 'name': 'verse', 'title': 'verse'
}, {
  'type': 'pagination', 'name': 'line', 'title': 'line'
}, {
  'type': 'types', 'name': 'mathesis', 'title': 'master\’s\ thesis'
}, {
  'type': 'types', 'name': 'phdthesis', 'title': 'PhD\ thesis'
}, {
  'type': 'types', 'name': 'candthesis', 'title': 'Candidate\ thesis'
}, {
  'type': 'types', 'name': 'techreport', 'title': 'technical\ report'
}, {
  'type': 'types', 'name': 'resreport', 'title': 'research\ report'
}, {
  'type': 'types', 'name': 'software', 'title': 'computer\ software'
}, {
  'type': 'types', 'name': 'datacd', 'title': 'data\ cd'
}, {
  'type': 'types', 'name': 'audiocd', 'title': 'audio\ cd'
}, {
  'type': 'types', 'name': 'software', 'title': 'computer\ software'
}];

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var formatDateString = exports.formatDateString = function formatDateString(dateString) {
    // This mirrors the formatting of the date as returned by Python in bibliography/models.py
    if ('undefined' == typeof dateString) return '';
    var dates = dateString.split('/');
    var newValue = [];
    for (var x = 0; x < dates.length; x++) {
        var dateParts = dates[x].split('-');
        newValue.push('');
        for (var i = 0; i < dateParts.length; i++) {
            if (isNaN(dateParts[i])) {
                break;
            }
            if (i > 0) {
                newValue[x] += '/';
            }
            newValue[x] += dateParts[i];
        }
    }
    if (newValue[0] === '') {
        return '';
    } else if (newValue.length === 1) {
        return newValue[0];
    } else {
        return newValue[0] + '-' + newValue[1];
    }
};

/** Add and remove name list field.
 * @function addRemoveListHandler
 */
var addRemoveListHandler = exports.addRemoveListHandler = function addRemoveListHandler() {
    jQuery('.fw-add-input').bind('click', function () {
        var $parent = jQuery(this).parents('.fw-list-input');
        if (0 == $parent.next().size()) {
            var $parent_clone = $parent.clone(true);
            $parent_clone.find('input, select').val('').removeAttr('data-id');
            $parent_clone.insertAfter($parent);
        } else {
            var $the_prev = jQuery(this).prev();
            if ($the_prev.hasClass("category-form")) {
                var this_id = $the_prev.attr('data-id');
                if ('undefined' != typeof this_id) {
                    // TODO: Figure out what this was about
                    //        bibliographyHelpers.deleted_cat[bibliographyHelpers.deleted_cat // KEEP
                    //                .length] = this_id
                }
            }
            $parent.remove();
        }
    });

    // init dropdown for eitheror field names
    jQuery('.fw-bib-field-pulldown').each(function () {
        jQuery.addDropdownBox(jQuery(this), jQuery(this).children('.fw-pulldown'));
    });
    jQuery('.fw-bib-field-pulldown .fw-pulldown-item').bind('mousedown', function () {
        var selected_title = jQuery(this).html(),
            selected_value = jQuery(this).data('value');
        jQuery(this).parent().parent().find('.fw-pulldown-item.selected').removeClass('selected');
        jQuery(this).addClass('selected');
        jQuery(this).parent().parent().parent().siblings('label').html(selected_title);
    });

    // init dropdown for date format pulldown
    jQuery('.fw-data-format-pulldown').each(function () {
        jQuery.addDropdownBox(jQuery(this), jQuery(this).children('.fw-pulldown'));
    });
    jQuery('.fw-data-format-pulldown .fw-pulldown-item').bind('mousedown', function () {
        var selected_title = jQuery(this).html(),
            selected_value = jQuery(this).data('value');
        jQuery(this).parent().parent().find('.fw-pulldown-item.selected').removeClass('selected');
        jQuery(this).addClass('selected');
        jQuery(this).parent().parent().parent().siblings('label').children('span').html('(' + selected_title + ')');
        jQuery(this).parent().parent().parent().parent().parent().parent().attr('data-format', selected_value);
    });

    // nit dropdown for f_key selection
    jQuery('.fw-bib-select-pulldown').each(function () {
        jQuery.addDropdownBox(jQuery(this), jQuery(this).children('.fw-pulldown'));
    });
    jQuery('.fw-bib-select-pulldown .fw-pulldown-item').bind('mousedown', function () {
        var selected_title = jQuery(this).html(),
            selected_value = jQuery(this).data('value');
        jQuery(this).parent().parent().find('.fw-pulldown-item.selected').removeClass('selected');
        jQuery(this).addClass('selected');
        jQuery(this).parent().parent().parent().siblings('label').html(selected_title);
    });

    jQuery('.dk').dropkick();
};

/** Dictionary of date selection options for bibliography item editor (localized).
 */
var dateFormat = exports.dateFormat = {
    'y': gettext('Year'),
    'y/y': gettext('Year - Year'),
    'my': gettext('Month/Year'),
    'my/my': gettext('M/Y - M/Y'),
    'mdy': gettext('Month/Day/Year'),
    'mdy/mdy': gettext('M/D/Y - M/D/Y')
};

},{}]},{},[1]);
