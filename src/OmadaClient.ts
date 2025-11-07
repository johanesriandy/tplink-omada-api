import axios, { AxiosInstance, AxiosError } from 'axios';
import https from 'https';
import {
  OmadaClientConfig,
  OmadaLoginResponse,
  OmadaControllerInfo,
  OmadaAPIResponse,
} from './types';

/**
 * TP-Link Omada API Client
 * Provides access to both published and unpublished Omada Controller APIs
 */
export class OmadaClient {
  private axiosInstance: AxiosInstance;
  private config: OmadaClientConfig;
  private token: string | null = null;
  private omadacId: string | null = null;
  private controllerInfo: OmadaControllerInfo | null = null;

  constructor(config: OmadaClientConfig) {
    this.config = {
      strictSSL: true,
      timeout: 30000,
      ...config,
    };

    // Create axios instance with base configuration
    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      httpsAgent: new https.Agent({
        rejectUnauthorized: this.config.strictSSL,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          throw new Error(
            `Omada API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
          );
        } else if (error.request) {
          // The request was made but no response was received
          throw new Error(`Omada API Error: No response received - ${error.message}`);
        } else {
          // Something happened in setting up the request that triggered an Error
          throw new Error(`Omada API Error: ${error.message}`);
        }
      }
    );
  }

  /**
   * Login to the Omada Controller
   * This method authenticates the user and stores the token for subsequent API calls
   */
  async login(): Promise<void> {
    try {
      // First, get controller information to obtain the omadacId
      await this.fetchControllerInfo();

      // Perform login
      const loginEndpoint = this.omadacId ? `/${this.omadacId}/api/v2/login` : '/api/v2/login';

      const response = await this.axiosInstance.post<OmadaLoginResponse>(loginEndpoint, {
        username: this.config.username,
        password: this.config.password,
      });

      if (response.data.errorCode !== 0) {
        throw new Error(`Login failed: ${response.data.msg}`);
      }

      // Store authentication token
      this.token = response.data.result.token;
      if (response.data.result.omadacId) {
        this.omadacId = response.data.result.omadacId;
      }

      // Set token in default headers for subsequent requests
      this.axiosInstance.defaults.headers.common['Csrf-Token'] = this.token;
      this.axiosInstance.defaults.headers.common['Cookie'] = `TPEAP_SESSIONID=${this.token}`;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to login to Omada Controller: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Fetch controller information
   * This is typically called before login to get the controller ID
   */
  private async fetchControllerInfo(): Promise<void> {
    try {
      const response =
        await this.axiosInstance.get<OmadaAPIResponse<OmadaControllerInfo>>('/api/info');

      if (response.data.errorCode === 0 && response.data.result) {
        this.controllerInfo = response.data.result;
        this.omadacId = response.data.result.omadacId;
      }
    } catch (error) {
      // If getting controller info fails, we'll try login without omadacId
      // Some versions of Omada might not require this
      console.warn('Could not get controller info, will attempt login without omadacId');
    }
  }

  /**
   * Logout from the Omada Controller
   */
  async logout(): Promise<void> {
    if (!this.token) {
      return;
    }

    try {
      const logoutEndpoint = this.omadacId ? `/${this.omadacId}/api/v2/logout` : '/api/v2/login';

      await this.axiosInstance.post(logoutEndpoint);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      this.token = null;
      delete this.axiosInstance.defaults.headers.common['Csrf-Token'];
      delete this.axiosInstance.defaults.headers.common['Cookie'];
    }
  }

  /**
   * Check if the client is authenticated
   */
  isAuthenticated(): boolean {
    return this.token !== null;
  }

  /**
   * Get the current authentication token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Get the Omada Controller ID
   */
  getOmadacId(): string | null {
    return this.omadacId;
  }

  /**
   * Get the controller information
   */
  getControllerInfo(): OmadaControllerInfo | null {
    return this.controllerInfo;
  }

  /**
   * Get the axios instance for making custom API calls
   * This allows users to access unpublished APIs directly
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Make a generic API request
   * This is a helper method for making authenticated requests to any Omada API endpoint
   */
  async request<T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data?: unknown
  ): Promise<T> {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated. Please call login() first.');
    }

    const url = this.omadacId ? `/${this.omadacId}${endpoint}` : endpoint;

    const response = await this.axiosInstance.request<OmadaAPIResponse<T>>({
      method,
      url,
      data,
    });

    if (response.data.errorCode !== 0) {
      throw new Error(`API request failed: ${response.data.msg}`);
    }

    return response.data.result;
  }

  /**
   * GET request helper
   */
  async get<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  /**
   * POST request helper
   */
  async post<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }

  /**
   * PUT request helper
   */
  async put<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>('PUT', endpoint, data);
  }

  /**
   * DELETE request helper
   */
  async delete<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }

  /**
   * PATCH request helper
   */
  async patch<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>('PATCH', endpoint, data);
  }
}
