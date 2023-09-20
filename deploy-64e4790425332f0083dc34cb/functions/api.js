const express = require('express');
const serverless = require('serverless-http');
const app = express();
const router = express.Router();
const cors = require('cors');
const axios = require('axios');

app.use(cors({ origin: '*' }));

// Shopify API configuration
const shopifyBaseUrl = 'https://cake-toppersindia.myshopify.com';
const apiKey = '83fba880b88dca43b821712e4bdf2acc';
const password = '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';
const apiVersion = '2023-07'; // Replace with your desired Shopify API version

// Function to fetch orders since a specific order ID
async function fetchOrdersSinceId(sinceId) {
  try {
    const response = await axios.get(`${shopifyBaseUrl}/admin/api/${apiVersion}/orders.json?fields=fulfillment_status=any&limit=250`, {
      auth: {
        username: apiKey,
        password: password,
      },
      params: {
        since_id: sinceId,
        status : 'any'
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Get all orders
router.get("/", async (req, resp) => {
  console.log("Function triggered");
  const allOrders = [];
  let sinceId = null;

  try {
    // Loop until all orders are fetched
    while (true) {
      const orders = await fetchOrdersSinceId(sinceId);
      if (orders.orders.length === 0) {
        break; // No more orders to fetch
      }
      allOrders.push(...orders.orders);
      sinceId = orders.orders[orders.orders.length - 1].id; // Update since_id
    }
    resp.json(allOrders);
  } catch (error) {
    console.error("Axios error:", error);
    resp.status(500).json({ error: 'Error fetching data.' });
  }
});


module.exports = router;
app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);
