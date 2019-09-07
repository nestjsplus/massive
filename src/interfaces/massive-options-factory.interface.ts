import {
  MassiveConnectOptions,
  MassiveConfigOptions,
  MassiveDriverOptions,
} from './massive-module-options.interface';

export interface MassiveOptionsFactory {
  createMassiveConnectOptions():
    | Promise<MassiveConnectOptions>
    | MassiveConnectOptions;

  createMassiveConfigOptions?: () =>
    | Promise<MassiveConfigOptions>
    | MassiveConfigOptions;

  createMassiveDriverOptions?: () =>
    | Promise<MassiveDriverOptions>
    | MassiveDriverOptions;
}
