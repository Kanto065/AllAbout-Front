import Swal from "sweetalert2";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useState } from "react";
import AddProduct from "./AddProduct";
import useAllProducts from "../../../Hooks/useAllProducts";
import useAxiosPublic from "../../../Hooks/useAxiosPublic";

export default function AllProduct() { 
    const [allProducts, refetch] = useAllProducts();
    const axiosPublic = useAxiosPublic();
    const [add, setAdd] = useState(false);

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
                axiosPublic.delete(`/deleteProduct/${id}`)
                    .then(res => {
                        if (res.data?.deletedCount) {
                            Swal.fire({
                                title: "Deleted!",
                                text: "Your product has been deleted.",
                                icon: "success"
                            });
                            refetch();
                        }
                    });
            }
        });
    };
    
    return (
        <div className="container mx-auto p-4">
            <Helmet>
                <title>All About Craft BD | All Products</title>
            </Helmet>
            <h2 className="text-center text-3xl font-semibold my-4">Total Products: {allProducts.length}</h2>
            <div className="my-3">
                <button onClick={() => setAdd(!add)} className="group relative z-0 py-2 px-5 overflow-hidden bg-indigo-600 text-white rounded">
                    <span
                        className="absolute inset-y-0 left-0 w-0 transform bg-white transition-all duration-700 group-hover:w-full group-hover:duration-300"></span>
                    <span
                        className="absolute inset-y-0 left-0 w-0 transform bg-blue-500 transition-all duration-500 group-hover:w-full group-hover:duration-700"></span>
                    <span
                        className="absolute inset-y-0 left-0 w-0 transform bg-blue-900 transition-all duration-300 group-hover:w-1/2 group-hover:duration-500"></span>
                    <span className="relative z-10 text-center w-full h-full flex items-center justify-center text-white">
                        {add ? "Cancel" : "Add New"}
                    </span>
                </button>
                {
                    add && <AddProduct setAdd={setAdd} setReload={refetch} presentProduct={allProducts?.length} />
                }
            </div>
            <div className="overflow-x-auto">
                <table className="table-auto w-full bg-white shadow-md rounded">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Product Name</th>
                            <th className="py-3 px-6 text-left">MainCategory</th>
                            <th className="py-3 px-6 text-left">Category</th>
                            <th className="py-3 px-6 text-left">SubCategory</th>
                            <th className="py-3 px-6 text-center">Cost</th>
                            <th className="py-3 px-6 text-center">Price</th>
                            <th className="py-3 px-6 text-center">Quantity</th>
                            <th className="py-3 px-6 text-center">Discounts(%)</th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {allProducts?.map(product => (
                            <tr key={product?._id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left flex w-80 ">
                                    <Link to={`/products/${product?.name}`} className="flex items-start hover:text-blue-600">
                                        <img
                                            src={product?.images[0]}
                                            alt={product?.name}
                                            className="w-10 h-10 object-cover rounded mr-2"
                                        />
                                        <span className="font-medium line-clamp-2">{product?.name}</span>
                                    </Link>
                                </td>
                                <td className="py-3 px-6 text-left">{product?.mainCategory}</td>
                                <td className="py-3 px-6 text-left">{product?.category}</td>
                                <td className="py-3 px-6 text-left">{product?.subCategory}</td>
                                <td className="py-3 px-6 text-center">{product?.cost}৳</td>
                                <td className="py-3 px-6 text-center">{product?.price}৳</td>
                                <td className="py-3 px-6 text-center">{product?.quantity}</td>
                                <td className="py-3 px-6 text-center">{product?.discount}%</td>
                                <td className="py-3 px-6 text-center">
                                    <div className="flex item-center justify-center space-x-2">
                                        <Link
                                         to={`/dashboard/admin/allproducts/${product?.name}`} 
                                         className="w-6 mr-2 transform hover:text-purple-500 hover:scale-110">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12h3m4 0h3m-4 0h4m-4 4h4m-4-8h4M9 12h3M4 16h4M4 8h4m0 4h4m-4 4h4M9 16h3M9 8h3m-6 8h3M4 12h3" />
                                            </svg>
                                        </Link>
                                        <button 
                                        onClick={() => handleDelete(product?._id)} 
                                        className="w-6 mr-2 transform hover:text-red-500 hover:scale-110">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
