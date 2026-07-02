import axiosClient from "../api/axiosClient";
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
    const response = await axiosClient.get('/bookings');
    setBookings(response.data)
  }

  const handleDelete= async(booking: Bookings): Promise<void> => {
    try {
      const deleteId = booking.id;
      await axiosClient.delete(`/bookings/${booking.id}`);
      setBookings(booking=> booking.filter( book => book.id !== deleteId))
    } catch(err){
      console.log(err)
    }
  }
  useEffect(()=>{
    fetchData();
  },[])
  const handleEdit = (booking:Bookings) =>{
    navigate(`/editBooking/${booking.id}`)
  }
  return (
    <>
    <div className="view-bookings-container">
      <h2>View Bookings</h2>

      <table className="booking-table">
        <thead>
          <tr>
            {/* <th>Booking Id</th> */}
            <th>Name</th>
            <th>Location</th>
            <th>Phone Number</th>
            <th>Passengers</th>
            <th>Visit Date</th>
            <th>Package</th>
            <th colSpan={2}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              {/* <td>{booking.id}</td> */}
              <td>{booking.name}</td>
              <td>{booking.locationName}</td>
              <td>{booking.phoneNumber}</td>
              <td>{booking.noOfPeople}</td>
              <td>{booking.visitDate}</td>
              <td>{booking.packageType}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(booking)}> Edit </button>
              </td>
              <td>
                <button className="delete-btn" onClick={()=> handleDelete(booking)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <br/>
      <br/>
    </div>
    <h2>Showing how to delete axios to view</h2>
    <pre>{`import axios from "axios";
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

  const handleDelete= async(booking: Bookings): Promise<void> => {
    try {
      const deleteId = booking.id;
      await axios.delete(\`http://localhost:4000/bookings/\${booking.id}\`);
      setBookings(booking=> booking.filter( book => book.id !== deleteId))
    } catch(err){
      console.log(err)
    }
  }
  useEffect(()=>{
    fetchData();
  },[])
  const handleEdit = (booking:Bookings) =>{
    navigate(\`/editBooking/\${booking.id}\`)
  }
  return (
    <div className="view-bookings-container">
      <h2>View Bookings</h2>

      <table className="booking-table">
        <thead>
          <tr>
            {/* <th>Booking Id</th> */}
            <th>Name</th>
            <th>Location</th>
            <th>Phone Number</th>
            <th>Passengers</th>
            <th>Visit Date</th>
            <th>Package</th>
            <th colSpan={2}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              {/* <td>{booking.id}</td> */}
              <td>{booking.name}</td>
              <td>{booking.locationName}</td>
              <td>{booking.phoneNumber}</td>
              <td>{booking.noOfPeople}</td>
              <td>{booking.visitDate}</td>
              <td>{booking.packageType}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(booking)}> Edit </button>
              </td>
              <td>
                <button className="delete-btn" onClick={()=> handleDelete(booking)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ViewBookings`}</pre>
    </>
  )
}

export default ViewBookings