import axios from "axios";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import '../App.css'

interface PassengerDetails {
  passengerName: string;
  gender: string;
  age: number;
  preferences: string[]
}
interface Bookings {
  locationId: number;
  locationName: string,
  name: string;
  email: string;
  phoneNumber: string;
  visitDate: string;
  packageType: string;
  noOfPeople: number;
  passengerDetails: PassengerDetails[];
  id: number,
}
const ViewBookings = () => {
  const navigate= useNavigate();
  const [bookings, setBookings] = useState<Bookings[]>([]);
  const fetchData = async (): Promise<void> => {
    const response = await axios.get('http://localhost:4000/bookings');
    setBookings(response.data)
  }
  useEffect(()=>{
    fetchData();
  },[])
  const handleEdit = (booking:Bookings) =>{
    navigate(`/editBooking/${booking.id}`)
  }
  return (
    <div className="view-bookings-container">
      <h2>View Bookings</h2>

      <table className="booking-table">
        <thead>
          <tr>
            <th>Booking Id</th>
            <th>Name</th>
            <th>Phone Number</th>
            <th>Passengers</th>
            <th>Visit Date</th>
            <th>Package</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>{booking.id}</td>
              <td>{booking.name}</td>
              <td>{booking.phoneNumber}</td>
              <td>{booking.noOfPeople}</td>
              <td>{booking.visitDate}</td>
              <td>{booking.packageType}</td>
              <td>
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(booking)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ViewBookings