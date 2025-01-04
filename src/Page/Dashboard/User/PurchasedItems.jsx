import { useEffect, useState } from "react";
import useAxiosPublic from "../../../Hooks/useAxiosPublic";
import { Link } from "react-router-dom";

export default function PurchasedItems({ orderId, setTotal }) {
  const axiosPublic = useAxiosPublic();
  const [orderedProducts, setOrderedProducts] = useState([]);

  useEffect(() => {
    axiosPublic
      .get(`/purchasedItems/${orderId}`)
      .then((res) => setOrderedProducts(res?.data));
  }, [axiosPublic, orderId]);

  useEffect(() => {
    const totalPrice = orderedProducts.reduce((sum, product) => {
      const productTotal =
        product?.orderedQuantity *
        (product?.price * (1 - product?.discount / 100));
      return sum + productTotal;
    }, 0);

    // Set the total price using setTotal
    setTotal(totalPrice.toFixed(2));
  }, [orderedProducts, setTotal]);

  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start gap-1">
      {orderedProducts?.map((product) => (
        <div
          key={product?._id}
          className="flex items-start bg-gray-50 rounded-lg shadow-md p-2 border border-gray-200"
        >
          <Link to={`/products/${product?.name}`}>
            <img
              src={product?.images[0]}
              alt={product?.name}
              className="w-20 h-20 object-cover rounded-lg border border-gray-300 mr-4"
            />
          </Link>
          <div className="text-sm">
            <p className="font-semibold text-blue-600">
              Total Price:{" "}
              {(
                product?.orderedQuantity *
                (product?.price * (1 - product?.discount / 100))
              ).toFixed(2)}
              ৳
            </p>
            <Link
              to={`/products/${product?.name}`}
              className="text-base font-medium line-clamp-2 hover:text-blue-700"
            >
              {product?.name}
            </Link>
            <p className="text-gray-600">
              Quantity: {product?.orderedQuantity}
            </p>
            <p className="text-gray-600">
              P_Code: {product?.code}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
