using System.Collections.Generic;
using System.Threading.Tasks;
using DTOs; 

public interface INewsArticleService
{
    Task<IEnumerable<NewsArticleDto>> GetAllAsync();

    Task<NewsArticleDto> GetByIdAsync(int id);

    Task<NewsArticleDto> CreateAsync(CreateNewsArticleDto articleDto);

    Task UpdateAsync(int id, CreateNewsArticleDto articleDto);

    Task DeleteAsync(int id);
    Task<IEnumerable<NewsArticleDto>> GetArticlesByAccountIdAsync();
}