# 📋 Task Manager Desktop App

![Task Manager Preview](https://ik.imagekit.io/0lpnflx37/Me/Task%20Manager/Screenshot%202024-10-26%20213207.png)

## 🌟 Giới thiệu

Task Manager là một ứng dụng desktop được xây dựng với Electron và JavaScript vì lý do các ứng dụng trên mạng hiện thu thập quá nhiều dữ liệu của người dùng và tốn phí dù chỉ muốn dùng cho cá nhân. Về Performance thì ứng dụng này khá tốt so với dùng các website. Mong nó sẽ giúp được các bạn muốn quản lý task.

## ✨ Tính năng nổi bật

- **Quản lý công việc**: Thêm, sửa, xóa và theo dõi tiến độ công việc
- **Lọc và tìm kiếm**: Lọc theo tháng, trạng thái và tìm kiếm công việc
- **Biểu đồ đóng góp**: Hiển thị trực quan hoạt động theo thời gian (giống GitHub)
- **Thống kê**: Theo dõi số lượng công việc hoàn thành và ngày hoạt động
- **Giao diện thân thiện**: UI/UX được thiết kế đơn giản, dễ sử dụng
- **Lưu trữ offline**: Dữ liệu được lưu trữ local, không cần kết nối mạng

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
- **Debouncing**: Tối ưu hiệu suất khi lọc và tìm kiếm
- **Grid Layout**: Sử dụng CSS Grid cho biểu đồ đóng góp
- **Responsive Design**: Giao diện tương thích nhiều kích thước màn hình

## 🆕 Cập nhật mới

### v1.1.0
- Thêm biểu đồ đóng góp theo dạng GitHub contributions
- Thêm thống kê số lượng công việc hoàn thành
- Thêm thống kê ngày hoạt động nhiều nhất
- Cải thiện hiệu suất với debouncing
- Sửa lỗi và cải thiện UI/UX

### Tính năng mới
- **Biểu đồ đóng góp**: 
  - Hiển thị hoạt động trong 12 tháng gần nhất
  - Màu sắc thể hiện mức độ hoạt động
  - Tooltip hiển thị chi tiết khi hover
- **Thống kê**: 
  - Tổng số công việc đã hoàn thành
  - Số công việc nhiều nhất trong một ngày
- **UI/UX**:
  - Giao diện mới cho phần thống kê
  - Cải thiện hiển thị ngày tháng
  - Thêm tooltips và animations

### Cải thiện
- Tối ưu hiệu suất khi lọc và cập nhật dữ liệu
- Sửa lỗi hiển thị thời gian
- Cải thiện responsive design
- Thêm validation cho form nhập liệu
- Cập nhật documentation