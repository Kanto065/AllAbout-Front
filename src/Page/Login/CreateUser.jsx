import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import useAuth from "../../Hooks/useAuth";
import useAxiosPublic from "../../Hooks/useAxiosPublic";
import { Helmet } from "react-helmet-async";

const CreateUser = () => {
    const { register, handleSubmit } = useForm();
    const { createUser, updateUser, googleLogin, facebookLogin } = useAuth();
    const axiosPublic = useAxiosPublic();
    const [loader, setLoader] = useState(false);
    const navigate = useNavigate();

    const State = location?.state;
    useEffect(() => {
        // Only set user location if State is available
        if (State) {
        setUserLocation(State);
        }
    }, [State, setUserLocation]);

    const onSubmit = async (data) => { 
        setLoader(true);
        const name = data?.name;
        const email = data?.email.toLowerCase();
        const password = data?.password;

        // Password validation
        if (password?.length < 6) {
            Swal.fire({
                title: 'Warning!',
                text: 'Password must be at least 6 characters long.',
                icon: 'warning',
                confirmButtonText: 'Ok'
            });
            setLoader(false);
            return;
        }

        try {
            await createUser(email, password);
            await updateUser(name);
            const role = "user";
            const User = { email, name, role, carts:[], wishlist:[]  };

            // Post user data to your API
            const response = await axiosPublic.post('/users', User);
            if (response.data.insertedId || response.data.modifiedCount > 0) {
                Swal.fire({
                    position: "top-end",
                    title: 'Success!',
                    text: 'Login Successfully',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1000
                });
                // Navigate to the intended location or default home page
                navigate(location?.state || "/");
            }
        } catch (error) {
            Swal.fire({
                title: 'Warning!',
                text: error.message,
                icon: 'warning',
                confirmButtonText: 'Ok'
            });
        } finally {
            setLoader(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { user } = await googleLogin();
            const email = user?.email;
            const image = user?.photoURL;
            const name = user?.displayName;
            const role = "user";
            const User = { email, image, name, role, carts:[], wishlist:[] };

            // Post user data to your API
            const response = await axiosPublic.post('/users', User);
            if (response.data.insertedId || response.data.modifiedCount > 0 || response?.status) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Login Successfully!",
                    showConfirmButton: false,
                    timer: 1500
                  });
                // Navigate to the intended location or default home page
                navigate(location?.state || "/");

            }
        } catch (error) {
            Swal.fire({
                title: 'Error!',
                text: `An error occurred: ${error.message || 'Unable to login with Google.'}`,
                icon: 'error',
                confirmButtonText: 'Ok'
            });
        }
    };

    const handleFacebookLogin = async () => {
        try {
          const { user } = await facebookLogin();
          const email = user?.email;
          const image = user?.photoURL;
          const name = user?.displayName;
          const role = "user";
          const User = { email, image, name, role, carts: [], wishlist: [] };
    
          const response = await axiosPublic.post("/users", User);
          if (response.data.insertedId || response?.status) {
            Swal.fire({
              position: "top-end",
              icon: "success",
              title: "Login Successfully!",
              showConfirmButton: false,
              timer: 1500,
            });
            if (State) {
              navigate(State?.from);
            } else {
              navigate("/");
            }
          }
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: `An error occurred: ${
              error.message || "Unable to login with Facebook."
            }`,
            icon: "error",
            confirmButtonText: "Ok",
          });
        }
      };

    return (
        <div className="flex items-center min-h-screen pt-32 md:pt-44 pb-24">
            <Helmet>
                <title>All About Craft BD | Create Account</title>
            </Helmet>
            <div className="max-w-[90%] 2xl:max-w-7xl mx-auto flex w-full items-center justify-center">
                <div className="shadow-xl max-w-xl w-full mx-auto mt-10 lg:mt-0 p-4 md:p-10 rounded-lg border bg-white">
                    <div className="text-center space-y-2">
                        <h1 className="text-center text-3xl font-semibold">Welcome to All About Craft BD</h1>
                        <p className="text-xl">Register Your Account</p>
                    </div>
          {/* sign with google */}
          <button
            onClick={handleGoogleLogin}
            className="mt-10 flex items-center text-lg border-2 py-1 px-7 rounded-lg mx-auto playfair hover:bg-slate-100"
          >
            {/* <img className="h-6 mr-2" src="/images/icons/google.png" alt="" />  */}
            Login with <img className="ml-2 h-5" src="/images/logo&icons/google.png" alt="" />
          </button>

          <button
            onClick={handleFacebookLogin}
            className="mt-10 flex items-center text-lg border-2 py-1 px-7 rounded-lg mx-auto playfair hover:bg-slate-100"
          >
            {/* <img className="h-6 mr-2" src="/images/icons/google.png" alt="" />  */}
            Login with <img className="ml-2 h-5" src="/images/logo&icons/facebook.png" alt="" />
          </button>

          <div className="my-5 flex items-center px-8">
            <hr className="flex-1 border-[#C480CF]" />
            <div className="mx-4 text-[#C480CF]">OR</div>
            <hr className="flex-1 border-[#C480CF]" />
          </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
                        <div className="text-xl">
                            <label className="label">
                                <span className="label-text">Name*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Your Name"
                                {...register('name', { required: true })}
                                className="border mt-0.5 p-2 rounded-lg w-full"
                            />
                        </div>
                        <div className="text-xl">
                            <label className="label">
                                <span className="label-text">Email*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Your Email"
                                {...register('email', { required: true })}
                                className="border mt-0.5 p-2 rounded-lg w-full"
                            />
                        </div>
                        <div className="text-xl">
                            <label className="label">
                                <span className="label-text">Password*</span>
                            </label>
                            <input
                                type="password"
                                placeholder="Create Password"
                                {...register('password', { required: true })}
                                className="border mt-0.5 p-2 rounded-lg w-full"
                            />
                        </div>
                        <p className="">Already have an account? <Link to={'/login'} className="text-[#C480CF] font-bold underline">Login</Link></p>
                        <button type="submit" className='text-white bg-[#C480CF] hover:scale-105 py-2 px-14 border-2 rounded-[30px] font-bold duration-700 raleway'>
                            <span>{loader ? <p className="border-t rounded-xl border-white border-solid w-4 h-4 animate-spin"></p> : "Create Account"}</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateUser;
