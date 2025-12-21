import { useState } from "react";
import PurchasedItems from "../User/PurchasedItems";
import useAxiosPublic from "../../../Hooks/useAxiosPublic";
import Swal from "sweetalert2";
import { FaPhoneAlt, FaMapMarkerAlt, FaUser, FaTrash, FaBoxOpen } from "react-icons/fa";

export default function Ordered({ order, refetch }) {
    const [loader, setLoader] = useState(false);
    const axiosPublic = useAxiosPublic();
    const [total, setTotal] = useState(0);

    const handleUpdateStatus = (id, status) => {
        setLoader(true);
        Swal.fire({
            title: "Update Status?",
            text: `Change status to: "${status}"?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#f39a57",
            confirmButtonText: "Yes, Update"
        }).then((result) => {
            if (result.isConfirmed) {
                axiosPublic.patch(`/updateorder/${id}`, { status })
                    .then(res => {
                        if (res.data.modifiedCount > 0) {
                            Swal.fire({
                                title: 'Updated!',
                                text: 'Order status has been updated.',
                                icon: 'success',
                                timer: 1500,
                                showConfirmButton: false
                            });
                            refetch();
                        }
                    })
                    .catch(error => {
                        Swal.fire({
                            title: 'Error',
                            text: error.message,
                            icon: 'error'
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
            title: "Delete Order?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, Delete"
        }).then((result) => {
            if (result.isConfirmed) {
                axiosPublic.delete(`/deleteorder/${id}`)
                    .then(res => {
                        if (res.data?.deletedCount) {
                            Swal.fire({
                                title: "Deleted!",
                                text: "Order has been removed.",
                                icon: "success",
                                timer: 1500,
                                showConfirmButton: false
                            });
                            refetch();
                        }
                    });
            }
        });
    };

    // Date formatting helper
    const formattedDate = order?.orderDate
        ? `${order?.orderDay ? order.orderDay + ', ' : ''}${order.orderDate} ${order?.orderTime ? 'at ' + order.orderTime : ''}`
        : new Date(order?.createdAt).toLocaleDateString("en-GB", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 transition hover:shadow-md">
            {/* Header */}
            <div className="bg-gray-50/50 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0 border-b border-gray-100">
                <div>
                    <div className="flex items-center space-x-3">
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wide">Order</span>
                        <h2 className="text-lg font-bold text-gray-800">#{order?.orderId}</h2>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                        <span className="font-medium">Placed:</span> {formattedDate}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                        ${order?.status === "pending" ? "bg-amber-100 text-amber-700" :
                            order?.status === "on the way" ? "bg-purple-100 text-purple-700" :
                                "bg-green-100 text-green-700"}`}>
                        {order?.status}
                    </span>

                    {order?.status === "pending" && (
                        <button
                            onClick={() => handleDelete(order?._id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition"
                            title="Delete Order"
                        >
                            <FaTrash size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Customer Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Customer Details</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                    <FaUser size={12} />
                                </div>
                                <span className="font-medium">{order?.name}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                    <FaPhoneAlt size={12} />
                                </div>
                                <span className="font-medium">{order?.phone}</span>
                            </div>
                            <div className="flex items-start gap-3 text-gray-700">
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mt-0.5">
                                    <FaMapMarkerAlt size={12} />
                                </div>
                                <span className="font-medium flex-1">{order?.address}</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Financials */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Payment Summary</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>{total} ৳</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Delivery Fee</span>
                                <span>{order?.deliveryFee} ৳</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold text-gray-800 text-lg">
                                <span>Grand Total</span>
                                <span>{parseInt(total) + (parseInt(order?.deliveryFee) || 0)} ৳</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <div className="mt-8">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <FaBoxOpen /> Order Items
                    </h3>
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-1">
                        <PurchasedItems orderId={order?.orderId} setTotal={setTotal} />
                    </div>
                </div>

                {/* Action Bar */}
                {(order?.status === "pending" || order?.status === "on the way") && (
                    <div className="mt-6 flex justify-end border-t pt-4">
                        <button
                            className="flex items-center gap-2 bg-[#7d84d8] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#5f65b8] transition shadow-sm disabled:opacity-70"
                            onClick={() => handleUpdateStatus(order?._id, order?.status === "pending" ? "confirmed" : "on the way")}
                            disabled={loader}
                        >
                            {loader && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {order?.status === "pending" ? "Confirm Order" : "Mark as On The Way"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
