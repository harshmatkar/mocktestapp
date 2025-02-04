import React from 'react';
import { Box, Button, Grid, Paper, Radio, RadioGroup, FormControl, FormControlLabel, Typography } from '@mui/material';
import MathJax from 'react-mathjax2';
import QuestionAnswerSection from './QuestionAnswerSection'; // Import your QuestionAnswerSection component

const QuestionComponent = ({
  currentQuestion,
  currentQuestionIndex,
  selectedAnswers,
  handleOptionSelect,
  isIntegerQuestion,
  handleSaveAndNext,
  handleMarkForReview,
  handleClearResponse,
  handleSubmitConfirmation,
  setCurrentQuestionIndex
}) => {
  return (
    <Grid container spacing={2} sx={{ p: { xs: 1, sm: 2 }, flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
      {/* Left Section - Question Area */}
      <Grid item xs={12} md={9} sx={{
        order: { xs: 2, sm: 0 },
        position: 'relative',
        pb: { md: 8 } // Add padding for fixed navigation
      }}>
        <Paper elevation={3} sx={{
          p: { xs: 1, sm: 2 },
          boxShadow: '3px 3px 3px rgba(0, 0, 0, 0.1)',
          border: 'none',
          position: 'relative',
          mb: { xs: 2, md: 0 }
        }}>
          {/* Question Content */}
          <Box sx={{
            mb: 2,
            p: 1,
            border: 'none',
            minHeight: "40vh",
            maxHeight: { xs: '50vh', sm: '60vh' },
            overflowY: "auto",
            fontSize: { xs: '0.9rem', sm: '1rem' },
            '& .MathJax': { fontSize: '0.9rem !important' },
            whiteSpace: "pre-wrap"
          }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' , fontWeight: 'bold'}}}>
              Question {currentQuestionIndex + 1}
            </Typography>
            <MathJax dynamic key={currentQuestionIndex}>
              <div dangerouslySetInnerHTML={{ __html: `${currentQuestion.question}` }} />
            </MathJax>
            {currentQuestion.image && (
              <Box
                component="img"
                src={currentQuestion.image}
                alt="Question related image"
                sx={{ mt: 2, maxWidth: "100%", maxHeight: "20vh", objectFit: "contain" }}
              />
            )}

            {!isIntegerQuestion(currentQuestionIndex) ? (
              <FormControl component="fieldset" sx={{ width: "100%" }}>
                <RadioGroup
                  value={selectedAnswers[currentQuestion.id] || ""}
                  onChange={(e) => handleOptionSelect(currentQuestion.id, e.target.value)}
                >
                  {currentQuestion.options.map((option, i) => (
                    <FormControlLabel
                      key={i}
                      value={option}
                      control={<Radio sx={{ "&.Mui-checked": { color: "#18b111" } }} />}
                      label={
                        <Box sx={{ p: 1, "&:hover": { backgroundColor: "#f8f8f8" } }}>
                          <MathJax dynamic key={`${currentQuestionIndex}-${i}`}>
                            {option.includes("\\")
                              ? `\\(${option}\\)`
                              : `\\text{${option}}`}
                          </MathJax>
                        </Box>
                      }
                      sx={{ margin: "8px 0", width: "100%" }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            ) : (
              <QuestionAnswerSection question={currentQuestion} index={currentQuestionIndex} />
            )}
          </Box>

          {/* Desktop Bottom Controls */}
          <Box sx={{
            display: { xs: 'none', md: 'block' },
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 395,
            zIndex: 1000,
            bgcolor: 'background.paper',
            borderTop: 'px solid',
            borderColor: 'divider',
            py: 1,
            px: 2,
            boxShadow: 2
          }}>
            <Box sx={{
              display: 'flex',
              gap: 2,
              maxWidth: 1200,
              margin: '0 auto',
              '& button': {
                width: '140px',
                height: '40px',
                fontSize: '0.9rem',
                py: 1.5,
                borderRadius: '4px',
                boxShadow: 1,
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-1px)'
                }
              }
            }}>
              <Button onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                variant="contained"
                sx={{ backgroundColor: '#FF5733', color: 'white' }}>
                Previous
              </Button>
              <Button onClick={handleSaveAndNext}
                variant="contained"
                sx={{ backgroundColor: '#4fd65e', color: 'white' }}>
                Save & Next
              </Button>
              <Button onClick={handleMarkForReview}
                variant="contained"
                sx={{ backgroundColor: '#e3873b', color: 'white' }}>
                Mark Review
              </Button>
              <Button onClick={handleClearResponse}
                variant="contained"
                sx={{ color: 'white', '&:hover': { backgroundColor: '#E64A19' } }}>
                Clear
              </Button>
              <Button onClick={handleSubmitConfirmation}
                variant="contained"
                color="success"
                sx={{
                  marginLeft: 'auto',
                  backgroundColor: '#ffffff',
                  color: 'black',
                  '&:hover': { backgroundColor: '#4fd65e', color: 'white' }
                }}>
                Submit Test
              </Button>
            </Box>
          </Box>

          {/* Mobile Bottom Controls */}
          <Box sx={{
            display: { xs: 'block', md: 'none' },
            position: 'fixed',
            bottom: 0,
            bgcolor: 'background.paper',
            py: 1,
            borderTop: '2px solid',
            borderColor: 'divider'
          }}>
            <Box sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              justifyContent: 'center',
              '& button': {
                flex: '1 1 45%',
                fontSize: '0.7rem',
                py: 0.5,
                px: 0.5,
                minWidth: 'unset',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }
            }}>
              <Button onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                variant="contained"
                sx={{ backgroundColor: '#FF5733', color: 'white' }}
                size="small">
                Previous
              </Button>
              <Button onClick={handleSaveAndNext}
                variant="contained"
                sx={{ backgroundColor: '#4fd65e', color: 'white' }}
                size="small">
                Save & Next
              </Button>
              <Button onClick={handleMarkForReview}
                variant="contained"
                sx={{ backgroundColor: '#e3873b', color: 'white' }}
                size="small">
                Review
              </Button>
              <Button onClick={handleClearResponse}
                variant="contained"
                sx={{ color: 'white', '&:hover': { backgroundColor: '#E64A19' } }}
                size="small">
                Clear
              </Button>
              <Button onClick={handleSubmitConfirmation}
                variant="contained"
                sx={{
                  marginLeft: 'auto',
                  backgroundColor: '#d2d6e0',
                  color: 'black',
                  '&:hover': { backgroundColor: '#4fd65e', color: 'white' }
                }}
                size="small">
                Submit Test
              </Button>
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default QuestionComponent;
