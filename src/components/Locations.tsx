import axios from "axios";
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
    }
    </>
  )
}

export default Locations