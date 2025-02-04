import React, { useState } from 'react';
import { Grid, Paper, Box, IconButton, Button, Typography, SwipeableDrawer } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const QuestionPaletteDrawer = ({ legendItems, questions, getQuestionStatus, handleQuestionView, currentQuestionIndex, statusColors }) => {
  const [isPalletOpen, setIsPalletOpen] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      {/* Desktop view */}
      <Grid item xs={12} md={3} sx={{ order: { xs: 1, sm: 0 }, display: { xs: 'none', md: 'block' } }}>
        <Paper elevation={3} sx={{ p: 1, height: { xs: 'auto', sm: '85vh' }, overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={() => setIsPalletOpen(!isPalletOpen)} size="small">
              {isPalletOpen ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </Box>

          {isPalletOpen && (
            <>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 1,
                  mb: 2,
                  fontSize: '0.7rem',
                }}
              >
                {legendItems.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: item.color,
                        position: 'relative',
                      }}
                    >
                      {item.dot && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: -2,
                            right: -2,
                            width: 8,
                            height: 8,
                            bgcolor: 'warning.main',
                            borderRadius: '50%',
                          }}
                        />
                      )}
                    </Box>
                    <Typography variant="caption">{item.text}</Typography>
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: 1,
                  '@media (min-width: 400px)': {
                    gridTemplateColumns: 'repeat(7, 1fr)',
                  },
                }}
              >
                {questions.map((_, index) => {
                  const status = getQuestionStatus(index);
                  return (
                    <Button
                      key={index}
                      onClick={() => handleQuestionView(index)}
                      variant="contained"
                      sx={{
                        minWidth: 32,
                        height: 32,
                        p: 0,
                        fontSize: '0.75rem',
                        bgcolor: theme => {
                          if (currentQuestionIndex === index) return '#f0f0f0'; // Current question
                          return `${statusColors[status]?.main || '#f5f5f5'}`; // Default light gray
                        },
                        color: theme => {
                          if (currentQuestionIndex === index) return 'black';
                          return status === 'gray' ? 'black' : 'white';
                        },
                        border: theme => (currentQuestionIndex === index ? '2px solid #1976d2' : 'none'),
                        '&:hover': {
                          bgcolor: `${statusColors[status]?.dark || '#e0e0e0'}`,
                          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {index + 1}
                      {status === 'purple-dot' && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 2,
                            right: 2,
                            width: 6,
                            height: 6,
                            bgcolor: 'warning.main',
                            borderRadius: '50%',
                          }}
                        />
                      )}
                    </Button>
                  );
                })}
              </Box>
            </>
          )}
        </Paper>
      </Grid>

      {/* Mobile view: Swipeable Drawer */}
      <SwipeableDrawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpen={() => setIsDrawerOpen(true)}
        sx={{
          '& .MuiDrawer-paper': {
            width: '80%',
            maxWidth: 300,
            p: 2,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={() => setIsDrawerOpen(false)}>
            <ChevronRight />
          </IconButton>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Question Palette
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1,
              fontSize: '0.7rem',
            }}
          >
            {legendItems.map((item, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    bgcolor: item.color,
                    position: 'relative',
                  }}
                >
                  {item.dot && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                        width: 8,
                        height: 8,
                        bgcolor: 'warning.main',
                        borderRadius: '50%',
                      }}
                    />
                  )}
                </Box>
                <Typography variant="caption">{item.text}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 1,
            overflowY: 'auto',
          }}
        >
          {questions.map((_, index) => {
            const status = getQuestionStatus(index);
            return (
              <Button
                key={index}
                onClick={() => {
                  handleQuestionView(index);
                  setIsDrawerOpen(false);
                }}
                variant="contained"
                sx={{
                  minWidth: 32,
                  height: 32,
                  p: 0,
                  fontSize: '0.75rem',
                  bgcolor: theme => {
                    if (currentQuestionIndex === index) return '#f0f0f0';
                    return `${statusColors[status]?.main || '#f5f5f5'}`;
                  },
                  color: theme => {
                    if (currentQuestionIndex === index) return 'black';
                    return status === 'gray' ? 'black' : 'white';
                  },
                  border: theme => (currentQuestionIndex === index ? '2px solid #1976d2' : 'none'),
                  '&:hover': {
                    bgcolor: `${statusColors[status]?.dark || '#e0e0e0'}`,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  },
                }}
              >
                {index + 1}
                {status === 'purple-dot' && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 2,
                      right: 2,
                      width: 6,
                      height: 6,
                      bgcolor: 'warning.main',
                      borderRadius: '50%',
                    }}
                  />
                )}
              </Button>
            );
          })}
        </Box>
      </SwipeableDrawer>
    </>
  );
};

export default QuestionPaletteDrawer;
