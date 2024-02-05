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
    await mongoose.connect(process.env.MONGOOSE_TEST_URI || 'mongodb://localhost/test');
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

    // https://mongoosejs.com/docs/migrating_to_8.html#removed-count
    it("count() -> should return 3 documents", async function () {
        try {
            if (mongooseMajorVersion < 8) {
                const count = await TestModel.count();
                count.should.equal(3);
            }
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

    it("updateOne(conditions, update, options, callback) -> should insert new document", async function () {
        try {
            const doc = await TestModel.updateOne({name: 'Luke Skywalker'}, {name: 'Luke Skywalker'}, {upsert: true});

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

    it("updateMany(conditions, update, options, callback) -> should not update deleted documents", async function () {
        try {
            const doc = await TestModel.updateMany({}, {name: 'Luke Skywalker Test'}, {multi: true});
            expect(doc).to.be.mongoose_ok();
            expect(doc).to.be.mongoose_count(1);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("updateOne(conditions, update, options) -> should not update first deleted document", async function () {
        try {
            const doc = await TestModel.updateOne({name: 'Luke Skywalker'}, {name: 'Luke Skywalker Test'}, {});
            expect(doc).to.be.mongoose_ok();
            expect(doc).to.be.mongoose_count(0);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("updateOne(conditions, update, options) -> should insert new document", async function () {
        try {
            const doc = await TestModel.updateOne({name: 'Luke Skywalker'}, {name: 'Luke Skywalker Test'}, {upsert: true});

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

    it("updateMany(conditions, update, options) -> should not update deleted documents", async function () {
        try {
            const doc = await TestModel.updateMany({}, {name: 'Luke Skywalker Test'}, {multi: true});
            expect(doc).to.be.mongoose_ok();
            expect(doc).to.be.mongoose_count(1);
        } catch (err) {

        }
    });

    it("updateOne(conditions, update, callback) -> should not update first deleted document", async function () {
        try {
            const doc = await TestModel.updateOne({name: 'Luke Skywalker'}, {name: 'Luke Skywalker Test'});
            expect(doc).to.be.mongoose_ok();
            expect(doc).to.be.mongoose_count(0);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("updateMany(conditions, update, callback) -> should not update deleted documents", async function () {
        try {
            const doc = await TestModel.updateMany({}, {name: 'Luke Skywalker Test'});
            expect(doc).to.be.mongoose_ok();
            expect(doc).to.be.mongoose_count(1);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("updateOne(conditions, update) -> should not update first deleted document", async function () {
        try {
            const doc = await TestModel.updateOne({name: 'Luke Skywalker'}, {name: 'Luke Skywalker Test'}, {});
            expect(doc).to.be.mongoose_ok();
            expect(doc).to.be.mongoose_count(0);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("updateMany(conditions, update) -> should not update deleted documents", async function () {
        try {
            const doc = await TestModel.updateMany({}, {name: 'Luke Skywalker Test'});
            expect(doc).to.be.mongoose_ok();
            expect(doc).to.be.mongoose_count(1);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("updateOneDeleted(conditions, update, options, callback) -> should update first deleted document", async function () {
        try {
            const doc = await TestModel.updateOneDeleted({name: 'Luke Skywalker'}, {name: 'Luke Skywalker Test'}, {});

            expect(doc).to.be.mongoose_ok();
            expect(doc).to.be.mongoose_count(1);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("updateOneDeleted(conditions, update, options, callback) -> should update first deleted document", async function () {
        try {
            const doc = await TestModel.updateOneDeleted({name: 'Luke Skywalker'}, {name: 'Luke Skywalker Test'}, {upsert: true});

            expect(doc.upserted).to.be.undefined;
            expect(doc).to.be.mongoose_ok();
            expect(doc).to.be.mongoose_count(1);
        } catch (err) {
            should.not.exist(err);
        }

    });

    it("updateManyDeleted() -> should update deleted document", async function () {
        try {
            const doc = await TestModel.updateManyDeleted({}, {name: 'Test 123'}, {multi: true});

            expect(doc).to.be.mongoose_ok();
            expect(doc).to.be.mongoose_count(2);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("updateOneWithDeleted(conditions, update, options, callback) -> should update first deleted document", async function () {
        try {
            const doc = await TestModel.updateOneWithDeleted({name: 'Luke Skywalker'}, {name: 'Luke Skywalker Test'}, {});

            expect(doc).to.be.mongoose_ok();
            expect(doc).to.be.mongoose_count(1);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("updateOneWithDeleted(conditions, update, options, callback) -> should update first deleted document", async function () {
        try {
            const doc = await TestModel.updateOneWithDeleted({name: 'Luke Skywalker'}, {name: 'Luke Skywalker Test'}, {upsert: true});

            expect(doc.upserted).to.be.undefined;

            expect(doc).to.be.mongoose_ok();
            expect(doc).to.be.mongoose_count(1);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("updateManyWithDeleted() -> should update all document", async function () {
        try {
            const doc = await TestModel.updateManyWithDeleted({}, {name: 'Test 654'}, {multi: true});

            expect(doc).to.be.mongoose_ok();
            expect(doc).to.be.mongoose_count(3);
        } catch (err) {
            should.not.exist(err);
        }
    });
});

describe("check the existence of override static methods: { overrideMethods: true }", function () {
    var TestSchema = new Schema({name: String}, {collection: 'mongoose_delete_test'});
    TestSchema.plugin(mongoose_delete, {overrideMethods: true});
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

    it("update() -> method should exist", function () {
        expect(TestModel.update).to.exist;
    });

    it("updateDeleted() -> method should exist", function () {
        expect(TestModel.updateDeleted).to.exist;
    });

    it("updateWithDeleted() -> method should exist", function () {
        expect(TestModel.updateWithDeleted).to.exist;
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
    var TestSchema = new Schema({name: String}, {collection: 'mongoose_delete_test'});
    TestSchema.plugin(mongoose_delete, {overrideMethods: ['testError', 'count', 'countDocuments', 'find', 'findOne', 'findOneAndUpdate', 'update', 'updateOne', 'updateMany']});
    var TestModel = mongoose.model('Test7', TestSchema);

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

    it("update() -> method should exist", function () {
        expect(TestModel.update).to.exist;
    });

    it("updateDeleted() -> method should exist", function () {
        expect(TestModel.updateDeleted).to.exist;
    });

    it("updateWithDeleted() -> method should exist", function () {
        expect(TestModel.updateWithDeleted).to.exist;
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

describe("check the existence of override static methods: { overrideMethods: ['count', 'countDocuments', 'find'] }", function () {
    var TestSchema = new Schema({name: String}, {collection: 'mongoose_delete_test'});
    TestSchema.plugin(mongoose_delete, {overrideMethods: ['count', 'countDocuments', 'find']});
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

    it("update() -> method should exist", function () {
        if (mongooseMajorVersion <= 6) {
            expect(TestModel.update).to.exist;
        }
    });

    it("updateDeleted() -> method should not exist", function () {
        expect(TestModel.updateDeleted).to.not.exist;
    });

    it("updateWithDeleted() -> method should not exist", function () {
        expect(TestModel.updateWithDeleted).to.not.exist;
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
    var TestSchema = new Schema({name: String, side: Number}, {collection: 'mongoose_delete_test'});
    TestSchema.plugin(mongoose_delete, {overrideMethods: 'all', deletedAt: true, deletedBy: true});
    var TestModel = mongoose.model('Test14', TestSchema);

    beforeEach(async function () {
        await TestModel.create(
          [
              {name: 'Obi-Wan Kenobi', side: 0},
              {name: 'Darth Vader', side: 1},
              {name: 'Luke Skywalker', side: 0}
          ]);
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test");
    });

    var userId = getNewObjectId("53da93b16b4a6670076b16bf")

    it("delete() -> delete multiple documents", async function () {
        try {
            const documents = await TestModel.delete();

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(3);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("delete(query) -> delete multiple documents with conditions", async function () {
        try {
            const documents = await TestModel.delete({side: 0});

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(2);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("delete(query, deletedBy) -> delete multiple documents with conditions and user ID", async function () {
        try {
            const documents = await TestModel.delete({side: 1}, userId);

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(1);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("delete().exec() -> delete all documents", async function () {
        try {
            const documents = await TestModel.delete().exec();

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(3);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("delete(query).exec() -> delete multiple documents with conditions", async function () {
        try {
            const documents = await TestModel.delete({side: 0}).exec();

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(2);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("delete(query, deletedBy).exec() -> delete multiple documents with conditions and user ID", async function () {
        try {
            const documents = await TestModel.delete({side: 1}, userId).exec();

            expect(documents).to.be.mongoose_count(1);
            expect(documents).to.be.mongoose_ok();
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("delete({}, deletedBy).exec() -> delete all documents passing user ID", async function () {
        try {
            const documents = await TestModel.delete({}, userId).exec();

            expect(documents).to.be.mongoose_count(3);
            expect(documents).to.be.mongoose_ok();
        } catch (err) {
            should.not.exist(err);
        }
    });
});

describe("restore multiple documents", function () {
    var TestSchema = new Schema({name: String, side: Number}, {collection: 'mongoose_restore_test'});
    TestSchema.plugin(mongoose_delete, {overrideMethods: 'all', deletedAt: true, deletedBy: true});
    var TestModel = mongoose.model('Test15', TestSchema);

    beforeEach(async function () {
        await TestModel.create(
          [
              {name: 'Obi-Wan Kenobi', side: 0},
              {name: 'Darth Vader', side: 1, deleted: true},
              {name: 'Luke Skywalker', side: 0, deleted: true, deletedAt: new Date()}
          ]
        );
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_restore_test");
    });

    it("restore() -> restore all documents", async function () {
        try {
            const documents = await TestModel.restore();

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(3);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("restore(query) -> restore multiple documents with conditions", async function () {
        try {
            const documents = await TestModel.restore({side: 0});

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(2);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("restore().exec() -> restore all documents", async function () {
        try {
            const documents = await TestModel.restore().exec();

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(3);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("restore(query).exec() -> restore multiple documents with conditions", async function () {
        try {
            const documents = await TestModel.restore({side: 0}).exec();

            expect(documents).to.be.mongoose_ok();
            expect(documents).to.be.mongoose_count(2);
        } catch (err) {
            should.not.exist(err);
        }
    });

});

describe("model validation on delete (default): { validateBeforeDelete: true }", function () {
    var TestSchema = new Schema({ name: {type: String, required: true}}, {collection: 'mongoose_restore_test'});
    TestSchema.plugin(mongoose_delete);
    var TestModel = mongoose.model('Test17', TestSchema);

    beforeEach(async function () {
        await TestModel.create(
          [
              {name: 'Luke Skywalker'}
          ]);
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_restore_test");
    });

    it("delete() -> should raise ValidationError error", async function () {
        try {
            const luke = await TestModel.findOne({name: 'Luke Skywalker'});
            luke.name = "";
            try {
                await luke.delete();
            } catch (e) {
                e.should.exist;
                e.name.should.exist;
                e.name.should.equal('ValidationError');
            }
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("delete() -> should not raise ValidationError error", async function () {
        try {
            const luke = await TestModel.findOne({name: 'Luke Skywalker'});
            luke.name = "Test Name";
            try {
                await luke.delete();
            } catch (e) {
                should.not.exist(err);
            }
        } catch (err) {
            should.not.exist(err);
        }
    });
});

describe("model validation on delete: { validateBeforeDelete: false }", function () {
    var TestSchema = new Schema({
        name: {type: String, required: true}
    }, {collection: 'mongoose_restore_test'});
    TestSchema.plugin(mongoose_delete, {validateBeforeDelete: false});
    var TestModel = mongoose.model('Test18', TestSchema);

    beforeEach(async function () {
        await TestModel.create(
          [
              {name: 'Luke Skywalker'}
          ]);
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_restore_test");
    });

    it("delete() -> should not raise ValidationError error", async function () {
        try {
            const luke = await TestModel.findOne({name: 'Luke Skywalker'})
            luke.name = "";
            await luke.delete();
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("delete() -> should not raise ValidationError error", async function () {
        try {
            const luke = await TestModel.findOne({name: 'Luke Skywalker'})
            luke.name = "Test Name";
            await luke.delete()
        } catch (err) {
            should.not.exist(err);
        }
    });
});

describe("mongoose_delete indexFields options", function () {

    it("all fields must have index: { indexFields: true }", function () {
        var TestSchema = new Schema({name: String}, {collection: 'mongoose_delete_test_indexFields'});
        TestSchema.plugin(mongoose_delete, {indexFields: true, deletedAt: true, deletedBy: true});
        var Test0 = mongoose.model('Test0_indexFields', TestSchema);

        expect(Test0.schema.paths.deleted._index).to.be.true;
        expect(Test0.schema.paths.deletedAt._index).to.be.true;
        expect(Test0.schema.paths.deletedBy._index).to.be.true;
    });

    it("all fields must have index: { indexFields: 'all' }", function () {
        var TestSchema = new Schema({name: String}, {collection: 'mongoose_delete_test_indexFields'});
        TestSchema.plugin(mongoose_delete, {indexFields: 'all', deletedAt: true, deletedBy: true});
        var Test0 = mongoose.model('Test1_indexFields', TestSchema);

        expect(Test0.schema.paths.deleted._index).to.be.true;
        expect(Test0.schema.paths.deletedAt._index).to.be.true;
        expect(Test0.schema.paths.deletedBy._index).to.be.true;
    });

    it("only 'deleted' field must have index: { indexFields: ['deleted'] }", function () {
        var TestSchema = new Schema({name: String}, {collection: 'mongoose_delete_test_indexFields'});
        TestSchema.plugin(mongoose_delete, {indexFields: ['deleted'], deletedAt: true, deletedBy: true});
        var Test0 = mongoose.model('Test2_indexFields', TestSchema);

        expect(Test0.schema.paths.deletedAt._index).to.be.false;
        expect(Test0.schema.paths.deletedBy._index).to.be.false;
        expect(Test0.schema.paths.deleted._index).to.be.true;
    });

    it("only 'deletedAt' and 'deletedBy' fields must have index: { indexFields: ['deletedAt', 'deletedBy'] }", function () {
        var TestSchema = new Schema({name: String}, {collection: 'mongoose_delete_test_indexFields'});
        TestSchema.plugin(mongoose_delete, {indexFields: ['deletedAt', 'deletedBy'], deletedAt: true, deletedBy: true});
        var Test0 = mongoose.model('Test3_indexFields', TestSchema);

        expect(Test0.schema.paths.deleted._index).to.be.false;
        expect(Test0.schema.paths.deletedAt._index).to.be.true;
        expect(Test0.schema.paths.deletedBy._index).to.be.true;
    });
});

describe("check usage of $ne operator", function () {
    var TestRawSchema = new Schema({name: String, deleted: Boolean}, {collection: 'mongoose_delete_test_ne'});
    var TestRawModel = mongoose.model('TestNeRaw', TestRawSchema);

    var TestSchema = new Schema({name: String}, {collection: 'mongoose_delete_test_ne'});
    TestSchema.plugin(mongoose_delete, {overrideMethods: 'all', use$neOperator: false});
    var TestModel = mongoose.model('Test55', TestSchema);

    before(async function () {
        await TestRawModel.create(
          [
              {name: 'One'},
              {name: 'Two', deleted: true},
              {name: 'Three', deleted: false}
          ]);
    });

    after(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test_ne");
    });

    it("find() -> should return 1 documents", async function () {
        try {
            const documents = await TestModel.find();
            documents.length.should.equal(1);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("findDeleted() -> should return 1 documents", async function () {
        try {
            const documents = await TestModel.findDeleted();
            documents.length.should.equal(1);
        } catch (err) {
            should.not.exist(err);
        }
    });
});

describe("aggregate methods: { overrideMethods: ['aggregate'] }", function () {
    var TestSchema = new Schema({ name: String }, { collection: 'mongoose_delete_test_aggregate' });
    TestSchema.plugin(mongoose_delete, { overrideMethods: ['aggregate'] });

    var TestModel = mongoose.model('Test5_Aggregate', TestSchema);

    beforeEach(async function () {
        await TestModel.create(
          [
              { name: 'Obi-Wan Kenobi', deleted: true },
              { name: 'Darth Vader' },
              { name: 'Luke Skywalker', deleted: true }
          ]);
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test_aggregate");
    });

    it("aggregate([{$project : {name : 1} }]) -> should return 1 document", async function () {
        try {
            const documents =  await TestModel.aggregate([{$project : { name : 1 }}]);
            documents.length.should.equal(1);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("aggregate([{$project : {name : 1} }]) -> should return 1 document (pipeline)", async function () {
        try {
            const documents = await TestModel
              .aggregate()
              .project({ name : 1 });

            documents.length.should.equal(1);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("aggregateDeleted([{$project : {name : 1} }]) -> should return deleted documents", async function () {
        try {
            const documents = await TestModel.aggregateDeleted([
                {
                    $project : { name : 1 }
                }
            ]);

            documents.length.should.equal(2);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("aggregateDeleted([{$project : {name : 1} }]) -> should return deleted documents (pipeline)", async function () {
        try {
            const documents = await TestModel
              .aggregateDeleted()
              .project({ name : 1 });

            documents.length.should.equal(2);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("aggregateWithDeleted([{$project : {name : 1} }]) -> should return deleted documents", async function () {
        try {
            const documents = await TestModel.aggregateWithDeleted([
                {
                    $project : { name : 1 }
                }
            ]);

            documents.length.should.equal(3);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("aggregateWithDeleted([{$project : {name : 1} }]) -> should return deleted documents (pipeline)", async function () {
        try {
            const documents = await TestModel
              .aggregateWithDeleted()
              .project({ name : 1 });

            documents.length.should.equal(3);
        } catch (err) {
            should.not.exist(err);
        }
    });
});

describe("aggregate methods & discriminator: { overrideMethods: ['aggregate'] }", function () {
    var TestSchema = new Schema({ name: String }, { collection: 'mongoose_delete_test_aggregate', discriminatorKey:'kind' });
    TestSchema.plugin(mongoose_delete, { overrideMethods: ['aggregate'] });

    var TestModel = mongoose.model('Test6_Aggregate', TestSchema);
    var DiscriminatorTestModel = TestModel.discriminator('DiscriminatorTest',new Schema({ age: Number }))

    beforeEach(async function () {
        await DiscriminatorTestModel.create(
          [
              { name: 'Lando Calrissian', age: 46, deleted: true },
              { name: 'Han Solo', age: 44 },
              { name: 'Jabba Desilijic Tiure', age:617, deleted: true },
              { name: 'Boba Fett', age: 61 },
          ]);
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_delete_test_aggregate");
    });

    it("aggregateWithDeleted([{ $match: { age:{ $gte: 50 } } }]) -> should return deleted documents from discriminator (pipeline)", async function () {
        try {
            var documents = await DiscriminatorTestModel
              .aggregateWithDeleted([{ $match: { age:{ $gte: 50 } } }])
              .project({ name : 1, age:1 });

            documents.length.should.equal(2);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("aggregate([{ $match: { age:{ $gte: 50 } } }]) -> should return non-deleted documents from discriminator (pipeline)", async function () {
        try {
            var documents = await DiscriminatorTestModel
              .aggregate([{ $match: { age:{ $gte: 50 } } }])
              .project({ name : 1, age:1 });

            documents.length.should.equal(1);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("aggregateDeleted([{ $match: { age:{ $gte: 50 } } }]) -> should return ONLY deleted documents from discriminator (pipeline)", async function () {
        try {
            var documents = await DiscriminatorTestModel
              .aggregateDeleted([{ $match: { age:{ $gte: 50 } } }])
              .project({ name : 1, age: 1 });

            documents.length.should.equal(1);
        } catch (err) {
            should.not.exist(err);
        }
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
          test: { type: mongoose.Types.ObjectId, ref: 'TestPopulate1' }
      },
      { collection: 'TestPopulate2' }
    );
    TestPopulateSchema2.plugin(mongoose_delete, { overrideMethods: 'all' });
    var TestPopulate2 = mongoose.model('TestPopulate2', TestPopulateSchema2);

    beforeEach(async function () {
        await TestPopulate1.create(
          [
              { name: 'Obi-Wan Kenobi', _id: getNewObjectId("53da93b16b4a6670076b16b1"), deleted: true },
              { name: 'Darth Vader', _id: getNewObjectId("53da93b16b4a6670076b16b2") },
              { name: 'Luke Skywalker', _id: getNewObjectId("53da93b16b4a6670076b16b3"), deleted: true }
          ]
        );
        await TestPopulate2.create(
          [
              { name: 'Student 1', test: getNewObjectId("53da93b16b4a6670076b16b1") },
              { name: 'Student 2', test: getNewObjectId("53da93b16b4a6670076b16b2") },
              { name: 'Student 3', test: getNewObjectId("53da93b16b4a6670076b16b3"), deleted: true }
          ]
        )
    });

    afterEach(async function () {
       await  mongoose.connection.db.dropCollection("TestPopulate1");
       await  mongoose.connection.db.dropCollection("TestPopulate2");
    });

    it("populate() -> should not return deleted sub-document", async function () {
        try {
            const document = await TestPopulate2
              .findOne({ name: 'Student 1' })
              .populate({ path: 'test' });

            expect(document.test).to.be.null;
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("populate() -> should return the deleted sub-document using { withDeleted: true }", async function () {
        try {
            const document = await TestPopulate2
              .findOne({ name: 'Student 1' })
              .populate({ path: 'test', options: { withDeleted: true } });

            expect(document.test).not.to.be.null;
            document.test.deleted.should.equal(true);
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("populate() -> should not return deleted documents and sub-documents", async function () {
        try {
            const documents = await TestPopulate2
              .find({ })
              .populate({ path: 'test' })
              .exec();

            var student1 = documents.findIndex(function(i) { return i.name === "Student 1" });
            var student2 = documents.findIndex(function(i) { return i.name === "Student 2" });

            documents.length.should.equal(2)
            expect(documents[student1].test).to.be.null;
            expect(documents[student2].test).not.to.be.null;
        } catch (err) {
            should.not.exist(err);
        }
    });

    it("populate() -> should return deleted documents and sub-documents", async function () {
        try {
            const documents = await TestPopulate2
              .findWithDeleted()
              .populate({ path: 'test', options: { withDeleted: true } })
              .exec();

            documents.length.should.equal(3);

            var student1 = documents.findIndex(function(i) { return i.name === "Student 1" });
            var student2 = documents.findIndex(function(i) { return i.name === "Student 2" });
            var student3 = documents.findIndex(function(i) { return i.name === "Student 3" });

            expect(documents[student1].test).not.to.be.null;
            expect(documents[student2].test).not.to.be.null;
            expect(documents[student3].test).not.to.be.null;
        } catch (err) {
            should.not.exist(err);
        }
    });
});

describe("model validation on restore: { validateBeforeRestore: false }", function () {
    var TestSchema = new Schema({
        name: { type: String, required: true }
    }, { collection: 'mongoose_restore_test' });
    TestSchema.plugin(mongoose_delete, { validateBeforeRestore: false });
    var TestModel = mongoose.model('Test18_restore', TestSchema);

    beforeEach(async function () {
        await TestModel.create(
          [
              { name: 'Luke Skywalker' }
          ]
        );
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_restore_test");
    });

    it("restore() -> not raise ValidationError error", async function () {
        try {
            const luke = await TestModel.findOne({ name: 'Luke Skywalker' });
            luke.name = "";
            await luke.restore();
        } catch (err) {
            should.not.exist(err);
        }
    });
});

describe("model validation on restore (default): { validateBeforeRestore: true }", function () {
    var TestSchema = new Schema({
        name: { type: String, required: true }
    }, { collection: 'mongoose_restore_test' });
    TestSchema.plugin(mongoose_delete);
    var TestModel = mongoose.model('Test17_restore', TestSchema);

    beforeEach(async function () {
        await TestModel.create(
          [
              { name: 'Luke Skywalker' }
          ]
        );
    });

    afterEach(async function () {
        await mongoose.connection.db.dropCollection("mongoose_restore_test");
    });

    it("restore() -> should raise ValidationError error", async function () {
        try {
            const luke = await TestModel.findOne({ name: 'Luke Skywalker' });
            try {
                luke.name = "";
                await luke.restore();
            } catch (e) {
                e.should.exist;
                e.name.should.exist;
                e.name.should.equal('ValidationError');
            }
        } catch (err) {
            should.not.exist(err);
        }
    });
});

