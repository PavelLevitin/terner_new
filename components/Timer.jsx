import styles from './Timer.module.css';

export default function Timer({ timeLeft, isRunning, dayLabel, dateLabel }) {
  const pad = (n) => String(n).padStart(2, '0');

  const timerStr = isRunning && timeLeft
    ? `${pad(timeLeft.h)}:${pad(timeLeft.m)}:${pad(timeLeft.s)}`
    : null;

  return (
    <div className={styles.infoBar}>
      <span className={styles.dayDate}>
        {dayLabel} &nbsp; {dateLabel}
      </span>
      {timerStr && (
        <span className={styles.countdown}>
          &#9660; {timerStr}
        </span>
      )}
    </div>
  );
}
