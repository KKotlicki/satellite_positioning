import Head from 'next/head'
import type { AppProps } from 'next/app'
import { Roboto } from 'next/font/google'
import { orange } from '@mui/material/colors';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
})

const theme = createTheme({
  palette: {
    primary: {
      main: orange[500],
    },
    mode: 'dark',
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Satellite Positioning</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline></CssBaseline>
        <main className={roboto.className}>
          <Component {...pageProps} />
        </main>
      </ThemeProvider>

    </>
  )
}


