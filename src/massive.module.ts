import { Module, DynamicModule, Provider, Global } from '@nestjs/common';
import { MassiveService } from './massive.service';
import {
  MASSIVE_CONNECT_OPTIONS,
  MASSIVE_CONFIG_OPTIONS,
  MASSIVE_DRIVER_OPTIONS,
  MASSIVE_CONNECTION,
} from './constants';
import {
  MassiveConnectOptions,
  MassiveConnectAsyncOptions,
  MassiveOptionsFactory,
  MassiveConfigOptions,
  MassiveConfigAsyncOptions,
  MassiveDriverOptions,
  MassiveDriverAsyncOptions,
} from './interfaces';

export const connectionFactory = {
  provide: MASSIVE_CONNECTION,
  useFactory: async massiveService => {
    return massiveService.connect();
  },
  inject: [MassiveService],
};

@Global()
@Module({})
export class MassiveModule {
  /**
   * Registers a configured @nestjsplus/massive Module for import into the current module
   * using static connectOptions and configOptions (optional) objects
   */
  public static register(
    connectOptions: MassiveConnectOptions,
    configOptions?: MassiveConfigOptions,
    driverOptions?: MassiveDriverOptions,
  ): DynamicModule {
    return {
      module: MassiveModule,
      providers: [
        {
          provide: MASSIVE_CONNECT_OPTIONS,
          useValue: connectOptions,
        },
        {
          provide: MASSIVE_CONFIG_OPTIONS,
          useValue: configOptions || {},
        },
        {
          provide: MASSIVE_DRIVER_OPTIONS,
          useValue: driverOptions || {},
        },
        connectionFactory,
        MassiveService,
      ],
      exports: [MassiveService, connectionFactory],
    };
  }

  /**
   * Registers a configured @nestjsplus/massive Module for import into the current module
   * using dynamic options (factory, etc)
   */
  public static registerAsync(
    connectOptions: MassiveConnectAsyncOptions,
    configOptions?: MassiveConfigAsyncOptions,
    driverOptions?: MassiveDriverAsyncOptions,
  ): DynamicModule {
    const allImports = [
      ...new Set(
        [].concat(
          connectOptions.imports,
          configOptions ? configOptions.imports : [],
          driverOptions ? driverOptions.imports : [],
        ),
      ),
    ];

    return {
      module: MassiveModule,
      imports: connectOptions.imports || [],
      providers: [
        this.createConnectAsyncProviders(connectOptions),
        this.createConfigAsyncProviders(configOptions),
        this.createDriverAsyncProviders(driverOptions),
        connectionFactory,
        MassiveService,
      ],
      exports: [MassiveService, connectionFactory],
    };
  }

  private static createConnectAsyncProviders(
    options: MassiveConnectAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: MASSIVE_CONNECT_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    // For useClass and useExisting...
    return {
      provide: MASSIVE_CONNECT_OPTIONS,
      useFactory: async (optionsFactory: MassiveOptionsFactory) =>
        await optionsFactory.createMassiveConnectOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }

  private static createConfigAsyncProviders(
    options: MassiveConfigAsyncOptions,
  ): Provider {
    if (options) {
      if (options.useFactory) {
        return {
          provide: MASSIVE_CONFIG_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        };
      } else {
        // For useClass and useExisting...
        return {
          provide: MASSIVE_CONFIG_OPTIONS,
          useFactory: async (optionsFactory: MassiveOptionsFactory) =>
            await optionsFactory.createMassiveConfigOptions(),
          inject: [options.useExisting || options.useClass],
        };
      }
    } else {
      return {
        provide: MASSIVE_CONFIG_OPTIONS,
        useValue: {},
      };
    }
  }

  private static createDriverAsyncProviders(
    options: MassiveDriverAsyncOptions,
  ): Provider {
    if (options) {
      if (options.useFactory) {
        return {
          provide: MASSIVE_DRIVER_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        };
      } else {
        // For useClass and useExisting...
        return {
          provide: MASSIVE_DRIVER_OPTIONS,
          useFactory: async (optionsFactory: MassiveOptionsFactory) =>
            await optionsFactory.createMassiveDriverOptions(),
          inject: [options.useExisting || options.useClass],
        };
      }
    } else {
      return {
        provide: MASSIVE_DRIVER_OPTIONS,
        useValue: {},
      };
    }
  }
}
