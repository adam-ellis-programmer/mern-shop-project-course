import { LinkContainer } from 'react-router-bootstrap'
import { Table, Button, Row, Col } from 'react-bootstrap'
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa'
import Message from '../../components/Message'
import Loader from '../../components/Loader'
import { toast } from 'react-toastify'
import Paginate from '../../components/Paginate'
import {
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useCreateProductMutation,
  useDeleteProductMutation,
} from '../../slices/productsApiSlice'
import { useParams } from 'react-router-dom'

// is loading is used to stop the errors while fetching data
const ProductListScreen = () => {
  const { pageNumber } = useParams()
  const { data, isLoading, error, refetch } = useGetProductsQuery({ pageNumber })

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure')) {
      try {
        await deleteProduct(id)
        refetch()
      } catch (err) {
        toast.error(err?.data?.message || err.error)
      }
    }
  }

  // from the productSlice.js
  // use deleteMutation = RTK Query's hooks
  const [createProduct, { isLoading: loadingCreate }] = useCreateProductMutation()
  const [deleteProduct, { isLoading: loadingDelete }] = useDeleteProductMutation()

  const createProductHandler = async () => {
    if (window.confirm('Are you sure you want to create a new product?')) {
      try {
        await createProduct().unwrap() // NOTE: here we need to unwrap the Promise to catch any rejection in our catch block
        toast.success('product deleted')
        // refetch to manually refetch the data
        refetch()
      } catch (err) {
        console.log(err)
        toast.error(err?.data?.message || err.error)
      }
    }
  }

  return (
    <>
      <Row className="align-items-center">
        <Col>
          <h1>Products</h1>
        </Col>
        <Col className="text-end">
          <Button onClick={createProductHandler} className="btn-sm m-3">
            <FaPlus /> Create Product
          </Button>
        </Col>
      </Row>

      {loadingCreate && <Loader />}
      {loadingDelete && <Loader />}

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error.data.message}</Message>
      ) : (
        <>
          <Table striped bordered hover responsive className="table-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>BRAND</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((product) => (
                <tr key={product._id}>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>${product.price}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>
                    <LinkContainer to={`/admin/product/${product._id}/edit`}>
                      <Button variant="light" className="btn-sm mx-2">
                        <FaEdit />
                      </Button>
                    </LinkContainer>
                    <Button
                      variant="danger"
                      className="btn-sm"
                      onClick={() => deleteHandler(product._id)}
                    >
                      <FaTrash style={{ color: 'white' }} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {/* PAGINATE PLACEHOLDER */}
          <Paginate pages={data.pages} page={data.page} isAdmin={true} />
        </>
      )}
    </>
  )
}

export default ProductListScreen
