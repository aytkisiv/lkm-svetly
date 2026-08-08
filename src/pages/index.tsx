import Navbar from "../components/navbar";
import Hero from "../components/hero";
import Offers from "../components/offers";
import Catalog from "../components/catalog";
import PriceList from "../components/price-list";
import About from "../components/about";
import Statement from "../components/statement";
import Footer from "../components/footer";
import { OrderProvider } from "../components/order-modal";

export default function Index() {
  return (
    <OrderProvider>
      <div className="min-h-screen bg-[#f4f3ef] text-[#141414] overflow-x-clip">
        <Navbar />
        <Hero />
        <Offers />
        <Catalog />
        <PriceList />
        <About />
        <Statement />
        <Footer />
      </div>
    </OrderProvider>
  );
}
