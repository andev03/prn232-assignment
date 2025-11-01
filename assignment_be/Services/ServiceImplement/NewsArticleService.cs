using System.Security.Claims;
using Repository.IRepository;
using Repository.Models;
using Services.IService;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DTOs;
using Microsoft.AspNetCore.Http;
using System.Linq;

namespace Services.ServiceImplement
{
    public class NewsArticleService : INewsArticleService
    {
        private readonly INewsArticleRepository _articleRepo;
        private readonly ICategoryRepository _categoryRepo;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ITagService _tagService;
        private readonly ITagRepository _tagRepo;
        private readonly ISystemAccountRepository _accountRepo;

        public NewsArticleService(
            INewsArticleRepository articleRepo,
            ICategoryRepository categoryRepo,
            IHttpContextAccessor httpContextAccessor,
            ITagService tagService,
            ITagRepository tagRepository,
            ISystemAccountRepository systemAccountRepository)
        {
            _articleRepo = articleRepo;
            _categoryRepo = categoryRepo;
            _httpContextAccessor = httpContextAccessor;
            _tagService = tagService;
            _tagRepo = tagRepository;
            _accountRepo = systemAccountRepository;
        }

        private int GetCurrentUserId()
        {
            var userIdString = _httpContextAccessor.HttpContext?.User?
                .FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                throw new UnauthorizedAccessException("Không thể xác định người dùng.");
            }
            return userId;
        }

        private NewsArticleDto MapToDto(NewsArticle article)
        {
            if (article == null) return null;
            return new NewsArticleDto
            {
                NewsArticleId = article.NewsArticleId,
                NewsTitle = article.NewsTitle,
                Headline = article.Headline,
                NewsContent = article.NewsContent,
                CreatedDate = article.CreatedDate,
                Views = article.Views,
                NewsStatus = article.NewsStatus,
                NewsSource = article.NewsSource,
                CategoryName = article.Category?.CategoryName ?? "N/A",
                CreatedByName = article.CreatedBy?.AccountName ?? "N/A",
                Tags = _tagService.ToDtoList(article.Tags)
            };
        }

        public async Task<IEnumerable<NewsArticleDto>> GetAllAsync()
        {
            var articles = await _articleRepo.GetAllAsync();
            return articles.Select(MapToDto);
        }

        public async Task<NewsArticleDto> GetByIdAsync(int id)
        {
            var article = await _articleRepo.GetByIdAsync(id);
            if (article == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy bài báo với ID: {id}");
            }
            return MapToDto(article);
        }

        public async Task<NewsArticleDto> CreateAsync(CreateNewsArticleDto articleDto)
        {
            var currentUserId = GetCurrentUserId();

            if (!await _categoryRepo.ExistsAsync(articleDto.CategoryId))
            {
                throw new ArgumentException($"Category với ID: {articleDto.CategoryId} không tồn tại.");
            }

            var articleModel = new NewsArticle
            {
                NewsTitle = articleDto.NewsTitle,
                Headline = articleDto.Headline,
                NewsContent = articleDto.NewsContent,
                NewsSource = articleDto.NewsSource,
                CategoryId = articleDto.CategoryId,
                NewsStatus = articleDto.NewsStatus,

                CreatedDate = DateTime.UtcNow,
                Views = 0,
                CreatedById = currentUserId
            };

            if (articleDto.Tags != null && articleDto.Tags.Any())
            {
                foreach (var tagDto in articleDto.Tags)
                {
                    var tag = await _tagRepo.GetByNameAsync(tagDto.TagName);

                    if (tag == null)
                    {
                        tag = new Tag
                        {
                            TagName = tagDto.TagName,
                            Note = tagDto.Note
                        };
                    }

                    articleModel.Tags.Add(tag);
                }
            }

            var createdArticle = await _articleRepo.CreateAsync(articleModel);

            createdArticle.Category = await _categoryRepo.GetByIdAsync(createdArticle.CategoryId);
            createdArticle.CreatedBy = await _accountRepo.GetByIdAsync(createdArticle.CreatedById);

            return MapToDto(createdArticle);
        }

        public async Task UpdateAsync(int id, CreateNewsArticleDto articleDto)
        {
            var currentUserId = GetCurrentUserId();

            var article = await _articleRepo.GetByIdForUpdateAsync(id);

            if (articleDto.CategoryId != article.CategoryId &&
                !await _categoryRepo.ExistsAsync(articleDto.CategoryId))
            {
                throw new ArgumentException($"Category với ID: {articleDto.CategoryId} không tồn tại.");
            }

            article.NewsTitle = articleDto.NewsTitle;
            article.Headline = articleDto.Headline;
            article.NewsContent = articleDto.NewsContent;
            article.NewsSource = articleDto.NewsSource;
            article.CategoryId = articleDto.CategoryId;
            article.NewsStatus = articleDto.NewsStatus;

            article.ModifiedDate = DateTime.UtcNow;
            article.UpdatedById = currentUserId;

            article.Tags.Clear();

            if (articleDto.Tags != null && articleDto.Tags.Any())
            {
                foreach (var tagDto in articleDto.Tags)
                {
                    var tag = await _tagRepo.GetByNameAsync(tagDto.TagName);

                    if (tag == null)
                    {
                        tag = new Tag
                        {
                            TagName = tagDto.TagName,
                            Note = tagDto.Note
                        };
                    }

                    article.Tags.Add(tag);
                }
            }

            await _articleRepo.UpdateAsync(article);
        }

        public async Task DeleteAsync(int id)
        {
            var article = await _articleRepo.GetByIdAsync(id);
            if (article == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy bài báo với ID: {id}");
            }

            if (article.NewsStatus == true)
            {
                throw new InvalidOperationException("Không thể xóa bài báo đang ở trạng thái 'Active'.");
            }

            await _articleRepo.DeleteAsync(article);
        }

        public async Task<IEnumerable<NewsArticleDto>> GetArticlesByAccountIdAsync()
        {
            var currentUserId = GetCurrentUserId();

            var articles = await _articleRepo.GetAllAsync();

            List<NewsArticleDto> newsArticles = new List<NewsArticleDto>();

            articles = articles.Where(a => a.CreatedById == currentUserId);

            foreach (var article in articles)
            {
                newsArticles.Add(MapToDto(article));
            }

            return newsArticles;
        }
    }
}