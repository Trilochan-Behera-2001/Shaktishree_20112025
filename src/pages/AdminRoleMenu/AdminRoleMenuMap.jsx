import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Button,
  IconButton,
  Collapse,
  Paper,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Remove,
  Folder,
  FolderOpen,
  Group,
  Dashboard,
  Settings,
  Check,
  Info,
} from "@mui/icons-material";
import {
  adminrolelist,
  getAssignedMenu,
  saveAdminRoleMenu,
} from "../../services/AdminRoleMenuServices";
import { toast } from "react-toastify";
import Loader from "../../components/common/Loader";
import { useQueryClient } from "@tanstack/react-query";

const AdminRoleMenuMap = () => {
  const queryClient = useQueryClient();
  const [roleList, setRoleList] = useState([]);
  const [role, setRole] = useState("");
  const [menuData, setMenuData] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [checked, setChecked] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Role List
  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoading(true);
      try {
        const res = await adminrolelist();
        if (res?.data) setRoleList(res.data);
      } catch (err) {
        console.error("Failed to fetch roles:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoles();
  }, []);

  // Handle Role Change
  const handleRoleChange = async (event) => {
    const selectedRole = event.target.value;
    setRole(selectedRole);
    setMenuData([]);
    setExpanded({});
    setChecked({});

    if (!selectedRole) return;
    setIsLoading(true);
    try {
      const res = await getAssignedMenu(selectedRole);
      if (res?.data) {
        setMenuData(res.data);
        const preChecked = {};
        const markChecked = (items) => {
          items.forEach((item) => {
            if (item.selected) preChecked[item.id] = true;
            if (item.children?.length) markChecked(item.children);
          });
        };
        markChecked(res.data);
        setChecked(preChecked);
      }
    } catch (err) {
      console.error("Failed to fetch assigned menus:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Expand / Collapse
  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  // Check if any child is checked
  const isAnyChildChecked = (children, newChecked) => {
    return children.some(
      (child) =>
        newChecked[child.id] ||
        (child.children?.length && isAnyChildChecked(child.children, newChecked))
    );
  };

  // Update parent check state
  const updateParentState = (items, id, newChecked) => {
    for (const item of items) {
      if (item.children?.some((child) => child.id === id)) {
        const anyChildChecked = isAnyChildChecked(item.children, newChecked);
        newChecked[item.id] = anyChildChecked;
      } else if (item.children?.length) {
        updateParentState(item.children, id, newChecked);
        const anyChildChecked = isAnyChildChecked(item.children, newChecked);
        newChecked[item.id] = anyChildChecked;
      }
    }
  };

  // Handle Checkbox
  const handleCheck = (id, children, ) => {
    setChecked((prev) => {
      const newChecked = { ...prev };
      const isChecked = !prev[id];
      newChecked[id] = isChecked;

      if (children && children.length > 0) {
        const toggleChildren = (list, state) => {
          list.forEach((child) => {
            newChecked[child.id] = state;
            if (child.children?.length) toggleChildren(child.children, state);
          });
        };
        toggleChildren(children, isChecked);
      }

      updateParentState(menuData, id, newChecked);
      return newChecked;
    });
  };

  // Save Assignments
  const handleAssign = async () => {
    if (!role) {
      toast.error("Please select a role first!");
      return;
    }

    const selectedMenuIds = Object.keys(checked)
      .filter((key) => checked[key])
      .map((id) => Number(id));

    if (selectedMenuIds.length === 0) {
      toast.error("Please select at least one menu!");
      return;
    }

    const payload = {
      menuIds: selectedMenuIds,
      roleCode: role,
    };

    try {
      setIsLoading(true);
      const res = await saveAdminRoleMenu(payload);
      if (res?.status === 200 || res?.data?.success) {
        toast.success("Menus assigned successfully!");
        queryClient.invalidateQueries(["menuListAll"]);
      } else {
        toast.error("Failed to assign menus.");
      }
    } catch (err) {
      console.error("Error while saving:", err);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  // Get selected count
  const selectedCount = Object.values(checked).filter(Boolean).length;

  // Render Menu Tree Rows
  const renderRows = (data, level = 0) =>
    data.map((item) => {
      const isChecked = !!checked[item.id];
      const hasChildren = item.children && item.children.length > 0;

      return (
        <React.Fragment key={item.id}>
          <TableRow
            sx={{
              backgroundColor: isChecked
                ? "rgba(46, 125, 50, 0.08)"
                : level === 1
                ? "rgba(0, 0, 0, 0.02)"
                : "transparent",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: isChecked
                  ? "rgba(46, 125, 50, 0.12)"
                  : "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <TableCell width="60px" align="center">
              <Checkbox
                checked={isChecked}
                onChange={() => handleCheck(item.id, item.children, data)}
                sx={{
                  p: "8px",
                  borderRadius: 1,
                  "& .MuiSvgIcon-root": {
                    fontSize: "20px",
                    borderRadius: "4px",
                  },
                  "&.Mui-checked": {
                    color: "success.main",
                  },
                }}
              />
            </TableCell>

            <TableCell sx={{ pl: `${level * 24 + 16}px` }}>
              <Box display="flex" alignItems="center" gap={1.5}>
                {hasChildren && (
                  <Tooltip title={expanded[item.id] ? "Collapse" : "Expand"}>
                    <IconButton
                      size="small"
                      onClick={() => toggleExpand(item.id)}
                      sx={{
                        p: "6px",
                        borderRadius: "8px",
                        backgroundColor: "rgba(25, 118, 210, 0.08)",
                        color: "primary.main",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          backgroundColor: "rgba(25, 118, 210, 0.12)",
                          transform: "scale(1.05)",
                        },
                      }}
                    >
                      {expanded[item.id] ? (
                        <Remove fontSize="small" />
                      ) : (
                        <Add fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                )}
                
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: hasChildren
                      ? "primary.main"
                      : "grey.400",
                    color: "white",
                    fontSize: "14px",
                  }}
                >
                  {hasChildren ? <Folder /> : <FolderOpen />}
                </Avatar>

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: hasChildren ? 600 : 400,
                    color: hasChildren ? "text.primary" : "text.secondary",
                    fontSize: "14px",
                  }}
                >
                  {item.title}
                </Typography>

                {isChecked && (
                  <Chip
                    size="small"
                    label="Selected"
                    color="success"
                    variant="outlined"
                    sx={{
                      ml: 1,
                      height: 20,
                      fontSize: "10px",
                      "& .MuiChip-label": { px: 1 },
                    }}
                  />
                )}
              </Box>
            </TableCell>

            <TableCell>
              <Typography
                variant="body2"
                sx={{
                  fontSize: "13px",
                  color: item.url === "#" ? "text.disabled" : "text.secondary",
                  fontFamily: "monospace",
                  backgroundColor:
                    item.url !== "#" ? "rgba(0, 0, 0, 0.04)" : "transparent",
                  px: item.url !== "#" ? 1 : 0,
                  py: item.url !== "#" ? 0.5 : 0,
                  borderRadius: 1,
                }}
              >
                {item.url === "#" ? "—" : item.url}
              </Typography>
            </TableCell>
          </TableRow>

          {hasChildren && (
            <TableRow>
              <TableCell colSpan={3} sx={{ py: 0, border: "none" }}>
                <Collapse in={expanded[item.id]} timeout="auto" unmountOnExit>
                  <Box sx={{ pl: 2, borderLeft: "2px solid #e0e0e0", ml: 2 }}>
                    <Table size="small">
                      <TableBody>{renderRows(item.children, level + 1)}</TableBody>
                    </Table>
                  </Box>
                </Collapse>
              </TableCell>
            </TableRow>
          )}
        </React.Fragment>
      );
    });

  return (
    <>
      {isLoading && <Loader />}

      

      {/* Main Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        {/* Progress Bar */}
        {isLoading && (
          <LinearProgress
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1,
            }}
          />
        )}

        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            p: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Configure Role Permissions
          </Typography>
          
          <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
            <Box display="flex" alignItems="center" gap={2}>
              <Group sx={{ opacity: 0.8 }} />
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Role Selection
              </Typography>
              <FormControl
                size="small"
                sx={{
                  minWidth: 280,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.7)",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "rgba(255, 255, 255, 0.8)",
                  },
                  "& .MuiSelect-icon": {
                    color: "rgba(255, 255, 255, 0.8)",
                  },
                }}
              >
                <InputLabel>Select Role</InputLabel>
                <Select value={role} onChange={handleRoleChange} label="Select Role">
                  <MenuItem value="">
                    <em>Choose a role...</em>
                  </MenuItem>
                  {roleList.map((item) => (
                    <MenuItem key={item.roleCode} value={item.roleCode}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            fontSize: "12px",
                            backgroundColor: "primary.main",
                          }}
                        >
                          {item.displayName.charAt(0)}
                        </Avatar>
                        {item.displayName}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {selectedCount > 0 && (
              <Chip
                icon={<Check />}
                label={`${selectedCount} items selected`}
                variant="filled"
                sx={{
                  backgroundColor: "rgba(76, 175, 80, 0.9)",
                  color: "white",
                  fontWeight: 500,
                }}
              />
            )}
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 0 }}>
          {menuData.length > 0 ? (
            <Paper elevation={0} sx={{ overflow: "hidden" }}>
              <Table
                sx={{
                  "& .MuiTableCell-root": {
                    borderBottom: "1px solid rgba(224, 224, 224, 0.5)",
                  },
                }}
              >
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "rgba(0, 0, 0, 0.02)",
                    }}
                  >
                    <TableCell
                      align="center"
                      width="80px"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        fontSize: "14px",
                      }}
                    >
                      <Tooltip title="Select/Deselect menu items">
                        <Box display="flex" alignItems="center" justifyContent="center">
                          <Check fontSize="small" sx={{ mr: 0.5 }} />
                          Select
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        fontSize: "14px",
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Dashboard fontSize="small" />
                        Menu Name
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        fontSize: "14px",
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Settings fontSize="small" />
                        Menu URL
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>{renderRows(menuData)}</TableBody>
              </Table>
            </Paper>
          ) : (
            role && (
              <Box
                sx={{
                  p: 8,
                  textAlign: "center",
                  color: "text.secondary",
                }}
              >
                <Info sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  No menu data available
                </Typography>
                <Typography variant="body2">
                  No menus found for the selected role. Please try a different role.
                </Typography>
              </Box>
            )
          )}
        </Box>

        {/* Footer Actions */}
        <Divider />
        <Box
          sx={{
            p: 3,
            backgroundColor: "rgba(0, 0, 0, 0.02)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Info fontSize="small" sx={{ color: "text.secondary" }} />
            <Typography variant="body2" color="text.secondary">
              {role
                ? `Managing permissions for: ${roleList.find(r => r.roleCode === role)?.displayName || role}`
                : "Please select a role to manage permissions"}
            </Typography>
          </Box>

          <Box display="flex" gap={2}>
            
            <Button
              variant="contained"
              color="success"
              onClick={handleAssign}
              disabled={isLoading || !role || selectedCount === 0}
              sx={{
                borderRadius: 2,
                px: 3,
                textTransform: "none",
                fontWeight: 500,
                background: "linear-gradient(45deg, #66bb6a, #4caf50)",
                "&:hover": {
                  background: "linear-gradient(45deg, #5cb85c, #449d48)",
                },
              }}
            >
              Assign Permissions
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                setChecked({});
                setExpanded({});
              }}
              disabled={isLoading}
              sx={{
                borderRadius: 2,
                px: 3,
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Clear All
            </Button>
          </Box>
        </Box>
      </Card>
    </>
  );
};

export default AdminRoleMenuMap;