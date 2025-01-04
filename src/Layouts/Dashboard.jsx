import { FaHome, FaUser } from "react-icons/fa";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { BiMenu, } from "react-icons/bi";
import { AiOutlineClose } from "react-icons/ai";
import useAuth from "../Hooks/useAuth";
import Swal from "sweetalert2";
import { IoLogOutOutline } from "react-icons/io5";
import toast from "react-hot-toast";
import useDatabaseUser from "../Hooks/useDatabaseUser";
import Admin from "../Page/Dashboard/Admin/Admin";
import User from "../Page/Dashboard/User/User";


const Dashboard = () => { 
    const { logOut } = useAuth();
    const [menu, setMenu] = useState(false);
    const [databaseUser] = useDatabaseUser();
    const location = useLocation()?.pathname;
    const notify = () => toast.success('Logout successfully!');

    const SignOut = async () => {

        await logOut()
            .then(
                notify()
            ).catch(error => {
                Swal.fire({
                    title: 'Warning!',
                    text: `${error.message}`,
                    icon: 'warning',
                    confirmButtonText: 'Ok'
                })
            });
    }
    return (
        <div className="bg-[#f5f5f5]">
            <div className="flex max-w-[1400px] mx-auto ">
                <div className={`w-72 lg:w-2/12 pt-32 md:pt-48 pb-16 min-h-screen bg-[#f1efef] text-gray-500 border text-lg duration-1000  lg:relative lg:left-0 top-0 absolute z-[1] ${menu ? "left-0" : "-left-[1000px]"}`}>
                    <ul className='menu p-4'>
                        <AiOutlineClose onClick={() => setMenu(false)} className="text-4xl mb-5 lg:hidden"></AiOutlineClose>
                        <li onClick={() => setMenu(false)}>
                            <NavLink to={"/dashboard"} className={`flex items-center p-1 hover:bg-slate-200 ${location === "/dashboard" && "bg-slate-200"}`}><FaUser className="mr-1"></FaUser>Dashboard</NavLink>
                        </li>
                        {
                            databaseUser?.role === "admin" &&
                            <Admin setMenu={setMenu}></Admin>
                        }
                        {
                            databaseUser?.role === "user" &&
                            <User setMenu={setMenu}></User>
                        }
                        <p className="h-0.5 bg-slate-500"></p>
                        <li>
                            <NavLink to={"/"} className="flex items-center p-1"><FaHome className="mr-1"></FaHome>Home</NavLink>
                        </li>
                        <li onClick={SignOut} className='flex items-center p-1 text-red-500 hover:bg-red-500 hover:text-white'><IoLogOutOutline className='mr-2'></IoLogOutOutline> Logout</li>
                    </ul>
                </div>
                <div className="md:px-6 pt-32 md:pt-48 pb-16 w-full lg:w-10/12 min-h-screen bg-[#f4f6f9]">
                    <BiMenu onClick={() => setMenu(true)} className="text-5xl my-2 lg:hidden"></BiMenu>
                    <Outlet></Outlet>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;