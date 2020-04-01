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
