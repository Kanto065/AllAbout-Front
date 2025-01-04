import { useState } from "react";
import useBanners from "../../../Hooks/useAllBanners";
import useAxiosPublic from "../../../Hooks/useAxiosPublic";
import Swal from "sweetalert2";
import axios from "axios";
import Offers from "./Offers";

export default function Banners() {
  const axiosPublic = useAxiosPublic();
  const [banners, refetch] = useBanners();
  const [add, setAdd] = useState(null);
  const [edit, setEdit] = useState(null);

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

  // Handle adding a banner
  const handleBanner = () => {
    if (!add) {
      Swal.fire({
        title: "Error!",
        text: "Please select a file before uploading.",
        icon: "error",
      });
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: `You want to add a new banner!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes!",
    }).then(async (result) => {
      const uploadImg = await uploadImage(add);
      if (result.isConfirmed) {
        axiosPublic
          .post(`/banners`, {
            image: uploadImg,
          })
          .then((res) => {
            if (res.data?.insertedId) {
              Swal.fire({
                title: "Added Successfully!",
                icon: "success",
              });
              refetch();
              setAdd(null); // Clear input after successful addition
            }
          });
      }
    });
  };

  // Handle deleting a banner
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
        axiosPublic.delete(`/banners/${id}`).then((res) => {
          if (res.data?.deletedCount) {
            Swal.fire({
              title: "Deleted!",
              text: "Your banner has been deleted.",
              icon: "success",
            });
            refetch();
          }
        });
      }
    });
  };

  // Handle updating a banner
  const handleUpdate = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to update this banner?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const uploadImg = await uploadImage(edit);
        axiosPublic
          .patch(`/banners/${id}`, {
            image: uploadImg,
          })
          .then((res) => {
            if (res.data?.modifiedCount > 0) {
              Swal.fire({
                title: "Updated Successfully!",
                icon: "success",
              });
              refetch();
              setEdit(null);
            }
          });
      }
    });
  };

  return (
    <div className="px-2">
       <Offers />
      <div>
        <h1 className="text-3xl font-semibold text-center underline mb-10 mt-24">
          All Banners
        </h1>
        <div className="my-3 lg:flex space-y-2 lg:space-y-0 lg:space-x-2 items-center">
          <input
            type="file"
            name="banner"
            id="banner"
            className="lg:w-1/2 border p-1 rounded"
            onChange={(e) => setAdd(e.target.files[0])}
          />
          <button
            onClick={handleBanner}
            className="px-5 py-2 bg-[#bb5fcb] text-white rounded-lg hover:bg-[#aa42bd] transition"
          >
            Add New
          </button>
        </div>

        <div>
          {banners?.map((banner) => (
            <div key={banner?._id} className="relative my-5">
              <img
                className="w-full max-h-[60vh] h-full"
                src={banner?.image}
                alt="banner"
              />

              {/* Absolute positioned Delete and Update buttons */}
              <div className="absolute top-2 right-2 space-x-2">
                <button
                  onClick={() => handleDelete(banner?._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Delete
                </button>
                <input
                  type="file"
                  className="hidden"
                  id={`edit-${banner?._id}`}
                  onChange={(e) => setEdit(e.target.files[0])}
                />
                {edit ? (
                  <button
                    onClick={() => handleUpdate(banner?._id)}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    Confirm Update
                  </button>
                ) : (
                  <label
                    htmlFor={`edit-${banner?._id}`}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition cursor-pointer"
                  >
                    Update
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
