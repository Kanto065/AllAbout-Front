import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosPublic from "../../../Hooks/useAxiosPublic";
import Swal from "sweetalert2";
import { MdDelete } from "react-icons/md";
import useDatabaseUser from "../../../Hooks/useDatabaseUser";

export default function CartItem({ product, reload, message, isGrouped }) {
  const [databaseUser] = useDatabaseUser();
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(product.orderedQuantity || 0);

  useEffect(() => {
    setQuantity(product.orderedQuantity);
  }, [product.orderedQuantity]);

  const handleQuantityChange = async (change) => {
    const newQuantity = quantity + change;

    if (newQuantity < 1) {
      Swal.fire({
        icon: "error",
        title: "Quantity must be at least 1",
      });
      return;
    }

    if (newQuantity > product?.quantity) {
      Swal.fire({
        icon: "error",
        title: `Only ${product?.quantity} items available in stock`,
      });
      return;
    }

    const cart = {
      email: databaseUser?.email,
      productId: product._id,
      variant: product?.variant,
      quantity: newQuantity,
    };

    try {
      const response = await axiosPublic.patch(`/cart`, cart);
      if (response?.data?.modifiedCount > 0) {
        Swal.fire({
          position: "top-right",
          icon: "success",
          title: "Cart updated",
          showConfirmButton: false,
          timer: 1000,
        });
        setQuantity(newQuantity);
        reload();
      }
    } catch (err) {
      console.error("Error updating cart:", err);
      Swal.fire({
        icon: "error",
        title: "Error updating cart",
      });
    }
  };

  const handleInputChange = async (value) => {
    const numValue = parseInt(value) || 1;
    const newQuantity = Math.max(1, Math.min(product?.quantity, numValue));

    const cart = {
      email: databaseUser?.email,
      productId: product._id,
      variant: product?.variant,
      quantity: newQuantity,
    };

    try {
      const response = await axiosPublic.patch(`/cart`, cart);
      if (response?.data?.modifiedCount > 0) {
        setQuantity(newQuantity);
        reload();
      }
    } catch (err) {
      console.error("Error updating cart:", err);
    }
  };

  const handleDeleteCartProduct = () => {
    const variantText = product?.variant?.name ? ` - ${product?.variant?.name}` : '';

    Swal.fire({
      title: "Are you sure?",
      text: `Remove "${product?.name}${variantText}" from cart?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!",
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
                title: "Removed!",
                text: `${product?.name}${variantText} removed from cart.`,
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
              reload();
            }
          })
          .catch((error) => {
            console.error("Error deleting product from cart:", error);
            Swal.fire({
              icon: "error",
              title: "Error removing item",
            });
          });
      }
    });
  };

  const handleNavigateToProduct = () => {
    // Use product ID instead of name to avoid 404 errors
    navigate(`/product/${product?._id}`);
  };

  const price = product.price - (product.price * product.discount / 100);
  const totalPrice = price * quantity;

  // Out of stock message
  if (message) {
    return (
      <div className="relative bg-red-50 border border-red-200 rounded-lg p-3">
        <button
          onClick={handleDeleteCartProduct}
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-100 hover:bg-red-200 rounded-full text-red-600 transition"
        >
          <MdDelete size={16} />
        </button>

        <div className="flex gap-3 pr-8">
          <img
            src={product?.images[0]}
            alt={product?.name}
            className="w-20 h-20 object-cover rounded opacity-50"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-red-700 text-sm">{product?.name}</h3>
            <p className="text-red-500 text-xs mt-1">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-white rounded-lg p-3 ${isGrouped ? '' : 'shadow-sm hover:shadow-md'} transition`}>
      {/* Delete button - upper right corner */}
      <button
        onClick={handleDeleteCartProduct}
        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-50 hover:bg-red-100 rounded-full text-red-600 transition border border-red-200"
      >
        <MdDelete size={16} />
      </button>

      <div className="flex gap-3 pr-8">
        {/* Product Image - Clickable */}
        <div className="flex-shrink-0 cursor-pointer" onClick={handleNavigateToProduct}>
          <img
            src={product?.images[0]}
            alt={product?.name}
            className="w-20 h-20 object-cover rounded border border-gray-200 hover:border-blue-400 transition"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          {/* Name and Variant - Clickable */}
          <div onClick={handleNavigateToProduct} className="cursor-pointer">
            <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition text-sm line-clamp-1">
              {product?.name}
            </h3>

            {product?.variant?.name && (
              <p className="text-xs text-gray-600 mt-0.5">{product.variant.name}</p>
            )}
          </div>

          {/* Price and Stock */}
          <div className="mt-1.5">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">৳{totalPrice.toFixed(2)}</span>
              {product.discount > 0 && (
                <>
                  <del className="text-xs text-gray-400">৳{(product.price * quantity).toFixed(2)}</del>
                  <span className="text-xs text-green-600 font-medium">-{product.discount}%</span>
                </>
              )}
            </div>

            <p className="text-xs text-gray-500 mt-0.5">
              Stock: <span className={product.quantity < 5 ? "text-orange-600 font-medium" : ""}>{product.quantity} available</span>
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="mt-2">
            <div className="inline-flex items-center bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="w-7 h-7 flex items-center justify-center text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition font-bold"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                max={product.quantity}
                value={quantity}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-10 h-7 text-center font-semibold text-xs text-gray-900 bg-white border-x border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= product.quantity}
                className="w-7 h-7 flex items-center justify-center text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}