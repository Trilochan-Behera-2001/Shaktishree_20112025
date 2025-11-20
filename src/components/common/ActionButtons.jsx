
import { Tooltip, IconButton } from "@mui/material";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import { TbEdit } from "react-icons/tb";

const ActionButtons = ({
  row,
  onEdit,
  onToggleStatus,
  showEdit = true,        
  showToggle = true,     
  editDisabled = false,
  scrollToForm = false,     
}) => {
  // Enhanced edit handler with scroll functionality
  const handleEditClick = (row) => {
 
    onEdit(row);
    
   
 
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >

      {showEdit && (
        <Tooltip title="Edit">
          <span>
            <IconButton
              size="small"
              onClick={() => scrollToForm ? handleEditClick(row) : onEdit(row)} // Use enhanced handler if scroll enabled
              disabled={editDisabled}
              sx={{
                backgroundColor: editDisabled ? "#725d5d9c" : "#1976d2",
                color: "#fff",
                borderRadius: "8px",
                width: "28px",
                height: "28px",
                cursor: editDisabled ? "not-allowed" : "pointer",
                "&.Mui-disabled": {
                  backgroundColor: "#725d5d9c",
                  color: "#fff",
                },
                "&:hover": {
                  backgroundColor: editDisabled ? "#725d5d9c" : "#1565c0",
                },
              }}
            >
              <TbEdit style={{ fontSize: 16 }} />
            </IconButton>
          </span>
        </Tooltip>
      )}

     
      {showToggle && (
        <Tooltip title={row.isActive ? "Deactivate" : "Activate"}>
          <IconButton
            size="small"
            onClick={() => onToggleStatus(row)}
            sx={{
              width: "42px",
              height: "42px",
              color: row.isActive ? "#4caf50" : "#f44336",
            }}
          >
            {row.isActive ? (
              <ToggleOnIcon fontSize="large" />
            ) : (
              <ToggleOffIcon fontSize="large" />
            )}
          </IconButton>
        </Tooltip>
      )}
    </div>
  );
};

export default ActionButtons;