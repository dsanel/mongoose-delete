// eslint-disable-next-line @typescript-eslint/no-require-imports
import mongoose = require("mongoose");

/**
 * This is interface helper to declaring model that using Soft Delete
 */
declare module "@ambi-robotics/mongoose-delete" {
  interface Callback<T, THIS = T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this: THIS, err: any, doc: T): void;
  }
  type OverridableMethods =
    | "countDocuments"
    | "find"
    | "findOne"
    | "findOneAndUpdate"
    | "update"
    | "updateOne"
    | "updateMany"
    | "aggregate";

  export interface SoftDeleteModel<
    T extends mongoose.Document,
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    QueryHelpers = {},
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    TInstanceMethods = {},
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    TVirtuals = {},
    THydratedDocumentType = mongoose.HydratedDocument<
      T,
      TVirtuals & TInstanceMethods,
      QueryHelpers
    >,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TSchema = any
  > extends mongoose.Model<
      T,
      QueryHelpers,
      TInstanceMethods,
      TVirtuals,
      THydratedDocumentType,
      TSchema
    > {
    /** Count only deleted documents */
    countDocumentsDeleted: this["countDocuments"];
    /** Count all documents including deleted */
    countDocumentsWithDeleted: this["countDocuments"];
    /** Find only deleted documents */
    findDeleted: this["find"];
    /** Find all documents including deleted */
    findWithDeleted: this["find"];
    /** Find One only deleted documents */
    findOneDeleted: this["findOne"];
    /** Find One all documents including deleted */
    findOneWithDeleted: this["findOne"];
    /** Find One And Update only deleted documents */
    findOneAndUpdateDeleted: this["findOneAndUpdate"];
    /** Find One And Update all documents including deleted */
    findOneAndUpdateWithDeleted: this["findOneAndUpdate"];
    /**
     * @deprecated use `updateOneDeleted` or `updateManyDeleted` instead
     *
     * Update only deleted documents
     */
    updateDeleted: this["updateOne"];
    /**
     * @deprecated use `updateOneWithDeleted` or `updateManyWithDeleted` instead
     *
     * Update all documents including deleted
     */
    updateWithDeleted: this["updateOne"];
    /** Update One only deleted documents */
    updateOneDeleted: this["updateOne"];
    /** Update One all documents including deleted */
    updateOneWithDeleted: this["updateOne"];
    /** Update Many only deleted documents */
    updateManyDeleted: this["updateMany"];
    /** Update Many all documents including deleted */
    updateManyWithDeleted: this["updateMany"];
    /** Aggregate only deleted documents */
    aggregateDeleted: this["aggregate"];
    /** Aggregate all documents including deleted */
    aggregateWithDeleted: this["aggregate"];

    /**
     * Delete documents by conditions
     */
    delete(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      conditions?: any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      deleteBy?: any,
      fn?: Callback<T, this>
    ): mongoose.Query<
      ReturnType<mongoose.Model<T>["deleteMany"]>,
      T,
      QueryHelpers
    >;

    /**
     * Restore documents by conditions
     */
    restore(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      conditions?: any,
      fn?: Callback<T, this>
    ): mongoose.Query<
      ReturnType<mongoose.Model<T>["updateMany"]>,
      T,
      QueryHelpers
    >;

    /**
     * Delete a document by ID
     */
    deleteById(
      id?: string | mongoose.Types.ObjectId | Callback<T, this>,
      deleteBy?:
        | string
        | mongoose.Types.ObjectId
        | mongoose.Document
        | Callback<T, this>,
      fn?: Callback<T, this>
    ): mongoose.Query<
      ReturnType<mongoose.Model<T>["deleteOne"]>,
      T,
      QueryHelpers
    > &
      QueryHelpers;
  }

  interface SoftDeleteDocument
    extends Omit<mongoose.Document, "delete">,
      SoftDeleteInterface {
    /** Soft delete this document */
    delete(
      deleteBy?: string | mongoose.Types.ObjectId | Callback<this>,
      fn?: Callback<this>
    ): Promise<this>;
    restore(fn?: Callback<this>): Promise<this>;
  }
  interface SoftDeleteInterface {
    /** Soft deleted ? */
    deleted?: boolean | undefined;
    deletedAt?: Date | undefined;
    deletedBy?:
      | mongoose.Types.ObjectId
      | string
      | mongoose.Document
      | undefined;
  }
  interface Options {
    overrideMethods: boolean | "all" | OverridableMethods[];
    deletedAt: boolean;
    deletedBy: boolean;
    indexFields: boolean | "all" | Array<keyof SoftDeleteInterface>;
    validateBeforeDelete: boolean;
    validateBeforeRestore: boolean;
    use$neOperator: boolean;

    /**
     * DeleteBy Schema type, equal to
     * ```
     * Schema({
     * deletedBy: {
     *  type: options.deletedByType
     *  }
     * })
     * ```
     * @default ObjectId
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deletedByType: any;
  }

  export default function mongooseDelete(
    schema: mongoose.Schema,
    options?: Partial<Options>
  ): void;
}
