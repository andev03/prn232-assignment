-- CREATE DATABASE FUNewsManagementSystem;

use FUNewsManagementSystem;

CREATE TABLE SystemAccount (
    AccountID INT IDENTITY(1,1) PRIMARY KEY,
    AccountName NVARCHAR(100) NOT NULL,
    AccountEmail VARCHAR(255) NOT NULL UNIQUE,
    AccountRole INT NOT NULL,
	IsActive BIT NOT NULL DEFAULT 1,
    AccountPassword NVARCHAR(255) NOT NULL
);
GO

CREATE TABLE Category (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(150) NOT NULL,
    CategoryDescription NVARCHAR(MAX) NULL,
    ParentCategoryID INT NULL,
    IsActive BIT NOT NULL DEFAULT 1,

    CONSTRAINT FK_Category_ParentCategory FOREIGN KEY (ParentCategoryID)
        REFERENCES Category(CategoryID)
);
GO

CREATE TABLE Tag (
    TagID INT IDENTITY(1,1) PRIMARY KEY,
    TagName NVARCHAR(100) NOT NULL UNIQUE,
    Note NVARCHAR(500) NULL
);
GO

CREATE TABLE NewsArticle (
    NewsArticleID INT IDENTITY(1,1) PRIMARY KEY,
    NewsTitle NVARCHAR(255) NOT NULL,
    Headline NVARCHAR(1000) NULL, -- Tóm tắt/mô tả ngắn
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    NewsContent NVARCHAR(MAX) NOT NULL,
    NewsSource NVARCHAR(255) NULL,
    CategoryID INT NOT NULL,
	[Views] INT NOT NULL DEFAULT 0,
    NewsStatus BIT NOT NULL DEFAULT 1,
    CreatedByID INT NOT NULL,
    UpdatedByID INT NULL,
    ModifiedDate DATETIME NULL,

    CONSTRAINT FK_NewsArticle_Category FOREIGN KEY (CategoryID)
        REFERENCES Category(CategoryID),
        
    CONSTRAINT FK_NewsArticle_CreatedBy FOREIGN KEY (CreatedByID)
        REFERENCES SystemAccount(AccountID),
        
    CONSTRAINT FK_NewsArticle_UpdatedBy FOREIGN KEY (UpdatedByID)
        REFERENCES SystemAccount(AccountID)
);
GO

CREATE TABLE NewsTag (
    NewsArticleID INT NOT NULL,
    TagID INT NOT NULL,

    CONSTRAINT PK_NewsTag PRIMARY KEY (NewsArticleID, TagID),

    CONSTRAINT FK_NewsTag_NewsArticle FOREIGN KEY (NewsArticleID)
        REFERENCES NewsArticle(NewsArticleID)
        ON DELETE CASCADE, 
        
    CONSTRAINT FK_NewsTag_Tag FOREIGN KEY (TagID)
        REFERENCES Tag(TagID)
        ON DELETE CASCADE
);
GO

PRINT 'Tạo các bảng thành công!'