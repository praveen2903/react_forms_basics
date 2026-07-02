// ---------> Both are same

// interface NavbarProps {
//     title: string
// }

// const Navbar = ({title}: NavbarProps) => {
//   return (
//     <div style={{color: 'green', backgroundColor:'lightblue'}}>
//         {title}
//     </div>
//   )
// }

// export default Navbar

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

interface NavbarProps {
  title: string;
}

const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await axiosClient.post('/api/auth/logout', { token: refreshToken });
      }
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <div style={{ color: "green", backgroundColor: "lightblue", padding:'20px' }}>
      <div style={{display:"flex", justifyContent:'space-between', alignItems: 'center'}}>
        <Link to='/' style={{fontSize: '24px', fontWeight: 'bold', textDecoration: 'none', color: 'green'}}>
            {title}
        </Link>
        <div style={{display:'flex', justifyContent:'space-between', gap: '20px', alignItems: 'center'}}>
            <Link to='/viewBookings'>View Bookings</Link>
            <Link to='/chat' style={{ color: '#6366f1', fontWeight: 600 }}>💬 Live Chat</Link>
            
            {token ? (
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', color: '#444' }}>Hi, {user?.username}</span>
                <button 
                  onClick={handleLogout} 
                  style={{ background: '#f44336', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '15px' }}>
                <Link to='/login' style={{ fontWeight: 600 }}>Login</Link>
                <Link to='/register' style={{ fontWeight: 600 }}>Register</Link>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;