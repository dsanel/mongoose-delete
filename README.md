Mongoose Delete Plugin
=========

mongoose-delete is simple and lightweight plugin that enables soft deletion of documents in MongoDB. This code is based on [riyadhalnur's](https://github.com/riyadhalnur) plugin [mongoose-softdelete](https://github.com/riyadhalnur/mongoose-softdelete).

[![Build Status](https://github.com/dsanel/mongoose-delete/workflows/Test/badge.svg)](https://github.com/dsanel/mongoose-delete/actions/workflows/test.yml)

## Features
  - [Add __delete()__ method on document (do not override standard __remove()__ method)](#simple-usage)
  - [Add __deleteById()__ static method](#simple-usage)
  - [Add __deleted__ (true-false) key on document](#simple-usage)
  - [Add __deletedAt__ key to store time of deletion](#save-time-of-deletion)
  - [Add __deletedBy__ key to record who deleted document](#who-has-deleted-the-data)
  - Restore deleted documents using __restore__ method
  - [Bulk delete and restore](#bulk-delete-and-restore)
  - [Option to override static methods](#examples-how-to-override-one-or-multiple-methods) (__count, countDocuments, find, findOne, findOneAndUpdate, update, updateOne, updateMany__)
  - [For overridden methods we have two additional methods](#method-overridden): __methodDeleted__ and __methodWithDeleted__
  - [Disable model validation on delete](#disable-model-validation-on-delete)
  - [Disable model validation on restore](#disable-model-validation-on-restore)
  - [Option to create index on delete fields](#create-index-on-fields) (__deleted__, __deletedAt__, __deletedBy__)
  - Option to disable use of `$ne` operator using `{use$neOperator: false}`. Before you start to use this option please check [#50](https://github.com/dsanel/mongoose-delete/issues/50).
  - Option to override **aggregate**.
  - Option to `populate` with deleted documents (`{ withDeleted: true }`)
  - Option to `populate` **ONLY** deleted documents (`{ onlyDeleted: true }`)

## Installation
Install using [npm](https://npmjs.org)
```
npm install mongoose-delete
```
## TypeScript support

The plugin currently does not have its own type definition. Please be free to use [@types/mongoose-delete](https://www.npmjs.com/package/@types/mongoose-delete).

In doing so, you should make use of the `SoftDeleteModel` type, instead of the `Model` type.

```typescript
import { Schema, model, connect } from 'mongoose';
import { SoftDeleteModel }, MongooseDelete from 'mongoose-delete';

interface Pet extends SoftDeleteDocument {
  name: string;
}

const PetSchema = new Schema<Pet>({
    name: String
});

PetSchema.plugin(MongooseDelete, { deletedBy: true, deletedByType: String });

const model: SoftDeleteModel = model<Pet>('Pet', PetSchema);

export default model;
```

## Usage

We can use this plugin with or without options.

### Simple usage

```javascript
var mongoose_delete = require('mongoose-delete');

var PetSchema = new Schema({
    name: String
});

PetSchema.plugin(mongoose_delete);

var Pet = mongoose.model('Pet', PetSchema);

var fluffy = new Pet({ name: 'Fluffy' });

fluffy.save(function () {
    // mongodb: { deleted: false, name: 'Fluffy' }

    // note: you should invoke exactly delete() method instead of standard fluffy.remove()
    fluffy.delete(function () {
        // mongodb: { deleted: true, name: 'Fluffy' }

        fluffy.restore(function () {
            // mongodb: { deleted: false, name: 'Fluffy' }
        });
    });

});

var examplePetId = mongoose.Types.ObjectId("53da93b16b4a6670076b16bf");

// INFO: Example usage of deleteById static method
Pet.deleteById(examplePetId, function (err, petDocument) {
    // mongodb: { deleted: true, name: 'Fluffy', _id: '53da93b1...' }
});

```


### Save time of deletion

```javascript
var mongoose_delete = require('mongoose-delete');

var PetSchema = new Schema({
    name: String
});

PetSchema.plugin(mongoose_delete, { deletedAt : true });

var Pet = mongoose.model('Pet', PetSchema);

var fluffy = new Pet({ name: 'Fluffy' });

fluffy.save(function () {
    // mongodb: { deleted: false, name: 'Fluffy' }

    // note: you should invoke exactly delete() method instead of standard fluffy.remove()
    fluffy.delete(function () {
        // mongodb: { deleted: true, name: 'Fluffy', deletedAt: ISODate("2014-08-01T10:34:53.171Z")}

        fluffy.restore(function () {
            // mongodb: { deleted: false, name: 'Fluffy' }
        });
    });

});
```


### Who has deleted the data?

```javascript
var mongoose_delete = require('mongoose-delete');

var PetSchema = new Schema({
    name: String
});

PetSchema.plugin(mongoose_delete, { deletedBy : true });

var Pet = mongoose.model('Pet', PetSchema);

var fluffy = new Pet({ name: 'Fluffy' });

fluffy.save(function () {
    // mongodb: { deleted: false, name: 'Fluffy' }

    var idUser = mongoose.Types.ObjectId("53da93b16b4a6670076b16bf");

    // note: you should invoke exactly delete() method instead of standard fluffy.remove()
    fluffy.delete(idUser, function () {
        // mongodb: { deleted: true, name: 'Fluffy', deletedBy: ObjectId("53da93b16b4a6670076b16bf")}

        fluffy.restore(function () {
            // mongodb: { deleted: false, name: 'Fluffy' }
        });
    });

});
```

The type for `deletedBy` does not have to be `ObjectId`, you can set a custom type, such as `String`.

```javascript
var mongoose_delete = require('mongoose-delete');

var PetSchema = new Schema({
    name: String
});

PetSchema.plugin(mongoose_delete, { deletedBy: true, deletedByType: String });

var Pet = mongoose.model('Pet', PetSchema);

var fluffy = new Pet({ name: 'Fluffy' });

fluffy.save(function () {
    // mongodb: { deleted: false, name: 'Fluffy' }

    var idUser = "my-custom-user-id";

    // note: you should invoke exactly delete() method instead of standard fluffy.remove()
    fluffy.delete(idUser, function () {
        // mongodb: { deleted: true, name: 'Fluffy', deletedBy: 'my-custom-user-id' }

        fluffy.restore(function () {
            // mongodb: { deleted: false, name: 'Fluffy' }
        });
    });
});
```

### Bulk delete and restore

```javascript
var mongoose_delete = require('mongoose-delete');

var PetSchema = new Schema({
    name: String,
    age: Number
});

PetSchema.plugin(mongoose_delete);

var Pet = mongoose.model('Pet', PetSchema);

var idUser = mongoose.Types.ObjectId("53da93b16b4a6670076b16bf");

// Delete multiple object, callback
Pet.delete(function (err, result) { ... });
Pet.delete({age:10}, function (err, result) { ... });
Pet.delete({}, idUser, function (err, result) { ... });
Pet.delete({age:10}, idUser, function (err, result) { ... });

// Delete multiple object, promise
Pet.delete().exec(function (err, result) { ... });
Pet.delete({age:10}).exec(function (err, result) { ... });
Pet.delete({}, idUser).exec(function (err, result) { ... });
Pet.delete({age:10}, idUser).exec(function (err, result) { ... });

// Restore multiple object, callback
Pet.restore(function (err, result) { ... });
Pet.restore({age:10}, function (err, result) { ... });

// Restore multiple object, promise
Pet.restore().exec(function (err, result) { ... });
Pet.restore({age:10}).exec(function (err, result) { ... });
```

### Method overridden

We have the option to override all standard methods or only specific methods. Overridden methods will exclude deleted documents from results, documents that have ```deleted = true```. Every overridden method will have two additional methods, so we will be able to work with deleted documents.

| only not deleted documents | only deleted documents             | all documents                          |
|----------------------------|------------------------------------|----------------------------------------|
| count()                    | countDeleted                       | countWithDeleted                       |
| countDocuments()           | countDocumentsDeleted              | countDocumentsWithDeleted              |
| find()                     | findDeleted                        | findWithDeleted                        |
| findOne()                  | findOneDeleted                     | findOneWithDeleted                     |
| findOneAndUpdate()         | findOneAndUpdateDeleted            | findOneAndUpdateWithDeleted            |
| update()                   | updateDeleted                      | updateWithDeleted                      |
| updateOne()                | updateOneDeleted                   | updateOneWithDeleted                   |
| updateMany()               | updateManyDeleted                  | updateManyWithDeleted                  |
| aggregate()                | aggregateDeleted                   | aggregateWithDeleted                   |
| findById()                 | Please use findOne                 | Please use findOneWithDeleted          |
| findByIdAndUpdate()        | Please use findOneAndUpdateDeleted | Please use findOneAndUpdateWithDeleted |
| distinct()                 | distinctDeleted                    | distinctWithDeleted                    |

### Examples how to override one or multiple methods

```javascript
var mongoose_delete = require('mongoose-delete');

var PetSchema = new Schema({
    name: String
});

// Override all methods
PetSchema.plugin(mongoose_delete, { overrideMethods: 'all' });
// or
PetSchema.plugin(mongoose_delete, { overrideMethods: true });

// Overide only specific methods
PetSchema.plugin(mongoose_delete, { overrideMethods: ['count', 'find', 'findOne', 'findOneAndUpdate', 'update'] });
// or
PetSchema.plugin(mongoose_delete, { overrideMethods: ['count', 'countDocuments', 'find'] });
// or (unrecognized method names will be ignored)
PetSchema.plugin(mongoose_delete, { overrideMethods: ['count', 'find', 'errorXyz'] });


var Pet = mongoose.model('Pet', PetSchema);

// Example of usage overridden methods

Pet.find(function (err, documents) {
  // will return only NOT DELETED documents
});

Pet.findDeleted(function (err, documents) {
  // will return only DELETED documents
});

Pet.findWithDeleted(function (err, documents) {
  // will return ALL documents
});

```

### Disable model validation on delete

```javascript
var mongoose_delete = require('mongoose-delete');

var PetSchema = new Schema({
    name: { type: String, required: true }
});

// By default, validateBeforeDelete is set to true
PetSchema.plugin(mongoose_delete);
// the previous line is identical to next line
PetSchema.plugin(mongoose_delete, { validateBeforeDelete: true });

// To disable model validation on delete, set validateBeforeDelete option to false
PetSchema.plugin(mongoose_delete, { validateBeforeDelete: false });

// NOTE: This is based on existing Mongoose validateBeforeSave option
// http://mongoosejs.com/docs/guide.html#validateBeforeSave

```

### Disable model validation on restore

```javascript
var mongoose_delete = require('mongoose-delete');

var PetSchema = new Schema({
    name: { type: String, required: true }
});

// By default, validateBeforeRestore is set to true
PetSchema.plugin(mongoose_delete);
// the previous line is identical to next line
PetSchema.plugin(mongoose_delete, { validateBeforeRestore: true });

// To disable model validation on restore, set validateBeforeRestore option to false
PetSchema.plugin(mongoose_delete, { validateBeforeRestore: false });

// NOTE: This is based on existing Mongoose validateBeforeSave option
// http://mongoosejs.com/docs/guide.html#validateBeforeSave
```



### Create index on fields

```javascript
var mongoose_delete = require('mongoose-delete');

var PetSchema = new Schema({
    name: String
});

// Index all field related to plugin (deleted, deletedAt, deletedBy)
PetSchema.plugin(mongoose_delete, { indexFields: 'all' });
// or
PetSchema.plugin(mongoose_delete, { indexFields: true });

// Index only specific fields
PetSchema.plugin(mongoose_delete, { indexFields: ['deleted', 'deletedBy'] });
// or
PetSchema.plugin(mongoose_delete, { indexFields: ['deletedAt'] });


```

## License

The MIT License

Copyright (c) 2014 Sanel Deljkic http://dsanel.github.io/

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
