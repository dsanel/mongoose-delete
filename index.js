var mongoose = require('mongoose'),
    Model = mongoose.Model;

/**
 * This code is taken from official mongoose repository
 * https://github.com/Automattic/mongoose/blob/master/lib/query.js#L3847-L3873
 */
function parseUpdateArguments (conditions, doc, options, callback) {
    if ('function' === typeof options) {
        // .update(conditions, doc, callback)
        callback = options;
        options = null;
    } else if ('function' === typeof doc) {
        // .update(doc, callback);
        callback = doc;
        doc = conditions;
        conditions = {};
        options = null;
    } else if ('function' === typeof conditions) {
        // .update(callback)
        callback = conditions;
        conditions = undefined;
        doc = undefined;
        options = undefined;
    } else if (typeof conditions === 'object' && !doc && !options && !callback) {
        // .update(doc)
        doc = conditions;
        conditions = undefined;
        options = undefined;
        callback = undefined;
    }

    var args = [];

    if (conditions) args.push(conditions);
    if (doc) args.push(doc);
    if (options) args.push(options);
    if (callback) args.push(callback);

    return args;
}

/**
 * Parses the index fields from the provided options.
 *
 * @param {Object} options - The options to parse index fields from.
 * @param {string|boolean|Array} [options.indexFields] - The fields to index. Accepts a string, a boolean, or an array.
 *    If a string is provided and is 'all', all index fields are set to true.
 *    If a boolean is provided and is true, all index fields are set to true.
 *    If an array is provided, index fields are set to true if their names are included in the array.
 *
 * @returns {Object} The parsed index fields. Includes the following properties:
 *    - deleted {boolean} - Whether to index the 'deleted' field.
 *    - deletedAt {boolean} - Whether to index the 'deletedAt' field.
 *    - deletedBy {boolean} - Whether to index the 'deletedBy' field.
 *
 * @throws {TypeError} If options.indexFields is provided and is not a string, a boolean, or an array.
 */
function parseIndexFields (options) {
    var indexFields = {
        deleted: false,
        deletedAt: false,
        deletedBy: false
    };

    if (!options.indexFields) {
        return indexFields;
    }

    if ((typeof options.indexFields === 'string' || options.indexFields instanceof String) && options.indexFields === 'all') {
        indexFields.deleted = indexFields.deletedAt = indexFields.deletedBy = true;
    }

    if (typeof(options.indexFields) === "boolean" && options.indexFields === true) {
        indexFields.deleted = indexFields.deletedAt = indexFields.deletedBy = true;
    }

    if (Array.isArray(options.indexFields)) {
        indexFields.deleted = options.indexFields.indexOf('deleted') > -1;
        indexFields.deletedAt = options.indexFields.indexOf('deletedAt') > -1;
        indexFields.deletedBy = options.indexFields.indexOf('deletedBy') > -1;
    }

    return indexFields;
}

function createSchemaObject (typeKey, typeValue, options) {
    options[typeKey] = typeValue;
    return options;
}

module.exports = function (schema, options) {
    options = options || {};
    var indexFields = parseIndexFields(options);

    var typeKey = schema.options.typeKey;
    var mainUpdateWithDeletedMethod = 'updateManyWithDeleted';

    function updateDocumentsByQuery(schema, conditions, updateQuery) {
        if (schema['updateManyWithDeleted']) {
            return schema['updateManyWithDeleted'](conditions, updateQuery, { multi: true });
        } else {
            return schema['updateMany'](conditions, updateQuery, { multi: true });
        }
    }

    schema.add({ deleted: createSchemaObject(typeKey, Boolean, { default: false, index: indexFields.deleted }) });

    if (options.deletedAt === true) {
        schema.add({ deletedAt: createSchemaObject(typeKey, Date, { index: indexFields.deletedAt }) });
    }

    if (options.deletedBy === true) {
        schema.add({
            deletedBy: {
                [typeKey]: options.deletedByType || mongoose.Types.ObjectId,
                index: indexFields.deletedBy,
            }
        });
    }

    var use$neOperator = true;
    if (options.use$neOperator !== undefined && typeof options.use$neOperator === "boolean") {
        use$neOperator = options.use$neOperator;
    }

    schema.pre('save', function (next) {
        if (!this.deleted) {
            this.deleted = false;
        }
        next();
    });

    if (options.overrideMethods) {
        var overrideItems = options.overrideMethods;
        var overridableMethods = ['count', 'countDocuments', 'find', 'findOne', 'findOneAndUpdate', 'updateOne', 'updateMany', 'aggregate'];
        var finalList = [];

        if ((typeof overrideItems === 'string' || overrideItems instanceof String) && overrideItems === 'all') {
            finalList = overridableMethods;
        }

        if (typeof(overrideItems) === "boolean" && overrideItems === true) {
            finalList = overridableMethods;
        }

        if (Array.isArray(overrideItems)) {
            overrideItems.forEach(function(method) {
                if (overridableMethods.indexOf(method) > -1) {
                    finalList.push(method);
                }
            });
        }

        if (finalList.indexOf('aggregate') > -1) {
            schema.pre('aggregate', function() {
                var firsMatchStr = JSON.stringify(this.pipeline()[0]);

                if ( firsMatchStr !== '{"$match":{"deleted":{"$ne":false}}}' ) {
                    if (firsMatchStr === '{"$match":{"showAllDocuments":"true"}}') {
                        this.pipeline().shift();
                    } else {
                        this.pipeline().unshift({ $match: { deleted: { '$ne': true } } });
                    }
                }
            });
        }

        finalList.forEach(function(method) {
            if (['count', 'countDocuments', 'find', 'findOne'].indexOf(method) > -1) {
                var modelMethodName = method;

                schema.statics[method] = function () {
                    var query = Model[modelMethodName].apply(this, arguments);
                    if (!arguments[2] || arguments[2].withDeleted !== true) {
                        if (use$neOperator) {
                            query.where('deleted').ne(true);
                        } else {
                            query.where({deleted: false});
                        }
                    }
                    return query;
                };
                schema.statics[method + 'Deleted'] = function () {
                    if (use$neOperator) {
                        return Model[modelMethodName].apply(this, arguments).where('deleted').ne(false);
                    } else {
                        return Model[modelMethodName].apply(this, arguments).where({deleted: true});
                    }
                };
                schema.statics[method + 'WithDeleted'] = function () {
                    return Model[modelMethodName].apply(this, arguments);
                };
            } else {
                if (method === 'aggregate') {
                    schema.statics[method + 'Deleted'] = function () {
                        var args = [];
                        Array.prototype.push.apply(args, arguments);
                        var match = { $match : { deleted : {'$ne': false } } };
                        arguments.length ? args[0].unshift(match) : args.push([match]);
                        return Model[method].apply(this, args);
                    };

                    schema.statics[method + 'WithDeleted'] = function () {
                        var args = [];
                        Array.prototype.push.apply(args, arguments);
                        var match = { $match : { showAllDocuments : 'true' } };
                        arguments.length ? args[0].unshift(match) : args.push([match]);
                        return Model[method].apply(this, args);
                    };
                } else {
                    schema.statics[method] = function () {
                        var args = parseUpdateArguments.apply(undefined, arguments);

                        if (use$neOperator) {
                            args[0].deleted = {'$ne': true};
                        } else {
                            args[0].deleted = false;
                        }

                        return Model[method].apply(this, args);
                    };

                    schema.statics[method + 'Deleted'] = function () {
                        var args = parseUpdateArguments.apply(undefined, arguments);

                        if (use$neOperator) {
                            args[0].deleted = {'$ne': false};
                        } else {
                            args[0].deleted = true;
                        }

                        return Model[method].apply(this, args);
                    };

                    schema.statics[method + 'WithDeleted'] = function () {
                        return Model[method].apply(this, arguments);
                    };
                }
            }
        });
    }

    schema.methods.delete = function (deletedBy) {
        this.deleted = true;

        if (schema.path('deletedAt')) {
            // TODO: Allow custom method for deletedAt
            this.deletedAt = new Date();
        }

        if (schema.path('deletedBy')) {
            this.deletedBy = deletedBy;
        }

        if (options.validateBeforeDelete === false) {
            return this.save({ validateBeforeSave: false });
        }

        return this.save();
    };

    schema.statics.deleteMany =  function (conditions, deletedBy) {
        var doc = {
            deleted: true
        };

        if (schema.path('deletedAt')) {
            doc.deletedAt = new Date();
        }

        if (schema.path('deletedBy')) {
            doc.deletedBy = deletedBy;
        }

        // TODO: we need to check a way to return the deleted response { acknowledged, deletedCount }
        return updateDocumentsByQuery(this, conditions, doc);
    };

    schema.statics.deleteById =  function (id, deletedBy) {
        if (arguments.length === 0 || typeof id === 'function') {
            var msg = 'First argument is mandatory and must not be a function.';
            throw new TypeError(msg);
        }

        var conditions = {
            _id: id
        };

        return this.deleteMany(conditions, deletedBy);
    };

    schema.statics.restoreMany =  function (conditions) {
        var doc = {
            deleted: false,
            $unset: {
                deletedAt: 1,
                deletedBy: 1
            }
        };

        return updateDocumentsByQuery(this, conditions, doc);
    };
};
