import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Parse JSON request bodies
app.use(express.json());

// Initialize server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Post endpoint for expert model analysis and pedagogical commentary
app.post("/api/commentary", async (req, res) => {
  try {
    const { variables, result, customPrompt } = req.body;

    if (!variables || !result) {
      return res.status(400).json({ error: "Missing required variables or prediction result" });
    }

    const {
      offenseWeight,
      defenseWeight,
      midfieldWeight,
      experienceWeight,
      conditionWeight,
      cheeringBias,
      koreaOffense,
      mexicoOffense,
      koreaDefense,
      mexicoDefense,
      koreaMidfield,
      mexicoMidfield,
      koreaExperience,
      mexicoExperience,
      koreaCondition,
      mexicoCondition,
    } = variables;

    const {
      koreaWinPct,
      drawPct,
      mexicoWinPct,
      koreaExpectedGoals,
      mexicoExpectedGoals,
      expectedKoreaScore,
      expectedMexicoScore,
    } = result;

    // Build the academic prompt focused on data literacy, probability, and soccer realities
    const prompt = `
      너는 데이터 과학과 스포츠 분석학을 가르치는 대학교 교수이자 축구 전문가이다.
      학생이 직접 설계한 월드컵 승부 예측 모델(대한민국 vs 멕시코)의 가중치와 변수를 보고, 날카로우면서도 배움이 있는 '피드백 시뮬레이션 비평'을 작성해줘.

      [학생이 직접 조절한 입력값 (Rating out of 100)]:
      - 공격력 가중치: ${offenseWeight}%, 수비력 가중치: ${defenseWeight}%, 미드필더 가중치: ${midfieldWeight}%, 피파랭킹/경험 가중치: ${experienceWeight}%, 컨디션/기후 가중치: ${conditionWeight}%
      - 대한민국 공격력: ${koreaOffense} vs 멕시코 공격력: ${mexicoOffense}
      - 대한민국 수비력: ${koreaDefense} vs 멕시코 수비력: ${mexicoDefense}
      - 대한민국 중원장악력: ${koreaMidfield} vs 멕시코 중원장악력: ${mexicoMidfield}
      - 대한민국 피파랭킹/경험: ${koreaExperience} vs 멕시코 피파랭킹/경험: ${mexicoExperience}
      - 대한민국 기후/피지컬 컨디션: ${koreaCondition} vs 멕시코 기후/피지컬 컨디션: ${mexicoCondition}

      [★ 감정적 응원 점수 (Cheering Bias)]:
      - 대한민국 응원 가중치: ${cheeringBias}% (이 값이 높을수록, 대한민국 전력을 인위적으로 보완하여 계산하고 있음)

      [모델을 통해 자동 계산된 확률 및 스코어 결과]:
      - 대한민국 승리 확률: ${koreaWinPct}%, 무승부 확률: ${drawPct}%, 멕시코 승리 확률: ${mexicoWinPct}%
      - 경기당 예견된 평균 득점력: 대한민국 ${koreaExpectedGoals}골 vs 멕시코 ${mexicoExpectedGoals}골
      - 가장 확률이 높은 시나리오 스코어: 대한민국 ${expectedKoreaScore} : ${expectedMexicoScore} 멕시코

      ${customPrompt ? `[사용자의 추가 질문 및 피드백 요청]: "${customPrompt}"` : ""}

      ---
      [피드백 지침]:
      이 학습 도구는 "정답을 맞히는 것"이 아니라 "근거와 확률을 배우는 것"이 목표입니다.
      아래 4가지 항목으로 나누어 정중하고 분석적이며 한글로 답변해 주되, 감정적인 호들갑 없이 지적인 톤앤매너로 작성해주세요.

      1. **가중치 설계 및 데이터 평가 (Analysis of Custom Model)**:
         - 사용자가 설정한 가중치 배분(${offenseWeight}%, ${defenseWeight}% 등)이 축구 전술 분석 관점에서 어떤 전술 경향(예: 수비형 역습, 화끈한 공격 지향 등)을 표현하는지 분석해줄 것.
         - 특히 '대한민국 응원 지수(${cheeringBias}%)'가 설정되어 있다면, 이것이 객관적 추정 모델에 감정적 에너지가 침투했을 때 어떤 예측 왜곡(편향)을 만드는지 아주 지성적으로 짚어줘.

      2. **"35% 확률의 팀이 이기면 예측이 틀린 것인가?" (Probability Literacy)**:
         - 대한민국 승리 확률이 35% 혹은 다른 확률로 나왔을 때, 실제로 대한민국이 승리했다면 이 모델은 "틀린 모델"인지에 대답해줘.
         - 확률이란 "사건의 빈도이자 불확실성의 크기"이며, 35%는 거의 3번 중 1번은 실제로 일어나는 사건임을 비유를 통해 쉽게 설명하여 확률적 리터러시를 가르쳐줘.

      3. **"근거(Estimation) vs 응원(Cheering)"의 경계선 (Boundary of Reason & Hope)**:
         - 예측에서 데이터를 기반으로 한 '추정'과, 감정에 기초한 '응원'을 어떻게 구조적으로 분리해야 하는지 조언해줘.

      4. **이 예측 모델의 치명적 한계와 제언 (Critical Limitations)**:
         - 시뮬레이터에 표시되지 않는 승부처의 숨은 변수(예: 기습적인 레드카드 퇴장, 골키퍼의 미친 선방 쇼, 심판의 판정 경향, 감독의 도중 전술 변화 등)가 어떻게 90분의 시나리오를 완전히 뒤집는지 짚어주며 지식을 전수해줘.

      답변은 깔끔한 Markdown 형식(적절한 굵은 글씨, 글머리 기호)으로 정돈하여 읽기 좋게 구성해 주세요.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ commentary: response.text });
  } catch (error: any) {
    console.error("Gemini request failed:", error);
    res.status(500).json({ error: error.message || "Gemini 분석 처리 중 서버 오류가 발생했습니다." });
  }
});

// Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Running at http://localhost:${PORT}`);
  });
}

startServer();
