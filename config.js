/**
 * CLIENT CONFIGURATION
 *
 * Fast client swap:
 * 1. Edit the blocks marked SWAP below.
 * 2. Replace files in /image with the same filenames when possible.
 * 3. Leave optional links or comp-card paths blank ("") to hide unavailable UI.
 * 4. Add image captions only for images that should show modal captions.
 *
 * The template reads window.CLIENT_CONFIG. Keep the exported keys at the bottom
 * unless you are also updating main.js/nav.js/footer.js.
 */
(() => {
    const isUrl = (value) => /^https?:\/\//i.test(String(value || "").trim());
    const cleanHandle = (value) => String(value || "").trim().replace(/^@+/, "");
    const digitsOnly = (value) => String(value || "").replace(/[^\d+]/g, "");

    const instagramLink = (value) => {
        const handle = cleanHandle(value);
        if (!handle) return "";
        return isUrl(handle) ? handle : `https://instagram.com/${handle}`;
    };

    const lineLink = (value) => {
        const input = String(value || "").trim();
        if (!input) return "";
        return isUrl(input) ? input : `https://line.me/ti/p/${input.replace(/^@+/, "")}`;
    };

    const whatsappLink = (value) => {
        const input = String(value || "").trim();
        if (!input) return "";
        return isUrl(input) ? input : `https://wa.me/${digitsOnly(input)}`;
    };

    const path = {
        hero: "image/hero/hero.webp",
        about: "image/about/01.webp",
        compCardWeb: "image/Folio-Lab-Compcard Luxury.webp",
        compCardDownload: "image/Folio-Lab-Compcard Luxury.png",
        highlights: [
            "image/highlights/01.webp",
            "image/highlights/02.webp",
            "image/highlights/03.WEBP",
            "image/highlights/04.webp"
        ],
        portfolio: Array.from({ length: 20 }, (_, index) => {
            const number = String(index + 1).padStart(2, "0");
            return `image/portfolio/${number}.webp`;
        }),
        digitals: [
            "image/digitals/01.webp",
            "image/digitals/02.webp",
            "image/digitals/03.webp",
            "image/digitals/04.webp"
        ]
    };

    // SWAP: client identity, contact, and hero copy.
    const client = {
        name: "CLIENT NAME",
        email: "contact@client.com",
        instagram: "yourclient",
        line: "",
        whatsapp: "1234567890",
        taglineEn: "Model · Creative Director",
        taglineTh: "นางแบบ · ครีเอทีฟไดเรกเตอร์",
        splashCaption: "",
        footerDescEn: "International model and creative director based in Bangkok, specializing in high-end editorial and commercial campaigns.",
        footerDescTh: "นางแบบและครีเอทีฟไดเรกเตอร์ระดับนานาชาติที่ประจำอยู่ในกรุงเทพฯ เชี่ยวชาญด้านงานถ่ายแบบนิตยสารและโฆษณาระดับไฮเอนด์"
    };

    // SWAP: About page copy.
    const about = {
        bioEn: [
            "Client bio opening. Replace this with a concise statement about presence, point of view, and creative direction.",
            "Use this second line for selected campaigns, experience, availability, or the kind of collaborations the client is seeking.",
            "Keep it short, specific, and editorial."
        ],
        bioTh: [
            "ย่อหน้าเปิดประวัติ แทนที่ด้วยคำแนะนำตัวที่กระชับเกี่ยวกับตัวตน มุมมอง และทิศทางสร้างสรรค์",
            "ใช้ย่อหน้าที่สองสำหรับแคมเปญ ประสบการณ์ ความพร้อมรับงาน หรือรูปแบบงานที่ต้องการร่วมงาน",
            "เขียนให้สั้น ชัดเจน และมีโทนแบบเอดิทอเรียล"
        ],
        manifestoEn: "Client manifesto placeholder. Replace with one sharp line that captures their creative presence.",
        manifestoTh: "ตัวอย่างแมนิเฟสโตของลูกค้า แทนที่ด้วยประโยคสั้นคมที่สะท้อนตัวตนและพลังสร้างสรรค์"
    };

    // SWAP: measurements shown on the homepage.
    const measurements = {
        height: "179",
        bust: "84",
        waist: "61",
        hips: "90",
        shoes: "40",
        hairEn: "Blonde",
        hairTh: "บลอนด์",
        eyesEn: "Blue",
        eyesTh: "สีฟ้า"
    };

    // SWAP: optional comp card.
    const compCard = {
        image: path.compCardWeb,
        download: path.compCardDownload
    };

    // SWAP: modal captions. Remove an entry or set showImageCaptions false to hide it.
    const captions = {
        showImageCaptions: true,
        items: {
            [path.highlights[0]]: {
                kicker: "Highlights / 01",
                en: "An elevated editorial frame designed for quiet luxury and lasting presence.",
                th: "ภาพเอดิทอเรียลระดับพรีเมียมที่เน้นความหรูหราอย่างสงบและน่าจดจำ."
            },
            [path.highlights[1]]: {
                kicker: "Highlights / 02",
                en: "Refined posture, soft control, and a polished campaign sensibility.",
                th: "ท่าทางที่เรียบหรู การควบคุมที่นุ่มนวล และความรู้สึกแบบแคมเปญระดับสูง."
            },
            [path.highlights[2]]: {
                kicker: "Highlights / 03",
                en: "A composed portrait study with elegant restraint.",
                th: "พอร์ตเทรตที่สุขุม เรียบหรู และคุมโทนอย่างมีชั้นเชิง."
            },
            [path.highlights[3]]: {
                kicker: "Highlights / 04",
                en: "Luxury portfolio imagery with a calm, editorial finish.",
                th: "ภาพพอร์ตโฟลิโอสไตล์ลักชัวรีที่ให้ความรู้สึกนิ่ง หรู และเป็นเอดิทอเรียล."
            },
            [path.portfolio[0]]: {
                kicker: "Portfolio / 01",
                en: "Client image caption placeholder. Replace this with campaign, wardrobe, photographer, or location details.",
                th: "ตัวอย่างคำบรรยายภาพ ลูกค้าสามารถใส่รายละเอียดแคมเปญ ชุด ช่างภาพ หรือสถานที่ได้ที่นี่."
            },
            [path.portfolio[1]]: {
                kicker: "Portfolio / 02",
                en: "Client image caption placeholder. Keep it refined, short, and useful.",
                th: "ตัวอย่างคำบรรยายภาพ ควรเขียนให้สั้น สุขุม และช่วยเสริมภาพ."
            },
            [path.portfolio[2]]: {
                kicker: "Portfolio / 03",
                en: "Client image caption placeholder for credits or image context.",
                th: "ตัวอย่างคำบรรยายภาพสำหรับเครดิตหรือบริบทของภาพ."
            },
            [path.portfolio[3]]: {
                kicker: "Portfolio / 04",
                en: "Client image caption placeholder for styling, concept, or publication notes.",
                th: "ตัวอย่างคำบรรยายภาพสำหรับสไตลิ่ง คอนเซปต์ หรือรายละเอียดการเผยแพร่."
            }
        }
    };

    window.CLIENT_CONFIG = {
        name: client.name,
        email: client.email,
        taglineEn: client.taglineEn,
        taglineTh: client.taglineTh,
        splashCaption: client.splashCaption,
        footerBioEn: client.footerDescEn,
        footerBioTh: client.footerDescTh,
        footerDescEn: client.footerDescEn,
        footerDescTh: client.footerDescTh,
        aboutBioEn: about.bioEn,
        aboutBioTh: about.bioTh,
        manifestoEn: about.manifestoEn,
        manifestoTh: about.manifestoTh,
        measurements,
        compCardUrl: compCard.image,
        compCardDownloadUrl: compCard.download,
        showImageCaptions: captions.showImageCaptions,
        imageCaptions: captions.items,
        instagram: instagramLink(client.instagram),
        line: lineLink(client.line),
        whatsapp: whatsappLink(client.whatsapp),
        client,
        about,
        assets: path,
        compCard,
        captions
    };
})();
