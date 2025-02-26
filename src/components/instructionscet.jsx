import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useUser } from './UserContext.jsx';
import { auth } from '../firebaseConfig'; // Update with your actual path
import { useAuthState } from 'react-firebase-hooks/auth';

import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@mui/material';

const Instructions = () => {
  const { testIdcet } = useParams(); 
  const [isAgreed, setIsAgreed] = useState(false);
  const navigate = useNavigate();
  const { userId } = useUser();
  const [user] = useAuthState(auth); 
  const today = new Date();
  const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;


  const handleStartTest = () => {
    if (isAgreed) {
      // Navigate to test page with the same testIdcet
      navigate(`/testcet/${testIdcet}`);
    }
  };

  // Style for bullet points
  const listStyle = {
    fontFamily: '"Arial", sans-serif',
    fontSize: '1rem',
    lineHeight: '1.6',
    listStyleType: 'disc',
    paddingLeft: '32px',
    margin: '8px 0'
  };

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {/* Header */}
        <Typography variant="h4" sx={{ 
          bgcolor: 'primary.main',
          color: 'white',
          p: 2,
          mb: 3,
          textAlign: 'center',
          fontFamily: 'Times New Roman, serif'
        }}>
          MAH-PCM (Group) CET-2024
        </Typography>

        {/* Examinee Details Table */}
        <Typography variant="h6" sx={{ mb: 2 }}>Examinee Detail</Typography>
        <TableContainer component={Paper} sx={{ mb: 4, border: '2px solid black' }}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell sx={{ border: '1px solid black', width: '25%' }}>Exam Center:</TableCell>
                <TableCell sx={{ border: '1px solid black', width: '25%' }}>Super Institute</TableCell>
                <TableCell sx={{ border: '1px solid black', width: '25%' }}>Registration Number:</TableCell>
                <TableCell sx={{ border: '1px solid black', width: '25%' }}>ES23BTECH11026</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: '1px solid black' }}>Name:</TableCell>
                <TableCell sx={{ border: '1px solid black' }}>{user.displayName}</TableCell>
                <TableCell sx={{ border: '1px solid black' }}>Exam Duration:</TableCell>
                <TableCell sx={{ border: '1px solid black' }}>180 Minutes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: '1px solid black' }}>Date of Exam:</TableCell>
                <TableCell sx={{ border: '1px solid black' }}>{formattedDate}</TableCell>
                <TableCell sx={{ border: '1px solid black' }}>Maximum marks:</TableCell>
                <TableCell sx={{ border: '1px solid black' }}>200</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

       
              <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Droid Sans, sans-serif', fontSize: '15.33px' }}>
              Exam Instructions
              </Typography>
              
              <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontFamily: 'Droid Sans, sans-serif', fontSize: '13.33px' }}>
                About Question Papers:
              </Typography>
              <ul style={{ ...listStyle, fontFamily: 'Droid Sans, sans-serif', fontSize: '13.33px' }}>
                <li>There are in all 150 Questions (Physics-50, Chemistry-50, Mathematics-50)</li>
                <li>Physics and Chemistry: 1 mark each, Mathematics: 2 marks each</li>
                <li>Total time: 180 minutes (90 minutes for Physics+Chemistry, 90 minutes for Mathematics)</li>
                <li>No negative marking</li>
                <li>Questions in English only</li>
              </ul>

              <Typography variant="subtitle1" sx={{ mb: 1, fontFamily: 'Droid Sans, sans-serif', fontSize: '13.33px' }}>
                About answering the questions:
              </Typography>
              <ul style={{ ...listStyle, fontFamily: 'Droid Sans, sans-serif', fontSize: '13.33px' }}>
                <li>Follow all instructions from Test Administrator</li>
                <li>No queries after exam commencement</li>
                <li>Select answers using mouse click</li>
                <li>Use "Clear" to deselect</li>
                <li>Mark questions for review (appear in violet)</li>
              </ul>

              <Typography variant="subtitle1" sx={{ mb: 1, fontFamily: 'Droid Sans, sans-serif', fontSize: '13.33px' }}>
                About the Preview and Submission:
              </Typography>
              <ul style={{ ...listStyle, fontFamily: 'Droid Sans, sans-serif', fontSize: '13.33px' }}>
                <li>Auto-submit at time expiration</li>
                <li>Verify question summary before submission</li>
              </ul>
              <h3 style={{ fontFamily: 'Droid Sans, sans-serif', fontSize: '13.33px', color: 'red' }}>***Answers are not saved unless submitted, reload or back erases your responces***</h3>
              </Box>
              {/* Agreement Checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              sx={{ alignSelf: 'flex-start' }}
            />
          }
          label={
            <Typography variant="body2">
              I have read and understood the instructions. All computer hardware allotted to me are in proper working condition. 
              I declare that I am not in possession of any prohibited gadgets/materials. I agree that in case of non-compliance, 
              I may face disciplinary action including exam disqualification.
            </Typography>
          }
          sx={{ mb: 3, alignItems: 'flex-start' }}
        />

        {/* Start Button */}
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleStartTest}
            disabled={!isAgreed}
            sx={{ px: 6 }}
          >
            I am ready to begin
          </Button>
        </Box>
        </Paper>
    </Container>
  );
};

export default Instructions;