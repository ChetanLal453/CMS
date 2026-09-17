import React, { useEffect } from "react";

// bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'
import 'swiper/css/free-mode'
import 'swiper/css/effect-fade'
import 'swiper/css/effect-cube'
import 'swiper/css/effect-coverflow'
import 'swiper/css/effect-flip'
import 'swiper/css/effect-cards'
import 'swiper/css/effect-creative'
import 'swiper/css/mousewheel'
import 'swiper/css/parallax'
import 'swiper/css/thumbs'
import 'swiper/css/zoom'

// AOS animation
import AOS from "aos";
import "aos/dist/aos.css";

import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <Component {...pageProps} />
  );
}
