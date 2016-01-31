var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Model = mongoose.Model,
    util = require('util');

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

    schema.methods.delete = function (first, second) {
        var callback = typeof first === 'function' ? first : second,
            deletedBy = second !== undefined ? first : null;

        if (typeof callback !== 'function') {
            throw 'Wrong arguments!';
        }

        this.deleted = true;

        if (schema.path('deletedAt')) {
            this.deletedAt = new Date();
        }

        if (schema.path('deletedBy')) {
            this.deletedBy = deletedBy;
        }

        this.save(callback);
    };

    schema.methods.restore = function (callback) {
        this.deleted = false;
        this.deletedAt = undefined;
        this.deletedBy = undefined;
        this.save(callback);
    };
};