import Swal from "sweetalert2";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import AddProduct from "./AddProduct";
import AddProductGroup from "./AddProductGroup";
import useAllProducts from "../../../Hooks/useAllProducts";
import useAxiosPublic from "../../../Hooks/useAxiosPublic";

export default function AllProduct() {
    const [allProducts, refetch] = useAllProducts();
    const axiosPublic = useAxiosPublic();
    const [add, setAdd] = useState(false);
    const [addGroup, setAddGroup] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(100);

    // Calculate pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = allProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(allProducts.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleItemsPerPageChange = (value) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1); // Reset to first page
    };

    // Pagination component
    const Pagination = () => (
        <div className="flex items-center justify-between my-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, allProducts.length)} of {allProducts.length} products
                </span>
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Show:</label>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
                    >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="75">75</option>
                        <option value="100">100</option>
                        <option value="125">125</option>
                        <option value="150">150</option>
                        <option value="175">175</option>
                        <option value="200">200</option>
                    </select>
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                >
                    Previous
                </button>

                {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                        return (
                            <button
                                key={pageNumber}
                                onClick={() => handlePageChange(pageNumber)}
                                className={`px-3 py-1 rounded ${currentPage === pageNumber
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {pageNumber}
                            </button>
                        );
                    } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                    ) {
                        return <span key={pageNumber} className="px-2">...</span>;
                    }
                    return null;
                })}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${currentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                >
                    Next
                </button>
            </div>
        </div>
    );

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
            <div className="my-3 flex flex-col gap-3 items-start">
                <button onClick={() => {
                    setAdd(!add);
                    setAddGroup(false);
                }} className="group relative z-0 h-10 py-2 px-5 overflow-hidden bg-indigo-600 text-white rounded">
                    <span
                        className="absolute inset-y-0 left-0 w-0 transform bg-white transition-all duration-700 group-hover:w-full group-hover:duration-300"></span>
                    <span
                        className="absolute inset-y-0 left-0 w-0 transform bg-blue-500 transition-all duration-500 group-hover:w-full group-hover:duration-700"></span>
                    <span
                        className="absolute inset-y-0 left-0 w-0 transform bg-blue-900 transition-all duration-300 group-hover:w-1/2 group-hover:duration-500"></span>
                    <span className="relative z-10 text-center w-full h-full flex items-center justify-center text-white">
                        {add ? "Cancel" : "Add Single Product"}
                    </span>
                </button>
                <button onClick={() => {
                    setAddGroup(!addGroup);
                    setAdd(false);
                }} className="group relative z-0 h-10 py-2 px-5 overflow-hidden bg-green-600 text-white rounded">
                    <span
                        className="absolute inset-y-0 left-0 w-0 transform bg-white transition-all duration-700 group-hover:w-full group-hover:duration-300"></span>
                    <span
                        className="absolute inset-y-0 left-0 w-0 transform bg-green-500 transition-all duration-500 group-hover:w-full group-hover:duration-700"></span>
                    <span
                        className="absolute inset-y-0 left-0 w-0 transform bg-green-900 transition-all duration-300 group-hover:w-1/2 group-hover:duration-500"></span>
                    <span className="relative z-10 text-center w-full h-full flex items-center justify-center text-white">
                        {addGroup ? "Cancel" : "Add Product With Variants"}
                    </span>
                </button>
                {
                    add && <AddProduct setAdd={setAdd} setReload={refetch} presentProduct={allProducts?.length} />
                }
                {
                    addGroup && <AddProductGroup setAdd={setAddGroup} setReload={refetch} />
                }
            </div>

            {/* Pagination - Top */}
            {allProducts.length > 0 && <Pagination />}

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
                        {currentProducts?.map(product => (
                            <tr key={product?._id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left flex w-80 ">
                                    <Link to={`/products/${product?.name}`} className="flex items-start hover:text-blue-600">
                                        <img
                                            src={product?.images[0]}
                                            alt={product?.name}
                                            className="w-10 h-10 object-cover rounded mr-2"
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-medium line-clamp-2">{product?.name}</span>
                                            {product?.productGroupId && (
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded mt-1 w-fit">
                                                    🔗 Product Group
                                                </span>
                                            )}
                                        </div>
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
                                            className="mr-2 transform hover:text-blue-500 hover:scale-110 transition">
                                            <FiEdit2 size={20} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product?._id)}
                                            className="mr-2 transform hover:text-red-500 hover:scale-110 transition">
                                            <FiTrash2 size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination - Bottom */}
            {allProducts.length > 0 && <Pagination />}
        </div>
    );
}
