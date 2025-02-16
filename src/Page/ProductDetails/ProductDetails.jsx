import React, { useEffect, useState } from "react";
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
import { FaStar } from "react-icons/fa";

const ProductPage = () => {
  const { user } = useAuth();
  const axiosPublic = useAxiosPublic();
  const [databaseUser, refetch] = useDatabaseUser();
  const [productData, setProductData] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [orderedQuantity, setOrderedQuantity] = useState(1);
  const [details, setDetails] = useState(null);
  const [selectedColor, setSelectedColor] = useState("Grey");
  const [selectedSize, setSelectedSize] = useState(34);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewImage, setReviewImage] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const { name: productName } = useParams();
  const location = useLocation()?.pathname;
  const navigate = useNavigate();

  const colors = ["Grey", "Green", "Pink", "Yellow", "Blue"];
  const sizes = [34, 36, 38, 40, 42, 44, 46, 48, 50];
  useEffect(() => {
    axiosPublic
      .get(`/products/${productName}`)
      .then((data) => setProductData(data?.data));

    axiosPublic.get(`/reviews/${productName}`).then((data) => {
      setReviews(data?.data || []);
      calculateAverageRating(data?.data || []);
    });
  }, [axiosPublic, productName]);

    const uploadImage = async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      try {
          const response = await axios.post('https://server.allaboutcraftbd.com/upload', formData, {
              headers: {
                  'Content-Type': 'multipart/form-data',
              },
          });
          return `https://server.allaboutcraftbd.com/uploads/${response.data.file.filename}`; // Adjust according to your server response
      } catch (error) {
          throw new Error('File upload failed');
      }
  };

  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) {
      setAverageRating(0);
      return;
    }
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = totalRating / reviews.length;
    setAverageRating(average);
  };

  useEffect(() => {
    const sanitizedHTML = DOMPurify.sanitize(productData?.details);
    const content = <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
    setDetails(content);
  }, [productData]);

  const handleNextImage = () => {
    setSelectedImageIndex(
      (prevIndex) => (prevIndex + 1) % productData?.images.length
    );
  };

  const handlePrevImage = () => {
    setSelectedImageIndex(
      (prevIndex) =>
        (prevIndex - 1 + productData?.images.length) %
        productData?.images.length
    );
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
          title: "Another Product added to cart successfully!",
          icon: "success",
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

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    setReviewImage(files[0]); // Set the first selected file as the review image
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axiosPublic.post('https://server.allaboutcraftbd.com/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return `https://server.allaboutcraftbd.com/uploads/${response.data.file.filename}`; // Adjust according to your server response
    } catch (error) {
      throw new Error('File upload failed');
    }
  };

  const handleReviewSubmit = async () => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }

    const formData = new FormData();
    formData.append("rating", rating);
    formData.append("comment", reviewText);

    let imageURL = null;
    if (reviewImage) {
      try {
        imageURL = await uploadImage(reviewImage);
      } catch (error) {
        console.error("Error uploading image:", error);
        Swal.fire({
          icon: "error",
          title: "Error uploading image",
        });
        return;
      }
    }

    const reviewData = {
      rating,
      comment: reviewText,
      image: imageURL,
    };

    console.log("Review Data:", reviewData); // Log the review data being sent

    try {
      const response = await axiosPublic.post(`/products/${productData?._id}/reviews`, reviewData);
      console.log("Review Submission Response:", response); // Log the response from the server
      if (response?.data?.insertedId) {
        Swal.fire({
          icon: "success",
          title: "Review submitted successfully",
        });
        setReviews([...reviews, reviewData]);
        setRating(0);
        setReviewText("");
        setReviewImage(null);
        calculateAverageRating([...reviews, reviewData]);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to submit review",
        });
      }
    } catch (err) {
      console.error("Error submitting review:", err); // Log the error
      Swal.fire({
        icon: "error",
        title: "Error submitting review",
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

          <div className="flex justify-center items-center space-x-2 overflow-x-auto">
            {productData?.images?.map((media, idx) =>
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
            )}
          </div>
        </div>

        {/* Right - Product Details */}
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">
            {productData?.name}
          </h1>

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

          {/* Product Code */}
          <div className="mt-2">
            <span className="font-medium text-lg">Product Code: </span>
            <span className="text-lg">CODE{selectedImageIndex + 1}</span>
          </div>

          {/* Color Family - Added Section */}
          {productData?.colorFamily?.length > 0 && (
            <div className="mt-2">
              <span className="font-medium text-lg">Color Family: </span>
              <div className="flex gap-2 mt-2">
                {productData.colorFamily.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`px-4 py-1 rounded-full border-2 ${
                      selectedImageIndex === index
                        ? "border-blue-500 font-medium"
                        : "border-gray-300"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

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

         

          <div className="mt-6">
            <h2 className="text-lg font-medium mb-2">Product Description</h2>
            <p className="text-gray-700">{productData?.description}</p>
          </div>

          {/* Color and Size Selection */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Color Variant: {selectedColor}</h3>
            <div className="flex space-x-2 mt-2">
              {colors.map((color, index) => (
                <img
                  key={index}
                  src={`/path-to-${color.toLowerCase()}.jpg`}
                  alt={color}
                  className={`w-12 h-12 rounded-lg cursor-pointer border-2 ${
                    selectedColor === color ? "border-orange-500" : "border-gray-200"
                  }`}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold">Size</h3>
            <div className="flex space-x-2 mt-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  className={`px-4 py-2 border ${
                    selectedSize === size ? "bg-orange-500 text-white" : "bg-gray-100"
                  } rounded-lg cursor-pointer`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
              
            </div>
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

          <div className="mt-6 text-2xl flex items-center space-x-5">
            <Wish id={productData?._id} />
            <IoShareSocialOutline
              onClick={handleShare}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>

      

      <div className="mt-6">
        <h2 className="text-lg font-medium mb-2">Product Details</h2>
        {details}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium mb-4">Product Reviews</h2>
        <div className="mb-6">
          <div className="flex items-center space-x-1 mb-4">
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
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={index} className="border-b pb-4 mb-4">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      color={i < review.rating ? "#ffc107" : "#e4e5e9"}
                    />
                  ))}
                </div>
                <p className="mt-2 text-gray-700">{review.comment}</p>
                {review.image && (
                  <img
                    src={review.image}
                    alt="Review"
                    className="mt-2 w-32 h-32 object-cover"
                  />
                )}
              </div>
            ))
          ) : (
            <p>No reviews yet. Be the first to review!</p>
          )}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Submit Your Review</h3>
          <div className="flex items-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                color={i < hover || i < rating ? "#ffc107" : "#e4e5e9"}
                onClick={() => setRating(i + 1)}
                onMouseEnter={() => setHover(i + 1)}
                onMouseLeave={() => setHover(null)}
                className="cursor-pointer"
              />
            ))}
          </div>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write your review here..."
            className="mt-2 p-3 border w-full rounded-md"
            rows="4"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-2 p-3 border w-full rounded-md"
          />
          <button
            onClick={handleReviewSubmit}
            className="mt-4 px-6 py-2 bg-[#7dd67d] text-white rounded-lg"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
