import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import FlipClock from '../components/FlipClock';
import Timer from '../components/Timer';
import Controls from '../components/Controls';
import WeatherWidget from '../components/WeatherWidget';
import styles from './index.module.css';

const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatDate(date) {
  const dayName = DAYS_EN[date.getDay()];
  const day = date.getDate();
  const month = MONTHS_EN[date.getMonth()];
  const year = date.getFullYear();
  return { dayLabel: dayName, dateLabel: `${day} ${month} ${year}` };
}

function computeTimeLeft(targetTime, now) {
  if (!targetTime || !now) return null;
  const diff = targetTime - now;
  if (diff <= 0) return { h: 0, m: 0, s: 0 };
  const totalSeconds = Math.floor(diff / 1000);
  return {
    h: Math.floor(totalSeconds / 3600),
    m: Math.floor((totalSeconds % 3600) / 60),
    s: totalSeconds % 60,
  };
}

export default function Home() {
  const [now, setNow] = useState(null);
  const [targetTime, setTargetTime] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertFadingIn, setAlertFadingIn] = useState(false);
  const [alertFading, setAlertFading] = useState(false);
  const [showCredits, setShowCredits] = useState(false);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setShowCredits(false); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const beepRef = useRef(null);
  const alertShownRef = useRef(false);
  const preAlertStartedRef = useRef(false);
  const alertTimerRef = useRef(null);
  const fadeInIntervalRef = useRef(null);
  const fadeOutIntervalRef = useRef(null);
  const isRunningRef = useRef(false);
  const targetTimeRef = useRef(null);

  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { targetTimeRef.current = targetTime; }, [targetTime]);

  // Single always-running interval
  useEffect(() => {
    const interval = setInterval(() => {
      const current = new Date();
      setNow(current);

      if (isRunningRef.current && targetTimeRef.current) {
        const diff = targetTimeRef.current - current;

        // 5 seconds before: fade in sound + text
        if (diff <= 5000 && diff > 0 && !preAlertStartedRef.current) {
          preAlertStartedRef.current = true;
          if (beepRef.current) {
            beepRef.current.volume = 0;
            beepRef.current.loop = true;
            beepRef.current.play().catch(() => {});
          }
          setShowAlert(true);
          setAlertFadingIn(true);

          // Fade audio in over 5 seconds
          let step = 0;
          const steps = 50;
          fadeInIntervalRef.current = setInterval(() => {
            step++;
            if (beepRef.current) beepRef.current.volume = Math.min(1, step / steps);
            if (step >= steps) {
              clearInterval(fadeInIntervalRef.current);
              fadeInIntervalRef.current = null;
            }
          }, 100);
        }

        // Countdown reached zero
        if (diff <= 0) {
          setIsRunning(false);
          isRunningRef.current = false;

          // Clear fade-in and snap to full volume
          if (fadeInIntervalRef.current) {
            clearInterval(fadeInIntervalRef.current);
            fadeInIntervalRef.current = null;
          }
          if (beepRef.current) beepRef.current.volume = 1;
          setAlertFadingIn(false);

          if (!alertShownRef.current) {
            alertShownRef.current = true;
            // If pre-alert didn't trigger (very short countdown), start audio now
            if (!preAlertStartedRef.current) {
              if (beepRef.current) {
                beepRef.current.loop = true;
                beepRef.current.play().catch(() => {});
              }
              setShowAlert(true);
            }

            // After 30s, fade out
            alertTimerRef.current = setTimeout(() => {
              setAlertFading(true);
              let step = 0;
              const steps = 30;
              fadeOutIntervalRef.current = setInterval(() => {
                step++;
                if (beepRef.current) beepRef.current.volume = Math.max(0, 1 - step / steps);
                if (step >= steps) {
                  clearInterval(fadeOutIntervalRef.current);
                  fadeOutIntervalRef.current = null;
                  setShowAlert(false);
                  setAlertFading(false);
                  if (beepRef.current) {
                    beepRef.current.pause();
                    beepRef.current.currentTime = 0;
                    beepRef.current.loop = false;
                    beepRef.current.volume = 1;
                  }
                }
              }, 100);
            }, 30000);
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSetTime = useCallback((target) => {
    alertShownRef.current = false;
    preAlertStartedRef.current = false;
    setTargetTime(target);
    setIsRunning(true);
  }, []);

  const handleSetMinutes = useCallback((target) => {
    alertShownRef.current = false;
    preAlertStartedRef.current = false;
    setTargetTime(target);
    setIsRunning(true);
  }, []);

  const handleReset = useCallback(() => {
    alertShownRef.current = false;
    preAlertStartedRef.current = false;
    if (alertTimerRef.current) { clearTimeout(alertTimerRef.current); alertTimerRef.current = null; }
    if (fadeInIntervalRef.current) { clearInterval(fadeInIntervalRef.current); fadeInIntervalRef.current = null; }
    if (fadeOutIntervalRef.current) { clearInterval(fadeOutIntervalRef.current); fadeOutIntervalRef.current = null; }
    if (beepRef.current) {
      beepRef.current.pause();
      beepRef.current.currentTime = 0;
      beepRef.current.loop = false;
      beepRef.current.volume = 1;
    }
    setTargetTime(null);
    setIsRunning(false);
    setShowAlert(false);
    setAlertFadingIn(false);
    setAlertFading(false);
  }, []);

  if (!now) {
    return (
      <div className={styles.page}>
        <Head>
          <title>Toto Turner Stadium Clock</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
      </div>
    );
  }

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const { dayLabel, dateLabel } = formatDate(now);
  const timeLeft = isRunning ? computeTimeLeft(targetTime, now) : null;

  let alertClass = styles.alertOverlay;
  if (alertFadingIn) alertClass += ` ${styles.alertFadingIn}`;
  if (alertFading) alertClass += ` ${styles.alertOverlayFading}`;

  return (
    <div className={styles.page}>
      <Head>
        <title>Toto Turner Stadium Clock</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Rotate overlay for mobile landscape */}
      <div className={styles.rotateOverlay}>
        <span className={styles.rotateIcon}>📱</span>
        <span className={styles.rotateText}>Please rotate your device to portrait mode</span>
      </div>

      <audio ref={beepRef} src="/ternerclock/beep.mp3" preload="auto" />

      {showAlert && (
        <div className={alertClass}>
          <span className={styles.alertText}>Get Out Time To Play</span>
        </div>
      )}

      <WeatherWidget />

      <button className={styles.creditsBtn} onClick={() => setShowCredits(true)}>ℹ</button>

      {showCredits && (
        <div className={styles.creditsOverlay} onClick={() => setShowCredits(false)}>
          <div className={styles.creditsDialog} onClick={(e) => e.stopPropagation()}>
            <p className={styles.creditsText}>Made by Pavel Levitin</p>
            <button className={styles.creditsClose} onClick={() => setShowCredits(false)}>Close</button>
          </div>
        </div>
      )}

      <div className={styles.content}>
        <Timer
          timeLeft={timeLeft}
          isRunning={isRunning}
          dayLabel={dayLabel}
          dateLabel={dateLabel}
        />
        <FlipClock hours={hours} minutes={minutes} seconds={seconds} />
      </div>

      <Controls
        onSetTime={handleSetTime}
        onSetMinutes={handleSetMinutes}
        onReset={handleReset}
      />
    </div>
  );
}
