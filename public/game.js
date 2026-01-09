/* =========================
   GAME STATE
========================= */
const state = {
  cash: 5000000,        // tiền mặt
  fund: 0,              // quỹ Tết sum vầy
  joy: 0,               // điểm niềm vui Tết (ẩn)
  bond: 0,              // điểm gắn kết (ẩn)
  unexpected1: false,   // true = KHÔNG bảo dưỡng xe
  unexpected2: false,   // true = KHÔNG mua vali
  spentToday: 0         // chi tiêu trong ngày
};

/* =========================
   NAVIGATION
========================= */
function goToSlide(id) {
  document.querySelectorAll(".slide").forEach(s =>
    s.classList.remove("active")
  );
  const target = document.querySelector(`[data-slide="${id}"]`);
  if (target) target.classList.add("active");
}

function playDayIntro(intro, next) {
  state.spentToday = 0;
  goToSlide(intro);
  
}

/* =========================
   DAY 3 CONDITIONAL FLOW (QUAN TRỌNG)
========================= */
function goToDay3() {
  // Nếu ngày 1 KHÔNG bảo dưỡng xe → gặp sự cố
  if (state.unexpected1) {
    goToSlide(13); // tình huống hư xe
  } else {
    goToSlide(14); // bỏ qua, sang YEP
  }
}

/* =========================
   FUND
========================= */
function createFund(amount) {
  state.fund = amount;
  state.cash -= amount;
  playDayIntro(3, 4);
}

/* =========================
   SPENDING CORE LOGIC
========================= */
function spend(amount) {
  if (amount === 0) return true;

  // 1. Đủ tiền mặt
  if (state.cash >= amount) {
    state.cash -= amount;
    state.spentToday += amount;
    return true;
  }

  // 2. Không đủ tiền mặt nhưng còn quỹ
  if (state.fund > 0) {
    const ok = confirm(
      "Bạn không đủ tiền mặt. Bạn có chắc chắn muốn dùng tiền quỹ?"
    );

    // Đồng ý dùng quỹ
    if (ok && state.fund >= amount) {
      state.fund -= amount;
      state.spentToday += amount;
      return true;
    }

    // Người chơi bấm Cancel → KHÔNG trừ tiền, KHÔNG thua
    return false;
  }

  // 3. Hết tiền mặt + hết quỹ → GAME OVER
  alert("Bạn đã hết tiền. Game kết thúc!");
  goToSlide(18);
  return false;
}

/* =========================
   HANDLE PLAYER CHOICES
========================= */
function choose(action, cost = 0) {
  if (!spend(cost)) return;
  if (cost > 0) {
    moneyRain();
  }

  switch (action) {
    /* ----- DAY 1 ----- */
    case "baoDuong":
      state.unexpected1 = false; // đã bảo dưỡng → KHÔNG hư xe
      break;
    case "khongBaoDuong":
      state.unexpected1 = true;  // không bảo dưỡng → SẼ hư xe
      break;

    case "muaVali":
      state.unexpected2 = false;
      break;
    case "khongVali":
      state.unexpected2 = true;
      break;

    case "xaLang":
      state.joy += 2;
      break;
    case "canThiet":
      state.joy += 1;
      break;

    /* ----- DAY 2 ----- */
    case "catToc":
      state.joy += 1;
      break;

    case "quaXin":
      state.bond += 2;
      break;
    case "quaVua":
      state.bond += 1;
      break;

    /* ----- DAY 3 ----- */
    case "yepXaLang":
      state.bond += 2;
      break;
    case "yepTietKiem":
      state.bond += 1;
      break;
    case "khongYep":
      state.bond -= 1;
      break;

    case "flashBuy":
      state.joy += 1;
      break;
  }

  const current = parseInt(
    document.querySelector(".slide.active").dataset.slide
  );
  goToSlide(current + 1);
}

/* =========================
   END OF DAY SUMMARY
========================= */
function showSummary(next) {
  alert(
    `Chi tiêu hôm nay: ${state.spentToday.toLocaleString()}đ\n` +
    `Tiền mặt còn lại: ${state.cash.toLocaleString()}đ\n` +
    `Quỹ Tết sum vầy: ${state.fund.toLocaleString()}đ`
  );
  goToSlide(next);
}

/* =========================
   UNEXPECTED EVENTS
========================= */
function handleUnexpected1() {
  // BẮT BUỘC sửa xe nếu đã bỏ bảo dưỡng
  if (state.unexpected1) {
    spend(600000);
  }
  goToSlide(14); // qua YEP
}

function handleUnexpected2() {
  if (state.unexpected2) {
    state.bond -= 1;
    goToSlide(16);
  } else {
    endGame();
  }
}

/* =========================
   END GAME LOGIC
========================= */
function endGame() {
  const total = state.cash + state.fund;
  let financeMessage = "";
  let reflection = "";

  /* ====== KẾT LUẬN TÀI CHÍNH ====== */
  if (total > 1500000) {
    financeMessage =
  "Bạn đã đủ tiền mua vé xe về quê và còn dư tiền để lì xì&nbsp;Tết&nbsp;🎉";

    state.bond += 1;
  } else if (total >= 1250000) {
    financeMessage = "Bạn vừa đủ tiền mua vé xe về quê 👍";
  } else {
    financeMessage = "Bạn không đủ tiền mua vé xe về quê 😢";
  }

  /* ====== KẾT LUẬN HÀNH VI ====== */
  if (state.joy < 2) {
    reflection +=
      "Bạn đã dành hơi ít thời gian cho bản thân, hãy yêu chiều bản thân một chút nhé 💖<br>";
  }

  if (state.bond < 2) {
    reflection +=
      "Bạn đã dành hơi ít thời gian cho các mối quan hệ, đừng quên tận hưởng niềm vui từ sự đồng hành và gắn kết với những người xung quanh nhé 🤝<br>";
  }

  if (reflection === "") {
    reflection =
      "Bạn đã cân bằng khá tốt giữa bản thân và các mối quan hệ trong dịp Tết này 🌸";
  }
  

  /* ====== RENDER HTML ====== */
  document.getElementById("finalText").innerHTML = `
    <div class="final-balance">
      ${total.toLocaleString()}đ
    </div>

    <div class="final-stats">
      <div>🎊 Niềm vui Tết: <b>${state.joy}</b></div>
      <div>🤝 Gắn kết: <b>${state.bond}</b></div>
    </div>

    <div class="momo-conclusion">
      ${financeMessage}
    </div>

    <div class="final-reflection">
      ${reflection}
    </div>
  `;

  goToSlide(17);
}


/* =========================
   MONEY RAIN EFFECT
========================= */
function moneyRain(count = 18) {
  for (let i = 0; i < count; i++) {
    const money = document.createElement("div");
    money.className = "money";
    money.innerText = "💸";

    money.style.left = Math.random() * window.innerWidth + "px";
    money.style.animationDuration = 2 + Math.random() * 2 + "s";
    money.style.fontSize = 18 + Math.random() * 16 + "px";

    document.body.appendChild(money);

    setTimeout(() => money.remove(), 4000);
  }
}


/* =========================
   SAKURA EFFECT
========================= */
function startSakura(count = 12) {
  for (let i = 0; i < count; i++) {
    createSakura();
  }
}

function createSakura() {
  const sakura = document.createElement("div");
  sakura.className = "sakura";
  sakura.innerText = "🌸";

  sakura.style.left = Math.random() * window.innerWidth + "px";
  sakura.style.fontSize = 16 + Math.random() * 18 + "px";

  const fallDuration = 10 + Math.random() * 10; // rơi chậm
  const swingDuration = 3 + Math.random() * 4;

  sakura.style.animationDuration =
    `${fallDuration}s, ${swingDuration}s`;

  document.body.appendChild(sakura);

  setTimeout(() => {
    sakura.remove();
    createSakura(); // tạo lại để rơi liên tục
  }, fallDuration * 1000);
}
