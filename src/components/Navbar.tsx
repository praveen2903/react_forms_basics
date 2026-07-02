// ---------> Both are same

import { Link } from "react-router-dom";

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

interface NavbarProps {
  title: string;
}

const Navbar: React.FC<NavbarProps> = ({ title }) => {
  return (
    <div style={{ color: "green", backgroundColor: "lightblue", padding:'20px' }}>
      <div style={{display:"flex", justifyContent:'space-between'}}>
        <Link to='/'>
            {title}
        </Link>
        <div style={{display:'flex', justifyContent:'space-between', gap: '20px'}}>
            <Link to='/viewBookings'>View Bookings</Link>
            <Link to='/chat' style={{ color: '#6366f1', fontWeight: 600 }}>💬 Live Chat</Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;