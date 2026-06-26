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
        <div style={{display:'flex', justifyContent:'space-between'}}>
            <Link to='/viewBookings'>View Bookings</Link>

        </div>
      </div>
    </div>
  );
};

export default Navbar;