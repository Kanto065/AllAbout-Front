import { useState } from "react";
import useAxiosPublic from "../../../Hooks/useAxiosPublic";
import PurchasedItems from "./PurchasedItems";
import Swal from "sweetalert2";

export default function PurchasedItem({order, refetch}) {
    const axiosPublic = useAxiosPublic();
    const [loader, setLoader] = useState(false);
    const [total, setTotal] = useState(0);


    const handleUpdateStatus = (id, status) => {
        setLoader(true)
        Swal.fire({
            title: "Are You Sure?",
            text: `You want to update status to: "${status}"!`,
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
                    });
            }
        });
        setLoader(false);
    }

    return (
        <div
            className="bg-white shadow-lg rounded-lg p-6 border border-gray-200"
        >
            <h2 className="text-xl font-semibold mb-2">Order ID: {order?.orderId}</h2>
            <h2 className="text-xl font-semibold mb-2">Total Price: {parseInt(total)+ order?.deliveryFee} ৳({order?.deliveryFee}Fee)</h2>
            <h2 className="text-lg font-medium mb-2">Delivery Address: {order?.address}</h2>
            <p className={`text-lg font-medium mb-4 ${order?.status === "pending" ? "text-yellow-500" : "text-green-500"}`}>
                Status: {order?.status}
            </p>
            <div className="flex items-center justify-between mb-5">
                <div>
                    {order?.status === "pending" ? (
                        <img className="h-10 w-10" src="/images/logo&icons/order-confirmed.png" alt="Order Confirmed" />
                    ) : (
                        <img className="h-10 w-10" src="/images/logo&icons/order-confirmed (1).png" alt="Order Confirmed" />
                    )}
                </div>
                <p className={`h-1 max-w-[20%] w-full rounded-full ${order?.status === "on the way" || order?.status === "delivered" ? "bg-[#C4ACC2]" : "bg-gray-500"}`}></p>
                <img className="h-10 w-10" src="/images/logo&icons/delivery-bike.png" alt="Delivery Bike" />
                <p className={`h-1 max-w-[20%] w-full rounded-full ${order?.status === "delivered" ? "bg-[#C4ACC2]" : "bg-gray-500"}`}></p>
                <div className="space-y-2">
                    <img className="h-10 w-10 mx-auto" src="/images/logo&icons/delivered.png" alt="Delivered" />
                    <button
                        className={`flex items-center font-semibold text-[#Ffffff] hover:text-white bg-[#C4ACC2] px-3 py-1 border border-[#C4ACC2] rounded-md scale-100 hover:scale-110 duration-100 ${order?.status === "on the way" ? "block" : "hidden"}`}
                        onClick={() => handleUpdateStatus(order?._id, "delivered")}
                    >
                        Received
                    </button>
                </div>
            </div>
            <PurchasedItems orderId={order?.orderId} setTotal={setTotal} />
        </div>
    )
}
