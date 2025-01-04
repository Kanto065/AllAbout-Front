import { useEffect, useState } from "react";
import useAuth from "../../../Hooks/useAuth";
import useAxiosPublic from "../../../Hooks/useAxiosPublic";
import Swal from "sweetalert2";
import useWish from "../../../Hooks/useWish";
import { IoCartOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { GrView } from "react-icons/gr";
import { TiDelete } from "react-icons/ti";
import useDatabaseUser from "../../../Hooks/useDatabaseUser";
import useCart from "../../../Hooks/useCart";

export default function WishItem({ product, reload }) {
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();
  const [databaseUser] = useDatabaseUser();
  const [, refetch] = useCart();
  const [isOpenImg, setIsOpenImg] = useState("");
  const [isHover, setIsHover] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    setIsOpenImg(product?.images[0]);
  }, [product]);

  useEffect(() => {
    if (isHover) {
      product?.images?.length > 1 && setIsOpenImg(product?.images[1]);
    } else {
      setIsOpenImg(product?.images[0]);
    }
  }, [isHover, product]);

  const handleWish = async () => {
    if (!user) {
      // Redirect the user to login using navigate
      navigate("/login", { state: { from: location } });
      return;
    }
    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete "${product?.name}" from your Wishlist!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPublic
          .delete(
            `/wishlist?email=${databaseUser?.email}&productId=${product?._id}`
          )
          .then((res) => {
            if (res.data.deletedCount > 0) {
              Swal.fire({
                title: "Deleted!",
                text: `${product?.name} has been deleted from your Wishlist.`,
                icon: "success",
              });
              reload();
            }
          });
      }
    });
  };

  const handleCart = async () => {
    if (!user) {
      // Redirect the user to login using navigate
      navigate("/login", { state: { from: location } });
      return;
    }

    const cart = {
      email: databaseUser?.email,
      productId: product?._id,
      quantity: 1,
    };

    try {
      const response = await axiosPublic.post(`/cart`, cart);
      if (response?.data?.insertedId) {
        axiosPublic
          .delete(
            `/wishlist?email=${databaseUser?.email}&productId=${product?._id}`
          )
          .then((res) => {
            if (res.data.deletedCount > 0) {
              Swal.fire({
                icon: "success",
                title: "Product added to cart successfully",
              });
              reload();
            }
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

  return (
    <div className="space-y-2 overflow-hidden relative border rounded-xl shadow-2xl">
      <div
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className="relative bg-white h-80 w-full flex justify-center items-center cont overflow-hidden"
      >
        <img
          className={`mx-auto h-full ${
            isHover ? "scale-125" : "scale-100"
          } transition-transform duration-1000`}
          src={isOpenImg}
          alt={product?.name}
        />
        <p
          onClick={handleWish}
          className={`absolute top-2 right-2 text-[#C4ACC2] text-xl  rounded-full flex items-center border-2 border-red-500`}
        >
          <TiDelete className="text-4xl" />
        </p>
        <p
          className={`absolute top-2 -left-14 text-white p-0.5 bg-[#C4ACC2] w-44 flex justify-center items-center -rotate-45`}
        >
          -{product?.discount}%
        </p>
      </div>
      <div className="p-3">
        <h2 className="text-xl text-[#303049] font-semibold raleway">
          {product?.name}
        </h2>
        <p className="text-[#C4ACC2] font-semibold">
          <del className="text-sm text-[#303049] mr-1">
            {parseFloat(product?.price)?.toFixed(2)}
          </del>
          {parseFloat(
            product?.price - (product?.price / 100) * product?.discount
          )?.toFixed(2)}
          ৳
        </p>
        {product?.quantity < 1 ? (
          <p className="text-xl font-semibold text-orange-500 mt-4">
            Stock Out
          </p>
        ) : (
          <button
            onClick={handleCart}
            className="w-full bg-[#C4ACC2] text-white py-2 rounded mt-2"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
