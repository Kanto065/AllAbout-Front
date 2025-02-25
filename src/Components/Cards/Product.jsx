import { useState } from "react";
import Wish from "../Icons/Wish";
import Cart from "../Icons/Cart";
import { Link } from "react-router-dom";

export default function Product({ product }) {
  const [selectedImage, setSelectedImage] = useState(0); // Tracks the currently displayed image
  const [selectedColor, setSelectedColor] = useState(0); // Tracks the selected color

  return (
    <div className="bg-white relative overflow-hidden shadow-lg p-0.5 border">
      {/* Product Image Section */}
      <div className="w-fill overflow-hidden">
        <Link to={`/products/${product?.name}`}>
          <img
            src={product?.images[selectedImage]}
            alt={product?.name}
            className="w-full h-[180px] md:h-[220px] lg:h-[280px] scale-100 hover:scale-105 duration-150"
          />
        </Link>
        <div className="flex justify-center items-center space-x-2 overflow-auto mt-1.5">
          {product?.images?.map((img, idx) => (
            <img
              key={idx}
              onMouseEnter={() => setSelectedImage(idx)} // Change image on hover
              src={img}
              alt={`${product?.name} variation ${idx}`}
              className={`w-7 h-7 rounded cursor-pointer ${
                selectedImage === idx ? "border border-blue-500" : "border border-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-1 md:p-2.5 text-center mt-1">
        <h3 className="text-sm md:text-lg font-medium line-clamp-1 -mt-1">
          {product?.name}
        </h3>
        <div className="flex items-center justify-center space-x-2">
          <p>
            <del
              className={`text-xs md:text-base ${
                product?.discount <= 0 && "hidden"
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
            className={`text-[#87C1D2] text-xs md:text-base ${
              product?.discount <= 0 && "hidden"
            }`}
          >
            {product?.discount}% OFF
          </p>
        </div>

        {/* Color Variation Section */}
        <div className="flex justify-center items-center space-x-2 mt-2">
          {product?.colors?.map((color, idx) => (
            <div
              key={idx}
              onClick={() => {
                setSelectedColor(idx); // Change selected color
                setSelectedImage(idx); // Update image to match color
              }}
              className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                selectedColor === idx ? "border-blue-500" : "border-gray-300"
              }`}
              style={{ backgroundColor: color }}
              title={color}
            ></div>
          ))}
        </div>

        {/* Stock and Actions */}
        {product?.quantity < 1 ? (
          <p className="text-xl font-semibold text-orange-500 mt-4">Stock Out</p>
        ) : (
          <div className="flex justify-between mt-2 px-1 pb-1">
            <Wish id={product?._id} />
            <Cart id={product?._id} />
          </div>
        )}
      </div>
    </div>
  );
}
