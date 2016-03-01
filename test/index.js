var should = require('chai').should(),
    expect = require('chai').expect,
    assert = require('assert'),
    mongoose = require('mongoose'),
    mockgoose = require('mockgoose'),
    Schema = mongoose.Schema;

mockgoose(mongoose);

var mongoose_delete = require('../');

mongoose.connect(process.env.MONGOOSE_TEST_URI || 'mongodb://localhost/test');

describe("mongoose_delete delete method without callback function", function () {

    var Test1Schema = new Schema({ name: String }, { collection: 'mongoose_delete_test0' });
    Test1Schema.plugin(mongoose_delete);
    var Test0 = mongoose.model('Test0', Test1Schema);

    before(function (done) {
        var puffy = new Test0({ name: 'Puffy' });

        puffy.save(function () { done(); });
    });

    after(function (done) {
        mongoose.connection.db.dropCollection("mongoose_delete_test0", function () { done(); });
    });

    it("delete() -> should return a thenable (Promise)", function (done) {
        Test0.findOne({ name: 'Puffy' }, function (err, puffy) {
            should.not.exist(err);

            expect(puffy.delete()).to.have.property('then');
            done();
        });
    });
});

describe("mongoose_delete plugin without options", function () {

    var Test1Schema = new Schema({ name: String }, { collection: 'mongoose_delete_test1' });
    Test1Schema.plugin(mongoose_delete);
    var Test1 = mongoose.model('Test1', Test1Schema);

    before(function (done) {
        var puffy = new Test1({ name: 'Puffy' });

        puffy.save(function () { done(); });
    });

    after(function (done) {
        mongoose.connection.db.dropCollection("mongoose_delete_test1", function () { done(); });
    });

    it("delete() -> should set deleted:true", function (done) {
        Test1.findOne({ name: 'Puffy' }, function (err, puffy) {
            should.not.exist(err);

            puffy.delete(function (err, success) {
                if (err) { throw err; }
                success.deleted.should.equal(true);
                done();
            });
        });
    });

    it("delete() -> should not save 'deletedAt' value", function (done) {
        Test1.findOne({ name: 'Puffy' }, function (err, puffy) {
            should.not.exist(err);

            puffy.delete(function (err, success) {
                if (err) { throw err; }
                should.not.exist(success.deletedAt);
                done();
            });
        });
    });

    it("restore() -> should set deleted:false", function (done) {
        Test1.findOne({ name: 'Puffy' }, function (err, puffy) {
            should.not.exist(err);

            puffy.restore(function (err, success) {
                if (err) { throw err; }
                success.deleted.should.equal(false);
                done();
            });
        });
    });
});

describe("mongoose_delete with options: { deletedAt : true }", function () {

    var Test2Schema = new Schema({ name: String }, { collection: 'mongoose_delete_test2' });
    Test2Schema.plugin(mongoose_delete, { deletedAt : true });
    var Test2 = mongoose.model('Test2', Test2Schema);

    before(function (done) {
        var puffy = new Test2({ name: 'Puffy' });

        puffy.save(function () { done(); });
    });

    after(function (done) {
        mongoose.connection.db.dropCollection("mongoose_delete_test2", function () { done(); });
    });

    it("delete() -> should save 'deletedAt' key", function (done) {
        Test2.findOne({ name: 'Puffy' }, function (err, puffy) {
            should.not.exist(err);

            puffy.delete(function (err, success) {
                if (err) { throw err; }
                should.exist(success.deletedAt);
                done();
            });
        });
    });

    it("restore() -> should set deleted:false and delete deletedAt key", function (done) {
        Test2.findOne({ name: 'Puffy' }, function (err, puffy) {
            should.not.exist(err);

            puffy.restore(function (err, success) {
                if (err) { throw err; }
                success.deleted.should.equal(false);
                should.not.exist(success.deletedAt);
                done();
            });
        });
    });
});

describe("mongoose_delete with options: { deletedBy : true }", function () {

    var Test3Schema = new Schema({ name: String }, { collection: 'mongoose_delete_test3' });
    Test3Schema.plugin(mongoose_delete, { deletedBy : true });
    var Test3 = mongoose.model('Test3', Test3Schema);

    before(function (done) {
        var puffy = new Test3({ name: 'Puffy' });

        puffy.save(function () { done(); });
    });

    after(function (done) {
        mongoose.connection.db.dropCollection("mongoose_delete_test3", function () { done(); });
    });

    var id = mongoose.Types.ObjectId("53da93b16b4a6670076b16bf");

    it("delete() -> should save deletedBy key", function (done) {
        Test3.findOne({ name: 'Puffy' }, function (err, puffy) {
            should.not.exist(err);

            puffy.delete(id, function (err, success) {
                should.not.exist(err);

                success.deletedBy.should.equal(id);
                done();
            });
        });
    });

    it("restore() -> should set deleted:false and delete deletedBy key", function (done) {
        Test3.findOne({ name: 'Puffy' }, function (err, puffy) {
            should.not.exist(err);

            puffy.restore(function (err, success) {
                if (err) { throw err; }
                success.deleted.should.equal(false);
                should.not.exist(success.deletedBy);
                done();
            });
        });
    });
});

describe("check not overridden static methods", function () {
    var TestSchema = new Schema({ name: String }, { collection: 'mongoose_delete_test' });
    TestSchema.plugin(mongoose_delete);
    var TestModel = mongoose.model('Test4', TestSchema);

    beforeEach(function (done) {
        TestModel.create(
            [
                { name: 'Obi-Wan Kenobi', deleted: true},
                { name: 'Darth Vader'},
                { name: 'Luke Skywalker'}
            ], done);
    });

    afterEach(function(done) {
        mongoose.connection.db.dropCollection("mongoose_delete_test", done);
    });

    it("count() -> should return 3 documents", function (done) {
        TestModel.count(function (err, count) {
            should.not.exist(err);

            count.should.equal(3);
            done();
        });
    });

    it("find() -> should return 3 documents", function (done) {
        TestModel.find(function (err, documents) {
            should.not.exist(err);

            documents.length.should.equal(3);
            done();
        });
    });

    it("findOne() -> should return 1 deleted document", function (done) {
        TestModel.findOne({ name: 'Obi-Wan Kenobi' }, function (err, doc) {
            should.not.exist(err);

            expect(doc).not.to.be.null;
            doc.deleted.should.equal(true);
            done();
        });
    });

    it("findOneAndUpdate() -> should find and update deleted document", function (done) {
        TestModel.findOneAndUpdate({ name: 'Obi-Wan Kenobi' }, { name: 'Obi-Wan Kenobi Test'}, {new:true}, function (err, doc) {
            should.not.exist(err);

            expect(doc).not.to.be.null;
            doc.name.should.equal('Obi-Wan Kenobi Test');
            done();
        });
    });

    it("update() -> should update deleted document", function (done) {
        TestModel.update({ name: 'Obi-Wan Kenobi' }, { name: 'Obi-Wan Kenobi Test'}, function (err, doc) {
            should.not.exist(err);

            doc.ok.should.equal(1);
            doc.n.should.equal(1);
            done();
        });
    });
});

describe("check overridden static methods: { overrideMethods: 'all' }", function () {
    var TestSchema = new Schema({ name: String }, { collection: 'mongoose_delete_test' });
    TestSchema.plugin(mongoose_delete, { overrideMethods: 'all' });
    var TestModel = mongoose.model('Test5', TestSchema);

    beforeEach(function (done) {
        TestModel.create(
            [
                { name: 'Obi-Wan Kenobi', deleted: true},
                { name: 'Darth Vader'},
                { name: 'Luke Skywalker', deleted: true}
            ], done);
    });

    afterEach(function(done) {
        mongoose.connection.db.dropCollection("mongoose_delete_test", done);
    });

    it("count() -> should return 1 documents", function (done) {
        TestModel.count(function (err, count) {
            should.not.exist(err);

            count.should.equal(1);
            done();
        });
    });

    it("countDeleted() -> should return 2 deleted documents", function (done) {
        TestModel.countDeleted(function (err, count) {
            should.not.exist(err);

            count.should.equal(2);
            done();
        });
    });

    it("countWithDeleted() -> should return 3 documents", function (done) {
        TestModel.countWithDeleted(function (err, count) {
            should.not.exist(err);

            count.should.equal(3);
            done();
        });
    });

    it("find() -> should return 1 documents", function (done) {
        TestModel.find(function (err, documents) {
            should.not.exist(err);

            documents.length.should.equal(1);
            done();
        });
    });

    it("findDeleted() -> should return 2 documents", function (done) {
        TestModel.findDeleted(function (err, documents) {
            should.not.exist(err);

            documents.length.should.equal(2);
            done();
        });
    });

    it("findWithDeleted() -> should return 3 documents", function (done) {
        TestModel.findWithDeleted(function (err, documents) {
            should.not.exist(err);

            documents.length.should.equal(3);
            done();
        });
    });

    it("findOne() -> should not return 1 deleted document", function (done) {
        TestModel.findOne({ name: 'Obi-Wan Kenobi' }, function (err, doc) {
            should.not.exist(err);

            expect(doc).to.be.null;
            done();
        });
    });

    it("findOneDeleted() -> should return 1 deleted document", function (done) {
        TestModel.findOneDeleted({ name: 'Obi-Wan Kenobi' }, function (err, doc) {
            should.not.exist(err);

            expect(doc).not.to.be.null;
            done();
        });
    });

    it("findOneWithDeleted() -> should return 1 deleted document", function (done) {
        TestModel.findOneWithDeleted({ name: 'Obi-Wan Kenobi' }, function (err, doc) {
            should.not.exist(err);

            expect(doc).not.to.be.null;
            done();
        });
    });

    it("findOneWithDeleted() -> should return 1 not deleted document", function (done) {
        TestModel.findOneWithDeleted({ name: 'Darth Vader' }, function (err, doc) {
            should.not.exist(err);

            expect(doc).not.to.be.null;
            done();
        });
    });

    it("findOneAndUpdate() -> should not find and update deleted document", function (done) {
        TestModel.findOneAndUpdate({ name: 'Obi-Wan Kenobi' }, { name: 'Obi-Wan Kenobi Test'}, {new:true}, function (err, doc) {
            should.not.exist(err);

            expect(doc).to.be.null;
            done();
        });
    });

    it("findOneAndUpdateDeleted() -> should find and update deleted document", function (done) {
        TestModel.findOneAndUpdateDeleted({ name: 'Obi-Wan Kenobi' }, { name: 'Obi-Wan Kenobi Test'}, {new:true}, function (err, doc) {
            should.not.exist(err);

            expect(doc).not.to.be.null;
            done();
        });
    });

    it("findOneAndUpdateWithDeleted() -> should find and update deleted document", function (done) {
        TestModel.findOneAndUpdateWithDeleted({ name: 'Obi-Wan Kenobi' }, { name: 'Obi-Wan Kenobi Test'}, {new:true}, function (err, doc) {
            should.not.exist(err);

            expect(doc).not.to.be.null;
            done();
        });
    });

    it("findOneAndUpdateWithDeleted() -> should find and update not deleted document", function (done) {
        TestModel.findOneAndUpdateWithDeleted({ name: 'Darth Vader' }, { name: 'Darth Vader Test'}, {new:true}, function (err, doc) {
            should.not.exist(err);

            expect(doc).not.to.be.null;
            done();
        });
    });

    it("update(conditions, update, options, callback) -> should not update deleted documents", function (done) {
        TestModel.update({ }, { name: 'Luke Skywalker Test'}, { multi: true }, function (err, doc) {
            should.not.exist(err);

            doc.ok.should.equal(1);
            doc.n.should.equal(1);
            done();
        });
    });

    it("update(conditions, update, options) -> should not update deleted documents", function (done) {
        TestModel.update({ }, { name: 'Luke Skywalker Test'}, { multi: true }).exec(function (err, doc) {
            should.not.exist(err);

            doc.ok.should.equal(1);
            doc.n.should.equal(1);
            done();
        });
    });

    it("update(conditions, update, callback) -> should not update deleted documents", function (done) {
        TestModel.update({ }, { name: 'Luke Skywalker Test'}, function (err, doc) {
            should.not.exist(err);

            doc.ok.should.equal(1);
            doc.n.should.equal(1);
            done();
        });
    });

    it("update(conditions, update) -> should not update deleted documents", function (done) {
        TestModel.update({ }, { name: 'Luke Skywalker Test'}).exec(function (err, doc) {
            should.not.exist(err);

            doc.ok.should.equal(1);
            doc.n.should.equal(1);
            done();
        });
    });

    it("updateDeleted() -> should update deleted document", function (done) {
        TestModel.updateDeleted({ }, { name: 'Test 123'}, { multi: true }, function (err, doc) {
            should.not.exist(err);

            doc.ok.should.equal(1);
            doc.n.should.equal(2);
            done();
        });
    });

    it("updateWithDeleted() -> should update all document", function (done) {

        TestModel.updateWithDeleted({}, { name: 'Test 654'}, { multi: true },  function (err, doc) {
            should.not.exist(err);

            doc.ok.should.equal(1);
            doc.n.should.equal(3);
            done();
        });

    });
});

describe("check the existence of override static methods: { overrideMethods: true }", function () {
    var TestSchema = new Schema({ name: String }, { collection: 'mongoose_delete_test' });
    TestSchema.plugin(mongoose_delete, { overrideMethods: true });
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
});

describe("check the existence of override static methods: { overrideMethods: ['testError', 'count', 'find', 'findOne', 'findOneAndUpdate', 'update'] }", function () {
    var TestSchema = new Schema({ name: String }, { collection: 'mongoose_delete_test' });
    TestSchema.plugin(mongoose_delete, { overrideMethods: ['testError', 'count', 'find', 'findOne', 'findOneAndUpdate', 'update'] });
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
});

describe("check the existence of override static methods: { overrideMethods: ['count', 'find'] }", function () {
    var TestSchema = new Schema({ name: String }, { collection: 'mongoose_delete_test' });
    TestSchema.plugin(mongoose_delete, { overrideMethods: ['count', 'find'] });
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
        expect(TestModel.findOneDeleted).to.not.exist;
        done();
    });

    it("findOneWithDeleted() -> method should exist", function (done) {
        expect(TestModel.findOneWithDeleted).to.not.exist;
        done();
    });

    it("findOneAndUpdate() -> method should exist", function (done) {
        expect(TestModel.findOneAndUpdate).to.exist;
        done();
    });

    it("findOneAndUpdateDeleted() -> method should exist", function (done) {
        expect(TestModel.findOneAndUpdateDeleted).to.not.exist;
        done();
    });

    it("findOneAndUpdateWithDeleted() -> method should exist", function (done) {
        expect(TestModel.findOneAndUpdateWithDeleted).to.not.exist;
        done();
    });

    it("update() -> method should exist", function (done) {
        expect(TestModel.update).to.exist;
        done();
    });

    it("updateDeleted() -> method should exist", function (done) {
        expect(TestModel.updateDeleted).to.not.exist;
        done();
    });

    it("updateWithDeleted() -> method should exist", function (done) {
        expect(TestModel.updateWithDeleted).to.not.exist;
        done();
    });
});