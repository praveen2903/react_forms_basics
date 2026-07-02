import React, { useState } from "react";
import { useParams } from "react-router-dom";
import '../App.css'
import axios from "axios";

interface RouteParams extends Record<string, string | undefined> {
  locationId: string;
  locationName: string;
}
interface PassengerDetails {
  passengerName: string;
  gender: string;
  age: number;
  preferences: string[]
}

interface BookingData {
  locationName: string,
  name: string;
  email: string;
  phoneNumber: string;
  visitDate: string;
  packageType: string;
  noOfPeople: number;
  passengerDetails: PassengerDetails[];
}

interface BookingErrors {
  nameError: string;
  emailError: string;
  phoneNumberError: string;
  visitDateError: string;
  packageTypeError: string;
  noOfPeopleError: string;
}
interface BookingValid {
  nameValid: boolean;
  emailValid: boolean;
  phoneNumberValid: boolean;
  visitDateValid: boolean;
  packageTypeValid: boolean;
  noOfPeopleValid: boolean,
  buttonActive: boolean;
}

const Book = (): React.ReactNode => {
  const { locationId, locationName } = useParams<RouteParams>();  //same as defined in app.tsx

  const [formData, setFormData] = useState<BookingData>({
    locationName: locationName ?? '',
    name: "",
    email: "",
    phoneNumber: "",
    visitDate: "",
    packageType: '',
    noOfPeople: 1,
    passengerDetails: [
      {
        passengerName: "",
        gender: "",
        age: 0,
        preferences: []
      },
    ],
  });

  const [formErrors, setFormErrors] = useState<BookingErrors>({
    nameError: "",
    emailError: "",
    phoneNumberError: "",
    visitDateError: "",
    packageTypeError: "",
    noOfPeopleError: "",
  });
  const [formValid, setFormValid] = useState<BookingValid>({
    nameValid: false,
    emailValid: false,
    phoneNumberValid: false,
    visitDateValid: false,
    noOfPeopleValid: false,
    packageTypeValid: false,
    buttonActive: false
  });

  const [successMessage, setSuccess] = useState<string>('');
  const [errorMessage, setError]= useState<string>('');

const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,index?: number): void => {
  const { name, value, type } = event.target;

  if (index !== undefined) {
    const passengers = [...formData.passengerDetails];
    switch (name) {
      case "passengerName":
        passengers[index].passengerName = value;
        break;
      case "gender":
        passengers[index].gender = value;
        break;
      case "passengerAge":
        passengers[index].age = Number(value);
        break;
      case "preferences":
        console.log(event.target)
        if ((event.target as HTMLInputElement).checked) {
          passengers[index].preferences.push(value);
        } else {
          passengers[index].preferences = passengers[index].preferences.filter(item => item !== value);
        }
        break;
    }
    setFormData({...formData, passengerDetails: passengers});
    return;
  }

  // Main form fields
  const fieldValue = type === "checkbox" ? (event.target as HTMLInputElement).checked : value;

  if (name === "noOfPeople" && !(Number(value)<0 && Number(value)>8)) {
    const count = Number(fieldValue);

    const passengers = Array.from({ length: count }, (_, i) => ({
      passengerName: formData.passengerDetails[i]?.passengerName || "",
      gender: formData.passengerDetails[i]?.gender || "",
      age: formData.passengerDetails[i]?.age || 0,
      preferences: formData.passengerDetails[i]?.preferences || []
    }));
    setFormData({...formData, noOfPeople: count, passengerDetails: passengers});
    validateFieldValue(name, fieldValue);
    return;
  }

  setFormData({...formData, [name]: fieldValue});
  validateFieldValue(name, fieldValue);
};

  const validateFieldValue= (fieldName: string, fieldValue: string|boolean):void => {
    const newFormErrors = {...formErrors};
    const newFormValid = {...formValid};

    switch(fieldName) {
      case "name":
        if(fieldValue === "") {
          newFormErrors.nameError= "Field Rquired";
          newFormValid.nameValid = false
        }
        else if(fieldValue.toString()?.length <3) {
          newFormErrors.nameError = "Minimum 3 characters required"
          newFormValid.nameValid = false
        }
        else if(fieldValue.toString().length >40) {
          newFormErrors.nameError = "maxium 40 characters only";
          newFormValid.nameValid = false
        }
        else {
          newFormErrors.nameError = '';
          newFormValid.nameValid = true;
        }
        break;

      case "email" : 
          if(fieldValue == '') {
            newFormErrors.emailError = 'Email is required';
            newFormValid.emailValid = false
          }
          else if(!/^[A-Za-z][A-Za-z0-9+_.]*@[A-Za-z]+\.(com|in)$/.test(fieldValue.toString())){
            newFormErrors.emailError = 'Email format incorrect';
            newFormValid.emailValid = false;
          }
          else{
            newFormErrors.emailError = '';
            newFormValid.emailValid = true;
          }
          break;

      case "phoneNumber" :
        if(fieldValue == '') {
          newFormErrors.phoneNumberError = 'Phone Number required'
          newFormValid.phoneNumberValid = false;
        }
        else if(fieldValue.toString().length>10) {
          newFormErrors.phoneNumberError = '10 numbers for phone Number';
          newFormValid.phoneNumberValid = false;
        }
        else if(!/^[6-9]{2}[0-9]{8}$/.test(fieldValue.toString())){
          newFormErrors.phoneNumberError = 'Phone Number is incorrect';
          newFormValid.phoneNumberValid = false;
        }
        else {
          newFormErrors.phoneNumberError = '';
          newFormValid.phoneNumberValid = true;
        }
        break;

      case "visitDate" :
        if(fieldValue=='') {
          newFormErrors.visitDateError = 'visit date required'
          newFormValid.visitDateValid = false;
        }
        else if(new Date(fieldValue.toString()) <= new  Date()){
          newFormErrors.visitDateError = 'visit date cannot be past date'
          newFormValid.visitDateValid = false;
        }
        else{
          newFormErrors.visitDateError = '';
          newFormValid.visitDateValid = true;
        }
        break;
      case "packageType":
        if(fieldValue == ''){
          newFormErrors.packageTypeError = 'Package Type required'
          newFormValid.packageTypeValid = false;
        }
        else{
          newFormErrors.packageTypeError ='';
          newFormValid.packageTypeValid = true;
        }
        break;
      case 'noOfPeople':
        if(fieldValue == '') {
          newFormErrors.noOfPeopleError = "specify no.of people";
          newFormValid.noOfPeopleValid = false;
        }
        else if(Number(fieldValue)>8) {
          newFormErrors.noOfPeopleError = 'Maximum of 8 people';
          newFormValid.noOfPeopleValid = false;
        }
        else if(Number(fieldValue)<0) {
          newFormErrors.noOfPeopleError = 'Minimum 1 people required';
          newFormValid.noOfPeopleValid = false
        }
        else {
          newFormErrors.noOfPeopleError ='';
          newFormValid.noOfPeopleValid =true
        }
        break
    }
    newFormValid.buttonActive= newFormValid.nameValid && newFormValid.emailValid && newFormValid.noOfPeopleValid && newFormValid.packageTypeValid && newFormValid.phoneNumberValid && newFormValid.visitDateValid;
    setFormErrors(newFormErrors)
    setFormValid(newFormValid)
  }

  const submitForm =(event:React.FormEvent<HTMLFormElement>):void=> {
    event.preventDefault();
    try {
      axios.post('http://localhost:4000/bookings', formData);
      setSuccess("Successful submission");
      setError('')
    } catch(err) {
      setError("Some Error")
      setSuccess('')
    }
  }

  return (
    <>
    <div className="book-container">
      <h2>Booking Form</h2>
      <form className="booking-form" onSubmit={submitForm}>
        <label>Location Id: </label>
        <input type="text" value={locationId} disabled/>
        <label>Location Name: </label>
        <input type="text" value={formData.locationName} disabled />
        <label>User Name:</label>
        <input type="text" name="name" id="name" value={formData.name} placeholder="Enter User Name..." onChange={(e)=>handleChange(e)}  />
        {formErrors.nameError && (
          <span className="error">{formErrors.nameError}</span>
        )}
        <label>Email</label>
        <input type="text" name="email" id="email" value={formData.email} placeholder="Enter email..." onChange={(e)=>handleChange(e)} />
        {formErrors.emailError && (
          <span className="error">{formErrors.emailError}</span>
        )}
        <label>Phone Number</label>
        <input type="text" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} placeholder="Enter Phone Number..." onChange={(e)=>handleChange(e)} />
        {formErrors.phoneNumberError && (
          <span className="error">{formErrors.phoneNumberError}</span>
        )}
        <label>Visit Date:</label>
        <input type="date" name="visitDate" id="visitDate" value={formData.visitDate} placeholder="Visit Date.." onChange={(e)=>handleChange(e)} />
        {formErrors.visitDateError && (
          <span className="error">{formErrors.visitDateError}</span>
        )}
        <label>Package Type</label>
        <select name="packageType" value={formData.packageType} onChange={(e)=>handleChange(e)}>
          <option value="">--select--</option>
          <option value="Normal">Normal</option>
          <option value="Premium">Premium</option>
          <option value="Fasttrack">FastTrack</option>
        </select>
        {formErrors.packageTypeError && (
          <span className="error">{formErrors.packageTypeError}</span>
        )}
        <label>No Of People:</label>
        <input type="text" name="noOfPeople" id="noOfPeople" value={formData.noOfPeople} placeholder="No of people visiting..." onChange={(e)=>handleChange(e)} min={1} max={8} />

        {formErrors.noOfPeopleError && (
          <span className="error">{formErrors.noOfPeopleError}</span>
        )}
        <div>
        {
          formData.passengerDetails.map((passenger, index)=> (
            <>
            <h3>Passenger {index+1}</h3>
            <div key={index} className="passenger-card">
              <label>Passenger Name: </label>
              <input type="text" value={passenger?.passengerName} name="passengerName" id="passengerName" onChange={(e)=>handleChange(e,index)}/>
              <label>Gender:</label>
              <div className="radio-group">
                <label>
                  <input type="radio" value="Male" name={`gender`} id="Male" checked={passenger?.gender =="Male"} onChange={(e)=>handleChange(e,index)}/>
                  Male
                </label>
                <label>
                  <input type="radio" value="Female" name={`gender`} id="Female" checked={passenger?.gender =="Female"} onChange={(e)=>handleChange(e,index)}/>
                Female
                </label>
                <label>
                  <input type="radio" value="Others" name={`gender`} id="Others" checked={passenger?.gender =="Others"} onChange={(e)=>handleChange(e,index)}/>
                    Others  
                </label>              
                </div><label>Age:</label>
              <input type="text" value={passenger?.age} name="passengerAge" id="passengerAge" onChange={(e)=>handleChange(e,index)}/>
              <div className="checkbox-group">
                <label>Preferences:</label>         
              <label>
              <input type="checkbox" name="preferences" value="Vegetarian" checked={passenger?.preferences.includes("Vegetarian")} onChange={(e)=>handleChange(e,index)}/>
              Vegetarian
            </label>

            <label>
              <input type="checkbox" name="preferences" value="Wheelchair Assistance" checked={passenger?.preferences.includes("Wheelchair Assistance")} onChange={(e)=>handleChange(e,index)}/>
              Wheelchair Assistance
            </label>

            <label>
              <input type="checkbox" name="preferences" value="Senior Citizen" checked={passenger?.preferences.includes("Senior Citizen")} onChange={(e)=>handleChange(e,index)}/>
              Senior Citizen
            </label>

            <label>
              <input type="checkbox" name="preferences" value="Child" checked={passenger?.preferences.includes("Child")} onChange={(e)=>handleChange(e,index)}/>
              Child
            </label>

            <label>
              <input type="checkbox" name="preferences" value="Travel Insurance" checked={passenger?.preferences.includes("Travel Insurance")} onChange={(e)=>handleChange(e,index)}/>
              Travel Insurance
            </label>
              </div>
            </div>
            </>
          ))
        }
        </div>
        <button type="submit" disabled={!formValid.buttonActive}>Book</button>
      </form>
      {successMessage.length>0 && (
        <span>{successMessage}</span>
      )}
      {errorMessage.length >0 && (
        <span>{errorMessage}</span>
      )}
    </div>

    <h2>Booking.jsx -- post method and basic validations and react form demo </h2>
    <pre> {`import React, { useState } from "react";
import { useParams } from "react-router-dom";
import '../App.css'
import axios from "axios";

interface RouteParams extends Record<string, string | undefined> {
  locationId: string;
  locationName: string;
}
interface PassengerDetails {
  passengerName: string;
  gender: string;
  age: number;
  preferences: string[]
}

interface BookingData {
  locationName: string,
  name: string;
  email: string;
  phoneNumber: string;
  visitDate: string;
  packageType: string;
  noOfPeople: number;
  passengerDetails: PassengerDetails[];
}

interface BookingErrors {
  nameError: string;
  emailError: string;
  phoneNumberError: string;
  visitDateError: string;
  packageTypeError: string;
  noOfPeopleError: string;
}
interface BookingValid {
  nameValid: boolean;
  emailValid: boolean;
  phoneNumberValid: boolean;
  visitDateValid: boolean;
  packageTypeValid: boolean;
  noOfPeopleValid: boolean,
  buttonActive: boolean;
}

const Book = (): React.ReactNode => {
  const { locationId, locationName } = useParams<RouteParams>();  //same as defined in app.tsx

  const [formData, setFormData] = useState<BookingData>({
    locationName: locationName ?? '',
    name: "",
    email: "",
    phoneNumber: "",
    visitDate: "",
    packageType: '',
    noOfPeople: 1,
    passengerDetails: [
      {
        passengerName: "",
        gender: "",
        age: 0,
        preferences: []
      },
    ],
  });

  const [formErrors, setFormErrors] = useState<BookingErrors>({
    nameError: "",
    emailError: "",
    phoneNumberError: "",
    visitDateError: "",
    packageTypeError: "",
    noOfPeopleError: "",
  });
  const [formValid, setFormValid] = useState<BookingValid>({
    nameValid: false,
    emailValid: false,
    phoneNumberValid: false,
    visitDateValid: false,
    noOfPeopleValid: false,
    packageTypeValid: false,
    buttonActive: false
  });

  const [successMessage, setSuccess] = useState<string>('');
  const [errorMessage, setError]= useState<string>('');

const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,index?: number): void => {
  const { name, value, type } = event.target;

  if (index !== undefined) {
    const passengers = [...formData.passengerDetails];
    switch (name) {
      case "passengerName":
        passengers[index].passengerName = value;
        break;
      case "gender":
        passengers[index].gender = value;
        break;
      case "passengerAge":
        passengers[index].age = Number(value);
        break;
      case "preferences":
        console.log(event.target)
        if ((event.target as HTMLInputElement).checked) {
          passengers[index].preferences.push(value);
        } else {
          passengers[index].preferences = passengers[index].preferences.filter(item => item !== value);
        }
        break;
    }
    setFormData({...formData, passengerDetails: passengers});
    return;
  }

  // Main form fields
  const fieldValue = type === "checkbox" ? (event.target as HTMLInputElement).checked : value;

  if (name === "noOfPeople" && !(Number(value)<0 && Number(value)>8)) {
    const count = Number(fieldValue);

    const passengers = Array.from({ length: count }, (_, i) => ({
      passengerName: formData.passengerDetails[i]?.passengerName || "",
      gender: formData.passengerDetails[i]?.gender || "",
      age: formData.passengerDetails[i]?.age || 0,
      preferences: formData.passengerDetails[i]?.preferences || []
    }));
    setFormData({...formData, noOfPeople: count, passengerDetails: passengers});
    validateFieldValue(name, fieldValue);
    return;
  }

  setFormData({...formData, [name]: fieldValue});              ---------------> Important since updating the object is this way
  validateFieldValue(name, fieldValue);
};

  const validateFieldValue= (fieldName: string, fieldValue: string|boolean):void => {
    const newFormErrors = {...formErrors};
    const newFormValid = {...formValid};

    switch(fieldName) {
      case "name":
        if(fieldValue === "") {
          newFormErrors.nameError= "Field Rquired";
          newFormValid.nameValid = false
        }
        else if(fieldValue.toString()?.length <3) {
          newFormErrors.nameError = "Minimum 3 characters required"
          newFormValid.nameValid = false
        }
        else if(fieldValue.toString().length >40) {
          newFormErrors.nameError = "maxium 40 characters only";
          newFormValid.nameValid = false
        }
        else {
          newFormErrors.nameError = '';
          newFormValid.nameValid = true;
        }
        break;

      case "email" : 
          if(fieldValue == '') {
            newFormErrors.emailError = 'Email is required';
            newFormValid.emailValid = false
          }
          else if(!/^[A-Za-z][A-Za-z0-9+_.]*@[A-Za-z]+\.(com|in)$/.test(fieldValue.toString())){
            newFormErrors.emailError = 'Email format incorrect';
            newFormValid.emailValid = false;
          }
          else{
            newFormErrors.emailError = '';
            newFormValid.emailValid = true;
          }
          break;

      case "phoneNumber" :
        if(fieldValue == '') {
          newFormErrors.phoneNumberError = 'Phone Number required'
          newFormValid.phoneNumberValid = false;
        }
        else if(fieldValue.toString().length>10) {
          newFormErrors.phoneNumberError = '10 numbers for phone Number';
          newFormValid.phoneNumberValid = false;
        }
        else if(!/^[6-9]{2}[0-9]{8}$/.test(fieldValue.toString())){
          newFormErrors.phoneNumberError = 'Phone Number is incorrect';
          newFormValid.phoneNumberValid = false;
        }
        else {
          newFormErrors.phoneNumberError = '';
          newFormValid.phoneNumberValid = true;
        }
        break;

      case "visitDate" :
        if(fieldValue=='') {
          newFormErrors.visitDateError = 'visit date required'
          newFormValid.visitDateValid = false;
        }
        else if(new Date(fieldValue.toString()) <= new  Date()){
          newFormErrors.visitDateError = 'visit date cannot be past date'
          newFormValid.visitDateValid = false;
        }
        else{
          newFormErrors.visitDateError = '';
          newFormValid.visitDateValid = true;
        }
        break;
      case "packageType":
        if(fieldValue == ''){
          newFormErrors.packageTypeError = 'Package Type required'
          newFormValid.packageTypeValid = false;
        }
        else{
          newFormErrors.packageTypeError ='';
          newFormValid.packageTypeValid = true;
        }
        break;
      case 'noOfPeople':
        if(fieldValue == '') {
          newFormErrors.noOfPeopleError = "specify no.of people";
          newFormValid.noOfPeopleValid = false;
        }
        else if(Number(fieldValue)>8) {
          newFormErrors.noOfPeopleError = 'Maximum of 8 people';
          newFormValid.noOfPeopleValid = false;
        }
        else if(Number(fieldValue)<0) {
          newFormErrors.noOfPeopleError = 'Minimum 1 people required';
          newFormValid.noOfPeopleValid = false
        }
        else {
          newFormErrors.noOfPeopleError ='';
          newFormValid.noOfPeopleValid =true
        }
        break
    }
    newFormValid.buttonActive= newFormValid.nameValid && newFormValid.emailValid && newFormValid.noOfPeopleValid && newFormValid.packageTypeValid && newFormValid.phoneNumberValid && newFormValid.visitDateValid;
    setFormErrors(newFormErrors)
    setFormValid(newFormValid)
  }

  const submitForm =(event:React.FormEvent<HTMLFormElement>):void=> {
    event.preventDefault();
    try {
      axios.post('http://localhost:4000/bookings', formData);
      setSuccess("Successful submission");
      setError('')
    } catch(err) {
      setError("Some Error")
      setSuccess('')
    }
  }

  return (
    <div className="book-container">
      <h2>Booking Form</h2>
      <form className="booking-form" onSubmit={submitForm}>
        <label>Location Id: </label>
        <input type="text" value={locationId} disabled/>
        <label>Location Name: </label>
        <input type="text" value={formData.locationName} disabled />
        <label>User Name:</label>
        <input type="text" name="name" id="name" value={formData.name} placeholder="Enter User Name..." onChange={(e)=>handleChange(e)}  />
        {formErrors.nameError && (
          <span className="error">{formErrors.nameError}</span>
        )}
        <label>Email</label>
        <input type="text" name="email" id="email" value={formData.email} placeholder="Enter email..." onChange={(e)=>handleChange(e)} />
        {formErrors.emailError && (
          <span className="error">{formErrors.emailError}</span>
        )}
        <label>Phone Number</label>
        <input type="text" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} placeholder="Enter Phone Number..." onChange={(e)=>handleChange(e)} />
        {formErrors.phoneNumberError && (
          <span className="error">{formErrors.phoneNumberError}</span>
        )}
        <label>Visit Date:</label>
        <input type="date" name="visitDate" id="visitDate" value={formData.visitDate} placeholder="Visit Date.." onChange={(e)=>handleChange(e)} />
        {formErrors.visitDateError && (
          <span className="error">{formErrors.visitDateError}</span>
        )}
        <label>Package Type</label>
        <select name="packageType" value={formData.packageType} onChange={(e)=>handleChange(e)}>
          <option value="">--select--</option>
          <option value="Normal">Normal</option>
          <option value="Premium">Premium</option>
          <option value="Fasttrack">FastTrack</option>
        </select>
        {formErrors.packageTypeError && (
          <span className="error">{formErrors.packageTypeError}</span>
        )}
        <label>No Of People:</label>
        <input type="text" name="noOfPeople" id="noOfPeople" value={formData.noOfPeople} placeholder="No of people visiting..." onChange={(e)=>handleChange(e)} min={1} max={8} />

        {formErrors.noOfPeopleError && (
          <span className="error">{formErrors.noOfPeopleError}</span>
        )}
        <div>
        {
          formData.passengerDetails.map((passenger, index)=> (
            <>
            <h3>Passenger {index+1}</h3>
            <div key={index} className="passenger-card">
              <label>Passenger Name: </label>
              <input type="text" value={passenger?.passengerName} name="passengerName" id="passengerName" onChange={(e)=>handleChange(e,index)}/>
              <label>Gender:</label>
              <div className="radio-group">
                <label>
                  <input type="radio" value="Male" name={\`gender\`} id="Male" checked={passenger?.gender =="Male"} onChange={(e)=>handleChange(e,index)}/>
                  Male
                </label>
                <label>
                  <input type="radio" value="Female" name={\`gender\`} id="Female" checked={passenger?.gender =="Female"} onChange={(e)=>handleChange(e,index)}/>
                Female
                </label>
                <label>
                  <input type="radio" value="Others" name={\`gender\`} id="Others" checked={passenger?.gender =="Others"} onChange={(e)=>handleChange(e,index)}/>
                    Others  
                </label>              
                </div><label>Age:</label>
              <input type="text" value={passenger?.age} name="passengerAge" id="passengerAge" onChange={(e)=>handleChange(e,index)}/>
              <div className="checkbox-group">
                <label>Preferences:</label>         
              <label>
              <input type="checkbox" name="preferences" value="Vegetarian" checked={passenger?.preferences.includes("Vegetarian")} onChange={(e)=>handleChange(e,index)}/>
              Vegetarian
            </label>

            <label>
              <input type="checkbox" name="preferences" value="Wheelchair Assistance" checked={passenger?.preferences.includes("Wheelchair Assistance")} onChange={(e)=>handleChange(e,index)}/>
              Wheelchair Assistance
            </label>

            <label>
              <input type="checkbox" name="preferences" value="Senior Citizen" checked={passenger?.preferences.includes("Senior Citizen")} onChange={(e)=>handleChange(e,index)}/>
              Senior Citizen
            </label>

            <label>
              <input type="checkbox" name="preferences" value="Child" checked={passenger?.preferences.includes("Child")} onChange={(e)=>handleChange(e,index)}/>
              Child
            </label>

            <label>
              <input type="checkbox" name="preferences" value="Travel Insurance" checked={passenger?.preferences.includes("Travel Insurance")} onChange={(e)=>handleChange(e,index)}/>
              Travel Insurance
            </label>
              </div>
            </div>
            </>
          ))
        }
        </div>
        <button type="submit" disabled={!formValid.buttonActive}>Book</button>
      </form>
      {successMessage.length>0 && (
        <span>{successMessage}</span>
      )}
      {errorMessage.length >0 && (
        <span>{errorMessage}</span>
      )}
    </div>
  );
};

export default Book;`}</pre>
    </>
  );
};

export default Book;