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
  _isQueuedForDisconnect = false;
  _disconnectTimeout: NodeJS.Timeout | undefined = undefined;

  constructor(props: DatabaseProps) {
    this.config = {
      path: props.path,
      schema: props.schemas,
      schemaVersion: props.schemaVersion
    };
  }

  async connect() {
    this.cancelQueuedDisconnect();

    if (this.isConnected()) {
      return this._realm;
    }

    this._isConnected = false;
    this._realm = await Realm.open(this.config).then(it => {
      this._isConnected = true;
      return it;
    });

    return this._realm;
  }

  // Queue disconnect for development purposes: when the app hot reloads, a disconnect might be queued. But the new
  // app boot will cancel this disconnect, preventing Realm == null errors.
  queueDisconnect() {
    this.cancelQueuedDisconnect();
    this._isQueuedForDisconnect = true;
    this._disconnectTimeout = setTimeout(this.disconnect, 300)
  }

  cancelQueuedDisconnect() {
    if (this._disconnectTimeout) {
      clearTimeout(this._disconnectTimeout);
    }
    this._disconnectTimeout = undefined;
    this._isQueuedForDisconnect = false;
  }

  disconnect() {
    this._isConnected = false;
    if (this._realm == null) {
      return;
    }
    this._realm.close();
    this._realm = null;
    this._isQueuedForDisconnect = false;
  }

  isConnected = () => {
    if (this._realm == null || this._realm.isClosed) {
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

    console.info("Deleting database");
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
