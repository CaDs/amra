import { ScreenFrame } from "../../src/components/primitives/ScreenFrame";
import { HomeTome } from "../../src/components/home/HomeTome";
import { getHomeSpreads } from "../../src/data/loadLore";

export default function LoreRoute() {
  const spreads = getHomeSpreads();
  return (
    <ScreenFrame>
      <HomeTome spreads={spreads} />
    </ScreenFrame>
  );
}
