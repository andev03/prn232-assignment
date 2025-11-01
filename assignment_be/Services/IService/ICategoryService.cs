using DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync();
    Task<CategoryDto> GetCategoryByIdAsync(int id);
    Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto categoryDto);
    Task UpdateCategoryAsync(int id, CreateCategoryDto categoryDto);
    Task DeleteCategoryAsync(int id);
}