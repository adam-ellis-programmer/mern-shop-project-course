import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap'
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import Message from '../components/Message'
import Loader from '../components/Loader'
import {
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useGetPaypalClientIdQuery,
  useDeliverOrderMutation,
} from '../slices/ordersApiSlice'
const OrderScreen = () => {
  const { id: orderId } = useParams()

  const { data: order, refetch, isLoading, error } = useGetOrderDetailsQuery(orderId)
  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation()

  // RTK:
  // update (PUT) the order - USED ON APROVE
  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation()

  /**
   * can be re-named dispatch = payPalDispatch
   */
  // RTK
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer()
  const { userInfo } = useSelector((state) => state.auth)

  const {
    data: paypal,
    isLoading: loadingPayPal,
    error: errorPayPal,
  } = useGetPaypalClientIdQuery()

  useEffect(() => {
    if (!errorPayPal && !loadingPayPal && paypal.clientId) {
      const loadPaypalScript = async () => {
        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': paypal.clientId,
            currency: 'USD',
          },
        })
        // call paypal dispatch
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' })
      }
      // condition to run script
      if (order && !order.isPaid) {
        // check if already not loaded
        if (!window.paypal) {
          loadPaypalScript()
        }
      }
    }
  }, [errorPayPal, loadingPayPal, order, paypal, paypalDispatch])

  // updates the order info to payed etc
  // actions have a bunch of methods we can use
  // form the paypal SDK
  function onApprove(data, actions) {
    // capture() finalize the payment process for an order.
    return actions.order.capture().then(async function (details) {
      try {
        await payOrder({ orderId, details }).unwrap()
        // gets most upto date data - redux
        refetch()
        toast.success('Order is paid')
      } catch (err) {
        toast.error(err?.data?.message || err.error)
      }
    })
  }

  function onError(err) {
    toast.error(err.message)
  }

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: order.totalPrice },
          },
        ],
      })
      .then((orderID) => {
        console.log('ORDER ID ---> ', orderID)
        return orderID
      })
  }

  // DOES NOT TRIGGER PAYPAL
  // WE JUST UPDATE THE PAY ORDER
  // AS NOT GETTING DETAILS FROM PAYPAL
  // WE SET DETAILS TO OBJ AND PAYER EMPY OBJECT
  async function onApproveTest() {
    // we do not have the payer details as a test function
    await payOrder({ orderId, details: { payer: {} } })
    refetch()

    toast.success('Order is paid')
  }

  const deliverOrderHandler = async () => {
    try {
      await deliverOrder(orderId)
      toast.success('Order Delivered')
      refetch()
    } catch (err) {
      toast.error(err.data.message || err.message)
    }
  }

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant="danger">{error?.data?.message || error.error}</Message>
  ) : (
    <>
      <h1>Order {order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Name: </strong> {order.user.name}
              </p>
              <p>
                <strong>Email: </strong>{' '}
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </p>
              <p>
                <strong>Address:</strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
              {order.isDelivered ? (
                <Message variant="success">Delivered on {order.deliveredAt}</Message>
              ) : (
                <Message variant="danger">Not Delivered</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <Message variant="success">Paid on {order.paidAt}</Message>
              ) : (
                <Message variant="danger">Not Paid</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {order.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <ListGroup variant="flush">
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image src={item.image} alt={item.name} fluid rounded />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>{item.name}</Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x ${item.price} = ${item.qty * item.price}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        {/* -------- */}
        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>${order.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>${order.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>${order.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>${order.totalPrice}</Col>
                </Row>
              </ListGroup.Item>
              {/* PAY ORDER PLACEHOLDER */}
              {!order.isPaid && (
                <ListGroup.Item>
                  {loadingPay && <Loader />}

                  {isPending ? (
                    <Loader />
                  ) : (
                    <div>
                      {/* <Button style={{ marginBottom: '10px' }} onClick={onApproveTest}>
                        Test Pay Order
                      </Button> */}
                      <div>
                        <PayPalButtons
                          createOrder={createOrder}
                          onApprove={onApprove}
                          onError={onError}
                        ></PayPalButtons>
                      </div>
                    </div>
                  )}
                </ListGroup.Item>
              )}
              {/* {MARK AS DELIVERED PLACEHOLDER} */}

              {loadingDeliver && <Loader />}

              {/* if all this is true we can add the list item with the button */}
              {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                <ListGroup.Item>
                  <Button
                    type="button"
                    className="btn btn-block"
                    onClick={deliverOrderHandler}
                  >
                    Mark As Delivered
                  </Button>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  )
}

export default OrderScreen
