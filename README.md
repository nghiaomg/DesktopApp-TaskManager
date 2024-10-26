# 📋 Task Manager Desktop App

![Task Manager Preview](src/assets/preview.png)

## 🌟 Giới thiệu

Task Manager là một ứng dụng desktop được xây dựng với Electron và JavaScript vì lý do các ứng dụng trên mạng hiện thu thập quá nhiều dữ liệu của người dùng và tốn phí dù chỉ muốn dùng cho cá nhân. Về Perfomance thì ứng dụng này khá tốt so với dùng các website. Mong nó sẽ giúp được các bạn muốn quản lý task.

## ✨ Tính năng nổi bật

## 🛠️ Công nghệ sử dụng

- **Electron**: Framework để xây dựng cross-platform desktop apps
- **JavaScript**: Ngôn ngữ lập trình chính
- **HTML/CSS**: Xây dựng giao diện người dùng
- **Bulma**: Framework CSS cho thiết kế hiện đại
- **Font Awesome**: Icon library
- **Electron Store**: Persistent data storage
- **Custom CSS Animations**: Tăng trải nghiệm người dùng

## 🚀 Kiến trúc & Kỹ thuật

### Kiến trúc ứng dụng
- **Main Process**: Xử lý các tác vụ hệ thống và quản lý cửa sổ
- **Renderer Process**: Xử lý giao diện người dùng và tương tác
- **IPC Communication**: Giao tiếp giữa main và renderer processes
- **Data Persistence**: Lưu trữ dữ liệu local với electron-store

### Kỹ thuật nổi bật
- **Event-Driven Architecture**: Xử lý sự kiện hiệu quả
- **Modular Design**: Code được tổ chức theo modules 
