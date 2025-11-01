using DTOs;
using Repository.IRepository;
using Repository.Models;
using Services.IService;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepo;

    public CategoryService(ICategoryRepository categoryRepo)
    {
        _categoryRepo = categoryRepo;
    }


    private CategoryDto MapToDto(Category c) => new CategoryDto
    {
        CategoryId = c.CategoryId,
        CategoryName = c.CategoryName,
        CategoryDescription = c.CategoryDescription,
        ParentCategoryId = c.ParentCategoryId,
        IsActive = c.IsActive,
        NewsArticleCount = c.NewsArticles.Count,
        SubCategoryCount = c.InverseParentCategory.Count
    };

    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryDto categoryDto)
    {
        var existing = await _categoryRepo.GetByNameAsync(categoryDto.CategoryName);
        if (existing != null)
        {
            throw new ArgumentException($"Tên danh mục '{categoryDto.CategoryName}' đã tồn tại.");
        }
        if (categoryDto.ParentCategoryId == 0)
        {
            categoryDto.ParentCategoryId = null;
        }

        var category = new Category
        {
            CategoryName = categoryDto.CategoryName,
            CategoryDescription = categoryDto.CategoryDescription,
            ParentCategoryId = categoryDto.ParentCategoryId,
            IsActive = categoryDto.IsActive
        };

        var created = await _categoryRepo.CreateAsync(category);

        var final = await _categoryRepo.GetByIdAsync(created.CategoryId);
        return MapToDto(final);
    }

    public async Task DeleteCategoryAsync(int id)
    {
        var category = await _categoryRepo.GetByIdAsync(id);
        if (category == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy danh mục với ID: {id}");
        }

        if (category.NewsArticles.Any())
        {
            throw new InvalidOperationException("Không thể xóa danh mục này vì vẫn còn bài báo.");
        }
        if (category.InverseParentCategory.Any())
        {
            throw new InvalidOperationException("Không thể xóa danh mục này vì vẫn còn danh mục con.");
        }

        await _categoryRepo.DeleteAsync(category);
    }

    public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
    {
        var categories = await _categoryRepo.GetAllAsync();

        var dtos = new List<CategoryDto>();
        foreach (var c in categories)
        {
            dtos.Add(MapToDto(c));
        }
        return dtos;
    }

    public async Task<CategoryDto> GetCategoryByIdAsync(int id)
    {
        var category = await _categoryRepo.GetByIdAsync(id);
        if (category == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy danh mục với ID: {id}");
        }
        return MapToDto(category);
    }

    public async Task UpdateCategoryAsync(int id, CreateCategoryDto categoryDto)
    {
        var category = await _categoryRepo.GetByIdAsync(id);
        if (category == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy danh mục với ID: {id}");
        }

        if (category.CategoryName != categoryDto.CategoryName)
        {
            var existing = await _categoryRepo.GetByNameAsync(categoryDto.CategoryName);
            if (existing != null && existing.CategoryId != id)
            {
                throw new ArgumentException($"Tên danh mục '{categoryDto.CategoryName}' đã tồn tại.");
            }
        }

        if (categoryDto.ParentCategoryId == 0)
        {
            categoryDto.ParentCategoryId = null;
        }

        category.CategoryName = categoryDto.CategoryName;
        category.CategoryDescription = categoryDto.CategoryDescription;
        category.ParentCategoryId = categoryDto.ParentCategoryId;
        category.IsActive = categoryDto.IsActive;

        await _categoryRepo.UpdateAsync(category);
    }
}