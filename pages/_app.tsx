import useStore from '@/store/store';
import AdbIcon from '@mui/icons-material/Adb';
import MenuIcon from '@mui/icons-material/Menu';
import { Card, CardContent, CardHeader, Checkbox, CssBaseline, FormControlLabel, FormGroup, Grid, Slider } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { blue, deepPurple, green, orange, pink, red } from '@mui/material/colors';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { AppProps } from 'next/app';
import { Roboto } from 'next/font/google';
import Head from 'next/head';
import Link from 'next/link';
import { MouseEvent, useState } from 'react';

const mi = 3.986005 * 1e14
const wE = 7.2921151467 * 1e-5

// function timeSinceAlmanac(t: number, toa: number) {
//   return t - toa
// }

// function semiMajorAxisOfOrbit(a0: number) {
//   return a0 ^ 2
// }

// function meanMotionOfOrbit(a0: number) {
//   return Math.sqrt(mi / a0 ^ 3)
// }

// function meanAnomalyOfOrbit(M0: number, n: number, tk: number) {
//   return M0 + n * tk
// }

// function eccentricAnomalyOfOrbit(e: number, Mk: number, E: number = Mk): number {
//   const Ei: number = E + e * Math.sin(E)
//   if (Math.abs(Ei - E) < 1e-12) {
//     return Ei
//   } else {
//     return eccentricAnomalyOfOrbit(e, Mk, Ei)
//   }
// }

// function trueAnomalyOfOrbit(e: number, Ek: number) {
//   return Math.atan2(Math.sqrt(1 - e ^ 2) * Math.sin(Ek), Math.cos(Ek) - e)
// }

// function argumentOfPerigeeOfOrbit(vk: number, omega: number) {
//   return vk - omega
// }

// function radiusOfOrbit(a: number, e: number, Ek: number) {
//   return a * (1 - e * Math.cos(Ek))
// }

// function positionInOrbit(rk: number, psi: number, uk: number): [number, number] {
//   const xk: number = rk * Math.cos(psi)
//   const yk: number = rk * Math.sin(psi)
//   return [xk, yk]
// }

// function ascendingNodeOfOrbit(Omega0: number, Omega: number, tk: number, toa: number) {
//   return Omega0 + (Omega - wE) * tk - wE * toa
// }

// function positionInECEF(xk: number, yk: number, OmegaK: number, inc: number): [number, number, number] {
//   const x: number = xk * Math.cos(OmegaK) - yk * Math.cos(inc) * Math.sin(OmegaK)
//   const y: number = xk * Math.sin(OmegaK) + yk * Math.cos(inc) * Math.cos(OmegaK)
//   const z: number = yk * Math.sin(inc)
//   return [x, y, z]
// }



const project = 'GNSS Planning';

const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
})

const theme = createTheme({
  palette: {
    primary: {
      main: deepPurple[300],
    },
    mode: 'dark',
  },
});

const pages = ['Settings', 'Charts', 'Sky Plot', 'World View'] as const;

const drawerWidth = 240;

function valuetext(value: number) {
  return `${value}°C`;
}



export default function App({ Component, pageProps }: AppProps) {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const latitude = useStore((state) => state.latitude);
  const longitude = useStore((state) => state.longitude);
  const height = useStore((state) => state.height);
  const elevationCutoff = useStore((state) => state.elevationCutoff);
  const timeAndDate = useStore((state) => state.timeAndDate);
  const almanacName = useStore((state) => state.almanacName);


  var sliderValue = 0;

  return (
    <>
      <Head>
        <title>{project}</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ThemeProvider theme={theme}>
        <CssBaseline></CssBaseline>
        <main className={roboto.className}>
          <AppBar position="relative" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
            <Container maxWidth="xl">
              <Toolbar disableGutters>
                <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                <Typography
                  color={theme.palette.mode === 'dark' ? 'primary' : 'inherit'}
                  variant="h6"
                  noWrap
                  component="a"
                  href="/"
                  sx={{
                    mr: 2,
                    display: { xs: 'none', md: 'flex' },
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}
                >
                  {project}
                </Typography>

                <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                  <IconButton
                    size="large"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleOpenNavMenu}
                    color="inherit"
                  >
                    <MenuIcon />
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorElNav}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'left',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'left',
                    }}
                    open={Boolean(anchorElNav)}
                    onClose={handleCloseNavMenu}
                    sx={{
                      display: { xs: 'block', md: 'none' },
                    }}
                  >
                    {pages.map((page) => (
                      <MenuItem key={page} onClick={handleCloseNavMenu}>
                        <Link
                          key={page}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                          href={`/${page.toLowerCase().replace(' ', '-')}`}
                          passHref>
                          <Typography
                            textAlign="center">{page}</Typography>
                        </Link>
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
                <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
                <Typography
                  color={theme.palette.mode === 'dark' ? 'primary' : 'inherit'}
                  variant="h5"
                  noWrap
                  component="a"
                  href=""
                  sx={{
                    mr: 2,
                    display: { xs: 'flex', md: 'none' },
                    flexGrow: 1,
                    fontFamily: 'monospace',
                    textDecoration: 'none',
                  }}
                >
                  {project}
                </Typography>
                <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                  {pages.map((page) => (
                    <Link
                      key={page}
                      style={{ textDecoration: 'none' }}
                      href={`/${page.toLowerCase().replace(' ', '-')}`}
                      passHref>
                      <Button
                        onClick={handleCloseNavMenu}
                        sx={{ my: 2, color: 'white', display: 'block' }}
                      >
                        {page}
                      </Button>
                    </Link>
                  ))}
                </Box>
              </Toolbar>
            </Container>
          </AppBar>
          <Grid container spacing={0} sx={{ position: 'relative' }}>
            <Drawer
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  width: drawerWidth,
                  boxSizing: 'border-box',
                  height: 'calc(100% - 64px)', // Subtract the height of the Toolbar
                  overflowY: 'auto', // Allow vertical scrolling if content overflows

                },
              }}
              variant="permanent"
              anchor="left"
            >
              <Toolbar />
              <Box sx={{ height: '100%' }}>
                <Card sx={{
                  width: 'full-width',
                  margin: '1rem',
                }} variant="outlined">
                  <CardHeader title='Local Time'
                    style={{ borderBottom: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.divider }}></CardHeader>
                  <CardContent>
                    <Typography gutterBottom>
                      {sliderValue}
                    </Typography>
                    <Slider
                      aria-label="Local Time"
                      defaultValue={30}
                      getAriaValueText={valuetext}
                      valueLabelDisplay="off"
                      step={1}
                      marks
                      min={0}
                      max={144}
                    />
                  </CardContent>
                </Card>
                <Card sx={{
                  width: 'full-width',
                  margin: '1rem',
                }} variant="outlined">
                  <CardHeader title='Satellite Selection'
                    style={{ borderBottom: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.divider }}></CardHeader>
                  <CardContent>    <FormGroup>
                    <FormControlLabel control={<Checkbox defaultChecked sx={{ color: green[800], '&.Mui-checked': { color: green[600], } }} />} label="GPS" />
                    <FormControlLabel control={<Checkbox defaultChecked sx={{ color: red[800], '&.Mui-checked': { color: red[600], } }} />} label="GLONASS" />
                    <FormControlLabel control={<Checkbox defaultChecked sx={{ color: blue[800], '&.Mui-checked': { color: blue[600], } }} />} label="Galileo" />
                    <FormControlLabel control={<Checkbox defaultChecked sx={{ color: orange[800], '&.Mui-checked': { color: orange[600], } }} />} label="Beidou" />
                    <FormControlLabel control={<Checkbox defaultChecked sx={{ color: pink[800], '&.Mui-checked': { color: pink[600], } }} />} label="QZSS" />
                  </FormGroup></CardContent>
                </Card>
                <Card sx={{
                  width: 'full-width',
                  margin: '1rem',
                }} variant="outlined">
                  <CardHeader title='My Settings'
                    style={{ borderBottom: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.divider }}></CardHeader>
                  <CardContent>
                    <Box component="ul" sx={{
                      m: 0, p: 0, pl: 1
                    }}>
                      <li>Latitude: {latitude}</li>
                      <li>Longitude: {longitude}</li>
                      <li>Height: {height}</li>
                      <li>Elevation cutoff: {elevationCutoff}</li>
                      <li>Time and Date: {timeAndDate.format('MM/DD/YYYY hh:mm A')}</li>
                      <li>Almanac: {almanacName}</li>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Drawer>
            <Component {...pageProps} />
          </Grid>
        </main>
      </ThemeProvider>

    </>
  )
}
