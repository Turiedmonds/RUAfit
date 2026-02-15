import { useEffect } from 'react';
import Head from 'next/head';
import '../styles/globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
          // no-op
        });
      });
    }
  }, []);

  return (
    <>
      <Head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#000000" />
      </Head>
      <Header />
      <main className="max-w-xl mx-auto">
        <Component {...pageProps} />
      </main>
      <Footer />
    </>
  );
}
