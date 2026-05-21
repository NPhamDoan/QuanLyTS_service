# Hệ thống Quản lý Tuyển sinh — Hướng dẫn Deploy

## Cấu trúc thư mục

```
QuanLyTS_service_Deploy/
  dist/           # Backend compiled (JS)
  public/         # Frontend build (static files)
  db/init.sql     # Database schema
  uploads/        # Thư mục lưu file upload
  package.json    # Dependencies
  .env.sample     # Mẫu cấu hình environment
  README.md       # File này
```

## Chạy trên máy local

### 1. Cài dependencies

```bash
cd QuanLyTS_service_Deploy
npm install
```

### 2. Tạo file .env

Copy `.env.sample` thành `.env` và điền giá trị:

```bash
cp .env.sample .env
```

Nội dung `.env`:

```env
DB_TYPE=sqlite
DATABASE_URL=file:./dev.db
JWT_SECRET=chuoi-ngau-nhien-dai-cua-ban
PORT=3000
```

### 3. Khởi chạy

```bash
node dist/server.js
```

App chạy tại: http://localhost:3000

---

## Deploy lên Render

### 1. Tạo Web Service trên Render

- **Runtime:** Node
- **Root Directory:** (để trống nếu push cả folder, hoặc chỉ định đường dẫn)
- **Build Command:** `npm install`
- **Start Command:** `node dist/server.js`

### 2. Environment Variables

Thêm các biến sau trong Render Dashboard → Environment:

| Biến | Giá trị | Ghi chú |
|------|---------|---------|
| `PORT` | `10000` | Render tự gán, thường không cần set |
| `DB_TYPE` | `sqlite` hoặc `supabase` | Chọn loại database |
| `JWT_SECRET` | `chuoi-ngau-nhien-dai` | Bắt buộc đổi |
| `DATABASE_URL` | `file:./dev.db` | Chỉ khi dùng SQLite |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Chỉ khi DB_TYPE=supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_xxx` | Chỉ khi DB_TYPE=supabase |

### 3. Lưu ý

- **SQLite trên Render:** Dữ liệu sẽ bị mất khi redeploy (Render dùng ephemeral disk). Nên dùng Supabase cho production.
- **Supabase:** Chạy `db/init.sql` trên Supabase SQL Editor trước khi deploy lần đầu.
- **File uploads:** Trên Render (free tier) file upload cũng sẽ mất khi redeploy. Cân nhắc dùng cloud storage cho production.

---

## Tài khoản mặc định

Sau khi khởi chạy lần đầu, hệ thống tự tạo tài khoản admin:

- **Username:** `admin`
- **Password:** `123456`

⚠️ Đổi mật khẩu ngay sau khi đăng nhập lần đầu.
