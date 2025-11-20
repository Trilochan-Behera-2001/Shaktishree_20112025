
import DataTable from "react-data-table-component";

const ReusableDataTable = ({ data, columns }) => {
  const customStyles = {
    table: {
      style: {
        border: "1px solid #b7e7faff",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#f5f5f5",
        borderBottom: "2px solid #b7e7faff",
      }, 
    },
    headCells: {
      style: {
        fontWeight: "bold",
        fontSize: "14px",
        textAlign: "center", 
        borderRight: "1px solid #b7e7faff",
         position: "sticky",
      },
    },
    rows: {
      style: {
        fontSize: "14px",
        borderBottom: "1px solid #b7e7faff",
        "&:last-of-type": {
          borderBottom: 0,
        },
      },
    },
    cells: {
      style: {
        borderRight: "1px solid #b7e7faff",
        textAlign: "left",
        padding: "8px 12px",
      },
    },
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      highlightOnHover
      pointerOnHover
      striped
      responsive
      noHeader
      fixedHeader          
      fixedHeaderScrollHeight="550px" 
      customStyles={customStyles}
    />
  );
};

export default ReusableDataTable;
