# 🔦 BRIDGE CROSSING 3D (BÀI TẬP LỚN / ĐỒ ÁN GAME GIẢI ĐỐ)

Một ứng dụng trò chơi giải đố trí tuệ 3D mô phỏng bài toán dân gian **"Qua cầu đêm"**, được xây dựng trực quan hóa trên nền tảng Web sử dụng công nghệ đồ họa **Three.js (WebGL)** và hoạt ảnh **GSAP (GreenSock)**.

---

## 🏫 THÔNG TIN ĐỀ TÀI / BÀI TẬP
*   **Tên đề tài:** Ứng dụng Web 3D Giải Đố Qua Cầu Đêm (Bridge Crossing 3D)
*   **Môn học:** *[Nhập tên môn học, ví dụ: Lập trình Web / Đồ họa máy tính]*
*   **Giảng viên hướng dẫn:** *[Nhập tên giảng viên]*
*   **Sinh viên thực hiện:**
    *   **Họ và tên:** *[Nhập tên của bạn]*
    *   **MSSV:** *[Nhập mã số sinh viên]*
    *   **Lớp:** *[Nhập tên lớp]*
*   **GitHub Tác giả:** [thuanvuse](https://github.com/Thuanvuse)
*   **Telegram Liên hệ:** [@chimdangxem](https://t.me/chimdangxem)

---

## 🎮 MÔ TẢ BÀI TOÁN & QUY LUẬT CHƠI
Bối cảnh diễn ra vào ban đêm bên một dòng sông chảy xiết, nhóm 4 người cần di chuyển qua một cây cầu treo ọp ẹp. Cầu chỉ chịu được tải trọng của **tối đa 2 người** cùng lúc và bắt buộc phải có **đèn pin** để dò đường.

### Tốc độ di chuyển của từng thành viên:
| Nhân vật | Thời gian qua cầu (Phút) | Đặc điểm trực quan |
| :---: | :---: | :---: |
| **An** | **1 phút** | Màu xanh dương 🔵 |
| **Bình** | **2 phút** | Màu xanh lá 🟢 |
| **Chi** | **7 phút** | Màu vàng 🟡 |
| **Dũng** | **10 phút** | Màu đỏ 🔴 |

### Quy tắc trò chơi:
1.  **Đèn pin** 🔦 là vật dụng bắt buộc để đi qua cầu (chỉ có duy nhất 1 chiếc).
2.  Mỗi lượt di chuyển từ bờ này sang bờ kia tối đa **2 người**.
3.  Khi 2 người cùng đi, thời gian di chuyển của lượt đó sẽ được tính theo người **đi chậm hơn** (tốc độ của người có số phút lớn hơn).
4.  Sau khi sang bờ bên kia, phải có ít nhất 1 người cầm đèn pin quay trở lại bờ xuất phát để đón những người tiếp theo.
5.  **Mục tiêu tối ưu:** Đưa toàn bộ 4 người qua sông an toàn với tổng thời gian **đúng bằng 17 phút**.

---

## 💡 THUẬT TOÁN / CHIẾN THUẬT GIẢI QUYẾT TỐI ƯU
Để giải quyết bài toán trong giới hạn **17 phút**, ta áp dụng chiến thuật tối ưu hóa việc di chuyển của hai người đi chậm nhất (Chi và Dũng) đi cùng nhau để triệt tiêu thời gian chờ:

| Lượt đi | Hành động | Nhân vật tham gia | Thời gian tính (Phút) | Tổng thời gian lũy kế |
| :---: | :--- | :---: | :---: | :---: |
| **1** | Đi sang bờ bên kia | An (1m) & Bình (2m) | **2** | **2 phút** |
| **2** | Quay lại bờ xuất phát | An (1m) cầm đèn pin | **1** | **3 phút** |
| **3** | Đi sang bờ bên kia | Chi (7m) & Dũng (10m) | **10** | **13 phút** |
| **4** | Quay lại bờ xuất phát | Bình (2m) cầm đèn pin | **2** | **15 phút** |
| **5** | Đi sang bờ bên kia | An (1m) & Bình (2m) | **2** | **17 phút** (Hoàn thành 🏆) |

---

## 🛠️ ĐIỂM NHẤN CÔNG NGHỆ (TECH STACK)
Dự án được phát triển thuần túy bằng các công nghệ Web Front-end hiện đại, không sử dụng framework cồng kềnh giúp tối ưu hóa hiệu năng tải trang và chạy mượt mà ngay cả trên thiết bị cấu hình yếu:

1.  **Three.js (WebGL rendering engine):**
    *   **Ánh sáng (Lighting):** Sử dụng `DirectionalLight` mô phỏng ánh trăng, kết hợp hệ thống đèn đường `PointLight` neon ở hai bên bờ và đèn pin `SpotLight` phát chùm sáng hình nón di chuyển theo nhân vật.
    *   **Hiệu ứng nước (Water Shader):** Sử dụng các hàm toán học lượng giác `sin` và `cos` biến đổi vị trí các đỉnh của PlaneGeometry theo thời gian để tạo ra các gợn sóng nhấp nhô sống động.
    *   **Không gian (Environment):** Tạo bầu trời đêm với hệ thống 1.500 hạt ngôi sao (`THREE.Points`) ngẫu nhiên và hiệu ứng sương mù (`THREE.FogExp2`).
2.  **GSAP (GreenSock Animation Platform):**
    *   Điều khiển luồng hoạt ảnh (Timeline) đồng bộ giữa việc dịch chuyển nhân vật, tạo hiệu ứng đi bộ nhấp nhô (`bobbing`), lắc lư cơ thể và di chuyển vùng sáng của đèn pin bám theo nhóm.
3.  **Giao diện Glassmorphism (CSS3):**
    *   Sử dụng thuộc tính `backdrop-filter: blur()` tạo hiệu ứng kính mờ thời thượng cho các bảng điều khiển giao diện UI.
    *   Thiết kế Responsive hoàn toàn thích ứng trên cả màn hình Desktop và điện thoại di động.

---

## 📂 CẤU TRÚC THƯ MỤC DỰ ÁN
```bash
Game_Giai_Do_Qua_Cau/
│
├── index.html   # Cấu trúc giao diện ứng dụng (DOM)
├── style.css    # Định dạng phong cách giao diện UI & Glassmorphism
├── game.js      # Khởi tạo không gian 3D, ánh sáng, vật lý & logic trò chơi
└── README.md    # Báo cáo đề tài / Tài liệu giới thiệu dự án
```

---

## 🚀 HƯỚNG DẪN CHẠY DỰ ÁN (RUN INSTRUCTIONS)
Dự án đã được cấu hình chạy ở định dạng **Non-Module**, giúp bạn chạy trực tiếp offline cực kỳ tiện lợi:

### Cách 1: Chạy trực tiếp (Mọi người dùng)
*   Tải thư mục dự án về máy.
*   Nhấp đúp chuột (Double Click) vào file `index.html` để mở trò chơi trực tiếp trên trình duyệt web (Chrome, Edge, Safari, Firefox...) mà không cần cài đặt phần mềm trung gian.

### Cách 2: Chạy qua Live Server (Dành cho Lập trình viên)
*   Mở thư mục dự án bằng **VS Code**.
*   Nhấp chuột phải vào file `index.html` và chọn **Open with Live Server**.
*   Trò chơi sẽ chạy trên cổng nội bộ mặc định: `http://127.0.0.1:5500`.
