import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import useAxiosPublic from "../../Hooks/useAxiosPublic";
import DOMPurify from "dompurify";
import { IoShareSocialOutline } from "react-icons/io5";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import useAuth from "../../Hooks/useAuth";
import useDatabaseUser from "../../Hooks/useDatabaseUser";
import Swal from "sweetalert2";
import Wish from "../../Components/Icons/Wish";
import SingleOrder from "../../Components/PopUp/SingleOrder";

export default function ProductDetails() {
  const { user } = useAuth();
  const axiosPublic = useAxiosPublic();
  const [databaseUser, refetch] = useDatabaseUser();
  const [productData, setProductData] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // Track the index of the selected image
  const [orderedQuantity, setOrderedQuantity] = useState(1); // Default quantity of 1
  const [details, setDetails] = useState(null);
  const { name: productName } = useParams(); // Destructure product name from params
  const location = useLocation()?.pathname;
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  // Function to open modal
  const openModal = (media, index) => {
    setModalContent(media); // Set the selected media in modal
    setSelectedImageIndex(index); // Set the index of the selected image/video
    setIsModalOpen(true); // Open the modal
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  useEffect(() => {
    // Fetch products from the JSON file
    axiosPublic
      .get(`/products/${productName}`)
      .then((data) => setProductData(data?.data));
  }, [axiosPublic, productName]);

  useEffect(() => {
    const sanitizedHTML = DOMPurify.sanitize(productData?.details);
    const content = <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
    setDetails(content);
  }, [productData]);

  const handleNextImage = () => {
    setSelectedImageIndex(
      (prevIndex) => (prevIndex + 1) % productData?.images.length
    );
    setModalContent(productData?.images[nextIndex]); // Update the modal content
  };

  const handlePrevImage = () => {
    setSelectedImageIndex(
      (prevIndex) =>
        (prevIndex - 1 + productData?.images.length) %
        productData?.images.length
    );
    setModalContent(productData?.images[prevIndex]); 
  };
  

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: productData?.name,
          text: `Check out this product: ${productData?.name} from ${productData?.origin}`,
          url: window.location.href,
        })
        .then(() => console.log("Share successful"))
        .catch((error) => console.error("Error sharing:", error));
    } else {
      alert("Web Share API is not supported in this browser.");
    }
  };

  const handleCart = async () => {
    if (!user) {
      // Redirect the user to login using navigate
      navigate("/login", { state: { from: location } });
      return;
    }

    const cart = {
      email: databaseUser?.email,
      productId: productData?._id,
      quantity: orderedQuantity,
      code: "CODE" + (selectedImageIndex + 1),
    };

    try {
      const response = await axiosPublic.post(`/cart`, cart);
      if (response?.data?.insertedId) {
        Swal.fire({
          icon: "success",
          title: "Product added to cart successfully",
        });
        refetch();
      } else if (response?.data?.status) {
        Swal.fire({
          title: "You already added this on your cart successfully!",
          icon: "info",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Go Cart!",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate(`/dashboard/cart`);
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to add product to cart",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error adding product to cart",
      });
    }
  };

  const isVideo = (url) =>
    url?.endsWith(".mp4") || 
    url?.endsWith(".webm") || 
    url?.endsWith(".ogg") || 
    url?.endsWith(".mov") || 
    url?.endsWith(".avi") || 
    url?.endsWith(".mkv");


  if (!productData) {
    // Return a loading state while product data is being fetched
    return (
      <div className="max-w-[95%] 2xl:max-w-7xl mx-auto pt-32 pb-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-[95%] 2xl:max-w-7xl mx-auto pt-32 md:pt-48 pb-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left - Product Images */}
        <div className="flex-1 w-full mx-auto">
          {/* Main selected image */}
          <div className="relative rounded-lg overflow-hidden bg-white mb-4 lg:w-10/12 mx-auto">
            {isVideo(productData?.images[selectedImageIndex]) ? (
              <video
                src={productData?.images[selectedImageIndex]}
                autoPlay
                loop
                muted
                controls
                className="w-full h-[400px] object-contain"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={productData?.images[selectedImageIndex]}
                alt="Selected Product"
                className="w-full min-h-[400px] h-full object-contain"
              />
            )}
            {/* Forward and Backward buttons */}
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-transparent text-gray-400 rounded-full text-3xl hover:bg-gray-200"
            >
              <IoIosArrowBack />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent text-gray-400 rounded-full text-3xl hover:bg-gray-200"
            >
              <IoIosArrowForward />
            </button>
          </div>

          

          {/* Thumbnails */}
          <div className="flex justify-center items-center space-x-2 overflow-x-auto">
            {productData?.images?.map((media, idx) => (
              isVideo(media) ? (
                <video
                  key={idx}
                  src={media}
                  className={`w-14 h-14 object-cover rounded-lg cursor-pointer border-2 ${
                    selectedImageIndex === idx
                      ? "border-blue-600"
                      : "border-gray-300"
                  }`}
                  onClick={() => setSelectedImageIndex(idx)}
                  muted
                />
              ) : (
                <img
                  key={idx}
                  src={media}
                  alt={`Thumbnail ${idx}`}
                  className={`w-14 h-14 object-cover rounded-lg cursor-pointer border-2 ${
                    selectedImageIndex === idx
                      ? "border-blue-600"
                      : "border-gray-300"
                  }`}
                  onClick={() => setSelectedImageIndex(idx)}
                />
              )
            ))}
          </div>
        </div>

        {/* Right - Product Details */}
        <div className="flex-1">
          {/* Product Name */}
          <h1 className="text-2xl md:text-3xl font-bold mb-4">
            {productData?.name}
          </h1>
          {/* <p className="font-medium text-lg">Origin: {productData?.origin}</p> */}
          {/* Pricing and Discount */}
          <div className="flex items-center gap-2">
            <span className="text-2xl md:text-3xl text-red-600 font-bold">
              <span className="text-sm md:text-lg mr-0.5">৳</span>
              {parseInt(productData?.price) -
                (parseInt(productData?.price) / 100) * productData?.discount}
            </span>
            <span className="text-sm md:text-lg line-through text-gray-500">
              ৳ {productData?.price}
            </span>
            <span className="text-sm md:text-lg text-green-600">
              -{productData?.discount}%
            </span>
          </div>

          {/* Watch Strap Color */}
          <div className="mt-2">
            <span className="font-medium text-lg">Product Code: </span>
            <span className="text-lg">CODE{selectedImageIndex + 1}</span>
          </div>

          {/* Quantity Selector */}
          <div className={`mt-4 ${productData?.quantity < 1 && "hidden"}`}>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-lg">Order Quantity: </span>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => setOrderedQuantity(orderedQuantity - 1)}
                  className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition"
                  disabled={orderedQuantity <= 1}
                >
                  -
                </button>
                <span className="text-lg">{orderedQuantity}</span>
                <button
                  disabled={orderedQuantity >= productData?.quantity}
                  onClick={() => setOrderedQuantity(orderedQuantity + 1)}
                  className=" px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition"
                >
                  +
                </button>
              </div>
            </div>
            <p className={`font-medium text-lg mt-2 ${productData?.quantity < 1 && "hidden"}`}>
              Available Quantity: {productData?.quantity}
            </p>
          </div>

          {productData?.quantity < 1 ? (
            <p className="text-xl font-semibold text-orange-500 mt-4">Stock Out</p>
          ) : (
            <div className="mt-6 flex flex-col md:flex-row gap-4">
              <SingleOrder
                productName={productData?.name}
                adiInfo={{ order: orderedQuantity, selectedImageIndex }}
              />
              <button
                onClick={handleCart}
                className="px-6 py-3 bg-[#7dd67d] text-white rounded-lg transition"
              >
                Add to Cart
              </button>
            </div>
          )}

          {/* Share Button */}
          <div className="mt-6 text-2xl flex items-center space-x-5">
            <Wish id={productData?._id} />
            <IoShareSocialOutline
              onClick={handleShare}
              className="cursor-pointer"
            />
          </div>

          {/* Product Description */}
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-2">Product Description</h2>
            <p className="text-gray-700">{productData?.description}</p>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="mt-6">
        <h2 className="text-lg font-medium mb-2">Product Details</h2>
        {details}
      </div>
    </div>
  );
}
