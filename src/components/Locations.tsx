import axios from "axios";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import Chat from "./Chat";

interface LocationInterface {
    id: number,
    name: string,
    image: string,
    description: string
}
const Locations = (): React.ReactNode => {
    const [locationData, setLocationData] = useState<LocationInterface[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>('Loading');
    const navigate = useNavigate();

    const fetchData = async (): Promise<void> => {
      try {
        const response = await axios.get<LocationInterface[]>(`http://localhost:4000/locations`);
        setLocationData(response.data)
        setErrorMessage("");

      } catch(err) {
        setErrorMessage("Some Error! Data hasn't fetched...")
      }
    }
    useEffect(()=>{
      fetchData();
    },[]);

    const handleClick = (location: LocationInterface): void =>{
      navigate(`/book/${location.id}/${location.name}`)
    }
    const displayLocations = (): React.ReactNode =>{
      let counter=0;
      return (
        <div style={{display: "grid", gridTemplateColumns:'repeat(3,1fr)', gap: "40px", padding:'30px'}}>
        {locationData.map((location:LocationInterface) =>{
          counter++;
          return (
            <div key={location.id} style={{border: '1px dashed black', textAlign:'center', padding:'12px'}}>
              <div>
                <img src= {location.image} alt={(location.id).toString()} height={300} width={300}/>
              </div>
              <h3>{location.name}</h3>
              <p>{location.description}</p>
              <button style={{background:'red', color:'white', padding: '8px', marginBottom:'12px'}} onClick={()=>handleClick(location)}>Book</button>
            </div>
          )
        })
        }
        </div>
      )
    }
    const locationRooms = locationData.map(l => l.name);

    return (
    <>
    {
      locationData.length ? (
        <>
        {displayLocations()}
        <Chat mode="floating" rooms={['General', ...locationRooms]} defaultRoom="General" />
        </>
      ): (
        <>
        {errorMessage}
        </>
      )
    }
    <h2>App.jsx</h2>
    <pre>
      {`import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import Locations from "./components/Locations"
import Book from "./components/Book"
import ViewBookings from "./components/ViewBookings"
import EditBooking from "./components/EditBooking"

function App() {
  return (
    <>
        <BrowserRouter>
    <Navbar title={"Travels App"}/>
      <Routes>
        <Route path="/" element={<Locations/>}/>
        <Route path="/book/:locationId/:locationName" element={<Book/>} />
        <Route path="/viewBookings" element={<ViewBookings/>}/>
        <Route path="/editBooking/:bookingId" element= {<EditBooking/>} />
        <Route path="*" element={<Navigate to= '/' />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
`}
    </pre>

    <h2>Navbar.jsx</h2>
    <pre>
      {`import { NavLink } from "react-router-dom"

const Navbar = ({title}: {title: string}): React.ReactNode => {
  return (
    <>
    <div style={{display:'flex', gap:"40px", padding:"20px", alignItems:'center', color:'white'}}>
      <div style={{fontSize:'24px'}}>{title}</div>
      <NavLink to={""} style={({isActive}) => ({color: isActive ? 'orange' : 'white', textDecoration: 'none'})}><span style={{color:''}} >Home</span></NavLink>
      <NavLink to={"/viewBookings"} style={({isActive}) => ({color: isActive ? 'orange' : 'white', textDecoration: 'none'})}>View Bookings</NavLink>
    </div>
    </>
  )
}

export default Navbar
`}
    </pre>
    <h2>Location.jsx -- current Page</h2>
    <pre>{`import axios from "axios";
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";

interface LocationInterface {
    id: number,
    name: string,
    image: string,
    description: string
}
const Locations = (): React.ReactNode => {
    const [locationData, setLocationData] = useState<LocationInterface[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>('Loading');
    const navigate = useNavigate();

    const fetchData = async (): Promise<void> => {
      try {
        const response = await axios.get<LocationInterface[]>(\`http://localhost:4000/locations\`);
        setLocationData(response.data)
        setErrorMessage("");

      } catch(err) {
        setErrorMessage("Some Error! Data hasn't fetched...")
      }
    }
    useEffect(()=>{
      fetchData();
    },[]);

    const handleClick = (location: LocationInterface): void =>{
      navigate(\`/book/\${location.id}/\${location.name}\`)
    }
    const displayLocations = (): React.ReactNode =>{
      let counter=0;
      return (
        <div style={{display: "grid", gridTemplateColumns:'repeat(3,1fr)', gap: "40px", padding:'30px'}}>
        {locationData.map((location:LocationInterface) =>{
          counter++;
          return (
            <div key={location.id} style={{border: '1px dashed black', textAlign:'center', padding:'12px'}}>
              <div>
                <img src= {location.image} alt={(location.id).toString()} height={300} width={300}/>
              </div>
              <h3>{location.name}</h3>
              <p>{location.description}</p>
              <button style={{background:'red', color:'white', padding: '8px', marginBottom:'12px'}} onClick={()=>handleClick(location)}>Book</button>
            </div>
          )
        })
        }
        </div>
      )
    }
    return (
    <>
    {
      locationData.length ? (
        <>
        {displayLocations()}
        </>
      ): (
        <>
        {errorMessage}
        </>
      )
    }`}</pre>
    </>
  )
}

export default Locations