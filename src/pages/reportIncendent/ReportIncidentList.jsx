import { Box, Tab, Tabs, Paper, Chip } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CardHeading from '../../components/common/CardHeading';
import ReusableDataTable from '../../components/common/ReusableDataTable';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { IconButton, Tooltip } from "@mui/material";
import { toast } from 'react-toastify';

import {
  reportincedentgetlist,
  viewdetailsprofileget
} from "../../services/reportincedentservice";
import Loader from '../../components/common/Loader';
import { encryptPayload } from '../../crypto/encryption';

const ReportIncidentList = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isloading, setIsLoading] = useState(false);
  const [incidentData, setIncidentData] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();


  const getTableData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await reportincedentgetlist();
      if (res.data && res.data.outcome) {
        const apiData = res.data.data || [];
        setIncidentData(apiData);
      } else {
        
        setIncidentData([]);
      }
    } catch (err) {
      console.error("Error fetching incident list:", err);
      toast.error("Failed to fetch incident list");
    } finally {
      setIsLoading(false);
    }
  }, []);

  
  useEffect(() => {
    
    const stateTab = location?.state?.defaultTab ?? location?.state?.activeTab;
    if (typeof stateTab === 'number') {
      setActiveTab(stateTab);
      
      navigate(location.pathname, { replace: true, state: {} });
    }
    getTableData();
   
  }, [location, navigate, getTableData]); 

 
  const getStatusChip = (status) => {
    const statusConfig = {
      PENDING: { color: 'warning', label: 'Pending' },
      RESOLVE: { color: 'success', label: 'Resolve' },
      REJECT: { color: 'error', label: 'Reject' },
    };

    const config = statusConfig[status?.toUpperCase()] || { color: 'default', label: status };
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        variant="filled"
      />
    );
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleViewDetails = async (row) => {
    try {
      setIsLoading(true);
      const payload = row;
      const encryptedPayload = encryptPayload(payload);
      const response = await viewdetailsprofileget(encryptedPayload);
      if (response.data && response.data.outcome) {
        navigate("/reportincedentdetails", {
          state: { incidentData: response.data.data },
        });
      } else {
        toast.error("Failed to fetch incident details");
      }
    } catch (err) {
      console.error("Error fetching incident details:", err);
      toast.error("Failed to fetch incident details");
    } finally {
      setIsLoading(false);
    }
  };

  const commonColumns = [
    {
      name: 'SI No',
      selector: (row, index) => index + 1,
      sortable: true,
      width: '100px',
      center: true,
    },
    {
      name: 'Registration User Name',
      selector: row => row.registrationUserName,
      sortable: true,
      width: '220px',
    },
    {
      name: 'User Type Name',
      selector: row => row.userTypeName,
      sortable: true,
      width: '170px',
    },
    {
      name: 'college Name',
      selector: row => row.collegeName,
      sortable: true,
      width: '300px',
    },
    {
      name: 'mobile Number',
      selector: row => row.mobileNumber,
      sortable: true,
      width: '170px',
    },
    {
      name: 'Incident Type',
      selector: row => row.incidentType === 'Any Other' ? row.otherIncidentname : row.incidentType,
      sortable: true,
      width: '150px',
    },
    {
      name: 'Incident Date',
      selector: row => formatDate(row.incidentTimeTimestamp),
      sortable: true,
      width: '200px',
    },
    {
      name: 'Reported On',
      selector: row => formatDate(row.incidentReportedOnTimestamp),
      sortable: true,
      width: '200px',
    },
    {
      name: 'Location',
      selector: row => row.location || 'N/A',
      sortable: true,
      width: '150px',
    },
    {
      name: 'Status',
      cell: (row) => getStatusChip(row.status),
      sortable: true,
      center: true
    },
    {
      name: "Actions",
      cell: (row) => (
        <Tooltip title="View Details">
          <IconButton
            onClick={() => handleViewDetails(row.reportIncidentDetailsId)}
            color="primary"
            size="small"
            sx={{
              backgroundColor: "#e3f2fd",
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "#bbdefb",
                transform: "scale(1.1)",
                transition: "0.2s ease-in-out",
              },
            }}
          >
            <RemoveRedEyeIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      center: true
    }
  ];

  const getFilteredData = () => {
    switch (activeTab) {
      case 0:
        return incidentData.filter(item => item.status?.toUpperCase() === 'PENDING');
      case 1:
        return incidentData.filter(item => item.status?.toUpperCase() === 'RESOLVE');
      case 2:
        return incidentData.filter(item => item.status?.toUpperCase() === 'REJECT');
      default:
        return [];
    }
  };

  const getTabCounts = () => {
    const pendingCount = incidentData.filter(item => item.status?.toUpperCase() === 'PENDING').length;
    const approvedCount = incidentData.filter(item => item.status?.toUpperCase() === 'RESOLVE').length;
    const revertedCount = incidentData.filter(item => item.status?.toUpperCase() === 'REJECT').length;
    return { pendingCount, approvedCount, revertedCount };
  };

  const { pendingCount, approvedCount, revertedCount } = getTabCounts();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tableCustomStyles = {
    headCells: {
      style: {
        backgroundColor: '#f5f5f5',
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#333',
      },
    },
    rows: {
      style: {
        fontSize: '14px',
        '&:hover': {
          backgroundColor: '#f8f9fa',
        },
      },
    },
  };

  return (
    <>
      {isloading && <Loader />}
      <Box
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          backgroundColor: "white",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          minHeight: '500px',
        }}
      >
        <CardHeading props={"Report Incident List"} />

        <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, backgroundColor: 'transparent' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="incident report tabs"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '14px',
                minWidth: 120,
                color: 'text.secondary',
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 600,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
                height: 3,
              },
            }}
          >
            <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>Pending<Chip label={pendingCount} size="small" color="warning" variant="filled" sx={{ height: 20, minWidth: 20, fontSize: '0.75rem' }} /></Box>} />
            <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>Resolve<Chip label={approvedCount} size="small" color="success" variant="filled" sx={{ height: 20, minWidth: 20, fontSize: '0.75rem' }} /></Box>} />
            <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>Reject<Chip label={revertedCount} size="small" color="error" variant="filled" sx={{ height: 20, minWidth: 20, fontSize: '0.75rem' }} /></Box>} />
          </Tabs>
        </Paper>

        <Box sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <ReusableDataTable
            columns={commonColumns}
            data={getFilteredData()}
            pagination
            highlightOnHover
            striped
            responsive
            customStyles={tableCustomStyles}
            noDataComponent={
              <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                No incidents found for {activeTab === 0 ? 'Pending' : activeTab === 1 ? 'Approved' : 'Revert'} status.
              </Box>
            }
          />
        </Box>
      </Box>
    </>
  );
};

export default ReportIncidentList;
