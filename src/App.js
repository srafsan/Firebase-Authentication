import './App.css';
import { initializeApp } from 'firebase/app';
import firebaseConfig from './firebase.config';
import { FacebookAuthProvider, getAuth, updateProfile, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useState } from 'react';

const app = initializeApp(firebaseConfig);

function App() {
  const [newUser, setNewUser] = useState(false)
  // User State Information
  const [user, setUser] = useState({
    isSignIn: false,
    name: '',
    email: '',
    password: '',
    photo: '',
    error: '',
    success: false
  })

  // Handles Sign in
  const googleProvider = new GoogleAuthProvider();
  const fbProvider = new FacebookAuthProvider();

  const handleSignIn = () => {
    const auth = getAuth();

    signInWithPopup(auth, googleProvider)
      .then((result) => {
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential.accessToken;
        const user = result.user;

        const { displayName, photoURL, email } = user
        const signedInUser = {
          isSignIn: true,
          name: displayName,
          email: email,
          photo: photoURL
        }

        setUser(signedInUser)

      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.email;
        const credential = GoogleAuthProvider.credentialFromError(error);

        console.log(errorCode);
        console.log(errorMessage);
        console.log(email);
        console.log(credential);
      });
  }

  // Handles Facebook Sign In
  const handleFbSignIn = () => {
    const auth = getAuth();
    signInWithPopup(auth, fbProvider)
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // Handles Sign Out
  const handleSignOut = () => {
    const auth = getAuth();

    signOut(auth).then(() => {
      const signOutUser = {
        isSignIn: false,
        name: '',
        photo: '',
        email: ''
      }
      setUser(signOutUser);
    }).catch((error) => {
      console.log(error);
    });
  }

  // Handles Submit
  const handleSubmit = (e) => {
    if (newUser && user.password && user.email) {
      console.log('submitting');
      const auth = getAuth();
      createUserWithEmailAndPassword(auth, user.email, user.password)
        .then((userCredential) => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo)
          updateUserName(user.name)
        })
        .catch((error) => {
          const newUserInfo = { ...user }
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }

    if (!newUser && user.email && user.password) {
      const auth = getAuth();
      signInWithEmailAndPassword(auth, user.email, user.password)
        .then((res) => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }

    e.preventDefault();
  }

  // Handles the input fields
  const handleBlur = (event) => {
    let isFieldValid = true;

    if (event.target.name === 'email')
      isFieldValid = /\S+@\S+\.\S+/.test(event.target.value)

    if (event.target.name === 'password') {
      const isPasswordValid = event.target.value.length > 6
      const passwordHasNumber = /\d{1}/.test(event.target.value)
      isFieldValid = isPasswordValid && passwordHasNumber;
    }

    if (isFieldValid) {
      const newUserInfo = { ...user }
      newUserInfo[event.target.name] = event.target.value
      setUser(newUserInfo)
    }
  }

  const updateUserName = (name) => {
    const auth = getAuth();
    updateProfile(auth.currentUser, {
      displayName: name
    }).then(() => {
      console.log('User Name updated successfully');
    }).catch((error) => {
      console.log(error);
    });
  }

  return (
    <div className="App">
      {/* Google Sign in button */}
      {
        user.isSignIn ? <button className='btn btn-success' onClick={handleSignOut}>Sign Out</button> : <button className='btn btn-success' onClick={handleSignIn}>Sign In</button>
      }

      <br /><br />
      <button className='btn btn-primary' onClick={handleFbSignIn}>Sign in using Facebook</button>

      {
        user.isSignIn && <div>
          <p>Welcome, {user.name}</p>
          <p>Your email: {user.email}</p>
          <img src={user.photo} alt="Profile_Picture" />
        </div>
      }

      {/* Form Registration */}
      <h1>Our own Authentication</h1>

      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="" />
      <label htmlFor="newUser">New User Sign up</label>

      <form onSubmit={handleSubmit}>
        {newUser && <input type="text" name='name' onBlur={handleBlur} placeholder='Your name' required />}
        <br />
        <input type="text" name='email' onBlur={handleBlur} placeholder='Your Email Address' required />
        <br />
        <input type="password" name="password" onBlur={handleBlur} placeholder='Your Password' required />
        <br />
        <input type="submit" value={newUser ? 'Sign Up' : 'Sign In'} />
      </form>

      {
        user.success ? <p style={{ color: 'green' }}>User {newUser ? 'Created' : 'Logged in'} Successfully</p> :
          <p style={{ color: 'red' }}>{user.error}</p>
      }
    </div>
  );
}

export default App;
