import React from 'react'

const CardHeading = ({ props }) => {
    return (
        <h2
            style={{
                fontWeight: "400",
                textAlign: "start",
                color: "#fff",
                fontSize: "16px",
                borderBottom: "2px solid #f995bd",
                padding: "8px 12px",
                margin: "0 0 16px 0",
                borderRadius: "5px 5px 0px 0px", 
                backgroundColor: "#7f285a"
            }}
        >
            {props}
        </h2>
    )
}

export default CardHeading