# TP-Link Omada API

A TypeScript library for interacting with the TP-Link Omada Controller API. This adapter provides access to both published and unpublished (undocumented) APIs, making it easy to integrate Omada network management into your applications.

## Features

- 🔐 **Authentication**: Login and session management with the Omada Controller
- 🚀 **TypeScript Support**: Full type definitions for better development experience
- 🔧 **Flexible API Access**: Access both documented and undocumented endpoints
- 🛡️ **Error Handling**: Built-in error handling and response validation
- 🔄 **Axios-based**: Uses Axios for HTTP requests with interceptors
- 📝 **Easy to Use**: Simple, intuitive API for common operations

## Installation

```bash
npm install tplink-omada-api
```

## Quick Start

```typescript
import { OmadaClient } from 'tplink-omada-api';

const client = new OmadaClient({
  baseUrl: 'https://your-controller-url:8443',
  username: 'admin',
  password: 'your-password',
  strictSSL: false, // Set to true with valid SSL certificates
});

// Login to the controller
await client.login();

// Make API requests
const sites = await client.get('/api/v2/sites');

// Logout when done
await client.logout();
```

## Configuration

The `OmadaClient` constructor accepts an `OmadaClientConfig` object:

```typescript
interface OmadaClientConfig {
  baseUrl: string;        // Omada Controller URL (e.g., https://controller:8443)
  username: string;       // Username for authentication
  password: string;       // Password for authentication
  strictSSL?: boolean;    // Validate SSL certificates (default: true)
  timeout?: number;       // Request timeout in milliseconds (default: 30000)
}
```

## Usage Examples

### Basic Authentication

```typescript
import { OmadaClient } from 'tplink-omada-api';

const client = new OmadaClient({
  baseUrl: 'https://192.168.1.1:8443',
  username: 'admin',
  password: 'password123',
  strictSSL: false,
});

try {
  await client.login();
  console.log('Logged in successfully!');
  console.log('Token:', client.getToken());
  console.log('Controller ID:', client.getOmadacId());
} catch (error) {
  console.error('Login failed:', error);
}
```

### Making API Requests

The client provides convenient methods for different HTTP methods:

```typescript
// GET request
const sites = await client.get('/api/v2/sites');

// POST request
const result = await client.post('/api/v2/sites/{siteId}/devices', {
  mac: '00:11:22:33:44:55',
  name: 'My Device',
});

// PUT request
await client.put('/api/v2/sites/{siteId}/settings', {
  setting: 'value',
});

// DELETE request
await client.delete('/api/v2/sites/{siteId}/devices/{deviceId}');
```

### Accessing Unpublished APIs

You can access the underlying Axios instance for complete control:

```typescript
const axiosInstance = client.getAxiosInstance();

// Make any custom request
const response = await axiosInstance.get('/some/undocumented/endpoint');
```

### Using Environment Variables

Create a `.env` file in your project:

```env
OMADA_BASE_URL=https://your-controller:8443
OMADA_USERNAME=admin
OMADA_PASSWORD=your-password
```

Then use it in your code:

```typescript
import { OmadaClient } from 'tplink-omada-api';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new OmadaClient({
  baseUrl: process.env.OMADA_BASE_URL!,
  username: process.env.OMADA_USERNAME!,
  password: process.env.OMADA_PASSWORD!,
  strictSSL: false,
});
```

## API Reference

### OmadaClient

#### Constructor

```typescript
new OmadaClient(config: OmadaClientConfig)
```

#### Methods

- `login(): Promise<void>` - Authenticate with the Omada Controller
- `logout(): Promise<void>` - End the current session
- `isAuthenticated(): boolean` - Check if currently authenticated
- `getToken(): string | null` - Get the current authentication token
- `getOmadacId(): string | null` - Get the Omada Controller ID
- `getControllerInfo(): OmadaControllerInfo | null` - Get controller information
- `getAxiosInstance(): AxiosInstance` - Get the underlying Axios instance
- `get<T>(endpoint: string): Promise<T>` - Make a GET request
- `post<T>(endpoint: string, data?: unknown): Promise<T>` - Make a POST request
- `put<T>(endpoint: string, data?: unknown): Promise<T>` - Make a PUT request
- `delete<T>(endpoint: string): Promise<T>` - Make a DELETE request
- `patch<T>(endpoint: string, data?: unknown): Promise<T>` - Make a PATCH request
- `request<T>(method, endpoint, data?): Promise<T>` - Make a generic request

## Development

### Building the Project

```bash
npm run build
```

### Linting

```bash
npm run lint        # Check for issues
npm run lint:fix    # Fix issues automatically
```

### Formatting

```bash
npm run format       # Format code
npm run format:check # Check formatting
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Disclaimer

This library is not officially supported by TP-Link. Use at your own risk. The library provides access to both published and unpublished APIs - use responsibly and be aware that unpublished APIs may change without notice.