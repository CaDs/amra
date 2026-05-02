import { ScreenFrame } from "../../src/components/primitives/ScreenFrame";
import { HomeTome } from "../../src/components/home/HomeTome";
import { HamburgerButton } from "../../src/components/nav/HamburgerButton";
import { getHomeSpreads } from "../../src/data/loadLore";

export default function LoreRoute() {
  const spreads = getHomeSpreads();
  return (
    <ScreenFrame>
      <HomeTome spreads={spreads} />
      <HamburgerButton />
    </ScreenFrame>
  );
}
