import { useEffect, useState } from "react";
import useCart from "../../../Hooks/useCart";
import CartItem from "./CartItem";
import useDatabaseUser from "../../../Hooks/useDatabaseUser";
import useAuth from "../../../Hooks/useAuth";
import useAxiosPublic from "../../../Hooks/useAxiosPublic";
import Swal from "sweetalert2";
import usePurchased from "../../../Hooks/usePurchased";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();
  const [cart, refetch] = useCart();
  const [, , reload] = usePurchased();
  const [databaseUser] = useDatabaseUser();
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDiscountPrice, setTotalDiscountPrice] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(80); // Default delivery fee for inside Dhaka
  const navigate = useNavigate();

  useEffect(() => {
    const totalPricee = cart?.reduce(
      (accumulator, currentValue) =>
        accumulator +
        parseInt(currentValue?.price * currentValue?.orderedQuantity),
      0
    );
    console.log("cart", { cart });
    const totalDiscountPricee = cart?.reduce(
      (accumulator, currentValue) =>
        accumulator +
        parseInt(
          (currentValue?.price -
            (currentValue?.price / 100) * (100 - currentValue?.discount)) *
            currentValue?.orderedQuantity
        ),
      0
    );
    setTotalPrice(totalPricee);
    setTotalDiscountPrice(totalDiscountPricee);
  }, [cart]);

  const handleCheckOut = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    const form = e.target;
    const email = form?.email?.value || databaseUser?.email || user?.email;
    // Gather order information
    const order = {
      name: form?.name?.value || databaseUser?.name,
      email,
      phone: form?.phone?.value || databaseUser?.phone,
      address: form?.address?.value || databaseUser?.location,
      deliveryFee,
      variantName: cart.map(item => item.variant?.name || 'no-variant') // Add variant names
    };

    try {
      const res = await axiosPublic.post(`/cashOnDelivery/${user?.email || databaseUser?.email}`, order);
      if (res?.data?.orderResult?.insertedId) {
        Swal.fire({
          icon: "success",
          title: `${res?.data?.message}`,
          text: "Our agent will contact you very soon!",
        });
        reload();
        navigate("/dashboard/purchase");
        refetch();
        setOpenModal(false);
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      Swal.fire({
        icon: "error",
        title: "Error during checkout",
      });
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-[95%] mx-auto z-40 overflow-x-auto flex flex-col lg:flex-row items-center lg:items-start space-y-10 lg:space-y-0 lg:space-x-5">
        <div className="w-full lg:w-2/3 space-y-10">
          <div className="w-full bg-white space-y-7 p-8">
            <h1 className="text-2xl font-bold">Your Cart</h1>
            {cart?.map((product, idx) => (
              <CartItem key={`${product._id}-${product.variant?.name || 'no-variant'}`} product={product} reload={refetch} />
            ))}
            {cart?.length === 0 && (
              <div className="flex items-center justify-center">
                <img
                  className="h-64 w-64 rounded-full"
                  src="https://i.ibb.co/W27KqWw/Bk-Qx-D7wtn-Z.gif"
                  alt="no data found"
                />
              </div>
            )}
          </div>
        </div>
        <div className="w-full md:w-2/3 lg:w-1/3 bg-white p-8 mb-10 lg:mb-0">
          <h2 className="text-lg text-[#747474] font-semibold">
            Price Details
          </h2>
          <hr className="mb-4" />
          <div className="flex justify-between">
            <p>Price ({cart?.length} items)</p>
            <p>{totalPrice} ৳</p>
          </div>
          <div className="flex justify-between my-2">
            <p>Discount</p>
            <p>-{totalDiscountPrice} ৳</p>
          </div>
          <div className="flex justify-between">
            <p>Delivery Charges</p>
            <p>{deliveryFee} ৳</p>
          </div>
          <ul className="space-y-1 text-xs text-gray-500 mt-3">
            <li>
              <label>
                <input
                  type="radio"
                  name="delivery"
                  value="80"
                  checked={deliveryFee === 80}
                  onChange={() => setDeliveryFee(80)}
                />
                <span className="ml-2">Inside Dhaka (80৳)</span>
              </label>
            </li>
            <li>
              <label>
                <input
                  type="radio"
                  name="delivery"
                  value="150"
                  checked={deliveryFee === 150}
                  onChange={() => setDeliveryFee(150)}
                />
                <span className="ml-2">Outside Dhaka (150৳)</span>
              </label>
            </li>
          </ul>
          <hr className="mt-4" />
          <div className="flex justify-between font-bold mt-1">
            <p>Total Amount</p>
            <p>{totalPrice - totalDiscountPrice + deliveryFee} ৳</p>
          </div>
          <hr className="my-4" />
          <p className="text-center">
            You will save {totalDiscountPrice}৳ on this order
          </p>
          <div className="flex justify-center mt-7">
            <button
              onClick={() => setOpenModal(totalPrice > 0 && true)}
              disabled={cart.some((product) => product.orderedQuantity === 0) || totalPrice <= 0}
              className={`text-white bg-[#8286bb] py-3 px-12 text-lg font-medium rounded-lg scale-100 hover:scale-110 duration-300 ${
                (cart.some((product) => product.orderedQuantity === 0) || totalPrice <= 0) &&
                'cursor-not-allowed opacity-50'
              }`}
            >
              Check Out
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <div
        onClick={() => setOpenModal(false)}
        className={`fixed z-[300] w-screen ${openModal ? "visible opacity-100" : "invisible opacity-0"} inset-0 grid place-items-center bg-black/20 backdrop-blur-sm duration-100`}
      >
        <div
          onClick={(e_) => e_.stopPropagation()}
          className={`absolute max-w-2xl w-full rounded-lg bg-white p-6 drop-shadow-lg ${openModal ? "opacity-1 duration-300" : "scale-110 opacity-0 duration-150"}`}
        >
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <svg
              onClick={() => setOpenModal(false)}
              className="absolute right-8 top-8 w-10 cursor-pointer fill-zinc-600 dark:fill-white"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6.99486 7.00636C6.60433 7.39689 6.60433 8.03005 6.99486 8.42058L10.58 12.0057L6.99486 15.5909C6.60433 15.9814 6.60433 16.6146 6.99486 17.0051C7.38538 17.3956 8.01855 17.3956 8.40907 17.0051L11.9942 13.4199L15.5794 17.0051C15.9699 17.3956 16.6031 17.3956 16.9936 17.0051C17.3841 16.6146 17.3841 15.9814 16.9936 15.5909L13.4084 12.0057L16.9936 8.42059C17.3841 8.03007 17.3841 7.3969 16.9936 7.00638C16.603 6.61585 15.9699 6.61585 15.5794 7.00638L11.9942 10.5915L8.40907 7.00636C8.01855 6.61584 7.38538 6.61584 6.99486 7.00636Z"></path>
            </svg>
            <div className="flex flex-col space-y-1.5 lg:p-6 p-2">
              <h3 className="text-2xl font-semibold whitespace-nowrap">
                Shipping Details
              </h3>
            </div>
            <div className="lg:p-6 p-2">
              {/* Shipping Details form */}
              <form className="space-y-4" onSubmit={handleCheckOut}>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <input
                    name="name"
                    type="text"
                    className="bg-transparent flex h-10 w-full rounded-md border px-3"
                    placeholder="Enter your name"
                    defaultValue={databaseUser?.name || ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    name="email"
                    type="email"
                    className="bg-transparent flex h-10 w-full rounded-md border px-3"
                    placeholder="Enter your email"
                    defaultValue={databaseUser?.email || ""}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <input
                    name="phone"
                    type="number"
                    className="bg-transparent flex h-10 w-full rounded-md border px-3"
                    placeholder="Enter your phone"
                    defaultValue={databaseUser?.phone || ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <input
                    name="address"
                    type="text"
                    className="bg-transparent flex h-10 w-full rounded-md border px-3"
                    placeholder="Enter your address"
                    defaultValue={databaseUser?.location || ""}
                    required
                  />
                </div>
                <div className="flex justify-center pt-5">
                  <button
                    type="submit"
                    className="text-white bg-[#8286bb] py-3 px-12 text-lg font-medium rounded-lg scale-100 hover:scale-110 duration-300"
                  >
                    Complete Purchase
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
