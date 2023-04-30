import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import router from 'next/router';
import { DocumentData, doc, getDoc } from 'firebase/firestore';


export default function Stats() {
  const [mapUrl, setMapUrl] = useState<string>('');
  const [userId, setUserId] = useState('');
  const [stats, setStats] = useState<DocumentData>();

  useEffect(() => {
    if (userId !== "") {
      getStats();
    }
  }, [userId])

  async function getStats() {
    try {
      const statDocRef = doc(db, "stats", userId);
      const statsDocSnap = await getDoc(statDocRef);

      if (statsDocSnap.exists()) {
        setStats(statsDocSnap.data());
      }
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (!stats) return;

    // calculate the average location
    let latSum = 0;
    let lonSum = 0;

    for (const location of stats.locations) {
      latSum += location.lat;
      lonSum += location.lon;
    }

    const avgLat = latSum / stats.locations.length;
    const avgLon = lonSum / stats.locations.length;

    // calculate the farthest location from the average
    let farthestLat = 0;
    let farthestLon = 0;

    for (const location of stats.locations) {
      if (Math.abs(avgLat - location.lat) > farthestLat) farthestLat = Math.abs(avgLat - location.lat);
      if (Math.abs(avgLat - location.lon) > farthestLon) farthestLon = Math.abs(avgLon - location.lon);
    }

    // adjust the zoom of the map according to the farthest location
    let digits = 8;
    if (farthestLat > farthestLon) {
      while (farthestLat > 1) {
        digits--;
        farthestLat /= 2;
      }
    } else {
      while (farthestLon > 1) {
        digits--;
        farthestLon /= 2;
      }
    }

    const apiKey = "AIzaSyBEDjeeW8Z88ENTkaORfiUqm35ZzkKzURM";
    const center = `${avgLat},${avgLon}`;
    const zoom = digits;
    const size = '400x600';

    // Build the markers string
    const markers = stats.locations
      .map((location: { [key: string]: number }, index: number) => `color:red|${location.lat},${location.lon}`)
      .join('&markers=');

    // Build the URL for the static map image
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=${zoom}&size=${size}&markers=${markers}&key=${apiKey}`;

    setMapUrl(mapUrl);
  }, [stats])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // If the user is not signed in, redirect to the login page
        router.replace({
          pathname: "/login",
          query: { next: router.asPath },
        });
      } else {
        setUserId(user.uid);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className='d-flex justify-content-end'>
      <div className='p-3 col-5 align-content-end justify-content-end text-end'>
        <div className='d-flex align-self-end justify-content-end'>

          <h2 className='text-end' style={{ width: 380 }}>Werdell solve locations</h2>
        </div>
        {mapUrl ? (
          <img src={mapUrl} style={{ border: 'solid' }} width={380} height={570} alt="Google Maps" />
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div className='col-7 p-3 text-start'>
        <h1 className='mb-3'>Stats</h1>
        <div className='col-12 card mb-3'>
          <div className='card-body'>
            <div className='row justify-content-between'>
              <div className='col'>
                <h3>Games Played</h3>
              </div>
              <div className='col col-3 text-end'>
                <h4>{stats && stats.gamesPlayed}</h4>
              </div>
            </div>
            <div className='row justify-content-between'>
              <div className='col'>
                <h3>Win Percentage</h3>
              </div>
              <div className='col col-3 text-end'>
                <h4>{stats && Math.trunc(stats.winPercent * 100)}%</h4>
              </div>
            </div>
            <div className='row justify-content-between'>
              <div className='col'>
                <h3>Current Streak</h3>
              </div>
              <div className='col col-3 text-end'>
                <h4>{stats && stats.streak}</h4>
              </div>
            </div>
            <div className='row justify-content-between'>
              <div className='col'>
                <h3>Longest Streak</h3>
              </div>
              <div className='col col-3 text-end'>
                <h4>{stats && stats.highestStreak}</h4>
              </div>
            </div>
          </div>
          <div className='row'>
            <h3></h3>
          </div>
          <div className='col-6'>
          </div>
        </div>
        <div className='col-12 card mb-3'>
          <div className='card-body'>
            <div className='row justify-content-between'>
              <div className='col'>
                <h3>Fewest Guesses</h3>
              </div>
              <div className='col col-3 text-end'>
                <h4>{stats && stats.leastGuesses}</h4>
              </div>
            </div>
            <div className='row justify-content-between'>
              <div className='col'>
                <h3>Word</h3>
              </div>
              <div className='col col-3 text-end'>
                <h4>{stats && stats.leastGuessesWord}</h4>
              </div>
            </div>
            <div className='row justify-content-between'>
              <div className='col'>
                <h3>Guess Distribution</h3>
              </div>
              <div className='col col-8 text-end'>
            <div className='row'>
              <div className='col col-2'>
                <h4>One</h4>
                <h5>{stats && stats.guessDist[1]}</h5>
              </div>
              <div className='col col-2'>
                <h4>Two</h4>
                <h5>{stats && stats.guessDist[2]}</h5>
              </div>
              <div className='col col-2'>
                <h4>Three</h4>
                <h5>{stats && stats.guessDist[3]}</h5>
              </div>
              <div className='col col-2'>
                <h4>Four</h4>
                <h5>{stats && stats.guessDist[4]}</h5>
              </div>
              <div className='col col-2'>
                <h4>Five</h4>
                <h5>{stats && stats.guessDist[5]}</h5>
              </div>
              <div className='col col-2'>
                <h4>Six</h4>
                <h5>{stats && stats.guessDist[6]}</h5>
              </div>
            </div>
              </div>
            </div>
          </div>
          <div className='row'>
            <h3></h3>
          </div>
          <div className='col-6'>
          </div>
        </div>
        <div className='col-12 card'>
          <div className='card-body'>
            <div className='row justify-content-between'>
              <div className='col'>
                <h3>Fastest Time</h3>
              </div>
              <div className='col col-3 text-end'>
                <h4>{stats && stats.fastestTime + ' sec'}</h4>
              </div>
            </div>
            <div className='row justify-content-between'>
              <div className='col'>
                <h3>Word</h3>
              </div>
              <div className='col col-3 text-end'>
                <h4>{stats && stats.fastestWord}</h4>
              </div>
            </div>
            <div className='row justify-content-between'>
              <div className='col'>
                <h3>Average Time</h3>
              </div>
              <div className='col col-3 text-end'>
                <h4>{stats && Math.trunc(stats.avgTime) + ' sec'}</h4>
              </div>
            </div>
          </div>
          <div className='row'>
            <h3></h3>
          </div>
          <div className='col-6'>
          </div>
        </div>
      </div>
    </div>
  );
};