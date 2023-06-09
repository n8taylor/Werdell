import styles from '@/styles/Home.module.css'
import { useEffect, useState } from 'react';
import router from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { collection, setDoc, doc, getDoc } from "firebase/firestore";
import { db } from '../lib/firebase';

let intervalId: ReturnType<typeof setInterval>;

const setMyInterval = (callback: () => void, delay: number) => {
    intervalId = setInterval(callback, delay);
};

const clearMyInterval = () => {
    clearInterval(intervalId);
};

export default function Game() {
    const [keyPressed, setKeyPressed] = useState('');
    const [guesses, setGuesses] = useState<{ [key: number]: string }>({ 1: '', 2: '', 3: '', 4: '', 5: '', 6: '' });
    const [correctLetters, setCorrectLetters] = useState<{ [key: number]: string }>({
        1: '-----', 2: '-----', 3: '-----', 4: '-----', 5: '-----', 6: '-----',
    })
    const [answer, setAnswer] = useState('STINK');
    const [guessNumber, setGuessNumber] = useState(1);
    const [nextGuess, setNextGuess] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState((<></>));
    const [time, setTime] = useState(0);
    const [timer, setTimer] = useState<ReturnType<typeof setInterval>>();
    const [playing, setPlaying] = useState(false);
    const [userId, setUserId] = useState('');

    useEffect(() => {
        if (userId !== "") {
            console.log(userId)
            chooseWord();
        }
    }, [userId])

    //-------------------------------------------------------------------------------------------------------------
    //
    //                                     I N I T I A L I Z E     W O R D
    //
    //-------------------------------------------------------------------------------------------------------------
    async function chooseWord() {
        try {
            const wordsDocRef = doc(db, "words", "5-letter");
            const docSnap = await getDoc(wordsDocRef);

            if (docSnap.exists()) {
                const statDocRef = doc(db, "stats", userId);
                const statsDocSnap = await getDoc(statDocRef);


                if (statsDocSnap.exists()) {
                    let wordAlreadyPlayed = true;
                    while (wordAlreadyPlayed) {
                        const wordNum = Math.trunc(Math.random() * docSnap.data().words.length);

                        let newWord = true;
                        for (let i = 0; i < statsDocSnap.data().words.length; i++) {
                            if (docSnap.data().words[wordNum].toUpperCase() === statsDocSnap.data().words[i]) {
                                newWord = false;
                                continue;
                            }
                        }

                        if (newWord) {
                            setAnswer(docSnap.data().words[wordNum].toUpperCase());
                            wordAlreadyPlayed = false;
                            continue;
                        }
                    }
                } else {
                    console.log("no stats")
                    const wordNum = Math.trunc(Math.random() * docSnap.data().words.length);
                    setAnswer(docSnap.data().words[wordNum].toUpperCase());
                }
            } else {
                setAnswer('CHARM');
            }
        } catch (e) {
            console.log(e);
        }
    }

    //-------------------------------------------------------------------------------------------------------------
    //
    //                                     S A V E     S T A T S
    //
    //-------------------------------------------------------------------------------------------------------------
    async function saveStats(win: boolean) {
        let lat = 0;
        let lon = 0;

        navigator.geolocation.getCurrentPosition((location) => {
            lat = location.coords.latitude;
            lon = location.coords.longitude;
            console.log(lat, lon)
        }, (err) => {
            console.log(err)
        }, {
            enableHighAccuracy: true,
        })

        try {
            const statDocRef = doc(db, "stats", userId);
            const docSnap = await getDoc(statDocRef);

            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data());

                let newGuessDist = { ...docSnap.data().guessDist };
                if (win) newGuessDist[guessNumber - 1]++;
                let newWords = [...docSnap.data().words];
                newWords.push(answer);
                let newLocations = [...docSnap.data().locations];
                if (win) newLocations.push({ lat, lon });

                const statDoc = await setDoc(doc(collection(db, "stats"), userId), {
                    userId: userId,
                    gamesPlayed: docSnap.data().gamesPlayed + 1,
                    wins: win ? docSnap.data().wins + 1 : docSnap.data().wins,
                    winPercent: win ? (docSnap.data().wins + 1) / (docSnap.data().gamesPlayed + 1) : (docSnap.data().wins) / (docSnap.data().gamesPlayed + 1),
                    streak: win ? docSnap.data().streak + 1 : 0,
                    highestStreak: win ? (docSnap.data().streak + 1 > docSnap.data().highestStreak ? docSnap.data().streak + 1 : docSnap.data().highestStreak) : docSnap.data().highestStreak,
                    guessDist: { ...newGuessDist },
                    avgTime: win ? (docSnap.data().avgTime * docSnap.data().wins + time) / (docSnap.data().wins + 1) : docSnap.data().avgTime,
                    fastestTime: win ? (time <= docSnap.data().fastestTime ? time : docSnap.data().fastestTime) : docSnap.data().fastestTime,
                    fastestWord: win ? (time <= docSnap.data().fastestTime ? answer : docSnap.data().fastestWord) : docSnap.data().fastestWord,
                    leastGuesses: win ? (guessNumber - 1 <= docSnap.data().leastGuesses ? guessNumber - 1 : docSnap.data().leastGuesses) : docSnap.data().leastGuesses,
                    leastGuessesWord: win ? (guessNumber - 1 <= docSnap.data().leastGuesses ? answer : docSnap.data().leastGuessesWord) : docSnap.data().leastGuessesWord,
                    words: [...newWords],
                    locations: [...newLocations]
                });
            } else {
                let guessDist: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, };
                if (win) guessDist[guessNumber - 1] = 1;

                const statDoc = await setDoc(doc(collection(db, "stats"), userId), {
                    userId: userId,
                    gamesPlayed: 1,
                    wins: win ? 1 : 0,
                    winPercent: win ? 1 : 0,
                    streak: win ? 1 : 0,
                    highestStreak: win ? 1 : 0,
                    guessDist: { ...guessDist },
                    avgTime: win ? time : 0,
                    fastestTime: win ? 1 : Number.MAX_VALUE,
                    fastestWord: win ? answer : '',
                    leastGuesses: win ? guessNumber - 1 : 7,
                    leastGuessesWord: win ? answer : '',
                    words: [answer],
                    locations: win ? [{ lat, lon }] : []
                });
            }
        } catch (e) {
            console.error(e);
        }
    }

    //-------------------------------------------------------------------------------------------------------------
    //
    //                                     O N     M O U N T
    //
    //-------------------------------------------------------------------------------------------------------------
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

        document.addEventListener('keyup', handleKeyUp);

        // Clean up function to remove the event listener when component unmounts
        return () => {
            document.removeEventListener('keyup', handleKeyUp);
            console.log("clearing interval")
            clearMyInterval();
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (keyPressed === '' || gameOver) return;
        updateGuesses(keyPressed);
        setKeyPressed('');
    }, [keyPressed])

    useEffect(() => {
        if (!nextGuess) return;
        if (guesses[guessNumber].length < 5) {
            setNextGuess(false);
            return;
        }
        setGuessNumber(guessNumber => guessNumber + 1);
        setNextGuess(false);
    }, [nextGuess])

    useEffect(() => {
        if (guessNumber <= 1) return;

        let correctLettersUpdated = "";

        for (let i = 0; i < guesses[guessNumber - 1].length; i++) {
            correctLettersUpdated += checkLetter(guesses[guessNumber - 1][i], i, guessNumber - 1);
            console.log(correctLetters)
        }

        let updatedCorrectLetters = { ...correctLetters };
        updatedCorrectLetters[guessNumber - 1] = correctLettersUpdated;
        setCorrectLetters(updatedCorrectLetters);

        if (correctLettersUpdated === "*****") {
            setMessage(messageElement("win"));
            document.removeEventListener('keyup', handleKeyUp);
            setGameOver(true);
            clearMyInterval();
            saveStats(true);
            return;
        } else {
            if (guessNumber > 6) {
                setMessage(messageElement("lose"));
                document.removeEventListener('keyup', handleKeyUp);
                setGameOver(true);
                clearMyInterval();
                saveStats(false);
            }
        }
    }, [guessNumber])

    function updateGuesses(key: string) {
        let letters = /^[A-Z,a-z]{1}$/;

        if (keyPressed.match(letters)) {
            // start timer
            if (!playing) {
                setMyInterval(() => {
                    setTime(time => time + 1);
                }, 1000);
                setPlaying(true);
            }

            setGuesses(guesses => {
                let updatedGuesses = { ...guesses };
                if (guesses[guessNumber].length < 5) {
                    updatedGuesses[guessNumber] = updatedGuesses[guessNumber] + key.toUpperCase();
                }

                return updatedGuesses;
            });
        } else if (keyPressed === "Backspace") {
            setGuesses(guesses => {
                let updatedGuesses = { ...guesses };
                updatedGuesses[guessNumber] = updatedGuesses[guessNumber].substring(0, updatedGuesses[guessNumber].length - 1);

                return updatedGuesses;
            });
        } else if (keyPressed === "Enter") {
            setNextGuess(true);
        }
    }

    async function handleKeyUp(event: KeyboardEvent) {
        setKeyPressed(event.key);
    };

    function checkLetter(letter: string, position: number, guess: number) {
        let answerOccurances = 0;
        let guessOccurances = 0;
        for (let i = 0; i < answer.length; i++) {
            if (answer[i] === letter) answerOccurances++;
            if (i <= position && guesses[guess][i] === letter) guessOccurances++;
            if (answer[i] === letter && guesses[guess][i] === letter) {
                if (i <= position) guessOccurances--;
                answerOccurances--;
            }
        }

        if (answer[position] === letter) {
            return "*";
        }
        if (answer.includes(letter) && guessOccurances <= answerOccurances) {
            return "!";
        }
        return "-";
    }

    const messageElement = (messageType: string) => {
        if (messageType === "win") {
            return (
                <>
                    <div className="win-message card-body d-flex row justify-content-center">
                        <h2 className='winMessage text-center text-wrap'>{answer}</h2>
                        <h3 className='text-center'>{guessNumber - 1} guess{guessNumber - 1 === 1 ? '' : 'es'}</h3>
                        <h3 className='text-center'>{time >= 60 ? `${Math.trunc(time / 60)} min ${time % 60}` : time} sec</h3>
                        <button aria-selected='true' className='btn btn-primary mt-3 w-50' onClick={() => router.push('/stats')}>See more stats</button>
                    </div>
                </>
            )
        } else if (messageType === "error") {
            return (
                <>
                    <p className='errorMessage'>Try again with </p>
                </>
            )
        } else if (messageType === "lose") {
            return (
                <>
                    <div className="lose-message card-body d-flex row justify-content-center">
                        <h2 className='winMessage text-center text-wrap'>The word was {answer}!</h2>
                        <h3 className='text-center'>Better luck next time!</h3>
                        <button aria-selected='true' className='btn btn-primary mt-3 w-50' onClick={() => router.push('/stats')}>See more stats</button>
                    </div>
                </>
            )
        }
        return (<></>);
    };

    const row = (row: number) => (
        <>
            <div className="row justify-content-between">
                <div className={`d-flex p-3 rounded m-1 col-2 text-white d-flex justify-content-center letter-box ${correctLetters[row][0] === '*' ? 'bg-success' : correctLetters[row][0] === '!' ? 'bg-warning' : 'bg-dark'}`}>
                    <div className="align-items-center text-center letter">{guesses[row][0]}</div>
                </div>
                <div className={`d-flex p-3 rounded m-1 col-2 text-white d-flex justify-content-center letter-box ${correctLetters[row][1] === '*' ? 'bg-success' : correctLetters[row][1] === '!' ? 'bg-warning' : 'bg-dark'}`}>
                    <div className="align-items-center text-center letter">{guesses[row][1]}</div>
                </div>
                <div className={`d-flex p-3 rounded m-1 col-2 text-white d-flex justify-content-center letter-box ${correctLetters[row][2] === '*' ? 'bg-success' : correctLetters[row][2] === '!' ? 'bg-warning' : 'bg-dark'}`}>
                    <div className="align-items-center text-center letter">{guesses[row][2]}</div>
                </div>
                <div className={`d-flex p-3 rounded m-1 col-2 text-white d-flex justify-content-center letter-box ${correctLetters[row][3] === '*' ? 'bg-success' : correctLetters[row][3] === '!' ? 'bg-warning' : 'bg-dark'}`}>
                    <div className="align-items-center text-center letter">{guesses[row][3]}</div>
                </div>
                <div className={`d-flex p-3 rounded m-1 col-2 text-white d-flex justify-content-center letter-box ${correctLetters[row][4] === '*' ? 'bg-success' : correctLetters[row][4] === '!' ? 'bg-warning' : 'bg-dark'}`}>
                    <div className="align-items-center text-center letter">{guesses[row][4]}</div>
                </div>
            </div>
        </>
    )

    return (
        <>
            <div className={styles.main}>
                <div className='mx-auto'>
                    <h1>Werdell</h1>
                    <h2>Enter a guess below</h2>
                </div>
                <h2 className='text-muted timer'>{!gameOver && (time >= 60 ? `${Math.trunc(time / 60)}:${time % 60 < 10 ? '0' : ''}${time % 60}` : time)}</h2>
                <div className='mt-3 col align-items-stretch werdell-grid'>
                    {row(1)}
                    {row(2)}
                    {row(3)}
                    {row(4)}
                    {row(5)}
                    {row(6)}
                </div>
                <button aria-selected='true' className='btn btn-primary mt-3' onClick={() => setNextGuess(true)}>Submit</button>
                {message}
            </div>
        </>
    )
}