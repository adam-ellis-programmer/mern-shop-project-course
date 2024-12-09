import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'
//
// This component dynamically displays a star rating based on the value prop,
// where each star's state (full, half, or empty) corresponds to the numeric rating.
// For example, a rating of 3.5 will render three full stars, one half-star,
// and the rest as empty stars.

// prettier-ignore
const Rating = ({value, text}) => {
  return (
    <div className='rating'>
        <span>{value >= 1 ? <FaStar/> : value >= 0.5 ? <FaStarHalfAlt/> : <FaRegStar/>}</span>
        <span>{value >= 2 ? <FaStar/> : value >= 1.5 ? <FaStarHalfAlt/> : <FaRegStar/>}</span>
        <span>{value >= 3 ? <FaStar/> : value >= 2.5 ? <FaStarHalfAlt/> : <FaRegStar/>}</span>
        <span>{value >= 4 ? <FaStar/> : value >= 3.5 ? <FaStarHalfAlt/> : <FaRegStar/>}</span>
        <span>{value >= 5 ? <FaStar/> : value >= 4.5 ? <FaStarHalfAlt/> : <FaRegStar/>}</span>
        <span className="rating-text">{text && text}</span>
    </div>
  )
}

export default Rating
