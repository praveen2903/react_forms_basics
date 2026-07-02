import axiosClient from "../api/axiosClient";
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
      const response = await axiosClient.get<LocationInterface[]>(`/locations`);
      setLocationData(response.data)
      setErrorMessage("");

    } catch (err) {
      setErrorMessage("Some Error! Data hasn't fetched...")
    }
  }
  useEffect(() => {
    fetchData();
  }, []);

  const handleClick = (location: LocationInterface): void => {
    navigate(`/book/${location.id}/${location.name}`)
  }
  const displayLocations = (): React.ReactNode => {
    let counter = 0;
    return (
      <div style={{ display: "grid", gridTemplateColumns: 'repeat(3,1fr)', gap: "40px", padding: '30px' }}>
        {locationData.map((location: LocationInterface) => {
          counter++;
          return (
            <div key={location.id} style={{ border: '1px dashed black', textAlign: 'center', padding: '12px' }}>
              <div>
                <img src={location.image} alt={(location.id).toString()} height={300} width={300} />
              </div>
              <h3>{location.name}</h3>
              <p>{location.description}</p>
              <button style={{ background: 'red', color: 'white', padding: '8px', marginBottom: '12px' }} onClick={() => handleClick(location)}>Book</button>
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
        ) : (
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

      <pre>
        {`{
  "locations": [
    {
      "id": 1,
      "name": "Goa Beach",
      "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      "description": "Enjoy the golden beaches, water sports, nightlife, and beautiful sunsets in Goa."
    },
    {
      "id": 2,
      "name": "Ooty",
      "image": "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
      "description": "Experience the cool climate, tea plantations, scenic mountains, and toy train rides."
    },
    {
      "id": 3,
      "name": "Manali",
      "image": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963",
      "description": "A paradise for nature lovers with snow-covered mountains, adventure sports, and valleys."
    },
    {
      "id": 4,
      "name": "Kerala Backwaters",
      "image": "https://images.unsplash.com/photo-1472396961693-142e6e269027",
      "description": "Cruise through peaceful backwaters, stay in houseboats, and enjoy lush greenery."
    },
    {
      "id": 5,
      "name": "Jaipur",
      "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41",
      "description": "Explore magnificent forts, royal palaces, colorful bazaars, and rich Rajasthani culture."
    },
    {
      "id": 6,
      "name": "Mysore",
      "image": "https://images.unsplash.com/photo-1589308078059-be1415eab4c3",
      "description": "Visit the grand Mysore Palace, Chamundi Hills, and experience the city's royal heritage."
    }
  ],
  "bookings": [
    {
      "locationName": "Ooty",
      "name": "Rahul Sharma",
      "email": "rahul.sharma@example.com",
      "phoneNumber": "9876543210",
      "visitDate": "2026-07-15",
      "packageType": "Premium",
      "noOfPeople": 4,
      "passengerDetails": [
        {
          "passengerName": "Rahul Sharma",
          "gender": "Male",
          "age": 32,
          "preferences": []
        },
        {
          "passengerName": "Sneha Sharma",
          "gender": "Female",
          "age": 29,
          "preferences": []
        },
        {
          "passengerName": "Aarav Sharma",
          "gender": "Male",
          "age": 8,
          "preferences": [
            "Travel Insurance",
            "Vegetarian"
          ]
        },
        {
          "passengerName": "Ananya Sharma",
          "gender": "Female",
          "age": 5,
          "preferences": [
            "Vegetarian",
            "Wheelchair Assistance"
          ]
        }
      ],
      "id": 1
    },
    {
      "locationName": "Goa Beach",
      "name": "Priya Reddy",
      "email": "priya.reddy@example.com",
      "phoneNumber": "9123456789",
      "visitDate": "2026-08-01",
      "packageType": "Normal",
      "noOfPeople": 2,
      "passengerDetails": [
        {
          "passengerName": "Priya Reddy",
          "gender": "Female",
          "age": 27,
          "preferences": []
        },
        {
          "passengerName": "Kiran Reddy",
          "gender": "Male",
          "age": 30,
          "preferences": []
        }
      ],
      "id": 2
    },
    {
      "locationName": "Ooty",
      "name": "Praveen",
      "email": "rokkamsaipraveen5l0@gmail.com",
      "phoneNumber": "7969522435",
      "visitDate": "2026-07-01",
      "packageType": "Fasttrack",
      "noOfPeople": 2,
      "passengerDetails": [
        {
          "passengerName": "Praveen",
          "gender": "Male",
          "age": 22,
          "preferences": [
            "Travel Insurance"
          ]
        },
        {
          "passengerName": "Sai",
          "gender": "Female",
          "age": 23,
          "preferences": [
            "Vegetarian",
            "Travel Insurance"
          ]
        }
      ],
      "id": 4
    }
  ]
}

To run the json server:- npx json-server --watch db.json --port 4000`}
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