import { useState, useRef } from 'react';
import styles from './Controls.module.css';

export default function Controls({ onSetTime, onSetMinutes, onReset }) {
  const [timeInput, setTimeInput] = useState('');
  const [minutesInput, setMinutesInput] = useState('');
  const [timeError, setTimeError] = useState('');
  const timeInputRef = useRef(null);

  function handleSetTime() {
    setTimeError('');
    if (!timeInput) {
      setTimeError('Please enter a time.');
      return;
    }

    const now = new Date();
    const [hStr, mStr] = timeInput.split(':');
    const target = new Date();
    target.setHours(parseInt(hStr, 10), parseInt(mStr, 10), 0, 0);

    const diffMs = target - now;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffMs <= 0) {
      setTimeError('Time must be in the future.');
      return;
    }
    if (diffHours > 20) {
      setTimeError('Time must be within 20 hours from now.');
      return;
    }

    onSetTime(target);
  }

  function handleSetMinutes() {
    const mins = parseInt(minutesInput, 10);
    if (isNaN(mins) || mins < 1 || mins > 59) return;
    const target = new Date(Date.now() + mins * 60 * 1000);
    onSetMinutes(target);
  }

  function handleMinutesChange(e) {
    const val = e.target.value;
    if (val === '' || (parseInt(val, 10) >= 1 && parseInt(val, 10) <= 59)) {
      setMinutesInput(val);
    }
  }

  function handleReset() {
    setTimeInput('');
    setMinutesInput('');
    setTimeError('');
    if (timeInputRef.current) timeInputRef.current.value = '';
    onReset();
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.panel}>
        {/* Time input group */}
        <div className={styles.groupColumn}>
          <div className={styles.group}>
            <input
              type="time"
              ref={timeInputRef}
              className={styles.input}
              value={timeInput}
              onChange={(e) => { setTimeInput(e.target.value); setTimeError(''); }}
              placeholder="HH:MM"
            />
            <button className={styles.btn} onClick={handleSetTime}>
              Set Time
            </button>
          </div>
          {timeError && <div className={styles.error}>{timeError}</div>}
        </div>

        <span className={styles.orDivider}>Or</span>

        {/* Minutes input group */}
        <div className={styles.group}>
          <input
            type="number"
            className={styles.input}
            value={minutesInput}
            onChange={handleMinutesChange}
            min={1}
            max={59}
            placeholder="1–59 min"
          />
          <button className={styles.btn} onClick={handleSetMinutes}>
            Set Minutes
          </button>
        </div>

        {/* Reset */}
        <button className={`${styles.btn} ${styles.btnReset}`} onClick={handleReset}>
          Reset All
        </button>
      </div>

    </div>
  );
}
