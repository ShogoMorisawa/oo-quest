export function CssDragon({
  name,
  damaged,
  attacking,
  defeated,
  maxDanger
}: {
  name: string;
  damaged: boolean;
  attacking: boolean;
  defeated: boolean;
  maxDanger: boolean;
}) {
  return (
    <section
      className={`dragon-stage mt-4 border-4 border-double border-sky-700 ${
        damaged ? "dragon-stage-hit" : ""
      } ${attacking ? "dragon-stage-attack" : ""} ${maxDanger ? "dragon-stage-max" : ""} ${defeated ? "dragon-stage-defeated" : ""}`}
      aria-label={`${name}の姿`}
    >
      <div className="battle-sun" />
      <div className="battle-cloud battle-cloud-left" />
      <div className="battle-cloud battle-cloud-right" />
      <div className="battle-hills" />
      <div className="battle-ground" />
      {attacking && <div className="dragon-breath" />}
      <div className="dragon-shadow" />
      <svg className="dragon-sprite" viewBox="0 0 360 260" role="img" aria-hidden="true">
        <g className="dragon-sprite-inner" shapeRendering="crispEdges">
          <polygon className="dragon-wing-back" points="114,106 72,40 28,78 48,146 98,170 136,148" />
          <polygon className="dragon-wing-membrane" points="98,96 74,68 58,118 98,148 120,136" />
          <polygon className="dragon-wing-front" points="220,104 282,34 334,74 318,150 264,184 226,150" />
          <polygon className="dragon-wing-membrane" points="238,104 282,64 304,118 264,158 236,140" />
          <polygon className="dragon-tail-svg" points="124,154 78,138 34,154 16,186 54,196 94,182 126,198" />
          <polygon className="dragon-tail-tip-svg" points="14,186 2,166 26,170" />
          <polygon className="dragon-leg-svg" points="112,188 146,188 152,230 100,230 106,208" />
          <polygon className="dragon-leg-svg" points="192,188 228,188 238,230 184,230 190,208" />
          <polygon className="dragon-claw-svg" points="94,230 158,230 150,244 98,244" />
          <polygon className="dragon-claw-svg" points="178,230 244,230 238,244 184,244" />
          <polygon className="dragon-body-svg" points="114,126 146,104 210,104 244,128 240,190 210,210 132,210 104,188" />
          <polygon className="dragon-belly-svg" points="146,134 204,134 224,156 210,194 146,194 126,160" />
          <polygon className="dragon-neck-svg" points="220,116 244,72 274,82 260,140 230,154" />
          <polygon className="dragon-head-svg" points="246,50 306,42 334,66 330,110 304,130 252,118 234,88" />
          <polygon className="dragon-snout-svg" points="306,70 352,82 342,112 304,108" />
          <polygon className="dragon-horn-svg" points="254,52 258,14 280,48" />
          <polygon className="dragon-horn-svg" points="292,48 306,10 320,56" />
          <polygon className="dragon-fang-svg" points="314,110 324,132 334,110" />
          <polygon className="dragon-fang-svg" points="336,106 344,126 352,108" />
          <rect className="dragon-eye-svg" x="286" y="66" width="16" height="16" />
          <rect className="dragon-eye-dot-svg" x="296" y="70" width="6" height="7" />
          <rect className="dragon-mouth-svg" x="314" y="102" width="30" height="7" />
          <polygon className="dragon-scale-svg" points="132,116 144,94 156,116" />
          <polygon className="dragon-scale-svg" points="164,108 178,84 192,108" />
          <polygon className="dragon-scale-svg" points="202,116 214,94 226,116" />
          <rect className="dragon-highlight-svg" x="130" y="134" width="54" height="10" />
          <rect className="dragon-highlight-svg" x="252" y="62" width="42" height="8" />
          <rect className="dragon-highlight-svg" x="236" y="92" width="12" height="34" />
        </g>
      </svg>
      <div className="enemy-nameplate">{defeated ? `${name}は たおれた！` : `${name}が あらわれた！`}</div>
    </section>
  );
}
