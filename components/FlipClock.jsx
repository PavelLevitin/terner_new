import { useState, useEffect, useRef } from 'react';
import styles from './FlipClock.module.css';

function FlipDigit({ value }) {
  const [displayValue, setDisplayValue] = useState(value);
  const [flipping, setFlipping] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      setFlipping(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setFlipping(false);
      }, 250);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);

  const display = String(displayValue).padStart(1, '0');

  return (
    <div className={`${styles.digit} ${flipping ? styles.flipping : ''}`}>
      <div className={styles.upper}>
        <span>{display}</span>
      </div>
      <div className={styles.lower}>
        <span>{display}</span>
      </div>
    </div>
  );
}

function FlipPair({ value }) {
  const str = String(value).padStart(2, '0');
  return (
    <div className={styles.pair}>
      <FlipDigit value={str[0]} />
      <FlipDigit value={str[1]} />
    </div>
  );
}

export default function FlipClock({ hours, minutes, seconds }) {
  return (
    <div className={styles.clock}>
      <FlipPair value={hours} />
      <span className={styles.colon}>:</span>
      <FlipPair value={minutes} />
      <span className={styles.colon}>:</span>
      <FlipPair value={seconds} />
    </div>
  );
}
