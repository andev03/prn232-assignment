USE FUNewsManagementSystem;
GO

PRINT 'Đang thêm dữ liệu cho SystemAccount...';
INSERT INTO SystemAccount (AccountName, AccountEmail, AccountRole, IsActive, AccountPassword)
VALUES
(N'Biên Tập Viên A', 'staff1@gmail.com', 1, 1, N'hashed_password_editor_A_123'),
(N'Phóng Viên B', 'staff2@gmail.com', 1, 1, N'hashed_password_reporter_B_123'),
(N'Phóng Viên B', 'lecturer@gmail.com', 2, 2, N'hashed_password_reporter_B_123');
GO

PRINT 'Đang thêm dữ liệu cho Category (Danh mục cha)...';
INSERT INTO Category (CategoryName, CategoryDescription, ParentCategoryID, IsActive)
VALUES
(N'Thế giới', N'Tin tức quốc tế và các sự kiện toàn cầu', NULL, 1),           -- ID 1
(N'Kinh doanh', N'Tin tức về thị trường, tài chính và doanh nghiệp', NULL, 1), -- ID 2
(N'Công nghệ', N'Cập nhật về công nghệ, khoa học và đổi mới', NULL, 1),        -- ID 3
(N'Thể thao', N'Tin tức về các sự kiện và giải đấu thể thao', NULL, 1),         -- ID 4
(N'Giải trí', N'Tin tức về Showbiz, âm nhạc và điện ảnh', NULL, 1);           -- ID 5
GO

PRINT 'Đang thêm dữ liệu cho Category (Danh mục con)...';
INSERT INTO Category (CategoryName, CategoryDescription, ParentCategoryID, IsActive)
VALUES
(N'Tài chính', N'Tin tức tài chính cá nhân và ngân hàng', 2, 1), -- ID 6 (Con của Kinh doanh - ID 2)
(N'Startup', N'Tin tức về các công ty khởi nghiệp', 2, 1),       -- ID 7 (Con của Kinh doanh - ID 2)
(N'Mobile', N'Đánh giá và tin tức về điện thoại di động', 3, 1),  -- ID 8 (Con của Công nghệ - ID 3)
(N'AI', N'Tin tức về Trí tuệ nhân tạo', 3, 1),                    -- ID 9 (Con của Công nghệ - ID 3)
(N'Bóng đá', N'Tin tức bóng đá trong nước và quốc tế', 4, 1);    -- ID 10 (Con của Thể thao - ID 4)
GO

PRINT 'Đang thêm dữ liệu cho Tag...';
INSERT INTO Tag (TagName, Note)
VALUES
(N'Việt Nam', N'Các tin tức liên quan đến Việt Nam'),
(N'Lãi suất', N'Liên quan đến chính sách tiền tệ, ngân hàng'),
(N'Apple', N'Các sản phẩm và tin tức về công ty Apple'),
(N'iPhone 17', N'Tin đồn và cập nhật về iPhone 17'),
(N'Startup', N'Các công ty khởi nghiệp'),
(N'EdTech', N'Công nghệ trong giáo dục'),
(N'Đội tuyển quốc gia', N'Tin tức về đội tuyển bóng đá quốc gia');
GO

PRINT 'Đang thêm dữ liệu cho NewsArticle...';
INSERT INTO NewsArticle (NewsTitle, Headline, CreatedDate, NewsContent, NewsSource, CategoryID, [Views], NewsStatus, CreatedByID, UpdatedByID, ModifiedDate)
VALUES
(
    N'Apple công bố sự kiện WWDC 2026: Trí tuệ nhân tạo là tâm điểm',
    N'Sự kiện WWDC 2026 được mong chờ sẽ giới thiệu iOS 19 và các tính năng AI đột phá mới cho iPhone và Mac.',
    GETDATE() - 3,
    N'Nội dung chi tiết bài báo về WWDC 2026... Apple dự kiến sẽ trình làng một loạt các công cụ AI thế hệ mới, tích hợp sâu vào hệ điều hành. Các nhà phát triển đang rất mong chờ các API mới để xây dựng ứng dụng thông minh hơn.',
    N'TechCrunch',
    9,  
    15023,
    1,
    2,
    1,
    GETDATE() - 1 
),
(
    N'Ngân hàng Nhà nước giữ nguyên lãi suất điều hành',
    N'Trong phiên họp chính sách mới nhất, Ngân hàng Nhà nước Việt Nam quyết định giữ nguyên các mức lãi suất điều hành nhằm ổn định thị trường.',
    GETDATE() - 2,
    N'Nội dung chi tiết về quyết định lãi suất... Quyết định này được đưa ra trong bối cảnh lạm phát trong nước vẫn đang được kiểm soát tốt và nhằm hỗ trợ các doanh nghiệp phục hồi sản xuất kinh doanh. Các chuyên gia tài chính cho rằng đây là một bước đi thận trọng và hợp lý.',
    N'Báo Đầu Tư',
    6,
    8500,
    1,
    3,
    NULL,
    NULL
),
(
    N'Startup EdTech Việt Nam gọi vốn thành công 5 triệu USD vòng Series A',
    N'Một startup công nghệ giáo dục (EdTech) vừa thông báo hoàn thành vòng gọi vốn Series A với trị giá 5 triệu USD, dẫn đầu bởi các quỹ đầu tư từ Singapore.',
    GETDATE() - 1,
    N'Nội dung chi tiết về startup... Với số vốn này, công ty dự kiến mở rộng thị trường ra Đông Nam Á và phát triển thêm các nền tảng học tập cá nhân hóa sử dụng AI. Đây là tín hiệu tích cực cho hệ sinh thái khởi nghiệp Việt Nam.',
    N'VietnamBiz',
    7,
    11200,
    1,
    2,
    2,
    GETDATE()
),
(
    N'Đội tuyển Việt Nam công bố danh sách sơ bộ cho Vòng loại World Cup',
    N'Huấn luyện viên trưởng đã chính thức công bố danh sách 30 cầu thủ trong đợt tập trung chuẩn bị cho hai trận đấu quan trọng sắp tới tại Vòng loại World Cup.',
    GETDATE(),
    N'Nội dung chi tiết về danh sách đội tuyển... Bản danh sách có sự góp mặt của nhiều cầu thủ kỳ cựu cùng với một số nhân tố trẻ đang có phong độ cao tại V.League. Đội tuyển sẽ hội quân vào tuần tới.',
    N'Báo Thể Thao 24/7',
    10,
    980,
    1,
    3,
    NULL,
    NULL
),
(
    N'Bài nháp: Đánh giá iPhone 17 Pro Max (Chưa xuất bản)',
    N'Đây là bài nháp, đang trong quá trình biên tập và chưa sẵn sàng để xuất bản ra công chúng.',
    GETDATE(),
    N'Nội dung bài nháp... Cần kiểm tra lại thông tin về camera và thời lượng pin trước khi đăng.',
    N'Nội bộ',
    8,
    0,
    0,
    2,
    NULL,
    NULL
);
GO

PRINT 'Đang thêm dữ liệu cho NewsTag...';
INSERT INTO NewsTag (NewsArticleID, TagID)
VALUES
(1, 3),

(2, 1),
(2, 2), 

(3, 1),
(3, 5), 
(3, 6),

(4, 1),
(4, 7), 

(5, 3),
(5, 4);
GO

PRINT 'Hoàn tất việc thêm dữ liệu mẫu!';
GO