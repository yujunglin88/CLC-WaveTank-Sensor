import React from "react";
import "./toggle.css";

const Toggle = ({ toggle, handleToggleChange , on, off }) => {
  return (
    <>
        <div className="container">
            <div>Data stream</div>
            <div className='toggle-container' onClick={handleToggleChange}>
                <div className={`toggle-btn ${!toggle ? "disable" : ""}`}>
                    {toggle ? on : off}
                </div>
            </div>   
        </div>
    </>
   
  );
};

export default Toggle;