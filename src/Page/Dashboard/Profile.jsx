import { IoPersonSharp } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import useDatabaseUser from "../../Hooks/useDatabaseUser";

const Profile = () => {
    const [databaseUser] = useDatabaseUser();
    return ( 
        <div className="max-w-[90%] 2xl:max-w-7xl mx-auto">
            <div className="relative">
                <div className="flex flex-col md:flex-row lg:items-end space-y-3 md:space-y-0 md:space-x-5">
                    {
                        databaseUser?.image ?
                            <img className="h-28 lg:h-44 w-28 lg:w-44 rounded-lg" src={databaseUser?.image} alt="" />
                            :
                            <IoPersonSharp className='text-8xl'></IoPersonSharp>
                    }
                    <div className="space-y-2">
                        <h3 className="text-3xl font-semibold">{databaseUser?.name}</h3>
                        <p className="text-gray-500">{databaseUser?.email}</p>
                    </div>
                </div>
                {
                    databaseUser &&
                    <div className="absolute -top-7 right-0">
                        <Link to={"/dashboard/editProfile"} className="flex items-center bg-[#C480CF] text-white py-2 px-4 rounded-md"><FaRegEdit className="mr-1"></FaRegEdit> Edit Profile</Link>
                    </div>
                }
            </div>
            <div className="mt-8">
                <h4 className="text-2xl my-3">Personal Information</h4>
                <ul className="space-y-2">
                    <li><span className="text-sm text-gray-400">Name:</span><span className="font-medium ml-2">{databaseUser?.name}</span></li>
                    <li><span className="text-sm text-gray-400">Phone:</span><span className="font-medium ml-2">{databaseUser?.phone}</span></li>
                    <li><span className="text-sm text-gray-400">Email:</span><span className="font-medium ml-2">{databaseUser?.email}</span></li>
                    <li><span className="text-sm text-gray-400">Location:</span><span className="font-medium ml-2">{databaseUser?.location}</span></li>
                </ul>
            </div>
        </div>
    );
};

export default Profile;