import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
// outlet is the page we need to show if logged in
const PrivateRoute = () => {
  const { userInfo } = useSelector((state) => state.auth)
  // The replace attribute in the <Navigate /> component
  // is used to replace the current entry in the browser's history stack instead of
  // adding a new entry. This means the user won't be able to navigate back to the original
  // page using the browser's "Back" button after being redirected.
  return userInfo ? <Outlet /> : <Navigate to="/login" replace />
}
export default PrivateRoute
