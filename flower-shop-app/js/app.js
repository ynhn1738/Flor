// Flơr — UI wiring.
(() => {
  const D = window.FLOR_DATA;
  const C = window.FLOR_CONFIG;
  const E = window.FLOR_ENGINE;
  const IMG = window.FLOR_IMAGE;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const state = { step: 1, picks: { occasion: [], gender: [], vibe: [], colors: [], flowers: [], avoid: [], wrap: ["auto"] }, mbti: null, seed: 0, recipe: null, imgSeed: 0 };
  const fmt = (v) => v.toLocaleString("vi-VN") + "đ";

  // ---------- build option lists ----------
  function chip(v, label, extra = "") {
    return `<button type="button" data-v="${v}" ${extra}>${label}</button>`;
  }
  $("#occasionChips").innerHTML = Object.entries(D.OCCASIONS).map(([k, o]) => chip(k, o.vi)).join("");
  $("#vibeChips").innerHTML = Object.entries(D.VIBES).map(([k, v]) => chip(k, v.vi)).join("");
  $("#colorChips").innerHTML = Object.entries(D.COLORS)
    .map(([k, c]) => `<button type="button" data-v="${k}" title="${c.vi}"><i style="background:${c.hex}"></i><span>${c.vi}</span></button>`).join("");
  $("#wrapChips").innerHTML =
    `<button type="button" data-v="auto"><i class="auto"></i><span>Để Flơr chọn</span></button>` +
    Object.entries(D.WRAPS).map(([k, w]) => `<button type="button" data-v="${k}"><i style="background:${w.hex}"></i><span>${w.vi.replace("Giấy ", "")}</span></button>`).join("");
  const flowerOpts = Object.entries(D.FLOWERS).map(([k, f]) => chip(k, f.vi)).join("");
  $("#flowerChips").innerHTML = flowerOpts;
  $("#avoidChips").innerHTML = flowerOpts;

  const types = ["INFP", "INFJ", "ENFP", "ENFJ", "INTJ", "INTP", "ENTJ", "ENTP", "ISFJ", "ISTJ", "ESFJ", "ESTJ", "ISFP", "ISTP", "ESFP", "ESTP"];
  $("#mbtiGrid").innerHTML = types.map((t) => `<button type="button" data-v="${t}"><b>${t}</b><small>${D.MBTI_NAMES[t]}</small></button>`).join("");

  // ---------- chip selection ----------
  function syncChips(group) {
    const name = group.dataset.name;
    $$("button", group).forEach((b) => b.classList.toggle("on", state.picks[name].includes(b.dataset.v)));
  }
  $$("[data-name]").forEach((group) => {
    const name = group.dataset.name;
    const single = group.hasAttribute("data-single");
    const max = Number(group.dataset.max) || 99;
    group.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const v = b.dataset.v;
      let arr = state.picks[name];
      if (single) arr = arr[0] === v && name !== "wrap" ? [] : [v];
      else if (arr.includes(v)) arr = arr.filter((x) => x !== v);
      else if (arr.length < max) arr = [...arr, v];
      else arr = [...arr.slice(1), v];
      state.picks[name] = arr;
      // A flower cannot be both favourite and avoided
      if (name === "flowers") state.picks.avoid = state.picks.avoid.filter((x) => !arr.includes(x));
      if (name === "avoid") state.picks.flowers = state.picks.flowers.filter((x) => !arr.includes(x));
      $$("[data-name]").forEach(syncChips);
    });
    syncChips(group);
  });

  $("#mbtiGrid").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    state.mbti = state.mbti === b.dataset.v ? null : b.dataset.v;
    $$("#mbtiGrid button").forEach((x) => x.classList.toggle("on", x.dataset.v === state.mbti));
    const g = state.mbti && D.MBTI_GROUPS[groupOf(state.mbti)];
    $("#mbtiHint").textContent = g ? `${g.vi}: ${g.note}.` : "Không rõ? Cứ bỏ qua — Flơr sẽ dựa vào các thông tin khác.";
  });
  const groupOf = (t) => (t[1] === "N" ? (t[2] === "F" ? "NF" : "NT") : t[3] === "J" ? "SJ" : "SP");

  // ---------- budget & date ----------
  const budget = $("#budget");
  budget.min = C.budgetMin;
  budget.max = C.budgetMax;
  budget.value = C.budgetDefault;
  const paintBudget = () => {
    $("#budgetOut").textContent = fmt(Number(budget.value));
    const pct = ((budget.value - budget.min) / (budget.max - budget.min)) * 100;
    budget.style.setProperty("--pct", pct + "%");
  };
  budget.addEventListener("input", paintBudget);
  paintBudget();

  const dd = $("#deliveryDate");
  const today = new Date();
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  dd.min = iso(today);
  dd.value = iso(new Date(today.getTime() + 86400000));
  const paintSeason = () => {
    $("#seasonHint").textContent = E.isHighSeason(dd.value)
      ? "Ngày lễ cao điểm: giá hoa ngoài chợ tăng mạnh, bó hoa sẽ nhỏ hơn với cùng ngân sách. Đặt sớm để Flơr giữ hoa đẹp nhé."
      : "";
  };
  dd.addEventListener("change", paintSeason);
  paintSeason();

  $("#dob").max = iso(today);
  $("#dob").addEventListener("change", () => {
    const z = E.zodiacOf($("#dob").value);
    const badge = $("#zodiacBadge");
    badge.hidden = !z;
    if (z) badge.innerHTML = `<b>${z.sym} ${z.vi}</b> · nguyên tố ${D.ELEMENTS[z.el].vi} — ${z.trait}`;
  });

  // ---------- wizard navigation ----------
  function show(id) {
    $$(".view").forEach((v) => v.classList.toggle("active", v.id === id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function goStep(n) {
    state.step = n;
    $$(".step").forEach((s) => s.classList.toggle("active", Number(s.dataset.step) === n));
    $$(".progress span").forEach((s, i) => s.classList.toggle("done", i < n));
    $("#backBtn").style.visibility = "visible";
    $("#nextBtn").textContent = n === 4 ? "Thiết kế bó hoa ✿" : "Tiếp tục";
    show("wizard");
  }
  $$("[data-go]").forEach((b) => b.addEventListener("click", () => goStep(Number(b.dataset.go))));
  $("#backBtn").addEventListener("click", () => (state.step === 1 ? show("intro") : goStep(state.step - 1)));
  $("#nextBtn").addEventListener("click", () => {
    if (state.step === 1 && !state.picks.occasion.length) {
      flash($("#occasionChips"));
      return;
    }
    if (state.step < 4) goStep(state.step + 1);
    else {
      state.seed = Math.floor(Math.random() * 1e9);
      state.shownMains = [];
      state.shownAccents = [];
      state.shownImgs = [];
      state.remix = 0;
      run();
    }
  });
  function flash(el) {
    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");
  }

  // ---------- compose + render ----------
  function collect() {
    const f = $("#wizard");
    return {
      occasion: state.picks.occasion[0],
      budget: Number(budget.value),
      deliveryDate: dd.value,
      receiverName: f.rName.value.trim(),
      relation: f.relation.value,
      gender: state.picks.gender[0],
      dob: f.dob.value,
      age: f.age.value,
      mbti: state.mbti,
      vibe: state.picks.vibe[0],
      colors: state.picks.colors,
      flowers: state.picks.flowers,
      avoid: state.picks.avoid,
      wrap: state.picks.wrap[0],
      message: f.message.value,
      customerName: f.cName.value.trim(),
      customerPhone: f.cPhone.value.trim(),
      seed: state.seed,
      skipMains: state.shownMains || [],
      skipAccents: state.shownAccents || [],
      remix: state.remix || 0,
    };
  }

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function run() {
    const input = collect();
    const r = E.compose(input);
    state.recipe = r;
    state.input = input;

    $("#rCode").textContent = r.code;
    $("#rFor").textContent = [r.occasion.vi, input.receiverName && `tặng ${input.receiverName}`, input.relation && `(${input.relation.toLowerCase()})`].filter(Boolean).join(" · ");
    $("#rBqName").textContent = `“${r.name}”`;
    $("#rPalette").innerHTML =
      r.palette.map((c) => `<span><i style="background:${D.COLORS[c].hex}"></i>${D.COLORS[c].vi}</span>`).join("") +
      `<span><i style="background:${r.wrap.hex}"></i>${r.wrap.vi.replace("Giấy ", "Giấy ")}</span>`;
    $("#rRecipe").innerHTML = r.items.map((i) => `<li><span>${i.role}</span>${esc(i.vi)}</li>`).join("");
    $("#rPrice").textContent = "~ " + fmt(r.price);
    $("#rSize").textContent = r.size;
    $("#rPriceNote").textContent =
      (r.high ? "Giá ngày lễ cao điểm. " : "") + `Gần giống mẫu ${r.ref.code} · ${r.ref.name}. Flơr sẽ xác nhận giá cuối cùng khi nhận đơn.`;
    $("#rReasons").innerHTML = r.reasons.map((x) => `<li>${esc(x)}</li>`).join("");
    $("#rWish").textContent = `“${r.wish}”`;
    const d = input.deliveryDate ? new Date(input.deliveryDate + "T00:00:00").toLocaleDateString("vi-VN") : "";
    $("#rMeta").innerHTML = [
      d && `Ngày nhận: <b>${d}</b>`,
      `Ngân sách: <b>${fmt(input.budget)}</b>`,
      input.customerName && `Người đặt: <b>${esc(input.customerName)}</b>`,
      input.customerPhone && `SĐT: <b>${esc(input.customerPhone)}</b>`,
    ].filter(Boolean).join(" · ");

    show("result");
    state.imgSeed = state.seed % 100000;
    state.aiUrl = null;
    state.matches = E.matchPortfolio(r, 3, state.shownImgs || []);
    $("#rThumbs").innerHTML =
      state.matches.map((m, i) => `<button type="button" data-i="${i}"><img src="assets/${m.img}" alt="" /></button>`).join("") +
      `<button type="button" data-i="ai" class="ai-tile"><span>✿</span>Bản phác AI</button>`;
    showReal(0);
  }

  const REAL_NOTE =
    "Ảnh thật từ bó hoa Flơr đã làm, dùng để tham khảo phong cách. Bó hoa của bạn được cắm thủ công theo công thức bên cạnh và hoa có sẵn trong ngày, nên sẽ không giống hệt ảnh.";
  const AI_NOTE = "Bản phác do AI vẽ theo đúng công thức bên cạnh · chỉ để hình dung, hoa thật sẽ khác.";

  function markThumb(i) {
    $$("#rThumbs button").forEach((b) => b.classList.toggle("on", b.dataset.i === String(i)));
  }

  function showReal(i) {
    const m = state.matches[i];
    if (!m) return showAI();
    const img = $("#rImg");
    $("#rLoading").hidden = true;
    img.classList.remove("ready");
    img.onload = () => img.classList.add("ready");
    img.src = `assets/${m.img}`;
    $("#rPhotoTag").textContent = m.code ? `Flơr đã làm · Mẫu ${m.code}` : `Flơr đã làm · Instagram @florinsaigon`;
    $("#rCaption").textContent = REAL_NOTE;
    $("#regenImgBtn").hidden = true;
    markThumb(i);
  }

  function showAI() {
    $("#rPhotoTag").textContent = "Bản phác AI";
    $("#rCaption").textContent = AI_NOTE;
    $("#regenImgBtn").hidden = false;
    markThumb("ai");
    if (state.aiUrl) {
      $("#rLoading").hidden = true;
      $("#rImg").src = state.aiUrl;
      return;
    }
    loadImage();
  }

  $("#rThumbs").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    b.dataset.i === "ai" ? showAI() : showReal(Number(b.dataset.i));
  });

  const loadingLines = ["Flơr đang chọn hoa ngoài chợ…", "Đang tỉa lá, cắt cành…", "Đang gói giấy, thắt nơ…", "Sắp xong rồi…"];
  async function loadImage() {
    const img = $("#rImg");
    const box = $("#rLoading");
    box.classList.remove("error");
    box.hidden = false;
    img.classList.remove("ready");
    let i = 0;
    $("#rLoadingText").textContent = loadingLines[0];
    const tick = setInterval(() => ($("#rLoadingText").textContent = loadingLines[Math.min(++i, loadingLines.length - 1)]), 6000);
    try {
      const url = await IMG.generate(state.recipe.prompt, state.imgSeed, state.matches[0]?.img);
      if (state.aiUrl) URL.revokeObjectURL(state.aiUrl);
      state.aiUrl = url;
      if ($("#rPhotoTag").textContent !== "Bản phác AI") return; // customer switched back to a real photo
      img.src = url;
      await img.decode().catch(() => {});
      img.classList.add("ready");
      box.hidden = true;
    } catch (e) {
      console.error("[Flor]", e);
      box.classList.add("error");
      $("#rLoadingText").textContent =
        e.status === 429
          ? "Hôm nay Flơr đã hết lượt phác thảo AI miễn phí. Bạn xem ảnh bó hoa thật bên dưới nhé, hoặc quay lại vào ngày mai."
          : "Chưa tạo được bản phác. Bấm “Bản phác AI khác” để thử lại.";
    } finally {
      clearInterval(tick);
    }
  }

  $("#regenImgBtn").addEventListener("click", () => {
    state.imgSeed = Math.floor(Math.random() * 100000);
    state.aiUrl = null;
    showAI();
  });
  $("#remixBtn").addEventListener("click", () => {
    state.seed = Math.floor(Math.random() * 1e9);
    state.remix = (state.remix || 0) + 1;
    // Skip every main flower already suggested; start over once all suitable ones were shown.
    state.shownMains = [...(state.shownMains || []), state.recipe.mainId];
    state.shownAccents = [...(state.shownAccents || []), state.recipe.accentId].filter(Boolean);
    state.shownImgs = [...(state.shownImgs || []), ...state.matches.map((m) => m.img)];
    run();
    if (state.shownMains.includes(state.recipe.mainId)) {
      state.shownMains = [];
      run();
    }
  });
  $("#editBtn").addEventListener("click", () => goStep(1));

  // ---------- export ----------
  async function cardBlob() {
    const canvas = await html2canvas($("#orderCard"), { scale: 2, backgroundColor: "#FBF8F1", useCORS: true });
    return new Promise((res) => canvas.toBlob(res, "image/png"));
  }
  const fileName = () => `Flor-${state.recipe.code}.png`;

  $("#saveBtn").addEventListener("click", async () => {
    const b = $("#saveBtn");
    b.disabled = true;
    try {
      const blob = await cardBlob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName();
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    } finally {
      b.disabled = false;
    }
  });

  // Web Share with files: lets mobile users send the card straight to Zalo / Messenger / Instagram.
  if (navigator.canShare && navigator.canShare({ files: [new File([""], "x.png", { type: "image/png" })] })) {
    $("#shareBtn").hidden = false;
    $("#shareBtn").addEventListener("click", async () => {
      try {
        const file = new File([await cardBlob()], fileName(), { type: "image/png" });
        await navigator.share({ files: [file], title: "Đặt hoa Flơr", text: `Mình muốn đặt bó “${state.recipe.name}” (${state.recipe.code})` });
      } catch (e) {
        if (e.name !== "AbortError") console.warn(e);
      }
    });
  }
})();
