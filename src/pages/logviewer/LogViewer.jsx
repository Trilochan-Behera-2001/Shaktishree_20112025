import { useState, useRef, useEffect } from "react";
import { 
  Button, 
  Paper, 
  Typography, 
  Box, 
  Chip,
  IconButton,
  Tooltip,
  Alert,
  LinearProgress
} from "@mui/material";
import {
  Refresh,
  Clear,
  Download,
  Home,
  Code,
  Storage,
  AutoFixHigh,
  ContentCopy
} from "@mui/icons-material";
import {
  getlogviewerlist,
  getcatloglist,
  downloadlog,
  downloadcatlog
} from "../../services/LogViewerService";
import { toast } from "react-toastify";

const LogViewer = () => {
  const [logData, setLogData] = useState("");
  const [catalinaLogData, setCatalinaLogData] = useState("");
  const [activeLog, setActiveLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const logEndRef = useRef(null);
 
  const fetchLog = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getlogviewerlist(); 
      setLogData(response.data);
      setActiveLog("application");
    } catch (error) {
      console.error("Error fetching log data:", error);
      setError("Failed to fetch application logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalinaLog = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getcatloglist(); 
      setCatalinaLogData(response.data);
      setActiveLog("catalina");
    } catch (error) {
      console.error("Error fetching Catalina log:", error);
      setError("Failed to fetch Catalina logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLog();
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  });

  const clearConsole = () => {
    setLogData("");
    setCatalinaLogData("");
    setActiveLog(null);
    setError(null);
  };

  const copyToClipboard = async () => {
    const textToCopy = activeLog === "application" ? logData : catalinaLogData;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };




const handleDownload = async (apiFunc) => {
  try {
    const response = await apiFunc();
    const contentDisposition = response.headers["content-disposition"];
    let filename = "log.txt";

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      if (match && match[1]) filename = match[1];
    }

    const blob = new Blob([response.data], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    toast.success(`Downloaded: ${filename}`);
  } catch (err) {
    console.error("Error downloading log file:", err);
    toast.error("Failed to download log file");
  }
};




  const formatLogEntry = (logText) => {
    if (!logText) return [];
    
    return logText.split('\n').map((line, index) => {
      let style = {};
      if (line.includes('ERROR') || line.includes('error')) {
        style = { color: '#f44336', backgroundColor: '#ffebee', fontWeight: 'bold' };
      } else if (line.includes('WARN') || line.includes('warning')) {
        style = { color: '#ff9800', backgroundColor: '#fff3e0' };
      } else if (line.includes('INFO') || line.includes('info')) {
        style = { color: '#2196f3' };
      } else if (line.includes('DEBUG') || line.includes('debug')) {
        style = { color: '#9c27b0' };
      }
      
      return (
        <div key={index} style={{ ...style, padding: '2px 0', fontFamily: 'Monaco, Consolas, monospace' }}>
          {line}
        </div>
      );
    });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
 
      <Paper
        elevation={6}
        sx={{
          padding: 3,
          marginBottom: 3,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <AutoFixHigh sx={{ fontSize: 28 , color: "primary.main" }} />
            <Typography variant="h5" sx={{ 
              fontWeight: "bold", 
              background: "linear-gradient(45deg, #667eea, #764ba2)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent"
            }}>
              Log Viewer
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => window.location.href = "/home"}
            sx={{
              background: "linear-gradient(45deg, #667eea, #764ba2)",
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: "bold",
              boxShadow: "0 4px 15px 0 rgba(0,0,0,0.1)",
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px 0 rgba(0,0,0,0.15)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            Go To Home
          </Button>
        </Box>

        {/* Log Type Chips */}
        <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<Code />}
            label="Application Log"
            onClick={fetchLog}
            variant={activeLog === "application" ? "filled" : "outlined"}
            color={activeLog === "application" ? "primary" : "default"}
            sx={{ fontWeight: "bold" }}
          />
          <Chip
            icon={<Storage />}
            label="Catalina Log"
            onClick={fetchCatalinaLog}
            variant={activeLog === "catalina" ? "filled" : "outlined"}
            color={activeLog === "catalina" ? "primary" : "default"}
            sx={{ fontWeight: "bold" }}
          />
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Paper
        elevation={4}
        sx={{
          padding: 2,
          marginBottom: 3,
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Tooltip title="Refresh current log">
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={activeLog === "application" ? fetchLog : fetchCatalinaLog}
              sx={buttonStyle}
            >
              Refresh
            </Button>
          </Tooltip>
          
          <Tooltip title="Clear console">
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={clearConsole}
              sx={{ ...buttonStyle, background: 'transparent', border: '2px solid' }}
            >
              Clear
            </Button>
          </Tooltip>

          <Tooltip title="Copy to clipboard">
            <Button
              variant="outlined"
              startIcon={<ContentCopy />}
              onClick={copyToClipboard}
              sx={{ ...buttonStyle, background: 'transparent', border: '2px solid' }}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </Tooltip>

        <Tooltip title="Download Application Log">
  <Button
    variant="contained"
    startIcon={<Download />}
    onClick={() => handleDownload(downloadlog)}
    sx={buttonStyle}
  >
    Download App Log
  </Button>
</Tooltip>

<Tooltip title="Download Catalina Log">
  <Button
    variant="contained"
    startIcon={<Download />}
    onClick={() => handleDownload(downloadcatlog)}
    sx={buttonStyle}
  >
    Download Cat Log
  </Button>
</Tooltip>

         
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Log Content */}
      <Paper
        elevation={6}
        sx={{
          flex: 1,
          padding: 3,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          minHeight: '500px'
        }}
      >
        {/* Loading Indicator */}
        {loading && (
          <LinearProgress 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0,
              borderTopLeftRadius: 3,
              borderTopRightRadius: 3
            }} 
          />
        )}

        {/* Log Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "text.primary" }}>
            {activeLog === "application" ? "Application Log" : 
             activeLog === "catalina" ? "Catalina Log" : "Log Console"}
          </Typography>
          
          {activeLog && (
            <Tooltip title="Auto-scroll to bottom">
              <IconButton 
                size="small" 
                onClick={() => logEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                sx={{ color: 'primary.main' }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* Log Content */}
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            padding: 2,
            backgroundColor: "#1e1e1e",
            color: "#d4d4d4",
            fontFamily: "'Monaco', 'Consolas', 'Monaco', monospace",
            fontSize: "0.875rem",
            lineHeight: 1.5,
            overflow: "auto",
            borderRadius: 2,
            position: "relative",
            minHeight: '400px'
          }}
        >
          {activeLog === "application" && (
            <Box sx={logContentStyle}>
              {formatLogEntry(logData)}
              <div ref={logEndRef} />
            </Box>
          )}

          {activeLog === "catalina" && (
            <Box sx={logContentStyle}>
              {formatLogEntry(catalinaLogData)}
              <div ref={logEndRef} />
            </Box>
          )}

          {!activeLog && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: '#888',
              flexDirection: 'column',
              gap: 2
            }}>
              <Code sx={{ fontSize: 48 }} />
              <Typography variant="h6" align="center">
                Select a log type to view logs
              </Typography>
              <Typography variant="body2" align="center" color="#aaa">
                Use the buttons above to fetch application or Catalina logs
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Status Bar */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mt: 1,
          px: 1,
          fontSize: '0.75rem',
          color: '#666'
        }}>
          <span>
            {activeLog && `Viewing: ${activeLog} logs`}
          </span>
          <span>
            {activeLog && `Lines: ${(activeLog === "application" ? logData : catalinaLogData).split('\n').length}`}
          </span>
        </Box>
      </Paper>
    </Box>
  );
};

const buttonStyle = {
  borderRadius: 2,
  px: 3,
  py: 1,
  fontWeight: "bold",
  background: "linear-gradient(45deg, #667eea, #764ba2)",
  boxShadow: "0 2px 10px 0 rgba(0,0,0,0.1)",
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 15px 0 rgba(0,0,0,0.15)',
  },
  transition: 'all 0.2s ease'
};

const logContentStyle = {
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  '& div': {
    borderLeft: '3px solid transparent',
    paddingLeft: '8px',
    margin: '2px 0',
  },
  '& div:hover': {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderLeftColor: '#555',
  }
};

export default LogViewer;