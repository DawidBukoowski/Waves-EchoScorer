import { useCallback, useState, useMemo, useEffect } from "react";
import { useEchoes } from "../contexts/CalcEchoContext";
import { WWSubstats } from "../data/WWEchoStats";
import { useScorerContext } from "../contexts/ScorerContext";
import { WWCharaBuilds } from "../data/WWCharacterBuild";
import { useDataContext } from "../contexts/CharacterDataContext";

interface ScoreMisc {
  [key: number]: { statVal: number };
}

export function EchoScorerFunction(index: number) {
  const { selectedCharacterId } = useDataContext();
  const { echoStats } = useEchoes();
  const { ScorerWeight } = useScorerContext();
  const [scoreMisc, setScoreMisc] = useState<ScoreMisc>({
    1: { statVal: 0 },
    2: { statVal: 0 },
    3: { statVal: 0 },
    4: { statVal: 0 },
    5: { statVal: 0 },
  });

  const echoStat = useMemo(
    () => Object.values(echoStats)[index - 1],
    [echoStats, index]
  );

  const set = Object.values(WWCharaBuilds)
    .find((set) => set.charaId === selectedCharacterId)
    ?.preferedSonata?.includes(echoStat.set);

  const valCalc = useCallback(
    (stat: number, statName: string) => {
      const st = Object.values(WWSubstats).find((s) => s.name === statName);
      const prefStat = WWCharaBuilds.find(
        (pre) => pre.charaId === selectedCharacterId
      )?.preferedSubStats.includes(statName.replace("%", ""));

      if (!st) {
        return 0;
      }

      const index = st.rolls.indexOf(stat);
      if (index === -1) {
        return 0;
      }

      // Determine if the character is DPS or support
      const supports = [1101, 1501];
      const dps = !supports.includes(selectedCharacterId || 0);

      // Calculate bonuses
      let dpsBonus = 0;
      let dpsSubBonus = 0;
      let supportBonus = 0;
      let flatBonus = 0;

      if (dps) {
        dpsBonus = ["Crit. Rate%", "Crit. DMG%"].includes(statName) ? 5 : 0;
        dpsSubBonus = ["ATK%"].includes(statName) ? 3 : 0;
        flatBonus = "ATK" === statName ? 2 : 0;
      } else if (supports.includes(selectedCharacterId || 0)) {
        supportBonus = ["HP%", "Energy Regen%"].includes(statName) ? 5 : 0;
        flatBonus = ["HP", "DEF"].includes(statName) ? 2 : 0;
      }

      // Calculate final score
      const statScore = (index + 1) * 0.5;
      const prefStatScore = prefStat ? 3 : 0;
      const score =
        (prefStatScore +
          statScore +
          dpsBonus +
          dpsSubBonus +
          supportBonus +
          flatBonus) *
        (set ? 1 : 0.5);

      console.log(
        `${statName} value: ${stat}, Index: ${index}, Stat Score: ${statScore}, Preferred Score: ${prefStatScore}, Total Score: ${score}`
      );

      return score;
    },
    [WWSubstats, selectedCharacterId, set]
  );

  const weights = useMemo(() => Object.values(ScorerWeight), [ScorerWeight]);

  const calculateScoreMisc = useMemo(() => {
    const updatedScoreMisc: ScoreMisc = { ...scoreMisc };

    try {
      const selectedSubStats = [
        echoStat.selectedSubStat1,
        echoStat.selectedSubStat2,
        echoStat.selectedSubStat3,
        echoStat.selectedSubStat4,
        echoStat.selectedSubStat5,
      ];

      selectedSubStats.forEach((subStat, idx) => {
        const subStatIndex = idx + 1;
        if (echoStat.id !== 0 && subStat) {
          const stat = subStat.value;
          const statName = subStat.stat;

          const val = valCalc(stat, statName);
          const finalValue = val;

          updatedScoreMisc[subStatIndex] = { statVal: finalValue };
        } else {
          updatedScoreMisc[subStatIndex] = { statVal: 0 };
        }
      });

      return updatedScoreMisc;
    } catch (error) {
      console.error("Error in scoring calculation:", error);
      return updatedScoreMisc;
    }
  }, [echoStat, weights, valCalc]);

  const scoreVal = useMemo(() => {
    return Object.values(calculateScoreMisc).reduce(
      (acc, curr) => acc + curr.statVal,
      0
    );
  }, [calculateScoreMisc]);

  console.log(`${echoStat.name} Echo`, scoreVal);

  const Score = useMemo(() => {
    if (scoreVal >= 45) return "OP";
    if (scoreVal >= 42.5) return "SSS+";
    if (scoreVal >= 40) return "SSS";
    if (scoreVal >= 37.5) return "SS+";
    if (scoreVal >= 35) return "SS";
    if (scoreVal >= 32.5) return "S+";
    if (scoreVal >= 30) return "S";
    if (scoreVal >= 27.5) return "A+";
    if (scoreVal >= 25) return "A";
    if (scoreVal >= 22.5) return "B+";
    if (scoreVal >= 20) return "B";
    if (scoreVal >= 17.5) return "C+";
    if (scoreVal >= 15) return "C";
    if (scoreVal >= 12.5) return "D+";
    if (scoreVal >= 10) return "D";
    if (scoreVal >= 5) return "D-";
    if (scoreVal < 5) return "Trash";
    return "";
  }, [scoreVal]);

  // Update the state only when necessary
  useEffect(() => {
    setScoreMisc(calculateScoreMisc);
  }, [calculateScoreMisc]);

  return Score;
}
