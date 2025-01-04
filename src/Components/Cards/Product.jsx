import { useState } from "react";
import Wish from "../Icons/Wish";
import Cart from "../Icons/Cart";
import { Link } from "react-router-dom";

export default function Product({ product }) {
  const [image, setImage] = useState(0);
  return (
    <div className="bg-white relative overflow-hidden shadow-lg p-0.5 border">
      <div className="w-fill overflow-hidden">
        <Link
          to={`/products/${product?.name}`}>
          <img
            src={product?.images[image]}
            alt={product?.name}
            className="w-full h-[180px] md:h-[220px] lg:h-[280px] scale-100 hover:scale-105 duration-150"
          />
        </Link>
        <div className="flex justify-center items-center space-x-2 overflow-auto mt-1.5">
          {product?.images?.map((image, idx) => (
            <img
              key={idx}
              onMouseEnter={() => setImage(idx)}
              src={image}
              alt={product?.name}
              className="w-7 h-7 rounded"
            />
          ))}
        </div>
      </div>
      <div className="p-1 md:p-2.5 text-center mt-1">
        <h3
          className="text-sm md:text-lg font-medium line-clamp-1 -mt-1"
        >
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
              {" "}৳
              {parseInt(product?.price) -
                (parseInt(product?.price) / 100) * product?.discount}{" "}
            </span>
          </p>
          <p
            className={`text-[#87C1D2] text-xs md:text-base ${
              product?.discount <= 0 && "hidden"
            }`}
          >
            {product?.discount}%OFF
          </p>
        </div>
        {product?.quantity < 1 ? (
            <p className="text-xl font-semibold text-orange-500 mt-4">Stock Out</p>
          ) :(
        <div className="flex justify-between mt-2 px-1 pb-1">
          <Wish id={product?._id} />
          <Cart id={product?._id} />
        </div>
        )}
      </div>
    </div>
  );
}
