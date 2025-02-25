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
import Slider from "react-slick"; // Import react-slick
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ProductPage = () => {
  const { user } = useAuth();
  const axiosPublic = useAxiosPublic();
  const [databaseUser, refetch] = useDatabaseUser();
  const [productData, setProductData] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [orderedQuantities, setOrderedQuantities] = useState({});
  const [details, setDetails] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewImage, setReviewImage] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [selectedVariantImage, setSelectedVariantImage] = useState(null);
  const { name: productName } = useParams();
  const location = useLocation()?.pathname;
  const navigate = useNavigate();

  useEffect(() => {
    axiosPublic.get(`/products/${productName}`).then((data) => {
      setProductData(data?.data);
    });

    if (productData?._id) {
      axiosPublic.get(`/reviews/${productData?._id}`).then((data) => {
        const reviewsData = data?.data || [];
        setReviews(reviewsData);
        calculateAverageRating(reviewsData);
      });
    }
  }, [axiosPublic, productName, productData?._id]);

  useEffect(() => {
    if (productData && productData.variants) {
      const variantKeys = Object.keys(productData.variants);
      if (variantKeys.length > 0) {
        // Initialize orderedQuantities for each variant
        const initialQuantities = variantKeys.reduce((acc, color) => {
          acc[color] = acc[color] || 0; // Initialize to 0 or keep existing value
          return acc;
        }, { ...orderedQuantities });

        setOrderedQuantities(initialQuantities);

        // Set the default selected color and image if not already set
        if (!variantKeys.includes(selectedColor)) {
          setSelectedColor(variantKeys[0]);
          setSelectedVariantImage(productData.variants[variantKeys[0]].image);
        }
      }
    } else {
      // If no variants, initialize with product quantity
      setOrderedQuantities((prev) => ({ ...prev, base: 1 })); // Set initial quantity to 1
    }
  }, [productData, selectedColor]);

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
    if (productData?.details) {
      const sanitizedHTML = DOMPurify.sanitize(productData.details);
      const content = <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
      setDetails(content);
    }
  }, [productData]);

  const handleNextImage = () => {
    setSelectedImageIndex(
      (prevIndex) => (prevIndex + 1) % (productData?.images?.length || 1)
    );
  };

  const handlePrevImage = () => {
    setSelectedImageIndex(
      (prevIndex) =>
        (prevIndex - 1 + (productData?.images?.length || 1)) % (productData?.images?.length || 1)
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
  
    const cartItems = [];
    const hasVariants = productData?.variants && Object.keys(productData.variants).length > 0;
  
    // Iterate over the ordered quantities for each variant
    for (const [variant, quantity] of Object.entries(orderedQuantities)) {
      if (quantity > 0 && (hasVariants ? variant !== 'base' : true)) {
        const variantDetails = hasVariants ? { name: variant, image: productData.variants[variant].image } : null;
  
        cartItems.push({
          email: databaseUser?.email,
          productId: productData?._id,
          variant: variantDetails,
          quantity,
        });
      }
    }
  
    try {
      const responses = await Promise.all(
        cartItems.map((item) => axiosPublic.post(`/cart`, item))
      );
  
      const successfulAdditions = responses.filter(
        (response) => response?.data?.insertedId || response?.data?.status
      );
  
      if (successfulAdditions.length > 0) {
        Swal.fire({
          icon: "success",
          title: "Products added to cart successfully",
        });
        refetch();
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to add products to cart",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error adding products to cart",
      });
    }
  };
  
  
  

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    setReviewImage(files[0]); // Set the first selected file as the review image
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axiosPublic.post(
        "https://server.allaboutcraftbd.com/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return `https://server.allaboutcraftbd.com/uploads/${response.data.file.filename}`; // Adjust according to your server response
    } catch (error) {
      throw new Error("File upload failed");
    }
  };

  const handleReviewSubmit = async () => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }

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
      const response = await axiosPublic.post(
        `/reviews/${productData?._id}`,
        reviewData
      );
      console.log("Review Submission Response:", response); // Log the response from the server
      if (response?.data?.insertedId) {
        Swal.fire({
          icon: "success",
          title: "Review submitted successfully",
        });
        const updatedReviews = [...reviews, reviewData];
        setReviews(updatedReviews);
        setRating(0);
        setReviewText("");
        setReviewImage(null);
        calculateAverageRating(updatedReviews);
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

  const isVideo = (url) => {
    if (typeof url !== 'string') return false;
    return (
      url.endsWith(".mp4") ||
      url.endsWith(".webm") ||
      url.endsWith(".ogg") ||
      url.endsWith(".mov") ||
      url.endsWith(".avi") ||
      url.endsWith(".mkv")
    );
  };

  const handleQuantityChange = (variant, amount) => {
    setOrderedQuantities((prev) => {
      const newQuantity = (prev[variant] || 0) + amount;
      if (newQuantity < 0) return prev;
      return { ...prev, [variant]: newQuantity };
    });
  };

  if (!productData) {
    return (
      <div className="max-w-[95%] 2xl:max-w-7xl mx-auto pt-32 pb-10">
        Loading...
      </div>
    );
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    beforeChange: (current, next) => setSelectedImageIndex(next),
  };

  const selectedVariant = productData.variants ? productData.variants[selectedColor] : null;
  const availableQuantity = selectedVariant ? selectedVariant.quantity : productData.quantity;
  const isOrderQuantityZero = productData.variants ? orderedQuantities[selectedColor] === 0 : orderedQuantities.base === 0;

  return (
    <div className="max-w-[95%] 2xl:max-w-7xl mx-auto pt-32 md:pt-48 pb-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left - Product Images */}
        <div className="flex-1 w-full mx-auto">
          <div className="relative rounded-lg overflow-hidden bg-white mb-4 lg:w-10/12 mx-auto">
            <div className="hidden lg:block">
              {isVideo(selectedVariantImage || productData?.images[selectedImageIndex]) ? (
                <video
                  src={selectedVariantImage || productData?.images[selectedImageIndex]}
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
                  src={selectedVariantImage || productData?.images[selectedImageIndex]}
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
            <div className="lg:hidden">
              <Slider {...settings}>
                {productData?.images?.map((media, idx) =>
                  isVideo(media) ? (
                    <video
                      key={idx}
                      src={media}
                      className="w-full h-[400px] object-contain"
                      autoPlay
                      loop
                      muted
                      controls
                    />
                  ) : (
                    <img
                      key={idx}
                      src={media}
                      alt={`Thumbnail ${idx}`}
                      className="w-full h-[400px] object-contain"
                    />
                  )
                )}
                {selectedVariantImage && !isVideo(selectedVariantImage) && (
                  <img
                    src={selectedVariantImage}
                    alt="Selected Variant"
                    className="w-full h-[400px] object-contain"
                  />
                )}
              </Slider>
            </div>
          </div>

          <div className="hidden lg:flex justify-center items-center space-x-2 overflow-x-auto">
            {productData?.images?.map((media, idx) =>
              isVideo(media) ? (
                <video
                  key={idx}
                  src={media}
                  className={`w-14 h-14 object-cover rounded-lg cursor-pointer border-2 ${
                    selectedImageIndex === idx && !selectedVariantImage
                      ? "border-blue-600"
                      : "border-gray-300"
                  }`}
                  onClick={() => {
                    setSelectedImageIndex(idx);
                    setSelectedVariantImage(null);
                  }}
                  muted
                />
              ) : (
                <img
                  key={idx}
                  src={media}
                  alt={`Thumbnail ${idx}`}
                  className={`w-14 h-14 object-cover rounded-lg cursor-pointer border-2 ${
                    selectedImageIndex === idx && !selectedVariantImage
                      ? "border-blue-600"
                      : "border-gray-300"
                  }`}
                  onClick={() => {
                    setSelectedImageIndex(idx);
                    setSelectedVariantImage(null);
                  }}
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

          {/* Available Quantity */}
          <div className="mt-2">
            <span className="font-medium text-lg">Available Quantity: </span>
            <span className="text-lg">{availableQuantity}</span>
          </div>

          {/* Color Variant Selection using productData.variants */}
          {productData?.variants && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">
                Product Variant: {selectedColor}
              </h3>
              <div className="flex space-x-2 mt-2">
                {Object.entries(productData.variants).map(
                  ([color, { image }], index) => (
                    <img
                      key={index}
                      src={image}
                      alt={color}
                      className={`w-12 h-12 rounded-lg cursor-pointer border-2 ${
                        selectedColor === color
                          ? "border-orange-500"
                          : "border-gray-200"
                      }`}
                      onClick={() => {
                        setSelectedColor(color);
                        setSelectedVariantImage(image);
                      }}
                    />
                  )
                )}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className={`mt-4`}>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-lg">Order Quantity: </span>
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => handleQuantityChange(productData.variants ? selectedColor : 'base', -1)}
                  className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition"
                  disabled={isOrderQuantityZero}
                >
                  -
                </button>
                <span className="text-lg">{productData.variants ? orderedQuantities[selectedColor] : orderedQuantities.base}</span>
                <button
                  onClick={() => handleQuantityChange(productData.variants ? selectedColor : 'base', 1)}
                  className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition"
                  disabled={orderedQuantities[productData.variants ? selectedColor : 'base'] >= availableQuantity}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {availableQuantity < 1 ? (
            <p className="text-xl font-semibold text-orange-500 mt-4">
              Stock Out
            </p>
          ) : (
            <div className="mt-6 flex flex-col md:flex-row gap-4">
              <SingleOrder
                productName={productData?.name}
                adiInfo={{ order: productData.variants ? orderedQuantities[selectedColor] : orderedQuantities.base, selectedImageIndex }}
              />
              <button
                onClick={handleCart}
                className={`px-6 py-3 bg-[#7dd67d] text-white rounded-lg transition ${isOrderQuantityZero ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={isOrderQuantityZero}
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

          <div className="mt-6">
            <h2 className="text-lg font-medium mb-2">Product Description</h2>
            <p className="text-gray-700">{productData?.description}</p>
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
                {/* Display selected product variant images */}
                {productData?.variants && (
                  <div className="mt-2">
                    <h4 className="text-lg font-medium mb-2">
                      Selected Product Variants
                    </h4>
                    <div className="flex space-x-2">
                      {Object.entries(productData.variants).map(
                        ([color, { image }], index) => (
                          <img
                            key={index}
                            src={image}
                            alt={color}
                            className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                          />
                        )
                      )}
                    </div>
                  </div>
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
                color={i < (hover || rating) ? "#ffc107" : "#e4e5e9"}
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
