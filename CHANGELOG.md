## [v1.0.2]
> February 5, 2024
- Update `devDependencies` to `"mongoose": "^8.1.1"`
- `peerDependencies` for `mongoose` set to `"5.x || 6.x || 7.x || 8.x"` ([RajatJain4061](https://github.com/RajatJain4061)) [#148](https://github.com/dsanel/mongoose-delete/pull/148)
- fix test: count() -> should return 3 documents


## [v1.0.1]
> June 13, 2023
- fix: aggregateWithDeleted returns no result with Discriminators #130
- Update `devDependencies` to `"mongoose": "^7.2.4"`

## [v1.0.0]
> June 12, 2023

- **BREAKING CHANGE**: remove support for Mongoose 4.x
- Upgrade all test to support mongoose 5, 6, 7
- Refactor all tests to use async/await, remove callbacks [
  Emanuel Canavesio](https://github.com/ecanavesio)
- Update version of mongoose, mocha, chai in `devDependencies` [
  Emanuel Canavesio](https://github.com/ecanavesio)
- `peerDependencies` for `mongoose` set to `"5.x || 6.x || 7.x"`
- Setup GitHub action for tests
    - OS: `ubuntu-20.04`, `ubuntu-22.04`
    - Node: `14`, `16`, `18`
    - MongoDB: `4.4.18`, `5.0.14`, `6.0.4`
- Add validateBeforeRestore option [AnthonyNabil](https://github.com/AnthonyNabil)
- Fixed Static Restore does not remove deletedAt and deletedBy [benny1hk](https://github.com/benny1hk)

## [v0.5.4]
> August 31, 2021

- Upgrade all test to support mongoose 5.x and 6.x
- Stop using TravicCI as test runner
- Setup GitHub action for tests
    - Node: 12, 14, 16
    - MongoDB: 4.0, 4.2, 4.4
- Upgrade Mongoose ^6 in `devDependencies`
- Add Mongoose 6 into `peerDependencies` #105 (@Paso)

## [v0.5.3]
> November 19, 2020

- Add option to `populate` deleted documents #40 (@sven)
- Update documentation for `aggregate` (@Jericho1060)
- Update `mocha` -> `8.x`
- fix: deprecation warning for collection.update when user overrides update method #81 #78 (@nsine)
- fix: `nyc` moved into `devDependencies` #80 (@isikhi)

## [v0.5.2]
> April 1, 2020

- Add option to override `aggregate` (@shimonbrandsdorfer)
- Upgrade all `devDependencies` to latest versions
- Remove Istanbul coverage tool


## [v0.5.1]
> September 3, 2019

- Add option to disable use of `$ne` operator using `{use$neOperator: false}` (@bdelville, @gabzim) #50
- Fix Mongoose DeprecationWarning: collection.update is deprecated (@cardimajs, @jebarjonet)
- Upgrade all `devDependencies` to latest versions
- Fix security vulnerabilities in dependencies
- Add additional tests for `updateMany`, `countDocuments`, `use$neOperator`
- Setup `.travis.yml` to test plugin on Node: 12, 11, 10, 9, 8, 7, 6, 5, 4

## [v0.5.0]
> December 10, 2018

- Add support to mongoose 5.x (@joelmukuthu, @gforge)
- Add `deleteById` static method #16
- Add `countDocuments` method with related override methods (only for v5 Mongoose) #45
- Upgrade all `devDependencies` to latest versions
- Setup `.travis.yml` to test plugin on Node: 10, 9, 8, 7, 6, 5, 4
- Setup `.travis.yml` to use `coveralls@3.0.2`
- Add additional tests

## [v0.4.0]
> July 10, 2016

- Add custom typeKey support #22
- Add option to set custom type for deletedBy
- Support instance method delete promise
- Add specification about remove() to README

## [v0.3.4]
> June 20, 2016

- Methods override fix for existent DB #11
- Option to create indexes for deleted, deletedAt, deletedBy, related to #12

## [v0.3.3]
> July 1, 2016

- Default delete set to `false` #10

## [v0.3.2]
> April 26, 2016

- Correct field name into documentation, `validateBeforeDelete`

## [v0.3.1]
> April 20, 2016

- Add option to disable validation on delete #6

## [v0.3.0]
> Mar 11, 2016

- Bulk delete and restore
- Remove requirement for callback in delete() and restore()

## [v0.2.1]
> Feb 1, 2016

- Add option to override static model methods (`count`, `find`, `findOne`, `findOneAndUpdate`, `update`)
- Add additional methods for overridden static methods:

| only not deleted documents | only deleted documents  | all documents               |
|----------------------------|-------------------------|-----------------------------|
| count()                    | countDeleted            | countWithDeleted            |
| find()                     | findDeleted             | findWithDeleted             |
| findOne()                  | findOneDeleted          | findOneWithDeleted          |
| findOneAndUpdate()         | findOneAndUpdateDeleted | findOneAndUpdateWithDeleted |
| update()                   | updateDeleted           | updateWithDeleted           |



## [v0.1.1]
> Aug 1, 2014

- Initial version
- Add `deleted` (true-false) key on document
- Add `deletedAt` key to store time of deletion
- Add `deletedBy` key to record who deleted document
- Restore deleted documents, `restore()` method
