import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  Checkbox,
  FormControlLabel,
  Divider,
  Grid,
  Alert,
} from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";

const Instructions = () => {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("countdownCompleted") !== "true") {
      navigate("/");
    } else {
      localStorage.setItem("instructionsVisited", "true");
    }
  }, [navigate]);

  useEffect(() => {
    window.history.pushState(null, null, window.location.href);
    const handleBack = () => navigate("/dashboard");
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, [navigate]);

  const handleStartTest = () => {
    if (isAgreed) navigate(`/test/${testId}`);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" color="primary" align="center" gutterBottom>
          General Instructions
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          Please read all instructions carefully before proceeding.
        </Alert>

        <Typography variant="body1" paragraph>
          The test duration is 180 minutes. The countdown timer will display the remaining time.
        </Typography>
        <Typography variant="body1" paragraph>
          When the timer reaches zero, the test will end automatically.
        </Typography>

        <Typography variant="h6" color="primary" gutterBottom>
          Important Notes:
        </Typography>
        <List>
          <ListItem>
            <InfoOutlined color="primary" sx={{ mr: 1 }} /> Use the question palette to navigate.
          </ListItem>
          <ListItem>
            <InfoOutlined color="primary" sx={{ mr: 1 }} /> Save answers using "Save & Next."
          </ListItem>
          <ListItem>
            <InfoOutlined color="primary" sx={{ mr: 1 }} /> Mark questions for review if unsure.
          </ListItem>
          <ListItem>
            <InfoOutlined color="primary" sx={{ mr: 1 }} /> Do not use the back button, as responses won't be saved.
          </ListItem>
        </List>

        <Divider sx={{ my: 2 }} />

        <FormControlLabel
          control={<Checkbox checked={isAgreed} onChange={(e) => setIsAgreed(e.target.checked)} color="primary" />}
          label="I have read and understood the instructions."
        />

        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button variant="contained" size="large" onClick={handleStartTest} disabled={!isAgreed}>
            Start Test
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Instructions;
