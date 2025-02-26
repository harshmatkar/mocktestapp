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
      flexDirection: "row",
      alignItems: "flex-start",
      gap: { xs: 3, sm: 0 },
      py: { xs: 1, sm: 0 },
      width: "100vw",
      display: { xs: "none", sm: "flex" }, // Hide this full header on mobile
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

    <Box sx={{ textAlign: "right", flexGrow: 1, ml: { xs: 0, sm: 2 } }}>
      <Typography variant="subtitle1" sx={{ fontSize: { xs: "0.8rem", sm: "1rem" }, display: { xs: "none", sm: "block" } }}>
        Candidate: XYZ
      </Typography>
      <Typography variant="subtitle2" sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" }, display: { xs: "none", sm: "block" } }}>
        Exam: JEE ADVANCE
      </Typography>
      <Typography
        variant="body2"
        color={remainingTime <= 600 ? "error" : "textSecondary"}
        sx={{ fontSize: { xs: "0.7rem", sm: "0.875rem" }, display: { xs: "none", sm: "block" } }}
      >
        Time Remaining: {formatTime(remainingTime)}
      </Typography>
    </Box>
  </Toolbar>

  {/* Mobile Header (Visible only on small screens) */}
  <Box
    sx={{
      display: { xs: "flex", sm: "none" }, // Only show on xs screens
      justifyContent: "space-between",
      alignItems: "center",
      minHeight: "40px", // Minimum height required
      px: 2, // Padding for spacing
      backgroundColor: "white",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    }}
  >
     <img src={logo} alt="NTA Logo" style={{ height: "35px", marginRight: 4 }} />
    <Typography variant="subtitle2" sx={{ fontSize: "0.8rem", fontWeight: "bold"}} className="text-blue-600">
     JEE MAINS
    </Typography>
    <Typography
      variant="body2"
      color={remainingTime <= 600 ? "error" : "textSecondary"}
      sx={{ fontSize: "0.8rem", fontWeight: "bold" }}
    >
      Time Remaining: {formatTime(remainingTime)}
    </Typography>
  </Box>
</AppBar>

  );
};

export default Header;
