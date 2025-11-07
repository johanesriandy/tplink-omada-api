import { OmadaClient, OmadaClientConfig } from '../src';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Basic usage example for the Omada API Client
 * 
 * Before running this example, create a .env file in the project root with:
 * OMADA_BASE_URL=https://your-controller-url:8443
 * OMADA_USERNAME=your-username
 * OMADA_PASSWORD=your-password
 */
async function main() {
  // Configure the Omada client
  const config: OmadaClientConfig = {
    baseUrl: process.env.OMADA_BASE_URL || 'https://localhost:8443',
    username: process.env.OMADA_USERNAME || 'admin',
    password: process.env.OMADA_PASSWORD || 'admin',
    strictSSL: false, // Set to true in production with valid SSL certificates
    timeout: 30000, // 30 seconds
  };

  // Create a new Omada client instance
  const client = new OmadaClient(config);

  try {
    console.log('Attempting to login to Omada Controller...');
    
    // Login to the controller
    await client.login();
    
    console.log('✓ Successfully logged in!');
    console.log('Token:', client.getToken());
    console.log('Controller ID:', client.getOmadacId());
    console.log('Controller Info:', client.getControllerInfo());

    // Example: Make a custom API request to get sites
    // You can use the client.get(), client.post(), etc. methods for any API endpoint
    try {
      const sites = await client.get('/api/v2/sites');
      console.log('\nSites:', JSON.stringify(sites, null, 2));
    } catch (error) {
      console.log('Note: Could not fetch sites (this is okay if you need to specify a site-specific endpoint)');
    }

    // Example: Use the raw axios instance for complete control
    // This is useful for accessing unpublished APIs
    const axiosInstance = client.getAxiosInstance();
    console.log('\nYou can now use the axios instance for any custom API calls');

    // Always logout when done
    await client.logout();
    console.log('\n✓ Logged out successfully');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the example
main();
