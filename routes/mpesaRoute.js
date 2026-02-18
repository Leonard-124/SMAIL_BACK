
// const express = require('express');
// const axios = require('axios');
// // const cors = require('cors');
// require('dotenv').config();



// const router = express.Router()



// // M-Pesa Configuration
// const MPESA_CONFIG = {
//   consumerKey: process.env.MPESA_CONSUMER_KEY,
//   consumerSecret: process.env.MPESA_CONSUMER_SECRET,
//   shortcode: process.env.MPESA_SHORTCODE,
//   passkey: process.env.MPESA_PASSKEY,
//   callbackUrl: process.env.MPESA_CALLBACK_URL,
//   authUrl: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
//   stkPushUrl: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
// };

// // Generate Access Token
// const getAccessToken = async () => {
//   try {
//     const auth = Buffer.from(
//       `${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`
//     ).toString('base64');

//     const response = await axios.get(MPESA_CONFIG.authUrl, {
//       headers: {
//         Authorization: `Basic ${auth}`
//       }
//     });

//     return response.data.access_token;
//   } catch (error) {
//     console.error('Error getting access token:', error.response?.data || error.message);
//     throw new Error('Failed to get M-Pesa access token');
//   }
// };

// // Generate Password
// const generatePassword = () => {
//   const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
//   const password = Buffer.from(
//     `${MPESA_CONFIG.shortcode}${MPESA_CONFIG.passkey}${timestamp}`
//   ).toString('base64');
  
//   return { password, timestamp };
// };

// // STK Push Route
// router.post('/api/mpesa/stkpush', async (req, res) => {
//   try {
//     const { phone, amount, accountReference = 'Order', transactionDesc = 'Payment' } = req.body;

//     // Validate input
//     if (!phone || !amount) {
//       return res.status(400).json({
//         success: false,
//         message: 'Phone number and amount are required'
//       });
//     }

//     // Format phone number (remove leading 0, add 254)
//     let formattedPhone = phone.replace(/\s/g, '');
//     if (formattedPhone.startsWith('0')) {
//       formattedPhone = '254' + formattedPhone.substring(1);
//     } else if (!formattedPhone.startsWith('254')) {
//       formattedPhone = '254' + formattedPhone;
//     }

//     // Get access token
//     const accessToken = await getAccessToken();
    
//     // Generate password and timestamp
//     const { password, timestamp } = generatePassword();

//     // STK Push payload
//     const stkPushPayload = {
//       BusinessShortCode: MPESA_CONFIG.shortcode,
//       Password: password,
//       Timestamp: timestamp,
//       TransactionType: 'CustomerPayBillOnline',
//       Amount: Math.ceil(amount), // Ensure whole number
//       PartyA: formattedPhone,
//       PartyB: MPESA_CONFIG.shortcode,
//       PhoneNumber: formattedPhone,
//       CallBackURL: MPESA_CONFIG.callbackUrl,
//       AccountReference: accountReference,
//       TransactionDesc: transactionDesc
//     };

//     // Send STK Push request
//     const response = await axios.post(
//       MPESA_CONFIG.stkPushUrl,
//       stkPushPayload,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     console.log('STK Push Response:', response.data);

//     res.status(200).json({
//       success: true,
//       message: 'STK Push sent successfully',
//       data: response.data
//     });

//   } catch (error) {
//     console.error('STK Push Error:', error.response?.data || error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to initiate STK Push',
//       error: error.response?.data || error.message
//     });
//   }
// });

// // M-Pesa Callback Route
// router.post('/api/mpesa/callback', (req, res) => {
//   console.log('===== M-Pesa Callback =====');
//   console.log(JSON.stringify(req.body, null, 2));

//   const { Body } = req.body;

//   if (Body?.stkCallback) {
//     const { ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;

//     if (ResultCode === 0) {
//       // Payment successful
//       const metadata = {};
//       CallbackMetadata?.Item?.forEach(item => {
//         metadata[item.Name] = item.Value;
//       });

//       console.log('Payment Successful:', {
//         amount: metadata.Amount,
//         mpesaRef: metadata.MpesaReceiptNumber,
//         phone: metadata.PhoneNumber,
//         transactionDate: metadata.TransactionDate
//       });

//       // Here you would typically update your database
//       // e.g., mark order as paid, send confirmation email, etc.
//     } else {
//       console.log('Payment Failed:', ResultDesc);
//     }
//   }

//   // Always respond with success to M-Pesa
//   res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
// });

// // Query STK Push Status
// router.post('/api/mpesa/query', async (req, res) => {
//   try {
//     const { checkoutRequestId } = req.body;

//     if (!checkoutRequestId) {
//       return res.status(400).json({
//         success: false,
//         message: 'CheckoutRequestID is required'
//       });
//     }

//     const accessToken = await getAccessToken();
//     const { password, timestamp } = generatePassword();

//     const queryPayload = {
//       BusinessShortCode: MPESA_CONFIG.shortcode,
//       Password: password,
//       Timestamp: timestamp,
//       CheckoutRequestID: checkoutRequestId
//     };

//     const response = await axios.post(
//       'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
//       queryPayload,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     res.status(200).json({
//       success: true,
//       data: response.data
//     });

//   } catch (error) {
//     console.error('Query Error:', error.response?.data || error.message);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to query transaction status',
//       error: error.response?.data || error.message
//     });
//   }
// });

// module.exports = router;
//////////////////////////////////////////////////////////////////////////////////////////////////

const express = require("express");
const axios = require("axios");

const router = express.Router();

// ✅ FIX: removed /api/mpesa prefix from all routes — server.js mounts this router at /api/mpesa
// So router.post('/stkpush') becomes /api/mpesa/stkpush — consistent with RESTful convention

const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  shortcode: process.env.MPESA_SHORTCODE,
  passkey: process.env.MPESA_PASSKEY,
  callbackUrl: process.env.MPESA_CALLBACK_URL,
  // ✅ Switch URLs from sandbox to production via env variable
  authUrl:
    process.env.MPESA_AUTH_URL ||
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
  stkPushUrl:
    process.env.MPESA_STK_PUSH_URL ||
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
  queryUrl:
    process.env.MPESA_QUERY_URL ||
    "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query",
};

const getAccessToken = async () => {
  const auth = Buffer.from(
    `${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`
  ).toString("base64");

  const response = await axios.get(MPESA_CONFIG.authUrl, {
    headers: { Authorization: `Basic ${auth}` },
  });
  return response.data.access_token;
};

const generatePassword = () => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, -3);
  const password = Buffer.from(
    `${MPESA_CONFIG.shortcode}${MPESA_CONFIG.passkey}${timestamp}`
  ).toString("base64");
  return { password, timestamp };
};

// STK Push — POST /api/mpesa/stkpush
router.post("/stkpush", async (req, res) => {
  try {
    const {
      phone,
      amount,
      accountReference = "AlmoFarm",
      transactionDesc = "Payment",
    } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ success: false, message: "Phone and amount are required" });
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Amount must be a positive number" });
    }

    let formattedPhone = String(phone).replace(/\s/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith("254")) {
      formattedPhone = "254" + formattedPhone;
    }

    if (!/^2547\d{8}$/.test(formattedPhone)) {
      return res.status(400).json({ success: false, message: "Invalid Kenyan phone number" });
    }

    const accessToken = await getAccessToken();
    const { password, timestamp } = generatePassword();

    const payload = {
      BusinessShortCode: MPESA_CONFIG.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(Number(amount)),
      PartyA: formattedPhone,
      PartyB: MPESA_CONFIG.shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: MPESA_CONFIG.callbackUrl,
      AccountReference: accountReference.substring(0, 12),
      TransactionDesc: transactionDesc.substring(0, 13),
    };

    const response = await axios.post(MPESA_CONFIG.stkPushUrl, payload, {
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    });

    res.status(200).json({
      success: true,
      message: "STK Push sent successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("STK Push Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Failed to initiate payment",
      error: process.env.NODE_ENV === "production" ? undefined : error.response?.data || error.message,
    });
  }
});

// Callback — POST /api/mpesa/callback
router.post("/callback", (req, res) => {
  try {
    const { Body } = req.body;

    if (Body?.stkCallback) {
      const { ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;

      if (ResultCode === 0) {
        const metadata = {};
        CallbackMetadata?.Item?.forEach((item) => {
          metadata[item.Name] = item.Value;
        });
        console.log("✅ M-Pesa Payment Successful:", {
          amount: metadata.Amount,
          ref: metadata.MpesaReceiptNumber,
          phone: metadata.PhoneNumber,
          date: metadata.TransactionDate,
        });
        // TODO: persist to DB, send confirmation email
      } else {
        console.log("❌ M-Pesa Payment Failed:", ResultDesc);
      }
    }
  } catch (err) {
    console.error("Callback processing error:", err.message);
  }

  // Always acknowledge to Safaricom
  res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
});

// Query Status — POST /api/mpesa/query
router.post("/query", async (req, res) => {
  try {
    const { checkoutRequestId } = req.body;
    if (!checkoutRequestId) {
      return res.status(400).json({ success: false, message: "CheckoutRequestID required" });
    }

    const accessToken = await getAccessToken();
    const { password, timestamp } = generatePassword();

    const response = await axios.post(
      MPESA_CONFIG.queryUrl,
      {
        BusinessShortCode: MPESA_CONFIG.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      },
      {
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      }
    );

    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error("Query Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Failed to query transaction",
    });
  }
});

module.exports = router;