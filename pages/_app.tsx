import SideDrawer from "@/components/side-drawer";
import TopAppBar from "@/components/top-app-bar";
import { drawerWidth, project, roboto, theme } from "@/global/constants";
import { CssBaseline, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import { ThemeProvider } from "@mui/material/styles";
import type { AppProps } from "next/app";
import Head from "next/head";


export default function App({ Component, pageProps }: AppProps) {
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
					<TopAppBar />
					<SideDrawer />
					<Box sx={{ display: "flex", overflowY: "auto" }}>
						<Component {...pageProps} />
					</Box>
				</Stack>
			</ThemeProvider>
		</>
	)
}
