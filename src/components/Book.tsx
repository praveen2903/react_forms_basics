import React, { useState } from "react";
import { useParams } from "react-router-dom";
import '../App.css'
import type { ReactFormState } from "react-dom/client";

interface RouteParams extends Record<string, string | undefined> {
  locationId: string;
  locationName: string;
}
interface PassengerDetails {
  name: string;
  gender: string;
  age: number;
  preferences: string[]
}

interface BookingData {
  locationId: number;
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
  passengerDetailsError: string
}
interface BookingValid {
  nameValid: boolean;
  emailValid: boolean;
  phoneNumberValid: boolean;
  visitDateValid: boolean;
  packageTypeValid: boolean;
  noOfPeopleValid: boolean,
  passengerDetailsValid: boolean,
  buttonActive: boolean;
}

const Book = (): React.ReactNode => {
  const { locationId, locationName } = useParams<RouteParams>();  //same as defined in app.tsx

  const [formData, setFormData] = useState<BookingData>({
    locationId: Number(locationId ?? 0),
    locationName: locationName ?? '',
    name: "",
    email: "",
    phoneNumber: "",
    visitDate: "",
    packageType: '',
    noOfPeople: 1,
    passengerDetails: [
      {
        name: "",
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
    passengerDetailsError:""
  });
  const [formValid, setFormValid] = useState<BookingValid>({
    nameValid: false,
    emailValid: false,
    phoneNumberValid: false,
    visitDateValid: false,
    noOfPeopleValid: false,
    packageTypeValid: false,
    passengerDetailsValid: false,
    buttonActive: false
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name } = event.target;
    const fieldValue = event.target instanceof HTMLInputElement && event.target.type === "checkbox" ? event.target.checked : event.target.value;

    const newFormData = {
      ...formData,
      [name]: fieldValue,
    };

    validateFieldValue(name, fieldValue);
    setFormData(newFormData);
  };
  const validateFieldValue= (fieldName: string, fieldValue: string|boolean):void => {
    const newFormErrors = {...formErrors};
    const newFormValid = {...formValid};

    switch(fieldName) {
      case "userName":
        if(fieldValue === "") {
          newFormErrors.nameError= "Field Rquired";
          newFormValid.nameValid = false
        }
        else if(fieldValue.toString()?.length <3) {
          newFormErrors.nameError = "Minimum 3 characters required"
          newFormValid.nameValid = false
        }
        else if(fieldValue.toString().length >15) {
          newFormErrors.nameError = "maxium 20 characters only";
          newFormValid.nameValid = false
        }
        else {
          newFormErrors.nameError = '';
          newFormValid.nameValid = true;
        }
      case "email" : 
          if(fieldValue == '') {
            newFormErrors.emailError = 'Email is required';
            newFormValid.emailValid = false
          }
          else if(/^[A-Za-z]{1}[A-Za-z0-9+_.]+\@[A-Za-z]+\.(com|in)$/.test(fieldValue.toString())){
            newFormErrors.emailError = 'Email format incorrect';
            newFormValid.emailValid = false;
          }
          else{
            newFormErrors.emailError = '';
            newFormValid.emailValid = true;
          }
      case "phoneNumber" :
        if(fieldValue == '') {
          newFormErrors.phoneNumberError = 'Phone Number required'
          newFormValid.phoneNumberValid = false;
        }
        else if(/^[6-9]{2}[0-9]{8}$/.test(fieldValue.toString())){
          newFormErrors.phoneNumberError = 'Phone Nuber is incorrect';
          newFormValid.phoneNumberValid = false;
        }
        else {
          newFormErrors.phoneNumberError = '';
          newFormValid.phoneNumberValid = true;
        }

      case "visitDate" :
        if(fieldValue=='') {
          newFormErrors.visitDateError = 'visit date required'
          newFormValid.visitDateValid = false;
        }
        else if(new Date(fieldValue.toString()) <new  Date()){
          newFormErrors.visitDateError = 'visit date cannot be past date'
          newFormValid.visitDateValid = false;
        }
        else{
          newFormErrors.visitDateError = '';
          newFormValid.visitDateValid = true;
        }
      case "packageType":
        if(fieldValue == ''){
          newFormErrors.packageTypeError = 'Package Type required'
          newFormValid.packageTypeValid = false;
        }
        else{
          newFormErrors.packageTypeError ='';
          newFormValid.packageTypeValid = true;
        }
      case 'noOfPeople':
    }
  }

  return (
    <div className="book-container">
      <h2>Booking Form</h2>
      <form className="booking-form">
        <label>Location Id: </label>
        <input type="text" value={formData.locationId} disabled/>
        <label>Location Name: </label>
        <input type="text" value={formData.locationName} disabled />
        <label>User Name:</label>
        <input type="text" name="userName" id="userName" value={formData.name} placeholder="Enter User Name..." />
        <label>Email</label>
        <input type="text" name="email" id="email" value={formData.email} placeholder="Enter email..." />
        <label>Phone Number</label>
        <input type="text" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} placeholder="Enter Phone Number..."/>
        <label>Visit Date:</label>
        <input type="date" name="visitDate" id="visitDate" value={formData.visitDate} placeholder="Visit Date.."/>
        <label>Package Type</label>
        <select name="packageType" value={formData.packageType}>
          <option value="">--select--</option>
          <option value="Normal">Normal</option>
          <option value="Premium">Premium</option>
          <option value="Fasttrack">FastTrack</option>
        </select>
        <label>No Of People:</label>
        <input type="number" name="noOfPeople" id="noOfPeople" value={formData.noOfPeople} placeholder="No of people visiting..."/>
        {
          [...Array(formData.noOfPeople)].map((_, index)=> (
            <div key={index} className="passenger-card">
              <label>Passenger Name: </label>
              <input type="text" value={formData.passengerDetails[index].name} name="passengerName" id="passengerName"/>
              <label>Gender:</label>
              <div className="radio-group">
                <label>
                  <input type="radio" value="Male" name={`passengerGender-${index}`} id="Male" checked={formData.passengerDetails[index].gender =="Male"}/>
                  Male
                </label>
                <label>
                  <input type="radio" value="Female" name={`passengerGender-${index}`} id="Female" checked={formData.passengerDetails[index].gender =="Female"}/>
                Female
                </label>
                <label>
                  <input type="radio" value="Others" name={`passengerGender-${index}`} id="Others" checked={formData.passengerDetails[index].gender =="Others"}/>
                    Others  
                </label>              
                </div><label>Age:</label>
              <input type="number" value={formData.passengerDetails[index].age} name="passengerAge" id="passengerAge"/>
              <div className="checkbox-group">
                <label>Preferences:</label>         
              <label>
              <input type="checkbox" value="Vegetarian" checked={formData.passengerDetails[index].preferences.includes("Vegetarian")}/>
              Vegetarian
            </label>

            <label>
              <input type="checkbox" value="Wheelchair Assistance" checked={formData.passengerDetails[index].preferences.includes("Wheelchair Assistance")}/>
              Wheelchair Assistance
            </label>

            <label>
              <input type="checkbox" value="Senior Citizen" checked={formData.passengerDetails[index].preferences.includes("Senior Citizen")}/>
              Senior Citizen
            </label>

            <label>
              <input type="checkbox" value="Travel Insurance" checked={formData.passengerDetails[index].preferences.includes("Travel Insurance")}/>
              Travel Insurance
            </label>
              </div>
            </div>
          ))
        }
        <button type="submit" disabled={!formValid.buttonActive}>Book</button>
      </form>
    </div>
  );
};

export default Book;