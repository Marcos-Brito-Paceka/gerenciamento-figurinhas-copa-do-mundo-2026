export const flagStyles: Record<string, string> = {
  // Grupo A
  MEX: "linear-gradient(90deg, #006847 33.3%, #ffffff 33.3% 66.6%, #ce1126 66.6%)",
  RSA: `linear-gradient(180deg, #e03c31 0 30%, transparent 30% 70%, #002395 70%), 
        linear-gradient(90deg, #000 0 20%, transparent 45%), 
        linear-gradient(180deg, #fff 0 33.3%, #007a4d 33.3% 66.6%, #fff 66.6%), #007a4d`,
  KOR: "radial-gradient(circle at 50% 50%, #cd2e3a 0 25%, #0047a0 25% 50%, transparent 50%), #ffffff",
  CZE: "conic-gradient(from 90deg at 50% 50%, #11457e 0 25%, transparent 0), linear-gradient(#ffffff 50%, #d7141a 50%)",

  // Grupo B
  CAN: "linear-gradient(90deg, #ff0000 25%, #ffffff 25% 75%, #ff0000 75%)",
  QAT: "linear-gradient(90deg, #ffffff 33%, #8d1b3d 33%)",
  BIH: "linear-gradient(135deg, #fecb00 0 50%, #002395 50%)",
  SUI: "linear-gradient(90deg, transparent 45%, #fff 45% 55%, transparent 55%), linear-gradient(#fff 40% 60%, #da291c 0), #da291c",

  // Grupo C
  USA: "repeating-linear-gradient(#b22234 0 7.69%, #fff 7.69% 15.38%), linear-gradient(90deg, #3c3b6e 0 40%, transparent 40%)",
  PAR: "linear-gradient(#d52b1e 33.3%, #ffffff 33.3% 66.6%, #0038a8 66.6%)",
  AUS: "linear-gradient(90deg, #012169 0 100%)", // Base azul (detalhes complexos requerem SVG)
  TUR: "radial-gradient(circle at 40% 50%, transparent 0 20%, #e30a17 21%), #e30a17",

  // Grupo D
  BRA: "radial-gradient(circle at 50% 50%, #254aa5 0 18%, transparent 19%), linear-gradient(135deg, transparent 35%, #f6d743 35% 65%, transparent 65%), #169b62",
  MAR: "radial-gradient(circle, transparent 20%, #006233 20% 25%, transparent 25%), #c1272d",
  HAI: "linear-gradient(#00209f 50%, #d21034 50%)",
  SCO: "linear-gradient(135deg, transparent 45%, #fff 45% 55%, transparent 55%), linear-gradient(45deg, #005eb8 45%, #fff 45% 55%, #005eb8 55%)",

  // Grupo E
  GER: "linear-gradient(#000 33.3%, #d00 33.3% 66.6%, #ffce00 66.6%)",
  CIV: "linear-gradient(90deg, #ff8200 33.3%, #ffffff 33.3% 66.6%, #009e60 66.6%)",
  CUW: "linear-gradient(#002b7f 40%, #f9e814 40% 50%, #002b7f 50%)",
  ECU: "linear-gradient(#ffdd00 50%, #0033a0 50% 75%, #ed1c24 75%)",

  // Grupo F
  NED: "linear-gradient(#ae1c28 33.3%, #ffffff 33.3% 66.6%, #21468b 66.6%)",
  JPN: "radial-gradient(circle at 50% 50%, #bc002d 0 35%, transparent 36%), #ffffff",
  TUN: "radial-gradient(circle at 50% 50%, #ffffff 0 40%, #e70013 40%), #e70013",
  SWE: "linear-gradient(90deg, transparent 30%, #fecc00 30% 40%, transparent 40%), linear-gradient(#fecc00 45% 55%, #006aa7 0), #006aa7",

  // Grupo G
  BEL: "linear-gradient(90deg, #000 33.3%, #ffd935 33.3% 66.6%, #ff2b2b 66.6%)",
  EGY: "linear-gradient(#ce1126 33.3%, #ffffff 33.3% 66.6%, #000000 66.6%)",
  IRN: "linear-gradient(#239f40 33.3%, #ffffff 33.3% 66.6%, #da0000 66.6%)",
  NZL: "#00247d", // Base azul (detalhes complexos requerem SVG)

  // Grupo H
  ESP: "linear-gradient(#aa151b 25%, #fabd00 25% 75%, #aa151b 75%)",
  CPV: "linear-gradient(#003893 50%, #ffffff 50% 55%, #cf2027 55% 65%, #ffffff 65% 70%, #003893 70%)",
  KSA: "#006c35",
  URU: "repeating-linear-gradient(#ffffff 0 11.1%, #0038a8 11.1% 22.2%)",

  // Grupo I
  FRA: "linear-gradient(90deg, #002654 33.3%, #ffffff 33.3% 66.6%, #ce1126 66.6%)",
  SEN: "linear-gradient(90deg, #00853f 33.3%, #fdef42 33.3% 66.6%, #e31b23 66.6%)",
  IRQ: "linear-gradient(#ff0000 33.3%, #ffffff 33.3% 66.6%, #000000 66.6%)",
  NOR: "linear-gradient(90deg, transparent 20%, #00205b 20% 30%, transparent 30%), linear-gradient(#00205b 45% 55%, #ba0c2f 0), #ba0c2f",

  // Grupo J
  ARG: "linear-gradient(#75aadb 33.3%, #ffffff 33.3% 66.6%, #75aadb 66.6%)",
  ALG: "linear-gradient(90deg, #006233 50%, #ffffff 50%)",
  AUT: "linear-gradient(#ed2939 33.3%, #ffffff 33.3% 66.6%, #ed2939 66.6%)",
  JOR: "linear-gradient(#000000 33.3%, #ffffff 33.3% 66.6%, #007a3d 66.6%)",

  // Grupo K
  POR: "linear-gradient(90deg, #046a38 40%, #da291c 40%)",
  COD: "linear-gradient(135deg, #007fff 0 70%, #ce1021 70% 75%, #f7d618 75%)",
  UZB: "linear-gradient(#0099b5 33.3%, #ffffff 33.3% 66.6%, #1eb53a 66.6%)",
  COL: "linear-gradient(#fcd116 50%, #003893 50% 75%, #ce1126 75%)",

  // Grupo L
  ENG: `linear-gradient(90deg, transparent 0 45%, #ce1124 45% 55%, transparent 55%), 
        linear-gradient(180deg, transparent 0 40%, #ce1124 40% 60%, transparent 60%), 
        #ffffff`, CRO: "linear-gradient(#ff0000 33.3%, #ffffff 33.3% 66.6%, #171796 66.6%)",
  GHA: "linear-gradient(#ed1c24 33.3%, #ffff00 33.3% 66.6%, #006b3f 66.6%)",
  PAN: "conic-gradient(at 50% 50%, #fff 25%, #da121a 25% 50%, #fff 50% 75%, #07237f 75%)",
};