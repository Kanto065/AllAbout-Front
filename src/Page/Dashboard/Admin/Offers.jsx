import { useEffect, useState } from "react";
import useAxiosPublic from "../../../Hooks/useAxiosPublic";
import Swal from "sweetalert2";

export default function Offers() {
  const axiosPublic = useAxiosPublic();
  const [presentOffer, setPresentOffer] = useState([]);
  const [updateOffer, setUpdateOffer] = useState(false);
  const [change, setChange] = useState(false);

  useEffect(() => {
    axiosPublic.get(`/offertag`).then((data) => {
        setPresentOffer(data?.data);
        setUpdateOffer(data?.data[0].offer);
    });
    setChange(false);
  }, [axiosPublic, change]);

  // Handle updating a offer
  const handleUpdate = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to update offer?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, update it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        axiosPublic
          .patch(`/offertag/${id}`, {
            updateOffer
          })
          .then((res) => {
            if (res.data?.modifiedCount > 0) {
              Swal.fire({
                title: "Updated Successfully!",
                icon: "success",
              });
              setChange(true);
            }
          });
      }
    });
  };

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold text-center underline">
        Present Offer
      </h1>
      <div>
        {presentOffer?.map((offer) => (
          <div key={offer?._id} className="space-y-3">
            <textarea
              name=""
              id=""
              rows={3}
              value={updateOffer}
              onChange={e => setUpdateOffer(e.target.value)}
              className="w-full p-2 rounded-md text-xl"
              placeholder="Update Offer..."
            ></textarea>
            <button
                onClick={() => handleUpdate(offer?._id)}
                className="px-3 py-1 text-lg bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                Confirm Update
              </button>
          </div>
        ))}
      </div>
    </div>
  );
}
