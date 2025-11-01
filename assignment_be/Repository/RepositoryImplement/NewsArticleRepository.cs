using Microsoft.EntityFrameworkCore;
using Repository.IRepository;
using Repository.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Repository.RepositoryImplement
{
    public class NewsArticleRepository : INewsArticleRepository
    {
        private readonly FUNewsManagementSystemContext _context;

        public NewsArticleRepository(FUNewsManagementSystemContext context)
        {
            _context = context;
        }

        public async Task<NewsArticle> CreateAsync(NewsArticle article)
        {
            await _context.NewsArticles.AddAsync(article);
            await _context.SaveChangesAsync();
            return article;
        }

        public async Task DeleteAsync(NewsArticle article)
        {
            _context.NewsArticles.Remove(article);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<NewsArticle>> GetAllAsync()
        {
            return await _context.NewsArticles
                .AsNoTracking()
                .Include(a => a.Category)
                .Include(a => a.CreatedBy)
                .Include(a => a.Tags)
                .ToListAsync();
        }

        public async Task<NewsArticle> GetByIdAsync(int id)
        {
            var newsArticle = await _context.NewsArticles
                .Include(a => a.Category)
                .Include(a => a.CreatedBy)
                .FirstOrDefaultAsync(a => a.NewsArticleId == id);

            if (newsArticle == null)
            {
                throw new KeyNotFoundException("Bài viết không tồn tại.");
            }

            newsArticle.Views += 1; 
            await _context.SaveChangesAsync();
            return newsArticle;
        }

        public async Task<NewsArticle> GetByIdForUpdateAsync(int id)
        {
            var newsArticle = await _context.NewsArticles
                .Include(a => a.Tags)
                .FirstOrDefaultAsync(a => a.NewsArticleId == id);

            if (newsArticle == null)
            {
                throw new KeyNotFoundException($"Bài viết với ID: {id} không tồn tại.");
            }

            return newsArticle;
        }

        public async Task UpdateAsync(NewsArticle article)
        {
            _context.Entry(article).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }
    }
}