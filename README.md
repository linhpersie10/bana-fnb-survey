# Khảo Sát Nhu Cầu & Hành Vi Tiêu Dùng F&B — Sun World Ba Na Hills (CAPI)

Ứng dụng khảo sát hiện trường **CAPI (Computer-Assisted Personal Interviewing)** tối ưu cho Điện thoại và iPad dành cho đội ngũ phỏng vấn viên (PVV) tại 5 điểm khảo sát trên đỉnh Bà Nà (`1. Cổng thành`, `2. Nhà thờ - Điểm 1`, `3. Nhà thờ - Điểm 2`, `4. Ga 12`, `5. Vòng xuyến`).

## Tính năng cốt lõi
- **Bảo mật 2 lớp "The Vault"**: Đăng nhập Google SSO kết hợp mã PIN 6 chữ số (`PBKDF2-SHA256` 100.000 vòng + Salt theo UID) lưu trên Firestore (`banafi-kpi` / database `pkt-survey`) và bộ nhớ đệm Offline.
- **Song ngữ Việt – Anh (`VI/EN`)**: Bật/tắt song ngữ tức thì khi phỏng vấn du khách quốc tế.
- **Logic khảo sát tự động**:
  - Tự động dừng lịch sự (Screen-out) nếu `S1 = 2` (< 4 tiếng), `S2 = 3` (người khác chi trả hoàn toàn), hoặc `S4 = 1` (< 18 tuổi).
  - Tự động khóa câu `A1` (Ngân sách dự kiến) trước khi sang `A4` để chống sửa lùi.
  - Tự động rẽ nhánh `A2 = 7` (chưa dùng F&B) vs `A2 = 1..6` (đã dùng F&B) và lọc động ma trận `A5`.
  - Khôi phục câu `A4.1` (Chi thêm ngoài gói vé/combo) và tách mã `11. Nga / Russia` trong `S5` phục vụ theo dõi Quota.
- **Offline-First Sync & Xuất CSV**: Tự động lưu cục bộ khi mất sóng và đồng bộ lên Firestore `pkt-survey` khi có mạng; xuất CSV chuẩn UTF-8 BOM.
