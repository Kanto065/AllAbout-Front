import { useState } from 'react';
import useAuth from '../../Hooks/useAuth';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const ForgotPass = () => {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(''); 
    const [loader, setLoader] = useState(false)

    const handleForgotPassword = async () => {
        setLoader(true) 
        try {
            await forgotPassword(email);
            // Display a custom success message when the email is found
            setMessage('Password reset email sent. Check your inbox.');
        } catch (error) {
            // Check if the error is related to the email not being found
            if (error.code === 'auth/user-not-found') {
                setMessage('No account found with this email.');
            } else {
                setMessage(`Error: ${error.message}`);
            }
        } finally {
            setLoader(false);
        }
    };

    return (
        <div className='min-h-screen lg:w-10/12 mx-auto flex justify-center items-center'>
            <Helmet>
                <title>All About Craft BD | Forgot Password</title>
            </Helmet>
            <div className='border px-5 py-12 space-y-4 rounded-xl shadow-lg'>
                <div className="text-center space-y-2 mb-5">
                    <h1 className="text-center text-3xl font-semibold">Welcome to All About Craft BD</h1>
                    <p className="text-xl">Recover Your Password</p>
                </div>
                <div>
                    <label className="label">
                        <span className="label-text">Email*</span>
                    </label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="border mt-0.5 p-2 rounded-lg w-full"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <button onClick={handleForgotPassword} className="w-8/12 mx-auto p-2 rounded-lg text-xl bg-[#fecd28] flex justify-center items-center">
                    <span>{loader || "Reset Password"}</span>
                    {
                        loader && <p className="border-t rounded-xl border-black border-solid w-4 h-4 animate-spin"></p>
                    }
                </button>
                <p className={`text-center mt-3 ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>{message}</p>
                <hr />
                <div className="mt-10">
                    <p className="">Back to Login page! <Link to={"/login"} className="text-blue-600">Login...</Link></p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPass;
