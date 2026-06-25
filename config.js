/**
 * CLIENT CONFIGURATION
 * Update this object for each new client. Variables here automatically 
 * populate the navigation, footer, and booking page links.
 *
 * Fast buyer swap checklist:
 * 1. Replace Basic Info, Roles, About copy, Manifesto, and Measurements below.
 * 2. Replace images in the same folders using the same filenames for the fastest delivery.
 * 3. Update compCardUrl / compCardDownloadUrl when replacing the comp card image.
 * 4. Update imageCaptions only for images that should show captions in the modal.
 * 5. Leave any optional link blank ("") to hide that contact button automatically.
 */
window.CLIENT_CONFIG = {
    // 1. Basic Info
    name: "CLIENT NAME",
    email: "contact@client.com",
    
    // 2. Roles / Taglines
    taglineEn: "Model · Creative Director",
    taglineTh: "นางแบบ · ครีเอทีฟไดเรกเตอร์",

    // 3. About / Footer Short Description
    footerDescEn: "International model and creative director based in Bangkok, specializing in high-end editorial and commercial campaigns.",
    footerDescTh: "นางแบบและครีเอทีฟไดเรกเตอร์ระดับนานาชาติที่ประจำอยู่ในกรุงเทพฯ เชี่ยวชาญด้านงานถ่ายแบบนิตยสารและโฆษณาระดับไฮเอนด์",

    // 3.5 About Page Copy
    aboutBioEn: [
        "Client bio opening. Replace this with a concise statement about presence, point of view, and creative direction.",
        "Use this second line for selected campaigns, experience, availability, or the kind of collaborations the client is seeking.",
        "Keep it short, specific, and editorial."
    ],
    aboutBioTh: [
        "ย่อหน้าเปิดประวัติ แทนที่ด้วยคำแนะนำตัวที่กระชับเกี่ยวกับตัวตน มุมมอง และทิศทางสร้างสรรค์",
        "ใช้ย่อหน้าที่สองสำหรับแคมเปญ ประสบการณ์ ความพร้อมรับงาน หรือรูปแบบงานที่ต้องการร่วมงาน",
        "เขียนให้สั้น ชัดเจน และมีโทนแบบเอดิทอเรียล"
    ],
    manifestoEn: "Client manifesto placeholder. Replace with one sharp line that captures their creative presence.",
    manifestoTh: "ตัวอย่างแมนิเฟสโตของลูกค้า แทนที่ด้วยประโยคสั้นคมที่สะท้อนตัวตนและพลังสร้างสรรค์",

    // 4. Measurements
    measurements: {
        height: "179",
        bust: "84",
        waist: "61",
        hips: "90",
        shoes: "40",
        hairEn: "Blonde",
        hairTh: "บลอนด์",
        eyesEn: "Blue",
        eyesTh: "สีฟ้า"
    },

    // 5. Comp Card
    compCardUrl: "image/Folio-Lab-Compcard Luxury.webp", // Example: "image/Folio-Lab-Compcard Luxury.webp" (leave blank "" to hide button)
    compCardDownloadUrl: "image/Folio-Lab-Compcard Luxury.png", // Example: "image/Folio-Lab-Compcard Luxury.png"

    // 6. Image Modal Captions
    // Set showImageCaptions to false to hide captions and the caption toggle everywhere.
    // Delete or leave a specific image entry blank if that image should not show captions.
    showImageCaptions: true,
    imageCaptions: {
        "image/highlights/01.webp": {
            kicker: "Highlights / 01",
            en: "An elevated editorial frame designed for quiet luxury and lasting presence.",
            th: "ภาพเอดิทอเรียลระดับพรีเมียมที่เน้นความหรูหราอย่างสงบและน่าจดจำ."
        },
        "image/highlights/02.webp": {
            kicker: "Highlights / 02",
            en: "Refined posture, soft control, and a polished campaign sensibility.",
            th: "ท่าทางที่เรียบหรู การควบคุมที่นุ่มนวล และความรู้สึกแบบแคมเปญระดับสูง."
        },
        "image/highlights/03.WEBP": {
            kicker: "Highlights / 03",
            en: "A composed portrait study with elegant restraint.",
            th: "พอร์ตเทรตที่สุขุม เรียบหรู และคุมโทนอย่างมีชั้นเชิง."
        },
        "image/highlights/04.webp": {
            kicker: "Highlights / 04",
            en: "Luxury portfolio imagery with a calm, editorial finish.",
            th: "ภาพพอร์ตโฟลิโอสไตล์ลักชัวรีที่ให้ความรู้สึกนิ่ง หรู และเป็นเอดิทอเรียล."
        },
        "image/portfolio/01.webp": {
            kicker: "Portfolio / 01",
            en: "Client image caption placeholder. Replace this with campaign, wardrobe, photographer, or location details.",
            th: "ตัวอย่างคำบรรยายภาพ ลูกค้าสามารถใส่รายละเอียดแคมเปญ ชุด ช่างภาพ หรือสถานที่ได้ที่นี่."
        },
        "image/portfolio/02.webp": {
            kicker: "Portfolio / 02",
            en: "Client image caption placeholder. Keep it refined, short, and useful.",
            th: "ตัวอย่างคำบรรยายภาพ ควรเขียนให้สั้น สุขุม และช่วยเสริมภาพ."
        },
        "image/portfolio/03.webp": {
            kicker: "Portfolio / 03",
            en: "Client image caption placeholder for credits or image context.",
            th: "ตัวอย่างคำบรรยายภาพสำหรับเครดิตหรือบริบทของภาพ."
        },
        "image/portfolio/04.webp": {
            kicker: "Portfolio / 04",
            en: "Client image caption placeholder for styling, concept, or publication notes.",
            th: "ตัวอย่างคำบรรยายภาพสำหรับสไตลิ่ง คอนเซปต์ หรือรายละเอียดการเผยแพร่."
        }
    },

    // 7. Links (Leave blank "" to automatically hide the button on the booking page)
    instagram: "https://instagram.com/yourclient",
    line: "https://line.me/",
    whatsapp: "https://wa.me/1234567890"
};
