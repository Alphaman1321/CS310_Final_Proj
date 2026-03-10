"use client";

import { useState, useEffect, useRef } from "react";

// ── Sample JSON (replace with real API later) ──────────────────────────────
const SAMPLE_DATA = {
  location: { city: "Chicago", state: "Illinois", country: "USA", latitude: 41.8781, longitude: -87.6298 },
  dates: { gregorian: "Monday, March 9, 2026", hijri: "9 Ramadan 1447 AH" },
  times: { suhoor: "5:12 AM", iftar: "6:48 PM" },
  mealRecommender: {
    sampleQuestion: "I want to eat something with chicken that's sweet and tangy but not too sweet. I also only have garlic, soy sauce, honey, lemon, and rice at home.",
    sampleResponse: `Here's a perfect Iftar meal for you: **Honey Garlic Glazed Chicken over Steamed Rice**

**Ingredients you'll use:**
- Chicken (any cut works)
- 3 cloves garlic, minced
- 2 tbsp soy sauce
- 1.5 tbsp honey
- Juice of half a lemon
- Rice

**Instructions:**
1. Mix soy sauce, honey, garlic, and lemon juice into a glaze.
2. Sear chicken over medium-high heat for 4-5 min per side.
3. Pour glaze over chicken and let it caramelize for 3-4 min.
4. Serve over steamed rice.

The lemon cuts through the honey's sweetness — light, satisfying, and quick before Iftar!`,
  },
  nutritionix: {
    sampleMeal: "Honey Garlic Chicken with Steamed Rice",
    foods: [
      { food_name: "Grilled Chicken Breast", serving_qty: 1, serving_unit: "medium breast (174g)", nf_calories: 284, nf_total_fat: 6.2, nf_saturated_fat: 1.4, nf_cholesterol: 136, nf_sodium: 390, nf_total_carbohydrate: 0, nf_dietary_fiber: 0, nf_sugars: 0, nf_protein: 53.4, nf_potassium: 440 },
      { food_name: "Honey Garlic Sauce", serving_qty: 2, serving_unit: "tbsp", nf_calories: 64, nf_total_fat: 0.1, nf_saturated_fat: 0, nf_cholesterol: 0, nf_sodium: 320, nf_total_carbohydrate: 16.2, nf_dietary_fiber: 0.1, nf_sugars: 14.8, nf_protein: 0.6, nf_potassium: 38 },
      { food_name: "Steamed White Rice", serving_qty: 1, serving_unit: "cup (186g)", nf_calories: 242, nf_total_fat: 0.4, nf_saturated_fat: 0.1, nf_cholesterol: 0, nf_sodium: 2, nf_total_carbohydrate: 53.2, nf_dietary_fiber: 0.6, nf_sugars: 0, nf_protein: 4.4, nf_potassium: 55 },
    ],
  },
  // ── Sample saved meal history (replace with real DB later) ────────────────
  mealHistory: [
    { date: "Mon, Mar 9 2026", meal: "Honey Garlic Chicken & Rice", calories: 590 },
    { date: "Sun, Mar 8 2026", meal: "Lentil Soup with Pita Bread", calories: 420 },
    { date: "Sat, Mar 7 2026", meal: "Grilled Salmon with Vegetables", calories: 510 },
    { date: "Fri, Mar 6 2026", meal: "Lamb Kofta with Couscous", calories: 670 },
    { date: "Thu, Mar 5 2026", meal: "Stuffed Bell Peppers", calories: 380 },
  ],
};
// ──────────────────────────────────────────────────────────────────────────

function GeometricBackground() {
  return (
    <svg className="geo-bg" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <pattern id="star" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <polygon points="40,4 49,28 74,28 55,44 62,68 40,54 18,68 25,44 6,28 31,28" fill="none" stroke="rgba(52,211,153,0.07)" strokeWidth="1" />
          <polygon points="40,16 46,34 64,34 50,44 56,62 40,52 24,62 30,44 16,34 34,34" fill="none" stroke="rgba(56,189,248,0.05)" strokeWidth="0.5" />
        </pattern>
        <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(52,211,153,0.04)" strokeWidth="0.5" />
        </pattern>
        <radialGradient id="centerGlow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="rgba(16,185,129,0.12)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <rect width="100%" height="100%" fill="url(#star)" />
      <rect width="100%" height="100%" fill="url(#centerGlow)" />
    </svg>
  );
}

function CrescentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
      <path d="M22 14c0 4.418-3.582 8-8 8a8 8 0 01-6.928-12A6 6 0 0022 14z" fill="url(#crescentGrad)" />
      <defs><linearGradient id="crescentGrad" x1="8" y1="6" x2="22" y2="22"><stop stopColor="#34d399" /><stop offset="1" stopColor="#38bdf8" /></linearGradient></defs>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="5" fill="url(#sunGrad)" />
      {[0,45,90,135,180,225,270,315].map((angle, i) => (
        <line key={i}
          x1={14 + 8 * Math.cos((angle * Math.PI) / 180)} y1={14 + 8 * Math.sin((angle * Math.PI) / 180)}
          x2={14 + 11 * Math.cos((angle * Math.PI) / 180)} y2={14 + 11 * Math.sin((angle * Math.PI) / 180)}
          stroke="url(#sunGrad)" strokeWidth="1.5" strokeLinecap="round"
        />
      ))}
      <defs><linearGradient id="sunGrad" x1="4" y1="4" x2="24" y2="24"><stop stopColor="#fbbf24" /><stop offset="1" stopColor="#f97316" /></linearGradient></defs>
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 1C5.239 1 3 3.239 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.761-2.239-5-5-5z" stroke="#34d399" strokeWidth="1.2" fill="rgba(52,211,153,0.15)" />
      <circle cx="8" cy="6" r="1.5" fill="#34d399" />
    </svg>
  );
}

function SparkleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2l2.4 7.2H22l-6.2 4.5 2.4 7.3L12 17l-6.2 4 2.4-7.3L2 9.2h7.6L12 2z" fill="url(#sparkleGrad)" />
      <defs><linearGradient id="sparkleGrad" x1="2" y1="2" x2="22" y2="22"><stop stopColor="#34d399" /><stop offset="1" stopColor="#818cf8" /></linearGradient></defs>
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="url(#uploadGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="17 8 12 3 7 8" stroke="url(#uploadGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="3" x2="12" y2="15" stroke="url(#uploadGrad)" strokeWidth="1.5" strokeLinecap="round"/>
      <defs><linearGradient id="uploadGrad" x1="3" y1="3" x2="21" y2="21"><stop stopColor="#38bdf8" /><stop offset="1" stopColor="#818cf8" /></linearGradient></defs>
    </svg>
  );
}

function CountdownTimer({ targetTime, label }: { targetTime: string; label: string }) {
  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const [timePart, meridiem] = targetTime.split(" ");
      const [h, m] = timePart.split(":").map(Number);
      let hours = h;
      if (meridiem === "PM" && h !== 12) hours += 12;
      if (meridiem === "AM" && h === 12) hours = 0;
      const target = new Date();
      target.setHours(hours, m, 0, 0);
      if (target < now) target.setDate(target.getDate() + 1);
      const diff = Math.max(0, target.getTime() - now.getTime());
      const hh = Math.floor(diff / 3600000);
      const mm = Math.floor((diff % 3600000) / 60000);
      const ss = Math.floor((diff % 60000) / 1000);
      setCountdown(`${hh}h ${mm}m ${ss}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetTime]);
  return (
    <div className="countdown">
      <span className="countdown-label">{label} in</span>
      <span className="countdown-value">{countdown}</span>
    </div>
  );
}

function RenderResponse({ text }: { text: string }) {
  return (
    <div className="meal-response-text">
      {text.split("\n").map((line, i) => {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className={line.startsWith("**") && line.endsWith("**") ? "response-section-header" : ""}>
            {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
          </p>
        );
      })}
    </div>
  );
}

type NutritionFood = typeof SAMPLE_DATA.nutritionix.foods[0];

function NutritionCard({ food }: { food: NutritionFood }) {
  const nutrients = [
    { label: "Calories", value: food.nf_calories, unit: "kcal", highlight: true },
    { label: "Protein", value: food.nf_protein, unit: "g", color: "#34d399" },
    { label: "Carbs", value: food.nf_total_carbohydrate, unit: "g", color: "#38bdf8" },
    { label: "Fat", value: food.nf_total_fat, unit: "g", color: "#f97316" },
    { label: "Sugars", value: food.nf_sugars, unit: "g", color: "#fbbf24" },
    { label: "Fiber", value: food.nf_dietary_fiber, unit: "g", color: "#a3e635" },
    { label: "Sodium", value: food.nf_sodium, unit: "mg", color: "#e879f9" },
    { label: "Cholesterol", value: food.nf_cholesterol, unit: "mg", color: "#fb7185" },
  ];
  return (
    <div className="nutrition-card">
      <div className="nutrition-card-header">
        <span className="nutrition-food-name">{food.food_name}</span>
        <span className="nutrition-serving">{food.serving_qty} {food.serving_unit}</span>
      </div>
      <div className="nutrition-grid">
        {nutrients.map((n) => (
          <div key={n.label} className={`nutrient-item ${n.highlight ? "nutrient-highlight" : ""}`}>
            <span className="nutrient-value" style={n.color ? { color: n.color } : {}}>{n.value}</span>
            <span className="nutrient-unit">{n.unit}</span>
            <span className="nutrient-label">{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NutritionTotals({ foods }: { foods: NutritionFood[] }) {
  const totals = foods.reduce(
    (acc, f) => ({ calories: acc.calories + f.nf_calories, protein: acc.protein + f.nf_protein, carbs: acc.carbs + f.nf_total_carbohydrate, fat: acc.fat + f.nf_total_fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  return (
    <div className="nutrition-totals">
      <span className="totals-label">Total Meal</span>
      <div className="totals-row">
        <div className="total-item"><span className="total-val calories-val">{Math.round(totals.calories)}</span><span className="total-unit">kcal</span></div>
        <div className="total-sep" />
        <div className="total-item"><span className="total-val" style={{color:"#34d399"}}>{totals.protein.toFixed(1)}</span><span className="total-unit">g protein</span></div>
        <div className="total-sep" />
        <div className="total-item"><span className="total-val" style={{color:"#38bdf8"}}>{totals.carbs.toFixed(1)}</span><span className="total-unit">g carbs</span></div>
        <div className="total-sep" />
        <div className="total-item"><span className="total-val" style={{color:"#f97316"}}>{totals.fat.toFixed(1)}</span><span className="total-unit">g fat</span></div>
      </div>
    </div>
  );
}

// ── Navbar with login ──────────────────────────────────────────────────────
function Navbar({ loggedInUser, onLogin, onLogout }: {
  loggedInUser: string | null;
  onLogin: (u: string, p: string) => void;
  onLogout: () => void;
}) {
  const [showPanel, setShowPanel] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPanel(false);
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) { setError("Please fill in both fields."); return; }
    // Replace with real auth call later
    onLogin(username.trim(), password);
    setShowPanel(false);
    setError("");
    setUsername("");
    setPassword("");
  };

  const initials = loggedInUser ? loggedInUser.slice(0, 2).toUpperCase() : "";

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <CrescentIcon />
        <span className="navbar-name">Ramadan Ready</span>
      </div>

      <div className="navbar-right" ref={panelRef}>
        {!loggedInUser ? (
          <>
            <button className="nav-login-btn" onClick={() => setShowPanel(p => !p)}>
              Sign In
            </button>
            {showPanel && (
              <div className="login-dropdown">
                <div className="login-dropdown-title">Welcome back</div>
                <div className="login-dropdown-sub">Sign in to save your meals & get personalised recommendations</div>
                <input
                  className="login-input"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(""); }}
                />
                <input
                  className="login-input"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                />
                {error && <div className="login-error">{error}</div>}
                <button className="login-submit-btn" onClick={handleLogin}>
                  Save &amp; Sign In
                </button>
                <div className="login-note">
                  Meals are saved with today&apos;s date and used to improve your recommendations.
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <button className="nav-user-btn" onClick={() => { setShowHistory(p => !p); setShowPanel(false); }}>
              <div className="nav-avatar">{initials}</div>
              <span className="nav-username">{loggedInUser}</span>
              <span className="nav-chevron">{showHistory ? "▲" : "▼"}</span>
            </button>
            {showHistory && (
              <div className="history-dropdown">
                <div className="history-header">
                  <span className="history-title">Meal History</span>
                  <span className="history-sub">Used to personalise your recommendations</span>
                </div>
                <div className="history-list">
                  {SAMPLE_DATA.mealHistory.map((item, i) => (
                    <div key={i} className="history-item">
                      <div className="history-item-left">
                        <span className="history-meal">{item.meal}</span>
                        <span className="history-date">{item.date}</span>
                      </div>
                      <span className="history-cal">{item.calories} kcal</span>
                    </div>
                  ))}
                </div>
                <button className="logout-btn" onClick={() => { onLogout(); setShowHistory(false); }}>
                  Sign Out
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
}

// ──────────────────────────────────────────────────────────────────────────

export default function Home() {
  const { location, dates, times, mealRecommender, nutritionix } = SAMPLE_DATA;
  const [visible, setVisible] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  // Meal recommender state
  const [query, setQuery] = useState("");
  const [mealResponse, setMealResponse] = useState<string | null>(null);
  const [mealLoading, setMealLoading] = useState(false);

  // Nutrition upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [nutritionData, setNutritionData] = useState<NutritionFood[] | null>(null);
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [saveMealStatus, setSaveMealStatus] = useState<"idle" | "saving" | "saved">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = (u: string, _p: string) => setLoggedInUser(u);
  const handleLogout = () => { setLoggedInUser(null); setSaveMealStatus("idle"); }

  const handleSaveMeal = () => {
    if (!loggedInUser || !nutritionData) return;
    setSaveMealStatus("saving");
    // Simulate DB save — replace with real AWS Lambda call later
    setTimeout(() => setSaveMealStatus("saved"), 1000);
  };

  const handleAsk = () => {
    if (!query.trim()) return;
    setMealLoading(true);
    setMealResponse(null);
    setTimeout(() => { setMealResponse(mealRecommender.sampleResponse); setMealLoading(false); }, 1200);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string);
      setNutritionData(null);
      setNutritionLoading(true);
      setSaveMealStatus("idle");
      setTimeout(() => { setNutritionData(nutritionix.foods); setNutritionLoading(false); }, 1500);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImage(ev.target?.result as string);
      setNutritionData(null);
      setNutritionLoading(true);
      setSaveMealStatus("idle");
      setTimeout(() => { setNutritionData(nutritionix.foods); setNutritionLoading(false); }, 1500);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050d14; font-family: 'DM Sans', sans-serif; color: #e2f0fb; min-height: 100vh; overflow-x: hidden; }
        .geo-bg { position: fixed; inset: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 0; }

        /* ── Navbar ── */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          height: 56px; display: flex; align-items: center; justify-content: space-between;
          padding: 0 1.5rem;
          background: rgba(5,13,20,0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(52,211,153,0.1);
        }
        .navbar-brand { display: flex; align-items: center; gap: 0.5rem; }
        .navbar-name { font-family: 'Amiri', serif; font-size: 1.1rem; font-weight: 700; background: linear-gradient(135deg, #34d399, #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .navbar-right { position: relative; display: flex; align-items: center; }

        /* Sign in button (logged out) */
        .nav-login-btn { font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 500; color: #34d399; background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.25); border-radius: 100px; padding: 0.4rem 1rem; cursor: pointer; transition: all 0.2s ease; }
        .nav-login-btn:hover { background: rgba(52,211,153,0.15); border-color: rgba(52,211,153,0.45); }

        /* Login dropdown */
        .login-dropdown {
          position: absolute; top: calc(100% + 12px); right: 0;
          width: 280px;
          background: linear-gradient(145deg, rgba(5,25,45,0.98), rgba(2,15,30,0.99));
          border: 1px solid rgba(52,211,153,0.2); border-radius: 16px;
          padding: 1.4rem 1.3rem; display: flex; flex-direction: column; gap: 0.8rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(52,211,153,0.05);
          animation: fadeIn 0.2s ease;
        }
        .login-dropdown-title { font-family: 'Amiri', serif; font-size: 1.1rem; font-weight: 700; color: #e2f0fb; }
        .login-dropdown-sub { font-size: 0.7rem; color: rgba(148,185,214,0.5); line-height: 1.5; margin-top: -0.3rem; }
        .login-input { background: rgba(255,255,255,0.04); border: 1px solid rgba(52,211,153,0.15); border-radius: 10px; padding: 0.65rem 0.9rem; color: #e2f0fb; font-family: 'DM Sans', sans-serif; font-size: 0.83rem; outline: none; transition: border-color 0.2s ease; }
        .login-input::placeholder { color: rgba(148,185,214,0.3); }
        .login-input:focus { border-color: rgba(52,211,153,0.4); }
        .login-error { font-size: 0.72rem; color: #fb7185; margin-top: -0.3rem; }
        .login-submit-btn { padding: 0.75rem; background: linear-gradient(135deg, rgba(52,211,153,0.15), rgba(56,189,248,0.15)); border: 1px solid rgba(52,211,153,0.3); border-radius: 10px; color: #34d399; font-family: 'DM Sans', sans-serif; font-size: 0.83rem; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
        .login-submit-btn:hover { background: linear-gradient(135deg, rgba(52,211,153,0.25), rgba(56,189,248,0.25)); }
        .login-note { font-size: 0.65rem; color: rgba(148,185,214,0.35); line-height: 1.5; text-align: center; border-top: 1px solid rgba(52,211,153,0.08); padding-top: 0.6rem; }

        /* User button (logged in) */
        .nav-user-btn { display: flex; align-items: center; gap: 0.5rem; background: rgba(52,211,153,0.07); border: 1px solid rgba(52,211,153,0.2); border-radius: 100px; padding: 0.3rem 0.8rem 0.3rem 0.35rem; cursor: pointer; transition: all 0.2s ease; }
        .nav-user-btn:hover { background: rgba(52,211,153,0.13); }
        .nav-avatar { width: 26px; height: 26px; border-radius: 50%; background: linear-gradient(135deg, #34d399, #38bdf8); display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 700; color: #050d14; flex-shrink: 0; }
        .nav-username { font-size: 0.8rem; font-weight: 500; color: #e2f0fb; }
        .nav-chevron { font-size: 0.55rem; color: rgba(148,185,214,0.4); margin-left: 2px; }

        /* History dropdown */
        .history-dropdown {
          position: absolute; top: calc(100% + 12px); right: 0;
          width: 320px;
          background: linear-gradient(145deg, rgba(5,25,45,0.98), rgba(2,15,30,0.99));
          border: 1px solid rgba(52,211,153,0.2); border-radius: 16px;
          padding: 1.2rem; display: flex; flex-direction: column; gap: 0.8rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          animation: fadeIn 0.2s ease;
        }
        .history-header { display: flex; flex-direction: column; gap: 2px; padding-bottom: 0.7rem; border-bottom: 1px solid rgba(52,211,153,0.09); }
        .history-title { font-family: 'Amiri', serif; font-size: 1rem; font-weight: 700; color: #e2f0fb; }
        .history-sub { font-size: 0.65rem; color: rgba(148,185,214,0.4); }
        .history-list { display: flex; flex-direction: column; gap: 0.4rem; }
        .history-item { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.6rem 0.8rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(52,211,153,0.08); border-radius: 10px; }
        .history-item-left { display: flex; flex-direction: column; gap: 1px; }
        .history-meal { font-size: 0.8rem; color: #e2f0fb; font-weight: 500; }
        .history-date { font-size: 0.62rem; color: rgba(148,185,214,0.4); }
        .history-cal { font-size: 0.75rem; font-weight: 600; color: #34d399; white-space: nowrap; flex-shrink: 0; }
        .logout-btn { padding: 0.6rem; background: rgba(251,113,133,0.07); border: 1px solid rgba(251,113,133,0.18); border-radius: 10px; color: #fb7185; font-family: 'DM Sans', sans-serif; font-size: 0.78rem; font-weight: 500; cursor: pointer; transition: all 0.2s ease; text-align: center; }
        .logout-btn:hover { background: rgba(251,113,133,0.14); }

        /* ── Page ── */
        .page { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 5rem 1.5rem 3rem; gap: 1.5rem; }

        /* Header */
        .header { text-align: center; opacity: 0; transform: translateY(-20px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .header.visible { opacity: 1; transform: translateY(0); }
        .header-arabic { font-family: 'Amiri', serif; font-size: 0.95rem; color: rgba(52,211,153,0.6); letter-spacing: 0.2em; margin-bottom: 0.2rem; }
        .header-title { font-family: 'Amiri', serif; font-size: 2.2rem; font-weight: 700; background: linear-gradient(135deg, #34d399 0%, #38bdf8 60%, #818cf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1.1; }
        .header-sub { font-size: 0.72rem; color: rgba(148,185,214,0.45); text-transform: uppercase; letter-spacing: 0.25em; margin-top: 0.3rem; }

        /* Dashboard */
        .dashboard { width: 100%; max-width: 480px; background: linear-gradient(145deg, rgba(5,25,45,0.92) 0%, rgba(2,15,30,0.96) 100%); border: 1px solid rgba(52,211,153,0.18); border-radius: 20px; padding: 1.4rem 1.5rem; position: relative; overflow: hidden; opacity: 0; transform: translateY(30px); transition: opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s; box-shadow: 0 16px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(52,211,153,0.08); }
        .dashboard.visible { opacity: 1; transform: translateY(0); }
        .dashboard::before { content: ''; position: absolute; top: -40px; right: -40px; width: 150px; height: 150px; background: radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 70%); pointer-events: none; }

        .dates-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(52,211,153,0.09); margin-bottom: 1rem; }
        .date-block { display: flex; flex-direction: column; gap: 1px; }
        .date-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.2em; color: rgba(52,211,153,0.55); font-weight: 500; }
        .date-gregorian { font-size: 0.88rem; font-weight: 500; color: #e2f0fb; }
        .date-hijri { font-family: 'Amiri', serif; font-size: 1rem; color: #38bdf8; text-align: right; }
        .divider-dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(52,211,153,0.25); flex-shrink: 0; }
        .times-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem; }
        .time-card { background: rgba(255,255,255,0.025); border: 1px solid rgba(52,211,153,0.1); border-radius: 14px; padding: 1rem; display: flex; flex-direction: column; gap: 0.4rem; transition: border-color 0.3s ease, transform 0.3s ease; cursor: default; }
        .time-card:hover { border-color: rgba(52,211,153,0.3); transform: translateY(-2px); }
        .time-card.suhoor { border-top: 2px solid rgba(52,211,153,0.4); }
        .time-card.iftar  { border-top: 2px solid rgba(251,191,36,0.4); }
        .time-card-header { display: flex; align-items: center; gap: 0.4rem; }
        .time-card-name { font-size: 0.68rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.18em; color: rgba(148,185,214,0.65); }
        .time-value { font-family: 'Amiri', serif; font-size: 1.9rem; font-weight: 700; line-height: 1; }
        .time-card.suhoor .time-value { background: linear-gradient(135deg, #34d399, #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .time-card.iftar .time-value  { background: linear-gradient(135deg, #fbbf24, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .time-desc { font-size: 0.65rem; color: rgba(148,185,214,0.4); }
        .countdown { display: flex; align-items: center; gap: 0.35rem; }
        .countdown-label { font-size: 0.6rem; color: rgba(148,185,214,0.35); text-transform: uppercase; letter-spacing: 0.1em; }
        .countdown-value { font-size: 0.7rem; font-weight: 500; color: rgba(52,211,153,0.75); font-variant-numeric: tabular-nums; }
        .location-bar { display: flex; align-items: center; justify-content: center; gap: 0.4rem; padding: 0.6rem 1rem; background: rgba(52,211,153,0.04); border: 1px solid rgba(52,211,153,0.09); border-radius: 100px; }
        .location-text { font-size: 0.75rem; color: rgba(148,185,214,0.65); }
        .location-highlight { color: #34d399; font-weight: 500; }

        /* Two-column */
        .bottom-grid { width: 100%; max-width: 1100px; display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; opacity: 0; transform: translateY(30px); transition: opacity 0.9s ease 0.4s, transform 0.9s ease 0.4s; }
        .bottom-grid.visible { opacity: 1; transform: translateY(0); }
        .panel { background: linear-gradient(145deg, rgba(5,25,45,0.92) 0%, rgba(2,15,30,0.96) 100%); border-radius: 20px; padding: 1.6rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; box-shadow: 0 16px 50px rgba(0,0,0,0.45); }
        .panel-meal { border: 1px solid rgba(129,140,248,0.2); box-shadow: 0 16px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(129,140,248,0.08); }
        .panel-nutrition { border: 1px solid rgba(56,189,248,0.2); box-shadow: 0 16px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(56,189,248,0.08); }
        .panel-title-row { display: flex; align-items: flex-start; gap: 0.6rem; }
        .panel-title { font-family: 'Amiri', serif; font-size: 1.35rem; font-weight: 700; line-height: 1.1; }
        .meal-title-grad { background: linear-gradient(135deg, #34d399, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .nutrition-title-grad { background: linear-gradient(135deg, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .panel-subtitle { font-size: 0.68rem; color: rgba(148,185,214,0.4); margin-top: 0.1rem; }

        .meal-textarea { width: 100%; min-height: 100px; resize: vertical; background: rgba(255,255,255,0.03); border: 1px solid rgba(129,140,248,0.2); border-radius: 14px; padding: 0.9rem 1rem; color: #e2f0fb; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; line-height: 1.6; outline: none; transition: border-color 0.3s ease; display: block; }
        .meal-textarea::placeholder { color: rgba(148,185,214,0.3); }
        .meal-textarea:focus { border-color: rgba(129,140,248,0.45); }
        .meal-btn { width: 100%; padding: 0.8rem; background: linear-gradient(135deg, rgba(52,211,153,0.1), rgba(129,140,248,0.1)); border: 1px solid rgba(52,211,153,0.22); border-radius: 12px; color: #34d399; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500; cursor: pointer; letter-spacing: 0.05em; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .meal-btn:hover:not(:disabled) { background: linear-gradient(135deg, rgba(52,211,153,0.2), rgba(129,140,248,0.2)); border-color: rgba(52,211,153,0.4); transform: translateY(-1px); }
        .meal-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .meal-response { background: rgba(52,211,153,0.04); border: 1px solid rgba(52,211,153,0.12); border-radius: 14px; padding: 1.1rem 1.2rem; animation: fadeIn 0.5s ease; max-height: 340px; overflow-y: auto; }
        .meal-response::-webkit-scrollbar { width: 4px; }
        .meal-response::-webkit-scrollbar-thumb { background: rgba(52,211,153,0.2); border-radius: 4px; }
        .response-tag { font-size: 0.58rem; text-transform: uppercase; letter-spacing: 0.18em; color: rgba(52,211,153,0.5); margin-bottom: 0.6rem; }
        .meal-response-text p { font-size: 0.82rem; color: rgba(200,225,245,0.82); line-height: 1.75; margin-bottom: 0.25rem; }
        .meal-response-text strong { color: #34d399; font-weight: 600; }
        .meal-response-text p.response-section-header { color: #38bdf8; margin-top: 0.4rem; }

        .upload-zone { border: 1.5px dashed rgba(56,189,248,0.25); border-radius: 14px; padding: 1.5rem 1rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.6rem; cursor: pointer; transition: all 0.3s ease; background: rgba(56,189,248,0.03); min-height: 130px; }
        .upload-zone:hover { border-color: rgba(56,189,248,0.5); background: rgba(56,189,248,0.06); }
        .upload-hint { font-size: 0.75rem; color: rgba(148,185,214,0.45); text-align: center; }
        .upload-hint span { color: #38bdf8; font-weight: 500; }
        .image-preview-wrap { position: relative; border-radius: 14px; overflow: hidden; border: 1px solid rgba(56,189,248,0.2); }
        .image-preview { width: 100%; max-height: 200px; object-fit: cover; display: block; border-radius: 14px; }
        .image-change-btn { position: absolute; bottom: 0.6rem; right: 0.6rem; font-size: 0.65rem; padding: 4px 10px; background: rgba(5,15,30,0.85); border: 1px solid rgba(56,189,248,0.3); border-radius: 100px; color: #38bdf8; cursor: pointer; transition: all 0.2s ease; }
        .image-change-btn:hover { background: rgba(56,189,248,0.15); }
        .nutrition-results { display: flex; flex-direction: column; gap: 0.75rem; animation: fadeIn 0.5s ease; max-height: 380px; overflow-y: auto; padding-right: 2px; }
        .nutrition-results::-webkit-scrollbar { width: 4px; }
        .nutrition-results::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.2); border-radius: 4px; }
        .nutrition-card { background: rgba(56,189,248,0.04); border: 1px solid rgba(56,189,248,0.12); border-radius: 14px; padding: 1rem 1.1rem; }
        .nutrition-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.8rem; gap: 0.5rem; }
        .nutrition-food-name { font-size: 0.85rem; font-weight: 600; color: #e2f0fb; }
        .nutrition-serving { font-size: 0.65rem; color: rgba(148,185,214,0.45); text-align: right; flex-shrink: 0; }
        .nutrition-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
        .nutrient-item { display: flex; flex-direction: column; align-items: center; background: rgba(255,255,255,0.03); border-radius: 8px; padding: 0.4rem 0.3rem; }
        .nutrient-item.nutrient-highlight { background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.15); }
        .nutrient-value { font-size: 0.85rem; font-weight: 700; color: #38bdf8; font-variant-numeric: tabular-nums; line-height: 1.2; }
        .nutrient-item.nutrient-highlight .nutrient-value { font-size: 1rem; color: #f0f9ff; }
        .nutrient-unit { font-size: 0.55rem; color: rgba(148,185,214,0.4); }
        .nutrient-label { font-size: 0.6rem; color: rgba(148,185,214,0.55); text-align: center; margin-top: 1px; }
        .nutrition-totals { background: linear-gradient(135deg, rgba(52,211,153,0.06), rgba(56,189,248,0.06)); border: 1px solid rgba(52,211,153,0.15); border-radius: 14px; padding: 0.9rem 1.1rem; }
        .totals-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.18em; color: rgba(52,211,153,0.5); display: block; margin-bottom: 0.6rem; }
        .totals-row { display: flex; align-items: center; justify-content: space-around; gap: 0.5rem; }
        .total-item { display: flex; flex-direction: column; align-items: center; gap: 1px; }
        .total-val { font-size: 1.1rem; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1; }
        .calories-val { background: linear-gradient(135deg, #34d399, #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .total-unit { font-size: 0.6rem; color: rgba(148,185,214,0.45); }
        .total-sep { width: 1px; height: 30px; background: rgba(52,211,153,0.12); flex-shrink: 0; }

        /* Save meal button */
        .save-meal-btn { width: 100%; padding: 0.8rem; background: linear-gradient(135deg, rgba(56,189,248,0.1), rgba(129,140,248,0.1)); border: 1px solid rgba(56,189,248,0.3); border-radius: 12px; color: #38bdf8; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 0.4rem; }
        .save-meal-btn:hover:not(:disabled) { background: linear-gradient(135deg, rgba(56,189,248,0.2), rgba(129,140,248,0.2)); border-color: rgba(56,189,248,0.5); transform: translateY(-1px); }
        .save-meal-btn:disabled { cursor: default; }
        .save-meal-btn.saved { border-color: rgba(52,211,153,0.4); color: #34d399; background: linear-gradient(135deg, rgba(52,211,153,0.1), rgba(56,189,248,0.1)); }
        .save-spinner { width: 12px; height: 12px; border: 2px solid rgba(56,189,248,0.3); border-top-color: #38bdf8; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .save-login-prompt { font-size: 0.78rem; color: rgba(148,185,214,0.5); text-align: center; padding: 0.7rem; background: rgba(255,255,255,0.02); border: 1px dashed rgba(148,185,214,0.1); border-radius: 12px; }
        .save-login-prompt span { color: #38bdf8; font-weight: 500; cursor: pointer; }

        .loading-dots { display: flex; gap: 5px; justify-content: center; padding: 1.2rem 0; }        .loading-dots span { width: 6px; height: 6px; border-radius: 50%; background: #34d399; animation: bounce 1.2s infinite; }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; background: #38bdf8; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; background: #818cf8; }
        @keyframes bounce { 0%,80%,100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        .footer { font-size: 0.65rem; color: rgba(148,185,214,0.2); letter-spacing: 0.1em; text-align: center; opacity: 0; transition: opacity 1s ease 0.6s; }
        .footer.visible { opacity: 1; }

        @media (max-width: 768px) {
          .bottom-grid { grid-template-columns: 1fr; max-width: 560px; }
          .dashboard { max-width: 560px; }
          .times-grid { grid-template-columns: 1fr; }
          .dates-row { flex-direction: column; gap: 0.5rem; }
          .divider-dot { display: none; }
          .date-hijri { text-align: left; }
          .login-dropdown, .history-dropdown { width: 260px; }
        }
      `}</style>

      <GeometricBackground />
      <Navbar loggedInUser={loggedInUser} onLogin={handleLogin} onLogout={handleLogout} />

      <main className="page">
        {/* Header */}
        <header className={`header ${visible ? "visible" : ""}`}>
          <p className="header-arabic">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</p>
          <h1 className="header-title">Ramadan Ready</h1>
          <p className="header-sub">Ramadan Mubarak · 1447 AH</p>
        </header>

        {/* Dashboard */}
        <section className={`dashboard ${visible ? "visible" : ""}`}>
          <div className="dates-row">
            <div className="date-block">
              <span className="date-label">Gregorian</span>
              <span className="date-gregorian">{dates.gregorian}</span>
            </div>
            <div className="divider-dot" />
            <div className="date-block" style={{ alignItems: "flex-end" }}>
              <span className="date-label">Hijri</span>
              <span className="date-hijri">{dates.hijri}</span>
            </div>
          </div>
          <div className="times-grid">
            <div className="time-card suhoor">
              <div className="time-card-header"><CrescentIcon /><span className="time-card-name">Suhoor</span></div>
              <div className="time-value">{times.suhoor}</div>
              <div className="time-desc">Pre-dawn meal ends</div>
              <CountdownTimer targetTime={times.suhoor} label="Ends" />
            </div>
            <div className="time-card iftar">
              <div className="time-card-header"><SunIcon /><span className="time-card-name">Iftar</span></div>
              <div className="time-value">{times.iftar}</div>
              <div className="time-desc">Fast breaking time</div>
              <CountdownTimer targetTime={times.iftar} label="Starts" />
            </div>
          </div>
          <div className="location-bar">
            <LocationIcon />
            <span className="location-text">
              <span className="location-highlight">{location.city}, {location.state}</span>
              {" "}· {location.latitude.toFixed(4)}°N, {Math.abs(location.longitude).toFixed(4)}°W
            </span>
          </div>
        </section>

        {/* Two-column bottom row */}
        <div className={`bottom-grid ${visible ? "visible" : ""}`}>

          {/* LEFT — Meal Recommender */}
          <div className="panel panel-meal">
            <div className="panel-title-row">
              <SparkleIcon size={20} />
              <div>
                <div className="panel-title meal-title-grad">Meal Recommender</div>
                <div className="panel-subtitle">Describe what you're craving + your ingredients</div>
              </div>
            </div>
            <textarea
              className="meal-textarea"
              placeholder={mealRecommender.sampleQuestion}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="meal-btn" onClick={handleAsk} disabled={mealLoading || !query.trim()}>
              <SparkleIcon size={15} />
              {mealLoading ? "Thinking..." : "Get Meal Recommendation"}
            </button>
            {mealLoading && <div className="loading-dots"><span /><span /><span /></div>}
            {mealResponse && !mealLoading && (
              <div className="meal-response">
                <div className="response-tag">✦ AI Recommendation</div>
                <RenderResponse text={mealResponse} />
              </div>
            )}
          </div>

          {/* RIGHT — Nutrition Upload */}
          <div className="panel panel-nutrition">
            <div className="panel-title-row">
              <UploadIcon />
              <div>
                <div className="panel-title nutrition-title-grad">Meal Nutrition</div>
                <div className="panel-subtitle">Upload a photo · Powered by Nutritionix</div>
              </div>
            </div>
            {!uploadedImage ? (
              <div className="upload-zone" onClick={() => fileInputRef.current?.click()} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
                <UploadIcon />
                <div className="upload-hint"><span>Click to upload</span> or drag & drop<br />a photo of your meal</div>
              </div>
            ) : (
              <div className="image-preview-wrap">
                <img src={uploadedImage} alt="Uploaded meal" className="image-preview" />
                <button className="image-change-btn" onClick={() => { setUploadedImage(null); setNutritionData(null); }}>Change photo</button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
            {nutritionLoading && <div className="loading-dots"><span /><span /><span /></div>}
            {nutritionData && !nutritionLoading && (
              <>
                <NutritionTotals foods={nutritionData} />
                <div className="nutrition-results">
                  {nutritionData.map((food, i) => <NutritionCard key={i} food={food} />)}
                </div>

                {/* Save Meal button */}
                {loggedInUser ? (
                  <button
                    className={`save-meal-btn ${saveMealStatus === "saved" ? "saved" : ""}`}
                    onClick={handleSaveMeal}
                    disabled={saveMealStatus !== "idle"}
                  >
                    {saveMealStatus === "idle" && <>💾 Save Meal to History</>}
                    {saveMealStatus === "saving" && <><span className="save-spinner" /> Saving...</>}
                    {saveMealStatus === "saved" && <>✓ Saved for {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</>}
                  </button>
                ) : (
                  <div className="save-login-prompt">
                    🔒 <span>Sign in</span> to save this meal to your history
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <footer className={`footer ${visible ? "visible" : ""}`}>
          Sample data · Connect AWS API, GPT & Nutritionix to go live
        </footer>
      </main>
    </>
  );
}