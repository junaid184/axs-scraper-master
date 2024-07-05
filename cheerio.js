import axios from 'axios';
import cheerio from 'cheerio';
import https from 'https'; // Import https module
import proxyChain from 'proxy-chain';
import { headers } from './config.js';

async function fetchEventInfo() {
  const eventPageUrl = 'https://www.axs.com/events/564913/bob-the-drag-queen-tickets';
  const oldProxyUrl = "http://OR1657325346:r2uyMQp1@208.194.204.255:7514";
  const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);
  console.log(newProxyUrl)
  const axiosInstance = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: false, // Add this only if you are using self-signed certificates
      ciphers: 'DEFAULT:!SSLv2:!SSLv3', // Adjust based on server requirements
      minVersion: 'TLSv1.2', // Specify the minimum acceptable TLS version
      proxy: {
        host: newProxyUrl.split(':')[1].substring(2), // Extract host from newProxyUrl
        port: newProxyUrl.split(':')[2].split('@')[0], // Extract port from newProxyUrl
        auth: {
          username: newProxyUrl.split(':')[1].split('@')[0], // Extract username from newProxyUrl
          password: newProxyUrl.split(':')[2].split('@')[1], // Extract password from newProxyUrl
        },
      },
    }),
  });

  try {
    // Fetch HTML page content with proxy and headers
    const response = await axiosInstance.get(eventPageUrl, {
      headers: {
        ...headers, // Merge custom headers from config.js if needed
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.1 Safari/537.36',
      },
    });

    const html = response.data;

    // Load HTML into Cheerio
    const $ = cheerio.load(html);

    // Find the anchor tag with the specified class
    const anchorTag = $('.btn-new.btn-color-blue.btn-size-xxxlarge.btn-max-width');
    const url = anchorTag.attr('href'); // Extract the href attribute

    if (!url) {
      throw new Error('Anchor tag with specified class not found');
    }

    // Make a request to the extracted URL with proxy and headers
    const eventDetailsResponse = await axiosInstance.get(url, {
      headers: headers
    });

    const eventData = eventDetailsResponse.data;

    // Process and extract desired information from eventData
    // For example, you might use Cheerio again to parse eventData if it's HTML

    // Log or return the fetched data for further processing
    console.log(eventData);

  } catch (error) {
    console.error('Error fetching event information:', error.message);
  }
}

// Call the function to start fetching data
fetchEventInfo();
