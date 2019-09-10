<h1 align="center"></h1>

<div align="center">
  <a href="http://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo_text.svg" width="150" alt="Nest Logo" />
  </a>
</div>

<h3 align="center">A Module for Utilizing MassiveJS with NestJS</h3>

<div align="center">
  <a href="https://nestjs.com" target="_blank">
    <img src="https://img.shields.io/badge/license-MIT-brightgreen.svg" alt="License" />
    <img src="https://badge.fury.io/js/%40nestjsplus%2Fmassive.svg" alt="npm version" height="18">    <img src="https://img.shields.io/badge/built%20with-NestJs-red.svg" alt="Built with NestJS">
  </a>
</div>

### Installation

> npm install @nestjsplus/massive

(or yarn equivalent)

### About Massive and PostgreSQL

This module is a thin layer on top of the [MassiveJS library](https://massivejs.org/).

As an [old database guy](#ingres), I sometimes feel like the **OR/M** days passed me by :smiley:

In truth, I find the OR/M model and the _pure SQl_ model to just define opposite ends of a spectrum, and I'm happy to live somewhere in the middle. _Massive_ provides a very happy middle ground. Looked at one way, it introspects your database and provides an automatic API to it in a way that seems similar to a MongoDB type API. You can get quite far with `save()`, `find()`, etc. methods that are similar to MongoDB in many ways, but **do not require a model**. As Dian Fay, author of Massive says, _"Massive analyzes and builds an API for the data model expressed in your database's tables, views, and functions"_.

Massive is also **PostgreSQL only**. If you don't care about database portability (I'm firmly attached to PostgreSQL, and would have to change a lot more than a DB API library to move), this is a big boon. Because it doesn't sacrifice at the alter of "portability", Massive takes significant advantage of native PostgreSQL functionality.

It has a nice query builder, but doesn't obscure SQL, and let's you get right down to the metal easily.

It fully supports database functions. It even lets you write parameterized SQL files on the file system and call them just like procedures (one of my favorite features, and an underrated one at that, as it gets SQL out of your TypeScript, lets you manage the SQL script files nicely in your git repo just like the rest of your app, and it makes it dead easy to avoid SQL injection).

On top of all that, it has full `JSONB` support, meaning you get to treat your PostgreSQL database like a full-fledged NoSQL database, storing JSON objects natively. You can store them alongside your relational data, query them with API calls or native SQL (with JSONB support), or mix-and-match.

### Quick Start

To configure your DB connection, import the `Massive` module using the familiar `register()` / `registerAsync()` pattern. See the [example repo](https://github.com/nestjsplus/massive-cats) for an example. Basically, you configure the module with at least a `connectionOptions` object, and optionally a `configurationOptions` object and `driverOptions` object. These options objects map directly to the connection, configuration, and driver options [in the Massive docs](https://massivejs.org/docs/connecting).

Once configured, inject the `SINGLETON` connection object into any service using the `MASSIVE_CONNECTION` injection token.

For example, your `AppModule` might look like this (full example in the [sample repo](https://github.com/nestjsplus/massive-cats)):

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { MassiveModule } from '@nestjsplus/massive';

@Module({
  imports: [
    MassiveModule.registerAsync({
      useClass: ConfigService,
    }),
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

Now you have access to a `MASSIVE_CONNECTION` token that is associated with the PostgreSQL connection pool, which you can inject into any provider, and use directly. For example, you might do this:

```typescript
// src/app.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { MASSIVE_CONNECTION } from '@nestjsplus/massive';

@Injectable()
export class AppService {
  constructor(@Inject(MASSIVE_CONNECTION) private readonly db) {}

  async find(age) {
    const criteria = age ? { 'age >=': age } : {};
    return await this.db.cats.find(criteria);
  }
  ...
```

Here, you've injected the connection as a local property of the service class, and can access any of the MassiveJS API through that property (e.g., `return await this.db.cats.find(criteria)`, where `db` represents your MassiveJS connection object).

### Configuring `connectionOptions`

I'm not showing the `ConfigService` in the `AppModule` above, but it's just an _injectable_ that implements the `MassiveOptionsFactory` interface, meaning it has methods to return a `connectionOptions` object (and optionally, `configurationOptions` and `driverOptions` objects). A `connectionOptions` object looks like:

```json
{
  "host": "localhost",
  "port": 5432,
  "database": "nest",
  "user": "john",
  "password": "password"
}
```

You can use any of the following methods to provide the `connectionOptions` (and optionally `configurationOptions` and `driverOptions`) to the module. These follow the [usual patterns for custom providers](https://docs.nestjs.com/fundamentals/custom-providers):

- `register()`: pass a plain JavaScript object
- `registerAsync()`: pass a dynamic object via:
  - `useFactory`: supply a factory function to return the object; the factory should implement the [MassiveOptionsFactory](https://github.com/nestjsplus/massive/blob/master/src/interfaces/massive-options-factory.interface.ts) interface
  - `useClass`: bind to a provider/service that supplies the object; that service should implement the [MassiveOptionsFactory](https://github.com/nestjsplus/massive/blob/master/src/interfaces/massive-options-factory.interface.ts) interface
  - `useExisting`: bind to an existing (provided elsewhere) provider/service to supply the object; that service should implement the [MassiveOptionsFactory](https://github.com/nestjsplus/massive/blob/master/src/interfaces/massive-options-factory.interface.ts) interface

### Connection availability on application startup

The `MASSIVE_CONNECTION` is an [asynchronous provider](https://docs.nestjs.com/fundamentals/async-providers). This means that the Nest application bootstrap process (specifically, the Dependency Injection phase) won't complete until the DB connection is made. So your app, once it bootstraps, is guaranteed to have a DB connection (pool) via the `MASSIVE_CONNECTION` injection token. Note that asynchronous providers must be injected with the `@Inject()` decorator instead of normal constructor injection (again, see the [example](https://github.com/nestjsplus/massive-cat)).

### Working Example

See [massive-cats](https://github.com/nestjsplus/massive-cats) for a full example. It shows an example of using the `MASSIVE_CONNECTION`, a service that uses it to access a PostgreSQL database, and includes a few of the nifty Massive features described above.

### Ingres

Boring end-notes here! My long love affair with SQL databases began when I started working for Ingres Corp., provider of the [Ingres](<https://en.wikipedia.org/wiki/Ingres_(database)>) database commercial product. It had a long prior history as a university research project. Amazingly, while it had a relatively short-lived commercial life-span (solid ass-kicking by Oracle, which (to this day, I maintain) had inferior technology but superior sales and marketing), it was reborn again as an open source project - (**Post** In**gres**) - [PostgreSQL](https://www.postgresql.org/). From what I can gather, PostgreSQL is widely regarded as the leading open source RDBMS, and by my accounts, for good reason. Among its many virtues:

- It's free! :smiley:
- It's fast and scalable
- It's supported on Amazon RDS
- It's got every modern SQL feature, and many, many more (check out [Postgis](https://postgis.net/) if you are into mapping/GIS, for example)
- It supports JSONB and is a very good NoSQL database
- It has a super passionate community, and support on StackOverflow is superb
- I could go on, but I won't :smile:

### To Do

- [ ] Tests
- [x] Implement the [driver configuration](https://massivejs.org/docs/connecting#driver-configuration) option

### Change Log

See [Changelog](CHANGELOG.md) for more information.

### Contributing

Contributions welcome! See [Contributing](CONTRIBUTING.md).

### Author

**John Biundo (Y Prospect on [Discord](https://discord.gg/G7Qnnhy))**

### License

Licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
