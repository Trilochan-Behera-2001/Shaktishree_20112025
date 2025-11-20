import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, IconButton, Box } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const ReusableDialog = ({ open, title, description, onClose, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: 3,
          width: 480,
          maxWidth: '90vw',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid rgba(255,255,255,0.8)',
          overflow: 'hidden',
          position: 'relative',
         
        },
      }}
    >
     
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: '1.375rem',
          color: '#1a237e',
          background: 'rgba(25, 118, 210, 0.02)',
          borderBottom: '1px solid rgba(25, 118, 210, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 1,
          paddingRight: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 ,fontSize:'1.25rem'}}>  
          <Box
          
          />
          {title}
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{
            color: '#666',
            padding: '8px',
            transition: 'all 0.2s ease',
            '&:hover': {
              color: '#dc1919ff',
              backgroundColor: 'rgba(218, 43, 81, 0.08)',
              transform: 'scale(1.1)',
            }
          }}
        >
          <CloseIcon sx={{ fontSize: '1.25rem' }} />
        </IconButton>
      </DialogTitle>

    
      <DialogContent sx={{ px: 3,  }}>
        <DialogContentText 
          sx={{ 
            fontSize: '17px', 
            color: '#424242',
            lineHeight: 1.6,
            textAlign: 'left',
            px: 1,
            py: 1.5,
          }}
        >
          {description}
        </DialogContentText>
      </DialogContent>

     
      <DialogActions 
        sx={{ 
          px: 3, 
          pb: 2, 
        }}
      >
        <Button 
          onClick={onClose} 
          color="error" 
          variant="contained"
          size="small"
          // sx={{ 
          //   borderRadius: 2.5,
          //   textTransform: 'none',
          //   px: 2,
          //   py: 1,
          //   fontWeight: 600,
          //   border: '1.5px solid #e0e0e0',
          //   color: '#666',
          //   transition: 'all 0.3s ease',
          //   '&:hover': {
          //     border: '1.5px solid #d32f2f',
          //     color: '#d32f2f',
          //     backgroundColor: 'rgba(211, 47, 47, 0.04)',
          //     transform: 'translateY(-1px)',
          //     boxShadow: '0 4px 12px rgba(211, 47, 47, 0.1)',
          //   }
          // }}
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained"
          color="primary"
          size="small"
          // sx={{ 
          //   borderRadius: 2.5,
          //   textTransform: 'none',
          //   px: 2,
          //   py: 1,
          //   fontWeight: 600,
          //   background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
           
          //   transition: 'all 0.3s ease',
          //   '&:hover': {
          //     background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
             
          //     transform: 'translateY(-1px)',
          //   }
          // }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReusableDialog;