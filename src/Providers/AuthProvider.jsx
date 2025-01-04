import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, GithubAuthProvider, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import auth from "./Firebase/FirebaseConfig";

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();


export const AuthContext = createContext(null)
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({})
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true);
    const [userCurrentPath, setUserCurrentPath] = useState(null);

    const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password)

    }
    const userLogin = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    }
    const googleLogin = () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider);
    }
    const facebookLogin = () => {
        setLoading(true);
        return signInWithPopup(auth, facebookProvider);
    };
    
    const forgotPassword = (email) => {
        setLoading(true);
        return sendPasswordResetEmail(auth, email);
    }
    const logOut = () => {
        setLoading(true);
        return signOut(auth);
    }
    const setUserLocation = (userPath) => {
        setUserCurrentPath(userPath)
    }
    const updateUser = (name, photo) =>{
        updateProfile(auth.currentUser, {
            displayName: name, photoURL: photo
          })
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, currentUser => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => {
            return unsubscribe();
        }
    }, [user])


    const authInfo = {
        createUser,
        userLogin,
        googleLogin,
        facebookLogin,
        logOut,
        user,
        loading,
        userCurrentPath,
        setUserLocation,
        forgotPassword,
        userData,
        setUserData,
        updateUser,
    } 
    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;