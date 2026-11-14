// Flơr — bouquet composer.
// Turns the customer's answers into a recipe built only from flowers the shop sources,
// sized to the budget with the shop's own pricing formula, plus an image prompt for the AI.

window.FLOR_ENGINE = (() => {
  const D = window.FLOR_DATA;
  const C = window.FLOR_CONFIG;

  const MEANING = {
    rose: "tình yêu và sự trân trọng",
    sprayrose: "sự ngọt ngào, dịu dàng",
    carnation: "lòng biết ơn và tình mẹ",
    gerbera: "niềm vui và sự lạc quan",
    lisianthus: "sự chân thành, an yên",
    sunflower: "hy vọng và năng lượng tích cực",
    lily: "sự thanh cao, tôn kính",
    pompom: "sự sung túc, viên mãn",
    lotus: "sự thuần khiết, bình yên",
    hydrangea: "sự thấu hiểu, chân thành",
    tana: "sự hồn nhiên, trong trẻo",
    statice: "kỷ niệm không phai",
    bluestar: "niềm tin và sự chung thuỷ",
    strawflower: "tình cảm bền lâu",
    lace: "sự tinh khôi, che chở",
  };

  const COLOR_NOUN = {
    red: "Nhung Đỏ", pink: "Phấn Hồng", peach: "Đào Mơ", white: "Mây Trắng", cream: "Sữa Ngà",
    yellow: "Nắng Mật", orange: "Hoàng Hôn", purple: "Tím Mộng", blue: "Trời Xanh", green: "Lá Non",
  };
  const VIBE_ADJ = {
    romantic: "Say Đắm", elegant: "Kiêu Sa", cute: "Ngọt Ngào", cheerful: "Rạng Rỡ", dreamy: "Bay Bổng",
    minimal: "Thanh Khiết", classic: "Vĩnh Cửu", bold: "Rực Lửa", calm: "An Yên", grateful: "Tri Ân",
  };

  // ---------- helpers ----------
  function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const round10k = (v) => Math.round(v / 10000) * 10000;
  const mmdd = (d) => `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  function zodiacOf(dobStr) {
    if (!dobStr) return null;
    const d = new Date(dobStr + "T00:00:00");
    if (isNaN(d)) return null;
    const k = mmdd(d);
    return D.ZODIAC.find((z) => (z.from <= z.to ? k >= z.from && k <= z.to : k >= z.from || k <= z.to)) || null;
  }

  function ageOf(input) {
    if (input.age) return Number(input.age);
    if (!input.dob) return null;
    const d = new Date(input.dob + "T00:00:00");
    if (isNaN(d)) return null;
    const now = new Date();
    let a = now.getFullYear() - d.getFullYear();
    if (mmdd(now) < mmdd(d)) a--;
    return a;
  }

  function mbtiGroup(mbti) {
    if (!mbti || mbti.length !== 4) return null;
    const t = mbti.toUpperCase();
    return t[1] === "N" ? (t[2] === "F" ? "NF" : "NT") : t[3] === "J" ? "SJ" : "SP";
  }

  function isHighSeason(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr + "T00:00:00");
    if (isNaN(d)) return false;
    const k = mmdd(d);
    return D.HIGH_SEASON.some(([a, b]) => k >= a && k <= b);
  }

  function plural(en, n) {
    if (n === 1 || /s$|lace$|tweedia$|greenery$|leaves$/.test(en)) return en;
    if (/y$/.test(en)) return en.slice(0, -1) + "ies";
    return en + "s";
  }

  // ---------- main ----------
  function compose(input) {
    const rand = rng(input.seed || Date.now());
    const jitter = () => rand() * 1.2;
    const occ = D.OCCASIONS[input.occasion] || D.OCCASIONS.justbecause;
    const zodiac = zodiacOf(input.dob);
    const element = zodiac ? D.ELEMENTS[zodiac.el] : null;
    const group = mbtiGroup(input.mbti);
    const groupInfo = group ? D.MBTI_GROUPS[group] : null;
    const age = ageOf(input);
    const avoid = new Set(input.avoid || []);
    const avoidColors = new Set(input.avoidColors || []);

    // Vibes, strongest first
    const vibes = [input.vibe, occ.vibe, groupInfo && groupInfo.vibe, element && element.vibe].filter(Boolean);
    const vibe = vibes[0];

    // Palette
    let palette = (input.colors || []).filter((c) => !avoidColors.has(c));
    const fallback = [...occ.palette, ...(zodiac ? zodiac.colors : [])].filter((c) => !avoidColors.has(c));
    if (!palette.length) {
      const both = occ.palette.filter((c) => zodiac && zodiac.colors.includes(c));
      palette = both.length ? both : fallback.slice(0, 2);
    }
    if (!palette.length) palette = ["pink"];
    palette = [...new Set([...palette, ...fallback])].slice(0, 3);
    const primary = palette[0];

    // Budget → flower cost the shop can spend
    const high = isHighSeason(input.deliveryDate);
    const P = high ? C.pricing.high : C.pricing.normal;
    const budget = Number(input.budget) || C.budgetDefault;
    const flowerBudget = Math.max(40000, (budget - P.add) / P.mult);
    // Very large budgets get bigger bouquets, not just pricier flowers
    const scale = clamp(flowerBudget / 250000, 1, 3);
    const maxOf = (f) => Math.round(f.max * scale);

    // Score focal flowers
    function scoreFlower(id, f) {
      if (avoid.has(id)) return -Infinity;
      let s = jitter();
      s += (occ.flowers[id] || 0) * 3;
      if (zodiac) s += (zodiac.flowers[id] || 0) * 2;
      if ((input.flowers || []).includes(id)) s += 12;
      vibes.forEach((v, i) => { if (f.tags.includes(v)) s += i === 0 ? 3 : 1.5; });
      if (f.colors.includes(primary)) s += 4; else if (palette.some((c) => f.colors.includes(c))) s += 1.5; else s -= 6;
      if (age != null && age >= 50 && ["lily", "carnation", "lotus", "rose"].includes(id)) s += 1;
      if (age != null && age < 25 && ["gerbera", "sprayrose", "tana", "sunflower"].includes(id)) s += 1;
      if (input.occasion === "sympathy" && !f.colors.includes("white")) s -= 20;
      if (input.occasion !== "sympathy" && id === "lily" && (input.flowers || []).indexOf("lily") < 0) s -= 1;
      // Big budget + small cheap flower = underspent bouquet; nudge toward flowers that can fill it
      if (maxOf(f) * f.unit < flowerBudget * 0.4) s -= 4;
      return s;
    }

    const mains = Object.entries(D.FLOWERS)
      .filter(([, f]) => f.role === "main")
      .map(([id, f]) => ({ id, f, s: scoreFlower(id, f) }))
      .filter((x) => x.s > -Infinity)
      .sort((a, b) => b.s - a.s);

    // First main whose minimum stem count fits the budget. "Gợi ý bó khác" passes the mains already shown
    // in skipMains so each remix moves to the next-best flower instead of repeating the same one.
    const fits = (m) => Math.floor((flowerBudget * 0.65) / m.f.unit) >= m.f.min;
    const skip = new Set(input.skipMains || []);
    // Only reasonable alternatives: a flower scoring far below the best one does not suit this occasion or palette.
    const suitable = (m) => m.s >= mains[0].s - 12;
    let main = mains.find((m) => fits(m) && suitable(m) && !skip.has(m.id)) || mains.find(fits) || mains[mains.length - 1] || { id: "gerbera", f: D.FLOWERS.gerbera };
    const mainColor = main.f.colors.includes(primary) ? primary : palette.find((c) => main.f.colors.includes(c)) || main.f.colors[0];

    // Accent: different flower, complementary color
    const accentColorPref = palette.find((c) => c !== mainColor) || "white";
    const accents = Object.entries(D.FLOWERS)
      .filter(([id, f]) => id !== main.id && (f.role === "accent" || f.role === "main") && !avoid.has(id))
      .map(([id, f]) => {
        let s = jitter() + (f.role === "accent" ? 2 : 0);
        if (f.colors.includes(accentColorPref)) s += 3;
        if (f.colors.includes("white")) s += 1;
        if ((input.flowers || []).includes(id)) s += 10;
        vibes.forEach((v) => { if (f.tags.includes(v)) s += 1; });
        if (zodiac) s += (zodiac.flowers[id] || 0);
        s += (occ.flowers[id] || 0) * 0.5;
        if (f.unit > 15000) s -= 2;
        return { id, f, s };
      })
      .sort((a, b) => b.s - a.s);

    // Allocate and size
    const items = [];
    let mainCount = clamp(Math.floor((flowerBudget * 0.65) / main.f.unit), main.f.min, maxOf(main.f));
    let leftover = flowerBudget - mainCount * main.f.unit;

    let accent = null;
    // On remix, try accents not used in earlier suggestions first
    const usedAccents = new Set(input.skipAccents || []);
    for (const a of [...accents.filter((a) => !usedAccents.has(a.id)), ...accents.filter((a) => usedAccents.has(a.id))]) {
      const n = clamp(Math.floor((leftover * 0.55) / a.f.unit), 0, maxOf(a.f));
      if (n >= a.f.min) { accent = { ...a, count: n }; break; }
    }
    const accentColor = accent ? (accent.f.colors.includes(accentColorPref) ? accentColorPref : accent.f.colors.includes("white") ? "white" : accent.f.colors[0]) : null;
    if (accent) leftover -= accent.count * accent.f.unit;

    const airy = ["dreamy", "romantic", "elegant", "calm"].includes(vibe);
    let filler = null;
    if (airy && !avoid.has("lace") && accent?.id !== "lace") {
      const n = clamp(Math.floor((leftover * 0.4) / D.FLOWERS.lace.unit), 0, D.FLOWERS.lace.max);
      if (n >= D.FLOWERS.lace.min) { filler = { id: "lace", f: D.FLOWERS.lace, count: n }; leftover -= n * D.FLOWERS.lace.unit; }
    }

    // Large budgets: add a premium statement flower
    let premium = null;
    if (leftover > flowerBudget * 0.3 && flowerBudget > 150000) {
      const pick = ["hydrangea", "pompom", "lily"]
        .filter((id) => id !== main.id && id !== accent?.id && !avoid.has(id))
        .map((id) => ({ id, f: D.FLOWERS[id] }))
        .sort((a, b) => (palette.some((c) => b.f.colors.includes(c)) ? 1 : 0) - (palette.some((c) => a.f.colors.includes(c)) ? 1 : 0))[0];
      if (pick) {
        const n = clamp(Math.floor((leftover * 0.6) / pick.f.unit), 1, maxOf(pick.f));
        const color = palette.find((c) => pick.f.colors.includes(c)) || pick.f.colors[0];
        premium = { ...pick, count: n, color };
        leftover -= n * pick.f.unit;
      }
    }

    const greenId = { dreamy: "eucalyptus", romantic: "dustymiller", elegant: "dustymiller", classic: "dustymiller", minimal: "eucalyptus", calm: "eucalyptus", cheerful: "fern", cute: "eucalyptus", bold: "fern", grateful: "fern" }[vibe] || "eucalyptus";
    const green = D.GREENS[greenId];
    const greenCount = clamp(Math.round(Math.max(leftover - 5000, 0) / green.unit), 3, Math.round(12 * scale));

    // Wrap and ribbon
    const male = input.gender === "male";
    let wrapId = input.wrap && input.wrap !== "auto" ? input.wrap : null;
    if (!wrapId) {
      const byColor = {
        red: ["black", "cream", "white"], pink: ["cream", "white", "pink"], peach: ["cream", "kraft", "white"],
        white: ["sage", "kraft", "tiffany"], cream: ["kraft", "sage", "white"], yellow: ["sage", "white", "kraft"],
        orange: ["kraft", "cream", "sage"], purple: ["white", "cream", "pink"], blue: ["white", "cream", "kraft"], green: ["white", "kraft", "cream"],
      }[mainColor] || ["cream"];
      let options = byColor;
      if (groupInfo) options = [...byColor.filter((w) => groupInfo.wrap.includes(w)), ...byColor];
      if (male && !["cute", "dreamy"].includes(vibe)) options = [...options.filter((w) => ["black", "kraft", "white", "sage"].includes(w)), ...options];
      if (input.occasion === "sympathy") options = ["white", "cream"];
      options = [...new Set(options)];
      wrapId = options[((input.remix || 0) + Math.floor(rand() * 2)) % options.length];
    }
    const wrap = D.WRAPS[wrapId];
    const ribbonId = {
      red: "red", pink: "pink", peach: "cream", white: wrapId === "sage" ? "sage" : "white", cream: "cream",
      yellow: "sage", orange: "orange", purple: "white", blue: "blue", green: "white",
    }[mainColor] || "cream";
    const ribbon = D.RIBBONS[ribbonId];

    // Cost and price, then shrink if above budget
    const papers = mainCount + (accent?.count || 0) + (premium?.count || 0) * 3 > 18 ? 5 : 3;
    const costOf = (mc) => mc * main.f.unit + (accent ? accent.count * accent.f.unit : 0) + (filler ? filler.count * filler.f.unit : 0) + (premium ? premium.count * premium.f.unit : 0) + greenCount * green.unit + 5000;
    const priceOf = (mc) => round10k(costOf(mc) * P.mult + P.add);
    while (mainCount > main.f.min && priceOf(mainCount) > budget * 1.05) mainCount--;
    const price = priceOf(mainCount);

    items.push({ role: "Hoa chính", vi: `${mainCount} ${main.f.vi} màu ${D.COLORS[mainColor].vi.toLowerCase()}`, id: main.id });
    if (accent) items.push({ role: "Hoa phụ", vi: `${accent.count} ${accent.f.vi} màu ${D.COLORS[accentColor].vi.toLowerCase()}`, id: accent.id });
    if (premium) items.push({ role: "Hoa nhấn", vi: `${premium.count} ${premium.f.vi} màu ${D.COLORS[premium.color].vi.toLowerCase()}`, id: premium.id });
    if (filler) items.push({ role: "Hoa bay", vi: `${filler.count} ${filler.f.vi}`, id: filler.id });
    items.push({ role: "Lá", vi: `${greenCount} ${green.vi} + 1 bó đinh lăng` });
    items.push({ role: "Gói", vi: `${papers} ${wrap.vi.toLowerCase()} · 1 ${ribbon.vi.toLowerCase()}` });

    const totalStems = mainCount + (accent?.count || 0) + (filler?.count || 0) + (premium?.count || 0) * 3;
    const size = totalStems <= 14 ? "Nhỏ · S" : totalStems <= 30 ? "Vừa · M" : "Lớn · L";

    // Closest catalog model, as a reference for the florist
    const ref = D.CATALOG.map((p) => {
      let s = 0;
      if (p.main === main.id) s += 5;
      if (accent && p.main === accent.id) s += 2;
      if (p.colors.includes(mainColor)) s += 2;
      s -= Math.abs((high ? p.high : p.price) - price) / 60000;
      return { p, s };
    }).sort((a, b) => b.s - a.s)[0].p;

    // Story
    const reasons = [];
    reasons.push(`${occ.vi}: ${main.f.vi.toLowerCase()} tượng trưng cho ${MEANING[main.id]}.`);
    if (zodiac) reasons.push(`${zodiac.sym} ${zodiac.vi} (nguyên tố ${element.vi}) — ${zodiac.trait}; hợp ${element.note}.`);
    if (groupInfo) reasons.push(`${input.mbti.toUpperCase()} · ${D.MBTI_NAMES[input.mbti.toUpperCase()] || groupInfo.vi}: ${groupInfo.note}.`);
    if ((input.flowers || []).length) {
      const kept = input.flowers.filter((f) => f === main.id || f === accent?.id).map((f) => D.FLOWERS[f].vi);
      if (kept.length) reasons.push(`Có ${kept.join(", ").toLowerCase()} — loài hoa người nhận yêu thích.`);
    }
    if ((input.colors || []).length) reasons.push(`Tông ${input.colors.filter((c) => !avoidColors.has(c)).map((c) => D.COLORS[c].vi.toLowerCase()).join(" – ")} theo màu người nhận yêu thích.`);
    if (premium) reasons.push(`${premium.f.vi} làm điểm nhấn sang trọng — ${MEANING[premium.id]}.`);
    if (accent) reasons.push(`${accent.f.vi} điểm xuyết thêm ý nghĩa ${MEANING[accent.id]}.`);

    const name = `${COLOR_NOUN[mainColor]} ${VIBE_ADJ[vibe] || "Dịu Dàng"}`;

    // Image prompt
    // Image models cannot count stems, so describe quantity loosely and describe the wrapping like a florist would.
    // Avoid negatives ("no vase"): FLUX has no negative prompt and tends to draw whatever is named.
    const qty = (n) => (n <= 4 ? "a few" : n <= 10 ? "several" : n <= 20 ? "a generous bunch of" : "an abundant cluster of");
    // Arrangement follows a triangular framework (apex at top, wide base above the paper), with one dominant flower,
    // accents interspersed among the main blooms rather than grouped apart, staggered heights, balance and texture contrast.
    // Avoid wording like "drifts" or "on the sides": the model then separates flower types into zones.
    const parts = [
      `${qty(mainCount)} ${D.COLORS[mainColor].en} ${plural(main.f.en, 2)} as the dominant flower`,
      accent && `${qty(accent.count)} ${D.COLORS[accentColor].en} ${plural(accent.f.en, 2)} mixed in among them`,
      premium && `${premium.count === 1 ? "one" : "a few"} ${D.COLORS[premium.color].en} ${plural(premium.f.en, premium.count)}`,
      filler && `airy sprigs of white ${filler.f.en}`,
      `${green.en}`,
    ].filter(Boolean);
    const shape = {
      minimal: "Clean and restrained, with a little space between stems.",
      classic: "Compact and tidy, yet clearly layered.",
      dreamy: "Loose and airy, with a few delicate stems softly breaking the outline.",
      romantic: "Lush and full, with blooms nestled at different depths.",
    }[vibe] || "Natural and full.";
    const sizeEn = size.startsWith("Lớn") ? "large, full" : size.startsWith("Vừa") ? "medium-sized" : "small, dainty";
    const prompt =
      `A real smartphone photo of a ${sizeEn} hand-tied bouquet from a modern Korean-style flower boutique in Saigon. ` +
      `Flowers: ${parts.join("; ")}. ` +
      `Composition follows a classic triangular framework: the arrangement forms the shape of an upright triangle. ` +
      `A single tall stem, a bud or a smaller bloom, marks the apex at the top center; the outline widens gradually down both sides ` +
      `to a broad base just above the paper wrapping. The largest, most open blooms form the focal point in the lower center of the triangle; ` +
      `smaller blooms and buds step up toward the apex and outer edges, so heights rise gradually from base to tip. ` +
      `Every flower type is interspersed evenly through the whole triangle, each kind appearing on the left, center and right, woven between the others. ` +
      `${filler ? "Filler fills small gaps throughout. " : ""}Foliage frames the base and backs the outline. ` +
      `${shape} Visually balanced, with clear front-to-back depth and soft round petals contrasting fine filler and leaves. ` +
      `The stems are wrapped in several sheets of ${wrap.en}, layered and folded into soft pointed petal shapes that fan out behind the flowers like a collar, ` +
      `with a sheer inner layer of tissue. A large ${ribbon.en} bow is tied around the stems with long ribbon tails. ` +
      `${D.VIBES[vibe]?.en || "elegant"} mood, fresh natural petals with real texture. ` +
      `The whole bouquet is centered upright against a plain light grey textured paper backdrop, soft window daylight, ` +
      `gentle shadow, true-to-life colors, Instagram florist product photo.`;

    const now = new Date();
    const code = `FLR-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String((input.seed || 0) % 10000).padStart(4, "0")}`;

    return {
      code, name, occasion: occ, wish: input.message?.trim() || occ.wish,
      zodiac, element, mbti: input.mbti ? input.mbti.toUpperCase() : null, group: groupInfo,
      palette, mainColor, items, size, wrap, ribbon, price, budget, high, ref, reasons, prompt, vibe,
      mainId: main.id, accentId: accent?.id || null, premiumId: premium?.id || null, wrapId, occasionId: input.occasion,
    };
  }

  // Rank the shop's real bouquets (portfolio.js) by how close they are to a composed recipe.
  // skip: photos already shown in earlier suggestions; they drop behind unseen photos of similar fit.
  function matchPortfolio(r, n = 3, skip = []) {
    const P = window.FLOR_PORTFOLIO || [];
    return P.map((p) => {
      let s = 0;
      if (p.flowers.includes(r.mainId)) s += 6;
      if (r.accentId && p.flowers.includes(r.accentId)) s += 2.5;
      if (r.premiumId && p.flowers.includes(r.premiumId)) s += 1.5;
      if (p.colors[0] === r.mainColor) s += 3;
      else if (p.colors.includes(r.mainColor)) s += 2;
      s += r.palette.filter((c) => p.colors.includes(c)).length;
      s -= p.colors.filter((c) => !r.palette.includes(c)).length * 0.5;
      if (p.occasions.includes(r.occasionId)) s += 2;
      if (p.wrap && p.wrap === r.wrapId) s += 1;
      if (p.code && p.code === r.ref.code) s += 1.5;
      if (p.type !== "bouquet") s -= 1.5;
      if (skip.includes(p.img)) s -= 4;
      return { ...p, score: s };
    })
      .sort((a, b) => b.score - a.score)
      .slice(0, n);
  }

  return { compose, matchPortfolio, zodiacOf, isHighSeason };
})();
