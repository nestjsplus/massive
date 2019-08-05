// tslint:disable: variable-name
import { Injectable, Inject } from '@nestjs/common';
import massive = require('massive');
import { MASSIVE_CONNECT_OPTIONS, MASSIVE_CONFIG_OPTIONS } from './constants';

interface IMassiveService {
  connect(): Promise<any>;
}

@Injectable()
export class MassiveService implements IMassiveService {
  private _massiveClient;

  constructor(
    @Inject(MASSIVE_CONNECT_OPTIONS) private _massiveConnectOptions,
    @Inject(MASSIVE_CONFIG_OPTIONS) private _massiveConfigOptions,
  ) {}

  async connect(): Promise<any> {
    console.log('connect options: ', this._massiveConnectOptions);
    console.log('config options: ', this._massiveConfigOptions);
    return this._massiveClient
      ? this._massiveClient
      : (this._massiveClient = await massive(
          this._massiveConnectOptions,
          this._massiveConfigOptions,
        ));
  }
}
