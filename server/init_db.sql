-- Drop tables if they exist (for clean initialization)
DROP TABLE IF EXISTS passengers CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Locations table
CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image TEXT NOT NULL,
  description TEXT NOT NULL
);

-- Create Bookings table
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  location_name VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  visit_date DATE NOT NULL,
  package_type VARCHAR(50) NOT NULL,
  no_of_people INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Passengers table
CREATE TABLE passengers (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  passenger_name VARCHAR(255) NOT NULL,
  gender VARCHAR(50) NOT NULL,
  age INTEGER NOT NULL,
  preferences JSONB
);

-- Insert initial locations
INSERT INTO locations (name, image, description) VALUES
('Goa Beach', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', 'Enjoy the golden beaches, water sports, nightlife, and beautiful sunsets in Goa.'),
('Ooty', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470', 'Experience the cool climate, tea plantations, scenic mountains, and toy train rides.'),
('Manali', 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963', 'A paradise for nature lovers with snow-covered mountains, adventure sports, and valleys.'),
('Kerala Backwaters', 'https://images.unsplash.com/photo-1472396961693-142e6e269027', 'Cruise through peaceful backwaters, stay in houseboats, and enjoy lush greenery.'),
('Jaipur', 'https://images.unsplash.com/photo-1599661046289-e31897846e41', 'Explore magnificent forts, royal palaces, colorful bazaars, and rich Rajasthani culture.'),
('Mysore', 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3', 'Visit the grand Mysore Palace, Chamundi Hills, and experience the city''s royal heritage.');
