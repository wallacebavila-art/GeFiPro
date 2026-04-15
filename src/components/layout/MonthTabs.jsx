import { MESES } from "../../constants.js";

export default function MonthTabs({ curMonth, curYear, onChangeMonth, onChangeYear }) {
  // Gera array de anos (3 anos antes até 3 anos depois do ano atual)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear - 3; y <= currentYear + 3; y++) {
    years.push(y);
  }

  return (
    <div className="month-tabs-wrap" id="month-tabs-wrap">
      <div className="month-tabs-container">
        <select 
          className="year-select-inline" 
          value={curYear} 
          onChange={(e) => onChangeYear(parseInt(e.target.value))}
        >
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <div className="month-tabs" id="month-tabs">
          {MESES.map((m, i) => (
            <button
              key={i + 1}
              className={`m-tab ${i + 1 === curMonth ? 'active' : ''}`}
              onClick={() => onChangeMonth(i + 1)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
