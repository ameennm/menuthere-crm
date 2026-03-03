// DateTimePicker — date + 12-hour AM/PM time selector
// value: "YYYY-MM-DDTHH:MM" (24h, ISO-ish) or "" for empty
// onChange: called with the same format

export default function DateTimePicker({ value, onChange, name }) {
  // Parse stored value into parts
  function parse(val) {
    if (!val) return { date: "", hour: "9", minute: "00", ampm: "AM" };
    const [datePart, timePart] = val.split("T");
    if (!timePart)
      return { date: datePart, hour: "9", minute: "00", ampm: "AM" };
    const [hStr, mStr] = timePart.split(":");
    let h = parseInt(hStr, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    if (h === 0) h = 12;
    else if (h > 12) h = h - 12;
    return { date: datePart, hour: String(h), minute: mStr || "00", ampm };
  }

  function combine(date, hour, minute, ampm) {
    if (!date) return "";
    let h = parseInt(hour, 10);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    const hh = String(h).padStart(2, "0");
    return `${date}T${hh}:${minute}`;
  }

  const { date, hour, minute, ampm } = parse(value);

  function handleDate(e) {
    onChange({
      target: { name, value: combine(e.target.value, hour, minute, ampm) },
    });
  }
  function handleHour(e) {
    onChange({
      target: { name, value: combine(date, e.target.value, minute, ampm) },
    });
  }
  function handleMinute(e) {
    onChange({
      target: { name, value: combine(date, hour, e.target.value, ampm) },
    });
  }
  function handleAmPm(e) {
    onChange({
      target: { name, value: combine(date, hour, minute, e.target.value) },
    });
  }

  const inputStyle = {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: 8,
    color: "var(--text-primary)",
    padding: "8px 10px",
    fontSize: 14,
    outline: "none",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {/* Date */}
      <input
        type="date"
        value={date}
        onChange={handleDate}
        className="form-input"
        style={{ flex: "1 1 130px", minWidth: 130 }}
      />

      {/* Hour */}
      <select
        value={hour}
        onChange={handleHour}
        style={{ ...inputStyle, width: 62 }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
          <option key={h} value={String(h)}>
            {h}
          </option>
        ))}
      </select>

      <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>:</span>

      {/* Minute */}
      <select
        value={minute}
        onChange={handleMinute}
        style={{ ...inputStyle, width: 66 }}
      >
        {[
          "00",
          "05",
          "10",
          "15",
          "20",
          "25",
          "30",
          "35",
          "40",
          "45",
          "50",
          "55",
        ].map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      {/* AM/PM */}
      <select
        value={ampm}
        onChange={handleAmPm}
        style={{ ...inputStyle, width: 68 }}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}
