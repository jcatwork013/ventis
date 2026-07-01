package service

import "encoding/json"

// DefaultSiteContent seeds the editable landing-page document on first boot.
// `[[word]]` inside a heading marks a gold accent fragment for the frontend.
// Mirrors the VENTIS GROUP design; everything here is editable in the admin.
var DefaultSiteContent = json.RawMessage(`{
  "hero": {
    "titleTop": "VENTIS",
    "titleBottom": "GROUP",
    "keywords": ["Vision", "Expansion", "Next", "Transformation", "Innovation", "Sustainable"],
    "tagline": "Building Strategic Ecosystems",
    "intro": "Tập đoàn đầu tư và phát triển đa ngành, tập trung vào đầu tư chiến lược, phát triển dự án, thương mại và dịch vụ — kiến tạo giá trị dài hạn cho đối tác, khách hàng và cộng đồng.",
    "image": "/hero-ventis.jpg",
    "ctaGhost": "Khám phá Ventis",
    "ctaPrimary": "Hợp tác cùng chúng tôi"
  },
  "about": {
    "eyebrow": "Về Ventis",
    "heading": "Nền tảng [[kết nối]] đầu tư, phát triển và vận hành.",
    "quote": "Kiến tạo những hệ sinh thái kinh doanh hiện đại — bền vững theo thời gian, vững vàng qua mỗi chu kỳ.",
    "quoteAuthor": "VENTIS GROUP · Định hướng phát triển",
    "body1": "VENTIS GROUP được thành lập với định hướng trở thành nền tảng kết nối đầu tư, phát triển dự án và vận hành dịch vụ — góp phần xây dựng các mô hình kinh doanh hiện đại, hiệu quả và bền vững.",
    "body2": "Chúng tôi tập trung vào các cơ hội có tiềm năng tăng trưởng dài hạn, đồng hành cùng đối tác trong việc phát triển doanh nghiệp, dự án và hệ sinh thái kinh doanh.",
    "stats": [
      { "value": "04", "label": "Lĩnh vực chiến lược" },
      { "value": "03+", "label": "Dự án trọng điểm" },
      { "value": "20+", "label": "Năm kinh nghiệm đội ngũ" },
      { "value": "100%", "label": "Cam kết bền vững" }
    ]
  },
  "values": {
    "eyebrow": "Giá trị cốt lõi",
    "items": [
      { "n": "01", "title": "Vision", "caption": "Tầm nhìn dài hạn", "icon": "vision" },
      { "n": "02", "title": "Expansion", "caption": "Mở rộng và phát triển", "icon": "expansion" },
      { "n": "03", "title": "Innovation", "caption": "Sáng tạo và đổi mới", "icon": "innovation" },
      { "n": "04", "title": "Sustainable", "caption": "Phát triển bền vững", "icon": "leaf" }
    ]
  },
  "sectors": {
    "eyebrow": "Lĩnh vực hoạt động",
    "heading": "Bốn trụ cột định hình hệ sinh thái Ventis.",
    "items": [
      { "n": "01", "title": "Investment", "body": "Đầu tư chiến lược, M&A doanh nghiệp và phát triển các cơ hội tăng trưởng dài hạn." },
      { "n": "02", "title": "Development", "body": "Phát triển dự án bất động sản, nghỉ dưỡng, du lịch và các mô hình kinh doanh mới." },
      { "n": "03", "title": "Trading", "body": "Thương mại, phân phối và kết nối chuỗi giá trị sản phẩm và dịch vụ." },
      { "n": "04", "title": "Services", "body": "Quản lý vận hành, tư vấn và cung cấp các giải pháp dịch vụ chuyên nghiệp." }
    ]
  },
  "projects": {
    "eyebrow": "Dự án & Cơ hội",
    "heading": "Những hành trình đang được Ventis kiến tạo.",
    "items": [
      { "image": "/project-phuquoc.jpg", "eyebrow": "Resort nghỉ dưỡng cao cấp", "title": "An Yến Resort", "location": "Phú Quốc" },
      { "image": "/project-cantho.jpg", "eyebrow": "Trải nghiệm thiên nhiên sông nước", "title": "Glamping", "location": "Cần Thơ" },
      { "image": "/project-camau.jpg", "eyebrow": "Du lịch sinh thái bền vững", "title": "Eco Resort", "location": "Đất Mũi — Cà Mau" }
    ]
  },
  "partners": {
    "eyebrow": "Đồng hành cùng đối tác",
    "heading": "Hợp tác bền vững — giá trị lớn hơn cho mọi bên.",
    "body": "VENTIS luôn tìm kiếm và mở rộng quan hệ hợp tác với những đối tác cùng tầm nhìn dài hạn.",
    "items": [
      "Chủ đầu tư dự án",
      "Doanh nghiệp cần M&A",
      "Đối tác chiến lược",
      "Nhà cung cấp sản phẩm & dịch vụ",
      "Đơn vị phát triển bất động sản",
      "Doanh nghiệp công nghệ"
    ]
  },
  "contact": {
    "eyebrow": "Liên hệ",
    "heading": "Cùng kiến tạo giá trị dài hạn.",
    "body": "Trao đổi với đội ngũ Ventis về cơ hội đầu tư, hợp tác phát triển dự án hoặc các giải pháp dịch vụ phù hợp.",
    "email": "info@ventis.vn",
    "hotline": "(+84) 919 000 005",
    "website": "www.ventis.vn",
    "address": "65 Lê Lợi, Phường Sài Gòn, TP.HCM"
  },
  "footer": {
    "copyright": "© 2026 VENTIS GROUP · Building Strategic Ecosystems"
  }
}`)
