import { Alert } from 'react-bootstrap'

const Message = ({ variant = 'info', children }) => {
  //  children goes inbetween <MESSAGAGE> TEXT ETC</MESSAGE/> call
  return <Alert variant={variant}>{children}</Alert>
}

export default Message
