var chai = require('chai'),
    should = chai.should(),
    expect = chai.expect,
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var mongoose_delete = require('..');

var ObjectId = mongoose.Types.ObjectId;

chai.use(function (_chai, utils) {
    utils.addChainableMethod(chai.Assertion.prototype, 'mongoose_count', function (val) {
        new chai.Assertion(this._obj.matchedCount).to.be.equal(val);
    });

    utils.addChainableMethod(chai.Assertion.prototype, 'mongoose_ok', function () {
        new chai.Assertion(this._obj.acknowledged).to.be.equal(true);
    });

});

before(async function () {
    await mongoose.connect(process.env.MONGOOSE_TEST_URI || 'mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true });
});

after(async function () {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
});

describe("mongoose_delete delete method without callback function", function () {
    var Test1Schema = new Schema({ name: String }, { collection: 'mongoose_delete_test0' });
    Test1Schema.plugin(mongoose_delete);
    var Test0 = mongoose.model('Test0', Test1Schema);

    before(async function () {
        var puffy = new Test0({ name: 'Puffy' });
        await puffy.save();
    });

    after(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test0");
    });

    it("delete() -> should return a thenable (Promise)", function () {
        return Test0.findOne({ name: 'Puffy' })
            .then(function (puffy) {
                expect(puffy.delete()).to.have.property('then');
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });
});

describe("mongoose_delete plugin without options", function () {
    var Test1Schema = new Schema({ name: String }, { collection: 'mongoose_delete_test1' });
    Test1Schema.plugin(mongoose_delete);
    var Test1 = mongoose.model('Test1', Test1Schema);
    var puffy1 = new Test1({ name: 'Puffy1' });
    var puffy2 = new Test1({ name: 'Puffy2' });

    before(async function () {
        await puffy1.save();
        await puffy2.save();
    });

    after(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test1");
    });

    it("delete() -> should set deleted:true", function () {
        return Test1.findOne({ name: 'Puffy1' })
            .then(function (puffy) {
                return puffy.delete();
            })
            .then(function (success) {
                success.deleted.should.equal(true);
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });

    it("delete() -> should not save 'deletedAt' value", function () {
        return Test1.findOne({ name: 'Puffy1' })
            .then(function (puffy) {
                return puffy.delete();
            })
            .then(function (success) {
                should.not.exist(success.deletedAt);
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });

    it("deleteById() -> should set deleted:true and not save 'deletedAt'", function () {
        return Test1.deleteById(puffy2._id)
            .then(function (documents) {
                expect(documents).to.be.mongoose_ok();
                expect(documents).to.be.mongoose_count(1);
                return Test1.findOne({ name: 'Puffy2' });
            })
            .then(function (doc) {
                doc.deleted.should.equal(true);
                should.not.exist(doc.deletedAt);
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });

    it("deleteById() -> should throw an exception: first argument error", function () {
        var errMessage = 'First argument is mandatory and must not be a function.';
        expect(Test1.deleteById).to.throw(errMessage);
        expect(() => { Test1.deleteById(() => { }) }).to.throw(errMessage);
    });

    it("restoreMany() -> should set deleted:false", function () {
        return Test1.restoreMany({ name: 'Puffy1' })
            .then(function () {
                return Test1.findOne({ name: 'Puffy1' });
            })
            .then(function (puffy) {
                puffy.deleted.should.equal(false);
                should.not.exist(puffy.deletedBy);
            })
            .catch(function (err) {
                should.not.exist(err);
            }); 
    });
});

describe("mongoose_delete plugin without options, using option: typeKey", function () {

    var Test1Schema = new Schema({ name: String }, { collection: 'mongoose_delete_test1', typeKey: '$type' });
    Test1Schema.plugin(mongoose_delete);
    var Test1 = mongoose.model('Test1a', Test1Schema);
    var puffy1 = new Test1({ name: 'Puffy1' });
    var puffy2 = new Test1({ name: 'Puffy2' });

    before(async function () {
        await puffy1.save();
        await puffy2.save();
    });

    after(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test1");
    });

    it("delete() -> should set deleted:true", function () {
        return Test1.findOne({ name: 'Puffy1' })
            .then(function (puffy) {
                return puffy.delete();
            })
            .then(function (success) {
                success.deleted.should.equal(true);
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });

    it("delete() -> should not save 'deletedAt' value", function () {
        return Test1.findOne({ name: 'Puffy1' })
            .then(function (puffy) {
                return puffy.delete();
            })
            .then(function (success) {
                should.not.exist(success.deletedAt);
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });

    it("deleteById() -> should set deleted:true and not save 'deletedAt'", function () {
        return Test1.deleteById(puffy2._id)
            .then(function (documents) {
                expect(documents).to.be.mongoose_ok();
                expect(documents).to.be.mongoose_count(1);
                return Test1.findOne({ name: 'Puffy2' });
            })
            .then(function (doc) {
                doc.deleted.should.equal(true);
                should.not.exist(doc.deletedAt);
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });

    it("restoreMany() -> should set deleted:false", function () {
        return Test1.restoreMany({ name: 'Puffy2' })
            .then(function () {
                return Test1.findOne({ name: 'Puffy2' });
            })
            .then(function (puffy) {
                puffy.deleted.should.equal(false);
                should.not.exist(puffy.deletedAt);
            })
            .catch(function (err) {
                should.not.exist(err);
            }); 
    });
});

describe("mongoose_delete with options: { deletedAt : true }", function () {
    var Test2Schema = new Schema({ name: String }, { collection: 'mongoose_delete_test2' });
    Test2Schema.plugin(mongoose_delete, { deletedAt: true });
    var Test2 = mongoose.model('Test2', Test2Schema);
    var puffy1 = new Test2({ name: 'Puffy1' });
    var puffy2 = new Test2({ name: 'Puffy2' });

    before(async function () {
        await puffy1.save();
        await puffy2.save();
    });

    after(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test2");
    });

    it("delete() -> should save 'deletedAt' key", function () {
        return Test2.findOne({ name: 'Puffy1' })
            .then(function (puffy) {
                return puffy.delete();
            })
            .then(function (success) {
                should.exist(success.deletedAt);
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });

    it("deleteById() -> should save 'deletedAt' key", function () {
        return Test2.deleteById(puffy2._id)
            .then(function (documents) {
                expect(documents).to.be.mongoose_ok();
                expect(documents).to.be.mongoose_count(1);
                return Test2.findOne({ name: 'Puffy2' });
            })
            .then(function (doc) {
                doc.deleted.should.equal(true);
                should.exist(doc.deletedAt);
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });

    it("restoreMany() -> should set deleted:false and delete 'deletedAt' key", function () {
        return Test2.restoreMany({ name: 'Puffy1' })
            .then(function () {
                return Test2.findOne({ name: 'Puffy1' });
            })
            .then(function (puffy) {
                puffy.deleted.should.equal(false);
                should.not.exist(puffy.deletedAt);
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });
});

describe("mongoose_delete with options: { deletedAt : true }, using option: typeKey", function () {

    var Test2Schema = new Schema({ name: String }, { collection: 'mongoose_delete_test2', typeKey: '$type' });
    Test2Schema.plugin(mongoose_delete, { deletedAt: true });
    var Test2 = mongoose.model('Test2a', Test2Schema);
    var puffy1 = new Test2({ name: 'Puffy1' });
    var puffy2 = new Test2({ name: 'Puffy2' });

    before(async function () {
        await puffy1.save();
        await puffy2.save();
    });

    after(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test2");
    });

    it("delete() -> should save 'deletedAt' key", function () {
        return Test2.findOne({ name: 'Puffy1' })
            .then(function (puffy) {
                return puffy.delete();
            })
            .then(function (success) {
                should.exist(success.deletedAt);
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });

    it("deleteById() -> should save 'deletedAt' key", function () {
        return Test2.deleteById(puffy2._id)
            .then(function (documents) {
                expect(documents).to.be.mongoose_ok();
                expect(documents).to.be.mongoose_count(1);
                return Test2.findOne({ name: 'Puffy2' });
            })
            .then(function (doc) {
                doc.deleted.should.equal(true);
                should.exist(doc.deletedAt);
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });

    it("restoreMany() -> should set deleted:false and delete 'deletedAt' key", function () {
        return Test2.restoreMany({ name: 'Puffy1' })
            .then(function () {
                return Test2.findOne({ name: 'Puffy1' });
            })
            .then(function (puffy) {
                puffy.deleted.should.equal(false);
                should.not.exist(puffy.deletedAt);
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });
});

describe("mongoose_delete with options: { deletedBy : true }", function () {

    var Test3Schema = new Schema({ name: String }, { collection: 'mongoose_delete_test3' });
    Test3Schema.plugin(mongoose_delete, { deletedBy: true });
    var Test3 = mongoose.model('Test3', Test3Schema);
    var puffy1 = new Test3({ name: 'Puffy1' });
    var puffy2 = new Test3({ name: 'Puffy2' });

    before(async function () {
        await puffy1.save();
        await puffy2.save();
    });

    after(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test3");
    });

    var id = new mongoose.Types.ObjectId("53da93b16b4a6670076b16bf");

    it("delete() -> should save 'deletedBy' key", function () {
        return Test3.findOne({ name: 'Puffy1' })
            .then(function (puffy) {
                return puffy.delete(id);
            })
            .then(function (success) {
                success.deletedBy.should.equal(id);
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });

    it("deleteById() -> should save 'deletedBy' key", function () {
        return Test3.deleteById(puffy2._id, id)
            .then(function (documents) {
                expect(documents).to.be.mongoose_ok();
                expect(documents).to.be.mongoose_count(1);
                return Test3.findOne({ name: 'Puffy2' });
            })
            .then(function (doc) {
                doc.deleted.should.equal(true);
                doc.deletedBy.toString().should.equal(id.toString());
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });

    it("restoreMany() -> should set deleted:false and delete 'deletedBy' key", function () {
        return Test3.restoreMany({ name: 'Puffy1' })
            .then(function () {
                return Test3.findOne({ name: 'Puffy1' });
            })
            .then(function (puffy) {
                puffy.deleted.should.equal(false);
                should.not.exist(puffy.deletedBy);
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });
});

describe("mongoose_delete with options: { deletedBy : true }, using option: typeKey", function () {
    var Test3Schema = new Schema({ name: String }, { collection: 'mongoose_delete_test3', typeKey: '$type' });
    Test3Schema.plugin(mongoose_delete, { deletedBy: true });
    var Test3 = mongoose.model('Test3a', Test3Schema);
    var puffy1 = new Test3({ name: 'Puffy1' });
    var puffy2 = new Test3({ name: 'Puffy2' });

    before(async function () {
        await puffy1.save();
        await puffy2.save();
    });

    after(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test3");
    });

    var id = new mongoose.Types.ObjectId("53da93b16b4a6670076b16bf");

    it("delete() -> should save `deletedBy` key", function () {
        return Test3.findOne({ name: 'Puffy1' })
            .then(function (puffy) {
                return puffy.delete(id);
            })
            .then(function (success) {
                success.deletedBy.should.equal(id);
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });

    it("deleteById() -> should save deletedBy key", function () {
        return Test3.deleteById(puffy2._id, id)
            .then(function () {
                return Test3.findOne({ name: 'Puffy2' });
            })
            .then(function (doc) {
                doc.deleted.should.equal(true);
                doc.deletedBy.toString().should.equal(id.toString());
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });

    it("restoreMany() -> should set deleted:false and delete 'deletedBy' key", function () {
        return Test3.restoreMany({ name: 'Puffy1' })
            .then(function () {
                return Test3.findOne({ name: 'Puffy1' });
            })
            .then(function (puffy) {
                puffy.deleted.should.equal(false);
                should.not.exist(puffy.deletedBy);
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });
});

describe("mongoose_delete with options: { deletedBy : true, deletedByType: String }", function () {
    var TestSchema = new Schema({ name: String }, { collection: 'mongoose_delete_test' });
    TestSchema.plugin(mongoose_delete, { deletedBy: true, deletedByType: String });
    var Test = mongoose.model('TestDeletedByType', TestSchema);
    var puffy1 = new Test({ name: 'Puffy1' });
    var puffy2 = new Test({ name: 'Puffy2' });

    before(async function () {
        await puffy1.save();
        await puffy2.save();
    });

    after(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test");
    });

    var id = "custom_user_id_12345678";

    it("delete() -> should save deletedBy key", function () {
        return Test.findOne({ name: 'Puffy1' })
            .then(function (puffy) {
                return puffy.delete(id);
            })
            .then(function (success) {
                success.deletedBy.should.equal(id);
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });

    it("deleteById() -> should save deletedBy key", function () {
        return Test.deleteById(puffy2._id, id)
            .then(function () {
                return Test.findOne({ name: 'Puffy2' });
            })
            .then(function (doc) {
                doc.deleted.should.equal(true);
                doc.deletedBy.should.equal(id);
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });

    it("restoreMany() -> should set deleted:false and delete 'deletedBy' key", function () {
        return Test.restoreMany({ name: 'Puffy1' })
            .then(function () {
                return Test.findOne({ name: 'Puffy1' });
            })
            .then(function (puffy) {
                puffy.deleted.should.equal(false);
                should.not.exist(puffy.deletedBy);
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });
});

describe("check not overridden static methods", function () {
    var TestSchema = new Schema({ name: String }, { collection: 'mongoose_delete_test' });
    TestSchema.plugin(mongoose_delete);
    var TestModel = mongoose.model('Test4', TestSchema);

    beforeEach(async function () {
        await TestModel.create([
            { name: 'Obi-Wan Kenobi', deleted: true },
            { name: 'Darth Vader' },
            { name: 'Luke Skywalker' }
        ]);
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test");
    });

    it("count() -> should return 3 documents", function () {
        return TestModel.count()
            .then(function (count) {
                count.should.equal(3);
            });
    });

    it("countDocuments() -> should return 3 documents", function () {
        return TestModel.countDocuments()
            .then(function (count) {
                count.should.equal(3);
            });
    });

    it("find() -> should return 3 documents", function () {
        return TestModel.find()
            .then(function (documents) {
                documents.length.should.equal(3);
            });
    });

    it("findOne() -> should return 1 deleted document", function () {
        return TestModel.findOne({ name: 'Obi-Wan Kenobi' })
            .then(function (doc) {
                expect(doc).not.to.be.null;
                doc.deleted.should.equal(true);
            });
    });

    it("findOneAndUpdate() -> should find and update deleted document", function () {
        return TestModel.findOneAndUpdate({ name: 'Obi-Wan Kenobi' }, { name: 'Obi-Wan Kenobi Test' }, { new: true })
            .then(function (doc) {
                expect(doc).not.to.be.null;
                doc.name.should.equal('Obi-Wan Kenobi Test');
            });
    });

    it("updateOne() -> should update deleted document", function () {
        return TestModel.updateOne({ name: 'Obi-Wan Kenobi' }, { name: 'Obi-Wan Kenobi Test' })
            .then(function (doc) {
                expect(doc).to.be.mongoose_ok();
                doc.modifiedCount.should.equal(1);
            });
    });

    it("updateOne() -> should find and update exists deleted document", function () {
        return TestModel.updateOne({ name: 'Obi-Wan Kenobi' }, { name: 'Obi-Wan Kenobi Test' }, { upsert: true })
            .then(function (doc) {
                expect(doc).to.be.mongoose_ok();
                expect(doc).to.be.mongoose_count(1);
            });
    });

    it("updateOne() -> should insert new document", function () {
        return TestModel.updateOne({ name: 'Obi-Wan Kenobi Upsert' }, { name: 'Obi-Wan Kenobi Upsert Test' }, { upsert: true })
            .then(function (doc) {
                expect(doc).to.be.mongoose_ok();

                expect(doc.upsertedId).not.to.be.null;
                expect(doc.upsertedId).not.to.be.undefined;
                doc.upsertedCount.should.equal(1);
            });
    });

    it("updateMany() -> should update deleted document", function () {
        return TestModel.updateMany({ name: 'Obi-Wan Kenobi' }, { name: 'Obi-Wan Kenobi Test' })
            .then(function (doc) {
                expect(doc).to.be.mongoose_ok();
                expect(doc).to.be.mongoose_count(1);
            });
    });
});

describe("check overridden static methods: { overrideMethods: 'all' }", function () {
    var TestSchema = new Schema({ name: String }, { collection: 'mongoose_delete_test' });
    TestSchema.plugin(mongoose_delete, { overrideMethods: 'all' });
    var TestModel = mongoose.model('Test5', TestSchema);

    beforeEach(async function () {
        await TestModel.create([
            { name: 'Obi-Wan Kenobi', deleted: true },
            { name: 'Darth Vader' },
            { name: 'Luke Skywalker', deleted: true }
        ]);
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test");
    });

    it("count() -> should return 1 document", function () {
        TestModel.count()
            .then(function (count) {
                count.should.equal(1);
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });

    it("countDocuments() -> should return 1 document", function () {
        TestModel.countDocuments()
            .then(function (count) {
                count.should.equal(1);
            });
    });

    it("countDeleted() -> should return 2 deleted documents", function () {
        TestModel.countDocuments({ deleted: true })
            .then(function (count) {
                count.should.equal(2);
            });
    });

    it("countDocumentsDeleted() -> should return 2 deleted documents", function () {
        return TestModel.countDocumentsDeleted()
            .then(function (count) {
                count.should.equal(2);
            });
    });

    it("countWithDeleted() -> should return 3 documents", function () {
        return TestModel.countWithDeleted()
            .then(function (count) {
                count.should.equal(3);
            });
    });

    it("countDocumentsWithDeleted() -> should return 3 documents", function () {
        return TestModel.countDocumentsWithDeleted()
            .then(function (count) {
                count.should.equal(3);
            });
    });

    it("find() -> should return 1 document", function () {
        return TestModel.find()
            .then(function (documents) {
                documents.length.should.equal(1);
            });
    });

    it("findDeleted() -> should return 2 documents", function () {
        return TestModel.findDeleted()
            .then(function (documents) {
                documents.length.should.equal(2);
            });
    });

    it("findWithDeleted() -> should return 3 documents", function () {
        return TestModel.findWithDeleted()
            .then(function (documents) {
                documents.length.should.equal(3);
            });
    });

    it("findOne() -> should not return 1 deleted document", function () {
        return TestModel.findOne({ name: 'Obi-Wan Kenobi' })
            .then(function (doc) {
                expect(doc).to.be.null;
            });
    });

    it("findOneDeleted() -> should return 1 deleted document", function () {
        return TestModel.findOneDeleted({ name: 'Obi-Wan Kenobi' })
            .then(function (doc) {
                expect(doc).not.to.be.null;
            });
    });

    it("findOneWithDeleted() -> should return 1 deleted document", function () {
        return TestModel.findOneWithDeleted({ name: 'Obi-Wan Kenobi' })
            .then(function (doc) {
                expect(doc).not.to.be.null;
            });
    });

    it("findOneWithDeleted() -> should return 1 not deleted document", function () {
        return TestModel.findOneWithDeleted({ name: 'Darth Vader' })
            .then(function (doc) {
                expect(doc).not.to.be.null;
            });
    });

    it("findOneAndUpdate() -> should not find and update deleted document", function () {
        return TestModel.findOneAndUpdate({ name: 'Obi-Wan Kenobi' }, { name: 'Obi-Wan Kenobi Test' }, { new: true })
            .then(function (doc) {
                expect(doc).to.be.null;
            });
    });

    it("findOneAndUpdateDeleted() -> should find and update deleted document", function () {
        return TestModel.findOneAndUpdateDeleted({ name: 'Obi-Wan Kenobi' }, { name: 'Obi-Wan Kenobi Test' }, { new: true })
            .then(function (doc) {
                expect(doc).not.to.be.null;
            });
    });

    it("findOneAndUpdateWithDeleted() -> should find and update deleted document", function () {
        return TestModel.findOneAndUpdateWithDeleted({ name: 'Obi-Wan Kenobi' }, { name: 'Obi-Wan Kenobi Test' }, { new: true })
            .then(function (doc) {
                expect(doc).not.to.be.null;
            });
    });

    it("findOneAndUpdateWithDeleted() -> should find and update not deleted document", function () {
        return TestModel.findOneAndUpdateWithDeleted({ name: 'Darth Vader' }, { name: 'Darth Vader Test' }, { new: true })
            .then(function (doc) {
                expect(doc).not.to.be.null;
            });
    });

    it("updateOne(conditions, update, options, callback) -> should not update first deleted document", function () {
        return TestModel.updateOne({ name: 'Luke Skywalker' }, { name: 'Luke Skywalker Test' }, {})
            .then(function (doc) {
                expect(doc).to.be.mongoose_ok();
                expect(doc).to.be.mongoose_count(0);
            });
    });

    it("updateOne(conditions, update, options, callback) -> should insert new document", function () {
        return TestModel.updateOne({ name: 'Luke Skywalker' }, { name: 'Luke Skywalker Test' }, { upsert: true })
            .then(function (doc) {
                expect(doc).to.be.mongoose_ok();
                expect(doc.upsertedId).not.to.be.null;
                expect(doc.upsertedId).not.to.be.undefined;
                doc.upsertedCount.should.equal(1);
            });
    });

    it("updateMany(conditions, update, options) -> should not update deleted documents", function () {
        return TestModel.updateMany({}, { name: 'Luke Skywalker Test' }, { multi: true })
            .exec()
            .then(function (doc) {
                expect(doc).to.be.mongoose_ok();
                expect(doc).to.be.mongoose_count(1);
            });
    });

    it("update(conditions, update, options) -> should not update deleted documents", function () {
        return TestModel.updateMany({}, { name: 'Luke Skywalker Test' })
            .then(function (doc) {
                expect(doc).to.be.mongoose_ok();
                expect(doc).to.be.mongoose_count(1);
            });
    });

    it("updateOne(conditions, update, options) -> should not update first deleted document", function () {
        return TestModel.updateOne({ name: 'Luke Skywalker' }, { name: 'Luke Skywalker Test' })
            .exec()
            .then(function (doc) {
                expect(doc).to.be.mongoose_ok();
                expect(doc).to.be.mongoose_count(0);
            });
    });

    it("updateOne(conditions, update, options) -> should insert new document", function () {
        return TestModel.updateOne({ name: 'Luke Skywalker' }, { name: 'Luke Skywalker Test' }, { upsert: true })
            .then(function (doc) {
                expect(doc).to.be.mongoose_ok();
                expect(doc.upsertedId).not.to.be.null;
                expect(doc.upsertedId).not.to.be.undefined;
                expect(doc.upsertedCount).to.equal(1);
            });
    });

    it("updateMany(conditions, update, options) -> should not update deleted documents", function () {
        return TestModel.updateMany({}, { name: 'Luke Skywalker Test' })
            .exec()
            .then(function (doc) {
                expect(doc).to.be.mongoose_ok();
                expect(doc).to.be.mongoose_count(1);
            });
    });

    it("updateOne(conditions, update, callback) -> should not update first deleted document", function () {
        return TestModel.updateOne({ name: 'Luke Skywalker' }, { name: 'Luke Skywalker Test' })
            .then(function (result) {
                expect(result).to.be.mongoose_ok();
                expect(result.modifiedCount).to.be.equal(0);
            });
    });

    it("updateMany(conditions, update, callback) -> should not update deleted documents", function () {
        return TestModel.updateMany({}, { name: 'Luke Skywalker Test' })
            .then(function (result) {
                expect(result).to.be.mongoose_ok();
                expect(result.modifiedCount).to.be.equal(1);
            });
    });


    it("update(conditions, update) -> should not update deleted documents", function () {
        return TestModel.updateMany({}, { name: 'Luke Skywalker Test' })
            .exec()
            .then(function (result) {
                expect(result).to.be.mongoose_ok();
                expect(result.modifiedCount).to.be.equal(1);
            });
    });

    it("updateOne(conditions, update) -> should not update first deleted document", function () {
        return TestModel.updateOne({ name: 'Luke Skywalker' }, { name: 'Luke Skywalker Test' })
            .then(function (result) {
                expect(result).to.be.mongoose_ok();
                expect(result.modifiedCount).to.be.equal(0);
            });
    });

    it("updateMany(conditions, update) -> should not update deleted documents", function () {
        return TestModel.updateMany({}, { name: 'Luke Skywalker Test' })
            .exec()
            .then(function (result) {
                expect(result).to.be.mongoose_ok();
                expect(result.modifiedCount).to.be.equal(1);
            });
    });

    it("updateOneDeleted(conditions, update, options, callback) -> should update first deleted document", function () {
        return TestModel.updateOneDeleted({ name: 'Luke Skywalker' }, { name: 'Luke Skywalker Test' }, { upsert: true })
            .then(function (result) {
                expect(result.upserted).to.be.undefined;
                expect(result).to.be.mongoose_ok();
                expect(result.modifiedCount).to.be.equal(1);
            });
    });

    it("updateManyDeleted() -> should update deleted document", function () {
        return TestModel.updateManyDeleted({}, { name: 'Test 123' }, { multi: true })
            .then(function (result) {
                expect(result).to.be.mongoose_ok();
                expect(result.modifiedCount).to.be.equal(2);
            });
    });

    it("updateOneWithDeleted(conditions, update, options, callback) -> should update first deleted document", function () {
        return TestModel.updateOneWithDeleted({ name: 'Luke Skywalker' }, { name: 'Luke Skywalker Test' })
            .then(function (result) {
                expect(result).to.be.mongoose_ok();
                expect(result.modifiedCount).to.be.equal(1);
            });
    });

    it("updateOneWithDeleted(conditions, update, options, callback) -> should update first deleted document", function () {
        return TestModel.updateOneWithDeleted({ name: 'Luke Skywalker' }, { name: 'Luke Skywalker Test' }, { upsert: true })
            .then(function (result) {
                expect(result.upserted).to.be.undefined;
                expect(result).to.be.mongoose_ok();
                expect(result.modifiedCount).to.be.equal(1);
            });
    });

    it("updateManyWithDeleted() -> should update all document", function () {
        return TestModel.updateManyWithDeleted({}, { name: 'Test 654' }, { multi: true })
            .then(function (result) {
                expect(result).to.be.mongoose_ok();
                expect(result.modifiedCount).to.be.equal(3);
            });
    });
});


describe("check the existence of override static methods: { overrideMethods: true }", function () {
    var TestSchema = new Schema({ name: String }, { collection: 'mongoose_delete_test' });
    TestSchema.plugin(mongoose_delete, { overrideMethods: true });
    var TestModel = mongoose.model('Test6', TestSchema);

    it("count() -> method should exist", function () {
        expect(TestModel.count).to.exist;
    });
    
    it("countDeleted() -> method should exist", function () {
        expect(TestModel.countDeleted).to.exist;
    });
    
    it("countWithDeleted() -> method should exist", function () {
        expect(TestModel.countWithDeleted).to.exist;
    });
    
    it("countDocuments() -> method should exist", function () {
        expect(TestModel.countDocuments).to.exist;
    });
    
    it("countDocumentsDeleted() -> method should exist", function () {
        expect(TestModel.countDocumentsDeleted).to.exist;
    });
    
    it("countDocumentsWithDeleted() -> method should exist", function () {
        expect(TestModel.countDocumentsWithDeleted).to.exist;
    });
    
    it("find() -> method should exist", function () {
        expect(TestModel.find).to.exist;
    });
    
    it("findDeleted() -> method should exist", function () {
        expect(TestModel.findDeleted).to.exist;
    });
    
    it("findWithDeleted() -> method should exist", function () {
        expect(TestModel.findWithDeleted).to.exist;
    });
    
    it("findOne() -> method should exist", function () {
        expect(TestModel.findOne).to.exist;
    });
    
    it("findOneDeleted() -> method should exist", function () {
        expect(TestModel.findOneDeleted).to.exist;
    });
    
    it("findOneWithDeleted() -> method should exist", function () {
        expect(TestModel.findOneWithDeleted).to.exist;
    });
    
    it("findOneAndUpdate() -> method should exist", function () {
        expect(TestModel.findOneAndUpdate).to.exist;
    });
    
    it("findOneAndUpdateDeleted() -> method should exist", function () {
        expect(TestModel.findOneAndUpdateDeleted).to.exist;
    });
    
    it("findOneAndUpdateWithDeleted() -> method should exist", function () {
        expect(TestModel.findOneAndUpdateWithDeleted).to.exist;
    });
    
    it("updateOne() -> method should exist", function () {
        expect(TestModel.updateOne).to.exist;
    });
    
    it("updateOneDeleted() -> method should exist", function () {
        expect(TestModel.updateOneDeleted).to.exist;
    });
    
    it("updateOneWithDeleted() -> method should exist", function () {
        expect(TestModel.updateOneWithDeleted).to.exist;
    });
    
    it("updateMany() -> method should exist", function () {
        expect(TestModel.updateMany).to.exist;
    });
    
    it("updateManyDeleted() -> method should exist", function () {
        expect(TestModel.updateManyDeleted).to.exist;
    });
    
    it("updateManyWithDeleted() -> method should exist", function () {
        expect(TestModel.updateManyWithDeleted).to.exist;
    });
    
});

describe("check the existence of override static methods: { overrideMethods: ['testError', 'count', 'countDocuments', 'find', 'findOne', 'findOneAndUpdate', 'update', 'updateOne', 'updateMany'] }", function () {
    var TestSchema = new Schema({ name: String }, { collection: 'mongoose_delete_test' });
    TestSchema.plugin(mongoose_delete, { overrideMethods: ['testError', 'count', 'countDocuments', 'find', 'findOne', 'findOneAndUpdate', 'update', 'updateOne', 'updateMany'] });
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
    var TestSchema = new Schema({ name: String }, { collection: 'mongoose_delete_test' });
    TestSchema.plugin(mongoose_delete, { overrideMethods: ['count', 'countDocuments', 'find'] });
    var TestModel = mongoose.model('Test8', TestSchema);

    it("testError() -> method should not exist", function () {
        expect(TestModel.testError).to.not.exist;
    });
    
    it("count() -> method should exist", function () {
        expect(TestModel.count).to.exist;
    });
    
    it("countDeleted() -> method should exist", function () {
        expect(TestModel.countDeleted).to.exist;
    });
    
    it("countWithDeleted() -> method should exist", function () {
        expect(TestModel.countWithDeleted).to.exist;
    });
    
    it("countDocuments() -> method should exist", function () {
        expect(TestModel.countDocuments).to.exist;
    });
    
    it("countDocumentsDeleted() -> method should exist", function () {
        expect(TestModel.countDocumentsDeleted).to.exist;
    });
    
    it("countDocumentsWithDeleted() -> method should exist", function () {
        expect(TestModel.countDocumentsWithDeleted).to.exist;
    });
    
    it("find() -> method should exist", function () {
        expect(TestModel.find).to.exist;
    });
    
    it("findDeleted() -> method should exist", function () {
        expect(TestModel.findDeleted).to.exist;
    });
    
    it("findWithDeleted() -> method should exist", function () {
        expect(TestModel.findWithDeleted).to.exist;
    });
    
    it("findOne() -> method should exist", function () {
        expect(TestModel.findOne).to.exist;
    });
    
    it("findOneDeleted() -> method should not exist", function () {
        expect(TestModel.findOneDeleted).to.not.exist;
    });
    
    it("findOneWithDeleted() -> method should not exist", function () {
        expect(TestModel.findOneWithDeleted).to.not.exist;
    });
    
    it("findOneAndUpdate() -> method should exist", function () {
        expect(TestModel.findOneAndUpdate).to.exist;
    });
    
    it("findOneAndUpdateDeleted() -> method should not exist", function () {
        expect(TestModel.findOneAndUpdateDeleted).to.not.exist;
    });
    
    it("findOneAndUpdateWithDeleted() -> method should not exist", function () {
        expect(TestModel.findOneAndUpdateWithDeleted).to.not.exist;
    });
    
    it("updateOne() -> method should exist", function () {
        expect(TestModel.updateOne).to.exist;
    });
    
    it("updateOneDeleted() -> method should not exist", function () {
        expect(TestModel.updateOneDeleted).to.not.exist;
    });
    
    it("updateOneWithDeleted() -> method should not exist", function () {
        expect(TestModel.updateOneWithDeleted).to.not.exist;
    });
    
    it("updateMany() -> method should exist", function () {
        expect(TestModel.updateMany).to.exist;
    });
    
    it("updateManyDeleted() -> method should not exist", function () {
        expect(TestModel.updateManyDeleted).to.not.exist;
    });
    
    it("updateManyWithDeleted() -> method should not exist", function () {
        expect(TestModel.updateManyWithDeleted).to.not.exist;
    });
});

describe("delete multiple documents", function () {
    var TestSchema = new Schema({ name: String, side: Number }, { collection: 'mongoose_delete_test' });
    TestSchema.plugin(mongoose_delete, { overrideMethods: 'all', deletedAt: true, deletedBy: true });
    var TestModel = mongoose.model('Test14', TestSchema);

    beforeEach(async function () {
        await TestModel.create(
            [
                { name: 'Obi-Wan Kenobi', side: 0 },
                { name: 'Darth Vader', side: 1 },
                { name: 'Luke Skywalker', side: 0 }
            ]);
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test");
    });

    it("deleteMany() -> delete all documents", function () {
        return TestModel.deleteMany({})
            .exec()
            .then(function (result) {
                expect(result).to.be.mongoose_ok();
                expect(result).to.be.mongoose_count(3);
            });
    });

    it("deleteMany(query) -> delete multiple documents with conditions", function () {
        return TestModel.deleteMany({ side: 0 })
            .exec()
            .then(function (result) {
                expect(result).to.be.mongoose_ok();
                expect(result).to.be.mongoose_count(2);
            });
    });

    it("deleteMany(query, deletedBy) -> delete multiple documents with conditions and user ID", function () {
        var userId = new mongoose.Types.ObjectId("53da93b16b4a6670076b16bf");

        return TestModel.deleteMany({ side: 1 }, userId)
            .exec()
            .then(function (result) {
                expect(result).to.be.mongoose_count(1);
                expect(result).to.be.mongoose_ok();
            });
    });

    it("deleteMany({}, deletedBy) -> delete all documents passing user ID", function () {
        var userId = new mongoose.Types.ObjectId("53da93b16b4a6670076b16bf");

        return TestModel.deleteMany({}, userId)
            .exec()
            .then(function (result) {
                expect(result).to.be.mongoose_count(3);
                expect(result).to.be.mongoose_ok();
            });
    });
});

describe("delete multiple documents aaa", function () {
    var TestSchema = new Schema({ name: String, side: Number }, { collection: 'mongoose_delete_test' });
    TestSchema.plugin(mongoose_delete);
    var TestModel = mongoose.model('Test13', TestSchema);

    beforeEach(async function () {
        await TestModel.create(
            [
                { name: 'Obi-Wan Kenobi', side: 0 },
                { name: 'Darth Vader', side: 1 },
                { name: 'Luke Skywalker', side: 0 }
            ]);
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test");
    });

    it("deleteMany() -> delete multiple documents", function () {
        return TestModel.deleteMany()
            .exec()
            .then(function (result) {
                expect(result).to.be.mongoose_ok();
                expect(result).to.be.mongoose_count(3);
                expect(result.modifiedCount).to.equal(3);
            });
    });
});

describe("restoreMany multiple documents bbb", function () {
    var TestSchema = new Schema({ name: String, side: Number }, { collection: 'mongoose_restore_test' });
    TestSchema.plugin(mongoose_delete, { overrideMethods: 'all', deletedAt: true, deletedBy: true });
    var TestModel = mongoose.model('Test15', TestSchema);

    beforeEach(async function () {
        await TestModel.create([
            { name: 'Obi-Wan Kenobi', side: 0 },
            { name: 'Darth Vader', side: 1, deleted: true },
            { name: 'Luke Skywalker', side: 0, deleted: true }
        ]);
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_restore_test");
    });

    it("restoreMany() -> restore all documents", function () {
        return TestModel.restoreMany({})
            .exec()
            .then(function (result) {
                expect(result).to.be.mongoose_ok();
                expect(result).to.be.mongoose_count(3);
            });
    });

    it("restoreMany(query) -> restore multiple documents with conditions", function () {
        return TestModel.restoreMany({ side: 0 })
            .exec()
            .then(function (result) {
                expect(result).to.be.mongoose_ok();
                expect(result).to.be.mongoose_count(2);
            });
    });
});

describe("restore multiple documents aaa", function () {
    var TestSchema = new Schema({ name: String, side: Number }, { collection: 'mongoose_restore_test' });
    TestSchema.plugin(mongoose_delete);
    var TestModel = mongoose.model('Test16', TestSchema);

    beforeEach(async function () {
        await TestModel.create([
            { name: 'Obi-Wan Kenobi', side: 0 },
            { name: 'Darth Vader', side: 1, deleted: true },
            { name: 'Luke Skywalker', side: 0 }
        ]);
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_restore_test");
    });

    it("restoreMany() -> restore all documents", function () {
        return TestModel.restoreMany({})
            .exec()
            .then(function (result) {
                expect(result).to.be.mongoose_ok();
                expect(result).to.be.mongoose_count(3);
            });
    });
});

describe("model validation on delete (default): { validateBeforeDelete: true }", function () {
    var TestSchema = new Schema({
        name: { type: String, required: true }
    }, { collection: 'mongoose_restore_test' });
    TestSchema.plugin(mongoose_delete);
    var TestModel = mongoose.model('Test17', TestSchema);

    beforeEach(async function () {
        await TestModel.create([
            { name: 'Luke Skywalker' }
        ]);
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_restore_test");
    });

    it("delete() -> should raise ValidationError error", function () {
        return TestModel.findOne({ name: 'Luke Skywalker' })
            .exec()
            .then(function (luke) {
                luke.name = "";
                return luke.delete();
            })
            .catch(function (err) {
                expect(err).to.exist;
                expect(err.name).to.exist;
                expect(err.name).to.equal('ValidationError');
            });
    });

    it("delete() -> should not raise ValidationError error", function () {
        return TestModel.findOne({ name: 'Luke Skywalker' })
            .exec()
            .then(function (luke) {
                luke.name = "Test Name";
                return luke.delete();
            })
            .then(function () {
                // No need for assertions here since the purpose is to ensure no ValidationError is raised
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });
});

describe("model validation on delete: { validateBeforeDelete: false }", function () {
    var TestSchema = new Schema({
        name: { type: String, required: true }
    }, { collection: 'mongoose_restore_test' });
    TestSchema.plugin(mongoose_delete, { validateBeforeDelete: false });
    var TestModel = mongoose.model('Test18', TestSchema);

    beforeEach(async function () {
        await TestModel.create([
            { name: 'Luke Skywalker' }
        ]);
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_restore_test");
    });

    it("delete() -> should not raise ValidationError error", function () {
        return TestModel.findOne({ name: 'Luke Skywalker' })
            .exec()
            .then(function (luke) {
                luke.name = "";
                return luke.delete();
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });

    it("delete() -> should not raise ValidationError error", function () {
        return TestModel.findOne({ name: 'Luke Skywalker' })
            .exec()
            .then(function (luke) {
                luke.name = "Test Name";
                return luke.delete();
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });
});

describe("mongoose_delete indexFields options", function () {
    it("all fields must have index: { indexFields: true }", function () {
        var TestSchema = new Schema({ name: String }, { collection: 'mongoose_delete_test_indexFields' });
        TestSchema.plugin(mongoose_delete, { indexFields: true, deletedAt: true, deletedBy: true });
        var Test0 = mongoose.model('Test0_indexFields', TestSchema);

        expect(Test0.schema.paths.deleted._index).to.be.true;
        expect(Test0.schema.paths.deletedAt._index).to.be.true;
        expect(Test0.schema.paths.deletedBy._index).to.be.true;
    });

    it("all fields must have index: { indexFields: 'all' }", function () {
        var TestSchema = new Schema({ name: String }, { collection: 'mongoose_delete_test_indexFields' });
        TestSchema.plugin(mongoose_delete, { indexFields: 'all', deletedAt: true, deletedBy: true });
        var Test0 = mongoose.model('Test1_indexFields', TestSchema);

        expect(Test0.schema.paths.deleted._index).to.be.true;
        expect(Test0.schema.paths.deletedAt._index).to.be.true;
        expect(Test0.schema.paths.deletedBy._index).to.be.true;
    });

    it("only 'deleted' field must have index: { indexFields: ['deleted'] }", function () {
        var TestSchema = new Schema({ name: String }, { collection: 'mongoose_delete_test_indexFields' });
        TestSchema.plugin(mongoose_delete, { indexFields: ['deleted'], deletedAt: true, deletedBy: true });
        var Test0 = mongoose.model('Test2_indexFields', TestSchema);

        expect(Test0.schema.paths.deletedAt._index).to.be.false;
        expect(Test0.schema.paths.deletedBy._index).to.be.false;
        expect(Test0.schema.paths.deleted._index).to.be.true;
    });

    it("only 'deletedAt' and 'deletedBy' fields must have index: { indexFields: ['deletedAt', 'deletedBy'] }", function () {
        var TestSchema = new Schema({ name: String }, { collection: 'mongoose_delete_test_indexFields' });
        TestSchema.plugin(mongoose_delete, { indexFields: ['deletedAt', 'deletedBy'], deletedAt: true, deletedBy: true });
        var Test0 = mongoose.model('Test3_indexFields', TestSchema);

        expect(Test0.schema.paths.deleted._index).to.be.false;
        expect(Test0.schema.paths.deletedAt._index).to.be.true;
        expect(Test0.schema.paths.deletedBy._index).to.be.true;
    });
});

describe("check usage of $ne operator", function () {
    var TestRawSchema = new Schema({ name: String, deleted: Boolean }, { collection: 'mongoose_delete_test_ne' });
    var TestRawModel = mongoose.model('TestNeRaw', TestRawSchema);

    var TestSchema = new Schema({ name: String }, { collection: 'mongoose_delete_test_ne' });
    TestSchema.plugin(mongoose_delete, { overrideMethods: 'all', use$neOperator: false });
    var TestModel = mongoose.model('Test55', TestSchema);

    before(async function () {
        await TestRawModel.create(
            [
                { name: 'One' },
                { name: 'Two', deleted: true },
                { name: 'Three', deleted: false }
            ]);
    });

    after(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test_ne");
    });

    it("count() -> should return 1 documents", function () {
        return TestModel.countDocuments()
            .then(function (count) {
                expect(count).to.equal(1);
            });
    });

    it("countDeleted() -> should return 1 deleted documents", function () {
        return TestModel.countDocuments({ deleted: true })
            .then(function (count) {
                expect(count).to.equal(1);
            });
    });

    it("find() -> should return 1 documents", function () {
        return TestModel.find()
            .then(function (documents) {
                expect(documents.length).to.equal(1);
            });
    });

    it("findDeleted() -> should return 1 documents", function () {
        return TestModel.find({ deleted: true })
            .then(function (documents) {
                expect(documents.length).to.equal(1);
            });
    });
});

describe("aggregate methods: { overrideMethods: ['aggregate'] }", function () {
    var TestSchema = new Schema({ name: String }, { collection: 'mongoose_delete_test_aggregate' });
    TestSchema.plugin(mongoose_delete, { overrideMethods: ['aggregate'] });

    var TestModel = mongoose.model('Test5_Aggregate', TestSchema);

    beforeEach(async function () {
        await TestModel.create([
            { name: 'Obi-Wan Kenobi', deleted: true },
            { name: 'Darth Vader' },
            { name: 'Luke Skywalker', deleted: true }
        ]);
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test_aggregate");
    });

    it("aggregate([{$project : {name : 1} }]) -> should return 1 document", function () {
        return TestModel.aggregate([
            {
                $project: { name: 1 }
            }
        ])
            .exec()
            .then(function (documents) {
                expect(documents.length).to.equal(1);
            });
    });

    it("aggregate([{$project : {name : 1} }]) -> should return 1 document (pipeline)", function () {
        return TestModel.aggregate()
            .project({ name: 1 })
            .exec()
            .then(function (documents) {
                expect(documents.length).to.equal(1);
            });
    });

    it("aggregateDeleted([{$project : {name : 1} }]) -> should return deleted documents", function () {
        return TestModel.aggregateDeleted([
            {
                $match: { deleted: true }
            },
            {
                $project: { name: 1 }
            }
        ])
            .exec()
            .then(function (documents) {
                expect(documents.length).to.equal(2);
            });
    });

    it("aggregateDeleted([{$project : {name : 1} }]) -> should return deleted documents (pipeline)", function () {
        return TestModel.aggregateDeleted()
            .match({ deleted: true })
            .project({ name: 1 })
            .exec()
            .then(function (documents) {
                expect(documents.length).to.equal(2);
            });
    });

    it("aggregateWithDeleted([{$project : {name : 1} }]) -> should return deleted documents", function () {
        return TestModel.aggregateWithDeleted([
            {
                $project: { name: 1 }
            }
        ])
            .exec()
            .then(function (documents) {
                expect(documents.length).to.equal(3);
            });
    });

    it("aggregateWithDeleted([{$project : {name : 1} }]) -> should return deleted documents (pipeline)", function () {
        return TestModel.aggregateWithDeleted()
            .project({ name: 1 })
            .exec()
            .then(function (documents) {
                expect(documents.length).to.equal(3);
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

    beforeEach(async function () {
        await TestPopulate1.create([
            { name: 'Obi-Wan Kenobi', _id: new ObjectId("53da93b16b4a6670076b16b1"), deleted: true },
            { name: 'Darth Vader', _id: new ObjectId("53da93b16b4a6670076b16b2") },
            { name: 'Luke Skywalker', _id: new ObjectId("53da93b16b4a6670076b16b3"), deleted: true }
        ])
        await TestPopulate2.create([
            { name: 'Student 1', test: new ObjectId("53da93b16b4a6670076b16b1") },
            { name: 'Student 2', test: new ObjectId("53da93b16b4a6670076b16b2") },
            { name: 'Student 3', test: new ObjectId("53da93b16b4a6670076b16b3"), deleted: true }
        ]);
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("TestPopulate1");
        await mongoose.connection.db.dropCollection("TestPopulate2");
    });

    it("populate() -> should not return deleted sub-document", async function () {
        await TestPopulate2
            .findOne({ name: 'Student 1' })
            .populate({ path: 'test' })
            .exec()
            .then(function (document) {
                expect(document.test).to.be.null;
            })
            .catch(function (err) {
                should.not.exist(err);
            });
    });

    it("populate() -> should return the deleted sub-document using { withDeleted: true }", function () {
        return TestPopulate2
            .findOne({ name: 'Student 1' })
            .populate({ path: 'test', options: { withDeleted: true } })
            .exec()
            .then(function (document) {
                expect(document.test).not.to.be.null;
                expect(document.test.deleted).to.equal(true);
            });
    });

    it("populate() -> should not return deleted documents and sub-documents", function () {
        return TestPopulate2
            .find({})
            .populate({ path: 'test' })
            .exec()
            .then(function (documents) {
                var student1 = documents.findIndex(function (i) { return i.name === "Student 1" });
                var student2 = documents.findIndex(function (i) { return i.name === "Student 2" });

                expect(documents.length).to.equal(2);
                expect(documents[student1].test).to.be.null;
                expect(documents[student2].test).not.to.be.null;
            });
    });

    it("populate() -> should return deleted documents and sub-documents", function () {
        return TestPopulate2
            .findWithDeleted()
            .populate({ path: 'test', options: { withDeleted: true } })
            .exec()
            .then(function (documents) {
                expect(documents.length).to.equal(3);

                var student1 = documents.findIndex(function (i) { return i.name === "Student 1" });
                var student2 = documents.findIndex(function (i) { return i.name === "Student 2" });
                var student3 = documents.findIndex(function (i) { return i.name === "Student 3" });

                expect(documents[student1].test).not.to.be.null;
                expect(documents[student2].test).not.to.be.null;
                expect(documents[student3].test).not.to.be.null;
            });
    });
});
