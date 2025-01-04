import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { Helmet } from "react-helmet-async";
import useAxiosPublic from "../../../Hooks/useAxiosPublic";
import { IoPersonCircle } from "react-icons/io5";

const AllUsers = () => {
    const axiosPublic = useAxiosPublic()
    const { data: users = [], refetch } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await axiosPublic.get('/Users');
            return res.data;
        } 
    })
    const handleChangeStatus = (email, status) => {
        Swal.fire({
            title: "Are you sure?",
            text: `You want to make ${status} him...!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: `Yes, Make ${status} !`
        }).then((result) => {
            if (result.isConfirmed) {

                axiosPublic.patch(`/updateUserRole/${email}`, { status })
                    .then(res => {
                        console.log(res.data)
                        if (res.data.modifiedCount > 0) {
                            Swal.fire({
                                title: "Created!",
                                text: `User Role change by ${status}.`,
                                icon: "success"
                            });
                            refetch()
                        }
                    })
            }
        });
    }

    
    const handleDelete = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                axiosPublic.delete(`/users/${id}`)
                    .then(res => {
                        if (res.data?.deletedCount) {
                            Swal.fire({
                                title: "Deleted!",
                                text: "User has been deleted.",
                                icon: "success"
                            });
                            refetch();
                        }
                    });
            }
        });
    };


    return (
        <div className="px-5 md:px-0">
            <Helmet>
                <title>All About Craft BD | All User</title>
            </Helmet>
            <div>
                <h2 className="text-4xl font-medium p-3">Total User: {users.length}</h2>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                {
                    users?.map((user, idx) =>
                        <div key={idx} className="w-full rounded-md overflow-hidden shadow-lg bg-white p-4 relative ">
                            <div className="w-full z-50">
                                {user?.image ?
                                    <img className="w-28 h-28 rounded-full mx-auto border-2 p-1" src={user?.image} alt={`${user?.name} Profile Picture`} />
                                    :
                                    <IoPersonCircle className='text-[110px] text-gray-700 rounded-full  mx-auto border p-0.5' />}
                            </div>
                            <div className="text-center mt-4">
                                <h5 className="text-lg font-semibold text-gray-600">Name: {user?.name}</h5>
                                <p className="text-gray-600 mt-2">Email: {user?.email}</p>
                                <h5 className="text-xl font-semibold text-gray-800">ID: <span className="text-lg">{user?._id}</span></h5>
                            </div>
                            <div className="mt-4">
                                <div className="text-sm text-gray-600">
                                    <strong>Role:</strong> {user?.role}
                                </div>
                                <div className="text-sm text-gray-600">
                                    <strong>Phone:</strong> {user?.phone}
                                </div>
                                <div className="text-sm text-gray-600">
                                    <strong>Location:</strong> {user?.location}
                                </div>
                                <div className="text-sm text-gray-600">
                                    <strong>AccessToken:</strong> {user?.accessToken}
                                </div>
                            </div>
                            <button 
                            // onClick={() => handleDelete(user?._id)} 
                            className="w-6 mr-2 transform hover:text-red-500 hover:scale-110 absolute top-2 right-0 bg-gray-200 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default AllUsers;