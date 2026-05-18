**Chilling Date — Mobile Dating App (Frontend)**

Chilling Date là ứng dụng hẹn hò di động được xây dựng bằng Expo + React Native, tối ưu cho trải nghiệm quẹt (swipe), nhắn tin thời gian thực và gọi video. Đây là repository frontend cho dự án, kết nối tới API backend qua `extra.apiUrl` trong [app.json](app.json#L1).

**Key Features**

- **Quẹt & Match:** Giao diện deck-swipe tương tác.
- **Nhắn tin thời gian thực:** Socket.io client cho chat và thông báo.
- **Cuộc gọi video:** Tích hợp Agora cho video call.
- **Xử lý ảnh & vị trí:** Chọn ảnh, upload, và lấy vị trí người dùng.

**Tech Stack**

- **Framework:** Expo + React Native
- **Router:** `expo-router`
- **State & HTTP:** `axios`, AsyncStorage
- **Realtime:** `socket.io-client`
- **RTC:** `agora-rtc-sdk-ng`, `react-native-agora`

**Preview**

- Xem bản build preview: https://expo.dev/accounts/phanquochuyiuh/projects/DatingApp/builds/3948c79f-f4ad-4e2b-854e-0021abba0272

**Quick Start**

1. Cài đặt dependencies

```bash
npm install
```

2. Chạy app (dev)

```bash
npx expo start
```

3. Chạy trên thiết bị/emulator

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

**Environment & Configuration**

- API base URL được cấu hình trong [app.json](app.json#L1) (thuộc `expo.extra.apiUrl`).
- Nếu backend dùng các biến môi trường khác, đặt chúng trong EAS/CI hoặc config môi trường tương ứng.

**Folder Structure (chính)**

- **app/**: Routes và screens theo `expo-router` (ví dụ: `app/(main)/discover/index.tsx`).
- **api/**: wrapper cho các endpoint và cấu hình API.
- **services/**: logic tương tác với backend (auth, chat, match, v.v.).
- **assets/**: hình ảnh và tài nguyên tĩnh (icon, splash).
- **src/components/**: các component giao diện tái sử dụng (ví dụ: [src/components/ui/Button.tsx](src/components/ui/Button.tsx#L1)).

**Important Files**

- App config: [app.json](app.json#L1)
- Entrypoint & routing: `app/` folder
- Package manifest: `package.json`

**Build & Release**

- Dùng EAS để build release (tham khảo `expo` + `eas.json`).
- Kiểm tra `expo.extra.eas.projectId` trong [app.json](app.json#L1) khi cấu hình EAS.

**Development Notes**

- Luôn chạy `npm install` sau khi kéo branches mới.
- Lưu ý quyền Android/iOS: camera, microphone, location khi test video call và tính năng vị trí.
- Nếu gặp lỗi liên quan đến native modules, chạy `npx expo prebuild` hoặc rebuild native dự án.

# Chilling Date — Ứng dụng hẹn hò di động

Một frontend hiện đại xây dựng bằng Expo + React Native, cung cấp trải nghiệm quẹt (swipe) trực quan, nhắn tin thời gian thực và cuộc gọi video chất lượng. Bản repo này là client mobile, kết nối tới API backend đã cấu hình trong [app.json](app.json#L1).

## Tính năng nổi bật

- Giao diện quẹt hồ sơ người dùng (deck-swipe) thân thiện và mượt.
- Hệ thống nhắn tin thời gian thực và thông báo với `socket.io-client`.
- Gọi video tích hợp Agora cho cuộc gọi 1:1.
- Quản lý ảnh người dùng, upload và chỉnh sửa profile.
- Lấy và hiển thị vị trí để tìm kiếm theo khoảng cách.

## Ảnh minh họa

Thêm ảnh màn hình vào `assets/images/` và chèn tại đây để trình bày giao diện (ví dụ: `assets/images/screenshot-1.png`).

## Kiến trúc & công nghệ

- Framework: Expo + React Native
- Routing: `expo-router`
- HTTP & storage: `axios`, `@react-native-async-storage/async-storage`
- Realtime: `socket.io-client`
- Video/RTC: `agora-rtc-sdk-ng`, `react-native-agora`

## Tệp cấu hình quan trọng

- App configuration: [app.json](app.json#L1)
- Manifest & scripts: [package.json](package.json#L1)
- Entry & routes: thư mục `app/`

## Bắt đầu nhanh

Yêu cầu trước

- Node.js (v16+ khuyến nghị)
- npm hoặc yarn
- Expo CLI nếu cần công cụ toàn cục: `npm install -g expo-cli`

Cài dependencies

```bash
npm install
```

Chạy trong môi trường phát triển

```bash
npx expo start
```

Chạy trực tiếp trên thiết bị hoặc emulator

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

## Cấu hình môi trường

- API base URL được cấu hình trong [app.json](app.json#L1) dưới `expo.extra.apiUrl`.
- Nếu backend yêu cầu token hoặc key khác, cấu hình chúng trong hệ thống CI/EAS hoặc sử dụng `.env` (không commit file chứa bí mật).

## Triển khai & build sản phẩm

- Sử dụng EAS để build binary: tham khảo `eas build` với cấu hình trong `eas.json`.
- Kiểm tra `expo.extra.eas.projectId` trong [app.json](app.json#L1) để liên kết dự án với EAS.

## Góp phần

- Fork repository → tạo branch feature → mở Pull Request mô tả rõ thay đổi và cách kiểm thử.
- Viết unit/integration tests cho logic quan trọng khi có thể.

## Hướng dẫn debug nhanh

- Lỗi native modules: chạy `npx expo prebuild` rồi rebuild.
- Lỗi liên quan tới API: kiểm tra `extra.apiUrl` và logs network.
- Lỗi socket/RTC: kiểm tra permissions (camera, microphone) và cấu hình token Agora.

## Liên hệ

- Chủ dự án: Phan Quoc Huy
- Repo: PhanQuocHuyIUH/DatingApp_FrontEnd

## Giấy phép

Dự án được cấp phép theo MIT License.
