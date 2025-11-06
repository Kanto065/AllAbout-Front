import { useState } from "react";
import useAxiosPublic from "../../../Hooks/useAxiosPublic";
import Swal from "sweetalert2";
import { FaTrash } from "react-icons/fa";
import axios from "axios";

const UpdateMainCategory = ({ category, refetch }) => {
  const [edit, setEdit] = useState(false);
  const [loader, setLoader] = useState(false);
  const [name, setName] = useState(category?.name || "");
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
        "https://server.allaboutcraftbd.shop/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return `https://server.allaboutcraftbd.shop/uploads/${response.data.file.filename}`; // Adjust according to your server response
    } catch (error) {
      throw new Error("File upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);

    try {
      let iconURL = category?.icon;

      // Upload new icon if selected
      if (icon) {
        iconURL = await uploadImage(icon);
      }

      // Prepare the updated category data
      const updatedCategory = {
        name,
        image: iconURL,
      };

      // Update the category
      const response = await axiosPublic.patch(
        `/maincategories/${category?._id}`,
        updatedCategory
      );

      if (response?.data?.modifiedCount > 0) {
        Swal.fire({
          icon: "success",
          title: "Category Updated Successfully",
        });
        refetch();
        setEdit(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to update category",
        });
      }
    } catch (error) {
      console.error("Error updating category:", error);
      Swal.fire({
        icon: "error",
        title: "Failed to update category",
      });
    } finally {
      setLoader(false);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axiosPublic.delete(`/maincategories/${id}`).then((res) => {
          if (res.data?.deletedCount) {
            Swal.fire({
              title: "Deleted!",
              text: "Your category has been deleted.",
              icon: "success",
            });
            refetch();
          }
        });
      }
    });
  };

  return (
    <div className="mt-5">
      <div className={`flex space-x-3 mt-5 ${edit && "hidden"}`}>
        <button
          onClick={() => setEdit(true)}
          className="text-white text-lg bg-[#C480CF] hover:bg-[#cb63db] py-1 px-4 rounded-[30px] font-bold duration-500 raleway"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(category?._id)}
          className="border border-red-600 hover:bg-[#3332323c] px-2 py-1 rounded-md font-semibold text-red-500 flex items-center text-lg"
        >
          <FaTrash />
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className={`${
          edit || "hidden"
        } space-y-2 overflow-hidden py-4 relative`}
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
        <div className="">
          <label className="text-lg font-bold">Icon:</label>
          <br />
          <input
            type="file"
            name="icon"
            onChange={handleIconChange}
            className="border mt-1 p-2 rounded-lg w-full"
          />
        </div>
        <button
          type="submit"
          className={`text-white text-lg bg-[#C480CF] hover:bg-[#cb63db] py-1 px-4 rounded-[30px] font-bold duration-500 raleway`}
        >
          <span>{loader ? "Updating..." : "Update"}</span>
          {loader && (
            <p className="border-t rounded-xl border-black border-solid w-4 h-4 animate-spin ml-2"></p>
          )}
        </button>
        <p
          onClick={() => setEdit(false)}
          className="absolute top-0 right-0 h-8 w-8 flex items-center justify-center bg-slate-200 hover:bg-slate-300 rounded-full"
        >
          X
        </p>
      </form>
    </div>
  );
};

export default UpdateMainCategory;
