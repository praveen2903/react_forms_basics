import { z } from "zod";

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

  phoneNumber: z.string().length(10, "Phone number must contain 10 digits").regex(/^[6-9]{2}[0-9]{8}$/, "Invalid Phone Number"),

  visitDate: z.string().min(1, "Visit Date required").refine((value) => new Date(value) > new Date(),{message: "Visit date cannot be past date",}),

  packageType: z.string().min(1, "Select Package"),

  noOfPeople: z.number().min(1, "Minimum 1 person").max(8, "Maximum 8 people"),

  passengerDetails: z.array(PassengerSchema),
});

export type BookingFormData = z.infer<typeof BookingSchema>;