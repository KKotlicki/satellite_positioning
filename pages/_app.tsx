import SettingsView from "@/components/settings-view";
import TimeSlider from "@/components/slider";
import useStore from "@/store/store";
import MenuIcon from "@mui/icons-material/Menu";
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import {
	Card,
	CardContent,
	CardHeader,
	Checkbox,
	CssBaseline,
	FormControlLabel,
	FormGroup,
	Stack
} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import {
	blue,
	deepPurple,
	green,
	orange,
	pink,
	red
} from "@mui/material/colors";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import type { AppProps } from "next/app";
import { Roboto } from "next/font/google";
import Head from "next/head";
import Link from "next/link";
import { type MouseEvent, useState } from "react";
import { useZustand } from "use-zustand";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("UTC")


const project = "GNSS Planning"

const roboto = Roboto({
	weight: "400",
	subsets: ["latin"]
})

const theme = createTheme({
	palette: {
		primary: {
			main: deepPurple[300]
		},
		mode: "dark"
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: `
        html, body, #__next {
					height: 100%;
        }
      `,
		},
	},

})

const pages = ["Settings", "Selection", "Charts", "Sky Plot", "World View"] as const

const drawerWidth = 240

export default function App({ Component, pageProps }: AppProps) {
	const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null)
	const selectedSatellites = useZustand(useStore, (state) => state.selectedSatellites)

	const almanac = useZustand(useStore, (state) => state.almanac)
	const changeSelectedSatellites = useZustand(useStore, (state) => state.changeSelectedSatellites);

	const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
		setAnchorElNav(event.currentTarget)
	}

	const handleCloseNavMenu = () => {
		setAnchorElNav(null)
	}

	const setSatelliteSelection = (provider: number, turnOn: boolean) => {
		const satelliteIdRange: [number, number] = (() => {
			switch (provider) {
				case 0:
					return [1, 37]
				case 1:
					return [38, 64]
				case 2:
					return [201, 263]
				case 3:
					return [264, 283]
				case 4:
					return [111, 118]
				default:
					throw new Error("Invalid provider")
			}
		})()
		const selectedSatellitesSet = new Set(selectedSatellites)
		for (let i = satelliteIdRange[0]; i <= satelliteIdRange[1]; i++) {
			if (almanac.get(i) === undefined) continue
			if (turnOn) {
				selectedSatellitesSet.add(i)
			} else {
				selectedSatellitesSet.delete(i)
			}
		}
		changeSelectedSatellites(Array.from(selectedSatellitesSet))
	}

	return (
		<>
			<Head>
				<title>{project}</title>
				<meta name='description' content='Generated by create next app' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Stack component="main" className={roboto.className} height="100%" display={"grid"} gridTemplateColumns={`${drawerWidth}px 1fr`}
					gridTemplateRows="auto 1fr"
					gridTemplateAreas={`
				"h h h"
				"d c c"
			`}
				>
					<AppBar position='relative' sx={{ zIndex: theme.zIndex.drawer + 1, gridArea: "h" }}>
						<Container maxWidth='xl'>
							<Toolbar disableGutters>
								<SatelliteAltIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
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
								<SatelliteAltIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
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
					<Drawer
						sx={{
							width: drawerWidth,
							flexShrink: 0,
							"& .MuiDrawer-paper": {
								width: drawerWidth,
								boxSizing: "border-box"
							}
						}}
						variant='permanent'
						anchor='left'
					>
						<Toolbar />
						<Box sx={{ overflow: "auto" }}>
							<Card
								sx={{
									width: "full-width",
									margin: "1rem"
								}}
								variant='outlined'
							>
								<CardHeader
									title='Local Time'
									style={{
										borderBottom: `1px solid ${theme.palette.divider}`,
										backgroundColor: theme.palette.divider
									}}
								/>
								<TimeSlider />
							</Card>
							<Card
								sx={{
									width: "full-width",
									margin: "1rem"
								}}
								variant='outlined'
							>
								<CardHeader
									title='Satellite Selection'
									style={{
										borderBottom: `1px solid ${theme.palette.divider}`,
										backgroundColor: theme.palette.divider
									}}
								/>
								<CardContent>
									<FormGroup>
										<FormControlLabel
											control={
												<Checkbox
													defaultChecked
													sx={{
														color: green[800],
														"&.Mui-checked": { color: green[600] }
													}}
													onChange={(e) => setSatelliteSelection(0, e.target.checked)}
												/>
											}
											label='GPS'
										/>
										<FormControlLabel
											control={
												<Checkbox
													defaultChecked
													sx={{
														color: red[800],
														"&.Mui-checked": { color: red[600] }
													}}
													onChange={(e) => setSatelliteSelection(1, e.target.checked)}
												/>
											}
											label='GLONASS'
										/>
										<FormControlLabel
											control={
												<Checkbox
													defaultChecked
													sx={{
														color: blue[800],
														"&.Mui-checked": { color: blue[600] }
													}}
													onChange={(e) => setSatelliteSelection(2, e.target.checked)}
												/>
											}
											label='Galileo'
										/>
										<FormControlLabel
											control={
												<Checkbox
													defaultChecked
													sx={{
														color: orange[800],
														"&.Mui-checked": { color: orange[600] }
													}}
													onChange={(e) => setSatelliteSelection(3, e.target.checked)}
												/>
											}
											label='Beidou'
										/>
										<FormControlLabel
											control={
												<Checkbox
													defaultChecked
													sx={{
														color: pink[800],
														"&.Mui-checked": { color: pink[600] }
													}}
													onChange={(e) => setSatelliteSelection(4, e.target.checked)}
												/>
											}
											label='QZSS'
										/>
									</FormGroup>
								</CardContent>
							</Card>
							<Card
								sx={{
									width: "full-width",
									margin: "1rem"
								}}
								variant='outlined'
							>
								<CardHeader
									title='My Settings'
									style={{
										borderBottom: `1px solid ${theme.palette.divider}`,
										backgroundColor: theme.palette.divider
									}}
								/>
								<CardContent>
									<SettingsView />
								</CardContent>
							</Card>
						</Box>
					</Drawer>
					<Box sx={{ display: "flex", overflowY: "auto" }}>
						<Component {...pageProps} />
					</Box>
				</Stack>
			</ThemeProvider>
		</>
	)
}
