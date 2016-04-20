var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Model = mongoose.Model,
    util = require('util');

/**
 * This code is taken from official mongoose repository
 * https://github.com/Automattic/mongoose/blob/master/lib/query.js#L1996-L2018
 */
/* istanbul ignore next */
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

module.exports = function (schema, options) {
    schema.add({ deleted: Boolean });

    if (options && options.deletedAt === true) {
        schema.add({ deletedAt: { type: Date} });
    }

    if (options && options.deletedBy === true) {
        schema.add({ deletedBy: Schema.Types.ObjectId });
    }

    schema.pre('save', function (next) {
        if (!this.deleted) {
            this.deleted = false;
        }
        next();
    });

    if (options && options.overrideMethods) {
        var overrideItems = options.overrideMethods;
        var overridableMethods = ['count', 'find', 'findOne', 'findOneAndUpdate', 'update'];
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

        finalList.forEach(function(method) {
            if (method === 'count' || method === 'find' || method === 'findOne') {
                schema.statics[method] = function () {
                    return Model[method].apply(this, arguments).where('deleted').equals(false);
                };
                schema.statics[method + 'Deleted'] = function () {
                    return Model[method].apply(this, arguments).where('deleted').ne(false);
                };
                schema.statics[method + 'WithDeleted'] = function () {
                    return Model[method].apply(this, arguments);
                };
            } else {
                schema.statics[method] = function () {
                    var args = parseUpdateArguments.apply(undefined, arguments);

                    args[0].deleted = {'$ne': true};

                    return Model[method].apply(this, args);
                };

                schema.statics[method + 'Deleted'] = function () {
                    var args = parseUpdateArguments.apply(undefined, arguments);

                    args[0].deleted = {'$ne': false};

                    return Model[method].apply(this, args);
                };

                schema.statics[method + 'WithDeleted'] = function () {
                    return Model[method].apply(this, arguments);
                };
            }
        });
    }

    schema.methods.delete = function (deletedBy, cb) {
        var callback = typeof deletedBy === 'function' ? deletedBy : cb,
            deletedBy = cb !== undefined ? deletedBy : null;

        this.deleted = true;

        if (schema.path('deletedAt')) {
            this.deletedAt = new Date();
        }

        if (schema.path('deletedBy')) {
            this.deletedBy = deletedBy;
        }

        if (options && options.validateBeforeDelete === false) {
            return this.save({ validateBeforeSave: false }, callback);
        }

        return this.save(callback);
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

        if (schema.path('deletedAt')) {
            doc.deletedAt = new Date();
        }

        if (schema.path('deletedBy')) {
            doc.deletedBy = deletedBy;
        }

        if (this.updateWithDeleted) {
            return this.updateWithDeleted(conditions, doc, { multi: true }, callback);
        } else {
            return this.update(conditions, doc, { multi: true }, callback);
        }
    };

    schema.methods.restore = function (callback) {
        this.deleted = false;
        this.deletedAt = undefined;
        this.deletedBy = undefined;
        return this.save(callback);
    };

    schema.statics.restore =  function (conditions, callback) {
        if (typeof conditions === 'function') {
            callback = conditions;
            conditions = {};
        }

        var doc = {
            deleted: false,
            deletedAt: undefined,
            deletedBy: undefined
        };

        if (this.updateWithDeleted) {
            return this.updateWithDeleted(conditions, doc, { multi: true }, callback);
        } else {
            return this.update(conditions, doc, { multi: true }, callback);
        }
    };
};
