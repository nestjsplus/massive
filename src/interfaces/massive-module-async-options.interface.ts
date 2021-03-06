/* Dependencies */
import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

/* Interfaces */
import {
  MassiveConnectOptions,
  MassiveConfigOptions,
  MassiveDriverOptions,
} from './massive-module-options.interface';
import { MassiveOptionsFactory } from './massive-options-factory.interface';

export interface MassiveConnectAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useExisting?: Type<MassiveOptionsFactory>;
  useClass?: Type<MassiveOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<MassiveConnectOptions> | MassiveConnectOptions;
}

export interface MassiveConfigAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useExisting?: Type<MassiveOptionsFactory>;
  useClass?: Type<MassiveOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<MassiveConfigOptions> | MassiveConfigOptions;
}

export interface MassiveDriverAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useExisting?: Type<MassiveOptionsFactory>;
  useClass?: Type<MassiveOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<MassiveDriverOptions> | MassiveDriverOptions;
}
