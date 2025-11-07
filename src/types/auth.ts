/**
 * Authentication related types for TP-Link Omada API
 */

export interface OmadaLoginCredentials {
  username: string;
  password: string;
}

export interface OmadaClientConfig {
  baseUrl: string;
  username: string;
  password: string;
  strictSSL?: boolean;
  timeout?: number;
}

export interface OmadaLoginResponse {
  errorCode: number;
  msg: string;
  result: {
    token: string;
    omadacId?: string;
    roleType?: number;
    id?: string;
    name?: string;
    email?: string;
    privilege?: {
      GLOBAL_LEVEL?: string;
    };
  };
}

export interface OmadaAPIResponse<T = unknown> {
  errorCode: number;
  msg: string;
  result: T;
}

export interface OmadaControllerInfo {
  omadacId: string;
  controllerVer: string;
  apiVer: string;
  type: string;
}
