import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useAxiosPublic from "../../Hooks/useAxiosPublic";
import DOMPurify from "dompurify";
import { IoShareSocialOutline } from "react-icons/io5";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { BsCart3 } from "react-icons/bs";
import useAuth from "../../Hooks/useAuth";
import useDatabaseUser from "../../Hooks/useDatabaseUser";
import Swal from "sweetalert2";
import Wish from "../../Components/Icons/Wish";
import SingleOrder from "../../Components/PopUp/SingleOrder";
import { FaStar } from "react-icons/fa";
import Slider from "react-slick";
import VariantSelector from "../../Components/Product/VariantSelector";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ProductDetails = () => {
  const { user } = useAuth();
  const axiosPublic = useAxiosPublic();
  const [databaseUser, refetch] = useDatabaseUser();
  const { name: productName } = useParams();
  const location = useLocation()?.pathname;
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  // Product data
  const [productData, setProductData] = useState(null);
  const [variants, setVariants] = useState([]);
  const [currentVariant, setCurrentVariant] = useState(null);
  const [hasVariants, setHasVariants] = useState(false);

  // UI state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [details, setDetails] = useState(null);

  // Multi-variant cart state
  const [variantQuantities, setVariantQuantities] = useState({});
  const [combinedImages, setCombinedImages] = useState([]);
  const [imageVariantMap, setImageVariantMap] = useState({});

  // Reviews
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewImage, setReviewImage] = useState(null);
  const [averageRating, setAverageRating] = useState(0);

  // OLD variant system support (for backward compatibility)
  const [selectedColor, setSelectedColor] = useState("");
  const [orderedQuantities, setOrderedQuantities] = useState({});
  const [selectedItemsForCart, setSelectedItemsForCart] = useState({});

  // Fetch initial product
  useEffect(() => {
    axiosPublic.get(`/products/${productName}`).then((data) => {
      setProductData(data?.data);
    });
  }, [axiosPublic, productName]);

  // Fetch variants if product has productGroupId
  useEffect(() => {
    if (productData && productData.productGroupId) {
      axiosPublic
        .get(`/products/${productData._id}/with-variants`)
        .then((response) => {
          if (response?.data?.success) {
            setVariants(response.data.variants || []);
            setHasVariants(response.data.hasVariants);

            const mainVariant = response.data.variants.find((v) => v.isMainProduct);
            setCurrentVariant(mainVariant || response.data.variants[0]);
          }
        })
        .catch((error) => {
          console.error("Error fetching variants:", error);
          setCurrentVariant(productData);
        });
    } else {
      // No product group - use product data
      setCurrentVariant(productData);
      setHasVariants(false);
    }
  }, [productData, axiosPublic]);

  // Create combined image gallery from all variants
  useEffect(() => {
    if (hasVariants && variants.length > 0) {
      const allImages = [];
      const imageMap = {};

      variants.forEach((variant) => {
        const startIndex = allImages.length;
        variant.images?.forEach((img) => {
          allImages.push(img);
          imageMap[allImages.length - 1] = variant._id;
        });
      });

      setCombinedImages(allImages);
      setImageVariantMap(imageMap);
    } else if (currentVariant) {
      // Single product or no variants
      setCombinedImages(currentVariant.images || []);
    }
  }, [variants, hasVariants, currentVariant]);

  // Set default quantity to 1 for single-variant products
  useEffect(() => {
    if (hasVariants && variants.length === 1 && currentVariant) {
      setVariantQuantities({ [currentVariant._id]: 1 });
    }
  }, [hasVariants, variants.length, currentVariant]);


  // OLD variant system support
  useEffect(() => {
    if (productData && productData.variants) {
      const variantKeys = Object.keys(productData.variants);
      if (variantKeys.length > 0 && !variantKeys.includes(selectedColor)) {
        setSelectedColor(variantKeys[0]);
        setSelectedImageIndex(productData.images.length);
        sliderRef.current?.slickGoTo(productData.images.length);
      }
    }
  }, [productData, selectedColor]);

  // Fetch reviews
  useEffect(() => {
    if (productData) {
      axiosPublic.get(`/reviews/${productData._id}`).then((data) => {
        const reviewsData = data?.data || [];
        setReviews(reviewsData);
        calculateAverageRating(reviewsData);
      });
    }
  }, [productData, axiosPublic]);

  // Sanitize details HTML
  useEffect(() => {
    const sanitizedHTML = DOMPurify.sanitize(currentVariant?.details || productData?.details || "");
    const content = <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
    setDetails(content);
  }, [currentVariant, productData]);

  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) {
      setAverageRating(0);
      return;
    }
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    setAverageRating(totalRating / reviews.length);
  };

  const handleNextImage = () => {
    const images = currentVariant?.images || productData?.images || [];
    setSelectedImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevImage = () => {
    const images = currentVariant?.images || productData?.images || [];
    setSelectedImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: currentVariant?.name || productData?.name,
          text: `Check out this product: ${currentVariant?.name || productData?.name}`,
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

    if (orderQuantity === 0) {
      Swal.fire({
        icon: "error",
        title: "Please select a quantity",
      });
      return;
    }

    const cartItem = {
      email: databaseUser?.email,
      productId: currentVariant?._id || productData?._id,
      quantity: orderQuantity,
      variant: currentVariant?.name || productData?.name,
      code: "CODE" + (selectedImageIndex + 1),
    };

    try {
      const response = await axiosPublic.post(`/cart`, cartItem);

      if (response?.data?.insertedId || response?.data?.status) {
        Swal.fire({
          icon: "success",
          title: "Product added to cart successfully",
        });
        refetch();
        setOrderQuantity(0);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to add to cart",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error adding product to cart",
      });
    }
  };

  // Handle variant quantity changes
  const handleVariantQuantityChange = (variantId, quantity) => {
    setVariantQuantities(prev => ({
      ...prev,
      [variantId]: quantity
    }));
  };

  // Handle thumbnail click - select variant based on image
  const handleThumbnailClick = (imageIndex) => {
    setSelectedImageIndex(imageIndex);

    // Find and select the variant that owns this image
    const variantId = imageVariantMap[imageIndex];
    if (variantId) {
      const variant = variants.find(v => v._id === variantId);
      if (variant) {
        setCurrentVariant(variant);
      }
    }
  };

  // Handle multi-variant cart
  const handleMultiVariantCart = async () => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }

    // Get all variants with quantity > 0
    const selectedVariants = Object.entries(variantQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([variantId, qty]) => ({
        variantId,
        quantity: qty,
        variant: variants.find(v => v._id === variantId)
      }));

    if (selectedVariants.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Please select at least one variant",
      });
      return;
    }

    // Add all to cart
    const cartItems = selectedVariants.map(({ variantId, quantity }) => ({
      email: databaseUser?.email,
      productId: variantId,
      quantity: quantity,
      variant: variants.find(v => v._id === variantId)?.name,
      code: "CODE" + (selectedImageIndex + 1),
    }));

    try {
      const responses = await Promise.all(
        cartItems.map((item) => axiosPublic.post(`/cart`, item))
      );

      const successCount = responses.filter(
        (r) => r?.data?.insertedId || r?.data?.status
      ).length;

      if (successCount > 0) {
        Swal.fire({
          icon: "success",
          title: `Added ${successCount} variant(s) to cart`,
        });
        refetch();
        setVariantQuantities({});
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error adding to cart",
      });
    }
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    setReviewImage(files[0]);
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axiosPublic.post(
        "https://server.allaboutcraftbd.shop/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return `https://server.allaboutcraftbd.shop/uploads/${response.data.file.filename}`;
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

    try {
      const response = await axiosPublic.post(`/reviews/${productData?._id}`, reviewData);
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
      console.error("Error submitting review:", err);
      Swal.fire({
        icon: "error",
        title: "Error submitting review",
      });
    }
  };

  const isVideo = (url) => {
    if (typeof url !== "string") return false;
    return (
      url.endsWith(".mp4") ||
      url.endsWith(".webm") ||
      url.endsWith(".ogg") ||
      url.endsWith(".mov") ||
      url.endsWith(".avi") ||
      url.endsWith(".mkv")
    );
  };

  // OLD variant system handlers
  const handleQuantityChange = (variant, amount) => {
    setOrderedQuantities((prev) => {
      const newQuantity = (prev[variant] || 0) + amount;
      if (newQuantity < 0) return prev;
      return { ...prev, [variant]: newQuantity };
    });

    setSelectedItemsForCart((prev) => {
      const newQuantity = (prev[variant] || 0) + amount;
      if (newQuantity < 0) return prev;
      return { ...prev, [variant]: newQuantity };
    });
  };

  const handleOldCart = async () => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }

    const cartItems = Object.entries(selectedItemsForCart)
      .filter(([_, quantity]) => quantity > 0)
      .map(([variant, quantity]) => ({
        email: databaseUser?.email,
        productId: productData?._id,
        quantity: quantity,
        variant: variant,
        code: "CODE" + (selectedImageIndex + 1),
      }));

    try {
      const responses = await Promise.all(cartItems.map((item) => axiosPublic.post(`/cart`, item)));

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
          title: "Add a product first to cart",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error adding products to cart",
      });
    }
  };

  if (!productData) {
    return (
      <div className="max-w-[95%] 2xl:max-w-7xl mx-auto pt-32 pb-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  // Determine what to display (NEW variant system or OLD or single product)
  const displayData = currentVariant || productData;

  // Image display priority: group images > combined variant images > individual product images
  const displayImages = (() => {
    // If product has group images, use them
    if (productData?.groupImages && productData.groupImages.length > 0) {
      return productData.groupImages;
    }
    // Otherwise use combined images from all variants
    if (hasVariants && combinedImages.length > 0) {
      return combinedImages;
    }
    // Fall back to current display data images
    return displayData?.images || [];
  })();

  const displayPrice = displayData?.price || 0;
  const displayCost = displayData?.cost || 0;
  const displayDiscount = displayData?.discount || 0;
  const displayQuantity = displayData?.quantity || 0;
  const finalPrice = parseInt(displayPrice) - (parseInt(displayPrice) / 100) * displayDiscount;

  // OLD variant system data
  const selectedVariant = productData.variants?.[selectedColor];
  const selectedVariantImage = selectedVariant?.image;
  const availableQuantity = selectedVariant ? selectedVariant.quantity : displayQuantity;
  const isOrderQuantityZero = orderedQuantities[selectedColor] === 0;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  return (
    <div className="max-w-[95%] 2xl:max-w-7xl mx-auto pt-32 md:pt-48 pb-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left - Product Images */}
        <div className="flex-1 w-full mx-auto">
          <div className="relative rounded-lg overflow-hidden bg-white mb-4 lg:w-10/12 mx-auto">
            <div className="hidden lg:block">
              {isVideo(displayImages[selectedImageIndex]) ? (
                <video
                  src={displayImages[selectedImageIndex]}
                  autoPlay
                  loop
                  muted
                  controls
                  className="w-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={displayImages[selectedImageIndex]}
                  alt="Selected Product"
                  className="w-full object-contain"
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
              <Slider {...settings} ref={sliderRef}>
                {[...new Set(displayImages)]?.map((media, idx) =>
                  isVideo(media) ? (
                    <video
                      key={idx}
                      src={media}
                      className="w-full object-contain"
                      autoPlay
                      loop
                      muted
                      controls
                    />
                  ) : (
                    <img
                      key={idx}
                      src={media}
                      alt={`Slide ${idx}`}
                      className="w-full object-contain"
                    />
                  )
                )}
              </Slider>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex justify-center items-center space-x-2 overflow-x-auto lg:space-x-2">
            {displayImages?.map((media, idx) =>
              isVideo(media) ? (
                <video
                  key={idx}
                  src={media}
                  className={`w-12 h-12 object-cover rounded-lg cursor-pointer border-2 ${selectedImageIndex === idx ? "border-blue-600" : "border-gray-300"
                    }`}
                  onClick={() => {
                    handleThumbnailClick(idx);
                    sliderRef.current?.slickGoTo(idx);
                  }}
                  muted
                />
              ) : (
                <img
                  key={idx}
                  src={media}
                  alt={`Thumbnail ${idx}`}
                  className={`w-12 h-12 object-cover rounded-lg cursor-pointer border-2 ${selectedImageIndex === idx ? "border-blue-600" : "border-gray-300"
                    }`}
                  onClick={() => {
                    handleThumbnailClick(idx);
                    sliderRef.current?.slickGoTo(idx);
                  }}
                />
              )
            )}
          </div>
        </div>

        {/* Right - Product Details */}
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{displayData?.name}</h1>

          <div className="flex items-center gap-2">
            <span className="text-2xl md:text-3xl text-red-600 font-bold">
              <span className="text-sm md:text-lg mr-0.5">৳</span>
              {finalPrice}
            </span>
            {displayDiscount > 0 && (
              <>
                <span className="text-sm md:text-lg line-through text-gray-500">
                  ৳ {displayPrice}
                </span>
                <span className="text-sm md:text-lg text-green-600">-{displayDiscount}%</span>
              </>
            )}
          </div>

          {/* Available Quantity */}
          <div className="mt-2">
            <span className="font-medium text-lg">Available Quantity: </span>
            <span className="text-lg">{displayQuantity}</span>
          </div>

          {/* NEW Product Group Variant Selector */}
          {hasVariants && variants.length > 1 && (
            <VariantSelector
              variants={variants}
              selectedVariant={currentVariant}
              onSelectVariant={(variant) => {
                setCurrentVariant(variant);
                setSelectedImageIndex(0);
                setOrderQuantity(1);
              }}
              variantQuantities={variantQuantities}
              onQuantityChange={handleVariantQuantityChange}
            />
          )}

          {/* Quantity Selector for Single-Variant Product Groups */}
          {hasVariants && variants.length === 1 && (
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-lg">Order Quantity: </span>
                <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                  <button
                    onClick={() => {
                      const currentQty = variantQuantities[currentVariant._id] || 0;
                      handleVariantQuantityChange(currentVariant._id, Math.max(0, currentQty - 1));
                    }}
                    disabled={(variantQuantities[currentVariant._id] || 0) <= 0}
                    className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition font-bold text-xl"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    max={currentVariant.quantity}
                    value={variantQuantities[currentVariant._id] || 0}
                    onChange={(e) => {
                      const numValue = parseInt(e.target.value) || 0;
                      const newQty = Math.max(0, Math.min(currentVariant.quantity, numValue));
                      handleVariantQuantityChange(currentVariant._id, newQty);
                    }}
                    className="w-16 h-10 text-center font-semibold text-base text-gray-900 bg-white border-x border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      const currentQty = variantQuantities[currentVariant._id] || 0;
                      handleVariantQuantityChange(currentVariant._id, Math.min(currentVariant.quantity, currentQty + 1));
                    }}
                    disabled={(variantQuantities[currentVariant._id] || 0) >= currentVariant.quantity}
                    className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition font-bold text-xl"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* OLD Variant System (for backward compatibility) */}
          {productData?.variants && !hasVariants && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Product Variant: {selectedColor}</h3>
              <div className="flex space-x-2 mt-2">
                {Object.entries(productData.variants).map(([color, { image }], index) => (
                  <img
                    key={index}
                    src={image}
                    alt={color}
                    className={`w-12 h-12 rounded-lg cursor-pointer border-2 ${selectedColor === color ? "border-orange-500" : "border-gray-200"
                      }`}
                    onClick={() => {
                      setSelectedColor(color);
                      setSelectedImageIndex(productData.images.length + index);
                      sliderRef.current?.slickGoTo(productData.images.length + index);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector - NEW system (only for single products without variants) */}
          {!productData?.variants && !hasVariants && (
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-lg">Order Quantity: </span>
                <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                  <button
                    onClick={() => setOrderQuantity(Math.max(0, orderQuantity - 1))}
                    disabled={orderQuantity <= 0}
                    className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition font-bold text-xl"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="0"
                    max={displayQuantity}
                    value={orderQuantity}
                    onChange={(e) => {
                      const numValue = parseInt(e.target.value) || 0;
                      const newQty = Math.max(0, Math.min(displayQuantity, numValue));
                      setOrderQuantity(newQty);
                    }}
                    className="w-16 h-10 text-center font-semibold text-base text-gray-900 bg-white border-x border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => setOrderQuantity(Math.min(displayQuantity, orderQuantity + 1))}
                    disabled={orderQuantity >= displayQuantity}
                    className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition font-bold text-xl"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quantity Selector - OLD system */}
          {productData?.variants && !hasVariants && (
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-lg">Order Quantity: </span>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handleQuantityChange(selectedColor, -1)}
                    className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition"
                    disabled={orderedQuantities[selectedColor] <= 0}
                  >
                    -
                  </button>
                  <span className="text-lg">{orderedQuantities[selectedColor] || 0}</span>
                  <button
                    onClick={() => handleQuantityChange(selectedColor, 1)}
                    className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition"
                    disabled={orderedQuantities[selectedColor] >= availableQuantity}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {displayQuantity < 1 ? (
            <p className="text-xl font-semibold text-orange-500 mt-4">Stock Out</p>
          ) : hasVariants ? (
            <div className="mt-6 flex flex-col md:flex-row gap-4">
              {(() => {
                const totalQuantity = Object.values(variantQuantities).reduce((a, b) => a + b, 0);

                return (
                  <>
                    <SingleOrder
                      productName={displayData?.name}
                      adiInfo={{ order: totalQuantity, selectedImageIndex }}
                    />
                    <button
                      onClick={handleMultiVariantCart}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg transition flex items-center gap-2 justify-center"
                    >
                      <BsCart3 className="text-lg" />
                      <span>Add to Cart</span>
                      {totalQuantity > 0 && (
                        <span className="bg-white text-green-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                          {totalQuantity}
                        </span>
                      )}
                    </button>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="mt-6 flex flex-col md:flex-row gap-4">
              <SingleOrder
                productName={displayData?.name}
                adiInfo={{ order: orderQuantity, selectedImageIndex }}
              />
              <button
                onClick={productData?.variants && !hasVariants ? handleOldCart : handleCart}
                className={`px-6 py-3 bg-[#7dd67d] text-white rounded-lg transition ${(productData?.variants && !hasVariants ? isOrderQuantityZero : orderQuantity === 0)
                  ? "opacity-50 cursor-not-allowed"
                  : ""
                  }`}
                disabled={productData?.variants && !hasVariants ? isOrderQuantityZero : orderQuantity === 0}
              >
                Add to Cart
              </button>
            </div>
          )}

          {/* Selected Items for Cart - OLD system */}
          {productData?.variants && !hasVariants && (
            <div className="mt-8">
              <h2 className="text-lg font-medium mb-4">Selected Items for Cart</h2>
              {Object.entries(selectedItemsForCart).map(
                ([variant, quantity], index) =>
                  quantity > 0 && (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b pb-2 mb-2"
                    >
                      <span className="text-lg">{variant}</span>
                      <span className="text-lg">Quantity: {quantity}</span>
                    </div>
                  )
              )}
            </div>
          )}

          <div className="mt-6 text-2xl flex items-center space-x-5">
            <Wish id={productData?._id} />
            <IoShareSocialOutline onClick={handleShare} className="cursor-pointer" />
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-medium mb-2">Product Description</h2>
            <p className="text-gray-700">{displayData?.description}</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-medium mb-2">Product Details</h2>
        {details}
      </div>

      {/* Reviews Section - Modern Design */}
      <div className="mt-12 bg-gray-50 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Customer Reviews</h2>

        {/* Average Rating Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
              <div className="flex items-center justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} size={20} color={i < averageRating ? "#ffc107" : "#e4e5e9"} />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
            </div>
            <div className="flex-1 border-l pl-6">
              <p className="text-gray-600">Based on customer feedback</p>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4 mb-8">
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={index} className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {review.userName?.[0] || 'U'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} size={16} color={i < review.rating ? "#ffc107" : "#e4e5e9"} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{review.userName || 'Anonymous'}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    {review.image && (
                      <img
                        src={review.image}
                        alt="Review"
                        className="mt-3 w-40 h-40 object-cover rounded-lg border border-gray-200"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="text-gray-400 mb-2">
                <FaStar size={48} className="mx-auto" />
              </div>
              <p className="text-gray-600">No reviews yet. Be the first to review!</p>
            </div>
          )}
        </div>

        {/* Submit Review Form */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Write a Review</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  size={28}
                  color={i < (hover || rating) ? "#ffc107" : "#e4e5e9"}
                  onClick={() => setRating(i + 1)}
                  onMouseEnter={() => setHover(i + 1)}
                  onMouseLeave={() => setHover(null)}
                  className="cursor-pointer transition hover:scale-110"
                />
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-600">({rating} star{rating > 1 ? 's' : ''})</span>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this product..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="4"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Add Photo (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          <button
            onClick={handleReviewSubmit}
            className="w-full md:w-auto px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-sm"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
