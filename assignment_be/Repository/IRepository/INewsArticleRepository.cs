using Repository.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface INewsArticleRepository
{
    Task<IEnumerable<NewsArticle>> GetAllAsync();

    Task<NewsArticle> GetByIdAsync(int id);

    Task<NewsArticle> CreateAsync(NewsArticle article);

    Task UpdateAsync(NewsArticle article);

    Task<NewsArticle> GetByIdForUpdateAsync(int id); 
    Task DeleteAsync(NewsArticle article);
}