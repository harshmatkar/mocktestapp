import React, { useState } from "react";
import { Box, Typography, Button, IconButton, MenuItem, Select, FormControl as MUIFormControl } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Subheader = ({ handleSubjectClick, setIsDrawerOpen , handlesubmitclick}) => {
  const [language, setLanguage] = useState("english"); // Default language is English
  
  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
    // You can add logic here to switch the app's language using i18n or context
  };

  return (
    <Box sx={{
      p: { xs: 0.5, sm: 1 }, // Reduced padding for mobile
      backgroundColor: "orange",
      display: "flex",
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: 'center',
      gap: { sm: 5 },
      width: '100%',
      position: 'relative',
      minHeight: { xs: '40px', sm: 'auto' } // Reduced height for mobile
    }}>
      <Typography sx={{
        fontWeight: "bold",
        color: "white",
        fontSize: { xs: '1rem', sm: '2rem' }, // Slightly reduced font size for mobile
        textAlign: 'center',
        whiteSpace: "nowrap",
        display:{xs:'none', sm:'block'}
      }}>
        JEE MAIN
      </Typography>

      <Box
  sx={{
    display: "flex",
    flexWrap: { xs: "wrap", sm: "nowrap" },
    justifyContent: "space-between", // Ensures proper spacing
    alignItems: "center",
    order: { xs: 2, sm: 0 },
    height: { xs: "auto", sm: "40px" }, // Auto height for wrapping on mobile
    paddingTop: { xs: "1px", sm: "0" },
    gap: 1, // Space between elements
  }}
>
  {/* Subject Buttons */}
  <Box
    sx={{
      display: "flex",
      gap: 1,
      flexWrap: { xs: "wrap", sm: "nowrap" },
      justifyContent: "center",
    }}
  >
    {["Physics", "Chemistry", "Mathematics"].map((subject) => (
      <Button
        key={subject}
        variant="contained"
        sx={{
          backgroundColor: "#1e6ead",
          borderRadius: 0,
          fontSize: { xs: "0.55rem", sm: "0.875rem" }, // Adjusted for mobile & desktop
          px: { xs: 1, sm: 2 },
          py: { xs: 0.5, sm: 1 },
          height: { xs: "28px", sm: "40px" },
        }}
        onClick={() => handleSubjectClick(subject)}
      >
        {subject}
      </Button>
    ))}
  </Box>

  <Button
        variant="contained"
        sx={{
          backgroundColor: "#9e6ead",
          borderRadius: 0,
          fontSize: { xs: "0.55rem", sm: "0.875rem" }, // Adjusted for mobile & desktop
          px: { xs: 1, sm: 2 },
          py: { xs: 0.5, sm: 1 },
          height: { xs: "28px", sm: "40px" },
          
        }}
        onClick={() => handlesubmitclick()}
      >
        SUBMIT
      </Button>
  {/* Menu Icon Button (only for mobile) */}
  <Box
    sx={{
      display: { xs: "flex", md: "none" },
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <IconButton onClick={() => setIsDrawerOpen(true)}>
      <MenuIcon sx={{ color: "black" }} />
    </IconButton>
  </Box>
</Box>



      <MUIFormControl
        variant="outlined"
        sx={{
          width: { xs: '100%', sm: '300px' },
          order: { xs: 1, sm: 0 },
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'white',
            height: { xs: '35px', sm: '40px' } // Reduced input height for mobile
          },
        }}
      >
        <Select
          value={language}
          onChange={handleLanguageChange}
          sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' }, justifyContent: 'flex-end', width: '150px', display: { xs: 'none', sm:'block' }}}
        >
          <MenuItem value="english" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
            English
          </MenuItem>
          <MenuItem value="hindi" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
            Hindi
          </MenuItem>
          <MenuItem value="marathi" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
            Marathi
          </MenuItem>
        </Select>
      </MUIFormControl>
</Box>

  );
};

export default Subheader;
