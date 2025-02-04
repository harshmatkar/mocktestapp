import React, { useState } from "react";
import { AppBar, Toolbar, Box, Typography } from "@mui/material";
import { useUser } from '../UserContext';

const Header = ({ logo, remainingTime, formatTime }) => {
    const [language, setLanguage] = useState("en"); // Default language is English
    
  
  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
    // You can add logic here to switch the app's language using i18n or context
  };
  return (
    <AppBar position="static" color="white" elevation={1} sx={{ py: { xs: 1, sm: 0 } }}>
      <Toolbar
        sx={{
          flexDirection: { xs: "row", sm: "row" },
          alignItems: "flex-start",
          gap: { xs: 3, sm: 0 },
          py: { xs: 1, sm: 0 },
          width: '100vw' 
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: { xs: 40, sm: 80 },
            flexShrink: 0,
          }}
        >
          <img src={logo} alt="NTA Logo" style={{ height: "100%", marginRight: 8 }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", fontSize: { xs: "0.6rem", sm: "1.25rem" }, lineHeight: 1.2 }}
          >
            NATIONAL TESTING AGENCY
            <br />
            <span
              style={{
                backgroundColor: "green",
                color: "white",
                fontStyle: "italic",
                fontSize: "0.8rem",
              }}
            >
              Excellence in assessment.
            </span>
          </Typography>
        </Box>

        <Box sx={{ textAlign: { xs: "left", sm: "right" }, flexGrow: 1, ml: { xs: 0, sm: 2 } }}>
          <Typography variant="subtitle1" sx={{ fontSize: { xs: "0.8rem", sm: "1rem" }, }}>
            Candidate:XYZ
          </Typography>
          <Typography variant="subtitle2" sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } ,display:{xs:'none', sm:'block'}}}>
            Exam: JEE ADVANCE
          </Typography>
          <Typography
            variant="body2"
            color={remainingTime <= 600 ? "error" : "textSecondary"}
            sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
          >
            Time Remaining: {formatTime(remainingTime)}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
