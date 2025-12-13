import Header from "@/components/Header";
import PenthouseWrapper from "@/components/PentHouseWrapper";
import ScrollIndicator from "@/components/ScrollIndicator";
import { Scroll } from "@react-three/drei";

export default function Home() {
  return (
    <div>
      <Header />
      <div className="absolute top-[200px] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center justify-center">
        <h1 className="font-playfair text-4xl font-bold text-black">Step Into a World Where</h1>
        <h1 className="font-playfair text-4xl font-regular text-black">Every Detail Glows</h1>
      </div>

      <PenthouseWrapper />
      <ScrollIndicator />
    </div>
  );
}
