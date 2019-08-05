import { Module, DynamicModule, Provider } from '@nestjs/common';
import { MassiveService } from './massive.service';
import { MASSIVE_CONNECT_OPTIONS, MASSIVE_CONFIG_OPTIONS } from './constants';
import {
  MassiveConnectOptions,
  MassiveConnectAsyncOptions,
  MassiveOptionsFactory,
  MassiveConfigOptions,
  MassiveConfigAsyncOptions,
} from './interfaces';

@Module({
  providers: [MassiveService],
  exports: [MassiveService],
})
export class MassiveModule {
  /**
   * Registers a configured @nestjsplus/massive Module for import into the current module.
   */
  public static register(
    connectOptions: MassiveConnectOptions,
    configOptions?: MassiveConfigOptions,
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
      ],
    };
  }

  static registerAsync(
    connectOptions: MassiveConnectAsyncOptions,
    configOptions?: MassiveConfigAsyncOptions,
  ): DynamicModule {
    return {
      module: MassiveModule,
      imports: connectOptions.imports || [],
      providers: [
        this.createConnectAsyncProviders(connectOptions),
        this.createConfigAsyncProviders(configOptions),
      ],
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

    return {
      provide: MASSIVE_CONNECT_OPTIONS,
      useFactory: async (optionsFactory: MassiveOptionsFactory) => {
        return optionsFactory.createMassiveConnectOptions();
      },
      inject: [options.useExisting],
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
        return {
          provide: MASSIVE_CONFIG_OPTIONS,
          useFactory: async (optionsFactory: MassiveOptionsFactory) => {
            return optionsFactory.createMassiveConfigOptions();
          },
          inject: [options.useExisting],
        };
      }
    } else {
      return {
        provide: MASSIVE_CONFIG_OPTIONS,
        useValue: {},
      };
    }
  }
}
