import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import Locations from "./components/Locations"
import Book from "./components/Book"
import ViewBookings from "./components/ViewBookings"
import EditBooking from "./components/EditBooking"
import ChatPage from "./components/ChatPage"
import Login from "./components/Login"
import Register from "./components/Register"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar title={"Travels App"}/>
        <Routes>
          <Route path="/" element={<Locations/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          
          <Route element={<ProtectedRoute />}>
            <Route path="/book/:locationId/:locationName" element={<Book/>} />
            <Route path="/viewBookings" element={<ViewBookings/>}/>
            <Route path="/editBooking/:bookingId" element= {<EditBooking/>} />
            <Route path="/chat" element={<ChatPage/>} />
          </Route>
          
          <Route path="*" element={<Navigate to='/' />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
