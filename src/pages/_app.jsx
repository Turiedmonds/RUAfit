import "../styles/globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto">
        <Component {...pageProps} />
      </main>
      <Footer />
    </>
  );
}
