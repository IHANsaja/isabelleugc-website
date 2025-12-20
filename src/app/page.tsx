import Header from "@/components/Header";
import PenthouseWrapper from "@/components/PentHouseWrapper";
import ScrollIndicator from "@/components/ScrollIndicator";
import { Scroll } from "@react-three/drei";
import HudOverlay from "@/components/HudOverlay";
import PreLoaderExperience from "@/components/PreLoaderExperience";
import TimeBasedScenery from "@/components/TimeBasedScenery";

export const dynamic = "force-static";

export default function Home() {
  return (
    <div>
      <PreLoaderExperience />
      <TimeBasedScenery />
      <Header />
      <div className="absolute w-full top-[120px] md:top-[180px] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center justify-center px-4 gap-8">
        <div className="flex flex-col items-center">
          <h1 className="font-playfair text-3xl md:text-5xl lg:text-6xl font-bold text-center text-main-black uppercase tracking-widest leading-tight">Step Into a World Where</h1>
          <h1 className="font-playfair text-2xl md:text-4xl lg:text-5xl font-regular text-main-black uppercase tracking-widest leading-tight mt-2 md:mt-0">Every Detail Glows</h1>
        </div>
      </div>

      <PenthouseWrapper />
      <HudOverlay />
      <ScrollIndicator />
    </div>
  );
}
