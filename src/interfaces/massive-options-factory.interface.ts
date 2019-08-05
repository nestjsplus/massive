import {
  MassiveConnectOptions,
  MassiveConfigOptions,
} from './massive-module-options.interface';

export interface MassiveOptionsFactory {
  createMassiveConnectOptions():
    | Promise<MassiveConnectOptions>
    | MassiveConnectOptions;

  createMassiveConfigOptions?: () =>
    | Promise<MassiveConfigOptions>
    | MassiveConfigOptions;
}
