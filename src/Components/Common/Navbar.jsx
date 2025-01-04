import { useEffect, useState } from "react";
import { CgMenuGridO, CgProfile } from "react-icons/cg";
import { FaCartArrowDown, FaHome, FaList } from "react-icons/fa";
import {
  IoIosArrowForward,
  IoIosClose,
  IoMdAdd,
  IoMdRemove,
} from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import {
  MdFavoriteBorder,
  MdFormatListNumberedRtl,
  MdMenu,
  MdOutlineFavoriteBorder,
  MdOutlineShoppingBag,
} from "react-icons/md";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import useAuth from "../../Hooks/useAuth";
import useDatabaseUser from "../../Hooks/useDatabaseUser";
import { Link, useLocation } from "react-router-dom";
import useMainCategories from "../../Hooks/useMainCategories";
import useCategories from "../../Hooks/useCategories";
import useSubCategories from "../../Hooks/useSubCategories";
import useCart from "../../Hooks/useCart";
import usePurchased from "../../Hooks/usePurchased";
import useAxiosPublic from "../../Hooks/useAxiosPublic";
import useWish from "../../Hooks/useWish";
import useSold from "../../Hooks/useSold";

const Navbar = () => {
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();
  const [databaseUser] = useDatabaseUser();
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchProducts, setSearchProducts] = useState("");
  const [mainCategories] = useMainCategories();
  const [categories] = useCategories();
  const [subCategories] = useSubCategories();
  const [mainCategoryName, setMainCategoryName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [SearchCategory, setSearchCategory] = useState([]);
  const [SearchSubCategory, setSearchSubCategory] = useState([]);
  const [openMainCategory, setOpenMainCategory] = useState(null);
  const [openCategory, setOpenCategory] = useState(null);
  const [cart] = useCart();
  const [wish] = useWish();
  const [purchased] = usePurchased();
  const [sold] = useSold();
  const pathname = useLocation().pathname;

  useEffect(() => {
    axiosPublic(`/search/${searchText}`).then((res) =>
      setSearchProducts(res?.data)
    );
  }, [searchText, axiosPublic]);
  useEffect(() => {
    setSearchCategory(
      categories?.filter((item) => item?.mainCategory == mainCategoryName)
    );
  }, [categories, mainCategoryName]);

  useEffect(() => {
    setSearchSubCategory(
      subCategories?.filter((item) => item?.category == categoryName)
    );
  }, [subCategories, categoryName]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setPrevScrollPos(currentScrollPos);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  return (
    <nav>
      <div
        className={`min-h-screen w-full fixed top-0 bg-[#0000006a] px-10 z-[210] ${
          search ? "block" : "hidden"
        } duration-500`}
        onClick={() => setSearch(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="max-w-4xl w-full bg-white mt-20 mx-auto px-5 pt-12 pb-5 rounded-lg relative"
        >
          <button
            onClick={() => setSearch(false)}
            className="absolute top-1 right-3 text-2xl shadow-xl shadow-[#0000005b] rounded-full h-10 w-10 z-50"
          >
            x
          </button>
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full z-40 text-lg p-1 border rounded"
            type="text"
            name=""
            id=""
            placeholder="Search On All About Craft BD"
          />
          <div>
            {searchProducts &&
              searchProducts?.map((product) => (
                <Link
                  key={product?._id}
                  className="p-2 border-b hover:text-[#ffffff] hover:bg-[#B1B4DD] flex duration-200 line-clamp-1"
                  onClick={() => {
                    setSearchText("");
                    setSearch(false);
                  }}
                  to={`products/${product?.name}`}
                >
                  {product?.name}
                </Link>
              ))}
          </div>
        </div>
      </div>
      <div className={`fixed top-0 w-full z-[200]`}>
        {/* top nav */}
        <ul
          className={`w-full bg-white text-center font-bold text-[13.5px] md:text-xl lg:text-2xl ${
            prevScrollPos > 100
              ? "max-h-0"
              : "max-h-[500px] border-b-4 border-[#B1ECD7]"
          } duration-500`}
        >
          <Swiper
            slidesPerView={3} // Default number of slides to show
            spaceBetween={0} // Space between slides
            className="mySwiper"
          >
            {mainCategories?.map((category, idx) => (
              <SwiperSlide
                key={category?._id}
                className={`flex-shrink-0 w-1/2 md:w-1/3 lg:w-1/4 py-2 ${
                  idx % 3 === 0
                    ? "bg-[#C4ACC2]"
                    : idx % 3 === 1
                    ? "bg-[#c5eac5]"
                    : "bg-[#B1B4DD]"
                }`}
              >
                <Link
                  onClick={() => setMenu(false)}
                  to={`/products?maincategory=${category?._id}`}
                  className="line-clamp-1 playfair"
                >
                  <div className="flex items-center justify-center">
                    <p>{category?.name}</p>
                    <IoIosArrowForward className="md:ml-1 text-[13.5px] text-lg md:text-2xl lg:text-3xl" />
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        </ul>

        <div className="relative z-[100]">
          <div className="w-full py-1 bg-white">
            <ul className="flex justify-between text-lg w-[95%] mx-auto max-w-[1400px]">
              <li className="flex items-center space-x-2 md:space-x-5 lg:space-x-10 text-2xl md:text-3xl">
                <MdMenu onClick={() => setMenu(!menu)} />
                <IoSearch className="block" onClick={() => setSearch(true)} />
              </li>
              <li className="text-4xl font-semibold noto-serif">
                <Link to={"/"}>
                  <img
                    className="h-[45px] md:h-16"
                    src="/images/logo&icons/logo.png"
                    alt=""
                  />
                </Link>
              </li>
              <li className="hidden lg:flex items-center space-x-2 md:space-x-5 text-2xl md:text-3xl">
                {user ? (
                  <div>
                    {databaseUser?.role == "user" && (
                      <Link to={"/dashboard/wishlist"} className="relative">
                        <MdOutlineFavoriteBorder className="" />
                        <sup className="absolute text-xs font-bold right-0 -top-1 text-[#e846db]">
                          {wish?.length || 0}
                        </sup>
                      </Link>
                    )}
                  </div>
                ) : (
                  <Link to={"/signup"}>
                    <CgProfile />
                  </Link>
                )}
                {databaseUser?.role === "admin" ? (
                  <Link to={"/dashboard/Admin/orders"}>
                    <div className="relative pb-0.5">
                      <FaList className="" />
                      <sup className="absolute text-xs font-bold -right-1.5 -top-2 text-[#e846db]">
                        {purchased?.length || 0}
                      </sup>
                    </div>
                  </Link>
                ) : (
                  <Link to={"/dashboard/cart"} className="relative">
                    <MdOutlineShoppingBag />
                    <sup className="absolute text-xs font-bold right-0 -top-1 text-[#e846db]">
                      {cart?.length || 0}
                    </sup>
                  </Link>
                )}
              </li>
              <li className="flex lg:hidden items-center justify-between text-2xl md:text-3xl space-x-2">
                {databaseUser?.role === "admin" ?
                (
                  <Link to={"/dashboard/Admin/orders"}>
                    <div className="relative pb-0.5">
                      <FaList className="" />
                      <sup className="absolute text-xs font-bold -right-1.5 -top-2 text-[#e846db]">
                        {purchased?.length || 0}
                      </sup>
                    </div>
                  </Link>
                )
                :
                (
                  <>
                    <Link to={"/dashboard/wishlist"}>
                      <div className="relative">
                        <MdFavoriteBorder className="text-2xl mx-auto" />
                        <sup className="absolute text-xs font-bold left-2/3 -top-1.5 text-[#e846db]">
                          {wish?.length || 0}
                        </sup>
                      </div>
                    </Link>
                    <Link to={"/dashboard/cart"} className="relative">
                      <MdOutlineShoppingBag />
                      <sup className="absolute text-xs font-bold right-0 -top-1 text-[#e846db]">
                        {cart?.length || 0}
                      </sup>
                    </Link>
                  </>
                )}
              </li>
            </ul>
          </div>
          <img
            className="w-full -mt-[0.8px] md:-mt-0.5"
            src="/images/nav/nav_bottom_img.png"
            alt=""
          />
        </div>
      </div>
      <div
        onClick={() => setMenu(!menu)}
        className={`fixed top-0 ${
          menu ? "left-0" : "-left-[3000px]"
        } transition-all duration-1000 bg-[#0000005d] w-full h-full text-white z-[300]`}
      >
        <div
          onClick={(e_) => e_.stopPropagation()}
          className="max-w-80 w-full h-full bg-[#fff] text-black"
        >
          <div className="flex justify-end">
            <IoIosClose
              className="text-5xl text-right"
              onClick={() => setMenu(!menu)}
            />
          </div>
          <ul className="mt-5">
            {mainCategories?.map((mCategory) => (
              <li
                key={mCategory?._id}
                className="w-full border-b-2 border-gray-200"
              >
                <div className="w-full text-lg  p-2 flex items-center justify-between px-5 py-2">
                  <Link
                    onClick={() => setMenu(!menu)}
                    to={`/products?maincategory=${mCategory?._id}`}
                  >
                    {mCategory?.name}
                  </Link>
                  <div
                    className={`${
                      categories?.find(
                        (item) => item?.mainCategory == mCategory?.name
                      ) || "hidden"
                    }`}
                  >
                    {openMainCategory == mCategory?._id ? (
                      <IoMdRemove
                        onClick={() => {
                          setMainCategoryName("");
                          setOpenMainCategory(null);
                        }}
                      />
                    ) : (
                      <IoMdAdd
                        onClick={() => {
                          setMainCategoryName(mCategory?.name);
                          setOpenMainCategory(mCategory?._id);
                        }}
                      />
                    )}
                  </div>
                </div>
                {openMainCategory == mCategory?._id && (
                  <ul className="bg-gray-100">
                    {SearchCategory?.map((cCategory) => (
                      <li key={cCategory?._id} className="">
                        <div className="pl-8 pr-5 w-full text-lg  py-1 flex items-center justify-between border-b">
                          <Link
                            onClick={() => setMenu(!menu)}
                            to={`/products?category=${cCategory?._id}`}
                          >
                            {cCategory?.name}
                          </Link>
                          <div
                            className={`${
                              subCategories?.find(
                                (item) => item?.category == cCategory?.name
                              ) || "hidden"
                            }`}
                          >
                            {openCategory == cCategory?._id ? (
                              <IoMdRemove
                                onClick={() => {
                                  setCategoryName("");
                                  setOpenCategory(null);
                                }}
                              />
                            ) : (
                              <IoMdAdd
                                onClick={() => {
                                  setCategoryName(cCategory?.name);
                                  setOpenCategory(cCategory?._id);
                                }}
                              />
                            )}
                          </div>
                        </div>
                        {openCategory == cCategory?._id && (
                          <ul className="">
                            {SearchSubCategory?.map((subCategory) => (
                              <li
                                key={subCategory?._id}
                                className="pl-12 border-b py-1"
                              >
                                <Link
                                  onClick={() => setMenu(!menu)}
                                  to={`/products?subcategory=${subCategory?._id}`}
                                >
                                  {subCategory?.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="lg:hidden">
        <div className={`fixed bottom-0 w-full bg-[#C4ACC2] z-[200]`}>
          <ul className="max-w-[1400px] mx-auto flex justify-around items-center py-0.5 text-xs font-semibold leading-[0.7] text-black">
            <li>
              <Link
                to={"/"}
                className={`${pathname === "/" && "text-slate-200"}`}
              >
                <FaHome className="text-2xl mx-auto" /> Home
              </Link>
            </li>
            <li>
              {databaseUser?.role === "admin" ? (
                <Link
                  to={"/dashboard/Admin/sold"}
                  className={`${
                    pathname === "/dashboard/Admin/sold" && "text-slate-200"
                  }`}
                >
                  <div className="relative pb-0.5">
                    <MdFormatListNumberedRtl className="text-xl mx-auto" />
                    <sup className="absolute text-xs font-bold left-2/3 -top-2 text-[#e846db]">
                      {sold?.length || 0}
                    </sup>
                  </div>
                  Sold
                </Link>
              ) : (
                <Link
                  to={"/dashboard/purchase"}
                  className={`${
                    pathname === "/dashboard/purchase" && "text-slate-200"
                  }`}
                >
                  <div className="relative">
                    <FaCartArrowDown className="text-2xl mx-auto" />
                    <sup className="absolute text-xs font-bold left-2/3 -top-1 text-[#e846db]">
                      {purchased?.length || 0}
                    </sup>
                  </div>
                  Purchased
                </Link>
              )}
            </li>
            <li>
              {databaseUser?.role === "admin" ? (
                <Link
                  to={"/dashboard/Admin/orders"}
                  className={`${
                    pathname === "/dashboard/Admin/orders" && "text-slate-200"
                  }`}
                >
                  <div className="relative pb-0.5">
                    <FaList className="text-xl mx-auto" />
                    <sup className="absolute text-xs font-bold left-2/3 -top-2 text-[#e846db]">
                      {purchased?.length || 0}
                    </sup>
                  </div>
                  Ordered
                </Link>
              ) : (
                <Link
                  to={"/dashboard/cart"}
                  className={`${
                    pathname === "/dashboard/cart" && "text-slate-200"
                  }`}
                >
                  <div className="relative">
                    <MdOutlineShoppingBag className="text-2xl mx-auto" />
                    <sup className="absolute text-xs font-bold left-2/3 -top-1 text-[#e846db]">
                      {cart?.length || 0}
                    </sup>
                  </div>
                  My Cart
                </Link>
              )}
            </li>
            <li className={`${pathname === "/dashboard" && "text-slate-200"}`}>
              {user ? (
                <Link to={"/dashboard"} className=" text-sm">
                  {databaseUser?.image ? (
                    <img
                      className="h-6 rounded-full mx-auto relative top-0.5"
                      src={databaseUser?.image}
                      alt={`${databaseUser?.name?.slice(0, 5)}...`}
                    />
                  ) : (
                    <CgProfile className="text-2xl mx-auto" />
                  )}
                </Link>
              ) : (
                <Link
                  to={"/signup"}
                  className={`${pathname === "/login" && "text-slate-200"}`}
                >
                  <CgProfile className="text-2xl mx-auto" />
                </Link>
              )}
              Profile
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
