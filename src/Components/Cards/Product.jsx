import { useState } from "react";
import Wish from "../Icons/Wish";
import Cart from "../Icons/Cart";
import { IoMdAdd } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";

export default function Product({ product }) {
  const [selectedImage, setSelectedImage] = useState(0); // Tracks the currently displayed image
  const [selectedColor, setSelectedColor] = useState(0); // Tracks the selected color
  const navigate = useNavigate();

  const handleCartClick = () => {
    // Check if product has multiple variants (productGroupId indicates variant system)
    if (product?.productGroupId) {
      // Navigate to the product details page if it's a multi-variant product
      navigate(`/products/${product?.name}`);
    } else if (product?.variants && Object.keys(product.variants).length > 0) {
      // OLD variant system - Navigate to the product details page
      navigate(`/products/${product?.name}`);
    } else {
      // Add to cart logic here for single products
      console.log("Product added to cart:", product);
    }
  };

  // Determine which images to display: combine group images and variant images
  const displayImages = [...new Set([
    ...(product?.groupImages || []),
    ...(product?.images || [])
  ])];

  return (
    <div className="bg-white relative overflow-hidden shadow-lg p-0.5 border h-full flex flex-col">
      {/* Product Image Section */}
      <div className="w-fill overflow-hidden">
        <Link to={`/products/${product?.name}`}>
          <img
            src={displayImages[selectedImage]}
            alt={product?.name}
            className="w-full h-[180px] md:h-[220px] lg:h-[280px] object-cover scale-100 hover:scale-105 duration-150"
          />
        </Link>
        <div className="flex justify-center items-center space-x-2 overflow-auto mt-1.5">
          {displayImages?.map((img, idx) => (
            <img
              key={idx}
              onMouseEnter={() => setSelectedImage(idx)} // Change image on hover
              src={img}
              alt={`${product?.name} variation ${idx}`}
              className={`w-7 h-7 rounded cursor-pointer ${selectedImage === idx ? "border border-blue-500" : "border border-gray-300"
                }`}
            />
          ))}
        </div>
      </div>

      {/* Product Details Section - Flex-grow to fill space */}
      <div className="p-1 md:p-2.5 text-center mt-1 flex flex-col flex-grow">
        {/* Product Name */}
        <h3 className="text-sm md:text-lg font-medium line-clamp-2 group-hover:text-blue-600 transition">
          {product?.productGroupId ? (product?.productGroupName || product?.name) : product?.name}
        </h3>

        {/* Variant Indicator Badge - Hidden for now as per design preference or keep subtle */}
        <div className="flex justify-center mt-1">
          {product?.productGroupId && (
            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Product Group
            </span>
          )}
        </div>

        <div className="flex items-center justify-center space-x-2 mt-1">
          {!product?.productGroupId ? (
            <>
              <p>
                <del
                  className={`text-xs md:text-base ${product?.discount <= 0 && "hidden"
                    }`}
                >
                  ৳{product?.price}
                </del>
                <span className="text-green-500 text-sm md:text-lg font-semibold">
                  ৳
                  {parseInt(product?.price) -
                    (parseInt(product?.price) / 100) * product?.discount}
                </span>
              </p>
              <p
                className={`text-[#87C1D2] text-xs md:text-base ${product?.discount <= 0 && "hidden"
                  }`}
              >
                {product?.discount}% OFF
              </p>
            </>
          ) : (
            <p className="text-gray-500 text-xs md:text-sm font-medium italic">
              View Price Options
            </p>
          )}
        </div>

        {/* Color Variation Section / Mini Images */}
        <div className="flex justify-center items-center space-x-2 mt-1">
          {/* Only show old color circles if it's the old system or if explicitly available */}
          {product?.colors?.map((color, idx) => (
            <div
              key={idx}
              onClick={() => {
                setSelectedColor(idx); // Change selected color
                setSelectedImage(idx); // Update image to match color
              }}
              className={`w-6 h-6 rounded-full cursor-pointer border-2 ${selectedColor === idx ? "border-blue-500" : "border-gray-300"
                }`}
              style={{ backgroundColor: color }}
              title={color}
            ></div>
          ))}
        </div>

        {/* Stock and Actions - Push to bottom */}
        <div className="mt-auto pt-2">
          {product?.quantity < 1 && !product?.productGroupId ? (
            <p className="text-xl font-semibold text-orange-500 py-1">Stock Out</p>
          ) : (
            <div className="flex justify-between px-1 pb-1">
              <Wish id={product?._id} />
              {(product?.productGroupId || (product?.variants && Object.keys(product.variants).length > 0)) ? (
                <button onClick={handleCartClick} className="flex items-center gap-1 bg-[#1E93D1] text-white px-3 py-1 rounded-full hover:bg-blue-600 transition">
                  <span className="text-xs md:text-sm font-medium">Details</span>
                  <IoMdAdd className="text-lg" />
                </button>
              ) : (
                <button onClick={handleCartClick}>
                  <Cart id={product?._id} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
