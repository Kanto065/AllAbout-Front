import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import useAxiosPublic from "../../../Hooks/useAxiosPublic";
import useAllProducts from "../../../Hooks/useAllProducts";
import { useEffect, useState } from "react";

export default function AllTopSells() {
  const axiosPublic = useAxiosPublic();
  const [load, setLoad] = useState(false);
  const [allProducts] = useAllProducts();
  const [add, setAdd] = useState(null);
  const [typ, setTyp] = useState("Featured");
  const [showProducts, setShowProducts] = useState([]);

  useEffect(()=>{
    axiosPublic.get(`/topsells/${typ}`).then(res => setShowProducts(res?.data));
    setLoad(false)
  },[axiosPublic, typ, load])

  useEffect(() => {
    const isPresent = showProducts?.find((item) => item?.name === add?.name);
    if (isPresent) {
      setAdd(null);
    }
  }, [add, showProducts]);

  // Handle adding a product to Top Sells
  const handleTopSells = () => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to add "${add?.name}" to Top Sells!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPublic
          .post(`/topsells`, {
            name: add?.name,
            images: add?.images,
            position: showProducts?.length + 1,
            typ
          })
          .then((res) => {
            if (res.data?.insertedId) {
              Swal.fire({
                title: "Added Successfully!",
                icon: "success",
              });
              setLoad(true);
              setAdd(null); // Clear input after successful addition
            }
          });
      }
    });
  };

  // const handleChangePosition = (product, position) => {
  //   if (parseInt(position) > topSells?.length || parseInt(position) < 1) {
  //     return Swal.fire({
  //       title: `Please Provide valid number (${1}-${topSells?.length})`,
  //       icon: "info",
  //     });
  //   }
  //   Swal.fire({
  //     title: "Are you sure?",
  //     text: `You want to change position on ${position} for "${product?.name}"!`,
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#3085d6",
  //     cancelButtonColor: "#d33",
  //     confirmButtonText: "Yes!",
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       axiosPublic
  //         .patch(`/topsells/${product?._id}`, {
  //           position: parseInt(position),
  //         })
  //         .then((res) => {
  //           if (res.data?.modifiedCount > 0) {
  //             Swal.fire({
  //               title: "Changed Successfully!",
  //               icon: "success",
  //             });
  //             refetch();
  //           }
  //         });
  //     }
  //   });
  // };

  // Handle deleting a product
  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPublic.delete(`/topsells/${id}`).then((res) => {
          if (res.data?.deletedCount) {
            Swal.fire({
              title: "Deleted!",
              text: "Your product has been deleted.",
              icon: "success",
            });
            setLoad(true);
          }
        });
      }
    });
  };
  return (
    <div className="container mx-auto p-4">
      <Helmet>
        <title>All About Craft BD | All {typ} Sells</title>
      </Helmet>

      <h2 className="text-center text-3xl font-semibold my-4">
        Total {typ} Products: {showProducts.length}
      </h2>
        <ul className="w-full my-10 px-x overflow-auto flex justify-center space-x-2">
          <li
            onClick={() => setTyp("Featured")}
            className={`px-5 py-2 bg-[#bb5fcb] text-white rounded-lg hover:bg-[#9b2dae] transition ${
              typ === "Featured" && "bg-[#9b2dae]"
            }`}
          >
            Featured
          </li>
          <li
            onClick={() => setTyp("Flash Sale")}
            className={`px-5 py-2 bg-[#bb5fcb] text-white rounded-lg hover:bg-[#9b2dae] transition ${
              typ === "Flash Sale" && "bg-[#9b2dae]"
            }`}
          >
            Flash Sale
          </li>
          <li
            onClick={() => setTyp("New arrivals")}
            className={`px-5 py-2 bg-[#bb5fcb] text-white rounded-lg hover:bg-[#9b2dae] transition ${
              typ === "New arrivals" && "bg-[#9b2dae]"
            }`}
          >
            New arrivals
          </li>
        </ul>
      <div className="my-3 lg:flex space-y-2 lg:space-y-0 lg:space-x-2 items-center">
        <select
          value={add?.name || ""}
          onChange={(e) => {
            const selectedProduct = allProducts.find(
              (product) => product?.name === e.target.value
            );
            setAdd(selectedProduct);
          }}
          className="w-full lg:w-1/2 py-2 rounded"
        >
          <option value="">Select a Product...</option>
          {allProducts?.map((product) => {
            const isTopSell = showProducts?.some(
              (item) => item?.name === product?.name
            );

            return (
              <option
                key={product?._id}
                value={product?.name}
                disabled={isTopSell} // Disable the option if it's already in topSells
                className={`${isTopSell ? "text-gray-400" : "text-black"}`}
              >
                {product?.name}
              </option>
            );
          })}
        </select>

        {add && (
          <button
            onClick={handleTopSells}
            className="px-5 py-2 bg-[#bb5fcb] text-white rounded-lg hover:bg-[#aa42bd] transition"
          >
            Add to Top Sells
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full bg-white shadow-md rounded">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Product Name</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {showProducts?.map((product) => (
              <tr
                key={product?._id}
                className="border-b border-gray-200 hover:bg-gray-100"
              >
                <td className="py-3 px-6 text-left flex w-80">
                  <Link
                    to={`/products/${product?.name}`}
                    className="flex items-start hover:text-blue-600"
                  >
                    {product?.images?.length > 0 ? (
                      <img
                        src={product?.images[0]}
                        alt={product?.name}
                        className="w-10 h-10 object-cover rounded mr-2"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 flex items-center justify-center rounded mr-2">
                        <span>No Image</span>
                      </div>
                    )}
                    <span className="font-medium line-clamp-2">
                      {product?.name}
                    </span>
                  </Link>
                </td>
                <td className="py-3 px-6 text-center">
                  <button
                    onClick={() => handleDelete(product?.topId)}
                    className="w-6 transform hover:text-red-500 hover:scale-110"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
