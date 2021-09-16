import Realm, { ObjectClass, ObjectSchema } from "realm";

interface DatabaseProps {
  path: string;
  schemas: Array<ObjectClass | ObjectSchema>;
  schemaVersion: number;
}

export class DatabaseProvider {
  config: Realm.Configuration;
  _realm: Realm | null = null;
  _isConnected = false;

  constructor(props: DatabaseProps) {
    this.config = {
      path: props.path,
      schema: props.schemas,
      schemaVersion: props.schemaVersion
    };
  }

  async connect() {
    if (this.isConnected()) {
      console.info("Database is already connected.");
      this.disconnect();
    }

    this._isConnected = false;
    this._realm = await Realm.open(this.config).then(it => {
      this._isConnected = true;
      return it;
    });

    return this._realm;
  }

  disconnect() {
    this._isConnected = false;
    if (this._realm == null) {
      return;
    }
    this._realm.close();
    this._realm = null;
  }

  isConnected = () => {
    if (this._isConnected && this._realm == null) {
      this._isConnected = false;
    }
    return this._isConnected;
  };

  realm = () => {
    if (this._realm == null) {
      throw Error("Cannot use realm: realm is null");
    }
    return this._realm;
  };

  deleteDb() {
    if (this.isConnected()) {
      this.disconnect();
    }

    console.warn("Deleting database");
    Realm.deleteFile(this.config);
  }

  getIncrementedPrimaryKey = (schema: ObjectSchema) => {
    if (schema.primaryKey === undefined) {
      throw SyntaxError(`Schema ${schema.name} doesn't have a primary key specified`);
    }

    if (schema.properties[schema.primaryKey] != "int") {
      throw TypeError(`Primary key of schema ${schema.name} must be an integer instead of: '${schema.properties[schema.primaryKey]}'`);
    }

    // https://github.com/realm/realm-js/issues/746#issuecomment-530323673
    const items = this.realm()
      .objects(schema.name)
      .sorted(schema.primaryKey);

    // @ts-ignore
    return items.length === 0 ? 1 : items[items.length - 1][schema.primaryKey] + 1;
  };
}
