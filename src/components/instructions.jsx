import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  AlertTitle,
  Checkbox,
  FormControlLabel,
  Divider,
  Grid,
} from '@mui/material';
import {
  CheckCircleOutline,
  InfoOutlined,
} from '@mui/icons-material';

const Instructions = () => {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => {
    const countdownCompleted = localStorage.getItem("countdownCompleted");
    if (countdownCompleted !== "true") {
      navigate("/"); // Redirect if countdown was skipped
    } else {
      localStorage.setItem("instructionsVisited", "true"); // Mark instructions as visited
    }
  }, [navigate]);

  const handleStartTest = () => {
    if (isAgreed) {
      navigate(`/test/${testId}`);
    }
  };

  useEffect(() => {
      window.history.pushState(null, null, window.location.href);
      window.addEventListener("popstate", () => {
        navigate("/dashboard"); // Redirect back to dashboard if back is pressed
      });
    
      return () => {
        window.removeEventListener("popstate", () => {});
      };
    }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" color="primary" gutterBottom align="center">
                GENERAL INSTRUCTIONS
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <AlertTitle>Important Notice</AlertTitle>
              Please read all instructions carefully before proceeding with the test.
            </Alert>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body1" paragraph>
              Total duration of JEE-Main - Paper 1 is 180 minutes. 
            </Typography>
            <Typography variant="body1" paragraph>
              The clock will be set at the server. The countdown timer in the top-right corner of the screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.
            </Typography>
            <Typography variant="body1" paragraph>
              The Questions Palette displayed on the right side of the screen will show the status of each question using one of the following symbols:
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Question Status Information:
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 30, height: 30, bgcolor: 'gray', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', borderRadius: 1 }}>77</Box>
                    <Typography>Not Visited</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 30, height: 30, bgcolor: '#008000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', borderRadius: 1 }}>13</Box>
                    <Typography>Answered</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 30, height: 30, bgcolor: '#ef1eb3', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>1</Box>
                    <Typography>Answered & Marked for review</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 30, height: 30, bgcolor: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', borderRadius: 1 }}>1</Box>
                    <Typography>Visited but Not answered</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Key Instructions:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <InfoOutlined color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Navigating to a Question" 
                  secondary="To answer a question, click on the question number in the Question Palette at the right of your screen to go to that numbered question directly. Save your answer using 'Save & Next' or mark it for review with 'Mark for Review & Next.'"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <InfoOutlined color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Answering Questions" 
                  secondary="To select an answer, click on the option button. Deselect by clicking again or use 'Clear Response.' Always save your answer by clicking 'Save & Next.'"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <InfoOutlined color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Sections and Navigation" 
                  secondary="Questions are divided into sections. Navigate freely between sections during the examination using the top bar."
                />
              </ListItem>
            </List>
          </Grid>

          <h3 style={{ color: 'red' , textAlign: '', marginLeft: 'px'}}>*Back from page wont save responces<br/>*Even if you take a back from here it is counted as one attempt</h3>
          <h3 style={{ color: 'red' , textAlign: '', marginLeft: 'px'}}>*Images may take time to load</h3>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <FormControlLabel
              control={
                <Checkbox 
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                  color="primary"
                />
              }
              label="I have read and understood all the instructions."
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button 
                variant="contained" 
                size="large"
                onClick={handleStartTest}
                disabled={!isAgreed}
                sx={{ minWidth: 200 }}
              >
                Start Test
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Instructions;
