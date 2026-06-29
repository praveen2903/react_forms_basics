import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import Locations from "./components/Locations"
import Book from "./components/Book"
import ViewBookings from "./components/ViewBookings"

function App() {
  return (
    <>
        <BrowserRouter>
    <Navbar title={"Travels App"}/>
      <Routes>
        <Route path="/" element={<Locations/>}/>
        <Route path="/book/:locationId/:locationName" element={<Book/>} />
        <Route path="/viewBookings" element={<ViewBookings/>}/>
        <Route path="*" element={<Navigate to= '/' />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
