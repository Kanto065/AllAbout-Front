import { useEffect, useState } from "react";
import useAxiosPublic from "../../../Hooks/useAxiosPublic";
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import useDatabaseUser from "../../../Hooks/useDatabaseUser";
import { FaStar } from "react-icons/fa";

export default function CartItem({ product, reload, message }) {
  const [databaseUser] = useDatabaseUser();
  const axiosPublic = useAxiosPublic();
  const [quantities, setQuantities] = useState({});
  const [databaseProduct, setDatabaseProduct] = useState({});
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    axiosPublic
      .get(`/products/${product?.name}`)
      .then((data) => setDatabaseProduct(data?.data))
      .catch((error) => console.error("Error fetching product data:", error));

    axiosPublic
      .get(`/reviews/${product?.name}`)
      .then((data) => {
        setReviews(data?.data || []);
        calculateAverageRating(data?.data || []);
      })
      .catch((error) => console.error("Error fetching reviews:", error));
  }, [product, axiosPublic]);

  useEffect(() => {
    setQuantities((prev) => ({
      ...prev,
      [`${product._id}-${product.variant?.name}`]: product.orderedQuantity,
    }));
  }, [product]);

  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) {
      setAverageRating(0);
      return;
    }
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = totalRating / reviews.length;
    setAverageRating(average);
  };

  const handleCart = async (x) => {
    const productId = product._id;
    const variantName = product.variant?.name;
    const key = `${productId}-${variantName}`;
    const newQuantity = quantities[key] + x;
    if (newQuantity < 1 || newQuantity > product?.quantity) {
      Swal.fire({
        icon: "error",
        title: `Invalid quantity. Available quantity: ${product?.quantity}`,
      });
      return;
    }

    const cart = {
      email: databaseUser?.email,
      productId,
      variant: product?.variant,
      quantity: newQuantity,
    };

    try {
      const response = await axiosPublic.patch(`/cart`, cart);
      if (response?.data?.modifiedCount > 0) {
        Swal.fire({
          position: "top-right",
          icon: "success",
          title: "Cart Updated successfully",
          showConfirmButton: false,
          timer: 1500,
        });
        setQuantities((prev) => ({
          ...prev,
          [key]: newQuantity,
        }));
        reload();
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to Update cart",
        });
      }
    } catch (err) {
      console.error("Error updating cart:", err);
      Swal.fire({
        icon: "error",
        title: "Error updating product in cart",
      });
    }
  };

  const handleDeleteCartProduct = () => {
    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete "${product?.name} - ${product?.variant?.name}" from your Cart!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPublic
          .delete(`/cart`, {
            params: {
              email: databaseUser?.email,
              productId: product?._id,
              variant: product?.variant?.name,
            },
          })
          .then((res) => {
            if (res.data.deletedCount > 0) {
              Swal.fire({
                title: "Deleted!",
                text: `${product?.name} - ${product?.variant?.name} has been deleted from your Cart.`,
                icon: "success",
              });
              reload(); // Ensure this triggers a state update in the parent component
            }
          })
          .catch((error) => {
            console.error("Error deleting product from cart:", error);
            Swal.fire({
              icon: "error",
              title: "Error deleting product from cart",
            });
          });
      }
    });
  };

  // Determine the image and variant name to display
  const variantImage = product?.variant ? product?.variant?.image : product?.images[0];
  const variantName = product?.variant ? `Variant: ${product?.variant?.name}` : "No Variant";

  const totalPrice = (product.price * quantities[`${product._id}-${product.variant?.name}`]) - ((product.price * product.discount / 100) * quantities[`${product._id}-${product.variant?.name}`]);

  if (message) {
    // If the product is out of stock, display the message.
    return (
      <div className="border-b transition duration-300 flex space-x-5 pb-2 bg-red-50 border-red-500 p-4 rounded-md">
        <img
          src={variantImage}
          alt={product?.name}
          className="h-32 w-full md:w-1/5 object-contain bg-gray-300 opacity-50"
        />
        <div className="w-4/5 flex flex-row justify-between items-center">
          <div className="w-4/5 flex flex-col">
            <h2 className="font-medium text-xl text-red-700">{product?.name}</h2>
            <p className="text-red-500 font-medium">{message}</p>
          </div>
          <button
            onClick={handleDeleteCartProduct}
            className="flex items-center justify-center rounded-md w-24 h-8 border border-red-600 text-red-500 hover:bg-red-500 hover:text-white duration-300"
          >
            <MdDelete className="text-sm" /> Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b transition duration-300 flex space-x-5 pb-2">
      <div className="flex items-center justify-center w-1/5 md:w-1/5">
        <img
          src={product?.images[0]}
          alt={product?.name}
          className="h-32 w-full object-contain bg-gray-300"
        />
      </div>
      <div className="w-4/5 flex flex-col justify-between">
        <h2 className="font-medium text-xl">{product?.name}</h2>
        <p className="text-lg font-medium">
          <del className="text-sm text-[#303049] mr-1">
            {parseFloat(product?.price * quantities[`${product._id}-${product.variant?.name}`])?.toFixed(2)}
          </del>
          {totalPrice.toFixed(2)} ৳
        </p>

        <p className="text-gray-600">{variantName}</p>
        <div className="w-full flex justify-between">
          <div className="flex justify-start items-center space-x-5">
            <button
              onClick={() => handleCart(-1)}
              disabled={quantities[`${product._id}-${product.variant?.name}`] <= 1}
              className={`w-8 h-8 border-2 border-gray-300 rounded-full text-xl flex justify-center items-center focus:outline-none ${
                quantities[`${product._id}-${product.variant?.name}`] <= 1 && "opacity-50 cursor-not-allowed"
              }`}
            >
              -
            </button>
            <p>{quantities[`${product._id}-${product.variant?.name}`]}</p>
            <button
              onClick={() => handleCart(1)}
              disabled={quantities[`${product._id}-${product.variant?.name}`] >= product?.quantity}
              className={`w-8 h-8 border-2 border-gray-300 rounded-full text-xl flex justify-center items-center focus:outline-none ${
                quantities[`${product._id}-${product.variant?.name}`] >= product?.quantity &&
                "opacity-50 cursor-not-allowed"
              }`}
            >
              {" "}
              +{" "}
            </button>
          </div>
          <button
            onClick={handleDeleteCartProduct}
            className="flex items-center rounded-md p-1 border border-red-600 text-red-500 hover:bg-red-500 hover:text-white duration-300"
          >
            <MdDelete className="mr-2"></MdDelete> Delete
          </button>
        </div>

        <div className="mt-4">
          <div className="flex items-center space-x-1">
            <span className="font-medium text-lg">Average Rating:</span>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  color={i < averageRating ? "#ffc107" : "#e4e5e9"}
                />
              ))}
            </div>
            <span className="text-lg">{averageRating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}