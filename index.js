var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Model = mongoose.Model,
    util = require('util');

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

function deletedFieldName(deletedValue, fallbackName) {
    if (typeof deletedValue === 'string') {
        return deletedValue;
    } else if (typeof deletedValue === 'object' && deletedValue.name) {
            return deletedValue.name;
    } else if (deletedValue === true || typeof deletedValue === 'object') {
        return fallbackName;
    }
}

function addDeletedFieldIfExist(schema, deletedOption, deletedFieldOriginalName, typeKey, type, index) {
    const name = deletedFieldName(deletedOption, deletedFieldOriginalName);
    if (name) {
        const schemaOptions = {
            [typeKey]: type,
            index
        };
        if (name !== deletedFieldOriginalName) {
            schemaOptions.alias = deletedFieldOriginalName;
        }
        if (typeof deletedOption === 'object') {
            const { name, ...options } = deletedOption;
            Object.assign(schemaOptions, options);
        }
        schema.add({ [name]: schemaOptions });
    }
}

module.exports = function (schema, options) {
    options = options || {};
    var indexFields = parseIndexFields(options);

    var typeKey = schema.options.typeKey;
    var mongooseMajorVersion = +mongoose.version[0]; // 4, 5...
    var mainUpdateMethod = mongooseMajorVersion < 5 ? 'update' : 'updateMany';
    var mainUpdateWithDeletedMethod = mainUpdateMethod + 'WithDeleted';

    const deletedAtField = deletedFieldName(options.deletedAt, 'deletedAt');
    const deletedByField = deletedFieldName(options.deletedBy, 'deletedBy');

    function updateDocumentsByQuery(schema, conditions, updateQuery, callback) {
        if (schema[mainUpdateWithDeletedMethod]) {
            return schema[mainUpdateWithDeletedMethod](conditions, updateQuery, { multi: true }, callback);
        } else {
            return schema[mainUpdateMethod](conditions, updateQuery, { multi: true }, callback);
        }
    }

    schema.add({ deleted: createSchemaObject(typeKey, Boolean, { default: false, index: indexFields.deleted }) });
    addDeletedFieldIfExist(schema, options.deletedAt, 'deletedAt', typeKey, Date, indexFields.deletedAt);
    addDeletedFieldIfExist(schema, options.deletedBy, 'deletedBy', typeKey, options.deletedByType || Schema.Types.ObjectId, indexFields.deletedBy);

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
        var overridableMethods = ['count', 'countDocuments', 'find', 'findOne', 'findOneAndUpdate', 'update', 'updateOne', 'updateMany', 'aggregate'];
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

                // countDocuments do not exist in Mongoose v4
                /* istanbul ignore next */
                if (mongooseMajorVersion < 5 && method === 'countDocuments' && typeof Model.countDocuments !== 'function') {
                    modelMethodName = 'count';
                }

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

    schema.methods.delete = function (deletedBy, cb) {
        if (typeof deletedBy === 'function') {
          cb = deletedBy;
          deletedBy = null;
        }

        this.deleted = true;

        if (deletedAtField && schema.path(deletedAtField)) {
            this[deletedAtField] = new Date();
        }

        if (deletedByField && schema.path(deletedByField)) {
            this[deletedByField] = deletedBy;
        }

        if (options.validateBeforeDelete === false) {
            return this.save({ validateBeforeSave: false }, cb);
        }

        return this.save(cb);
    };

    schema.statics.delete =  function (conditions, deletedBy, callback) {
        if (typeof deletedBy === 'function') {
            callback = deletedBy;
            conditions = conditions;
            deletedBy = null;
        } else if (typeof conditions === 'function') {
            callback = conditions;
            conditions = {};
            deletedBy = null;
        }

        var doc = {
            deleted: true
        };

        if (deletedAtField && schema.path(deletedAtField)) {
            doc[deletedAtField] = new Date();
        }

        if (deletedByField && schema.path(deletedByField)) {
            doc[deletedByField] = deletedBy;
        }

        return updateDocumentsByQuery(this, conditions, doc, callback);
    };

    schema.statics.deleteById =  function (id, deletedBy, callback) {
        if (arguments.length === 0 || typeof id === 'function') {
            var msg = 'First argument is mandatory and must not be a function.';
            throw new TypeError(msg);
        }

        var conditions = {
            _id: id
        };

        return this.delete(conditions, deletedBy, callback);
    };

    schema.methods.restore = function (callback) {
        this.deleted = false;
        if (deletedAtField) {
            this[deletedAtField] = undefined;
        }
        if (deletedByField) {
            this[deletedByField] = undefined;
        }
        return this.save(callback);
    };

    schema.statics.restore =  function (conditions, callback) {
        if (typeof conditions === 'function') {
            callback = conditions;
            conditions = {};
        }

        var doc = {
            deleted: false
        };

        if (deletedAtField) {
            doc[deletedAtField] = undefined;
        }
        if (deletedByField) {
            doc[deletedByField] = undefined;
        }

        return updateDocumentsByQuery(this, conditions, doc, callback);
    };
};
