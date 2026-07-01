import axios from "axios";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import "../App.css";

import { BookingSchema, type BookingFormData,} from "./BookingSchema";

interface RouteParams extends Record<string, string | undefined> {
  bookingId: string;
}

const EditBooking = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams<RouteParams>();
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    getValues,
    formState: {errors, isValid,},
  } = useForm<BookingFormData>({
    resolver: zodResolver(BookingSchema),
    mode: "onChange",
    defaultValues: {
      locationName: '',
      name: "",
      email: "",
      phoneNumber: "",
      visitDate: "",
      packageType: "",
      noOfPeople: 1,
      passengerDetails: [
        {
          passengerName: "",
          gender: "Male",
          age: 0,
          preferences: [],
        },
      ],
    },
  });

  const {fields, replace} = useFieldArray({control,name: "passengerDetails",});

  const people = watch("noOfPeople");
  const currentPassengers = getValues("passengerDetails")
  useEffect(() => {
    if (!people) return;
    replace(Array.from({length: people,}, (_,index) => ({
          passengerName: currentPassengers[index]?.passengerName ?? "",
          gender: currentPassengers[index]?.gender ?? "Male",
          age: currentPassengers[index]?.age ?? 0,
          preferences: currentPassengers[index]?.preferences ?? [],
        })
      )
    );
  }, [people]);

  useEffect(()=>{
    const fetchData = async ():Promise<void> => {
      try {
        const response = await axios.get('http://localhost:4000/bookings/'+bookingId);
        // console.log(response.data)
        reset(response.data)
      } catch(err) {
        console.log(err)
      }
    }
    fetchData();
  },[])
  const onSubmit = async ( data: BookingFormData): Promise<void> => {
    try {
      await axios.put("http://localhost:4000/bookings/"+bookingId,data);
      alert("Booking Successful");
      navigate('/viewBookings')

    } catch {
      alert("Error");
    }
  };

  return (
    <>
    <div className="book-container">
      <h2>Booking Form</h2>
      <form className="booking-form" onSubmit={handleSubmit(onSubmit)}>

        <label>Location Name</label>
        <input  {...register("locationName")} placeholder="Enter Location Name"  />
        <span className="error">{errors.locationName?.message}</span>

        <label>User Name</label>
        <input {...register("name")} placeholder="Enter Name" />
        <span className="error">{errors.name?.message}</span>

        <label>Email</label>
        <input {...register("email")} placeholder="Enter Email" />
        <span className="error">{errors.email?.message}</span>

        <label>Phone Number</label>
        <input {...register("phoneNumber")} placeholder="Phone Number" />
        <span className="error">{errors.phoneNumber?.message}</span>

        <label>Visit Date</label>
        <Controller control={control} name="visitDate" render={({ field }) => (
            <input type="date" {...field} />
          )}/>
        <span className="error">{errors.visitDate?.message}</span>

        <label>Package</label>
        <Controller control={control} name="packageType" render={({ field }) => (
            <select {...field}>
              <option value="">Select</option>
              <option value="Normal">Normal</option>
              <option value="Premium">Premium</option>
              <option value="Fasttrack">Fasttrack</option>
            </select>
          )}/>
        <span className="error">{errors.packageType?.message}</span>

        <label>No Of People</label>
        <Controller control={control} name="noOfPeople" render={({ field }) => (
            <input type="number" min={1} max={8} value={field.value} onChange={(e) => field.onChange(Number(e.target.value))}/>

          )}/>
        <span className="error">{errors.noOfPeople?.message}</span>

        {/* Passenger Details Start Here */}

        {fields.map((field, index) => (
          <div key={field.id} className="passenger-card">
            <h3>Passenger {index + 1}</h3>

            <label>Passenger Name</label>
            <input {...register(`passengerDetails.${index}.passengerName`)} placeholder="Enter Passenger Name" />
            <span className="error">{errors.passengerDetails?.[index]?.passengerName?.message}</span>
            <br />

            <label>Gender</label>
            <Controller control={control} name={`passengerDetails.${index}.gender`} render={({ field }) => (
                <div className="radio-group">
                  <label>
                    <input type="radio" value="Male" checked={field.value === "Male"} onChange={() => field.onChange("Male")} />
                    Male
                  </label>
                <label>
                  <input type="radio" value="Female" checked={field.value === "Female"} onChange={() => field.onChange("Female")} />
                  Female
                </label>

                <label>
                  <input type="radio" value="Others" checked={field.value === "Others"} onChange={() => field.onChange("Others")} />
                  Others
                </label>
              </div>
            )}/>
          <span className="error">{errors.passengerDetails?.[index]?.gender?.message}</span>
          <br />

          <label>Age</label>

          <Controller control={control} name={`passengerDetails.${index}.age`} render={({ field }) => (
              <input type="number" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} />
            )}/>
    <span className="error">{errors.passengerDetails?.[index]?.age?.message}</span>
    <br />

    <label>Preferences</label>
    <Controller control={control} name={`passengerDetails.${index}.preferences`} render={({ field }) => {
        const values = field.value || [];
        const handleCheckbox = ( value: string) => {
          if (values.includes(value)) {
            field.onChange( values.filter((item) => item !== value));
          } else {
            field.onChange([...values, value,]);
          }
        };
        return (
          <div className="checkbox-group">
            <label>
              <input type="checkbox" checked={values.includes("Vegetarian")} onChange={() => handleCheckbox("Vegetarian")}/>
              Vegetarian
            </label>
            <label>
              <input type="checkbox" checked={values.includes("Wheelchair Assistance")} onChange={() => handleCheckbox("Wheelchair Assistance")} />
              Wheelchair Assistance
            </label>
            <label>
              <input type="checkbox" checked={values.includes("Senior Citizen")} onChange={() => handleCheckbox("Senior Citizen")} />
              Senior Citizen
            </label>
            <label>
              <input type="checkbox" checked={values.includes("Child")} onChange={()=>handleCheckbox("Child")} />
              Child
            </label>
            <label>
              <input type="checkbox" checked={values.includes("Travel Insurance")}  onChange={() => handleCheckbox("Travel Insurance")} />
              Travel Insurance
            </label>
          </div>
        );
      }}/>
          </div>

        ))}
        <button type="submit" disabled={!isValid}>Book</button>
  </form>

</div>

<h2>Setting the schema for the Edit Booking</h2>
<pre>{`import { z } from "zod";

export const PassengerSchema = z.object({
  passengerName: z.string().min(1, "Passenger Name is required"),

  gender: z.enum( ["Male", "Female", "Others"],{message: "Please select gender", }),

  age: z.number().min(1, "Age should be greater than 0").max(120, "Invalid Age"),

  preferences: z.array(z.string()),
});

export const BookingSchema = z.object({
  locationName: z.string().min(1, "location is required"),

  name: z.string().min(1, "Name is required").min(3, "Minimum 3 characters required").max(40, "Maximum 40 characters only"),

  email: z.string().min(1, "Email required").regex(/^[A-Za-z][A-Za-z0-9+_.]*@[A-Za-z]+\.(com|in)$/, "Invalid Email"),

  phoneNumber: z.string().length(10, "Phone number must contain 10 digits").regex(/^[6-9]{1}[0-9]{9}$/, "Invalid Phone Number"),

  visitDate: z.string().min(1, "Visit Date required").refine((value) => new Date(value) > new Date(),{message: "Visit date cannot be past date",}),

  packageType: z.string().min(1, "Select Package"),

  noOfPeople: z.number().min(1, "Minimum 1 person").max(8, "Maximum 8 people"),

  passengerDetails: z.array(PassengerSchema),
});

export type BookingFormData = z.infer<typeof BookingSchema>;`}</pre>

<h2>Usage of React Hook Forms --EditBooking.jsx</h2>
<pre>{`import axios from "axios";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import "../App.css";

import { BookingSchema, type BookingFormData,} from "./BookingSchema";

interface RouteParams extends Record<string, string | undefined> {
  bookingId: string;
}

const EditBooking = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams<RouteParams>();
  
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    getValues,
    formState: {errors, isValid,},
  } = useForm<BookingFormData>({
    resolver: zodResolver(BookingSchema),
    mode: "onChange",
    defaultValues: {
      locationName: '',
      name: "",
      email: "",
      phoneNumber: "",
      visitDate: "",
      packageType: "",
      noOfPeople: 1,
      passengerDetails: [
        {
          passengerName: "",
          gender: "Male",
          age: 0,
          preferences: [],
        },
      ],
    },
  });

  const {fields, replace} = useFieldArray({control,name: "passengerDetails",});

  const people = watch("noOfPeople");
  const currentPassengers = getValues("passengerDetails")
  useEffect(() => {
    if (!people) return;
    replace(Array.from({length: people,}, (_,index) => ({
          passengerName: currentPassengers[index]?.passengerName ?? "",
          gender: currentPassengers[index]?.gender ?? "Male",
          age: currentPassengers[index]?.age ?? 0,
          preferences: currentPassengers[index]?.preferences ?? [],
        })
      )
    );
  }, [people]);

  useEffect(()=>{
    const fetchData = async ():Promise<void> => {
      try {
        const response = await axios.get('http://localhost:4000/bookings/'+bookingId);
        reset(response.data)
      } catch(err) {
        console.log(err)
      }
    }
    fetchData();
  },[])
  const onSubmit = async ( data: BookingFormData): Promise<void> => {
    try {
      await axios.put("http://localhost:4000/bookings/"+bookingId,data);
      alert("Booking Successful");
      navigate('/viewBookings')

    } catch {
      alert("Error");
    }
  };

  return (
    <div className="book-container">
      <h2>Booking Form</h2>
      <form className="booking-form" onSubmit={handleSubmit(onSubmit)}>

        <label>Location Name</label>
        <input  {...register("locationName")} placeholder="Enter Location Name"  />
        <span className="error">{errors.locationName?.message}</span>

        <label>User Name</label>
        <input {...register("name")} placeholder="Enter Name" />
        <span className="error">{errors.name?.message}</span>

        <label>Email</label>
        <input {...register("email")} placeholder="Enter Email" />
        <span className="error">{errors.email?.message}</span>

        <label>Phone Number</label>
        <input {...register("phoneNumber")} placeholder="Phone Number" />
        <span className="error">{errors.phoneNumber?.message}</span>

        <label>Visit Date</label>
        <Controller control={control} name="visitDate" render={({ field }) => (
            <input type="date" {...field} />
          )}/>
        <span className="error">{errors.visitDate?.message}</span>

        <label>Package</label>
        <Controller control={control} name="packageType" render={({ field }) => (
            <select {...field}>
              <option value="">Select</option>
              <option value="Normal">Normal</option>
              <option value="Premium">Premium</option>
              <option value="Fasttrack">Fasttrack</option>
            </select>
          )}/>
        <span className="error">{errors.packageType?.message}</span>

        <label>No Of People</label>
        <Controller control={control} name="noOfPeople" render={({ field }) => (
            <input type="number" min={1} max={8} value={field.value} onChange={(e) => field.onChange(Number(e.target.value))}/>

          )}/>
        <span className="error">{errors.noOfPeople?.message}</span>

        {/* Passenger Details Start Here */}

        {fields.map((field, index) => (
          <div key={field.id} className="passenger-card">
            <h3>Passenger {index + 1}</h3>

            <label>Passenger Name</label>
            <input {...register(\`passengerDetails.\${index}.passengerName\`)} placeholder="Enter Passenger Name" />
            <span className="error">{errors.passengerDetails?.[index]?.passengerName?.message}</span>
            <br />

            <label>Gender</label>
            <Controller control={control} name={\`passengerDetails.\${index}.gender\`} render={({ field }) => (
                <div className="radio-group">
                  <label>
                    <input type="radio" value="Male" checked={field.value === "Male"} onChange={() => field.onChange("Male")} />
                    Male
                  </label>
                <label>
                  <input type="radio" value="Female" checked={field.value === "Female"} onChange={() => field.onChange("Female")} />
                  Female
                </label>

                <label>
                  <input type="radio" value="Others" checked={field.value === "Others"} onChange={() => field.onChange("Others")} />
                  Others
                </label>
              </div>
            )}/>
          <span className="error">{errors.passengerDetails?.[index]?.gender?.message}</span>
          <br />

          <label>Age</label>

          <Controller control={control} name={\`passengerDetails.\${index}.age\`} render={({ field }) => (
              <input type="number" value={field.value} onChange={(e) => field.onChange(Number(e.target.value))} />
            )}/>
    <span className="error">{errors.passengerDetails?.[index]?.age?.message}</span>
    <br />

    <label>Preferences</label>
    <Controller control={control} name={\`passengerDetails.\${index}.preferences\`} render={({ field }) => {
        const values = field.value || [];
        const handleCheckbox = ( value: string) => {
          if (values.includes(value)) {
            field.onChange( values.filter((item) => item !== value));
          } else {
            field.onChange([...values, value,]);
          }
        };
        return (
          <div className="checkbox-group">
            <label>
              <input type="checkbox" checked={values.includes("Vegetarian")} onChange={() => handleCheckbox("Vegetarian")}/>
              Vegetarian
            </label>
            <label>
              <input type="checkbox" checked={values.includes("Wheelchair Assistance")} onChange={() => handleCheckbox("Wheelchair Assistance")} />
              Wheelchair Assistance
            </label>
            <label>
              <input type="checkbox" checked={values.includes("Senior Citizen")} onChange={() => handleCheckbox("Senior Citizen")} />
              Senior Citizen
            </label>
            <label>
              <input type="checkbox" checked={values.includes("Child")} onChange={()=>handleCheckbox("Child")} />
              Child
            </label>
            <label>
              <input type="checkbox" checked={values.includes("Travel Insurance")}  onChange={() => handleCheckbox("Travel Insurance")} />
              Travel Insurance
            </label>
          </div>
        );
      }}/>
          </div>

        ))}
        <button type="submit" disabled={!isValid}>Book</button>
  </form>

</div>
);
};

export default EditBooking;`}</pre>
</>
);
};

export default EditBooking;