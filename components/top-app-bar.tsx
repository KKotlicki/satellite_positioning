import { pages, project, theme } from "@/constants/constants";
import MenuIcon from "@mui/icons-material/Menu";
import { useMediaQuery } from '@mui/material';
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { type MouseEvent, useState } from "react";


export default function TopAppBar() {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null)
  const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => { setAnchorElNav(event.currentTarget) }
  const handleCloseNavMenu = () => { setAnchorElNav(null) }
  const isXsScreen = useMediaQuery('(max-width:767px)');
  const isMdScreen = useMediaQuery('(min-width:768px)');

  return (
    <AppBar position='relative' sx={{ zIndex: theme.zIndex.drawer + 1, gridArea: "h" }}>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          <img
            src='/favicon.ico'
            alt='logo'
            style={{
              display: isXsScreen ? 'none' : isMdScreen ? 'flex' : 'none',
              marginRight: '6px',
              width: '30px',
              height: '30px',
              marginTop: '-2px',
            }}
          />
          <Typography
            color={theme.palette.mode === "dark" ? "primary" : "inherit"}
            variant='h6'
            noWrap
            component='a'
            href='/'
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              textDecoration: "none"
            }}
          >
            {project}
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size='large'
              aria-controls='menu-appbar'
              aria-haspopup='true'
              onClick={handleOpenNavMenu}
              color='inherit'
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id='menu-appbar'
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left"
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left"
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" }
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Link
                    key={page}
                    style={{ textDecoration: "none", color: "inherit" }}
                    href={`/${page.toLowerCase().replace(" ", "-")}`}
                    passHref
                  >
                    <Typography textAlign='center'>{page}</Typography>
                  </Link>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Typography
            color={theme.palette.mode === "dark" ? "primary" : "inherit"}
            variant='h5'
            noWrap
            component='a'
            href=''
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              textDecoration: "none"
            }}
          >
            {project}
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Link
                key={page}
                style={{ textDecoration: "none" }}
                href={`/${page.toLowerCase().replace(" ", "-")}`}
                passHref
              >
                <Button
                  onClick={handleCloseNavMenu}
                  sx={{ color: "white", display: "block" }}
                >
                  {page}
                </Button>
              </Link>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
