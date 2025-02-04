import React, { useState } from "react";
import { Box, Typography, Button, IconButton, MenuItem, Select, FormControl as MUIFormControl } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Subheader = ({ handleSubjectClick, setIsDrawerOpen }) => {
  const [language, setLanguage] = useState("english"); // Default language is English
  
  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
    // You can add logic here to switch the app's language using i18n or context
  };

  return (
    <Box sx={{
      p: { xs: 1, sm: 1 },
      backgroundColor: "orange",
      display: "flex",
      flexDirection: { xs: 'column', sm: 'row' }, // Adjusted to stack vertically on small screens
      alignItems: 'center',
      gap: { sm: 5 },
      width: '100%',
      position: 'relative', // This prevents overlapping by setting positioning context
    }}>
      <Typography sx={{
        fontWeight: "bold",
        color: "white",
        fontSize: { xs: '1.2rem', sm: '2rem' },
        textAlign: 'center',
        whiteSpace: "nowrap",
        display:{xs:'none', sm:'block'}
      }}>
        JEE MAIN
      </Typography>

      <Box sx={{
        display: "flex",
        gap: 1,
        flexWrap: { xs: "wrap", sm: "nowrap" }, // Make sure subjects wrap on smaller screens
        justifyContent: 'center',
        order: { xs: 2, sm: 0 }
      }}>
        {/* Subject buttons */}
        {["Physics", "Chemistry", "Mathematics"].map((subject) => (
          <Button
            key={subject}
            variant="contained"
            sx={{
              backgroundColor: "#1e6ead",
              borderRadius: 0,
              fontSize: { xs: '0.6rem', sm: '0.875rem' },
              px: { xs: 1, sm: 2 },
              py: { xs: 0.5, sm: 1 },
            }}
            onClick={() => handleSubjectClick(subject)}
          >
            {subject}
          </Button>
        ))}

        <Box sx={{ display: { xs: 'block', md: 'none' }, marginLeft:"auto",alignItems: 'center', marginBottom:"1px" }}>
          <IconButton onClick={() => setIsDrawerOpen(true)}>
            <MenuIcon sx={{ color: 'black' }} />
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
            height: '40px',
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
