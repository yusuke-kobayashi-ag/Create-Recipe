import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import RestaurantIcon from '@mui/icons-material/Restaurant';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <RestaurantIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          余り物レシピ
        </Typography>
        <Box>
          <Button color="inherit" component={RouterLink} to="/">
            レシピ一覧
          </Button>
          <Button color="inherit" component={RouterLink} to="/generate">
            レシピを生成
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 