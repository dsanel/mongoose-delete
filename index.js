var Schema = require('mongoose').Schema;

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

    var queries = ['find', 'findOne', 'findOneAndUpdate', 'count'];

    queries.forEach(function(query) {
        schema.pre(query, function(next) {
            var conditions = {
                deleted: {
                    '$ne': true
                }
            };
            this.where(conditions);
            next();
        });
    });

    schema.methods.delete = function (first, second) {
        var callback = typeof first === 'function' ? first : second,
            deletedBy = second !== undefined ? first : null;

        if (typeof callback !== 'function') {
            throw ('Wrong arguments!');
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
