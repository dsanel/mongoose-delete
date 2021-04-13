var should = require('chai').should(),
    expect = require('chai').expect,
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var mongoose_delete = require('../');

var ObjectId = mongoose.Types.ObjectId;

before(function (done) {
    mongoose.connect(process.env.MONGOOSE_TEST_URI || 'mongodb://localhost/test', {useNewUrlParser: true});
    if (+mongoose.version[0] >= 5) {
        mongoose.set('useCreateIndex', true);
        mongoose.set('useFindAndModify', false);
    }
    done();
});

after(function (done) {
    mongoose.disconnect();
    done();
});


describe("mongoose_delete delete method without callback function", function () {

    var Test1Schema = new Schema({name: String}, {collection: 'mongoose_delete_test0'});
    Test1Schema.plugin(mongoose_delete);
    var Test0 = mongoose.model('Test0', Test1Schema);

    before(function (done) {
        var puffy = new Test0({name: 'Puffy'});

        puffy.save(function () {
            done();
        });
    });

    after(function (done) {
        mongoose.connection.db.dropCollection("mongoose_delete_test0", function () {
            done();
        });
    });

    it("delete() -> should return a thenable (Promise)", function (done) {
        Test0.findOne({name: 'Puffy'}, function (err, puffy) {
            should.not.exist(err);

            expect(puffy.delete()).to.have.property('then');
            done();
        });
    });
});

describe("mongoose_delete plugin without options", function () {

    var Test1Schema = new Schema({name: String}, {collection: 'mongoose_delete_test1'});
    Test1Schema.plugin(mongoose_delete);
    var Test1 = mongoose.model('Test1', Test1Schema);
    var puffy1 = new Test1({name: 'Puffy1'});
    var puffy2 = new Test1({name: 'Puffy2'});

    before(function (done) {
        puffy1.save(function () {
            puffy2.save(function () {
                done();
            });
        });
    });

    after(function (done) {
        mongoose.connection.db.dropCollection("mongoose_delete_test1", function () {
            done();
        });
    });

    it("delete() -> should set deleted:true", function (done) {
        Test1.findOne({name: 'Puffy1'}, function (err, puffy) {
            should.not.exist(err);

            puffy.delete(function (err, success) {
                if (err) {
                    throw err;
                }
                success.deleted.should.equal(true);
                done();
            });
        });
    });

    it("delete() -> should not save 'deletedAt' value", function (done) {
        Test1.findOne({name: 'Puffy1'}, function (err, puffy) {
            should.not.exist(err);

            puffy.delete(function (err, success) {
                if (err) {
                    throw err;
                }
                should.not.exist(success.deletedAt);
                done();
            });
        });
    });

    it("deleteById() -> should set deleted:true and not save 'deletedAt'", function (done) {
        Test1.deleteById(puffy2._id, function (err, documents) {
            should.not.exist(err);
            documents.ok.should.equal(1);
            documents.n.should.equal(1);

            Test1.findOne({name: 'Puffy2'}, function (err, doc) {
                should.not.exist(err);
                doc.deleted.should.equal(true);
                should.not.exist(doc.deletedAt);
                done();
            });
        });
    });

    it("deleteById() -> should throws exception: first argument error", function (done) {
        var errMessage = 'First argument is mandatory and must not be a function.';
        expect(Test1.deleteById).to.throw(errMessage);
        expect(() => { Test1.deleteById(() => {}) }).to.throw(errMessage);
        done();
    });

    it("restore() -> should set deleted:false", function (done) {
        Test1.findOne({name: 'Puffy1'}, function (err, puffy) {
            should.not.exist(err);

            puffy.restore(function (err, success) {
                if (err) {
                    throw err;
                }
                success.deleted.should.equal(false);
                done();
            });
        });
    });
});

describe("mongoose_delete plugin without options, using option: typeKey", function () {

    var Test1Schema = new Schema({name: String}, {collection: 'mongoose_delete_test1', typeKey: '$type'});
    Test1Schema.plugin(mongoose_delete);
    var Test1 = mongoose.model('Test1a', Test1Schema);
    var puffy1 = new Test1({name: 'Puffy1'});
    var puffy2 = new Test1({name: 'Puffy2'});

    before(function (done) {
        puffy1.save(function () {
            puffy2.save(function () {
                done();
            });
        });
    });

    after(function (done) {
        mongoose.connection.db.dropCollection("mongoose_delete_test1", function () {
            done();
        });
    });

    it("delete() -> should set deleted:true", function (done) {
        Test1.findOne({name: 'Puffy1'}, function (err, puffy) {
            should.not.exist(err);

            puffy.delete(function (err, success) {
                if (err) {
                    throw err;
                }
                success.deleted.should.equal(true);
                done();
            });
        });
    });

    it("delete() -> should not save 'deletedAt' value", function (done) {
        Test1.findOne({name: 'Puffy1'}, function (err, puffy) {
            should.not.exist(err);

            puffy.delete(function (err, success) {
                if (err) {
                    throw err;
                }
                should.not.exist(success.deletedAt);
                done();
            });
        });
    });

    it("deleteById() -> should set deleted:true and not save 'deletedAt'", function (done) {
        Test1.deleteById(puffy2._id, function (err, documents) {
            should.not.exist(err);
            documents.ok.should.equal(1);
            documents.n.should.equal(1);

            Test1.findOne({name: 'Puffy2'}, function (err, doc) {
                should.not.exist(err);
                doc.deleted.should.equal(true);
                should.not.exist(doc.deletedAt);
                done();
            });
        });
    });

    it("restore() -> should set deleted:false", function (done) {
        Test1.findOne({name: 'Puffy1'}, function (err, puffy) {
            should.not.exist(err);

            puffy.restore(function (err, success) {
                if (err) {
                    throw err;
                }
                success.deleted.should.equal(false);
                done();
            });
        });
    });
});

describe("mongoose_delete with options: { deletedAt : true }", function () {

    var Test2Schema = new Schema({name: String}, {collection: 'mongoose_delete_test2'});
    Test2Schema.plugin(mongoose_delete, {deletedAt: true});
    var Test2 = mongoose.model('Test2', Test2Schema);
    var puffy1 = new Test2({name: 'Puffy1'});
    var puffy2 = new Test2({name: 'Puffy2'});

    before(function (done) {
        puffy1.save(function () {
            puffy2.save(function () {
                done();
            });
        });
    });

    after(function (done) {
        mongoose.connection.db.dropCollection("mongoose_delete_test2", function () {
            done();
        });
    });

    it("delete() -> should save 'deletedAt' key", function (done) {
        Test2.findOne({name: 'Puffy1'}, function (err, puffy) {
            should.not.exist(err);

            puffy.delete(function (err, success) {
                if (err) {
                    throw err;
                }
                should.exist(success.deletedAt);
                done();
            });
        });
    });

    it("deleteById() -> should save 'deletedAt' key", function (done) {
        Test2.deleteById(puffy2._id, function (err, documents) {
            should.not.exist(err);
            documents.ok.should.equal(1);
            documents.n.should.equal(1);

            Test2.findOne({name: 'Puffy2'}, function (err, doc) {
                should.not.exist(err);
                doc.deleted.should.equal(true);
                should.exist(doc.deletedAt);
                done();
            });
        });
    });

    it("restore() -> should set deleted:false and delete deletedAt key", function (done) {
        Test2.findOne({name: 'Puffy1'}, function (err, puffy) {
            should.not.exist(err);

            puffy.restore(function (err, success) {
                if (err) {
                    throw err;
                }
                success.deleted.should.equal(false);
                should.not.exist(success.deletedAt);
                done();
            });
        });
    });
});

describe("mongoose_delete with options: { deletedAt : true }, using option: typeKey", function () {

    var Test2Schema = new Schema({name: String}, {collection: 'mongoose_delete_test2', typeKey: '$type'});
    Test2Schema.plugin(mongoose_delete, {deletedAt: true});
    var Test2 = mongoose.model('Test2a', Test2Schema);
    var puffy1 = new Test2({name: 'Puffy1'});
    var puffy2 = new Test2({name: 'Puffy2'});

    before(function (done) {
        puffy1.save(function () {
            puffy2.save(function () {
                done();
            });
        });
    });

    after(function (done) {
        mongoose.connection.db.dropCollection("mongoose_delete_test2", function () {
            done();
        });
    });

    it("delete() -> should save 'deletedAt' key", function (done) {
        Test2.findOne({name: 'Puffy1'}, function (err, puffy) {
            should.not.exist(err);

            puffy.delete(function (err, success) {
                if (err) {
                    throw err;
                }
                should.exist(success.deletedAt);
                done();
            });
        });
    });

    it("deleteById() -> should save 'deletedAt' key", function (done) {
        Test2.deleteById(puffy2._id, function (err, documents) {
            should.not.exist(err);
            documents.ok.should.equal(1);
            documents.n.should.equal(1);

            Test2.findOne({name: 'Puffy2'}, function (err, doc) {
                should.not.exist(err);
                doc.deleted.should.equal(true);
                should.exist(doc.deletedAt);
                done();
            });
        });
    });

    it("restore() -> should set deleted:false and delete deletedAt key", function (done) {
        Test2.findOne({name: 'Puffy1'}, function (err, puffy) {
            should.not.exist(err);

            puffy.restore(function (err, success) {
                if (err) {
                    throw err;
                }
                success.deleted.should.equal(false);
                should.not.exist(success.deletedAt);
                done();
            });
        });
    });
});

describe("mongoose_delete with options: { deletedBy : true }", function () {

    var Test3Schema = new Schema({name: String}, {collection: 'mongoose_delete_test3'});
    Test3Schema.plugin(mongoose_delete, {deletedBy: true});
    var Test3 = mongoose.model('Test3', Test3Schema);
    var puffy1 = new Test3({name: 'Puffy1'});
    var puffy2 = new Test3({name: 'Puffy2'});

    before(function (done) {
        puffy1.save(function () {
            puffy2.save(function () {
                done();
            });
        });
    });

    after(function (done) {
        mongoose.connection.db.dropCollection("mongoose_delete_test3", function () {
            done();
        });
    });

    var id = mongoose.Types.ObjectId("53da93b16b4a6670076b16bf");

    it("delete() -> should save 'deletedBy' key", function (done) {
        Test3.findOne({name: 'Puffy1'}, function (err, puffy) {
            should.not.exist(err);

            puffy.delete(id, function (err, success) {
                should.not.exist(err);

                success.deletedBy.should.equal(id);
                done();
            });
        });
    });

    it("deleteById() -> should save `deletedBy` key", function (done) {
        Test3.deleteById(puffy2._id, id, function (err, documents) {
            should.not.exist(err);
            documents.ok.should.equal(1);
            documents.n.should.equal(1);

            Test3.findOne({name: 'Puffy2'}, function (err, doc) {
                should.not.exist(err);
                doc.deleted.should.equal(true);
                doc.deletedBy.toString().should.equal(id.toString());
                done();
            });
        });
    });

    it("restore() -> should set deleted:false and delete `deletedBy` key", function (done) {
        Test3.findOne({name: 'Puffy1'}, function (err, puffy) {
            should.not.exist(err);

            puffy.restore(function (err, success) {
                if (err) {
                    throw err;
                }
                success.deleted.should.equal(false);
                should.not.exist(success.deletedBy);
                done();
            });
        });
    });
});

describe("mongoose_delete with options: { deletedBy : true }, using option: typeKey", function () {

    var Test3Schema = new Schema({name: String}, {collection: 'mongoose_delete_test3', typeKey: '$type'});
    Test3Schema.plugin(mongoose_delete, {deletedBy: true});
    var Test3 = mongoose.model('Test3a', Test3Schema);
    var puffy1 = new Test3({name: 'Puffy1'});
    var puffy2 = new Test3({name: 'Puffy2'});

    before(function (done) {
        puffy1.save(function () {
            puffy2.save(function () {
                done();
            });
        });
    });

    after(function (done) {
        mongoose.connection.db.dropCollection("mongoose_delete_test3", function () {
            done();
        });
    });

    var id = mongoose.Types.ObjectId("53da93b16b4a6670076b16bf");

    it("delete() -> should save `deletedBy` key", function (done) {
        Test3.findOne({name: 'Puffy1'}, function (err, puffy) {
            should.not.exist(err);

            puffy.delete(id, function (err, success) {
                should.not.exist(err);

                success.deletedBy.should.equal(id);
                done();
            });
        });
    });

    it("deleteById() -> should save deletedBy key", function (done) {
        Test3.deleteById(puffy2._id, id, function (err, documents) {
            should.not.exist(err);
            documents.ok.should.equal(1);
            documents.n.should.equal(1);

            Test3.findOne({name: 'Puffy2'}, function (err, doc) {
                should.not.exist(err);
                doc.deleted.should.equal(true);
                doc.deletedBy.toString().should.equal(id.toString());
                done();
            });
        });
    });

    it("restore() -> should set deleted:false and delete deletedBy key", function (done) {
        Test3.findOne({name: 'Puffy1'}, function (err, puffy) {
            should.not.exist(err);

            puffy.restore(function (err, success) {
                if (err) {
                    throw err;
                }
                success.deleted.should.equal(false);
                should.not.exist(success.deletedBy);
                done();
            });
        });
    });
});

describe("mongoose_delete with options: { deletedBy : true, deletedByType: String }", function () {

    var TestSchema = new Schema({name: String}, {collection: 'mongoose_delete_test'});
    TestSchema.plugin(mongoose_delete, {deletedBy: true, deletedByType: String});
    var Test = mongoose.model('TestDeletedByType', TestSchema);
    var puffy1 = new Test({name: 'Puffy1'});
    var puffy2 = new Test({name: 'Puffy2'});

    before(function (done) {
        puffy1.save(function () {
            puffy2.save(function () {
                done();
            });
        });
    });

    after(function (done) {
        mongoose.connection.db.dropCollection("mongoose_delete_test", function () {
            done();
        });
    });

    var id = "custom_user_id_12345678";

    it("delete() -> should save deletedBy key", function (done) {
        Test.findOne({name: 'Puffy1'}, function (err, puffy) {
            should.not.exist(err);

            puffy.delete(id, function (err, success) {
                should.not.exist(err);

                success.deletedBy.should.equal(id);
                done();
            });
        });
    });

    it("deleteById() -> should save deletedBy key", function (done) {
        Test.deleteById(puffy2._id, id, function (err, documents) {
            should.not.exist(err);
            documents.ok.should.equal(1);
            documents.n.should.equal(1);

            Test.findOne({name: 'Puffy2'}, function (err, doc) {
                should.not.exist(err);
                doc.deleted.should.equal(true);
                doc.deletedBy.should.equal(id);
                done();
            });
        });
    });

    it("restore() -> should set deleted:false and delete deletedBy key", function (done) {
        Test.findOne({name: 'Puffy1'}, function (err, puffy) {
            should.not.exist(err);

            puffy.restore(function (err, success) {
                if (err) {
                    throw err;
                }
                success.deleted.should.equal(false);
                should.not.exist(success.deletedBy);
                done();
            });
        });
    });
});

describe("check not overridden static methods", function () {
    var TestSchema = new Schema({name: String}, {collection: 'mongoose_delete_test'});
    TestSchema.plugin(mongoose_delete);
    var TestModel = mongoose.model('Test4', TestSchema);

    beforeEach(function (done) {
        TestModel.create(
            [
                {name: 'Obi-Wan Kenobi', deleted: true},
                {name: 'Darth Vader'},
                {name: 'Luke Skywalker'}
            ], done);
    });

    afterEach(function (done) {
        mongoose.connection.db.dropCollection("mongoose_delete_test", done);
    });

    it("count() -> should return 3 documents", function (done) {
        TestModel.count(function (err, count) {
            should.not.exist(err);

            count.should.equal(3);
            done();
        });
    });

    it("countDocuments() -> should return 3 documents", function (done) {
        // INFO: countDocuments is added in mongoose 5.x
        if (typeof TestModel.countDocuments === 'function') {
            TestModel.countDocuments(function (err, count) {
                should.not.exist(err);

                count.should.equal(3);
                done();
            });
        } else {
            done();
        }
    });

    it("find() -> should return 3 documents", function (done) {
        TestModel.find(function (err, documents) {
            should.not.exist(err);

            documents.length.should.equal(3);
            done();
        });
    });

    it("findOne() -> should return 1 deleted document", function (done) {
        TestModel.findOne({name: 'Obi-Wan Kenobi'}, function (err, doc) {
            should.not.exist(err);

            expect(doc).not.to.be.null;
            doc.deleted.should.equal(true);
            done();
        });
    });

    it("findOneAndUpdate() -> should find and update deleted document", function (done) {
        TestModel.findOneAndUpdate({name: 'Obi-Wan Kenobi'}, {name: 'Obi-Wan Kenobi Test'}, {new: true}, function (err, doc) {
            should.not.exist(err);

            expect(doc).not.to.be.null;
            doc.name.should.equal('Obi-Wan Kenobi Test');
            done();
        });
    });

    it("update() -> should update deleted document", function (done) {
        TestModel.update({name: 'Obi-Wan Kenobi'}, {name: 'Obi-Wan Kenobi Test'}, function (err, doc) {
            should.not.exist(err);

            doc.ok.should.equal(1);
            doc.n.should.equal(1);
            done();
        });
    });

    it("updateMany() -> should update deleted document", function (done) {
        TestModel.updateMany({name: 'Obi-Wan Kenobi'}, {name: 'Obi-Wan Kenobi Test'}, function (err, doc) {
            should.not.exist(err);

            doc.ok.should.equal(1);
            doc.n.should.equal(1);
            done();
        });
    });
});

describe("check overridden static methods: { overrideMethods: 'all' }", function () {
    var TestSchema = new Schema({name: String}, {collection: 'mongoose_delete_test'});
    TestSchema.plugin(mongoose_delete, {overrideMethods: 'all'});
    var TestModel = mongoose.model('Test5', TestSchema);

    beforeEach(function (done) {
        TestModel.create(
            [
                {name: 'Obi-Wan Kenobi', deleted: true},
                {name: 'Darth Vader'},
                {name: 'Luke Skywalker', deleted: true}
            ], done);
    });

    afterEach(function (done) {
        mongoose.connection.db.dropCollection("mongoose_delete_test", done);
    });

    it("count() -> should return 1 documents", function (done) {
        TestModel.count(function (err, count) {
            should.not.exist(err);

            count.should.equal(1);
            done();
        });
    });

    it("countDocuments() -> should return 1 documents", function (done) {
        TestModel.countDocuments(function (err, count) {
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

    it("countDocumentsDeleted() -> should return 2 deleted documents", function (done) {
        TestModel.countDocumentsDeleted(function (err, count) {
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

    it("countDocumentsWithDeleted() -> should return 3 documents", function (done) {
        TestModel.countDocumentsWithDeleted(function (err, count) {
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
        TestModel.findOne({name: 'Obi-Wan Kenobi'}, function (err, doc) {
            should.not.exist(err);

            expect(doc).to.be.null;
            done();
        });
    });

    it("findOneDeleted() -> should return 1 deleted document", function (done) {
        TestModel.findOneDeleted({name: 'Obi-Wan Kenobi'}, function (err, doc) {
            should.not.exist(err);

            expect(doc).not.to.be.null;
            done();
        });
    });

    it("findOneWithDeleted() -> should return 1 deleted document", function (done) {
        TestModel.findOneWithDeleted({name: 'Obi-Wan Kenobi'}, function (err, doc) {
            should.not.exist(err);

            expect(doc).not.to.be.null;
            done();
        });
    });

    it("findOneWithDeleted() -> should return 1 not deleted document", function (done) {
        TestModel.findOneWithDeleted({name: 'Darth Vader'}, function (err, doc) {
            should.not.exist(err);

            expect(doc).not.to.be.null;
            done();
        });
    });

    it("findOneAndUpdate() -> should not find and update deleted document", function (done) {
        TestModel.findOneAndUpdate({name: 'Obi-Wan Kenobi'}, {name: 'Obi-Wan Kenobi Test'}, {new: true}, function (err, doc) {
            should.not.exist(err);

            expect(doc).to.be.null;
            done();
        });
    });

    it("findOneAndUpdateDeleted() -> should find and update deleted document", function (done) {
        TestModel.findOneAndUpdateDeleted({name: 'Obi-Wan Kenobi'}, {name: 'Obi-Wan Kenobi Test'}, {new: true}, function (err, doc) {
            should.not.exist(err);

            expect(doc).not.to.be.null;
            done();
        });
    });

    it("findOneAndUpdateWithDeleted() -> should find and update deleted document", function (done) {
        TestModel.findOneAndUpdateWithDeleted({name: 'Obi-Wan Kenobi'}, {name: 'Obi-Wan Kenobi Test'}, {new: true}, function (err, doc) {
            should.not.exist(err);

            expect(doc).not.to.be.null;
            done();
        });
    });

    it("findOneAndUpdateWithDeleted() -> should find and update not deleted document", function (done) {
        TestModel.findOneAndUpdateWithDeleted({name: 'Darth Vader'}, {name: 'Darth Vader Test'}, {new: true}, function (err, doc) {
            should.not.exist(err);

            expect(doc).not.to.be.null;
            done();
        });
    });

    it("update(conditions, update, options, callback) -> should not update deleted documents", function (done) {
        TestModel.update({}, {name: 'Luke Skywalker Test'}, {multi: true}, function (err, doc) {
            should.not.exist(err);

            doc.ok.should.equal(1);
            doc.n.should.equal(1);
            done();
        });
    });

    it("updateMany(conditions, update, options, callback) -> should not update deleted documents", function (done) {
        TestModel.updateMany({}, {name: 'Luke Skywalker Test'}, {multi: true}, function (err, doc) {
            should.not.exist(err);

            doc.ok.should.equal(1);
            doc.n.should.equal(1);
            done();
        });
    });

    it("update(conditions, update, options) -> should not update deleted documents", function (done) {
        TestModel.update({}, {name: 'Luke Skywalker Test'}, {multi: true}).exec(function (err, doc) {
            should.not.exist(err);

            doc.ok.should.equal(1);
            doc.n.should.equal(1);
            done();
        });
    });

    it("updateMany(conditions, update, options) -> should not update deleted documents", function (done) {
        TestModel.updateMany({}, {name: 'Luke Skywalker Test'}, {multi: true}).exec(function (err, doc) {
            should.not.exist(err);

            doc.ok.should.equal(1);
            doc.n.should.equal(1);
            done();
        });
    });

    it("update(conditions, update, callback) -> should not update deleted documents", function (done) {
        TestModel.update({}, {name: 'Luke Skywalker Test'}, function (err, doc) {
            should.not.exist(err);

            doc.ok.should.equal(1);
            doc.n.should.equal(1);
            done();
        });
    });

    it("updateMany(conditions, update, callback) -> should not update deleted documents", function (done) {
        TestModel.updateMany({}, {name: 'Luke Skywalker Test'}, function (err, doc) {
            should.not.exist(err);

            doc.ok.should.equal(1);
            doc.n.should.equal(1);
            done();
        });
    });

    it("update(conditions, update) -> should not update deleted documents", function (done) {
        TestModel.update({}, {name: 'Luke Skywalker Test'}).exec(function (err, doc) {
            should.not.exist(err);

            doc.ok.should.equal(1);
            doc.n.should.equal(1);
            done();
        });
    });

    it("updateMany(conditions, update) -> should not update deleted documents", function (done) {
        TestModel.updateMany({}, {name: 'Luke Skywalker Test'}).exec(function (err, doc) {
            should.not.exist(err);

            doc.ok.should.equal(1);
            doc.n.should.equal(1);
            done();
        });
    });

    it("updateDeleted() -> should update deleted document", function (done) {
        TestModel.updateDeleted({}, {name: 'Test 123'}, {multi: true}, function (err, doc) {
            should.not.exist(err);

            doc.ok.should.equal(1);
            doc.n.should.equal(2);
            done();
        });
    });

    it("updateManyDeleted() -> should update deleted document", function (done) {
        TestModel.updateManyDeleted({}, {name: 'Test 123'}, {multi: true}, function (err, doc) {
            should.not.exist(err);

            doc.ok.should.equal(1);
            doc.n.should.equal(2);
            done();
        });
    });

    it("updateWithDeleted() -> should update all document", function (done) {
        TestModel.updateWithDeleted({}, {name: 'Test 654'}, {multi: true}, function (err, doc) {
            should.not.exist(err);

            doc.ok.should.equal(1);
            doc.n.should.equal(3);
            done();
        });
    });

    it("updateManyWithDeleted() -> should update all document", function (done) {
        TestModel.updateManyWithDeleted({}, {name: 'Test 654'}, {multi: true}, function (err, doc) {
            should.not.exist(err);

            doc.ok.should.equal(1);
            doc.n.should.equal(3);
            done();
        });
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
});

describe("check the existence of override static methods: { overrideMethods: ['testError', 'count', 'countDocuments', 'find', 'findOne', 'findOneAndUpdate', 'update'] }", function () {
    var TestSchema = new Schema({name: String}, {collection: 'mongoose_delete_test'});
    TestSchema.plugin(mongoose_delete, {overrideMethods: ['testError', 'count', 'countDocuments', 'find', 'findOne', 'findOneAndUpdate', 'update']});
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
});

describe("check the existence of override static methods: { overrideMethods: ['count', 'find'] }", function () {
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

            documents.ok.should.equal(1);
            documents.n.should.equal(3);

            done();
        });
    });

    it("delete(query, cb) -> delete multiple documents with conditions", function (done) {
        TestModel.delete({side: 0}, function (err, documents) {
            should.not.exist(err);

            documents.ok.should.equal(1);
            documents.n.should.equal(2);

            done();
        });
    });


    it("delete(query, deletedBy, cb) -> delete multiple documents with conditions and user ID", function (done) {
        var userId = mongoose.Types.ObjectId("53da93b16b4a6670076b16bf");

        TestModel.delete({side: 1}, userId, function (err, documents) {
            should.not.exist(err);

            documents.ok.should.equal(1);
            documents.n.should.equal(1);

            done();
        });
    });

    it("delete().exec() -> delete all documents", function (done) {
        TestModel.delete().exec(function (err, documents) {
            should.not.exist(err);

            documents.ok.should.equal(1);
            documents.n.should.equal(3);

            done();
        });
    });

    it("delete(query).exec() -> delete multiple documents with conditions", function (done) {
        TestModel.delete({side: 0}).exec(function (err, documents) {
            should.not.exist(err);

            documents.ok.should.equal(1);
            documents.n.should.equal(2);

            done();
        });
    });

    it("delete(query, deletedBy).exec() -> delete multiple documents with conditions and user ID", function (done) {
        var userId = mongoose.Types.ObjectId("53da93b16b4a6670076b16bf");

        TestModel.delete({side: 1}, userId).exec(function (err, documents) {
            should.not.exist(err);

            documents.ok.should.equal(1);
            documents.n.should.equal(1);

            done();
        });
    });

    it("delete({}, deletedBy).exec() -> delete all documents passing user ID", function (done) {
        var userId = mongoose.Types.ObjectId("53da93b16b4a6670076b16bf");

        TestModel.delete({}, userId).exec(function (err, documents) {
            should.not.exist(err);

            documents.ok.should.equal(1);
            documents.n.should.equal(3);

            done();
        });
    });
});

describe("delete multiple documents (no plugin options)", function () {
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

            documents.ok.should.equal(1);
            documents.n.should.equal(3);

            done();
        });
    });
});

describe("restore multiple documents", function () {
    var TestSchema = new Schema({name: String, side: Number}, {collection: 'mongoose_restore_test'});
    TestSchema.plugin(mongoose_delete, {overrideMethods: 'all', deletedAt: true, deletedBy: true});
    var TestModel = mongoose.model('Test15', TestSchema);

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

            documents.ok.should.equal(1);
            documents.n.should.equal(3);

            done();
        });
    });

    it("restore(query, cb) -> restore multiple documents with conditions", function (done) {
        TestModel.restore({side: 0}, function (err, documents) {
            should.not.exist(err);

            documents.ok.should.equal(1);
            documents.n.should.equal(2);

            done();
        });
    });

    it("restore().exec() -> restore all documents", function (done) {
        TestModel.restore().exec(function (err, documents) {
            should.not.exist(err);

            documents.ok.should.equal(1);
            documents.n.should.equal(3);

            done();
        });
    });

    it("restore(query).exec() -> restore multiple documents with conditions", function (done) {
        TestModel.restore({side: 0}).exec(function (err, documents) {
            should.not.exist(err);

            documents.ok.should.equal(1);
            documents.n.should.equal(2);

            done();
        });
    });

});

describe("restore multiple documents (no plugin options)", function () {
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

            documents.ok.should.equal(1);
            documents.n.should.equal(3);

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
        TestModel.count(function (err, count) {
            should.not.exist(err);

            count.should.equal(1);
            done();
        });
    });

    it("countDeleted() -> should return 1 deleted documents", function (done) {
        TestModel.countDeleted(function (err, count) {
            should.not.exist(err);

            count.should.equal(1);
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
