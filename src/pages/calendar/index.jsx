import React, { useState } from 'react';
import './index.less';  // 用于样式

const Calendar = () => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  
    const daysInMonth = (month, year) => {
      return new Date(year, month + 1, 0).getDate();
    };
  
    const getDayOfWeek = (date) => {
      return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };
  
    const handlePrevMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };
  
    const handleNextMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };
  
    const renderDays = () => {
      const totalDays = daysInMonth(currentDate.getMonth(), currentDate.getFullYear());
      const firstDay = getDayOfWeek(currentDate);
      const daysArray = [];
      
      for (let i = 0; i < firstDay; i++) {
        daysArray.push(<div key={`empty-${i}`} className="day empty"></div>);
      }
  
      for (let day = 1; day <= totalDays; day++) {
        daysArray.push(
          <div key={day} className={`day ${day === today.getDate() && currentDate.getMonth() === today.getMonth() ? 'today' : ''}`}>
            {day}
          </div>
        );
      }
  
      return daysArray;
    };
  
    return (
      <div className="calendar-container">
        <div className="header">
          <button onClick={handlePrevMonth}>{"<"}</button>
          <h2>{currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</h2>
          <button onClick={handleNextMonth}>{">"}</button>
        </div>
        <div className="weekdays">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div className="days-grid">
          {renderDays()}
        </div>
      </div>
    );
  };
  
  export default Calendar;