import { InteractiveBoard } from "./components/InteractiveBoard";
import { KifuPlayer } from "./components/KifuPlayer";
import { SAMPLE_KIF_YAGURA } from "./stories/sampleKifu";

function App() {
  return (
    <main style={{ padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "48px" }}>
      <h1 style={{ fontFamily: "serif", color: "#3a1e00" }}>react-shogi-board demo</h1>
      <section>
        <h2 style={{ fontFamily: "serif", color: "#5c3a1e", marginBottom: "16px" }}>棋譜再生</h2>
        <KifuPlayer kifu={SAMPLE_KIF_YAGURA} format="kif" />
      </section>
      <section>
        <h2 style={{ fontFamily: "serif", color: "#5c3a1e", marginBottom: "16px" }}>対局</h2>
        <InteractiveBoard />
      </section>
    </main>
  );
}

export default App
