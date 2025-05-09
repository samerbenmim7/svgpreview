import React, { useState } from "react";

type Row = {
  id: number;
  title: string;
  firstName: string;
  lastName: string;
  department: string;
  company: string;
  address: string;
  // use these flags to style special rows
  isHighlighted?: boolean;
  isCompleted?: boolean;
  sender?: string;
};

export const initialRows: Row[] = [
  {
    id: 1,
    title: "-",
    firstName: "Patrick",
    lastName: "Hendry",
    department: "Sales",
    company: "Lumivolt",
    address: "Wunder Street",
    sender: "Patrick Hendry",
  },
  {
    id: 2,
    title: "",
    firstName: "Pascal",
    lastName: "Debrunner",
    department: "",
    company: "Neurodot",
    address: "Wunder Street",
    isHighlighted: true,
    sender: "Pascal Debrunner",
  },
  {
    id: 3,
    title: "M.Sc.",
    firstName: "Christine",
    lastName: "Jodoin",
    department: "CEO",
    company: "Orbyte",
    address: "Wunder Street",
    isCompleted: true,
    sender: "Christine Jodoin",
  },
  {
    id: 4,
    title: "B.Sc.",
    firstName: "Marc‑Olivier",
    lastName: "Jodoin",
    department: "CEO",
    company: "Zentrixa",
    address: "Wunder Street",
    sender: "Marc Olivier Jodoin",
  },
  {
    id: 5,
    title: "M.Sc.",
    firstName: "Christine",
    lastName: "Jodoin",
    department: "CEO",
    company: "Orbyte",
    address: "Wunder Street",
    isCompleted: true,
    sender: "Christine Jodoin",
  },
  {
    id: 6,
    title: "M.Sc.",
    firstName: "Maike",
    lastName: "Eisser",
    department: "CEO",
    company: "Crystelix",
    address: "Wunder Street",
    isCompleted: true,
    sender: "Maike Eisser",
  },
];

export default function PeopleTable() {
  const [rows, setRows] = useState<Row[]>(initialRows);

  const addRowBelow = (afterId?: number) => {
    const newRow: Row = {
      id: Date.now(),
      title: "",
      firstName: "",
      lastName: "",
      department: "",
      company: "",
      address: "",
    };
    if (afterId == null) {
      // add to end
      setRows((r) => [...r, newRow]);
    } else {
      // insert after specific row
      setRows((r) => {
        const idx = r.findIndex((row) => row.id === afterId);
        const copy = [...r];
        copy.splice(idx + 1, 0, newRow);
        return copy;
      });
    }
  };

  // ----- styles ------------------------------------------------------------
  const colors = {
    header: "#f2ede9",
    border: "#D3D3D3",
    textGrey: "#666",
    highlightBg: "#FCEAEA",
    highlightText: "#E55252",
  };

  const tableStyle: React.CSSProperties = {
    borderCollapse: "collapse",
    width: "100%",
    tableLayout: "fixed",
    border: `1px solid ${colors.border}`,
    fontFamily: "Inter, sans-serif",
    fontSize: 15,
  };

  const thStyle: React.CSSProperties = {
    background: colors.header,
    fontWeight: 600,
    padding: "12px 8px",
    textAlign: "left",
    border: `1px solid ${colors.border}`,
  };

  const tdBase: React.CSSProperties = {
    padding: "12px 8px",
    border: `1px solid ${colors.border}`,
  };

  const plusBtnCommon: React.CSSProperties = {
    cursor: "pointer",
    width: 34,
    height: 34,
    borderRadius: "50%",
    border: `1px solid ${colors.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    background: "#fff",
    userSelect: "none",
  };

  // -------------------------------------------------------------------------

  return (
    <div style={{ maxWidth: 1250, margin: "0 auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Title</th>
            <th style={thStyle}>First Name</th>
            <th style={thStyle}>Last Name</th>
            <th style={thStyle}>Department</th>
            <th style={thStyle}>Company</th>
            <th style={thStyle}>Address Line</th>
            {/* <th style={thStyle}></th> */}
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            const tdStyle: React.CSSProperties = {
              ...tdBase,
              background: row.isHighlighted ? colors.highlightBg : "#fff",
              color: row.isHighlighted ? colors.highlightText : "inherit",
            };

            return (
              <tr key={row.id}>
                <td style={tdStyle}>{row.title}</td>
                <td style={tdStyle}>{row.firstName}</td>
                <td style={tdStyle}>{row.lastName}</td>
                <td style={tdStyle}>{row.department}</td>
                <td style={tdStyle}>{row.company}</td>
                <td style={tdStyle}>{row.address}</td>
                {/* <td style={{ ...tdStyle, width: 60 }}>
                  {!row.isCompleted && (
                    <div
                      style={plusBtnCommon}
                      onClick={() => addRowBelow(row.id)}
                      aria-label="add row"
                    >
                      +
                    </div>
                  )}
                </td> */}
              </tr>
            );
          })}

          {/* Render a few empty rows so table height matches screenshot */}
          {Array.from({ length: 3 }).map((_, i) => (
            <tr key={`empty-${i}`}>
              {Array.from({ length: 6 }).map((__, j) => (
                <td key={j} style={{ ...tdBase, height: 48 }} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Center‑bottom global add button */}
      <div
        style={{
          marginTop: 24,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={plusBtnCommon}
          onClick={() => addRowBelow()}
          aria-label="add row at bottom"
        >
          +
        </div>
      </div>
    </div>
  );
}
