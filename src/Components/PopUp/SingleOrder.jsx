import { useEffect, useState } from "react";
import useAuth from "../../Hooks/useAuth";
import useAxiosPublic from "../../Hooks/useAxiosPublic";
import useDatabaseUser from "../../Hooks/useDatabaseUser";
import Swal from "sweetalert2";
import usePurchased from "../../Hooks/usePurchased";
import { useNavigate } from "react-router-dom";

export default function SingleOrder({ productName, adiInfo }) {
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();
  const [refetch] = usePurchased();
  const [databaseUser] = useDatabaseUser();
  const [openModal, setOpenModal] = useState(false);
  const [orderedQuantity, setOrderedQuantity] = useState(1);
  const [deliveryFee, setDeliveryFee] = useState(80);
  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { order, selectedImageIndex, items } = adiInfo;

  // Fetch product data only when the modal is open AND if we don't have items list
  useEffect(() => {
    if (!items || items.length === 0) {
      axiosPublic
        .get(`/products/${productName}`)
        .then((res) => setProduct(res?.data));
    }
  }, [openModal, productName, axiosPublic, items]);

  useEffect(() => {
    setOrderedQuantity(order)
  }, [order]);

  const handleQuantityChange = (increment) => {
    setOrderedQuantity((prev) =>
      increment ? Math.min(prev + 1, product?.quantity) : Math.max(prev - 1, 1)
    );
  };

  const showAlert = (icon, title, text) => {
    Swal.fire({
      icon,
      title,
      text,
    });
  };

  const handleCheckOut = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form?.email?.value || databaseUser?.email || user?.email;
    const phone = form?.phone?.value;

    if (phone.length < 10 || phone.length > 15) {
      showAlert(
        "warning",
        "Invalid Phone Number",
        "Please enter a valid phone number"
      );
      return;
    }

    const orderData = {
      name: form?.name?.value || databaseUser?.name,
      email,
      phone,
      address: form?.address?.value || databaseUser?.location,
      deliveryFee,
    };

    // Attach items or single product info
    if (items && items.length > 0) {
      orderData.items = items.map(item => ({
        productId: item.productId,
        orderedQuantity: item.quantity,
        code: item.code,
        // variants might need name tracking if not handled by ID reference, 
        // but backend mainly uses productId. 
      }));
    } else {
      orderData.orderedQuantity = orderedQuantity;
      orderData.productId = product?._id;
      orderData.code = "CODE" + (selectedImageIndex + 1);
    }

    try {
      setLoading(true);
      const response = await axiosPublic.post(`/singleOrder/${email}`, orderData);

      // Check for success based on `acknowledged` and display the success message
      if (response?.data?.orderResult?.insertedId) {
        Swal.fire({
          icon: "success",
          title: "Order Created Successfully"
        });
        setOpenModal(false); // Close the modal after successful order
        navigate("/dashboard/purchase");
        refetch(); // Refetch orders
      } else {
        Swal.fire({
          icon: "warning",
          title: "Order Created Fail"
        });
      }
    } finally {
      setLoading(false);
    }
  };



  const totalAmount = () => {
    if (items && items.length > 0) {
      const itemsTotal = items.reduce((sum, item) => {
        const price = item.price || 0;
        const discount = item.discount || 0;
        const finalPrice = price - (price * (discount / 100));
        return sum + (finalPrice * item.quantity);
      }, 0);
      return Math.round(itemsTotal + deliveryFee);
    }

    return Math.round(
      (product?.price * orderedQuantity) -
      (product?.price * (product?.discount / 100) * orderedQuantity) +
      deliveryFee
    );
  };

  return (
    <div>
      <button
        onClick={() => {
          if (!items && (!orderedQuantity || orderedQuantity <= 0)) {
            alert("Please add at least one product to your cart before purchasing.");
            return;
          }
          if (items && items.length === 0) {
            alert("Please select at least one variant.");
            return;
          }
          setOpenModal(true);
        }}
        className="w-full px-6 py-3 bg-[#e65c5c] text-white rounded-lg transition hover:bg-red-600 font-semibold"
      >
        Buy Now
      </button>


      {openModal && (
        <div
          onClick={() => setOpenModal(false)}
          className="fixed inset-0 z-[300] min-h-screen w-screen bg-black/20 backdrop-blur-sm flex justify-center items-center"
        >
          <div
            onClick={(e_) => e_.stopPropagation()}
            className="relative bg-white rounded-lg shadow-lg p-6 max-w-lg w-full transition-transform transform max-h-screen overflow-y-auto"
          >
            <button
              onClick={() => setOpenModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
            >
              ✕
            </button>
            <h3 className="text-2xl font-semibold mb-4">Shipping Details</h3>

            <form className="space-y-4" onSubmit={handleCheckOut}>
              <div>
                <label className="text-sm font-medium">Name</label>
                <input
                  name="name"
                  type="text"
                  className="w-full h-10 border rounded-md px-3"
                  placeholder="Enter your name"
                  defaultValue={databaseUser?.name || ""}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  name="email"
                  type="email"
                  className="w-full h-10 border rounded-md px-3"
                  placeholder="Enter your email"
                  defaultValue={databaseUser?.email || ""}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Phone</label>
                <input
                  name="phone"
                  type="number"
                  className="w-full h-10 border rounded-md px-3"
                  placeholder="Enter your phone"
                  defaultValue={databaseUser?.phone || ""}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Address</label>
                <input
                  name="address"
                  type="text"
                  className="w-full h-10 border rounded-md px-3"
                  placeholder="Enter your address"
                  defaultValue={databaseUser?.location || ""}
                  required
                />
              </div>

              {/* Order Summary */}
              <div className="border rounded p-3 bg-gray-50">
                <h4 className="font-medium mb-2 border-b pb-1">Order Summary</h4>

                {items && items.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm">
                        <img
                          src={item.image}
                          alt={item.variantName}
                          className="w-10 h-10 object-cover rounded border"
                        />
                        <div className="flex-1">
                          <p className="font-medium truncate">{item.variantName}</p>
                          <p className="text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">
                            {Math.round((item.price - (item.price * item.discount / 100)) * item.quantity)} ৳
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <img
                        className="h-14 w-14 object-cover rounded"
                        src={product?.images?.[0]}
                        alt={product?.name}
                      />
                      <h3 className="font-medium text-sm">{product?.name}</h3>
                    </div>
                    <div className="space-y-2 mt-2">
                      <label className="text-sm font-medium">Order Quantity</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(false)}
                          className="px-3 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition"
                          disabled={orderedQuantity <= 1}
                        >
                          -
                        </button>
                        <span className="font-medium w-8 text-center">{orderedQuantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(true)}
                          className="px-3 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition"
                          disabled={orderedQuantity >= product?.quantity}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Delivery Options</label>
                <div className="space-y-1">
                  <label className="flex items-center cursor-pointer p-2 border rounded hover:bg-gray-50">
                    <input
                      type="radio"
                      name="delivery"
                      value="80"
                      checked={deliveryFee === 80}
                      onChange={() => setDeliveryFee(80)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">Inside Dhaka (80৳)</span>
                  </label>
                  <label className="flex items-center cursor-pointer p-2 border rounded hover:bg-gray-50">
                    <input
                      type="radio"
                      name="delivery"
                      value="150"
                      checked={deliveryFee === 150}
                      onChange={() => setDeliveryFee(150)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">Outside Dhaka (150৳)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between items-center font-bold border-t pt-4 text-lg">
                <span>Total Amount</span>
                <span className="text-red-600">
                  {totalAmount()} ৳
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#7d84d8] text-white rounded-md hover:bg-[#4d54b8] transition font-semibold"
                disabled={loading}
              >
                {loading ? "Processing..." : "Confirm Checkout"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
