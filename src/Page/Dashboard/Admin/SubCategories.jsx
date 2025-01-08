import { Helmet } from "react-helmet-async";
import useCategories from "../../../Hooks/useCategories";
import { useState } from "react";
import useAxiosPublic from "../../../Hooks/useAxiosPublic";
import Swal from "sweetalert2";
import axios from "axios";
import UpdateSubCategory from "./UpdateSubCategory";
import useSubCategories from "../../../Hooks/useSubCategories";

const SubCategories = () => {
  const [categories] = useCategories();
  const [subCategories, refetch] = useSubCategories();
  const [add, setAdd] = useState(false);
  const [loader, setLoader] = useState(false);
  const [name, setName] = useState("");
  const [gCategory, setGCategory] = useState("");
  const [icon, setIcon] = useState(null);
  const axiosPublic = useAxiosPublic();

  const handleIconChange = (event) => {
    setIcon(event.target.files[0]);
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "https://server.allaboutcraftbd.com/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.url; // Adjust according to your server response
    } catch (error) {
      throw new Error("File upload failed");
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setLoader(true);

    try {
      let iconURL = "";

      // Upload icon image
      if (icon) {
        iconURL = await uploadImage(icon);
      }

      // Create new category with uploaded icon URL
      const newCategory = {
        name,
        category:gCategory,
        image: iconURL, // Assuming the icon image is used as the logo
      };

      const response = await axiosPublic.post("/subcategories", newCategory);

      if (response?.data?.insertedId) {
        Swal.fire({
          icon: "success",
          title: "Category added successfully",
        });
        setName("");
        setGCategory("");
        setIcon(null);
        setAdd(false);
        refetch();
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to add category",
        });
      }
    } catch (error) {
      console.error("Error adding category:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to add category",
      });
    } finally {
      setLoader(false);
    }
  };
  return (
    <div>
      <Helmet>
        <title>All About Craft BD | Sub Categories</title>
      </Helmet>
      <div className="flex justify-between">
        <h3 className="text-3xl font-medium">All Sub Categories</h3>
        <img
                            className="h-12 md:h-16 w-12 md:w-16 rounded-full mx-auto" // Adjusted image size
                            src={mCategory?.image}
                            alt=""
                        />
        <button
          onClick={() => setAdd(true)}
          className={`text-white text-lg bg-[#C480CF] hover:bg-[#cb63db] py-1 px-4 rounded-[30px] font-bold duration-500 raleway ${
            add && "hidden"
          }`}
        >
          Add One
        </button>
      </div>
      <div className="mt-5">
        <div className={`${add || "hidden"}`}>
          <form
            className="space-y-2 overflow-hidden py-4 relative"
            onSubmit={handleFormSubmit}
          >
            <div className="">
              <label className="text-lg font-bold">Name:</label>
              <br />
              <input
                type="text"
                placeholder="Enter Category Name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border mt-1 p-2 rounded-lg w-full"
                required
              />
            </div>
            <div className="pb-4">
              <label className="text-lg font-bold">Image:</label>
              <br />
              <input
                type="file"
                placeholder="Category Image"
                name="icon"
                onChange={handleIconChange}
                className="border mt-1 p-2 rounded-lg w-full"
                required
              />
            </div>
            <div className="pb-4">
              <label className="text-lg font-bold">Select Category:</label>
              <br />
              <select
                placeholder="Select Category"
                name="description"
                value={gCategory}
                onChange={(e) => setGCategory(e.target.value)}
                rows={3}
                className="border mt-1 p-2 rounded-lg w-full lg:w-1/2"
                required
              >
                <option value="">Select Category</option>{" "}
                {/* Add this default option */}
                {categories?.map((gCategory) => (
                  <option key={gCategory?._id} value={gCategory?.name}>
                    {gCategory?.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className={`text-white text-lg bg-[#C480CF] hover:bg-[#cb63db] py-1 px-4 rounded-[30px] font-bold duration-500 raleway`}
            >
              <span>{loader ? "Adding..." : "Add"}</span>
              {loader && (
                <p className="border-t rounded-xl border-black border-solid w-4 h-4 animate-spin ml-2"></p>
              )}
            </button>
            <button
              onClick={() => setAdd(false)}
              className="absolute top-0 right-0 h-8 w-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 rounded-full"
            >
              X
            </button>
          </form>
        </div>
      </div>
      <ul className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
  {subCategories?.map((subcategory, idx) => (
    <li key={idx} className="space-x-2 p-2 shadow-lg rounded">
      <div className="flex flex-col items-center">
        {/* Icon */}
        <img
          className="h-20 w-20 mb-4 rounded-full"
          src={subcategory?.image || "https://example.com/default-image.png"}
          alt={subcategory?.name || "Unnamed"}
        />
        {/* Name */}
        <h3 className="text-xl font-semibold">
          Name: {subcategory?.name || "Unnamed"}
        </h3>
        {/* Ensure category is a string */}
        <h3 className="text-gray-600 text-xl mt-2">
          Category: {typeof subcategory?.category === "string"
            ? subcategory?.category
            : "Unknown Category"}
        </h3>
      </div>
      <UpdateSubCategory
        category={subcategory}
        refetch={refetch}
      />
    </li>
  ))}
</ul>

      {subCategories?.length === 0 && (
        <div className="flex items-center justify-center">
          <img
            className="h-64 w-64 rounded-full"
            src="https://i.ibb.co/W27KqWw/Bk-Qx-D7wtn-Z.gif"
            alt=""
          />
        </div>
      )}
    </div>
  );
};

export default SubCategories;
