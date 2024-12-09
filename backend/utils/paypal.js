// pay pal helper functions
import dotenv from 'dotenv'
dotenv.config()
const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET, PAYPAL_API_URL } = process.env

/**
 * Fetches an access token from the PayPal API.
 * @see {@link https://developer.paypal.com/reference/get-an-access-token/#link-getanaccesstoken}
 *
 * @returns {Promise<string>} The access token if the request is successful.
 * @throws {Error} If the request is not successful.
 *
 * helper function
 */

// 1
async function getPayPalAccessToken() {
  // Authorization header requires base64 hash encoding and secret
  const auth = Buffer.from(PAYPAL_CLIENT_ID + ':' + PAYPAL_APP_SECRET).toString('base64')

  //  make request to:
  const url = `${PAYPAL_API_URL}/v1/oauth2/token`

  const headers = {
    Accept: 'application/json',
    'Accept-Language': 'en_US',
    // send hash here
    Authorization: `Basic ${auth}`,
  }

  // set body to cliet credentials
  const body = 'grant_type=client_credentials'
  //   make POST fetch re1quest
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
  })

  // if fails
  if (!response.ok) throw new Error('Failed to get access token')

  // if passes
  const paypalData = await response.json()

  // return token / this is used in the following code
  return paypalData.access_token
}

/**
 * Checks if a PayPal transaction is new by comparing the transaction ID with existing orders in the database.
 *
 * @param {Mongoose.Model} orderModel - The Mongoose model for the orders in the database.
 * @param {string} paypalTransactionId - The PayPal transaction ID to be checked.
 * @returns {Promise<boolean>} Returns true if it is a new transaction (i.e., the transaction ID does not exist in the database), false otherwise.
 * @throws {Error} If there's an error in querying the database.
 *
 */

// we call this from the fronted to check if new order (CHECKS THE ORDER MODEL IN DB)
// go through the orders in the database and look for that transaciton id
export async function checkIfNewTransaction(orderModel, paypalTransactionId) {
  try {
    // Find all documents where Order.paymentResult.id is the same as the id passed paypalTransactionId
    const orders = await orderModel.find({
      'paymentResult.id': paypalTransactionId,
    })

    // return false if it finds a transaction that matches
    // returns an array with that order
    // If there are no such orders, then it's a new transaction.
    // returns true if no orders have been found so we can precede
    return orders.length === 0
  } catch (err) {
    console.error(err)
  }
}

/**
 * Verifies a PayPal payment by making a request to the PayPal API.
 * @see {@link https://developer.paypal.com/docs/api/orders/v2/#orders_get}
 *
 * @param {string} paypalTransactionId - The PayPal transaction ID to be verified.
 * @returns {Promise<Object>} An object with properties 'verified' indicating if the payment is completed and 'value' indicating the payment amount.
 * @throws {Error} If the request is not successful.
 *
 */

// 2 - export and pass in transaction id
export async function verifyPayPalPayment(paypalTransactionId) {
  const accessToken = await getPayPalAccessToken()
  //make a request to: xxx with the transaction id
  const paypalResponse = await fetch(
    `${PAYPAL_API_URL}/v2/checkout/orders/${paypalTransactionId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        // add the token
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
  //   if not ok throw the error
  if (!paypalResponse.ok) throw new Error('Failed to verify payment')

  // if ok then we return this verified status = completed and value returned
  const paypalData = await paypalResponse.json()
  return {
    verified: paypalData.status === 'COMPLETED',
    value: paypalData.purchase_units[0].amount.value,
  }
}
