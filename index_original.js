var chai = require('chai'),
    should = chai.should(),
    expect = chai.expect,
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var mongoose_delete = require('../');

var ObjectId = mongoose.Types.ObjectId;

var mongooseMajorVersion = +mongoose.version[0]; // 4, 5, 6...

chai.use(function (_chai, utils) {
    utils.addChainableMethod(chai.Assertion.prototype, 'mongoose_count', function (val) {
        if (mongooseMajorVersion >= 6) {
            new chai.Assertion(this._obj.matchedCount).to.be.equal(val);
        } else {
            new chai.Assertion(this._obj.n).to.be.equal(val);
        }
    });

    utils.addChainableMethod(chai.Assertion.prototype, 'mongoose_ok', function () {
        if (mongooseMajorVersion >= 6) {
            new chai.Assertion(this._obj.acknowledged).to.be.equal(true);
        } else {
            new chai.Assertion(this._obj.ok).to.be.equal(1);
        }
    });

});





describe("check the existence of override static methods: { overrideMethods: true }", function () {
    var TestSchema = new Schema({name: String}, {collection: 'mongoose_delete_test'});
    TestSchema.plugin(mongoose_delete, {overrideMethods: true});
    var TestModel = mongoose.model('Test6', TestSchema);

    it("count() -> method should exist", function (done) {
        expect(TestModel.count).to.exist;
        done();
    });

    it("countDeleted() -> method should exist", function (done) {
        expect(TestModel.countDeleted).to.exist;
        done();
    });

    it("countWithDeleted() -> method should exist", function (done) {
        expect(TestModel.countWithDeleted).to.exist;
        done();
    });

    it("countDocuments() -> method should exist", function (done) {
        expect(TestModel.countDocuments).to.exist;
        done();
    });

    it("countDocumentsDeleted() -> method should exist", function (done) {
        expect(TestModel.countDocumentsDeleted).to.exist;
        done();
    });

    it("countDocumentsWithDeleted() -> method should exist", function (done) {
        expect(TestModel.countDocumentsWithDeleted).to.exist;
        done();
    });

    it("find() -> method should exist", function (done) {
        expect(TestModel.find).to.exist;
        done();
    });

    it("findDeleted() -> method should exist", function (done) {
        expect(TestModel.findDeleted).to.exist;
        done();
    });

    it("findWithDeleted() -> method should exist", function (done) {
        expect(TestModel.findWithDeleted).to.exist;
        done();
    });

    it("findOne() -> method should exist", function (done) {
        expect(TestModel.findOne).to.exist;
        done();
    });

    it("findOneDeleted() -> method should exist", function (done) {
        expect(TestModel.findOneDeleted).to.exist;
        done();
    });

    it("findOneWithDeleted() -> method should exist", function (done) {
        expect(TestModel.findOneWithDeleted).to.exist;
        done();
    });

    it("findOneAndUpdate() -> method should exist", function (done) {
        expect(TestModel.findOneAndUpdate).to.exist;
        done();
    });

    it("findOneAndUpdateDeleted() -> method should exist", function (done) {
        expect(TestModel.findOneAndUpdateDeleted).to.exist;
        done();
    });

    it("findOneAndUpdateWithDeleted() -> method should exist", function (done) {
        expect(TestModel.findOneAndUpdateWithDeleted).to.exist;
        done();
    });

    it("update() -> method should exist", function (done) {
        expect(TestModel.update).to.exist;
        done();
    });

    it("updateDeleted() -> method should exist", function (done) {
        expect(TestModel.updateDeleted).to.exist;
        done();
    });

    it("updateWithDeleted() -> method should exist", function (done) {
        expect(TestModel.updateWithDeleted).to.exist;
        done();
    });

    it("updateOne() -> method should exist", function (done) {
        expect(TestModel.updateOne).to.exist;
        done();
    });

    it("updateOneDeleted() -> method should exist", function (done) {
        expect(TestModel.updateOneDeleted).to.exist;
        done();
    });

    it("updateOneWithDeleted() -> method should exist", function (done) {
        expect(TestModel.updateOneWithDeleted).to.exist;
        done();
    });

    it("updateMany() -> method should exist", function (done) {
        expect(TestModel.updateMany).to.exist;
        done();
    });

    it("updateManyDeleted() -> method should exist", function (done) {
        expect(TestModel.updateManyDeleted).to.exist;
        done();
    });

    it("updateManyWithDeleted() -> method should exist", function (done) {
        expect(TestModel.updateManyWithDeleted).to.exist;
        done();
    });
});

describe("check the existence of override static methods: { overrideMethods: ['testError', 'count', 'countDocuments', 'find', 'findOne', 'findOneAndUpdate', 'update', 'updateOne', 'updateMany'] }", function () {
    var TestSchema = new Schema({name: String}, {collection: 'mongoose_delete_test'});
    TestSchema.plugin(mongoose_delete, {overrideMethods: ['testError', 'count', 'countDocuments', 'find', 'findOne', 'findOneAndUpdate', 'update', 'updateOne', 'updateMany']});
    var TestModel = mongoose.model('Test7', TestSchema);

    it("testError() -> method should not exist", function (done) {
        expect(TestModel.testError).to.not.exist;
        done();
    });

    it("count() -> method should exist", function (done) {
        expect(TestModel.count).to.exist;
        done();
    });

    it("countDeleted() -> method should exist", function (done) {
        expect(TestModel.countDeleted).to.exist;
        done();
    });

    it("countWithDeleted() -> method should exist", function (done) {
        expect(TestModel.countWithDeleted).to.exist;
        done();
    });

    it("countDocuments() -> method should exist", function (done) {
        expect(TestModel.countDocuments).to.exist;
        done();
    });

    it("countDocumentsDeleted() -> method should exist", function (done) {
        expect(TestModel.countDocumentsDeleted).to.exist;
        done();
    });

    it("countDocumentsWithDeleted() -> method should exist", function (done) {
        expect(TestModel.countDocumentsWithDeleted).to.exist;
        done();
    });

    it("find() -> method should exist", function (done) {
        expect(TestModel.find).to.exist;
        done();
    });

    it("findDeleted() -> method should exist", function (done) {
        expect(TestModel.findDeleted).to.exist;
        done();
    });

    it("findWithDeleted() -> method should exist", function (done) {
        expect(TestModel.findWithDeleted).to.exist;
        done();
    });

    it("findOne() -> method should exist", function (done) {
        expect(TestModel.findOne).to.exist;
        done();
    });

    it("findOneDeleted() -> method should exist", function (done) {
        expect(TestModel.findOneDeleted).to.exist;
        done();
    });

    it("findOneWithDeleted() -> method should exist", function (done) {
        expect(TestModel.findOneWithDeleted).to.exist;
        done();
    });

    it("findOneAndUpdate() -> method should exist", function (done) {
        expect(TestModel.findOneAndUpdate).to.exist;
        done();
    });

    it("findOneAndUpdateDeleted() -> method should exist", function (done) {
        expect(TestModel.findOneAndUpdateDeleted).to.exist;
        done();
    });

    it("findOneAndUpdateWithDeleted() -> method should exist", function (done) {
        expect(TestModel.findOneAndUpdateWithDeleted).to.exist;
        done();
    });

    it("update() -> method should exist", function (done) {
        expect(TestModel.update).to.exist;
        done();
    });

    it("updateDeleted() -> method should exist", function (done) {
        expect(TestModel.updateDeleted).to.exist;
        done();
    });

    it("updateWithDeleted() -> method should exist", function (done) {
        expect(TestModel.updateWithDeleted).to.exist;
        done();
    });

    it("updateOne() -> method should exist", function (done) {
        expect(TestModel.updateOne).to.exist;
        done();
    });

    it("updateOneDeleted() -> method should exist", function (done) {
        expect(TestModel.updateOneDeleted).to.exist;
        done();
    });

    it("updateOneWithDeleted() -> method should exist", function (done) {
        expect(TestModel.updateOneWithDeleted).to.exist;
        done();
    });

    it("updateMany() -> method should exist", function (done) {
        expect(TestModel.updateMany).to.exist;
        done();
    });

    it("updateManyDeleted() -> method should exist", function (done) {
        expect(TestModel.updateManyDeleted).to.exist;
        done();
    });

    it("updateManyWithDeleted() -> method should exist", function (done) {
        expect(TestModel.updateManyWithDeleted).to.exist;
        done();
    });
});

describe("check the existence of override static methods: { overrideMethods: ['count', 'countDocuments', 'find'] }", function () {
    var TestSchema = new Schema({name: String}, {collection: 'mongoose_delete_test'});
    TestSchema.plugin(mongoose_delete, {overrideMethods: ['count', 'countDocuments', 'find']});
    var TestModel = mongoose.model('Test8', TestSchema);

    it("testError() -> method should not exist", function (done) {
        expect(TestModel.testError).to.not.exist;
        done();
    });

    it("count() -> method should exist", function (done) {
        expect(TestModel.count).to.exist;
        done();
    });

    it("countDeleted() -> method should exist", function (done) {
        expect(TestModel.countDeleted).to.exist;
        done();
    });

    it("countWithDeleted() -> method should exist", function (done) {
        expect(TestModel.countWithDeleted).to.exist;
        done();
    });

    it("countDocuments() -> method should exist", function (done) {
        expect(TestModel.countDocuments).to.exist;
        done();
    });

    it("countDocumentsDeleted() -> method should exist", function (done) {
        expect(TestModel.countDocumentsDeleted).to.exist;
        done();
    });

    it("countDocumentsWithDeleted() -> method should exist", function (done) {
        expect(TestModel.countDocumentsWithDeleted).to.exist;
        done();
    });

    it("find() -> method should exist", function (done) {
        expect(TestModel.find).to.exist;
        done();
    });

    it("findDeleted() -> method should exist", function (done) {
        expect(TestModel.findDeleted).to.exist;
        done();
    });

    it("findWithDeleted() -> method should exist", function (done) {
        expect(TestModel.findWithDeleted).to.exist;
        done();
    });

    it("findOne() -> method should exist", function (done) {
        expect(TestModel.findOne).to.exist;
        done();
    });

    it("findOneDeleted() -> method should not exist", function (done) {
        expect(TestModel.findOneDeleted).to.not.exist;
        done();
    });

    it("findOneWithDeleted() -> method should not exist", function (done) {
        expect(TestModel.findOneWithDeleted).to.not.exist;
        done();
    });

    it("findOneAndUpdate() -> method should exist", function (done) {
        expect(TestModel.findOneAndUpdate).to.exist;
        done();
    });

    it("findOneAndUpdateDeleted() -> method should not exist", function (done) {
        expect(TestModel.findOneAndUpdateDeleted).to.not.exist;
        done();
    });

    it("findOneAndUpdateWithDeleted() -> method should not exist", function (done) {
        expect(TestModel.findOneAndUpdateWithDeleted).to.not.exist;
        done();
    });

    it("update() -> method should exist", function (done) {
        expect(TestModel.update).to.exist;
        done();
    });

    it("updateDeleted() -> method should not exist", function (done) {
        expect(TestModel.updateDeleted).to.not.exist;
        done();
    });

    it("updateWithDeleted() -> method should not exist", function (done) {
        expect(TestModel.updateWithDeleted).to.not.exist;
        done();
    });

    it("updateOne() -> method should exist", function (done) {
        expect(TestModel.updateOne).to.exist;
        done();
    });

    it("updateOneDeleted() -> method should not exist", function (done) {
        expect(TestModel.updateOneDeleted).to.not.exist;
        done();
    });

    it("updateOneWithDeleted() -> method should not exist", function (done) {
        expect(TestModel.updateOneWithDeleted).to.not.exist;
        done();
    });

    it("updateMany() -> method should exist", function (done) {
        expect(TestModel.updateMany).to.exist;
        done();
    });

    it("updateManyDeleted() -> method should not exist", function (done) {
        expect(TestModel.updateManyDeleted).to.not.exist;
        done();
    });

    it("updateManyWithDeleted() -> method should not exist", function (done) {
        expect(TestModel.updateManyWithDeleted).to.not.exist;
        done();
    });
});

describe("delete multiple documents", function () {
    var TestSchema = new Schema({name: String, side: Number}, {collection: 'mongoose_delete_test'});
    TestSchema.plugin(mongoose_delete, {overrideMethods: 'all', deletedAt: true, deletedBy: true});
    var TestModel = mongoose.model('Test14', TestSchema);

    beforeEach(function (done) {
        TestModel.create(
            [
                {name: 'Obi-Wan Kenobi', side: 0},
                {name: 'Darth Vader', side: 1},
                {name: 'Luke Skywalker', side: 0}
            ], done);
    });

    afterEach(function (done) {
        mongoose.connection.db.dropCollection("mongoose_delete_test", done);
    });

    it("delete(cb) -> delete multiple documents", function (done) {
        TestModel.delete(function (err, documents) {
            should.not.exist(err);

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(3);

            done();
        });
    });

    it("delete(query, cb) -> delete multiple documents with conditions", function (done) {
        TestModel.delete({side: 0}, function (err, documents) {
            should.not.exist(err);

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(2);

            done();
        });
    });


    it("delete(query, deletedBy, cb) -> delete multiple documents with conditions and user ID", function (done) {
        var userId = mongoose.Types.ObjectId("53da93b16b4a6670076b16bf");

        TestModel.delete({side: 1}, userId, function (err, documents) {
            should.not.exist(err);

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(1);

            done();
        });
    });

    it("delete().exec() -> delete all documents", function (done) {
        TestModel.delete().exec(function (err, documents) {
            should.not.exist(err);

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(3);

            done();
        });
    });

    it("delete(query).exec() -> delete multiple documents with conditions", function (done) {
        TestModel.delete({side: 0}).exec(function (err, documents) {
            should.not.exist(err);

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(2);

            done();
        });
    });

    it("delete(query, deletedBy).exec() -> delete multiple documents with conditions and user ID", function (done) {
        var userId = mongoose.Types.ObjectId("53da93b16b4a6670076b16bf");

        TestModel.delete({side: 1}, userId).exec(function (err, documents) {
            should.not.exist(err);

            expect(documents).to.be.mongoose_count(1);
            expect(documents).to.be.mongoose_ok();

            done();
        });
    });

    it("delete({}, deletedBy).exec() -> delete all documents passing user ID", function (done) {
        var userId = mongoose.Types.ObjectId("53da93b16b4a6670076b16bf");

        TestModel.delete({}, userId).exec(function (err, documents) {
            should.not.exist(err);

            expect(documents).to.be.mongoose_count(3);
            expect(documents).to.be.mongoose_ok();

            done();
        });
    });
});

describe("delete multiple documents aaa", function () {
    var TestSchema = new Schema({name: String, side: Number}, {collection: 'mongoose_delete_test'});
    TestSchema.plugin(mongoose_delete);
    var TestModel = mongoose.model('Test13', TestSchema);

    beforeEach(function (done) {
        TestModel.create(
            [
                {name: 'Obi-Wan Kenobi', side: 0},
                {name: 'Darth Vader', side: 1},
                {name: 'Luke Skywalker', side: 0}
            ], done);
    });

    afterEach(function (done) {
        mongoose.connection.db.dropCollection("mongoose_delete_test", done);
    });

    it("delete(cb) -> delete multiple documents", function (done) {
        TestModel.delete(function (err, documents) {
            should.not.exist(err);

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(3);

            done();
        });
    });
});

describe("restore multiple documents bbb", function () {
    var TestSchema = new Schema({name: String, side: Number}, {collection: 'mongoose_restore_test'});
    TestSchema.plugin(mongoose_delete, {overrideMethods: 'all', deletedAt: true, deletedBy: true});
    var TestModel = mongoose.model('Test15', TestSchema);

    beforeEach(function (done) {
        TestModel.create(
            [
                {name: 'Obi-Wan Kenobi', side: 0},
                {name: 'Darth Vader', side: 1, deleted: true},
                {name: 'Luke Skywalker', side: 0, deleted: true}
            ], done);
    });

    afterEach(function (done) {
        mongoose.connection.db.dropCollection("mongoose_restore_test", done);
    });

    it("restore(cb) -> restore all documents", function (done) {
        TestModel.restore(function (err, documents) {
            should.not.exist(err);

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(3);

            done();
        });
    });

    it("restore(query, cb) -> restore multiple documents with conditions", function (done) {
        TestModel.restore({side: 0}, function (err, documents) {
            should.not.exist(err);

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(2);

            done();
        });
    });

    it("restore().exec() -> restore all documents", function (done) {
        TestModel.restore().exec(function (err, documents) {
            should.not.exist(err);

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(3);

            done();
        });
    });

    it("restore(query).exec() -> restore multiple documents with conditions", function (done) {
        TestModel.restore({side: 0}).exec(function (err, documents) {
            should.not.exist(err);

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(2);

            done();
        });
    });

});

describe("restore multiple documents aaa", function () {
    var TestSchema = new Schema({name: String, side: Number}, {collection: 'mongoose_restore_test'});
    TestSchema.plugin(mongoose_delete);
    var TestModel = mongoose.model('Test16', TestSchema);

    beforeEach(function (done) {
        TestModel.create(
            [
                {name: 'Obi-Wan Kenobi', side: 0},
                {name: 'Darth Vader', side: 1, deleted: true},
                {name: 'Luke Skywalker', side: 0}
            ], done);
    });

    afterEach(function (done) {
        mongoose.connection.db.dropCollection("mongoose_restore_test", done);
    });

    it("restore(cb) -> restore all documents", function (done) {
        TestModel.restore(function (err, documents) {
            should.not.exist(err);

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(3);

            done();
        });
    });
});

describe("model validation on delete (default): { validateBeforeDelete: true }", function () {
    var TestSchema = new Schema({
        name: {type: String, required: true}
    }, {collection: 'mongoose_restore_test'});
    TestSchema.plugin(mongoose_delete);
    var TestModel = mongoose.model('Test17', TestSchema);

    beforeEach(function (done) {
        TestModel.create(
            [
                {name: 'Luke Skywalker'}
            ], done);
    });

    afterEach(function (done) {
        mongoose.connection.db.dropCollection("mongoose_restore_test", done);
    });

    it("delete() -> should raise ValidationError error", function (done) {
        TestModel.findOne({name: 'Luke Skywalker'}, function (err, luke) {
            should.not.exist(err);
            luke.name = "";

            luke.delete(function (err) {
                err.should.exist;
                err.name.should.exist;
                err.name.should.equal('ValidationError');
                done();
            });
        });
    });

    it("delete() -> should not raise ValidationError error", function (done) {
        TestModel.findOne({name: 'Luke Skywalker'}, function (err, luke) {
            should.not.exist(err);
            luke.name = "Test Name";

            luke.delete(function (err) {
                should.not.exist(err);
                done();
            });
        });
    });
});

describe("model validation on delete: { validateBeforeDelete: false }", function () {
    var TestSchema = new Schema({
        name: {type: String, required: true}
    }, {collection: 'mongoose_restore_test'});
    TestSchema.plugin(mongoose_delete, {validateBeforeDelete: false});
    var TestModel = mongoose.model('Test18', TestSchema);

    beforeEach(function (done) {
        TestModel.create(
            [
                {name: 'Luke Skywalker'}
            ], done);
    });

    afterEach(function (done) {
        mongoose.connection.db.dropCollection("mongoose_restore_test", done);
    });

    it("delete() -> should not raise ValidationError error", function (done) {
        TestModel.findOne({name: 'Luke Skywalker'}, function (err, luke) {
            should.not.exist(err);
            luke.name = "";

            luke.delete(function (err) {
                should.not.exist(err);
                done();
            });
        });
    });

    it("delete() -> should not raise ValidationError error", function (done) {
        TestModel.findOne({name: 'Luke Skywalker'}, function (err, luke) {
            should.not.exist(err);
            luke.name = "Test Name";

            luke.delete(function (err) {
                should.not.exist(err);
                done();
            });
        });
    });
});

describe("mongoose_delete indexFields options", function () {

    it("all fields must have index: { indexFields: true }", function (done) {
        var TestSchema = new Schema({name: String}, {collection: 'mongoose_delete_test_indexFields'});
        TestSchema.plugin(mongoose_delete, {indexFields: true, deletedAt: true, deletedBy: true});
        var Test0 = mongoose.model('Test0_indexFields', TestSchema);

        expect(Test0.schema.paths.deleted._index).to.be.true;
        expect(Test0.schema.paths.deletedAt._index).to.be.true;
        expect(Test0.schema.paths.deletedBy._index).to.be.true;

        done();
    });

    it("all fields must have index: { indexFields: 'all' }", function (done) {
        var TestSchema = new Schema({name: String}, {collection: 'mongoose_delete_test_indexFields'});
        TestSchema.plugin(mongoose_delete, {indexFields: 'all', deletedAt: true, deletedBy: true});
        var Test0 = mongoose.model('Test1_indexFields', TestSchema);

        expect(Test0.schema.paths.deleted._index).to.be.true;
        expect(Test0.schema.paths.deletedAt._index).to.be.true;
        expect(Test0.schema.paths.deletedBy._index).to.be.true;
        done();
    });

    it("only 'deleted' field must have index: { indexFields: ['deleted'] }", function (done) {
        var TestSchema = new Schema({name: String}, {collection: 'mongoose_delete_test_indexFields'});
        TestSchema.plugin(mongoose_delete, {indexFields: ['deleted'], deletedAt: true, deletedBy: true});
        var Test0 = mongoose.model('Test2_indexFields', TestSchema);

        expect(Test0.schema.paths.deletedAt._index).to.be.false;
        expect(Test0.schema.paths.deletedBy._index).to.be.false;
        expect(Test0.schema.paths.deleted._index).to.be.true;
        done();
    });

    it("only 'deletedAt' and 'deletedBy' fields must have index: { indexFields: ['deletedAt', 'deletedBy'] }", function (done) {
        var TestSchema = new Schema({name: String}, {collection: 'mongoose_delete_test_indexFields'});
        TestSchema.plugin(mongoose_delete, {indexFields: ['deletedAt', 'deletedBy'], deletedAt: true, deletedBy: true});
        var Test0 = mongoose.model('Test3_indexFields', TestSchema);

        expect(Test0.schema.paths.deleted._index).to.be.false;
        expect(Test0.schema.paths.deletedAt._index).to.be.true;
        expect(Test0.schema.paths.deletedBy._index).to.be.true;
        done();
    });
});

describe("check usage of $ne operator", function () {
    var TestRawSchema = new Schema({name: String, deleted: Boolean}, {collection: 'mongoose_delete_test_ne'});
    var TestRawModel = mongoose.model('TestNeRaw', TestRawSchema);

    var TestSchema = new Schema({name: String}, {collection: 'mongoose_delete_test_ne'});
    TestSchema.plugin(mongoose_delete, {overrideMethods: 'all', use$neOperator: false});
    var TestModel = mongoose.model('Test55', TestSchema);

    before(function (done) {
        TestRawModel.create(
            [
                {name: 'One'},
                {name: 'Two', deleted: true},
                {name: 'Three', deleted: false}
            ], done);
    });

    after(function (done) {
        mongoose.connection.db.dropCollection("mongoose_delete_test_ne", done);
    });

    it("count() -> should return 1 documents", function (done) {
        if (mongooseMajorVersion < 5) {
            TestModel.count(function (err, count) {
                should.not.exist(err);

                count.should.equal(1);
                done();
            });
        } else {
            done();
        }
    });

    it("countDeleted() -> should return 1 deleted documents", function (done) {
        if (mongooseMajorVersion < 5) {
            TestModel.countDeleted(function (err, count) {
                should.not.exist(err);

                count.should.equal(1);
                done();
            });
        } else {
            done();
        }
    });

    it("find() -> should return 1 documents", function (done) {
        TestModel.find(function (err, documents) {
            should.not.exist(err);

            documents.length.should.equal(1);
            done();
        });
    });

    it("findDeleted() -> should return 1 documents", function (done) {
        TestModel.findDeleted(function (err, documents) {
            should.not.exist(err);

            documents.length.should.equal(1);
            done();
        });
    });
});

describe("aggregate methods: { overrideMethods: ['aggregate'] }", function () {
    var TestSchema = new Schema({ name: String }, { collection: 'mongoose_delete_test_aggregate' });
    TestSchema.plugin(mongoose_delete, { overrideMethods: ['aggregate'] });

    var TestModel = mongoose.model('Test5_Aggregate', TestSchema);

    beforeEach(function (done) {
        TestModel.create(
          [
              { name: 'Obi-Wan Kenobi', deleted: true },
              { name: 'Darth Vader' },
              { name: 'Luke Skywalker', deleted: true }
          ], done);
    });

    afterEach(function (done) {
        mongoose.connection.db.dropCollection("mongoose_delete_test_aggregate", done);
    });

    it("aggregate([{$project : {name : 1} }]) -> should return 1 document", function (done) {
        TestModel.aggregate([
            {
                $project : { name : 1 }
            }
        ], function (err, documents) {
            should.not.exist(err);
            documents.length.should.equal(1);
            done();
        });
    });

    it("aggregate([{$project : {name : 1} }]) -> should return 1 document (pipeline)", function (done) {
        TestModel
            .aggregate()
            .project({ name : 1 })
            .exec(function (err, documents) {
                should.not.exist(err);
                documents.length.should.equal(1);
                done();
            });
    });

    it("aggregateDeleted([{$project : {name : 1} }]) -> should return deleted documents", function (done) {
        TestModel.aggregateDeleted([
            {
                $project : { name : 1 }
            }
        ], function (err, documents) {
            should.not.exist(err);
            documents.length.should.equal(2);
            done();
        });
    });

    it("aggregateDeleted([{$project : {name : 1} }]) -> should return deleted documents (pipeline)", function (done) {
        TestModel
          .aggregateDeleted()
          .project({ name : 1 })
          .exec(function (err, documents) {
              should.not.exist(err);
              documents.length.should.equal(2);
              done();
          });
    });

    it("aggregateWithDeleted([{$project : {name : 1} }]) -> should return deleted documents", function (done) {
        TestModel.aggregateWithDeleted([
            {
                $project : { name : 1 }
            }
        ], function (err, documents) {
            should.not.exist(err);

            documents.length.should.equal(3);
            done();
        });
    });

    it("aggregateWithDeleted([{$project : {name : 1} }]) -> should return deleted documents (pipeline)", function (done) {
        TestModel
          .aggregateWithDeleted()
          .project({ name : 1 })
          .exec(function (err, documents) {
              should.not.exist(err);
              documents.length.should.equal(3);
              done();
          });
    });

});

describe("mongoose_delete find method overridden with populate", function () {
    var TestPopulateSchema1 = new Schema(
        { name: String },
        { collection: 'TestPopulate1' }
    );
    TestPopulateSchema1.plugin(mongoose_delete, { overrideMethods: 'all' });
    var TestPopulate1 = mongoose.model('TestPopulate1', TestPopulateSchema1);

    var TestPopulateSchema2 = new Schema(
        {
            name: String,
            test: { type: ObjectId, ref: 'TestPopulate1' }
        },
        { collection: 'TestPopulate2' }
    );
    TestPopulateSchema2.plugin(mongoose_delete, { overrideMethods: 'all' });
    var TestPopulate2 = mongoose.model('TestPopulate2', TestPopulateSchema2);

    beforeEach(function (done) {
        TestPopulate1.create(
            [
                { name: 'Obi-Wan Kenobi', _id: ObjectId("53da93b16b4a6670076b16b1"), deleted: true },
                { name: 'Darth Vader', _id: ObjectId("53da93b16b4a6670076b16b2") },
                { name: 'Luke Skywalker', _id: ObjectId("53da93b16b4a6670076b16b3"), deleted: true }
            ],
            function() {
                TestPopulate2.create(
                    [
                        { name: 'Student 1', test: ObjectId("53da93b16b4a6670076b16b1") },
                        { name: 'Student 2', test: ObjectId("53da93b16b4a6670076b16b2") },
                        { name: 'Student 3', test: ObjectId("53da93b16b4a6670076b16b3"), deleted: true }
                    ],
                    done
                )
            }
        );
    });

    afterEach(function (done) {
        mongoose.connection.db.dropCollection("TestPopulate1", done);
    });

    afterEach(function (done) {
        mongoose.connection.db.dropCollection("TestPopulate2", done);
    });

    it("populate() -> should not return deleted sub-document", function (done) {
        TestPopulate2
            .findOne({ name: 'Student 1' })
            .populate({ path: 'test' })
            .exec(function (err, document) {
                should.not.exist(err);

                expect(document.test).to.be.null;
                done();
            });
    });

    it("populate() -> should return the deleted sub-document using { withDeleted: true }", function (done) {
        TestPopulate2
            .findOne({ name: 'Student 1' })
            .populate({ path: 'test', options: { withDeleted: true } })
            .exec(function (err, document) {
                should.not.exist(err);
                expect(document.test).not.to.be.null;
                document.test.deleted.should.equal(true);
                done();
            });
    });

    it("populate() -> should not return deleted documents and sub-documents", function (done) {
        TestPopulate2
            .find({ })
            .populate({ path: 'test' })
            .exec(function (err, documents) {
                should.not.exist(err);

                var student1 = documents.findIndex(function(i) { return i.name === "Student 1" });
                var student2 = documents.findIndex(function(i) { return i.name === "Student 2" });

                documents.length.should.equal(2)
                expect(documents[student1].test).to.be.null;
                expect(documents[student2].test).not.to.be.null;

                done();
            });
    });

    it("populate() -> should return deleted documents and sub-documents", function (done) {
        TestPopulate2
            .findWithDeleted()
            .populate({ path: 'test', options: { withDeleted: true } })
            .exec(function (err, documents) {
                should.not.exist(err);

                documents.length.should.equal(3);

                var student1 = documents.findIndex(function(i) { return i.name === "Student 1" });
                var student2 = documents.findIndex(function(i) { return i.name === "Student 2" });
                var student3 = documents.findIndex(function(i) { return i.name === "Student 3" });

                expect(documents[student1].test).not.to.be.null;
                expect(documents[student2].test).not.to.be.null;
                expect(documents[student3].test).not.to.be.null;
                done();
            });
    });
});