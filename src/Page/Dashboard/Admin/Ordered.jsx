import { useState } from "react";
import PurchasedItems from "../User/PurchasedItems";
import useAxiosPublic from "../../../Hooks/useAxiosPublic";
import Swal from "sweetalert2";

export default function Ordered({ order, refetch }) {
    const [loader, setLoader] = useState(false);
    const axiosPublic = useAxiosPublic();
    const [total, setTotal] = useState(0);

    const handleUpdateStatus = (id, status) => {
        setLoader(true);
        Swal.fire({
            title: "Are You Sure?",
            text: `You want to update status: "'${status}'"!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#f39a57",
            confirmButtonText: "Update!"
        }).then((result) => {
            if (result.isConfirmed) {
                axiosPublic.patch(`/updateorder/${id}`, { status })
                    .then(res => {
                        if (res.data.modifiedCount > 0) {
                            Swal.fire({
                                title: 'Success!',
                                text: 'Status Updated Successfully',
                                icon: 'success',
                                confirmButtonText: 'Ok'
                            });
                            refetch();
                        }
                    })
                    .catch(error => {
                        Swal.fire({
                            title: 'Warning!',
                            text: `${error.message}`,
                            icon: 'warning',
                            confirmButtonText: 'Ok'
                        });
                    })
                    .finally(() => setLoader(false));
            } else {
                setLoader(false);
            }
        });
    };

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
                axiosPublic.delete(`/deleteorder/${id}`)
                    .then(res => {
                        if (res.data?.deletedCount) {
                            Swal.fire({
                                title: "Deleted!",
                                text: "Order has been deleted.",
                                icon: "success"
                            });
                            refetch();
                        }
                    });
            }
        });
    };

    return (
        <div className="p-2 w-full relative shadow-md rounded-lg mb-4">
            <div className="space-y-1">
                <h2 className="text-xl font-semibold mb-2">Order ID: <span className="text-[#C4ACC2]">{order?.orderId}</span></h2>
                <h2 className="text-xl font-semibold mb-2">Items Total: {total} ৳</h2>
                <h2 className="text-xl font-semibold mb-2">Delivery Fee: {order?.deliveryFee} ৳</h2>
                <h2 className="text-xl font-semibold mb-2">Grand Total: {parseInt(total) + (order?.deliveryFee || 0)} ৳</h2>
                <p>Buyer Name: <span className="font-bold">{order?.name}</span></p>
                <p>Phone: <span className="font-bold">{order?.phone}</span></p>
                <p>Address: <span className="font-bold">{order?.address}</span></p>
                <p>Present Status: <span className="font-semibold text-green-600">{order?.status}</span></p>
            </div>
            <div className={`${(order?.status === "on the way" || order?.status === "delivered") ? "hidden" : "flex items-center space-x-2"}`}>
                <p>Update Status:</p>
                <button className="flex items-center font-semibold text-[#ffffff] hover:text-white bg-[#C4ACC2] px-3 py-1 border border-[#C4ACC2] rounded-md scale-100 hover:scale-110 duration-100">
                    <span onClick={() => handleUpdateStatus(order?._id, order?.status === "pending" ? "confirmed" : "on the way")}>
                        {loader || order?.status === "pending" ? "confirmed" : "on the way"}
                    </span>
                    {
                        loader && <p className="border-t rounded-xl border-black border-solid w-4 h-4 animate-spin"></p>
                    }
                </button>
            </div>
            <PurchasedItems orderId={order?.orderId} setTotal={setTotal} />
            <button onClick={() => handleDelete(order?._id)} className={`w-6 mr-2 transform hover:text-red-500 hover:scale-110 absolute top-2 right-0 bg-gray-200 rounded-full ${order?.status === "pending" ? "block" : "hidden"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    )
}
