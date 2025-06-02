import React, { useState } from "react";

const ShippingOptions = () => {
  const [method, setMethod] = useState("shippedInBulk");
  const [includeReturn, setIncludeReturn] = useState(false);

  const styles = {
    container: {
      fontFamily: "sans-serif",
      padding: "20px",
      display: "flex",
      justifyContent: "center",
    },
    label: {
      fontWeight: "bold",
      marginBottom: "8px",
      display: "block",
    },
    toggleContainer: {
      display: "flex",
      gap: "10px",
      marginBottom: "20px",
    },
    row: {
      display: "flex",
      alignItems: "center",
      marginBottom: "20px",
      gap: "10px",
      marginTop: "30px",
    },
    button: (isActive: boolean) => ({
      padding: "10px 20px",
      border: isActive ? "2px solid #3B82F6" : "1px solid #ccc",
      borderRadius: "6px",
      backgroundColor: isActive ? "#f0f8ff" : "#fff",
      color: "#1E1E1E",
      cursor: "pointer",
      fontWeight: isActive ? "600" : "400",
    }),
    form: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "10px",
      marginTop: "10px",
    },
    input: {
      padding: "10px",
      borderRadius: "4px",
      border: "1px solid #ccc",
      width: "100%",
    },
    fullWidth: {
      gridColumn: "span 2",
    },
    returnButton: {
      padding: "8px 14px",
      border: "1px solid #ccc",
      borderRadius: "6px",
      backgroundColor: "#fff",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    plusIcon: {
      fontWeight: "bold",
      fontSize: "18px",
    },
  };

  return (
    <>
      <br />
      <br />

      <br />

      <br />
      <br />
      <br />
      <br />
      <div style={styles.container}>
        <div style={{ width: "80%" }}>
          <label style={styles.label}>Shipping method</label>
          <div style={styles.toggleContainer}>
            <button
              onClick={() => setMethod("shippedInBulk")}
              style={styles.button(method === "shippedInBulk")}
            >
              Shipped in bulk to your address
            </button>
            <button
              onClick={() => setMethod("sendForYou")}
              style={styles.button(method === "sendForYou")}
            >
              Send for you, with a local stamp
            </button>
          </div>

          {method === "shippedInBulk" && (
            <>
              <label style={styles.label}>
                Shipping Address <span style={{ color: "red" }}>*</span>
              </label>
              <div style={styles.form}>
                <input style={styles.input} placeholder="First name *" />
                <input style={styles.input} placeholder="Last name" />
                <input
                  style={{ ...styles.input, ...styles.fullWidth }}
                  placeholder="Company"
                />
                <input
                  style={{ ...styles.input, ...styles.fullWidth }}
                  placeholder="Address line 1"
                />
                <input
                  style={{ ...styles.input, ...styles.fullWidth }}
                  placeholder="Address line 2"
                />
                <input style={styles.input} placeholder="City" />
                <input style={styles.input} placeholder="State/county" />
                <input style={styles.input} placeholder="Postcode/Zip" />
                <input style={styles.input} placeholder="Country" />
              </div>
            </>
          )}
          <div style={styles.row}>
            <label style={styles.label}>Return address</label>
            <button
              onClick={() => setIncludeReturn(!includeReturn)}
              style={styles.returnButton}
            >
              <span style={styles.plusIcon}>+</span> Include return address on
              envelope
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ShippingOptions;
