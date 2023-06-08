var chai = require('chai'),
    should = chai.should(),
    expect = chai.expect,
    mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var mongoose_delete = require('../');

var mongooseMajorVersion = +mongoose.version[0]; // 4, 5, 6...

console.log(`> mongoose: ${mongooseMajorVersion}`);

if (mongooseMajorVersion < 7) {
    mongoose.set('strictQuery', true);
}

if (mongooseMajorVersion === 5) {
    mongoose.set('useCreateIndex', true);
    mongoose.set('useFindAndModify', false);
}

function getNewObjectId(value) {
    if (mongooseMajorVersion > 6) {
        return new mongoose.Types.ObjectId(value);
    }
    return mongoose.Types.ObjectId(value);
}

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

before(async function () {
    await mongoose.connect(process.env.MONGOOSE_TEST_URI || 'mongodb://localhost/test', {useNewUrlParser: true, useUnifiedTopology: true});
});

after(async function () {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
});

describe("mongoose_delete delete method without callback function", function () {
    var Test1Schema = new Schema({name: String}, {collection: 'mongoose_delete_test0'});
    Test1Schema.plugin(mongoose_delete);
    var Test0 = mongoose.model('Test0', Test1Schema);

    before(async function () {
        var puffy = new Test0({name: 'Puffy'});
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

    var Test1Schema = new Schema({name: String}, {collection: 'mongoose_delete_test1'});
    Test1Schema.plugin(mongoose_delete);
    var Test1 = mongoose.model('Test1', Test1Schema);

    var puffy1 = null;
    var puffy2 = null;

    beforeEach(async function () {
        const created = await Test1.create(
          [
              { name: 'Puffy1'},
              { name: 'Puffy2'}
          ]
        );

        puffy1 = { ...created[0]._doc };
        puffy2 = { ...created[1]._doc };
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test1");
    });

    it("delete() -> should set deleted:true", async function () {
        try {
            const puffy = await Test1.findOne({ name: 'Puffy1' });
            const success = await puffy.delete();
            success.deleted.should.equal(true);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("delete() -> should not save 'deletedAt' value", async function () {
        try {
            const puffy = await Test1.findOne({ name: 'Puffy1' });
            const success = await puffy.delete();
            should.not.exist(success.deletedAt);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("deleteById() -> should set deleted:true and not save 'deletedAt'", async function () {
        try {
            const documents = await Test1.deleteById(puffy2._id);
            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(1);

            const doc = await Test1.findOne({ name: 'Puffy2' });
            doc.deleted.should.equal(true);
            should.not.exist(doc.deletedAt);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("deleteById() -> should throw an exception: first argument error", async function () {
        try {
            await Test1.deleteById()
        } catch (error) {
            expect(error.message).to.equal('First argument is mandatory and must not be a function.');
        }
    });

    it("restoreMany() -> should set deleted:false", async function () {
        try {
            await Test1.restore({ name: 'Puffy1' });
            const puffy = await Test1.findOne({ name: 'Puffy1' });

            puffy.deleted.should.equal(false);
            should.not.exist(puffy.deletedBy);
        } catch (e) {
            should.not.exist(e);
        }
    });
});

describe("mongoose_delete plugin without options, using option: typeKey", function () {
    var Test1Schema = new Schema({name: String}, {collection: 'mongoose_delete_test1', typeKey: '$type'});
    Test1Schema.plugin(mongoose_delete);
    var Test1 = mongoose.model('Test1a', Test1Schema);

    var puffy1 = null;
    var puffy2 = null;

    beforeEach(async function () {
        const created = await Test1.create(
          [
              { name: 'Puffy1' },
              { name: 'Puffy2' },
              { name: 'Puffy3', deleted: true }
          ]
        );

        puffy1 = { ...created[0]._doc };
        puffy2 = { ...created[1]._doc };
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test1");
    });

    it("delete() -> should set deleted:true", async function () {
        try {
            const puffy = await Test1.findOne({ name: 'Puffy1' });
            const success = await puffy.delete();
            success.deleted.should.equal(true);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("delete() -> should not save 'deletedAt' value", async function () {
        try {
            const puffy = await Test1.findOne({name: 'Puffy1'});
            const success = await puffy.delete();
            should.not.exist(success.deletedAt);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("deleteById() -> should set deleted:true and not save 'deletedAt'", async function () {
        try {
            const documents = await Test1.deleteById(puffy2._id)
            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(1);

            const doc = await Test1.findOne({name: 'Puffy2'});
            doc.deleted.should.equal(true);
            should.not.exist(doc.deletedAt);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("restore() -> should set deleted:false", async function () {
        try {
            const puffy = await Test1.findOne({ name: 'Puffy3' });
            const success = await puffy.restore();

            success.deleted.should.equal(false);
        } catch (err) {
            should.not.exist(err);
        }
    });
});

describe("mongoose_delete with options: { deletedAt : true }", function () {
    var Test2Schema = new Schema({name: String}, {collection: 'mongoose_delete_test2'});
    Test2Schema.plugin(mongoose_delete, { deletedAt: true });
    var Test2 = mongoose.model('Test2', Test2Schema);

    var puffy1 = null;
    var puffy2 = null;

    beforeEach(async function () {
        const created = await Test2.create(
          [
              { name: 'Puffy1' },
              { name: 'Puffy2' },
              { name: 'Puffy3', deleted: true }
          ]
        );

        puffy1 = { ...created[0]._doc };
        puffy2 = { ...created[1]._doc };
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test2");
    });

    it("delete() -> should save 'deletedAt' key", async function () {
        try {
            const puffy = await Test2.findOne({name: 'Puffy1'});
            const success = await puffy.delete();
            should.exist(success.deletedAt);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("deleteById() -> should save 'deletedAt' key", async function () {
        try {
            const documents = await Test2.deleteById(puffy2._id);

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(1);

            const doc = await Test2.findOne({name: 'Puffy2'})
            doc.deleted.should.equal(true);
            should.exist(doc.deletedAt);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("restore() -> should set deleted:false and delete deletedAt key", async function () {
        try {
            const puffy = await Test2.findOne({ name: 'Puffy3' });
            const success = await puffy.restore();
            success.deleted.should.equal(false);
            should.not.exist(success.deletedAt);
        } catch (err) {
            should.not.exist(err);
        }
    });
});

describe("mongoose_delete with options: { deletedAt : true }, using option: typeKey", function () {
    var Test2Schema = new Schema({name: String}, {collection: 'mongoose_delete_test2', typeKey: '$type'});
    Test2Schema.plugin(mongoose_delete, {deletedAt: true});
    var Test2 = mongoose.model('Test2a', Test2Schema);

    var puffy1 = null;
    var puffy2 = null;

    beforeEach(async function () {
        const created = await Test2.create(
          [
              { name: 'Puffy1' },
              { name: 'Puffy2' },
              { name: 'Puffy3', deleted: true }
          ]
        );

        puffy1 = { ...created[0]._doc };
        puffy2 = { ...created[1]._doc };
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test2");
    });

    it("delete() -> should save 'deletedAt' key", async function () {
        try {
            const puffy = await Test2.findOne({name: 'Puffy1'});
            const success = await puffy.delete();
            should.exist(success.deletedAt);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("deleteById() -> should save 'deletedAt' key", async function () {
        try {
            const documents = await Test2.deleteById(puffy2._id);

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(1);

            const doc = await Test2.findOne({name: 'Puffy2'});
            doc.deleted.should.equal(true);
            should.exist(doc.deletedAt);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("restore() -> should set deleted:false and delete deletedAt key", async function () {
        try {
            const puffy = await Test2.findOne({name: 'Puffy1'});
            const success = await puffy.restore();
            success.deleted.should.equal(false);
            should.not.exist(success.deletedAt);
        } catch (err) {
            should.not.exist(err);
        }
    });
});

describe("mongoose_delete with options: { deletedBy : true }", function () {

    var Test3Schema = new Schema({name: String}, {collection: 'mongoose_delete_test3'});
    Test3Schema.plugin(mongoose_delete, { deletedBy: true });
    var Test3 = mongoose.model('Test3', Test3Schema);

    var puffy1 = null;
    var puffy2 = null;

    beforeEach(async function () {
        const created = await Test3.create(
          [
              { name: 'Puffy1' },
              { name: 'Puffy2' },
              { name: 'Puffy3', deleted: true, deletedBy: "53da93b16b4a6670076b16bf" }
          ]
        );

        puffy1 = { ...created[0]._doc };
        puffy2 = { ...created[1]._doc };
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test3");
    });

    var userId = getNewObjectId("53da93b16b4a6670076b16bf");

    it("delete() -> should save 'deletedBy' key", async function () {
        try {
            const puffy = await Test3.findOne({ name: 'Puffy1' });
            const success = await puffy.delete(userId);
            success.deletedBy.should.equal(userId);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("deleteById() -> should save `deletedBy` key", async function () {
        try {
            const documents = await Test3.deleteById(puffy2._id, userId)

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(1);

            const doc = await Test3.findOne({name: 'Puffy2'});
            doc.deleted.should.equal(true);
            doc.deletedBy.toString().should.equal(userId.toString());
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("restore() -> should set deleted:false and delete `deletedBy` key", async function () {
        try {
            const puffy = await Test3.findOne({ name: 'Puffy3' });
            const success = await puffy.restore();
            success.deleted.should.equal(false);
            should.not.exist(success.deletedBy);
        } catch (err) {
            should.not.exist(err);
        }
    });
});

describe("mongoose_delete with options: { deletedBy : true }, using option: typeKey", function () {

    var Test3Schema = new Schema({name: String}, {collection: 'mongoose_delete_test3', typeKey: '$type'});
    Test3Schema.plugin(mongoose_delete, {deletedBy: true});
    var Test3 = mongoose.model('Test3a', Test3Schema);

    var puffy1 = null;
    var puffy2 = null;

    beforeEach(async function () {
        const created = await Test3.create(
          [
              { name: 'Puffy1' },
              { name: 'Puffy2' },
              { name: 'Puffy3', deleted: true, deletedBy: "53da93b16b4a6670076b16bf" }
          ]
        );

        puffy1 = { ...created[0]._doc };
        puffy2 = { ...created[1]._doc };
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test3");
    });

    var userId = getNewObjectId("53da93b16b4a6670076b16bf")

    it("delete() -> should save `deletedBy` key", async function () {
        try {
            const puffy = await Test3.findOne({name: 'Puffy1'});
            const success = await puffy.delete(userId);
            success.deletedBy.should.equal(userId);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("deleteById() -> should save deletedBy key", async function () {
        try {
            const documents = await Test3.deleteById(puffy2._id, userId);

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(1);

            const doc = await Test3.findOne({name: 'Puffy2'});
            doc.deleted.should.equal(true);
            doc.deletedBy.toString().should.equal(userId.toString());
        } catch (err) {

        }
    });

    it("restore() -> should set deleted:false and delete deletedBy key", async function () {
        try {
            const puffy = await Test3.findOne({name: 'Puffy3'});
            const success = await puffy.restore();
            success.deleted.should.equal(false);
            should.not.exist(success.deletedBy);
        } catch (err) {
            should.not.exist(err);
        }
    });
});

describe("mongoose_delete with options: { deletedBy : true, deletedByType: String }", function () {

    var TestSchema = new Schema({name: String}, {collection: 'mongoose_delete_test'});
    TestSchema.plugin(mongoose_delete, { deletedBy: true, deletedByType: String });
    var Test = mongoose.model('TestDeletedByType', TestSchema);

    var puffy1 = null;
    var puffy2 = null;

    beforeEach(async function () {
        const created = await Test.create(
          [
              { name: 'Puffy1' },
              { name: 'Puffy2' },
              { name: 'Puffy3', deleted: true, deletedBy: "custom_user_id_12345678" }
          ]
        );

        puffy1 = { ...created[0]._doc };
        puffy2 = { ...created[1]._doc };
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test");
    });

    var userIdCustom = "custom_user_id_12345678";

    it("delete() -> should save deletedBy key", async function () {
        try {
            const puffy = await Test.findOne({name: 'Puffy1'});
            const success = await puffy.delete(userIdCustom);
            success.deletedBy.should.equal(userIdCustom);
        } catch (err) {
            console.log(err);
            should.not.exist(err);
        }
    });

    it("deleteById() -> should save deletedBy key", async function () {
        try {
            const documents = await Test.deleteById(puffy2._id, userIdCustom)
            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(1);

            const doc = await Test.findOne({name: 'Puffy2'});
            doc.deleted.should.equal(true);
            doc.deletedBy.should.equal(userIdCustom);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("restore() -> should set deleted:false and delete deletedBy key", async function () {
        try {
            const puffy = await Test.findOne({ name: 'Puffy3' });
            const success = await puffy.restore();
            success.deleted.should.equal(false);
            should.not.exist(success.deletedBy);
        } catch (err) {
            should.not.exist(err);
        }
    });
});

describe("check not overridden static methods", function () {
    var TestSchema = new Schema({name: String}, { collection: 'mongoose_delete_test' });
    TestSchema.plugin(mongoose_delete);
    var TestModel = mongoose.model('Test4', TestSchema);

    beforeEach(async function () {
        await TestModel.create(
          [
              { name: 'Obi-Wan Kenobi', deleted: true },
              { name: 'Darth Vader'},
              { name: 'Luke Skywalker'}
          ]
        );
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test");
    });

    it("count() -> should return 3 documents", async function () {
        try {
            const count = await TestModel.count();
            count.should.equal(3);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("countDocuments() -> should return 3 documents", async function () {
        try {
            const count = await TestModel.countDocuments();
            count.should.equal(3);
        } catch (err) {
            should.not.exist(err);
        }
    });


    it("find() -> should return 3 documents", async function () {
        try {
            const documents = await TestModel.find();
            documents.length.should.equal(3);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("findOne() -> should return 1 deleted document", async function () {
        try {
            const doc = await TestModel.findOne({name: 'Obi-Wan Kenobi'});
            expect(doc).not.to.be.null;
            doc.deleted.should.equal(true);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("findOneAndUpdate() -> should find and update deleted document", async function () {
        try {
            const doc = await TestModel.findOneAndUpdate({name: 'Obi-Wan Kenobi'}, {name: 'Obi-Wan Kenobi Test'}, {new: true})
            expect(doc).not.to.be.null;
            doc.name.should.equal('Obi-Wan Kenobi Test');
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("updateOne() -> should find and update deleted document", async function () {
        try {
            const doc = await TestModel.updateOne({name: 'Obi-Wan Kenobi'}, {name: 'Obi-Wan Kenobi Test'}, {});
            expect(doc).to.be.mongoose_ok();
            expect(doc).to.be.mongoose_count(1);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("updateOne() -> should find and update not deleted document", async function () {
        try {
            const doc = await TestModel.updateOne({name: 'Darth Vader'}, {name: 'Darth Vader Test'});
            expect(doc).to.be.mongoose_ok();
            expect(doc).to.be.mongoose_count(1);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("updateOne() -> should insert new document", async function () {
        try {
            const doc = await TestModel.updateOne({name: 'Obi-Wan Kenobi Upsert'}, {name: 'Obi-Wan Kenobi Upsert Test'}, { upsert: true })

            expect(doc).to.be.mongoose_ok();

            if (mongooseMajorVersion >= 6) {
                expect(doc.upsertedId).not.to.be.null;
                expect(doc.upsertedId).not.to.be.undefined;

                doc.upsertedCount.should.equal(1);
            } else {
                expect(doc.upserted).not.to.be.null;
                expect(doc.upserted).not.to.be.undefined;

                expect(doc).to.be.mongoose_count(1);
            }
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("updateMany() -> should update deleted document", async function () {
        try {
            const doc = await TestModel.updateMany({name: 'Obi-Wan Kenobi'}, {name: 'Obi-Wan Kenobi Test'});
            expect(doc).to.be.mongoose_ok();
            expect(doc).to.be.mongoose_count(1);
        } catch (err) {
            should.not.exist(err);
        }
    });
});

describe("check overridden static methods: { overrideMethods: 'all' }", function () {
    var TestSchema = new Schema({name: String}, {collection: 'mongoose_delete_test'});
    TestSchema.plugin(mongoose_delete, {overrideMethods: 'all'});
    var TestModel = mongoose.model('Test5', TestSchema);

    beforeEach(async function () {
        await TestModel.create(
          [
              {name: 'Obi-Wan Kenobi', deleted: true},
              {name: 'Darth Vader'},
              {name: 'Luke Skywalker', deleted: true}
          ]);
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test");
    });

    it("countDocuments() -> should return 1 documents", async function () {
        try {
            const count = await TestModel.countDocuments();
            count.should.equal(1);
        } catch (err) {
            should.not.exist(err);
        }
    });


    it("countDocumentsDeleted() -> should return 2 deleted documents", async function () {
        try {
            const count = await TestModel.countDocumentsDeleted();
            count.should.equal(2);
        } catch (err) {
            should.not.exist(err);
        }
    });


    it("countDocumentsWithDeleted() -> should return 3 documents", async function () {
        try {
            const count = await TestModel.countDocumentsWithDeleted();
            count.should.equal(3);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("find() -> should return 1 documents", async function () {
        try {
            const documents = await TestModel.find();
            documents.length.should.equal(1);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("findDeleted() -> should return 2 documents", async function () {
        try {
            const documents = await TestModel.findDeleted();
            documents.length.should.equal(2);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("findWithDeleted() -> should return 3 documents", async function () {
        try {
            const documents = await TestModel.findWithDeleted();
            documents.length.should.equal(3);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("findOne() -> should not return 1 deleted document", async function () {
        try {
            const doc = await TestModel.findOne({name: 'Obi-Wan Kenobi'});
            expect(doc).to.be.null;
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("findOneDeleted() -> should return 1 deleted document", async function () {
        try {
            const doc = await TestModel.findOneDeleted({name: 'Obi-Wan Kenobi'});
            expect(doc).not.to.be.null;
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("findOneWithDeleted() -> should return 1 deleted document", async function () {
        try {
            const doc = await TestModel.findOneWithDeleted({name: 'Obi-Wan Kenobi'});
            expect(doc).not.to.be.null;
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("findOneWithDeleted() -> should return 1 not deleted document", async function () {
        try {
            const doc = await TestModel.findOneWithDeleted({name: 'Darth Vader'});
            expect(doc).not.to.be.null;
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("findOneAndUpdate() -> should not find and update deleted document", async function () {
        try {
            const doc = await TestModel.findOneAndUpdate({name: 'Obi-Wan Kenobi'}, {name: 'Obi-Wan Kenobi Test'}, {new: true});
            expect(doc).to.be.null;
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("findOneAndUpdateDeleted() -> should find and update deleted document", async function () {
        try {
            const doc = await TestModel.findOneAndUpdateDeleted({name: 'Obi-Wan Kenobi'}, {name: 'Obi-Wan Kenobi Test'}, {new: true});
            expect(doc).not.to.be.null;
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("findOneAndUpdateWithDeleted() -> should find and update deleted document", async function () {
        try {
            const doc = await TestModel.findOneAndUpdateWithDeleted({name: 'Obi-Wan Kenobi'}, {name: 'Obi-Wan Kenobi Test'}, {new: true});
            expect(doc).not.to.be.null;
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("findOneAndUpdateWithDeleted() -> should find and update not deleted document", async function () {
        try {
            const doc = await TestModel.findOneAndUpdateWithDeleted({name: 'Darth Vader'}, {name: 'Darth Vader Test'}, {new: true});
            expect(doc).not.to.be.null;
        } catch (err) {
            should.not.exist(err);
        }
    });


    it("updateOne(conditions, update, options, callback) -> should not update first deleted document", async function () {
        try {
            const doc = await TestModel.updateOne({name: 'Luke Skywalker'}, {name: 'Luke Skywalker Test'}, {});
            expect(doc).to.be.mongoose_ok();
            expect(doc).to.be.mongoose_count(0);
        } catch (err) {
            should.not.exist(err);
        }
    });
    //
    // it("updateOne(conditions, update, options, callback) -> should insert new document", function (done) {
    //     TestModel.updateOne({name: 'Luke Skywalker'}, {name: 'Luke Skywalker Test'}, {upsert: true}, function (err, doc) {
    //         should.not.exist(err);
    //
    //         expect(doc).to.be.mongoose_ok();
    //
    //         if (mongooseMajorVersion >= 6) {
    //             expect(doc.upsertedId).not.to.be.null;
    //             expect(doc.upsertedId).not.to.be.undefined;
    //             doc.upsertedCount.should.equal(1);
    //         } else {
    //             expect(doc.upserted).not.to.be.null;
    //             expect(doc.upserted).not.to.be.undefined;
    //             expect(doc).to.be.mongoose_count(1);
    //         }
    //
    //         done();
    //     });
    // });
    //
    // it("updateMany(conditions, update, options, callback) -> should not update deleted documents", function (done) {
    //     TestModel.updateMany({}, {name: 'Luke Skywalker Test'}, {multi: true}, function (err, doc) {
    //         should.not.exist(err);
    //
    //         expect(doc).to.be.mongoose_ok();
    //         expect(doc).to.be.mongoose_count(1);
    //         done();
    //     });
    // });
    //
    // it("update(conditions, update, options) -> should not update deleted documents", function (done) {
    //     if (mongooseMajorVersion < 5) {
    //         TestModel.update({}, {name: 'Luke Skywalker Test'}, {multi: true}).exec(function (err, doc) {
    //             should.not.exist(err);
    //
    //             expect(doc).to.be.mongoose_ok();
    //             expect(doc).to.be.mongoose_count(1);
    //             done();
    //         });
    //     } else {
    //         done();
    //     }
    // });
    //
    // it("updateOne(conditions, update, options) -> should not update first deleted document", function (done) {
    //     TestModel.updateOne({name: 'Luke Skywalker'}, {name: 'Luke Skywalker Test'}, {}).exec(function (err, doc) {
    //         should.not.exist(err);
    //
    //         expect(doc).to.be.mongoose_ok();
    //         expect(doc).to.be.mongoose_count(0);
    //         done();
    //     });
    // });
    //
    // it("updateOne(conditions, update, options) -> should insert new document", function (done) {
    //     TestModel.updateOne({name: 'Luke Skywalker'}, {name: 'Luke Skywalker Test'}, {upsert: true}).exec(function (err, doc) {
    //         should.not.exist(err);
    //
    //         expect(doc).to.be.mongoose_ok();
    //
    //         if (mongooseMajorVersion >= 6) {
    //             expect(doc.upsertedId).not.to.be.null;
    //             expect(doc.upsertedId).not.to.be.undefined;
    //             doc.upsertedCount.should.equal(1);
    //         } else {
    //             expect(doc.upserted).not.to.be.null;
    //             expect(doc.upserted).not.to.be.undefined;
    //             expect(doc).to.be.mongoose_count(1);
    //         }
    //
    //         done();
    //     });
    // });
    //
    // it("updateMany(conditions, update, options) -> should not update deleted documents", function (done) {
    //     TestModel.updateMany({}, {name: 'Luke Skywalker Test'}, {multi: true}).exec(function (err, doc) {
    //         should.not.exist(err);
    //
    //         expect(doc).to.be.mongoose_ok();
    //         expect(doc).to.be.mongoose_count(1);
    //
    //         done();
    //     });
    // });
    //
    // it("update(conditions, update, callback) -> should not update deleted documents", function (done) {
    //     if (mongooseMajorVersion < 5) {
    //         TestModel.update({}, {name: 'Luke Skywalker Test'}, function (err, doc) {
    //             should.not.exist(err);
    //
    //             expect(doc).to.be.mongoose_ok();
    //             expect(doc).to.be.mongoose_count(1);
    //
    //             done();
    //         });
    //     } else {
    //         done();
    //     }
    // });
    //
    // it("updateOne(conditions, update, callback) -> should not update first deleted document", function (done) {
    //     TestModel.updateOne({name: 'Luke Skywalker'}, {name: 'Luke Skywalker Test'}, function (err, doc) {
    //         should.not.exist(err);
    //
    //         expect(doc).to.be.mongoose_ok();
    //         expect(doc).to.be.mongoose_count(0);
    //
    //         done();
    //     });
    // });
    //
    // it("updateMany(conditions, update, callback) -> should not update deleted documents", function (done) {
    //     TestModel.updateMany({}, {name: 'Luke Skywalker Test'}, function (err, doc) {
    //         should.not.exist(err);
    //
    //         expect(doc).to.be.mongoose_ok();
    //         expect(doc).to.be.mongoose_count(1);
    //         done();
    //     });
    // });
    //
    // it("update(conditions, update) -> should not update deleted documents", function (done) {
    //     if (mongooseMajorVersion < 5) {
    //         TestModel.update({}, {name: 'Luke Skywalker Test'}).exec(function (err, doc) {
    //             should.not.exist(err);
    //
    //             expect(doc).to.be.mongoose_ok();
    //             expect(doc).to.be.mongoose_count(1);
    //             done();
    //         });
    //     } else {
    //         done();
    //     }
    // });
    //
    // it("updateOne(conditions, update) -> should not update first deleted document", function (done) {
    //     TestModel.updateOne({name: 'Luke Skywalker'}, {name: 'Luke Skywalker Test'}, {}, function (err, doc) {
    //         should.not.exist(err);
    //
    //         expect(doc).to.be.mongoose_ok();
    //         expect(doc).to.be.mongoose_count(0);
    //
    //         done();
    //     });
    // });
    //
    // it("updateMany(conditions, update) -> should not update deleted documents", function (done) {
    //     TestModel.updateMany({}, {name: 'Luke Skywalker Test'}).exec(function (err, doc) {
    //         should.not.exist(err);
    //
    //         expect(doc).to.be.mongoose_ok();
    //         expect(doc).to.be.mongoose_count(1);
    //
    //         done();
    //     });
    // });
    //
    // it("updateDeleted() -> should update deleted document", function (done) {
    //     if (mongooseMajorVersion < 5) {
    //         TestModel.updateDeleted({}, {name: 'Test 123'}, {multi: true}, function (err, doc) {
    //             should.not.exist(err);
    //
    //             expect(doc).to.be.mongoose_ok();
    //             expect(doc).to.be.mongoose_count(2);
    //
    //             done();
    //         });
    //     } else {
    //         done();
    //     }
    // });
    //
    // it("updateOneDeleted(conditions, update, options, callback) -> should update first deleted document", function (done) {
    //     TestModel.updateOneDeleted({name: 'Luke Skywalker'}, {name: 'Luke Skywalker Test'}, {}, function (err, doc) {
    //         should.not.exist(err);
    //
    //         expect(doc).to.be.mongoose_ok();
    //         expect(doc).to.be.mongoose_count(1);
    //
    //         done();
    //     });
    // });
    //
    // it("updateOneDeleted(conditions, update, options, callback) -> should update first deleted document", function (done) {
    //     TestModel.updateOneDeleted({name: 'Luke Skywalker'}, {name: 'Luke Skywalker Test'}, {upsert: true}, function (err, doc) {
    //         should.not.exist(err);
    //
    //         expect(doc.upserted).to.be.undefined;
    //         expect(doc).to.be.mongoose_ok();
    //         expect(doc).to.be.mongoose_count(1);
    //
    //         done();
    //     });
    // });
    //
    // it("updateManyDeleted() -> should update deleted document", function (done) {
    //     TestModel.updateManyDeleted({}, {name: 'Test 123'}, {multi: true}, function (err, doc) {
    //         should.not.exist(err);
    //
    //         expect(doc).to.be.mongoose_ok();
    //         expect(doc).to.be.mongoose_count(2);
    //
    //         done();
    //     });
    // });
    //
    // it("updateWithDeleted() -> should update all document", function (done) {
    //     if (mongooseMajorVersion < 5) {
    //         TestModel.updateWithDeleted({}, {name: 'Test 654'}, {multi: true}, function (err, doc) {
    //             should.not.exist(err);
    //
    //             expect(doc).to.be.mongoose_ok();
    //             expect(doc).to.be.mongoose_count(3);
    //
    //             done();
    //         });
    //     } else {
    //         done();
    //     }
    // });
    //
    // it("updateOneWithDeleted(conditions, update, options, callback) -> should update first deleted document", function (done) {
    //     TestModel.updateOneWithDeleted({name: 'Luke Skywalker'}, {name: 'Luke Skywalker Test'}, {}, function (err, doc) {
    //         should.not.exist(err);
    //
    //         expect(doc).to.be.mongoose_ok();
    //         expect(doc).to.be.mongoose_count(1);
    //
    //         done();
    //     });
    // });
    //
    // it("updateOneWithDeleted(conditions, update, options, callback) -> should update first deleted document", function (done) {
    //     TestModel.updateOneWithDeleted({name: 'Luke Skywalker'}, {name: 'Luke Skywalker Test'}, {upsert: true}, function (err, doc) {
    //         should.not.exist(err);
    //
    //         expect(doc.upserted).to.be.undefined;
    //
    //         expect(doc).to.be.mongoose_ok();
    //         expect(doc).to.be.mongoose_count(1);
    //
    //         done();
    //     });
    // });
    //
    // it("updateManyWithDeleted() -> should update all document", function (done) {
    //     TestModel.updateManyWithDeleted({}, {name: 'Test 654'}, {multi: true}, function (err, doc) {
    //         should.not.exist(err);
    //
    //         expect(doc).to.be.mongoose_ok();
    //         expect(doc).to.be.mongoose_count(3);
    //         done();
    //     });
    // });
});