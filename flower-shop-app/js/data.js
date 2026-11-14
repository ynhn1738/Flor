// Flơr — reference data.
// Prices come from "Flơr - Product Portfolio + Cost & Price.xlsx" (Market cost sheet, realistic option).
// Edit here when market prices or the catalog change.

window.FLOR_DATA = (() => {
  // ---------- Flowers the shop actually sources ----------
  // role: main (focal) | accent | filler | green
  // unit: realistic cost per stem in VND (Market cost sheet)
  const FLOWERS = {
    rose:        { vi: "Hồng",            en: "rose",                 role: "main",   unit: 6000,  colors: ["red", "pink", "white", "peach", "cream"], tags: ["romantic", "classic", "elegant"], min: 3,  max: 50 },
    sprayrose:   { vi: "Hồng chùm",       en: "spray rose",           role: "main",   unit: 3400,  colors: ["pink", "white", "peach"],                 tags: ["romantic", "dreamy", "cute"],     min: 6,  max: 30 },
    carnation:   { vi: "Cẩm chướng (phăng)", en: "carnation",         role: "main",   unit: 4500,  colors: ["pink", "red", "white", "peach"],          tags: ["classic", "grateful", "cute"],    min: 5,  max: 25 },
    gerbera:     { vi: "Đồng tiền",       en: "gerbera daisy",        role: "main",   unit: 2500,  colors: ["pink", "yellow", "orange", "white", "red"], tags: ["cheerful", "cute", "bold"],    min: 5,  max: 25 },
    lisianthus:  { vi: "Lan tường",       en: "lisianthus",           role: "main",   unit: 3800,  colors: ["white", "pink", "purple", "green"],       tags: ["dreamy", "elegant", "minimal"],   min: 5,  max: 20 },
    sunflower:   { vi: "Hướng dương",     en: "sunflower",            role: "main",   unit: 7000,  colors: ["yellow"],                                 tags: ["cheerful", "bold"],               min: 1,  max: 12 },
    lily:        { vi: "Hoa ly",          en: "lily",                 role: "main",   unit: 28000, colors: ["white", "pink"],                          tags: ["elegant", "luxurious", "calm"],   min: 2,  max: 8  },
    pompom:      { vi: "Cúc mẫu đơn",     en: "pompom chrysanthemum", role: "main",   unit: 30000, colors: ["white", "pink", "green", "yellow"],       tags: ["luxurious", "cute", "elegant"],   min: 2,  max: 8  },
    lotus:       { vi: "Sen",             en: "lotus",                role: "main",   unit: 8000,  colors: ["pink", "white"],                          tags: ["calm", "vietnamese", "elegant"],  min: 3,  max: 12 },
    hydrangea:   { vi: "Cẩm tú cầu",      en: "hydrangea",            role: "accent", unit: 20000, colors: ["blue", "white", "pink", "purple"],        tags: ["dreamy", "luxurious"],            min: 1,  max: 3  },
    tana:        { vi: "Cúc tana",        en: "feverfew daisies",     role: "accent", unit: 2000,  colors: ["white"],                                  tags: ["cute", "cheerful", "minimal"],    min: 5,  max: 15 },
    statice:     { vi: "Lam tinh",        en: "statice",              role: "accent", unit: 2500,  colors: ["purple", "blue", "pink"],                 tags: ["dreamy", "calm"],                 min: 5,  max: 12 },
    bluestar:    { vi: "Sao xanh",        en: "blue star tweedia",    role: "accent", unit: 5000,  colors: ["blue"],                                   tags: ["dreamy", "minimal", "calm"],      min: 3,  max: 10 },
    strawflower: { vi: "Cúc gỗ",          en: "strawflower",          role: "accent", unit: 7500,  colors: ["pink", "yellow", "orange"],               tags: ["vintage", "cute"],                min: 3,  max: 8  },
    lace:        { vi: "Hoa cà rốt (thúy châu)", en: "queen anne's lace", role: "filler", unit: 4500, colors: ["white"],                              tags: ["dreamy", "minimal"],              min: 3,  max: 8  },
  };

  const GREENS = {
    dustymiller: { vi: "Lá bạc",        en: "silver dusty miller leaves", unit: 3000 },
    eucalyptus:  { vi: "Cỏ đồng tiền",  en: "silver dollar eucalyptus",   unit: 2500 },
    fern:        { vi: "Lá kiếm",       en: "leatherleaf fern",           unit: 1700 },
    polyscias:   { vi: "Đinh lăng",     en: "polyscias greenery",         unit: 1000 },
  };

  const COLORS = {
    red:    { vi: "Đỏ",        en: "deep red",      hex: "#B23A48" },
    pink:   { vi: "Hồng phấn", en: "blush pink",    hex: "#E8A7B0" },
    peach:  { vi: "Cam đào",   en: "peach",         hex: "#F2B694" },
    white:  { vi: "Trắng",     en: "pure white",    hex: "#FAF8F2" },
    cream:  { vi: "Kem",       en: "creamy ivory",  hex: "#F1E4C8" },
    yellow: { vi: "Vàng",      en: "sunny yellow",  hex: "#F2C94C" },
    orange: { vi: "Cam",       en: "warm orange",   hex: "#EE8B4A" },
    purple: { vi: "Tím",       en: "soft lavender", hex: "#A98BC4" },
    blue:   { vi: "Xanh dương", en: "dusty blue",   hex: "#8FB1D6" },
    green:  { vi: "Xanh lá",   en: "lime green",    hex: "#B6C98A" },
  };

  // Wrapping papers seen in the portfolio photos.
  const WRAPS = {
    kraft:   { vi: "Giấy vàng bò (kraft)", en: "tan kraft paper",              hex: "#D2A679" },
    cream:   { vi: "Giấy kem",             en: "cream matte paper",            hex: "#F3E9D6" },
    white:   { vi: "Giấy trắng mờ",        en: "translucent white paper",      hex: "#FFFFFF" },
    pink:    { vi: "Giấy hồng pastel",     en: "pastel pink paper",            hex: "#F3C9CF" },
    sage:    { vi: "Giấy xanh sage",       en: "sage green paper",             hex: "#BFCBA8" },
    tiffany: { vi: "Giấy xanh tiffany",    en: "pastel tiffany blue paper",    hex: "#A9D8D6" },
    black:   { vi: "Giấy đen",             en: "matte black paper",            hex: "#2B2B2B" },
  };

  const RIBBONS = {
    pink:   { vi: "Ruy băng hồng",  en: "blush pink satin ribbon" },
    red:    { vi: "Ruy băng đỏ",    en: "deep red satin ribbon" },
    white:  { vi: "Ruy băng trắng", en: "white satin ribbon" },
    sage:   { vi: "Ruy băng sage",  en: "sage green satin ribbon" },
    orange: { vi: "Ruy băng cam",   en: "orange satin ribbon" },
    blue:   { vi: "Ruy băng xanh",  en: "light blue satin ribbon" },
    cream:  { vi: "Ruy băng kem",   en: "ivory satin ribbon" },
  };

  // ---------- Occasions ----------
  // flowers: preference weights; palette: default colors when the customer gives none
  const OCCASIONS = {
    birthday:    { vi: "Sinh nhật",            en: "Birthday",        flowers: { gerbera: 2, rose: 2, sprayrose: 2, sunflower: 1, lisianthus: 1 }, palette: ["pink", "peach", "yellow"], vibe: "cheerful", wish: "Chúc một tuổi mới rực rỡ như những đoá hoa này." },
    love:        { vi: "Tình yêu / Kỷ niệm",   en: "Love & anniversary", flowers: { rose: 4, sprayrose: 2, lisianthus: 1 }, palette: ["red", "pink"], vibe: "romantic", wish: "Mỗi cánh hoa là một lời thương chưa kịp nói." },
    teacher:     { vi: "Ngày Nhà giáo 20/11",  en: "Teachers' Day",   flowers: { gerbera: 3, carnation: 2, sunflower: 2, lisianthus: 2 }, palette: ["yellow", "pink", "white"], vibe: "grateful", wish: "Tri ân người đã gieo chữ và gieo cả niềm tin." },
    women:       { vi: "Ngày Phụ nữ 8/3 · 20/10", en: "Women's Day",  flowers: { rose: 2, carnation: 2, sprayrose: 2, lisianthus: 1 }, palette: ["pink", "peach", "white"], vibe: "elegant", wish: "Gửi người phụ nữ dịu dàng và mạnh mẽ nhất." },
    mother:      { vi: "Tặng mẹ",              en: "For mom",         flowers: { carnation: 4, lily: 2, rose: 1, lotus: 1 }, palette: ["pink", "white", "peach"], vibe: "grateful", wish: "Cảm ơn mẹ vì tất cả những điều bình yên." },
    graduation:  { vi: "Tốt nghiệp",           en: "Graduation",      flowers: { sunflower: 4, gerbera: 2, tana: 1 }, palette: ["yellow", "white", "orange"], vibe: "cheerful", wish: "Chúc mừng một hành trình mới thật rạng rỡ." },
    congrats:    { vi: "Chúc mừng / Khai trương", en: "Congratulations", flowers: { sunflower: 3, gerbera: 2, lily: 1, rose: 1 }, palette: ["yellow", "orange", "red"], vibe: "bold", wish: "Chúc mọi điều hanh thông, rực rỡ." },
    thanks:      { vi: "Cảm ơn",               en: "Thank you",       flowers: { lisianthus: 2, carnation: 2, tana: 1, gerbera: 1 }, palette: ["white", "pink", "green"], vibe: "grateful", wish: "Một lời cảm ơn nhỏ cho điều tử tế lớn." },
    sorry:       { vi: "Xin lỗi / Làm hoà",    en: "Apology",         flowers: { rose: 2, lisianthus: 3, sprayrose: 1 }, palette: ["white", "pink", "cream"], vibe: "calm", wish: "Mình xin lỗi — mong hoa nói thay điều khó nói." },
    getwell:     { vi: "Chúc sức khoẻ",        en: "Get well",        flowers: { sunflower: 2, gerbera: 2, tana: 2 }, palette: ["yellow", "white", "green"], vibe: "cheerful", wish: "Mau khoẻ nhé, nắng vẫn đang chờ." },
    sympathy:    { vi: "Chia buồn",            en: "Sympathy",        flowers: { lily: 3, lisianthus: 2, rose: 1, lotus: 1 }, palette: ["white", "cream", "green"], vibe: "calm", wish: "Thành kính chia buồn cùng gia đình." },
    justbecause: { vi: "Không cần lý do",      en: "Just because",    flowers: { lisianthus: 1, sprayrose: 1, gerbera: 1, tana: 1 }, palette: [], vibe: "cute", wish: "Chỉ là hôm nay mình nghĩ đến bạn." },
  };

  // Dates (MM-DD) around which market prices spike. Delivery on these days uses high-season pricing.
  const HIGH_SEASON = [
    ["02-10", "02-15"], ["03-05", "03-08"], ["10-17", "10-20"], ["11-17", "11-20"], ["12-22", "12-25"],
  ];

  // ---------- Western zodiac ----------
  const ZODIAC = [
    { id: "capricorn",   vi: "Ma Kết",    sym: "♑", from: "12-22", to: "01-19", el: "earth", colors: ["cream", "white"],  flowers: { carnation: 2, lisianthus: 1 }, trait: "điềm tĩnh, chỉn chu, thích sự tinh tế bền lâu" },
    { id: "aquarius",    vi: "Bảo Bình",  sym: "♒", from: "01-20", to: "02-18", el: "air",   colors: ["blue", "white"],   flowers: { bluestar: 3, hydrangea: 2, lisianthus: 1 }, trait: "độc đáo, tự do, thích điều khác biệt" },
    { id: "pisces",      vi: "Song Ngư",  sym: "♓", from: "02-19", to: "03-20", el: "water", colors: ["purple", "blue"], flowers: { lisianthus: 2, lotus: 2, statice: 2 }, trait: "mơ mộng, nhạy cảm, giàu cảm xúc" },
    { id: "aries",       vi: "Bạch Dương", sym: "♈", from: "03-21", to: "04-19", el: "fire", colors: ["red", "orange"],  flowers: { gerbera: 2, rose: 2 }, trait: "nhiệt huyết, thẳng thắn, đầy năng lượng" },
    { id: "taurus",      vi: "Kim Ngưu",  sym: "♉", from: "04-20", to: "05-20", el: "earth", colors: ["pink", "green"],  flowers: { rose: 2, pompom: 2, lily: 1 }, trait: "yêu cái đẹp, thích sự sang trọng và êm dịu" },
    { id: "gemini",      vi: "Song Tử",   sym: "♊", from: "05-21", to: "06-20", el: "air",   colors: ["yellow", "purple"], flowers: { statice: 2, gerbera: 1, tana: 2 }, trait: "vui vẻ, tò mò, thích sự đa sắc" },
    { id: "cancer",      vi: "Cự Giải",   sym: "♋", from: "06-21", to: "07-22", el: "water", colors: ["white", "cream"],  flowers: { rose: 2, lily: 2, lisianthus: 1 }, trait: "dịu dàng, hướng về gia đình, trọng tình cảm" },
    { id: "leo",         vi: "Sư Tử",     sym: "♌", from: "07-23", to: "08-22", el: "fire",  colors: ["yellow", "orange"], flowers: { sunflower: 4, gerbera: 1 }, trait: "toả sáng, tự tin, thích được chú ý" },
    { id: "virgo",       vi: "Xử Nữ",     sym: "♍", from: "08-23", to: "09-22", el: "earth", colors: ["white", "green"],  flowers: { tana: 2, lisianthus: 2, carnation: 1 }, trait: "tinh tế, gọn gàng, thích vẻ đẹp mộc mạc" },
    { id: "libra",       vi: "Thiên Bình", sym: "♎", from: "09-23", to: "10-22", el: "air",  colors: ["pink", "blue"],   flowers: { rose: 2, hydrangea: 2, sprayrose: 1 }, trait: "hài hoà, lãng mạn, có gu thẩm mỹ" },
    { id: "scorpio",     vi: "Bọ Cạp",    sym: "♏", from: "10-23", to: "11-21", el: "water", colors: ["red", "purple"],  flowers: { rose: 4 }, trait: "sâu sắc, bí ẩn, yêu mãnh liệt" },
    { id: "sagittarius", vi: "Nhân Mã",   sym: "♐", from: "11-22", to: "12-21", el: "fire",  colors: ["orange", "purple"], flowers: { carnation: 2, gerbera: 2, strawflower: 1 }, trait: "phóng khoáng, lạc quan, mê phiêu lưu" },
  ];

  const ELEMENTS = {
    fire:  { vi: "Lửa", vibe: "bold",     note: "sắc ấm, rực rỡ" },
    earth: { vi: "Đất", vibe: "classic",  note: "tông mộc, ấm áp, nhiều lá xanh" },
    air:   { vi: "Khí", vibe: "dreamy",   note: "nhẹ nhàng, bay bổng, nhiều khoảng thở" },
    water: { vi: "Nước", vibe: "romantic", note: "dịu, sâu, tông lạnh hoặc hồng" },
  };

  // ---------- MBTI ----------
  const MBTI_GROUPS = {
    NF: { vi: "Nhà Ngoại giao", vibe: "dreamy",   wrap: ["cream", "pink", "white"], note: "lãng mạn, giàu cảm xúc — hợp bó hoa bay bổng, nhiều hoa phụ" },
    NT: { vi: "Nhà Phân tích",  vibe: "minimal",  wrap: ["black", "white", "kraft"], note: "lý trí, tinh gọn — hợp bó hoa ít màu, bố cục rõ ràng" },
    SJ: { vi: "Người Bảo vệ",   vibe: "classic",  wrap: ["cream", "kraft", "white"], note: "truyền thống, chu đáo — hợp bó hoa cổ điển, cân đối" },
    SP: { vi: "Nhà Thám hiểm",  vibe: "cheerful", wrap: ["tiffany", "sage", "kraft"], note: "năng động, thích mới lạ — hợp bó hoa nhiều màu, tươi vui" },
  };
  const MBTI_NAMES = {
    INFP: "Người hoà giải", INFJ: "Người che chở", ENFP: "Người truyền cảm hứng", ENFJ: "Người dẫn dắt",
    INTJ: "Nhà chiến lược", INTP: "Nhà tư duy", ENTJ: "Nhà điều hành", ENTP: "Người tranh luận",
    ISFJ: "Người nuôi dưỡng", ISTJ: "Người trách nhiệm", ESFJ: "Người quan tâm", ESTJ: "Người tổ chức",
    ISFP: "Người nghệ sĩ", ISTP: "Nhà kỹ thuật", ESFP: "Người trình diễn", ESTP: "Người thực thi",
  };

  // ---------- Style vibes the customer can choose ----------
  const VIBES = {
    romantic: { vi: "Lãng mạn",   en: "romantic, lush" },
    elegant:  { vi: "Sang trọng", en: "elegant, refined" },
    cute:     { vi: "Dễ thương",  en: "sweet, playful" },
    cheerful: { vi: "Tươi vui",   en: "bright, cheerful" },
    dreamy:   { vi: "Bay bổng",   en: "airy, dreamy, garden-style" },
    minimal:  { vi: "Tối giản",   en: "minimal, modern, monochrome" },
    classic:  { vi: "Cổ điển",    en: "classic, timeless" },
    bold:     { vi: "Cá tính",    en: "bold, striking" },
    calm:     { vi: "Bình yên",   en: "calm, serene" },
    grateful: { vi: "Biết ơn",    en: "warm, heartfelt" },
  };

  // ---------- Shop catalog (Product portfolio sheet) ----------
  const CATALOG = [
    { code: "F101", name: "Hồng 6 bông",                price: 170000, high: 296000, main: "rose",       colors: ["red"] },
    { code: "F102", name: "Phăng 8 cành",               price: 160000, high: 260000, main: "carnation",  colors: ["red", "pink"] },
    { code: "F103", name: "Cúc đồng tiền 10 cành",      price: 170000, high: 222500, main: "gerbera",    colors: ["pink"] },
    { code: "F104", name: "Phăng 5 bông + Hồng 3 bông", price: 170000, high: 224000, main: "carnation",  colors: ["pink", "red"] },
    { code: "F105", name: "Lan tường + cỏ đồng tiền",   price: 199000, high: 222500, main: "lisianthus", colors: ["white", "pink"] },
    { code: "F201", name: "Hồng 12 bông + lá",          price: 270000, high: 446000, main: "rose",       colors: ["pink", "peach"] },
    { code: "F202", name: "Hồng 10 bông + hoa cà rốt",  price: 280000, high: 470000, main: "rose",       colors: ["red"] },
    { code: "F203", name: "Hồng + Phăng + lá",          price: 270000, high: 380000, main: "rose",       colors: ["pink", "white"] },
    { code: "F204", name: "Cúc tana + lá",              price: 250000, high: 380000, main: "tana",       colors: ["white"] },
    { code: "F205", name: "Hướng dương + cúc tana",     price: 250000, high: 455000, main: "sunflower",  colors: ["yellow"] },
    { code: "F206", name: "Đồng tiền + lam tinh",       price: 250000, high: 545000, main: "gerbera",    colors: ["pink"] },
    { code: "F301", name: "Hồng 22 bông + lá",          price: 380000, high: 626000, main: "rose",       colors: ["red"] },
    { code: "F302", name: "Hồng chùm",                  price: 380000, high: 680000, main: "sprayrose",  colors: ["pink"] },
    { code: "F303", name: "Phăng chùm + phăng đơn",     price: 350000, high: 410000, main: "carnation",  colors: ["pink"] },
    { code: "F304", name: "Hồng + Cúc tana",            price: 370000, high: 440000, main: "rose",       colors: ["peach", "pink"] },
    { code: "F305", name: "Hồng + lan tường",           price: 370000, high: 402000, main: "rose",       colors: ["pink", "white"] },
  ];

  const SHOP = {
    name: "Flơr",
    slogan: "Hơn cả một cánh hoa · More than a petal",
    phone: "(+84) 77 5422 217",
    zalo: "84775422217",
    email: "contact@florinsaigon.com",
    social: "florinsaigon",
  };

  return { FLOWERS, GREENS, COLORS, WRAPS, RIBBONS, OCCASIONS, HIGH_SEASON, ZODIAC, ELEMENTS, MBTI_GROUPS, MBTI_NAMES, VIBES, CATALOG, SHOP };
})();
