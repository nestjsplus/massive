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

The pattern I use is to create a `DatabaseModule` and manage the connection (really, the _connection pool_) through it. In essence, all this module does is let you easily manage a singleton connection. If you've tried to do that with Express, you know that can sometimes feel like jumping through hoops. With Nest modules and DI, this is straightforward.

To configure the `Massive` module use the familiar `register()` / `registerAsync()` pattern. Do this inside your `DatabaseModule` so it can be shared across your app. See the [example repo](https://github.com/nestjsplus/massive-cats) for an example, but basically you want to configure the module with at least a `connectionOptions` object, and optionally a `configurationOptions` object. These object map directly to the connection and configuration options [in the Massive docs](https://massivejs.org/docs/connecting). Note, the initial release of this module **does not** support the [driver configuration](https://massivejs.org/docs/connecting#driver-configuration) option, but I do intend to support that soon as it has some features I want :smiley:.

The only slightly tricky part is that you need to set up a _provider_ that provides the singleton connection to your other (feature) modules. This isn't hard, but can be slightly confusing. I recommend reading [Custom providers](https://docs.nestjs.com/fundamentals/custom-providers) in the Nest docs if this isn't familiar. It's important to set this connection up as an [asynchronous provider](https://docs.nestjs.com/fundamentals/async-providers) as shown in the sample code below; this ensures that your DB connection is available before your feature modules, which depend on it, are instantiated.

So, for example, your `DataaseModule` might look like this (full example in the [sample repo](https://github.com/nestjsplus/massive-cats)):

```typescript
// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { MassiveModule } from '@nestjsplus/massive';
import { DB_CONNECTION } from './constants';
import { ConfigService } from '../config/config.service';

const connectionFactory = {
  provide: DB_CONNECTION,
  useFactory: async (databaseService: DatabaseService) => {
    return databaseService.connect();
  },
  inject: [DatabaseService],
};

@Module({
  imports: [
    MassiveModule.registerAsync(
      {
        useExisting: ConfigService,
      },
      {
        useExisting: ConfigService,
      },
    ),
  ],
  providers: [DatabaseService, connectionFactory],
  exports: [connectionFactory],
})
export class DatabaseModule {}
```

Now you've created a `DB_CONNECTION` token that is associated with the PostgreSQL connection pool, which you can inject into any feature module, and use directly. For example, a feature module might do this to import the `DatabaseModule`:

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [DatabaseModule, ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

And then a service inside that module would do something like this:

```typescript
// src/app.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { DB_CONNECTION } from './database/constants';
import { ConfigService } from './config/config.service';

@Injectable()
export class AppService {
  constructor(
    @Inject(DB_CONNECTION) private readonly db,
    private readonly configService: ConfigService,
  ) {}

  async create(cat) {
    return await this.db.cats.save(cat);
  }
  ...
```

### A Few Details

Here are a few notes from the code sample above:

1. You probably noticed two `{ useExisting: ConfigService }` objects being passed to `registerAsync()`. This is because we are passing in both a `connectionOptions` object and a `configurationOptions` object (see Massive docs for more on these). `connectionOptions` is required, but `configurationOptions` is optional.
2. I'm not showing the `ConfigService` here, but it's just an _injectable_ that implements the `MassiveOptionsFactory` interface, meaning it has methods to return a `connectionOptions` object, and `configurationOptions` object. A `connectionOptions` object looks like:

```json
{
  "host": "localhost",
  "port": 5432,
  "database": "nest",
  "user": "john",
  "password": "password"
}
```

You can use any of the following methods to provide the `connectionOptions` and `configurationOptions` to the module. These follow the [usual patterns for custom providers](https://docs.nestjs.com/fundamentals/custom-providers):

- `register()`: pass a plain JavaScript object
- `registerAsync()`: pass a dynamic object via:
  - `useFactory`: supply a factory function to return the object
  - `useExisting`: bind to an existing (provided elsewhere) service to supply the object

3. The `DB_CONNECTION` is an [asynchronous provider](https://docs.nestjs.com/fundamentals/async-providers). This means that the application bootstrap process (really, the Dependency Injection phase) won't complete until the DB connection is fulfilled. So your app, once it bootstraps, is guaranteed to have a DB connection (pool). Note that asynchronous providers must be injected with the `@Inject()` decorator instead of normal constructor injection in your feature module (again, see the [example](https://github.com/nestjsplus/massive-cat)).

### Working Example

See [massive-cats](https://github.com/nestjsplus/massive-cats) for a full example. It shows the `DatabaseModule` pattern, a feature module that uses it, and includes a few of the nifty Massive features described above.

### Ingres

Boring end-notes here! My long love affair with SQL databases began when I started working for Ingres Corp., provider of the [Ingres](<https://en.wikipedia.org/wiki/Ingres_(database)>) database commercial product. It had a long prior history as a university research project. Amazingly, while it had a relatively short-lived commercial life-span (solid ass-kicking by Oracle, which (to this day, I maintain) had inferior technology but superior sales and marketing), it was reborn again as an open source project - (**Post** In**gres**) - [PostgreSQL](https://www.postgresql.org/). From what I can gather, PostgreSQL is widely regarded as the leading open source RDBMS, and by my accounts, for good reason. Among its many virtues:

- It's free! :smiley:
- It's fast and scalable
- It's supported on Amazon RDS
- It's got every modern SQL feature, and many, many more (check out [Postgis](https://postgis.net/) if you are into mapping, for example)
- It supports JSONB and is a very good NoSQL database
- It has a super passionate community, and support on StackOverflow is widespread
- I could go on, but I won't :)

### To Do

- [ ] Tests
- [ ] Implement the [driver configuration](https://massivejs.org/docs/connecting#driver-configuration) option

### Change Log

See [Changelog](CHANGELOG.md) for more information.

### Contributing

Contributions welcome! See [Contributing](CONTRIBUTING.md).

### Author

**John Biundo (Y Prospect on [Discord](https://discord.gg/G7Qnnhy))**

### License

Licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
