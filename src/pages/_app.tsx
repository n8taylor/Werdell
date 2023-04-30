import 'bootstrap/dist/css/bootstrap.min.css'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import router from 'next/router';
import { auth } from '@/lib/firebase';

const authorization = getAuth();

export default function App({ Component, pageProps }: AppProps) {
  const [currentPage, setCurrentPage] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setSignedIn(false);
      } else {
        setSignedIn(true);
      }
    });

    return unsubscribe;
  }, []);

  function logoutUser() {
    signOut(authorization).then(() => {
      // Sign-out successful.
    }).catch((error) => {
      console.log(error);
    });
  }

  const signInOptions = (
    <>
      <li className="nav-item">
        <Link className="nav-link" href="/signup">Sign Up</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link" href="/login">Sign In</Link>
      </li>
    </>
  );

  const signOutOption = (
    <>
      <li className="nav-item">
        <Link className="nav-link" href="#" onClick={logoutUser}>Sign Out</Link>
      </li>
    </>
  );

  return (
    <>
      <nav className="px-3 navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="#">Werdell</a>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item active">
              <Link className="nav-link" href="/">Home {currentPage === "home" && <span className="sr-only">(current)</span>}</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/game">Game</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/stats">Stats</Link>
            </li>
          </ul>
          <ul className='navbar-nav'>
            {signedIn ? signOutOption : signInOptions}
          </ul>
        </div>
      </nav>
      <Component {...pageProps} />
    </>
  )
}
