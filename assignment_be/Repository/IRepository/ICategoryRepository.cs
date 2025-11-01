using Repository.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface ICategoryRepository
{
    Task<List<Category>> GetAllAsync();

    Task<Category> GetByIdAsync(int id);
    Task<Category> GetByNameAsync(string name);

    Task<Category> CreateAsync(Category category);

    Task UpdateAsync(Category category);

    Task DeleteAsync(Category category);

    Task<bool> ExistsAsync(int id);
}