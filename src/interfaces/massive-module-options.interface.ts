// see https://github.com/vitaly-t/pg-promise/wiki/Connection-Syntax#configuration-object
export interface MassiveConnectOptions {
  /**
   * server name or IP address
   */
  host: string;
  /**
   * server port number
   */
  port: number;
  /**
   * database name
   */
  database: string;
  /**
   * user name
   */
  user: string;
  /**
   * user password, or a function that returns one
   */
  password: string;
  /**
   * use SSL (it also can be a TSSLConfig-like object)
   */
  ssl?: boolean;
  /**
   * binary result mode
   */
  binary?: boolean;
  /**
   * client_encoding
   */
  client_encoding?: string;
  /**
   * application_name
   */
  application_name?: string;
  /**
   * fallback_application_name
   */
  fallback_application_name?: string;
  /**
   * lifespan for unused connections
   */
  idleTimeoutMillis?: number;
  /**
   * connection pool size
   */
  poolSize?: number;
  /**
   * maximum size of the connection pool
   */
  max?: number;
  /**
   * minimum size of the connection pool
   */
  min?: number;
  /**
   * query execution timeout
   */
  query_timeout?: number;
  /**
   * keep TCP alive
   */
  keepAlive?: boolean;
}

// seehttps://massivejs.org/docs/connecting
export interface MassiveConfigOptions {
  /**
   * Relative path to a scripts directory.
   */
  scripts?: string;
  /**
   * Only load tables, views, and functions from the specified schemas.
   */
  allowedSchemas?: string[];
  /**
   * Only load tables and views matching the whitelist.
   */
  whitelist?: string[];
  /**
   * Never load tables and views matching the blacklist.
   */
  blacklist?: string[];
  /**
   * 	Specify exceptions to a blacklist ruleset.
   */
  exceptions?: string[];
  /**
   * 	Only load functions matching the whitelist.
   */
  functionWhiteList?: string[];
  /**
   * Never load functions matching the blacklist.
   */
  functionBlackList?: string[];
  /**
   * 	Streamline function return values: a function returning a record will
   *  yield an object and a function returning a scalar will yield the value,
   *  instead of both returning an array of record objects.
   */
  enhancedFunctions?: boolean;
  /**
   * 	Don't load database functions at all.
   */
  excludeFunctions?: boolean;
  /**
   * 	Set the type of document table primary key fields to serial or uuid.
   */
  documentPkType?: string;
  /**
   * 	Set the UUID version used by document table primary keys to v1, v1mc, or v4.
   */
  uuidVersion?: string;
}
